use std::path::Path;

use super::*;

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

#[test]
fn test_parse_config_reads_all_fields() {
    let parsed = parse_config(VALID).unwrap();

    assert_eq!(parsed.address, vec!["10.13.13.2/32", "fd00::2/128"]);
    assert_eq!(parsed.dns, vec!["1.1.1.1", "1.0.0.1"]);
    assert_eq!(parsed.endpoint, "185.65.134.1:51820");
    assert_eq!(parsed.allowed_ips, vec!["0.0.0.0/0", "::/0"]);
    assert!(parsed.has_private_key);
    assert!(parsed.has_public_key);
}

#[test]
fn test_parse_config_ignores_comments_and_blank_lines() {
    let parsed = parse_config(
        "# комментарий\n\n[Interface]\nPrivateKey = key\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = peer # хвост\nAllowedIPs = 0.0.0.0/0\nEndpoint = host:51820\n",
    )
    .unwrap();

    assert_eq!(parsed.endpoint, "host:51820");
}

#[test]
fn test_parse_config_is_case_insensitive_for_keys() {
    let parsed = parse_config(
        "[Interface]\nprivatekey = key\naddress = 10.0.0.2/32\n\n[Peer]\npublickey = peer\nallowedips = 0.0.0.0/0\nendpoint = host:51820\n",
    )
    .unwrap();

    assert!(parsed.has_private_key);
    assert!(parsed.has_public_key);
}

#[test]
fn test_parse_config_rejects_missing_interface() {
    let error = parse_config("[Peer]\nPublicKey = x\n").unwrap_err();

    assert_eq!(error.to_string(), "Нет секции [Interface]");
}

#[test]
fn test_parse_config_rejects_missing_peer() {
    let error = parse_config("[Interface]\nPrivateKey = x\n").unwrap_err();

    assert_eq!(error.to_string(), "Нет секции [Peer]");
}

#[test]
fn test_parse_config_rejects_missing_keys() {
    assert_eq!(
        parse_config("[Interface]\nAddress = 10.0.0.2/32\n[Peer]\nPublicKey = x\n")
            .unwrap_err()
            .to_string(),
        "Не указан PrivateKey"
    );
    assert_eq!(
        parse_config("[Interface]\nPrivateKey = x\n[Peer]\nPublicKey = y\n")
            .unwrap_err()
            .to_string(),
        "Не указан Address"
    );
    assert_eq!(
        parse_config("[Interface]\nPrivateKey = x\nAddress = 10.0.0.2/32\n[Peer]\nPublicKey = y\n")
            .unwrap_err()
            .to_string(),
        "Не указан Endpoint"
    );
    assert_eq!(
        parse_config("[Interface]\nPrivateKey = x\nAddress = 10.0.0.2/32\n[Peer]\nPublicKey = y\nEndpoint = h:1\n")
            .unwrap_err()
            .to_string(),
        "Не указан AllowedIPs"
    );
}

#[test]
fn test_parse_config_rejects_plain_text_file() {
    assert!(parse_config("просто текст без секций").is_err());
}

#[test]
fn test_tunnel_name_drops_extension() {
    assert_eq!(tunnel_name(Path::new(r"C:\vpn\configs\mullvad-nl.conf")), "mullvad-nl");
    assert_eq!(tunnel_name(Path::new("мой-конфиг.conf")), "мой-конфиг");
}

#[test]
fn test_parse_endpoint_splits_host_and_port() {
    assert_eq!(
        parse_endpoint("185.65.134.1:51820"),
        Some(("185.65.134.1".to_string(), 51820))
    );
    assert_eq!(parse_endpoint("host"), None);
    assert_eq!(parse_endpoint("host:0"), None);
    assert_eq!(parse_endpoint("host:abc"), None);
}

#[test]
fn test_parse_sections_keeps_last_value_for_key() {
    let sections = parse_sections("[Interface]\nAddress = 10.0.0.1/32\nAddress = 10.0.0.2/32\n");

    assert_eq!(
        sections.get("Interface").and_then(|entry| entry.get("address")),
        Some(&"10.0.0.2/32".to_string())
    );
}