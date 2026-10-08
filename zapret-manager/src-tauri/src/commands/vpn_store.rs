use std::path::{Path, PathBuf};

use zeroize::Zeroizing;

use crate::commands::vpn::VpnConfigInfo;
use crate::commands::vpn_config::{ParsedConfig, parse_config, tunnel_name};
use crate::commands::vpn_wireguard::now_secs;
use crate::error::{AppError, AppResult};
use crate::security::paths::safe_filename;
use crate::security::rate_limit::check_file_io;
use crate::security::{ensure_size, MAX_VPN_CONF_BYTES};

pub const VPN_DIR: &str = "vpn";
pub const CONFIGS_DIR: &str = "configs";
pub const CONFIG_EXTENSION: &str = "conf";

pub fn app_data_dir() -> AppResult<PathBuf> {
    let Ok(dir) = std::env::var("APPDATA") else {
        return Err(AppError::custom("Переменная APPDATA не найдена"));
    };

    let path = PathBuf::from(dir).join("com.zapretmanager.app");

    if !path.exists() {
        std::fs::create_dir_all(&path)?;
    }

    Ok(path)
}

pub fn configs_dir() -> AppResult<PathBuf> {
    let dir = app_data_dir()?.join(VPN_DIR).join(CONFIGS_DIR);

    if !dir.exists() {
        std::fs::create_dir_all(&dir)?;
    }

    Ok(dir)
}

pub fn info_from_file(path: &Path, imported_at: u64) -> AppResult<VpnConfigInfo> {
    let content = std::fs::read_to_string(path)?;
    let ParsedConfig {
        address,
        dns,
        endpoint,
        allowed_ips,
        ..
    } = parse_config(&content)?;

    Ok(VpnConfigInfo {
        id: tunnel_name(path),
        name: tunnel_name(path),
        path: path.to_string_lossy().to_string(),
        endpoint,
        address,
        dns,
        allowed_ips,
        size: std::fs::metadata(path).map(|meta| meta.len()).unwrap_or(0),
        imported_at,
    })
}

pub fn config_files() -> Vec<PathBuf> {
    match configs_dir() {
        Ok(dir) => config_files_in(&dir),
        Err(_) => Vec::new(),
    }
}

pub fn config_files_in(dir: &Path) -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return Vec::new();
    };

    let mut files: Vec<PathBuf> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.extension()
                .and_then(|value| value.to_str())
                .is_some_and(|value| value.eq_ignore_ascii_case(CONFIG_EXTENSION))
        })
        .collect();

    files.sort();

    files
}

pub fn find_config(config_id: &str) -> AppResult<PathBuf> {
    config_files()
        .into_iter()
        .find(|path| tunnel_name(path) == config_id)
        .ok_or_else(|| AppError::custom("Конфиг VPN не найден"))
}

pub fn import_config(source_path: &str) -> AppResult<VpnConfigInfo> {
    import_config_into(&configs_dir()?, source_path)
}

pub fn import_config_into(dir: &Path, source_path: &str) -> AppResult<VpnConfigInfo> {
    check_file_io("vpn-import")?;

    let source = PathBuf::from(source_path);

    if !source.is_file() {
        return Err(AppError::custom("Файл конфига не найден"));
    }

    ensure_size(&source, MAX_VPN_CONF_BYTES, "VPN конфиг")?;

    let raw = Zeroizing::new(std::fs::read(&source)?);
    let content = String::from_utf8_lossy(raw.as_slice()).to_string();

    parse_config(&content)
        .map_err(|error| AppError::custom(format!("Невалидный WireGuard конфиг: {error}")))?;
    drop(content);
    drop(raw);

    let file_name = source
        .file_name()
        .map(|name| name.to_os_string())
        .ok_or_else(|| AppError::custom("У файла конфига нет имени"))?;
    let safe_name = safe_filename(&file_name.to_string_lossy())?;
    let target = dir.join(safe_name);

    if source.canonicalize().ok() != target.canonicalize().ok() {
        std::fs::copy(&source, &target)?;
    }

    let info = info_from_file(&target, now_secs() * 1000)?;
    tracing::info!("Импортирован VPN конфиг: {}", info.name);

    Ok(info)
}

pub fn list_configs_from(dir: &Path) -> Vec<VpnConfigInfo> {
    config_files_in(dir)
        .into_iter()
        .filter_map(|path| info_from_file(&path, now_secs() * 1000).ok())
        .collect()
}

pub fn remove_config_from(dir: &Path, id: &str) -> bool {
    let Some(path) = config_files_in(dir)
        .into_iter()
        .find(|path| tunnel_name(path) == id)
    else {
        return false;
    };

    if std::fs::remove_file(&path).is_err() {
        return false;
    }

    tracing::info!("Удалён VPN конфиг: {id}");

    true
}

pub fn list_configs() -> AppResult<Vec<VpnConfigInfo>> {
    Ok(list_configs_from(&configs_dir()?))
}

pub fn remove_config(id: &str) -> AppResult<bool> {
    Ok(remove_config_from(&configs_dir()?, id))
}

#[cfg(test)]
#[path = "vpn_store_tests.rs"]
mod tests;