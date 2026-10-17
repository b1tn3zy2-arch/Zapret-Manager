use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};

use serde::Serialize;
use tauri::{AppHandle, State};

use crate::commands::vpn_store;
use crate::commands::vpn_switch;
use crate::commands::vpn_wireguard::{HandshakeInfo, detect_wireguard, now_secs};
use crate::error::{AppError, AppResult};
use crate::process_manager::ProcessManager;

pub const EVENT_SWITCHING: &str = "vpn-switching";
pub const EVENT_CONNECTED: &str = "vpn-connected";
pub const EVENT_DISCONNECTED: &str = "vpn-disconnected";

const HANDSHAKE_FRESH_SEC: u64 = 60;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VpnConfigInfo {
    pub id: String,
    pub name: String,
    pub path: String,
    pub endpoint: String,
    pub address: Vec<String>,
    pub dns: Vec<String>,
    pub allowed_ips: Vec<String>,
    pub size: u64,
    pub imported_at: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VpnStatus {
    pub state: String,
    pub interface: Option<String>,
    pub endpoint: Option<String>,
    pub handshake_at: Option<u64>,
    pub bytes_in: Option<u64>,
    pub bytes_out: Option<u64>,
    pub uptime_sec: Option<u64>,
    pub error: Option<String>,
}

impl Default for VpnStatus {
    fn default() -> Self {
        Self {
            state: "disconnected".to_string(),
            interface: None,
            endpoint: None,
            handshake_at: None,
            bytes_in: None,
            bytes_out: None,
            uptime_sec: None,
            error: None,
        }
    }
}

impl VpnStatus {
    pub fn from_info(tunnel: &str, info: &HandshakeInfo, connected_at: u64) -> Self {
        let fresh = info
            .seconds_ago
            .is_some_and(|value| value < HANDSHAKE_FRESH_SEC);

        Self {
            state: if fresh { "connected" } else { "connecting" }.to_string(),
            interface: Some(tunnel.to_string()),
            endpoint: Some(info.endpoint.clone()),
            handshake_at: info
                .seconds_ago
                .map(|value| now_secs().saturating_sub(value) * 1000),
            bytes_in: Some(info.bytes_in),
            bytes_out: Some(info.bytes_out),
            uptime_sec: Some(now_secs().saturating_sub(connected_at)),
            error: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct VpnStats {
    pub interface: Option<String>,
    pub endpoint: Option<String>,
    pub handshake_at: Option<u64>,
    pub bytes_in: u64,
    pub bytes_out: u64,
    pub uptime_sec: u64,
    pub is_switching: bool,
    pub kill_switch_on: bool,
}

#[derive(Default)]
pub struct VpnState {
    pub active_config: Mutex<Option<String>>,
    pub active_interface: Mutex<Option<String>>,
    pub connected_at: Mutex<u64>,
    pub is_switching: AtomicBool,
    pub kill_switch_on: Mutex<bool>,
}

impl VpnState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn begin_switch(&self) -> AppResult<()> {
        if self.is_switching.swap(true, Ordering::SeqCst) {
            return Err(AppError::custom("Переключение уже выполняется"));
        }

        Ok(())
    }

    pub fn end_switch(&self) {
        self.is_switching.store(false, Ordering::SeqCst);
    }

    pub fn active(&self) -> Option<String> {
        self.active_interface
            .lock()
            .ok()
            .and_then(|value| value.clone())
    }

    pub fn reset(&self) {
        if let Ok(mut slot) = self.active_config.lock() {
            *slot = None;
        }

        if let Ok(mut slot) = self.active_interface.lock() {
            *slot = None;
        }

        if let Ok(mut slot) = self.kill_switch_on.lock() {
            *slot = false;
        }
    }
}

#[tauri::command]
pub fn detect_wireguard_command() -> Option<String> {
    detect_wireguard().map(|path| path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn import_vpn_config(source_path: String) -> AppResult<VpnConfigInfo> {
    vpn_store::import_config(&source_path)
}

#[tauri::command]
pub fn import_vpn_config_text(content: String) -> AppResult<VpnConfigInfo> {
    vpn_store::import_config_text(&content)
}

#[tauri::command]
pub fn list_vpn_configs() -> AppResult<Vec<VpnConfigInfo>> {
    vpn_store::list_configs()
}

#[tauri::command]
pub fn delete_vpn_config(state: State<'_, VpnState>, id: String) -> AppResult<bool> {
    let active = state
        .active_config
        .lock()
        .ok()
        .and_then(|value| value.clone());

    if active.as_deref() == Some(id.as_str()) {
        return Err(AppError::custom(
            "Сначала отключите VPN, потом удаляйте конфиг",
        ));
    }

    vpn_store::remove_config(&id)
}

#[tauri::command]
pub async fn switch_to_vpn(
    app: AppHandle,
    state: State<'_, VpnState>,
    manager: State<'_, ProcessManager>,
    config_id: String,
    enable_kill_switch: bool,
    handshake_timeout_sec: u64,
) -> AppResult<VpnStatus> {
    crate::security::rate_limit::check_vpn_switch(&config_id)?;
    crate::security::sanitize::ensure_cmd_safe_value(&config_id)?;

    state.begin_switch()?;

    let result = vpn_switch::connect_vpn(
        &app,
        &state,
        manager,
        &config_id,
        enable_kill_switch,
        handshake_timeout_sec,
    )
    .await;
    state.end_switch();

    match result {
        Ok(status) => {
            let _ = tauri::Emitter::emit(&app, EVENT_CONNECTED, &status);
            crate::tray::sync_vpn_state(&app);
            Ok(status)
        }
        Err(error) => {
            let _ = tauri::Emitter::emit(&app, EVENT_DISCONNECTED, "error");
            Err(error)
        }
    }
}

#[tauri::command]
pub async fn disconnect_vpn(app: AppHandle, state: State<'_, VpnState>) -> AppResult<()> {
    state.begin_switch()?;
    let result = vpn_switch::disconnect(&app, &state).await;
    state.end_switch();

    // после разрыва трей обязан вернуться к состоянию обхода: иначе он
    // продолжал показывать «VPN активен» при выключенном туннеле
    crate::tray::sync_vpn_state(&app);

    result
}

#[tauri::command]
pub async fn switch_to_dpi(app: AppHandle, state: State<'_, VpnState>) -> AppResult<()> {
    state.begin_switch()?;
    let result = vpn_switch::switch_to_dpi(&app, &state).await;
    state.end_switch();

    result
}

#[tauri::command]
pub async fn get_vpn_status(state: State<'_, VpnState>) -> AppResult<VpnStatus> {
    Ok(vpn_switch::current_status(&state).await)
}

#[tauri::command]
pub async fn get_vpn_stats(state: State<'_, VpnState>) -> AppResult<VpnStats> {
    Ok(vpn_switch::current_stats(&state).await)
}

#[tauri::command]
pub async fn reconcile_vpn_tunnels(state: State<'_, VpnState>) -> AppResult<()> {
    if state.active().is_some() {
        return Ok(());
    }

    vpn_switch::teardown_stale_tunnel(&state).await;

    Ok(())
}

#[tauri::command]
pub async fn enable_kill_switch(
    state: State<'_, VpnState>,
    interface: String,
) -> AppResult<()> {
    vpn_switch::enable_kill_switch(&state, &interface).await
}

#[tauri::command]
pub async fn disable_kill_switch(state: State<'_, VpnState>) -> AppResult<()> {
    vpn_switch::disable_kill_switch(&state).await
}

#[tauri::command]
pub fn is_wireguard_installed() -> bool {
    detect_wireguard().is_some()
}

#[cfg(test)]
#[path = "vpn_tests.rs"]
mod tests;