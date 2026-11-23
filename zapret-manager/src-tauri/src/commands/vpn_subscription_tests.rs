// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию encode.
fn encode(value: &str) -> String {
    // Выполняем операцию: base64::engine::general_purpose::STANDARD.encode(value).
    base64::engine::general_purpose::STANDARD.encode(value)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_vless_link.
fn test_parse_vless_link() {
    // Объявляем переменную link .
    let link = "vless://11111111-2222-3333-4444-555555555555@example.com:443?type=tcp&security=reality#%D0%9D%D0%B8%D0%B4%D0%B5%D1%80%D0%BB%D0%B0%D0%BD%D0%B4%D1%8B";
    // Объявляем переменную server .
    let server = parse_link(link).expect("vless должен разобраться");

    // Выполняем операцию: assert_eq!(server.protocol, "vless");.
    assert_eq!(server.protocol, "vless");
    // Выполняем операцию: assert_eq!(server.host, "example.com");.
    assert_eq!(server.host, "example.com");
    // Выполняем операцию: assert_eq!(server.port, 443);.
    assert_eq!(server.port, 443);
    // Выполняем операцию: assert_eq!(server.name, "Нидерланды");.
    assert_eq!(server.name, "Нидерланды");
    // Выполняем операцию: assert!(server.id.starts_with("srv_"));.
    assert!(server.id.starts_with("srv_"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_real_reality_link_with_plus_name.
fn test_parse_real_reality_link_with_plus_name() {
    // Объявляем переменную link .
    let link = "vless://a0aa9819-ea0d-4134-8371-bae21584ffdd@uk-24.gnodes.club:443?type=tcp&headerType=none&security=reality&fp=firefox&sni=dl.google.com&pbk=HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM&alpn=h2#%F0%9F%87%AC%F0%9F%87%A7+%D0%A5%D0%BE%D0%B3%D0%B2%D0%B0%D1%80%D1%82%D1%81+%F0%9F%A7%99";
    // Объявляем переменную server .
    let server = parse_link(link).expect("ссылка пользователя должна разобраться");

    // Выполняем операцию: assert_eq!(server.protocol, "vless");.
    assert_eq!(server.protocol, "vless");
    // Выполняем операцию: assert_eq!(server.host, "uk-24.gnodes.club");.
    assert_eq!(server.host, "uk-24.gnodes.club");
    // Выполняем операцию: assert_eq!(server.port, 443);.
    assert_eq!(server.port, 443);
    // Выполняем операцию: assert_eq!(server.name, "🇬🇧 Хогвартс 🧙");.
    assert_eq!(server.name, "🇬🇧 Хогвартс 🧙");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_plus_in_name_becomes_space.
fn test_parse_plus_in_name_becomes_space() {
    // Объявляем переменную link .
    let link = "vless://uuid@example.com:443#Hello+World";
    // Объявляем переменную server .
    let server = parse_link(link).expect("плюс в имени");

    // Выполняем операцию: assert_eq!(server.name, "Hello World");.
    assert_eq!(server.name, "Hello World");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_vless_without_name_uses_host.
fn test_parse_vless_without_name_uses_host() {
    // Объявляем переменную link .
    let link = "vless://uuid@1.2.3.4:8443?security=tls";
    // Объявляем переменную server .
    let server = parse_link(link).expect("vless без имени");

    // Выполняем операцию: assert_eq!(server.name, "1.2.3.4:8443");.
    assert_eq!(server.name, "1.2.3.4:8443");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_vmess_link.
fn test_parse_vmess_link() {
    // Объявляем переменную payload .
    let payload = serde_json::json!({
        // Выполняем операцию: "v": "2",.
        "v": "2",
        // Выполняем операцию: "ps": "Токио",.
        "ps": "Токио",
        // Выполняем операцию: "add": "jp.example.com",.
        "add": "jp.example.com",
        // Выполняем операцию: "port": "443",.
        "port": "443",
        // Выполняем операцию: "id": "11111111-2222-3333-4444-555555555555",.
        "id": "11111111-2222-3333-4444-555555555555",
        // Выполняем операцию: "aid": "0",.
        "aid": "0",
        // Выполняем операцию: "net": "ws",.
        "net": "ws",
        // Выполняем операцию: "tls": "tls".
        "tls": "tls"
    // Закрываем блок.
    });
    // Объявляем переменную link .
    let link = format!("vmess://{}", encode(&payload.to_string()));
    // Объявляем переменную server .
    let server = parse_link(&link).expect("vmess должен разобраться");

    // Выполняем операцию: assert_eq!(server.protocol, "vmess");.
    assert_eq!(server.protocol, "vmess");
    // Выполняем операцию: assert_eq!(server.host, "jp.example.com");.
    assert_eq!(server.host, "jp.example.com");
    // Выполняем операцию: assert_eq!(server.port, 443);.
    assert_eq!(server.port, 443);
    // Выполняем операцию: assert_eq!(server.name, "Токио");.
    assert_eq!(server.name, "Токио");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_vmess_numeric_port.
fn test_parse_vmess_numeric_port() {
    // Объявляем переменную payload .
    let payload = serde_json::json!({
        // Выполняем операцию: "ps": "US",.
        "ps": "US",
        // Выполняем операцию: "add": "us.example.com",.
        "add": "us.example.com",
        // Выполняем операцию: "port": 8443,.
        "port": 8443,
        // Выполняем операцию: "id": "uuid".
        "id": "uuid"
    // Закрываем блок.
    });
    // Объявляем переменную link .
    let link = format!("vmess://{}", encode(&payload.to_string()));
    // Объявляем переменную server .
    let server = parse_link(&link).expect("vmess с числовым портом");

    // Выполняем операцию: assert_eq!(server.port, 8443);.
    assert_eq!(server.port, 8443);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_trojan_link.
fn test_parse_trojan_link() {
    // Объявляем переменную link .
    let link = "trojan://secret@de.example.com:443?security=tls#%D0%93%D0%B5%D1%80%D0%BC%D0%B0%D0%BD%D0%B8%D1%8F";
    // Объявляем переменную server .
    let server = parse_link(link).expect("trojan должен разобраться");

    // Выполняем операцию: assert_eq!(server.protocol, "trojan");.
    assert_eq!(server.protocol, "trojan");
    // Выполняем операцию: assert_eq!(server.host, "de.example.com");.
    assert_eq!(server.host, "de.example.com");
    // Выполняем операцию: assert_eq!(server.port, 443);.
    assert_eq!(server.port, 443);
    // Выполняем операцию: assert_eq!(server.name, "Германия");.
    assert_eq!(server.name, "Германия");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_shadowsocks_sip002.
fn test_parse_shadowsocks_sip002() {
    // Объявляем переменную credentials .
    let credentials = encode("aes-256-gcm:password123");
    // Объявляем переменную link .
    let link = format!("ss://{credentials}@ss.example.com:8388#%D0%A1%D0%A8%D0%90");
    // Объявляем переменную server .
    let server = parse_link(&link).expect("ss должен разобраться");

    // Выполняем операцию: assert_eq!(server.protocol, "ss");.
    assert_eq!(server.protocol, "ss");
    // Выполняем операцию: assert_eq!(server.host, "ss.example.com");.
    assert_eq!(server.host, "ss.example.com");
    // Выполняем операцию: assert_eq!(server.port, 8388);.
    assert_eq!(server.port, 8388);
    // Выполняем операцию: assert_eq!(server.name, "США");.
    assert_eq!(server.name, "США");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_shadowsocks_legacy_base64.
fn test_parse_shadowsocks_legacy_base64() {
    // Объявляем переменную encoded .
    let encoded = encode("aes-256-gcm:password@ss.example.com:8388");
    // Объявляем переменную link .
    let link = format!("ss://{encoded}#Legacy");
    // Объявляем переменную server .
    let server = parse_link(&link).expect("legacy ss должен разобраться");

    // Выполняем операцию: assert_eq!(server.host, "ss.example.com");.
    assert_eq!(server.host, "ss.example.com");
    // Выполняем операцию: assert_eq!(server.port, 8388);.
    assert_eq!(server.port, 8388);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_ipv6_host.
fn test_parse_ipv6_host() {
    // Объявляем переменную link .
    let link = "vless://uuid@[2001:db8::1]:443?security=tls";
    // Объявляем переменную server .
    let server = parse_link(link).expect("IPv6 должен разобраться");

    // Выполняем операцию: assert_eq!(server.host, "2001:db8::1");.
    assert_eq!(server.host, "2001:db8::1");
    // Выполняем операцию: assert_eq!(server.port, 443);.
    assert_eq!(server.port, 443);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_rejects_unknown_scheme.
fn test_rejects_unknown_scheme() {
    // Выполняем операцию: assert!(parse_link("http://example.com").is_none());.
    assert!(parse_link("http://example.com").is_none());
    // Выполняем операцию: assert!(parse_link("wg://example.com:51820").is_none()).
    assert!(parse_link("wg://example.com:51820").is_none());
    // Выполняем операцию: assert!(parse_link("not a link").is_none());.
    assert!(parse_link("not a link").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_rejects_missing_port.
fn test_rejects_missing_port() {
    // Выполняем операцию: assert!(parse_link("vless://uuid@example.com").is_none(.
    assert!(parse_link("vless://uuid@example.com").is_none());
    // Выполняем операцию: assert!(parse_link("vless://uuid@example.com:0").is_non.
    assert!(parse_link("vless://uuid@example.com:0").is_none());
    // Выполняем операцию: assert!(parse_link("vless://uuid@example.com:99999").is.
    assert!(parse_link("vless://uuid@example.com:99999").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_plain_lines.
fn test_parse_subscription_plain_lines() {
    // Объявляем переменную body .
    let body = concat!(
        // Выполняем операцию: "vless://uuid@a.example.com:443#A\n",.
        "vless://uuid@a.example.com:443#A\n",
        // Выполняем операцию: "\n",.
        "\n",
        // Выполняем операцию: "# комментарий\n",.
        "# комментарий\n",
        // Выполняем операцию: "trojan://pass@b.example.com:8443#B\n".
        "trojan://pass@b.example.com:8443#B\n" // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную servers .
    let servers = parse_subscription(body);

    // Выполняем операцию: assert_eq!(servers.len(), 2);.
    assert_eq!(servers.len(), 2);
    // Выполняем операцию: assert_eq!(servers[0].name, "A");.
    assert_eq!(servers[0].name, "A");
    // Выполняем операцию: assert_eq!(servers[1].name, "B");.
    assert_eq!(servers[1].name, "B");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_keeps_many_servers.
fn test_parse_subscription_keeps_many_servers() {
    // Ограничение в один сервер делало подписку бесполезной: показывался
    // только первый узел, выбрать другой было невозможно.
    // Объявляем переменную body .
    let body = (0..50)
        // Выполняем операцию: .map(|index| format!("vless://uuid@host{index}.example..
        .map(|index| format!("vless://uuid@host{index}.example.com:443#Node {index}"))
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join("\n");.
        .join("\n");
    // Объявляем переменную servers .
    let servers = parse_subscription(&body);

    // Выполняем операцию: assert_eq!(servers.len(), 50);.
    assert_eq!(servers.len(), 50);
    // Выполняем операцию: assert_eq!(servers[0].name, "Node 0");.
    assert_eq!(servers[0].name, "Node 0");
    // Выполняем операцию: assert_eq!(servers[49].name, "Node 49");.
    assert_eq!(servers[49].name, "Node 49");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_respects_server_cap.
fn test_parse_subscription_respects_server_cap() {
    // Объявляем переменную body .
    let body = (0..500)
        // Выполняем операцию: .map(|index| format!("vless://uuid@host{index}.example..
        .map(|index| format!("vless://uuid@host{index}.example.com:443#Node {index}"))
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join("\n");.
        .join("\n");
    // Объявляем переменную servers .
    let servers = parse_subscription(&body);

    // Выполняем операцию: assert_eq!(servers.len(), MAX_SERVERS);.
    assert_eq!(servers.len(), MAX_SERVERS);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_base64_body.
fn test_parse_subscription_base64_body() {
    // Объявляем переменную body .
    let body = encode("vless://uuid@a.example.com:443#A\ntrojan://pass@b.example.com:8443#B");
    // Объявляем переменную servers .
    let servers = parse_subscription(&body);

    // Выполняем операцию: assert_eq!(servers.len(), 2);.
    assert_eq!(servers.len(), 2);
    // Выполняем операцию: assert_eq!(servers[0].name, "A");.
    assert_eq!(servers[0].name, "A");
    // Выполняем операцию: assert_eq!(servers[1].name, "B");.
    assert_eq!(servers[1].name, "B");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_url_safe_base64.
fn test_parse_subscription_url_safe_base64() {
    // Объявляем переменную raw .
    let raw = "vless://uuid@a.example.com:443#A/B+C";
    // Объявляем переменную body .
    let body = base64::engine::general_purpose::URL_SAFE.encode(raw);
    // Объявляем переменную servers .
    let servers = parse_subscription(&body);

    // Выполняем операцию: assert_eq!(servers.len(), 1);.
    assert_eq!(servers.len(), 1);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_deduplicates.
fn test_parse_subscription_deduplicates() {
    // Объявляем переменную body .
    let body = "vless://uuid@a.example.com:443#A\nvless://uuid@a.example.com:443#A";
    // Объявляем переменную servers .
    let servers = parse_subscription(body);

    // Выполняем операцию: assert_eq!(servers.len(), 1);.
    assert_eq!(servers.len(), 1);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_subscription_skips_garbage.
fn test_parse_subscription_skips_garbage() {
    // Объявляем переменную body .
    let body = "мусор\nещё мусор\nvless://uuid@a.example.com:443#A";
    // Объявляем переменную servers .
    let servers = parse_subscription(body);

    // Выполняем операцию: assert_eq!(servers.len(), 1);.
    assert_eq!(servers.len(), 1);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_subscription_url.
fn test_validate_subscription_url() {
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: validate_subscription_url("https://maximavps.cloud/api/.
        validate_subscription_url("https://maximavps.cloud/api/v1/client/subscribe?token=abc")
            // Выполняем операцию: .is_ok().
            .is_ok() // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(validate_subscription_url("https://sub.maximavp.
    assert!(validate_subscription_url("https://sub.maximavps.cloud/abc").is_ok());
    // Выполняем операцию: assert!(validate_subscription_url("https://maximacloud..
    assert!(validate_subscription_url("https://maximacloud.online/abc").is_ok());
    // Выполняем операцию: assert!(validate_subscription_url("https://maxima-vps.o.
    assert!(validate_subscription_url("https://maxima-vps.online/abc").is_ok());
    // Выполняем операцию: assert!(validate_subscription_url("https://sub.maxima-v.
    assert!(validate_subscription_url("https://sub.maxima-vps.online/abc").is_ok());
    // Выполняем операцию: assert!(validate_subscription_url("https://maxima.run/P.
    assert!(validate_subscription_url("https://maxima.run/PCDqYMIF").is_ok());
    // Выполняем операцию: assert!(validate_subscription_url("https://sub.maxima.r.
    assert!(validate_subscription_url("https://sub.maxima.run/PCDqYMIF").is_ok());
    // Выполняем операцию: assert!(validate_subscription_url("http://sub.example.c.
    assert!(validate_subscription_url("http://sub.example.com/abc").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("ftp://sub.example.co.
    assert!(validate_subscription_url("ftp://sub.example.com").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("https://sub.maxima-v.
    assert!(validate_subscription_url("https://sub.maxima-vps.online/a b").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("").is_err());.
    assert!(validate_subscription_url("").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_subscription_url_rejects_internal_hosts.
fn test_validate_subscription_url_rejects_internal_hosts() {
    // Выполняем операцию: assert!(validate_subscription_url("https://127.0.0.1/li.
    assert!(validate_subscription_url("https://127.0.0.1/list").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("https://localhost/li.
    assert!(validate_subscription_url("https://localhost/list").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("https://192.168.1.1/.
    assert!(validate_subscription_url("https://192.168.1.1/list").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("https://169.254.169..
    assert!(validate_subscription_url("https://169.254.169.254/list").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_subscription_url_rejects_foreign_hosts.
fn test_validate_subscription_url_rejects_foreign_hosts() {
    // Посторонние домены не принимаются: подписка — токен Maxima VPS.
    // Выполняем операцию: assert!(validate_subscription_url("https://sub.example..
    assert!(validate_subscription_url("https://sub.example.com/abc")
        // Выполняем операцию: .unwrap_err().
        .unwrap_err()
        // Выполняем операцию: .to_string().
        .to_string()
        // Выполняем операцию: .contains("Maxima VPS"));.
        .contains("Maxima VPS"));
    // Выполняем операцию: assert!(validate_subscription_url("https://fake-maximav.
    assert!(validate_subscription_url("https://fake-maximavps.cloud/abc").is_err());
    // Выполняем операцию: assert!(validate_subscription_url("https://maximavps.cl.
    assert!(validate_subscription_url("https://maximavps.cloud.evil.io/abc").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_body_size_limit.
fn test_body_size_limit() {
    // Выполняем операцию: assert!(body_size_ok(1024));.
    assert!(body_size_ok(1024));
    // Выполняем операцию: assert!(!body_size_ok(5 * 1024 * 1024));.
    assert!(!body_size_ok(5 * 1024 * 1024));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_query_map.
fn test_query_map() {
    // Объявляем переменную map .
    let map = parse_query_map("vless://uuid@host:443?type=ws&security=reality&sni=example.com");

    // Выполняем операцию: assert_eq!(map.get("type"), Some(&"ws".to_string()));.
    assert_eq!(map.get("type"), Some(&"ws".to_string()));
    // Выполняем операцию: assert_eq!(map.get("security"), Some(&"reality".to_stri.
    assert_eq!(map.get("security"), Some(&"reality".to_string()));
    // Выполняем операцию: assert_eq!(map.get("sni"), Some(&"example.com".to_strin.
    assert_eq!(map.get("sni"), Some(&"example.com".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_ss_credentials.
fn test_ss_credentials() {
    // Объявляем переменную credentials .
    let credentials = encode("aes-256-gcm:password123");
    // Объявляем переменную link .
    let link = format!("ss://{credentials}@ss.example.com:8388#X");
    // Объявляем переменную parsed .
    let parsed = parse_ss_credentials(&link).expect("ss credentials");

    // Выполняем операцию: assert_eq!(parsed.0, "aes-256-gcm");.
    assert_eq!(parsed.0, "aes-256-gcm");
    // Выполняем операцию: assert_eq!(parsed.1, "password123");.
    assert_eq!(parsed.1, "password123");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vmess_payload_roundtrip.
fn test_vmess_payload_roundtrip() {
    // Объявляем переменную payload .
    let payload = serde_json::json!({"ps": "X", "add": "h", "port": "1", "id": "i"});
    // Объявляем переменную link .
    let link = format!("vmess://{}", encode(&payload.to_string()));
    // Объявляем переменную value .
    let value = decode_vmess_payload(&link).expect("payload");

    // Выполняем операцию: assert_eq!(value.get("add").and_then(|v| v.as_str()), S.
    assert_eq!(value.get("add").and_then(|v| v.as_str()), Some("h"));
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_user_agent_is_known_client.
fn test_subscription_user_agent_is_known_client() {
    // Неизвестный User-Agent у многих провайдеров означает один пробный узел
    // вместо всего списка локаций. Своё имя приложения здесь не годится.
    // Объявляем переменную agent .
    let agent = SUBSCRIPTION_USER_AGENT.to_lowercase();

    // Выполняем операцию: assert!(!agent.contains("zapretmanager"));.
    assert!(!agent.contains("zapretmanager"));
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: [.
        [
            // Выполняем операцию: "v2rayng",.
            "v2rayng",
            // Выполняем операцию: "hiddify",.
            "hiddify",
            // Выполняем операцию: "nekoray",.
            "nekoray",
            // Выполняем операцию: "clash",.
            "clash",
            // Выполняем операцию: "sing-box",.
            "sing-box",
            // Выполняем операцию: "streisand".
            "streisand" // Выполняем операцию: ].
        ]
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|known| agent.contains(known)),.
        .any(|known| agent.contains(known)),
        // Выполняем операцию: "подписка запрашивается от неизвестного клиента: {SUBSC.
        "подписка запрашивается от неизвестного клиента: {SUBSCRIPTION_USER_AGENT}" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parses_transport_and_security.
fn test_parses_transport_and_security() {
    // Объявляем переменную link .
    let link = "vless://uuid@example.com:443?type=ws&security=reality&sni=example.com#WS";
    // Объявляем переменную server .
    let server = parse_link(link).expect("ws + reality");

    // Выполняем операцию: assert_eq!(server.transport, "ws");.
    assert_eq!(server.transport, "ws");
    // Выполняем операцию: assert_eq!(server.security, "reality");.
    assert_eq!(server.security, "reality");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_defaults_transport_to_tcp_and_ignores_none_security.
fn test_defaults_transport_to_tcp_and_ignores_none_security() {
    // Объявляем переменную link .
    let link = "trojan://pass@example.com:443?security=none#Plain";
    // Объявляем переменную server .
    let server = parse_link(link).expect("trojan");

    // Выполняем операцию: assert_eq!(server.transport, "tcp");.
    assert_eq!(server.transport, "tcp");
    // Выполняем операцию: assert_eq!(server.security, "");.
    assert_eq!(server.security, "");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_meta_reads_userinfo_header.
fn test_subscription_meta_reads_userinfo_header() {
    // Объявляем переменную meta .
    let meta = SubscriptionMeta::parse_userinfo(
        // Выполняем операцию: "upload = 100 ; download = 250 ; total = 1000 ; expire .
        "upload = 100 ; download = 250 ; total = 1000 ; expire = 1800000000",
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert_eq!(meta.traffic_used_bytes, 350);.
    assert_eq!(meta.traffic_used_bytes, 350);
    // Выполняем операцию: assert_eq!(meta.traffic_limit_bytes, 1000);.
    assert_eq!(meta.traffic_limit_bytes, 1000);
    // Выполняем операцию: assert_eq!(meta.expires_at, Some(1_800_000_000));.
    assert_eq!(meta.expires_at, Some(1_800_000_000));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_meta_offsets_mismatched_fields.
fn test_subscription_meta_offsets_mismatched_fields() {
    // Объявляем переменную meta .
    let meta = SubscriptionMeta::parse_userinfo("max=5; upload=999");

    // Выполняем операцию: assert_eq!(meta.traffic_used_bytes, 999);.
    assert_eq!(meta.traffic_used_bytes, 999);
    // Выполняем операцию: assert_eq!(meta.traffic_limit_bytes, 0);.
    assert_eq!(meta.traffic_limit_bytes, 0);
    // Выполняем операцию: assert_eq!(meta.expires_at, None);.
    assert_eq!(meta.expires_at, None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_meta_handles_garbage.
fn test_subscription_meta_handles_garbage() {
    // Объявляем переменную meta .
    let meta = SubscriptionMeta::parse_userinfo("total:not; upload:");

    // Выполняем операцию: assert_eq!(meta, SubscriptionMeta::default());.
    assert_eq!(meta, SubscriptionMeta::default());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_title_reads_plain_and_base64.
fn test_subscription_title_reads_plain_and_base64() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: SubscriptionMeta::parse_title("  Локации РФ  "),.
        SubscriptionMeta::parse_title("  Локации РФ  "),
        // Выполняем операцию: Some("Локации РФ".to_string()).
        Some("Локации РФ".to_string()) // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: SubscriptionMeta::parse_title("base64:VGVzdA=="),.
        SubscriptionMeta::parse_title("base64:VGVzdA=="),
        // Выполняем операцию: Some("Test".to_string()).
        Some("Test".to_string()) // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(SubscriptionMeta::parse_title(""), None);.
    assert_eq!(SubscriptionMeta::parse_title(""), None);
    // Выполняем операцию: assert_eq!(SubscriptionMeta::parse_title("base64:####").
    assert_eq!(SubscriptionMeta::parse_title("base64:####"), None);
    // Закрываем блок.
}
