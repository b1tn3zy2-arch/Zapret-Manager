// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::{security_denied, MAX_FILENAME_LEN, MA.
use crate::security::{security_denied, MAX_FILENAME_LEN, MAX_STRATEGY_ID_LEN};

// Объявляем константу FORBIDDEN_FILENAME_CHARS.
const FORBIDDEN_FILENAME_CHARS: [char; 9] = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];

// Объявляем функцию validate_strategy_id.
pub fn validate_strategy_id(id: &str) -> AppResult<()> {
    // Проверяем условие: id.is_empty() || id.len() > MAX_STRATEGY_ID_LEN {.
    if id.is_empty() || id.len() > MAX_STRATEGY_ID_LEN {
        // Возвращаем результат из функции.
        return Err(security_denied("strategy-id", "недопустимая длина id"));
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = id.as_bytes();
    // Объявляем переменную head .
    let head = bytes[0];
    // Объявляем переменную valid_head .
    let valid_head = head.is_ascii_alphanumeric() || head == b'_';

    // Проверяем условие: !valid_head {.
    if !valid_head {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "strategy-id",.
            "strategy-id",
            // Выполняем операцию: "id должен начинаться с буквы, цифры или _",.
            "id должен начинаться с буквы, цифры или _",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную invalid .
    let invalid = bytes
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|byte| !(byte.is_ascii_alphanumeric() || *byte == .
        .any(|byte| !(byte.is_ascii_alphanumeric() || *byte == b'_' || *byte == b'-'));

    // Проверяем условие: invalid {.
    if invalid {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "strategy-id",.
            "strategy-id",
            // Выполняем операцию: "id содержит недопустимые символы",.
            "id содержит недопустимые символы",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию is_valid_appid.
pub fn is_valid_appid(value: &str) -> bool {
    // Объявляем переменную trimmed .
    let trimmed = value.trim();

    // Выполняем операцию: !trimmed.is_empty() && trimmed.len() <= 20 && trimmed.b.
    !trimmed.is_empty() && trimmed.len() <= 20 && trimmed.bytes().all(|byte| byte.is_ascii_digit())
    // Закрываем блок.
}

// Объявляем функцию safe_path.
pub fn safe_path(base: &Path, candidate: &Path) -> AppResult<PathBuf> {
    // Объявляем переменную base_real .
    let base_real = std::fs::canonicalize(base)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Базовая папк.
        .map_err(|error| AppError::custom(format!("Базовая папка недоступна: {error}")))?;

    // Объявляем переменную candidate_real .
    let candidate_real = std::fs::canonicalize(candidate)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Путь недосту.
        .map_err(|error| AppError::custom(format!("Путь недоступен: {error}")))?;

    // Проверяем условие: !is_within(&candidate_real, &base_real) {.
    if !is_within(&candidate_real, &base_real) {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "path-traversal",.
            "path-traversal",
            // Выполняем операцию: "путь выходит за пределы разрешённой папки",.
            "путь выходит за пределы разрешённой папки",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(candidate_real).
    Ok(candidate_real)
    // Закрываем блок.
}

// Объявляем функцию is_within.
pub fn is_within(path: &Path, base: &Path) -> bool {
    // Объявляем переменную normalized_path .
    let normalized_path = normalize(path);
    // Объявляем переменную normalized_base .
    let normalized_base = normalize(base);

    // Проверяем условие: normalized_base.as_os_str().is_empty() {.
    if normalized_base.as_os_str().is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: normalized_path.starts_with(normalized_base).
    normalized_path.starts_with(normalized_base)
    // Закрываем блок.
}

// Объявляем функцию safe_filename.
pub fn safe_filename(name: &str) -> AppResult<String> {
    // Объявляем переменную trimmed .
    let trimmed = name.trim();

    // Проверяем условие: trimmed.is_empty() {.
    if trimmed.is_empty() {
        // Возвращаем результат из функции.
        return Err(security_denied("filename", "пустое имя файла"));
        // Закрываем блок.
    }

    // Проверяем условие: trimmed.len() > MAX_FILENAME_LEN {.
    if trimmed.len() > MAX_FILENAME_LEN {
        // Возвращаем результат из функции.
        return Err(security_denied("filename", "слишком длинное имя"));
        // Закрываем блок.
    }

    // Проверяем условие: trimmed == "." || trimmed == ".." || trimmed.conta.
    if trimmed == "." || trimmed == ".." || trimmed.contains("..") {
        // Возвращаем результат из функции.
        return Err(security_denied("filename", "обход каталогов в имени"));
        // Закрываем блок.
    }

    // Проверяем условие: trimmed.
    if trimmed
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .any(|character| FORBIDDEN_FILENAME_CHARS.contains(&cha.
        .any(|character| FORBIDDEN_FILENAME_CHARS.contains(&character))
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return Err(security_denied("filename", "недопустимые символы в имени"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(trimmed.to_string()).
    Ok(trimmed.to_string())
    // Закрываем блок.
}

// Объявляем функцию strip_extended_prefix.
pub fn strip_extended_prefix(path: PathBuf) -> PathBuf {
    // Объявляем переменную raw .
    let raw = path.to_string_lossy();

    // Проверяем условие: let Some(rest) = raw.strip_prefix(r"\\?\UNC\") {.
    if let Some(rest) = raw.strip_prefix(r"\\?\UNC\") {
        // Возвращаем результат из функции.
        return PathBuf::from(format!(r"\\{rest}"));
        // Закрываем блок.
    }

    // Проверяем условие: let Some(rest) = raw.strip_prefix(r"\\?\") {.
    if let Some(rest) = raw.strip_prefix(r"\\?\") {
        // Возвращаем результат из функции.
        return PathBuf::from(rest);
        // Закрываем блок.
    }

    // Выполняем операцию: path.
    path
    // Закрываем блок.
}

// Объявляем функцию validate_strategy_file.
pub fn validate_strategy_file(path: &Path, allowed_root: Option<&Path>) -> AppResult<PathBuf> {
    // Объявляем переменную extension .
    let extension = path
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .map(|value| value.to_string_lossy().to_lowercase()).
        .map(|value| value.to_string_lossy().to_lowercase())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Проверяем условие: extension != "bat" && extension != "cmd" {.
    if extension != "bat" && extension != "cmd" {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "strategy-extension",.
            "strategy-extension",
            // Выполняем операцию: "разрешены только .bat и .cmd",.
            "разрешены только .bat и .cmd",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную real .
    let real = match allowed_root {
        // Выполняем операцию: Some(root) => safe_path(root, path)?,.
        Some(root) => safe_path(root, path)?,
        // Выполняем операцию: None => std::fs::canonicalize(path).
        None => std::fs::canonicalize(path)
            // Выполняем операцию: .map_err(|error| AppError::custom(format!("Файл стратег.
            .map_err(|error| AppError::custom(format!("Файл стратегии недоступен: {error}")))?,
        // Закрываем блок.
    };

    // Проверяем условие: !real.is_file() {.
    if !real.is_file() {
        // Возвращаем результат из функции.
        return Err(security_denied("strategy-file", "путь не является файлом"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(strip_extended_prefix(real)).
    Ok(strip_extended_prefix(real))
    // Закрываем блок.
}

// Объявляем функцию normalize.
fn normalize(path: &Path) -> PathBuf {
    // Объявляем переменную result .
    let mut result = PathBuf::new();

    // Перебираем элементы коллекции.
    for component in path.components() {
        // Выбираем вариант по значению.
        match component {
            // Выполняем операцию: std::path::Component::CurDir => {}.
            std::path::Component::CurDir => {}
            // Выполняем операцию: std::path::Component::ParentDir => {.
            std::path::Component::ParentDir => {
                // Выполняем операцию: result.pop();.
                result.pop();
                // Закрываем блок.
            }
            // Выполняем операцию: other => result.push(other),.
            other => result.push(other),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "paths_tests.rs"]
// Выполняем операцию: mod paths_tests;.
mod paths_tests;
