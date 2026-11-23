// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;
// Подключаем модули: std::time::UNIX_EPOCH;.
use std::time::UNIX_EPOCH;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tokio::task::JoinSet;.
use tokio::task::JoinSet;

// Подключаем модули: crate::commands::parser::{analyze, deduplicate_names, i.
use crate::commands::parser::{analyze, deduplicate_names, is_excluded};
// Подключаем модули: crate::constants::{MAX_CONCURRENT_READS, MAX_FILE_SIZE_.
use crate::constants::{MAX_CONCURRENT_READS, MAX_FILE_SIZE_FOR_PARSE};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::strategy::config::StrategyConfig;.
use crate::strategy::config::StrategyConfig;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyInfo.
pub struct StrategyInfo {
    // Выполняем операцию: pub id: String,.
    pub id: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub filename: String,.
    pub filename: String,
    // Выполняем операцию: pub path: String,.
    pub path: String,
    // Выполняем операцию: pub description: String,.
    pub description: String,
    // Выполняем операцию: pub services: Vec<String>,.
    pub services: Vec<String>,
    // Выполняем операцию: pub techniques: Vec<String>,.
    pub techniques: Vec<String>,
    // Выполняем операцию: pub file_type: String,.
    pub file_type: String,
    // Выполняем операцию: pub status: String,.
    pub status: String,
    // Выполняем операцию: pub version: Option<String>,.
    pub version: Option<String>,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    // Выполняем операцию: pub modified_at: Option<u64>,.
    pub modified_at: Option<u64>,
    // Выполняем операцию: pub config: Option<StrategyConfig>,.
    pub config: Option<StrategyConfig>,
    // Закрываем блок.
}

// Объявляем структуру ScanError.
pub(super) struct ScanError {
    // Выполняем операцию: pub filename: String,.
    pub filename: String,
    // Выполняем операцию: pub reason: String,.
    pub reason: String,
    // Закрываем блок.
}

// Выполняем операцию: type BatPayload = (PathBuf, String, String, u64, Option.
type BatPayload = (PathBuf, String, String, u64, Option<u64>);

