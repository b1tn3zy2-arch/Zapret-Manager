use std::collections::HashMap;
use std::path::Path;

use crate::bat_env::{expand_percent_vars, extract_set_vars};
use crate::constants::GAME_FILTER_DEFAULT_PORT;
use crate::error::{AppError, AppResult};

use super::config::{FilterGroup, StrategyConfig};

const GAME_FILTER_FILE: &str = "game_filter.enabled";
const GAME_FILTER_UTILS_DIR: &str = "utils";
const GAME_FILTER_RANGE_DEFAULT: &str = "1024-65535";

pub fn expand_and_split(
    command: &str,
    vars: &HashMap<String, String>,
    working_dir: &Path,
) -> AppResult<(String, Vec<String>)> {
    let expanded = expand_percent_vars(command, vars, working_dir);
    let tokens = tokenize_command(&expanded);
    let position = tokens
        .iter()
        .position(|token| token.to_ascii_lowercase().ends_with("winws.exe"))
        .ok_or_else(|| AppError::custom("в команде нет winws.exe"))?;

    let winws_path = tokens[position].clone();
    let args = tokens[position + 1..].to_vec();

    Ok((winws_path, args))
}

pub fn extract_winws_command(content: &str) -> Option<String> {
    let mut result = String::new();
    let mut capturing = false;

    for raw_line in content.lines() {
        let line = raw_line.trim();

        if !capturing {
            if !line.to_ascii_lowercase().contains("winws.exe") {
                continue;
            }
            capturing = true;
        }

        let continued = line.ends_with('^');
        let stripped = if continued {
            line.trim_end_matches('^').trim_end()
        } else {
            line
        };
        let unescaped = stripped.replace("^!", "!");

        if !result.is_empty() {
            result.push(' ');
        }

        result.push_str(&unescaped);

        if !continued {
            break;
        }
    }

    if capturing { Some(result) } else { None }
}

pub fn tokenize_command(command: &str) -> Vec<String> {
    let mut tokens: Vec<String> = Vec::new();
    let mut current = String::new();
    let mut quoted = false;

    for character in command.chars() {
        match character {
            '"' => {
                quoted = !quoted;
                current.push(character);
            }
            ' ' | '\t' if !quoted => {
                if !current.is_empty() {
                    tokens.push(std::mem::take(&mut current));
                }
            }
            _ => current.push(character),
        }
    }

    if !current.is_empty() {
        tokens.push(current);
    }

    tokens
        .into_iter()
        .map(|token| token.replace('"', ""))
        .collect()
}

fn is_general_hostlist(arg: &str) -> bool {
    arg.strip_prefix("--hostlist=")
        .map(|value| file_name_is(value, "list-general.txt"))
        .unwrap_or(false)
}

fn is_all_ipset(arg: &str) -> bool {
    arg.strip_prefix("--ipset=")
        .map(|value| file_name_is(value, "ipset-all.txt"))
        .unwrap_or(false)
}

fn file_name_is(path: &str, expected: &str) -> bool {
    path.rsplit(['\\', '/'])
        .next()
        .map(|name| name.eq_ignore_ascii_case(expected))
        .unwrap_or(false)
}

fn classify_args(
    args: Vec<String>,
) -> (Option<String>, Option<String>, Vec<FilterGroup>) {
    let mut wf_tcp: Option<String> = None;
    let mut wf_udp: Option<String> = None;
    let mut groups: Vec<FilterGroup> = vec![FilterGroup::default()];

    for arg in args {
        if let Some(value) = arg.strip_prefix("--wf-tcp=") {
            wf_tcp = Some(value.to_string());
            continue;
        }

        if let Some(value) = arg.strip_prefix("--wf-udp=") {
            wf_udp = Some(value.to_string());
            continue;
        }

        if arg == "--new" {
            groups.push(FilterGroup::default());
            continue;
        }

        let Some(group) = groups.last_mut() else {
            continue;
        };

        if is_general_hostlist(&arg) {
            group.uses_general_hostlist = true;
        }

        if is_all_ipset(&arg) {
            group.uses_all_ipset = true;
        }

        group.args.push(arg);
    }

    groups.retain(|group| !group.args.is_empty() || group.uses_general_hostlist);

    (wf_tcp, wf_udp, groups)
}

