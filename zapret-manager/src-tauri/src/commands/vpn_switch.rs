use std::path::Path;
use std::sync::atomic::Ordering;
use std::time::Duration;

use tauri::{AppHandle, Emitter, State};

use crate::commands::runner;
use crate::commands::vpn::{
    EVENT_DISCONNECTED, EVENT_SWITCHING, VpnState, VpnStats, VpnStatus,
};
use crate::commands::vpn_config::tunnel_name;
use crate::commands::vpn_killswitch;
use crate::commands::vpn_store;
use crate::commands::vpn_store::find_config;
use crate::commands::vpn_wireguard::{
    HANDSHAKE_POLL_INTERVAL_MS, SWITCH_WAIT_MS, HandshakeInfo, detect_wg_tool, detect_wireguard,
    install_tunnel_arguments, installed_tunnels, now_secs, query_handshake,
    uninstall_tunnel_arguments,
};
use crate::error::{AppError, AppResult};
use crate::process_manager::ProcessManager;

const HANDSHAKE_DEFAULT_SEC: u64 = 15;
const HANDSHAKE_FRESH_SEC: u64 = 60;

pub async fn emit_step(app: &AppHandle, step: &str) {
    let _ = app.emit(EVENT_SWITCHING, step);
}

async fn stop_dpi(manager: State<'_, ProcessManager>) {
    let _ = runner::kill_all_processes(manager).await;
    tokio::time::sleep(Duration::from_millis(SWITCH_WAIT_MS)).await;
}

