use std::path::PathBuf;

use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::task::JoinHandle;

use crate::commands::winws::now_millis;
use crate::constants::{LOG_READ_INTERVAL_MS, MAX_LOG_LINES_PER_EVENT};

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

pub fn spawn_log_reader(
    app: AppHandle,
    strategy_id: String,
    log_path: PathBuf,
) -> JoinHandle<()> {
    tokio::spawn(async move {
        let file = match tokio::fs::File::open(&log_path).await {
            Ok(value) => value,
            Err(error) => {
                tracing::warn!(
                    "Не удалось открыть лог {}: {error}",
                    log_path.display()
                );
                return;
            }
        };

        let (sender, mut receiver) = tokio::sync::mpsc::channel::<LogLine>(512);
        let reader_id = strategy_id.clone();

        let reader = tokio::spawn(async move {
            let mut lines = BufReader::new(file).lines();

            while let Ok(Some(line)) = lines.next_line().await {
                let trimmed = line.trim_end().to_string();
                if trimmed.trim().is_empty() {
                    continue;
                }

                let entry = LogLine {
                    timestamp: now_millis(),
                    level: detect_level(&trimmed).to_string(),
                    source: "strategy".to_string(),
                    message: trimmed,
                    strategy_id: reader_id.clone(),
                };

                if sender.send(entry).await.is_err() {
                    break;
                }
            }
        });

        let mut pending: Vec<LogLine> = Vec::new();
        let mut interval =
            tokio::time::interval(std::time::Duration::from_millis(LOG_READ_INTERVAL_MS));

        loop {
            tokio::select! {
                entry = receiver.recv() => {
                    match entry {
                        Some(line) => pending.push(line),
                        None => break,
                    }
                }
                _ = interval.tick() => {
                    while !pending.is_empty() {
                        let take = MAX_LOG_LINES_PER_EVENT.min(pending.len());
                        let batch: Vec<LogLine> = pending.drain(..take).collect();

                        if app.emit(EVENT_STRATEGY_LOG, &batch).is_err() {
                            return;
                        }
                    }
                }
            }
        }

        if !pending.is_empty() {
            let _ = app.emit(EVENT_STRATEGY_LOG, &pending);
        }

        reader.abort();
    })
}