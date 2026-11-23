// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;
// Подключаем модули: tauri_plugin_opener::OpenerExt;.
use tauri_plugin_opener::OpenerExt;

// Выполняем операцию: pub use crate::build_info::{rust_version, webview_versi.
pub use crate::build_info::{rust_version, webview_version};

// Подключаем модули: crate::commands::resources_fs::validate_strategies_dir;.
use crate::commands::resources_fs::validate_strategies_dir;
// Подключаем модули: crate::commands::updater::read_version;.
use crate::commands::updater::read_version;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу FOLDER_CONFIG.
pub const FOLDER_CONFIG: &str = "config";
// Объявляем константу FOLDER_LOGS.
pub const FOLDER_LOGS: &str = "logs";
// Объявляем константу FOLDER_STRATEGIES.
pub const FOLDER_STRATEGIES: &str = "strategies";
// Объявляем константу FOLDER_BACKUPS.
pub const FOLDER_BACKUPS: &str = "backups";

// Объявляем константу BACKUP_DIR_NAME.
pub const BACKUP_DIR_NAME: &str = "backup";

// Объявляем константу MAX_CHECKED_FILES.
const MAX_CHECKED_FILES: usize = 64;

/// Те же границы, что и в настройках приложения, — чтобы Rust и интерфейс
/// не разошлись в том, что считается допустимым сроком хранения.
// Объявляем константу MIN_LOG_RETENTION_DAYS.
const MIN_LOG_RETENTION_DAYS: u32 = 1;
// Объявляем константу MAX_LOG_RETENTION_DAYS.
const MAX_LOG_RETENTION_DAYS: u32 = 365;

/// Деинсталлятор NSIS лежит рядом с exe и удаляет настройки только по флагу.
// Объявляем константу UNINSTALLER_FILE.
const UNINSTALLER_FILE: &str = "uninstall.exe";
// Объявляем константу UNINSTALLER_DELETE_APPDATA.
const UNINSTALLER_DELETE_APPDATA: &str = "/DELETEAPPDATA";

