// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::commands::injector_text::{.
use crate::commands::injector_text::{
    // Выполняем операцию: append_marker_section, extract_marker_entries, read_exi.
    append_marker_section,
    extract_marker_entries,
    read_existing_entries,
    remove_marker_section,
    // Закрываем блок.
};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу VERSION_FILE_NAME.
pub const VERSION_FILE_NAME: &str = ".version";
// Объявляем константу CHECK_UPDATES_FLAG.
pub const CHECK_UPDATES_FLAG: &str = "utils/check_updates.enabled";

// Объявляем константу MERGEABLE_EXTENSIONS.
const MERGEABLE_EXTENSIONS: [&str; 2] = ["txt", "bat"];
// Объявляем константу MAX_ARCHIVE_ENTRIES.
const MAX_ARCHIVE_ENTRIES: usize = 5000;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру InstallReport.
pub struct InstallReport {
    // Выполняем операцию: pub version: String,.
    pub version: String,
    // Выполняем операцию: pub files: usize,.
    pub files: usize,
    // Выполняем операцию: pub preserved_entries: usize,.
    pub preserved_entries: usize,
    // Выполняем операцию: pub backup_path: String,.
    pub backup_path: String,
    // Выполняем операцию: pub check_updates_disabled: bool,.
    pub check_updates_disabled: bool,
    // Закрываем блок.
}

