// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;

// Объявляем константу GAME_LOG_TAIL.
const GAME_LOG_TAIL: usize = 512 * 1024;
// Объявляем константу WINWS_LOG_TAIL.
const WINWS_LOG_TAIL: usize = 4 * 1024 * 1024;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру GameEndpoint.
pub struct GameEndpoint {
    // Выполняем операцию: pub ip: String,.
    pub ip: String,
    // Выполняем операцию: pub port: u16,.
    pub port: u16,
    // Выполняем операцию: pub region: Option<String>,.
    pub region: Option<String>,
    // Выполняем операцию: pub source: String,.
    pub source: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "kebab-case")]
// Объявляем перечисление TrafficVerdict.
pub enum TrafficVerdict {
    // Выполняем операцию: NoLog,.
    NoLog,
    // Выполняем операцию: NoOutbound,.
    NoOutbound,
    // Выполняем операцию: NoInbound,.
    NoInbound,
    // Выполняем операцию: Tampered,.
    Tampered,
    // Выполняем операцию: Clean,.
    Clean,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TrafficReport.
pub struct TrafficReport {
    // Выполняем операцию: pub ip: String,.
    pub ip: String,
    // Выполняем операцию: pub port: u16,.
    pub port: u16,
    // Выполняем операцию: pub outbound: u32,.
    pub outbound: u32,
    // Выполняем операцию: pub inbound: u32,.
    pub inbound: u32,
    // Выполняем операцию: pub tampered: u32,.
    pub tampered: u32,
    // Выполняем операцию: pub dropped: u32,.
    pub dropped: u32,
    // Выполняем операцию: pub verdict: TrafficVerdict,.
    pub verdict: TrafficVerdict,
    // Выполняем операцию: pub message: String,.
    pub message: String,
    // Выполняем операцию: pub log_path: Option<String>,.
    pub log_path: Option<String>,
    // Закрываем блок.
}

/// Каталоги с логами движков: `%LOCALAPPDATA%\<Проект>\Saved\Logs\*.log`.
// Объявляем функцию engine_logs.
fn engine_logs() -> Vec<PathBuf> {
    // Объявляем переменную Some(local) .
    let Some(local) = std::env::var_os("LOCALAPPDATA") else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную Ok(projects) .
    let Ok(projects) = std::fs::read_dir(PathBuf::from(local)) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную found .
    let mut found = Vec::new();

    // Перебираем элементы коллекции.
    for project in projects.flatten() {
        // Объявляем переменную dir .
        let dir = project.path().join("Saved").join("Logs");

        // Объявляем переменную Ok(entries) .
        let Ok(entries) = std::fs::read_dir(dir) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Перебираем элементы коллекции.
        for entry in entries.flatten() {
            // Объявляем переменную path .
            let path = entry.path();

            // Объявляем переменную is_log .
            let is_log = path
                // Выполняем операцию: .extension().
                .extension()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("log")).
                .map(|value| value.eq_ignore_ascii_case("log"))
                // Выполняем операцию: .unwrap_or(false);.
                .unwrap_or(false);

            // Проверяем условие: is_log {.
            if is_log {
                // Выполняем операцию: found.push(path);.
                found.push(path);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: found.
    found
    // Закрываем блок.
}

// Объявляем функцию read_tail.
fn read_tail(path: &Path, limit: usize) -> Option<String> {
    // Объявляем переменную bytes .
    let bytes = std::fs::read(path).ok()?;
    // Объявляем переменную start .
    let start = bytes.len().saturating_sub(limit);

    // Выполняем операцию: Some(String::from_utf8_lossy(&bytes[start..]).into_owne.
    Some(String::from_utf8_lossy(&bytes[start..]).into_owned())
    // Закрываем блок.
}

// Объявляем функцию extract_between.
fn extract_between(text: &str, key: &str) -> Option<String> {
    // Объявляем переменную at .
    let at = text.find(key)? + key.len();

    // Выполняем операцию: Some(.
    Some(
        // Выполняем операцию: text[at..].
        text[at..]
            // Выполняем операцию: .chars().
            .chars()
            // Выполняем операцию: .take_while(|value| *value != '"').
            .take_while(|value| *value != '"')
            // Выполняем операцию: .collect::<String>(),.
            .collect::<String>(),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

/// Адрес игрового сервера из лога движка: `gameSessionInfo` с ip и портом.
// Объявляем функцию parse_endpoints.
fn parse_endpoints(text: &str, source: &str) -> Vec<GameEndpoint> {
    // Объявляем переменную found.
    let mut found: Vec<GameEndpoint> = Vec::new();
    // Объявляем переменную seen .
    let mut seen = std::collections::HashSet::new();

    // Перебираем элементы коллекции.
    for line in text.lines() {
        // Проверяем условие: !line.contains("\"ipAddress\":\"") || !line.contai.
        if !line.contains("\"ipAddress\":\"") || !line.contains("\"port\":") {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(ip) .
        let Some(ip) = extract_between(line, "\"ipAddress\":\"") else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную Some(port) .
        let Some(port) = line.find("\"port\":").and_then(|at| {
            // Выполняем операцию: line[at + 7..].
            line[at + 7..]
                // Выполняем операцию: .chars().
                .chars()
                // Выполняем операцию: .take_while(|value| value.is_ascii_digit()).
                .take_while(|value| value.is_ascii_digit())
                // Выполняем операцию: .collect::<String>().
                .collect::<String>()
                // Выполняем операцию: .parse::<u16>().
                .parse::<u16>()
                // Выполняем операцию: .ok().
                .ok()
            // Закрываем блок.
        }) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: ip.is_empty() || !seen.insert((ip.clone(), port)) .
        if ip.is_empty() || !seen.insert((ip.clone(), port)) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: found.push(GameEndpoint {.
        found.push(GameEndpoint {
            // Выполняем операцию: ip,.
            ip,
            // Выполняем операцию: port,.
            port,
            // Выполняем операцию: region: extract_between(line, "\"regionName\":\""),.
            region: extract_between(line, "\"regionName\":\""),
            // Выполняем операцию: source: source.to_string(),.
            source: source.to_string(),
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Выполняем операцию: found.
    found
    // Закрываем блок.
}

// Объявляем функцию newest_winws_log.
fn newest_winws_log() -> Option<PathBuf> {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-manager").join("logs");

    // Объявляем переменную entries .
    let entries = std::fs::read_dir(dir).ok()?;

    // Выполняем операцию: entries.
    entries
        // Выполняем операцию: .flatten().
        .flatten()
        // Выполняем операцию: .filter(|entry| {.
        .filter(|entry| {
            // Выполняем операцию: entry.
            entry
                // Выполняем операцию: .path().
                .path()
                // Выполняем операцию: .extension().
                .extension()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("log")).
                .map(|value| value.eq_ignore_ascii_case("log"))
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
            // Закрываем блок.
        })
        // Выполняем операцию: .max_by_key(|entry| {.
        .max_by_key(|entry| {
            // Выполняем операцию: entry.
            entry
                // Выполняем операцию: .metadata().
                .metadata()
                // Выполняем операцию: .and_then(|meta| meta.modified()).
                .and_then(|meta| meta.modified())
                // Выполняем операцию: .unwrap_or(std::time::SystemTime::UNIX_EPOCH).
                .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            // Закрываем блок.
        })
        // Выполняем операцию: .map(|entry| entry.path()).
        .map(|entry| entry.path())
    // Закрываем блок.
}

/// Считает пакеты к серверу. Направление указано в строке `packet: id=...`,
/// а адреса и порты — в следующей строке `IP4:`, поэтому держим его отдельно.
/// У входящего пакета порт сервера стоит в `sport`, у исходящего — в `dport`.
// Объявляем функцию count_traffic.
fn count_traffic(text: &str, ip: &str, port: u16) -> (u32, u32, u32, u32) {
    // Объявляем переменную outbound .
    let mut outbound = 0;
    // Объявляем переменную inbound .
    let mut inbound = 0;
    // Объявляем переменную tampered .
    let mut tampered = 0;
    // Объявляем переменную dropped .
    let mut dropped = 0;
    // Объявляем переменную last_direction.
    let mut last_direction: Option<bool> = None;
    // Объявляем переменную port_out .
    let port_out = format!("dport={port}");
    // Объявляем переменную port_in .
    let port_in = format!("sport={port}");

    // Перебираем элементы коллекции.
    for line in text.lines() {
        // Проверяем условие: line.starts_with("packet: id=") {.
        if line.starts_with("packet: id=") {
            // Выполняем операцию: last_direction = if line.contains("outbound") {.
            last_direction = if line.contains("outbound") {
                // Выполняем операцию: Some(false).
                Some(false)
            // Закрываем блок.
            } else if line.contains("inbound") {
                // Выполняем операцию: Some(true).
                Some(true)
            // Закрываем блок.
            } else {
                // Выполняем операцию: None.
                None
                // Закрываем блок.
            };

            // Проверяем условие: line.contains("drop") {.
            if line.contains("drop") {
                // Выполняем операцию: dropped += 1;.
                dropped += 1;
                // Закрываем блок.
            }

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: line.contains("dpi desync") {.
        if line.contains("dpi desync") {
            // Выполняем операцию: tampered += 1;.
            tampered += 1;
            // Закрываем блок.
        }

        // Проверяем условие: !line.contains(ip) || last_direction.is_none() {.
        if !line.contains(ip) || last_direction.is_none() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: last_direction == Some(false) && line.contains(&po.
        if last_direction == Some(false) && line.contains(&port_out) {
            // Выполняем операцию: outbound += 1;.
            outbound += 1;
            // Закрываем блок.
        }

        // Проверяем условие: last_direction == Some(true) && line.contains(&por.
        if last_direction == Some(true) && line.contains(&port_in) {
            // Выполняем операцию: inbound += 1;.
            inbound += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: (outbound, inbound, tampered, dropped).
    (outbound, inbound, tampered, dropped)
    // Закрываем блок.
}

// Объявляем функцию describe.
fn describe(verdict: TrafficVerdict, ip: &str, port: u16, outbound: u32, inbound: u32) -> String {
    // Объявляем переменную endpoint .
    let endpoint = format!("{ip}:{port}");

    // Выбираем вариант по значению.
    match verdict {
        // Выполняем операцию: TrafficVerdict::NoLog => "Лог обхода не найден: стратег.
        TrafficVerdict::NoLog => "Лог обхода не найден: стратегия ещё не запускалась.".to_string(),
        // Выполняем операцию: TrafficVerdict::NoOutbound => format!(.
        TrafficVerdict::NoOutbound => format!(
            // Выполняем операцию: "К {endpoint} не ушло ни одного пакета — игра не начина.
            "К {endpoint} не ушло ни одного пакета — игра не начинала подключение к серверу." // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: TrafficVerdict::NoInbound => format!(.
        TrafficVerdict::NoInbound => format!(
            // Выполняем операцию: "К {endpoint} ушло {outbound} пакетов, ответов нет. Сое.
            "К {endpoint} ушло {outbound} пакетов, ответов нет. Соединение рвётся по дороге — \
             это и есть отключение от игрового сервера." // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: TrafficVerdict::Tampered => format!(.
        TrafficVerdict::Tampered => format!(
            // Выполняем операцию: "{endpoint}: ответы приходят ({inbound}), но обход их п.
            "{endpoint}: ответы приходят ({inbound}), но обход их переписывает. Попробуй другую \
             стратегию." // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: TrafficVerdict::Clean => format!(.
        TrafficVerdict::Clean => format!(
            // Выполняем операцию: "{endpoint}: трафик идёт в обе стороны ({outbound}/{inb.
            "{endpoint}: трафик идёт в обе стороны ({outbound}/{inbound}), обход его не трогает." // Закрываем выражение или коллекцию.
        ),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn detect_game_endpoints() -> AppResult<Vec<G.
pub async fn detect_game_endpoints() -> AppResult<Vec<GameEndpoint>> {
    // Объявляем переменную result.
    let mut result: Vec<GameEndpoint> = Vec::new();

    // Перебираем элементы коллекции.
    for path in engine_logs() {
        // Объявляем переменную Some(text) .
        let Some(text) = read_tail(&path, GAME_LOG_TAIL) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную source .
        let source = path.display().to_string();

        // Выполняем операцию: result.extend(parse_endpoints(&text, &source));.
        result.extend(parse_endpoints(&text, &source));

        // Проверяем условие: result.len() >= 8 {.
        if result.len() >= 8 {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(result).
    Ok(result)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn analyze_traffic(ip: String, port: u16) -> .
pub async fn analyze_traffic(ip: String, port: u16) -> AppResult<TrafficReport> {
    // Объявляем переменную ip .
    let ip = ip.trim().to_string();

    // Проверяем условие: ip.parse::<std::net::IpAddr>().is_err() {.
    if ip.parse::<std::net::IpAddr>().is_err() {
        // Возвращаем результат из функции.
        return Err(crate::error::AppError::custom(
            // Выполняем операцию: "Некорректный IP-адрес для анализа трафика",.
            "Некорректный IP-адрес для анализа трафика",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную Some(path) .
    let Some(path) = newest_winws_log() else {
        // Объявляем переменную message .
        let message = describe(TrafficVerdict::NoLog, &ip, port, 0, 0);

        // Возвращаем результат из функции.
        return Ok(TrafficReport {
            // Выполняем операцию: ip,.
            ip,
            // Выполняем операцию: port,.
            port,
            // Выполняем операцию: outbound: 0,.
            outbound: 0,
            // Выполняем операцию: inbound: 0,.
            inbound: 0,
            // Выполняем операцию: tampered: 0,.
            tampered: 0,
            // Выполняем операцию: dropped: 0,.
            dropped: 0,
            // Выполняем операцию: verdict: TrafficVerdict::NoLog,.
            verdict: TrafficVerdict::NoLog,
            // Выполняем операцию: message,.
            message,
            // Выполняем операцию: log_path: None,.
            log_path: None,
            // Закрываем блок.
        });
        // Закрываем блок.
    };

    // Объявляем переменную text .
    let text = read_tail(&path, WINWS_LOG_TAIL).unwrap_or_default();
    // Объявляем переменную (outbound, inbound, tampered, dropped) .
    let (outbound, inbound, tampered, dropped) = count_traffic(&text, &ip, port);

    // Объявляем переменную verdict .
    let verdict = if outbound == 0 {
        // Выполняем операцию: TrafficVerdict::NoOutbound.
        TrafficVerdict::NoOutbound
    // Закрываем блок.
    } else if inbound == 0 {
        // Выполняем операцию: TrafficVerdict::NoInbound.
        TrafficVerdict::NoInbound
    // Закрываем блок.
    } else if tampered > 0 {
        // Выполняем операцию: TrafficVerdict::Tampered.
        TrafficVerdict::Tampered
    // Закрываем блок.
    } else {
        // Выполняем операцию: TrafficVerdict::Clean.
        TrafficVerdict::Clean
        // Закрываем блок.
    };

    // Объявляем переменную message .
    let message = describe(verdict, &ip, port, outbound, inbound);

    // Выполняем операцию: Ok(TrafficReport {.
    Ok(TrafficReport {
        // Выполняем операцию: ip,.
        ip,
        // Выполняем операцию: port,.
        port,
        // Выполняем операцию: outbound,.
        outbound,
        // Выполняем операцию: inbound,.
        inbound,
        // Выполняем операцию: tampered,.
        tampered,
        // Выполняем операцию: dropped,.
        dropped,
        // Выполняем операцию: verdict,.
        verdict,
        // Выполняем операцию: message,.
        message,
        // Выполняем операцию: log_path: Some(path.display().to_string()),.
        log_path: Some(path.display().to_string()),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_parses_game_session_endpoint.
    fn test_parses_game_session_endpoint() {
        // Объявляем переменную line .
        let line = r#"{"gameSessionInfo":{"regionName":"eu-central-1","ipAddress":"54.115.206.148","port":7786}}"#;
        // Объявляем переменную found .
        let found = parse_endpoints(line, "test");

        // Выполняем операцию: assert_eq!(found.len(), 1);.
        assert_eq!(found.len(), 1);
        // Выполняем операцию: assert_eq!(found[0].ip, "54.115.206.148");.
        assert_eq!(found[0].ip, "54.115.206.148");
        // Выполняем операцию: assert_eq!(found[0].port, 7786);.
        assert_eq!(found[0].port, 7786);
        // Выполняем операцию: assert_eq!(found[0].region.as_deref(), Some("eu-central.
        assert_eq!(found[0].region.as_deref(), Some("eu-central-1"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_counts_both_directions.
    fn test_counts_both_directions() {
        // Объявляем переменную text .
        let text = concat!(
            // Выполняем операцию: "packet: id=264 len=250 outbound IPv6=0 IPChecksum=1\n".
            "packet: id=264 len=250 outbound IPv6=0 IPChecksum=1\n",
            // Выполняем операцию: "IP4: 192.168.1.7 => 54.115.206.148 proto=udp sport=500.
            "IP4: 192.168.1.7 => 54.115.206.148 proto=udp sport=5000 dport=7786 flags=AP\n",
            // Выполняем операцию: "packet: id=265 len=120 inbound IPv6=0\n",.
            "packet: id=265 len=120 inbound IPv6=0\n",
            // Выполняем операцию: "IP4: 54.115.206.148 => 192.168.1.7 proto=udp sport=778.
            "IP4: 54.115.206.148 => 192.168.1.7 proto=udp sport=7786 dport=5000\n",
            // Закрываем выражение или коллекцию.
        );

        // Объявляем переменную (outbound, inbound, _, _) .
        let (outbound, inbound, _, _) = count_traffic(text, "54.115.206.148", 7786);

        // Выполняем операцию: assert_eq!(outbound, 1);.
        assert_eq!(outbound, 1);
        // Выполняем операцию: assert_eq!(inbound, 1);.
        assert_eq!(inbound, 1);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_foreign_host_is_ignored.
    fn test_foreign_host_is_ignored() {
        // Объявляем переменную text .
        let text = "IP4: 192.168.1.7 => 1.2.3.4 proto=udp sport=1 dport=7786";

        // Объявляем переменную (outbound, inbound, _, _) .
        let (outbound, inbound, _, _) = count_traffic(text, "54.115.206.148", 7786);

        // Выполняем операцию: assert_eq!(outbound, 0);.
        assert_eq!(outbound, 0);
        // Выполняем операцию: assert_eq!(inbound, 0);.
        assert_eq!(inbound, 0);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_outbound_without_inbound_is_reported_as_broken.
    fn test_outbound_without_inbound_is_reported_as_broken() {
        // Объявляем переменную message .
        let message = describe(TrafficVerdict::NoInbound, "54.115.206.148", 7786, 12, 0);

        // Выполняем операцию: assert!(message.contains("ответов нет"));.
        assert!(message.contains("ответов нет"));
        // Выполняем операцию: assert!(!message.to_ascii_lowercase().contains("vpn"));.
        assert!(!message.to_ascii_lowercase().contains("vpn"));
        // Закрываем блок.
    }
    // Закрываем блок.
}
