use super::*;

fn encode(value: &str) -> String {
    base64::engine::general_purpose::STANDARD.encode(value)
}

#[test]
fn test_parse_vless_link() {
    let link = "vless://11111111-2222-3333-4444-555555555555@example.com:443?type=tcp&security=reality#%D0%9D%D0%B8%D0%B4%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B4%D1%8B";
    let server = parse_link(link).expect("vless должен разобраться");

    assert_eq!(server.protocol, "vless");
    assert_eq!(server.host, "example.com");
    assert_eq!(server.port, 443);
    assert_eq!(server.name, "Нидерланды");
    assert!(server.id.starts_with("srv_"));
}

#[test]
fn test_parse_real_reality_link_with_plus_name() {
    let link = "vless://a0aa9819-ea0d-4134-8371-bae21584ffdd@uk-24.gnodes.club:443?type=tcp&headerType=none&security=reality&fp=firefox&sni=dl.google.com&pbk=HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM&alpn=h2#%F0%9F%87%AC%F0%9F%87%A7+%D0%A5%D0%BE%D0%B3%D0%B2%D0%B0%D1%80%D1%82%D1%81+%F0%9F%A7%99";
    let server = parse_link(link).expect("ссылка пользователя должна разобраться");

    assert_eq!(server.protocol, "vless");
    assert_eq!(server.host, "uk-24.gnodes.club");
    assert_eq!(server.port, 443);
    assert_eq!(server.name, "🇬🇧 Хогвартс 🧙");
}

#[test]
fn test_parse_plus_in_name_becomes_space() {
    let link = "vless://uuid@example.com:443#Hello+World";
    let server = parse_link(link).expect("плюс в имени");

    assert_eq!(server.name, "Hello World");
}

#[test]
fn test_parse_vless_without_name_uses_host() {
    let link = "vless://uuid@1.2.3.4:8443?security=tls";
    let server = parse_link(link).expect("vless без имени");

    assert_eq!(server.name, "1.2.3.4:8443");
}

#[test]
fn test_parse_vmess_link() {
    let payload = serde_json::json!({
        "v": "2",
        "ps": "Токио",
        "add": "jp.example.com",
        "port": "443",
        "id": "11111111-2222-3333-4444-555555555555",
        "aid": "0",
        "net": "ws",
        "tls": "tls"
    });
    let link = format!("vmess://{}", encode(&payload.to_string()));
    let server = parse_link(&link).expect("vmess должен разобраться");

    assert_eq!(server.protocol, "vmess");
    assert_eq!(server.host, "jp.example.com");
    assert_eq!(server.port, 443);
    assert_eq!(server.name, "Токио");
}

#[test]
fn test_parse_vmess_numeric_port() {
    let payload = serde_json::json!({
        "ps": "US",
        "add": "us.example.com",
        "port": 8443,
        "id": "uuid"
    });
    let link = format!("vmess://{}", encode(&payload.to_string()));
    let server = parse_link(&link).expect("vmess с числовым портом");

    assert_eq!(server.port, 8443);
}

#[test]
fn test_parse_trojan_link() {
    let link = "trojan://secret@de.example.com:443?security=tls#%D0%93%D0%B5%D1%80%D0%BC%D0%B0%D0%BD%D0%B8%D1%8F";
    let server = parse_link(link).expect("trojan должен разобраться");

    assert_eq!(server.protocol, "trojan");
    assert_eq!(server.host, "de.example.com");
    assert_eq!(server.port, 443);
    assert_eq!(server.name, "Германия");
}

#[test]
fn test_parse_shadowsocks_sip002() {
    let credentials = encode("aes-256-gcm:password123");
    let link = format!("ss://{credentials}@ss.example.com:8388#%D0%A1%D0%A8%D0%90");
    let server = parse_link(&link).expect("ss должен разобраться");

    assert_eq!(server.protocol, "ss");
    assert_eq!(server.host, "ss.example.com");
    assert_eq!(server.port, 8388);
    assert_eq!(server.name, "США");
}

