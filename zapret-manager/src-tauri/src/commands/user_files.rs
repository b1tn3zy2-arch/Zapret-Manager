use std::path::{Path, PathBuf};

use tauri_plugin_opener::OpenerExt;

use crate::error::{AppError, AppResult};
use crate::security::paths::safe_filename;
use crate::security::rate_limit::check_file_io;
use crate::security::url_validator::{is_public_host, validate_https_url};
use crate::security::{ensure_size, MAX_TEXT_FILE_BYTES};

pub const TEXT_EXTENSIONS: [&str; 4] = ["txt", "json", "conf", "log"];

#[tauri::command]
pub fn open_external_url(app: tauri::AppHandle, url: String) -> AppResult<()> {
    check_file_io("open-url")?;

    let parsed = validate_https_url(&url)?;

    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err(crate::security::security_denied(
            "url",
            "ссылка с логином и паролем запрещена",
        ));
    }

    if !is_public_host(parsed.host_str().unwrap_or_default()) {
        return Err(crate::security::security_denied(
            "url",
            "локальные адреса открывать нельзя",
        ));
    }

    app.opener()
        .open_url(parsed.as_str(), None::<&str>)
        .map_err(|error| AppError::custom(format!("Ссылка не открыта: {error}")))
}

#[tauri::command]
pub fn read_user_text_file(path: String) -> AppResult<String> {
    check_file_io("read-file")?;

    let target = validated_text_path(&path)?;
    let size = ensure_size(&target, MAX_TEXT_FILE_BYTES, "файл")?;

    if size == 0 {
        return Ok(String::new());
    }

    std::fs::read_to_string(&target)
        .map_err(|error| AppError::custom(format!("Файл не прочитан: {error}")))
}

#[tauri::command]
pub fn write_user_text_file(path: String, content: String) -> AppResult<()> {
    check_file_io("write-file")?;

    let target = validated_text_path(&path)?;

    if content.len() as u64 > MAX_TEXT_FILE_BYTES {
        return Err(crate::security::security_denied(
            "write-size",
            "содержимое больше лимита в 1 МБ",
        ));
    }

    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }

    std::fs::write(&target, content)
        .map_err(|error| AppError::custom(format!("Файл не записан: {error}")))
}

pub fn is_text_extension(path: &Path) -> bool {
    let extension = path
        .extension()
        .map(|value| value.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    TEXT_EXTENSIONS.contains(&extension.as_str())
}

fn validated_text_path(raw: &str) -> AppResult<PathBuf> {
    let path = PathBuf::from(raw.trim());

    if !path.is_absolute() {
        return Err(crate::security::security_denied(
            "relative-path",
            "нужен полный путь к файлу",
        ));
    }

    if !is_text_extension(&path) {
        return Err(crate::security::security_denied(
            "extension",
            "разрешены только .txt, .json, .conf и .log",
        ));
    }

    if let Some(name) = path.file_name() {
        safe_filename(&name.to_string_lossy())?;
    }

    Ok(path)
}

#[cfg(test)]
#[path = "user_files_tests.rs"]
mod tests;
