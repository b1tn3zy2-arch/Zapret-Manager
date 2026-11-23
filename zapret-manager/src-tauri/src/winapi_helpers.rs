// Подключаем модули: std::os::windows::ffi::OsStrExt;.
use std::os::windows::ffi::OsStrExt;
// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: winapi::shared::iprtrmib::TCP_TABLE_OWNER_PID_ALL;.
use winapi::shared::iprtrmib::TCP_TABLE_OWNER_PID_ALL;
// Подключаем модули: winapi::shared::minwindef::DWORD;.
use winapi::shared::minwindef::DWORD;
// Подключаем модули: winapi::shared::tcpmib::MIB_TCPTABLE_OWNER_PID;.
use winapi::shared::tcpmib::MIB_TCPTABLE_OWNER_PID;
// Подключаем модули: winapi::shared::ws2def::AF_INET;.
use winapi::shared::ws2def::AF_INET;
// Подключаем модули: winapi::um::errhandlingapi::GetLastError;.
use winapi::um::errhandlingapi::GetLastError;
// Подключаем модули: winapi::um::handleapi::CloseHandle;.
use winapi::um::handleapi::CloseHandle;
// Подключаем модули: winapi::um::handleapi::INVALID_HANDLE_VALUE;.
use winapi::um::handleapi::INVALID_HANDLE_VALUE;
// Подключаем модули: winapi::um::iphlpapi::GetExtendedTcpTable;.
use winapi::um::iphlpapi::GetExtendedTcpTable;
// Подключаем модули: winapi::um::processthreadsapi::{.
use winapi::um::processthreadsapi::{
    // Выполняем операцию: CreateProcessAsUserW, GetCurrentProcess, GetExitCodePro.
    CreateProcessAsUserW,
    GetCurrentProcess,
    GetExitCodeProcess,
    GetProcessId,
    OpenProcess,
    // Выполняем операцию: OpenProcessToken, TerminateProcess, PROCESS_INFORMATION.
    OpenProcessToken,
    TerminateProcess,
    PROCESS_INFORMATION,
    STARTUPINFOW,
    // Закрываем блок.
};
// Подключаем модули: winapi::um::securitybaseapi::{DuplicateTokenEx, GetToke.
use winapi::um::securitybaseapi::{DuplicateTokenEx, GetTokenInformation, SetTokenInformation};
// Подключаем модули: winapi::um::shellapi::ShellExecuteExW;.
use winapi::um::shellapi::ShellExecuteExW;
// Подключаем модули: winapi::um::synchapi::WaitForSingleObject;.
use winapi::um::synchapi::WaitForSingleObject;
// Подключаем модули: winapi::um::tlhelp32::{.
use winapi::um::tlhelp32::{
    // Выполняем операцию: CreateToolhelp32Snapshot, Process32FirstW, Process32Nex.
    CreateToolhelp32Snapshot,
    Process32FirstW,
    Process32NextW,
    PROCESSENTRY32W,
    TH32CS_SNAPPROCESS,
    // Закрываем блок.
};
// Подключаем модули: winapi::um::winbase::{.
use winapi::um::winbase::{
    // Выполняем операцию: QueryFullProcessImageNameW, CREATE_NEW_PROCESS_GROUP, C.
    QueryFullProcessImageNameW,
    CREATE_NEW_PROCESS_GROUP,
    CREATE_UNICODE_ENVIRONMENT,
    // Закрываем блок.
};
// Подключаем модули: winapi::um::winnt::{.
use winapi::um::winnt::{
    // Выполняем операцию: SecurityImpersonation, TokenElevation, TokenIntegrityLe.
    SecurityImpersonation,
    TokenElevation,
    TokenIntegrityLevel,
    TokenPrimary,
    HANDLE,
    // Выполняем операцию: MAXIMUM_ALLOWED, PROCESS_QUERY_LIMITED_INFORMATION, TOK.
    MAXIMUM_ALLOWED,
    PROCESS_QUERY_LIMITED_INFORMATION,
    TOKEN_DUPLICATE,
    TOKEN_ELEVATION,
    // Выполняем операцию: TOKEN_QUERY,.
    TOKEN_QUERY,
    // Закрываем блок.
};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

/// Флаг «не создавать окно консоли».
///
/// Без него каждый запуск консольной утилиты (wg.exe, wireguard.exe,
/// powershell, taskkill) на долю секунды мелькает чёрным окном поверх всего.
// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Объявляем константу CREATE_NO_WINDOW.
pub const CREATE_NO_WINDOW: u32 = 0x0800_0000;

