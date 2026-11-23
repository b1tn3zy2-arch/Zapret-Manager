// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;

// Объявляем константу BACKUP_DIR_NAME.
pub const BACKUP_DIR_NAME: &str = "backup";
// Объявляем константу MAX_BACKUPS.
pub const MAX_BACKUPS: usize = 3;

// Объявляем константу EXCLUDED_FROM_BACKUP.
const EXCLUDED_FROM_BACKUP: [&str; 4] = ["backup", "zapret-manager", ".git", "How to work"];

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру BackupInfo.
pub struct BackupInfo {
    // Выполняем операцию: pub path: String,.
    pub path: String,
    // Выполняем операцию: pub timestamp: u64,.
    pub timestamp: u64,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    // Выполняем операцию: pub version: String,.
    pub version: String,
    // Закрываем блок.
}

// Объявляем функцию is_excluded.
pub fn is_excluded(name: &str) -> bool {
    // Выполняем операцию: EXCLUDED_FROM_BACKUP.
    EXCLUDED_FROM_BACKUP
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|excluded| excluded.eq_ignore_ascii_case(name)).
        .any(|excluded| excluded.eq_ignore_ascii_case(name))
    // Закрываем блок.
}

// Объявляем функцию dir_size.
pub fn dir_size(path: &Path) -> u64 {
    // Объявляем переменную total .
    let mut total = 0u64;

    // Проверяем условие: let Ok(entries) = std::fs::read_dir(path) {.
    if let Ok(entries) = std::fs::read_dir(path) {
        // Перебираем элементы коллекции.
        for entry in entries.flatten() {
            // Объявляем переменную Ok(metadata) .
            let Ok(metadata) = entry.metadata() else {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            };

            // Проверяем условие: metadata.is_dir() {.
            if metadata.is_dir() {
                // Выполняем операцию: total = total.saturating_add(dir_size(&entry.path()));.
                total = total.saturating_add(dir_size(&entry.path()));
            // Закрываем блок.
            } else {
                // Выполняем операцию: total = total.saturating_add(metadata.len());.
                total = total.saturating_add(metadata.len());
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: total.
    total
    // Закрываем блок.
}

// Объявляем функцию copy_tree.
pub fn copy_tree(source: &Path, target: &Path) -> AppResult<usize> {
    // Объявляем переменную copied .
    let mut copied = 0usize;

    // Проверяем условие: !target.exists() {.
    if !target.exists() {
        // Выполняем операцию: std::fs::create_dir_all(target)?;.
        std::fs::create_dir_all(target)?;
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(source)?.flatten() {
        // Объявляем переменную name .
        let name = entry.file_name().to_string_lossy().to_string();

        // Проверяем условие: is_excluded(&name) {.
        if is_excluded(&name) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную from .
        let from = entry.path();
        // Объявляем переменную to .
        let to = target.join(&name);

        // Проверяем условие: from.is_dir() {.
        if from.is_dir() {
            // Выполняем операцию: copied += copy_tree(&from, &to)?;.
            copied += copy_tree(&from, &to)?;
        // Закрываем блок.
        } else {
            // Выполняем операцию: std::fs::copy(&from, &to)?;.
            std::fs::copy(&from, &to)?;
            // Выполняем операцию: copied += 1;.
            copied += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(copied).
    Ok(copied)
    // Закрываем блок.
}

// Объявляем функцию create_backup.
pub fn create_backup(dir: &Path, timestamp: u64) -> AppResult<PathBuf> {
    // Объявляем переменную root .
    let root = dir.join(BACKUP_DIR_NAME);
    // Выполняем операцию: std::fs::create_dir_all(&root)?;.
    std::fs::create_dir_all(&root)?;

    // Объявляем переменную target .
    let target = root.join(timestamp.to_string());
    // Выполняем операцию: copy_tree(dir, &target)?;.
    copy_tree(dir, &target)?;
    // Выполняем операцию: rotate_backups(&root)?;.
    rotate_backups(&root)?;

    // Выполняем операцию: tracing::info!("Бэкап стратегий создан: {}", target.dis.
    tracing::info!("Бэкап стратегий создан: {}", target.display());

    // Выполняем операцию: Ok(target).
    Ok(target)
    // Закрываем блок.
}

// Объявляем функцию rotate_backups.
pub fn rotate_backups(root: &Path) -> AppResult<usize> {
    // Объявляем переменную stamps .
    let mut stamps = Vec::new();

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(root)?.flatten() {
        // Объявляем переменную name .
        let name = entry.file_name().to_string_lossy().to_string();

        // Проверяем условие: let Ok(value) = name.parse::<u64>() {.
        if let Ok(value) = name.parse::<u64>() {
            // Выполняем операцию: stamps.push(value);.
            stamps.push(value);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: stamps.sort_unstable();.
    stamps.sort_unstable();
    // Объявляем переменную removed .
    let mut removed = 0;

    // Повторяем, пока выполняется условие.
    while stamps.len() > MAX_BACKUPS {
        // Объявляем переменную Some(oldest) .
        let Some(oldest) = stamps.first().copied() else {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        };

        // Объявляем переменную path .
        let path = root.join(oldest.to_string());

        // Проверяем условие: std::fs::remove_dir_all(&path).is_ok() {.
        if std::fs::remove_dir_all(&path).is_ok() {
            // Выполняем операцию: removed += 1;.
            removed += 1;
            // Закрываем блок.
        }

        // Выполняем операцию: stamps.remove(0);.
        stamps.remove(0);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(removed).
    Ok(removed)
    // Закрываем блок.
}

// Объявляем функцию list_backups_in.
pub fn list_backups_in(dir: &Path) -> AppResult<Vec<BackupInfo>> {
    // Объявляем переменную root .
    let root = dir.join(BACKUP_DIR_NAME);
    // Объявляем переменную items .
    let mut items = Vec::new();

    // Проверяем условие: !root.exists() {.
    if !root.exists() {
        // Возвращаем результат из функции.
        return Ok(items);
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(&root)?.flatten() {
        // Объявляем переменную name .
        let name = entry.file_name().to_string_lossy().to_string();
        // Объявляем переменную Ok(timestamp) .
        let Ok(timestamp) = name.parse::<u64>() else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Выполняем операцию: items.push(BackupInfo {.
        items.push(BackupInfo {
            // Выполняем операцию: path: entry.path().to_string_lossy().to_string(),.
            path: entry.path().to_string_lossy().to_string(),
            // Выполняем операцию: timestamp,.
            timestamp,
            // Выполняем операцию: size: dir_size(&entry.path()),.
            size: dir_size(&entry.path()),
            // Выполняем операцию: version: crate::commands::updater::read_version(&entry..
            version: crate::commands::updater::read_version(&entry.path()),
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Выполняем операцию: items.sort_by_key(|item| std::cmp::Reverse(item.timesta.
    items.sort_by_key(|item| std::cmp::Reverse(item.timestamp));

    // Выполняем операцию: Ok(items).
    Ok(items)
    // Закрываем блок.
}

// Объявляем функцию rollback_from.
pub fn rollback_from(backup: &Path, dir: &Path) -> AppResult<usize> {
    // Выполняем операцию: crate::commands::updater_manifest::remove_installed_ext.
    crate::commands::updater_manifest::remove_installed_extras(backup, dir);
    // Объявляем переменную copied .
    let copied = copy_tree(backup, dir)?;
    // Выполняем операцию: tracing::info!("Откат из {}: файлов {copied}", backup.d.
    tracing::info!("Откат из {}: файлов {copied}", backup.display());

    // Выполняем операцию: Ok(copied).
    Ok(copied)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "updater_backup_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
