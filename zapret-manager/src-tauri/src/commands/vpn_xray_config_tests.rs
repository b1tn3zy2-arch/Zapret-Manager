use base64::Engine;

use super::*;
use crate::commands::vpn_subscription::parse_link;

fn server(link: &str) -> SubscriptionServer {
    parse_link(link).expect("ссылка должна разобраться")
}

#[test]
fn test_vless_reality_config() {
    let link = "vless://11111111-2222-3333-4444-555555555555@example.com:443?type=tcp&security=reality&pbk=PBK123&fp=chrome&sni=example.com&sid=ab&spx=%2F&flow=xtls-rprx-vision#NL";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert_eq!(config["outbounds"][0]["protocol"], "vless");
    assert_eq!(
        config["outbounds"][0]["settings"]["vnext"][0]["address"],
        "example.com"
    );
    assert_eq!(
        config["outbounds"][0]["settings"]["vnext"][0]["users"][0]["id"],
        "11111111-2222-3333-4444-555555555555"
    );
    assert_eq!(
        config["outbounds"][0]["settings"]["vnext"][0]["users"][0]["flow"],
        "xtls-rprx-vision"
    );
    assert_eq!(
        config["outbounds"][0]["streamSettings"]["security"],
        "reality"
    );
    assert_eq!(
        config["outbounds"][0]["streamSettings"]["realitySettings"]["publicKey"],
        "PBK123"
    );
}

#[test]
fn test_real_user_reality_link_config() {
    let link = "vless://a0aa9819-ea0d-4134-8371-bae21584ffdd@uk-24.gnodes.club:443?type=tcp&headerType=none&security=reality&fp=firefox&sni=dl.google.com&pbk=HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM&alpn=h2#%F0%9F%87%AC%F0%9F%87%A7+%D0%A5%D0%BE%D0%B3%D0%B2%D0%B0%D1%80%D1%82%D1%81+%F0%9F%A7%99";
    let config = build_config(&server(link), 10808, 10809).unwrap();
    let outbound = &config["outbounds"][0];

    assert_eq!(outbound["protocol"], "vless");
    assert_eq!(outbound["settings"]["vnext"][0]["address"], "uk-24.gnodes.club");
    assert_eq!(outbound["settings"]["vnext"][0]["port"], 443);
    assert_eq!(
        outbound["settings"]["vnext"][0]["users"][0]["id"],
        "a0aa9819-ea0d-4134-8371-bae21584ffdd"
    );
    assert_eq!(
        outbound["settings"]["vnext"][0]["users"][0]["encryption"],
        "none"
    );
    assert_eq!(outbound["streamSettings"]["network"], "tcp");
    assert_eq!(outbound["streamSettings"]["security"], "reality");
    assert_eq!(
        outbound["streamSettings"]["realitySettings"]["serverName"],
        "dl.google.com"
    );
    assert_eq!(
        outbound["streamSettings"]["realitySettings"]["fingerprint"],
        "firefox"
    );
    assert_eq!(
        outbound["streamSettings"]["realitySettings"]["publicKey"],
        "HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM"
    );
    assert!(
        outbound["streamSettings"]
            .get("tcpSettings")
            .is_none()
    );
}

#[test]
fn test_socks_outbound_with_auth() {
    let link = "socks://user:pass@127.0.0.1:1080#Proxy";
    let config = build_config(&server(link), 10808, 10809).unwrap();
    let outbound = &config["outbounds"][0];

    assert_eq!(outbound["protocol"], "socks");
    assert_eq!(outbound["settings"]["servers"][0]["users"][0]["user"], "user");
    assert_eq!(outbound["settings"]["servers"][0]["users"][0]["pass"], "pass");
}

#[test]
fn test_vless_tls_ws_config() {
    let link = "vless://uuid@example.com:443?type=ws&security=tls&sni=cdn.example.com&path=%2Fws&host=cdn.example.com&fp=firefox#WS";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert_eq!(config["outbounds"][0]["streamSettings"]["network"], "ws");
    assert_eq!(
        config["outbounds"][0]["streamSettings"]["tlsSettings"]["serverName"],
        "cdn.example.com"
    );
    assert_eq!(
        config["outbounds"][0]["streamSettings"]["wsSettings"]["path"],
        "/ws"
    );
    assert_eq!(
        config["outbounds"][0]["streamSettings"]["wsSettings"]["headers"]["Host"],
        "cdn.example.com"
    );
}