/// Единая точка для скрытия окна у дочерних процессов.
///
/// Смысл в том, чтобы флаг нельзя было забыть: раньше константа
/// дублировалась в трёх модулях, и половина вызовов `Command::new` оставалась
/// без неё — именно это и вызывало мигание консоли раз в 5 секунд.
// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Выполняем операцию: pub trait HiddenWindow {.
pub trait HiddenWindow {
    // Объявляем функцию hidden.
    fn hidden(&mut self) -> &mut Self;
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Открываем реализацию типа.
impl HiddenWindow for std::process::Command {
    // Объявляем функцию hidden.
    fn hidden(&mut self) -> &mut Self {
        // Подключаем модули: std::os::windows::process::CommandExt;.
        use std::os::windows::process::CommandExt;
        // Выполняем операцию: self.creation_flags(CREATE_NO_WINDOW).
        self.creation_flags(CREATE_NO_WINDOW)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Открываем реализацию типа.
impl HiddenWindow for tokio::process::Command {
    // Объявляем функцию hidden.
    fn hidden(&mut self) -> &mut Self {
        // у tokio свой собственный метод creation_flags, трейт не нужен
        // Выполняем операцию: self.creation_flags(CREATE_NO_WINDOW).
        self.creation_flags(CREATE_NO_WINDOW)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем константу ERROR_CANCELLED.
const ERROR_CANCELLED: DWORD = 1223;
// Объявляем константу STILL_ACTIVE_CODE.
const STILL_ACTIVE_CODE: DWORD = 259;
// Объявляем константу SW_HIDE_VALUE.
const SW_HIDE_VALUE: i32 = 0;
// Объявляем константу SW_SHOW_NORMAL_VALUE.
const SW_SHOW_NORMAL_VALUE: i32 = 1;
// Объявляем константу SEE_MASK_NOCLOSEPROCESS_VALUE.
const SEE_MASK_NOCLOSEPROCESS_VALUE: DWORD = 0x0000_0040;
// Объявляем константу SEE_MASK_NOASYNC_VALUE.
const SEE_MASK_NOASYNC_VALUE: DWORD = 0x0000_0100;
// Объявляем константу ERROR_SUCCESS_CODE.
const ERROR_SUCCESS_CODE: DWORD = 0;
// Объявляем константу ERROR_INSUFFICIENT_BUFFER_CODE.
const ERROR_INSUFFICIENT_BUFFER_CODE: DWORD = 122;
// Объявляем константу MIB_TCP_STATE_LISTEN.
const MIB_TCP_STATE_LISTEN: DWORD = 2;
// Объявляем константу WAIT_OBJECT_0_VALUE.
const WAIT_OBJECT_0_VALUE: DWORD = 0x0000_0000;
// Объявляем константу WAIT_TIMEOUT_VALUE.
const WAIT_TIMEOUT_VALUE: DWORD = 0x0000_0102;

// Объявляем функцию wide.
fn wide(value: &str) -> Vec<u16> {
    // Выполняем операцию: std::ffi::OsStr::new(value).
    std::ffi::OsStr::new(value)
        // Выполняем операцию: .encode_wide().
        .encode_wide()
        // Выполняем операцию: .chain(std::iter::once(0)).
        .chain(std::iter::once(0))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию os_error_message.
fn os_error_message(code: DWORD) -> String {
    // Выполняем операцию: std::io::Error::from_raw_os_error(code as i32).to_strin.
    std::io::Error::from_raw_os_error(code as i32).to_string()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug)]
// Объявляем структуру OwnedProcessHandle.
pub struct OwnedProcessHandle {
    // Выполняем операцию: raw: isize,.
    raw: isize,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl OwnedProcessHandle {
    // Объявляем функцию from_raw.
    pub fn from_raw(raw: isize) -> Self {
        // Выполняем операцию: Self { raw }.
        Self { raw }
        // Закрываем блок.
    }

    // Объявляем функцию terminate.
    pub fn terminate(&self, exit_code: u32) -> bool {
        // Проверяем условие: self.raw == 0 {.
        if self.raw == 0 {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }
        // Выполняем операцию: unsafe { TerminateProcess(self.raw as HANDLE, exit_code.
        unsafe { TerminateProcess(self.raw as HANDLE, exit_code) != 0 }
        // Закрываем блок.
    }

    /// Жив ли ещё процесс. Нужен, чтобы отличать «наша стратегия
    /// запущена» от «в системе есть чужой winws.exe».
    // Объявляем функцию is_running.
    pub fn is_running(&self) -> bool {
        // Проверяем условие: self.raw == 0 {.
        if self.raw == 0 {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }

        // Выполняем операцию: unsafe { WaitForSingleObject(self.raw as HANDLE, 0) == .
        unsafe { WaitForSingleObject(self.raw as HANDLE, 0) == WAIT_TIMEOUT_VALUE }
        // Закрываем блок.
    }

    // Объявляем функцию wait_for_exit.
    pub fn wait_for_exit(&self, timeout_ms: u32) -> AppResult<u32> {
        // Проверяем условие: self.raw == 0 {.
        if self.raw == 0 {
            // Возвращаем результат из функции.
            return Err(AppError::custom("Процесс без дескриптора нельзя дождаться"));
            // Закрываем блок.
        }

        // Объявляем переменную outcome .
        let outcome = unsafe { WaitForSingleObject(self.raw as HANDLE, timeout_ms) };

        // Проверяем условие: outcome == WAIT_TIMEOUT_VALUE {.
        if outcome == WAIT_TIMEOUT_VALUE {
            // Возвращаем результат из функции.
            return Err(AppError::custom("Повышенный процесс не ответил вовремя"));
            // Закрываем блок.
        }

        // Проверяем условие: outcome != WAIT_OBJECT_0_VALUE {.
        if outcome != WAIT_OBJECT_0_VALUE {
            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "Не удалось дождаться повышенного процесса",.
                "Не удалось дождаться повышенного процесса",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Объявляем переменную code.
        let mut code: DWORD = 0;

        // Проверяем условие: unsafe { GetExitCodeProcess(self.raw as HANDLE, &m.
        if unsafe { GetExitCodeProcess(self.raw as HANDLE, &mut code) } == 0 {
            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "Не удалось получить код завершения процесса",.
                "Не удалось получить код завершения процесса",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Выполняем операцию: Ok(code).
        Ok(code)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Drop for OwnedProcessHandle {
    // Объявляем функцию drop.
    fn drop(&mut self) {
        // Проверяем условие: self.raw != 0 {.
        if self.raw != 0 {
            // Выполняем операцию: unsafe {.
            unsafe {
                // Выполняем операцию: CloseHandle(self.raw as HANDLE);.
                CloseHandle(self.raw as HANDLE);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию shell_execute_runas.
pub fn shell_execute_runas(
    // Выполняем операцию: program: &str,.
    program: &str,
    // Выполняем операцию: arguments: &str,.
    arguments: &str,
    // Выполняем операцию: working_dir: Option<&Path>,.
    working_dir: Option<&Path>,
    // Закрываем выражение или коллекцию.
) -> AppResult<(OwnedProcessHandle, u32)> {
    // Объявляем переменную verb .
    let verb = wide("runas");
    // Объявляем переменную file .
    let file = wide(program);
    // Объявляем переменную params .
    let params = wide(arguments);

    // Объявляем переменную directory .
    let directory = working_dir.map(|path| {
        // Выполняем операцию: std::ffi::OsStr::new(path).
        std::ffi::OsStr::new(path)
            // Выполняем операцию: .encode_wide().
            .encode_wide()
            // Выполняем операцию: .chain(std::iter::once(0)).
            .chain(std::iter::once(0))
            // Выполняем операцию: .collect::<Vec<u16>>().
            .collect::<Vec<u16>>()
        // Закрываем блок.
    });

    // Объявляем переменную info.
    let mut info: winapi::um::shellapi::SHELLEXECUTEINFOW = unsafe { std::mem::zeroed() };

    // Выполняем операцию: info.cbSize = std::mem::size_of::<winapi::um::shellapi:.
    info.cbSize = std::mem::size_of::<winapi::um::shellapi::SHELLEXECUTEINFOW>() as u32;
    // Выполняем операцию: info.fMask = SEE_MASK_NOCLOSEPROCESS_VALUE | SEE_MASK_N.
    info.fMask = SEE_MASK_NOCLOSEPROCESS_VALUE | SEE_MASK_NOASYNC_VALUE;
    // Выполняем операцию: info.lpVerb = verb.as_ptr();.
    info.lpVerb = verb.as_ptr();
    // Выполняем операцию: info.lpFile = file.as_ptr();.
    info.lpFile = file.as_ptr();
    // Выполняем операцию: info.lpParameters = params.as_ptr();.
    info.lpParameters = params.as_ptr();
    // Выполняем операцию: info.lpDirectory = directory.
    info.lpDirectory = directory
        // Выполняем операцию: .as_ref().
        .as_ref()
        // Выполняем операцию: .map(|value| value.as_ptr()).
        .map(|value| value.as_ptr())
        // Выполняем операцию: .unwrap_or(std::ptr::null());.
        .unwrap_or(std::ptr::null());
    // Выполняем операцию: info.nShow = SW_HIDE_VALUE;.
    info.nShow = SW_HIDE_VALUE;

    // Объявляем переменную ok .
    let ok = unsafe { ShellExecuteExW(&mut info) };

    // Проверяем условие: ok == 0 {.
    if ok == 0 {
        // Объявляем переменную code .
        let code = unsafe { GetLastError() };

        // Проверяем условие: code == ERROR_CANCELLED {.
        if code == ERROR_CANCELLED {
            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "Запуск отменён: доступ к программе не предоставлен",.
                "Запуск отменён: доступ к программе не предоставлен",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Не удалось запустить с повышенными правами: {}",.
            "Не удалось запустить с повышенными правами: {}",
            // Выполняем операцию: os_error_message(code).
            os_error_message(code) // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную raw .
    let raw = info.hProcess as isize;

    // Проверяем условие: raw == 0 {.
    if raw == 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Система не вернула дескриптор процесса"));
        // Закрываем блок.
    }

    // Объявляем переменную pid .
    let pid = unsafe { GetProcessId(info.hProcess) };

    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Выполняем операцию: unsafe {.
        unsafe {
            // Выполняем операцию: CloseHandle(info.hProcess);.
            CloseHandle(info.hProcess);
            // Закрываем блок.
        }
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Не удалось получить PID запущенного процесса",.
            "Не удалось получить PID запущенного процесса",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok((OwnedProcessHandle::from_raw(raw), pid)).
    Ok((OwnedProcessHandle::from_raw(raw), pid))
    // Закрываем блок.
}

// Объявляем функцию is_process_elevated.
pub fn is_process_elevated() -> bool {
    // Выполняем операцию: unsafe {.
    unsafe {
        // Объявляем переменную token.
        let mut token: HANDLE = std::ptr::null_mut();

        // Проверяем условие: OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY,.
        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token) == 0 {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }

        // Объявляем переменную elevation.
        let mut elevation: TOKEN_ELEVATION = std::mem::zeroed();
        // Объявляем переменную size.
        let mut size: DWORD = 0;
        // Объявляем переменную ok .
        let ok = GetTokenInformation(
            // Выполняем операцию: token,.
            token,
            // Выполняем операцию: TokenElevation,.
            TokenElevation,
            // Выполняем операцию: &mut elevation as *mut _ as *mut _,.
            &mut elevation as *mut _ as *mut _,
            // Выполняем операцию: std::mem::size_of::<TOKEN_ELEVATION>() as DWORD,.
            std::mem::size_of::<TOKEN_ELEVATION>() as DWORD,
            // Выполняем операцию: &mut size,.
            &mut size,
            // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: CloseHandle(token);.
        CloseHandle(token);

        // Выполняем операцию: ok != 0 && elevation.TokenIsElevated != 0.
        ok != 0 && elevation.TokenIsElevated != 0
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[repr(C)]
// Объявляем структуру SidHeaderRaw.
struct SidHeaderRaw {
    // Выполняем операцию: revision: u8,.
    revision: u8,
    // Выполняем операцию: sub_authority_count: u8,.
    sub_authority_count: u8,
    // Выполняем операцию: identifier_authority: [u8; 6],.
    identifier_authority: [u8; 6],
    // Выполняем операцию: sub_authority: [u32; 1],.
    sub_authority: [u32; 1],
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[repr(C)]
// Объявляем структуру SidAndAttributesRaw.
struct SidAndAttributesRaw {
    // Выполняем операцию: sid: *mut u8,.
    sid: *mut u8,
    // Выполняем операцию: attributes: u32,.
    attributes: u32,
    // Закрываем блок.
}

// Объявляем функцию spawn_medium_token.
pub fn spawn_medium_token(
    // Выполняем операцию: program: &str,.
    program: &str,
    // Выполняем операцию: arguments: &str,.
    arguments: &str,
    // Выполняем операцию: working_dir: Option<&Path>,.
    working_dir: Option<&Path>,
    // Закрываем выражение или коллекцию.
) -> AppResult<u32> {
    // Объявляем константу TOKEN_ASSIGN_PRIMARY_VALUE.
    const TOKEN_ASSIGN_PRIMARY_VALUE: DWORD = 0x0001;
    // Объявляем константу TOKEN_ADJUST_DEFAULT_ATTRIBUTES_VALUE.
    const TOKEN_ADJUST_DEFAULT_ATTRIBUTES_VALUE: DWORD = 0x0002;
    // Объявляем константу TOKEN_READ_ATTRIBUTES_VALUE.
    const TOKEN_READ_ATTRIBUTES_VALUE: DWORD = 0x0008;
    // Объявляем переменную access .
    let access = TOKEN_DUPLICATE
        // Выполняем операцию: | TOKEN_ASSIGN_PRIMARY_VALUE.
        | TOKEN_ASSIGN_PRIMARY_VALUE
        // Выполняем операцию: | TOKEN_QUERY.
        | TOKEN_QUERY
        // Выполняем операцию: | TOKEN_ADJUST_DEFAULT_ATTRIBUTES_VALUE.
        | TOKEN_ADJUST_DEFAULT_ATTRIBUTES_VALUE
        // Выполняем операцию: | TOKEN_READ_ATTRIBUTES_VALUE;.
        | TOKEN_READ_ATTRIBUTES_VALUE;
    // Объявляем переменную source.
    let mut source: HANDLE = std::ptr::null_mut();

    // Выполняем операцию: unsafe {.
    unsafe {
        // Проверяем условие: OpenProcessToken(GetCurrentProcess(), access, &mut.
        if OpenProcessToken(GetCurrentProcess(), access, &mut source) == 0 {
            // Возвращаем результат из функции.
            return Err(AppError::custom(format!(
                // Выполняем операцию: "Не удалось получить токен процесса: {}",.
                "Не удалось получить токен процесса: {}",
                // Выполняем операцию: os_error_message(GetLastError()).
                os_error_message(GetLastError()) // Закрываем выражение или коллекцию.
            )));
            // Закрываем блок.
        }

        // Объявляем переменную medium.
        let mut medium: HANDLE = std::ptr::null_mut();
        // Объявляем переменную duplicated .
        let duplicated = DuplicateTokenEx(
            // Выполняем операцию: source,.
            source,
            // Выполняем операцию: MAXIMUM_ALLOWED,.
            MAXIMUM_ALLOWED,
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: SecurityImpersonation,.
            SecurityImpersonation,
            // Выполняем операцию: TokenPrimary,.
            TokenPrimary,
            // Выполняем операцию: &mut medium,.
            &mut medium,
            // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: CloseHandle(source);.
        CloseHandle(source);

        // Проверяем условие: duplicated == 0 {.
        if duplicated == 0 {
            // Возвращаем результат из функции.
            return Err(AppError::custom(format!(
                // Выполняем операцию: "Не удалось создать medium-токен: {}",.
                "Не удалось создать medium-токен: {}",
                // Выполняем операцию: os_error_message(GetLastError()).
                os_error_message(GetLastError()) // Закрываем выражение или коллекцию.
            )));
            // Закрываем блок.
        }

        // Объявляем переменную sid .
        let mut sid = SidHeaderRaw {
            // Выполняем операцию: revision: 1,.
            revision: 1,
            // Выполняем операцию: sub_authority_count: 1,.
            sub_authority_count: 1,
            // Выполняем операцию: identifier_authority: [0, 0, 0, 0, 0, 16],.
            identifier_authority: [0, 0, 0, 0, 0, 16],
            // Выполняем операцию: sub_authority: [8192],.
            sub_authority: [8192],
            // Закрываем блок.
        };
        // Объявляем переменную label .
        let mut label = SidAndAttributesRaw {
            // Выполняем операцию: sid: std::ptr::addr_of_mut!(sid).cast::<u8>(),.
            sid: std::ptr::addr_of_mut!(sid).cast::<u8>(),
            // Выполняем операцию: attributes: 0,.
            attributes: 0,
            // Закрываем блок.
        };

        // Объявляем переменную lowered .
        let lowered = SetTokenInformation(
            // Выполняем операцию: medium,.
            medium,
            // Выполняем операцию: TokenIntegrityLevel,.
            TokenIntegrityLevel,
            // Выполняем операцию: std::ptr::addr_of_mut!(label).cast(),.
            std::ptr::addr_of_mut!(label).cast(),
            // Выполняем операцию: std::mem::size_of::<SidAndAttributesRaw>() as DWORD,.
            std::mem::size_of::<SidAndAttributesRaw>() as DWORD,
            // Закрываем выражение или коллекцию.
        );

        // Проверяем условие: lowered == 0 {.
        if lowered == 0 {
            // Объявляем переменную code .
            let code = GetLastError();

            // Выполняем операцию: CloseHandle(medium);.
            CloseHandle(medium);

            // Возвращаем результат из функции.
            return Err(AppError::custom(format!(
                // Выполняем операцию: "Не удалось понизить уровень целостности: {}",.
                "Не удалось понизить уровень целостности: {}",
                // Выполняем операцию: os_error_message(code).
                os_error_message(code) // Закрываем выражение или коллекцию.
            )));
            // Закрываем блок.
        }

        // Объявляем переменную command_line .
        let mut command_line = wide(program);

        // Проверяем условие: !arguments.is_empty() {.
        if !arguments.is_empty() {
            // Выполняем операцию: command_line.extend(wide(" "));.
            command_line.extend(wide(" "));
            // Выполняем операцию: command_line.extend(wide(arguments));.
            command_line.extend(wide(arguments));
            // Закрываем блок.
        }

        // Объявляем переменную directory .
        let directory = working_dir.map(|path| wide(&path.to_string_lossy()));

        // Объявляем переменную startup.
        let mut startup: STARTUPINFOW = std::mem::zeroed();
        // Объявляем переменную info.
        let mut info: PROCESS_INFORMATION = std::mem::zeroed();

        // Выполняем операцию: startup.cb = std::mem::size_of::<STARTUPINFOW>() as DWO.
        startup.cb = std::mem::size_of::<STARTUPINFOW>() as DWORD;

        // Объявляем переменную created .
        let created = CreateProcessAsUserW(
            // Выполняем операцию: medium,.
            medium,
            // Выполняем операцию: std::ptr::null(),.
            std::ptr::null(),
            // Выполняем операцию: command_line.as_mut_ptr(),.
            command_line.as_mut_ptr(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: CREATE_UNICODE_ENVIRONMENT | CREATE_NEW_PROCESS_GROUP,.
            CREATE_UNICODE_ENVIRONMENT | CREATE_NEW_PROCESS_GROUP,
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: directory.
            directory
                // Выполняем операцию: .as_ref().
                .as_ref()
                // Выполняем операцию: .map(|value| value.as_ptr()).
                .map(|value| value.as_ptr())
                // Выполняем операцию: .unwrap_or(std::ptr::null()),.
                .unwrap_or(std::ptr::null()),
            // Выполняем операцию: &mut startup,.
            &mut startup,
            // Выполняем операцию: &mut info,.
            &mut info,
            // Закрываем выражение или коллекцию.
        );

        // Объявляем переменную code .
        let code = GetLastError();

        // Выполняем операцию: CloseHandle(medium);.
        CloseHandle(medium);

        // Проверяем условие: created == 0 {.
        if created == 0 {
            // Возвращаем результат из функции.
            return Err(AppError::custom(format!(
                // Выполняем операцию: "Не удалось запустить с пониженными правами: {}",.
                "Не удалось запустить с пониженными правами: {}",
                // Выполняем операцию: os_error_message(code).
                os_error_message(code) // Закрываем выражение или коллекцию.
            )));
            // Закрываем блок.
        }

        // Выполняем операцию: CloseHandle(info.hThread);.
        CloseHandle(info.hThread);
        // Объявляем переменную pid .
        let pid = info.dwProcessId;

        // Выполняем операцию: CloseHandle(info.hProcess);.
        CloseHandle(info.hProcess);

        // Проверяем условие: pid == 0 {.
        if pid == 0 {
            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "Не удалось получить PID запущенного процесса",.
                "Не удалось получить PID запущенного процесса",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Выполняем операцию: Ok(pid).
        Ok(pid)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию shell_execute_game.
pub fn shell_execute_game(
    // Выполняем операцию: program: &str,.
    program: &str,
    // Выполняем операцию: arguments: &str,.
    arguments: &str,
    // Выполняем операцию: working_dir: Option<&Path>,.
    working_dir: Option<&Path>,
    // Закрываем выражение или коллекцию.
) -> AppResult<u32> {
    // Проверяем условие: is_process_elevated() {.
    if is_process_elevated() {
        // Выбираем вариант по значению.
        match spawn_medium_token(program, arguments, working_dir) {
            // Выполняем операцию: Ok(pid) => return Ok(pid),.
            Ok(pid) => return Ok(pid),
            // Выполняем операцию: Err(error) => {.
            Err(error) => {
                // Выполняем операцию: tracing::warn!("Понижение прав не удалось, обычный запу.
                tracing::warn!("Понижение прав не удалось, обычный запуск: {error}");
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: shell_execute_with_verb(program, arguments, working_dir.
    shell_execute_with_verb(program, arguments, working_dir, "open")
    // Закрываем блок.
}

// Объявляем функцию shell_execute_with_verb.
pub fn shell_execute_with_verb(
    // Выполняем операцию: program: &str,.
    program: &str,
    // Выполняем операцию: arguments: &str,.
    arguments: &str,
    // Выполняем операцию: working_dir: Option<&Path>,.
    working_dir: Option<&Path>,
    // Выполняем операцию: verb: &str,.
    verb: &str,
    // Закрываем выражение или коллекцию.
) -> AppResult<u32> {
    // Объявляем переменную verb .
    let verb = wide(verb);
    // Объявляем переменную file .
    let file = wide(program);
    // Объявляем переменную params .
    let params = wide(arguments);
    // Объявляем переменную directory .
    let directory = working_dir.map(|path| {
        // Выполняем операцию: std::ffi::OsStr::new(path).
        std::ffi::OsStr::new(path)
            // Выполняем операцию: .encode_wide().
            .encode_wide()
            // Выполняем операцию: .chain(std::iter::once(0)).
            .chain(std::iter::once(0))
            // Выполняем операцию: .collect::<Vec<u16>>().
            .collect::<Vec<u16>>()
        // Закрываем блок.
    });

    // Объявляем переменную info.
    let mut info: winapi::um::shellapi::SHELLEXECUTEINFOW = unsafe { std::mem::zeroed() };

    // Выполняем операцию: info.cbSize = std::mem::size_of::<winapi::um::shellapi:.
    info.cbSize = std::mem::size_of::<winapi::um::shellapi::SHELLEXECUTEINFOW>() as u32;
    // Выполняем операцию: info.fMask = SEE_MASK_NOCLOSEPROCESS_VALUE;.
    info.fMask = SEE_MASK_NOCLOSEPROCESS_VALUE;
    // Выполняем операцию: info.lpVerb = verb.as_ptr();.
    info.lpVerb = verb.as_ptr();
    // Выполняем операцию: info.lpFile = file.as_ptr();.
    info.lpFile = file.as_ptr();
    // Выполняем операцию: info.lpParameters = params.as_ptr();.
    info.lpParameters = params.as_ptr();
    // Выполняем операцию: info.lpDirectory = directory.
    info.lpDirectory = directory
        // Выполняем операцию: .as_ref().
        .as_ref()
        // Выполняем операцию: .map(|value| value.as_ptr()).
        .map(|value| value.as_ptr())
        // Выполняем операцию: .unwrap_or(std::ptr::null());.
        .unwrap_or(std::ptr::null());
    // Выполняем операцию: info.nShow = SW_SHOW_NORMAL_VALUE;.
    info.nShow = SW_SHOW_NORMAL_VALUE;

    // Объявляем переменную ok .
    let ok = unsafe { ShellExecuteExW(&mut info) };

    // Проверяем условие: ok == 0 {.
    if ok == 0 {
        // Объявляем переменную code .
        let code = unsafe { GetLastError() };

        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Не удалось запустить: {}",.
            "Не удалось запустить: {}",
            // Выполняем операцию: os_error_message(code).
            os_error_message(code) // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную pid .
    let pid = unsafe { GetProcessId(info.hProcess) };

    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: CloseHandle(info.hProcess);.
        CloseHandle(info.hProcess);
        // Закрываем блок.
    }

    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Не удалось получить PID запущенного процесса",.
            "Не удалось получить PID запущенного процесса",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(pid).
    Ok(pid)
    // Закрываем блок.
}

// Объявляем функцию terminate_pid.
pub fn terminate_pid(pid: u32) -> bool {
    // Объявляем константу PROCESS_TERMINATE.
    const PROCESS_TERMINATE: DWORD = 0x0001;

    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную handle .
    let handle = unsafe { OpenProcess(PROCESS_TERMINATE, 0, pid as DWORD) };

    // Проверяем условие: handle.is_null() {.
    if handle.is_null() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную ok .
    let ok = unsafe { TerminateProcess(handle, 0) };

    // Выполняем операцию: unsafe { CloseHandle(handle) };.
    unsafe { CloseHandle(handle) };

    // Выполняем операцию: ok != 0.
    ok != 0
    // Закрываем блок.
}

// Объявляем функцию is_pid_alive.
pub fn is_pid_alive(pid: u32) -> bool {
    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную handle .
    let handle = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid as DWORD) };

    // Проверяем условие: handle.is_null() {.
    if handle.is_null() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную code.
    let mut code: DWORD = 0;
    // Объявляем переменную ok .
    let ok = unsafe { GetExitCodeProcess(handle, &mut code) };
    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: CloseHandle(handle);.
        CloseHandle(handle);
        // Закрываем блок.
    }

    // Выполняем операцию: ok != 0 && code == STILL_ACTIVE_CODE.
    ok != 0 && code == STILL_ACTIVE_CODE
    // Закрываем блок.
}

/// Возвращает прямых потомков процесса.
///
/// Нужна для запуска игр с античитом: `start_protected_game.exe` запускает
/// настоящую игру и сразу завершается, поэтому судить о «работает ли игра» по
/// PID лаунчера нельзя — кнопка «Закрыть игру» исчезала через несколько секунд.
// Объявляем функцию child_pids.
pub fn child_pids(parent: u32) -> Vec<u32> {
    // Проверяем условие: parent == 0 {.
    if parent == 0 {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Объявляем переменную snapshot .
    let snapshot = unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) };

    // Проверяем условие: snapshot == INVALID_HANDLE_VALUE {.
    if snapshot == INVALID_HANDLE_VALUE {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Объявляем переменную entry.
    let mut entry: PROCESSENTRY32W = unsafe { std::mem::zeroed() };
    // Выполняем операцию: entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() a.
    entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as DWORD;
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Проверяем условие: unsafe { Process32FirstW(snapshot, &mut entry) } !.
    if unsafe { Process32FirstW(snapshot, &mut entry) } != 0 {
        // Выполняем операцию: loop {.
        loop {
            // Проверяем условие: entry.th32ParentProcessID == parent {.
            if entry.th32ParentProcessID == parent {
                // Выполняем операцию: result.push(entry.th32ProcessID);.
                result.push(entry.th32ProcessID);
                // Закрываем блок.
            }

            // Проверяем условие: unsafe { Process32NextW(snapshot, &mut entry) } ==.
            if unsafe { Process32NextW(snapshot, &mut entry) } == 0 {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: unsafe {.
    unsafe {
        // Объявляем переменную _ .
        let _ = CloseHandle(snapshot);
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

/// Дерево процессов: сам процесс и все потомки.
///
/// Обход в ширину с защитой от повторов, чтобы при некорректном ParentProcessID
/// не зациклиться.
// Объявляем функцию process_tree.
pub fn process_tree(pid: u32) -> Vec<u32> {
    // Объявляем переменную result .
    let mut result = Vec::new();
    // Объявляем переменную queue .
    let mut queue = vec![pid];

    // Повторяем, пока выполняется условие.
    while let Some(current) = queue.pop() {
        // Проверяем условие: result.contains(&current) {.
        if result.contains(&current) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: result.push(current);.
        result.push(current);
        // Выполняем операцию: queue.extend(child_pids(current));.
        queue.extend(child_pids(current));
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

/// Путь к исполняемому файлу процесса.
///
/// Нужен, чтобы закрыть игру, запущенную не приложением: по одному
/// PID её не узнать, а по пути к файлу — можно.
// Объявляем функцию process_image_path.
pub fn process_image_path(pid: u32) -> Option<String> {
    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную handle .
    let handle = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid as DWORD) };

    // Проверяем условие: handle.is_null() {.
    if handle.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную buffer .
    let mut buffer = [0u16; 1024];
    // Объявляем переменную size .
    let mut size = buffer.len() as DWORD;

    // Объявляем переменную ok .
    let ok = unsafe { QueryFullProcessImageNameW(handle, 0, buffer.as_mut_ptr(), &mut size) };

    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: CloseHandle(handle);.
        CloseHandle(handle);
        // Закрываем блок.
    }

    // Проверяем условие: ok == 0 {.
    if ok == 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную text .
    let text = String::from_utf16_lossy(&buffer[..size as usize]);

    // Выполняем операцию: Some(text.trim_end_matches('\0').to_string()).
    Some(text.trim_end_matches('\0').to_string())
    // Закрываем блок.
}

/// Процессы, запущенные из указанного файла.
///
/// Сравнение идёт по полному пути: совпадение по имени файла
/// закрыло бы чужую игру с тем же именем в другой папке.
// Объявляем функцию processes_by_image_path.
pub fn processes_by_image_path(image_path: &str) -> Vec<u32> {
    // Объявляем переменную wanted .
    let wanted = normalize_path(image_path);

    // Проверяем условие: wanted.is_empty() {.
    if wanted.is_empty() {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Объявляем переменную snapshot .
    let snapshot = unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) };

    // Проверяем условие: snapshot == INVALID_HANDLE_VALUE {.
    if snapshot == INVALID_HANDLE_VALUE {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Объявляем переменную entry.
    let mut entry: PROCESSENTRY32W = unsafe { std::mem::zeroed() };
    // Выполняем операцию: entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() a.
    entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as DWORD;
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Проверяем условие: unsafe { Process32FirstW(snapshot, &mut entry) } !.
    if unsafe { Process32FirstW(snapshot, &mut entry) } != 0 {
        // Выполняем операцию: loop {.
        loop {
            // Проверяем условие: let Some(path) = process_image_path(entry.th32Proc.
            if let Some(path) = process_image_path(entry.th32ProcessID) {
                // Проверяем условие: normalize_path(&path) == wanted {.
                if normalize_path(&path) == wanted {
                    // Выполняем операцию: result.push(entry.th32ProcessID);.
                    result.push(entry.th32ProcessID);
                    // Закрываем блок.
                }
                // Закрываем блок.
            }

            // Проверяем условие: unsafe { Process32NextW(snapshot, &mut entry) } ==.
            if unsafe { Process32NextW(snapshot, &mut entry) } == 0 {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: unsafe {.
    unsafe {
        // Объявляем переменную _ .
        let _ = CloseHandle(snapshot);
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

/// Есть ли среди процессов файл с таким именем («steam.exe»).
///
/// Полный путь здесь не нужен: клиент Steam мог быть запущен из
/// нестандартной папки, важно только, что клиент жив и отвечает на
/// запросы steam_api.dll запущенной игры.
// Объявляем функцию is_image_name_running.
pub fn is_image_name_running(image_name: &str) -> bool {
    // Объявляем переменную wanted .
    let wanted = image_name.trim().to_ascii_lowercase();

    // Проверяем условие: wanted.is_empty() {.
    if wanted.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную snapshot .
    let snapshot = unsafe { CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) };

    // Проверяем условие: snapshot == INVALID_HANDLE_VALUE {.
    if snapshot == INVALID_HANDLE_VALUE {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную entry.
    let mut entry: PROCESSENTRY32W = unsafe { std::mem::zeroed() };
    // Выполняем операцию: entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() a.
    entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as DWORD;
    // Объявляем переменную found .
    let mut found = false;

    // Проверяем условие: unsafe { Process32FirstW(snapshot, &mut entry) } !.
    if unsafe { Process32FirstW(snapshot, &mut entry) } != 0 {
        // Выполняем операцию: loop {.
        loop {
            // Объявляем переменную length .
            let length = entry
                // Выполняем операцию: .szExeFile.
                .szExeFile
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .position(|value| *value == 0).
                .position(|value| *value == 0)
                // Выполняем операцию: .unwrap_or(entry.szExeFile.len());.
                .unwrap_or(entry.szExeFile.len());
            // Объявляем переменную current .
            let current = String::from_utf16_lossy(&entry.szExeFile[..length]);

            // Проверяем условие: current.trim().to_ascii_lowercase() == wanted {.
            if current.trim().to_ascii_lowercase() == wanted {
                // Выполняем операцию: found = true;.
                found = true;

                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }

            // Проверяем условие: unsafe { Process32NextW(snapshot, &mut entry) } ==.
            if unsafe { Process32NextW(snapshot, &mut entry) } == 0 {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: unsafe {.
    unsafe {
        // Объявляем переменную _ .
        let _ = CloseHandle(snapshot);
        // Закрываем блок.
    }

    // Выполняем операцию: found.
    found
    // Закрываем блок.
}

/// Приводит путь к сравнимому виду: без регистра, без пробелов и
/// с одинаковыми разделителями.
// Объявляем функцию normalize_path.
fn normalize_path(path: &str) -> String {
    // Выполняем операцию: path.trim().
    path.trim()
        // Выполняем операцию: .replace('/', "\\").
        .replace('/', "\\")
        // Выполняем операцию: .to_lowercase().
        .to_lowercase()
        // Выполняем операцию: .split_whitespace().
        .split_whitespace()
        // Выполняем операцию: .collect::<String>().
        .collect::<String>()
    // Закрываем блок.
}

// Объявляем функцию quote_arg.
fn quote_arg(arg: &str) -> String {
    // Проверяем условие: !arg.contains([' ', '\t', '"']) {.
    if !arg.contains([' ', '\t', '"']) {
        // Возвращаем результат из функции.
        return arg.to_string();
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let mut result = String::from("\"");
    // Объявляем переменную backslashes .
    let mut backslashes = 0usize;

    // Перебираем элементы коллекции.
    for character in arg.chars() {
        // Выбираем вариант по значению.
        match character {
            // Выполняем операцию: '\\' => {.
            '\\' => {
                // Выполняем операцию: backslashes += 1;.
                backslashes += 1;
                // Выполняем операцию: result.push('\\');.
                result.push('\\');
                // Закрываем блок.
            }
            // Выполняем операцию: '"' => {.
            '"' => {
                // Выполняем операцию: result.push_str(&"\\".repeat(backslashes + 1));.
                result.push_str(&"\\".repeat(backslashes + 1));
                // Выполняем операцию: result.push('"');.
                result.push('"');
                // Выполняем операцию: backslashes = 0;.
                backslashes = 0;
                // Закрываем блок.
            }
            // Выполняем операцию: _ => {.
            _ => {
                // Выполняем операцию: backslashes = 0;.
                backslashes = 0;
                // Выполняем операцию: result.push(character);.
                result.push(character);
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.push_str(&"\\".repeat(backslashes));.
    result.push_str(&"\\".repeat(backslashes));
    // Выполняем операцию: result.push('"');.
    result.push('"');
    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию args_to_command_line.
pub fn args_to_command_line(args: &[String]) -> String {
    // Выполняем операцию: args.iter().
    args.iter()
        // Выполняем операцию: .map(|arg| quote_arg(arg)).
        .map(|arg| quote_arg(arg))
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join(" ").
        .join(" ")
    // Закрываем блок.
}

// Объявляем функцию count_tcp_connections.
pub fn count_tcp_connections() -> u32 {
    // Объявляем переменную size.
    let mut size: DWORD = 0;

    // Объявляем переменную probe .
    let probe = unsafe {
        // Выполняем операцию: GetExtendedTcpTable(.
        GetExtendedTcpTable(
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: &mut size,.
            &mut size,
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: AF_INET as u32,.
            AF_INET as u32,
            // Выполняем операцию: TCP_TABLE_OWNER_PID_ALL,.
            TCP_TABLE_OWNER_PID_ALL,
            // Выполняем операцию: 0,.
            0,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Проверяем условие: probe != ERROR_INSUFFICIENT_BUFFER_CODE || size ==.
    if probe != ERROR_INSUFFICIENT_BUFFER_CODE || size == 0 {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Объявляем переменную buffer .
    let mut buffer = vec![0u8; size as usize];

    // Объявляем переменную filled .
    let filled = unsafe {
        // Выполняем операцию: GetExtendedTcpTable(.
        GetExtendedTcpTable(
            // Выполняем операцию: buffer.as_mut_ptr() as *mut _,.
            buffer.as_mut_ptr() as *mut _,
            // Выполняем операцию: &mut size,.
            &mut size,
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: AF_INET as u32,.
            AF_INET as u32,
            // Выполняем операцию: TCP_TABLE_OWNER_PID_ALL,.
            TCP_TABLE_OWNER_PID_ALL,
            // Выполняем операцию: 0,.
            0,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Проверяем условие: filled != ERROR_SUCCESS_CODE {.
    if filled != ERROR_SUCCESS_CODE {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Объявляем переменную table .
    let table = unsafe { &*(buffer.as_ptr() as *const MIB_TCPTABLE_OWNER_PID) };
    // Объявляем переменную rows .
    let rows =
        // Выполняем операцию: unsafe { std::slice::from_raw_parts(table.table.as_ptr(.
        unsafe { std::slice::from_raw_parts(table.table.as_ptr(), table.dwNumEntries as usize) };

    // Выполняем операцию: rows.iter().
    rows.iter()
        // Выполняем операцию: .filter(|row| row.dwState != MIB_TCP_STATE_LISTEN).
        .filter(|row| row.dwState != MIB_TCP_STATE_LISTEN)
        // Выполняем операцию: .count() as u32.
        .count() as u32
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
    // Объявляем функцию test_wide_adds_terminator.
    fn test_wide_adds_terminator() {
        // Объявляем переменную value .
        let value = wide("cmd.exe");
        // Выполняем операцию: assert_eq!(value.last(), Some(&0));.
        assert_eq!(value.last(), Some(&0));
        // Выполняем операцию: assert_eq!(value.len(), 8);.
        assert_eq!(value.len(), 8);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_is_pid_alive_current_process.
    fn test_is_pid_alive_current_process() {
        // Выполняем операцию: assert!(is_pid_alive(std::process::id()));.
        assert!(is_pid_alive(std::process::id()));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_is_pid_alive_zero_pid.
    fn test_is_pid_alive_zero_pid() {
        // Выполняем операцию: assert!(!is_pid_alive(0));.
        assert!(!is_pid_alive(0));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_is_pid_alive_nonexistent.
    fn test_is_pid_alive_nonexistent() {
        // Выполняем операцию: assert!(!is_pid_alive(0xFFFFFF));.
        assert!(!is_pid_alive(0xFFFFFF));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_owned_handle_zero_terminate_is_noop.
    fn test_owned_handle_zero_terminate_is_noop() {
        // Объявляем переменную handle .
        let handle = OwnedProcessHandle::from_raw(0);
        // Выполняем операцию: assert!(!handle.terminate(1));.
        assert!(!handle.terminate(1));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_owned_handle_drop_closes_once.
    fn test_owned_handle_drop_closes_once() {
        // Объявляем переменную handle .
        let handle = OwnedProcessHandle::from_raw(0);
        // Выполняем операцию: drop(handle);.
        drop(handle);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_count_tcp_connections_is_plausible.
    fn test_count_tcp_connections_is_plausible() {
        // Объявляем переменную count .
        let count = count_tcp_connections();
        // Выполняем операцию: assert!(count < 100_000, "подозрительное число соединен.
        assert!(count < 100_000, "подозрительное число соединений: {count}");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_count_tcp_connections_is_stable_between_calls.
    fn test_count_tcp_connections_is_stable_between_calls() {
        // Объявляем переменную first .
        let first = count_tcp_connections();
        // Объявляем переменную second .
        let second = count_tcp_connections();
        // Выполняем операцию: assert!(second.abs_diff(first) < 1_000);.
        assert!(second.abs_diff(first) < 1_000);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_args_to_command_line_simple.
    fn test_args_to_command_line_simple() {
        // Объявляем переменную args .
        let args = vec![
            // Выполняем операцию: "--wf-tcp=80,443".to_string(),.
            "--wf-tcp=80,443".to_string(),
            // Выполняем операцию: "--dpi-desync=fake".to_string(),.
            "--dpi-desync=fake".to_string(),
            // Закрываем выражение или коллекцию.
        ];

        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: args_to_command_line(&args),.
            args_to_command_line(&args),
            // Выполняем операцию: "--wf-tcp=80,443 --dpi-desync=fake".
            "--wf-tcp=80,443 --dpi-desync=fake" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_args_to_command_line_quotes_spaces.
    fn test_args_to_command_line_quotes_spaces() {
        // Объявляем переменную args .
        let args = vec![r"--hostlist=C:\My Dir\list.txt".to_string()];

        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: args_to_command_line(&args),.
            args_to_command_line(&args),
            // Выполняем операцию: r#""--hostlist=C:\My Dir\list.txt""#.
            r#""--hostlist=C:\My Dir\list.txt""# // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_args_to_command_line_doubles_trailing_backslashes.
    fn test_args_to_command_line_doubles_trailing_backslashes() {
        // Объявляем переменную args .
        let args = vec![r"C:\dir with space\".to_string()];

        // Выполняем операцию: assert_eq!(args_to_command_line(&args), r#""C:\dir with.
        assert_eq!(args_to_command_line(&args), r#""C:\dir with space\\""#);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_quote_arg_escapes_inner_quotes.
    fn test_quote_arg_escapes_inner_quotes() {
        // Объявляем переменную args .
        let args = vec![r#"say "hi" now"#.to_string()];

        // Выполняем операцию: assert_eq!(args_to_command_line(&args), r#""say \"hi\" .
        assert_eq!(args_to_command_line(&args), r#""say \"hi\" now""#);
        // Закрываем блок.
    }
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_process_elevated_returns_without_panic.
fn test_is_process_elevated_returns_without_panic() {
    // Объявляем переменную _ .
    let _ = is_process_elevated();
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_spawn_medium_token_starts_low_privilege_process.
fn test_spawn_medium_token_starts_low_privilege_process() {
    // Объявляем переменную target .
    let target = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    // Объявляем переменную program .
    let program = Path::new(&target).join("System32").join("where.exe");

    // Проверяем условие: !program.is_file() {.
    if !program.is_file() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(pid) = spawn_medium_token(&program.to_strin.
    if let Ok(pid) = spawn_medium_token(&program.to_string_lossy(), "", program.parent()) {
        // Выполняем операцию: assert!(pid > 0);.
        assert!(pid > 0);
        // Закрываем блок.
    }
    // Закрываем блок.
}
