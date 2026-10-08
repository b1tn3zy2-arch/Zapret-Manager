use std::collections::BTreeMap;
use std::path::Path;

use crate::error::{AppError, AppResult};

pub const SECTION_INTERFACE: &str = "Interface";
pub const SECTION_PEER: &str = "Peer";

pub const KEY_PRIVATE: &str = "PrivateKey";
pub const KEY_ADDRESS: &str = "Address";
pub const KEY_DNS: &str = "DNS";
pub const KEY_PUBLIC: &str = "PublicKey";
pub const KEY_ENDPOINT: &str = "Endpoint";
pub const KEY_ALLOWED_IPS: &str = "AllowedIPs";

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ParsedConfig {
    pub address: Vec<String>,
    pub dns: Vec<String>,
    pub endpoint: String,
    pub allowed_ips: Vec<String>,
    pub has_private_key: bool,
    pub has_public_key: bool,
}

fn strip_comment(line: &str) -> &str {
    match line.find('#') {
        Some(index) => &line[..index],
        None => line,
    }
}

pub fn parse_sections(content: &str) -> BTreeMap<String, BTreeMap<String, String>> {
    let mut sections: BTreeMap<String, BTreeMap<String, String>> = BTreeMap::new();
    let mut current = String::new();

    for raw in content.lines() {
        let line = strip_comment(raw).trim();

        if line.is_empty() {
            continue;
        }

        if let Some(inner) = line.strip_prefix('[').and_then(|rest| rest.strip_suffix(']'))
        {
            current = inner.trim().to_string();
            sections.entry(current.clone()).or_default();
            continue;
        }

        let Some((key, value)) = line.split_once('=') else {
            continue;
        };

        if current.is_empty() {
            continue;
        }

        sections
            .entry(current.clone())
            .or_default()
            .insert(key.trim().to_lowercase(), value.trim().to_string());
    }

    sections
}

fn split_list(value: &str) -> Vec<String> {
    value
        .split(',')
        .map(str::trim)
        .filter(|item| !item.is_empty())
        .map(str::to_string)
        .collect()
}

fn section_value<'a>(
    sections: &'a BTreeMap<String, BTreeMap<String, String>>,
    section: &str,
    key: &str,
) -> &'a str {
    sections
        .get(section)
        .and_then(|entries| entries.get(key))
        .map(String::as_str)
        .unwrap_or_default()
}

pub fn parse_config(content: &str) -> AppResult<ParsedConfig> {
    let sections = parse_sections(content);

    if !sections.contains_key(SECTION_INTERFACE) {
        return Err(AppError::custom("Нет секции [Interface]"));
    }

    if !sections.contains_key(SECTION_PEER) {
        return Err(AppError::custom("Нет секции [Peer]"));
    }

    let has_private_key = !section_value(&sections, SECTION_INTERFACE, &KEY_PRIVATE.to_lowercase())
        .is_empty();
    let has_public_key =
        !section_value(&sections, SECTION_PEER, &KEY_PUBLIC.to_lowercase()).is_empty();

    if !has_private_key {
        return Err(AppError::custom("Не указан PrivateKey"));
    }

    if !has_public_key {
        return Err(AppError::custom("Не указан PublicKey"));
    }

    let address = split_list(section_value(&sections, SECTION_INTERFACE, &KEY_ADDRESS.to_lowercase()));
    let endpoint = section_value(&sections, SECTION_PEER, &KEY_ENDPOINT.to_lowercase()).to_string();
    let allowed_ips = split_list(section_value(
        &sections,
        SECTION_PEER,
        &KEY_ALLOWED_IPS.to_lowercase(),
    ));

    if address.is_empty() {
        return Err(AppError::custom("Не указан Address"));
    }

    if endpoint.is_empty() {
        return Err(AppError::custom("Не указан Endpoint"));
    }

    if allowed_ips.is_empty() {
        return Err(AppError::custom("Не указан AllowedIPs"));
    }

    Ok(ParsedConfig {
        address,
        dns: split_list(section_value(&sections, SECTION_INTERFACE, &KEY_DNS.to_lowercase())),
        endpoint,
        allowed_ips,
        has_private_key,
        has_public_key,
    })
}

pub fn tunnel_name(path: &Path) -> String {
    path.file_stem()
        .map(|stem| stem.to_string_lossy().to_string())
        .unwrap_or_else(|| "zapret-tunnel".to_string())
}

#[allow(dead_code)]
pub fn parse_endpoint(endpoint: &str) -> Option<(String, u16)> {
    let (host, port) = endpoint.rsplit_once(':')?;
    let port = port.parse::<u16>().ok()?;

    if host.is_empty() || port == 0 {
        return None;
    }

    Some((host.to_string(), port))
}

#[cfg(test)]
#[path = "vpn_config_tests.rs"]
mod tests;