async fn install_tunnel(config: &Path) -> AppResult<()> {
    let Some(wireguard) = detect_wireguard() else {
        return Err(AppError::custom("WireGuard не найден в системе"));
    };

    let output = tokio::process::Command::new(wireguard)
        .args(install_tunnel_arguments(config))
        .output()
        .await
        .map_err(|error| AppError::custom(format!("Не удалось запустить WireGuard: {error}")))?;

    if !output.status.success() {
        return Err(AppError::custom(format!(
            "WireGuard вернул ошибку: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        )));
    }

    Ok(())
}

async fn remove_tunnel(tunnel: &str) -> AppResult<()> {
    let Some(wireguard) = detect_wireguard() else {
        return Ok(());
    };

    let _ = tokio::process::Command::new(wireguard)
        .args(uninstall_tunnel_arguments(tunnel))
        .output()
        .await;

    Ok(())
}

async fn apply_kill_switch(interface: &str, enable: bool) -> AppResult<()> {
    let state_dir = vpn_store::configs_dir()?;

    if enable {
        vpn_killswitch::apply(interface, &state_dir).await?;
    } else {
        vpn_killswitch::disable(&state_dir).await?;
    }

    Ok(())
}

async fn wait_handshake(tunnel: &str, timeout_sec: u64) -> AppResult<HandshakeInfo> {
    let Some(wg) = detect_wg_tool() else {
        return Err(AppError::custom(
            "wg.exe не найден, handshake проверить невозможно",
        ));
    };

    let deadline = std::time::Instant::now() + Duration::from_secs(timeout_sec);
    let mut info = HandshakeInfo::default();

    while std::time::Instant::now() < deadline {
        info = query_handshake(&wg, tunnel).await?;

        if info.seconds_ago.is_some_and(|value| value < HANDSHAKE_FRESH_SEC) {
            return Ok(info);
        }

        tokio::time::sleep(Duration::from_millis(HANDSHAKE_POLL_INTERVAL_MS)).await;
    }

    Ok(info)
}

fn remember(state: &VpnState, tunnel: &str, connected_at: u64) {
    if let Ok(mut slot) = state.active_config.lock() {
        *slot = Some(tunnel.to_string());
    }

    if let Ok(mut slot) = state.active_interface.lock() {
        *slot = Some(tunnel.to_string());
    }

    if let Ok(mut slot) = state.connected_at.lock() {
        *slot = connected_at;
    }
}

pub async fn connect_vpn(
    app: &AppHandle,
    state: &VpnState,
    manager: State<'_, ProcessManager>,
    config_id: &str,
    enable_kill_switch: bool,
    handshake_timeout_sec: u64,
) -> AppResult<VpnStatus> {
    let config = find_config(config_id)?;

    emit_step(app, "stopping-dpi").await;
    stop_dpi(manager).await;

    emit_step(app, "starting-vpn").await;
    install_tunnel(&config).await?;

    let tunnel = tunnel_name(&config);
    let connected_at = now_secs();
    remember(state, &tunnel, connected_at);

    emit_step(app, "checking-handshake").await;

    let timeout = if handshake_timeout_sec == 0 {
        HANDSHAKE_DEFAULT_SEC
    } else {
        handshake_timeout_sec
    };

    let info = wait_handshake(&tunnel, timeout).await?;
    let connected = info.seconds_ago.is_some_and(|value| value < HANDSHAKE_FRESH_SEC);

    if !connected {
        let _ = remove_tunnel(&tunnel).await;
        state.reset();

        return Err(AppError::custom(format!(
            "Handshake не прошёл за {timeout} секунд"
        )));
    }

    if enable_kill_switch {
        if let Err(error) = apply_kill_switch(&tunnel, true).await {
            let _ = remove_tunnel(&tunnel).await;
            state.reset();

            return Err(error);
        }

        if let Ok(mut slot) = state.kill_switch_on.lock() {
            *slot = true;
        }
    }

    tracing::info!("VPN подключён: {} эндпоинт {}", tunnel, info.endpoint);

    Ok(VpnStatus::from_info(&tunnel, &info, connected_at))
}

async fn teardown(state: &VpnState, app: &AppHandle) -> AppResult<()> {
    let tunnel = state.active();
    let kill_switch_on = state
        .kill_switch_on
        .lock()
        .map(|value| *value)
        .unwrap_or(false);

    emit_step(app, "stopping-vpn").await;

    if let Some(name) = tunnel.as_deref() {
        if kill_switch_on {
            let _ = apply_kill_switch(name, false).await;
        }

        let _ = remove_tunnel(name).await;
    }

    state.reset();
    let _ = app.emit(EVENT_DISCONNECTED, "disconnected");

    Ok(())
}

pub async fn disconnect(app: &AppHandle, state: &VpnState) -> AppResult<()> {
    teardown(state, app).await?;
    tracing::info!("VPN отключён");

    Ok(())
}

pub async fn switch_to_dpi(app: &AppHandle, state: &VpnState) -> AppResult<()> {
    teardown(state, app).await?;
    emit_step(app, "done").await;

    Ok(())
}

pub async fn enable_kill_switch(
    state: &VpnState,
    interface: &str,
) -> AppResult<()> {
    apply_kill_switch(interface, true).await?;

    if let Ok(mut slot) = state.kill_switch_on.lock() {
        *slot = true;
    }

    tracing::info!("Kill Switch включён для интерфейса {interface}");

    Ok(())
}

pub async fn disable_kill_switch(state: &VpnState) -> AppResult<()> {
    let state_dir = vpn_store::configs_dir()?;
    vpn_killswitch::disable(&state_dir).await?;

    if let Ok(mut slot) = state.kill_switch_on.lock() {
        *slot = false;
    }

    tracing::info!("Kill Switch выключен");

    Ok(())
}

pub async fn current_status(state: &VpnState) -> VpnStatus {
    let Some(tunnel) = state.active() else {
        return VpnStatus::default();
    };

    let connected_at = state
        .connected_at
        .lock()
        .map(|value| *value)
        .unwrap_or_else(|_| now_secs());

    let info = match detect_wg_tool() {
        Some(wg) => query_handshake(&wg, &tunnel).await.unwrap_or_default(),
        None => HandshakeInfo::default(),
    };

    VpnStatus::from_info(&tunnel, &info, connected_at)
}

pub async fn teardown_stale_tunnel(state: &VpnState) {
    let Some(tunnels) = installed_tunnels() else {
        return;
    };

    for tunnel in tunnels {
        let _ = remove_tunnel(&tunnel).await;
        state.reset();
        tracing::warn!("Обнаружен посторонний туннель, отключён: {tunnel}");
    }
}

pub async fn current_stats(state: &VpnState) -> VpnStats {
    let status = current_status(state).await;
    let kill_switch_on = state
        .kill_switch_on
        .lock()
        .map(|value| *value)
        .unwrap_or(false);

    VpnStats {
        interface: status.interface,
        endpoint: status.endpoint,
        handshake_at: status.handshake_at,
        bytes_in: status.bytes_in.unwrap_or_default(),
        bytes_out: status.bytes_out.unwrap_or_default(),
        uptime_sec: status.uptime_sec.unwrap_or_default(),
        is_switching: state.is_switching.load(Ordering::SeqCst),
        kill_switch_on,
    }
}