fn parse_game_filter_content(content: &str) -> (String, String) {
    let mut mode = "disabled".to_string();
    let mut tcp = GAME_FILTER_RANGE_DEFAULT.to_string();
    let mut udp = GAME_FILTER_RANGE_DEFAULT.to_string();
    let mut tcp_candidate: Option<String> = None;
    let mut udp_candidate: Option<String> = None;

    for line in content.lines() {
        let Some((key, value)) = line.split_once('=') else {
            continue;
        };

        let key = key.trim().to_ascii_lowercase();
        let value = value.trim().to_string();

        match key.as_str() {
            "mode" => mode = value.to_ascii_lowercase(),
            "all" => mode = "all".to_string(),
            "tcp" if !value.is_empty() => tcp_candidate = Some(value),
            "udp" if !value.is_empty() => udp_candidate = Some(value),
            "tcp" => mode = "tcp".to_string(),
            "udp" => mode = "udp".to_string(),
            _ => continue,
        }
    }

    if let Some(candidate) = &tcp_candidate {
        if is_valid_filter_range(candidate) {
            tcp = candidate.clone();
        }
    }

    if let Some(candidate) = &udp_candidate {
        if is_valid_filter_range(candidate) {
            udp = candidate.clone();
        }
    }

    match mode.as_str() {
        "all" => (tcp, udp),
        "tcp" => (tcp, GAME_FILTER_DEFAULT_PORT.to_string()),
        "udp" => (GAME_FILTER_DEFAULT_PORT.to_string(), udp),
        _ => (
            GAME_FILTER_DEFAULT_PORT.to_string(),
            GAME_FILTER_DEFAULT_PORT.to_string(),
        ),
    }
}

fn is_valid_filter_range(value: &str) -> bool {
    value.split(',').all(is_valid_filter_item)
}

fn is_valid_filter_item(item: &str) -> bool {
    let item = item.trim();

    if item.is_empty() {
        return false;
    }

    let mut parts = item.split('-');
    let Some(start) = parts.next().and_then(parse_port) else {
        return false;
    };

    let end = match parts.next() {
        Some(raw) => match parse_port(raw) {
            Some(port) => port,
            None => return false,
        },
        None => start,
    };

    if parts.next().is_some() {
        return false;
    }

    start <= end && end <= 65535
}

fn parse_port(value: &str) -> Option<u32> {
    if value.is_empty() || value.len() > 5 {
        return None;
    }

    let digits_only = value.chars().all(|character| character.is_ascii_digit());

    if !digits_only || value.starts_with('0') {
        return None;
    }

    value.parse().ok()
}

pub fn resolve_game_filter(working_dir: &Path) -> (String, String) {
    let path = working_dir
        .join(GAME_FILTER_UTILS_DIR)
        .join(GAME_FILTER_FILE);

    match std::fs::read_to_string(path) {
        Ok(content) => parse_game_filter_content(&content),
        Err(_) => (
            GAME_FILTER_DEFAULT_PORT.to_string(),
            GAME_FILTER_DEFAULT_PORT.to_string(),
        ),
    }
}

pub fn parse_bat(
    content: &str,
    source_filename: &str,
    working_dir: &Path,
) -> AppResult<StrategyConfig> {
    let command = extract_winws_command(content).ok_or_else(|| {
        AppError::custom("в .bat не найдена команда запуска winws.exe")
    })?;

    let mut vars = extract_set_vars(content);
    let (game_tcp, game_udp) = resolve_game_filter(working_dir);
    vars.insert("GAMEFILTERTCP".to_string(), game_tcp);
    vars.insert("GAMEFILTERUDP".to_string(), game_udp);

    let (winws_path, args) = expand_and_split(&command, &vars, working_dir)?;
    let (wf_tcp, wf_udp, groups) = classify_args(args);

    let config = StrategyConfig {
        source_filename: source_filename.to_string(),
        winws_path,
        wf_tcp,
        wf_udp,
        groups,
    };

    config.validate()?;

    Ok(config)
}
