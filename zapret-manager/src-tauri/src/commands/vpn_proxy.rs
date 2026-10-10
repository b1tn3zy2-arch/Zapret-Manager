use std::sync::Mutex;

use winapi::shared::minwindef::{DWORD, HKEY};
use winapi::shared::winerror::ERROR_SUCCESS;
use winapi::um::wininet::{
    InternetSetOptionW, INTERNET_OPTION_REFRESH, INTERNET_OPTION_SETTINGS_CHANGED,
};
use winapi::um::winnt::{KEY_READ, KEY_WRITE, REG_DWORD, REG_SZ};
use winapi::um::winreg::{
    RegCloseKey, RegOpenKeyExW, RegQueryValueExW, RegSetValueExW, HKEY_CURRENT_USER,
};

use crate::error::{AppError, AppResult};

const KEY_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Internet Settings";
const PROXY_ENABLE: &str = "ProxyEnable";
const PROXY_SERVER: &str = "ProxyServer";
const PROXY_OVERRIDE: &str = "ProxyOverride";
const DEFAULT_BYPASS: &str = "<local>;localhost;127.*;10.*;172.16.*;192.168.*";

#[derive(Default)]
pub struct ProxyBackup {
    enabled: Mutex<Option<u32>>,
    server: Mutex<Option<String>>,
    bypass: Mutex<Option<String>>,
}

pub fn set_system_proxy(backup: &ProxyBackup, host: &str, port: u16) -> AppResult<()> {
    save_current(backup)?;

    let address = format!("{host}:{port}");

    write_dword(PROXY_ENABLE, 1)?;
    write_string(PROXY_SERVER, &address)?;
    write_string(PROXY_OVERRIDE, DEFAULT_BYPASS)?;
    notify_change();

    tracing::info!("Системный прокси включён: {address}");

    Ok(())
}

pub fn clear_system_proxy(backup: &ProxyBackup) -> AppResult<()> {
    let previous = backup.enabled.lock().ok().and_then(|value| *value);

    match previous {
        Some(0) | None => {
            write_dword(PROXY_ENABLE, 0)?;
        }
        Some(_) => {
            if let Some(server) = backup.server.lock().ok().and_then(|value| value.clone()) {
                write_string(PROXY_SERVER, &server)?;
            }

            if let Some(override_value) =
                backup.bypass.lock().ok().and_then(|value| value.clone())
            {
                write_string(PROXY_OVERRIDE, &override_value)?;
            }

            write_dword(PROXY_ENABLE, 1)?;
        }
    }

    notify_change();

    if let Ok(mut slot) = backup.enabled.lock() {
        *slot = None;
    }

    if let Ok(mut slot) = backup.server.lock() {
        *slot = None;
    }

    if let Ok(mut slot) = backup.bypass.lock() {
        *slot = None;
    }

    tracing::info!("Системный прокси отключён");

    Ok(())
}

fn save_current(backup: &ProxyBackup) -> AppResult<()> {
    let enabled = read_dword(PROXY_ENABLE)?.unwrap_or(0);
    let server = read_string(PROXY_SERVER)?;
    let override_value = read_string(PROXY_OVERRIDE)?;

    if let Ok(mut slot) = backup.enabled.lock() {
        *slot = Some(enabled);
    }

    if let Ok(mut slot) = backup.server.lock() {
        *slot = server;
    }

    if let Ok(mut slot) = backup.bypass.lock() {
        *slot = override_value;
    }

    Ok(())
}

fn to_wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

fn open_key(access: DWORD) -> AppResult<HKEY> {
    let path = to_wide(KEY_PATH);
    let mut key: HKEY = std::ptr::null_mut();
    let result = unsafe {
        RegOpenKeyExW(
            HKEY_CURRENT_USER,
            path.as_ptr(),
            0,
            access,
            &mut key,
        )
    };

    if result != ERROR_SUCCESS as i32 {
        return Err(AppError::custom(format!(
            "Реестр недоступен, код {result}"
        )));
    }

    Ok(key)
}

