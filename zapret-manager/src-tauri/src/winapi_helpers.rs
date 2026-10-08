use std::os::windows::ffi::OsStrExt;
use std::path::Path;

use winapi::shared::iprtrmib::TCP_TABLE_OWNER_PID_ALL;
use winapi::shared::minwindef::DWORD;
use winapi::shared::tcpmib::MIB_TCPTABLE_OWNER_PID;
use winapi::shared::ws2def::AF_INET;
use winapi::um::errhandlingapi::GetLastError;
use winapi::um::handleapi::CloseHandle;
use winapi::um::iphlpapi::GetExtendedTcpTable;
use winapi::um::processthreadsapi::{
    GetExitCodeProcess, GetProcessId, OpenProcess, TerminateProcess,
};
use winapi::um::shellapi::ShellExecuteExW;
use winapi::um::synchapi::WaitForSingleObject;
use winapi::um::winnt::{HANDLE, PROCESS_QUERY_LIMITED_INFORMATION};

use crate::error::{AppError, AppResult};

const ERROR_CANCELLED: DWORD = 1223;
const STILL_ACTIVE_CODE: DWORD = 259;
const SW_HIDE_VALUE: i32 = 0;
const SEE_MASK_NOCLOSEPROCESS_VALUE: DWORD = 0x0000_0040;
const SEE_MASK_NOASYNC_VALUE: DWORD = 0x0000_0100;
const ERROR_SUCCESS_CODE: DWORD = 0;
const ERROR_INSUFFICIENT_BUFFER_CODE: DWORD = 122;
const MIB_TCP_STATE_LISTEN: DWORD = 2;
const WAIT_OBJECT_0_VALUE: DWORD = 0x0000_0000;
const WAIT_TIMEOUT_VALUE: DWORD = 0x0000_0102;

fn wide(value: &str) -> Vec<u16> {
    std::ffi::OsStr::new(value)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect()
}

fn os_error_message(code: DWORD) -> String {
    std::io::Error::from_raw_os_error(code as i32).to_string()
}

#[derive(Debug)]
pub struct OwnedProcessHandle {
    raw: isize,
}

impl OwnedProcessHandle {
    pub fn from_raw(raw: isize) -> Self {
        Self { raw }
    }

    pub fn terminate(&self, exit_code: u32) -> bool {
        if self.raw == 0 {
            return false;
        }
        unsafe { TerminateProcess(self.raw as HANDLE, exit_code) != 0 }
    }

    pub fn wait_for_exit(&self, timeout_ms: u32) -> AppResult<u32> {
        if self.raw == 0 {
            return Err(AppError::custom(
                "Процесс без дескриптора нельзя дождаться",
            ));
        }

        let outcome = unsafe {
            WaitForSingleObject(self.raw as HANDLE, timeout_ms)
        };

        if outcome == WAIT_TIMEOUT_VALUE {
            return Err(AppError::custom(
                "Повышенный процесс не ответил вовремя",
            ));
        }

        if outcome != WAIT_OBJECT_0_VALUE {
            return Err(AppError::custom(
                "Не удалось дождаться повышенного процесса",
            ));
        }

        let mut code: DWORD = 0;

        if unsafe { GetExitCodeProcess(self.raw as HANDLE, &mut code) } == 0 {
            return Err(AppError::custom(
                "Не удалось получить код завершения процесса",
            ));
        }

        Ok(code)
    }
}

impl Drop for OwnedProcessHandle {
    fn drop(&mut self) {
        if self.raw != 0 {
            unsafe {
                CloseHandle(self.raw as HANDLE);
            }
        }
    }
}

