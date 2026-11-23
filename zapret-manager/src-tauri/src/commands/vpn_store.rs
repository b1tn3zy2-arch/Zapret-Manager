// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: zeroize::Zeroizing;.
use zeroize::Zeroizing;

// Подключаем модули: crate::commands::vpn::VpnConfigInfo;.
use crate::commands::vpn::VpnConfigInfo;
// Подключаем модули: crate::commands::vpn_config::{parse_config, tunnel_name.
use crate::commands::vpn_config::{parse_config, tunnel_name, ParsedConfig};
// Подключаем модули: crate::commands::vpn_wireguard::now_secs;.
use crate::commands::vpn_wireguard::now_secs;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::paths::safe_filename;.
use crate::security::paths::safe_filename;
// Подключаем модули: crate::security::rate_limit::check_file_io;.
use crate::security::rate_limit::check_file_io;
// Подключаем модули: crate::security::{ensure_size, MAX_VPN_CONF_BYTES};.
use crate::security::{ensure_size, MAX_VPN_CONF_BYTES};

// Объявляем константу VPN_DIR.
pub const VPN_DIR: &str = "vpn";
// Объявляем константу CONFIGS_DIR.
pub const CONFIGS_DIR: &str = "configs";
// Объявляем константу CONFIG_EXTENSION.
pub const CONFIG_EXTENSION: &str = "conf";

