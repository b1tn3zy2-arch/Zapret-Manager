// Подключаем модули: std::collections::BTreeMap;.
use std::collections::BTreeMap;
// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу SECTION_INTERFACE.
pub const SECTION_INTERFACE: &str = "Interface";
// Объявляем константу SECTION_PEER.
pub const SECTION_PEER: &str = "Peer";

// Объявляем константу KEY_PRIVATE.
pub const KEY_PRIVATE: &str = "PrivateKey";
// Объявляем константу KEY_ADDRESS.
pub const KEY_ADDRESS: &str = "Address";
// Объявляем константу KEY_DNS.
pub const KEY_DNS: &str = "DNS";
// Объявляем константу KEY_PUBLIC.
pub const KEY_PUBLIC: &str = "PublicKey";
// Объявляем константу KEY_ENDPOINT.
pub const KEY_ENDPOINT: &str = "Endpoint";
// Объявляем константу KEY_ALLOWED_IPS.
pub const KEY_ALLOWED_IPS: &str = "AllowedIPs";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
// Объявляем структуру ParsedConfig.
pub struct ParsedConfig {
    // Выполняем операцию: pub address: Vec<String>,.
    pub address: Vec<String>,
    // Выполняем операцию: pub dns: Vec<String>,.
    pub dns: Vec<String>,
    // Выполняем операцию: pub endpoint: String,.
    pub endpoint: String,
    // Выполняем операцию: pub allowed_ips: Vec<String>,.
    pub allowed_ips: Vec<String>,
    // Выполняем операцию: pub has_private_key: bool,.
    pub has_private_key: bool,
    // Выполняем операцию: pub has_public_key: bool,.
    pub has_public_key: bool,
    // Закрываем блок.
}

