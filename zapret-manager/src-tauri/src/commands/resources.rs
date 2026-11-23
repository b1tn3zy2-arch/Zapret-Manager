// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: tauri::{AppHandle, Manager};.
use tauri::{AppHandle, Manager};

// Подключаем модули: crate::commands::resources_core::{.
use crate::commands::resources_core::{
    // Выполняем операцию: is_binary, manifest_keys_sorted, target_path, Resources.
    is_binary,
    manifest_keys_sorted,
    target_path,
    ResourcesManifest,
    ZAPRET_SUBDIR,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::resources_fs::{.
use crate::commands::resources_fs::{
    // Выполняем операцию: collect_files, copy_entries, emit_progress, CopyEntry, .
    collect_files,
    copy_entries,
    emit_progress,
    CopyEntry,
    STAGE_FINALIZING,
    STAGE_STRATEGIES,
    // Выполняем операцию: STAGE_ZAPRET,.
    STAGE_ZAPRET,
    // Закрываем блок.
};
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;

// Объявляем функцию app_dir.
pub fn app_dir(app: &AppHandle) -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = app
        // Выполняем операцию: .path().
        .path()
        // Выполняем операцию: .app_data_dir().
        .app_data_dir()
        // Выполняем операцию: .map_err(|error| crate::error::AppError::custom(format!.
        .map_err(|error| crate::error::AppError::custom(format!("Нет папки данных: {error}")))?;

    // Проверяем условие: !dir.exists() {.
    if !dir.exists() {
        // Выполняем операцию: std::fs::create_dir_all(&dir)?;.
        std::fs::create_dir_all(&dir)?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(dir).
    Ok(dir)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn copy_zapret_tree(app: &AppHandle, resource.
pub async fn copy_zapret_tree(app: &AppHandle, resources: &Path, target: &Path) -> AppResult<u64> {
    // Объявляем переменную src .
    let src = resources.join(ZAPRET_SUBDIR);

    // Проверяем условие: !src.is_dir() {.
    if !src.is_dir() {
        // Выполняем операцию: tracing::warn!("Папка zapret в ресурсах не найдена: {}".
        tracing::warn!("Папка zapret в ресурсах не найдена: {}", src.display());

        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную entries .
    let entries = collect_files(&src, target)?;

    // Копируются только отсутствующие файлы. Если перезаписывать
    // всё подряд, пользовательские правки стратегий и списков
    // затирались бы до того, как умное обновление успело их
    // распознать: после распаковки хеш совпадает с манифестом, и
    // файл выглядит нетронутым.
    // Объявляем переменную entries.
    let entries: Vec<CopyEntry> = entries
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|entry| !entry.target.exists()).
        .filter(|entry| !entry.target.exists())
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: copy_entries(&entries, STAGE_ZAPRET, &mut |percent, nam.
    copy_entries(&entries, STAGE_ZAPRET, &mut |percent, name| {
        // Выполняем операцию: emit_progress(app, STAGE_ZAPRET, percent, name);.
        emit_progress(app, STAGE_ZAPRET, percent, name);
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Закрываем блок.
}

// Выполняем операцию: pub async fn copy_configs_tree(app: &AppHandle, resourc.
pub async fn copy_configs_tree(app: &AppHandle, resources: &Path, target: &Path) -> AppResult<u64> {
    // Объявляем переменную src .
    let src = resources.join("configs");

    // Проверяем условие: !src.is_dir() {.
    if !src.is_dir() {
        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную entries .
    let entries = collect_files(&src, target)?;

    // Выполняем операцию: copy_entries(&entries, STAGE_STRATEGIES, &mut |percent,.
    copy_entries(&entries, STAGE_STRATEGIES, &mut |percent, name| {
        // Выполняем операцию: emit_progress(app, STAGE_STRATEGIES, percent, name);.
        emit_progress(app, STAGE_STRATEGIES, percent, name);
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Закрываем блок.
}

// Объявляем функцию app_version.
pub fn app_version(app: &AppHandle) -> String {
    // Выполняем операцию: app.package_info().version.to_string().
    app.package_info().version.to_string()
    // Закрываем блок.
}

// Объявляем функцию user_owned.
pub fn user_owned(key: &str) -> bool {
    // Выполняем операцию: key.starts_with("zapret/lists/") || key.starts_with("za.
    key.starts_with("zapret/lists/") || key.starts_with("zapret/outlast/")
    // Закрываем блок.
}

// Объявляем функцию always_overwrite.
fn always_overwrite(key: &str) -> bool {
    // Выполняем операцию: is_binary(key).
    is_binary(key)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn smart_update(.
pub async fn smart_update(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: manifest: &ResourcesManifest,.
    manifest: &ResourcesManifest,
    // Выполняем операцию: resources: &Path,.
    resources: &Path,
    // Выполняем операцию: target: &Path,.
    target: &Path,
    // Закрываем выражение или коллекцию.
) -> AppResult<(usize, usize)> {
    // Объявляем переменную backup .
    let backup = crate::commands::resources_core::create_backup_dir(
        // Выполняем операцию: target.parent().unwrap_or(Path::new(".")),.
        target.parent().unwrap_or(Path::new(".")),
        // Закрываем выражение или коллекцию.
    )?;
    // Объявляем переменную backed_up .
    let backed_up = crate::commands::resources_core::backup_user_files(target, &backup)?;

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Умное обновление ресурсов: бэкап {} файлов в {}",.
        "Умное обновление ресурсов: бэкап {} файлов в {}",
        // Выполняем операцию: backed_up,.
        backed_up,
        // Выполняем операцию: backup.display().
        backup.display() // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную keys .
    let keys = manifest_keys_sorted(manifest);
    // Объявляем переменную added .
    let mut added = 0usize;
    // Объявляем переменную skipped .
    let mut skipped = 0usize;

    // Перебираем элементы коллекции.
    for key in keys {
        // Проверяем условие: user_owned(&key) {.
        if user_owned(&key) {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(expected) .
        let Some(expected) = manifest.files.get(&key) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную Ok(destination) .
        let Ok(destination) = target_path(target, &key) else {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную relative .
        let relative = Path::new(&key)
            // Выполняем операцию: .strip_prefix("zapret").
            .strip_prefix("zapret")
            // Выполняем операцию: .unwrap_or(Path::new(&key));.
            .unwrap_or(Path::new(&key));
        // Объявляем переменную source .
        let source = resources.join("zapret").join(relative);

        // Проверяем условие: !source.is_file() {.
        if !source.is_file() {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную user_edited .
        let user_edited = destination.is_file()
            // Выполняем операцию: && !crate::commands::resources_core::verify_file_hash(&.
            && !crate::commands::resources_core::verify_file_hash(&destination, expected);

        // Проверяем условие: user_edited && !always_overwrite(&key) {.
        if user_edited && !always_overwrite(&key) {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(parent) = destination.parent() {.
        if let Some(parent) = destination.parent() {
            // Выполняем операцию: tokio::fs::create_dir_all(parent).await?;.
            tokio::fs::create_dir_all(parent).await?;
            // Закрываем блок.
        }

        // Объявляем переменную input .
        let mut input = tokio::fs::File::open(&source).await?;
        // Объявляем переменную output .
        let mut output = tokio::fs::File::create(&destination).await?;
        // Выполняем операцию: tokio::io::copy(&mut input, &mut output).await?;.
        tokio::io::copy(&mut input, &mut output).await?;
        // Выполняем операцию: added += 1;.
        added += 1;
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = app;
    // Выполняем операцию: emit_progress(app, STAGE_FINALIZING, 100, "готово");.
    emit_progress(app, STAGE_FINALIZING, 100, "готово");

    // Выполняем операцию: Ok((added, skipped)).
    Ok((added, skipped))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "resources_update_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
