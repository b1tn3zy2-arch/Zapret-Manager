use super::*;

const SAMPLE: &str = "interface: wg0
  public key: aPublicKey=
  private key: (hidden)
  listening port: 51820

peer: bPublicKey=
  endpoint: 185.65.134.1:51820
  allowed ips: 0.0.0.0/0
  latest handshake: 12 seconds ago
  transfer: 1.21 MiB received, 812.50 KiB sent
  persistent keepalive: every 25 seconds
";

#[test]
fn test_parse_wg_show_output_reads_all_metrics() {
    let info = parse_wg_show_output(SAMPLE);

    assert_eq!(info.seconds_ago, Some(12));
    assert_eq!(info.bytes_in, 1_268_776);
    assert_eq!(info.bytes_out, 832_000);
    assert_eq!(info.endpoint, "185.65.134.1:51820");
}

#[test]
fn test_parse_handshake_seconds_scales_units() {
    assert_eq!(parse_handshake_seconds("3 seconds ago"), Some(3));
    assert_eq!(parse_handshake_seconds("2 minutes ago"), Some(120));
    assert_eq!(parse_handshake_seconds("1 hour ago"), Some(3600));
    assert_eq!(parse_handshake_seconds("garbage"), None);
}

#[test]
fn test_parse_size_handles_units() {
    assert_eq!(parse_size("512 B"), 512);
    assert_eq!(parse_size("1.00 KiB"), 1024);
    assert_eq!(parse_size("2.50 MiB"), 2_621_440);
    assert_eq!(parse_size("1 GiB"), 1_073_741_824);
    assert_eq!(parse_size("nope"), 0);
}

#[test]
fn test_parse_wg_show_output_handles_empty_input() {
    let info = parse_wg_show_output("");

    assert_eq!(info.seconds_ago, None);
    assert_eq!(info.bytes_in, 0);
    assert_eq!(info.bytes_out, 0);
    assert!(info.endpoint.is_empty());
}

#[test]
fn test_install_and_uninstall_arguments() {
    let path = std::path::Path::new(r"C:\vpn\configs\mullvad-nl.conf");

    assert_eq!(
        install_tunnel_arguments(path),
        vec![
            "/installtunnelservice".to_string(),
            path.to_string_lossy().to_string()
        ]
    );
    assert_eq!(
        uninstall_tunnel_arguments("mullvad-nl"),
        vec!["/uninstalltunnelservice".to_string(), "mullvad-nl".to_string()]
    );
    assert_eq!(show_arguments("wg0"), vec!["show".to_string(), "wg0".to_string()]);
}

#[test]
fn test_detect_returns_none_when_absent() {
    if candidate_dirs().is_empty() {
        assert!(detect_wireguard().is_none());
    }
}

#[test]
fn test_now_secs_is_plausible() {
    assert!(now_secs() > 1_700_000_000);
}