// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;
// Подключаем модули: std::time::{SystemTime, UNIX_EPOCH};.
use std::time::{SystemTime, UNIX_EPOCH};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::winapi_helpers::HiddenWindow;.
use crate::winapi_helpers::HiddenWindow;

// Объявляем константу WIREGUARD_EXE.
pub const WIREGUARD_EXE: &str = "wireguard.exe";
// Объявляем константу WG_EXE.
pub const WG_EXE: &str = "wg.exe";
// Объявляем константу INSTALL_DIR.
pub const INSTALL_DIR: &str = "WireGuard";

// Объявляем константу HANDSHAKE_POLL_INTERVAL_MS.
pub const HANDSHAKE_POLL_INTERVAL_MS: u64 = 500;
// Объявляем константу SWITCH_WAIT_MS.
pub const SWITCH_WAIT_MS: u64 = 5000;

// Объявляем константу HANDSHAKE_SECONDS.
const HANDSHAKE_SECONDS: [&str; 3] = ["second", "minute", "hour"];
// Объявляем константу SIZE_UNITS.
const SIZE_UNITS: [&str; 4] = ["B", "KiB", "MiB", "GiB"];

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
// Объявляем структуру HandshakeInfo.
pub struct HandshakeInfo {
    // Выполняем операцию: pub seconds_ago: Option<u64>,.
    pub seconds_ago: Option<u64>,
    // Выполняем операцию: pub bytes_in: u64,.
    pub bytes_in: u64,
    // Выполняем операцию: pub bytes_out: u64,.
    pub bytes_out: u64,
    // Выполняем операцию: pub endpoint: String,.
    pub endpoint: String,
    // Закрываем блок.
}

