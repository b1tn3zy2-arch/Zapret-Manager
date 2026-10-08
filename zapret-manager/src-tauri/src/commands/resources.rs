use std::path::{Path, PathBuf};

use tauri::{AppHandle, Emitter, Manager};

use crate::commands::resources_core::{
    is_binary, manifest_keys_sorted, target_path, ResourcesManifest, ZAPRET_SUBDIR,
};
use crate::commands::resources_fs::{
    collect_files, copy_entries, InitProgress, EVENT_PROGRESS, STAGE_FINALIZING, STAGE_STRATEGIES,
    STAGE_ZAPRET,
};
use crate::error::AppResult;

pub fn app_dir(app: &AppHandle) -> AppResult<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| crate::error::AppError::custom(format!("Нет папки данных: {error}")))?;

    if !dir.exists() {
        std::fs::create_dir_all(&dir)?;
    }

    Ok(dir)
}

fn emit_progress(app: &AppHandle, stage: &str, percent: u8, current: &str) {
    let _ = app.emit(
        EVENT_PROGRESS,
        InitProgress {
            stage: stage.to_string(),
            percent,
            current_file: current.to_string(),
        },
    );
}

pub async fn copy_zapret_tree(
    app: &AppHandle,
    resources: &Path,
    target: &Path,
) -> AppResult<u64> {
    let src = resources.join(ZAPRET_SUBDIR);

    if !src.is_dir() {
        tracing::warn!("Папка zapret в ресурсах не найдена: {}", src.display());

        return Ok(0);
    }

    let entries = collect_files(&src, target)?;

    copy_entries(&entries, STAGE_ZAPRET, &mut |percent, name| {
        emit_progress(app, STAGE_ZAPRET, percent, name);
    })
    .await
}

pub async fn copy_configs_tree(
    app: &AppHandle,
    resources: &Path,
    target: &Path,
) -> AppResult<u64> {
    let src = resources.join("configs");

    if !src.is_dir() {
        return Ok(0);
    }

    let entries = collect_files(&src, target)?;

    copy_entries(&entries, STAGE_STRATEGIES, &mut |percent, name| {
        emit_progress(app, STAGE_STRATEGIES, percent, name);
    })
    .await
}

pub fn app_version(app: &AppHandle) -> String {
    app.package_info().version.to_string()
}

pub fn user_owned(key: &str) -> bool {
    key.starts_with("zapret/lists/") || key.starts_with("zapret/outlast/")
}

fn always_overwrite(key: &str) -> bool {
    is_binary(key)
}

pub async fn smart_update(
    app: &AppHandle,
    manifest: &ResourcesManifest,
    resources: &Path,
    target: &Path,
) -> AppResult<(usize, usize)> {
    let backup = crate::commands::resources_core::create_backup_dir(
        target.parent().unwrap_or(Path::new(".")),
    )?;
    let backed_up = crate::commands::resources_core::backup_user_files(target, &backup)?;

    tracing::info!(
        "Умное обновление ресурсов: бэкап {} файлов в {}",
        backed_up,
        backup.display()
    );

    let keys = manifest_keys_sorted(manifest);
    let mut added = 0usize;
    let mut skipped = 0usize;

    for key in keys {
        if user_owned(&key) {
            skipped += 1;
            continue;
        }

        let Some(expected) = manifest.files.get(&key) else {
            continue;
        };

        let Ok(destination) = target_path(target, &key) else {
            skipped += 1;
            continue;
        };

        let relative = Path::new(&key)
            .strip_prefix("zapret")
            .unwrap_or(Path::new(&key));
        let source = resources.join("zapret").join(relative);

        if !source.is_file() {
            skipped += 1;
            continue;
        }

let user_edited = destination.is_file()
            && !crate::commands::resources_core::verify_file_hash(&destination, expected);

        if user_edited && !always_overwrite(&key) {
            skipped += 1;
            continue;
        }

        if let Some(parent) = destination.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let mut input = tokio::fs::File::open(&source).await?;
        let mut output = tokio::fs::File::create(&destination).await?;
        tokio::io::copy(&mut input, &mut output).await?;
        added += 1;
    }

    let _ = app;
    emit_progress(app, STAGE_FINALIZING, 100, "готово");

    Ok((added, skipped))
}

#[cfg(test)]
#[path = "resources_update_tests.rs"]
mod tests;