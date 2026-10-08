use serde::{Deserialize, Serialize};

use tauri::Manager;

use crate::error::AppResult;
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

#[tauri::command]
pub async fn quit_app(app: tauri::AppHandle) -> AppResult<()> {
    crate::window_behavior::begin_quit(&app);

    let state = app.state::<crate::process_manager::ProcessManager>();

    state.clear();

    let killed = crate::commands::runner::kill_winws_for_shutdown().await;

    tracing::info!("Выход из трея: остановлено процессов winws.exe {killed}");
    app.exit(0);

    Ok(())
}

#[tauri::command]
pub fn show_tray_window(app: tauri::AppHandle) {
    crate::tray::show_window(&app);
}

fn clean(value: Option<String>) -> Option<String> {
    value
        .map(|item| item.trim().to_string())
        .filter(|item| !item.is_empty())
}

#[cfg(test)]
#[path = "tray_tests.rs"]
mod tests;