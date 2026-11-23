// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;
// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: crate::bat_env::{expand_percent_vars, extract_set_vars}.
use crate::bat_env::{expand_percent_vars, extract_set_vars};
// Подключаем модули: crate::constants::GAME_FILTER_DEFAULT_PORT;.
use crate::constants::GAME_FILTER_DEFAULT_PORT;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Подключаем модули: super::config::{FilterGroup, StrategyConfig};.
use super::config::{FilterGroup, StrategyConfig};

// Объявляем константу GAME_FILTER_FILE.
const GAME_FILTER_FILE: &str = "game_filter.enabled";
// Объявляем константу GAME_FILTER_UTILS_DIR.
const GAME_FILTER_UTILS_DIR: &str = "utils";
// Объявляем константу GAME_FILTER_RANGE_DEFAULT.
const GAME_FILTER_RANGE_DEFAULT: &str = "1024-65535";

// Объявляем функцию expand_and_split.
pub fn expand_and_split(
    // Выполняем операцию: command: &str,.
    command: &str,
    // Выполняем операцию: vars: &HashMap<String, String>,.
    vars: &HashMap<String, String>,
    // Выполняем операцию: working_dir: &Path,.
    working_dir: &Path,
    // Закрываем выражение или коллекцию.
) -> AppResult<(String, Vec<String>)> {
    // Объявляем переменную expanded .
    let expanded = expand_percent_vars(command, vars, working_dir);
    // Объявляем переменную tokens .
    let tokens = tokenize_command(&expanded);
    // Объявляем переменную position .
    let position = tokens
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .position(|token| token.to_ascii_lowercase().ends_with(.
        .position(|token| token.to_ascii_lowercase().ends_with("winws.exe"))
        // Выполняем операцию: .ok_or_else(|| AppError::custom("в команде нет winws.ex.
        .ok_or_else(|| AppError::custom("в команде нет winws.exe"))?;

    // Объявляем переменную winws_path .
    let winws_path = tokens[position].clone();
    // Объявляем переменную args .
    let args = tokens[position + 1..].to_vec();

    // Выполняем операцию: Ok((winws_path, args)).
    Ok((winws_path, args))
    // Закрываем блок.
}

// Объявляем функцию extract_winws_command.
pub fn extract_winws_command(content: &str) -> Option<String> {
    // Объявляем переменную result .
    let mut result = String::new();
    // Объявляем переменную capturing .
    let mut capturing = false;

    // Перебираем элементы коллекции.
    for raw_line in content.lines() {
        // Объявляем переменную line .
        let line = raw_line.trim();

        // Проверяем условие: !capturing {.
        if !capturing {
            // Проверяем условие: !line.to_ascii_lowercase().contains("winws.exe") {.
            if !line.to_ascii_lowercase().contains("winws.exe") {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }
            // Выполняем операцию: capturing = true;.
            capturing = true;
            // Закрываем блок.
        }

        // Объявляем переменную continued .
        let continued = line.ends_with('^');
        // Объявляем переменную stripped .
        let stripped = if continued {
            // Выполняем операцию: line.trim_end_matches('^').trim_end().
            line.trim_end_matches('^').trim_end()
        // Закрываем блок.
        } else {
            // Выполняем операцию: line.
            line
            // Закрываем блок.
        };
        // Объявляем переменную unescaped .
        let unescaped = stripped.replace("^!", "!");

        // Проверяем условие: !result.is_empty() {.
        if !result.is_empty() {
            // Выполняем операцию: result.push(' ');.
            result.push(' ');
            // Закрываем блок.
        }

        // Выполняем операцию: result.push_str(&unescaped);.
        result.push_str(&unescaped);

        // Проверяем условие: !continued {.
        if !continued {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: capturing {.
    if capturing {
        // Выполняем операцию: Some(result).
        Some(result)
    // Закрываем блок.
    } else {
        // Выполняем операцию: None.
        None
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию tokenize_command.
pub fn tokenize_command(command: &str) -> Vec<String> {
    // Объявляем переменную tokens.
    let mut tokens: Vec<String> = Vec::new();
    // Объявляем переменную current .
    let mut current = String::new();
    // Объявляем переменную quoted .
    let mut quoted = false;

    // Перебираем элементы коллекции.
    for character in command.chars() {
        // Выбираем вариант по значению.
        match character {
            // Выполняем операцию: '"' => {.
            '"' => {
                // Выполняем операцию: quoted = !quoted;.
                quoted = !quoted;
                // Выполняем операцию: current.push(character);.
                current.push(character);
                // Закрываем блок.
            }
            // Выполняем операцию: ' ' | '\t' if !quoted => {.
            ' ' | '\t' if !quoted => {
                // Проверяем условие: !current.is_empty() {.
                if !current.is_empty() {
                    // Выполняем операцию: tokens.push(std::mem::take(&mut current));.
                    tokens.push(std::mem::take(&mut current));
                    // Закрываем блок.
                }
                // Закрываем блок.
            }
            // Выполняем операцию: _ => current.push(character),.
            _ => current.push(character),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: !current.is_empty() {.
    if !current.is_empty() {
        // Выполняем операцию: tokens.push(current);.
        tokens.push(current);
        // Закрываем блок.
    }

    // Выполняем операцию: tokens.
    tokens
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .map(|token| token.replace('"', "")).
        .map(|token| token.replace('"', ""))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию is_general_hostlist.
fn is_general_hostlist(arg: &str) -> bool {
    // Выполняем операцию: arg.strip_prefix("--hostlist=").
    arg.strip_prefix("--hostlist=")
        // Выполняем операцию: .map(|value| file_name_is(value, "list-general.txt")).
        .map(|value| file_name_is(value, "list-general.txt"))
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

// Объявляем функцию is_all_ipset.
fn is_all_ipset(arg: &str) -> bool {
    // Выполняем операцию: arg.strip_prefix("--ipset=").
    arg.strip_prefix("--ipset=")
        // Выполняем операцию: .map(|value| file_name_is(value, "ipset-all.txt")).
        .map(|value| file_name_is(value, "ipset-all.txt"))
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

// Объявляем функцию file_name_is.
fn file_name_is(path: &str, expected: &str) -> bool {
    // Выполняем операцию: path.rsplit(['\\', '/']).
    path.rsplit(['\\', '/'])
        // Выполняем операцию: .next().
        .next()
        // Выполняем операцию: .map(|name| name.eq_ignore_ascii_case(expected)).
        .map(|name| name.eq_ignore_ascii_case(expected))
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

// Объявляем функцию classify_args.
fn classify_args(args: Vec<String>) -> (Option<String>, Option<String>, Vec<FilterGroup>) {
    // Объявляем переменную wf_tcp.
    let mut wf_tcp: Option<String> = None;
    // Объявляем переменную wf_udp.
    let mut wf_udp: Option<String> = None;
    // Объявляем переменную groups.
    let mut groups: Vec<FilterGroup> = vec![FilterGroup::default()];

    // Перебираем элементы коллекции.
    for arg in args {
        // Проверяем условие: let Some(value) = arg.strip_prefix("--wf-tcp=") {.
        if let Some(value) = arg.strip_prefix("--wf-tcp=") {
            // Выполняем операцию: wf_tcp = Some(value.to_string());.
            wf_tcp = Some(value.to_string());
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(value) = arg.strip_prefix("--wf-udp=") {.
        if let Some(value) = arg.strip_prefix("--wf-udp=") {
            // Выполняем операцию: wf_udp = Some(value.to_string());.
            wf_udp = Some(value.to_string());
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: arg == "--new" {.
        if arg == "--new" {
            // Выполняем операцию: groups.push(FilterGroup::default());.
            groups.push(FilterGroup::default());
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(group) .
        let Some(group) = groups.last_mut() else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: is_general_hostlist(&arg) {.
        if is_general_hostlist(&arg) {
            // Выполняем операцию: group.uses_general_hostlist = true;.
            group.uses_general_hostlist = true;
            // Закрываем блок.
        }

        // Проверяем условие: is_all_ipset(&arg) {.
        if is_all_ipset(&arg) {
            // Выполняем операцию: group.uses_all_ipset = true;.
            group.uses_all_ipset = true;
            // Закрываем блок.
        }

        // Выполняем операцию: group.args.push(arg);.
        group.args.push(arg);
        // Закрываем блок.
    }

    // Выполняем операцию: groups.retain(|group| !group.args.is_empty() || group.u.
    groups.retain(|group| !group.args.is_empty() || group.uses_general_hostlist);

    // Выполняем операцию: (wf_tcp, wf_udp, groups).
    (wf_tcp, wf_udp, groups)
    // Закрываем блок.
}

// Объявляем функцию parse_game_filter_content.
fn parse_game_filter_content(content: &str) -> (String, String) {
    // Объявляем переменную mode .
    let mut mode = "disabled".to_string();
    // Объявляем переменную tcp .
    let mut tcp = GAME_FILTER_RANGE_DEFAULT.to_string();
    // Объявляем переменную udp .
    let mut udp = GAME_FILTER_RANGE_DEFAULT.to_string();
    // Объявляем переменную tcp_candidate.
    let mut tcp_candidate: Option<String> = None;
    // Объявляем переменную udp_candidate.
    let mut udp_candidate: Option<String> = None;

    // Перебираем элементы коллекции.
    for line in content.lines() {
        // Объявляем переменную Some((key, value)) .
        let Some((key, value)) = line.split_once('=') else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную key .
        let key = key.trim().to_ascii_lowercase();
        // Объявляем переменную value .
        let value = value.trim().to_string();

        // Выбираем вариант по значению.
        match key.as_str() {
            // Выполняем операцию: "mode" => mode = value.to_ascii_lowercase(),.
            "mode" => mode = value.to_ascii_lowercase(),
            // Выполняем операцию: "all" => mode = "all".to_string(),.
            "all" => mode = "all".to_string(),
            // Выполняем операцию: "tcp" if !value.is_empty() => tcp_candidate = Some(valu.
            "tcp" if !value.is_empty() => tcp_candidate = Some(value),
            // Выполняем операцию: "udp" if !value.is_empty() => udp_candidate = Some(valu.
            "udp" if !value.is_empty() => udp_candidate = Some(value),
            // Выполняем операцию: "tcp" => mode = "tcp".to_string(),.
            "tcp" => mode = "tcp".to_string(),
            // Выполняем операцию: "udp" => mode = "udp".to_string(),.
            "udp" => mode = "udp".to_string(),
            // Выполняем операцию: _ => continue,.
            _ => continue,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(candidate) = &tcp_candidate {.
    if let Some(candidate) = &tcp_candidate {
        // Проверяем условие: is_valid_filter_range(candidate) {.
        if is_valid_filter_range(candidate) {
            // Выполняем операцию: tcp = candidate.clone();.
            tcp = candidate.clone();
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: let Some(candidate) = &udp_candidate {.
    if let Some(candidate) = &udp_candidate {
        // Проверяем условие: is_valid_filter_range(candidate) {.
        if is_valid_filter_range(candidate) {
            // Выполняем операцию: udp = candidate.clone();.
            udp = candidate.clone();
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match mode.as_str() {
        // Выполняем операцию: "all" => (tcp, udp),.
        "all" => (tcp, udp),
        // Выполняем операцию: "tcp" => (tcp, GAME_FILTER_DEFAULT_PORT.to_string()),.
        "tcp" => (tcp, GAME_FILTER_DEFAULT_PORT.to_string()),
        // Выполняем операцию: "udp" => (GAME_FILTER_DEFAULT_PORT.to_string(), udp),.
        "udp" => (GAME_FILTER_DEFAULT_PORT.to_string(), udp),
        // Выполняем операцию: _ => (.
        _ => (
            // Выполняем операцию: GAME_FILTER_DEFAULT_PORT.to_string(),.
            GAME_FILTER_DEFAULT_PORT.to_string(),
            // Выполняем операцию: GAME_FILTER_DEFAULT_PORT.to_string(),.
            GAME_FILTER_DEFAULT_PORT.to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_valid_filter_range.
fn is_valid_filter_range(value: &str) -> bool {
    // Выполняем операцию: value.split(',').all(is_valid_filter_item).
    value.split(',').all(is_valid_filter_item)
    // Закрываем блок.
}

// Объявляем функцию is_valid_filter_item.
fn is_valid_filter_item(item: &str) -> bool {
    // Объявляем переменную item .
    let item = item.trim();

    // Проверяем условие: item.is_empty() {.
    if item.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную parts .
    let mut parts = item.split('-');
    // Объявляем переменную Some(start) .
    let Some(start) = parts.next().and_then(parse_port) else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Объявляем переменную end .
    let end = match parts.next() {
        // Выполняем операцию: Some(raw) => match parse_port(raw) {.
        Some(raw) => match parse_port(raw) {
            // Выполняем операцию: Some(port) => port,.
            Some(port) => port,
            // Выполняем операцию: None => return false,.
            None => return false,
            // Закрываем блок.
        },
        // Выполняем операцию: None => start,.
        None => start,
        // Закрываем блок.
    };

    // Проверяем условие: parts.next().is_some() {.
    if parts.next().is_some() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: start <= end && end <= 65535.
    start <= end && end <= 65535
    // Закрываем блок.
}

// Объявляем функцию parse_port.
fn parse_port(value: &str) -> Option<u32> {
    // Проверяем условие: value.is_empty() || value.len() > 5 {.
    if value.is_empty() || value.len() > 5 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную digits_only .
    let digits_only = value.chars().all(|character| character.is_ascii_digit());

    // Проверяем условие: !digits_only || value.starts_with('0') {.
    if !digits_only || value.starts_with('0') {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: value.parse().ok().
    value.parse().ok()
    // Закрываем блок.
}

// Объявляем функцию resolve_game_filter.
pub fn resolve_game_filter(working_dir: &Path) -> (String, String) {
    // Объявляем переменную path .
    let path = working_dir
        // Выполняем операцию: .join(GAME_FILTER_UTILS_DIR).
        .join(GAME_FILTER_UTILS_DIR)
        // Выполняем операцию: .join(GAME_FILTER_FILE);.
        .join(GAME_FILTER_FILE);

    // Выбираем вариант по значению.
    match std::fs::read_to_string(path) {
        // Выполняем операцию: Ok(content) => parse_game_filter_content(&content),.
        Ok(content) => parse_game_filter_content(&content),
        // Выполняем операцию: Err(_) => (.
        Err(_) => (
            // Выполняем операцию: GAME_FILTER_DEFAULT_PORT.to_string(),.
            GAME_FILTER_DEFAULT_PORT.to_string(),
            // Выполняем операцию: GAME_FILTER_DEFAULT_PORT.to_string(),.
            GAME_FILTER_DEFAULT_PORT.to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию parse_bat.
pub fn parse_bat(
    // Выполняем операцию: content: &str,.
    content: &str,
    // Выполняем операцию: source_filename: &str,.
    source_filename: &str,
    // Выполняем операцию: working_dir: &Path,.
    working_dir: &Path,
    // Закрываем выражение или коллекцию.
) -> AppResult<StrategyConfig> {
    // Объявляем переменную command .
    let command = extract_winws_command(content)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("в .bat не найдена кома.
        .ok_or_else(|| AppError::custom("в .bat не найдена команда запуска winws.exe"))?;

    // Объявляем переменную vars .
    let mut vars = extract_set_vars(content);
    // Объявляем переменную (game_tcp, game_udp) .
    let (game_tcp, game_udp) = resolve_game_filter(working_dir);
    // Выполняем операцию: vars.insert("GAMEFILTERTCP".to_string(), game_tcp);.
    vars.insert("GAMEFILTERTCP".to_string(), game_tcp);
    // Выполняем операцию: vars.insert("GAMEFILTERUDP".to_string(), game_udp);.
    vars.insert("GAMEFILTERUDP".to_string(), game_udp);

    // Объявляем переменную (winws_path, args) .
    let (winws_path, args) = expand_and_split(&command, &vars, working_dir)?;
    // Объявляем переменную (wf_tcp, wf_udp, groups) .
    let (wf_tcp, wf_udp, groups) = classify_args(args);

    // Объявляем переменную config .
    let config = StrategyConfig {
        // Выполняем операцию: source_filename: source_filename.to_string(),.
        source_filename: source_filename.to_string(),
        // Выполняем операцию: winws_path,.
        winws_path,
        // Выполняем операцию: wf_tcp,.
        wf_tcp,
        // Выполняем операцию: wf_udp,.
        wf_udp,
        // Выполняем операцию: groups,.
        groups,
        // Закрываем блок.
    };

    // Выполняем операцию: config.validate()?;.
    config.validate()?;

    // Выполняем операцию: Ok(config).
    Ok(config)
    // Закрываем блок.
}