#[test]
fn test_parse_shadowsocks_legacy_base64() {
    let encoded = encode("aes-256-gcm:password@ss.example.com:8388");
    let link = format!("ss://{encoded}#Legacy");
    let server = parse_link(&link).expect("legacy ss должен разобраться");

    assert_eq!(server.host, "ss.example.com");
    assert_eq!(server.port, 8388);
}

#[test]
fn test_parse_ipv6_host() {
    let link = "vless://uuid@[2001:db8::1]:443?security=tls";
    let server = parse_link(link).expect("IPv6 должен разобраться");

    assert_eq!(server.host, "2001:db8::1");
    assert_eq!(server.port, 443);
}

#[test]
fn test_rejects_unknown_scheme() {
    assert!(parse_link("http://example.com").is_none());
    assert!(parse_link("wg://example.com:51820").is_none());
    assert!(parse_link("not a link").is_none());
}

#[test]
fn test_rejects_missing_port() {
    assert!(parse_link("vless://uuid@example.com").is_none());
    assert!(parse_link("vless://uuid@example.com:0").is_none());
    assert!(parse_link("vless://uuid@example.com:99999").is_none());
}

#[test]
fn test_parse_subscription_plain_lines() {
    let body = concat!(
        "vless://uuid@a.example.com:443#A\n",
        "\n",
        "# комментарий\n",
        "trojan://pass@b.example.com:8443#B\n"
    );
    let servers = parse_subscription(body);

    assert_eq!(servers.len(), 1);
    assert_eq!(servers[0].name, "A");
}

#[test]
fn test_parse_subscription_base64_body() {
    let body = encode("vless://uuid@a.example.com:443#A\ntrojan://pass@b.example.com:8443#B");
    let servers = parse_subscription(&body);

    assert_eq!(servers.len(), 1);
    assert_eq!(servers[0].name, "A");
}

#[test]
fn test_parse_subscription_url_safe_base64() {
    let raw = "vless://uuid@a.example.com:443#A/B+C";
    let body = base64::engine::general_purpose::URL_SAFE.encode(raw);
    let servers = parse_subscription(&body);

    assert_eq!(servers.len(), 1);
}

#[test]
fn test_parse_subscription_deduplicates() {
    let body = "vless://uuid@a.example.com:443#A\nvless://uuid@a.example.com:443#A";
    let servers = parse_subscription(body);

    assert_eq!(servers.len(), 1);
}

#[test]
fn test_parse_subscription_skips_garbage() {
    let body = "мусор\nещё мусор\nvless://uuid@a.example.com:443#A";
    let servers = parse_subscription(body);

    assert_eq!(servers.len(), 1);
}

#[test]
fn test_validate_subscription_url() {
    assert!(validate_subscription_url("https://sub.example.com/abc").is_ok());
    assert!(validate_subscription_url("http://sub.example.com/abc").is_ok());
    assert!(validate_subscription_url("ftp://sub.example.com").is_err());
    assert!(validate_subscription_url("https://sub.example.com/a b").is_err());
    assert!(validate_subscription_url("").is_err());
}

#[test]
fn test_body_size_limit() {
    assert!(body_size_ok(1024));
    assert!(!body_size_ok(5 * 1024 * 1024));
}

#[test]
fn test_query_map() {
    let map = parse_query_map("vless://uuid@host:443?type=ws&security=reality&sni=example.com");

    assert_eq!(map.get("type"), Some(&"ws".to_string()));
    assert_eq!(map.get("security"), Some(&"reality".to_string()));
    assert_eq!(map.get("sni"), Some(&"example.com".to_string()));
}

#[test]
fn test_ss_credentials() {
    let credentials = encode("aes-256-gcm:password123");
    let link = format!("ss://{credentials}@ss.example.com:8388#X");
    let parsed = parse_ss_credentials(&link).expect("ss credentials");

    assert_eq!(parsed.0, "aes-256-gcm");
    assert_eq!(parsed.1, "password123");
}

#[test]
fn test_vmess_payload_roundtrip() {
    let payload = serde_json::json!({"ps": "X", "add": "h", "port": "1", "id": "i"});
    let link = format!("vmess://{}", encode(&payload.to_string()));
    let value = decode_vmess_payload(&link).expect("payload");

    assert_eq!(value.get("add").and_then(|v| v.as_str()), Some("h"));
}