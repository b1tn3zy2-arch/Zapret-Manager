use std::path::{Path, PathBuf};

use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;

use crate::error::{AppError, AppResult};

const MAX_SNAPSHOT_BYTES: usize = 32 * 1024 * 1024;
const DATA_URL_PREFIX: &str = "data:image/png;base64,";

pub fn validate_snapshot_path(path: &str) -> AppResult<PathBuf> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err(AppError::custom("Путь к снимку не указан"));
    }

    let target = PathBuf::from(trimmed);

    let is_png = target
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.eq_ignore_ascii_case("png"))
        .unwrap_or(false);

    if !is_png {
        return Err(AppError::custom("Допустимое расширение снимка: .png"));
    }

    Ok(target)
}

pub fn decode_snapshot(data: &str) -> AppResult<Vec<u8>> {
    let trimmed = data.trim();
    let payload = trimmed.strip_prefix(DATA_URL_PREFIX).unwrap_or(trimmed);

    let bytes = BASE64
        .decode(payload)
        .map_err(|error| AppError::custom(format!("Снимок повреждён: {error}")))?;

    if bytes.is_empty() {
        return Err(AppError::custom("Снимок пустой"));
    }

    if bytes.len() > MAX_SNAPSHOT_BYTES {
        return Err(AppError::custom(format!(
            "Снимок слишком большой: {} байт при лимите {MAX_SNAPSHOT_BYTES}",
            bytes.len()
        )));
    }

    Ok(bytes)
}

pub fn write_snapshot(target: &Path, data: &str) -> AppResult<usize> {
    let bytes = decode_snapshot(data)?;

    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }

    std::fs::write(target, &bytes)?;
    tracing::info!("Снимок монитора сохранён: {}", target.display());

    Ok(bytes.len())
}

#[tauri::command]
pub fn write_monitor_snapshot(path: String, data: String) -> AppResult<usize> {
    let target = validate_snapshot_path(&path)?;

    write_snapshot(&target, &data)
}

#[cfg(test)]
#[path = "monitor_snapshot_tests.rs"]
mod tests;