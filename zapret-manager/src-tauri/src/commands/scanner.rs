use std::path::PathBuf;
use std::time::UNIX_EPOCH;

use serde::Serialize;
use tauri::Manager;
use tokio::task::JoinSet;

use crate::commands::parser::{analyze, is_excluded};
use crate::constants::{MAX_CONCURRENT_READS, MAX_FILE_SIZE_FOR_PARSE};
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StrategyInfo {
    pub id: String,
    pub name: String,
    pub filename: String,
    pub path: String,
    pub description: String,
    pub services: Vec<String>,
    pub techniques: Vec<String>,
    pub file_type: String,
    pub status: String,
    pub version: Option<String>,
    pub size: u64,
    pub modified_at: Option<u64>,
}

pub(super) struct ScanError {
    pub filename: String,
    pub reason: String,
}

type BatPayload = (PathBuf, String, String, u64, Option<u64>);

async fn read_bat(path: PathBuf) -> Result<BatPayload, ScanError> {
    let filename = path
        .file_name()
        .map(|name| name.to_string_lossy().to_string())
        .unwrap_or_default();

    let metadata = match tokio::fs::metadata(&path).await {
        Ok(value) => value,
        Err(error) => {
            return Err(ScanError {
                filename: filename.clone(),
                reason: error.to_string(),
            })
        }
    };

    if metadata.len() > MAX_FILE_SIZE_FOR_PARSE {
        return Err(ScanError {
            filename,
            reason: format!(
                "файл больше {} байт, пропущен",
                MAX_FILE_SIZE_FOR_PARSE
            ),
        });
    }

    let bytes = match tokio::fs::read(&path).await {
        Ok(value) => value,
        Err(error) => {
            return Err(ScanError {
                filename: filename.clone(),
                reason: error.to_string(),
            })
        }
    };

    let content = match String::from_utf8(bytes) {
        Ok(value) => value,
        Err(_) => {
            return Err(ScanError {
                filename,
                reason: "файл не в кодировке UTF-8".to_string(),
            })
        }
    };

    let modified_at = metadata
        .modified()
        .ok()
        .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
        .map(|delta| delta.as_millis() as u64);

    Ok((path, filename, content, metadata.len(), modified_at))
}

async fn collect_bat_paths(directory: &PathBuf) -> AppResult<Vec<PathBuf>> {
    let mut entries = match tokio::fs::read_dir(directory).await {
        Ok(value) => value,
        Err(error) => {
            tracing::error!(
                "Не удалось прочитать папку {}: {error}",
                directory.display()
            );
            return Err(AppError::Io(error));
        }
    };

    let mut paths: Vec<PathBuf> = Vec::new();

    while let Ok(Some(entry)) = entries.next_entry().await {
        let path = entry.path();

        let is_file = entry
            .file_type()
            .await
            .map(|kind| kind.is_file())
            .unwrap_or(false);

        if !is_file {
            continue;
        }

        let Some(filename) = path.file_name().map(|n| n.to_string_lossy().to_string())
        else {
            continue;
        };

        if !filename.to_ascii_lowercase().ends_with(".bat") || is_excluded(&filename)
        {
            continue;
        }

        paths.push(path);
    }

    paths.sort();
    Ok(paths)
}

#[tauri::command]
pub async fn scan_strategies(
    scan: tauri::State<'_, crate::commands::runner::ScanState>,
    folder: String,
) -> AppResult<Vec<StrategyInfo>> {
    scan_folder(&folder, scan.inner()).await
}

pub async fn scan_folder(
    folder: &str,
    scan: &crate::commands::runner::ScanState,
) -> AppResult<Vec<StrategyInfo>> {
    let directory = PathBuf::from(folder);

    if !directory.is_dir() {
        return Err(AppError::custom(format!(
            "Папка со стратегиями не найдена: {folder}"
        )));
    }

    let paths = collect_bat_paths(&directory).await?;

    scan.remember(&directory);

    if paths.is_empty() {
        tracing::info!("В папке {folder} нет .bat файлов");
        return Ok(Vec::new());
    }

    let mut results: Vec<StrategyInfo> = Vec::with_capacity(paths.len());
    let mut skipped = 0usize;
    let mut queue = paths.into_iter();
    let mut active: JoinSet<Result<BatPayload, ScanError>> = JoinSet::new();

    loop {
        while active.len() < MAX_CONCURRENT_READS {
            let Some(path) = queue.next() else {
                break;
            };
            active.spawn(read_bat(path));
        }

        if active.is_empty() {
            break;
        }

        match active.join_next().await {
            Some(Ok(Ok((path, filename, content, size, modified_at)))) => {
                results.push(analyze(path, filename, content, size, modified_at));
            }
            Some(Ok(Err(failure))) => {
                tracing::warn!(
                    "Пропущен {}: {}",
                    failure.filename,
                    failure.reason
                );
                skipped += 1;
            }
            Some(Err(join_error)) => {
                tracing::error!("Ошибка задачи чтения: {join_error}");
                skipped += 1;
            }
            None => break,
        }
    }

    results.sort_by(|left, right| left.filename.cmp(&right.filename));

    tracing::info!(
        "Просканировано {} стратегий в {folder}, пропущено {skipped}",
        results.len()
    );

    Ok(results)
}

#[tauri::command]
pub async fn get_default_strategies_path(app: tauri::AppHandle) -> AppResult<String> {
    let root = app
        .path()
        .app_data_dir()
        .map_err(|error| AppError::custom(error.to_string()))?;

    Ok(root.join("strategies").to_string_lossy().to_string())
}

#[cfg(test)]
#[path = "scanner_tests.rs"]
mod scanner_tests;