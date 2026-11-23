// Подключаем модули: std::collections::BTreeMap;.
use std::collections::BTreeMap;

// Подключаем модули: base64::Engine;.
use base64::Engine;
// Подключаем модули: futures_util::StreamExt;.
use futures_util::StreamExt;
// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: url::Url;.
use url::Url;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::url_validator::is_public_host;.
use crate::security::url_validator::is_public_host;

// Объявляем константу MAX_SUBSCRIPTION_BYTES.
const MAX_SUBSCRIPTION_BYTES: usize = 4 * 1024 * 1024;

/// User-Agent для запроса подписки.
///
/// Подписки раздают не весь список: многие провайдеры для незнакомого клиента
/// отдают один пробный узел вместо всех локаций. С запросом
/// «ZapretManager/0.1» список приходил из одной строки, и два запроса подряд
/// давали разные серверы. Поэтому запрос идёт от имени обычного VPN-клиента,
/// как это делают v2rayNG, Hiddify и остальные.
// Объявляем константу SUBSCRIPTION_USER_AGENT.
const SUBSCRIPTION_USER_AGENT: &str = "v2rayNG/1.9.0";
/// Сколько серверов принимаем из одной подписки.
///
/// Раньше стоял лимит в один сервер: подписка с сотней локаций показывала
/// только первую, и выбрать другую было невозможно. 200 — с запасом для
/// крупных провайдеров, при этом список не разрастается настолько, чтобы
/// подвисать интерфейс.
// Объявляем константу MAX_SERVERS.
const MAX_SERVERS: usize = 200;
// Объявляем константу SUPPORTED_SCHEMES.
const SUPPORTED_SCHEMES: [&str; 6] = ["vless", "vmess", "trojan", "ss", "socks", "socks5"];

