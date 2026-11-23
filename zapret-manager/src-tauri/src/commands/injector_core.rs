// Подключаем модули: std::collections::{HashMap, HashSet};.
use std::collections::{HashMap, HashSet};
// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: regex::Regex;.
use regex::Regex;
// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::bat_env;.
use crate::bat_env;
// Подключаем модули: crate::constants::{HOSTLIST_REGEX, IPSET_REGEX, MAX_DOM.
use crate::constants::{HOSTLIST_REGEX, IPSET_REGEX, MAX_DOMAIN_LENGTH};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу USER_LIST_SUFFIX.
pub const USER_LIST_SUFFIX: &str = "-user.txt";

// Объявляем константу FALLBACK_LIST.
pub const FALLBACK_LIST: &str = "lists/list-general.txt";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "lowercase")]
// Объявляем перечисление ConfigKind.
pub enum ConfigKind {
    // Выполняем операцию: Domains,.
    Domains,
    // Выполняем операцию: Ips,.
    Ips,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру ConfigTarget.
pub struct ConfigTarget {
    // Выполняем операцию: pub path: String,.
    pub path: String,
    // Выполняем операцию: pub kind: ConfigKind,.
    pub kind: ConfigKind,
    // Закрываем блок.
}

// Объявляем функцию normalize_domain.
pub fn normalize_domain(raw: &str) -> String {
    // Объявляем переменную trimmed .
    let trimmed = raw.trim();
    // Объявляем переменную stripped .
    let stripped = trimmed.trim_start_matches(['^', '|', '!']);

    // Выполняем операцию: stripped.
    stripped
        // Выполняем операцию: .to_ascii_lowercase().
        .to_ascii_lowercase()
        // Выполняем операцию: .trim_end_matches('.').
        .trim_end_matches('.')
        // Выполняем операцию: .to_string().
        .to_string()
    // Закрываем блок.
}

// Объявляем функцию is_valid_domain.
pub fn is_valid_domain(raw: &str) -> bool {
    // Объявляем переменную domain .
    let domain = normalize_domain(raw);

    // Проверяем условие: domain.is_empty() || domain.len() > MAX_DOMAIN_LEN.
    if domain.is_empty() || domain.len() > MAX_DOMAIN_LENGTH {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: !domain.contains('.') || domain.starts_with('.') {.
    if !domain.contains('.') || domain.starts_with('.') {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: domain.
    domain
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .all(|ch| ch.is_ascii_alphanumeric() || ch == '.' || ch.
        .all(|ch| ch.is_ascii_alphanumeric() || ch == '.' || ch == '-')
        // Выполняем операцию: && domain.
        && domain
            // Выполняем операцию: .split('.').
            .split('.')
            // Выполняем операцию: .all(|label| !label.is_empty() && !label.starts_with('-.
            .all(|label| !label.is_empty() && !label.starts_with('-') && !label.ends_with('-'))
    // Закрываем блок.
}

// Объявляем функцию is_ipv6.
fn is_ipv6(value: &str) -> bool {
    // Объявляем переменную doubled .
    let doubled = value.matches("::").count();

    // Проверяем условие: doubled > 1 {.
    if doubled > 1 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную (head, tail) .
    let (head, tail) = if doubled == 1 {
        // Выполняем операцию: value.split_once("::").unwrap_or((value, "")).
        value.split_once("::").unwrap_or((value, ""))
    // Закрываем блок.
    } else {
        // Выполняем операцию: (value, "").
        (value, "")
        // Закрываем блок.
    };

    // Объявляем переменную groups .
    let mut groups = 0usize;

    // Перебираем элементы коллекции.
    for part in [head, tail] {
        // Проверяем условие: part.is_empty() {.
        if part.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Перебираем элементы коллекции.
        for group in part.split(':') {
            // Проверяем условие: group.is_empty() || group.len() > 4 {.
            if group.is_empty() || group.len() > 4 {
                // Возвращаем результат из функции.
                return false;
                // Закрываем блок.
            }

            // Проверяем условие: !group.chars().all(|ch| ch.is_ascii_hexdigit()) {.
            if !group.chars().all(|ch| ch.is_ascii_hexdigit()) {
                // Возвращаем результат из функции.
                return false;
                // Закрываем блок.
            }

            // Выполняем операцию: groups += 1;.
            groups += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: doubled == 1 {.
    if doubled == 1 {
        // Выполняем операцию: groups < 8.
        groups < 8
    // Закрываем блок.
    } else {
        // Выполняем операцию: groups == 8.
        groups == 8
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_valid_ip.
pub fn is_valid_ip(raw: &str) -> bool {
    // Объявляем переменную value .
    let value = raw.trim();

    // Проверяем условие: value.is_empty() {.
    if value.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: value.contains(':') {.
    if value.contains(':') {
        // Возвращаем результат из функции.
        return is_ipv6(value);
        // Закрываем блок.
    }

    // Объявляем переменную (address, prefix) .
    let (address, prefix) = match value.split_once('/') {
        // Выполняем операцию: Some((address, prefix)) => (address, Some(prefix)),.
        Some((address, prefix)) => (address, Some(prefix)),
        // Выполняем операцию: None => (value, None),.
        None => (value, None),
        // Закрываем блок.
    };

    // Объявляем переменную octets.
    let octets: Vec<&str> = address.split('.').collect();

    // Проверяем условие: octets.len() != 4 {.
    if octets.len() != 4 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for octet in octets {
        // Проверяем условие: octet.is_empty() || octet.len() > 3 {.
        if octet.is_empty() || octet.len() > 3 {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }

        // Проверяем условие: !octet.chars().all(|ch| ch.is_ascii_digit()) {.
        if !octet.chars().all(|ch| ch.is_ascii_digit()) {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }

        // Выбираем вариант по значению.
        match octet.parse::<u16>() {
            // Выполняем операцию: Ok(number) if number <= 255 => {}.
            Ok(number) if number <= 255 => {}
            // Выполняем операцию: _ => return false,.
            _ => return false,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match prefix {
        // Выполняем операцию: Some(prefix) => matches!(prefix.parse::<u16>(), Ok(numb.
        Some(prefix) => matches!(prefix.parse::<u16>(), Ok(number) if number <= 32),
        // Выполняем операцию: None => true,.
        None => true,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_user_managed.
pub fn is_user_managed(path: &Path) -> bool {
    // Выполняем операцию: path.file_name().
    path.file_name()
        // Выполняем операцию: .map(|name| name.to_string_lossy().to_ascii_lowercase().
        .map(|name| name.to_string_lossy().to_ascii_lowercase())
        // Выполняем операцию: .map(|name| name.ends_with(USER_LIST_SUFFIX)).
        .map(|name| name.ends_with(USER_LIST_SUFFIX))
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

// Объявляем функцию collect_targets.
fn collect_targets(
    // Выполняем операцию: pattern: &Regex,.
    pattern: &Regex,
    // Выполняем операцию: content: &str,.
    content: &str,
    // Выполняем операцию: vars: &HashMap<String, String>,.
    vars: &HashMap<String, String>,
    // Выполняем операцию: bat_dir: &Path,.
    bat_dir: &Path,
    // Выполняем операцию: kind: ConfigKind,.
    kind: ConfigKind,
    // Выполняем операцию: seen: &mut HashSet<String>,.
    seen: &mut HashSet<String>,
    // Выполняем операцию: out: &mut Vec<ConfigTarget>,.
    out: &mut Vec<ConfigTarget>,
    // Закрываем выражение или коллекцию.
) {
    // Перебираем элементы коллекции.
    for captures in pattern.captures_iter(content) {
        // Объявляем переменную raw .
        let raw = captures.get(1).or_else(|| captures.get(2));
        // Объявляем переменную Some(match_ref) .
        let Some(match_ref) = raw else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную Some(resolved) .
        let Some(resolved) = bat_env::resolve_path(match_ref.as_str(), vars, bat_dir) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: is_user_managed(&resolved) {.
        if is_user_managed(&resolved) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную key .
        let key = resolved.to_string_lossy().to_ascii_lowercase();

        // Проверяем условие: !seen.insert(key) {.
        if !seen.insert(key) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: out.push(ConfigTarget {.
        out.push(ConfigTarget {
            // Выполняем операцию: path: resolved.to_string_lossy().to_string(),.
            path: resolved.to_string_lossy().to_string(),
            // Выполняем операцию: kind,.
            kind,
            // Закрываем блок.
        });
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию parse_config_paths.
pub fn parse_config_paths(bat_content: &str, bat_dir: &Path) -> Vec<ConfigTarget> {
    // Объявляем переменную vars .
    let vars = bat_env::extract_set_vars(bat_content);
    // Объявляем переменную seen.
    let mut seen: HashSet<String> = HashSet::new();
    // Объявляем переменную out.
    let mut out: Vec<ConfigTarget> = Vec::new();

    // Проверяем условие: let Some(pattern) = HOSTLIST_REGEX.as_ref() {.
    if let Some(pattern) = HOSTLIST_REGEX.as_ref() {
        // Выполняем операцию: collect_targets(.
        collect_targets(
            // Выполняем операцию: pattern,.
            pattern,
            // Выполняем операцию: bat_content,.
            bat_content,
            // Выполняем операцию: &vars,.
            &vars,
            // Выполняем операцию: bat_dir,.
            bat_dir,
            // Выполняем операцию: ConfigKind::Domains,.
            ConfigKind::Domains,
            // Выполняем операцию: &mut seen,.
            &mut seen,
            // Выполняем операцию: &mut out,.
            &mut out,
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Проверяем условие: let Some(pattern) = IPSET_REGEX.as_ref() {.
    if let Some(pattern) = IPSET_REGEX.as_ref() {
        // Выполняем операцию: collect_targets(.
        collect_targets(
            // Выполняем операцию: pattern,.
            pattern,
            // Выполняем операцию: bat_content,.
            bat_content,
            // Выполняем операцию: &vars,.
            &vars,
            // Выполняем операцию: bat_dir,.
            bat_dir,
            // Выполняем операцию: ConfigKind::Ips,.
            ConfigKind::Ips,
            // Выполняем операцию: &mut seen,.
            &mut seen,
            // Выполняем операцию: &mut out,.
            &mut out,
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Проверяем условие: out.is_empty() {.
    if out.is_empty() {
        // Объявляем переменную fallback .
        let fallback = bat_dir.join(FALLBACK_LIST);

        // Проверяем условие: fallback.is_file() {.
        if fallback.is_file() {
            // Выполняем операцию: out.push(ConfigTarget {.
            out.push(ConfigTarget {
                // Выполняем операцию: path: fallback.to_string_lossy().to_string(),.
                path: fallback.to_string_lossy().to_string(),
                // Выполняем операцию: kind: ConfigKind::Domains,.
                kind: ConfigKind::Domains,
                // Закрываем блок.
            });
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: out.
    out
    // Закрываем блок.
}

// Объявляем функцию ensure_readable.
pub fn ensure_readable(path: &Path) -> AppResult<String> {
    // Выполняем операцию: std::fs::read_to_string(path).map_err(|error| {.
    std::fs::read_to_string(path).map_err(|error| {
        // Выполняем операцию: AppError::custom(format!("Не удалось прочитать {}: {err.
        AppError::custom(format!("Не удалось прочитать {}: {error}", path.display()))
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию write_content.
pub fn write_content(path: &Path, content: &str) -> AppResult<()> {
    // Выполняем операцию: std::fs::write(path, content).map_err(|error| {.
    std::fs::write(path, content).map_err(|error| {
        // Выполняем операцию: AppError::custom(format!("Не удалось записать {}: {erro.
        AppError::custom(format!("Не удалось записать {}: {error}", path.display()))
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "injector_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
