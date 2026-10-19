use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::error::AppResult;

const GAME_LOG_TAIL: usize = 512 * 1024;
const WINWS_LOG_TAIL: usize = 4 * 1024 * 1024;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameEndpoint {
    pub ip: String,
    pub port: u16,
    pub region: Option<String>,
    pub source: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum TrafficVerdict {
    NoLog,
    NoOutbound,
    NoInbound,
    Tampered,
    Clean,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrafficReport {
    pub ip: String,
    pub port: u16,
    pub outbound: u32,
    pub inbound: u32,
    pub tampered: u32,
    pub dropped: u32,
    pub verdict: TrafficVerdict,
    pub message: String,
    pub log_path: Option<String>,
}

/// Каталоги с логами движков: `%LOCALAPPDATA%\<Проект>\Saved\Logs\*.log`.
fn engine_logs() -> Vec<PathBuf> {
    let Some(local) = std::env::var_os("LOCALAPPDATA") else {
        return Vec::new();
    };

    let Ok(projects) = std::fs::read_dir(PathBuf::from(local)) else {
        return Vec::new();
    };

    let mut found = Vec::new();

    for project in projects.flatten() {
        let dir = project.path().join("Saved").join("Logs");

        let Ok(entries) = std::fs::read_dir(dir) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();

            let is_log = path
                .extension()
                .and_then(|value| value.to_str())
                .map(|value| value.eq_ignore_ascii_case("log"))
                .unwrap_or(false);

            if is_log {
                found.push(path);
            }
        }
    }

    found
}

fn read_tail(path: &Path, limit: usize) -> Option<String> {
    let bytes = std::fs::read(path).ok()?;
    let start = bytes.len().saturating_sub(limit);

    Some(String::from_utf8_lossy(&bytes[start..]).into_owned())
}

fn extract_between(text: &str, key: &str) -> Option<String> {
    let at = text.find(key)? + key.len();

    Some(
        text[at..]
            .chars()
            .take_while(|value| *value != '"')
            .collect::<String>(),
    )
}

/// Адрес игрового сервера из лога движка: `gameSessionInfo` с ip и портом.
fn parse_endpoints(text: &str, source: &str) -> Vec<GameEndpoint> {
    let mut found: Vec<GameEndpoint> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    for line in text.lines() {
        if !line.contains("\"ipAddress\":\"") || !line.contains("\"port\":") {
            continue;
        }

        let Some(ip) = extract_between(line, "\"ipAddress\":\"") else {
            continue;
        };

        let Some(port) = line.find("\"port\":").and_then(|at| {
            line[at + 7..]
                .chars()
                .take_while(|value| value.is_ascii_digit())
                .collect::<String>()
                .parse::<u16>()
                .ok()
        }) else {
            continue;
        };

        if ip.is_empty() || !seen.insert((ip.clone(), port)) {
            continue;
        }

        found.push(GameEndpoint {
            ip,
            port,
            region: extract_between(line, "\"regionName\":\""),
            source: source.to_string(),
        });
    }

    found
}

fn newest_winws_log() -> Option<PathBuf> {
    let dir = std::env::temp_dir().join("zapret-manager").join("logs");

    let entries = std::fs::read_dir(dir).ok()?;

    entries
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .and_then(|value| value.to_str())
                .map(|value| value.eq_ignore_ascii_case("log"))
                .unwrap_or(false)
        })
        .max_by_key(|entry| {
            entry
                .metadata()
                .and_then(|meta| meta.modified())
                .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
        })
        .map(|entry| entry.path())
}

/// Считает пакеты к серверу. Направление указано в строке `packet: id=...`,
/// а адреса и порты — в следующей строке `IP4:`, поэтому держим его отдельно.
/// У входящего пакета порт сервера стоит в `sport`, у исходящего — в `dport`.
fn count_traffic(text: &str, ip: &str, port: u16) -> (u32, u32, u32, u32) {
    let mut outbound = 0;
    let mut inbound = 0;
    let mut tampered = 0;
    let mut dropped = 0;
    let mut last_direction: Option<bool> = None;
    let port_out = format!("dport={port}");
    let port_in = format!("sport={port}");

    for line in text.lines() {
        if line.starts_with("packet: id=") {
            last_direction = if line.contains("outbound") {
                Some(false)
            } else if line.contains("inbound") {
                Some(true)
            } else {
                None
            };

            if line.contains("drop") {
                dropped += 1;
            }

            continue;
        }

        if line.contains("dpi desync") {
            tampered += 1;
        }

        if !line.contains(ip) || last_direction.is_none() {
            continue;
        }

        if last_direction == Some(false) && line.contains(&port_out) {
            outbound += 1;
        }

        if last_direction == Some(true) && line.contains(&port_in) {
            inbound += 1;
        }
    }

    (outbound, inbound, tampered, dropped)
}

