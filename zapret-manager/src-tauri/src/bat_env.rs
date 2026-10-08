use std::collections::HashMap;
use std::path::{Path, PathBuf};

use crate::constants::MAX_EXPAND_PASSES;

pub fn extract_set_vars(content: &str) -> HashMap<String, String> {
    let mut vars = HashMap::new();

    for line in content.lines() {
        let trimmed = line.trim();
        let Some(rest) = trimmed.strip_prefix("set ") else {
            continue;
        };
        let rest = rest.trim_start();

        if let Some(body) = rest.strip_prefix('"') {
            if let Some(end) = body.find('"') {
                let inner = &body[..end];
                if let Some((name, value)) = inner.split_once('=') {
                    vars.insert(
                        name.trim().to_string(),
                        value.trim().to_string(),
                    );
                }
                continue;
            }
        }

        if let Some((name, value)) = rest.split_once('=') {
            let name = name.trim();
            if !name.is_empty() && !name.contains(' ') {
                vars.insert(name.to_string(), value.trim().to_string());
            }
        }
    }

    vars
}

pub fn strip_quotes(value: &str) -> &str {
    let trimmed = value.trim();
    if trimmed.len() >= 2 && trimmed.starts_with('"') && trimmed.ends_with('"') {
        return &trimmed[1..trimmed.len() - 1];
    }
    trimmed
}

fn dp0_value(script_dir: &Path) -> String {
    let raw = script_dir.to_string_lossy().to_string();
    if raw.ends_with('\\') || raw.ends_with('/') {
        raw
    } else {
        format!("{raw}\\")
    }
}

fn is_dp0_marker(chars: &[char], index: usize) -> bool {
    if index + 5 > chars.len() {
        return false;
    }

    chars[index + 1..index + 5]
        .iter()
        .collect::<String>()
        .eq_ignore_ascii_case("~dp0")
}

fn expand_once(value: &str, vars: &HashMap<String, String>, script_dir: &Path) -> String {
    let mut result = String::with_capacity(value.len());
    let chars: Vec<char> = value.chars().collect();
    let mut index = 0usize;

    while index < chars.len() {
        if chars[index] != '%' {
            result.push(chars[index]);
            index += 1;
            continue;
        }

        if is_dp0_marker(&chars, index) {
            result.push_str(&dp0_value(script_dir));
            index += 5;
            continue;
        }

        let Some(offset) = chars[index + 1..].iter().position(|c| *c == '%') else {
            result.push('%');
            index += 1;
            continue;
        };

        let name: String = chars[index + 1..index + 1 + offset].iter().collect();
        let end = index + offset + 2;

        if name.is_empty() {
            result.push('%');
            index += 1;
            continue;
        }

        match vars.get(&name.to_ascii_uppercase()) {
            Some(replacement) => result.push_str(replacement),
            None => {
                result.push('%');
                result.push_str(&name);
                result.push('%');
            }
        }

        index = end;
    }

    result
}

pub fn expand_percent_vars(
    value: &str,
    vars: &HashMap<String, String>,
    script_dir: &Path,
) -> String {
    let mut current = value.to_string();

    for _ in 0..MAX_EXPAND_PASSES {
        let next = expand_once(&current, vars, script_dir);
        if next == current {
            break;
        }
        current = next;
    }

    current
}

