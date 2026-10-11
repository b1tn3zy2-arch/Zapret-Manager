use winapi::shared::minwindef::{DWORD, HKEY};
use winapi::shared::winerror::ERROR_SUCCESS;
use winapi::um::winnt::{KEY_READ, KEY_WOW64_32KEY, KEY_WOW64_64KEY};
use winapi::um::winreg::{
    RegCloseKey, RegEnumKeyExW, RegOpenKeyExW, RegQueryValueExW, HKEY_CURRENT_USER,
    HKEY_LOCAL_MACHINE,
};

pub const VIEW_64: DWORD = KEY_READ | KEY_WOW64_64KEY;
pub const VIEW_32: DWORD = KEY_READ | KEY_WOW64_32KEY;

pub const UNINSTALL_KEY: &str = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";

#[derive(Debug, Clone)]
pub struct UninstallEntry {
    pub display_name: String,
    pub install_location: Option<String>,
    pub icon_path: Option<String>,
}

pub fn to_wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

pub fn open_key(hive: HKEY, subkey: &str, access: DWORD) -> Option<HKEY> {
    let path = to_wide(subkey);
    let mut key: HKEY = std::ptr::null_mut();
    let result = unsafe { RegOpenKeyExW(hive, path.as_ptr(), 0, access, &mut key) };

    if result != ERROR_SUCCESS as i32 {
        return None;
    }

    Some(key)
}

pub fn query_string(key: HKEY, name: &str) -> Option<String> {
    let value_name = to_wide(name);
    let mut kind: DWORD = 0;
    let mut size: DWORD = 0;
    let probe = unsafe {
        RegQueryValueExW(
            key,
            value_name.as_ptr(),
            std::ptr::null_mut(),
            &mut kind,
            std::ptr::null_mut(),
            &mut size,
        )
    };

    if probe != ERROR_SUCCESS as i32 || size == 0 {
        return None;
    }

    let mut buffer: Vec<u16> = vec![0; (size / 2) as usize + 1];
    let result = unsafe {
        RegQueryValueExW(
            key,
            value_name.as_ptr(),
            std::ptr::null_mut(),
            &mut kind,
            buffer.as_mut_ptr() as *mut u8,
            &mut size,
        )
    };

    if result != ERROR_SUCCESS as i32 {
        return None;
    }

    let end = buffer.iter().position(|item| *item == 0).unwrap_or(0);

    Some(String::from_utf16_lossy(&buffer[..end]))
}

pub fn list_subkeys(key: HKEY) -> Vec<String> {
    let mut result = Vec::new();
    let mut index = 0;

    loop {
        let mut buffer: Vec<u16> = vec![0; 512];
        let mut length: DWORD = buffer.len() as DWORD;
        let result_code = unsafe {
            RegEnumKeyExW(
                key,
                index,
                buffer.as_mut_ptr(),
                &mut length,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
            )
        };

        if result_code != ERROR_SUCCESS as i32 {
            break;
        }

        buffer.truncate(length as usize);
        result.push(String::from_utf16_lossy(&buffer));
        index += 1;
    }

    result
}

pub fn read_registry_string(hives: &[(HKEY, &str, &str)], views: &[DWORD]) -> Option<String> {
    for (hive, subkey, value) in hives {
        for view in views {
            let Some(key) = open_key(*hive, subkey, *view) else {
                continue;
            };
            let found = query_string(key, value);

            unsafe { RegCloseKey(key) };

            if let Some(text) = found.filter(|item| !item.trim().is_empty()) {
                return Some(text);
            }
        }
    }

    None
}

pub fn uninstall_entries() -> Vec<UninstallEntry> {
    let hives = [HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER];
    let mut result = Vec::new();

    for hive in hives {
        for view in [VIEW_64, VIEW_32] {
            collect_uninstall(hive, view, &mut result);
        }
    }

    result.sort_by(|left, right| left.display_name.cmp(&right.display_name));
    result.dedup_by(|left, right| left.display_name == right.display_name);

    result
}

fn collect_uninstall(hive: HKEY, view: DWORD, target: &mut Vec<UninstallEntry>) {
    let Some(root) = open_key(hive, UNINSTALL_KEY, view) else {
        return;
    };

    for name in list_subkeys(root) {
        let Some(key) = open_key(hive, &format!("{UNINSTALL_KEY}\\{name}"), view) else {
            continue;
        };

        let display_name = query_string(key, "DisplayName");
        let install_location = query_string(key, "InstallLocation");
        let icon_path = query_string(key, "DisplayIcon");

        unsafe { RegCloseKey(key) };

        if let Some(display_name) = display_name.filter(|item| !item.trim().is_empty()) {
            target.push(UninstallEntry {
                display_name: display_name.trim().to_string(),
                install_location,
                icon_path,
            });
        }
    }

    unsafe { RegCloseKey(root) };
}

pub fn parse_icon_target(value: &str) -> Option<String> {
    let trimmed = value.trim();
    let path = match trimmed.rsplit_once(',') {
        Some((path, index)) if index.trim().parse::<i32>().is_ok() => path,
        _ => trimmed,
    };
    let path = path.trim().trim_matches('"');

    if path.is_empty() || !path.to_ascii_lowercase().ends_with(".exe") {
        return None;
    }

    Some(path.to_string())
}

#[cfg(test)]
#[path = "game_registry_tests.rs"]
mod tests;