// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tauri::{AppHandle, Emitter, Manager};.
use tauri::{AppHandle, Emitter, Manager};
// Подключаем модули: tokio::io::{AsyncReadExt, AsyncSeekExt};.
use tokio::io::{AsyncReadExt, AsyncSeekExt};

// Подключаем модули: crate::commands::winws::now_millis;.
use crate::commands::winws::now_millis;
// Подключаем модули: crate::constants::{LOG_READ_INTERVAL_MS, LOG_TAIL_IDLE_.
use crate::constants::{LOG_READ_INTERVAL_MS, LOG_TAIL_IDLE_EXIT_TICKS, MAX_LOG_LINES_PER_EVENT};
// Подключаем модули: crate::process_manager::ProcessManager;.
use crate::process_manager::ProcessManager;

// Объявляем константу EVENT_STRATEGY_LOG.
pub const EVENT_STRATEGY_LOG: &str = "strategy-log";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру LogLine.
pub struct LogLine {
    // Выполняем операцию: pub timestamp: u64,.
    pub timestamp: u64,
    // Выполняем операцию: pub level: String,.
    pub level: String,
    // Выполняем операцию: pub source: String,.
    pub source: String,
    // Выполняем операцию: pub message: String,.
    pub message: String,
    // Выполняем операцию: pub strategy_id: String,.
    pub strategy_id: String,
    // Закрываем блок.
}

// Объявляем функцию detect_level.
pub fn detect_level(line: &str) -> &'static str {
    // Объявляем переменную lowered .
    let lowered = line.to_lowercase();

    // Проверяем условие: lowered.contains("error").
    if lowered.contains("error")
        // Выполняем операцию: || lowered.contains("ошибка").
        || lowered.contains("ошибка")
        // Выполняем операцию: || lowered.contains("failed").
        || lowered.contains("failed")
        // Выполняем операцию: || lowered.contains("access is denied").
        || lowered.contains("access is denied")
        // Выполняем операцию: || lowered.contains("отказано в доступе").
        || lowered.contains("отказано в доступе")
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return "error";
        // Закрываем блок.
    }

    // Проверяем условие: lowered.contains("warn") || lowered.contains("пред.
    if lowered.contains("warn") || lowered.contains("предупреждение") || lowered.contains("skip")
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return "warn";
        // Закрываем блок.
    }

    // Проверяем условие: lowered.contains("success").
    if lowered.contains("success")
        // Выполняем операцию: || lowered.contains("успешно").
        || lowered.contains("успешно")
        // Выполняем операцию: || lowered.contains("started").
        || lowered.contains("started")
        // Выполняем операцию: || lowered.contains("запущен").
        || lowered.contains("запущен")
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return "success";
        // Закрываем блок.
    }

    // Проверяем условие: lowered.contains("debug") || lowered.contains("отл.
    if lowered.contains("debug") || lowered.contains("отладка") {
        // Возвращаем результат из функции.
        return "debug";
        // Закрываем блок.
    }

    // Выполняем операцию: "info".
    "info"
    // Закрываем блок.
}

