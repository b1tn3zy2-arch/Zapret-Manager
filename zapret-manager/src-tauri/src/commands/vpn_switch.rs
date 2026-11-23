// Подключаем модули: std::collections::HashSet;.
use std::collections::HashSet;
// Подключаем модули: std::path::Path;.
use std::path::Path;
// Подключаем модули: std::sync::atomic::Ordering;.
use std::sync::atomic::Ordering;
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: tauri::{AppHandle, Emitter, State};.
use tauri::{AppHandle, Emitter, State};

// Подключаем модули: crate::commands::runner;.
use crate::commands::runner;
// Подключаем модули: crate::commands::vpn::{VpnState, VpnStats, VpnStatus, E.
use crate::commands::vpn::{VpnState, VpnStats, VpnStatus, EVENT_DISCONNECTED, EVENT_SWITCHING};
// Подключаем модули: crate::commands::vpn_config::tunnel_name;.
use crate::commands::vpn_config::tunnel_name;
// Подключаем модули: crate::commands::vpn_killswitch;.
use crate::commands::vpn_killswitch;
// Подключаем модули: crate::commands::vpn_store;.
use crate::commands::vpn_store;
// Подключаем модули: crate::commands::vpn_store::find_config;.
use crate::commands::vpn_store::find_config;
// Подключаем модули: crate::commands::vpn_wireguard::{.
use crate::commands::vpn_wireguard::{
    // Выполняем операцию: detect_wg_tool, detect_wireguard, install_tunnel_argume.
    detect_wg_tool,
    detect_wireguard,
    install_tunnel_arguments,
    installed_tunnels,
    now_secs,
    // Выполняем операцию: query_handshake, uninstall_tunnel_arguments, HandshakeI.
    query_handshake,
    uninstall_tunnel_arguments,
    HandshakeInfo,
    HANDSHAKE_POLL_INTERVAL_MS,
    // Выполняем операцию: SWITCH_WAIT_MS,.
    SWITCH_WAIT_MS,
    // Закрываем блок.
};
// Подключаем модули: crate::constants::{HANDSHAKE_DEFAULT_SEC, HANDSHAKE_FRE.
use crate::constants::{HANDSHAKE_DEFAULT_SEC, HANDSHAKE_FRESH_SEC};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::process_manager::ProcessManager;.
use crate::process_manager::ProcessManager;
// Подключаем модули: crate::winapi_helpers::HiddenWindow;.
use crate::winapi_helpers::HiddenWindow;

// Выполняем операцию: pub async fn emit_step(app: &AppHandle, step: &str) {.
pub async fn emit_step(app: &AppHandle, step: &str) {
    // Объявляем переменную _ .
    let _ = app.emit(EVENT_SWITCHING, step);
    // Закрываем блок.
}

// Объявляем функцию stop_dpi.
async fn stop_dpi(manager: State<'_, ProcessManager>) {
    // Объявляем переменную _ .
    let _ = runner::kill_all_processes(manager).await;
    // Выполняем операцию: tokio::time::sleep(Duration::from_millis(SWITCH_WAIT_MS.
    tokio::time::sleep(Duration::from_millis(SWITCH_WAIT_MS)).await;
    // Закрываем блок.
}