/// Метаданные подписки: срок и расход трафика.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq, Default)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру SubscriptionMeta.
pub struct SubscriptionMeta {
    /// Израсходованный трафик, байты.
    // Выполняем операцию: pub traffic_used_bytes: u64,.
    pub traffic_used_bytes: u64,
    /// Общий лимит, байты. `0` — лимита нет или он не указан.
    // Выполняем операцию: pub traffic_limit_bytes: u64,.
    pub traffic_limit_bytes: u64,
    /// Момент окончания подписки, UNIX-время.
    // Выполняем операцию: pub expires_at: Option<i64>,.
    pub expires_at: Option<i64>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl SubscriptionMeta {
    /// Из заголовка `Subscription-Userinfo`:
    /// `upload=...; download=...; total=...; expire=...`.
    // Объявляем функцию parse_userinfo.
    pub fn parse_userinfo(raw: &str) -> Self {
        // Объявляем переменную meta .
        let mut meta = Self::default();
        // Объявляем переменную traffic_used_bytes .
        let mut traffic_used_bytes = 0_u64;
        // Объявляем переменную saw_traffic .
        let mut saw_traffic = false;

        // Перебираем элементы коллекции.
        for pair in raw.split(';') {
            // Объявляем переменную pair .
            let pair = pair.trim();
            // Объявляем переменную Some((key, value)) .
            let Some((key, value)) = pair.split_once('=') else {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            };

            // Объявляем переменную value .
            let value = value.trim();
            // Объявляем переменную number .
            let number = value.parse::<u64>();

            // Выбираем вариант по значению.
            match key.trim().to_ascii_lowercase().as_str() {
                // Выполняем операцию: "upload" => {.
                "upload" => {
                    // Выполняем операцию: traffic_used_bytes += number.unwrap_or(0);.
                    traffic_used_bytes += number.unwrap_or(0);
                    // Выполняем операцию: saw_traffic = true;.
                    saw_traffic = true;
                    // Закрываем блок.
                }
                // Выполняем операцию: "download" => {.
                "download" => {
                    // Выполняем операцию: traffic_used_bytes += number.unwrap_or(0);.
                    traffic_used_bytes += number.unwrap_or(0);
                    // Выполняем операцию: saw_traffic = true;.
                    saw_traffic = true;
                    // Закрываем блок.
                }
                // Выполняем операцию: "total" => {.
                "total" => {
                    // Выполняем операцию: meta.traffic_limit_bytes = number.unwrap_or(0);.
                    meta.traffic_limit_bytes = number.unwrap_or(0);
                    // Закрываем блок.
                }
                // Выполняем операцию: "expire" => {.
                "expire" => {
                    // Выполняем операцию: meta.expires_at = number.
                    meta.expires_at = number
                        // Выполняем операцию: .ok().
                        .ok()
                        // Выполняем операцию: .and_then(|interval| i64::try_from(interval).ok()).
                        .and_then(|interval| i64::try_from(interval).ok())
                        // Выполняем операцию: .filter(|expires| *expires > 0);.
                        .filter(|expires| *expires > 0);
                    // Закрываем блок.
                }
                // Выполняем операцию: _ => {}.
                _ => {} // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Проверяем условие: saw_traffic {.
        if saw_traffic {
            // Выполняем операцию: meta.traffic_used_bytes = traffic_used_bytes;.
            meta.traffic_used_bytes = traffic_used_bytes;
            // Закрываем блок.
        }

        // Выполняем операцию: meta.
        meta
        // Закрываем блок.
    }

    /// Название профиля из `Profile-Title`. Значение может приходить
    /// как открытым текстом, так и в base64; оба варианта читаем.
    // Объявляем функцию parse_title.
    pub fn parse_title(raw: &str) -> Option<String> {
        // Объявляем переменную raw .
        let raw = raw.trim();

        // Проверяем условие: raw.is_empty() {.
        if raw.is_empty() {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(encoded) = raw.strip_prefix("base64:") {.
        if let Some(encoded) = raw.strip_prefix("base64:") {
            // Проверяем условие: let Some(decoded) = decode_base64_text(encoded) {.
            if let Some(decoded) = decode_base64_text(encoded) {
                // Объявляем переменную title .
                let title = decoded.trim();
                // Возвращаем результат из функции.
                return (!title.is_empty()).then(|| title.to_string());
                // Закрываем блок.
            }

            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }

        // Выполняем операцию: Some(raw.to_string()).
        Some(raw.to_string())
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Ответ подписки: серверы и метаданные из заголовков.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру SubscriptionPayload.
pub struct SubscriptionPayload {
    // Выполняем операцию: pub servers: Vec<SubscriptionServer>,.
    pub servers: Vec<SubscriptionServer>,
    // Выполняем операцию: pub meta: SubscriptionMeta,.
    pub meta: SubscriptionMeta,
    /// Название подписки, если провайдер его отдал.
    // Выполняем операцию: pub title: Option<String>,.
    pub title: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру SubscriptionServer.
pub struct SubscriptionServer {
    // Выполняем операцию: pub id: String,.
    pub id: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub protocol: String,.
    pub protocol: String,
    // Выполняем операцию: pub host: String,.
    pub host: String,
    // Выполняем операцию: pub port: u16,.
    pub port: u16,
    // Выполняем операцию: pub link: String,.
    pub link: String,
    /// Транспорт из ссылки (type=ws, type=tcp, type=grpc и так далее).
    // Выполняем операцию: pub transport: String,.
    pub transport: String,
    /// Шифрование канала (security=reality, security=tls, пусто — без TLS).
    // Выполняем операцию: pub security: String,.
    pub security: String,
    // Закрываем блок.
}

// Объявляем функцию decode_subscription.
pub fn decode_subscription(body: &str) -> String {
    // Объявляем переменную trimmed .
    let trimmed = body.trim();

    // Проверяем условие: trimmed.contains("://") {.
    if trimmed.contains("://") {
        // Возвращаем результат из функции.
        return trimmed.to_string();
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for engine in [
        // Выполняем операцию: &base64::engine::general_purpose::STANDARD,.
        &base64::engine::general_purpose::STANDARD,
        // Выполняем операцию: &base64::engine::general_purpose::URL_SAFE,.
        &base64::engine::general_purpose::URL_SAFE,
        // Выполняем операцию: &base64::engine::general_purpose::STANDARD_NO_PAD,.
        &base64::engine::general_purpose::STANDARD_NO_PAD,
        // Выполняем операцию: &base64::engine::general_purpose::URL_SAFE_NO_PAD,.
        &base64::engine::general_purpose::URL_SAFE_NO_PAD,
        // Выполняем операцию: ] {.
    ] {
        // Проверяем условие: let Ok(bytes) = engine.decode(trimmed) {.
        if let Ok(bytes) = engine.decode(trimmed) {
            // Проверяем условие: let Ok(text) = String::from_utf8(bytes) {.
            if let Ok(text) = String::from_utf8(bytes) {
                // Возвращаем результат из функции.
                return text;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: trimmed.to_string().
    trimmed.to_string()
    // Закрываем блок.
}

// Объявляем функцию parse_subscription.
pub fn parse_subscription(body: &str) -> Vec<SubscriptionServer> {
    // Объявляем переменную decoded .
    let decoded = decode_subscription(body);
    // Объявляем переменную servers .
    let mut servers = Vec::new();
    // Объявляем переменную seen .
    let mut seen = std::collections::BTreeSet::new();

    // Перебираем элементы коллекции.
    for line in decoded.lines() {
        // Объявляем переменную link .
        let link = line.trim();

        // Проверяем условие: link.is_empty() || link.starts_with('#') || link.s.
        if link.is_empty() || link.starts_with('#') || link.starts_with("//") {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: servers.len() >= MAX_SERVERS {.
        if servers.len() >= MAX_SERVERS {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Объявляем переменную Some(server) .
        let Some(server) = parse_link(link) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: seen.insert(server.id.clone()) {.
        if seen.insert(server.id.clone()) {
            // Выполняем операцию: servers.push(server);.
            servers.push(server);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: servers.
    servers
    // Закрываем блок.
}

// Объявляем функцию parse_link.
pub fn parse_link(link: &str) -> Option<SubscriptionServer> {
    // Объявляем переменную scheme .
    let scheme = link.split("://").next()?.to_ascii_lowercase();

    // Проверяем условие: !SUPPORTED_SCHEMES.contains(&scheme.as_str()) {.
    if !SUPPORTED_SCHEMES.contains(&scheme.as_str()) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную server .
    let server = match scheme.as_str() {
        // Выполняем операцию: "vmess" => parse_vmess(link)?,.
        "vmess" => parse_vmess(link)?,
        // Выполняем операцию: "ss" => parse_shadowsocks(link)?,.
        "ss" => parse_shadowsocks(link)?,
        // Выполняем операцию: "vless" => parse_standard(link, "vless")?,.
        "vless" => parse_standard(link, "vless")?,
        // Выполняем операцию: "trojan" => parse_standard(link, "trojan")?,.
        "trojan" => parse_standard(link, "trojan")?,
        // Выполняем операцию: "socks" | "socks5" => parse_standard(link, "socks")?,.
        "socks" | "socks5" => parse_standard(link, "socks")?,
        // Выполняем операцию: _ => return None,.
        _ => return None,
        // Закрываем блок.
    };

    // Выполняем операцию: Some(server).
    Some(server)
    // Закрываем блок.
}

// Объявляем функцию parse_standard.
fn parse_standard(link: &str, protocol: &str) -> Option<SubscriptionServer> {
    // Объявляем переменную rest .
    let rest = link.strip_prefix(&format!("{protocol}://"))?;
    // Объявляем переменную (main, name) .
    let (main, name) = split_fragment(rest);
    // Объявляем переменную (_, authority) .
    let (_, authority) = split_credentials(&main);
    // Объявляем переменную (host, port) .
    let (host, port) = split_host_port(authority)?;

    // Проверяем условие: host.is_empty() {.
    if host.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(build(link, protocol, &name, &host, port)).
    Some(build(link, protocol, &name, &host, port))
    // Закрываем блок.
}

// Объявляем функцию parse_vmess.
fn parse_vmess(link: &str) -> Option<SubscriptionServer> {
    // Объявляем переменную payload .
    let payload = link.strip_prefix("vmess://")?;
    // Объявляем переменную json .
    let json = decode_base64_text(payload)?;
    // Объявляем переменную value.
    let value: serde_json::Value = serde_json::from_str(&json).ok()?;

    // Объявляем переменную host .
    let host = value.get("add")?.as_str()?.trim().to_string();
    // Объявляем переменную port .
    let port = parse_port(value.get("port"))?;
    // Объявляем переменную name .
    let name = value
        // Выполняем операцию: .get("ps").
        .get("ps")
        // Выполняем операцию: .and_then(|item| item.as_str()).
        .and_then(|item| item.as_str())
        // Выполняем операцию: .map(|item| item.trim().to_string()).
        .map(|item| item.trim().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Проверяем условие: host.is_empty() {.
    if host.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(build(link, "vmess", &name, &host, port)).
    Some(build(link, "vmess", &name, &host, port))
    // Закрываем блок.
}

// Объявляем функцию parse_shadowsocks.
fn parse_shadowsocks(link: &str) -> Option<SubscriptionServer> {
    // Объявляем переменную rest .
    let rest = link.strip_prefix("ss://")?;
    // Объявляем переменную (main, name) .
    let (main, name) = split_fragment(rest);
    // Объявляем переменную (queryless, _) .
    let (queryless, _) = split_query(&main);
    // Объявляем переменную (_, direct_authority) .
    let (_, direct_authority) = split_credentials(queryless);

    // Проверяем условие: let Some((host, port)) = split_host_port(direct_au.
    if let Some((host, port)) = split_host_port(direct_authority) {
        // Проверяем условие: !host.is_empty() {.
        if !host.is_empty() {
            // Возвращаем результат из функции.
            return Some(build(link, "ss", &name, &host, port));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную decoded .
    let decoded = decode_base64_text(queryless)?;
    // Объявляем переменную (_, authority) .
    let (_, authority) = split_credentials(&decoded);
    // Объявляем переменную (host, port) .
    let (host, port) = split_host_port(authority)?;

    // Проверяем условие: host.is_empty() {.
    if host.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(build(link, "ss", &name, &host, port)).
    Some(build(link, "ss", &name, &host, port))
    // Закрываем блок.
}

// Объявляем функцию build.
fn build(link: &str, protocol: &str, name: &str, host: &str, port: u16) -> SubscriptionServer {
    // Объявляем переменную fallback .
    let fallback = format!("{host}:{port}");
    // Объявляем переменную clean_name .
    let clean_name = if name.trim().is_empty() {
        // Выполняем операцию: fallback.
        fallback
    // Закрываем блок.
    } else {
        // Выполняем операцию: name.trim().to_string().
        name.trim().to_string()
        // Закрываем блок.
    };

    // Объявляем переменную query .
    let query = parse_query_map(link);
    // Объявляем переменную transport .
    let transport = query
        // Выполняем операцию: .get("type").
        .get("type")
        // Выполняем операцию: .map(|value| value.trim().to_lowercase()).
        .map(|value| value.trim().to_lowercase())
        // Выполняем операцию: .filter(|value| !value.is_empty()).
        .filter(|value| !value.is_empty())
        // Выполняем операцию: .unwrap_or_else(|| "tcp".to_string());.
        .unwrap_or_else(|| "tcp".to_string());
    // Объявляем переменную security .
    let security = query
        // Выполняем операцию: .get("security").
        .get("security")
        // Выполняем операцию: .map(|value| value.trim().to_lowercase()).
        .map(|value| value.trim().to_lowercase())
        // Выполняем операцию: .filter(|value| !value.is_empty() && value != "none").
        .filter(|value| !value.is_empty() && value != "none")
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: SubscriptionServer {.
    SubscriptionServer {
        // Выполняем операцию: id: hash_link(link),.
        id: hash_link(link),
        // Выполняем операцию: name: clean_name,.
        name: clean_name,
        // Выполняем операцию: protocol: protocol.to_string(),.
        protocol: protocol.to_string(),
        // Выполняем операцию: host: host.to_string(),.
        host: host.to_string(),
        // Выполняем операцию: port,.
        port,
        // Выполняем операцию: link: link.to_string(),.
        link: link.to_string(),
        // Выполняем операцию: transport,.
        transport,
        // Выполняем операцию: security,.
        security,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию split_fragment.
fn split_fragment(value: &str) -> (String, String) {
    // Выбираем вариант по значению.
    match value.split_once('#') {
        // Выполняем операцию: Some((main, fragment)) => (main.to_string(), percent_de.
        Some((main, fragment)) => (main.to_string(), percent_decode(fragment)),
        // Выполняем операцию: None => (value.to_string(), String::new()),.
        None => (value.to_string(), String::new()),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию split_query.
fn split_query(value: &str) -> (&str, &str) {
    // Выбираем вариант по значению.
    match value.split_once('?') {
        // Выполняем операцию: Some((main, query)) => (main, query),.
        Some((main, query)) => (main, query),
        // Выполняем операцию: None => (value, ""),.
        None => (value, ""),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию split_credentials.
fn split_credentials(value: &str) -> (&str, &str) {
    // Выбираем вариант по значению.
    match value.rsplit_once('@') {
        // Выполняем операцию: Some((credentials, authority)) => (credentials, authori.
        Some((credentials, authority)) => (credentials, authority),
        // Выполняем операцию: None => ("", value),.
        None => ("", value),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию split_host_port.
fn split_host_port(authority: &str) -> Option<(String, u16)> {
    // Объявляем переменную (main, _) .
    let (main, _) = split_query(authority);

    // Проверяем условие: let Some(rest) = main.strip_prefix('[') {.
    if let Some(rest) = main.strip_prefix('[') {
        // Объявляем переменную (host, tail) .
        let (host, tail) = rest.split_once(']')?;
        // Объявляем переменную port .
        let port = tail.strip_prefix(':').and_then(parse_port_text)?;

        // Возвращаем результат из функции.
        return Some((host.to_string(), port));
        // Закрываем блок.
    }

    // Объявляем переменную (host, port) .
    let (host, port) = main.rsplit_once(':')?;
    // Объявляем переменную port .
    let port = parse_port_text(port)?;

    // Выполняем операцию: Some((host.trim().to_string(), port)).
    Some((host.trim().to_string(), port))
    // Закрываем блок.
}

// Объявляем функцию parse_port.
fn parse_port(value: Option<&serde_json::Value>) -> Option<u16> {
    // Выбираем вариант по значению.
    match value? {
        // Выполняем операцию: serde_json::Value::Number(number) => number.as_u64().an.
        serde_json::Value::Number(number) => number.as_u64().and_then(to_port),
        // Выполняем операцию: serde_json::Value::String(text) => parse_port_text(text.
        serde_json::Value::String(text) => parse_port_text(text),
        // Выполняем операцию: _ => None,.
        _ => None,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию parse_port_text.
fn parse_port_text(text: &str) -> Option<u16> {
    // Выполняем операцию: text.trim().parse::<u64>().ok().and_then(to_port).
    text.trim().parse::<u64>().ok().and_then(to_port)
    // Закрываем блок.
}

// Объявляем функцию to_port.
fn to_port(value: u64) -> Option<u16> {
    // Проверяем условие: value == 0 || value > u64::from(u16::MAX) {.
    if value == 0 || value > u64::from(u16::MAX) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(value as u16).
    Some(value as u16)
    // Закрываем блок.
}

// Объявляем функцию decode_base64_text.
fn decode_base64_text(value: &str) -> Option<String> {
    // Объявляем переменную normalized .
    let normalized = value.trim().replace('-', "+").replace('_', "/");

    // Перебираем элементы коллекции.
    for candidate in [
        // Выполняем операцию: normalized.clone(),.
        normalized.clone(),
        // Выполняем операцию: normalized.trim_end_matches('=').to_string(),.
        normalized.trim_end_matches('=').to_string(),
        // Выполняем операцию: ] {.
    ] {
        // Проверяем условие: let Ok(bytes) = base64::engine::general_purpose::S.
        if let Ok(bytes) = base64::engine::general_purpose::STANDARD.decode(candidate) {
            // Проверяем условие: let Ok(text) = String::from_utf8(bytes) {.
            if let Ok(text) = String::from_utf8(bytes) {
                // Возвращаем результат из функции.
                return Some(text);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию percent_decode.
fn percent_decode(value: &str) -> String {
    // Объявляем переменную bytes .
    let bytes = value.as_bytes();
    // Объявляем переменную out.
    let mut out: Vec<u8> = Vec::with_capacity(bytes.len());
    // Объявляем переменную index .
    let mut index = 0;

    // Повторяем, пока выполняется условие.
    while index < bytes.len() {
        // Проверяем условие: bytes[index] == b'%' && index + 2 < bytes.len() {.
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            // Объявляем переменную hex .
            let hex = std::str::from_utf8(&bytes[index + 1..index + 3]).ok();

            // Проверяем условие: let Some(byte) = hex.and_then(|text| u8::from_str_.
            if let Some(byte) = hex.and_then(|text| u8::from_str_radix(text, 16).ok()) {
                // Выполняем операцию: out.push(byte);.
                out.push(byte);
                // Выполняем операцию: index += 3;.
                index += 3;
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Проверяем условие: bytes[index] == b'+' {.
        if bytes[index] == b'+' {
            // Выполняем операцию: out.push(b' ');.
            out.push(b' ');
            // Выполняем операцию: index += 1;.
            index += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: out.push(bytes[index]);.
        out.push(bytes[index]);
        // Выполняем операцию: index += 1;.
        index += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: String::from_utf8_lossy(&out).trim().to_string().
    String::from_utf8_lossy(&out).trim().to_string()
    // Закрываем блок.
}

// Объявляем функцию hash_link.
fn hash_link(link: &str) -> String {
    // Объявляем переменную hash.
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;

    // Перебираем элементы коллекции.
    for byte in link.as_bytes() {
        // Выполняем операцию: hash ^= u64::from(*byte);.
        hash ^= u64::from(*byte);
        // Выполняем операцию: hash = hash.wrapping_mul(0x0000_0100_0000_01b3);.
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
        // Закрываем блок.
    }

    // Выполняем операцию: format!("srv_{hash:016x}").
    format!("srv_{hash:016x}")
    // Закрываем блок.
}

// Объявляем функцию parse_query_map.
pub fn parse_query_map(link: &str) -> BTreeMap<String, String> {
    // Объявляем переменную Some((_, rest)) .
    let Some((_, rest)) = link.split_once('?') else {
        // Возвращаем результат из функции.
        return BTreeMap::new();
        // Закрываем блок.
    };

    // Объявляем переменную (query, _) .
    let (query, _) = split_fragment(rest);
    // Объявляем переменную map .
    let mut map = BTreeMap::new();

    // Перебираем элементы коллекции.
    for pair in query.split('&') {
        // Объявляем переменную (key, value) .
        let (key, value) = match pair.split_once('=') {
            // Выполняем операцию: Some((key, value)) => (key, value),.
            Some((key, value)) => (key, value),
            // Выполняем операцию: None => (pair, ""),.
            None => (pair, ""),
            // Закрываем блок.
        };

        // Проверяем условие: !key.is_empty() {.
        if !key.is_empty() {
            // Выполняем операцию: map.insert(key.to_ascii_lowercase(), percent_decode(val.
            map.insert(key.to_ascii_lowercase(), percent_decode(value));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: map.
    map
    // Закрываем блок.
}

// Объявляем функцию decode_vmess_payload.
pub fn decode_vmess_payload(link: &str) -> Option<serde_json::Value> {
    // Объявляем переменную payload .
    let payload = link.strip_prefix("vmess://")?;
    // Объявляем переменную json .
    let json = decode_base64_text(payload)?;

    // Выполняем операцию: serde_json::from_str(&json).ok().
    serde_json::from_str(&json).ok()
    // Закрываем блок.
}

// Объявляем функцию parse_ss_credentials.
pub fn parse_ss_credentials(link: &str) -> Option<(String, String)> {
    // Объявляем переменную rest .
    let rest = link.strip_prefix("ss://")?;
    // Объявляем переменную (main, _) .
    let (main, _) = split_fragment(rest);
    // Объявляем переменную (queryless, _) .
    let (queryless, _) = split_query(&main);
    // Объявляем переменную (credentials, _) .
    let (credentials, _) = split_credentials(queryless);

    // Проверяем условие: credentials.is_empty() {.
    if credentials.is_empty() {
        // Объявляем переменную decoded .
        let decoded = decode_base64_text(queryless)?;
        // Объявляем переменную (credentials, _) .
        let (credentials, _) = split_credentials(&decoded);

        // Возвращаем результат из функции.
        return credentials
            // Выполняем операцию: .split_once(':').
            .split_once(':')
            // Выполняем операцию: .map(|(method, password)| (method.to_string(), password.
            .map(|(method, password)| (method.to_string(), password.to_string()));
        // Закрываем блок.
    }

    // Объявляем переменную decoded .
    let decoded = decode_base64_text(credentials)?;

    // Выполняем операцию: decoded.
    decoded
        // Выполняем операцию: .split_once(':').
        .split_once(':')
        // Выполняем операцию: .map(|(method, password)| (method.to_string(), password.
        .map(|(method, password)| (method.to_string(), password.to_string()))
    // Закрываем блок.
}

/// Подписка принимается только от Maxima VPS: ссылка — это долгоживущий
/// токен со всеми серверами пользователя, посторонний сервис к ней
/// отношения не имеет. Домены совпадают с allowlist окна оплаты
/// (`payment::PAYMENT_ENTRY_HOSTS`), кроме YooMoney; `maxima.run` —
/// короткий домен ссылок-подписок вида maxima.run/XXXX.
// Объявляем константу MAXIMA_SUBSCRIPTION_HOSTS.
const MAXIMA_SUBSCRIPTION_HOSTS: [&str; 4] = [
    // Выполняем операцию: "maximavps.cloud",.
    "maximavps.cloud",
    // Выполняем операцию: "maximacloud.online",.
    "maximacloud.online",
    // Выполняем операцию: "maxima-vps.online",.
    "maxima-vps.online",
    // Выполняем операцию: "maxima.run",.
    "maxima.run",
    // Закрываем выражение или коллекцию.
];

/// Совпадает ли хост с доменом Maxima VPS точно или по поддомену.
// Объявляем функцию is_maxima_subscription_host.
fn is_maxima_subscription_host(host: &str) -> bool {
    // Объявляем переменную host .
    let host = host.trim().to_ascii_lowercase();

    // Выполняем операцию: MAXIMA_SUBSCRIPTION_HOSTS.
    MAXIMA_SUBSCRIPTION_HOSTS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|allowed| host == *allowed || host.ends_with(&form.
        .any(|allowed| host == *allowed || host.ends_with(&format!(".{allowed}")))
    // Закрываем блок.
}

// Объявляем функцию validate_subscription_url.
pub fn validate_subscription_url(url: &str) -> AppResult<String> {
    // Объявляем переменную trimmed .
    let trimmed = url.trim();

    // Проверяем условие: trimmed.len() > 2_048 {.
    if trimmed.len() > 2_048 {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Ссылка подписки слишком длинная"));
        // Закрываем блок.
    }

    // Объявляем переменную lower .
    let lower = trimmed.to_ascii_lowercase();

    // Подписка — это долгоживущий токен со всеми учётными данными
    // серверов. Открытым текстом он утечёт наблюдателю в сети, поэтому
    // допускается только https.
    // Проверяем условие: !lower.starts_with("https://") {.
    if !lower.starts_with("https://") {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Ссылка должна начинаться с https://"));
        // Закрываем блок.
    }

    // Проверяем условие: trimmed.contains(char::is_whitespace) {.
    if trimmed.contains(char::is_whitespace) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Ссылка содержит пробелы"));
        // Закрываем блок.
    }

    // Защита от SSRF: подписка не должна указывать во внутреннюю
    // сеть или на служебные адреса.
    // Проверяем условие: let Ok(parsed) = Url::parse(trimmed) {.
    if let Ok(parsed) = Url::parse(trimmed) {
        // Проверяем условие: let Some(host) = parsed.host_str() {.
        if let Some(host) = parsed.host_str() {
            // Проверяем условие: !is_public_host(host) {.
            if !is_public_host(host) {
                // Возвращаем результат из функции.
                return Err(AppError::custom(
                    // Выполняем операцию: "Ссылка подписки не должна указывать во внутреннюю сеть.
                    "Ссылка подписки не должна указывать во внутреннюю сеть",
                    // Закрываем выражение или коллекцию.
                ));
                // Закрываем блок.
            }

            // Проверяем условие: !is_maxima_subscription_host(host) {.
            if !is_maxima_subscription_host(host) {
                // Возвращаем результат из функции.
                return Err(AppError::custom(
                    // Выполняем операцию: "Подписка принимается только от Maxima VPS",.
                    "Подписка принимается только от Maxima VPS",
                    // Закрываем выражение или коллекцию.
                ));
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(trimmed.to_string()).
    Ok(trimmed.to_string())
    // Закрываем блок.
}

// Объявляем функцию body_size_ok.
pub fn body_size_ok(len: usize) -> bool {
    // Выполняем операцию: len <= MAX_SUBSCRIPTION_BYTES.
    len <= MAX_SUBSCRIPTION_BYTES
    // Закрываем блок.
}

/// Скачивает подписку и отдаёт серверы вместе с метаданными.
///
/// Метаданные читаются до чтения тела: структура ответа от
/// пользователя не зависит, и полезную информацию нельзя потерять на
/// том, что список серверов не разобрался.
// Выполняем операцию: pub async fn fetch_subscription_payload(url: &str) -> A.
pub async fn fetch_subscription_payload(url: &str) -> AppResult<SubscriptionPayload> {
    // Объявляем переменную url .
    let url = validate_subscription_url(url)?;

    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .timeout(std::time::Duration::from_secs(10)).
        .timeout(std::time::Duration::from_secs(10))
        // Выполняем операцию: .user_agent(SUBSCRIPTION_USER_AGENT).
        .user_agent(SUBSCRIPTION_USER_AGENT)
        // Выполняем операцию: .default_headers(reqwest::header::HeaderMap::new()).
        .default_headers(reqwest::header::HeaderMap::new())
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("HTTP клиент .
        .map_err(|error| AppError::custom(format!("HTTP клиент не создан: {error}")))?;

    // Объявляем переменную response .
    let response = client
        // Выполняем операцию: .get(&url).
        .get(&url)
        // Выполняем операцию: .send().
        .send()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Подписка нед.
        .map_err(|error| AppError::custom(format!("Подписка недоступна: {error}")))?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Сервер подписки ответил {}",.
            "Сервер подписки ответил {}",
            // Выполняем операцию: response.status().as_u16().
            response.status().as_u16() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную userinfo .
    let userinfo = response
        // Выполняем операцию: .headers().
        .headers()
        // Выполняем операцию: .get("subscription-userinfo").
        .get("subscription-userinfo")
        // Выполняем операцию: .and_then(|value| value.to_str().ok()).
        .and_then(|value| value.to_str().ok())
        // Выполняем операцию: .map(SubscriptionMeta::parse_userinfo).
        .map(SubscriptionMeta::parse_userinfo)
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Объявляем переменную title .
    let title = response
        // Выполняем операцию: .headers().
        .headers()
        // Выполняем операцию: .get("profile-title").
        .get("profile-title")
        // Выполняем операцию: .and_then(|value| value.to_str().ok()).
        .and_then(|value| value.to_str().ok())
        // Выполняем операцию: .and_then(SubscriptionMeta::parse_title);.
        .and_then(SubscriptionMeta::parse_title);

    // Тело читается потоком: лимит проверяется на ходу, а не
    // после того, как весь ответ уже лежит в памяти.
    // Объявляем переменную body .
    let mut body = String::new();
    // Объявляем переменную received .
    let mut received = 0usize;
    // Объявляем переменную stream .
    let mut stream = response.bytes_stream();

    // Повторяем, пока выполняется условие.
    while let Some(chunk) = stream.next().await {
        // Объявляем переменную chunk .
        let chunk = chunk.map_err(|error| AppError::custom(format!("Ошибка сети: {error}")))?;

        // Выполняем операцию: received += chunk.len();.
        received += chunk.len();

        // Проверяем условие: !body_size_ok(received) {.
        if !body_size_ok(received) {
            // Возвращаем результат из функции.
            return Err(AppError::custom("Ответ подписки слишком велик"));
            // Закрываем блок.
        }

        // Выполняем операцию: body.push_str(&String::from_utf8_lossy(&chunk));.
        body.push_str(&String::from_utf8_lossy(&chunk));
        // Закрываем блок.
    }

    // Объявляем переменную servers .
    let servers = parse_subscription(&body);

    // Проверяем условие: servers.is_empty() {.
    if servers.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "В подписке не найдено поддерживаемых серверов",.
            "В подписке не найдено поддерживаемых серверов",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(SubscriptionPayload {.
    Ok(SubscriptionPayload {
        // Выполняем операцию: servers,.
        servers,
        // Выполняем операцию: meta: userinfo,.
        meta: userinfo,
        // Выполняем операцию: title,.
        title,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_subscription_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
