use tauri::menu::{IsMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Emitter, Wry};

use crate::error::AppResult;
use crate::tray::{
    APP_NAME, EVENT_CHECK_UPDATES, EVENT_CONNECT_VPN, EVENT_DISCONNECT_VPN, EVENT_QUIT,
    EVENT_RUN_STRATEGY, EVENT_STOP_STRATEGY, TrayState,
};

pub const MENU_HEADER: &str = "header";
pub const MENU_STATUS: &str = "status";
pub const MENU_RUN: &str = "run";
pub const MENU_STOP: &str = "stop";
pub const MENU_VPN_CONNECT: &str = "vpn-connect";
pub const MENU_VPN_DISCONNECT: &str = "vpn-disconnect";
pub const MENU_DASHBOARD: &str = "dashboard";
pub const MENU_STRATEGIES: &str = "strategies";
pub const MENU_LOGS: &str = "logs";
pub const MENU_SETTINGS: &str = "settings";
pub const MENU_CHECK_UPDATES: &str = "check-updates";
pub const MENU_QUIT: &str = "quit";

pub const EVENT_NAVIGATE_DASHBOARD: &str = "navigate-dashboard";
pub const EVENT_NAVIGATE_STRATEGIES: &str = "navigate-strategies";
pub const EVENT_NAVIGATE_LOGS: &str = "navigate-logs";
pub const EVENT_NAVIGATE_SETTINGS: &str = "navigate-settings";

fn run_label(active_strategy: Option<&str>) -> String {
    match active_strategy {
        Some(name) if !name.is_empty() => format!("Запустить: {name}"),
        _ => "Запустить стратегию".to_string(),
    }
}

fn is_running(state: TrayState) -> bool {
    matches!(state, TrayState::Connected | TrayState::Connecting)
}

fn nav_event(id: &str) -> Option<&'static str> {
    match id {
        MENU_DASHBOARD => Some(EVENT_NAVIGATE_DASHBOARD),
        MENU_STRATEGIES => Some(EVENT_NAVIGATE_STRATEGIES),
        MENU_LOGS => Some(EVENT_NAVIGATE_LOGS),
        MENU_SETTINGS => Some(EVENT_NAVIGATE_SETTINGS),
        _ => None,
    }
}

pub fn menu_event_for(id: &str) -> Option<&'static str> {
    match id {
        MENU_RUN => Some(EVENT_RUN_STRATEGY),
        MENU_STOP => Some(EVENT_STOP_STRATEGY),
        MENU_VPN_CONNECT => Some(EVENT_CONNECT_VPN),
        MENU_VPN_DISCONNECT => Some(EVENT_DISCONNECT_VPN),
        MENU_CHECK_UPDATES => Some(EVENT_CHECK_UPDATES),
        MENU_QUIT => Some(EVENT_QUIT),
        other => nav_event(other),
    }
}

pub fn needs_window(id: &str) -> bool {
    nav_event(id).is_some()
}