// Объявляем функцию install_tunnel.
async fn install_tunnel(config: &Path) -> AppResult<()> {
    // Объявляем переменную Some(wireguard) .
    let Some(wireguard) = detect_wireguard() else {
        // Возвращаем результат из функции.
        return Err(AppError::custom("WireGuard не найден в системе"));
        // Закрываем блок.
    };

    // Объявляем переменную output .
    let output = tokio::process::Command::new(wireguard)
        // Выполняем операцию: .args(install_tunnel_arguments(config)).
        .args(install_tunnel_arguments(config))
        // Выполняем операцию: .hidden().
        .hidden()
        // Выполняем операцию: .output().
        .output()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не удалось з.
        .map_err(|error| AppError::custom(format!("Не удалось запустить WireGuard: {error}")))?;

    // Проверяем условие: !output.status.success() {.
    if !output.status.success() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "WireGuard вернул ошибку: {}",.
            "WireGuard вернул ошибку: {}",
            // Выполняем операцию: String::from_utf8_lossy(&output.stderr).trim().
            String::from_utf8_lossy(&output.stderr).trim() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию remove_tunnel.
async fn remove_tunnel(tunnel: &str) -> AppResult<()> {
    // Объявляем переменную Some(wireguard) .
    let Some(wireguard) = detect_wireguard() else {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = tokio::process::Command::new(wireguard)
        // Выполняем операцию: .args(uninstall_tunnel_arguments(tunnel)).
        .args(uninstall_tunnel_arguments(tunnel))
        // Выполняем операцию: .hidden().
        .hidden()
        // Выполняем операцию: .output().
        .output()
        // Выполняем операцию: .await;.
        .await;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию apply_kill_switch.
async fn apply_kill_switch(interface: &str, enable: bool) -> AppResult<()> {
    // Объявляем переменную state_dir .
    let state_dir = vpn_store::configs_dir()?;

    // Проверяем условие: enable {.
    if enable {
        // Выполняем операцию: vpn_killswitch::apply(interface, &state_dir).await?;.
        vpn_killswitch::apply(interface, &state_dir).await?;
    // Закрываем блок.
    } else {
        // Выполняем операцию: vpn_killswitch::disable(&state_dir).await?;.
        vpn_killswitch::disable(&state_dir).await?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию wait_handshake.
async fn wait_handshake(tunnel: &str, timeout_sec: u64) -> AppResult<HandshakeInfo> {
    // Объявляем переменную Some(wg) .
    let Some(wg) = detect_wg_tool() else {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "wg.exe не найден, handshake проверить невозможно",.
            "wg.exe не найден, handshake проверить невозможно",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    };

    // Объявляем переменную deadline .
    let deadline = std::time::Instant::now() + Duration::from_secs(timeout_sec);
    // Объявляем переменную info .
    let mut info = HandshakeInfo::default();

    // Повторяем, пока выполняется условие.
    while std::time::Instant::now() < deadline {
        // Выполняем операцию: info = query_handshake(&wg, tunnel).await?;.
        info = query_handshake(&wg, tunnel).await?;

        // Проверяем условие: info.
        if info
            // Выполняем операцию: .seconds_ago.
            .seconds_ago
            // Выполняем операцию: .is_some_and(|value| value < HANDSHAKE_FRESH_SEC).
            .is_some_and(|value| value < HANDSHAKE_FRESH_SEC)
        // Выполняем операцию: {.
        {
            // Возвращаем результат из функции.
            return Ok(info);
            // Закрываем блок.
        }

        // Выполняем операцию: tokio::time::sleep(Duration::from_millis(HANDSHAKE_POLL.
        tokio::time::sleep(Duration::from_millis(HANDSHAKE_POLL_INTERVAL_MS)).await;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(info).
    Ok(info)
    // Закрываем блок.
}

// Объявляем функцию remember.
fn remember(state: &VpnState, tunnel: &str, connected_at: u64) {
    // Проверяем условие: let Ok(mut slot) = state.active_config.lock() {.
    if let Ok(mut slot) = state.active_config.lock() {
        *slot = Some(tunnel.to_string());
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = state.active_interface.lock() {.
    if let Ok(mut slot) = state.active_interface.lock() {
        *slot = Some(tunnel.to_string());
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = state.connected_at.lock() {.
    if let Ok(mut slot) = state.connected_at.lock() {
        *slot = connected_at;
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Выполняем операцию: pub async fn connect_vpn(.
pub async fn connect_vpn(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: state: &VpnState,.
    state: &VpnState,
    // Выполняем операцию: manager: State<'_, ProcessManager>,.
    manager: State<'_, ProcessManager>,
    // Выполняем операцию: config_id: &str,.
    config_id: &str,
    // Выполняем операцию: enable_kill_switch: bool,.
    enable_kill_switch: bool,
    // Выполняем операцию: handshake_timeout_sec: u64,.
    handshake_timeout_sec: u64,
    // Закрываем выражение или коллекцию.
) -> AppResult<VpnStatus> {
    // Объявляем переменную config .
    let config = find_config(config_id)?;

    // Выполняем операцию: emit_step(app, "stopping-dpi").await;.
    emit_step(app, "stopping-dpi").await;
    // Выполняем операцию: stop_dpi(manager).await;.
    stop_dpi(manager).await;

    // Выполняем операцию: emit_step(app, "starting-vpn").await;.
    emit_step(app, "starting-vpn").await;
    // Выполняем операцию: install_tunnel(&config).await?;.
    install_tunnel(&config).await?;

    // Объявляем переменную tunnel .
    let tunnel = tunnel_name(&config);
    // Объявляем переменную connected_at .
    let connected_at = now_secs();
    // Выполняем операцию: remember(state, &tunnel, connected_at);.
    remember(state, &tunnel, connected_at);

    // Выполняем операцию: emit_step(app, "checking-handshake").await;.
    emit_step(app, "checking-handshake").await;

    // Объявляем переменную timeout .
    let timeout = if handshake_timeout_sec == 0 {
        // Выполняем операцию: HANDSHAKE_DEFAULT_SEC.
        HANDSHAKE_DEFAULT_SEC
    // Закрываем блок.
    } else {
        // Выполняем операцию: handshake_timeout_sec.
        handshake_timeout_sec
        // Закрываем блок.
    };

    // Объявляем переменную info .
    let info = wait_handshake(&tunnel, timeout).await?;
    // Объявляем переменную connected .
    let connected = info
        // Выполняем операцию: .seconds_ago.
        .seconds_ago
        // Выполняем операцию: .is_some_and(|value| value < HANDSHAKE_FRESH_SEC);.
        .is_some_and(|value| value < HANDSHAKE_FRESH_SEC);

    // Проверяем условие: !connected {.
    if !connected {
        // Объявляем переменную _ .
        let _ = remove_tunnel(&tunnel).await;
        // Выполняем операцию: state.reset();.
        state.reset();

        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Handshake не прошёл за {timeout} секунд".
            "Handshake не прошёл за {timeout} секунд" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Проверяем условие: enable_kill_switch {.
    if enable_kill_switch {
        // Проверяем условие: let Err(error) = apply_kill_switch(&tunnel, true)..
        if let Err(error) = apply_kill_switch(&tunnel, true).await {
            // Объявляем переменную _ .
            let _ = remove_tunnel(&tunnel).await;
            // Выполняем операцию: state.reset();.
            state.reset();

            // Возвращаем результат из функции.
            return Err(error);
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = state.kill_switch_on.lock() {.
        if let Ok(mut slot) = state.kill_switch_on.lock() {
            *slot = true;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("VPN подключён: {} эндпоинт {}", tunnel,.
    tracing::info!("VPN подключён: {} эндпоинт {}", tunnel, info.endpoint);

    // Выполняем операцию: Ok(VpnStatus::from_info(&tunnel, &info, connected_at)).
    Ok(VpnStatus::from_info(&tunnel, &info, connected_at))
    // Закрываем блок.
}

// Объявляем функцию teardown.
async fn teardown(state: &VpnState, app: &AppHandle) -> AppResult<()> {
    // Объявляем переменную tunnel .
    let tunnel = state.active();
    // Объявляем переменную kill_switch_on .
    let kill_switch_on = state
        // Выполняем операцию: .kill_switch_on.
        .kill_switch_on
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .map(|value| *value).
        .map(|value| *value)
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Выполняем операцию: emit_step(app, "stopping-vpn").await;.
    emit_step(app, "stopping-vpn").await;

    // Проверяем условие: let Some(name) = tunnel.as_deref() {.
    if let Some(name) = tunnel.as_deref() {
        // Проверяем условие: kill_switch_on {.
        if kill_switch_on {
            // Объявляем переменную _ .
            let _ = apply_kill_switch(name, false).await;
            // Закрываем блок.
        }

        // Объявляем переменную _ .
        let _ = remove_tunnel(name).await;
        // Закрываем блок.
    }

    // Выполняем операцию: state.reset();.
    state.reset();
    // Объявляем переменную _ .
    let _ = app.emit(EVENT_DISCONNECTED, "disconnected");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Выполняем операцию: pub async fn disconnect(app: &AppHandle, state: &VpnSta.
pub async fn disconnect(app: &AppHandle, state: &VpnState) -> AppResult<()> {
    // Выполняем операцию: teardown(state, app).await?;.
    teardown(state, app).await?;
    // Выполняем операцию: tracing::info!("VPN отключён");.
    tracing::info!("VPN отключён");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Выполняем операцию: pub async fn switch_to_dpi(app: &AppHandle, state: &Vpn.
pub async fn switch_to_dpi(app: &AppHandle, state: &VpnState) -> AppResult<()> {
    // Выполняем операцию: teardown(state, app).await?;.
    teardown(state, app).await?;
    // Выполняем операцию: emit_step(app, "done").await;.
    emit_step(app, "done").await;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Выполняем операцию: pub async fn current_status(state: &VpnState) -> VpnSta.
pub async fn current_status(state: &VpnState) -> VpnStatus {
    // Объявляем переменную Some(tunnel) .
    let Some(tunnel) = state.active() else {
        // Возвращаем результат из функции.
        return VpnStatus::default();
        // Закрываем блок.
    };

    // Объявляем переменную connected_at .
    let connected_at = state
        // Выполняем операцию: .connected_at.
        .connected_at
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .map(|value| *value).
        .map(|value| *value)
        // Выполняем операцию: .unwrap_or_else(|_| now_secs());.
        .unwrap_or_else(|_| now_secs());

    // Объявляем переменную info .
    let info = match detect_wg_tool() {
        // Выполняем операцию: Some(wg) => query_handshake(&wg, &tunnel).await.unwrap_.
        Some(wg) => query_handshake(&wg, &tunnel).await.unwrap_or_default(),
        // Выполняем операцию: None => HandshakeInfo::default(),.
        None => HandshakeInfo::default(),
        // Закрываем блок.
    };

    // Выполняем операцию: VpnStatus::from_info(&tunnel, &info, connected_at).
    VpnStatus::from_info(&tunnel, &info, connected_at)
    // Закрываем блок.
}

/// Оставляет только туннели, за которые отвечает приложение: их
/// конфиги лежат в нашем каталоге. Всё остальное — чужое.
// Объявляем функцию owned_tunnels.
pub fn owned_tunnels<'a>(tunnels: &'a [String], owned: &HashSet<String>) -> Vec<&'a String> {
    // Выполняем операцию: tunnels.
    tunnels
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|name| owned.contains(name.as_str())).
        .filter(|name| owned.contains(name.as_str()))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

/// Убирает оставшиеся туннели приложения. Чужие туннели (корпоративный
/// VPN, ручные настройки WireGuard) не трогаем: за них наше
/// приложение не отвечает, а снос чужого туннеля рвёт чужое
/// соединение.
// Выполняем операцию: pub async fn teardown_stale_tunnel(state: &VpnState) {.
pub async fn teardown_stale_tunnel(state: &VpnState) {
    // Объявляем переменную Some(tunnels) .
    let Some(tunnels) = installed_tunnels().await else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Проверяем условие: tunnels.is_empty() {.
    if tunnels.is_empty() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную ours.
    let ours: HashSet<String> = vpn_store::config_files()
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|path| tunnel_name(path)).
        .map(|path| tunnel_name(path))
        // Выполняем операцию: .collect();.
        .collect();

    // Перебираем элементы коллекции.
    for tunnel in owned_tunnels(&tunnels, &ours) {
        // Объявляем переменную _ .
        let _ = remove_tunnel(tunnel).await;
        // Выполняем операцию: state.reset();.
        state.reset();
        // Выполняем операцию: tracing::warn!("Найден оставшийся туннель приложения, о.
        tracing::warn!("Найден оставшийся туннель приложения, отключён: {tunnel}");
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Выполняем операцию: pub async fn current_stats(state: &VpnState) -> VpnStat.
pub async fn current_stats(state: &VpnState) -> VpnStats {
    // Объявляем переменную status .
    let status = current_status(state).await;
    // Объявляем переменную kill_switch_on .
    let kill_switch_on = state
        // Выполняем операцию: .kill_switch_on.
        .kill_switch_on
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .map(|value| *value).
        .map(|value| *value)
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Выполняем операцию: VpnStats {.
    VpnStats {
        // Выполняем операцию: interface: status.interface,.
        interface: status.interface,
        // Выполняем операцию: endpoint: status.endpoint,.
        endpoint: status.endpoint,
        // Выполняем операцию: handshake_at: status.handshake_at,.
        handshake_at: status.handshake_at,
        // Выполняем операцию: bytes_in: status.bytes_in.unwrap_or_default(),.
        bytes_in: status.bytes_in.unwrap_or_default(),
        // Выполняем операцию: bytes_out: status.bytes_out.unwrap_or_default(),.
        bytes_out: status.bytes_out.unwrap_or_default(),
        // Выполняем операцию: uptime_sec: status.uptime_sec.unwrap_or_default(),.
        uptime_sec: status.uptime_sec.unwrap_or_default(),
        // Выполняем операцию: is_switching: state.is_switching.load(Ordering::SeqCst).
        is_switching: state.is_switching.load(Ordering::SeqCst),
        // Выполняем операцию: kill_switch_on,.
        kill_switch_on,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_switch_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
