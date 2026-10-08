use std::path::{Path, PathBuf};

use tokio::io::{AsyncReadExt, AsyncWriteExt};

use crate::commands::resources_core::{
    APP_SUBDIRS, RESOURCES_DIR, STRATEGIES_SUBDIR, ZAPRET_SUBDIR,
};
use crate::error::AppResult;
use crate::security::{security_denied, MAX_RESOURCE_FILE_BYTES};

pub const EVENT_PROGRESS: &str = "resource-extract-progress";
pub const PROGRESS_THROTTLE_MS: u64 = 100;
pub const STAGE_ZAPRET: &str = "copying-zapret";
pub const STAGE_STRATEGIES: &str = "copying-strategies";
pub const STAGE_FINALIZING: &str = "finalizing";

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InitProgress {
    pub stage: String,
    pub percent: u8,
    pub current_file: String,
}

#[derive(Debug, Clone)]
pub struct CopyEntry {
    pub source: PathBuf,
    pub target: PathBuf,
    pub size: u64,
}

pub fn resources_dir(app: &tauri::AppHandle) -> AppResult<PathBuf> {
    let roots = resource_roots(app);

    for root in &roots {
        if root.join(ZAPRET_SUBDIR).is_dir() || root.join("manifest.json").is_file() {
            return Ok(root.clone());
        }
    }

    let fallback = roots
        .into_iter()
        .next()
        .ok_or_else(|| crate::error::AppError::custom("Папка ресурсов не определена"))?;

    Ok(fallback)
}

fn resource_roots(app: &tauri::AppHandle) -> Vec<PathBuf> {
    use tauri::Manager;

    let mut roots = Vec::new();

    if let Ok(resource) = app.path().resource_dir() {
        roots.push(resource.join(RESOURCES_DIR));
        roots.push(resource);
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            roots.push(parent.join(RESOURCES_DIR));
        }
    }

    roots.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(RESOURCES_DIR));

    roots
}

pub fn ensure_app_dirs(app_dir: &Path) -> AppResult<()> {
    std::fs::create_dir_all(app_dir)?;

    for sub in APP_SUBDIRS {
        std::fs::create_dir_all(app_dir.join(sub))?;
    }

    Ok(())
}

pub fn collect_files(src: &Path, dst: &Path) -> AppResult<Vec<CopyEntry>> {
    let mut entries = Vec::new();

    if !src.is_dir() {
        return Ok(entries);
    }

    walk(src, dst, &mut entries)?;

    Ok(entries)
}

fn walk(src: &Path, dst: &Path, entries: &mut Vec<CopyEntry>) -> AppResult<()> {
    for item in std::fs::read_dir(src)? {
        let item = item?;
        let path = item.path();
        let name = item.file_name();

        if path.is_dir() {
            walk(&path, &dst.join(name), entries)?;
            continue;
        }

        let size = item.metadata().map(|meta| meta.len()).unwrap_or_default();

        if size > MAX_RESOURCE_FILE_BYTES {
            return Err(security_denied(
                "resource-size",
                &format!("{name:?}: {size} байт при лимите {MAX_RESOURCE_FILE_BYTES}"),
            ));
        }

        entries.push(CopyEntry {
            source: path,
            target: dst.join(name),
            size,
        });
    }

    Ok(())
}

pub fn total_bytes(entries: &[CopyEntry]) -> u64 {
    entries.iter().map(|entry| entry.size).sum()
}

pub async fn copy_entries(
    entries: &[CopyEntry],
    stage: &str,
    on_progress: &mut impl FnMut(u8, &str),
) -> AppResult<u64> {
    let total = entries.len();
    let total_size = total_bytes(entries);
    let mut copied = 0u64;
    let mut last_emit = std::time::Instant::now();

    for entry in entries.iter() {
        if let Some(parent) = entry.target.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        let mut source = tokio::fs::File::open(&entry.source).await?;
        let mut target = tokio::fs::File::create(&entry.target).await?;
        let mut buffer = vec![0u8; 64 * 1024];

        loop {
            let read = source.read(&mut buffer).await?;

            if read == 0 {
                break;
            }

            target.write_all(&buffer[..read]).await?;
            copied += read as u64;
        }

        target.flush().await?;

        let percent = if total == 0 {
            100
        } else {
            ((copied * 100) / total_size).min(100) as u8
        };

        let name = entry
            .target
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_string();

        if last_emit.elapsed().as_millis() as u64 >= PROGRESS_THROTTLE_MS
            || percent == 100
        {
            on_progress(percent, &name);
            last_emit = std::time::Instant::now();
        }
    }

    if total == 0 {
        on_progress(100, stage);
    }

    Ok(copied)
}

pub fn count_strategies(dir: &Path) -> usize {
    if !dir.is_dir() {
        return 0;
    }

    std::fs::read_dir(dir)
        .map(|entries| {
            entries
                .flatten()
                .filter(|entry| {
                    entry.path().extension().and_then(|value| value.to_str()) == Some("bat")
                })
                .count()
        })
        .unwrap_or_default()
}

pub fn list_bundled_bats(resources: &Path) -> Vec<String> {
    let dir = resources.join(ZAPRET_SUBDIR);

    if !dir.is_dir() {
        return Vec::new();
    }

    let mut names: Vec<String> = std::fs::read_dir(&dir)
        .map(|entries| {
            entries
                .flatten()
                .filter_map(|entry| {
                    let path = entry.path();

                    if path.extension().and_then(|value| value.to_str()) != Some("bat") {
                        return None;
                    }

                    entry.file_name().to_str().map(|value| value.to_string())
                })
                .collect()
        })
        .unwrap_or_default();

    names.sort_unstable();

    names
}

pub fn strategies_dir(app_dir: &Path) -> PathBuf {
    app_dir.join(STRATEGIES_SUBDIR)
}

#[cfg(test)]
#[path = "resources_fs_tests.rs"]
mod tests;