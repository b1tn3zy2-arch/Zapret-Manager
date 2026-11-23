// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};
// Подключаем модули: std::process::{Child, Command};.
use std::process::{Child, Command};
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: serde::Deserialize;.
use serde::Deserialize;
// Подключаем модули: tauri::{AppHandle, Emitter};.
use tauri::{AppHandle, Emitter};

// Подключаем модули: crate::commands::resources_core::{hash_bytes, verify_fi.
use crate::commands::resources_core::{hash_bytes, verify_file_hash};
// Подключаем модули: crate::commands::resources_fs::{emit_progress, resource.
use crate::commands::resources_fs::{emit_progress, resources_dir, STAGE_VPN};
// Подключаем модули: crate::commands::vpn_store::app_data_dir;.
use crate::commands::vpn_store::app_data_dir;
// Подключаем модули: crate::commands::vpn_subscription::SubscriptionServer;.
use crate::commands::vpn_subscription::SubscriptionServer;
// Подключаем модули: crate::commands::vpn_xray_config::build_config;.
use crate::commands::vpn_xray_config::build_config;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Подключаем модули: std::os::windows::process::CommandExt;.
use std::os::windows::process::CommandExt;

// Подключаем модули: crate::winapi_helpers::CREATE_NO_WINDOW;.
use crate::winapi_helpers::CREATE_NO_WINDOW;
// Объявляем константу CORE_DIR.
const CORE_DIR: &str = "vpn-core";
// Объявляем константу CORE_EXE.
const CORE_EXE: &str = "xray.exe";
// Объявляем константу CORE_DATA.
const CORE_DATA: &str = "geoip.dat";
// Объявляем константу CONFIG_FILE.
const CONFIG_FILE: &str = "config.json";
// Объявляем константу DEFAULT_SOCKS_PORT.
pub const DEFAULT_SOCKS_PORT: u16 = 12080;
// Объявляем константу DEFAULT_HTTP_PORT.
pub const DEFAULT_HTTP_PORT: u16 = 12081;

// Объявляем константу CORE_ARCHIVE.
const CORE_ARCHIVE: &str = "xray-core.zip";

/// Встроенный архив Xray. Версия и хеши зафиксированы в репозитории,
/// поэтому первый запуск не зависит от GitHub и работает офлайн.
/// Обновление — замена архива и констант ниже одним коммитом.
// Объявляем константу BUNDLED_CORE_DIR.
const BUNDLED_CORE_DIR: &str = "vpn";
// Объявляем константу BUNDLED_CORE_ARCHIVE.
const BUNDLED_CORE_ARCHIVE: &str = "xray-core.zip";
// Объявляем константу BUNDLED_CORE_VERSION.
pub const BUNDLED_CORE_VERSION: &str = "v26.10.21";
// Объявляем константу BUNDLED_CORE_ARCHIVE_SHA256.
pub const BUNDLED_CORE_ARCHIVE_SHA256: &str =
    // Выполняем операцию: "sha256:d96ee1ed32b61f69136a4ee8019593f7144857f4dc8c410.
    "sha256:d96ee1ed32b61f69136a4ee8019593f7144857f4dc8c41069dd5faefb76ea751";
// Объявляем константу BUNDLED_CORE_EXE_SHA256.
pub const BUNDLED_CORE_EXE_SHA256: &str =
    // Выполняем операцию: "sha256:c77a00eb84fb93ae044c2d771a1cabcc033b81e487253fb.
    "sha256:c77a00eb84fb93ae044c2d771a1cabcc033b81e487253fbc35b12df6879c1e15";
// Объявляем константу BUNDLED_CORE_DATA_SHA256.
pub const BUNDLED_CORE_DATA_SHA256: &str =
    // Выполняем операцию: "sha256:cbea6088e0ba9acee4b02f89365338e5f499eb51061e1a0.
    "sha256:cbea6088e0ba9acee4b02f89365338e5f499eb51061e1a0700647da02e91b917";

