// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: super::*;.
use super::*;

// Объявляем константу VALID.
const VALID: &str = r#"
[Interface]
PrivateKey = aPrivateKey0123456789abcdef=
Address = 10.13.13.2/32, fd00::2/128
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = bPublicKey9876543210fedcba=
PresharedKey = cPreshared
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 185.65.134.1:51820
"#;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_reads_all_fields.
fn test_parse_config_reads_all_fields() {
    // Объявляем переменную parsed .
    let parsed = parse_config(VALID).unwrap();

    // Выполняем операцию: assert_eq!(parsed.address, vec!["10.13.13.2/32", "fd00:.
    assert_eq!(parsed.address, vec!["10.13.13.2/32", "fd00::2/128"]);
    // Выполняем операцию: assert_eq!(parsed.dns, vec!["1.1.1.1", "1.0.0.1"]);.
    assert_eq!(parsed.dns, vec!["1.1.1.1", "1.0.0.1"]);
    // Выполняем операцию: assert_eq!(parsed.endpoint, "185.65.134.1:51820");.
    assert_eq!(parsed.endpoint, "185.65.134.1:51820");
    // Выполняем операцию: assert_eq!(parsed.allowed_ips, vec!["0.0.0.0/0", "::/0".
    assert_eq!(parsed.allowed_ips, vec!["0.0.0.0/0", "::/0"]);
    // Выполняем операцию: assert!(parsed.has_private_key);.
    assert!(parsed.has_private_key);
    // Выполняем операцию: assert!(parsed.has_public_key);.
    assert!(parsed.has_public_key);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_ignores_comments_and_blank_lines.
fn test_parse_config_ignores_comments_and_blank_lines() {
    // Объявляем переменную parsed .
    let parsed = parse_config(
        // Выполняем операцию: "# комментарий\n\n[Interface]\nPrivateKey = key\nAddres.
        "# комментарий\n\n[Interface]\nPrivateKey = key\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = peer # хвост\nAllowedIPs = 0.0.0.0/0\nEndpoint = host:51820\n",
    // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert_eq!(parsed.endpoint, "host:51820");.
    assert_eq!(parsed.endpoint, "host:51820");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_is_case_insensitive_for_keys.
fn test_parse_config_is_case_insensitive_for_keys() {
    // Объявляем переменную parsed .
    let parsed = parse_config(
        // Выполняем операцию: "[Interface]\nprivatekey = key\naddress = 10.0.0.2/32\n.
        "[Interface]\nprivatekey = key\naddress = 10.0.0.2/32\n\n[Peer]\npublickey = peer\nallowedips = 0.0.0.0/0\nendpoint = host:51820\n",
    // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert!(parsed.has_private_key);.
    assert!(parsed.has_private_key);
    // Выполняем операцию: assert!(parsed.has_public_key);.
    assert!(parsed.has_public_key);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_rejects_missing_interface.
fn test_parse_config_rejects_missing_interface() {
    // Объявляем переменную error .
    let error = parse_config("[Peer]\nPublicKey = x\n").unwrap_err();

    // Выполняем операцию: assert_eq!(error.to_string(), "Нет секции [Interface]").
    assert_eq!(error.to_string(), "Нет секции [Interface]");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_rejects_missing_peer.
fn test_parse_config_rejects_missing_peer() {
    // Объявляем переменную error .
    let error = parse_config("[Interface]\nPrivateKey = x\n").unwrap_err();

    // Выполняем операцию: assert_eq!(error.to_string(), "Нет секции [Peer]");.
    assert_eq!(error.to_string(), "Нет секции [Peer]");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_rejects_missing_keys.
fn test_parse_config_rejects_missing_keys() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_config("[Interface]\nAddress = 10.0.0.2/32\n[Peer.
        parse_config("[Interface]\nAddress = 10.0.0.2/32\n[Peer]\nPublicKey = x\n")
            // Выполняем операцию: .unwrap_err().
            .unwrap_err()
            // Выполняем операцию: .to_string(),.
            .to_string(),
        // Выполняем операцию: "Не указан PrivateKey".
        "Не указан PrivateKey" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_config("[Interface]\nPrivateKey = x\n[Peer]\nPubl.
        parse_config("[Interface]\nPrivateKey = x\n[Peer]\nPublicKey = y\n")
            // Выполняем операцию: .unwrap_err().
            .unwrap_err()
            // Выполняем операцию: .to_string(),.
            .to_string(),
        // Выполняем операцию: "Не указан Address".
        "Не указан Address" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_config("[Interface]\nPrivateKey = x\nAddress = 10.
        parse_config("[Interface]\nPrivateKey = x\nAddress = 10.0.0.2/32\n[Peer]\nPublicKey = y\n")
            // Выполняем операцию: .unwrap_err().
            .unwrap_err()
            // Выполняем операцию: .to_string(),.
            .to_string(),
        // Выполняем операцию: "Не указан Endpoint".
        "Не указан Endpoint" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_config("[Interface]\nPrivateKey = x\nAddress = 10.
        parse_config("[Interface]\nPrivateKey = x\nAddress = 10.0.0.2/32\n[Peer]\nPublicKey = y\nEndpoint = h:1\n")
            // Выполняем операцию: .unwrap_err().
            .unwrap_err()
            // Выполняем операцию: .to_string(),.
            .to_string(),
        // Выполняем операцию: "Не указан AllowedIPs".
        "Не указан AllowedIPs"
    // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_rejects_plain_text_file.
fn test_parse_config_rejects_plain_text_file() {
    // Выполняем операцию: assert!(parse_config("просто текст без секций").is_err(.
    assert!(parse_config("просто текст без секций").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tunnel_name_drops_extension.
fn test_tunnel_name_drops_extension() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: tunnel_name(Path::new(r"C:\vpn\configs\mullvad-nl.conf".
        tunnel_name(Path::new(r"C:\vpn\configs\mullvad-nl.conf")),
        // Выполняем операцию: "mullvad-nl".
        "mullvad-nl" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(tunnel_name(Path::new("мой-конфиг.conf")), ".
    assert_eq!(tunnel_name(Path::new("мой-конфиг.conf")), "мой-конфиг");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_endpoint_splits_host_and_port.
fn test_parse_endpoint_splits_host_and_port() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_endpoint("185.65.134.1:51820"),.
        parse_endpoint("185.65.134.1:51820"),
        // Выполняем операцию: Some(("185.65.134.1".to_string(), 51820)).
        Some(("185.65.134.1".to_string(), 51820)) // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(parse_endpoint("host"), None);.
    assert_eq!(parse_endpoint("host"), None);
    // Выполняем операцию: assert_eq!(parse_endpoint("host:0"), None);.
    assert_eq!(parse_endpoint("host:0"), None);
    // Выполняем операцию: assert_eq!(parse_endpoint("host:abc"), None);.
    assert_eq!(parse_endpoint("host:abc"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_sections_keeps_last_value_for_key.
fn test_parse_sections_keeps_last_value_for_key() {
    // Объявляем переменную sections .
    let sections = parse_sections("[Interface]\nAddress = 10.0.0.1/32\nAddress = 10.0.0.2/32\n");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: sections.
        sections
            // Выполняем операцию: .get("Interface").
            .get("Interface")
            // Выполняем операцию: .and_then(|entry| entry.get("address")),.
            .and_then(|entry| entry.get("address")),
        // Выполняем операцию: Some(&"10.0.0.2/32".to_string()).
        Some(&"10.0.0.2/32".to_string()) // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}