fn read_dword(name: &str) -> AppResult<Option<u32>> {
    let key = open_key(KEY_READ)?;
    let name = to_wide(name);
    let mut kind: DWORD = 0;
    let mut data: DWORD = 0;
    let mut size: DWORD = std::mem::size_of::<DWORD>() as DWORD;
    let result = unsafe {
        RegQueryValueExW(
            key,
            name.as_ptr(),
            std::ptr::null_mut(),
            &mut kind,
            &mut data as *mut DWORD as *mut u8,
            &mut size,
        )
    };

    unsafe { RegCloseKey(key) };

    if result != ERROR_SUCCESS as i32 {
        return Ok(None);
    }

    Ok(Some(data))
}

fn read_string(name: &str) -> AppResult<Option<String>> {
    let key = open_key(KEY_READ)?;
    let name = to_wide(name);
    let mut kind: DWORD = 0;
    let mut size: DWORD = 0;
    let probe = unsafe {
        RegQueryValueExW(
            key,
            name.as_ptr(),
            std::ptr::null_mut(),
            &mut kind,
            std::ptr::null_mut(),
            &mut size,
        )
    };

    if probe != ERROR_SUCCESS as i32 || size == 0 {
        unsafe { RegCloseKey(key) };

        return Ok(None);
    }

    let mut buffer: Vec<u16> = vec![0; (size / 2) as usize + 1];

    let result = unsafe {
        RegQueryValueExW(
            key,
            name.as_ptr(),
            std::ptr::null_mut(),
            &mut kind,
            buffer.as_mut_ptr() as *mut u8,
            &mut size,
        )
    };

    unsafe { RegCloseKey(key) };

    if result != ERROR_SUCCESS as i32 {
        return Ok(None);
    }

    let end = buffer.iter().position(|item| *item == 0).unwrap_or(0);
    let text = String::from_utf16_lossy(&buffer[..end]);

    Ok(Some(text))
}

fn write_dword(name: &str, value: u32) -> AppResult<()> {
    let key = open_key(KEY_READ | KEY_WRITE)?;
    let name = to_wide(name);
    let result = unsafe {
        RegSetValueExW(
            key,
            name.as_ptr(),
            0,
            REG_DWORD,
            &value as *const u32 as *const u8,
            std::mem::size_of::<u32>() as DWORD,
        )
    };

    unsafe { RegCloseKey(key) };

    if result != ERROR_SUCCESS as i32 {
        return Err(AppError::custom(format!(
            "Прокси не записан, код {result}"
        )));
    }

    Ok(())
}

fn write_string(name: &str, value: &str) -> AppResult<()> {
    let key = open_key(KEY_READ | KEY_WRITE)?;
    let name = to_wide(name);
    let data = to_wide(value);
    let bytes = data.len() * 2;
    let result = unsafe {
        RegSetValueExW(
            key,
            name.as_ptr(),
            0,
            REG_SZ,
            data.as_ptr() as *const u8,
            bytes as DWORD,
        )
    };

    unsafe { RegCloseKey(key) };

    if result != ERROR_SUCCESS as i32 {
        return Err(AppError::custom(format!(
            "Настройка прокси не записана, код {result}"
        )));
    }

    Ok(())
}

fn notify_change() {
    unsafe {
        InternetSetOptionW(
            std::ptr::null_mut(),
            INTERNET_OPTION_SETTINGS_CHANGED,
            std::ptr::null_mut(),
            0,
        );
        InternetSetOptionW(
            std::ptr::null_mut(),
            INTERNET_OPTION_REFRESH,
            std::ptr::null_mut(),
            0,
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wide_conversion() {
        let wide = to_wide("abc");

        assert_eq!(wide, vec![97, 98, 99, 0]);
    }

    #[test]
    fn test_backup_default_is_empty() {
        let backup = ProxyBackup::default();

        assert!(backup.enabled.lock().unwrap().is_none());
        assert!(backup.server.lock().unwrap().is_none());
    }

    #[test]
    fn test_read_current_proxy_is_ok() {
        assert!(read_dword(PROXY_ENABLE).is_ok());
    }
}