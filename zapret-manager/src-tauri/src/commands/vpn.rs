// Подключаем модули: std::sync::atomic::{AtomicBool, Ordering};.
use std::sync::atomic::{AtomicBool, Ordering};
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tauri::{AppHandle, State};.
use tauri::{AppHandle, State};

// Подключаем модули: crate::commands::vpn_store;.
use crate::commands::vpn_store;
// Подключаем модули: crate::commands::vpn_switch;.
use crate::commands::vpn_switch;
// Подключаем модули: crate::commands::vpn_wireguard::{detect_wireguard, now_.
use crate::commands::vpn_wireguard::{detect_wireguard, now_secs, HandshakeInfo};
// Подключаем модули: crate::constants::HANDSHAKE_FRESH_SEC;.
use crate::constants::HANDSHAKE_FRESH_SEC;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::process_manager::ProcessManager;.
use crate::process_manager::ProcessManager;

// Объявляем константу EVENT_SWITCHING.
pub const EVENT_SWITCHING: &str = "vpn-switching";
// Объявляем константу EVENT_CONNECTED.
pub const EVENT_CONNECTED: &str = "vpn-connected";
// Объявляем константу EVENT_DISCONNECTED.
pub const EVENT_DISCONNECTED: &str = "vpn-disconnected";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру VpnConfigInfo.
pub struct VpnConfigInfo {
    // Выполняем операцию: pub id: String,.
    pub id: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub path: String,.
    pub path: String,
    // Выполняем операцию: pub endpoint: String,.
    pub endpoint: String,
    // Выполняем операцию: pub address: Vec<String>,.
    pub address: Vec<String>,
    // Выполняем операцию: pub dns: Vec<String>,.
    pub dns: Vec<String>,
    // Выполняем операцию: pub allowed_ips: Vec<String>,.
    pub allowed_ips: Vec<String>,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    // Выполняем операцию: pub imported_at: u64,.
    pub imported_at: u64,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру VpnStatus.
pub struct VpnStatus {
    // Выполняем операцию: pub state: String,.
    pub state: String,
    // Выполняем операцию: pub interface: Option<String>,.
    pub interface: Option<String>,
    // Выполняем операцию: pub endpoint: Option<String>,.
    pub endpoint: Option<String>,
    // Выполняем операцию: pub handshake_at: Option<u64>,.
    pub handshake_at: Option<u64>,
    // Выполняем операцию: pub bytes_in: Option<u64>,.
    pub bytes_in: Option<u64>,
    // Выполняем операцию: pub bytes_out: Option<u64>,.
    pub bytes_out: Option<u64>,
    // Выполняем операцию: pub uptime_sec: Option<u64>,.
    pub uptime_sec: Option<u64>,
    // Выполняем операцию: pub error: Option<String>,.
    pub error: Option<String>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Default for VpnStatus {
    // Объявляем функцию default.
    fn default() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: state: "disconnected".to_string(),.
            state: "disconnected".to_string(),
            // Выполняем операцию: interface: None,.
            interface: None,
            // Выполняем операцию: endpoint: None,.
            endpoint: None,
            // Выполняем операцию: handshake_at: None,.
            handshake_at: None,
            // Выполняем операцию: bytes_in: None,.
            bytes_in: None,
            // Выполняем операцию: bytes_out: None,.
            bytes_out: None,
            // Выполняем операцию: uptime_sec: None,.
            uptime_sec: None,
            // Выполняем операцию: error: None,.
            error: None,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl VpnStatus {
    // Объявляем функцию from_info.
    pub fn from_info(tunnel: &str, info: &HandshakeInfo, connected_at: u64) -> Self {
        // Объявляем переменную fresh .
        let fresh = info
            // Выполняем операцию: .seconds_ago.
            .seconds_ago
            // Выполняем операцию: .is_some_and(|value| value < HANDSHAKE_FRESH_SEC);.
            .is_some_and(|value| value < HANDSHAKE_FRESH_SEC);

        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: state: if fresh { "connected" } else { "connecting" }.t.
            state: if fresh { "connected" } else { "connecting" }.to_string(),
            // Выполняем операцию: interface: Some(tunnel.to_string()),.
            interface: Some(tunnel.to_string()),
            // Выполняем операцию: endpoint: Some(info.endpoint.clone()),.
            endpoint: Some(info.endpoint.clone()),
            // Выполняем операцию: handshake_at: info.
            handshake_at: info
                // Выполняем операцию: .seconds_ago.
                .seconds_ago
                // Выполняем операцию: .map(|value| now_secs().saturating_sub(value) * 1000),.
                .map(|value| now_secs().saturating_sub(value) * 1000),
            // Выполняем операцию: bytes_in: Some(info.bytes_in),.
            bytes_in: Some(info.bytes_in),
            // Выполняем операцию: bytes_out: Some(info.bytes_out),.
            bytes_out: Some(info.bytes_out),
            // Выполняем операцию: uptime_sec: Some(now_secs().saturating_sub(connected_at.
            uptime_sec: Some(now_secs().saturating_sub(connected_at)),
            // Выполняем операцию: error: None,.
            error: None,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Default)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру VpnStats.
pub struct VpnStats {
    // Выполняем операцию: pub interface: Option<String>,.
    pub interface: Option<String>,
    // Выполняем операцию: pub endpoint: Option<String>,.
    pub endpoint: Option<String>,
    // Выполняем операцию: pub handshake_at: Option<u64>,.
    pub handshake_at: Option<u64>,
    // Выполняем операцию: pub bytes_in: u64,.
    pub bytes_in: u64,
    // Выполняем операцию: pub bytes_out: u64,.
    pub bytes_out: u64,
    // Выполняем операцию: pub uptime_sec: u64,.
    pub uptime_sec: u64,
    // Выполняем операцию: pub is_switching: bool,.
    pub is_switching: bool,
    // Выполняем операцию: pub kill_switch_on: bool,.
    pub kill_switch_on: bool,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Default)]
// Объявляем структуру VpnState.
pub struct VpnState {
    // Выполняем операцию: pub active_config: Mutex<Option<String>>,.
    pub active_config: Mutex<Option<String>>,
    // Выполняем операцию: pub active_interface: Mutex<Option<String>>,.
    pub active_interface: Mutex<Option<String>>,
    // Выполняем операцию: pub connected_at: Mutex<u64>,.
    pub connected_at: Mutex<u64>,
    // Выполняем операцию: pub is_switching: AtomicBool,.
    pub is_switching: AtomicBool,
    // Выполняем операцию: pub kill_switch_on: Mutex<bool>,.
    pub kill_switch_on: Mutex<bool>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl VpnState {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self::default().
        Self::default()
        // Закрываем блок.
    }

    // Объявляем функцию begin_switch.
    pub fn begin_switch(&self) -> AppResult<()> {
        // Проверяем условие: self.is_switching.swap(true, Ordering::SeqCst) {.
        if self.is_switching.swap(true, Ordering::SeqCst) {
            // Возвращаем результат из функции.
            return Err(AppError::custom("Переключение уже выполняется"));
            // Закрываем блок.
        }

        // Выполняем операцию: Ok(()).
        Ok(())
        // Закрываем блок.
    }

    // Объявляем функцию end_switch.
    pub fn end_switch(&self) {
        // Выполняем операцию: self.is_switching.store(false, Ordering::SeqCst);.
        self.is_switching.store(false, Ordering::SeqCst);
        // Закрываем блок.
    }

    // Объявляем функцию active.
    pub fn active(&self) -> Option<String> {
        // Выполняем операцию: self.active_interface.
        self.active_interface
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .and_then(|value| value.clone()).
            .and_then(|value| value.clone())
        // Закрываем блок.
    }

    // Объявляем функцию reset.
    pub fn reset(&self) {
        // Проверяем условие: let Ok(mut slot) = self.active_config.lock() {.
        if let Ok(mut slot) = self.active_config.lock() {
            *slot = None;
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = self.active_interface.lock() {.
        if let Ok(mut slot) = self.active_interface.lock() {
            *slot = None;
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = self.kill_switch_on.lock() {.
        if let Ok(mut slot) = self.kill_switch_on.lock() {
            *slot = false;
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию import_vpn_config.
pub fn import_vpn_config(source_path: String) -> AppResult<VpnConfigInfo> {
    // Выполняем операцию: vpn_store::import_config(&source_path).
    vpn_store::import_config(&source_path)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию list_vpn_configs.
pub fn list_vpn_configs() -> AppResult<Vec<VpnConfigInfo>> {
    // Выполняем операцию: vpn_store::list_configs().
    vpn_store::list_configs()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию delete_vpn_config.
pub fn delete_vpn_config(state: State<'_, VpnState>, id: String) -> AppResult<bool> {
    // Объявляем переменную active .
    let active = state
        // Выполняем операцию: .active_config.
        .active_config
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|value| value.clone());.
        .and_then(|value| value.clone());

    // Проверяем условие: active.as_deref() == Some(id.as_str()) {.
    if active.as_deref() == Some(id.as_str()) {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Сначала отключите VPN, потом удаляйте конфиг",.
            "Сначала отключите VPN, потом удаляйте конфиг",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: vpn_store::remove_config(&id).
    vpn_store::remove_config(&id)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn switch_to_vpn(.
pub async fn switch_to_vpn(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, VpnState>,.
    state: State<'_, VpnState>,
    // Выполняем операцию: manager: State<'_, ProcessManager>,.
    manager: State<'_, ProcessManager>,
    // Выполняем операцию: config_id: String,.
    config_id: String,
    // Выполняем операцию: enable_kill_switch: bool,.
    enable_kill_switch: bool,
    // Выполняем операцию: handshake_timeout_sec: u64,.
    handshake_timeout_sec: u64,
    // Закрываем выражение или коллекцию.
) -> AppResult<VpnStatus> {
    // Выполняем операцию: crate::security::rate_limit::check_vpn_switch(&config_i.
    crate::security::rate_limit::check_vpn_switch(&config_id)?;
    // Выполняем операцию: crate::security::sanitize::ensure_cmd_safe_value(&confi.
    crate::security::sanitize::ensure_cmd_safe_value(&config_id)?;

    // Выполняем операцию: state.begin_switch()?;.
    state.begin_switch()?;

    // Объявляем переменную result .
    let result = vpn_switch::connect_vpn(
        // Выполняем операцию: &app,.
        &app,
        // Выполняем операцию: &state,.
        &state,
        // Выполняем операцию: manager,.
        manager,
        // Выполняем операцию: &config_id,.
        &config_id,
        // Выполняем операцию: enable_kill_switch,.
        enable_kill_switch,
        // Выполняем операцию: handshake_timeout_sec,.
        handshake_timeout_sec,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await;.
    .await;
    // Выполняем операцию: state.end_switch();.
    state.end_switch();

    // Выбираем вариант по значению.
    match result {
        // Выполняем операцию: Ok(status) => {.
        Ok(status) => {
            // Объявляем переменную _ .
            let _ = tauri::Emitter::emit(&app, EVENT_CONNECTED, &status);
            // Выполняем операцию: crate::tray::sync_vpn_state(&app);.
            crate::tray::sync_vpn_state(&app);
            // Выполняем операцию: Ok(status).
            Ok(status)
            // Закрываем блок.
        }
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Объявляем переменную _ .
            let _ = tauri::Emitter::emit(&app, EVENT_DISCONNECTED, "error");
            // Выполняем операцию: Err(error).
            Err(error)
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn disconnect_vpn(app: AppHandle, state: Stat.
pub async fn disconnect_vpn(app: AppHandle, state: State<'_, VpnState>) -> AppResult<()> {
    // Выполняем операцию: state.begin_switch()?;.
    state.begin_switch()?;
    // Объявляем переменную result .
    let result = vpn_switch::disconnect(&app, &state).await;
    // Выполняем операцию: state.end_switch();.
    state.end_switch();

    // после разрыва трей обязан вернуться к состоянию обхода: иначе он
    // продолжал показывать «VPN активен» при выключенном туннеле
    // Выполняем операцию: crate::tray::sync_vpn_state(&app);.
    crate::tray::sync_vpn_state(&app);

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn switch_to_dpi(app: AppHandle, state: State.
pub async fn switch_to_dpi(app: AppHandle, state: State<'_, VpnState>) -> AppResult<()> {
    // Выполняем операцию: state.begin_switch()?;.
    state.begin_switch()?;
    // Объявляем переменную result .
    let result = vpn_switch::switch_to_dpi(&app, &state).await;
    // Выполняем операцию: state.end_switch();.
    state.end_switch();

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_vpn_status(state: State<'_, VpnState>).
pub async fn get_vpn_status(state: State<'_, VpnState>) -> AppResult<VpnStatus> {
    // Выполняем операцию: Ok(vpn_switch::current_status(&state).await).
    Ok(vpn_switch::current_status(&state).await)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_vpn_stats(state: State<'_, VpnState>) .
pub async fn get_vpn_stats(state: State<'_, VpnState>) -> AppResult<VpnStats> {
    // Выполняем операцию: Ok(vpn_switch::current_stats(&state).await).
    Ok(vpn_switch::current_stats(&state).await)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn reconcile_vpn_tunnels(state: State<'_, Vpn.
pub async fn reconcile_vpn_tunnels(state: State<'_, VpnState>) -> AppResult<()> {
    // Проверяем условие: state.active().is_some() {.
    if state.active().is_some() {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    }

    // Выполняем операцию: vpn_switch::teardown_stale_tunnel(&state).await;.
    vpn_switch::teardown_stale_tunnel(&state).await;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию is_wireguard_installed.
pub fn is_wireguard_installed() -> bool {
    // Выполняем операцию: detect_wireguard().is_some().
    detect_wireguard().is_some()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
