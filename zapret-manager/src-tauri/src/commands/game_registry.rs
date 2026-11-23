// Подключаем модули: winapi::shared::minwindef::{DWORD, HKEY};.
use winapi::shared::minwindef::{DWORD, HKEY};
// Подключаем модули: winapi::shared::winerror::ERROR_SUCCESS;.
use winapi::shared::winerror::ERROR_SUCCESS;
// Подключаем модули: winapi::um::winnt::{KEY_READ, KEY_WOW64_32KEY, KEY_WOW6.
use winapi::um::winnt::{KEY_READ, KEY_WOW64_32KEY, KEY_WOW64_64KEY};
// Подключаем модули: winapi::um::winreg::{.
use winapi::um::winreg::{
    // Выполняем операцию: RegCloseKey, RegEnumKeyExW, RegOpenKeyExW, RegQueryValu.
    RegCloseKey,
    RegEnumKeyExW,
    RegOpenKeyExW,
    RegQueryValueExW,
    HKEY_CURRENT_USER,
    // Выполняем операцию: HKEY_LOCAL_MACHINE,.
    HKEY_LOCAL_MACHINE,
    // Закрываем блок.
};

// Объявляем константу VIEW_64.
pub const VIEW_64: DWORD = KEY_READ | KEY_WOW64_64KEY;
// Объявляем константу VIEW_32.
pub const VIEW_32: DWORD = KEY_READ | KEY_WOW64_32KEY;

// Объявляем константу UNINSTALL_KEY.
pub const UNINSTALL_KEY: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone)]
// Объявляем структуру UninstallEntry.
pub struct UninstallEntry {
    // Выполняем операцию: pub display_name: String,.
    pub display_name: String,
    // Выполняем операцию: pub install_location: Option<String>,.
    pub install_location: Option<String>,
    // Выполняем операцию: pub icon_path: Option<String>,.
    pub icon_path: Option<String>,
    // Закрываем блок.
}

// Объявляем функцию to_wide.
pub fn to_wide(value: &str) -> Vec<u16> {
    // Выполняем операцию: value.encode_utf16().chain(std::iter::once(0)).collect(.
    value.encode_utf16().chain(std::iter::once(0)).collect()
    // Закрываем блок.
}

// Объявляем функцию open_key.
pub fn open_key(hive: HKEY, subkey: &str, access: DWORD) -> Option<HKEY> {
    // Объявляем переменную path .
    let path = to_wide(subkey);
    // Объявляем переменную key.
    let mut key: HKEY = std::ptr::null_mut();
    // Объявляем переменную result .
    let result = unsafe { RegOpenKeyExW(hive, path.as_ptr(), 0, access, &mut key) };

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(key).
    Some(key)
    // Закрываем блок.
}

// Объявляем функцию query_string.
pub fn query_string(key: HKEY, name: &str) -> Option<String> {
    // Объявляем переменную value_name .
    let value_name = to_wide(name);
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
            // Выполняем операцию: value_name.as_ptr(),.
            value_name.as_ptr(),
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
        // Возвращаем результат из функции.
        return None;
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
            // Выполняем операцию: value_name.as_ptr(),.
            value_name.as_ptr(),
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

    // Проверяем условие: result != ERROR_SUCCESS as i32 {.
    if result != ERROR_SUCCESS as i32 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную end .
    let end = buffer.iter().position(|item| *item == 0).unwrap_or(0);

    // Выполняем операцию: Some(String::from_utf16_lossy(&buffer[..end])).
    Some(String::from_utf16_lossy(&buffer[..end]))
    // Закрываем блок.
}

