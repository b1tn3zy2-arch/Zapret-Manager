// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;

// Объявляем функцию parse_acf.
pub fn parse_acf(content: &str) -> HashMap<String, String> {
    // Выполняем операцию: scan_pairs(content).into_iter().collect().
    scan_pairs(content).into_iter().collect()
    // Закрываем блок.
}

// Объявляем функцию parse_library_paths.
pub fn parse_library_paths(content: &str) -> Vec<String> {
    // Объявляем переменную paths .
    let mut paths = Vec::new();

    // Перебираем элементы коллекции.
    for (key, value) in scan_pairs(content) {
        // Объявляем переменную is_index .
        let is_index = !key.is_empty() && key.chars().all(|item| item.is_ascii_digit());

        // Проверяем условие: (key.eq_ignore_ascii_case("path") || is_index) && .
        if (key.eq_ignore_ascii_case("path") || is_index) && !value.trim().is_empty() {
            // Выполняем операцию: push_unique(&mut paths, value.trim());.
            push_unique(&mut paths, value.trim());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: paths.
    paths
    // Закрываем блок.
}

// Объявляем функцию parse_install_dir.
pub fn parse_install_dir(content: &str) -> Option<String> {
    // Объявляем переменную pairs .
    let pairs = parse_acf(content);

    // Выполняем операцию: ["installdir", "name"].
    ["installdir", "name"]
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find_map(|key| pairs.get(*key)).
        .find_map(|key| pairs.get(*key))
        // Выполняем операцию: .map(|value| value.trim().to_string()).
        .map(|value| value.trim().to_string())
        // Выполняем операцию: .filter(|value| !value.is_empty()).
        .filter(|value| !value.is_empty())
    // Закрываем блок.
}

// Объявляем функцию push_unique.
fn push_unique(target: &mut Vec<String>, value: &str) {
    // Проверяем условие: !target.iter().any(|item| item.eq_ignore_ascii_cas.
    if !target.iter().any(|item| item.eq_ignore_ascii_case(value)) {
        // Выполняем операцию: target.push(value.to_string());.
        target.push(value.to_string());
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию scan_pairs.
fn scan_pairs(content: &str) -> Vec<(String, String)> {
    // Объявляем переменную symbols.
    let symbols: Vec<char> = content.chars().collect();
    // Объявляем переменную result .
    let mut result = Vec::new();
    // Объявляем переменную index .
    let mut index = 0;
    // Объявляем переменную depth .
    let mut depth = 0usize;

    // Повторяем, пока выполняется условие.
    while index < symbols.len() {
        // Выбираем вариант по значению.
        match symbols[index] {
            // Выполняем операцию: '{' => {.
            '{' => {
                // Выполняем операцию: depth += 1;.
                depth += 1;
                // Выполняем операцию: index += 1;.
                index += 1;

                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }
            // Выполняем операцию: '}' => {.
            '}' => {
                // Выполняем операцию: depth = depth.saturating_sub(1);.
                depth = depth.saturating_sub(1);
                // Выполняем операцию: index += 1;.
                index += 1;

                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }
            // Выполняем операцию: '"' => {}.
            '"' => {}
            // Выполняем операцию: _ => {.
            _ => {
                // Выполняем операцию: index += 1;.
                index += 1;

                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            } // Закрываем блок.
        }

        // Проверяем условие: depth > 2 {.
        if depth > 2 {
            // Выполняем операцию: index = skip_quoted(&symbols, index).max(index);.
            index = skip_quoted(&symbols, index).max(index);

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some((key, after_key)) .
        let Some((key, after_key)) = read_quoted(&symbols, index) else {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        };

        // Объявляем переменную probe .
        let mut probe = after_key;

        // Повторяем, пока выполняется условие.
        while probe < symbols.len() && symbols[probe].is_whitespace() {
            // Выполняем операцию: probe += 1;.
            probe += 1;
            // Закрываем блок.
        }

        // Проверяем условие: probe >= symbols.len() {.
        if probe >= symbols.len() {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Проверяем условие: symbols[probe] == '{' {.
        if symbols[probe] == '{' {
            // Выполняем операцию: index = probe + 1;.
            index = probe + 1;

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some((value, after_value)) .
        let Some((value, after_value)) = read_quoted(&symbols, probe) else {
            // Выполняем операцию: index = probe + 1;.
            index = probe + 1;

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Выполняем операцию: result.push((key, value));.
        result.push((key, value));
        // Выполняем операцию: index = after_value;.
        index = after_value;
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию read_quoted.
fn read_quoted(symbols: &[char], start: usize) -> Option<(String, usize)> {
    // Проверяем условие: start >= symbols.len() || symbols[start] != '"' {.
    if start >= symbols.len() || symbols[start] != '"' {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную value .
    let mut value = String::new();
    // Объявляем переменную index .
    let mut index = start + 1;

    // Повторяем, пока выполняется условие.
    while index < symbols.len() {
        // Выбираем вариант по значению.
        match symbols[index] {
            // Выполняем операцию: '\\' if index + 1 < symbols.len() => {.
            '\\' if index + 1 < symbols.len() => {
                // Выполняем операцию: value.push(symbols[index + 1]);.
                value.push(symbols[index + 1]);
                // Выполняем операцию: index += 2;.
                index += 2;
                // Закрываем блок.
            }
            // Выполняем операцию: '"' => return Some((value, index + 1)),.
            '"' => return Some((value, index + 1)),
            // Выполняем операцию: character => {.
            character => {
                // Выполняем операцию: value.push(character);.
                value.push(character);
                // Выполняем операцию: index += 1;.
                index += 1;
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию skip_quoted.
fn skip_quoted(symbols: &[char], start: usize) -> usize {
    // Выполняем операцию: read_quoted(symbols, start).
    read_quoted(symbols, start)
        // Выполняем операцию: .map(|(_, next)| next).
        .map(|(_, next)| next)
        // Выполняем операцию: .unwrap_or(start + 1).
        .unwrap_or(start + 1)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_scanner_vdf_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
