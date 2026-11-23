// Подключаем модули: std::process::Command;.
use std::process::Command;
// Подключаем модули: std::time::{SystemTime, UNIX_EPOCH};.
use std::time::{SystemTime, UNIX_EPOCH};

// Подключаем модули: sysinfo::System;.
use sysinfo::System;

// Подключаем модули: crate::constants::WINWS_PROCESS_NAME;.
use crate::constants::WINWS_PROCESS_NAME;

// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Подключаем модули: std::os::windows::process::CommandExt;.
use std::os::windows::process::CommandExt;

// Подключаем модули: crate::winapi_helpers::CREATE_NO_WINDOW;.
use crate::winapi_helpers::CREATE_NO_WINDOW;

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: pub(crate) static WINWS_TEST_LOCK: std::sync::Mutex<()>.
pub(crate) static WINWS_TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

// Объявляем функцию now_millis.
pub fn now_millis() -> u64 {
    // Выполняем операцию: SystemTime::now().
    SystemTime::now()
        // Выполняем операцию: .duration_since(UNIX_EPOCH).
        .duration_since(UNIX_EPOCH)
        // Выполняем операцию: .map(|delta| delta.as_millis() as u64).
        .map(|delta| delta.as_millis() as u64)
        // Выполняем операцию: .unwrap_or(0).
        .unwrap_or(0)
    // Закрываем блок.
}

// Объявляем функцию find_winws_pids.
pub fn find_winws_pids() -> Vec<u32> {
    // Объявляем переменную system .
    let system = System::new_with_specifics(
        // Выполняем операцию: sysinfo::RefreshKind::nothing().with_processes(sysinfo:.
        sysinfo::RefreshKind::nothing().with_processes(sysinfo::ProcessRefreshKind::everything()),
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: system.
    system
        // Выполняем операцию: .processes().
        .processes()
        // Выполняем операцию: .values().
        .values()
        // Выполняем операцию: .filter(|process| {.
        .filter(|process| {
            // Выполняем операцию: process.
            process
                // Выполняем операцию: .name().
                .name()
                // Выполняем операцию: .to_string_lossy().
                .to_string_lossy()
                // Выполняем операцию: .eq_ignore_ascii_case(WINWS_PROCESS_NAME).
                .eq_ignore_ascii_case(WINWS_PROCESS_NAME)
            // Закрываем блок.
        })
        // Выполняем операцию: .map(|process| process.pid().as_u32()).
        .map(|process| process.pid().as_u32())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию kill_winws_by_name.
pub fn kill_winws_by_name() -> usize {
    // Объявляем переменную pids .
    let pids = find_winws_pids();

    // Проверяем условие: pids.is_empty() {.
    if pids.is_empty() {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Объявляем переменную killed .
    let mut killed = 0usize;

    // Перебираем элементы коллекции.
    for pid in &pids {
        // Объявляем переменную output .
        let output = Command::new("taskkill")
            // Выполняем операцию: .args(["/PID", &pid.to_string(), "/T", "/F"]).
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            // Выполняем операцию: .creation_flags(CREATE_NO_WINDOW).
            .creation_flags(CREATE_NO_WINDOW)
            // Выполняем операцию: .output();.
            .output();

        // Выбираем вариант по значению.
        match output {
            // Выполняем операцию: Ok(_) => killed += 1,.
            Ok(_) => killed += 1,
            // Выполняем операцию: Err(error) => {.
            Err(error) => {
                // Выполняем операцию: tracing::warn!("Не удалось остановить winws.exe {pid}: .
                tracing::warn!("Не удалось остановить winws.exe {pid}: {error}");
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: killed.
    killed
    // Закрываем блок.
}

/// Убивает процесс и всех его потомков. Нужен для legacy-режима:
/// там запускается cmd.exe, а winws.exe живёт его внуком и сам по
/// себе не завершится. Общий поиск по имени выкашивал бы ещё и
/// чужие winws.exe, запущенные вручную.
// Объявляем функцию kill_process_tree.
pub fn kill_process_tree(pid: u32) -> bool {
    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: Command::new("taskkill").
    Command::new("taskkill")
        // Выполняем операцию: .args(["/PID", &pid.to_string(), "/T", "/F"]).
        .args(["/PID", &pid.to_string(), "/T", "/F"])
        // Выполняем операцию: .creation_flags(CREATE_NO_WINDOW).
        .creation_flags(CREATE_NO_WINDOW)
        // Выполняем операцию: .output().
        .output()
        // Выполняем операцию: .is_ok().
        .is_ok()
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
    // Объявляем функцию test_find_winws_pids_is_sane.
    fn test_find_winws_pids_is_sane() {
        // Объявляем переменную pids .
        let pids = find_winws_pids();
        // Выполняем операцию: assert!(pids.len() < 512);.
        assert!(pids.len() < 512);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_kill_without_processes_is_noop.
    fn test_kill_without_processes_is_noop() {
        // Объявляем переменную _guard .
        let _guard = WINWS_TEST_LOCK
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .unwrap_or_else(|poisoned| poisoned.into_inner());.
            .unwrap_or_else(|poisoned| poisoned.into_inner());

        // Проверяем условие: find_winws_pids().is_empty() {.
        if find_winws_pids().is_empty() {
            // Выполняем операцию: assert_eq!(kill_winws_by_name(), 0);.
            assert_eq!(kill_winws_by_name(), 0);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_now_millis_is_plausible.
    fn test_now_millis_is_plausible() {
        // Выполняем операцию: assert!(now_millis() > 1_600_000_000_000);.
        assert!(now_millis() > 1_600_000_000_000);
        // Закрываем блок.
    }
    // Закрываем блок.
}
