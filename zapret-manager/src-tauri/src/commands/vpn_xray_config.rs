use std::collections::BTreeMap;

use serde_json::{json, Map, Value};

use crate::commands::vpn_subscription::{
    decode_vmess_payload, parse_query_map, parse_ss_credentials, SubscriptionServer,
};
use crate::error::{AppError, AppResult};

pub fn build_config(
    server: &SubscriptionServer,
    socks_port: u16,
    http_port: u16,
) -> AppResult<Value> {
    let outbound = match server.protocol.as_str() {
        "vless" => vless_outbound(server)?,
        "vmess" => vmess_outbound(server)?,
        "trojan" => trojan_outbound(server)?,
        "ss" => shadowsocks_outbound(server)?,
        "socks" => socks_outbound(server)?,
        other => {
            return Err(AppError::custom(format!("Протокол {other} не поддержан")));
        }
    };

    Ok(json!({
        "log": { "loglevel": "warning" },
        "dns": {
            "servers": ["1.1.1.1", "8.8.8.8"]
        },
        "inbounds": [
            {
                "tag": "socks",
                "listen": "127.0.0.1",
                "port": socks_port,
                "protocol": "socks",
                "settings": { "udp": true }
            },
            {
                "tag": "http",
                "listen": "127.0.0.1",
                "port": http_port,
                "protocol": "http"
            }
        ],
        "outbounds": [
            outbound,
            { "tag": "direct", "protocol": "freedom" },
            { "tag": "block", "protocol": "blackhole" }
        ],
        "routing": {
            "rules": [
                { "type": "field", "ip": ["geoip:private"], "outboundTag": "direct" }
            ]
        }
    }))
}

fn server_address(server: &SubscriptionServer) -> Value {
    json!({ "address": server.host, "port": server.port })
}

fn vless_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    let query = parse_query_map(&server.link);
    let id = credentials_of(&server.link, "vless://")?;
    let flow = query.get("flow").cloned().unwrap_or_default();

    let mut user = Map::new();
    user.insert("id".to_string(), json!(id));
    user.insert("encryption".to_string(), json!("none"));

    if !flow.is_empty() {
        user.insert("flow".to_string(), json!(flow));
    }

    let mut vnext = server_address(server);
    vnext["users"] = json!([Value::Object(user)]);

    Ok(json!({
        "tag": "proxy",
        "protocol": "vless",
        "settings": { "vnext": [vnext] },
        "streamSettings": stream_settings(&query)
    }))
}

fn vmess_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    let payload = decode_vmess_payload(&server.link)
        .ok_or_else(|| AppError::custom("vmess ссылка повреждена"))?;

    let id = payload
        .get("id")
        .and_then(|item| item.as_str())
        .unwrap_or_default()
        .to_string();
    let alter_id = payload
        .get("aid")
        .and_then(|item| match item {
            Value::String(text) => text.parse::<u32>().ok(),
            Value::Number(number) => number.as_u64().map(|value| value as u32),
            _ => None,
        })
        .unwrap_or(0);

    let mut query: BTreeMap<String, String> = BTreeMap::new();

    if let Some(net) = payload.get("net").and_then(|item| item.as_str()) {
        query.insert("type".to_string(), net.to_string());
    }

    if let Some(tls) = payload.get("tls").and_then(|item| item.as_str()) {
        if !tls.is_empty() && tls != "none" {
            query.insert("security".to_string(), "tls".to_string());
        }
    }

    if let Some(host) = payload.get("host").and_then(|item| item.as_str()) {
        if !host.is_empty() {
            query.insert("host".to_string(), host.to_string());
        }
    }

    if let Some(path) = payload.get("path").and_then(|item| item.as_str()) {
        if !path.is_empty() {
            query.insert("path".to_string(), path.to_string());
        }
    }

    if let Some(sni) = payload.get("sni").and_then(|item| item.as_str()) {
        if !sni.is_empty() {
            query.insert("sni".to_string(), sni.to_string());
        }
    }

    if let Some(alpn) = payload.get("alpn").and_then(|item| item.as_str()) {
        if !alpn.is_empty() {
            query.insert("alpn".to_string(), alpn.to_string());
        }
    }

    if let Some(fp) = payload.get("fp").and_then(|item| item.as_str()) {
        if !fp.is_empty() {
            query.insert("fp".to_string(), fp.to_string());
        }
    }

    let mut vnext = server_address(server);
    vnext["users"] = json!([{
        "id": id,
        "alterId": alter_id,
        "security": "auto"
    }]);

    Ok(json!({
        "tag": "proxy",
        "protocol": "vmess",
        "settings": { "vnext": [vnext] },
        "streamSettings": stream_settings(&query)
    }))
}

fn trojan_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    let query = parse_query_map(&server.link);
    let password = credentials_of(&server.link, "trojan://")?;

    let mut entry = server_address(server);
    entry["password"] = json!(password);

    Ok(json!({
        "tag": "proxy",
        "protocol": "trojan",
        "settings": { "servers": [entry] },
        "streamSettings": stream_settings(&query)
    }))
}

