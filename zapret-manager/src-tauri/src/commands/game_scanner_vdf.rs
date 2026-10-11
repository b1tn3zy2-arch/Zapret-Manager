use std::collections::HashMap;

pub fn parse_acf(content: &str) -> HashMap<String, String> {
    scan_pairs(content).into_iter().collect()
}

pub fn parse_library_paths(content: &str) -> Vec<String> {
    let mut paths = Vec::new();

    for (key, value) in scan_pairs(content) {
        let is_index = !key.is_empty() && key.chars().all(|item| item.is_ascii_digit());

        if (key.eq_ignore_ascii_case("path") || is_index) && !value.trim().is_empty() {
            push_unique(&mut paths, value.trim());
        }
    }

    paths
}

pub fn parse_install_dir(content: &str) -> Option<String> {
    let pairs = parse_acf(content);

    ["installdir", "name"]
        .iter()
        .find_map(|key| pairs.get(*key))
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn push_unique(target: &mut Vec<String>, value: &str) {
    if !target.iter().any(|item| item.eq_ignore_ascii_case(value)) {
        target.push(value.to_string());
    }
}

fn scan_pairs(content: &str) -> Vec<(String, String)> {
    let symbols: Vec<char> = content.chars().collect();
    let mut result = Vec::new();
    let mut index = 0;
    let mut depth = 0usize;

    while index < symbols.len() {
        match symbols[index] {
            '{' => {
                depth += 1;
                index += 1;

                continue;
            }
            '}' => {
                depth = depth.saturating_sub(1);
                index += 1;

                continue;
            }
            '"' => {}
            _ => {
                index += 1;

                continue;
            }
        }

        if depth > 2 {
            index = skip_quoted(&symbols, index).max(index);

            continue;
        }

        let Some((key, after_key)) = read_quoted(&symbols, index) else {
            break;
        };

        let mut probe = after_key;

        while probe < symbols.len() && symbols[probe].is_whitespace() {
            probe += 1;
        }

        if probe >= symbols.len() {
            break;
        }

        if symbols[probe] == '{' {
            index = probe + 1;

            continue;
        }

        let Some((value, after_value)) = read_quoted(&symbols, probe) else {
            index = probe + 1;

            continue;
        };

        result.push((key, value));
        index = after_value;
    }

    result
}

fn read_quoted(symbols: &[char], start: usize) -> Option<(String, usize)> {
    if start >= symbols.len() || symbols[start] != '"' {
        return None;
    }

    let mut value = String::new();
    let mut index = start + 1;

    while index < symbols.len() {
        match symbols[index] {
            '\\' if index + 1 < symbols.len() => {
                value.push(symbols[index + 1]);
                index += 2;
            }
            '"' => return Some((value, index + 1)),
            character => {
                value.push(character);
                index += 1;
            }
        }
    }

    None
}

fn skip_quoted(symbols: &[char], start: usize) -> usize {
    read_quoted(symbols, start)
        .map(|(_, next)| next)
        .unwrap_or(start + 1)
}

#[cfg(test)]
#[path = "game_scanner_vdf_tests.rs"]
mod tests;