// Объявляем функцию list_subkeys.
pub fn list_subkeys(key: HKEY) -> Vec<String> {
    // Объявляем переменную result .
    let mut result = Vec::new();
    // Объявляем переменную index .
    let mut index = 0;

    // Выполняем операцию: loop {.
    loop {
        // Объявляем переменную buffer.
        let mut buffer: Vec<u16> = vec![0; 512];
        // Объявляем переменную length.
        let mut length: DWORD = buffer.len() as DWORD;
        // Объявляем переменную result_code .
        let result_code = unsafe {
            // Выполняем операцию: RegEnumKeyExW(.
            RegEnumKeyExW(
                // Выполняем операцию: key,.
                key,
                // Выполняем операцию: index,.
                index,
                // Выполняем операцию: buffer.as_mut_ptr(),.
                buffer.as_mut_ptr(),
                // Выполняем операцию: &mut length,.
                &mut length,
                // Выполняем операцию: std::ptr::null_mut(),.
                std::ptr::null_mut(),
                // Выполняем операцию: std::ptr::null_mut(),.
                std::ptr::null_mut(),
                // Выполняем операцию: std::ptr::null_mut(),.
                std::ptr::null_mut(),
                // Выполняем операцию: std::ptr::null_mut(),.
                std::ptr::null_mut(),
                // Закрываем выражение или коллекцию.
            )
            // Закрываем блок.
        };

        // Проверяем условие: result_code != ERROR_SUCCESS as i32 {.
        if result_code != ERROR_SUCCESS as i32 {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Выполняем операцию: buffer.truncate(length as usize);.
        buffer.truncate(length as usize);
        // Выполняем операцию: result.push(String::from_utf16_lossy(&buffer));.
        result.push(String::from_utf16_lossy(&buffer));
        // Выполняем операцию: index += 1;.
        index += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию read_registry_string.
pub fn read_registry_string(hives: &[(HKEY, &str, &str)], views: &[DWORD]) -> Option<String> {
    // Перебираем элементы коллекции.
    for (hive, subkey, value) in hives {
        // Перебираем элементы коллекции.
        for view in views {
            // Объявляем переменную Some(key) .
            let Some(key) = open_key(*hive, subkey, *view) else {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            };
            // Объявляем переменную found .
            let found = query_string(key, value);

            // Выполняем операцию: unsafe { RegCloseKey(key) };.
            unsafe { RegCloseKey(key) };

            // Проверяем условие: let Some(text) = found.filter(|item| !item.trim()..
            if let Some(text) = found.filter(|item| !item.trim().is_empty()) {
                // Возвращаем результат из функции.
                return Some(text);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию uninstall_entries.
pub fn uninstall_entries() -> Vec<UninstallEntry> {
    // Объявляем переменную hives .
    let hives = [HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER];
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for hive in hives {
        // Перебираем элементы коллекции.
        for view in [VIEW_64, VIEW_32] {
            // Выполняем операцию: collect_uninstall(hive, view, &mut result);.
            collect_uninstall(hive, view, &mut result);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.sort_by(|left, right| left.display_name.cmp(&rig.
    result.sort_by(|left, right| left.display_name.cmp(&right.display_name));
    // Выполняем операцию: result.dedup_by(|left, right| left.display_name == righ.
    result.dedup_by(|left, right| left.display_name == right.display_name);

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию collect_uninstall.
fn collect_uninstall(hive: HKEY, view: DWORD, target: &mut Vec<UninstallEntry>) {
    // Объявляем переменную Some(root) .
    let Some(root) = open_key(hive, UNINSTALL_KEY, view) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Перебираем элементы коллекции.
    for name in list_subkeys(root) {
        // Объявляем переменную Some(key) .
        let Some(key) = open_key(hive, &format!("{UNINSTALL_KEY}\\{name}"), view) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную display_name .
        let display_name = query_string(key, "DisplayName");
        // Объявляем переменную install_location .
        let install_location = query_string(key, "InstallLocation");
        // Объявляем переменную icon_path .
        let icon_path = query_string(key, "DisplayIcon");

        // Выполняем операцию: unsafe { RegCloseKey(key) };.
        unsafe { RegCloseKey(key) };

        // Проверяем условие: let Some(display_name) = display_name.filter(|item.
        if let Some(display_name) = display_name.filter(|item| !item.trim().is_empty()) {
            // Выполняем операцию: target.push(UninstallEntry {.
            target.push(UninstallEntry {
                // Выполняем операцию: display_name: display_name.trim().to_string(),.
                display_name: display_name.trim().to_string(),
                // Выполняем операцию: install_location,.
                install_location,
                // Выполняем операцию: icon_path,.
                icon_path,
                // Закрываем блок.
            });
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: unsafe { RegCloseKey(root) };.
    unsafe { RegCloseKey(root) };
    // Закрываем блок.
}

// Объявляем функцию parse_icon_target.
pub fn parse_icon_target(value: &str) -> Option<String> {
    // Объявляем переменную trimmed .
    let trimmed = value.trim();
    // Объявляем переменную path .
    let path = match trimmed.rsplit_once(',') {
        // Выполняем операцию: Some((path, index)) if index.trim().parse::<i32>().is_o.
        Some((path, index)) if index.trim().parse::<i32>().is_ok() => path,
        // Выполняем операцию: _ => trimmed,.
        _ => trimmed,
        // Закрываем блок.
    };
    // Объявляем переменную path .
    let path = path.trim().trim_matches('"');

    // Проверяем условие: path.is_empty() || !path.to_ascii_lowercase().ends.
    if path.is_empty() || !path.to_ascii_lowercase().ends_with(".exe") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(path.to_string()).
    Some(path.to_string())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_registry_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
