use std::path::{Path, PathBuf};
use std::process::{Child, Command};
use std::sync::Mutex;

use crate::commands::vpn_store::app_data_dir;
use crate::commands::vpn_subscription::SubscriptionServer;
use crate::commands::vpn_xray_config::build_config;
use crate::error::{AppError, AppResult};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

const CREATE_NO_WINDOW: u32 = 0x0800_0000;
const CORE_DIR: &str = "vpn-core";
const CORE_EXE: &str = "xray.exe";
const CONFIG_FILE: &str = "config.json";
pub const DEFAULT_SOCKS_PORT: u16 = 12080;
pub const DEFAULT_HTTP_PORT: u16 = 12081;

const CORE_DOWNLOAD_URL: &str =
    "https://github.com/XTLS/Xray-core/releases/latest/download/Xray-windows-64.zip";
const CORE_ARCHIVE: &str = "xray-core.zip";

#[derive(Default)]
pub struct XrayState {
    child: Mutex<Option<Child>>,
    active_server: Mutex<Option<String>>,
    connected_at: Mutex<u64>,
}

impl XrayState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn active(&self) -> Option<String> {
        self.active_server
            .lock()
            .ok()
            .and_then(|value| value.clone())
    }

    pub fn connected_at(&self) -> u64 {
        self.connected_at.lock().map(|value| *value).unwrap_or(0)
    }

    pub fn is_running(&self) -> bool {
        let Ok(mut slot) = self.child.lock() else {
            return false;
        };

        let Some(child) = slot.as_mut() else {
            return false;
        };

        match child.try_wait() {
            Ok(Some(_)) => {
                drop(slot);
                self.reset();
                false
            }
            Ok(None) => true,
            Err(_) => false,
        }
    }

    pub fn reset(&self) {
        if let Ok(mut slot) = self.child.lock() {
            if let Some(mut child) = slot.take() {
                let _ = child.kill();
                let _ = child.wait();
            }
        }

        if let Ok(mut slot) = self.active_server.lock() {
            *slot = None;
        }

        if let Ok(mut slot) = self.connected_at.lock() {
            *slot = 0;
        }
    }

    pub fn pid(&self) -> Option<u32> {
        self.child
            .lock()
            .ok()
            .and_then(|slot| slot.as_ref().map(|child| child.id()))
    }
}

pub fn core_dir() -> AppResult<PathBuf> {
    let dir = app_data_dir()?.join(CORE_DIR);

    if !dir.exists() {
        std::fs::create_dir_all(&dir)?;
    }

    Ok(dir)
}

pub fn core_path() -> AppResult<PathBuf> {
    Ok(core_dir()?.join(CORE_EXE))
}

pub fn core_installed() -> bool {
    core_path().map(|path| path.is_file()).unwrap_or(false)
}

pub fn find_core_in(dir: &Path) -> Option<PathBuf> {
    let entries = std::fs::read_dir(dir).ok()?;

    for entry in entries.flatten() {
        let path = entry.path();

        if path.is_file()
            && path
                .file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.eq_ignore_ascii_case(CORE_EXE))
        {
            return Some(path);
        }
    }

    None
}

pub fn write_config(server: &SubscriptionServer) -> AppResult<PathBuf> {
    let dir = core_dir()?;
    let config = build_config(server, DEFAULT_SOCKS_PORT, DEFAULT_HTTP_PORT)?;
    let path = dir.join(CONFIG_FILE);

    std::fs::write(&path, serde_json::to_string_pretty(&config)?)?;

    Ok(path)
}

pub fn spawn_core(config: &Path) -> AppResult<Child> {
    let exe = core_path()?;

    if !exe.is_file() {
        return Err(AppError::custom("Ядро Xray не установлено"));
    }

    let child = Command::new(&exe)
        .arg("run")
        .arg("-c")
        .arg(config)
        .current_dir(core_dir()?)
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|error| AppError::custom(format!("Ядро не запустилось: {error}")))?;

    Ok(child)
}

pub fn start(state: &XrayState, server: &SubscriptionServer, now: u64) -> AppResult<u32> {
    state.reset();

    let config = write_config(server)?;
    let mut child = spawn_core(&config)?;

    std::thread::sleep(std::time::Duration::from_millis(900));

    if let Ok(Some(status)) = child.try_wait() {
        return Err(AppError::custom(format!(
            "Ядро завершилось сразу, код {:?}",
            status.code()
        )));
    }

    let pid = child.id();

    if let Ok(mut slot) = state.child.lock() {
        *slot = Some(child);
    }

    if let Ok(mut slot) = state.active_server.lock() {
        *slot = Some(server.id.clone());
    }

    if let Ok(mut slot) = state.connected_at.lock() {
        *slot = now;
    }

    tracing::info!("Xray запущен, pid {pid}, сервер {}", server.name);

    Ok(pid)
}

pub async fn download_core() -> AppResult<PathBuf> {
    let target = core_path()?;

    if target.is_file() {
        return Ok(target);
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(300))
        .user_agent("ZapretManager/0.1 (core)")
        .build()
        .map_err(|error| AppError::custom(format!("HTTP клиент не создан: {error}")))?;

    let response = client
        .get(CORE_DOWNLOAD_URL)
        .send()
        .await
        .map_err(|error| AppError::custom(format!("Ядро недоступно: {error}")))?;

    if !response.status().is_success() {
        return Err(AppError::custom(format!(
            "Сервер ядра ответил {}",
            response.status().as_u16()
        )));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|error| AppError::custom(format!("Архив не прочитан: {error}")))?;

    if bytes.len() > 64 * 1024 * 1024 {
        return Err(AppError::custom("Архив ядра слишком большой"));
    }

    let dir = core_dir()?;
    let archive = dir.join(CORE_ARCHIVE);
    std::fs::write(&archive, &bytes)?;

    let extracted = crate::commands::updater_install::extract_archive(&archive, &dir)?;
    let _ = std::fs::remove_file(&archive);

    if target.is_file() {
        tracing::info!("Ядро Xray установлено из архива ({extracted} файлов)");
        return Ok(target);
    }

    if let Some(found) = find_core_in(&dir) {
        std::fs::copy(&found, &target)?;
        tracing::info!("Ядро Xray установлено копированием из подпапки");

        return Ok(target);
    }

    Err(AppError::custom("В архиве ядра нет xray.exe"))
}

#[cfg(test)]
#[path = "vpn_xray_tests.rs"]
mod tests;