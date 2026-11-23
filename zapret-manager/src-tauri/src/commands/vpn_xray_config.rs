// Подключаем модули: std::collections::BTreeMap;.
use std::collections::BTreeMap;

// Подключаем модули: serde_json::{json, Map, Value};.
use serde_json::{json, Map, Value};

// Подключаем модули: crate::commands::vpn_subscription::{.
use crate::commands::vpn_subscription::{
    // Выполняем операцию: decode_vmess_payload, parse_query_map, parse_ss_credent.
    decode_vmess_payload,
    parse_query_map,
    parse_ss_credentials,
    SubscriptionServer,
    // Закрываем блок.
};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем функцию build_config.
pub fn build_config(
    // Выполняем операцию: server: &SubscriptionServer,.
    server: &SubscriptionServer,
    // Выполняем операцию: socks_port: u16,.
    socks_port: u16,
    // Выполняем операцию: http_port: u16,.
    http_port: u16,
    // Закрываем выражение или коллекцию.
) -> AppResult<Value> {
    // Объявляем переменную outbound .
    let outbound = match server.protocol.as_str() {
        // Выполняем операцию: "vless" => vless_outbound(server)?,.
        "vless" => vless_outbound(server)?,
        // Выполняем операцию: "vmess" => vmess_outbound(server)?,.
        "vmess" => vmess_outbound(server)?,
        // Выполняем операцию: "trojan" => trojan_outbound(server)?,.
        "trojan" => trojan_outbound(server)?,
        // Выполняем операцию: "ss" => shadowsocks_outbound(server)?,.
        "ss" => shadowsocks_outbound(server)?,
        // Выполняем операцию: "socks" => socks_outbound(server)?,.
        "socks" => socks_outbound(server)?,
        // Выполняем операцию: other => {.
        other => {
            // Возвращаем результат из функции.
            return Err(AppError::custom(format!("Протокол {other} не поддержан")));
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Выполняем операцию: Ok(json!({.
    Ok(json!({
        // Выполняем операцию: "log": { "loglevel": "warning" },.
        "log": { "loglevel": "warning" },
        // Выполняем операцию: "dns": {.
        "dns": {
            // Выполняем операцию: "servers": ["1.1.1.1", "8.8.8.8"].
            "servers": ["1.1.1.1", "8.8.8.8"]
        // Закрываем блок.
        },
        // Выполняем операцию: "inbounds": [.
        "inbounds": [
            // Выполняем операцию: {.
            {
                // Выполняем операцию: "tag": "socks",.
                "tag": "socks",
                // Выполняем операцию: "listen": "127.0.0.1",.
                "listen": "127.0.0.1",
                // Выполняем операцию: "port": socks_port,.
                "port": socks_port,
                // Выполняем операцию: "protocol": "socks",.
                "protocol": "socks",
                // Выполняем операцию: "settings": { "udp": true }.
                "settings": { "udp": true }
            // Закрываем блок.
            },
            // Выполняем операцию: {.
            {
                // Выполняем операцию: "tag": "http",.
                "tag": "http",
                // Выполняем операцию: "listen": "127.0.0.1",.
                "listen": "127.0.0.1",
                // Выполняем операцию: "port": http_port,.
                "port": http_port,
                // Выполняем операцию: "protocol": "http".
                "protocol": "http"
            // Закрываем блок.
            }
        // Выполняем операцию: ],.
        ],
        // Выполняем операцию: "outbounds": [.
        "outbounds": [
            // Выполняем операцию: outbound,.
            outbound,
            // Выполняем операцию: { "tag": "direct", "protocol": "freedom" },.
            { "tag": "direct", "protocol": "freedom" },
            // Выполняем операцию: { "tag": "block", "protocol": "blackhole" }.
            { "tag": "block", "protocol": "blackhole" }
        // Выполняем операцию: ],.
        ],
        // Выполняем операцию: "routing": {.
        "routing": {
            // Выполняем операцию: "rules": [.
            "rules": [
                // Выполняем операцию: { "type": "field", "ip": ["geoip:private"], "outboundTa.
                { "type": "field", "ip": ["geoip:private"], "outboundTag": "direct" }
            // Выполняем операцию: ].
            ]
        // Закрываем блок.
        }
    // Закрываем блок.
    }))
    // Закрываем блок.
}

// Объявляем функцию server_address.
fn server_address(server: &SubscriptionServer) -> Value {
    // Выполняем операцию: json!({ "address": server.host, "port": server.port }).
    json!({ "address": server.host, "port": server.port })
    // Закрываем блок.
}

// Объявляем функцию vless_outbound.
fn vless_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    // Объявляем переменную query .
    let query = parse_query_map(&server.link);
    // Объявляем переменную id .
    let id = credentials_of(&server.link, "vless://")?;
    // Объявляем переменную flow .
    let flow = query.get("flow").cloned().unwrap_or_default();

    // Объявляем переменную user .
    let mut user = Map::new();
    // Выполняем операцию: user.insert("id".to_string(), json!(id));.
    user.insert("id".to_string(), json!(id));
    // Выполняем операцию: user.insert("encryption".to_string(), json!("none"));.
    user.insert("encryption".to_string(), json!("none"));

    // Проверяем условие: !flow.is_empty() {.
    if !flow.is_empty() {
        // Выполняем операцию: user.insert("flow".to_string(), json!(flow));.
        user.insert("flow".to_string(), json!(flow));
        // Закрываем блок.
    }

    // Объявляем переменную vnext .
    let mut vnext = server_address(server);
    // Выполняем операцию: vnext["users"] = json!([Value::Object(user)]);.
    vnext["users"] = json!([Value::Object(user)]);

    // Выполняем операцию: Ok(json!({.
    Ok(json!({
        // Выполняем операцию: "tag": "proxy",.
        "tag": "proxy",
        // Выполняем операцию: "protocol": "vless",.
        "protocol": "vless",
        // Выполняем операцию: "settings": { "vnext": [vnext] },.
        "settings": { "vnext": [vnext] },
        // Выполняем операцию: "streamSettings": stream_settings(&query).
        "streamSettings": stream_settings(&query)
    // Закрываем блок.
    }))
    // Закрываем блок.
}

// Объявляем функцию vmess_outbound.
fn vmess_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    // Объявляем переменную payload .
    let payload = decode_vmess_payload(&server.link)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("vmess ссылка поврежден.
        .ok_or_else(|| AppError::custom("vmess ссылка повреждена"))?;

    // Объявляем переменную id .
    let id = payload
        // Выполняем операцию: .get("id").
        .get("id")
        // Выполняем операцию: .and_then(|item| item.as_str()).
        .and_then(|item| item.as_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();
    // Объявляем переменную alter_id .
    let alter_id = payload
        // Выполняем операцию: .get("aid").
        .get("aid")
        // Выполняем операцию: .and_then(|item| match item {.
        .and_then(|item| match item {
            // Выполняем операцию: Value::String(text) => text.parse::<u32>().ok(),.
            Value::String(text) => text.parse::<u32>().ok(),
            // Выполняем операцию: Value::Number(number) => number.as_u64().map(|value| va.
            Value::Number(number) => number.as_u64().map(|value| value as u32),
            // Выполняем операцию: _ => None,.
            _ => None,
            // Закрываем блок.
        })
        // Выполняем операцию: .unwrap_or(0);.
        .unwrap_or(0);

    // Объявляем переменную query.
    let mut query: BTreeMap<String, String> = BTreeMap::new();

    // Проверяем условие: let Some(net) = payload.get("net").and_then(|item|.
    if let Some(net) = payload.get("net").and_then(|item| item.as_str()) {
        // Выполняем операцию: query.insert("type".to_string(), net.to_string());.
        query.insert("type".to_string(), net.to_string());
        // Закрываем блок.
    }

    // Проверяем условие: let Some(tls) = payload.get("tls").and_then(|item|.
    if let Some(tls) = payload.get("tls").and_then(|item| item.as_str()) {
        // Проверяем условие: !tls.is_empty() && tls != "none" {.
        if !tls.is_empty() && tls != "none" {
            // Выполняем операцию: query.insert("security".to_string(), "tls".to_string()).
            query.insert("security".to_string(), "tls".to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(host) = payload.get("host").and_then(|ite.
    if let Some(host) = payload.get("host").and_then(|item| item.as_str()) {
        // Проверяем условие: !host.is_empty() {.
        if !host.is_empty() {
            // Выполняем операцию: query.insert("host".to_string(), host.to_string());.
            query.insert("host".to_string(), host.to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(path) = payload.get("path").and_then(|ite.
    if let Some(path) = payload.get("path").and_then(|item| item.as_str()) {
        // Проверяем условие: !path.is_empty() {.
        if !path.is_empty() {
            // Выполняем операцию: query.insert("path".to_string(), path.to_string());.
            query.insert("path".to_string(), path.to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(sni) = payload.get("sni").and_then(|item|.
    if let Some(sni) = payload.get("sni").and_then(|item| item.as_str()) {
        // Проверяем условие: !sni.is_empty() {.
        if !sni.is_empty() {
            // Выполняем операцию: query.insert("sni".to_string(), sni.to_string());.
            query.insert("sni".to_string(), sni.to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(alpn) = payload.get("alpn").and_then(|ite.
    if let Some(alpn) = payload.get("alpn").and_then(|item| item.as_str()) {
        // Проверяем условие: !alpn.is_empty() {.
        if !alpn.is_empty() {
            // Выполняем операцию: query.insert("alpn".to_string(), alpn.to_string());.
            query.insert("alpn".to_string(), alpn.to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(fp) = payload.get("fp").and_then(|item| i.
    if let Some(fp) = payload.get("fp").and_then(|item| item.as_str()) {
        // Проверяем условие: !fp.is_empty() {.
        if !fp.is_empty() {
            // Выполняем операцию: query.insert("fp".to_string(), fp.to_string());.
            query.insert("fp".to_string(), fp.to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную vnext .
    let mut vnext = server_address(server);
    // Выполняем операцию: vnext["users"] = json!([{.
    vnext["users"] = json!([{
        // Выполняем операцию: "id": id,.
        "id": id,
        // Выполняем операцию: "alterId": alter_id,.
        "alterId": alter_id,
        // Выполняем операцию: "security": "auto".
        "security": "auto"
    // Закрываем блок.
    }]);

    // Выполняем операцию: Ok(json!({.
    Ok(json!({
        // Выполняем операцию: "tag": "proxy",.
        "tag": "proxy",
        // Выполняем операцию: "protocol": "vmess",.
        "protocol": "vmess",
        // Выполняем операцию: "settings": { "vnext": [vnext] },.
        "settings": { "vnext": [vnext] },
        // Выполняем операцию: "streamSettings": stream_settings(&query).
        "streamSettings": stream_settings(&query)
    // Закрываем блок.
    }))
    // Закрываем блок.
}

// Объявляем функцию trojan_outbound.
fn trojan_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    // Объявляем переменную query .
    let query = parse_query_map(&server.link);
    // Объявляем переменную password .
    let password = credentials_of(&server.link, "trojan://")?;

    // Объявляем переменную entry .
    let mut entry = server_address(server);
    // Выполняем операцию: entry["password"] = json!(password);.
    entry["password"] = json!(password);

    // Выполняем операцию: Ok(json!({.
    Ok(json!({
        // Выполняем операцию: "tag": "proxy",.
        "tag": "proxy",
        // Выполняем операцию: "protocol": "trojan",.
        "protocol": "trojan",
        // Выполняем операцию: "settings": { "servers": [entry] },.
        "settings": { "servers": [entry] },
        // Выполняем операцию: "streamSettings": stream_settings(&query).
        "streamSettings": stream_settings(&query)
    // Закрываем блок.
    }))
    // Закрываем блок.
}

// Объявляем функцию shadowsocks_outbound.
fn shadowsocks_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    // Объявляем переменную (method, password) .
    let (method, password) = parse_ss_credentials(&server.link)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("shadowsocks ссылка пов.
        .ok_or_else(|| AppError::custom("shadowsocks ссылка повреждена"))?;

    // Объявляем переменную entry .
    let mut entry = server_address(server);
    // Выполняем операцию: entry["method"] = json!(method);.
    entry["method"] = json!(method);
    // Выполняем операцию: entry["password"] = json!(password);.
    entry["password"] = json!(password);

    // Выполняем операцию: Ok(json!({.
    Ok(json!({
        // Выполняем операцию: "tag": "proxy",.
        "tag": "proxy",
        // Выполняем операцию: "protocol": "shadowsocks",.
        "protocol": "shadowsocks",
        // Выполняем операцию: "settings": { "servers": [entry] },.
        "settings": { "servers": [entry] },
        // Выполняем операцию: "streamSettings": { "network": "tcp" }.
        "streamSettings": { "network": "tcp" }
    // Закрываем блок.
    }))
    // Закрываем блок.
}

// Объявляем функцию socks_outbound.
fn socks_outbound(server: &SubscriptionServer) -> AppResult<Value> {
    // Объявляем переменную credentials .
    let credentials = credentials_of(&server.link, "socks://")
        // Выполняем операцию: .or_else(|_| credentials_of(&server.link, "socks5://")).
        .or_else(|_| credentials_of(&server.link, "socks5://"))
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Объявляем переменную entry .
    let mut entry = server_address(server);

    // Проверяем условие: let Some((user, password)) = credentials.split_onc.
    if let Some((user, password)) = credentials.split_once(':') {
        // Выполняем операцию: entry["users"] = json!([{ "user": user, "pass": passwor.
        entry["users"] = json!([{ "user": user, "pass": password }]);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(json!({.
    Ok(json!({
        // Выполняем операцию: "tag": "proxy",.
        "tag": "proxy",
        // Выполняем операцию: "protocol": "socks",.
        "protocol": "socks",
        // Выполняем операцию: "settings": { "servers": [entry] },.
        "settings": { "servers": [entry] },
        // Выполняем операцию: "streamSettings": { "network": "tcp" }.
        "streamSettings": { "network": "tcp" }
    // Закрываем блок.
    }))
    // Закрываем блок.
}

// Объявляем функцию credentials_of.
fn credentials_of(link: &str, prefix: &str) -> AppResult<String> {
    // Объявляем переменную rest .
    let rest = link
        // Выполняем операцию: .strip_prefix(prefix).
        .strip_prefix(prefix)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Ссылка повреждена"))?;.
        .ok_or_else(|| AppError::custom("Ссылка повреждена"))?;
    // Объявляем переменную (main, _) .
    let (main, _) = match rest.split_once('#') {
        // Выполняем операцию: Some((main, fragment)) => (main, fragment),.
        Some((main, fragment)) => (main, fragment),
        // Выполняем операцию: None => (rest, ""),.
        None => (rest, ""),
        // Закрываем блок.
    };
    // Объявляем переменную (main, _) .
    let (main, _) = match main.split_once('?') {
        // Выполняем операцию: Some((main, query)) => (main, query),.
        Some((main, query)) => (main, query),
        // Выполняем операцию: None => (main, ""),.
        None => (main, ""),
        // Закрываем блок.
    };

    // Объявляем переменную credentials .
    let credentials = match main.rsplit_once('@') {
        // Выполняем операцию: Some((credentials, _)) => credentials,.
        Some((credentials, _)) => credentials,
        // Выполняем операцию: None => return Err(AppError::custom("В ссылке нет учётн.
        None => return Err(AppError::custom("В ссылке нет учётных данных")),
        // Закрываем блок.
    };

    // Проверяем условие: credentials.is_empty() {.
    if credentials.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Пустые учётные данные"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(credentials.to_string()).
    Ok(credentials.to_string())
    // Закрываем блок.
}

// Объявляем функцию stream_settings.
fn stream_settings(query: &BTreeMap<String, String>) -> Value {
    // Объявляем переменную network .
    let network = query
        // Выполняем операцию: .get("type").
        .get("type")
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .unwrap_or("tcp").
        .unwrap_or("tcp")
        // Выполняем операцию: .to_string();.
        .to_string();
    // Объявляем переменную security .
    let security = query
        // Выполняем операцию: .get("security").
        .get("security")
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .unwrap_or("none").
        .unwrap_or("none")
        // Выполняем операцию: .to_string();.
        .to_string();

    // Объявляем переменную settings .
    let mut settings = Map::new();
    // Выполняем операцию: settings.insert("network".to_string(), json!(network));.
    settings.insert("network".to_string(), json!(network));
    // Выполняем операцию: settings.insert("security".to_string(), json!(security).
    settings.insert("security".to_string(), json!(security));

    // Объявляем переменную sni .
    let sni = query
        // Выполняем операцию: .get("sni").
        .get("sni")
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();
    // Объявляем переменную host .
    let host = query
        // Выполняем операцию: .get("host").
        .get("host")
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();
    // Объявляем переменную fingerprint .
    let fingerprint = query
        // Выполняем операцию: .get("fp").
        .get("fp")
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();

    // Проверяем условие: security == "tls" {.
    if security == "tls" {
        // Объявляем переменную tls .
        let mut tls = Map::new();

        // Проверяем условие: !sni.is_empty() {.
        if !sni.is_empty() {
            // Выполняем операцию: tls.insert("serverName".to_string(), json!(sni));.
            tls.insert("serverName".to_string(), json!(sni));
            // Закрываем блок.
        }

        // Проверяем условие: !fingerprint.is_empty() {.
        if !fingerprint.is_empty() {
            // Выполняем операцию: tls.insert("fingerprint".to_string(), json!(fingerprint.
            tls.insert("fingerprint".to_string(), json!(fingerprint));
            // Закрываем блок.
        }

        // Проверяем условие: let Some(alpn) = query.get("alpn").map(String::as_.
        if let Some(alpn) = query.get("alpn").map(String::as_str) {
            // Объявляем переменную items.
            let items: Vec<&str> = alpn.split(',').collect();
            // Выполняем операцию: tls.insert("alpn".to_string(), json!(items));.
            tls.insert("alpn".to_string(), json!(items));
            // Закрываем блок.
        }

        // Выполняем операцию: tls.insert("allowInsecure".to_string(), json!(false));.
        tls.insert("allowInsecure".to_string(), json!(false));
        // Выполняем операцию: settings.insert("tlsSettings".to_string(), Value::Objec.
        settings.insert("tlsSettings".to_string(), Value::Object(tls));
        // Закрываем блок.
    }

    // Проверяем условие: security == "reality" {.
    if security == "reality" {
        // Объявляем переменную public_key .
        let public_key = query
            // Выполняем операцию: .get("pbk").
            .get("pbk")
            // Выполняем операцию: .map(String::as_str).
            .map(String::as_str)
            // Выполняем операцию: .unwrap_or_default().
            .unwrap_or_default()
            // Выполняем операцию: .to_string();.
            .to_string();

        // Проверяем условие: public_key.is_empty() {.
        if public_key.is_empty() {
            // Возвращаем результат из функции.
            return Value::Object(settings);
            // Закрываем блок.
        }

        // Объявляем переменную short_id .
        let short_id = query
            // Выполняем операцию: .get("sid").
            .get("sid")
            // Выполняем операцию: .map(String::as_str).
            .map(String::as_str)
            // Выполняем операцию: .unwrap_or_default().
            .unwrap_or_default()
            // Выполняем операцию: .to_string();.
            .to_string();
        // Объявляем переменную spider .
        let spider = query
            // Выполняем операцию: .get("spx").
            .get("spx")
            // Выполняем операцию: .map(String::as_str).
            .map(String::as_str)
            // Выполняем операцию: .unwrap_or("/").
            .unwrap_or("/")
            // Выполняем операцию: .to_string();.
            .to_string();

        // Выполняем операцию: settings.insert(.
        settings.insert(
            // Выполняем операцию: "realitySettings".to_string(),.
            "realitySettings".to_string(),
            // Выполняем операцию: json!({.
            json!({
                // Выполняем операцию: "serverName": sni,.
                "serverName": sni,
                // Выполняем операцию: "fingerprint": if fingerprint.is_empty() { "chrome".to_.
                "fingerprint": if fingerprint.is_empty() { "chrome".to_string() } else { fingerprint },
                // Выполняем операцию: "publicKey": public_key,.
                "publicKey": public_key,
                // Выполняем операцию: "shortId": short_id,.
                "shortId": short_id,
                // Выполняем операцию: "spiderX": spider.
                "spiderX": spider
            // Закрываем блок.
            }),
        // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match network.as_str() {
        // Выполняем операцию: "ws" => {.
        "ws" => {
            // Объявляем переменную path .
            let path = query
                // Выполняем операцию: .get("path").
                .get("path")
                // Выполняем операцию: .map(String::as_str).
                .map(String::as_str)
                // Выполняем операцию: .unwrap_or("/").
                .unwrap_or("/")
                // Выполняем операцию: .to_string();.
                .to_string();

            // Выполняем операцию: settings.insert(.
            settings.insert(
                // Выполняем операцию: "wsSettings".to_string(),.
                "wsSettings".to_string(),
                // Выполняем операцию: json!({.
                json!({
                    // Выполняем операцию: "path": path,.
                    "path": path,
                    // Выполняем операцию: "headers": { "Host": host }.
                    "headers": { "Host": host }
                // Закрываем блок.
                }),
                // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }
        // Выполняем операцию: "grpc" => {.
        "grpc" => {
            // Объявляем переменную service .
            let service = query
                // Выполняем операцию: .get("servicename").
                .get("servicename")
                // Выполняем операцию: .map(String::as_str).
                .map(String::as_str)
                // Выполняем операцию: .unwrap_or_default().
                .unwrap_or_default()
                // Выполняем операцию: .to_string();.
                .to_string();

            // Выполняем операцию: settings.insert(.
            settings.insert(
                // Выполняем операцию: "grpcSettings".to_string(),.
                "grpcSettings".to_string(),
                // Выполняем операцию: json!({ "serviceName": service }),.
                json!({ "serviceName": service }),
                // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }
        // Выполняем операцию: "tcp" => {.
        "tcp" => {
            // Объявляем переменную header .
            let header = query
                // Выполняем операцию: .get("headertype").
                .get("headertype")
                // Выполняем операцию: .map(String::as_str).
                .map(String::as_str)
                // Выполняем операцию: .unwrap_or_default().
                .unwrap_or_default()
                // Выполняем операцию: .to_string();.
                .to_string();

            // Проверяем условие: header == "http" {.
            if header == "http" {
                // Выполняем операцию: settings.insert(.
                settings.insert(
                    // Выполняем операцию: "tcpSettings".to_string(),.
                    "tcpSettings".to_string(),
                    // Выполняем операцию: json!({.
                    json!({
                        // Выполняем операцию: "header": {.
                        "header": {
                            // Выполняем операцию: "type": "http",.
                            "type": "http",
                            // Выполняем операцию: "request": { "headers": { "Host": [host] } }.
                            "request": { "headers": { "Host": [host] } }
                        // Закрываем блок.
                        }
                    // Закрываем блок.
                    }),
                    // Закрываем выражение или коллекцию.
                );
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Выполняем операцию: _ => {}.
        _ => {} // Закрываем блок.
    }

    // Выполняем операцию: Value::Object(settings).
    Value::Object(settings)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_xray_config_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
