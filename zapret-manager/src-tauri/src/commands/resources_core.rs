// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};
// Подключаем модули: sha2::{Digest, Sha256};.
use sha2::{Digest, Sha256};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу MANIFEST_FILE.
pub const MANIFEST_FILE: &str = "manifest.json";
// Объявляем константу INIT_MARKER_FILE.
pub const INIT_MARKER_FILE: &str = ".initialized";
// Объявляем константу RESOURCES_DIR.
pub const RESOURCES_DIR: &str = "resources";
// Объявляем константу ZAPRET_SUBDIR.
pub const ZAPRET_SUBDIR: &str = "zapret";
// Объявляем константу STRATEGIES_SUBDIR.
pub const STRATEGIES_SUBDIR: &str = "strategies";
// Объявляем константу HASH_PREFIX.
pub const HASH_PREFIX: &str = "sha256:";

// Объявляем константу APP_SUBDIRS.
pub const APP_SUBDIRS: [&str; 5] = [STRATEGIES_SUBDIR, "vpn", "logs", "backups", "cache"];

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру ResourcesManifest.
pub struct ResourcesManifest {
    // Выполняем операцию: pub version: String,.
    pub version: String,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub generated_at: u64,.
    pub generated_at: u64,
    // Выполняем операцию: pub files: std::collections::HashMap<String, String>,.
    pub files: std::collections::HashMap<String, String>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl ResourcesManifest {
    // Объявляем функцию age_millis.
    pub fn age_millis(&self) -> u64 {
        // Выполняем операцию: now_millis().saturating_sub(self.generated_at).
        now_millis().saturating_sub(self.generated_at)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру InitMarker.
pub struct InitMarker {
    // Выполняем операцию: pub version: String,.
    pub version: String,
    // Выполняем операцию: pub initialized_at: u64,.
    pub initialized_at: u64,
    // Выполняем операцию: pub resources_version: String,.
    pub resources_version: String,
    // Выполняем операцию: pub strategies_count: usize,.
    pub strategies_count: usize,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Default)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру InitReport.
pub struct InitReport {
    // Выполняем операцию: pub first_run: bool,.
    pub first_run: bool,
    // Выполняем операцию: pub updated: bool,.
    pub updated: bool,
    // Выполняем операцию: pub strategies_count: usize,.
    pub strategies_count: usize,
    // Выполняем операцию: pub resources_version: String,.
    pub resources_version: String,
    // Выполняем операцию: pub extracted_bytes: u64,.
    pub extracted_bytes: u64,
    // Выполняем операцию: pub available: bool,.
    pub available: bool,
    /// Xray готов к работе: встроенное ядро распаковано или уже
    /// установлено. `false` не мешает DPI-режиму, но VPN потребует
    /// скачивания ядра.
    // Выполняем операцию: pub vpn_core_included: bool,.
    pub vpn_core_included: bool,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Default)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру IntegrityReport.
pub struct IntegrityReport {
    // Выполняем операцию: pub total: usize,.
    pub total: usize,
    // Выполняем операцию: pub missing: Vec<String>,.
    pub missing: Vec<String>,
    // Выполняем операцию: pub modified: Vec<String>,.
    pub modified: Vec<String>,
    // Выполняем операцию: pub ok: bool,.
    pub ok: bool,
    // Выполняем операцию: pub resources_version: String,.
    pub resources_version: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Default)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру RestoreReport.
pub struct RestoreReport {
    // Выполняем операцию: pub restored: usize,.
    pub restored: usize,
    // Выполняем операцию: pub skipped: usize,.
    pub skipped: usize,
    // Выполняем операцию: pub resources_version: String,.
    pub resources_version: String,
    // Закрываем блок.
}

// Объявляем функцию now_millis.
pub fn now_millis() -> u64 {
    // Выполняем операцию: std::time::SystemTime::now().
    std::time::SystemTime::now()
        // Выполняем операцию: .duration_since(std::time::UNIX_EPOCH).
        .duration_since(std::time::UNIX_EPOCH)
        // Выполняем операцию: .map(|value| value.as_millis() as u64).
        .map(|value| value.as_millis() as u64)
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию is_binary.
pub fn is_binary(name: &str) -> bool {
    // Выполняем операцию: matches!(.
    matches!(
        // Выполняем операцию: name,.
        name,
        // Выполняем операцию: "zapret/bin/winws.exe".
        "zapret/bin/winws.exe"
            // Выполняем операцию: | "zapret/bin/WinDivert.dll".
            | "zapret/bin/WinDivert.dll"
            // Выполняем операцию: | "zapret/bin/WinDivert64.sys".
            | "zapret/bin/WinDivert64.sys"
            // Выполняем операцию: | "zapret/bin/cygwin1.dll".
            | "zapret/bin/cygwin1.dll" // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Объявляем функцию hash_bytes.
pub fn hash_bytes(bytes: &[u8]) -> String {
    // Объявляем переменную hasher .
    let mut hasher = Sha256::new();
    // Выполняем операцию: hasher.update(bytes);.
    hasher.update(bytes);
    // Объявляем переменную digest .
    let digest = hasher.finalize();

    // Выполняем операцию: format!("{HASH_PREFIX}{}", hex::encode(digest)).
    format!("{HASH_PREFIX}{}", hex::encode(digest))
    // Закрываем блок.
}

// Объявляем функцию hash_file.
pub fn hash_file(path: &Path) -> AppResult<String> {
    // Объявляем переменную bytes .
    let bytes = std::fs::read(path)?;

    // Выполняем операцию: Ok(hash_bytes(&bytes)).
    Ok(hash_bytes(&bytes))
    // Закрываем блок.
}

// Объявляем функцию verify_file_hash.
pub fn verify_file_hash(path: &Path, expected: &str) -> bool {
    // Выбираем вариант по значению.
    match hash_file(path) {
        // Выполняем операцию: Ok(actual) => actual.eq_ignore_ascii_case(expected),.
        Ok(actual) => actual.eq_ignore_ascii_case(expected),
        // Выполняем операцию: Err(_) => false,.
        Err(_) => false,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию read_manifest.
pub fn read_manifest(resources: &Path) -> AppResult<ResourcesManifest> {
    // Объявляем переменную path .
    let path = resources.join(MANIFEST_FILE);
    // Объявляем переменную text .
    let text = std::fs::read_to_string(&path)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("manifest.jso.
        .map_err(|error| AppError::custom(format!("manifest.json не прочитан: {error}")))?;

    // Выполняем операцию: serde_json::from_str(&text).
    serde_json::from_str(&text)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("manifest.jso.
        .map_err(|error| AppError::custom(format!("manifest.json битый: {error}")))
    // Закрываем блок.
}

// Объявляем функцию read_marker.
pub fn read_marker(app_dir: &Path) -> AppResult<InitMarker> {
    // Объявляем переменную path .
    let path = app_dir.join(INIT_MARKER_FILE);
    // Объявляем переменную text .
    let text = std::fs::read_to_string(&path)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Маркер не пр.
        .map_err(|error| AppError::custom(format!("Маркер не прочитан: {error}")))?;

    // Выполняем операцию: serde_json::from_str(&text).map_err(|error| AppError::c.
    serde_json::from_str(&text).map_err(|error| AppError::custom(format!("Маркер битый: {error}")))
    // Закрываем блок.
}

// Объявляем функцию write_marker.
pub fn write_marker(
    // Выполняем операцию: app_dir: &Path,.
    app_dir: &Path,
    // Выполняем операцию: version: &str,.
    version: &str,
    // Выполняем операцию: resources: &ResourcesManifest,.
    resources: &ResourcesManifest,
    // Выполняем операцию: count: usize,.
    count: usize,
    // Закрываем выражение или коллекцию.
) -> AppResult<()> {
    // Объявляем переменную marker .
    let marker = InitMarker {
        // Выполняем операцию: version: version.to_string(),.
        version: version.to_string(),
        // Выполняем операцию: initialized_at: now_millis(),.
        initialized_at: now_millis(),
        // Выполняем операцию: resources_version: resources.version.clone(),.
        resources_version: resources.version.clone(),
        // Выполняем операцию: strategies_count: count,.
        strategies_count: count,
        // Закрываем блок.
    };

    // Объявляем переменную text .
    let text = serde_json::to_string_pretty(&marker)?;
    // Выполняем операцию: std::fs::write(app_dir.join(INIT_MARKER_FILE), text)?;.
    std::fs::write(app_dir.join(INIT_MARKER_FILE), text)?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию manifest_keys_sorted.
pub fn manifest_keys_sorted(manifest: &ResourcesManifest) -> Vec<String> {
    // Объявляем переменную keys.
    let mut keys: Vec<String> = manifest.files.keys().cloned().collect();
    // Выполняем операцию: keys.sort_unstable();.
    keys.sort_unstable();

    // Выполняем операцию: keys.
    keys
    // Закрываем блок.
}

// Объявляем функцию target_path.
pub fn target_path(app_dir: &Path, key: &str) -> AppResult<PathBuf> {
    // Объявляем переменную relative .
    let relative = Path::new(key);
    // Объявляем переменную has_drive .
    let has_drive = key.len() > 1 && key.as_bytes()[1] == b':';
    // Объявляем переменную rooted .
    let rooted = key.starts_with('/') || key.starts_with('\\');

    // Проверяем условие: relative.is_absolute().
    if relative.is_absolute()
        // Выполняем операцию: || has_drive.
        || has_drive
        // Выполняем операцию: || rooted.
        || rooted
        // Выполняем операцию: || relative.
        || relative
            // Выполняем операцию: .components().
            .components()
            // Выполняем операцию: .any(|part| matches!(part, std::path::Component::Parent.
            .any(|part| matches!(part, std::path::Component::ParentDir))
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Недопустимый путь в манифесте: {key}".
            "Недопустимый путь в манифесте: {key}" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную inner .
    let inner = relative.strip_prefix(ZAPRET_SUBDIR).unwrap_or(relative);

    // Выполняем операцию: Ok(app_dir.join(STRATEGIES_SUBDIR).join(inner)).
    Ok(app_dir.join(STRATEGIES_SUBDIR).join(inner))
    // Закрываем блок.
}

/// Файлы манифеста, которые действительно устанавливаются в
/// `app_data`. Остальные записи описывают содержимое бандла: их нет
/// в `%APPDATA%`, и проверка целостности установки их не видит.
// Объявляем функцию is_installed.
pub fn is_installed(key: &str) -> bool {
    // Выполняем операцию: key.starts_with("zapret/") || key.starts_with("configs/.
    key.starts_with("zapret/") || key.starts_with("configs/")
    // Закрываем блок.
}

// Объявляем функцию check_integrity.
pub fn check_integrity(manifest: &ResourcesManifest, app_dir: &Path) -> IntegrityReport {
    // Объявляем переменную missing .
    let mut missing = Vec::new();
    // Объявляем переменную modified .
    let mut modified = Vec::new();
    // Объявляем переменную keys .
    let keys = manifest_keys_sorted(manifest);
    // Объявляем переменную total .
    let mut total = 0usize;

    // Перебираем элементы коллекции.
    for key in keys {
        // Проверяем условие: !is_installed(&key) {.
        if !is_installed(&key) {
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

        // Выполняем операцию: total += 1;.
        total += 1;

        // Объявляем переменную Ok(target) .
        let Ok(target) = target_path(app_dir, &key) else {
            // Выполняем операцию: modified.push(key);.
            modified.push(key);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: !target.is_file() {.
        if !target.is_file() {
            // Выполняем операцию: missing.push(key);.
            missing.push(key);
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: !verify_file_hash(&target, expected) {.
        if !verify_file_hash(&target, expected) {
            // Выполняем операцию: modified.push(key);.
            modified.push(key);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную ok .
    let ok = missing.is_empty() && modified.is_empty();

    // Выполняем операцию: IntegrityReport {.
    IntegrityReport {
        // Выполняем операцию: total,.
        total,
        // Выполняем операцию: missing,.
        missing,
        // Выполняем операцию: modified,.
        modified,
        // Выполняем операцию: ok,.
        ok,
        // Выполняем операцию: resources_version: manifest.version.clone(),.
        resources_version: manifest.version.clone(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию create_backup_dir.
pub fn create_backup_dir(app_dir: &Path) -> AppResult<PathBuf> {
    // Объявляем переменную stamp .
    let stamp = now_millis();
    // Объявляем переменную dir .
    let dir = app_dir.join("backups").join(format!("update-{stamp}"));

    // Выполняем операцию: std::fs::create_dir_all(&dir)?;.
    std::fs::create_dir_all(&dir)?;

    // Выполняем операцию: Ok(dir).
    Ok(dir)
    // Закрываем блок.
}

// Объявляем функцию backup_user_files.
pub fn backup_user_files(app_dir: &Path, backup: &Path) -> AppResult<usize> {
    // Объявляем переменную strategies .
    let strategies = app_dir.join(STRATEGIES_SUBDIR);
    // Объявляем переменную copied .
    let mut copied = 0;

    // Проверяем условие: !strategies.is_dir() {.
    if !strategies.is_dir() {
        // Возвращаем результат из функции.
        return Ok(0);
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for entry in std::fs::read_dir(&strategies)? {
        // Объявляем переменную entry .
        let entry = entry?;
        // Объявляем переменную path .
        let path = entry.path();

        // Проверяем условие: path.extension().and_then(|value| value.to_str()) .
        if path.extension().and_then(|value| value.to_str()) != Some("bat") {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную name .
        let name = entry.file_name();
        // Выполняем операцию: std::fs::copy(&path, backup.join(name))?;.
        std::fs::copy(&path, backup.join(name))?;
        // Выполняем операцию: copied += 1;.
        copied += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(copied).
    Ok(copied)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "resources_core_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
