use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

pub use crate::build_info::{rust_version, webview_version};

use crate::commands::updater::read_version;
use crate::error::{AppError, AppResult};

pub const FOLDER_CONFIG: &str = "config";
pub const FOLDER_LOGS: &str = "logs";
pub const FOLDER_STRATEGIES: &str = "strategies";
pub const FOLDER_BACKUPS: &str = "backups";

pub const BACKUP_DIR_NAME: &str = "backup";

const MAX_CHECKED_FILES: usize = 64;

pub const UNKNOWN_VERSION: &str = "неизвестно";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    pub os: String,
    pub os_version: String,
    pub os_build: String,
    pub arch: String,
    pub tauri_version: String,
    pub rust_version: String,
    pub app_version: String,
    pub webview_version: String,
}

#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigCheckReport {
    pub checked: usize,
    pub empty_files: Vec<String>,
    pub duplicates: Vec<String>,
    pub invalid: Vec<String>,
    pub strategies_version: String,
}

pub fn os_build() -> String {
    std::env::var("OS_BUILD").unwrap_or_default()
}

pub fn collect_system_info() -> SystemInfo {
    SystemInfo {
        os: sysinfo::System::name().unwrap_or_else(|| UNKNOWN_VERSION.to_string()),
        os_build: os_build(),
        os_version: sysinfo::System::long_os_version()
            .unwrap_or_else(|| UNKNOWN_VERSION.to_string()),
        arch: std::env::consts::ARCH.to_string(),
        tauri_version: tauri::VERSION.to_string(),
        rust_version: rust_version(),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        webview_version: webview_version(),
    }
}

#[tauri::command]
pub fn get_system_info() -> AppResult<SystemInfo> {
    Ok(collect_system_info())
}

fn folder_kind(kind: &str) -> AppResult<String> {
    match kind {
        FOLDER_CONFIG | FOLDER_LOGS | FOLDER_STRATEGIES | FOLDER_BACKUPS => {
            Ok(kind.to_string())
        }
        _ => Err(AppError::custom(format!("Неизвестная папка: {kind}"))),
    }
}

pub fn logs_dir() -> std::path::PathBuf {
    std::env::temp_dir().join("zapret-manager").join("logs")
}

#[tauri::command]
pub fn get_folder_path(kind: String, strategies_dir: String) -> AppResult<String> {
    let kind = folder_kind(&kind)?;

    let path = match kind.as_str() {
        FOLDER_STRATEGIES => std::path::PathBuf::from(strategies_dir),
        FOLDER_BACKUPS => std::path::PathBuf::from(&strategies_dir)
            .join(crate::commands::updater_backup::BACKUP_DIR_NAME),
        FOLDER_LOGS => logs_dir(),
        _ => std::env::var("APPDATA")
            .map(std::path::PathBuf::from)
            .unwrap_or_default(),
    };

    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn open_folder(app: AppHandle, kind: String, strategies_dir: String) -> AppResult<()> {
    let path = get_folder_path(kind, strategies_dir)?;

    if !std::path::Path::new(&path).exists() {
        std::fs::create_dir_all(&path)?;
    }

    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|error| AppError::custom(format!("Не удалось открыть папку: {error}")))
}

pub const LISTS_DIR_NAME: &str = "lists";

pub fn config_files(dir: &std::path::Path) -> Vec<std::path::PathBuf> {
    let lists = dir.join(LISTS_DIR_NAME);

    let source = if lists.is_dir() { lists } else {
        dir.to_path_buf()
    };

    let Ok(entries) = std::fs::read_dir(&source) else {
        return Vec::new();
    };

    let mut files: Vec<std::path::PathBuf> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.is_file())
        .filter(|path| {
            let name = path
                .file_name()
                .map(|value| value.to_string_lossy().to_lowercase())
                .unwrap_or_default();

            name.starts_with("list-") || name.starts_with("ipset-")
        })
        .collect();

    files.sort();

    files.truncate(MAX_CHECKED_FILES);

    files
}

