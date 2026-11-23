// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::constants::{BACKUP_SUFFIX, MAX_BACKUPS_PER_FILE}.
use crate::constants::{BACKUP_SUFFIX, MAX_BACKUPS_PER_FILE};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру BackupInfo.
pub struct BackupInfo {
    // Выполняем операцию: pub original_path: String,.
    pub original_path: String,
    // Выполняем операцию: pub backup_path: String,.
    pub backup_path: String,
    // Выполняем операцию: pub created_at: u64,.
    pub created_at: u64,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    // Закрываем блок.
}

// Объявляем функцию backup_path_for.
pub fn backup_path_for(original: &Path, timestamp: u64) -> PathBuf {
    // Объявляем переменную name .
    let mut name = original
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
        .map(|value| value.to_string_lossy().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: name.push_str(BACKUP_SUFFIX);.
    name.push_str(BACKUP_SUFFIX);
    // Выполняем операцию: name.push('.');.
    name.push('.');
    // Выполняем операцию: name.push_str(&timestamp.to_string());.
    name.push_str(&timestamp.to_string());

    // Выбираем вариант по значению.
    match original.parent() {
        // Выполняем операцию: Some(dir) => dir.join(name),.
        Some(dir) => dir.join(name),
        // Выполняем операцию: None => PathBuf::from(name),.
        None => PathBuf::from(name),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию parse_backup_timestamp.
fn parse_backup_timestamp(path: &Path, original: &Path) -> Option<u64> {
    // Объявляем переменную prefix .
    let prefix = format!(
        // Выполняем операцию: "{}{}.",.
        "{}{}.",
        // Выполняем операцию: original.
        original
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
            .map(|value| value.to_string_lossy().to_string())
            // Выполняем операцию: .unwrap_or_default(),.
            .unwrap_or_default(),
        // Выполняем операцию: BACKUP_SUFFIX.
        BACKUP_SUFFIX // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную name .
    let name = path.file_name()?.to_string_lossy().to_string();

    // Выполняем операцию: name.strip_prefix(&prefix)?.parse().ok().
    name.strip_prefix(&prefix)?.parse().ok()
    // Закрываем блок.
}

// Объявляем функцию list_backups_for.
pub fn list_backups_for(original: &Path) -> Vec<BackupInfo> {
    // Объявляем переменную Some(dir) .
    let Some(dir) = original.parent() else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(dir) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную found.
    let mut found: Vec<(u64, PathBuf)> = Vec::new();

    // Перебираем элементы коллекции.
    for entry in entries.flatten() {
        // Объявляем переменную path .
        let path = entry.path();

        // Проверяем условие: !path.is_file() {.
        if !path.is_file() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(timestamp) = parse_backup_timestamp(&path.
        if let Some(timestamp) = parse_backup_timestamp(&path, original) {
            // Выполняем операцию: found.push((timestamp, path));.
            found.push((timestamp, path));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: found.sort_by_key(|item| std::cmp::Reverse(item.0));.
    found.sort_by_key(|item| std::cmp::Reverse(item.0));

    // Выполняем операцию: found.
    found
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .map(|(created_at, path)| {.
        .map(|(created_at, path)| {
            // Объявляем переменную size .
            let size = std::fs::metadata(&path).map(|meta| meta.len()).unwrap_or(0);

            // Выполняем операцию: BackupInfo {.
            BackupInfo {
                // Выполняем операцию: original_path: original.to_string_lossy().to_string(),.
                original_path: original.to_string_lossy().to_string(),
                // Выполняем операцию: backup_path: path.to_string_lossy().to_string(),.
                backup_path: path.to_string_lossy().to_string(),
                // Выполняем операцию: created_at,.
                created_at,
                // Выполняем операцию: size,.
                size,
                // Закрываем блок.
            }
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию rotate_backups.
pub fn rotate_backups(original: &Path, max: usize) -> usize {
    // Объявляем переменную backups .
    let backups = list_backups_for(original);

    // Проверяем условие: backups.len() <= max {.
    if backups.len() <= max {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Объявляем переменную removed .
    let mut removed = 0usize;

    // Перебираем элементы коллекции.
    for backup in backups.into_iter().skip(max) {
        // Проверяем условие: std::fs::remove_file(&backup.backup_path).is_ok() .
        if std::fs::remove_file(&backup.backup_path).is_ok() {
            // Выполняем операцию: removed += 1;.
            removed += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: removed.
    removed
    // Закрываем блок.
}

// Объявляем функцию create_backup.
pub fn create_backup(original: &Path, timestamp: u64) -> AppResult<BackupInfo> {
    // Проверяем условие: !original.is_file() {.
    if !original.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Файл для бэкапа не найден: {}",.
            "Файл для бэкапа не найден: {}",
            // Выполняем операцию: original.display().
            original.display() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную target .
    let target = backup_path_for(original, timestamp);

    // Выполняем операцию: std::fs::copy(original, &target).map_err(|error| {.
    std::fs::copy(original, &target).map_err(|error| {
        // Выполняем операцию: AppError::custom(format!(.
        AppError::custom(format!(
            // Выполняем операцию: "Не удалось создать бэкап {}: {error}",.
            "Не удалось создать бэкап {}: {error}",
            // Выполняем операцию: target.display().
            target.display() // Закрываем выражение или коллекцию.
        ))
        // Закрываем блок.
    })?;

    // Выполняем операцию: rotate_backups(original, MAX_BACKUPS_PER_FILE);.
    rotate_backups(original, MAX_BACKUPS_PER_FILE);

    // Объявляем переменную size .
    let size = std::fs::metadata(&target)
        // Выполняем операцию: .map(|meta| meta.len()).
        .map(|meta| meta.len())
        // Выполняем операцию: .unwrap_or(0);.
        .unwrap_or(0);

    // Выполняем операцию: Ok(BackupInfo {.
    Ok(BackupInfo {
        // Выполняем операцию: original_path: original.to_string_lossy().to_string(),.
        original_path: original.to_string_lossy().to_string(),
        // Выполняем операцию: backup_path: target.to_string_lossy().to_string(),.
        backup_path: target.to_string_lossy().to_string(),
        // Выполняем операцию: created_at: timestamp,.
        created_at: timestamp,
        // Выполняем операцию: size,.
        size,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем функцию restore_from_backup.
pub fn restore_from_backup(original: &Path, timestamp: Option<u64>) -> AppResult<usize> {
    // Объявляем переменную backups .
    let backups = list_backups_for(original);

    // Объявляем переменную chosen .
    let chosen = match timestamp {
        // Выполняем операцию: Some(wanted) => backups.
        Some(wanted) => backups
            // Выполняем операцию: .into_iter().
            .into_iter()
            // Выполняем операцию: .find(|backup| backup.created_at == wanted),.
            .find(|backup| backup.created_at == wanted),
        // Выполняем операцию: None => backups.into_iter().next(),.
        None => backups.into_iter().next(),
        // Закрываем блок.
    };

    // Объявляем переменную Some(backup) .
    let Some(backup) = chosen else {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Бэкап для {} не найден",.
            "Бэкап для {} не найден",
            // Выполняем операцию: original.display().
            original.display() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    };

    // Проверяем условие: backup.size == 0 {.
    if backup.size == 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Бэкап пустой, восстановление отменено: {}",.
            "Бэкап пустой, восстановление отменено: {}",
            // Выполняем операцию: backup.backup_path.
            backup.backup_path // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::copy(&backup.backup_path, original).map_err(|e.
    std::fs::copy(&backup.backup_path, original).map_err(|error| {
        // Выполняем операцию: AppError::custom(format!(.
        AppError::custom(format!(
            // Выполняем операцию: "Не удалось восстановить {}: {error}",.
            "Не удалось восстановить {}: {error}",
            // Выполняем операцию: original.display().
            original.display() // Закрываем выражение или коллекцию.
        ))
        // Закрываем блок.
    })?;

    // Выполняем операцию: Ok(backup.size as usize).
    Ok(backup.size as usize)
    // Закрываем блок.
}
