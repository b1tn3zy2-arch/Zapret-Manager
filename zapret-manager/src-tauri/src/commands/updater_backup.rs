use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::error::AppResult;

pub const BACKUP_DIR_NAME: &str = "backup";
pub const MAX_BACKUPS: usize = 3;

const EXCLUDED_FROM_BACKUP: [&str; 4] = ["backup", "zapret-manager", ".git", "How to work"];

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupInfo {
    pub path: String,
    pub timestamp: u64,
    pub size: u64,
    pub version: String,
}

pub fn is_excluded(name: &str) -> bool {
    EXCLUDED_FROM_BACKUP
        .iter()
        .any(|excluded| excluded.eq_ignore_ascii_case(name))
}

pub fn dir_size(path: &Path) -> u64 {
    let mut total = 0u64;

    if let Ok(entries) = std::fs::read_dir(path) {
        for entry in entries.flatten() {
            let Ok(metadata) = entry.metadata() else {
                continue;
            };

            if metadata.is_dir() {
                total = total.saturating_add(dir_size(&entry.path()));
            } else {
                total = total.saturating_add(metadata.len());
            }
        }
    }

    total
}

pub fn copy_tree(source: &Path, target: &Path) -> AppResult<usize> {
    let mut copied = 0usize;

    if !target.exists() {
        std::fs::create_dir_all(target)?;
    }

    for entry in std::fs::read_dir(source)?.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();

        if is_excluded(&name) {
            continue;
        }

        let from = entry.path();
        let to = target.join(&name);

        if from.is_dir() {
            copied += copy_tree(&from, &to)?;
        } else {
            std::fs::copy(&from, &to)?;
            copied += 1;
        }
    }

    Ok(copied)
}

pub fn create_backup(dir: &Path, timestamp: u64) -> AppResult<PathBuf> {
    let root = dir.join(BACKUP_DIR_NAME);
    std::fs::create_dir_all(&root)?;

    let target = root.join(timestamp.to_string());
    copy_tree(dir, &target)?;
    rotate_backups(&root)?;

    tracing::info!("Бэкап стратегий создан: {}", target.display());

    Ok(target)
}

pub fn rotate_backups(root: &Path) -> AppResult<usize> {
    let mut stamps = Vec::new();

    for entry in std::fs::read_dir(root)?.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();

        if let Ok(value) = name.parse::<u64>() {
            stamps.push(value);
        }
    }

    stamps.sort_unstable();
    let mut removed = 0;

    while stamps.len() > MAX_BACKUPS {
        let Some(oldest) = stamps.first().copied() else {
            break;
        };

        let path = root.join(oldest.to_string());

        if std::fs::remove_dir_all(&path).is_ok() {
            removed += 1;
        }

        stamps.remove(0);
    }

    Ok(removed)
}

pub fn list_backups_in(dir: &Path) -> AppResult<Vec<BackupInfo>> {
    let root = dir.join(BACKUP_DIR_NAME);
    let mut items = Vec::new();

    if !root.exists() {
        return Ok(items);
    }

    for entry in std::fs::read_dir(&root)?.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        let Ok(timestamp) = name.parse::<u64>() else {
            continue;
        };

        items.push(BackupInfo {
            path: entry.path().to_string_lossy().to_string(),
            timestamp,
            size: dir_size(&entry.path()),
            version: crate::commands::updater::read_version(&entry.path()),
        });
    }

    items.sort_by_key(|item| std::cmp::Reverse(item.timestamp));

    Ok(items)
}

pub fn rollback_from(backup: &Path, dir: &Path) -> AppResult<usize> {
    crate::commands::updater_manifest::remove_installed_extras(backup, dir);
    let copied = copy_tree(backup, dir)?;
    tracing::info!("Откат из {}: файлов {copied}", backup.display());

    Ok(copied)
}

#[cfg(test)]
#[path = "updater_backup_tests.rs"]
mod tests;