use std::path::{Path, PathBuf};

use crate::error::{AppError, AppResult};
use crate::security::{security_denied, MAX_FILENAME_LEN, MAX_STRATEGY_ID_LEN};

const FORBIDDEN_FILENAME_CHARS: [char; 9] = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

pub fn validate_strategy_id(id: &str) -> AppResult<()> {
    if id.is_empty() || id.len() > MAX_STRATEGY_ID_LEN {
        return Err(security_denied("strategy-id", "недопустимая длина id"));
    }

    let bytes = id.as_bytes();
    let head = bytes[0];
    let valid_head = head.is_ascii_alphanumeric() || head == b'_';

    if !valid_head {
        return Err(security_denied(
            "strategy-id",
            "id должен начинаться с буквы, цифры или _",
        ));
    }

    let invalid = bytes
        .iter()
        .any(|byte| !(byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'-'));

    if invalid {
        return Err(security_denied(
            "strategy-id",
            "id содержит недопустимые символы",
        ));
    }

    Ok(())
}

pub fn safe_path(base: &Path, candidate: &Path) -> AppResult<PathBuf> {
    let base_real = std::fs::canonicalize(base)
        .map_err(|error| AppError::custom(format!("Базовая папка недоступна: {error}")))?;

    let candidate_real = std::fs::canonicalize(candidate)
        .map_err(|error| AppError::custom(format!("Путь недоступен: {error}")))?;

    if !is_within(&candidate_real, &base_real) {
        return Err(security_denied(
            "path-traversal",
            "путь выходит за пределы разрешённой папки",
        ));
    }

    Ok(candidate_real)
}

pub fn is_within(path: &Path, base: &Path) -> bool {
    let normalized_path = normalize(path);
    let normalized_base = normalize(base);

    if normalized_base.as_os_str().is_empty() {
        return false;
    }

    normalized_path.starts_with(normalized_base)
}

pub fn safe_filename(name: &str) -> AppResult<String> {
    let trimmed = name.trim();

    if trimmed.is_empty() {
        return Err(security_denied("filename", "пустое имя файла"));
    }

    if trimmed.len() > MAX_FILENAME_LEN {
        return Err(security_denied("filename", "слишком длинное имя"));
    }

    if trimmed == "." || trimmed == ".." || trimmed.contains("..") {
        return Err(security_denied("filename", "обход каталогов в имени"));
    }

    if trimmed
        .chars()
        .any(|character| FORBIDDEN_FILENAME_CHARS.contains(&character))
    {
        return Err(security_denied("filename", "недопустимые символы в имени"));
    }

    Ok(trimmed.to_string())
}

pub fn validate_strategy_file(path: &Path, allowed_root: Option<&Path>) -> AppResult<PathBuf> {
    let extension = path
        .extension()
        .map(|value| value.to_string_lossy().to_lowercase())
        .unwrap_or_default();

    if extension != "bat" && extension != "cmd" {
        return Err(security_denied(
            "strategy-extension",
            "разрешены только .bat и .cmd",
        ));
    }

    let real = match allowed_root {
        Some(root) => safe_path(root, path)?,
        None => std::fs::canonicalize(path).map_err(|error| {
            AppError::custom(format!("Файл стратегии недоступен: {error}"))
        })?,
    };

    if !real.is_file() {
        return Err(security_denied("strategy-file", "путь не является файлом"));
    }

    Ok(real)
}

fn normalize(path: &Path) -> PathBuf {
    let mut result = PathBuf::new();

    for component in path.components() {
        match component {
            std::path::Component::CurDir => {}
            std::path::Component::ParentDir => {
                result.pop();
            }
            other => result.push(other),
        }
    }

    result
}
