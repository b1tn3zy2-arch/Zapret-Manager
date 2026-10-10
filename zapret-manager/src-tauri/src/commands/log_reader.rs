use std::path::{Path, PathBuf};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::{AsyncReadExt, AsyncSeekExt};

use crate::commands::winws::now_millis;
use crate::constants::{LOG_READ_INTERVAL_MS, LOG_TAIL_IDLE_EXIT_TICKS, MAX_LOG_LINES_PER_EVENT};
use crate::process_manager::ProcessManager;

pub const EVENT_STRATEGY_LOG: &str = "strategy-log";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogLine {
    pub timestamp: u64,
    pub level: String,
    pub source: String,
    pub message: String,
    pub strategy_id: String,
}

pub fn detect_level(line: &str) -> &'static str {
    let lowered = line.to_lowercase();

    if lowered.contains("error")
        || lowered.contains("ошибка")
        || lowered.contains("failed")
        || lowered.contains("access is denied")
        || lowered.contains("отказано в доступе")
    {
        return "error";
    }

    if lowered.contains("warn")
        || lowered.contains("предупреждение")
        || lowered.contains("skip")
    {
        return "warn";
    }

    if lowered.contains("success")
        || lowered.contains("успешно")
        || lowered.contains("started")
        || lowered.contains("запущен")
    {
        return "success";
    }

    if lowered.contains("debug") || lowered.contains("отладка") {
        return "debug";
    }

    "info"
}

pub fn system_line(level: &str, message: String) -> LogLine {
    LogLine {
        timestamp: now_millis(),
        level: level.to_string(),
        source: "system".to_string(),
        message,
        strategy_id: String::new(),
    }
}

pub fn strategy_line(strategy_id: &str, level: &str, message: String) -> LogLine {
    LogLine {
        timestamp: now_millis(),
        level: level.to_string(),
        source: "strategy".to_string(),
        message,
        strategy_id: strategy_id.to_string(),
    }
}

pub fn split_complete_lines(buffer: &mut String, chunk: &str) -> Vec<String> {
    buffer.push_str(chunk);

    let mut lines: Vec<String> = Vec::new();

    while let Some(index) = buffer.find('\n') {
        let line = buffer[..index].trim_end_matches('\r').to_string();
        buffer.drain(..=index);

        if !line.trim().is_empty() {
            lines.push(line);
        }
    }

    lines
}

async fn read_new_lines(
    path: &Path,
    position: &mut u64,
    partial: &mut String,
) -> Option<Vec<String>> {
    let mut file = tokio::fs::File::open(path).await.ok()?;

    file.seek(std::io::SeekFrom::Start(*position)).await.ok()?;

    let mut bytes: Vec<u8> = Vec::new();
    file.read_to_end(&mut bytes).await.ok()?;

    *position += bytes.len() as u64;
    let chunk = String::from_utf8_lossy(&bytes).to_string();

    Some(split_complete_lines(partial, &chunk))
}

fn to_log_lines(strategy_id: &str, messages: Vec<String>) -> Vec<LogLine> {
    messages
        .into_iter()
        .map(|message| LogLine {
            timestamp: now_millis(),
            level: detect_level(&message).to_string(),
            source: "strategy".to_string(),
            message,
            strategy_id: strategy_id.to_string(),
        })
        .collect()
}

fn emit_batch(app: &AppHandle, lines: Vec<LogLine>) {
    if lines.is_empty() {
        return;
    }

    for chunk in lines.chunks(MAX_LOG_LINES_PER_EVENT) {
        let _ = app.emit(EVENT_STRATEGY_LOG, chunk);
    }
}

pub fn spawn_log_reader(
    app: AppHandle,
    strategy_id: String,
    log_path: PathBuf,
) -> tauri::async_runtime::JoinHandle<()> {
    tauri::async_runtime::spawn(async move {
        let mut position: u64 = 0;
        let mut partial = String::new();
        let mut idle_ticks: usize = 0;
        let interval = std::time::Duration::from_millis(LOG_READ_INTERVAL_MS);

        loop {
            let fresh = read_new_lines(&log_path, &mut position, &mut partial).await;

            match fresh {
                Some(messages) if !messages.is_empty() => {
                    idle_ticks = 0;
                    emit_batch(&app, to_log_lines(&strategy_id, messages));
                }
                Some(_) => {
                    idle_ticks += 1;
                }
                None => {
                    idle_ticks += 1;
                }
            }

            let tracked = app
                .state::<ProcessManager>()
                .contains(&strategy_id);

            if !tracked && idle_ticks >= LOG_TAIL_IDLE_EXIT_TICKS {
                break;
            }

            tokio::time::sleep(interval).await;
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_complete_lines_basic() {
        let mut buffer = String::new();
        let lines = split_complete_lines(&mut buffer, "one\ntwo\n");

        assert_eq!(lines, vec!["one", "two"]);
        assert!(buffer.is_empty());
    }

    #[test]
    fn test_split_complete_lines_keeps_partial() {
        let mut buffer = String::new();
        let lines = split_complete_lines(&mut buffer, "one\ntw");

        assert_eq!(lines, vec!["one"]);
        assert_eq!(buffer, "tw");
    }

    #[test]
    fn test_split_complete_lines_across_chunks() {
        let mut buffer = String::new();
        split_complete_lines(&mut buffer, "hel");
        let lines = split_complete_lines(&mut buffer, "lo\nworld\n");

        assert_eq!(lines, vec!["hello", "world"]);
    }

    #[test]
    fn test_split_complete_lines_strips_cr() {
        let mut buffer = String::new();
        let lines = split_complete_lines(&mut buffer, "one\r\ntwo\r\n");

        assert_eq!(lines, vec!["one", "two"]);
    }

    #[test]
    fn test_split_complete_lines_skips_empty() {
        let mut buffer = String::new();
        let lines = split_complete_lines(&mut buffer, "one\n\n  \ntwo\n");

        assert_eq!(lines, vec!["one", "two"]);
    }
}