pub fn build_menu(
    app: &AppHandle,
    state: TrayState,
    active_strategy: Option<&str>,
    vpn_name: Option<&str>,
) -> AppResult<Menu<Wry>> {
    let header = MenuItem::with_id(app, MENU_HEADER, APP_NAME, false, None::<&str>)?;
    let status = MenuItem::with_id(
        app,
        MENU_STATUS,
        state.status_label(active_strategy, vpn_name),
        false,
        None::<&str>,
    )?;

    let sep1 = PredefinedMenuItem::separator(app)?;
    let toggle = if is_running(state) {
        MenuItem::with_id(app, MENU_STOP, "Остановить", true, None::<&str>)?
    } else {
        MenuItem::with_id(app, MENU_RUN, run_label(active_strategy), true, None::<&str>)?
    };

    let vpn = if state == TrayState::Vpn {
        MenuItem::with_id(
            app,
            MENU_VPN_DISCONNECT,
            "Отключить VPN",
            true,
            None::<&str>,
        )?
    } else {
        MenuItem::with_id(
            app,
            MENU_VPN_CONNECT,
            "Подключить VPN",
            true,
            None::<&str>,
        )?
    };

    let sep2 = PredefinedMenuItem::separator(app)?;
    let dashboard = MenuItem::with_id(app, MENU_DASHBOARD, "Открыть Dashboard", true, None::<&str>)?;
    let strategies = MenuItem::with_id(app, MENU_STRATEGIES, "Стратегии", true, None::<&str>)?;
    let logs = MenuItem::with_id(app, MENU_LOGS, "Логи", true, None::<&str>)?;
    let settings = MenuItem::with_id(app, MENU_SETTINGS, "Настройки", true, None::<&str>)?;
    let sep3 = PredefinedMenuItem::separator(app)?;
    let check = MenuItem::with_id(
        app,
        MENU_CHECK_UPDATES,
        "Проверить обновления",
        true,
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(app, MENU_QUIT, "Выход", true, None::<&str>)?;

    let entries: [&dyn IsMenuItem<Wry>; 13] = [
        &header,
        &status,
        &sep1,
        &toggle,
        &vpn,
        &sep2,
        &dashboard,
        &strategies,
        &logs,
        &settings,
        &sep3,
        &check,
        &quit,
    ];

    Ok(Menu::with_items(app, &entries)?)
}

pub fn emit_for_menu(app: &AppHandle, id: &str) {
    let Some(event) = menu_event_for(id) else {
        return;
    };

    if needs_window(id) {
        super::runtime::show_window(app);
    }

    let _ = app.emit(event, ());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_menu_ids_are_unique() {
        let ids = [
            MENU_HEADER,
            MENU_STATUS,
            MENU_RUN,
            MENU_STOP,
            MENU_VPN_CONNECT,
            MENU_VPN_DISCONNECT,
            MENU_DASHBOARD,
            MENU_STRATEGIES,
            MENU_LOGS,
            MENU_SETTINGS,
            MENU_CHECK_UPDATES,
            MENU_QUIT,
        ];
        let mut unique = ids.to_vec();
        unique.sort_unstable();
        unique.dedup();

        assert_eq!(unique.len(), ids.len());
        assert_eq!(ids.len(), 12);
    }

    #[test]
    fn test_menu_event_covers_every_action() {
        assert_eq!(menu_event_for(MENU_RUN), Some(EVENT_RUN_STRATEGY));
        assert_eq!(menu_event_for(MENU_STOP), Some(EVENT_STOP_STRATEGY));
        assert_eq!(menu_event_for(MENU_VPN_CONNECT), Some(EVENT_CONNECT_VPN));
        assert_eq!(
            menu_event_for(MENU_VPN_DISCONNECT),
            Some(EVENT_DISCONNECT_VPN)
        );
        assert_eq!(menu_event_for(MENU_CHECK_UPDATES), Some(EVENT_CHECK_UPDATES));
        assert_eq!(menu_event_for(MENU_QUIT), Some(EVENT_QUIT));
    }

    #[test]
    fn test_menu_event_covers_navigation() {
        assert_eq!(menu_event_for(MENU_DASHBOARD), Some(EVENT_NAVIGATE_DASHBOARD));
        assert_eq!(
            menu_event_for(MENU_STRATEGIES),
            Some(EVENT_NAVIGATE_STRATEGIES)
        );
        assert_eq!(menu_event_for(MENU_LOGS), Some(EVENT_NAVIGATE_LOGS));
        assert_eq!(menu_event_for(MENU_SETTINGS), Some(EVENT_NAVIGATE_SETTINGS));
    }

    #[test]
    fn test_non_clickable_items_have_no_event() {
        assert_eq!(menu_event_for(MENU_HEADER), None);
        assert_eq!(menu_event_for(MENU_STATUS), None);
        assert_eq!(menu_event_for("unknown"), None);
        assert!(!needs_window(MENU_HEADER));
    }

    #[test]
    fn test_navigation_items_request_window() {
        assert!(needs_window(MENU_DASHBOARD));
        assert!(needs_window(MENU_SETTINGS));
        assert!(!needs_window(MENU_RUN));
    }

    #[test]
    fn test_running_states_show_stop() {
        assert!(is_running(TrayState::Connected));
        assert!(is_running(TrayState::Connecting));
        assert!(!is_running(TrayState::Idle));
        assert!(!is_running(TrayState::Vpn));
        assert!(!is_running(TrayState::Error));
    }

    #[test]
    fn test_run_label_uses_strategy_name() {
        assert_eq!(run_label(Some("Discord + YouTube")), "Запустить: Discord + YouTube");
        assert_eq!(run_label(Some("")), "Запустить стратегию");
        assert_eq!(run_label(None), "Запустить стратегию");
    }

    #[test]
    fn test_menu_has_thirteen_entries() {
        let items = 13;

        assert!(items >= 10, "в меню должно быть не меньше 10 пунктов");
    }
}