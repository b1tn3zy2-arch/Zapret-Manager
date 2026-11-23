// Подключаем модули: super::*;.
use super::*;

// Объявляем константу SAMPLE.
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

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_wg_show_output_reads_all_metrics.
fn test_parse_wg_show_output_reads_all_metrics() {
    // Объявляем переменную info .
    let info = parse_wg_show_output(SAMPLE);

    // Выполняем операцию: assert_eq!(info.seconds_ago, Some(12));.
    assert_eq!(info.seconds_ago, Some(12));
    // Выполняем операцию: assert_eq!(info.bytes_in, 1_268_776);.
    assert_eq!(info.bytes_in, 1_268_776);
    // Выполняем операцию: assert_eq!(info.bytes_out, 832_000);.
    assert_eq!(info.bytes_out, 832_000);
    // Выполняем операцию: assert_eq!(info.endpoint, "185.65.134.1:51820");.
    assert_eq!(info.endpoint, "185.65.134.1:51820");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_handshake_seconds_scales_units.
fn test_parse_handshake_seconds_scales_units() {
    // Выполняем операцию: assert_eq!(parse_handshake_seconds("3 seconds ago"), So.
    assert_eq!(parse_handshake_seconds("3 seconds ago"), Some(3));
    // Выполняем операцию: assert_eq!(parse_handshake_seconds("2 minutes ago"), So.
    assert_eq!(parse_handshake_seconds("2 minutes ago"), Some(120));
    // Выполняем операцию: assert_eq!(parse_handshake_seconds("1 hour ago"), Some(.
    assert_eq!(parse_handshake_seconds("1 hour ago"), Some(3600));
    // Выполняем операцию: assert_eq!(parse_handshake_seconds("garbage"), None);.
    assert_eq!(parse_handshake_seconds("garbage"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_size_handles_units.
fn test_parse_size_handles_units() {
    // Выполняем операцию: assert_eq!(parse_size("512 B"), 512);.
    assert_eq!(parse_size("512 B"), 512);
    // Выполняем операцию: assert_eq!(parse_size("1.00 KiB"), 1024);.
    assert_eq!(parse_size("1.00 KiB"), 1024);
    // Выполняем операцию: assert_eq!(parse_size("2.50 MiB"), 2_621_440);.
    assert_eq!(parse_size("2.50 MiB"), 2_621_440);
    // Выполняем операцию: assert_eq!(parse_size("1 GiB"), 1_073_741_824);.
    assert_eq!(parse_size("1 GiB"), 1_073_741_824);
    // Выполняем операцию: assert_eq!(parse_size("nope"), 0);.
    assert_eq!(parse_size("nope"), 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_wg_show_output_handles_empty_input.
fn test_parse_wg_show_output_handles_empty_input() {
    // Объявляем переменную info .
    let info = parse_wg_show_output("");

    // Выполняем операцию: assert_eq!(info.seconds_ago, None);.
    assert_eq!(info.seconds_ago, None);
    // Выполняем операцию: assert_eq!(info.bytes_in, 0);.
    assert_eq!(info.bytes_in, 0);
    // Выполняем операцию: assert_eq!(info.bytes_out, 0);.
    assert_eq!(info.bytes_out, 0);
    // Выполняем операцию: assert!(info.endpoint.is_empty());.
    assert!(info.endpoint.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_and_uninstall_arguments.
fn test_install_and_uninstall_arguments() {
    // Объявляем переменную path .
    let path = std::path::Path::new(r"C:\vpn\configs\mullvad-nl.conf");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: install_tunnel_arguments(path),.
        install_tunnel_arguments(path),
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "/installtunnelservice".to_string(),.
            "/installtunnelservice".to_string(),
            // Выполняем операцию: path.to_string_lossy().to_string().
            path.to_string_lossy().to_string() // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: uninstall_tunnel_arguments("mullvad-nl"),.
        uninstall_tunnel_arguments("mullvad-nl"),
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "/uninstalltunnelservice".to_string(),.
            "/uninstalltunnelservice".to_string(),
            // Выполняем операцию: "mullvad-nl".to_string().
            "mullvad-nl".to_string() // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: show_arguments("wg0"),.
        show_arguments("wg0"),
        // Выполняем операцию: vec!["show".to_string(), "wg0".to_string()].
        vec!["show".to_string(), "wg0".to_string()] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_detect_returns_none_when_absent.
fn test_detect_returns_none_when_absent() {
    // Проверяем условие: candidate_dirs().is_empty() {.
    if candidate_dirs().is_empty() {
        // Выполняем операцию: assert!(detect_wireguard().is_none());.
        assert!(detect_wireguard().is_none());
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_now_secs_is_plausible.
fn test_now_secs_is_plausible() {
    // Выполняем операцию: assert!(now_secs() > 1_700_000_000);.
    assert!(now_secs() > 1_700_000_000);
    // Закрываем блок.
}
