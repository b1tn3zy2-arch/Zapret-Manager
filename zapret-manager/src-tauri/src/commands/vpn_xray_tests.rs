use super::*;
use crate::commands::vpn_subscription::parse_link;

fn server() -> SubscriptionServer {
    parse_link("vless://uuid@example.com:443?security=tls&sni=example.com#Test")
        .expect("ссылка")
}

#[test]
fn test_state_is_not_running_by_default() {
    let state = XrayState::new();

    assert!(!state.is_running());
    assert!(state.active().is_none());
    assert_eq!(state.connected_at(), 0);
    assert!(state.pid().is_none());
}

#[test]
fn test_state_reset_is_idempotent() {
    let state = XrayState::new();

    state.reset();
    state.reset();

    assert!(state.active().is_none());
}

#[test]
fn test_find_core_in_empty_dir() {
    let dir = std::env::temp_dir().join("zapret-core-empty");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    assert!(find_core_in(&dir).is_none());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_find_core_in_case_insensitive() {
    let dir = std::env::temp_dir().join("zapret-core-case");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(dir.join("XRAY.EXE"), b"stub").unwrap();

    let found = find_core_in(&dir).expect("должен найтись");

    assert_eq!(
        found.file_name().and_then(|name| name.to_str()),
        Some("XRAY.EXE")
    );

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_core_ports_are_loopback_safe() {
    let ports = [DEFAULT_SOCKS_PORT, DEFAULT_HTTP_PORT];

    assert_ne!(ports[0], ports[1]);
    assert!(ports.iter().all(|port| *port > 1024));
}

#[test]
fn test_core_download_url_is_https_github() {
    assert!(CORE_DOWNLOAD_URL.starts_with("https://github.com/"));
    assert!(CORE_DOWNLOAD_URL.ends_with(".zip"));
}

#[test]
fn test_write_config_creates_valid_json() {
    let path = write_config(&server()).expect("конфиг должен записаться");
    let text = std::fs::read_to_string(&path).unwrap();
    let value: serde_json::Value = serde_json::from_str(&text).unwrap();

    assert_eq!(value["outbounds"][0]["protocol"], "vless");
    assert_eq!(value["inbounds"][0]["port"], DEFAULT_SOCKS_PORT);

    let _ = std::fs::remove_file(&path);
}

#[test]
fn test_spawn_without_core_fails_cleanly() {
    let dir = core_dir().unwrap();
    let target = dir.join(CORE_EXE);
    let existed = target.is_file();

    if !existed {
        let config = write_config(&server()).unwrap();
        let result = spawn_core(&config);

        assert!(result.is_err());

        let _ = std::fs::remove_file(&config);
    }
}