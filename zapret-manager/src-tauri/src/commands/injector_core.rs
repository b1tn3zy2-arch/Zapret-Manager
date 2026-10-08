use std::collections::{HashMap, HashSet};
use std::path::Path;

use regex::Regex;
use serde::Serialize;

use crate::bat_env;
use crate::constants::{HOSTLIST_REGEX, IPSET_REGEX, MAX_DOMAIN_LENGTH};
use crate::error::{AppError, AppResult};

pub const USER_LIST_SUFFIX: &str = "-user.txt";

pub const FALLBACK_LIST: &str = "lists/list-general.txt";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum ConfigKind {
    Domains,
    Ips,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigTarget {
    pub path: String,
    pub kind: ConfigKind,
}

pub fn normalize_domain(raw: &str) -> String {
    let trimmed = raw.trim();
    let stripped = trimmed.trim_start_matches(['^', '|', '!']);

    stripped.to_ascii_lowercase().trim_end_matches('.').to_string()
}

pub fn is_valid_domain(raw: &str) -> bool {
    let domain = normalize_domain(raw);

    if domain.is_empty() || domain.len() > MAX_DOMAIN_LENGTH {
        return false;
    }

    if !domain.contains('.') || domain.starts_with('.') {
        return false;
    }

    domain
        .chars()
        .all(|ch| ch.is_ascii_alphanumeric() || ch == '.' || ch == '-')
        && domain
            .split('.')
            .all(|label| !label.is_empty() && !label.starts_with('-') && !label.ends_with('-'))
}

fn is_ipv6(value: &str) -> bool {
    let doubled = value.matches("::").count();

    if doubled > 1 {
        return false;
    }

    let (head, tail) = if doubled == 1 {
        value.split_once("::").unwrap_or((value, ""))
    } else {
        (value, "")
    };

    let mut groups = 0usize;

    for part in [head, tail] {
        if part.is_empty() {
            continue;
        }

        for group in part.split(':') {
            if group.is_empty() || group.len() > 4 {
                return false;
            }

            if !group.chars().all(|ch| ch.is_ascii_hexdigit()) {
                return false;
            }

            groups += 1;
        }
    }

    if doubled == 1 {
        groups < 8
    } else {
        groups == 8
    }
}

pub fn is_valid_ip(raw: &str) -> bool {
    let value = raw.trim();

    if value.is_empty() {
        return false;
    }

    if value.contains(':') {
        return is_ipv6(value);
    }

    let (address, prefix) = match value.split_once('/') {
        Some((address, prefix)) => (address, Some(prefix)),
        None => (value, None),
    };

    let octets: Vec<&str> = address.split('.').collect();

    if octets.len() != 4 {
        return false;
    }

    for octet in octets {
        if octet.is_empty() || octet.len() > 3 {
            return false;
        }

        if !octet.chars().all(|ch| ch.is_ascii_digit()) {
            return false;
        }

        match octet.parse::<u16>() {
            Ok(number) if number <= 255 => {}
            _ => return false,
        }
    }

    match prefix {
        Some(prefix) => matches!(prefix.parse::<u16>(), Ok(number) if number <= 32),
        None => true,
    }
}

pub fn is_user_managed(path: &Path) -> bool {
    path.file_name()
        .map(|name| name.to_string_lossy().to_ascii_lowercase())
        .map(|name| name.ends_with(USER_LIST_SUFFIX))
        .unwrap_or(false)
}

fn collect_targets(
    pattern: &Regex,
    content: &str,
    vars: &HashMap<String, String>,
    bat_dir: &Path,
    kind: ConfigKind,
    seen: &mut HashSet<String>,
    out: &mut Vec<ConfigTarget>,
) {
    for captures in pattern.captures_iter(content) {
        let raw = captures.get(1).or_else(|| captures.get(2));
        let Some(match_ref) = raw else {
            continue;
        };

        let Some(resolved) = bat_env::resolve_path(match_ref.as_str(), vars, bat_dir) else {
            continue;
        };

        if is_user_managed(&resolved) {
            continue;
        }

        let key = resolved.to_string_lossy().to_ascii_lowercase();

        if !seen.insert(key) {
            continue;
        }

        out.push(ConfigTarget {
            path: resolved.to_string_lossy().to_string(),
            kind,
        });
    }
}

pub fn parse_config_paths(bat_content: &str, bat_dir: &Path) -> Vec<ConfigTarget> {
    let vars = bat_env::extract_set_vars(bat_content);
    let mut seen: HashSet<String> = HashSet::new();
    let mut out: Vec<ConfigTarget> = Vec::new();

    if let Some(pattern) = HOSTLIST_REGEX.as_ref() {
        collect_targets(
            pattern,
            bat_content,
            &vars,
            bat_dir,
            ConfigKind::Domains,
            &mut seen,
            &mut out,
        );
    }

    if let Some(pattern) = IPSET_REGEX.as_ref() {
        collect_targets(
            pattern,
            bat_content,
            &vars,
            bat_dir,
            ConfigKind::Ips,
            &mut seen,
            &mut out,
        );
    }

    if out.is_empty() {
        let fallback = bat_dir.join(FALLBACK_LIST);

        if fallback.is_file() {
            out.push(ConfigTarget {
                path: fallback.to_string_lossy().to_string(),
                kind: ConfigKind::Domains,
            });
        }
    }

    out
}

pub fn ensure_readable(path: &Path) -> AppResult<String> {
    std::fs::read_to_string(path).map_err(|error| {
        AppError::custom(format!(
            "Не удалось прочитать {}: {error}",
            path.display()
        ))
    })
}

pub fn write_content(path: &Path, content: &str) -> AppResult<()> {
    std::fs::write(path, content).map_err(|error| {
        AppError::custom(format!("Не удалось записать {}: {error}", path.display()))
    })
}

#[cfg(test)]
#[path = "injector_tests.rs"]
mod tests;
