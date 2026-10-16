use std::collections::BTreeMap;

use base64::Engine;
use serde::Serialize;

use crate::error::{AppError, AppResult};

const MAX_SUBSCRIPTION_BYTES: usize = 4 * 1024 * 1024;
/// Сколько серверов принимаем из одной подписки.
///
/// Раньше стоял лимит в один сервер: подписка с сотней локаций показывала
/// только первую, и выбрать другую было невозможно. 200 — с запасом для
/// крупных провайдеров, при этом список не разрастается настолько, чтобы
/// подвисать интерфейс.
const MAX_SERVERS: usize = 200;
const SUPPORTED_SCHEMES: [&str; 6] = ["vless", "vmess", "trojan", "ss", "socks", "socks5"];

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SubscriptionServer {
    pub id: String,
    pub name: String,
    pub protocol: String,
    pub host: String,
    pub port: u16,
    pub link: String,
}

pub fn decode_subscription(body: &str) -> String {
    let trimmed = body.trim();

    if trimmed.contains("://") {
        return trimmed.to_string();
    }

    for engine in [
        &base64::engine::general_purpose::STANDARD,
        &base64::engine::general_purpose::URL_SAFE,
        &base64::engine::general_purpose::STANDARD_NO_PAD,
        &base64::engine::general_purpose::URL_SAFE_NO_PAD,
    ] {
        if let Ok(bytes) = engine.decode(trimmed) {
            if let Ok(text) = String::from_utf8(bytes) {
                return text;
            }
        }
    }

    trimmed.to_string()
}

pub fn parse_subscription(body: &str) -> Vec<SubscriptionServer> {
    let decoded = decode_subscription(body);
    let mut servers = Vec::new();
    let mut seen = std::collections::BTreeSet::new();

    for line in decoded.lines() {
        let link = line.trim();

        if link.is_empty() || link.starts_with('#') || link.starts_with("//") {
            continue;
        }

        if servers.len() >= MAX_SERVERS {
            break;
        }

        let Some(server) = parse_link(link) else {
            continue;
        };

        if seen.insert(server.id.clone()) {
            servers.push(server);
        }
    }

    servers
}

pub fn parse_link(link: &str) -> Option<SubscriptionServer> {
    let scheme = link.split("://").next()?.to_ascii_lowercase();

    if !SUPPORTED_SCHEMES.contains(&scheme.as_str()) {
        return None;
    }

    let server = match scheme.as_str() {
        "vmess" => parse_vmess(link)?,
        "ss" => parse_shadowsocks(link)?,
        "vless" => parse_standard(link, "vless")?,
        "trojan" => parse_standard(link, "trojan")?,
        "socks" | "socks5" => parse_standard(link, "socks")?,
        _ => return None,
    };

    Some(server)
}

fn parse_standard(link: &str, protocol: &str) -> Option<SubscriptionServer> {
    let rest = link.strip_prefix(&format!("{protocol}://"))?;
    let (main, name) = split_fragment(rest);
    let (_, authority) = split_credentials(&main);
    let (host, port) = split_host_port(authority)?;

    if host.is_empty() {
        return None;
    }

    Some(build(link, protocol, &name, &host, port))
}

fn parse_vmess(link: &str) -> Option<SubscriptionServer> {
    let payload = link.strip_prefix("vmess://")?;
    let json = decode_base64_text(payload)?;
    let value: serde_json::Value = serde_json::from_str(&json).ok()?;

    let host = value.get("add")?.as_str()?.trim().to_string();
    let port = parse_port(value.get("port"))?;
    let name = value
        .get("ps")
        .and_then(|item| item.as_str())
        .map(|item| item.trim().to_string())
        .unwrap_or_default();

    if host.is_empty() {
        return None;
    }

    Some(build(link, "vmess", &name, &host, port))
}

fn parse_shadowsocks(link: &str) -> Option<SubscriptionServer> {
    let rest = link.strip_prefix("ss://")?;
    let (main, name) = split_fragment(rest);
    let (queryless, _) = split_query(&main);
    let (_, direct_authority) = split_credentials(queryless);

    if let Some((host, port)) = split_host_port(direct_authority) {
        if !host.is_empty() {
            return Some(build(link, "ss", &name, &host, port));
        }
    }

    let decoded = decode_base64_text(queryless)?;
    let (_, authority) = split_credentials(&decoded);
    let (host, port) = split_host_port(authority)?;

    if host.is_empty() {
        return None;
    }

    Some(build(link, "ss", &name, &host, port))
}

fn build(
    link: &str,
    protocol: &str,
    name: &str,
    host: &str,
    port: u16,
) -> SubscriptionServer {
    let fallback = format!("{host}:{port}");
    let clean_name = if name.trim().is_empty() {
        fallback
    } else {
        name.trim().to_string()
    };

    SubscriptionServer {
        id: hash_link(link),
        name: clean_name,
        protocol: protocol.to_string(),
        host: host.to_string(),
        port,
        link: link.to_string(),
    }
}

fn split_fragment(value: &str) -> (String, String) {
    match value.split_once('#') {
        Some((main, fragment)) => (main.to_string(), percent_decode(fragment)),
        None => (value.to_string(), String::new()),
    }
}

fn split_query(value: &str) -> (&str, &str) {
    match value.split_once('?') {
        Some((main, query)) => (main, query),
        None => (value, ""),
    }
}

fn split_credentials(value: &str) -> (&str, &str) {
    match value.rsplit_once('@') {
        Some((credentials, authority)) => (credentials, authority),
        None => ("", value),
    }
}