#[test]
fn test_vmess_ws_config() {
    let payload = serde_json::json!({
        "ps": "JP",
        "add": "jp.example.com",
        "port": "443",
        "id": "vmess-uuid",
        "aid": "0",
        "net": "ws",
        "type": "none",
        "host": "jp.example.com",
        "path": "/path",
        "tls": "tls",
        "sni": "jp.example.com"
    });
    let encoded = base64::engine::general_purpose::STANDARD.encode(payload.to_string());
    let link = format!("vmess://{encoded}");
    let config = build_config(&server(&link), 10808, 10809).unwrap();

    assert_eq!(config["outbounds"][0]["protocol"], "vmess");
    assert_eq!(
        config["outbounds"][0]["settings"]["vnext"][0]["users"][0]["id"],
        "vmess-uuid"
    );
    assert_eq!(config["outbounds"][0]["streamSettings"]["network"], "ws");
    assert_eq!(
        config["outbounds"][0]["streamSettings"]["tlsSettings"]["serverName"],
        "jp.example.com"
    );
}

#[test]
fn test_trojan_config() {
    let link = "trojan://secret123@de.example.com:443?security=tls&sni=de.example.com#DE";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert_eq!(config["outbounds"][0]["protocol"], "trojan");
    assert_eq!(
        config["outbounds"][0]["settings"]["servers"][0]["password"],
        "secret123"
    );
}

#[test]
fn test_shadowsocks_config() {
    let credentials =
        base64::engine::general_purpose::STANDARD.encode("aes-256-gcm:pass123");
    let link = format!("ss://{credentials}@ss.example.com:8388#SS");
    let config = build_config(&server(&link), 10808, 10809).unwrap();

    assert_eq!(config["outbounds"][0]["protocol"], "shadowsocks");
    assert_eq!(
        config["outbounds"][0]["settings"]["servers"][0]["method"],
        "aes-256-gcm"
    );
    assert_eq!(
        config["outbounds"][0]["settings"]["servers"][0]["password"],
        "pass123"
    );
}

#[test]
fn test_config_has_required_inbounds() {
    let link = "vless://uuid@example.com:443?security=tls";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert_eq!(config["inbounds"][0]["port"], 10808);
    assert_eq!(config["inbounds"][0]["protocol"], "socks");
    assert_eq!(config["inbounds"][1]["port"], 10809);
    assert_eq!(config["inbounds"][1]["protocol"], "http");
    assert_eq!(config["outbounds"][1]["protocol"], "freedom");
}

#[test]
fn test_grpc_network() {
    let link = "vless://uuid@example.com:443?type=grpc&security=tls&serviceName=mygrpc&sni=example.com";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert_eq!(
        config["outbounds"][0]["streamSettings"]["grpcSettings"]["serviceName"],
        "mygrpc"
    );
}

#[test]
fn test_tcp_http_header() {
    let link = "vless://uuid@example.com:80?type=tcp&security=none&headerType=http&host=example.com";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert_eq!(
        config["outbounds"][0]["streamSettings"]["tcpSettings"]["header"]["type"],
        "http"
    );
}

#[test]
fn test_tls_alpn_list() {
    let link = "vless://uuid@example.com:443?security=tls&alpn=h2,http/1.1&sni=example.com";
    let config = build_config(&server(link), 10808, 10809).unwrap();
    let alpn = config["outbounds"][0]["streamSettings"]["tlsSettings"]["alpn"]
        .as_array()
        .expect("alpn массив");

    assert_eq!(alpn.len(), 2);
    assert_eq!(alpn[0], "h2");
}

#[test]
fn test_credentials_required_for_vless() {
    let link = "vless://example.com:443?security=tls#X";
    let parsed = server(link);

    assert!(build_config(&parsed, 10808, 10809).is_err());
}

#[test]
fn test_unknown_protocol_rejected() {
    let fake = SubscriptionServer {
        id: "x".to_string(),
        name: "x".to_string(),
        protocol: "http".to_string(),
        host: "example.com".to_string(),
        port: 443,
        link: "http://example.com".to_string(),
        transport: "tcp".to_string(),
        security: String::new(),
    };

    assert!(build_config(&fake, 10808, 10809).is_err());
}

#[test]
fn test_reality_without_public_key_falls_back_to_plain() {
    let link = "vless://uuid@example.com:443?security=reality#X";
    let config = build_config(&server(link), 10808, 10809).unwrap();

    assert!(
        config["outbounds"][0]["streamSettings"]
            .get("realitySettings")
            .is_none()
    );
}