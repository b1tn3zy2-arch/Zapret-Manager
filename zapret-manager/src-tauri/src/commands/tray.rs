use serde::{Deserialize, Serialize};

use tauri::{Emitter, Manager};

use crate::error::{AppError, AppResult};
use crate::tray::{NotificationKind, TrayConfig, TrayState};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrayUpdate {
    pub state: String,
    pub active_strategy: Option<String>,
    pub vpn_name: Option<String>,
}

#[tauri::command]
pub fn update_tray_state(app: tauri::AppHandle, update: TrayUpdate) -> AppResult<()> {
    let state = TrayState::parse(&update.state)?;
    let active = clean(update.active_strategy);
    let vpn = clean(update.vpn_name);

    tracing::debug!("Трей: состояние {state:?}, стратегия {active:?}, vpn {vpn:?}");

    crate::tray::apply_state(&app, state, active, vpn)
}

#[tauri::command]
pub fn update_tray_config(app: tauri::AppHandle, config: TrayConfig) -> AppResult<()> {
    crate::tray::configure(&app, config.animate_on_connect);
    crate::tray::update_tooltip_and_menu(&app)
}

#[tauri::command]
pub fn show_notification(app: tauri::AppHandle, title: String, body: String, kind: String) -> AppResult<()> {
    let kind = NotificationKind::parse(&kind)?;
    crate::commands::notify::send(&app, &title, &body, kind)
}

#[tauri::command]
pub fn toggle_tray_window(app: tauri::AppHandle) {
    crate::tray::toggle_window(&app);
}

/// Единая процедура завершения приложения.
///
/// Раньше пункт «Выход» в меню трея выходил через app.exit(0) напрямую и не
/// трогал процессы: winws.exe оставались висеть после закрытия приложения.
pub async fn shutdown(app: &tauri::AppHandle) -> AppResult<()> {
    crate::window_behavior::begin_quit(app);

    let state = app.state::<crate::process_manager::ProcessManager>();

    state.clear();

    let killed = crate::commands::runner::kill_winws_for_shutdown().await;

    tracing::info!("Выход из приложения: остановлено процессов winws.exe {killed}");
    app.exit(0);

    Ok(())
}

#[tauri::command]
pub async fn quit_app(app: tauri::AppHandle) -> AppResult<()> {
    shutdown(&app).await
}

#[tauri::command]
pub fn show_tray_window(app: tauri::AppHandle) {
    crate::tray::show_window(&app);
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrayMenuSnapshot {
    pub state: String,
    pub active_strategy: Option<String>,
    pub vpn_name: Option<String>,
}

#[tauri::command]
pub fn tray_menu_snapshot(app: tauri::AppHandle) -> TrayMenuSnapshot {
    tray_snapshot(&app)
}

pub fn tray_snapshot<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> TrayMenuSnapshot {
    let (state, active_strategy, vpn_name) = crate::tray::snapshot(app);

    TrayMenuSnapshot::from_parts(state, active_strategy, vpn_name)
}

impl TrayMenuSnapshot {
    pub fn from_parts(
        state: TrayState,
        active_strategy: Option<String>,
        vpn_name: Option<String>,
    ) -> Self {
        Self {
            state: match state {
                TrayState::Idle => "idle",
                TrayState::Connecting => "connecting",
                TrayState::Connected => "connected",
                TrayState::Vpn => "vpn",
                TrayState::Error => "error",
            }
            .to_string(),
            active_strategy,
            vpn_name,
        }
    }
}

#[tauri::command]
pub fn tray_menu_hide(app: tauri::AppHandle) {
    crate::tray_menu::hide(&app);
}

#[tauri::command]
pub fn tray_menu_ready() {
    crate::tray_menu::mark_ready();
}

/// Сообщение от окна трея о реальной высоте меню: списокitems меняется
/// (VPN-сервер, статус стратегии), и окно обязано подстроиться, иначе нижние
/// пункты вместе с «Выход» снова окажутся за краем.
#[tauri::command]
pub fn tray_menu_set_height(height: f64) {
    crate::tray_menu::set_content_height(height);
}

#[tauri::command]
pub async fn tray_menu_action(app: tauri::AppHandle, action: String) -> AppResult<()> {
    crate::tray_menu::hide(&app);

    match action.as_str() {
        "open" => {
            crate::tray::show_window(&app);

            Ok(())
        }
        "run" => {
            crate::tray::show_window(&app);
            let _ = app.emit(crate::tray::EVENT_QUICK_RUN, ());

            Ok(())
        }
        "stop" => {
            let _ = app.emit(crate::tray::EVENT_STOP_STRATEGY, ());

            Ok(())
        }
        "dashboard" | "strategies" | "logs" | "settings" | "about" => {
            crate::tray::show_window(&app);
            let _ = app.emit(navigation_event(&action), ());

            Ok(())
        }
        "vpn-connect" => {
            let _ = app.emit(crate::tray::EVENT_CONNECT_VPN, ());

            Ok(())
        }
        "vpn-disconnect" => {
            let _ = app.emit(crate::tray::EVENT_DISCONNECT_VPN, ());

            Ok(())
        }
        "updates" => {
            crate::tray::show_window(&app);
            let _ = app.emit(crate::tray::EVENT_CHECK_UPDATES, ());

            Ok(())
        }
        "quit" => shutdown(&app).await,
        other => Err(AppError::custom(format!("Неизвестное действие меню: {other}"))),
    }
}

fn navigation_event(action: &str) -> &'static str {
    match action {
        "strategies" => crate::tray::EVENT_NAVIGATE_STRATEGIES,
        "logs" => crate::tray::EVENT_NAVIGATE_LOGS,
        "settings" => crate::tray::EVENT_NAVIGATE_SETTINGS,
        "about" => crate::tray::EVENT_NAVIGATE_ABOUT,
        _ => crate::tray::EVENT_NAVIGATE_DASHBOARD,
    }
}

fn clean(value: Option<String>) -> Option<String> {
    value
        .map(|item| item.trim().to_string())
        .filter(|item| !item.is_empty())
}

#[cfg(test)]
#[path = "tray_tests.rs"]
mod tests;