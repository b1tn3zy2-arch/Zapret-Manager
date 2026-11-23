// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_clean_trims_and_rejects_empty.
fn test_clean_trims_and_rejects_empty() {
    // Выполняем операцию: assert_eq!(clean(Some("  NL  ".to_string())).as_deref().
    assert_eq!(clean(Some("  NL  ".to_string())).as_deref(), Some("NL"));
    // Выполняем операцию: assert_eq!(clean(Some("   ".to_string())), None);.
    assert_eq!(clean(Some("   ".to_string())), None);
    // Выполняем операцию: assert_eq!(clean(Some(String::new())), None);.
    assert_eq!(clean(Some(String::new())), None);
    // Выполняем операцию: assert_eq!(clean(None), None);.
    assert_eq!(clean(None), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_update_deserializes_camel_case.
fn test_update_deserializes_camel_case() {
    // Объявляем переменную update.
    let update: TrayUpdate =
        // Выполняем операцию: serde_json::from_str(r#"{"state":"vpn","activeStrategy".
        serde_json::from_str(r#"{"state":"vpn","activeStrategy":null,"vpnName":"Mullvad NL"}"#)
            // Выполняем операцию: .unwrap_or(TrayUpdate {.
            .unwrap_or(TrayUpdate {
                // Выполняем операцию: state: "idle".to_string(),.
                state: "idle".to_string(),
                // Выполняем операцию: active_strategy: None,.
                active_strategy: None,
                // Выполняем операцию: vpn_name: None,.
                vpn_name: None,
            // Закрываем блок.
            });

    // Выполняем операцию: assert_eq!(update.state, "vpn");.
    assert_eq!(update.state, "vpn");
    // Выполняем операцию: assert_eq!(update.vpn_name.as_deref(), Some("Mullvad NL.
    assert_eq!(update.vpn_name.as_deref(), Some("Mullvad NL"));
    // Выполняем операцию: assert!(update.active_strategy.is_none());.
    assert!(update.active_strategy.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_update_serializes_camel_case.
fn test_update_serializes_camel_case() {
    // Объявляем переменную update .
    let update = TrayUpdate {
        // Выполняем операцию: state: "connected".to_string(),.
        state: "connected".to_string(),
        // Выполняем операцию: active_strategy: Some("Discord".to_string()),.
        active_strategy: Some("Discord".to_string()),
        // Выполняем операцию: vpn_name: None,.
        vpn_name: None,
        // Закрываем блок.
    };
    // Объявляем переменную value .
    let value = serde_json::to_string(&update).unwrap_or_default();

    // Выполняем операцию: assert!(value.contains("\"activeStrategy\""));.
    assert!(value.contains("\"activeStrategy\""));
    // Выполняем операцию: assert!(!value.contains("active_strategy"));.
    assert!(!value.contains("active_strategy"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tray_config_deserializes_camel_case.
fn test_tray_config_deserializes_camel_case() {
    // Объявляем переменную config.
    let config: TrayConfig = serde_json::from_str(
        // Выполняем операцию: r#"{"animateOnConnect":false,"showNotificationsOnStart".
        r#"{"animateOnConnect":false,"showNotificationsOnStart":true,"showNotificationsOnStop":false,"showUpdateNotifications":true}"#,
    // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap_or_default();.
    .unwrap_or_default();

    // Выполняем операцию: assert!(!config.animate_on_connect);.
    assert!(!config.animate_on_connect);
    // Выполняем операцию: assert!(config.show_notifications_on_start);.
    assert!(config.show_notifications_on_start);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tray_config_falls_back_to_defaults.
fn test_tray_config_falls_back_to_defaults() {
    // Объявляем переменную config.
    let config: TrayConfig = serde_json::from_str("{}").unwrap_or_default();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config.animate_on_connect,.
        config.animate_on_connect,
        // Выполняем операцию: TrayConfig::default().animate_on_connect.
        TrayConfig::default().animate_on_connect // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config.show_update_notifications,.
        config.show_update_notifications,
        // Выполняем операцию: TrayConfig::default().show_update_notifications.
        TrayConfig::default().show_update_notifications // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_parse_flows_into_icon_stem.
fn test_state_parse_flows_into_icon_stem() {
    // Перебираем элементы коллекции.
    for raw in ["idle", "connecting", "connected", "vpn", "error"] {
        // Объявляем переменную state .
        let state = TrayState::parse(raw).unwrap_or(TrayState::Error);

        // Выполняем операцию: assert_eq!(state.icon_stem(), raw);.
        assert_eq!(state.icon_stem(), raw);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_invalid_state_is_rejected_before_tray_call.
fn test_invalid_state_is_rejected_before_tray_call() {
    // Выполняем операцию: assert!(TrayState::parse("booting").is_err());.
    assert!(TrayState::parse("booting").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_kind_parse_flows_into_as_str.
fn test_kind_parse_flows_into_as_str() {
    // Объявляем переменную kind .
    let kind = NotificationKind::parse("warning").unwrap_or(NotificationKind::Info);

    // Выполняем операцию: assert_eq!(kind.as_str(), "warning");.
    assert_eq!(kind.as_str(), "warning");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_invalid_kind_is_rejected.
fn test_invalid_kind_is_rejected() {
    // Выполняем операцию: assert!(NotificationKind::parse("fatal").is_err());.
    assert!(NotificationKind::parse("fatal").is_err());
    // Закрываем блок.
}
