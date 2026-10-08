use std::path::PathBuf;

use tauri::State;

use crate::commands::updater::UpdateState;
use crate::commands::updater_backup::{BackupInfo, list_backups_in, rollback_from};
use crate::commands::updater_install::{InstallReport, install_archive, staging_dir};
use crate::error::{AppError, AppResult};

use crate::commands::updater::{read_version, write_version};
use crate::commands::updater_backup::create_backup;
use crate::security::rate_limit::check_install_update;
use crate::security::sanitize::ensure_cmd_safe_value;
use crate::security::{ensure_size, MAX_ARCHIVE_BYTES};

#[tauri::command]
pub async fn install_update(
    archive_path: String,
    strategies_dir: String,
    version: String,
) -> AppResult<InstallReport> {
    check_install_update()?;

    apply_update(&archive_path, &strategies_dir, &version).await
}

pub async fn apply_update(
    archive_path: &str,
    strategies_dir: &str,
    version: &str,
) -> AppResult<InstallReport> {
    ensure_cmd_safe_value(version)?;

    let archive = PathBuf::from(archive_path);
    let dir = PathBuf::from(strategies_dir);

    if !archive.is_file() {
        return Err(AppError::custom("Скачанный архив не найден"));
    }

    if !dir.is_dir() {
        return Err(AppError::custom("Папка стратегий не найдена"));
    }

    ensure_size(&archive, MAX_ARCHIVE_BYTES, "архив обновления")?;

    let stamp = crate::commands::monitor::now_millis();
    let backup = create_backup(&dir, stamp)?;
    let staging = staging_dir();

    if staging.exists() {
        let _ = std::fs::remove_dir_all(&staging);
    }

    let report = install_archive(&archive, &dir, &staging, version, &backup);
    let _ = std::fs::remove_dir_all(&staging);

    report
}

#[tauri::command]
pub fn cancel_download(state: State<'_, UpdateState>) -> AppResult<bool> {
    state.cancel();

    Ok(true)
}

#[tauri::command]
pub fn get_current_version(strategies_dir: String) -> AppResult<String> {
    Ok(read_version(std::path::Path::new(&strategies_dir)))
}

#[tauri::command]
pub fn set_current_version(strategies_dir: String, version: String) -> AppResult<bool> {
    write_version(std::path::Path::new(&strategies_dir), &version)?;

    Ok(true)
}

#[tauri::command]
pub fn list_update_backups(strategies_dir: String) -> AppResult<Vec<BackupInfo>> {
    list_backups_in(std::path::Path::new(&strategies_dir))
}

#[tauri::command]
pub fn rollback_update(backup_path: String, strategies_dir: String) -> AppResult<usize> {
    let backup = PathBuf::from(&backup_path);
    let dir = PathBuf::from(&strategies_dir);

    if !backup.is_dir() {
        return Err(AppError::custom("Бэкап не найден"));
    }

    rollback_from(&backup, &dir)
}

#[cfg(test)]
#[path = "updater_apply_tests.rs"]
mod tests;