pub fn resolve_path(
    raw: &str,
    vars: &HashMap<String, String>,
    script_dir: &Path,
) -> Option<PathBuf> {
    let expanded = expand_percent_vars(raw, vars, script_dir);
    let unquoted = strip_quotes(&expanded);

    if unquoted.is_empty() {
        return None;
    }

    let candidate = PathBuf::from(unquoted);
    if candidate.is_absolute() {
        return Some(candidate);
    }

    Some(script_dir.join(candidate))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dir() -> PathBuf {
        PathBuf::from(r"C:\zapret")
    }

    #[test]
    fn test_extract_set_vars_quoted() {
        let content = "set \"BIN=%~dp0bin\\\"\r\nset \"LISTS=%~dp0lists\\\"";
        let vars = extract_set_vars(content);

        assert_eq!(vars.get("BIN").map(String::as_str), Some(r"%~dp0bin\"));
        assert_eq!(vars.get("LISTS").map(String::as_str), Some(r"%~dp0lists\"));
    }

    #[test]
    fn test_extract_set_vars_unquoted() {
        let vars = extract_set_vars("set GAME=12");

        assert_eq!(vars.get("GAME").map(String::as_str), Some("12"));
    }

    #[test]
    fn test_extract_set_vars_ignores_other_lines() {
        let vars = extract_set_vars("@echo off\ncall service.bat status\nstart \"x\"");

        assert!(vars.is_empty());
    }

    #[test]
    fn test_expand_percent_vars() {
        let mut vars = HashMap::new();
        vars.insert("LISTS".to_string(), r"C:\s\".to_string());

        let result = expand_percent_vars(r"%LISTS%list-general.txt", &vars, &dir());

        assert_eq!(result, r"C:\s\list-general.txt");
    }

    #[test]
    fn test_expand_percent_vars_dp0() {
        let result = expand_percent_vars(r"%~dp0bin\", &HashMap::new(), &dir());

        assert_eq!(result, r"C:\zapret\bin\");
    }

    #[test]
    fn test_expand_percent_vars_dp0_trailing_sep() {
        let result = expand_percent_vars(
            r"%~dp0bin\",
            &HashMap::new(),
            &PathBuf::from(r"C:\zapret\"),
        );

        assert_eq!(result, r"C:\zapret\bin\");
    }

    #[test]
    fn test_expand_no_infinite_loop() {
        let mut vars = HashMap::new();
        vars.insert("A".to_string(), "%B%".to_string());
        vars.insert("B".to_string(), "%A%".to_string());

        let result = expand_percent_vars("%A%", &vars, &dir());

        assert!(!result.is_empty());
        assert!(result.len() < 64);
    }

    #[test]
    fn test_expand_keeps_unknown_variable() {
        let result = expand_percent_vars("%MISSING%x", &HashMap::new(), &dir());

        assert_eq!(result, "%MISSING%x");
    }

    #[test]
    fn test_strip_quotes() {
        assert_eq!(strip_quotes(r#""C:\path""#), r"C:\path");
        assert_eq!(strip_quotes("plain"), "plain");
        assert_eq!(strip_quotes(r#""mismatch"#), r#""mismatch"#);
    }

    #[test]
    fn test_resolve_path_real_bat_arg() {
        let content = "set \"BIN=%~dp0bin\\\"\r\nset \"LISTS=%~dp0lists\\\"";
        let vars = extract_set_vars(content);

        let resolved = resolve_path(
            r#""%LISTS%list-general.txt""#,
            &vars,
            &PathBuf::from(r"C:\zapret"),
        );

        assert_eq!(
            resolved,
            Some(PathBuf::from(r"C:\zapret\lists\list-general.txt"))
        );
    }

    #[test]
    fn test_resolve_path_relative() {
        let resolved = resolve_path("bin\\winws.exe", &HashMap::new(), &dir());

        assert_eq!(resolved, Some(PathBuf::from(r"C:\zapret\bin\winws.exe")));
    }

    #[test]
    fn test_resolve_path_cyrillic() {
        let mut vars = HashMap::new();
        vars.insert("LISTS".to_string(), r"C:\Стратегии\".to_string());

        let resolved = resolve_path(
            r#""%LISTS%список.txt""#,
            &vars,
            &PathBuf::from(r"C:\zapret"),
        );

        assert_eq!(
            resolved,
            Some(PathBuf::from(r"C:\Стратегии\список.txt"))
        );
    }

    #[test]
    fn test_resolve_path_empty_returns_none() {
        assert_eq!(resolve_path("  ", &HashMap::new(), &dir()), None);
    }
}
