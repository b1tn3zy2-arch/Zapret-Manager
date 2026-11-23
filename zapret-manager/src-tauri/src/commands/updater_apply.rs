// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: tauri::State;.
use tauri::State;

// Подключаем модули: crate::commands::resources_fs::validate_strategies_dir;.
use crate::commands::resources_fs::validate_strategies_dir;
// Подключаем модули: crate::commands::updater::UpdateState;.
use crate::commands::updater::UpdateState;
// Подключаем модули: crate::commands::updater_backup::{.
use crate::commands::updater_backup::{
    // Выполняем операцию: list_backups_in, rollback_from, BackupInfo, BACKUP_DIR_.
    list_backups_in,
    rollback_from,
    BackupInfo,
    BACKUP_DIR_NAME,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::updater_install::{install_archive, sta.
use crate::commands::updater_install::{install_archive, staging_dir, InstallReport};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::paths::safe_path;.
use crate::security::paths::safe_path;

// Подключаем модули: crate::commands::updater::write_version;.
use crate::commands::updater::write_version;

// Подключаем модули: crate::commands::updater_backup::create_backup;.
use crate::commands::updater_backup::create_backup;
// Подключаем модули: crate::security::rate_limit::check_install_update;.
use crate::security::rate_limit::check_install_update;
// Подключаем модули: crate::security::sanitize::ensure_cmd_safe_value;.
use crate::security::sanitize::ensure_cmd_safe_value;
// Подключаем модули: crate::security::{ensure_size, MAX_ARCHIVE_BYTES};.
use crate::security::{ensure_size, MAX_ARCHIVE_BYTES};

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn install_update(.
pub async fn install_update(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: archive_path: String,.
    archive_path: String,
    // Выполняем операцию: strategies_dir: String,.
    strategies_dir: String,
    // Выполняем операцию: version: String,.
    version: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<InstallReport> {
    // Выполняем операцию: check_install_update()?;.
    check_install_update()?;

    // Объявляем переменную dir .
    let dir = validate_strategies_dir(&app, &strategies_dir)?;
    // Объявляем переменную archive .
    let archive = validate_archive_path(&archive_path)?;

    // Выполняем операцию: apply_update(&archive.to_string_lossy(), &dir.to_string.
    apply_update(&archive.to_string_lossy(), &dir.to_string_lossy(), &version).await
    // Закрываем блок.
}

// Объявляем функцию validate_archive_path.
fn validate_archive_path(raw: &str) -> AppResult<PathBuf> {
    // Объявляем переменную root .
    let root = std::env::temp_dir()
        // Выполняем операцию: .join("zapret-manager").
        .join("zapret-manager")
        // Выполняем операцию: .join("downloads");.
        .join("downloads");

    // Выполняем операцию: std::fs::create_dir_all(&root)?;.
    std::fs::create_dir_all(&root)?;

    // Объявляем переменную archive .
    let archive = safe_path(&root, Path::new(raw.trim()))?;

    // Проверяем условие: archive.
    if archive
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("zip")).
        .map(|value| value.eq_ignore_ascii_case("zip"))
        // Выполняем операцию: != Some(true).
        != Some(true)
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Архив обновления должен быть .zip"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(archive).
    Ok(archive)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn apply_update(.
pub async fn apply_update(
    // Выполняем операцию: archive_path: &str,.
    archive_path: &str,
    // Выполняем операцию: strategies_dir: &str,.
    strategies_dir: &str,
    // Выполняем операцию: version: &str,.
    version: &str,
    // Закрываем выражение или коллекцию.
) -> AppResult<InstallReport> {
    // Выполняем операцию: ensure_cmd_safe_value(version)?;.
    ensure_cmd_safe_value(version)?;

    // Объявляем переменную archive .
    let archive = PathBuf::from(archive_path);
    // Объявляем переменную version .
    let version = version.to_string();
    // Объявляем переменную dir .
    let dir = PathBuf::from(strategies_dir);

    // Проверяем условие: !archive.is_file() {.
    if !archive.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Скачанный архив не найден"));
        // Закрываем блок.
    }

    // Проверяем условие: !dir.is_dir() {.
    if !dir.is_dir() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Папка стратегий не найдена"));
        // Закрываем блок.
    }

    // Выполняем операцию: ensure_size(&archive, MAX_ARCHIVE_BYTES, "архив обновле.
    ensure_size(&archive, MAX_ARCHIVE_BYTES, "архив обновления")?;

    // Объявляем переменную stamp .
    let stamp = crate::commands::monitor::now_millis();
    // Объявляем переменную backup .
    let backup = create_backup(&dir, stamp)?;
    // Объявляем переменную staging .
    let staging = staging_dir();
    // Объявляем переменную staging_for_task .
    let staging_for_task = staging.clone();

    // Проверяем условие: staging.exists() {.
    if staging.exists() {
        // Объявляем переменную _ .
        let _ = std::fs::remove_dir_all(&staging);
        // Закрываем блок.
    }

    // Бэкап, распаковка и слияние — сотни мегабайт синхронного I/O.
    // Вне рабочего потока, иначе рантайм tokio встаёт на всё время.
    // Объявляем переменную report .
    let report = tokio::task::spawn_blocking(move || {
        // Выполняем операцию: install_archive(&archive, &dir, &staging_for_task, &ver.
        install_archive(&archive, &dir, &staging_for_task, &version, &backup)
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Установка об.
    .map_err(|error| AppError::custom(format!("Установка обновления прервана: {error}")))?;
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&staging);

    // Выполняем операцию: report.
    report
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию cancel_download.
pub fn cancel_download(state: State<'_, UpdateState>) -> AppResult<bool> {
    // Выполняем операцию: state.cancel();.
    state.cancel();

    // Выполняем операцию: Ok(true).
    Ok(true)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию set_current_version.
pub fn set_current_version(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: strategies_dir: String,.
    strategies_dir: String,
    // Выполняем операцию: version: String,.
    version: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<bool> {
    // Объявляем переменную dir .
    let dir = validate_strategies_dir(&app, &strategies_dir)?;

    // Выполняем операцию: write_version(&dir, &version)?;.
    write_version(&dir, &version)?;

    // Выполняем операцию: Ok(true).
    Ok(true)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию list_update_backups.
pub fn list_update_backups(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: strategies_dir: String,.
    strategies_dir: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<BackupInfo>> {
    // Объявляем переменную dir .
    let dir = validate_strategies_dir(&app, &strategies_dir)?;

    // Выполняем операцию: list_backups_in(&dir).
    list_backups_in(&dir)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию rollback_update.
pub fn rollback_update(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: backup_path: String,.
    backup_path: String,
    // Выполняем операцию: strategies_dir: String,.
    strategies_dir: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<usize> {
    // Объявляем переменную dir .
    let dir = validate_strategies_dir(&app, &strategies_dir)?;

    // Выполняем операцию: rollback_checked(&backup_path, &dir).
    rollback_checked(&backup_path, &dir)
    // Закрываем блок.
}

// Объявляем функцию rollback_checked.
pub fn rollback_checked(backup_path: &str, strategies_dir: &Path) -> AppResult<usize> {
    // Объявляем переменную backups_root .
    let backups_root = strategies_dir.join(BACKUP_DIR_NAME);
    // Объявляем переменную backup .
    let backup = safe_path(&backups_root, Path::new(backup_path.trim()))
        // Выполняем операцию: .map_err(|_| AppError::custom("Бэкап не найден"))?;.
        .map_err(|_| AppError::custom("Бэкап не найден"))?;

    // Проверяем условие: !backup.is_dir() {.
    if !backup.is_dir() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Бэкап не найден"));
        // Закрываем блок.
    }

    // Выполняем операцию: rollback_from(&backup, strategies_dir).
    rollback_from(&backup, strategies_dir)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "updater_apply_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