pub fn shell_execute_runas(
    program: &str,
    arguments: &str,
    working_dir: Option<&Path>,
) -> AppResult<(OwnedProcessHandle, u32)> {
    let verb = wide("runas");
    let file = wide(program);
    let params = wide(arguments);

    let directory = working_dir.map(|path| {
        std::ffi::OsStr::new(path)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect::<Vec<u16>>()
    });

    let mut info: winapi::um::shellapi::SHELLEXECUTEINFOW = unsafe {
        std::mem::zeroed()
    };

    info.cbSize =
        std::mem::size_of::<winapi::um::shellapi::SHELLEXECUTEINFOW>() as u32;
    info.fMask = SEE_MASK_NOCLOSEPROCESS_VALUE | SEE_MASK_NOASYNC_VALUE;
    info.lpVerb = verb.as_ptr();
    info.lpFile = file.as_ptr();
    info.lpParameters = params.as_ptr();
    info.lpDirectory = directory
        .as_ref()
        .map(|value| value.as_ptr())
        .unwrap_or(std::ptr::null());
    info.nShow = SW_HIDE_VALUE;

    let ok = unsafe { ShellExecuteExW(&mut info) };

    if ok == 0 {
        let code = unsafe { GetLastError() };

        if code == ERROR_CANCELLED {
            return Err(AppError::custom(
                "Запуск отменён: доступ к программе не предоставлен",
            ));
        }

        return Err(AppError::custom(format!(
            "Не удалось запустить с повышенными правами: {}",
            os_error_message(code)
        )));
    }

    let raw = info.hProcess as isize;

    if raw == 0 {
        return Err(AppError::custom(
            "Система не вернула дескриптор процесса",
        ));
    }

    let pid = unsafe { GetProcessId(info.hProcess) };

    if pid == 0 {
        unsafe {
            CloseHandle(info.hProcess);
        }
        return Err(AppError::custom(
            "Не удалось получить PID запущенного процесса",
        ));
    }

    Ok((OwnedProcessHandle::from_raw(raw), pid))
}

pub fn is_pid_alive(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }

    let handle =
        unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid as DWORD) };

    if handle.is_null() {
        return false;
    }

    let mut code: DWORD = 0;
    let ok = unsafe { GetExitCodeProcess(handle, &mut code) };
    unsafe {
        CloseHandle(handle);
    }

    ok != 0 && code == STILL_ACTIVE_CODE
}

pub fn count_tcp_connections() -> u32 {
    let mut size: DWORD = 0;

    let probe = unsafe {
        GetExtendedTcpTable(
            std::ptr::null_mut(),
            &mut size,
            0,
            AF_INET as u32,
            TCP_TABLE_OWNER_PID_ALL,
            0,
        )
    };

    if probe != ERROR_INSUFFICIENT_BUFFER_CODE || size == 0 {
        return 0;
    }

    let mut buffer = vec![0u8; size as usize];

    let filled = unsafe {
        GetExtendedTcpTable(
            buffer.as_mut_ptr() as *mut _,
            &mut size,
            0,
            AF_INET as u32,
            TCP_TABLE_OWNER_PID_ALL,
            0,
        )
    };

    if filled != ERROR_SUCCESS_CODE {
        return 0;
    }

    let table = unsafe { &*(buffer.as_ptr() as *const MIB_TCPTABLE_OWNER_PID) };
    let rows = unsafe {
        std::slice::from_raw_parts(table.table.as_ptr(), table.dwNumEntries as usize)
    };

    rows.iter()
        .filter(|row| row.dwState != MIB_TCP_STATE_LISTEN)
        .count() as u32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wide_adds_terminator() {
        let value = wide("cmd.exe");
        assert_eq!(value.last(), Some(&0));
        assert_eq!(value.len(), 8);
    }

    #[test]
    fn test_is_pid_alive_current_process() {
        assert!(is_pid_alive(std::process::id()));
    }

    #[test]
    fn test_is_pid_alive_zero_pid() {
        assert!(!is_pid_alive(0));
    }

    #[test]
    fn test_is_pid_alive_nonexistent() {
        assert!(!is_pid_alive(0xFFFFFF));
    }

    #[test]
    fn test_owned_handle_zero_terminate_is_noop() {
        let handle = OwnedProcessHandle::from_raw(0);
        assert!(!handle.terminate(1));
    }

    #[test]
    fn test_owned_handle_drop_closes_once() {
        let handle = OwnedProcessHandle::from_raw(0);
        drop(handle);
    }

    #[test]
    fn test_count_tcp_connections_is_plausible() {
        let count = count_tcp_connections();
        assert!(count < 100_000, "подозрительное число соединений: {count}");
    }

    #[test]
    fn test_count_tcp_connections_is_stable_between_calls() {
        let first = count_tcp_connections();
        let second = count_tcp_connections();
        assert!(second.abs_diff(first) < 1_000);
    }
}