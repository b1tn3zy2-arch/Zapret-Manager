// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: crate::constants::MAX_EXPAND_PASSES;.
use crate::constants::MAX_EXPAND_PASSES;

// Объявляем функцию extract_set_vars.
pub fn extract_set_vars(content: &str) -> HashMap<String, String> {
    // Объявляем переменную vars .
    let mut vars = HashMap::new();

    // Перебираем элементы коллекции.
    for line in content.lines() {
        // Объявляем переменную trimmed .
        let trimmed = line.trim();
        // Объявляем переменную Some(rest) .
        let Some(rest) = trimmed.strip_prefix("set ") else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };
        // Объявляем переменную rest .
        let rest = rest.trim_start();

        // Проверяем условие: let Some(body) = rest.strip_prefix('"') {.
        if let Some(body) = rest.strip_prefix('"') {
            // Проверяем условие: let Some(end) = body.find('"') {.
            if let Some(end) = body.find('"') {
                // Объявляем переменную inner .
                let inner = &body[..end];
                // Проверяем условие: let Some((name, value)) = inner.split_once('=') {.
                if let Some((name, value)) = inner.split_once('=') {
                    // Выполняем операцию: vars.insert(name.trim().to_string(), value.trim().to_st.
                    vars.insert(name.trim().to_string(), value.trim().to_string());
                    // Закрываем блок.
                }
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Проверяем условие: let Some((name, value)) = rest.split_once('=') {.
        if let Some((name, value)) = rest.split_once('=') {
            // Объявляем переменную name .
            let name = name.trim();
            // Проверяем условие: !name.is_empty() && !name.contains(' ') {.
            if !name.is_empty() && !name.contains(' ') {
                // Выполняем операцию: vars.insert(name.to_string(), value.trim().to_string()).
                vars.insert(name.to_string(), value.trim().to_string());
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: vars.
    vars
    // Закрываем блок.
}

// Объявляем функцию strip_quotes.
pub fn strip_quotes(value: &str) -> &str {
    // Объявляем переменную trimmed .
    let trimmed = value.trim();
    // Проверяем условие: trimmed.len() >= 2 && trimmed.starts_with('"') && .
    if trimmed.len() >= 2 && trimmed.starts_with('"') && trimmed.ends_with('"') {
        // Возвращаем результат из функции.
        return &trimmed[1..trimmed.len() - 1];
        // Закрываем блок.
    }
    // Выполняем операцию: trimmed.
    trimmed
    // Закрываем блок.
}

// Объявляем функцию dp0_value.
fn dp0_value(script_dir: &Path) -> String {
    // Объявляем переменную raw .
    let raw = script_dir.to_string_lossy().to_string();
    // Проверяем условие: raw.ends_with('\\') || raw.ends_with('/') {.
    if raw.ends_with('\\') || raw.ends_with('/') {
        // Выполняем операцию: raw.
        raw
    // Закрываем блок.
    } else {
        // Выполняем операцию: format!("{raw}\\").
        format!("{raw}\\")
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_dp0_marker.
fn is_dp0_marker(chars: &[char], index: usize) -> bool {
    // Проверяем условие: index + 5 > chars.len() {.
    if index + 5 > chars.len() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: chars[index + 1..index + 5].
    chars[index + 1..index + 5]
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .collect::<String>().
        .collect::<String>()
        // Выполняем операцию: .eq_ignore_ascii_case("~dp0").
        .eq_ignore_ascii_case("~dp0")
    // Закрываем блок.
}

// Объявляем функцию batch_modifier.
fn batch_modifier(chars: &[char], index: usize, script_dir: &Path) -> Option<(usize, String)> {
    // Проверяем условие: chars.get(index + 1) != Some(&'~') {.
    if chars.get(index + 1) != Some(&'~') {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную cursor .
    let mut cursor = index + 2;
    // Объявляем переменную letters .
    let mut letters = String::new();

    // Повторяем, пока выполняется условие.
    while let Some(character) = chars.get(cursor) {
        // Проверяем условие: character.is_ascii_alphabetic() {.
        if character.is_ascii_alphabetic() {
            // Выполняем операцию: letters.push(*character);.
            letters.push(*character);
            // Выполняем операцию: cursor += 1;.
            cursor += 1;
        // Закрываем блок.
        } else {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: letters.is_empty() {.
    if letters.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную argument .
    let argument = chars.get(cursor)?;

    // Проверяем условие: !argument.is_ascii_digit() && *argument != '*' {.
    if !argument.is_ascii_digit() && *argument != '*' {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: cursor += 1;.
    cursor += 1;

    // Объявляем переменную consumed .
    let consumed = cursor - index;
    // Объявляем переменную lowered .
    let lowered = letters.to_ascii_lowercase();

    // Проверяем условие: lowered.contains('n') && !lowered.contains('d') &&.
    if lowered.contains('n') && !lowered.contains('d') && !lowered.contains('f') {
        // Объявляем переменную stem .
        let stem = script_dir
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
            .map(|value| value.to_string_lossy().to_string())
            // Выполняем операцию: .unwrap_or_else(|| "strategy".to_string());.
            .unwrap_or_else(|| "strategy".to_string());

        // Возвращаем результат из функции.
        return Some((consumed, stem));
        // Закрываем блок.
    }

    // Выполняем операцию: Some((consumed, dp0_value(script_dir))).
    Some((consumed, dp0_value(script_dir)))
    // Закрываем блок.
}

// Объявляем функцию expand_once.
fn expand_once(value: &str, vars: &HashMap<String, String>, script_dir: &Path) -> String {
    // Объявляем переменную result .
    let mut result = String::with_capacity(value.len());
    // Объявляем переменную chars.
    let chars: Vec<char> = value.chars().collect();
    // Объявляем переменную index .
    let mut index = 0usize;

    // Повторяем, пока выполняется условие.
    while index < chars.len() {
        // Проверяем условие: chars[index] != '%' {.
        if chars[index] != '%' {
            // Выполняем операцию: result.push(chars[index]);.
            result.push(chars[index]);
            // Выполняем операцию: index += 1;.
            index += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: is_dp0_marker(&chars, index) {.
        if is_dp0_marker(&chars, index) {
            // Выполняем операцию: result.push_str(&dp0_value(script_dir));.
            result.push_str(&dp0_value(script_dir));
            // Выполняем операцию: index += 5;.
            index += 5;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some((consumed, replacement)) = batch_modifier.
        if let Some((consumed, replacement)) = batch_modifier(&chars, index, script_dir) {
            // Выполняем операцию: result.push_str(&replacement);.
            result.push_str(&replacement);
            // Выполняем операцию: index += consumed;.
            index += consumed;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(offset) .
        let Some(offset) = chars[index + 1..].iter().position(|c| *c == '%') else {
            // Выполняем операцию: result.push('%');.
            result.push('%');
            // Выполняем операцию: index += 1;.
            index += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную name.
        let name: String = chars[index + 1..index + 1 + offset].iter().collect();
        // Объявляем переменную end .
        let end = index + offset + 2;

        // Проверяем условие: name.is_empty() {.
        if name.is_empty() {
            // Выполняем операцию: result.push('%');.
            result.push('%');
            // Выполняем операцию: index += 1;.
            index += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выбираем вариант по значению.
        match vars.get(&name.to_ascii_uppercase()) {
            // Выполняем операцию: Some(replacement) => result.push_str(replacement),.
            Some(replacement) => result.push_str(replacement),
            // Выполняем операцию: None => {.
            None => {
                // Выполняем операцию: result.push('%');.
                result.push('%');
                // Выполняем операцию: result.push_str(&name);.
                result.push_str(&name);
                // Выполняем операцию: result.push('%');.
                result.push('%');
                // Закрываем блок.
            } // Закрываем блок.
        }

        // Выполняем операцию: index = end;.
        index = end;
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию expand_percent_vars.
pub fn expand_percent_vars(
    // Выполняем операцию: value: &str,.
    value: &str,
    // Выполняем операцию: vars: &HashMap<String, String>,.
    vars: &HashMap<String, String>,
    // Выполняем операцию: script_dir: &Path,.
    script_dir: &Path,
    // Закрываем выражение или коллекцию.
) -> String {
    // Объявляем переменную current .
    let mut current = value.to_string();

    // Перебираем элементы коллекции.
    for _ in 0..MAX_EXPAND_PASSES {
        // Объявляем переменную next .
        let next = expand_once(&current, vars, script_dir);
        // Проверяем условие: next == current {.
        if next == current {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Выполняем операцию: current = next;.
        current = next;
        // Закрываем блок.
    }

    // Выполняем операцию: current.
    current
    // Закрываем блок.
}

// Объявляем функцию resolve_path.
pub fn resolve_path(
    // Выполняем операцию: raw: &str,.
    raw: &str,
    // Выполняем операцию: vars: &HashMap<String, String>,.
    vars: &HashMap<String, String>,
    // Выполняем операцию: script_dir: &Path,.
    script_dir: &Path,
    // Закрываем выражение или коллекцию.
) -> Option<PathBuf> {
    // Объявляем переменную expanded .
    let expanded = expand_percent_vars(raw, vars, script_dir);
    // Объявляем переменную unquoted .
    let unquoted = strip_quotes(&expanded);

    // Проверяем условие: unquoted.is_empty() {.
    if unquoted.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную candidate .
    let candidate = PathBuf::from(unquoted);
    // Проверяем условие: candidate.is_absolute() {.
    if candidate.is_absolute() {
        // Возвращаем результат из функции.
        return Some(candidate);
        // Закрываем блок.
    }

    // Выполняем операцию: Some(script_dir.join(candidate)).
    Some(script_dir.join(candidate))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Объявляем функцию dir.
    fn dir() -> PathBuf {
        // Выполняем операцию: PathBuf::from(r"C:\zapret").
        PathBuf::from(r"C:\zapret")
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_extract_set_vars_quoted.
    fn test_extract_set_vars_quoted() {
        // Объявляем переменную content .
        let content = "set \"BIN=%~dp0bin\\\"\r\nset \"LISTS=%~dp0lists\\\"";
        // Объявляем переменную vars .
        let vars = extract_set_vars(content);

        // Выполняем операцию: assert_eq!(vars.get("BIN").map(String::as_str), Some(r".
        assert_eq!(vars.get("BIN").map(String::as_str), Some(r"%~dp0bin\"));
        // Выполняем операцию: assert_eq!(vars.get("LISTS").map(String::as_str), Some(.
        assert_eq!(vars.get("LISTS").map(String::as_str), Some(r"%~dp0lists\"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_extract_set_vars_unquoted.
    fn test_extract_set_vars_unquoted() {
        // Объявляем переменную vars .
        let vars = extract_set_vars("set GAME=12");

        // Выполняем операцию: assert_eq!(vars.get("GAME").map(String::as_str), Some(".
        assert_eq!(vars.get("GAME").map(String::as_str), Some("12"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_extract_set_vars_ignores_other_lines.
    fn test_extract_set_vars_ignores_other_lines() {
        // Объявляем переменную vars .
        let vars = extract_set_vars("@echo off\ncall service.bat status\nstart \"x\"");

        // Выполняем операцию: assert!(vars.is_empty());.
        assert!(vars.is_empty());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_expand_percent_vars.
    fn test_expand_percent_vars() {
        // Объявляем переменную vars .
        let mut vars = HashMap::new();
        // Выполняем операцию: vars.insert("LISTS".to_string(), r"C:\s\".to_string());.
        vars.insert("LISTS".to_string(), r"C:\s\".to_string());

        // Объявляем переменную result .
        let result = expand_percent_vars(r"%LISTS%list-general.txt", &vars, &dir());

        // Выполняем операцию: assert_eq!(result, r"C:\s\list-general.txt");.
        assert_eq!(result, r"C:\s\list-general.txt");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_expand_percent_vars_dp0.
    fn test_expand_percent_vars_dp0() {
        // Объявляем переменную result .
        let result = expand_percent_vars(r"%~dp0bin\", &HashMap::new(), &dir());

        // Выполняем операцию: assert_eq!(result, r"C:\zapret\bin\");.
        assert_eq!(result, r"C:\zapret\bin\");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_expand_percent_vars_dp0_trailing_sep.
    fn test_expand_percent_vars_dp0_trailing_sep() {
        // Объявляем переменную result .
        let result =
            // Выполняем операцию: expand_percent_vars(r"%~dp0bin\", &HashMap::new(), &Pat.
            expand_percent_vars(r"%~dp0bin\", &HashMap::new(), &PathBuf::from(r"C:\zapret\"));

        // Выполняем операцию: assert_eq!(result, r"C:\zapret\bin\");.
        assert_eq!(result, r"C:\zapret\bin\");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_expand_no_infinite_loop.
    fn test_expand_no_infinite_loop() {
        // Объявляем переменную vars .
        let mut vars = HashMap::new();
        // Выполняем операцию: vars.insert("A".to_string(), "%B%".to_string());.
        vars.insert("A".to_string(), "%B%".to_string());
        // Выполняем операцию: vars.insert("B".to_string(), "%A%".to_string());.
        vars.insert("B".to_string(), "%A%".to_string());

        // Объявляем переменную result .
        let result = expand_percent_vars("%A%", &vars, &dir());

        // Выполняем операцию: assert!(!result.is_empty());.
        assert!(!result.is_empty());
        // Выполняем операцию: assert!(result.len() < 64);.
        assert!(result.len() < 64);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_expand_keeps_unknown_variable.
    fn test_expand_keeps_unknown_variable() {
        // Объявляем переменную result .
        let result = expand_percent_vars("%MISSING%x", &HashMap::new(), &dir());

        // Выполняем операцию: assert_eq!(result, "%MISSING%x");.
        assert_eq!(result, "%MISSING%x");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_strip_quotes.
    fn test_strip_quotes() {
        // Выполняем операцию: assert_eq!(strip_quotes(r#""C:\path""#), r"C:\path");.
        assert_eq!(strip_quotes(r#""C:\path""#), r"C:\path");
        // Выполняем операцию: assert_eq!(strip_quotes("plain"), "plain");.
        assert_eq!(strip_quotes("plain"), "plain");
        // Выполняем операцию: assert_eq!(strip_quotes(r#""mismatch"#), r#""mismatch"#.
        assert_eq!(strip_quotes(r#""mismatch"#), r#""mismatch"#);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_resolve_path_real_bat_arg.
    fn test_resolve_path_real_bat_arg() {
        // Объявляем переменную content .
        let content = "set \"BIN=%~dp0bin\\\"\r\nset \"LISTS=%~dp0lists\\\"";
        // Объявляем переменную vars .
        let vars = extract_set_vars(content);

        // Объявляем переменную resolved .
        let resolved = resolve_path(
            // Выполняем операцию: r#""%LISTS%list-general.txt""#,.
            r#""%LISTS%list-general.txt""#,
            // Выполняем операцию: &vars,.
            &vars,
            // Выполняем операцию: &PathBuf::from(r"C:\zapret"),.
            &PathBuf::from(r"C:\zapret"),
            // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: resolved,.
            resolved,
            // Выполняем операцию: Some(PathBuf::from(r"C:\zapret\lists\list-general.txt").
            Some(PathBuf::from(r"C:\zapret\lists\list-general.txt")) // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_resolve_path_relative.
    fn test_resolve_path_relative() {
        // Объявляем переменную resolved .
        let resolved = resolve_path("bin\\winws.exe", &HashMap::new(), &dir());

        // Выполняем операцию: assert_eq!(resolved, Some(PathBuf::from(r"C:\zapret\bin.
        assert_eq!(resolved, Some(PathBuf::from(r"C:\zapret\bin\winws.exe")));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_resolve_path_cyrillic.
    fn test_resolve_path_cyrillic() {
        // Объявляем переменную vars .
        let mut vars = HashMap::new();
        // Выполняем операцию: vars.insert("LISTS".to_string(), r"C:\Стратегии\".to_st.
        vars.insert("LISTS".to_string(), r"C:\Стратегии\".to_string());

        // Объявляем переменную resolved .
        let resolved = resolve_path(
            // Выполняем операцию: r#""%LISTS%список.txt""#,.
            r#""%LISTS%список.txt""#,
            // Выполняем операцию: &vars,.
            &vars,
            // Выполняем операцию: &PathBuf::from(r"C:\zapret"),.
            &PathBuf::from(r"C:\zapret"),
            // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: assert_eq!(resolved, Some(PathBuf::from(r"C:\Стратегии\.
        assert_eq!(resolved, Some(PathBuf::from(r"C:\Стратегии\список.txt")));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_resolve_path_empty_returns_none.
    fn test_resolve_path_empty_returns_none() {
        // Выполняем операцию: assert_eq!(resolve_path("  ", &HashMap::new(), &dir()),.
        assert_eq!(resolve_path("  ", &HashMap::new(), &dir()), None);
        // Закрываем блок.
    }
    // Закрываем блок.
}
