use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::constants::{BACKUP_SUFFIX, MAX_BACKUPS_PER_FILE};
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupInfo {
    pub original_path: String,
    pub backup_path: String,
    pub created_at: u64,
    pub size: u64,
}

pub fn backup_path_for(original: &Path, timestamp: u64) -> PathBuf {
    let mut name = original
        .file_name()
        .map(|value| value.to_string_lossy().to_string())
        .unwrap_or_default();

    name.push_str(BACKUP_SUFFIX);
    name.push('.');
    name.push_str(&timestamp.to_string());

    match original.parent() {
        Some(dir) => dir.join(name),
        None => PathBuf::from(name),
    }
}

fn parse_backup_timestamp(path: &Path, original: &Path) -> Option<u64> {
    let prefix = format!(
        "{}{}.",
        original
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_default(),
        BACKUP_SUFFIX
    );

    let name = path.file_name()?.to_string_lossy().to_string();

    name.strip_prefix(&prefix)?.parse().ok()
}

pub fn list_backups_for(original: &Path) -> Vec<BackupInfo> {
    let Some(dir) = original.parent() else {
        return Vec::new();
    };

    let Ok(entries) = std::fs::read_dir(dir) else {
        return Vec::new();
    };

    let mut found: Vec<(u64, PathBuf)> = Vec::new();

    for entry in entries.flatten() {
        let path = entry.path();

        if !path.is_file() {
            continue;
        }

        if let Some(timestamp) = parse_backup_timestamp(&path, original) {
            found.push((timestamp, path));
        }
    }

    found.sort_by_key(|item| std::cmp::Reverse(item.0));

    found
        .into_iter()
        .map(|(created_at, path)| {
            let size = std::fs::metadata(&path).map(|meta| meta.len()).unwrap_or(0);

            BackupInfo {
                original_path: original.to_string_lossy().to_string(),
                backup_path: path.to_string_lossy().to_string(),
                created_at,
                size,
            }
        })
        .collect()
}

pub fn rotate_backups(original: &Path, max: usize) -> usize {
    let backups = list_backups_for(original);

    if backups.len() <= max {
        return 0;
    }

    let mut removed = 0usize;

    for backup in backups.into_iter().skip(max) {
        if std::fs::remove_file(&backup.backup_path).is_ok() {
            removed += 1;
        }
    }

    removed
}

pub fn create_backup(original: &Path, timestamp: u64) -> AppResult<BackupInfo> {
    if !original.is_file() {
        return Err(AppError::custom(format!(
            "Файл для бэкапа не найден: {}",
            original.display()
        )));
    }

    let target = backup_path_for(original, timestamp);

    std::fs::copy(original, &target).map_err(|error| {
        AppError::custom(format!(
            "Не удалось создать бэкап {}: {error}",
            target.display()
        ))
    })?;

    rotate_backups(original, MAX_BACKUPS_PER_FILE);

    let size = std::fs::metadata(&target).map(|meta| meta.len()).unwrap_or(0);

    Ok(BackupInfo {
        original_path: original.to_string_lossy().to_string(),
        backup_path: target.to_string_lossy().to_string(),
        created_at: timestamp,
        size,
    })
}

pub fn restore_from_backup(original: &Path, timestamp: Option<u64>) -> AppResult<usize> {
    let backups = list_backups_for(original);

    let chosen = match timestamp {
        Some(wanted) => backups
            .into_iter()
            .find(|backup| backup.created_at == wanted),
        None => backups.into_iter().next(),
    };

    let Some(backup) = chosen else {
        return Err(AppError::custom(format!(
            "Бэкап для {} не найден",
            original.display()
        )));
    };

    if backup.size == 0 {
        return Err(AppError::custom(format!(
            "Бэкап пустой, восстановление отменено: {}",
            backup.backup_path
        )));
    }

    std::fs::copy(&backup.backup_path, original).map_err(|error| {
        AppError::custom(format!(
            "Не удалось восстановить {}: {error}",
            original.display()
        ))
    })?;

    Ok(backup.size as usize)
}