// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: winapi::shared::minwindef::{DWORD, HKEY};.
use winapi::shared::minwindef::{DWORD, HKEY};
// Подключаем модули: winapi::shared::winerror::ERROR_SUCCESS;.
use winapi::shared::winerror::ERROR_SUCCESS;
// Подключаем модули: winapi::um::wininet::{.
use winapi::um::wininet::{
    // Выполняем операцию: InternetSetOptionW, INTERNET_OPTION_REFRESH, INTERNET_O.
    InternetSetOptionW,
    INTERNET_OPTION_REFRESH,
    INTERNET_OPTION_SETTINGS_CHANGED,
    // Закрываем блок.
};
// Подключаем модули: winapi::um::winnt::{KEY_READ, KEY_WRITE, REG_DWORD, REG.
use winapi::um::winnt::{KEY_READ, KEY_WRITE, REG_DWORD, REG_SZ};
// Подключаем модули: winapi::um::winreg::{.
use winapi::um::winreg::{
    // Выполняем операцию: RegCloseKey, RegOpenKeyExW, RegQueryValueExW, RegSetVal.
    RegCloseKey,
    RegOpenKeyExW,
    RegQueryValueExW,
    RegSetValueExW,
    HKEY_CURRENT_USER,
    // Закрываем блок.
};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу KEY_PATH.
const KEY_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Internet Settings";
// Объявляем константу PROXY_ENABLE.
const PROXY_ENABLE: &str = "ProxyEnable";
// Объявляем константу PROXY_SERVER.
const PROXY_SERVER: &str = "ProxyServer";
// Объявляем константу PROXY_OVERRIDE.
const PROXY_OVERRIDE: &str = "ProxyOverride";
// Объявляем константу DEFAULT_BYPASS.
const DEFAULT_BYPASS: &str = "<local>;localhost;127.*;10.*;172.16.*;192.168.*";

/// Хосты, которые всегда ходят напрямую.
///
/// Это адреса самой панели: через туннель они сбрасываются, потому
/// что VPN-узел до них не дотягивается. Страницу оплаты в список не
/// включаем: она идёт так же, как в браузере, — по системному
/// прокси.
// Объявляем константу DIRECT_HOSTS.
const DIRECT_HOSTS: &str = "maximavps.cloud;*.maximavps.cloud;maximacloud.online;\
*.maximacloud.online;maxima.run;*.maxima.run";

