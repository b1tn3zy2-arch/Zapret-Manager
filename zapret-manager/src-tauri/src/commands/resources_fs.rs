// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: tauri::{AppHandle, Emitter};.
use tauri::{AppHandle, Emitter};
// Подключаем модули: tokio::io::{AsyncReadExt, AsyncWriteExt};.
use tokio::io::{AsyncReadExt, AsyncWriteExt};

// Подключаем модули: crate::commands::resources_core::{.
use crate::commands::resources_core::{
    // Выполняем операцию: APP_SUBDIRS, RESOURCES_DIR, STRATEGIES_SUBDIR, ZAPRET_S.
    APP_SUBDIRS,
    RESOURCES_DIR,
    STRATEGIES_SUBDIR,
    ZAPRET_SUBDIR,
    // Закрываем блок.
};
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::security::{security_denied, MAX_RESOURCE_FILE_BY.
use crate::security::{security_denied, MAX_RESOURCE_FILE_BYTES};

// Объявляем константу EVENT_PROGRESS.
pub const EVENT_PROGRESS: &str = "resource-extract-progress";
// Объявляем константу PROGRESS_THROTTLE_MS.
pub const PROGRESS_THROTTLE_MS: u64 = 100;
// Объявляем константу STAGE_ZAPRET.
pub const STAGE_ZAPRET: &str = "copying-zapret";
// Объявляем константу STAGE_STRATEGIES.
pub const STAGE_STRATEGIES: &str = "copying-strategies";
// Объявляем константу STAGE_VPN.
pub const STAGE_VPN: &str = "copying-vpn";
// Объявляем константу STAGE_FINALIZING.
pub const STAGE_FINALIZING: &str = "finalizing";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, serde::Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру InitProgress.
pub struct InitProgress {
    // Выполняем операцию: pub stage: String,.
    pub stage: String,
    // Выполняем операцию: pub percent: u8,.
    pub percent: u8,
    // Выполняем операцию: pub current_file: String,.
    pub current_file: String,
    // Закрываем блок.
}

/// Единственная точка отправки прогресса первого запуска.
///
/// Событие и имя на фронтенде должны совпадать буквально: расхождение
/// оставляло модальное окно с нулевым прогрессом на всё время распаковки.
// Объявляем функцию emit_progress.
pub fn emit_progress(app: &AppHandle, stage: &str, percent: u8, current: &str) {
    // Объявляем переменную _ .
    let _ = app.emit(
        // Выполняем операцию: EVENT_PROGRESS,.
        EVENT_PROGRESS,
        // Выполняем операцию: InitProgress {.
        InitProgress {
            // Выполняем операцию: stage: stage.to_string(),.
            stage: stage.to_string(),
            // Выполняем операцию: percent,.
            percent,
            // Выполняем операцию: current_file: current.to_string(),.
            current_file: current.to_string(),
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone)]
// Объявляем структуру CopyEntry.
pub struct CopyEntry {
    // Выполняем операцию: pub source: PathBuf,.
    pub source: PathBuf,
    // Выполняем операцию: pub target: PathBuf,.
    pub target: PathBuf,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    // Закрываем блок.
}

// Объявляем функцию resources_dir.
pub fn resources_dir(app: &tauri::AppHandle) -> AppResult<PathBuf> {
    // Объявляем переменную roots .
    let roots = resource_roots(app);

    // Перебираем элементы коллекции.
    for root in &roots {
        // Проверяем условие: root.join(ZAPRET_SUBDIR).is_dir() || root.join("ma.
        if root.join(ZAPRET_SUBDIR).is_dir() || root.join("manifest.json").is_file() {
            // Возвращаем результат из функции.
            return Ok(root.clone());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную fallback .
    let fallback = roots
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .next().
        .next()
        // Выполняем операцию: .ok_or_else(|| crate::error::AppError::custom("Папка ре.
        .ok_or_else(|| crate::error::AppError::custom("Папка ресурсов не определена"))?;

    // Выполняем операцию: Ok(fallback).
    Ok(fallback)
    // Закрываем блок.
}

// Объявляем функцию build_resource_roots.
fn build_resource_roots(
    // Выполняем операцию: resource_dir: Option<PathBuf>,.
    resource_dir: Option<PathBuf>,
    // Выполняем операцию: exe_path: Option<PathBuf>,.
    exe_path: Option<PathBuf>,
    // Выполняем операцию: allow_manifest_dir: bool,.
    allow_manifest_dir: bool,
    // Закрываем выражение или коллекцию.
) -> Vec<PathBuf> {
    // Объявляем переменную roots .
    let mut roots = Vec::new();

    // Проверяем условие: let Some(resource) = resource_dir {.
    if let Some(resource) = resource_dir {
        // Выполняем операцию: roots.push(resource.join(RESOURCES_DIR));.
        roots.push(resource.join(RESOURCES_DIR));
        // Выполняем операцию: roots.push(resource);.
        roots.push(resource);
        // Закрываем блок.
    }

    // Проверяем условие: let Some(exe) = exe_path {.
    if let Some(exe) = exe_path {
        // Проверяем условие: let Some(parent) = exe.parent() {.
        if let Some(parent) = exe.parent() {
            // Выполняем операцию: roots.push(parent.join(RESOURCES_DIR));.
            roots.push(parent.join(RESOURCES_DIR));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: allow_manifest_dir {.
    if allow_manifest_dir {
        // Выполняем операцию: roots.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).jo.
        roots.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(RESOURCES_DIR));
        // Закрываем блок.
    }

    // Выполняем операцию: roots.
    roots
    // Закрываем блок.
}

// Объявляем функцию resource_roots.
fn resource_roots(app: &tauri::AppHandle) -> Vec<PathBuf> {
    // Подключаем модули: tauri::Manager;.
    use tauri::Manager;

    // Выполняем операцию: build_resource_roots(.
    build_resource_roots(
        // Выполняем операцию: app.path().resource_dir().ok(),.
        app.path().resource_dir().ok(),
        // Выполняем операцию: std::env::current_exe().ok(),.
        std::env::current_exe().ok(),
        // Выполняем операцию: cfg!(debug_assertions),.
        cfg!(debug_assertions),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Объявляем функцию ensure_app_dirs.
pub fn ensure_app_dirs(app_dir: &Path) -> AppResult<()> {
    // Выполняем операцию: std::fs::create_dir_all(app_dir)?;.
    std::fs::create_dir_all(app_dir)?;

    // Перебираем элементы коллекции.
    for sub in APP_SUBDIRS {
        // Выполняем операцию: std::fs::create_dir_all(app_dir.join(sub))?;.
        std::fs::create_dir_all(app_dir.join(sub))?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию collect_files.
pub fn collect_files(src: &Path, dst: &Path) -> AppResult<Vec<CopyEntry>> {
    // Объявляем переменную entries .
    let mut entries = Vec::new();

    // Проверяем условие: !src.is_dir() {.
    if !src.is_dir() {
        // Возвращаем результат из функции.
        return Ok(entries);
        // Закрываем блок.
    }

    // Выполняем операцию: walk(src, dst, &mut entries)?;.
    walk(src, dst, &mut entries)?;

    // Выполняем операцию: Ok(entries).
    Ok(entries)
    // Закрываем блок.
}

// Объявляем функцию walk.
fn walk(src: &Path, dst: &Path, entries: &mut Vec<CopyEntry>) -> AppResult<()> {
    // Перебираем элементы коллекции.
    for item in std::fs::read_dir(src)? {
        // Объявляем переменную item .
        let item = item?;
        // Объявляем переменную path .
        let path = item.path();
        // Объявляем переменную name .
        let name = item.file_name();

        // Проверяем условие: path.is_dir() {.
        if path.is_dir() {
            // Выполняем операцию: walk(&path, &dst.join(name), entries)?;.
            walk(&path, &dst.join(name), entries)?;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную size .
        let size = item.metadata().map(|meta| meta.len()).unwrap_or_default();

        // Проверяем условие: size > MAX_RESOURCE_FILE_BYTES {.
        if size > MAX_RESOURCE_FILE_BYTES {
            // Возвращаем результат из функции.
            return Err(security_denied(
                // Выполняем операцию: "resource-size",.
                "resource-size",
                // Выполняем операцию: &format!("{name:?}: {size} байт при лимите {MAX_RESOURC.
                &format!("{name:?}: {size} байт при лимите {MAX_RESOURCE_FILE_BYTES}"),
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Выполняем операцию: entries.push(CopyEntry {.
        entries.push(CopyEntry {
            // Выполняем операцию: source: path,.
            source: path,
            // Выполняем операцию: target: dst.join(name),.
            target: dst.join(name),
            // Выполняем операцию: size,.
            size,
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию total_bytes.
pub fn total_bytes(entries: &[CopyEntry]) -> u64 {
    // Выполняем операцию: entries.iter().map(|entry| entry.size).sum().
    entries.iter().map(|entry| entry.size).sum()
    // Закрываем блок.
}

// Выполняем операцию: pub async fn copy_entries(.
pub async fn copy_entries(
    // Выполняем операцию: entries: &[CopyEntry],.
    entries: &[CopyEntry],
    // Выполняем операцию: stage: &str,.
    stage: &str,
    // Выполняем операцию: on_progress: &mut impl FnMut(u8, &str),.
    on_progress: &mut impl FnMut(u8, &str),
    // Закрываем выражение или коллекцию.
) -> AppResult<u64> {
    // Объявляем переменную total .
    let total = entries.len();
    // Объявляем переменную total_size .
    let total_size = total_bytes(entries);
    // Объявляем переменную copied .
    let mut copied = 0u64;
    // Объявляем переменную last_emit .
    let mut last_emit = std::time::Instant::now();

    // Перебираем элементы коллекции.
    for entry in entries.iter() {
        // Проверяем условие: let Some(parent) = entry.target.parent() {.
        if let Some(parent) = entry.target.parent() {
            // Выполняем операцию: tokio::fs::create_dir_all(parent).await?;.
            tokio::fs::create_dir_all(parent).await?;
            // Закрываем блок.
        }

        // Объявляем переменную source .
        let mut source = tokio::fs::File::open(&entry.source).await?;
        // Объявляем переменную target .
        let mut target = tokio::fs::File::create(&entry.target).await?;
        // Объявляем переменную buffer .
        let mut buffer = vec![0u8; 64 * 1024];

        // Выполняем операцию: loop {.
        loop {
            // Объявляем переменную read .
            let read = source.read(&mut buffer).await?;

            // Проверяем условие: read == 0 {.
            if read == 0 {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }

            // Выполняем операцию: target.write_all(&buffer[..read]).await?;.
            target.write_all(&buffer[..read]).await?;
            // Выполняем операцию: copied += read as u64;.
            copied += read as u64;
            // Закрываем блок.
        }

        // Выполняем операцию: target.flush().await?;.
        target.flush().await?;

        // Объявляем переменную percent .
        let percent = if total == 0 {
            // Выполняем операцию: 100.
            100
        // Закрываем блок.
        } else {
            // Выполняем операцию: ((copied * 100) / total_size).min(100) as u8.
            ((copied * 100) / total_size).min(100) as u8
            // Закрываем блок.
        };

        // Объявляем переменную name .
        let name = entry
            // Выполняем операцию: .target.
            .target
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .and_then(|value| value.to_str()).
            .and_then(|value| value.to_str())
            // Выполняем операцию: .unwrap_or_default().
            .unwrap_or_default()
            // Выполняем операцию: .to_string();.
            .to_string();

        // Проверяем условие: last_emit.elapsed().as_millis() as u64 >= PROGRESS.
        if last_emit.elapsed().as_millis() as u64 >= PROGRESS_THROTTLE_MS || percent == 100 {
            // Выполняем операцию: on_progress(percent, &name);.
            on_progress(percent, &name);
            // Выполняем операцию: last_emit = std::time::Instant::now();.
            last_emit = std::time::Instant::now();
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: total == 0 {.
    if total == 0 {
        // Выполняем операцию: on_progress(100, stage);.
        on_progress(100, stage);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(copied).
    Ok(copied)
    // Закрываем блок.
}

// Объявляем функцию count_strategies.
pub fn count_strategies(dir: &Path) -> usize {
    // Проверяем условие: !dir.is_dir() {.
    if !dir.is_dir() {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::read_dir(dir).
    std::fs::read_dir(dir)
        // Выполняем операцию: .map(|entries| {.
        .map(|entries| {
            // Выполняем операцию: entries.
            entries
                // Выполняем операцию: .flatten().
                .flatten()
                // Выполняем операцию: .filter(|entry| {.
                .filter(|entry| {
                    // Объявляем переменную path .
                    let path = entry.path();

                    // Выполняем операцию: path.extension().and_then(|value| value.to_str()) == So.
                    path.extension().and_then(|value| value.to_str()) == Some("bat")
                        // Выполняем операцию: && path.
                        && path
                            // Выполняем операцию: .file_name().
                            .file_name()
                            // Выполняем операцию: .and_then(|value| value.to_str()).
                            .and_then(|value| value.to_str())
                            // Выполняем операцию: .is_some_and(|name| !crate::commands::parser::is_exclud.
                            .is_some_and(|name| !crate::commands::parser::is_excluded(name))
                    // Закрываем блок.
                })
                // Выполняем операцию: .count().
                .count()
            // Закрываем блок.
        })
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем функцию list_bundled_bats.
pub fn list_bundled_bats(resources: &Path) -> Vec<String> {
    // Объявляем переменную dir .
    let dir = resources.join(ZAPRET_SUBDIR);

    // Проверяем условие: !dir.is_dir() {.
    if !dir.is_dir() {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Объявляем переменную names.
    let mut names: Vec<String> = std::fs::read_dir(&dir)
        // Выполняем операцию: .map(|entries| {.
        .map(|entries| {
            // Выполняем операцию: entries.
            entries
                // Выполняем операцию: .flatten().
                .flatten()
                // Выполняем операцию: .filter_map(|entry| {.
                .filter_map(|entry| {
                    // Объявляем переменную path .
                    let path = entry.path();

                    // Проверяем условие: path.extension().and_then(|value| value.to_str()) .
                    if path.extension().and_then(|value| value.to_str()) != Some("bat") {
                        // Возвращаем результат из функции.
                        return None;
                        // Закрываем блок.
                    }

                    // Выполняем операцию: entry.file_name().to_str().map(|value| value.to_string(.
                    entry.file_name().to_str().map(|value| value.to_string())
                    // Закрываем блок.
                })
                // Выполняем операцию: .collect().
                .collect()
            // Закрываем блок.
        })
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: names.sort_unstable();.
    names.sort_unstable();

    // Выполняем операцию: names.
    names
    // Закрываем блок.
}

// Объявляем функцию strategies_dir.
pub fn strategies_dir(app_dir: &Path) -> PathBuf {
    // Выполняем операцию: app_dir.join(STRATEGIES_SUBDIR).
    app_dir.join(STRATEGIES_SUBDIR)
    // Закрываем блок.
}

/// Ожидаемая папка стратегий приложения.
// Объявляем функцию expected_strategies_dir.
pub fn expected_strategies_dir(app: &tauri::AppHandle) -> AppResult<PathBuf> {
    // Объявляем переменную app_dir .
    let app_dir = crate::commands::resources::app_dir(app)?;

    // Выполняем операцию: Ok(strategies_dir(&app_dir)).
    Ok(strategies_dir(&app_dir))
    // Закрываем блок.
}

/// Проверяет, что webview передал именно папку стратегий приложения.
///
/// Команды обновления, проверки конфигов и удаления бэкапов раньше
/// принимали любой путь и могли работать с произвольным каталогом.
// Объявляем функцию validate_strategies_dir.
pub fn validate_strategies_dir(app: &tauri::AppHandle, raw: &str) -> AppResult<PathBuf> {
    // Объявляем переменную expected .
    let expected = expected_strategies_dir(app)?;
    // Объявляем переменную candidate .
    let candidate = PathBuf::from(raw.trim());

    // Проверяем условие: raw.trim().is_empty() {.
    if raw.trim().is_empty() {
        // Возвращаем результат из функции.
        return Err(crate::security::security_denied(
            // Выполняем операцию: "strategies-dir",.
            "strategies-dir",
            // Выполняем операцию: "папка стратегий не указана",.
            "папка стратегий не указана",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную normalize .
    let normalize =
        // Выполняем операцию: |path: &Path| std::fs::canonicalize(path).unwrap_or_els.
        |path: &Path| std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());

    // Проверяем условие: normalize(&candidate) != normalize(&expected) {.
    if normalize(&candidate) != normalize(&expected) {
        // Возвращаем результат из функции.
        return Err(crate::security::security_denied(
            // Выполняем операцию: "strategies-dir",.
            "strategies-dir",
            // Выполняем операцию: "путь не совпадает с папкой стратегий приложения",.
            "путь не совпадает с папкой стратегий приложения",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(expected).
    Ok(expected)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "resources_fs_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
