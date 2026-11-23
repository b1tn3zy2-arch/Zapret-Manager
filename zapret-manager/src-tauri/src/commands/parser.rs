// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};
// Подключаем модули: std::sync::LazyLock;.
use std::sync::LazyLock;

// Подключаем модули: regex::Regex;.
use regex::Regex;

// Подключаем модули: crate::commands::scanner::StrategyInfo;.
use crate::commands::scanner::StrategyInfo;
// Подключаем модули: crate::constants::{.
use crate::constants::{
    // Выполняем операцию: DESCRIPTION_LINE_PREFIXES, EXCLUDED_FILENAMES, MAX_DESC.
    DESCRIPTION_LINE_PREFIXES,
    EXCLUDED_FILENAMES,
    MAX_DESCRIPTION_LENGTH,
    SERVICE_KEYWORDS,
    // Выполняем операцию: SKIP_DESCRIPTION_PREFIXES, STRATEGY_TYPE_KEYWORDS, TECH.
    SKIP_DESCRIPTION_PREFIXES,
    STRATEGY_TYPE_KEYWORDS,
    TECHNIQUE_KEYWORDS,
    // Закрываем блок.
};

// Выполняем операцию: pub(crate) fn strip_bat_extension(filename: &str) -> &s.
pub(crate) fn strip_bat_extension(filename: &str) -> &str {
    // Проверяем условие: filename.len() > 4 && filename[filename.len() - 4..
    if filename.len() > 4 && filename[filename.len() - 4..].eq_ignore_ascii_case(".bat") {
        // Выполняем операцию: &filename[..filename.len() - 4].
        &filename[..filename.len() - 4]
    // Закрываем блок.
    } else {
        // Выполняем операцию: filename.
        filename
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn is_excluded(filename: &str) -> bool {.
pub(crate) fn is_excluded(filename: &str) -> bool {
    // Выполняем операцию: EXCLUDED_FILENAMES.
    EXCLUDED_FILENAMES
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|name| name.eq_ignore_ascii_case(filename)).
        .any(|name| name.eq_ignore_ascii_case(filename))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[path = "parser_name.rs"]
// Выполняем операцию: mod parser_name;.
mod parser_name;

// Выполняем операцию: pub(crate) use parser_name::{deduplicate_names, extract.
pub(crate) use parser_name::{deduplicate_names, extract_name};

// Объявляем функцию should_skip_description.
fn should_skip_description(line: &str) -> bool {
    // Выполняем операцию: SKIP_DESCRIPTION_PREFIXES.
    SKIP_DESCRIPTION_PREFIXES
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|prefix| line.starts_with(prefix)).
        .any(|prefix| line.starts_with(prefix))
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn extract_description(content: &str) -> Str.
pub(crate) fn extract_description(content: &str) -> String {
    // Перебираем элементы коллекции.
    for raw_line in content.lines() {
        // Объявляем переменную line .
        let line = raw_line.trim();
        // Проверяем условие: line.is_empty() || should_skip_description(line) {.
        if line.is_empty() || should_skip_description(line) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную prefix .
        let prefix = DESCRIPTION_LINE_PREFIXES
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .find(|prefix| line.starts_with(**prefix));.
            .find(|prefix| line.starts_with(**prefix));

        // Объявляем переменную Some(prefix) .
        let Some(prefix) = prefix else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную text .
        let mut text = line[prefix.len()..].trim();
        // Проверяем условие: prefix.starts_with("::") {.
        if prefix.starts_with("::") {
            // Выполняем операцию: text = text.trim_start_matches(':').trim();.
            text = text.trim_start_matches(':').trim();
            // Закрываем блок.
        }
        // Проверяем условие: text.is_empty() {.
        if text.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную truncated.
        let truncated: String = text.chars().take(MAX_DESCRIPTION_LENGTH).collect();
        // Возвращаем результат из функции.
        return truncated;
        // Закрываем блок.
    }

    // Выполняем операцию: String::new().
    String::new()
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn detect_services(name: &str, content: &str.
pub(crate) fn detect_services(name: &str, content: &str) -> Vec<String> {
    // Объявляем переменную from_name .
    let from_name = detect_services_in(name);
    // Проверяем условие: !from_name.is_empty() {.
    if !from_name.is_empty() {
        // Возвращаем результат из функции.
        return from_name;
        // Закрываем блок.
    }

    // Объявляем переменную from_content .
    let from_content = detect_services_in(content);
    // Проверяем условие: !from_content.is_empty() {.
    if !from_content.is_empty() {
        // Возвращаем результат из функции.
        return from_content;
        // Закрываем блок.
    }

    // Выполняем операцию: vec!["general".to_string()].
    vec!["general".to_string()]
    // Закрываем блок.
}

// Объявляем функцию detect_services_in.
fn detect_services_in(haystack: &str) -> Vec<String> {
    // Объявляем переменную lowered .
    let lowered = haystack.to_lowercase();
    // Объявляем переменную found.
    let mut found: Vec<String> = Vec::new();

    // Перебираем элементы коллекции.
    for (service, keywords) in SERVICE_KEYWORDS.iter() {
        // Проверяем условие: keywords.iter().any(|keyword| lowered.contains(key.
        if keywords.iter().any(|keyword| lowered.contains(keyword)) {
            // Выполняем операцию: found.push((*service).to_string());.
            found.push((*service).to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: found.
    found
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn extract_winws_arguments(content: &str) ->.
pub(crate) fn extract_winws_arguments(content: &str) -> String {
    // Объявляем переменную collected .
    let mut collected = String::new();
    // Объявляем переменную inside .
    let mut inside = false;

    // Перебираем элементы коллекции.
    for raw_line in content.lines() {
        // Объявляем переменную line .
        let line = raw_line.trim();

        // Проверяем условие: !inside {.
        if !inside {
            // Проверяем условие: !line.contains("winws.exe") {.
            if !line.contains("winws.exe") {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Выполняем операцию: inside = true;.
            inside = true;
            // Закрываем блок.
        }

        // Выполняем операцию: collected.push(' ');.
        collected.push(' ');
        // Выполняем операцию: collected.push_str(line);.
        collected.push_str(line);

        // Проверяем условие: !line.ends_with('^') {.
        if !line.ends_with('^') {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: collected.
    collected
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn extract_techniques(content: &str) -> Vec<.
pub(crate) fn extract_techniques(content: &str) -> Vec<String> {
    // Объявляем переменную lowered .
    let lowered = extract_winws_arguments(content).to_lowercase();
    // Объявляем переменную found.
    let mut found: Vec<String> = Vec::new();

    // Перебираем элементы коллекции.
    for (technique, keywords) in TECHNIQUE_KEYWORDS.iter() {
        // Проверяем условие: keywords.iter().any(|keyword| lowered.contains(key.
        if keywords.iter().any(|keyword| lowered.contains(keyword)) {
            // Выполняем операцию: found.push((*technique).to_string());.
            found.push((*technique).to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: found.
    found
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn detect_file_type(content: &str) -> String.
pub(crate) fn detect_file_type(content: &str) -> String {
    // Объявляем переменную lowered .
    let lowered = content.to_lowercase();

    // Перебираем элементы коллекции.
    for (file_type, keywords) in STRATEGY_TYPE_KEYWORDS.iter() {
        // Проверяем условие: keywords.iter().any(|keyword| lowered.contains(key.
        if keywords.iter().any(|keyword| lowered.contains(keyword)) {
            // Возвращаем результат из функции.
            return (*file_type).to_string();
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: "unknown".to_string().
    "unknown".to_string()
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn extract_version(content: &str) -> Option<.
pub(crate) fn extract_version(content: &str) -> Option<String> {
    // Объявляем константу PATTERN.
    static PATTERN: LazyLock<Option<Regex>> =
        // Выполняем операцию: LazyLock::new(|| Regex::new(r"(?i)\bv?(\d+\.\d+(?:\.\d+.
        LazyLock::new(|| Regex::new(r"(?i)\bv?(\d+\.\d+(?:\.\d+)?)\b").ok());

    // Выполняем операцию: PATTERN.
    PATTERN
        // Выполняем операцию: .as_ref()?.
        .as_ref()?
        // Выполняем операцию: .captures(content).
        .captures(content)
        // Выполняем операцию: .and_then(|caps| caps.get(1)).
        .and_then(|caps| caps.get(1))
        // Выполняем операцию: .map(|m| m.as_str().to_string()).
        .map(|m| m.as_str().to_string())
    // Закрываем блок.
}

// Объявляем функцию build_id.
fn build_id(path: &Path) -> String {
    // Объявляем переменную raw .
    let raw = path.to_string_lossy().to_lowercase();
    // Объявляем переменную hash.
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;

    // Перебираем элементы коллекции.
    for byte in raw.as_bytes() {
        // Выполняем операцию: hash ^= u64::from(*byte);.
        hash ^= u64::from(*byte);
        // Выполняем операцию: hash = hash.wrapping_mul(0x0000_0100_0000_01b3);.
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
        // Закрываем блок.
    }

    // Выполняем операцию: format!("st_{hash:016x}").
    format!("st_{hash:016x}")
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn analyze(.
pub(crate) fn analyze(
    // Выполняем операцию: path: PathBuf,.
    path: PathBuf,
    // Выполняем операцию: filename: String,.
    filename: String,
    // Выполняем операцию: content: String,.
    content: String,
    // Выполняем операцию: size: u64,.
    size: u64,
    // Выполняем операцию: modified_at: Option<u64>,.
    modified_at: Option<u64>,
    // Закрываем выражение или коллекцию.
) -> StrategyInfo {
    // Объявляем переменную display_name .
    let display_name = extract_name(&filename);
    // Объявляем переменную parsed .
    let parsed = extract_description(&content);

    // Объявляем переменную description .
    let description = if parsed.is_empty() {
        // Выполняем операцию: display_name.clone().
        display_name.clone()
    // Закрываем блок.
    } else {
        // Выполняем операцию: parsed.
        parsed
        // Закрываем блок.
    };

    // Объявляем переменную base .
    let base = strip_bat_extension(&filename);
    // Объявляем переменную working_dir .
    let working_dir = path
        // Выполняем операцию: .parent().
        .parent()
        // Выполняем операцию: .map(Path::to_path_buf).
        .map(Path::to_path_buf)
        // Выполняем операцию: .unwrap_or_else(|| PathBuf::from("."));.
        .unwrap_or_else(|| PathBuf::from("."));

    // Объявляем переменную config .
    let config = match crate::strategy::parser::parse_bat(&content, &filename, &working_dir) {
        // Выполняем операцию: Ok(value) => Some(value),.
        Ok(value) => Some(value),
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::debug!("Конфиг не распознан для {filename}: {e.
            tracing::debug!("Конфиг не распознан для {filename}: {error}");
            // Выполняем операцию: None.
            None
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Выполняем операцию: StrategyInfo {.
    StrategyInfo {
        // Выполняем операцию: id: build_id(&path),.
        id: build_id(&path),
        // Выполняем операцию: name: display_name,.
        name: display_name,
        // Выполняем операцию: filename: filename.clone(),.
        filename: filename.clone(),
        // Выполняем операцию: path: path.to_string_lossy().to_string(),.
        path: path.to_string_lossy().to_string(),
        // Выполняем операцию: description,.
        description,
        // Выполняем операцию: services: detect_services(base, &content),.
        services: detect_services(base, &content),
        // Выполняем операцию: techniques: extract_techniques(&content),.
        techniques: extract_techniques(&content),
        // Выполняем операцию: file_type: detect_file_type(&content),.
        file_type: detect_file_type(&content),
        // Выполняем операцию: status: "idle".to_string(),.
        status: "idle".to_string(),
        // Выполняем операцию: version: extract_version(&content),.
        version: extract_version(&content),
        // Выполняем операцию: size,.
        size,
        // Выполняем операцию: modified_at,.
        modified_at,
        // Выполняем операцию: config,.
        config,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "parser_tests.rs"]
// Выполняем операцию: mod parser_tests;.
mod parser_tests;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "parser_resources_tests.rs"]
// Выполняем операцию: mod parser_resources_tests;.
mod parser_resources_tests;
