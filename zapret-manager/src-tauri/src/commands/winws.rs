use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

use sysinfo::System;

use crate::constants::WINWS_PROCESS_NAME;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

use crate::winapi_helpers::CREATE_NO_WINDOW;

#[cfg(test)]
pub(crate) static WINWS_TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

pub fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|delta| delta.as_millis() as u64)
        .unwrap_or(0)
}

pub fn find_winws_pids() -> Vec<u32> {
    let system = System::new_with_specifics(
        sysinfo::RefreshKind::nothing()
            .with_processes(sysinfo::ProcessRefreshKind::everything()),
    );

    system
        .processes()
        .values()
        .filter(|process| {
            process
                .name()
                .to_string_lossy()
                .eq_ignore_ascii_case(WINWS_PROCESS_NAME)
        })
        .map(|process| process.pid().as_u32())
        .collect()
}

pub fn kill_winws_by_name() -> usize {
    let pids = find_winws_pids();

    if pids.is_empty() {
        return 0;
    }

    let mut killed = 0usize;

    for pid in &pids {
        let output = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match output {
            Ok(_) => killed += 1,
            Err(error) => {
                tracing::warn!("Не удалось остановить winws.exe {pid}: {error}");
            }
        }
    }

    killed
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_winws_pids_is_sane() {
        let pids = find_winws_pids();
        assert!(pids.len() < 512);
    }

    #[test]
    fn test_kill_without_processes_is_noop() {
        let _guard = WINWS_TEST_LOCK
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());

        if find_winws_pids().is_empty() {
            assert_eq!(kill_winws_by_name(), 0);
        }
    }

    #[test]
    fn test_now_millis_is_plausible() {
        assert!(now_millis() > 1_600_000_000_000);
    }
}