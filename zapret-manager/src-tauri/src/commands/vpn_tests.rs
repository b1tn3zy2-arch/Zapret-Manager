// Подключаем модули: super::*;.
use super::*;

// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: crate::commands::vpn_config::parse_endpoint;.
use crate::commands::vpn_config::parse_endpoint;
// Подключаем модули: crate::commands::vpn_store::{import_config_text_into, i.
use crate::commands::vpn_store::{import_config_text_into, info_from_file, pasted_config_name};
// Подключаем модули: crate::commands::vpn_wireguard::parse_wg_show_output;.
use crate::commands::vpn_wireguard::parse_wg_show_output;
// Подключаем модули: crate::security::MAX_VPN_CONF_BYTES;.
use crate::security::MAX_VPN_CONF_BYTES;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_endpoint_is_reachable_from_vpn_module.
fn test_parse_endpoint_is_reachable_from_vpn_module() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_endpoint("1.2.3.4:51820"),.
        parse_endpoint("1.2.3.4:51820"),
        // Выполняем операцию: Some(("1.2.3.4".to_string(), 51820)).
        Some(("1.2.3.4".to_string(), 51820)) // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_status_default_is_disconnected.
fn test_vpn_status_default_is_disconnected() {
    // Объявляем переменную status .
    let status = VpnStatus::default();

    // Выполняем операцию: assert_eq!(status.state, "disconnected");.
    assert_eq!(status.state, "disconnected");
    // Выполняем операцию: assert!(status.interface.is_none());.
    assert!(status.interface.is_none());
    // Выполняем операцию: assert!(status.error.is_none());.
    assert!(status.error.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_status_from_fresh_handshake_is_connected.
fn test_vpn_status_from_fresh_handshake_is_connected() {
    // Объявляем переменную info .
    let info = HandshakeInfo {
        // Выполняем операцию: seconds_ago: Some(4),.
        seconds_ago: Some(4),
        // Выполняем операцию: bytes_in: 1024,.
        bytes_in: 1024,
        // Выполняем операцию: bytes_out: 512,.
        bytes_out: 512,
        // Выполняем операцию: endpoint: "1.2.3.4:51820".to_string(),.
        endpoint: "1.2.3.4:51820".to_string(),
        // Закрываем блок.
    };

    // Объявляем переменную status .
    let status = VpnStatus::from_info("mullvad-nl", &info, now_secs() - 10);

    // Выполняем операцию: assert_eq!(status.state, "connected");.
    assert_eq!(status.state, "connected");
    // Выполняем операцию: assert_eq!(status.interface.as_deref(), Some("mullvad-n.
    assert_eq!(status.interface.as_deref(), Some("mullvad-nl"));
    // Выполняем операцию: assert_eq!(status.endpoint.as_deref(), Some("1.2.3.4:51.
    assert_eq!(status.endpoint.as_deref(), Some("1.2.3.4:51820"));
    // Выполняем операцию: assert_eq!(status.bytes_in, Some(1024));.
    assert_eq!(status.bytes_in, Some(1024));
    // Выполняем операцию: assert_eq!(status.bytes_out, Some(512));.
    assert_eq!(status.bytes_out, Some(512));
    // Выполняем операцию: assert!(status.handshake_at.is_some());.
    assert!(status.handshake_at.is_some());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_status_from_stale_handshake_is_connecting.
fn test_vpn_status_from_stale_handshake_is_connecting() {
    // Объявляем переменную info .
    let info = HandshakeInfo {
        // Выполняем операцию: seconds_ago: Some(600),.
        seconds_ago: Some(600),
        // Выполняем операцию: ..HandshakeInfo::default().
        ..HandshakeInfo::default() // Закрываем блок.
    };

    // Объявляем переменную status .
    let status = VpnStatus::from_info("mullvad-nl", &info, now_secs());

    // Выполняем операцию: assert_eq!(status.state, "connecting");.
    assert_eq!(status.state, "connecting");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_status_serializes_as_camel_case.
fn test_vpn_status_serializes_as_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&VpnStatus::default()).unwrap();

    // Выполняем операцию: assert!(json.contains("\"uptimeSec\""));.
    assert!(json.contains("\"uptimeSec\""));
    // Выполняем операцию: assert!(json.contains("\"bytesIn\""));.
    assert!(json.contains("\"bytesIn\""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_config_info_serializes_as_camel_case.
fn test_vpn_config_info_serializes_as_camel_case() {
    // Объявляем переменную info .
    let info = VpnConfigInfo {
        // Выполняем операцию: id: "a".to_string(),.
        id: "a".to_string(),
        // Выполняем операцию: name: "a".to_string(),.
        name: "a".to_string(),
        // Выполняем операцию: path: "C:/a.conf".to_string(),.
        path: "C:/a.conf".to_string(),
        // Выполняем операцию: endpoint: "1.2.3.4:1".to_string(),.
        endpoint: "1.2.3.4:1".to_string(),
        // Выполняем операцию: address: vec!["10.0.0.2/32".to_string()],.
        address: vec!["10.0.0.2/32".to_string()],
        // Выполняем операцию: dns: vec![],.
        dns: vec![],
        // Выполняем операцию: allowed_ips: vec!["0.0.0.0/0".to_string()],.
        allowed_ips: vec!["0.0.0.0/0".to_string()],
        // Выполняем операцию: size: 42,.
        size: 42,
        // Выполняем операцию: imported_at: 7,.
        imported_at: 7,
        // Закрываем блок.
    };

    // Объявляем переменную json .
    let json = serde_json::to_string(&info).unwrap();

    // Выполняем операцию: assert!(json.contains("\"allowedIps\""));.
    assert!(json.contains("\"allowedIps\""));
    // Выполняем операцию: assert!(json.contains("\"importedAt\""));.
    assert!(json.contains("\"importedAt\""));
    // Выполняем операцию: assert!(!json.contains("\"allowed_ips\""));.
    assert!(!json.contains("\"allowed_ips\""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_rejects_double_switch.
fn test_state_rejects_double_switch() {
    // Объявляем переменную state .
    let state = VpnState::new();

    // Выполняем операцию: assert!(state.begin_switch().is_ok());.
    assert!(state.begin_switch().is_ok());
    // Выполняем операцию: assert!(state.begin_switch().is_err());.
    assert!(state.begin_switch().is_err());
    // Выполняем операцию: state.end_switch();.
    state.end_switch();
    // Выполняем операцию: assert!(state.begin_switch().is_ok());.
    assert!(state.begin_switch().is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_reset_clears_active_tunnel.
fn test_state_reset_clears_active_tunnel() {
    // Объявляем переменную state .
    let state = VpnState::new();

    // Проверяем условие: let Ok(mut slot) = state.active_interface.lock() {.
    if let Ok(mut slot) = state.active_interface.lock() {
        *slot = Some("wg0".to_string());
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = state.kill_switch_on.lock() {.
    if let Ok(mut slot) = state.kill_switch_on.lock() {
        *slot = true;
        // Закрываем блок.
    }

    // Выполняем операцию: assert_eq!(state.active().as_deref(), Some("wg0"));.
    assert_eq!(state.active().as_deref(), Some("wg0"));

    // Выполняем операцию: state.reset();.
    state.reset();

    // Выполняем операцию: assert!(state.active().is_none());.
    assert!(state.active().is_none());
    // Выполняем операцию: assert!(!state.
    assert!(!state
        // Выполняем операцию: .kill_switch_on.
        .kill_switch_on
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .map(|value| *value).
        .map(|value| *value)
        // Выполняем операцию: .unwrap_or(true));.
        .unwrap_or(true));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_wg_show_output_is_shared_between_modules.
fn test_parse_wg_show_output_is_shared_between_modules() {
    // Объявляем переменную info .
    let info = parse_wg_show_output("latest handshake: 1 minute ago\n");

    // Выполняем операцию: assert_eq!(info.seconds_ago, Some(60));.
    assert_eq!(info.seconds_ago, Some(60));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_info_from_file_rejects_invalid_config.
fn test_info_from_file_rejects_invalid_config() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-invalid");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Объявляем переменную path .
    let path = dir.join("broken.conf");
    // Выполняем операцию: std::fs::write(&path, "не конфиг").unwrap();.
    std::fs::write(&path, "не конфиг").unwrap();

    // Выполняем операцию: assert!(info_from_file(&path, 0).is_err());.
    assert!(info_from_file(&path, 0).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_info_from_file_reads_valid_config.
fn test_info_from_file_reads_valid_config() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-valid");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Объявляем переменную path .
    let path = dir.join("nl.conf");
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: &path,.
        &path,
        // Выполняем операцию: "[Interface]\nPrivateKey = k\nAddress = 10.0.0.2/32\n\n.
        "[Interface]\nPrivateKey = k\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = p\nAllowedIPs = 0.0.0.0/0\nEndpoint = 1.2.3.4:51820\n",
    // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную info .
    let info = info_from_file(&path, 5).unwrap();

    // Выполняем операцию: assert_eq!(info.id, "nl");.
    assert_eq!(info.id, "nl");
    // Выполняем операцию: assert_eq!(info.endpoint, "1.2.3.4:51820");.
    assert_eq!(info.endpoint, "1.2.3.4:51820");
    // Выполняем операцию: assert_eq!(info.address, vec!["10.0.0.2/32"]);.
    assert_eq!(info.address, vec!["10.0.0.2/32"]);
    // Выполняем операцию: assert!(info.size > 0);.
    assert!(info.size > 0);
    // Выполняем операцию: assert_eq!(info.imported_at, 5);.
    assert_eq!(info.imported_at, 5);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Объявляем константу VALID_CONF.
const VALID_CONF: &str = "[Interface]\nPrivateKey = k\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = p\nAllowedIPs = 0.0.0.0/0\nEndpoint = 5.6.7.8:51820\n";

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_config_text_creates_file.
fn test_import_config_text_creates_file() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-text-import");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);

    // Объявляем переменную info .
    let info = import_config_text_into(&dir, VALID_CONF, 7).unwrap();

    // Выполняем операцию: assert_eq!(info.endpoint, "5.6.7.8:51820");.
    assert_eq!(info.endpoint, "5.6.7.8:51820");
    // Выполняем операцию: assert_eq!(info.imported_at, 7_000);.
    assert_eq!(info.imported_at, 7_000);
    // Выполняем операцию: assert!(info.name.starts_with("pasted-"), "имя: {}", in.
    assert!(info.name.starts_with("pasted-"), "имя: {}", info.name);
    // Выполняем операцию: assert!(Path::new(&info.path).is_file(), "файл должен с.
    assert!(Path::new(&info.path).is_file(), "файл должен существовать");

    // Объявляем переменную written .
    let written = std::fs::read_to_string(&info.path).unwrap();

    // Выполняем операцию: assert_eq!(written, VALID_CONF);.
    assert_eq!(written, VALID_CONF);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_config_text_rejects_empty.
fn test_import_config_text_rejects_empty() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-text-empty");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);

    // Объявляем переменную error .
    let error = import_config_text_into(&dir, "   \n  ", 1).unwrap_err();

    // Выполняем операцию: assert!(error.to_string().contains("пуст"), "{}", error.
    assert!(error.to_string().contains("пуст"), "{}", error);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_config_text_rejects_garbage.
fn test_import_config_text_rejects_garbage() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-text-garbage");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);

    // Объявляем переменную error .
    let error = import_config_text_into(&dir, "просто текст без секций", 1).unwrap_err();

    // Выполняем операцию: assert!(error.to_string().contains("Невалидный"), "{}",.
    assert!(error.to_string().contains("Невалидный"), "{}", error);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_config_text_rejects_oversized.
fn test_import_config_text_rejects_oversized() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-text-big");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);

    // Объявляем переменную huge .
    let huge = "x".repeat(MAX_VPN_CONF_BYTES as usize + 1);
    // Объявляем переменную error .
    let error = import_config_text_into(&dir, &huge, 1).unwrap_err();

    // Выполняем операцию: assert!(error.to_string().contains("больше"), "{}", err.
    assert!(error.to_string().contains("больше"), "{}", error);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pasted_config_name_sanitizes_label.
fn test_pasted_config_name_sanitizes_label() {
    // Объявляем переменную name .
    let name = pasted_config_name(VALID_CONF);
    // Объявляем переменную stem .
    let stem = name.strip_suffix(".conf").unwrap_or("");

    // Выполняем операцию: assert!(!stem.is_empty(), "{name}");.
    assert!(!stem.is_empty(), "{name}");
    // Выполняем операцию: assert!(stem.starts_with("pasted-"), "{name}");.
    assert!(stem.starts_with("pasted-"), "{name}");
    // Выполняем операцию: assert!(!stem.contains(':'), "двоеточие недопустимо: {n.
    assert!(!stem.contains(':'), "двоеточие недопустимо: {name}");
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: !stem.contains('.'),.
        !stem.contains('.'),
        // Выполняем операцию: "точка недопустима внутри имени: {name}".
        "точка недопустима внутри имени: {name}" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(!stem.contains('/'), "слэш недопустим: {name}").
    assert!(!stem.contains('/'), "слэш недопустим: {name}");
    // Закрываем блок.
}