/// Резервный источник на случай, если встроенный архив повреждён.
/// Версия закреплена, а не «latest»: иначе после скачивания более
/// новой сборки проверка хешей на следующем старте считала бы её
/// повреждённой и возвращала старую версию из бандла.
// Объявляем константу CORE_API_URL.
const CORE_API_URL: &str = "https://api.github.com/repos/XTLS/Xray-core/releases/tags/v26.10.21";
// Объявляем константу CORE_ASSET_NAME.
const CORE_ASSET_NAME: &str = "Xray-windows-64.zip";
/// SHA-256 исходного `Xray-windows-64.zip` из закреплённого релиза.
/// GitHub-метаданные проверяются дополнительно, но решение принимается
/// по этой константе: подмена ассета не пройдёт.
// Объявляем константу CORE_ASSET_SHA256.
const CORE_ASSET_SHA256: &str =
    // Выполняем операцию: "sha256:fc58c39ee2f2717b4c54d28d374362389e5319b20ae44ae.
    "sha256:fc58c39ee2f2717b4c54d28d374362389e5319b20ae44aea76ea45a5243ec827";
// Объявляем константу CORE_MAX_BYTES.
const CORE_MAX_BYTES: usize = 64 * 1024 * 1024;
// Объявляем константу CORE_MIN_EXE_BYTES.
const CORE_MIN_EXE_BYTES: u64 = 1024 * 1024;
// Объявляем константу CORE_MIN_DATA_BYTES.
const CORE_MIN_DATA_BYTES: u64 = 1024 * 1024;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру CoreAsset.
pub struct CoreAsset {
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub browser_download_url: String,.
    pub browser_download_url: String,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub digest: Option<String>,.
    pub digest: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру CoreRelease.
struct CoreRelease {
    // Выполняем операцию: assets: Vec<CoreAsset>,.
    assets: Vec<CoreAsset>,
    // Закрываем блок.
}

/// Ищет в релизе нужный архив и возвращает его адрес вместе с
/// хешем `sha256:...`.
// Объявляем функцию pick_core_asset.
pub fn pick_core_asset(assets: &[CoreAsset]) -> AppResult<(String, String)> {
    // Объявляем переменную asset .
    let asset = assets
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|asset| asset.name.eq_ignore_ascii_case(CORE_ASSE.
        .find(|asset| asset.name.eq_ignore_ascii_case(CORE_ASSET_NAME))
        // Выполняем операцию: .ok_or_else(|| AppError::custom(format!("В релизе Xray .
        .ok_or_else(|| AppError::custom(format!("В релизе Xray нет {CORE_ASSET_NAME}")))?;

    // Объявляем переменную digest .
    let digest = asset
        // Выполняем операцию: .digest.
        .digest
        // Выполняем операцию: .clone().
        .clone()
        // Выполняем операцию: .filter(|value| !value.trim().is_empty()).
        .filter(|value| !value.trim().is_empty())
        // Выполняем операцию: .ok_or_else(|| {.
        .ok_or_else(|| {
            // Выполняем операцию: AppError::custom(.
            AppError::custom(
                // Выполняем операцию: "GitHub не отдал хеш ядра Xray: установка без проверки .
                "GitHub не отдал хеш ядра Xray: установка без проверки целостности запрещена",
                // Закрываем выражение или коллекцию.
            )
            // Закрываем блок.
        })?;

    // Выполняем операцию: Ok((asset.browser_download_url.clone(), digest)).
    Ok((asset.browser_download_url.clone(), digest))
    // Закрываем блок.
}

/// Сверяет скачанное ядро с хешем из метаданных релиза.
// Объявляем функцию verify_core_digest.
pub fn verify_core_digest(bytes: &[u8], expected: &str) -> bool {
    // Объявляем переменную expected .
    let expected = expected.trim();

    // Проверяем условие: expected.is_empty() {.
    if expected.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: hash_bytes(bytes).eq_ignore_ascii_case(expected).
    hash_bytes(bytes).eq_ignore_ascii_case(expected)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Default)]
// Объявляем структуру XrayState.
pub struct XrayState {
    // Выполняем операцию: child: Mutex<Option<Child>>,.
    child: Mutex<Option<Child>>,
    // Выполняем операцию: active_server: Mutex<Option<String>>,.
    active_server: Mutex<Option<String>>,
    // Выполняем операцию: connected_at: Mutex<u64>,.
    connected_at: Mutex<u64>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl XrayState {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self::default().
        Self::default()
        // Закрываем блок.
    }

