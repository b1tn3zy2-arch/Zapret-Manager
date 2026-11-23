// Подключаем модули: base64::Engine;.
use base64::Engine;

// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::vpn_subscription::parse_link;.
use crate::commands::vpn_subscription::parse_link;

// Объявляем функцию server.
fn server(link: &str) -> SubscriptionServer {
    // Выполняем операцию: parse_link(link).expect("ссылка должна разобраться").
    parse_link(link).expect("ссылка должна разобраться")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vless_reality_config.
fn test_vless_reality_config() {
    // Объявляем переменную link .
    let link = "vless://11111111-2222-3333-4444-555555555555@example.com:443?type=tcp&security=reality&pbk=PBK123&fp=chrome&sni=example.com&sid=ab&spx=%2F&flow=xtls-rprx-vision#NL";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(config["outbounds"][0]["protocol"], "vless").
    assert_eq!(config["outbounds"][0]["protocol"], "vless");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["vnext"][0]["address.
        config["outbounds"][0]["settings"]["vnext"][0]["address"],
        // Выполняем операцию: "example.com".
        "example.com" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["vnext"][0]["users"].
        config["outbounds"][0]["settings"]["vnext"][0]["users"][0]["id"],
        // Выполняем операцию: "11111111-2222-3333-4444-555555555555".
        "11111111-2222-3333-4444-555555555555" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["vnext"][0]["users"].
        config["outbounds"][0]["settings"]["vnext"][0]["users"][0]["flow"],
        // Выполняем операцию: "xtls-rprx-vision".
        "xtls-rprx-vision" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["security"],.
        config["outbounds"][0]["streamSettings"]["security"],
        // Выполняем операцию: "reality".
        "reality" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["realitySettin.
        config["outbounds"][0]["streamSettings"]["realitySettings"]["publicKey"],
        // Выполняем операцию: "PBK123".
        "PBK123" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_real_user_reality_link_config.
fn test_real_user_reality_link_config() {
    // Объявляем переменную link .
    let link = "vless://a0aa9819-ea0d-4134-8371-bae21584ffdd@uk-24.gnodes.club:443?type=tcp&headerType=none&security=reality&fp=firefox&sni=dl.google.com&pbk=HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM&alpn=h2#%F0%9F%87%AC%F0%9F%87%A7+%D0%A5%D0%BE%D0%B3%D0%B2%D0%B0%D1%80%D1%82%D1%81+%F0%9F%A7%99";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();
    // Объявляем переменную outbound .
    let outbound = &config["outbounds"][0];

    // Выполняем операцию: assert_eq!(outbound["protocol"], "vless");.
    assert_eq!(outbound["protocol"], "vless");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["settings"]["vnext"][0]["address"],.
        outbound["settings"]["vnext"][0]["address"],
        // Выполняем операцию: "uk-24.gnodes.club".
        "uk-24.gnodes.club" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(outbound["settings"]["vnext"][0]["port"], 44.
    assert_eq!(outbound["settings"]["vnext"][0]["port"], 443);
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["settings"]["vnext"][0]["users"][0]["id"],.
        outbound["settings"]["vnext"][0]["users"][0]["id"],
        // Выполняем операцию: "a0aa9819-ea0d-4134-8371-bae21584ffdd".
        "a0aa9819-ea0d-4134-8371-bae21584ffdd" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["settings"]["vnext"][0]["users"][0]["encryptio.
        outbound["settings"]["vnext"][0]["users"][0]["encryption"],
        // Выполняем операцию: "none".
        "none" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(outbound["streamSettings"]["network"], "tcp".
    assert_eq!(outbound["streamSettings"]["network"], "tcp");
    // Выполняем операцию: assert_eq!(outbound["streamSettings"]["security"], "rea.
    assert_eq!(outbound["streamSettings"]["security"], "reality");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["streamSettings"]["realitySettings"]["serverNa.
        outbound["streamSettings"]["realitySettings"]["serverName"],
        // Выполняем операцию: "dl.google.com".
        "dl.google.com" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["streamSettings"]["realitySettings"]["fingerpr.
        outbound["streamSettings"]["realitySettings"]["fingerprint"],
        // Выполняем операцию: "firefox".
        "firefox" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["streamSettings"]["realitySettings"]["publicKe.
        outbound["streamSettings"]["realitySettings"]["publicKey"],
        // Выполняем операцию: "HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM".
        "HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(outbound["streamSettings"].get("tcpSettings").i.
    assert!(outbound["streamSettings"].get("tcpSettings").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_socks_outbound_with_auth.
fn test_socks_outbound_with_auth() {
    // Объявляем переменную link .
    let link = "socks://user:pass@127.0.0.1:1080#Proxy";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();
    // Объявляем переменную outbound .
    let outbound = &config["outbounds"][0];

    // Выполняем операцию: assert_eq!(outbound["protocol"], "socks");.
    assert_eq!(outbound["protocol"], "socks");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["settings"]["servers"][0]["users"][0]["user"],.
        outbound["settings"]["servers"][0]["users"][0]["user"],
        // Выполняем операцию: "user".
        "user" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: outbound["settings"]["servers"][0]["users"][0]["pass"],.
        outbound["settings"]["servers"][0]["users"][0]["pass"],
        // Выполняем операцию: "pass".
        "pass" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vless_tls_ws_config.
fn test_vless_tls_ws_config() {
    // Объявляем переменную link .
    let link = "vless://uuid@example.com:443?type=ws&security=tls&sni=cdn.example.com&path=%2Fws&host=cdn.example.com&fp=firefox#WS";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(config["outbounds"][0]["streamSettings"]["ne.
    assert_eq!(config["outbounds"][0]["streamSettings"]["network"], "ws");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["tlsSettings"].
        config["outbounds"][0]["streamSettings"]["tlsSettings"]["serverName"],
        // Выполняем операцию: "cdn.example.com".
        "cdn.example.com" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["wsSettings"][.
        config["outbounds"][0]["streamSettings"]["wsSettings"]["path"],
        // Выполняем операцию: "/ws".
        "/ws" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["wsSettings"][.
        config["outbounds"][0]["streamSettings"]["wsSettings"]["headers"]["Host"],
        // Выполняем операцию: "cdn.example.com".
        "cdn.example.com" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vmess_ws_config.
fn test_vmess_ws_config() {
    // Объявляем переменную payload .
    let payload = serde_json::json!({
        // Выполняем операцию: "ps": "JP",.
        "ps": "JP",
        // Выполняем операцию: "add": "jp.example.com",.
        "add": "jp.example.com",
        // Выполняем операцию: "port": "443",.
        "port": "443",
        // Выполняем операцию: "id": "vmess-uuid",.
        "id": "vmess-uuid",
        // Выполняем операцию: "aid": "0",.
        "aid": "0",
        // Выполняем операцию: "net": "ws",.
        "net": "ws",
        // Выполняем операцию: "type": "none",.
        "type": "none",
        // Выполняем операцию: "host": "jp.example.com",.
        "host": "jp.example.com",
        // Выполняем операцию: "path": "/path",.
        "path": "/path",
        // Выполняем операцию: "tls": "tls",.
        "tls": "tls",
        // Выполняем операцию: "sni": "jp.example.com".
        "sni": "jp.example.com"
    // Закрываем блок.
    });
    // Объявляем переменную encoded .
    let encoded = base64::engine::general_purpose::STANDARD.encode(payload.to_string());
    // Объявляем переменную link .
    let link = format!("vmess://{encoded}");
    // Объявляем переменную config .
    let config = build_config(&server(&link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(config["outbounds"][0]["protocol"], "vmess").
    assert_eq!(config["outbounds"][0]["protocol"], "vmess");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["vnext"][0]["users"].
        config["outbounds"][0]["settings"]["vnext"][0]["users"][0]["id"],
        // Выполняем операцию: "vmess-uuid".
        "vmess-uuid" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(config["outbounds"][0]["streamSettings"]["ne.
    assert_eq!(config["outbounds"][0]["streamSettings"]["network"], "ws");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["tlsSettings"].
        config["outbounds"][0]["streamSettings"]["tlsSettings"]["serverName"],
        // Выполняем операцию: "jp.example.com".
        "jp.example.com" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_trojan_config.
fn test_trojan_config() {
    // Объявляем переменную link .
    let link = "trojan://secret123@de.example.com:443?security=tls&sni=de.example.com#DE";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(config["outbounds"][0]["protocol"], "trojan".
    assert_eq!(config["outbounds"][0]["protocol"], "trojan");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["servers"][0]["passw.
        config["outbounds"][0]["settings"]["servers"][0]["password"],
        // Выполняем операцию: "secret123".
        "secret123" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_shadowsocks_config.
fn test_shadowsocks_config() {
    // Объявляем переменную credentials .
    let credentials = base64::engine::general_purpose::STANDARD.encode("aes-256-gcm:pass123");
    // Объявляем переменную link .
    let link = format!("ss://{credentials}@ss.example.com:8388#SS");
    // Объявляем переменную config .
    let config = build_config(&server(&link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(config["outbounds"][0]["protocol"], "shadows.
    assert_eq!(config["outbounds"][0]["protocol"], "shadowsocks");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["servers"][0]["metho.
        config["outbounds"][0]["settings"]["servers"][0]["method"],
        // Выполняем операцию: "aes-256-gcm".
        "aes-256-gcm" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["settings"]["servers"][0]["passw.
        config["outbounds"][0]["settings"]["servers"][0]["password"],
        // Выполняем операцию: "pass123".
        "pass123" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_config_has_required_inbounds.
fn test_config_has_required_inbounds() {
    // Объявляем переменную link .
    let link = "vless://uuid@example.com:443?security=tls";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(config["inbounds"][0]["port"], 10808);.
    assert_eq!(config["inbounds"][0]["port"], 10808);
    // Выполняем операцию: assert_eq!(config["inbounds"][0]["protocol"], "socks");.
    assert_eq!(config["inbounds"][0]["protocol"], "socks");
    // Выполняем операцию: assert_eq!(config["inbounds"][1]["port"], 10809);.
    assert_eq!(config["inbounds"][1]["port"], 10809);
    // Выполняем операцию: assert_eq!(config["inbounds"][1]["protocol"], "http");.
    assert_eq!(config["inbounds"][1]["protocol"], "http");
    // Выполняем операцию: assert_eq!(config["outbounds"][1]["protocol"], "freedom.
    assert_eq!(config["outbounds"][1]["protocol"], "freedom");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_grpc_network.
fn test_grpc_network() {
    // Объявляем переменную link .
    let link =
        // Выполняем операцию: "vless://uuid@example.com:443?type=grpc&security=tls&se.
        "vless://uuid@example.com:443?type=grpc&security=tls&serviceName=mygrpc&sni=example.com";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["grpcSettings".
        config["outbounds"][0]["streamSettings"]["grpcSettings"]["serviceName"],
        // Выполняем операцию: "mygrpc".
        "mygrpc" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tcp_http_header.
fn test_tcp_http_header() {
    // Объявляем переменную link .
    let link =
        // Выполняем операцию: "vless://uuid@example.com:80?type=tcp&security=none&hea.
        "vless://uuid@example.com:80?type=tcp&security=none&headerType=http&host=example.com";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: config["outbounds"][0]["streamSettings"]["tcpSettings"].
        config["outbounds"][0]["streamSettings"]["tcpSettings"]["header"]["type"],
        // Выполняем операцию: "http".
        "http" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tls_alpn_list.
fn test_tls_alpn_list() {
    // Объявляем переменную link .
    let link = "vless://uuid@example.com:443?security=tls&alpn=h2,http/1.1&sni=example.com";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();
    // Объявляем переменную alpn .
    let alpn = config["outbounds"][0]["streamSettings"]["tlsSettings"]["alpn"]
        // Выполняем операцию: .as_array().
        .as_array()
        // Выполняем операцию: .expect("alpn массив");.
        .expect("alpn массив");

    // Выполняем операцию: assert_eq!(alpn.len(), 2);.
    assert_eq!(alpn.len(), 2);
    // Выполняем операцию: assert_eq!(alpn[0], "h2");.
    assert_eq!(alpn[0], "h2");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_credentials_required_for_vless.
fn test_credentials_required_for_vless() {
    // Объявляем переменную link .
    let link = "vless://example.com:443?security=tls#X";
    // Объявляем переменную parsed .
    let parsed = server(link);

    // Выполняем операцию: assert!(build_config(&parsed, 10808, 10809).is_err());.
    assert!(build_config(&parsed, 10808, 10809).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_unknown_protocol_rejected.
fn test_unknown_protocol_rejected() {
    // Объявляем переменную fake .
    let fake = SubscriptionServer {
        // Выполняем операцию: id: "x".to_string(),.
        id: "x".to_string(),
        // Выполняем операцию: name: "x".to_string(),.
        name: "x".to_string(),
        // Выполняем операцию: protocol: "http".to_string(),.
        protocol: "http".to_string(),
        // Выполняем операцию: host: "example.com".to_string(),.
        host: "example.com".to_string(),
        // Выполняем операцию: port: 443,.
        port: 443,
        // Выполняем операцию: link: "http://example.com".to_string(),.
        link: "http://example.com".to_string(),
        // Выполняем операцию: transport: "tcp".to_string(),.
        transport: "tcp".to_string(),
        // Выполняем операцию: security: String::new(),.
        security: String::new(),
        // Закрываем блок.
    };

    // Выполняем операцию: assert!(build_config(&fake, 10808, 10809).is_err());.
    assert!(build_config(&fake, 10808, 10809).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_reality_without_public_key_falls_back_to_plain.
fn test_reality_without_public_key_falls_back_to_plain() {
    // Объявляем переменную link .
    let link = "vless://uuid@example.com:443?security=reality#X";
    // Объявляем переменную config .
    let config = build_config(&server(link), 10808, 10809).unwrap();

    // Выполняем операцию: assert!(config["outbounds"][0]["streamSettings"].
    assert!(config["outbounds"][0]["streamSettings"]
        // Выполняем операцию: .get("realitySettings").
        .get("realitySettings")
        // Выполняем операцию: .is_none());.
        .is_none());
    // Закрываем блок.
}
