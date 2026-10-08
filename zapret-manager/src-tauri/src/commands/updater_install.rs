use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::commands::injector_text::{
    append_marker_section, extract_marker_entries, read_existing_entries,
    remove_marker_section,
};
use crate::error::{AppError, AppResult};

pub const VERSION_FILE_NAME: &str = ".version";
pub const CHECK_UPDATES_FLAG: &str = "utils/check_updates.enabled";

const MERGEABLE_EXTENSIONS: [&str; 2] = ["txt", "bat"];
const MAX_ARCHIVE_ENTRIES: usize = 5000;

#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallReport {
    pub version: String,
    pub files: usize,
    pub preserved_entries: usize,
    pub backup_path: String,
    pub check_updates_disabled: bool,
}

fn strip_single_root(names: &[String]) -> Option<String> {
    let roots: std::collections::BTreeSet<String> = names
        .iter()
        .filter_map(|name| name.split(['/', '\\']).next())
        .filter(|part| !part.is_empty())
        .map(|part| part.to_string())
        .collect();

    if roots.len() == 1 {
        roots.into_iter().next()
    } else {
        None
    }
}

pub fn extract_archive(archive: &Path, dest: &Path) -> AppResult<usize> {
    let file = std::fs::File::open(archive)?;
    let mut zip = zip::ZipArchive::new(file)
        .map_err(|error| AppError::custom(format!("Архив не открывается: {error}")))?;

    if zip.len() > MAX_ARCHIVE_ENTRIES {
        return Err(AppError::custom("Слишком много файлов в архиве"));
    }

    let names: Vec<String> = (0..zip.len())
        .filter_map(|index| {
            zip.by_index(index)
                .ok()
                .map(|entry| entry.name().to_string())
        })
        .collect();

    let root = strip_single_root(&names);
    let mut extracted = 0usize;

    std::fs::create_dir_all(dest)?;

    for index in 0..zip.len() {
        let mut entry = zip
            .by_index(index)
            .map_err(|error| AppError::custom(error.to_string()))?;

        let Some(safe) = entry.enclosed_name() else {
            tracing::warn!("Пропущен небезопасный путь в архиве");
            continue;
        };

        let relative = match &root {
            Some(root) => {
                let full = safe.to_string_lossy().replace('\\', "/");
                let prefix = format!("{root}/");

                PathBuf::from(full.strip_prefix(&prefix).unwrap_or(&full))
            }
            None => safe,
        };

        let out_path = dest.join(&relative);

        if entry.is_dir() {
            std::fs::create_dir_all(&out_path)?;
            continue;
        }

        if let Some(parent) = out_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let mut out = std::fs::File::create(&out_path)?;
        std::io::copy(&mut entry, &mut out)?;
        extracted += 1;
    }

    tracing::info!("Распаковано файлов: {extracted}");

    Ok(extracted)
}

pub fn merge_file(source: &Path, target: &Path) -> AppResult<usize> {
    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_lowercase();

    if !MERGEABLE_EXTENSIONS.contains(&extension.as_str()) {
        std::fs::copy(source, target)?;

        return Ok(0);
    }

    let new_content = std::fs::read_to_string(source)?;

    if !target.exists() {
        std::fs::write(target, &new_content)?;

        return Ok(0);
    }

    let old_content = std::fs::read_to_string(target)?;
    let marked = extract_marker_entries(&old_content);

    if marked.is_empty() {
        std::fs::write(target, &new_content)?;

        return Ok(0);
    }

    let base = remove_marker_section(&old_content);
    let kept: Vec<String> = read_existing_entries(&base).into_iter().collect();
    let preserved: Vec<String> = marked
        .into_iter()
        .filter(|entry| !kept.contains(entry))
        .collect();

    let merged = append_marker_section(
        &new_content,
        &preserved,
        "сохранено приложением Zapret Manager при обновлении",
    );

    std::fs::write(target, &merged)?;

    Ok(preserved.len())
}

fn disable_upstream_updater(dir: &Path) -> bool {
    let flag = dir.join(CHECK_UPDATES_FLAG);

    flag.exists() && std::fs::remove_file(&flag).is_ok()
}

pub fn install_tree(
    source: &Path,
    target: &Path,
    report: &mut InstallReport,
) -> AppResult<usize> {
    if !target.exists() {
        std::fs::create_dir_all(target)?;
    }

    let mut copied = 0usize;

    for entry in std::fs::read_dir(source)?.flatten() {
        let from = entry.path();
        let to = target.join(entry.file_name());

        copied += if from.is_dir() {
            install_tree(&from, &to, report)?
        } else {
            copy_one(&from, &to, report)?
        };
    }

    Ok(copied)
}

pub fn copy_one(source: &Path, target: &Path, report: &mut InstallReport) -> AppResult<usize> {
    match merge_file(source, target) {
        Ok(preserved) => {
            report.preserved_entries += preserved;
            Ok(1)
        }
        Err(error) => {
            tracing::warn!("Не удалось объединить {}: {error}", source.display());
            std::fs::copy(source, target)?;

            Ok(1)
        }
    }
}

pub fn collect_installed(root: &Path, base: &Path, out: &mut Vec<String>) -> AppResult<()> {
    for entry in std::fs::read_dir(root)?.flatten() {
        let path = entry.path();

        if entry.file_name().to_string_lossy().eq_ignore_ascii_case("backup") {
            continue;
        }

        if path.is_dir() {
            collect_installed(&path, base, out)?;
            continue;
        }

        let Ok(relative) = path.strip_prefix(base) else {
            continue;
        };

        out.push(relative.to_string_lossy().replace('\\', "/"));
    }

    Ok(())
}

pub fn install_archive(
    archive: &Path,
    dir: &Path,
    staging: &Path,
    version: &str,
    backup: &Path,
) -> AppResult<InstallReport> {
    extract_archive(archive, staging)?;

    let mut report = InstallReport {
        version: version.to_string(),
        backup_path: backup.to_string_lossy().to_string(),
        ..InstallReport::default()
    };

    let mut installed = Vec::new();
    collect_installed(staging, staging, &mut installed)?;
    crate::commands::updater_manifest::write_manifest(backup, &installed)?;

    for entry in std::fs::read_dir(staging)?.flatten() {
        let from = entry.path();
        let to = dir.join(entry.file_name());

        report.files += if from.is_dir() {
            install_tree(&from, &to, &mut report)?
        } else {
            copy_one(&from, &to, &mut report)?
        };
    }

    report.check_updates_disabled = disable_upstream_updater(dir);
    crate::commands::updater::write_version(dir, version)?;

    tracing::info!(
        "Обновление установлено: {version}, файлов {}, сохранено записей {}",
        report.files,
        report.preserved_entries
    );

    Ok(report)
}

pub fn staging_dir() -> PathBuf {
    std::env::temp_dir().join("zapret-manager").join("staging")
}

#[cfg(test)]
#[path = "updater_install_tests.rs"]
mod tests;