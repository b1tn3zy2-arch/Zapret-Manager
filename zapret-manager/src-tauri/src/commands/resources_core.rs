use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::error::{AppError, AppResult};

pub const MANIFEST_FILE: &str = "manifest.json";
pub const INIT_MARKER_FILE: &str = ".initialized";
pub const RESOURCES_DIR: &str = "resources";
pub const ZAPRET_SUBDIR: &str = "zapret";
pub const STRATEGIES_SUBDIR: &str = "strategies";
pub const HASH_PREFIX: &str = "sha256:";

pub const APP_SUBDIRS: [&str; 5] = [
    STRATEGIES_SUBDIR,
    "vpn",
    "logs",
    "backups",
    "cache",
];

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResourcesManifest {
    pub version: String,
    #[serde(default)]
    pub generated_at: u64,
    pub files: std::collections::HashMap<String, String>,
}

impl ResourcesManifest {
    pub fn age_millis(&self) -> u64 {
        now_millis().saturating_sub(self.generated_at)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InitMarker {
    pub version: String,
    pub initialized_at: u64,
    pub resources_version: String,
    pub strategies_count: usize,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct InitReport {
    pub first_run: bool,
    pub updated: bool,
    pub strategies_count: usize,
    pub resources_version: String,
    pub extracted_bytes: u64,
    pub available: bool,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct IntegrityReport {
    pub total: usize,
    pub missing: Vec<String>,
    pub modified: Vec<String>,
    pub ok: bool,
    pub resources_version: String,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RestoreReport {
    pub restored: usize,
    pub skipped: usize,
    pub resources_version: String,
}

pub fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|value| value.as_millis() as u64)
        .unwrap_or_default()
}

pub fn is_binary(name: &str) -> bool {
    matches!(
        name,
        "zapret/bin/winws.exe"
            | "zapret/bin/WinDivert.dll"
            | "zapret/bin/WinDivert64.sys"
            | "zapret/bin/cygwin1.dll"
    )
}

pub fn hash_bytes(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let digest = hasher.finalize();

    format!("{HASH_PREFIX}{}", hex::encode(digest))
}

pub fn hash_file(path: &Path) -> AppResult<String> {
    let bytes = std::fs::read(path)?;

    Ok(hash_bytes(&bytes))
}

pub fn verify_file_hash(path: &Path, expected: &str) -> bool {
    match hash_file(path) {
        Ok(actual) => actual.eq_ignore_ascii_case(expected),
        Err(_) => false,
    }
}

pub fn read_manifest(resources: &Path) -> AppResult<ResourcesManifest> {
    let path = resources.join(MANIFEST_FILE);
    let text = std::fs::read_to_string(&path)
        .map_err(|error| AppError::custom(format!("manifest.json не прочитан: {error}")))?;

    serde_json::from_str(&text)
        .map_err(|error| AppError::custom(format!("manifest.json битый: {error}")))
}

pub fn read_marker(app_dir: &Path) -> AppResult<InitMarker> {
    let path = app_dir.join(INIT_MARKER_FILE);
    let text = std::fs::read_to_string(&path)
        .map_err(|error| AppError::custom(format!("Маркер не прочитан: {error}")))?;

    serde_json::from_str(&text)
        .map_err(|error| AppError::custom(format!("Маркер битый: {error}")))
}

pub fn write_marker(
    app_dir: &Path,
    version: &str,
    resources: &ResourcesManifest,
    count: usize,
) -> AppResult<()> {
    let marker = InitMarker {
        version: version.to_string(),
        initialized_at: now_millis(),
        resources_version: resources.version.clone(),
        strategies_count: count,
    };

    let text = serde_json::to_string_pretty(&marker)?;
    std::fs::write(app_dir.join(INIT_MARKER_FILE), text)?;

    Ok(())
}

pub fn manifest_keys_sorted(manifest: &ResourcesManifest) -> Vec<String> {
    let mut keys: Vec<String> = manifest.files.keys().cloned().collect();
    keys.sort_unstable();

    keys
}

pub fn target_path(app_dir: &Path, key: &str) -> AppResult<PathBuf> {
    let relative = Path::new(key);
    let has_drive = key.len() > 1 && key.as_bytes()[1] == b':';
    let rooted = key.starts_with('/') || key.starts_with('\\');

    if relative.is_absolute()
        || has_drive
        || rooted
        || relative
            .components()
            .any(|part| matches!(part, std::path::Component::ParentDir))
    {
        return Err(AppError::custom(format!("Недопустимый путь в манифесте: {key}")));
    }

    let inner = relative.strip_prefix(ZAPRET_SUBDIR).unwrap_or(relative);

    Ok(app_dir.join(STRATEGIES_SUBDIR).join(inner))
}

pub fn check_integrity(manifest: &ResourcesManifest, app_dir: &Path) -> IntegrityReport {
    let mut missing = Vec::new();
    let mut modified = Vec::new();
    let keys = manifest_keys_sorted(manifest);

    for key in keys {
        let Some(expected) = manifest.files.get(&key) else {
            continue;
        };

        let Ok(target) = target_path(app_dir, &key) else {
            modified.push(key);
            continue;
        };

        if !target.is_file() {
            missing.push(key);
            continue;
        }

        if !verify_file_hash(&target, expected) {
            modified.push(key);
        }
    }

    let total = manifest.files.len();
    let ok = missing.is_empty() && modified.is_empty();

    IntegrityReport {
        total,
        missing,
        modified,
        ok,
        resources_version: manifest.version.clone(),
    }
}

pub fn create_backup_dir(app_dir: &Path) -> AppResult<PathBuf> {
    let stamp = now_millis();
    let dir = app_dir.join("backups").join(format!("update-{stamp}"));

    std::fs::create_dir_all(&dir)?;

    Ok(dir)
}

pub fn backup_user_files(app_dir: &Path, backup: &Path) -> AppResult<usize> {
    let strategies = app_dir.join(STRATEGIES_SUBDIR);
    let mut copied = 0;

    if !strategies.is_dir() {
        return Ok(0);
    }

    for entry in std::fs::read_dir(&strategies)? {
        let entry = entry?;
        let path = entry.path();

        if path.extension().and_then(|value| value.to_str()) != Some("bat") {
            continue;
        }

        let name = entry.file_name();
        std::fs::copy(&path, backup.join(name))?;
        copied += 1;
    }

    Ok(copied)
}

#[cfg(test)]
#[path = "resources_core_tests.rs"]
mod tests;