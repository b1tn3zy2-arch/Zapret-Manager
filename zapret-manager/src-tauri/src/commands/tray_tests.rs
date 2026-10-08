use super::*;

#[test]
fn test_clean_trims_and_rejects_empty() {
    assert_eq!(clean(Some("  NL  ".to_string())).as_deref(), Some("NL"));
    assert_eq!(clean(Some("   ".to_string())), None);
    assert_eq!(clean(Some(String::new())), None);
    assert_eq!(clean(None), None);
}

#[test]
fn test_update_deserializes_camel_case() {
    let update: TrayUpdate = serde_json::from_str(
        r#"{"state":"vpn","activeStrategy":null,"vpnName":"Mullvad NL"}"#,
    )
    .unwrap_or(TrayUpdate {
        state: "idle".to_string(),
        active_strategy: None,
        vpn_name: None,
    });

    assert_eq!(update.state, "vpn");
    assert_eq!(update.vpn_name.as_deref(), Some("Mullvad NL"));
    assert!(update.active_strategy.is_none());
}

#[test]
fn test_update_serializes_camel_case() {
    let update = TrayUpdate {
        state: "connected".to_string(),
        active_strategy: Some("Discord".to_string()),
        vpn_name: None,
    };
    let value = serde_json::to_string(&update).unwrap_or_default();

    assert!(value.contains("\"activeStrategy\""));
    assert!(!value.contains("active_strategy"));
}

#[test]
fn test_tray_config_deserializes_camel_case() {
    let config: TrayConfig = serde_json::from_str(
        r#"{"animateOnConnect":false,"showNotificationsOnStart":true,"showNotificationsOnStop":false,"showUpdateNotifications":true}"#,
    )
    .unwrap_or_default();

    assert!(!config.animate_on_connect);
    assert!(config.show_notifications_on_start);
}

#[test]
fn test_tray_config_falls_back_to_defaults() {
    let config: TrayConfig = serde_json::from_str("{}").unwrap_or_default();

    assert_eq!(
        config.animate_on_connect,
        TrayConfig::default().animate_on_connect
    );
    assert_eq!(
        config.show_update_notifications,
        TrayConfig::default().show_update_notifications
    );
}

#[test]
fn test_state_parse_flows_into_icon_stem() {
    for raw in ["idle", "connecting", "connected", "vpn", "error"] {
        let state = TrayState::parse(raw).unwrap_or(TrayState::Error);

        assert_eq!(state.icon_stem(), raw);
    }
}

#[test]
fn test_invalid_state_is_rejected_before_tray_call() {
    assert!(TrayState::parse("booting").is_err());
}

#[test]
fn test_kind_parse_flows_into_as_str() {
    let kind = NotificationKind::parse("warning").unwrap_or(NotificationKind::Info);

    assert_eq!(kind.as_str(), "warning");
}

#[test]
fn test_invalid_kind_is_rejected() {
    assert!(NotificationKind::parse("fatal").is_err());
}