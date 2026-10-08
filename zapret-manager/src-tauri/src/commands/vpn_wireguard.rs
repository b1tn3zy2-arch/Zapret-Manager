use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::error::{AppError, AppResult};

pub const WIREGUARD_EXE: &str = "wireguard.exe";
pub const WG_EXE: &str = "wg.exe";
pub const INSTALL_DIR: &str = "WireGuard";

pub const HANDSHAKE_POLL_INTERVAL_MS: u64 = 500;
pub const SWITCH_WAIT_MS: u64 = 5000;

const HANDSHAKE_SECONDS: [&str; 3] = ["second", "minute", "hour"];
const SIZE_UNITS: [&str; 4] = ["B", "KiB", "MiB", "GiB"];

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct HandshakeInfo {
    pub seconds_ago: Option<u64>,
    pub bytes_in: u64,
    pub bytes_out: u64,
    pub endpoint: String,
}

pub fn candidate_dirs() -> Vec<PathBuf> {
    let mut dirs = vec![
        PathBuf::from(INSTALL_DIR),
        PathBuf::from("WireGuard").join("Data"),
    ];

    for key in ["ProgramFiles", "ProgramFiles(x86)", "ProgramW6432"] {
        let Ok(base) = std::env::var(key) else {
            continue;
        };

        if base.is_empty() {
            continue;
        }

        let root = PathBuf::from(base).join(INSTALL_DIR);
        dirs.push(root.clone());
        dirs.push(root.join("Data"));
    }

    dirs
}

pub fn detect_wireguard() -> Option<PathBuf> {
    for dir in candidate_dirs() {
        let candidate = dir.join(WIREGUARD_EXE);

        if candidate.is_file() {
            return Some(candidate);
        }
    }

    None
}

pub fn detect_wg_tool() -> Option<PathBuf> {
    for dir in candidate_dirs() {
        let candidate = dir.join(WG_EXE);

        if candidate.is_file() {
            return Some(candidate);
        }
    }

    None
}

pub fn install_tunnel_arguments(config_path: &std::path::Path) -> Vec<String> {
    vec![
        "/installtunnelservice".to_string(),
        config_path.to_string_lossy().to_string(),
    ]
}

pub fn uninstall_tunnel_arguments(tunnel: &str) -> Vec<String> {
    vec![
        "/uninstalltunnelservice".to_string(),
        tunnel.to_string(),
    ]
}

pub fn show_arguments(interface: &str) -> Vec<String> {
    vec!["show".to_string(), interface.to_string()]
}

pub fn installed_tunnels() -> Option<Vec<String>> {
    let wg = detect_wg_tool()?;

    let output = std::process::Command::new(wg)
        .args(["show", "interfaces"])
        .output()
        .ok()?;

    if !output.status.success() {
        return Some(Vec::new());
    }

    Some(
        String::from_utf8_lossy(&output.stdout)
            .split_whitespace()
            .map(|value| value.to_string())
            .collect(),
    )
}

pub fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|value| value.as_secs())
        .unwrap_or_default()
}

fn value_after<'a>(line: &'a str, key: &str) -> &'a str {
    match line.find(key) {
        Some(index) => line[index + key.len()..].trim(),
        None => "",
    }
}

fn unit_index(unit: &str, table: &[&str]) -> usize {
    let singular = unit.trim().trim_end_matches('s');

    table
        .iter()
        .position(|item| item.trim_end_matches('s') == singular)
        .unwrap_or(0)
}

pub fn parse_size(raw: &str) -> u64 {
    let mut parts = raw.split_whitespace();
    let Some(number) = parts.next().and_then(|value| value.parse::<f64>().ok()) else {
        return 0;
    };

    let unit = parts.next().unwrap_or("B");
    let index = unit_index(unit, &SIZE_UNITS);
    let multiplier = 1024u64.pow(index as u32);

    (number * multiplier as f64) as u64
}

pub fn parse_handshake_seconds(raw: &str) -> Option<u64> {
    let mut words = raw.split_whitespace();

    let value: u64 = words.next()?.parse().ok()?;
    let unit = words.next().unwrap_or("second");
    let index = unit_index(unit, &HANDSHAKE_SECONDS);

    Some(value * 60u64.pow(index as u32))
}

pub fn parse_wg_show_output(output: &str) -> HandshakeInfo {
    let mut info = HandshakeInfo::default();

    for line in output.lines() {
        let trimmed = line.trim();

        if trimmed.starts_with("latest handshake:") {
            info.seconds_ago = parse_handshake_seconds(value_after(trimmed, "latest handshake:"));
            continue;
        }

        if trimmed.starts_with("transfer:") {
            let value = value_after(trimmed, "transfer:");
            let mut parts = value.split(',');

            if let Some(received) = parts.next() {
                info.bytes_in = parse_size(received);
            }

            if let Some(sent) = parts.next() {
                info.bytes_out = parse_size(sent);
            }

            continue;
        }

        if trimmed.starts_with("endpoint:") {
            info.endpoint = value_after(trimmed, "endpoint:").to_string();
        }
    }

    info
}

pub async fn query_handshake(wg: &std::path::Path, interface: &str) -> AppResult<HandshakeInfo> {
    let output = tokio::process::Command::new(wg)
        .args(show_arguments(interface))
        .output()
        .await
        .map_err(|error| AppError::custom(format!("Не удалось запустить wg.exe: {error}")))?;

    Ok(parse_wg_show_output(&String::from_utf8_lossy(&output.stdout)))
}

#[cfg(test)]
#[path = "vpn_wireguard_tests.rs"]
mod tests;