// Объявляем функцию strip_single_root.
fn strip_single_root(names: &[String]) -> Option<String> {
    // Объявляем переменную roots.
    let roots: std::collections::BTreeSet<String> = names
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter_map(|name| name.split(['/', '\\']).next()).
        .filter_map(|name| name.split(['/', '\\']).next())
        // Выполняем операцию: .filter(|part| !part.is_empty()).
        .filter(|part| !part.is_empty())
        // Выполняем операцию: .map(|part| part.to_string()).
        .map(|part| part.to_string())
        // Выполняем операцию: .collect();.
        .collect();

    // Проверяем условие: roots.len() == 1 {.
    if roots.len() == 1 {
        // Выполняем операцию: roots.into_iter().next().
        roots.into_iter().next()
    // Закрываем блок.
    } else {
        // Выполняем операцию: None.
        None
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию extract_archive.
pub fn extract_archive(archive: &Path, dest: &Path) -> AppResult<usize> {
    // Объявляем переменную file .
    let file = std::fs::File::open(archive)?;
    // Объявляем переменную zip .
    let mut zip = zip::ZipArchive::new(file)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Архив не отк.
        .map_err(|error| AppError::custom(format!("Архив не открывается: {error}")))?;

    // Проверяем условие: zip.len() > MAX_ARCHIVE_ENTRIES {.
    if zip.len() > MAX_ARCHIVE_ENTRIES {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Слишком много файлов в архиве"));
        // Закрываем блок.
    }

    // Объявляем переменную names.
    let names: Vec<String> = (0..zip.len())
        // Выполняем операцию: .filter_map(|index| {.
        .filter_map(|index| {
            // Выполняем операцию: zip.by_index(index).
            zip.by_index(index)
                // Выполняем операцию: .ok().
                .ok()
                // Выполняем операцию: .map(|entry| entry.name().to_string()).
                .map(|entry| entry.name().to_string())
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную root .
    let root = strip_single_root(&names);
    // Объявляем переменную extracted .
    let mut extracted = 0usize;

    // Выполняем операцию: std::fs::create_dir_all(dest)?;.
    std::fs::create_dir_all(dest)?;

    // Перебираем элементы коллекции.
    for index in 0..zip.len() {
        // Объявляем переменную entry .
        let mut entry = zip
            // Выполняем операцию: .by_index(index).
            .by_index(index)
            // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?;.
            .map_err(|error| AppError::custom(error.to_string()))?;

        // Объявляем переменную Some(safe) .
        let Some(safe) = entry.enclosed_name() else {
            // Выполняем операцию: tracing::warn!("Пропущен небезопасный путь в архиве");.
            tracing::warn!("Пропущен небезопасный путь в архиве");
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную relative .
        let relative = match &root {
            // Выполняем операцию: Some(root) => {.
            Some(root) => {
                // Объявляем переменную full .
                let full = safe.to_string_lossy().replace('\\', "/");
                // Объявляем переменную prefix .
                let prefix = format!("{root}/");

                // Выполняем операцию: PathBuf::from(full.strip_prefix(&prefix).unwrap_or(&ful.
                PathBuf::from(full.strip_prefix(&prefix).unwrap_or(&full))
                // Закрываем блок.
            }
            // Выполняем операцию: None => safe,.
            None => safe,
            // Закрываем блок.
        };

        // Объявляем переменную out_path .
        let out_path = dest.join(&relative);

        // Проверяем условие: entry.is_dir() {.
        if entry.is_dir() {
            // Выполняем операцию: std::fs::create_dir_all(&out_path)?;.
            std::fs::create_dir_all(&out_path)?;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(parent) = out_path.parent() {.
        if let Some(parent) = out_path.parent() {
            // Выполняем операцию: std::fs::create_dir_all(parent)?;.
            std::fs::create_dir_all(parent)?;
            // Закрываем блок.
        }

        // Объявляем переменную out .
        let mut out = std::fs::File::create(&out_path)?;
        // Выполняем операцию: std::io::copy(&mut entry, &mut out)?;.
        std::io::copy(&mut entry, &mut out)?;
        // Выполняем операцию: extracted += 1;.
        extracted += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Распаковано файлов: {extracted}");.
    tracing::info!("Распаковано файлов: {extracted}");

    // Выполняем операцию: Ok(extracted).
    Ok(extracted)
    // Закрываем блок.
}

// Объявляем функцию merge_file.
pub fn merge_file(source: &Path, target: &Path) -> AppResult<usize> {
    // Объявляем переменную extension .
    let extension = source
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_lowercase();.
        .to_lowercase();

    // Проверяем условие: !MERGEABLE_EXTENSIONS.contains(&extension.as_str().
    if !MERGEABLE_EXTENSIONS.contains(&extension.as_str()) {
        // Выполняем операцию: std::fs::copy(source, target)?;.
        std::fs::copy(source, target)?;

        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную new_content .
    let new_content = std::fs::read_to_string(source)?;

    // Проверяем условие: !target.exists() {.
    if !target.exists() {
        // Выполняем операцию: std::fs::write(target, &new_content)?;.
        std::fs::write(target, &new_content)?;

        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную old_content .
    let old_content = std::fs::read_to_string(target)?;
    // Объявляем переменную marked .
    let marked = extract_marker_entries(&old_content);

    // Проверяем условие: marked.is_empty() {.
    if marked.is_empty() {
        // Выполняем операцию: std::fs::write(target, &new_content)?;.
        std::fs::write(target, &new_content)?;

        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Объявляем переменную base .
    let base = remove_marker_section(&old_content);
    // Объявляем переменную kept.
    let kept: Vec<String> = read_existing_entries(&base).into_iter().collect();
    // Объявляем переменную preserved.
    let preserved: Vec<String> = marked
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|entry| !kept.contains(entry)).
        .filter(|entry| !kept.contains(entry))
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную merged .
    let merged = append_marker_section(
        // Выполняем операцию: &new_content,.
        &new_content,
        // Выполняем операцию: &preserved,.
        &preserved,
        // Выполняем операцию: "сохранено приложением Zapret Manager при обновлении",.
        "сохранено приложением Zapret Manager при обновлении",
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: std::fs::write(target, &merged)?;.
    std::fs::write(target, &merged)?;

    // Выполняем операцию: Ok(preserved.len()).
    Ok(preserved.len())
    // Закрываем блок.
}

// Объявляем функцию disable_upstream_updater.
fn disable_upstream_updater(dir: &Path) -> bool {
    // Объявляем переменную flag .
    let flag = dir.join(CHECK_UPDATES_FLAG);

    // Выполняем операцию: flag.exists() && std::fs::remove_file(&flag).is_ok().
    flag.exists() && std::fs::remove_file(&flag).is_ok()
    // Закрываем блок.
}

// Объявляем функцию install_tree.
pub fn install_tree(source: &Path, target: &Path, report: &mut InstallReport) -> AppResult<usize> {
    // Проверяем условие: !target.exists() {.
    if !target.exists() {
        // Выполняем операцию: std::fs::create_dir_all(target)?;.
        std::fs::create_dir_all(target)?;
        // Закрываем блок.
    }

    // Объявляем переменную copied .
    let mut copied = 0usize;

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(source)?.flatten() {
        // Объявляем переменную from .
        let from = entry.path();
        // Объявляем переменную to .
        let to = target.join(entry.file_name());

        // Выполняем операцию: copied += if from.is_dir() {.
        copied += if from.is_dir() {
            // Выполняем операцию: install_tree(&from, &to, report)?.
            install_tree(&from, &to, report)?
        // Закрываем блок.
        } else {
            // Выполняем операцию: copy_one(&from, &to, report)?.
            copy_one(&from, &to, report)?
            // Закрываем блок.
        };
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(copied).
    Ok(copied)
    // Закрываем блок.
}

// Объявляем функцию copy_one.
pub fn copy_one(source: &Path, target: &Path, report: &mut InstallReport) -> AppResult<usize> {
    // Выбираем вариант по значению.
    match merge_file(source, target) {
        // Выполняем операцию: Ok(preserved) => {.
        Ok(preserved) => {
            // Выполняем операцию: report.preserved_entries += preserved;.
            report.preserved_entries += preserved;
            // Выполняем операцию: Ok(1).
            Ok(1)
            // Закрываем блок.
        }
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Не удалось объединить {}: {error}", sou.
            tracing::warn!("Не удалось объединить {}: {error}", source.display());
            // Выполняем операцию: std::fs::copy(source, target)?;.
            std::fs::copy(source, target)?;

            // Выполняем операцию: Ok(1).
            Ok(1)
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию collect_installed.
pub fn collect_installed(root: &Path, base: &Path, out: &mut Vec<String>) -> AppResult<()> {
    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(root)?.flatten() {
        // Объявляем переменную path .
        let path = entry.path();

        // Проверяем условие: entry.
        if entry
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .to_string_lossy().
            .to_string_lossy()
            // Выполняем операцию: .eq_ignore_ascii_case("backup").
            .eq_ignore_ascii_case("backup")
        // Выполняем операцию: {.
        {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: path.is_dir() {.
        if path.is_dir() {
            // Выполняем операцию: collect_installed(&path, base, out)?;.
            collect_installed(&path, base, out)?;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Ok(relative) .
        let Ok(relative) = path.strip_prefix(base) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Выполняем операцию: out.push(relative.to_string_lossy().replace('\\', "/")).
        out.push(relative.to_string_lossy().replace('\\', "/"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию install_archive.
pub fn install_archive(
    // Выполняем операцию: archive: &Path,.
    archive: &Path,
    // Выполняем операцию: dir: &Path,.
    dir: &Path,
    // Выполняем операцию: staging: &Path,.
    staging: &Path,
    // Выполняем операцию: version: &str,.
    version: &str,
    // Выполняем операцию: backup: &Path,.
    backup: &Path,
    // Закрываем выражение или коллекцию.
) -> AppResult<InstallReport> {
    // Выполняем операцию: extract_archive(archive, staging)?;.
    extract_archive(archive, staging)?;

    // Объявляем переменную report .
    let mut report = InstallReport {
        // Выполняем операцию: version: version.to_string(),.
        version: version.to_string(),
        // Выполняем операцию: backup_path: backup.to_string_lossy().to_string(),.
        backup_path: backup.to_string_lossy().to_string(),
        // Выполняем операцию: ..InstallReport::default().
        ..InstallReport::default() // Закрываем блок.
    };

    // Объявляем переменную installed .
    let mut installed = Vec::new();
    // Выполняем операцию: collect_installed(staging, staging, &mut installed)?;.
    collect_installed(staging, staging, &mut installed)?;
    // Выполняем операцию: crate::commands::updater_manifest::write_manifest(backu.
    crate::commands::updater_manifest::write_manifest(backup, &installed)?;

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(staging)?.flatten() {
        // Объявляем переменную from .
        let from = entry.path();
        // Объявляем переменную to .
        let to = dir.join(entry.file_name());

        // Выполняем операцию: report.files += if from.is_dir() {.
        report.files += if from.is_dir() {
            // Выполняем операцию: install_tree(&from, &to, &mut report)?.
            install_tree(&from, &to, &mut report)?
        // Закрываем блок.
        } else {
            // Выполняем операцию: copy_one(&from, &to, &mut report)?.
            copy_one(&from, &to, &mut report)?
            // Закрываем блок.
        };
        // Закрываем блок.
    }

    // Выполняем операцию: report.check_updates_disabled = disable_upstream_update.
    report.check_updates_disabled = disable_upstream_updater(dir);
    // Выполняем операцию: crate::commands::updater::write_version(dir, version)?;.
    crate::commands::updater::write_version(dir, version)?;

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Обновление установлено: {version}, файлов {}, сохранен.
        "Обновление установлено: {version}, файлов {}, сохранено записей {}",
        // Выполняем операцию: report.files,.
        report.files,
        // Выполняем операцию: report.preserved_entries.
        report.preserved_entries // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(report).
    Ok(report)
    // Закрываем блок.
}

// Объявляем функцию staging_dir.
pub fn staging_dir() -> PathBuf {
    // Выполняем операцию: std::env::temp_dir().join("zapret-manager").join("stagi.
    std::env::temp_dir().join("zapret-manager").join("staging")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "updater_install_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
