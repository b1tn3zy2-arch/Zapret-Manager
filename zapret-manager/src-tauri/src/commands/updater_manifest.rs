use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::error::{AppError, AppResult};

pub const MANIFEST_NAME: &str = "installed.json";

pub fn manifest_path(backup: &Path) -> PathBuf {
    backup.join(MANIFEST_NAME)
}

fn sanitize(relative: &str) -> Option<PathBuf> {
    let cleaned = relative.replace('\\', "/");
    let path = PathBuf::from(&cleaned);

    if path.as_os_str().is_empty() || path.is_absolute() {
        return None;
    }

    if cleaned.split('/').any(|part| part == "..") {
        return None;
    }

    Some(path)
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct Manifest {
    #[serde(default)]
    files: Vec<String>,
}

pub fn write_manifest(backup: &Path, files: &[String]) -> AppResult<()> {
    let mut unique: Vec<String> = Vec::with_capacity(files.len());

    for file in files {
        if !unique.contains(file) {
            unique.push(file.clone());
        }
    }

    let manifest = Manifest { files: unique };
    let body = serde_json::to_string_pretty(&manifest)
        .map_err(|error| AppError::custom(format!("Манифест не собран: {error}")))?;

    std::fs::write(manifest_path(backup), body)?;

    Ok(())
}

pub fn read_manifest(backup: &Path) -> Vec<String> {
    let Ok(body) = std::fs::read_to_string(manifest_path(backup)) else {
        return Vec::new();
    };

    serde_json::from_str::<Manifest>(&body)
        .map(|manifest| manifest.files)
        .unwrap_or_default()
}

pub fn remove_installed_extras(backup: &Path, dir: &Path) -> usize {
    let mut removed = 0usize;

    for entry in read_manifest(backup) {
        let Some(relative) = sanitize(&entry) else {
            tracing::warn!("Пропущен небезопасный путь манифеста: {entry}");
            continue;
        };

        if backup.join(&relative).exists() {
            continue;
        }

        let target = dir.join(&relative);

        let removed_ok = if target.is_dir() {
            std::fs::remove_dir_all(&target).is_ok()
        } else {
            std::fs::remove_file(&target).is_ok()
        };

        if removed_ok {
            removed += 1;
        }
    }

    if removed > 0 {
        tracing::info!("При откате удалено файлов обновления: {removed}");
    }

    removed
}

#[cfg(test)]
#[path = "updater_manifest_tests.rs"]
mod tests;