// Объявляем функцию candidate_dirs.
pub fn candidate_dirs() -> Vec<PathBuf> {
    // Объявляем переменную dirs .
    let mut dirs = vec![
        // Выполняем операцию: PathBuf::from(INSTALL_DIR),.
        PathBuf::from(INSTALL_DIR),
        // Выполняем операцию: PathBuf::from("WireGuard").join("Data"),.
        PathBuf::from("WireGuard").join("Data"),
        // Закрываем выражение или коллекцию.
    ];

    // Перебираем элементы коллекции.
    for key in ["ProgramFiles", "ProgramFiles(x86)", "ProgramW6432"] {
        // Объявляем переменную Ok(base) .
        let Ok(base) = std::env::var(key) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: base.is_empty() {.
        if base.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную root .
        let root = PathBuf::from(base).join(INSTALL_DIR);
        // Выполняем операцию: dirs.push(root.clone());.
        dirs.push(root.clone());
        // Выполняем операцию: dirs.push(root.join("Data"));.
        dirs.push(root.join("Data"));
        // Закрываем блок.
    }

    // Выполняем операцию: dirs.
    dirs
    // Закрываем блок.
}

// Объявляем функцию detect_wireguard.
pub fn detect_wireguard() -> Option<PathBuf> {
    // Перебираем элементы коллекции.
    for dir in candidate_dirs() {
        // Объявляем переменную candidate .
        let candidate = dir.join(WIREGUARD_EXE);

        // Проверяем условие: candidate.is_file() {.
        if candidate.is_file() {
            // Возвращаем результат из функции.
            return Some(candidate);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию detect_wg_tool.
pub fn detect_wg_tool() -> Option<PathBuf> {
    // Перебираем элементы коллекции.
    for dir in candidate_dirs() {
        // Объявляем переменную candidate .
        let candidate = dir.join(WG_EXE);

        // Проверяем условие: candidate.is_file() {.
        if candidate.is_file() {
            // Возвращаем результат из функции.
            return Some(candidate);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию install_tunnel_arguments.
pub fn install_tunnel_arguments(config_path: &std::path::Path) -> Vec<String> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: "/installtunnelservice".to_string(),.
        "/installtunnelservice".to_string(),
        // Выполняем операцию: config_path.to_string_lossy().to_string(),.
        config_path.to_string_lossy().to_string(),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

// Объявляем функцию uninstall_tunnel_arguments.
pub fn uninstall_tunnel_arguments(tunnel: &str) -> Vec<String> {
    // Выполняем операцию: vec!["/uninstalltunnelservice".to_string(), tunnel.to_s.
    vec!["/uninstalltunnelservice".to_string(), tunnel.to_string()]
    // Закрываем блок.
}

// Объявляем функцию show_arguments.
pub fn show_arguments(interface: &str) -> Vec<String> {
    // Выполняем операцию: vec!["show".to_string(), interface.to_string()].
    vec!["show".to_string(), interface.to_string()]
    // Закрываем блок.
}

// Выполняем операцию: pub async fn installed_tunnels() -> Option<Vec<String>>.
pub async fn installed_tunnels() -> Option<Vec<String>> {
    // Объявляем переменную wg .
    let wg = detect_wg_tool()?;

    // Объявляем переменную output .
    let output = tokio::process::Command::new(wg)
        // Выполняем операцию: .args(["show", "interfaces"]).
        .args(["show", "interfaces"])
        // Выполняем операцию: .hidden().
        .hidden()
        // Выполняем операцию: .output().
        .output()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .ok()?;.
        .ok()?;

    // Проверяем условие: !output.status.success() {.
    if !output.status.success() {
        // Возвращаем результат из функции.
        return Some(Vec::new());
        // Закрываем блок.
    }

    // Выполняем операцию: Some(.
    Some(
        // Выполняем операцию: String::from_utf8_lossy(&output.stdout).
        String::from_utf8_lossy(&output.stdout)
            // Выполняем операцию: .split_whitespace().
            .split_whitespace()
            // Выполняем операцию: .map(|value| value.to_string()).
            .map(|value| value.to_string())
            // Выполняем операцию: .collect(),.
            .collect(),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Объявляем функцию now_secs.
pub fn now_secs() -> u64 {
    // Выполняем операцию: SystemTime::now().
    SystemTime::now()
        // Выполняем операцию: .duration_since(UNIX_EPOCH).
        .duration_since(UNIX_EPOCH)
        // Выполняем операцию: .map(|value| value.as_secs()).
        .map(|value| value.as_secs())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию value_after.
fn value_after<'a>(line: &'a str, key: &str) -> &'a str {
    // Выбираем вариант по значению.
    match line.find(key) {
        // Выполняем операцию: Some(index) => line[index + key.len()..].trim(),.
        Some(index) => line[index + key.len()..].trim(),
        // Выполняем операцию: None => "",.
        None => "",
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию unit_index.
fn unit_index(unit: &str, table: &[&str]) -> usize {
    // Объявляем переменную singular .
    let singular = unit.trim().trim_end_matches('s');

    // Выполняем операцию: table.
    table
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .position(|item| item.trim_end_matches('s') == singular.
        .position(|item| item.trim_end_matches('s') == singular)
        // Выполняем операцию: .unwrap_or(0).
        .unwrap_or(0)
    // Закрываем блок.
}

// Объявляем функцию parse_size.
pub fn parse_size(raw: &str) -> u64 {
    // Объявляем переменную parts .
    let mut parts = raw.split_whitespace();
    // Объявляем переменную Some(number) .
    let Some(number) = parts.next().and_then(|value| value.parse::<f64>().ok()) else {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    };

    // Объявляем переменную unit .
    let unit = parts.next().unwrap_or("B");
    // Объявляем переменную index .
    let index = unit_index(unit, &SIZE_UNITS);
    // Объявляем переменную multiplier .
    let multiplier = 1024u64.pow(index as u32);

    // Выполняем операцию: (number * multiplier as f64) as u64.
    (number * multiplier as f64) as u64
    // Закрываем блок.
}

// Объявляем функцию parse_handshake_seconds.
pub fn parse_handshake_seconds(raw: &str) -> Option<u64> {
    // Объявляем переменную words .
    let mut words = raw.split_whitespace();

    // Объявляем переменную value.
    let value: u64 = words.next()?.parse().ok()?;
    // Объявляем переменную unit .
    let unit = words.next().unwrap_or("second");
    // Объявляем переменную index .
    let index = unit_index(unit, &HANDSHAKE_SECONDS);

    // Выполняем операцию: Some(value * 60u64.pow(index as u32)).
    Some(value * 60u64.pow(index as u32))
    // Закрываем блок.
}

// Объявляем функцию parse_wg_show_output.
pub fn parse_wg_show_output(output: &str) -> HandshakeInfo {
    // Объявляем переменную info .
    let mut info = HandshakeInfo::default();

    // Перебираем элементы коллекции.
    for line in output.lines() {
        // Объявляем переменную trimmed .
        let trimmed = line.trim();

        // Проверяем условие: trimmed.starts_with("latest handshake:") {.
        if trimmed.starts_with("latest handshake:") {
            // Выполняем операцию: info.seconds_ago = parse_handshake_seconds(value_after(.
            info.seconds_ago = parse_handshake_seconds(value_after(trimmed, "latest handshake:"));
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: trimmed.starts_with("transfer:") {.
        if trimmed.starts_with("transfer:") {
            // Объявляем переменную value .
            let value = value_after(trimmed, "transfer:");
            // Объявляем переменную parts .
            let mut parts = value.split(',');

            // Проверяем условие: let Some(received) = parts.next() {.
            if let Some(received) = parts.next() {
                // Выполняем операцию: info.bytes_in = parse_size(received);.
                info.bytes_in = parse_size(received);
                // Закрываем блок.
            }

            // Проверяем условие: let Some(sent) = parts.next() {.
            if let Some(sent) = parts.next() {
                // Выполняем операцию: info.bytes_out = parse_size(sent);.
                info.bytes_out = parse_size(sent);
                // Закрываем блок.
            }

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: trimmed.starts_with("endpoint:") {.
        if trimmed.starts_with("endpoint:") {
            // Выполняем операцию: info.endpoint = value_after(trimmed, "endpoint:").to_st.
            info.endpoint = value_after(trimmed, "endpoint:").to_string();
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: info.
    info
    // Закрываем блок.
}

// Выполняем операцию: pub async fn query_handshake(wg: &std::path::Path, inte.
pub async fn query_handshake(wg: &std::path::Path, interface: &str) -> AppResult<HandshakeInfo> {
    // Объявляем переменную output .
    let output = tokio::process::Command::new(wg)
        // Выполняем операцию: .args(show_arguments(interface)).
        .args(show_arguments(interface))
        // Выполняем операцию: .hidden().
        .hidden()
        // Выполняем операцию: .output().
        .output()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не удалось з.
        .map_err(|error| AppError::custom(format!("Не удалось запустить wg.exe: {error}")))?;

    // Выполняем операцию: Ok(parse_wg_show_output(&String::from_utf8_lossy(.
    Ok(parse_wg_show_output(&String::from_utf8_lossy(
        // Выполняем операцию: &output.stdout,.
        &output.stdout,
        // Закрываем выражение или коллекцию.
    )))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_wireguard_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
