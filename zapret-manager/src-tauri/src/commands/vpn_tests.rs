use super::*;

use crate::commands::vpn_config::parse_endpoint;
use crate::commands::vpn_store::info_from_file;
use crate::commands::vpn_wireguard::parse_wg_show_output;

#[test]
fn test_parse_endpoint_is_reachable_from_vpn_module() {
    assert_eq!(
        parse_endpoint("1.2.3.4:51820"),
        Some(("1.2.3.4".to_string(), 51820))
    );
}

#[test]
fn test_vpn_status_default_is_disconnected() {
    let status = VpnStatus::default();

    assert_eq!(status.state, "disconnected");
    assert!(status.interface.is_none());
    assert!(status.error.is_none());
}

#[test]
fn test_vpn_status_from_fresh_handshake_is_connected() {
    let info = HandshakeInfo {
        seconds_ago: Some(4),
        bytes_in: 1024,
        bytes_out: 512,
        endpoint: "1.2.3.4:51820".to_string(),
    };

    let status = VpnStatus::from_info("mullvad-nl", &info, now_secs() - 10);

    assert_eq!(status.state, "connected");
    assert_eq!(status.interface.as_deref(), Some("mullvad-nl"));
    assert_eq!(status.endpoint.as_deref(), Some("1.2.3.4:51820"));
    assert_eq!(status.bytes_in, Some(1024));
    assert_eq!(status.bytes_out, Some(512));
    assert!(status.handshake_at.is_some());
}

#[test]
fn test_vpn_status_from_stale_handshake_is_connecting() {
    let info = HandshakeInfo {
        seconds_ago: Some(600),
        ..HandshakeInfo::default()
    };

    let status = VpnStatus::from_info("mullvad-nl", &info, now_secs());

    assert_eq!(status.state, "connecting");
}

#[test]
fn test_vpn_status_serializes_as_camel_case() {
    let json = serde_json::to_string(&VpnStatus::default()).unwrap();

    assert!(json.contains("\"uptimeSec\""));
    assert!(json.contains("\"bytesIn\""));
}

#[test]
fn test_vpn_config_info_serializes_as_camel_case() {
    let info = VpnConfigInfo {
        id: "a".to_string(),
        name: "a".to_string(),
        path: "C:/a.conf".to_string(),
        endpoint: "1.2.3.4:1".to_string(),
        address: vec!["10.0.0.2/32".to_string()],
        dns: vec![],
        allowed_ips: vec!["0.0.0.0/0".to_string()],
        size: 42,
        imported_at: 7,
    };

    let json = serde_json::to_string(&info).unwrap();

    assert!(json.contains("\"allowedIps\""));
    assert!(json.contains("\"importedAt\""));
    assert!(!json.contains("\"allowed_ips\""));
}

#[test]
fn test_state_rejects_double_switch() {
    let state = VpnState::new();

    assert!(state.begin_switch().is_ok());
    assert!(state.begin_switch().is_err());
    state.end_switch();
    assert!(state.begin_switch().is_ok());
}

#[test]
fn test_state_reset_clears_active_tunnel() {
    let state = VpnState::new();

    if let Ok(mut slot) = state.active_interface.lock() {
        *slot = Some("wg0".to_string());
    }

    if let Ok(mut slot) = state.kill_switch_on.lock() {
        *slot = true;
    }

    assert_eq!(state.active().as_deref(), Some("wg0"));

    state.reset();

    assert!(state.active().is_none());
    assert!(
        !state
            .kill_switch_on
            .lock()
            .ok()
            .map(|value| *value)
            .unwrap_or(true)
    );
}

#[test]
fn test_parse_wg_show_output_is_shared_between_modules() {
    let info = parse_wg_show_output("latest handshake: 1 minute ago\n");

    assert_eq!(info.seconds_ago, Some(60));
}

#[test]
fn test_info_from_file_rejects_invalid_config() {
    let dir = std::env::temp_dir().join("zapret-vpn-invalid");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let path = dir.join("broken.conf");
    std::fs::write(&path, "не конфиг").unwrap();

    assert!(info_from_file(&path, 0).is_err());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_info_from_file_reads_valid_config() {
    let dir = std::env::temp_dir().join("zapret-vpn-valid");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let path = dir.join("nl.conf");
    std::fs::write(
        &path,
        "[Interface]\nPrivateKey = k\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = p\nAllowedIPs = 0.0.0.0/0\nEndpoint = 1.2.3.4:51820\n",
    )
    .unwrap();

    let info = info_from_file(&path, 5).unwrap();

    assert_eq!(info.id, "nl");
    assert_eq!(info.endpoint, "1.2.3.4:51820");
    assert_eq!(info.address, vec!["10.0.0.2/32"]);
    assert!(info.size > 0);
    assert_eq!(info.imported_at, 5);

    let _ = std::fs::remove_dir_all(&dir);
}