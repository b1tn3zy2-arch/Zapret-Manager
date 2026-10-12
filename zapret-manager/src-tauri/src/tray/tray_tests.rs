use super::*;

#[test]
fn test_parse_accepts_all_five_states() {
    for raw in ["idle", "connecting", "connected", "vpn", "error"] {
        assert_eq!(TrayState::parse(raw).unwrap_or(TrayState::Idle).icon_stem(), raw);
    }
}

#[test]
fn test_parse_is_case_insensitive() {
    assert_eq!(TrayState::parse(" VPN ").unwrap_or(TrayState::Idle), TrayState::Vpn);
}

#[test]
fn test_parse_rejects_unknown_state() {
    assert!(TrayState::parse("suspended").is_err());
    assert!(TrayState::parse("").is_err());
}

#[test]
fn test_status_label_idle_has_no_strategy() {
    assert_eq!(TrayState::Idle.status_label(Some("Discord"), None), "Отключено");
}

#[test]
fn test_status_label_connected_includes_strategy() {
    assert_eq!(
        TrayState::Connected.status_label(Some("Discord + YouTube"), None),
        "Активно: Discord + YouTube"
    );
}

#[test]
fn test_status_label_connected_without_strategy() {
    assert_eq!(TrayState::Connected.status_label(None, None), "Активно");
}

#[test]
fn test_status_label_vpn_includes_config_name() {
    assert_eq!(
        TrayState::Vpn.status_label(None, Some("Mullvad NL")),
        "VPN: Mullvad NL"
    );
}

#[test]
fn test_status_label_vpn_without_config_name() {
    assert_eq!(TrayState::Vpn.status_label(None, None), "VPN активен");
}

#[test]
fn test_status_label_error_and_connecting() {
    assert_eq!(TrayState::Error.status_label(None, None), "Ошибка");
    assert_eq!(TrayState::Connecting.status_label(None, None), "Подключение…");
}

#[test]
fn test_status_label_ignores_empty_strings() {
    assert_eq!(TrayState::Vpn.status_label(None, Some("")), "VPN активен");
    assert_eq!(TrayState::Connected.status_label(Some(""), None), "Активно");
}

#[test]
fn test_notification_kind_parse_and_render() {
    for raw in ["success", "error", "warning", "info"] {
        let kind = NotificationKind::parse(raw).unwrap_or(NotificationKind::Info);

        assert_eq!(kind.as_str(), raw);
    }
}

#[test]
fn test_notification_kind_rejects_unknown() {
    assert!(NotificationKind::parse("critical").is_err());
}

#[test]
fn test_tray_config_defaults_match_spec() {
    let config = TrayConfig::default();

    assert!(config.animate_on_connect);
    assert!(!config.show_notifications_on_start);
    assert!(!config.show_notifications_on_stop);
    assert!(config.show_update_notifications);
}

#[test]
fn test_navigation_events_cover_all_pages() {
    assert_eq!(NAVIGATION_EVENTS.len(), 4);
    assert!(NAVIGATION_EVENTS.contains(&"navigate-dashboard"));
    assert!(NAVIGATION_EVENTS.contains(&"navigate-strategies"));
    assert!(NAVIGATION_EVENTS.contains(&"navigate-logs"));
    assert!(NAVIGATION_EVENTS.contains(&"navigate-settings"));
}

#[test]
fn test_event_names_are_distinct() {
    let names = [
        EVENT_RUN_STRATEGY,
        EVENT_STOP_STRATEGY,
        EVENT_QUICK_RUN,
        EVENT_CONNECT_VPN,
        EVENT_DISCONNECT_VPN,
        EVENT_CHECK_UPDATES,
        EVENT_QUIT,
        EVENT_TRAY_LEFT_CLICK,
    ];
    let mut unique = names.to_vec();
    unique.sort_unstable();
    unique.dedup();

    assert_eq!(unique.len(), names.len());
}

#[test]
fn test_app_name_is_stable() {
    assert_eq!(APP_NAME, "Zapret");
}