    // Объявляем функцию active.
    pub fn active(&self) -> Option<String> {
        // Выполняем операцию: self.active_server.
        self.active_server
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .and_then(|value| value.clone()).
            .and_then(|value| value.clone())
        // Закрываем блок.
    }

    // Объявляем функцию connected_at.
    pub fn connected_at(&self) -> u64 {
        // Выполняем операцию: self.connected_at.lock().map(|value| *value).unwrap_or(.
        self.connected_at.lock().map(|value| *value).unwrap_or(0)
        // Закрываем блок.
    }

    // Объявляем функцию is_running.
    pub fn is_running(&self) -> bool {
        // Объявляем переменную Ok(mut slot) .
        let Ok(mut slot) = self.child.lock() else {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        };

        // Объявляем переменную Some(child) .
        let Some(child) = slot.as_mut() else {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        };

        // Выбираем вариант по значению.
        match child.try_wait() {
            // Выполняем операцию: Ok(Some(_)) => {.
            Ok(Some(_)) => {
                // Выполняем операцию: drop(slot);.
                drop(slot);
                // Выполняем операцию: self.reset();.
                self.reset();
                // Выполняем операцию: false.
                false
                // Закрываем блок.
            }
            // Выполняем операцию: Ok(None) => true,.
            Ok(None) => true,
            // Выполняем операцию: Err(_) => false,.
            Err(_) => false,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию reset.
    pub fn reset(&self) {
        // Проверяем условие: let Ok(mut slot) = self.child.lock() {.
        if let Ok(mut slot) = self.child.lock() {
            // Проверяем условие: let Some(mut child) = slot.take() {.
            if let Some(mut child) = slot.take() {
                // Объявляем переменную _ .
                let _ = child.kill();
                // Объявляем переменную _ .
                let _ = child.wait();
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = self.active_server.lock() {.
        if let Ok(mut slot) = self.active_server.lock() {
            *slot = None;
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = self.connected_at.lock() {.
        if let Ok(mut slot) = self.connected_at.lock() {
            *slot = 0;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию pid.
    pub fn pid(&self) -> Option<u32> {
        // Выполняем операцию: self.child.
        self.child
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .and_then(|slot| slot.as_ref().map(|child| child.id())).
            .and_then(|slot| slot.as_ref().map(|child| child.id()))
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// При выходе из приложения процесс Xray обязан умереть. Иначе он
/// остаётся жить, а вместе с ним — системный прокси на
/// `127.0.0.1:12081`, и весь трафик приложения уходит в никуда
/// без единого признака в интерфейсе.
// Открываем реализацию типа.
impl Drop for XrayState {
    // Объявляем функцию drop.
    fn drop(&mut self) {
        // Объявляем переменную Ok(mut slot) .
        let Ok(mut slot) = self.child.lock() else {
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        };

        // Проверяем условие: let Some(mut child) = slot.take() {.
        if let Some(mut child) = slot.take() {
            // Объявляем переменную _ .
            let _ = child.kill();
            // Объявляем переменную _ .
            let _ = child.wait();
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию core_dir.
pub fn core_dir() -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = app_data_dir()?.join(CORE_DIR);

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

// Объявляем функцию core_path.
pub fn core_path() -> AppResult<PathBuf> {
    // Выполняем операцию: Ok(core_dir()?.join(CORE_EXE)).
    Ok(core_dir()?.join(CORE_EXE))
    // Закрываем блок.
}

// Объявляем функцию has_core_files.
fn has_core_files(dir: &Path) -> bool {
    // Объявляем переменную healthy .
    let healthy = |name: &str, minimum: u64| {
        // Выполняем операцию: std::fs::metadata(dir.join(name)).
        std::fs::metadata(dir.join(name))
            // Выполняем операцию: .map(|meta| meta.is_file() && meta.len() >= minimum).
            .map(|meta| meta.is_file() && meta.len() >= minimum)
            // Выполняем операцию: .unwrap_or(false).
            .unwrap_or(false)
        // Закрываем блок.
    };

    // Выполняем операцию: healthy(CORE_EXE, CORE_MIN_EXE_BYTES) && healthy(CORE_D.
    healthy(CORE_EXE, CORE_MIN_EXE_BYTES) && healthy(CORE_DATA, CORE_MIN_DATA_BYTES)
    // Закрываем блок.
}

// Объявляем функцию has_healthy_core_files.
fn has_healthy_core_files(dir: &Path) -> bool {
    // Выполняем операцию: has_core_files(dir).
    has_core_files(dir)
        // Выполняем операцию: && verify_file_hash(&dir.join(CORE_EXE), BUNDLED_CORE_E.
        && verify_file_hash(&dir.join(CORE_EXE), BUNDLED_CORE_EXE_SHA256)
        // Выполняем операцию: && verify_file_hash(&dir.join(CORE_DATA), BUNDLED_CORE_.
        && verify_file_hash(&dir.join(CORE_DATA), BUNDLED_CORE_DATA_SHA256)
    // Закрываем блок.
}

/// Ядро считается установленным только вместе с `geoip.dat`: без него
/// Xray завершается с кодом 23 на первом же запуске.
// Объявляем функцию core_installed.
pub fn core_installed() -> bool {
    // Выполняем операцию: core_dir().map(|dir| has_core_files(&dir)).unwrap_or(fa.
    core_dir().map(|dir| has_core_files(&dir)).unwrap_or(false)
    // Закрываем блок.
}

/// Проверка полноценной пригодности ядра, включая хеши. Используется
/// при старте и подключении: файл нужного размера всё ещё может быть
/// повреждён. Статус в интерфейсе вызывает более дешёвую проверку.
// Объявляем функцию core_healthy.
pub fn core_healthy() -> bool {
    // Выполняем операцию: core_dir().
    core_dir()
        // Выполняем операцию: .map(|dir| has_healthy_core_files(&dir)).
        .map(|dir| has_healthy_core_files(&dir))
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

// Объявляем функцию find_core_in.
pub fn find_core_in(dir: &Path) -> Option<PathBuf> {
    // Объявляем переменную entries .
    let entries = std::fs::read_dir(dir).ok()?;

    // Перебираем элементы коллекции.
    for entry in entries.flatten() {
        // Объявляем переменную path .
        let path = entry.path();

        // Проверяем условие: path.is_file().
        if path.is_file()
            // Выполняем операцию: && path.
            && path
                // Выполняем операцию: .file_name().
                .file_name()
                // Выполняем операцию: .and_then(|name| name.to_str()).
                .and_then(|name| name.to_str())
                // Выполняем операцию: .is_some_and(|name| name.eq_ignore_ascii_case(CORE_EXE).
                .is_some_and(|name| name.eq_ignore_ascii_case(CORE_EXE))
        // Выполняем операцию: {.
        {
            // Возвращаем результат из функции.
            return Some(path);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию write_config.
pub fn write_config(server: &SubscriptionServer) -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = core_dir()?;
    // Объявляем переменную config .
    let config = build_config(server, DEFAULT_SOCKS_PORT, DEFAULT_HTTP_PORT)?;
    // Объявляем переменную path .
    let path = dir.join(CONFIG_FILE);

    // Выполняем операцию: std::fs::write(&path, serde_json::to_string_pretty(&con.
    std::fs::write(&path, serde_json::to_string_pretty(&config)?)?;

    // Выполняем операцию: Ok(path).
    Ok(path)
    // Закрываем блок.
}

// Объявляем функцию spawn_core.
pub fn spawn_core(config: &Path) -> AppResult<Child> {
    // Объявляем переменную exe .
    let exe = core_path()?;

    // Проверяем условие: !exe.is_file() {.
    if !exe.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Ядро Xray не установлено"));
        // Закрываем блок.
    }

    // Объявляем переменную child .
    let child = Command::new(&exe)
        // Выполняем операцию: .arg("run").
        .arg("run")
        // Выполняем операцию: .arg("-c").
        .arg("-c")
        // Выполняем операцию: .arg(config).
        .arg(config)
        // Выполняем операцию: .current_dir(core_dir()?).
        .current_dir(core_dir()?)
        // Выполняем операцию: .creation_flags(CREATE_NO_WINDOW).
        .creation_flags(CREATE_NO_WINDOW)
        // Выполняем операцию: .spawn().
        .spawn()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ядро не запу.
        .map_err(|error| AppError::custom(format!("Ядро не запустилось: {error}")))?;

    // Выполняем операцию: Ok(child).
    Ok(child)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn start(state: &XrayState, server: &Subscrip.
pub async fn start(state: &XrayState, server: &SubscriptionServer, now: u64) -> AppResult<u32> {
    // Объявляем переменную config .
    let config = write_config(server)?;
    // Объявляем переменную child .
    let mut child = spawn_core(&config)?;

    // Ядру нужно время, чтобы поднять слушатели. Пауза асинхронная:
    // синхронный sleep здесь замораживал интерфейс на всё время подключения.
    // Выполняем операцию: tokio::time::sleep(std::time::Duration::from_millis(900.
    tokio::time::sleep(std::time::Duration::from_millis(900)).await;

    // Проверяем условие: let Ok(Some(status)) = child.try_wait() {.
    if let Ok(Some(status)) = child.try_wait() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Ядро завершилось сразу, код {:?}",.
            "Ядро завершилось сразу, код {:?}",
            // Выполняем операцию: status.code().
            status.code() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную pid .
    let pid = child.id();

    // Проверяем условие: let Ok(mut slot) = state.child.lock() {.
    if let Ok(mut slot) = state.child.lock() {
        *slot = Some(child);
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = state.active_server.lock() {.
    if let Ok(mut slot) = state.active_server.lock() {
        *slot = Some(server.id.clone());
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = state.connected_at.lock() {.
    if let Ok(mut slot) = state.connected_at.lock() {
        *slot = now;
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Xray запущен, pid {pid}, сервер {}", se.
    tracing::info!("Xray запущен, pid {pid}, сервер {}", server.name);

    // Выполняем операцию: Ok(pid).
    Ok(pid)
    // Закрываем блок.
}

/// Распаковывает Xray из встроенного архива.
///
/// Возвращает `Ok(false)`, если архива нет или он повреждён: это не
/// ошибка первого запуска, а сигнал скачать ядро с GitHub. Ошибки
/// чтения/распаковки намеренно не пробрасываются наверх, иначе
/// недоступный VPN ломал бы и обычный DPI-режим.
// Выполняем операцию: pub async fn ensure_bundled_core(app: &AppHandle) -> Ap.
pub async fn ensure_bundled_core(app: &AppHandle) -> AppResult<bool> {
    // Проверяем условие: core_healthy() {.
    if core_healthy() {
        // Возвращаем результат из функции.
        return Ok(true);
        // Закрываем блок.
    }

    // Проверяем условие: core_installed() {.
    if core_installed() {
        // Выполняем операцию: tracing::warn!("Ядро Xray повреждено, восстанавливаю из.
        tracing::warn!("Ядро Xray повреждено, восстанавливаю из встроенного архива");
        // Закрываем блок.
    }

    // Объявляем переменную archive .
    let archive = resources_dir(app)?
        // Выполняем операцию: .join(BUNDLED_CORE_DIR).
        .join(BUNDLED_CORE_DIR)
        // Выполняем операцию: .join(BUNDLED_CORE_ARCHIVE);.
        .join(BUNDLED_CORE_ARCHIVE);

    // Проверяем условие: !archive.is_file() {.
    if !archive.is_file() {
        // Выполняем операцию: tracing::warn!("Встроенное ядро Xray не найдено: {}", a.
        tracing::warn!("Встроенное ядро Xray не найдено: {}", archive.display());

        // Возвращаем результат из функции.
        return Ok(false);
        // Закрываем блок.
    }

    // Выполняем операцию: emit_progress(app, STAGE_VPN, 5, CORE_EXE);.
    emit_progress(app, STAGE_VPN, 5, CORE_EXE);

    // Объявляем переменную bytes .
    let bytes = match tokio::fs::read(&archive).await {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Встроенное ядро Xray не прочитано: {err.
            tracing::warn!("Встроенное ядро Xray не прочитано: {error}");

            // Возвращаем результат из функции.
            return Ok(false);
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Проверяем условие: !verify_core_digest(&bytes, BUNDLED_CORE_ARCHIVE_S.
    if !verify_core_digest(&bytes, BUNDLED_CORE_ARCHIVE_SHA256) {
        // Выполняем операцию: tracing::warn!(.
        tracing::warn!(
            // Выполняем операцию: "Хеш встроенного архива Xray не совпал: {}",.
            "Хеш встроенного архива Xray не совпал: {}",
            // Выполняем операцию: hash_bytes(&bytes).
            hash_bytes(&bytes) // Закрываем выражение или коллекцию.
        );

        // Возвращаем результат из функции.
        return Ok(false);
        // Закрываем блок.
    }

    // Объявляем переменную dir .
    let dir = core_dir()?;
    // Объявляем переменную staged .
    let staged = dir.join(BUNDLED_CORE_ARCHIVE);

    // Объявляем переменную _ .
    let _ = app.emit("vpn-core-progress", "unpacking");

    // Проверяем условие: let Err(error) = tokio::fs::write(&staged, &bytes).
    if let Err(error) = tokio::fs::write(&staged, &bytes).await {
        // Выполняем операцию: tracing::warn!("Встроенный архив Xray не сохранён: {err.
        tracing::warn!("Встроенный архив Xray не сохранён: {error}");

        // Возвращаем результат из функции.
        return Ok(false);
        // Закрываем блок.
    }

    // Выполняем операцию: emit_progress(app, STAGE_VPN, 30, CORE_EXE);.
    emit_progress(app, STAGE_VPN, 30, CORE_EXE);

    // Объявляем переменную staged_for_task .
    let staged_for_task = staged.clone();
    // Объявляем переменную dir_for_task .
    let dir_for_task = dir.clone();

    // Объявляем переменную extracted .
    let extracted = tokio::task::spawn_blocking(move || {
        // Объявляем переменную extraction .
        let extraction =
            // Выполняем операцию: crate::commands::updater_install::extract_archive(&stag.
            crate::commands::updater_install::extract_archive(&staged_for_task, &dir_for_task);
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&staged_for_task);

        // Объявляем переменную count .
        let count = extraction?;
        // Объявляем переменную target .
        let target = dir_for_task.join(CORE_EXE);

        // Проверяем условие: !has_core_files(&dir_for_task) {.
        if !has_core_files(&dir_for_task) {
            // Возвращаем результат из функции.
            return Ok::<bool, AppError>(false);
            // Закрываем блок.
        }

        // Проверяем условие: !verify_file_hash(&target, BUNDLED_CORE_EXE_SHA256.
        if !verify_file_hash(&target, BUNDLED_CORE_EXE_SHA256)
            // Выполняем операцию: || !verify_file_hash(&dir_for_task.join(CORE_DATA), BUN.
            || !verify_file_hash(&dir_for_task.join(CORE_DATA), BUNDLED_CORE_DATA_SHA256)
        // Выполняем операцию: {.
        {
            // Выполняем операцию: tracing::warn!("Хеш распакованного ядра Xray не совпал,.
            tracing::warn!("Хеш распакованного ядра Xray не совпал, файл удалён");
            // Объявляем переменную _ .
            let _ = std::fs::remove_file(&target);

            // Возвращаем результат из функции.
            return Ok(false);
            // Закрываем блок.
        }

        // Выполняем операцию: tracing::info!(.
        tracing::info!(
            // Выполняем операцию: "Встроенное ядро Xray {} распаковано ({count} файлов)",.
            "Встроенное ядро Xray {} распаковано ({count} файлов)",
            // Выполняем операцию: BUNDLED_CORE_VERSION.
            BUNDLED_CORE_VERSION // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: Ok(true).
        Ok(true)
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ядро Xray не.
    .map_err(|error| AppError::custom(format!("Ядро Xray не распаковано: {error}")))?;

    // Объявляем переменную ready .
    let ready = extracted.unwrap_or_else(|error| {
        // Выполняем операцию: tracing::warn!("Встроенное ядро Xray не распаковано: {e.
        tracing::warn!("Встроенное ядро Xray не распаковано: {error}");

        // Выполняем операцию: false.
        false
        // Закрываем блок.
    });

    // Проверяем условие: ready {.
    if ready {
        // Выполняем операцию: emit_progress(app, STAGE_VPN, 100, CORE_EXE);.
        emit_progress(app, STAGE_VPN, 100, CORE_EXE);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(ready).
    Ok(ready)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn download_core() -> AppResult<PathBuf> {.
pub async fn download_core() -> AppResult<PathBuf> {
    // Объявляем переменную target .
    let target = core_path()?;

    // Проверяем условие: core_healthy() {.
    if core_healthy() {
        // Возвращаем результат из функции.
        return Ok(target);
        // Закрываем блок.
    }

    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .connect_timeout(std::time::Duration::from_secs(10)).
        .connect_timeout(std::time::Duration::from_secs(10))
        // Выполняем операцию: .timeout(std::time::Duration::from_secs(300)).
        .timeout(std::time::Duration::from_secs(300))
        // Выполняем операцию: .user_agent("ZapretManager/0.1 (core)").
        .user_agent("ZapretManager/0.1 (core)")
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("HTTP клиент .
        .map_err(|error| AppError::custom(format!("HTTP клиент не создан: {error}")))?;

    // Сначала метаданные релиза: из них берём и адрес архива, и его
    // хеш. Качать по «latest» вслепую нельзя — это исполняемый
    // файл, запускаемый с правами администратора.
    // Объявляем переменную release.
    let release: CoreRelease = client
        // Выполняем операцию: .get(CORE_API_URL).
        .get(CORE_API_URL)
        // Выполняем операцию: .header("Accept", "application/vnd.github+json").
        .header("Accept", "application/vnd.github+json")
        // Выполняем операцию: .send().
        .send()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ядро недосту.
        .map_err(|error| AppError::custom(format!("Ядро недоступно: {error}")))?
        // Выполняем операцию: .json().
        .json()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Метаданные я.
        .map_err(|error| AppError::custom(format!("Метаданные ядра не прочитаны: {error}")))?;

    // Объявляем переменную (url, expected_digest) .
    let (url, expected_digest) = pick_core_asset(&release.assets)?;

    // Объявляем переменную response .
    let response = client
        // Выполняем операцию: .get(&url).
        .get(&url)
        // Выполняем операцию: .send().
        .send()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ядро недосту.
        .map_err(|error| AppError::custom(format!("Ядро недоступно: {error}")))?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Сервер ядра ответил {}",.
            "Сервер ядра ответил {}",
            // Выполняем операцию: response.status().as_u16().
            response.status().as_u16() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = response
        // Выполняем операцию: .bytes().
        .bytes()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Архив не про.
        .map_err(|error| AppError::custom(format!("Архив не прочитан: {error}")))?;

    // Проверяем условие: bytes.len() > CORE_MAX_BYTES {.
    if bytes.len() > CORE_MAX_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Архив ядра слишком большой"));
        // Закрываем блок.
    }

    // Проверяем условие: !verify_core_digest(&bytes, &expected_digest).
    if !verify_core_digest(&bytes, &expected_digest)
        // Выполняем операцию: || !verify_core_digest(&bytes, CORE_ASSET_SHA256).
        || !verify_core_digest(&bytes, CORE_ASSET_SHA256)
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Хеш ядра не совпал: ожидался {CORE_ASSET_SHA256}, полу.
            "Хеш ядра не совпал: ожидался {CORE_ASSET_SHA256}, получен {}",
            // Выполняем операцию: hash_bytes(&bytes).
            hash_bytes(&bytes) // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную dir .
    let dir = core_dir()?;
    // Объявляем переменную archive .
    let archive = dir.join(CORE_ARCHIVE);
    // Выполняем операцию: std::fs::write(&archive, &bytes)?;.
    std::fs::write(&archive, &bytes)?;

    // Распаковка архива (до 5000 записей) — синхронная работа,
    // уводим с рабочего потока.
    // Объявляем переменную archive_for_task .
    let archive_for_task = archive.clone();
    // Объявляем переменную dir_for_task .
    let dir_for_task = dir.clone();

    // Объявляем переменную extracted .
    let extracted = tokio::task::spawn_blocking(move || {
        // Объявляем переменную count .
        let count =
            // Выполняем операцию: crate::commands::updater_install::extract_archive(&arch.
            crate::commands::updater_install::extract_archive(&archive_for_task, &dir_for_task)?;

        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&archive_for_task);

        // Выполняем операцию: Ok::<usize, AppError>(count).
        Ok::<usize, AppError>(count)
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ядро не расп.
    .map_err(|error| AppError::custom(format!("Ядро не распаковано: {error}")))??;

    // Проверяем условие: target.is_file() && has_core_files(&dir) {.
    if target.is_file() && has_core_files(&dir) {
        // Проверяем условие: !has_healthy_core_files(&dir) {.
        if !has_healthy_core_files(&dir) {
            // Объявляем переменную _ .
            let _ = std::fs::remove_file(&target);
            // Объявляем переменную _ .
            let _ = std::fs::remove_file(dir.join(CORE_DATA));

            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "Распакованное ядро Xray не совпало с закреплённым хеше.
                "Распакованное ядро Xray не совпало с закреплённым хешем",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Выполняем операцию: tracing::info!("Ядро Xray установлено из архива ({extra.
        tracing::info!("Ядро Xray установлено из архива ({extracted} файлов)");

        // Возвращаем результат из функции.
        return Ok(target);
        // Закрываем блок.
    }

    // Проверяем условие: let Some(found) = find_core_in(&dir) {.
    if let Some(found) = find_core_in(&dir) {
        // Проверяем условие: found != target {.
        if found != target {
            // Выполняем операцию: std::fs::copy(&found, &target)?;.
            std::fs::copy(&found, &target)?;
            // Закрываем блок.
        }

        // Проверяем условие: has_healthy_core_files(&dir) {.
        if has_healthy_core_files(&dir) {
            // Выполняем операцию: tracing::info!("Ядро Xray установлено копированием из п.
            tracing::info!("Ядро Xray установлено копированием из подпапки");

            // Возвращаем результат из функции.
            return Ok(target);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Err(AppError::custom(.
    Err(AppError::custom(
        // Выполняем операцию: "В архиве ядра нет xray.exe/geoip.dat или их хеш не сов.
        "В архиве ядра нет xray.exe/geoip.dat или их хеш не совпал",
        // Закрываем выражение или коллекцию.
    ))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_xray_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