fn split_host_port(authority: &str) -> Option<(String, u16)> {
    let (main, _) = split_query(authority);

    if let Some(rest) = main.strip_prefix('[') {
        let (host, tail) = rest.split_once(']')?;
        let port = tail.strip_prefix(':').and_then(parse_port_text)?;

        return Some((host.to_string(), port));
    }

    let (host, port) = main.rsplit_once(':')?;
    let port = parse_port_text(port)?;

    Some((host.trim().to_string(), port))
}

fn parse_port(value: Option<&serde_json::Value>) -> Option<u16> {
    match value? {
        serde_json::Value::Number(number) => number.as_u64().and_then(to_port),
        serde_json::Value::String(text) => parse_port_text(text),
        _ => None,
    }
}

fn parse_port_text(text: &str) -> Option<u16> {
    text.trim().parse::<u64>().ok().and_then(to_port)
}

fn to_port(value: u64) -> Option<u16> {
    if value == 0 || value > u64::from(u16::MAX) {
        return None;
    }

    Some(value as u16)
}

fn decode_base64_text(value: &str) -> Option<String> {
    let normalized = value.trim().replace('-', "+").replace('_', "/");

    for candidate in [
        normalized.clone(),
        normalized.trim_end_matches('=').to_string(),
    ] {
        if let Ok(bytes) = base64::engine::general_purpose::STANDARD.decode(candidate) {
            if let Ok(text) = String::from_utf8(bytes) {
                return Some(text);
            }
        }
    }

    None
}

fn percent_decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    let mut index = 0;

    while index < bytes.len() {
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            let hex = std::str::from_utf8(&bytes[index + 1..index + 3]).ok();

            if let Some(byte) = hex.and_then(|text| u8::from_str_radix(text, 16).ok()) {
                out.push(byte);
                index += 3;
                continue;
            }
        }

        if bytes[index] == b'+' {
            out.push(b' ');
            index += 1;
            continue;
        }

        out.push(bytes[index]);
        index += 1;
    }

    String::from_utf8_lossy(&out).trim().to_string()
}

fn hash_link(link: &str) -> String {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;

    for byte in link.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }

    format!("srv_{hash:016x}")
}

pub fn parse_query_map(link: &str) -> BTreeMap<String, String> {
    let Some((_, rest)) = link.split_once('?') else {
        return BTreeMap::new();
    };

    let (query, _) = split_fragment(rest);
    let mut map = BTreeMap::new();

    for pair in query.split('&') {
        let (key, value) = match pair.split_once('=') {
            Some((key, value)) => (key, value),
            None => (pair, ""),
        };

        if !key.is_empty() {
            map.insert(key.to_ascii_lowercase(), percent_decode(value));
        }
    }

    map
}

pub fn decode_vmess_payload(link: &str) -> Option<serde_json::Value> {
    let payload = link.strip_prefix("vmess://")?;
    let json = decode_base64_text(payload)?;

    serde_json::from_str(&json).ok()
}

pub fn parse_ss_credentials(link: &str) -> Option<(String, String)> {
    let rest = link.strip_prefix("ss://")?;
    let (main, _) = split_fragment(rest);
    let (queryless, _) = split_query(&main);
    let (credentials, _) = split_credentials(queryless);

    if credentials.is_empty() {
        let decoded = decode_base64_text(queryless)?;
        let (credentials, _) = split_credentials(&decoded);

        return credentials
            .split_once(':')
            .map(|(method, password)| (method.to_string(), password.to_string()));
    }

    let decoded = decode_base64_text(credentials)?;

    decoded
        .split_once(':')
        .map(|(method, password)| (method.to_string(), password.to_string()))
}

pub fn validate_subscription_url(url: &str) -> AppResult<String> {
    let trimmed = url.trim();

    if trimmed.len() > 2_048 {
        return Err(AppError::custom("Ссылка подписки слишком длинная"));
    }

    let lower = trimmed.to_ascii_lowercase();

    if !lower.starts_with("https://") && !lower.starts_with("http://") {
        return Err(AppError::custom("Ссылка должна начинаться с https://"));
    }

    if trimmed.contains(char::is_whitespace) {
        return Err(AppError::custom("Ссылка содержит пробелы"));
    }

    Ok(trimmed.to_string())
}

pub fn body_size_ok(len: usize) -> bool {
    len <= MAX_SUBSCRIPTION_BYTES
}

pub async fn fetch_subscription(url: &str) -> AppResult<Vec<SubscriptionServer>> {
    let url = validate_subscription_url(url)?;

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .user_agent("ZapretManager/0.1 (subscription)")
        .build()
        .map_err(|error| AppError::custom(format!("HTTP клиент не создан: {error}")))?;

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|error| AppError::custom(format!("Подписка недоступна: {error}")))?;

    if !response.status().is_success() {
        return Err(AppError::custom(format!(
            "Сервер подписки ответил {}",
            response.status().as_u16()
        )));
    }

    let body = response
        .text()
        .await
        .map_err(|error| AppError::custom(format!("Ответ не прочитан: {error}")))?;

    if !body_size_ok(body.len()) {
        return Err(AppError::custom("Подписка слишком большая"));
    }

    let servers = parse_subscription(&body);

    if servers.is_empty() {
        return Err(AppError::custom(
            "В подписке не найдено поддерживаемых серверов",
        ));
    }

    Ok(servers)
}

#[cfg(test)]
#[path = "vpn_subscription_tests.rs"]
mod tests;