// Объявляем функцию read_bat.
async fn read_bat(path: PathBuf) -> Result<BatPayload, ScanError> {
    // Объявляем переменную filename .
    let filename = path
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .map(|name| name.to_string_lossy().to_string()).
        .map(|name| name.to_string_lossy().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Объявляем переменную metadata .
    let metadata = match tokio::fs::metadata(&path).await {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Возвращаем результат из функции.
            return Err(ScanError {
                // Выполняем операцию: filename: filename.clone(),.
                filename: filename.clone(),
                // Выполняем операцию: reason: error.to_string(),.
                reason: error.to_string(),
                // Закрываем блок.
            });
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Проверяем условие: metadata.len() > MAX_FILE_SIZE_FOR_PARSE {.
    if metadata.len() > MAX_FILE_SIZE_FOR_PARSE {
        // Возвращаем результат из функции.
        return Err(ScanError {
            // Выполняем операцию: filename,.
            filename,
            // Выполняем операцию: reason: format!("файл больше {} байт, пропущен", MAX_FI.
            reason: format!("файл больше {} байт, пропущен", MAX_FILE_SIZE_FOR_PARSE),
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = match tokio::fs::read(&path).await {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Возвращаем результат из функции.
            return Err(ScanError {
                // Выполняем операцию: filename: filename.clone(),.
                filename: filename.clone(),
                // Выполняем операцию: reason: error.to_string(),.
                reason: error.to_string(),
                // Закрываем блок.
            });
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Объявляем переменную content .
    let content = match String::from_utf8(bytes) {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(_) => {.
        Err(_) => {
            // Возвращаем результат из функции.
            return Err(ScanError {
                // Выполняем операцию: filename,.
                filename,
                // Выполняем операцию: reason: "файл не в кодировке UTF-8".to_string(),.
                reason: "файл не в кодировке UTF-8".to_string(),
                // Закрываем блок.
            });
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Объявляем переменную modified_at .
    let modified_at = metadata
        // Выполняем операцию: .modified().
        .modified()
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|time| time.duration_since(UNIX_EPOCH).ok()).
        .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
        // Выполняем операцию: .map(|delta| delta.as_millis() as u64);.
        .map(|delta| delta.as_millis() as u64);

    // Выполняем операцию: Ok((path, filename, content, metadata.len(), modified_a.
    Ok((path, filename, content, metadata.len(), modified_at))
    // Закрываем блок.
}

// Объявляем функцию collect_bat_paths.
async fn collect_bat_paths(directory: &PathBuf) -> AppResult<Vec<PathBuf>> {
    // Объявляем переменную entries .
    let mut entries = match tokio::fs::read_dir(directory).await {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::error!(.
            tracing::error!(
                // Выполняем операцию: "Не удалось прочитать папку {}: {error}",.
                "Не удалось прочитать папку {}: {error}",
                // Выполняем операцию: directory.display().
                directory.display() // Закрываем выражение или коллекцию.
            );
            // Возвращаем результат из функции.
            return Err(AppError::Io(error));
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Объявляем переменную paths.
    let mut paths: Vec<PathBuf> = Vec::new();

    // Повторяем, пока выполняется условие.
    while let Ok(Some(entry)) = entries.next_entry().await {
        // Объявляем переменную path .
        let path = entry.path();

        // Объявляем переменную is_file .
        let is_file = entry
            // Выполняем операцию: .file_type().
            .file_type()
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .map(|kind| kind.is_file()).
            .map(|kind| kind.is_file())
            // Выполняем операцию: .unwrap_or(false);.
            .unwrap_or(false);

        // Проверяем условие: !is_file {.
        if !is_file {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(filename) .
        let Some(filename) = path.file_name().map(|n| n.to_string_lossy().to_string()) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: !filename.to_ascii_lowercase().ends_with(".bat") |.
        if !filename.to_ascii_lowercase().ends_with(".bat") || is_excluded(&filename) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: paths.push(path);.
        paths.push(path);
        // Закрываем блок.
    }

    // Выполняем операцию: paths.sort();.
    paths.sort();
    // Выполняем операцию: Ok(paths).
    Ok(paths)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn scan_strategies(.
pub async fn scan_strategies(
    // Выполняем операцию: scan: tauri::State<'_, crate::commands::runner::ScanSta.
    scan: tauri::State<'_, crate::commands::runner::ScanState>,
    // Выполняем операцию: folder: String,.
    folder: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<StrategyInfo>> {
    // Выполняем операцию: scan_folder(&folder, scan.inner()).await.
    scan_folder(&folder, scan.inner()).await
    // Закрываем блок.
}

// Выполняем операцию: pub async fn scan_folder(.
pub async fn scan_folder(
    // Выполняем операцию: folder: &str,.
    folder: &str,
    // Выполняем операцию: scan: &crate::commands::runner::ScanState,.
    scan: &crate::commands::runner::ScanState,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<StrategyInfo>> {
    // Объявляем переменную directory .
    let directory = PathBuf::from(folder);

    // Проверяем условие: !directory.is_dir() {.
    if !directory.is_dir() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Папка со стратегиями не найдена: {folder}".
            "Папка со стратегиями не найдена: {folder}" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную paths .
    let paths = collect_bat_paths(&directory).await?;

    // Выполняем операцию: scan.remember(&directory);.
    scan.remember(&directory);

    // Проверяем условие: paths.is_empty() {.
    if paths.is_empty() {
        // Выполняем операцию: tracing::info!("В папке {folder} нет .bat файлов");.
        tracing::info!("В папке {folder} нет .bat файлов");
        // Возвращаем результат из функции.
        return Ok(Vec::new());
        // Закрываем блок.
    }

    // Объявляем переменную results.
    let mut results: Vec<StrategyInfo> = Vec::with_capacity(paths.len());
    // Объявляем переменную skipped .
    let mut skipped = 0usize;
    // Объявляем переменную queue .
    let mut queue = paths.into_iter();
    // Объявляем переменную active.
    let mut active: JoinSet<Result<BatPayload, ScanError>> = JoinSet::new();

    // Выполняем операцию: loop {.
    loop {
        // Повторяем, пока выполняется условие.
        while active.len() < MAX_CONCURRENT_READS {
            // Объявляем переменную Some(path) .
            let Some(path) = queue.next() else {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            };
            // Выполняем операцию: active.spawn(read_bat(path));.
            active.spawn(read_bat(path));
            // Закрываем блок.
        }

        // Проверяем условие: active.is_empty() {.
        if active.is_empty() {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Выбираем вариант по значению.
        match active.join_next().await {
            // Выполняем операцию: Some(Ok(Ok((path, filename, content, size, modified_at).
            Some(Ok(Ok((path, filename, content, size, modified_at)))) => {
                // Выполняем операцию: results.push(analyze(path, filename, content, size, mod.
                results.push(analyze(path, filename, content, size, modified_at));
                // Закрываем блок.
            }
            // Выполняем операцию: Some(Ok(Err(failure))) => {.
            Some(Ok(Err(failure))) => {
                // Выполняем операцию: tracing::warn!("Пропущен {}: {}", failure.filename, fai.
                tracing::warn!("Пропущен {}: {}", failure.filename, failure.reason);
                // Выполняем операцию: skipped += 1;.
                skipped += 1;
                // Закрываем блок.
            }
            // Выполняем операцию: Some(Err(join_error)) => {.
            Some(Err(join_error)) => {
                // Выполняем операцию: tracing::error!("Ошибка задачи чтения: {join_error}");.
                tracing::error!("Ошибка задачи чтения: {join_error}");
                // Выполняем операцию: skipped += 1;.
                skipped += 1;
                // Закрываем блок.
            }
            // Выполняем операцию: None => break,.
            None => break,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: results.sort_by(|left, right| left.filename.cmp(&right..
    results.sort_by(|left, right| left.filename.cmp(&right.filename));
    // Выполняем операцию: deduplicate_names(&mut results);.
    deduplicate_names(&mut results);

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Просканировано {} стратегий в {folder}, пропущено {ski.
        "Просканировано {} стратегий в {folder}, пропущено {skipped}",
        // Выполняем операцию: results.len().
        results.len() // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(results).
    Ok(results)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "scanner_tests.rs"]
// Выполняем операцию: mod scanner_tests;.
mod scanner_tests;
