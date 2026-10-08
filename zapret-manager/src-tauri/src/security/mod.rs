pub mod paths;
pub mod rate_limit;
pub mod sanitize;
pub mod url_validator;

#[cfg(test)]
pub mod audit_tests;

use std::path::{Path, PathBuf};

use crate::error::{AppError, AppResult};

pub const SECURITY_TARGET: &str = "security";
pub const MAX_TEXT_FILE_BYTES: u64 = 1024 * 1024;
pub const MAX_VPN_CONF_BYTES: u64 = 100 * 1024;
pub const MAX_ARCHIVE_BYTES: u64 = 200 * 1024 * 1024;
pub const MAX_RESOURCE_FILE_BYTES: u64 = 50 * 1024 * 1024;
pub const MAX_STRATEGY_ID_LEN: usize = 64;
pub const MAX_FILENAME_LEN: usize = 255;

pub fn security_event(message: &str) {
    tracing::warn!(target: SECURITY_TARGET, "{message}");
}

pub fn security_denied(event: &str, detail: &str) -> AppError {
    security_event(&format!("{event}: {detail}"));

    AppError::custom("Операция отклонена проверкой безопасности")
}

pub fn ensure_size(path: &Path, limit: u64, what: &str) -> AppResult<u64> {
    let metadata = std::fs::symlink_metadata(path)
        .map_err(|error| AppError::custom(format!("{what}: {error}")))?;

    if !metadata.is_file() {
        return Err(security_denied("not-a-file", what));
    }

    let size = metadata.len();

    if size > limit {
        return Err(security_denied(
            "size-limit",
            &format!("{what}: {size} байт при лимите {limit}"),
        ));
    }

    Ok(size)
}

pub fn app_log_dir() -> AppResult<PathBuf> {
    let base = std::env::var("APPDATA")
        .map_err(|_| AppError::custom("Переменная APPDATA недоступна"))?;

    Ok(PathBuf::from(base)
        .join("com.zapretmanager.app")
        .join("logs"))
}