// Объявляем константу UNKNOWN_VERSION.
pub const UNKNOWN_VERSION: &str = "неизвестно";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру SystemInfo.
pub struct SystemInfo {
    // Выполняем операцию: pub os: String,.
    pub os: String,
    // Выполняем операцию: pub os_version: String,.
    pub os_version: String,
    // Выполняем операцию: pub os_build: String,.
    pub os_build: String,
    // Выполняем операцию: pub arch: String,.
    pub arch: String,
    // Выполняем операцию: pub tauri_version: String,.
    pub tauri_version: String,
    // Выполняем операцию: pub rust_version: String,.
    pub rust_version: String,
    // Выполняем операцию: pub app_version: String,.
    pub app_version: String,
    // Выполняем операцию: pub webview_version: String,.
    pub webview_version: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру ConfigCheckReport.
pub struct ConfigCheckReport {
    // Выполняем операцию: pub checked: usize,.
    pub checked: usize,
    // Выполняем операцию: pub empty_files: Vec<String>,.
    pub empty_files: Vec<String>,
    // Выполняем операцию: pub duplicates: Vec<String>,.
    pub duplicates: Vec<String>,
    // Выполняем операцию: pub invalid: Vec<String>,.
    pub invalid: Vec<String>,
    // Выполняем операцию: pub strategies_version: String,.
    pub strategies_version: String,
    // Закрываем блок.
}

// Объявляем функцию os_build.
pub fn os_build() -> String {
    // Выполняем операцию: std::env::var("OS_BUILD").unwrap_or_default().
    std::env::var("OS_BUILD").unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию collect_system_info.
pub fn collect_system_info() -> SystemInfo {
    // Выполняем операцию: SystemInfo {.
    SystemInfo {
        // Выполняем операцию: os: sysinfo::System::name().unwrap_or_else(|| UNKNOWN_V.
        os: sysinfo::System::name().unwrap_or_else(|| UNKNOWN_VERSION.to_string()),
        // Выполняем операцию: os_build: os_build(),.
        os_build: os_build(),
        // Выполняем операцию: os_version: sysinfo::System::long_os_version().
        os_version: sysinfo::System::long_os_version()
            // Выполняем операцию: .unwrap_or_else(|| UNKNOWN_VERSION.to_string()),.
            .unwrap_or_else(|| UNKNOWN_VERSION.to_string()),
        // Выполняем операцию: arch: std::env::consts::ARCH.to_string(),.
        arch: std::env::consts::ARCH.to_string(),
        // Выполняем операцию: tauri_version: tauri::VERSION.to_string(),.
        tauri_version: tauri::VERSION.to_string(),
        // Выполняем операцию: rust_version: rust_version(),.
        rust_version: rust_version(),
        // Выполняем операцию: app_version: env!("CARGO_PKG_VERSION").to_string(),.
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        // Выполняем операцию: webview_version: webview_version(),.
        webview_version: webview_version(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию get_system_info.
pub fn get_system_info() -> AppResult<SystemInfo> {
    // Выполняем операцию: Ok(collect_system_info()).
    Ok(collect_system_info())
    // Закрываем блок.
}

// Объявляем функцию folder_kind.
fn folder_kind(kind: &str) -> AppResult<String> {
    // Выбираем вариант по значению.
    match kind {
        // Выполняем операцию: FOLDER_CONFIG | FOLDER_LOGS | FOLDER_STRATEGIES | FOLDE.
        FOLDER_CONFIG | FOLDER_LOGS | FOLDER_STRATEGIES | FOLDER_BACKUPS => Ok(kind.to_string()),
        // Выполняем операцию: _ => Err(AppError::custom(format!("Неизвестная папка: {.
        _ => Err(AppError::custom(format!("Неизвестная папка: {kind}"))),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию logs_dir.
pub fn logs_dir() -> std::path::PathBuf {
    // Выполняем операцию: std::env::temp_dir().join("zapret-manager").join("logs".
    std::env::temp_dir().join("zapret-manager").join("logs")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию get_folder_path.
pub fn get_folder_path(kind: String, strategies_dir: String) -> AppResult<String> {
    // Объявляем переменную kind .
    let kind = folder_kind(&kind)?;

    // Объявляем переменную path .
    let path = match kind.as_str() {
        // Выполняем операцию: FOLDER_STRATEGIES => std::path::PathBuf::from(strategie.
        FOLDER_STRATEGIES => std::path::PathBuf::from(strategies_dir),
        // Выполняем операцию: FOLDER_BACKUPS => std::path::PathBuf::from(&strategies_.
        FOLDER_BACKUPS => std::path::PathBuf::from(&strategies_dir)
            // Выполняем операцию: .join(crate::commands::updater_backup::BACKUP_DIR_NAME).
            .join(crate::commands::updater_backup::BACKUP_DIR_NAME),
        // Выполняем операцию: FOLDER_LOGS => logs_dir(),.
        FOLDER_LOGS => logs_dir(),
        // Папка приложения, а не корень %APPDATA%: иначе
        // «Открыть папку с конфигами» открывала бы всю AppData.
        // Выполняем операцию: _ => crate::commands::vpn_store::app_data_dir()?,.
        _ => crate::commands::vpn_store::app_data_dir()?,
        // Закрываем блок.
    };

    // Выполняем операцию: Ok(path.to_string_lossy().to_string()).
    Ok(path.to_string_lossy().to_string())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию open_folder.
pub fn open_folder(app: AppHandle, kind: String, strategies_dir: String) -> AppResult<()> {
    // Объявляем переменную kind .
    let kind = folder_kind(&kind)?;

    // Объявляем переменную strategies_dir .
    let strategies_dir = if kind == FOLDER_STRATEGIES || kind == FOLDER_BACKUPS {
        // Выполняем операцию: validate_strategies_dir(&app, &strategies_dir)?.
        validate_strategies_dir(&app, &strategies_dir)?
            // Выполняем операцию: .to_string_lossy().
            .to_string_lossy()
            // Выполняем операцию: .to_string().
            .to_string()
    // Закрываем блок.
    } else {
        // Выполняем операцию: strategies_dir.
        strategies_dir
        // Закрываем блок.
    };

    // Объявляем переменную path .
    let path = get_folder_path(kind, strategies_dir)?;

    // Проверяем условие: !std::path::Path::new(&path).exists() {.
    if !std::path::Path::new(&path).exists() {
        // Выполняем операцию: std::fs::create_dir_all(&path)?;.
        std::fs::create_dir_all(&path)?;
        // Закрываем блок.
    }

    // Выполняем операцию: app.opener().
    app.opener()
        // Выполняем операцию: .open_path(path, None::<&str>).
        .open_path(path, None::<&str>)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не удалось о.
        .map_err(|error| AppError::custom(format!("Не удалось открыть папку: {error}")))
    // Закрываем блок.
}

// Объявляем константу LISTS_DIR_NAME.
pub const LISTS_DIR_NAME: &str = "lists";

// Объявляем функцию config_files.
pub fn config_files(dir: &std::path::Path) -> Vec<std::path::PathBuf> {
    // Объявляем переменную lists .
    let lists = dir.join(LISTS_DIR_NAME);

    // Объявляем переменную source .
    let source = if lists.is_dir() {
        // Выполняем операцию: lists.
        lists
    // Закрываем блок.
    } else {
        // Выполняем операцию: dir.to_path_buf().
        dir.to_path_buf()
        // Закрываем блок.
    };

    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(&source) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную files.
    let mut files: Vec<std::path::PathBuf> = entries
        // Выполняем операцию: .flatten().
        .flatten()
        // Выполняем операцию: .map(|entry| entry.path()).
        .map(|entry| entry.path())
        // Выполняем операцию: .filter(|path| path.is_file()).
        .filter(|path| path.is_file())
        // Выполняем операцию: .filter(|path| {.
        .filter(|path| {
            // Объявляем переменную name .
            let name = path
                // Выполняем операцию: .file_name().
                .file_name()
                // Выполняем операцию: .map(|value| value.to_string_lossy().to_lowercase()).
                .map(|value| value.to_string_lossy().to_lowercase())
                // Выполняем операцию: .unwrap_or_default();.
                .unwrap_or_default();

            // Выполняем операцию: name.starts_with("list-") || name.starts_with("ipset-").
            name.starts_with("list-") || name.starts_with("ipset-")
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: files.sort();.
    files.sort();

    // Выполняем операцию: files.truncate(MAX_CHECKED_FILES);.
    files.truncate(MAX_CHECKED_FILES);

    // Выполняем операцию: files.
    files
    // Закрываем блок.
}

// Объявляем функцию is_domain_like.
pub fn is_domain_like(line: &str) -> bool {
    // Объявляем переменную value .
    let value = line
        // Выполняем операцию: .trim().
        .trim()
        // Выполняем операцию: .trim_start_matches(['^', '!', '|', '#']).
        .trim_start_matches(['^', '!', '|', '#'])
        // Выполняем операцию: .trim().
        .trim()
        // Выполняем операцию: .to_lowercase();.
        .to_lowercase();

    // Проверяем условие: value.is_empty() || value.starts_with('#') {.
    if value.is_empty() || value.starts_with('#') {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Выполняем операцию: value.chars().all(|character| {.
    value.chars().all(|character| {
        // Выполняем операцию: character.is_alphanumeric().
        character.is_alphanumeric()
            // Выполняем операцию: || matches!(.
            || matches!(
                // Выполняем операцию: character,.
                character,
                // Выполняем операцию: '.' | '-' | '_' | ':' | '/' | '*' | '+' | '@' | ',' | '.
                '.' | '-' | '_' | ':' | '/' | '*' | '+' | '@' | ',' | '#'
            // Закрываем выражение или коллекцию.
            )
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию check_configs.
pub fn check_configs(dir: &std::path::Path) -> ConfigCheckReport {
    // Объявляем переменную report .
    let mut report = ConfigCheckReport {
        // Выполняем операцию: strategies_version: read_version(dir),.
        strategies_version: read_version(dir),
        // Выполняем операцию: ..ConfigCheckReport::default().
        ..ConfigCheckReport::default() // Закрываем блок.
    };

    // Перебираем элементы коллекции.
    for path in config_files(dir) {
        // Выполняем операцию: report.checked += 1;.
        report.checked += 1;

        // Объявляем переменную name .
        let name = path
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
            .map(|value| value.to_string_lossy().to_string())
            // Выполняем операцию: .unwrap_or_default();.
            .unwrap_or_default();

        // Объявляем переменную Ok(body) .
        let Ok(body) = std::fs::read_to_string(&path) else {
            // Выполняем операцию: report.empty_files.push(name);.
            report.empty_files.push(name);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: body.trim().is_empty() {.
        if body.trim().is_empty() {
            // Выполняем операцию: report.empty_files.push(name);.
            report.empty_files.push(name);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную seen.
        let mut seen: Vec<String> = Vec::new();

        // Перебираем элементы коллекции.
        for line in body.lines() {
            // Объявляем переменную value .
            let value = line.trim().to_lowercase();

            // Проверяем условие: value.is_empty() || value.starts_with('#') || valu.
            if value.is_empty() || value.starts_with('#') || value.starts_with('^') {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Проверяем условие: seen.contains(&value) {.
            if seen.contains(&value) {
                // Проверяем условие: !report.duplicates.contains(&value) {.
                if !report.duplicates.contains(&value) {
                    // Выполняем операцию: report.duplicates.push(value);.
                    report.duplicates.push(value);
                    // Закрываем блок.
                }
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Проверяем условие: !is_domain_like(&value) && !report.invalid.contain.
            if !is_domain_like(&value) && !report.invalid.contains(&value) {
                // Выполняем операцию: report.invalid.push(value.clone());.
                report.invalid.push(value.clone());
                // Закрываем блок.
            }

            // Выполняем операцию: seen.push(value);.
            seen.push(value);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: report.
    report
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn verify_configs(.
pub async fn verify_configs(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: strategies_dir: String,.
    strategies_dir: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<ConfigCheckReport> {
    // Объявляем переменную dir .
    let dir = validate_strategies_dir(&app, &strategies_dir)?;

    // Выполняем операцию: tauri::async_runtime::spawn_blocking(move || check_conf.
    tauri::async_runtime::spawn_blocking(move || check_configs(&dir))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| {.
        .map_err(|error| {
            // Выполняем операцию: crate::error::AppError::custom(format!("Проверка конфиг.
            crate::error::AppError::custom(format!("Проверка конфигов прервана: {error}"))
            // Закрываем блок.
        })
    // Закрываем блок.
}

// Объявляем функцию remove_backups.
pub fn remove_backups(dir: &std::path::Path) -> AppResult<usize> {
    // Объявляем переменную root .
    let root = dir.join(BACKUP_DIR_NAME);

    // Проверяем условие: !root.exists() {.
    if !root.exists() {
        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную removed .
    let mut removed = 0usize;

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(&root)?.flatten() {
        // Проверяем условие: entry.path().is_dir() && std::fs::remove_dir_all(e.
        if entry.path().is_dir() && std::fs::remove_dir_all(entry.path()).is_ok() {
            // Выполняем операцию: removed += 1;.
            removed += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(removed).
    Ok(removed)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию delete_all_backups.
pub fn delete_all_backups(app: AppHandle, strategies_dir: String) -> AppResult<usize> {
    // Объявляем переменную dir .
    let dir = validate_strategies_dir(&app, &strategies_dir)?;

    // Выполняем операцию: remove_backups(&dir).
    remove_backups(&dir)
    // Закрываем блок.
}

/// Удаляет файлы журналов из %TEMP%\zapret-manager\logs.
///
/// «Очистить логи» в настройках чистила только память приложения: файлы
/// winws и журнал приложения оставались на диске и снова показывались при
/// следующем запуске.
// Объявляем функцию remove_logs.
pub fn remove_logs(dir: &std::path::Path) -> AppResult<usize> {
    // Проверяем условие: !dir.exists() {.
    if !dir.exists() {
        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную removed .
    let mut removed = 0usize;

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(dir)?.flatten() {
        // Объявляем переменную path .
        let path = entry.path();
        // Объявляем переменную deleted .
        let deleted = if path.is_dir() {
            // Выполняем операцию: std::fs::remove_dir_all(&path).is_ok().
            std::fs::remove_dir_all(&path).is_ok()
        // Закрываем блок.
        } else {
            // Выполняем операцию: std::fs::remove_file(&path).is_ok().
            std::fs::remove_file(&path).is_ok()
            // Закрываем блок.
        };

        // Проверяем условие: deleted {.
        if deleted {
            // Выполняем операцию: removed += 1;.
            removed += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(removed).
    Ok(removed)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn delete_all_logs() -> AppResult<usize> {.
pub async fn delete_all_logs() -> AppResult<usize> {
    // Удаление каталогов логов занимает время: уводим с рабочего
    // потока, чтобы интерфейс не замирал.
    // Объявляем переменную dir .
    let dir = logs_dir();

    // Выполняем операцию: tokio::task::spawn_blocking(move || remove_logs(&dir)).
    tokio::task::spawn_blocking(move || remove_logs(&dir))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Логи не удал.
        .map_err(|error| AppError::custom(format!("Логи не удалены: {error}")))?
    // Закрываем блок.
}

/// Сколько секунд живёт файл при таком сроке хранения.
// Объявляем функцию retention_seconds.
fn retention_seconds(days: u32) -> u64 {
    // Выполняем операцию: u64::from(days.clamp(MIN_LOG_RETENTION_DAYS, MAX_LOG_RE.
    u64::from(days.clamp(MIN_LOG_RETENTION_DAYS, MAX_LOG_RETENTION_DAYS)) * 24 * 60 * 60
    // Закрываем блок.
}

/// Удаление файлов журнала, которые старше отсечки.
///
/// Чистятся обе папки: журнал приложения (`%APPDATA%\com.zapretmanager.app\logs`,
/// он переживает перезапуск) и временные логи запусков (`%TEMP%\zapret-manager\logs`).
/// Настройка «хранить логи N дней» была чистым украшением — файлы копились, пока
/// сам журнал не переполнялся на 1 МБ и не уходил в ротацию.
// Объявляем функцию prune_log_dir.
pub fn prune_log_dir(dir: &std::path::Path, cutoff: std::time::SystemTime) -> usize {
    // Проверяем условие: !dir.is_dir() {.
    if !dir.is_dir() {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(dir) else {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    };

    // Выполняем операцию: entries.
    entries
        // Выполняем операцию: .flatten().
        .flatten()
        // Выполняем операцию: .filter(|entry| entry.path().is_file()).
        .filter(|entry| entry.path().is_file())
        // Выполняем операцию: .filter(|entry| {.
        .filter(|entry| {
            // Выполняем операцию: entry.
            entry
                // Выполняем операцию: .metadata().
                .metadata()
                // Выполняем операцию: .and_then(|meta| meta.modified()).
                .and_then(|meta| meta.modified())
                // Выполняем операцию: .map(|modified| modified < cutoff).
                .map(|modified| modified < cutoff)
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
            // Закрываем блок.
        })
        // Выполняем операцию: .filter(|entry| std::fs::remove_file(entry.path()).is_o.
        .filter(|entry| std::fs::remove_file(entry.path()).is_ok())
        // Выполняем операцию: .count().
        .count()
    // Закрываем блок.
}

/// Применяет срок хранения журналов. Возвращает число удалённых файлов.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию prune_logs.
pub fn prune_logs(retention_days: u32) -> AppResult<usize> {
    // Объявляем переменную Some(cutoff) .
    let Some(cutoff) = std::time::SystemTime::now().checked_sub(std::time::Duration::from_secs(
        // Выполняем операцию: retention_seconds(retention_days),.
        retention_seconds(retention_days),
        // Закрываем выражение или коллекцию.
    )) else {
        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    };

    // Объявляем переменную removed .
    let mut removed = prune_log_dir(&logs_dir(), cutoff);

    // журнал приложения живёт в профиле; без APPDATA его просто не бывает
    // Проверяем условие: let Ok(app_dir) = crate::security::app_log_dir() {.
    if let Ok(app_dir) = crate::security::app_log_dir() {
        // Выполняем операцию: removed += prune_log_dir(&app_dir, cutoff);.
        removed += prune_log_dir(&app_dir, cutoff);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(removed).
    Ok(removed)
    // Закрываем блок.
}

/// Путь к деинсталлятору рядом с приложением.
///
/// Ищем `uninstall.exe`, который кладёт рядом NSIS-установщик Taurи. Portable-сборка
/// установщика не имеет, и об этом честно сообщаем, а не делаем вид, что удалили.
// Объявляем функцию uninstaller_path.
pub fn uninstaller_path() -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = std::env::current_exe()?.parent().map(PathBuf::from);

    // Объявляем переменную Some(dir) .
    let Some(dir) = dir else {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Не удалось определить папку приложения"));
        // Закрываем блок.
    };

    // Объявляем переменную path .
    let path = dir.join(UNINSTALLER_FILE);

    // Проверяем условие: !path.is_file() {.
    if !path.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Приложение установлено без установщика (portable). Уда.
            "Приложение установлено без установщика (portable). Удалите папку вручную.",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(path).
    Ok(path)
    // Закрываем блок.
}

/// Полное удаление приложения: запускает деинсталлятор в тихом режиме вместе с
/// удалением настроек, логов и кэша.
///
/// Деинсталлятор закрывает само приложение и winws.exe сам: работающий `.exe`
/// Windows не даёт удалить, поэтому приложение обязано уйти раньше. Пользователь
/// ждёт этого от кнопки, а не диалога «приложение запущено, закрыть?».
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию full_uninstall.
pub fn full_uninstall() -> AppResult<()> {
    // Подключаем модули: crate::winapi_helpers::HiddenWindow;.
    use crate::winapi_helpers::HiddenWindow;

    // Объявляем переменную uninstaller .
    let uninstaller = uninstaller_path()?;

    // Выполняем операцию: std::process::Command::new(&uninstaller).
    std::process::Command::new(&uninstaller)
        // Выполняем операцию: .arg("/S").
        .arg("/S")
        // Выполняем операцию: .arg(UNINSTALLER_DELETE_APPDATA).
        .arg(UNINSTALLER_DELETE_APPDATA)
        // Выполняем операцию: .hidden().
        .hidden()
        // Выполняем операцию: .spawn().
        .spawn()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не удалось з.
        .map_err(|error| AppError::custom(format!("Не удалось запустить удаление: {error}")))?;

    // Выполняем операцию: tracing::info!("Запущено полное удаление приложения");.
    tracing::info!("Запущено полное удаление приложения");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "system_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию system_toasts_enabled.
pub fn system_toasts_enabled() -> bool {
    // Подключаем модули: winapi::shared::minwindef::DWORD;.
    use winapi::shared::minwindef::DWORD;
    // Подключаем модули: winapi::shared::winerror::ERROR_SUCCESS;.
    use winapi::shared::winerror::ERROR_SUCCESS;
    // Подключаем модули: winapi::um::winnt::{KEY_READ, REG_DWORD};.
    use winapi::um::winnt::{KEY_READ, REG_DWORD};
    // Подключаем модули: winapi::um::winreg::{RegCloseKey, RegOpenKeyExW, RegQue.
    use winapi::um::winreg::{RegCloseKey, RegOpenKeyExW, RegQueryValueExW, HKEY_CURRENT_USER};

    // Объявляем константу KEY.
    const KEY: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings";
    // Объявляем константу VALUE.
    const VALUE: &str = "NOC_GLOBAL_SETTING_TOASTS_ENABLED";

    // Объявляем переменную path.
    let path: Vec<u16> = KEY.encode_utf16().chain(std::iter::once(0)).collect();
    // Объявляем переменную name.
    let name: Vec<u16> = VALUE.encode_utf16().chain(std::iter::once(0)).collect();
    // Объявляем переменную key .
    let mut key = std::ptr::null_mut();
    // Объявляем переменную opened .
    let opened = unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, path.as_ptr(), 0, KEY_READ, &mut key) };

    // Проверяем условие: opened != ERROR_SUCCESS as i32 {.
    if opened != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Объявляем переменную kind.
    let mut kind: DWORD = 0;
    // Объявляем переменную data.
    let mut data: DWORD = 0;
    // Объявляем переменную size .
    let mut size = std::mem::size_of::<DWORD>() as DWORD;
    // Объявляем переменную read .
    let read = unsafe {
        // Выполняем операцию: RegQueryValueExW(.
        RegQueryValueExW(
            // Выполняем операцию: key,.
            key,
            // Выполняем операцию: name.as_ptr(),.
            name.as_ptr(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: &mut kind,.
            &mut kind,
            // Выполняем операцию: &mut data as *mut DWORD as *mut u8,.
            &mut data as *mut DWORD as *mut u8,
            // Выполняем операцию: &mut size,.
            &mut size,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe { RegCloseKey(key) };.
    unsafe { RegCloseKey(key) };

    // Выполняем операцию: read == ERROR_SUCCESS as i32 && kind == REG_DWORD && da.
    read == ERROR_SUCCESS as i32 && kind == REG_DWORD && data != 0
    // Закрываем блок.
}
