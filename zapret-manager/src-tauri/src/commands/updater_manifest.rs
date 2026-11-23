// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу MANIFEST_NAME.
pub const MANIFEST_NAME: &str = "installed.json";

// Объявляем функцию manifest_path.
pub fn manifest_path(backup: &Path) -> PathBuf {
    // Выполняем операцию: backup.join(MANIFEST_NAME).
    backup.join(MANIFEST_NAME)
    // Закрываем блок.
}

// Объявляем функцию sanitize.
fn sanitize(relative: &str) -> Option<PathBuf> {
    // Объявляем переменную cleaned .
    let cleaned = relative.replace('\\', "/");
    // Объявляем переменную path .
    let path = PathBuf::from(&cleaned);

    // Проверяем условие: path.as_os_str().is_empty() || path.is_absolute() .
    if path.as_os_str().is_empty() || path.is_absolute() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Проверяем условие: cleaned.split('/').any(|part| part == "..") {.
    if cleaned.split('/').any(|part| part == "..") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(path).
    Some(path)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Default, Serialize, Deserialize)]
// Объявляем структуру Manifest.
struct Manifest {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: files: Vec<String>,.
    files: Vec<String>,
    // Закрываем блок.
}

// Объявляем функцию write_manifest.
pub fn write_manifest(backup: &Path, files: &[String]) -> AppResult<()> {
    // Объявляем переменную unique.
    let mut unique: Vec<String> = Vec::with_capacity(files.len());

    // Перебираем элементы коллекции.
    for file in files {
        // Проверяем условие: !unique.contains(file) {.
        if !unique.contains(file) {
            // Выполняем операцию: unique.push(file.clone());.
            unique.push(file.clone());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную manifest .
    let manifest = Manifest { files: unique };
    // Объявляем переменную body .
    let body = serde_json::to_string_pretty(&manifest)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Манифест не .
        .map_err(|error| AppError::custom(format!("Манифест не собран: {error}")))?;

    // Выполняем операцию: std::fs::write(manifest_path(backup), body)?;.
    std::fs::write(manifest_path(backup), body)?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию read_manifest.
pub fn read_manifest(backup: &Path) -> Vec<String> {
    // Объявляем переменную Ok(body) .
    let Ok(body) = std::fs::read_to_string(manifest_path(backup)) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Выполняем операцию: serde_json::from_str::<Manifest>(&body).
    serde_json::from_str::<Manifest>(&body)
        // Выполняем операцию: .map(|manifest| manifest.files).
        .map(|manifest| manifest.files)
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию remove_installed_extras.
pub fn remove_installed_extras(backup: &Path, dir: &Path) -> usize {
    // Объявляем переменную removed .
    let mut removed = 0usize;

    // Перебираем элементы коллекции.
    for entry in read_manifest(backup) {
        // Объявляем переменную Some(relative) .
        let Some(relative) = sanitize(&entry) else {
            // Выполняем операцию: tracing::warn!("Пропущен небезопасный путь манифеста: {.
            tracing::warn!("Пропущен небезопасный путь манифеста: {entry}");
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: backup.join(&relative).exists() {.
        if backup.join(&relative).exists() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную target .
        let target = dir.join(&relative);

        // Объявляем переменную removed_ok .
        let removed_ok = if target.is_dir() {
            // Выполняем операцию: std::fs::remove_dir_all(&target).is_ok().
            std::fs::remove_dir_all(&target).is_ok()
        // Закрываем блок.
        } else {
            // Выполняем операцию: std::fs::remove_file(&target).is_ok().
            std::fs::remove_file(&target).is_ok()
            // Закрываем блок.
        };

        // Проверяем условие: removed_ok {.
        if removed_ok {
            // Выполняем операцию: removed += 1;.
            removed += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: removed > 0 {.
    if removed > 0 {
        // Выполняем операцию: tracing::info!("При откате удалено файлов обновления: {.
        tracing::info!("При откате удалено файлов обновления: {removed}");
        // Закрываем блок.
    }

    // Выполняем операцию: removed.
    removed
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "updater_manifest_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