// Применяем атрибут к следующему объявлению.
#[derive(Default)]
// Объявляем структуру ProxyBackup.
pub struct ProxyBackup {
    // Выполняем операцию: enabled: Mutex<Option<u32>>,.
    enabled: Mutex<Option<u32>>,
    // Выполняем операцию: server: Mutex<Option<String>>,.
    server: Mutex<Option<String>>,
    // Выполняем операцию: bypass: Mutex<Option<String>>,.
    bypass: Mutex<Option<String>>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl ProxyBackup {
    /// Включал ли прокси именно наше приложение. Если нет, трогать
    /// системный прокси при выходе нельзя: мы бы выключили чужой.
    // Объявляем функцию has_backup.
    pub fn has_backup(&self) -> bool {
        // Выполняем операцию: self.enabled.
        self.enabled
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .map(|value| value.is_some()).
            .map(|value| value.is_some())
            // Выполняем операцию: .unwrap_or(false).
            .unwrap_or(false)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию set_system_proxy.
pub fn set_system_proxy(backup: &ProxyBackup, host: &str, port: u16) -> AppResult<()> {
    // Выполняем операцию: save_current(backup)?;.
    save_current(backup)?;

    // Объявляем переменную address .
    let address = format!("{host}:{port}");

    // Выполняем операцию: write_dword(PROXY_ENABLE, 1)?;.
    write_dword(PROXY_ENABLE, 1)?;
    // Выполняем операцию: write_string(PROXY_SERVER, &address)?;.
    write_string(PROXY_SERVER, &address)?;
    // Выполняем операцию: write_string(PROXY_OVERRIDE, &format!("{DEFAULT_BYPASS}.
    write_string(PROXY_OVERRIDE, &format!("{DEFAULT_BYPASS};{DIRECT_HOSTS}"))?;
    // Выполняем операцию: notify_change();.
    notify_change();

    // Выполняем операцию: tracing::info!("Системный прокси включён: {address}");.
    tracing::info!("Системный прокси включён: {address}");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию clear_system_proxy.
pub fn clear_system_proxy(backup: &ProxyBackup) -> AppResult<()> {
    // Объявляем переменную previous .
    let previous = backup.enabled.lock().ok().and_then(|value| *value);

    // Выбираем вариант по значению.
    match previous {
        // Выполняем операцию: Some(0) | None => {.
        Some(0) | None => {
            // Выполняем операцию: write_dword(PROXY_ENABLE, 0)?;.
            write_dword(PROXY_ENABLE, 0)?;
            // Закрываем блок.
        }
        // Выполняем операцию: Some(_) => {.
        Some(_) => {
            // Проверяем условие: let Some(server) = backup.server.lock().ok().and_t.
            if let Some(server) = backup.server.lock().ok().and_then(|value| value.clone()) {
                // Выполняем операцию: write_string(PROXY_SERVER, &server)?;.
                write_string(PROXY_SERVER, &server)?;
                // Закрываем блок.
            }

            // Проверяем условие: let Some(override_value) = backup.bypass.lock().ok.
            if let Some(override_value) = backup.bypass.lock().ok().and_then(|value| value.clone())
            // Выполняем операцию: {.
            {
                // Выполняем операцию: write_string(PROXY_OVERRIDE, &override_value)?;.
                write_string(PROXY_OVERRIDE, &override_value)?;
                // Закрываем блок.
            }

            // Выполняем операцию: write_dword(PROXY_ENABLE, 1)?;.
            write_dword(PROXY_ENABLE, 1)?;
            // Закрываем блок.
        } // Закрываем блок.
    }

    // Выполняем операцию: notify_change();.
    notify_change();

    // Проверяем условие: let Ok(mut slot) = backup.enabled.lock() {.
    if let Ok(mut slot) = backup.enabled.lock() {
        *slot = None;
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = backup.server.lock() {.
    if let Ok(mut slot) = backup.server.lock() {
        *slot = None;
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = backup.bypass.lock() {.
    if let Ok(mut slot) = backup.bypass.lock() {
        *slot = None;
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Системный прокси отключён");.
    tracing::info!("Системный прокси отключён");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Убирает системный прокси, оставшийся от прошлого запуска.
///
/// Приложение могло быть убито, не успев выключить прокси. Тогда весь
/// трафик системы — включая встроенный вебвью — идёт в порт, где
/// никто не слушает, и страницы не открываются. Мёртвый прокси,
/// оставшийся на наш адрес, убирается.
///
/// Чужой прокси не трогаем: он может быть настроен пользователем.
// Объявляем функцию clear_stale_tunnel_proxy.
pub fn clear_stale_tunnel_proxy(port: u16) -> bool {
    // Проверяем условие: read_dword(PROXY_ENABLE).unwrap_or(Some(0)) != Som.
    if read_dword(PROXY_ENABLE).unwrap_or(Some(0)) != Some(1) {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную Some(server) .
    let Some(server) = read_string(PROXY_SERVER).ok().flatten() else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Объявляем переменную stale .
    let stale = server.eq_ignore_ascii_case(&format!("127.0.0.1:{port}"))
        // Выполняем операцию: || server.eq_ignore_ascii_case(&format!("localhost:{por.
        || server.eq_ignore_ascii_case(&format!("localhost:{port}"));

    // Проверяем условие: !stale {.
    if !stale {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: write_dword(PROXY_ENABLE, 0).is_err() {.
    if write_dword(PROXY_ENABLE, 0).is_err() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: notify_change();.
    notify_change();

    // Выполняем операцию: tracing::warn!("Убран мёртвый системный прокси: {server.
    tracing::warn!("Убран мёртвый системный прокси: {server}");

    // Выполняем операцию: true.
    true
    // Закрываем блок.
}

// Объявляем функцию save_current.
fn save_current(backup: &ProxyBackup) -> AppResult<()> {
    // Объявляем переменную enabled .
    let enabled = read_dword(PROXY_ENABLE)?.unwrap_or(0);
    // Объявляем переменную server .
    let server = read_string(PROXY_SERVER)?;
    // Объявляем переменную override_value .
    let override_value = read_string(PROXY_OVERRIDE)?;

    // Проверяем условие: let Ok(mut slot) = backup.enabled.lock() {.
    if let Ok(mut slot) = backup.enabled.lock() {
        *slot = Some(enabled);
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = backup.server.lock() {.
    if let Ok(mut slot) = backup.server.lock() {
        *slot = server;
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(mut slot) = backup.bypass.lock() {.
    if let Ok(mut slot) = backup.bypass.lock() {
        *slot = override_value;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию to_wide.
fn to_wide(value: &str) -> Vec<u16> {
    // Выполняем операцию: value.encode_utf16().chain(std::iter::once(0)).collect(.
    value.encode_utf16().chain(std::iter::once(0)).collect()
    // Закрываем блок.
}

// Объявляем функцию open_key.
fn open_key(access: DWORD) -> AppResult<HKEY> {
    // Объявляем переменную path .
    let path = to_wide(KEY_PATH);
    // Объявляем переменную key.
    let mut key: HKEY = std::ptr::null_mut();
    // Объявляем переменную result .
    let result = unsafe { RegOpenKeyExW(HKEY_CURRENT_USER, path.as_ptr(), 0, access, &mut key) };

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!("Реестр недоступен, код {result}")));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(key).
    Ok(key)
    // Закрываем блок.
}

// Объявляем функцию read_dword.
fn read_dword(name: &str) -> AppResult<Option<u32>> {
    // Объявляем переменную key .
    let key = open_key(KEY_READ)?;
    // Объявляем переменную name .
    let name = to_wide(name);
    // Объявляем переменную kind.
    let mut kind: DWORD = 0;
    // Объявляем переменную data.
    let mut data: DWORD = 0;
    // Объявляем переменную size.
    let mut size: DWORD = std::mem::size_of::<DWORD>() as DWORD;
    // Объявляем переменную result .
    let result = unsafe {
        // Выполняем операцию: RegQueryValueExW(.
        RegQueryValueExW(
            // Выполняем операцию: key,.
            key,
            // Выполняем операцию: name.as_ptr(),.
            name.as_ptr(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: &mut kind,.
            &mut kind,
            // Выполняем операцию: &mut data as *mut DWORD as *mut u8,.
            &mut data as *mut DWORD as *mut u8,
            // Выполняем операцию: &mut size,.
            &mut size,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe { RegCloseKey(key) };.
    unsafe { RegCloseKey(key) };

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(Some(data)).
    Ok(Some(data))
    // Закрываем блок.
}

// Объявляем функцию read_string.
fn read_string(name: &str) -> AppResult<Option<String>> {
    // Объявляем переменную key .
    let key = open_key(KEY_READ)?;
    // Объявляем переменную name .
    let name = to_wide(name);
    // Объявляем переменную kind.
    let mut kind: DWORD = 0;
    // Объявляем переменную size.
    let mut size: DWORD = 0;
    // Объявляем переменную probe .
    let probe = unsafe {
        // Выполняем операцию: RegQueryValueExW(.
        RegQueryValueExW(
            // Выполняем операцию: key,.
            key,
            // Выполняем операцию: name.as_ptr(),.
            name.as_ptr(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: &mut kind,.
            &mut kind,
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: &mut size,.
            &mut size,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Проверяем условие: probe != ERROR_SUCCESS as i32 || size == 0 {.
    if probe != ERROR_SUCCESS as i32 || size == 0 {
        // Выполняем операцию: unsafe { RegCloseKey(key) };.
        unsafe { RegCloseKey(key) };

        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную buffer.
    let mut buffer: Vec<u16> = vec![0; (size / 2) as usize + 1];

    // Объявляем переменную result .
    let result = unsafe {
        // Выполняем операцию: RegQueryValueExW(.
        RegQueryValueExW(
            // Выполняем операцию: key,.
            key,
            // Выполняем операцию: name.as_ptr(),.
            name.as_ptr(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: &mut kind,.
            &mut kind,
            // Выполняем операцию: buffer.as_mut_ptr() as *mut u8,.
            buffer.as_mut_ptr() as *mut u8,
            // Выполняем операцию: &mut size,.
            &mut size,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe { RegCloseKey(key) };.
    unsafe { RegCloseKey(key) };

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную end .
    let end = buffer.iter().position(|item| *item == 0).unwrap_or(0);
    // Объявляем переменную text .
    let text = String::from_utf16_lossy(&buffer[..end]);

    // Выполняем операцию: Ok(Some(text)).
    Ok(Some(text))
    // Закрываем блок.
}

// Объявляем функцию write_dword.
fn write_dword(name: &str, value: u32) -> AppResult<()> {
    // Объявляем переменную key .
    let key = open_key(KEY_READ | KEY_WRITE)?;
    // Объявляем переменную name .
    let name = to_wide(name);
    // Объявляем переменную result .
    let result = unsafe {
        // Выполняем операцию: RegSetValueExW(.
        RegSetValueExW(
            // Выполняем операцию: key,.
            key,
            // Выполняем операцию: name.as_ptr(),.
            name.as_ptr(),
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: REG_DWORD,.
            REG_DWORD,
            // Выполняем операцию: &value as *const u32 as *const u8,.
            &value as *const u32 as *const u8,
            // Выполняем операцию: std::mem::size_of::<u32>() as DWORD,.
            std::mem::size_of::<u32>() as DWORD,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe { RegCloseKey(key) };.
    unsafe { RegCloseKey(key) };

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!("Прокси не записан, код {result}")));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию write_string.
fn write_string(name: &str, value: &str) -> AppResult<()> {
    // Объявляем переменную key .
    let key = open_key(KEY_READ | KEY_WRITE)?;
    // Объявляем переменную name .
    let name = to_wide(name);
    // Объявляем переменную data .
    let data = to_wide(value);
    // Объявляем переменную bytes .
    let bytes = data.len() * 2;
    // Объявляем переменную result .
    let result = unsafe {
        // Выполняем операцию: RegSetValueExW(.
        RegSetValueExW(
            // Выполняем операцию: key,.
            key,
            // Выполняем операцию: name.as_ptr(),.
            name.as_ptr(),
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: REG_SZ,.
            REG_SZ,
            // Выполняем операцию: data.as_ptr() as *const u8,.
            data.as_ptr() as *const u8,
            // Выполняем операцию: bytes as DWORD,.
            bytes as DWORD,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe { RegCloseKey(key) };.
    unsafe { RegCloseKey(key) };

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Настройка прокси не записана, код {result}".
            "Настройка прокси не записана, код {result}" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию notify_change.
fn notify_change() {
    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: InternetSetOptionW(.
        InternetSetOptionW(
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: INTERNET_OPTION_SETTINGS_CHANGED,.
            INTERNET_OPTION_SETTINGS_CHANGED,
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: 0,.
            0,
            // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: InternetSetOptionW(.
        InternetSetOptionW(
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: INTERNET_OPTION_REFRESH,.
            INTERNET_OPTION_REFRESH,
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: 0,.
            0,
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_wide_conversion.
    fn test_wide_conversion() {
        // Объявляем переменную wide .
        let wide = to_wide("abc");

        // Выполняем операцию: assert_eq!(wide, vec![97, 98, 99, 0]);.
        assert_eq!(wide, vec![97, 98, 99, 0]);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_backup_default_is_empty.
    fn test_backup_default_is_empty() {
        // Объявляем переменную backup .
        let backup = ProxyBackup::default();

        // Выполняем операцию: assert!(backup.enabled.lock().unwrap().is_none());.
        assert!(backup.enabled.lock().unwrap().is_none());
        // Выполняем операцию: assert!(backup.server.lock().unwrap().is_none());.
        assert!(backup.server.lock().unwrap().is_none());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_read_current_proxy_is_ok.
    fn test_read_current_proxy_is_ok() {
        // Выполняем операцию: assert!(read_dword(PROXY_ENABLE).is_ok());.
        assert!(read_dword(PROXY_ENABLE).is_ok());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_direct_hosts_cover_the_panel_only.
    fn test_direct_hosts_cover_the_panel_only() {
        // Панель через туннель сбрасывается, поэтому она идёт напрямую.
        // Выполняем операцию: assert!(DIRECT_HOSTS.contains("maximavps.cloud"));.
        assert!(DIRECT_HOSTS.contains("maximavps.cloud"));
        // Выполняем операцию: assert!(DIRECT_HOSTS.contains("maximacloud.online"));.
        assert!(DIRECT_HOSTS.contains("maximacloud.online"));
        // Короткий домен ссылок-подписок — тоже домен Maxima.
        // Выполняем операцию: assert!(DIRECT_HOSTS.contains("maxima.run"));.
        assert!(DIRECT_HOSTS.contains("maxima.run"));

        // Страница оплаты идёт как в браузере — по системному прокси.
        // Выполняем операцию: assert!(!DIRECT_HOSTS.contains("yoomoney.ru"));.
        assert!(!DIRECT_HOSTS.contains("yoomoney.ru"));
        // Закрываем блок.
    }
    // Закрываем блок.
}