// Объявляем функцию system_line.
pub fn system_line(level: &str, message: String) -> LogLine {
    // Выполняем операцию: LogLine {.
    LogLine {
        // Выполняем операцию: timestamp: now_millis(),.
        timestamp: now_millis(),
        // Выполняем операцию: level: level.to_string(),.
        level: level.to_string(),
        // Выполняем операцию: source: "system".to_string(),.
        source: "system".to_string(),
        // Выполняем операцию: message,.
        message,
        // Выполняем операцию: strategy_id: String::new(),.
        strategy_id: String::new(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию strategy_line.
pub fn strategy_line(strategy_id: &str, level: &str, message: String) -> LogLine {
    // Выполняем операцию: LogLine {.
    LogLine {
        // Выполняем операцию: timestamp: now_millis(),.
        timestamp: now_millis(),
        // Выполняем операцию: level: level.to_string(),.
        level: level.to_string(),
        // Выполняем операцию: source: "strategy".to_string(),.
        source: "strategy".to_string(),
        // Выполняем операцию: message,.
        message,
        // Выполняем операцию: strategy_id: strategy_id.to_string(),.
        strategy_id: strategy_id.to_string(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию split_complete_lines.
pub fn split_complete_lines(buffer: &mut String, chunk: &str) -> Vec<String> {
    // Выполняем операцию: buffer.push_str(chunk);.
    buffer.push_str(chunk);

    // Объявляем переменную lines.
    let mut lines: Vec<String> = Vec::new();

    // Повторяем, пока выполняется условие.
    while let Some(index) = buffer.find('\n') {
        // Объявляем переменную line .
        let line = buffer[..index].trim_end_matches('\r').to_string();
        // Выполняем операцию: buffer.drain(..=index);.
        buffer.drain(..=index);

        // Проверяем условие: !line.trim().is_empty() {.
        if !line.trim().is_empty() {
            // Выполняем операцию: lines.push(line);.
            lines.push(line);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: lines.
    lines
    // Закрываем блок.
}

// Объявляем функцию read_new_lines.
async fn read_new_lines(
    // Выполняем операцию: path: &Path,.
    path: &Path,
    // Выполняем операцию: position: &mut u64,.
    position: &mut u64,
    // Выполняем операцию: partial: &mut String,.
    partial: &mut String,
    // Закрываем выражение или коллекцию.
) -> Option<Vec<String>> {
    // Объявляем переменную file .
    let mut file = tokio::fs::File::open(path).await.ok()?;

    // Выполняем операцию: file.seek(std::io::SeekFrom::Start(*position)).await.ok.
    file.seek(std::io::SeekFrom::Start(*position)).await.ok()?;

    // Объявляем переменную bytes.
    let mut bytes: Vec<u8> = Vec::new();
    // Выполняем операцию: file.read_to_end(&mut bytes).await.ok()?;.
    file.read_to_end(&mut bytes).await.ok()?;

    *position += bytes.len() as u64;
    // Объявляем переменную chunk .
    let chunk = String::from_utf8_lossy(&bytes).to_string();

    // Выполняем операцию: Some(split_complete_lines(partial, &chunk)).
    Some(split_complete_lines(partial, &chunk))
    // Закрываем блок.
}

// Объявляем функцию to_log_lines.
fn to_log_lines(strategy_id: &str, messages: Vec<String>) -> Vec<LogLine> {
    // Выполняем операцию: messages.
    messages
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .map(|message| LogLine {.
        .map(|message| LogLine {
            // Выполняем операцию: timestamp: now_millis(),.
            timestamp: now_millis(),
            // Выполняем операцию: level: detect_level(&message).to_string(),.
            level: detect_level(&message).to_string(),
            // Выполняем операцию: source: "strategy".to_string(),.
            source: "strategy".to_string(),
            // Выполняем операцию: message,.
            message,
            // Выполняем операцию: strategy_id: strategy_id.to_string(),.
            strategy_id: strategy_id.to_string(),
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию emit_batch.
fn emit_batch(app: &AppHandle, lines: Vec<LogLine>) {
    // Проверяем условие: lines.is_empty() {.
    if lines.is_empty() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for chunk in lines.chunks(MAX_LOG_LINES_PER_EVENT) {
        // Объявляем переменную _ .
        let _ = app.emit(EVENT_STRATEGY_LOG, chunk);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию spawn_log_reader.
pub fn spawn_log_reader(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Выполняем операцию: log_path: PathBuf,.
    log_path: PathBuf,
    // Закрываем выражение или коллекцию.
) -> tauri::async_runtime::JoinHandle<()> {
    // Выполняем операцию: tauri::async_runtime::spawn(async move {.
    tauri::async_runtime::spawn(async move {
        // Объявляем переменную position.
        let mut position: u64 = 0;
        // Объявляем переменную partial .
        let mut partial = String::new();
        // Объявляем переменную idle_ticks.
        let mut idle_ticks: usize = 0;
        // Объявляем переменную interval .
        let interval = std::time::Duration::from_millis(LOG_READ_INTERVAL_MS);

        // Выполняем операцию: loop {.
        loop {
            // Объявляем переменную fresh .
            let fresh = read_new_lines(&log_path, &mut position, &mut partial).await;

            // Выбираем вариант по значению.
            match fresh {
                // Выполняем операцию: Some(messages) if !messages.is_empty() => {.
                Some(messages) if !messages.is_empty() => {
                    // Выполняем операцию: idle_ticks = 0;.
                    idle_ticks = 0;
                    // Выполняем операцию: emit_batch(&app, to_log_lines(&strategy_id, messages));.
                    emit_batch(&app, to_log_lines(&strategy_id, messages));
                    // Закрываем блок.
                }
                // Выполняем операцию: Some(_) => {.
                Some(_) => {
                    // Выполняем операцию: idle_ticks += 1;.
                    idle_ticks += 1;
                    // Закрываем блок.
                }
                // Выполняем операцию: None => {.
                None => {
                    // Выполняем операцию: idle_ticks += 1;.
                    idle_ticks += 1;
                    // Закрываем блок.
                } // Закрываем блок.
            }

            // Объявляем переменную tracked .
            let tracked = app.state::<ProcessManager>().contains(&strategy_id);

            // Проверяем условие: !tracked && idle_ticks >= LOG_TAIL_IDLE_EXIT_TICKS.
            if !tracked && idle_ticks >= LOG_TAIL_IDLE_EXIT_TICKS {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }

            // Выполняем операцию: tokio::time::sleep(interval).await;.
            tokio::time::sleep(interval).await;
            // Закрываем блок.
        }
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
    // Объявляем функцию test_split_complete_lines_basic.
    fn test_split_complete_lines_basic() {
        // Объявляем переменную buffer .
        let mut buffer = String::new();
        // Объявляем переменную lines .
        let lines = split_complete_lines(&mut buffer, "one\ntwo\n");

        // Выполняем операцию: assert_eq!(lines, vec!["one", "two"]);.
        assert_eq!(lines, vec!["one", "two"]);
        // Выполняем операцию: assert!(buffer.is_empty());.
        assert!(buffer.is_empty());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_split_complete_lines_keeps_partial.
    fn test_split_complete_lines_keeps_partial() {
        // Объявляем переменную buffer .
        let mut buffer = String::new();
        // Объявляем переменную lines .
        let lines = split_complete_lines(&mut buffer, "one\ntw");

        // Выполняем операцию: assert_eq!(lines, vec!["one"]);.
        assert_eq!(lines, vec!["one"]);
        // Выполняем операцию: assert_eq!(buffer, "tw");.
        assert_eq!(buffer, "tw");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_split_complete_lines_across_chunks.
    fn test_split_complete_lines_across_chunks() {
        // Объявляем переменную buffer .
        let mut buffer = String::new();
        // Выполняем операцию: split_complete_lines(&mut buffer, "hel");.
        split_complete_lines(&mut buffer, "hel");
        // Объявляем переменную lines .
        let lines = split_complete_lines(&mut buffer, "lo\nworld\n");

        // Выполняем операцию: assert_eq!(lines, vec!["hello", "world"]);.
        assert_eq!(lines, vec!["hello", "world"]);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_split_complete_lines_strips_cr.
    fn test_split_complete_lines_strips_cr() {
        // Объявляем переменную buffer .
        let mut buffer = String::new();
        // Объявляем переменную lines .
        let lines = split_complete_lines(&mut buffer, "one\r\ntwo\r\n");

        // Выполняем операцию: assert_eq!(lines, vec!["one", "two"]);.
        assert_eq!(lines, vec!["one", "two"]);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_split_complete_lines_skips_empty.
    fn test_split_complete_lines_skips_empty() {
        // Объявляем переменную buffer .
        let mut buffer = String::new();
        // Объявляем переменную lines .
        let lines = split_complete_lines(&mut buffer, "one\n\n  \ntwo\n");

        // Выполняем операцию: assert_eq!(lines, vec!["one", "two"]);.
        assert_eq!(lines, vec!["one", "two"]);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_detect_level_variants.
    fn test_detect_level_variants() {
        // Выполняем операцию: assert_eq!(detect_level("ERROR: boom"), "error");.
        assert_eq!(detect_level("ERROR: boom"), "error");
        // Выполняем операцию: assert_eq!(detect_level("Ошибка запуска"), "error");.
        assert_eq!(detect_level("Ошибка запуска"), "error");
        // Выполняем операцию: assert_eq!(detect_level("failed to open"), "error");.
        assert_eq!(detect_level("failed to open"), "error");
        // Выполняем операцию: assert_eq!(detect_level("Access is denied"), "error");.
        assert_eq!(detect_level("Access is denied"), "error");
        // Выполняем операцию: assert_eq!(detect_level("Отказано в доступе"), "error").
        assert_eq!(detect_level("Отказано в доступе"), "error");

        // Выполняем операцию: assert_eq!(detect_level("WARN: slow"), "warn");.
        assert_eq!(detect_level("WARN: slow"), "warn");
        // Выполняем операцию: assert_eq!(detect_level("Предупреждение"), "warn");.
        assert_eq!(detect_level("Предупреждение"), "warn");
        // Выполняем операцию: assert_eq!(detect_level("skip line"), "warn");.
        assert_eq!(detect_level("skip line"), "warn");

        // Выполняем операцию: assert_eq!(detect_level("SUCCESS"), "success");.
        assert_eq!(detect_level("SUCCESS"), "success");
        // Выполняем операцию: assert_eq!(detect_level("Успешно запущено"), "success").
        assert_eq!(detect_level("Успешно запущено"), "success");
        // Выполняем операцию: assert_eq!(detect_level("started"), "success");.
        assert_eq!(detect_level("started"), "success");
        // Выполняем операцию: assert_eq!(detect_level("запущен"), "success");.
        assert_eq!(detect_level("запущен"), "success");

        // Выполняем операцию: assert_eq!(detect_level("Debug tick"), "debug");.
        assert_eq!(detect_level("Debug tick"), "debug");
        // Выполняем операцию: assert_eq!(detect_level("Отладка"), "debug");.
        assert_eq!(detect_level("Отладка"), "debug");

        // Выполняем операцию: assert_eq!(detect_level("обычная строка"), "info");.
        assert_eq!(detect_level("обычная строка"), "info");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_system_and_strategy_lines.
    fn test_system_and_strategy_lines() {
        // Объявляем переменную system .
        let system = system_line("info", "готово".to_string());

        // Выполняем операцию: assert_eq!(system.source, "system");.
        assert_eq!(system.source, "system");
        // Выполняем операцию: assert_eq!(system.level, "info");.
        assert_eq!(system.level, "info");
        // Выполняем операцию: assert_eq!(system.message, "готово");.
        assert_eq!(system.message, "готово");
        // Выполняем операцию: assert!(system.strategy_id.is_empty());.
        assert!(system.strategy_id.is_empty());

        // Объявляем переменную strategy .
        let strategy = strategy_line("cool.bat", "warn", "skip".to_string());

        // Выполняем операцию: assert_eq!(strategy.source, "strategy");.
        assert_eq!(strategy.source, "strategy");
        // Выполняем операцию: assert_eq!(strategy.level, "warn");.
        assert_eq!(strategy.level, "warn");
        // Выполняем операцию: assert_eq!(strategy.strategy_id, "cool.bat");.
        assert_eq!(strategy.strategy_id, "cool.bat");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_to_log_lines_detects_levels.
    fn test_to_log_lines_detects_levels() {
        // Объявляем переменную lines .
        let lines = to_log_lines(
            // Выполняем операцию: "s1",.
            "s1",
            // Выполняем операцию: vec!["error!".to_string(), "обычная строка".to_string().
            vec!["error!".to_string(), "обычная строка".to_string()],
            // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: assert_eq!(lines.len(), 2);.
        assert_eq!(lines.len(), 2);
        // Выполняем операцию: assert_eq!(lines[0].level, "error");.
        assert_eq!(lines[0].level, "error");
        // Выполняем операцию: assert_eq!(lines[1].level, "info");.
        assert_eq!(lines[1].level, "info");
        // Выполняем операцию: assert_eq!(lines[0].strategy_id, "s1");.
        assert_eq!(lines[0].strategy_id, "s1");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[tokio::test]
    // Объявляем функцию test_read_new_lines_reads_incrementally.
    async fn test_read_new_lines_reads_incrementally() {
        // Подключаем модули: std::io::Write;.
        use std::io::Write;

        // Объявляем переменную path .
        let path =
            // Выполняем операцию: std::env::temp_dir().join(format!("zapret-log-reader-{}.
            std::env::temp_dir().join(format!("zapret-log-reader-{}.log", std::process::id()));
        // Выполняем операцию: std::fs::write(&path, "first\nsecond\npartial").expect(.
        std::fs::write(&path, "first\nsecond\npartial").expect("лог");

        // Объявляем переменную position .
        let mut position = 0u64;
        // Объявляем переменную partial .
        let mut partial = String::new();

        // Объявляем переменную first .
        let first = read_new_lines(&path, &mut position, &mut partial)
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .expect("первое чтение");.
            .expect("первое чтение");

        // Выполняем операцию: assert_eq!(first, vec!["first", "second"]);.
        assert_eq!(first, vec!["first", "second"]);
        // Выполняем операцию: assert_eq!(partial, "partial");.
        assert_eq!(partial, "partial");

        // Новых байтов нет — строк тоже.
        // Объявляем переменную empty .
        let empty = read_new_lines(&path, &mut position, &mut partial)
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .expect("второе чтение");.
            .expect("второе чтение");

        // Выполняем операцию: assert!(empty.is_empty());.
        assert!(empty.is_empty());
        // Выполняем операцию: assert_eq!(partial, "partial");.
        assert_eq!(partial, "partial");

        // Дописанный хвост собирается с недобранной строкой.
        // Выполняем операцию: {.
        {
            // Объявляем переменную file .
            let mut file = std::fs::OpenOptions::new()
                // Выполняем операцию: .append(true).
                .append(true)
                // Выполняем операцию: .open(&path).
                .open(&path)
                // Выполняем операцию: .expect("файл");.
                .expect("файл");
            // Выполняем операцию: file.write_all(b" line\n").expect("запись");.
            file.write_all(b" line\n").expect("запись");
            // Закрываем блок.
        }

        // Объявляем переменную second .
        let second = read_new_lines(&path, &mut position, &mut partial)
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .expect("третье чтение");.
            .expect("третье чтение");

        // Выполняем операцию: assert_eq!(second, vec!["partial line"]);.
        assert_eq!(second, vec!["partial line"]);
        // Выполняем операцию: assert!(partial.is_empty());.
        assert!(partial.is_empty());

        // Пропавший файл — это None, а не паника.
        // Объявляем переменную missing .
        let missing =
            // Выполняем операцию: read_new_lines(&path.with_extension("missing"), &mut 0,.
            read_new_lines(&path.with_extension("missing"), &mut 0, &mut String::new()).await;

        // Выполняем операцию: assert!(missing.is_none());.
        assert!(missing.is_none());

        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&path);
        // Закрываем блок.
    }
    // Закрываем блок.
}
