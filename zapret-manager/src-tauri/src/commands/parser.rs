use std::path::{Path, PathBuf};
use std::sync::LazyLock;

use regex::Regex;

use crate::commands::scanner::StrategyInfo;
use crate::constants::{
    DESCRIPTION_LINE_PREFIXES, EXCLUDED_FILENAMES, MAX_DESCRIPTION_LENGTH,
    SERVICE_KEYWORDS, SKIP_DESCRIPTION_PREFIXES, STRATEGY_TYPE_KEYWORDS,
    TECHNIQUE_KEYWORDS,
};

pub(crate) fn strip_bat_extension(filename: &str) -> &str {
    if filename.len() > 4 && filename[filename.len() - 4..].eq_ignore_ascii_case(".bat") {
        &filename[..filename.len() - 4]
    } else {
        filename
    }
}

pub(crate) fn is_excluded(filename: &str) -> bool {
    EXCLUDED_FILENAMES
        .iter()
        .any(|name| name.eq_ignore_ascii_case(filename))
}

#[path = "parser_name.rs"]
mod parser_name;

pub(crate) use parser_name::{deduplicate_names, extract_name};

fn should_skip_description(line: &str) -> bool {
    SKIP_DESCRIPTION_PREFIXES
        .iter()
        .any(|prefix| line.starts_with(prefix))
}

pub(crate) fn extract_description(content: &str) -> String {
    for raw_line in content.lines() {
        let line = raw_line.trim();
        if line.is_empty() || should_skip_description(line) {
            continue;
        }

        let prefix =
            DESCRIPTION_LINE_PREFIXES
                .iter()
                .find(|prefix| line.starts_with(**prefix));

        let Some(prefix) = prefix else {
            continue;
        };

        let mut text = line[prefix.len()..].trim();
        if prefix.starts_with("::") {
            text = text.trim_start_matches(':').trim();
        }
        if text.is_empty() {
            continue;
        }

        let truncated: String =
            text.chars().take(MAX_DESCRIPTION_LENGTH).collect();
        return truncated;
    }

    String::new()
}

pub(crate) fn detect_services(name: &str, content: &str) -> Vec<String> {
    let from_name = detect_services_in(name);
    if !from_name.is_empty() {
        return from_name;
    }

    let from_content = detect_services_in(content);
    if !from_content.is_empty() {
        return from_content;
    }

    vec!["general".to_string()]
}

fn detect_services_in(haystack: &str) -> Vec<String> {
    let lowered = haystack.to_lowercase();
    let mut found: Vec<String> = Vec::new();

    for (service, keywords) in SERVICE_KEYWORDS.iter() {
        if keywords.iter().any(|keyword| lowered.contains(keyword)) {
            found.push((*service).to_string());
        }
    }

    found
}

pub(crate) fn extract_winws_arguments(content: &str) -> String {
    let mut collected = String::new();
    let mut inside = false;

    for raw_line in content.lines() {
        let line = raw_line.trim();

        if !inside {
            if !line.contains("winws.exe") {
                continue;
            }

            inside = true;
        }

        collected.push(' ');
        collected.push_str(line);

        if !line.ends_with('^') {
            break;
        }
    }

    collected
}

pub(crate) fn extract_techniques(content: &str) -> Vec<String> {
    let lowered = extract_winws_arguments(content).to_lowercase();
    let mut found: Vec<String> = Vec::new();

    for (technique, keywords) in TECHNIQUE_KEYWORDS.iter() {
        if keywords.iter().any(|keyword| lowered.contains(keyword)) {
            found.push((*technique).to_string());
        }
    }

    found
}

pub(crate) fn detect_file_type(content: &str) -> String {
    let lowered = content.to_lowercase();

    for (file_type, keywords) in STRATEGY_TYPE_KEYWORDS.iter() {
        if keywords.iter().any(|keyword| lowered.contains(keyword)) {
            return (*file_type).to_string();
        }
    }

    "unknown".to_string()
}

pub(crate) fn extract_version(content: &str) -> Option<String> {
    static PATTERN: LazyLock<Option<Regex>> =
        LazyLock::new(|| Regex::new(r"(?i)\bv?(\d+\.\d+(?:\.\d+)?)\b").ok());

    PATTERN
        .as_ref()?
        .captures(content)
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().to_string())
}

fn build_id(path: &Path) -> String {
    let raw = path.to_string_lossy().to_lowercase();
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;

    for byte in raw.as_bytes() {
        hash ^= u64::from(*byte);
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }

    format!("st_{hash:016x}")
}

pub(crate) fn analyze(
    path: PathBuf,
    filename: String,
    content: String,
    size: u64,
    modified_at: Option<u64>,
) -> StrategyInfo {
    let display_name = extract_name(&filename);
    let parsed = extract_description(&content);

    let description = if parsed.is_empty() {
        display_name.clone()
    } else {
        parsed
    };

    let base = strip_bat_extension(&filename);

    StrategyInfo {
        id: build_id(&path),
        name: display_name,
        filename: filename.clone(),
        path: path.to_string_lossy().to_string(),
        description,
        services: detect_services(base, &content),
        techniques: extract_techniques(&content),
        file_type: detect_file_type(&content),
        status: "idle".to_string(),
        version: extract_version(&content),
        size,
        modified_at,
    }
}

#[cfg(test)]
#[path = "parser_tests.rs"]
mod parser_tests;

#[cfg(test)]
#[path = "parser_resources_tests.rs"]
mod parser_resources_tests;