fn describe(
    verdict: TrafficVerdict,
    ip: &str,
    port: u16,
    outbound: u32,
    inbound: u32,
) -> String {
    let endpoint = format!("{ip}:{port}");

    match verdict {
        TrafficVerdict::NoLog => {
            "Лог обхода не найден: стратегия ещё не запускалась.".to_string()
        }
        TrafficVerdict::NoOutbound => format!(
            "К {endpoint} не ушло ни одного пакета — игра не начинала подключение к серверу."
        ),
        TrafficVerdict::NoInbound => format!(
            "К {endpoint} ушло {outbound} пакетов, ответов нет. Соединение рвётся по дороге — \
             это и есть отключение от игрового сервера."
        ),
        TrafficVerdict::Tampered => format!(
            "{endpoint}: ответы приходят ({inbound}), но обход их переписывает. Попробуй другую \
             стратегию."
        ),
        TrafficVerdict::Clean => format!(
            "{endpoint}: трафик идёт в обе стороны ({outbound}/{inbound}), обход его не трогает."
        ),
    }
}

#[tauri::command]
pub async fn detect_game_endpoints() -> AppResult<Vec<GameEndpoint>> {
    let mut result: Vec<GameEndpoint> = Vec::new();

    for path in engine_logs() {
        let Some(text) = read_tail(&path, GAME_LOG_TAIL) else {
            continue;
        };

        let source = path.display().to_string();

        result.extend(parse_endpoints(&text, &source));

        if result.len() >= 8 {
            break;
        }
    }

    Ok(result)
}

#[tauri::command]
pub async fn analyze_traffic(ip: String, port: u16) -> AppResult<TrafficReport> {
    let Some(path) = newest_winws_log() else {
        let message = describe(TrafficVerdict::NoLog, &ip, port, 0, 0);

        return Ok(TrafficReport {
            ip,
            port,
            outbound: 0,
            inbound: 0,
            tampered: 0,
            dropped: 0,
            verdict: TrafficVerdict::NoLog,
            message,
            log_path: None,
        });
    };

    let text = read_tail(&path, WINWS_LOG_TAIL).unwrap_or_default();
    let (outbound, inbound, tampered, dropped) = count_traffic(&text, &ip, port);

    let verdict = if outbound == 0 {
        TrafficVerdict::NoOutbound
    } else if inbound == 0 {
        TrafficVerdict::NoInbound
    } else if tampered > 0 {
        TrafficVerdict::Tampered
    } else {
        TrafficVerdict::Clean
    };

    let message = describe(verdict, &ip, port, outbound, inbound);

    Ok(TrafficReport {
        ip,
        port,
        outbound,
        inbound,
        tampered,
        dropped,
        verdict,
        message,
        log_path: Some(path.display().to_string()),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parses_game_session_endpoint() {
        let line =
            r#"{"gameSessionInfo":{"regionName":"eu-central-1","ipAddress":"54.115.206.148","port":7786}}"#;
        let found = parse_endpoints(line, "test");

        assert_eq!(found.len(), 1);
        assert_eq!(found[0].ip, "54.115.206.148");
        assert_eq!(found[0].port, 7786);
        assert_eq!(found[0].region.as_deref(), Some("eu-central-1"));
    }

    #[test]
    fn test_counts_both_directions() {
        let text = concat!(
            "packet: id=264 len=250 outbound IPv6=0 IPChecksum=1\n",
            "IP4: 192.168.1.7 => 54.115.206.148 proto=udp sport=5000 dport=7786 flags=AP\n",
            "packet: id=265 len=120 inbound IPv6=0\n",
            "IP4: 54.115.206.148 => 192.168.1.7 proto=udp sport=7786 dport=5000\n",
        );

        let (outbound, inbound, _, _) = count_traffic(text, "54.115.206.148", 7786);

        assert_eq!(outbound, 1);
        assert_eq!(inbound, 1);
    }

    #[test]
    fn test_foreign_host_is_ignored() {
        let text = "IP4: 192.168.1.7 => 1.2.3.4 proto=udp sport=1 dport=7786";

        let (outbound, inbound, _, _) = count_traffic(text, "54.115.206.148", 7786);

        assert_eq!(outbound, 0);
        assert_eq!(inbound, 0);
    }

    #[test]
    fn test_outbound_without_inbound_is_reported_as_broken() {
        let message = describe(TrafficVerdict::NoInbound, "54.115.206.148", 7786, 12, 0);

        assert!(message.contains("ответов нет"));
        assert!(!message.to_ascii_lowercase().contains("vpn"));
    }
}