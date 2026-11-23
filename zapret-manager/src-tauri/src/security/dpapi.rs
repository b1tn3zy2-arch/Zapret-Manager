//! Шифрование небольших секретов средствами Windows.
//!
//! DPAPI привязывает ключ к учётной записи пользователя: файл,
//! скопированный на другой компьютер или открытый другой учётной
//! записью, не расшифруется. Этого достаточно для ссылки подписки,
//! которая содержит токен доступа ко всем серверам.

// Подключаем модули: winapi::shared::minwindef::DWORD;.
use winapi::shared::minwindef::DWORD;
// Подключаем модули: winapi::um::dpapi::{CryptProtectData, CryptUnprotectDat.
use winapi::um::dpapi::{CryptProtectData, CryptUnprotectData, CRYPTPROTECT_UI_FORBIDDEN};
// Подключаем модули: winapi::um::winbase::LocalFree;.
use winapi::um::winbase::LocalFree;
// Подключаем модули: winapi::um::wincrypt::DATA_BLOB;.
use winapi::um::wincrypt::DATA_BLOB;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем функцию protect.
pub fn protect(data: &[u8]) -> AppResult<Vec<u8>> {
    // Объявляем переменную input .
    let mut input = DATA_BLOB {
        // Выполняем операцию: cbData: data.len() as DWORD,.
        cbData: data.len() as DWORD,
        // Выполняем операцию: pbData: data.as_ptr() as *mut u8,.
        pbData: data.as_ptr() as *mut u8,
        // Закрываем блок.
    };
    // Объявляем переменную output .
    let mut output = DATA_BLOB {
        // Выполняем операцию: cbData: 0,.
        cbData: 0,
        // Выполняем операцию: pbData: std::ptr::null_mut(),.
        pbData: std::ptr::null_mut(),
        // Закрываем блок.
    };

    // Объявляем переменную ok .
    let ok = unsafe {
        // Выполняем операцию: CryptProtectData(.
        CryptProtectData(
            // Выполняем операцию: &mut input,.
            &mut input,
            // Выполняем операцию: std::ptr::null(),.
            std::ptr::null(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: CRYPTPROTECT_UI_FORBIDDEN,.
            CRYPTPROTECT_UI_FORBIDDEN,
            // Выполняем операцию: &mut output,.
            &mut output,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Проверяем условие: ok == 0 {.
    if ok == 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Секрет не удалось зашифровать"));
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes =
        // Выполняем операцию: unsafe { std::slice::from_raw_parts(output.pbData, outp.
        unsafe { std::slice::from_raw_parts(output.pbData, output.cbData as usize) }.to_vec();

    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: LocalFree(output.pbData as _);.
        LocalFree(output.pbData as _);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(bytes).
    Ok(bytes)
    // Закрываем блок.
}

// Объявляем функцию unprotect.
pub fn unprotect(data: &[u8]) -> AppResult<Vec<u8>> {
    // Объявляем переменную input .
    let mut input = DATA_BLOB {
        // Выполняем операцию: cbData: data.len() as DWORD,.
        cbData: data.len() as DWORD,
        // Выполняем операцию: pbData: data.as_ptr() as *mut u8,.
        pbData: data.as_ptr() as *mut u8,
        // Закрываем блок.
    };
    // Объявляем переменную output .
    let mut output = DATA_BLOB {
        // Выполняем операцию: cbData: 0,.
        cbData: 0,
        // Выполняем операцию: pbData: std::ptr::null_mut(),.
        pbData: std::ptr::null_mut(),
        // Закрываем блок.
    };

    // Объявляем переменную ok .
    let ok = unsafe {
        // Выполняем операцию: CryptUnprotectData(.
        CryptUnprotectData(
            // Выполняем операцию: &mut input,.
            &mut input,
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: CRYPTPROTECT_UI_FORBIDDEN,.
            CRYPTPROTECT_UI_FORBIDDEN,
            // Выполняем операцию: &mut output,.
            &mut output,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Проверяем условие: ok == 0 {.
    if ok == 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Секрет не удалось расшифровать"));
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes =
        // Выполняем операцию: unsafe { std::slice::from_raw_parts(output.pbData, outp.
        unsafe { std::slice::from_raw_parts(output.pbData, output.cbData as usize) }.to_vec();

    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: LocalFree(output.pbData as _);.
        LocalFree(output.pbData as _);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(bytes).
    Ok(bytes)
    // Закрываем блок.
}