// Объявляем функцию strip_comment.
fn strip_comment(line: &str) -> &str {
    // Выбираем вариант по значению.
    match line.find('#') {
        // Выполняем операцию: Some(index) => &line[..index],.
        Some(index) => &line[..index],
        // Выполняем операцию: None => line,.
        None => line,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию parse_sections.
pub fn parse_sections(content: &str) -> BTreeMap<String, BTreeMap<String, String>> {
    // Объявляем переменную sections.
    let mut sections: BTreeMap<String, BTreeMap<String, String>> = BTreeMap::new();
    // Объявляем переменную current .
    let mut current = String::new();

    // Перебираем элементы коллекции.
    for raw in content.lines() {
        // Объявляем переменную line .
        let line = strip_comment(raw).trim();

        // Проверяем условие: line.is_empty() {.
        if line.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(inner) = line.
        if let Some(inner) = line
            // Выполняем операцию: .strip_prefix('[').
            .strip_prefix('[')
            // Выполняем операцию: .and_then(|rest| rest.strip_suffix(']')).
            .and_then(|rest| rest.strip_suffix(']'))
        // Выполняем операцию: {.
        {
            // Выполняем операцию: current = inner.trim().to_string();.
            current = inner.trim().to_string();
            // Выполняем операцию: sections.entry(current.clone()).or_default();.
            sections.entry(current.clone()).or_default();
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some((key, value)) .
        let Some((key, value)) = line.split_once('=') else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: current.is_empty() {.
        if current.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: sections.
        sections
            // Выполняем операцию: .entry(current.clone()).
            .entry(current.clone())
            // Выполняем операцию: .or_default().
            .or_default()
            // Выполняем операцию: .insert(key.trim().to_lowercase(), value.trim().to_stri.
            .insert(key.trim().to_lowercase(), value.trim().to_string());
        // Закрываем блок.
    }

    // Выполняем операцию: sections.
    sections
    // Закрываем блок.
}

// Объявляем функцию split_list.
fn split_list(value: &str) -> Vec<String> {
    // Выполняем операцию: value.
    value
        // Выполняем операцию: .split(',').
        .split(',')
        // Выполняем операцию: .map(str::trim).
        .map(str::trim)
        // Выполняем операцию: .filter(|item| !item.is_empty()).
        .filter(|item| !item.is_empty())
        // Выполняем операцию: .map(str::to_string).
        .map(str::to_string)
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию section_value.
fn section_value<'a>(
    // Выполняем операцию: sections: &'a BTreeMap<String, BTreeMap<String, String>.
    sections: &'a BTreeMap<String, BTreeMap<String, String>>,
    // Выполняем операцию: section: &str,.
    section: &str,
    // Выполняем операцию: key: &str,.
    key: &str,
    // Закрываем выражение или коллекцию.
) -> &'a str {
    // Выполняем операцию: sections.
    sections
        // Выполняем операцию: .get(section).
        .get(section)
        // Выполняем операцию: .and_then(|entries| entries.get(key)).
        .and_then(|entries| entries.get(key))
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию parse_config.
pub fn parse_config(content: &str) -> AppResult<ParsedConfig> {
    // Объявляем переменную sections .
    let sections = parse_sections(content);

    // Проверяем условие: !sections.contains_key(SECTION_INTERFACE) {.
    if !sections.contains_key(SECTION_INTERFACE) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Нет секции [Interface]"));
        // Закрываем блок.
    }

    // Проверяем условие: !sections.contains_key(SECTION_PEER) {.
    if !sections.contains_key(SECTION_PEER) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Нет секции [Peer]"));
        // Закрываем блок.
    }

    // Объявляем переменную has_private_key .
    let has_private_key =
        // Выполняем операцию: !section_value(&sections, SECTION_INTERFACE, &KEY_PRIVA.
        !section_value(&sections, SECTION_INTERFACE, &KEY_PRIVATE.to_lowercase()).is_empty();
    // Объявляем переменную has_public_key .
    let has_public_key =
        // Выполняем операцию: !section_value(&sections, SECTION_PEER, &KEY_PUBLIC.to_.
        !section_value(&sections, SECTION_PEER, &KEY_PUBLIC.to_lowercase()).is_empty();

    // Проверяем условие: !has_private_key {.
    if !has_private_key {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Не указан PrivateKey"));
        // Закрываем блок.
    }

    // Проверяем условие: !has_public_key {.
    if !has_public_key {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Не указан PublicKey"));
        // Закрываем блок.
    }

    // Объявляем переменную address .
    let address = split_list(section_value(
        // Выполняем операцию: &sections,.
        &sections,
        // Выполняем операцию: SECTION_INTERFACE,.
        SECTION_INTERFACE,
        // Выполняем операцию: &KEY_ADDRESS.to_lowercase(),.
        &KEY_ADDRESS.to_lowercase(),
        // Закрываем выражение или коллекцию.
    ));
    // Объявляем переменную endpoint .
    let endpoint = section_value(&sections, SECTION_PEER, &KEY_ENDPOINT.to_lowercase()).to_string();
    // Объявляем переменную allowed_ips .
    let allowed_ips = split_list(section_value(
        // Выполняем операцию: &sections,.
        &sections,
        // Выполняем операцию: SECTION_PEER,.
        SECTION_PEER,
        // Выполняем операцию: &KEY_ALLOWED_IPS.to_lowercase(),.
        &KEY_ALLOWED_IPS.to_lowercase(),
        // Закрываем выражение или коллекцию.
    ));

    // Проверяем условие: address.is_empty() {.
    if address.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Не указан Address"));
        // Закрываем блок.
    }

    // Проверяем условие: endpoint.is_empty() {.
    if endpoint.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Не указан Endpoint"));
        // Закрываем блок.
    }

    // Проверяем условие: allowed_ips.is_empty() {.
    if allowed_ips.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Не указан AllowedIPs"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(ParsedConfig {.
    Ok(ParsedConfig {
        // Выполняем операцию: address,.
        address,
        // Выполняем операцию: dns: split_list(section_value(.
        dns: split_list(section_value(
            // Выполняем операцию: &sections,.
            &sections,
            // Выполняем операцию: SECTION_INTERFACE,.
            SECTION_INTERFACE,
            // Выполняем операцию: &KEY_DNS.to_lowercase(),.
            &KEY_DNS.to_lowercase(),
            // Закрываем выражение или коллекцию.
        )),
        // Выполняем операцию: endpoint,.
        endpoint,
        // Выполняем операцию: allowed_ips,.
        allowed_ips,
        // Выполняем операцию: has_private_key,.
        has_private_key,
        // Выполняем операцию: has_public_key,.
        has_public_key,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию tunnel_name.
pub fn tunnel_name(path: &Path) -> String {
    // Выполняем операцию: path.file_stem().
    path.file_stem()
        // Выполняем операцию: .map(|stem| stem.to_string_lossy().to_string()).
        .map(|stem| stem.to_string_lossy().to_string())
        // Выполняем операцию: .unwrap_or_else(|| "zapret-tunnel".to_string()).
        .unwrap_or_else(|| "zapret-tunnel".to_string())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[allow(dead_code)]
// Объявляем функцию parse_endpoint.
pub fn parse_endpoint(endpoint: &str) -> Option<(String, u16)> {
    // Объявляем переменную (host, port) .
    let (host, port) = endpoint.rsplit_once(':')?;
    // Объявляем переменную port .
    let port = port.parse::<u16>().ok()?;

    // Проверяем условие: host.is_empty() || port == 0 {.
    if host.is_empty() || port == 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some((host.to_string(), port)).
    Some((host.to_string(), port))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_config_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