// Объявляем функцию app_data_dir.
pub fn app_data_dir() -> AppResult<PathBuf> {
    // Объявляем переменную Ok(dir) .
    let Ok(dir) = std::env::var("APPDATA") else {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Переменная APPDATA не найдена"));
        // Закрываем блок.
    };

    // Объявляем переменную path .
    let path = PathBuf::from(dir).join("com.zapretmanager.app");

    // Проверяем условие: !path.exists() {.
    if !path.exists() {
        // Выполняем операцию: std::fs::create_dir_all(&path)?;.
        std::fs::create_dir_all(&path)?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(path).
    Ok(path)
    // Закрываем блок.
}

// Объявляем функцию configs_dir.
pub fn configs_dir() -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = app_data_dir()?.join(VPN_DIR).join(CONFIGS_DIR);

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

// Объявляем функцию info_from_file.
pub fn info_from_file(path: &Path, imported_at: u64) -> AppResult<VpnConfigInfo> {
    // Объявляем переменную content .
    let content = std::fs::read_to_string(path)?;
    // Объявляем переменную ParsedConfig {.
    let ParsedConfig {
        // Выполняем операцию: address,.
        address,
        // Выполняем операцию: dns,.
        dns,
        // Выполняем операцию: endpoint,.
        endpoint,
        // Выполняем операцию: allowed_ips,.
        allowed_ips,
        // Выполняем операцию: ...
        ..
    // Закрываем блок.
    } = parse_config(&content)?;

    // Выполняем операцию: Ok(VpnConfigInfo {.
    Ok(VpnConfigInfo {
        // Выполняем операцию: id: tunnel_name(path),.
        id: tunnel_name(path),
        // Выполняем операцию: name: tunnel_name(path),.
        name: tunnel_name(path),
        // Выполняем операцию: path: path.to_string_lossy().to_string(),.
        path: path.to_string_lossy().to_string(),
        // Выполняем операцию: endpoint,.
        endpoint,
        // Выполняем операцию: address,.
        address,
        // Выполняем операцию: dns,.
        dns,
        // Выполняем операцию: allowed_ips,.
        allowed_ips,
        // Выполняем операцию: size: std::fs::metadata(path).map(|meta| meta.len()).un.
        size: std::fs::metadata(path).map(|meta| meta.len()).unwrap_or(0),
        // Выполняем операцию: imported_at,.
        imported_at,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию config_files.
pub fn config_files() -> Vec<PathBuf> {
    // Выбираем вариант по значению.
    match configs_dir() {
        // Выполняем операцию: Ok(dir) => config_files_in(&dir),.
        Ok(dir) => config_files_in(&dir),
        // Выполняем операцию: Err(_) => Vec::new(),.
        Err(_) => Vec::new(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию config_files_in.
pub fn config_files_in(dir: &Path) -> Vec<PathBuf> {
    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(dir) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную files.
    let mut files: Vec<PathBuf> = entries
        // Выполняем операцию: .flatten().
        .flatten()
        // Выполняем операцию: .map(|entry| entry.path()).
        .map(|entry| entry.path())
        // Выполняем операцию: .filter(|path| {.
        .filter(|path| {
            // Выполняем операцию: path.extension().
            path.extension()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .is_some_and(|value| value.eq_ignore_ascii_case(CONFIG_.
                .is_some_and(|value| value.eq_ignore_ascii_case(CONFIG_EXTENSION))
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: files.sort();.
    files.sort();

    // Выполняем операцию: files.
    files
    // Закрываем блок.
}

// Объявляем функцию find_config.
pub fn find_config(config_id: &str) -> AppResult<PathBuf> {
    // Выполняем операцию: config_files().
    config_files()
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .find(|path| tunnel_name(path) == config_id).
        .find(|path| tunnel_name(path) == config_id)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Конфиг VPN не найден").
        .ok_or_else(|| AppError::custom("Конфиг VPN не найден"))
    // Закрываем блок.
}

// Объявляем функцию import_config.
pub fn import_config(source_path: &str) -> AppResult<VpnConfigInfo> {
    // Выполняем операцию: import_config_into(&configs_dir()?, source_path).
    import_config_into(&configs_dir()?, source_path)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем функцию import_config_text_into.
pub fn import_config_text_into(dir: &Path, text: &str, stamp: u64) -> AppResult<VpnConfigInfo> {
    // Выполняем операцию: check_file_io("vpn-import")?;.
    check_file_io("vpn-import")?;

    // Проверяем условие: text.trim().is_empty() {.
    if text.trim().is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Буфер обмена пуст"));
        // Закрываем блок.
    }

    // Проверяем условие: text.len() as u64 > MAX_VPN_CONF_BYTES {.
    if text.len() as u64 > MAX_VPN_CONF_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Конфиг больше {MAX_VPN_CONF_BYTES} байт".
            "Конфиг больше {MAX_VPN_CONF_BYTES} байт" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: parse_config(text).
    parse_config(text)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Невалидный W.
        .map_err(|error| AppError::custom(format!("Невалидный WireGuard конфиг: {error}")))?;

    // Объявляем переменную safe_name .
    let safe_name = safe_filename(&pasted_config_name(text))?;
    // Объявляем переменную target .
    let target = dir.join(safe_name);

    // Выполняем операцию: std::fs::create_dir_all(dir)?;.
    std::fs::create_dir_all(dir)?;
    // Выполняем операцию: std::fs::write(&target, Zeroizing::new(text.as_bytes()..
    std::fs::write(&target, Zeroizing::new(text.as_bytes().to_vec()))?;

    // Объявляем переменную info .
    let info = info_from_file(&target, stamp * 1000)?;
    // Выполняем операцию: tracing::info!("Импортирован VPN конфиг из буфера обмен.
    tracing::info!("Импортирован VPN конфиг из буфера обмена: {}", info.name);

    // Выполняем операцию: Ok(info).
    Ok(info)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем функцию pasted_config_name.
pub fn pasted_config_name(text: &str) -> String {
    // Объявляем переменную label .
    let label = parse_config(text)
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|config| {.
        .and_then(|config| {
            // Выполняем операцию: config.
            config
                // Выполняем операцию: .address.
                .address
                // Выполняем операцию: .first().
                .first()
                // Выполняем операцию: .map(|address| address.split('/').next().unwrap_or(addr.
                .map(|address| address.split('/').next().unwrap_or(address).to_string())
            // Закрываем блок.
        })
        // Выполняем операцию: .filter(|value| !value.is_empty()).
        .filter(|value| !value.is_empty())
        // Выполняем операцию: .unwrap_or_else(|| "config".to_string());.
        .unwrap_or_else(|| "config".to_string());

    // Объявляем переменную safe .
    let safe = label.replace(['.', ':', ' '], "_");

    // Выполняем операцию: format!("pasted-{}-{}.conf", safe, now_secs()).
    format!("pasted-{}-{}.conf", safe, now_secs())
    // Закрываем блок.
}

// Объявляем функцию import_config_into.
pub fn import_config_into(dir: &Path, source_path: &str) -> AppResult<VpnConfigInfo> {
    // Выполняем операцию: check_file_io("vpn-import")?;.
    check_file_io("vpn-import")?;

    // Объявляем переменную source .
    let source = PathBuf::from(source_path);

    // Проверяем условие: !source.is_file() {.
    if !source.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Файл конфига не найден"));
        // Закрываем блок.
    }

    // Выполняем операцию: ensure_size(&source, MAX_VPN_CONF_BYTES, "VPN конфиг")?.
    ensure_size(&source, MAX_VPN_CONF_BYTES, "VPN конфиг")?;

    // Объявляем переменную raw .
    let raw = Zeroizing::new(std::fs::read(&source)?);
    // Объявляем переменную content .
    let content = String::from_utf8_lossy(raw.as_slice()).to_string();

    // Выполняем операцию: parse_config(&content).
    parse_config(&content)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Невалидный W.
        .map_err(|error| AppError::custom(format!("Невалидный WireGuard конфиг: {error}")))?;
    // Выполняем операцию: drop(content);.
    drop(content);
    // Выполняем операцию: drop(raw);.
    drop(raw);

    // Объявляем переменную file_name .
    let file_name = source
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .map(|name| name.to_os_string()).
        .map(|name| name.to_os_string())
        // Выполняем операцию: .ok_or_else(|| AppError::custom("У файла конфига нет им.
        .ok_or_else(|| AppError::custom("У файла конфига нет имени"))?;
    // Объявляем переменную safe_name .
    let safe_name = safe_filename(&file_name.to_string_lossy())?;
    // Объявляем переменную target .
    let target = dir.join(safe_name);

    // Проверяем условие: source.canonicalize().ok() != target.canonicalize(.
    if source.canonicalize().ok() != target.canonicalize().ok() {
        // Выполняем операцию: std::fs::copy(&source, &target)?;.
        std::fs::copy(&source, &target)?;
        // Закрываем блок.
    }

    // Объявляем переменную info .
    let info = info_from_file(&target, now_secs() * 1000)?;
    // Выполняем операцию: tracing::info!("Импортирован VPN конфиг: {}", info.name.
    tracing::info!("Импортирован VPN конфиг: {}", info.name);

    // Выполняем операцию: Ok(info).
    Ok(info)
    // Закрываем блок.
}

// Объявляем функцию list_configs_from.
pub fn list_configs_from(dir: &Path) -> Vec<VpnConfigInfo> {
    // Выполняем операцию: config_files_in(dir).
    config_files_in(dir)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_map(|path| info_from_file(&path, now_secs() * 1.
        .filter_map(|path| info_from_file(&path, now_secs() * 1000).ok())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию remove_config_from.
pub fn remove_config_from(dir: &Path, id: &str) -> bool {
    // Объявляем переменную Some(path) .
    let Some(path) = config_files_in(dir)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .find(|path| tunnel_name(path) == id).
        .find(|path| tunnel_name(path) == id)
    // Выполняем операцию: else {.
    else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Проверяем условие: std::fs::remove_file(&path).is_err() {.
    if std::fs::remove_file(&path).is_err() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Удалён VPN конфиг: {id}");.
    tracing::info!("Удалён VPN конфиг: {id}");

    // Выполняем операцию: true.
    true
    // Закрываем блок.
}

// Объявляем функцию list_configs.
pub fn list_configs() -> AppResult<Vec<VpnConfigInfo>> {
    // Выполняем операцию: Ok(list_configs_from(&configs_dir()?)).
    Ok(list_configs_from(&configs_dir()?))
    // Закрываем блок.
}

// Объявляем функцию remove_config.
pub fn remove_config(id: &str) -> AppResult<bool> {
    // Выполняем операцию: Ok(remove_config_from(&configs_dir()?, id)).
    Ok(remove_config_from(&configs_dir()?, id))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_store_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