pub fn is_domain_like(line: &str) -> bool {
    let value = line
        .trim()
        .trim_start_matches(['^', '!', '|', '#'])
        .trim()
        .to_lowercase();

    if value.is_empty() || value.starts_with('#') {
        return true;
    }

    value.chars().all(|character| {
        character.is_alphanumeric()
            || matches!(
                character,
                '.' | '-' | '_' | ':' | '/' | '*' | '+' | '@' | ',' | '#'
            )
    })
}

pub fn check_configs(dir: &std::path::Path) -> ConfigCheckReport {
    let mut report = ConfigCheckReport {
        strategies_version: read_version(dir),
        ..ConfigCheckReport::default()
    };

    for path in config_files(dir) {
        report.checked += 1;

        let name = path
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_default();

        let Ok(body) = std::fs::read_to_string(&path) else {
            report.empty_files.push(name);
            continue;
        };

        if body.trim().is_empty() {
            report.empty_files.push(name);
            continue;
        }

        let mut seen: Vec<String> = Vec::new();

        for line in body.lines() {
            let value = line.trim().to_lowercase();

            if value.is_empty() || value.starts_with('#') || value.starts_with('^') {
                continue;
            }

            if seen.contains(&value) {
                if !report.duplicates.contains(&value) {
                    report.duplicates.push(value);
                }
                continue;
            }

            if !is_domain_like(&value) && !report.invalid.contains(&value) {
                report.invalid.push(value.clone());
            }

            seen.push(value);
        }
    }

    report
}

#[tauri::command]
pub async fn verify_configs(strategies_dir: String) -> AppResult<ConfigCheckReport> {
    tauri::async_runtime::spawn_blocking(move || {
        check_configs(std::path::Path::new(&strategies_dir))
    })
    .await
    .map_err(|error| crate::error::AppError::custom(format!(
        "Проверка конфигов прервана: {error}"
    )))
}

pub fn remove_backups(dir: &std::path::Path) -> AppResult<usize> {
    let root = dir.join(BACKUP_DIR_NAME);

    if !root.exists() {
        return Ok(0);
    }

    let mut removed = 0usize;

    for entry in std::fs::read_dir(&root)?.flatten() {
        if entry.path().is_dir() && std::fs::remove_dir_all(entry.path()).is_ok() {
            removed += 1;
        }
    }

    Ok(removed)
}

#[tauri::command]
pub fn delete_all_backups(strategies_dir: String) -> AppResult<usize> {
    remove_backups(std::path::Path::new(&strategies_dir))
}

#[cfg(test)]
#[path = "system_tests.rs"]
mod tests;
#[tauri::command]
pub fn system_toasts_enabled() -> bool {
    use winapi::shared::minwindef::DWORD;
    use winapi::shared::winerror::ERROR_SUCCESS;
    use winapi::um::winnt::{KEY_READ, REG_DWORD};
    use winapi::um::winreg::{RegCloseKey, RegOpenKeyExW, RegQueryValueExW, HKEY_CURRENT_USER};

    const KEY: &str = r"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings";
    const VALUE: &str = "NOC_GLOBAL_SETTING_TOASTS_ENABLED";

    let path: Vec<u16> = KEY.encode_utf16().chain(std::iter::once(0)).collect();
    let name: Vec<u16> = VALUE.encode_utf16().chain(std::iter::once(0)).collect();
    let mut key = std::ptr::null_mut();
    let opened = unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, path.as_ptr(), 0, KEY_READ, &mut key) };

    if opened != ERROR_SUCCESS as i32 {
        return true;
    }

    let mut kind: DWORD = 0;
    let mut data: DWORD = 0;
    let mut size = std::mem::size_of::<DWORD>() as DWORD;
    let read = unsafe {
        RegQueryValueExW(
            key,
            name.as_ptr(),
            std::ptr::null_mut(),
            &mut kind,
            &mut data as *mut DWORD as *mut u8,
            &mut size,
        )
    };

    unsafe { RegCloseKey(key) };

    read == ERROR_SUCCESS as i32 && kind == REG_DWORD && data != 0
}
