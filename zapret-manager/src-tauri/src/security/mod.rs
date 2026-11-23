// Выполняем операцию: pub mod dpapi;.
pub mod dpapi;
// Выполняем операцию: pub mod paths;.
pub mod paths;
// Выполняем операцию: pub mod rate_limit;.
pub mod rate_limit;
// Выполняем операцию: pub mod sanitize;.
pub mod sanitize;
// Выполняем операцию: pub mod url_validator;.
pub mod url_validator;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: pub mod audit_tests;.
pub mod audit_tests;

// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу SECURITY_TARGET.
pub const SECURITY_TARGET: &str = "security";
// Объявляем константу MAX_TEXT_FILE_BYTES.
pub const MAX_TEXT_FILE_BYTES: u64 = 1024 * 1024;
// Объявляем константу MAX_VPN_CONF_BYTES.
pub const MAX_VPN_CONF_BYTES: u64 = 100 * 1024;
// Объявляем константу MAX_ARCHIVE_BYTES.
pub const MAX_ARCHIVE_BYTES: u64 = 200 * 1024 * 1024;
// Объявляем константу MAX_RESOURCE_FILE_BYTES.
pub const MAX_RESOURCE_FILE_BYTES: u64 = 50 * 1024 * 1024;
// Объявляем константу MAX_STRATEGY_ID_LEN.
pub const MAX_STRATEGY_ID_LEN: usize = 64;
// Объявляем константу MAX_FILENAME_LEN.
pub const MAX_FILENAME_LEN: usize = 255;

// Объявляем функцию security_event.
pub fn security_event(message: &str) {
    // Выполняем операцию: tracing::warn!(target: SECURITY_TARGET, "{message}");.
    tracing::warn!(target: SECURITY_TARGET, "{message}");
    // Закрываем блок.
}

// Объявляем функцию security_denied.
pub fn security_denied(event: &str, detail: &str) -> AppError {
    // Выполняем операцию: security_event(&format!("{event}: {detail}"));.
    security_event(&format!("{event}: {detail}"));

    // Выполняем операцию: AppError::custom("Операция отклонена проверкой безопасн.
    AppError::custom("Операция отклонена проверкой безопасности")
    // Закрываем блок.
}

// Объявляем функцию ensure_size.
pub fn ensure_size(path: &Path, limit: u64, what: &str) -> AppResult<u64> {
    // Объявляем переменную metadata .
    let metadata = std::fs::symlink_metadata(path)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("{what}: {err.
        .map_err(|error| AppError::custom(format!("{what}: {error}")))?;

    // Проверяем условие: !metadata.is_file() {.
    if !metadata.is_file() {
        // Возвращаем результат из функции.
        return Err(security_denied("not-a-file", what));
        // Закрываем блок.
    }

    // Объявляем переменную size .
    let size = metadata.len();

    // Проверяем условие: size > limit {.
    if size > limit {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "size-limit",.
            "size-limit",
            // Выполняем операцию: &format!("{what}: {size} байт при лимите {limit}"),.
            &format!("{what}: {size} байт при лимите {limit}"),
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(size).
    Ok(size)
    // Закрываем блок.
}

// Объявляем функцию app_log_dir.
pub fn app_log_dir() -> AppResult<PathBuf> {
    // Объявляем переменную base .
    let base =
        // Выполняем операцию: std::env::var("APPDATA").map_err(|_| AppError::custom(".
        std::env::var("APPDATA").map_err(|_| AppError::custom("Переменная APPDATA недоступна"))?;

    // Выполняем операцию: Ok(PathBuf::from(base).
    Ok(PathBuf::from(base)
        // Выполняем операцию: .join("com.zapretmanager.app").
        .join("com.zapretmanager.app")
        // Выполняем операцию: .join("logs")).
        .join("logs"))
    // Закрываем блок.
}