fn shadowsocks_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    let (method, password) = parse_ss_credentials(&server.link)
        .ok_or_else(|| AppError::custom("shadowsocks ссылка повреждена"))?;

    let mut entry = server_address(server);
    entry["method"] = json!(method);
    entry["password"] = json!(password);

    Ok(json!({
        "tag": "proxy",
        "protocol": "shadowsocks",
        "settings": { "servers": [entry] },
        "streamSettings": { "network": "tcp" }
    }))
}

fn socks_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    let credentials = credentials_of(&server.link, "socks://")
        .or_else(|_| credentials_of(&server.link, "socks5://"))
        .unwrap_or_default();

    let mut entry = server_address(server);

    if let Some((user, password)) = credentials.split_once(':') {
        entry["users"] = json!([{ "user": user, "pass": password }]);
    }

    Ok(json!({
        "tag": "proxy",
        "protocol": "socks",
        "settings": { "servers": [entry] },
        "streamSettings": { "network": "tcp" }
    }))
}

fn credentials_of(link: &str, prefix: &str) -> AppResult<String> {
    let rest = link
        .strip_prefix(prefix)
        .ok_or_else(|| AppError::custom("Ссылка повреждена"))?;
    let (main, _) = match rest.split_once('#') {
        Some((main, fragment)) => (main, fragment),
        None => (rest, ""),
    };
    let (main, _) = match main.split_once('?') {
        Some((main, query)) => (main, query),
        None => (main, ""),
    };

    let credentials = match main.rsplit_once('@') {
        Some((credentials, _)) => credentials,
        None => return Err(AppError::custom("В ссылке нет учётных данных")),
    };

    if credentials.is_empty() {
        return Err(AppError::custom("Пустые учётные данные"));
    }

    Ok(credentials.to_string())
}

fn stream_settings(query: &BTreeMap<String, String>) -> Value {
    let network = query
        .get("type")
        .map(String::as_str)
        .unwrap_or("tcp")
        .to_string();
    let security = query
        .get("security")
        .map(String::as_str)
        .unwrap_or("none")
        .to_string();

    let mut settings = Map::new();
    settings.insert("network".to_string(), json!(network));
    settings.insert("security".to_string(), json!(security));

    let sni = query
        .get("sni")
        .map(String::as_str)
        .unwrap_or_default()
        .to_string();
    let host = query
        .get("host")
        .map(String::as_str)
        .unwrap_or_default()
        .to_string();
    let fingerprint = query
        .get("fp")
        .map(String::as_str)
        .unwrap_or_default()
        .to_string();

    if security == "tls" {
        let mut tls = Map::new();

        if !sni.is_empty() {
            tls.insert("serverName".to_string(), json!(sni));
        }

        if !fingerprint.is_empty() {
            tls.insert("fingerprint".to_string(), json!(fingerprint));
        }

        if let Some(alpn) = query.get("alpn").map(String::as_str) {
            let items: Vec<&str> = alpn.split(',').collect();
            tls.insert("alpn".to_string(), json!(items));
        }

        tls.insert("allowInsecure".to_string(), json!(false));
        settings.insert("tlsSettings".to_string(), Value::Object(tls));
    }

    if security == "reality" {
        let public_key = query
            .get("pbk")
            .map(String::as_str)
            .unwrap_or_default()
            .to_string();

        if public_key.is_empty() {
            return Value::Object(settings);
        }

        let short_id = query
            .get("sid")
            .map(String::as_str)
            .unwrap_or_default()
            .to_string();
        let spider = query
            .get("spx")
            .map(String::as_str)
            .unwrap_or("/")
            .to_string();

        settings.insert(
            "realitySettings".to_string(),
            json!({
                "serverName": sni,
                "fingerprint": if fingerprint.is_empty() { "chrome".to_string() } else { fingerprint },
                "publicKey": public_key,
                "shortId": short_id,
                "spiderX": spider
            }),
        );
    }

    match network.as_str() {
        "ws" => {
            let path = query
                .get("path")
                .map(String::as_str)
                .unwrap_or("/")
                .to_string();

            settings.insert(
                "wsSettings".to_string(),
                json!({
                    "path": path,
                    "headers": { "Host": host }
                }),
            );
        }
        "grpc" => {
            let service = query
                .get("servicename")
                .map(String::as_str)
                .unwrap_or_default()
                .to_string();

            settings.insert(
                "grpcSettings".to_string(),
                json!({ "serviceName": service }),
            );
        }
        "tcp" => {
            let header = query
                .get("headertype")
                .map(String::as_str)
                .unwrap_or_default()
                .to_string();

            if header == "http" {
                settings.insert(
                    "tcpSettings".to_string(),
                    json!({
                        "header": {
                            "type": "http",
                            "request": { "headers": { "Host": [host] } }
                        }
                    }),
                );
            }
        }
        _ => {}
    }

    Value::Object(settings)
}

#[cfg(test)]
#[path = "vpn_xray_config_tests.rs"]
mod tests;