use std::path::PathBuf;

use super::*;

#[test]
fn test_launch_game_rejects_missing_executable() {
    let missing = PathBuf::from("C:\\missing\\game.exe");
    let path = missing.to_string_lossy().to_string();

    let result = tauri::async_runtime::block_on(launch_game(path, None, None));

    assert!(result.is_err());
}

#[test]
fn test_resolve_working_dir_prefers_explicit_folder() {
    let executable = PathBuf::from("C:\\missing\\game.exe");
    let explicit = std::env::temp_dir().to_string_lossy().to_string();

    let resolved = resolve_working_dir(Some(&explicit), &executable);

    assert_eq!(resolved, std::env::temp_dir());
}

#[test]
fn test_resolve_working_dir_falls_back_to_executable_folder() {
    let folder = std::env::temp_dir().join("zapret-launcher-test");
    let _ = std::fs::create_dir_all(&folder);
    let executable = folder.join("game.exe");

    let resolved = resolve_working_dir(Some("   "), &executable);

    assert_eq!(resolved, folder);
    let _ = std::fs::remove_dir_all(&folder);
}

#[test]
fn test_is_game_running_for_empty_tree() {
    assert!(!is_game_running(Vec::new()).unwrap_or(true));
}

#[test]
fn test_is_game_running_checks_every_process_of_tree() {
    // PID 0 не существует, PID текущего процесса жив: важно, что проверяется
    // весь список, а не только первый элемент
    let own = std::process::id();
    let running = is_game_running(vec![0, own]).unwrap_or(false);

    assert!(running);
}

#[test]
fn test_close_game_reports_false_for_unknown_pids() {
    assert!(!close_game(vec![0, u32::MAX]).unwrap_or(true));
}

#[test]
fn test_process_tree_contains_current_process() {
    let tree = crate::winapi_helpers::process_tree(std::process::id());

    assert!(tree.contains(&std::process::id()));
}

#[test]
fn test_launch_real_executable_returns_pid() {
    let target = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    let program = PathBuf::from(target).join("System32").join("where.exe");

    if !program.is_file() {
        return;
    }

    let pid = crate::winapi_helpers::shell_execute_game(
        &program.to_string_lossy(),
        "",
        program.parent(),
    );

    assert!(pid.unwrap_or(0) > 0);
}