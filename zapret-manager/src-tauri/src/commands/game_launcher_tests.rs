// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_launch_game_rejects_missing_executable.
fn test_launch_game_rejects_missing_executable() {
    // Объявляем переменную missing .
    let missing = PathBuf::from("C:\\missing\\game.exe");
    // Объявляем переменную path .
    let path = missing.to_string_lossy().to_string();

    // Объявляем переменную result .
    let result = tauri::async_runtime::block_on(launch_game(path, None, None));

    // Выполняем операцию: assert!(result.is_err());.
    assert!(result.is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_working_dir_prefers_explicit_folder.
fn test_resolve_working_dir_prefers_explicit_folder() {
    // Объявляем переменную executable .
    let executable = PathBuf::from("C:\\missing\\game.exe");
    // Объявляем переменную explicit .
    let explicit = std::env::temp_dir().to_string_lossy().to_string();

    // Объявляем переменную resolved .
    let resolved = resolve_working_dir(Some(&explicit), &executable);

    // Выполняем операцию: assert_eq!(resolved, std::env::temp_dir());.
    assert_eq!(resolved, std::env::temp_dir());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_working_dir_falls_back_to_executable_folder.
fn test_resolve_working_dir_falls_back_to_executable_folder() {
    // Объявляем переменную folder .
    let folder = std::env::temp_dir().join("zapret-launcher-test");
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(&folder);
    // Объявляем переменную executable .
    let executable = folder.join("game.exe");

    // Объявляем переменную resolved .
    let resolved = resolve_working_dir(Some("   "), &executable);

    // Выполняем операцию: assert_eq!(resolved, folder);.
    assert_eq!(resolved, folder);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_game_running_for_empty_tree.
fn test_is_game_running_for_empty_tree() {
    // Выполняем операцию: assert!(!is_game_running(Vec::new()).unwrap_or(true));.
    assert!(!is_game_running(Vec::new()).unwrap_or(true));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_game_running_checks_every_process_of_tree.
fn test_is_game_running_checks_every_process_of_tree() {
    // PID 0 не существует, PID текущего процесса жив: важно, что проверяется
    // весь список, а не только первый элемент
    // Объявляем переменную own .
    let own = std::process::id();
    // Объявляем переменную running .
    let running = is_game_running(vec![0, own]).unwrap_or(false);

    // Выполняем операцию: assert!(running);.
    assert!(running);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_close_game_reports_false_for_unknown_pids.
fn test_close_game_reports_false_for_unknown_pids() {
    // Выполняем операцию: assert!(!close_game(vec![0, u32::MAX]).unwrap_or(true)).
    assert!(!close_game(vec![0, u32::MAX]).unwrap_or(true));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_close_game_ignores_pids_we_did_not_launch.
fn test_close_game_ignores_pids_we_did_not_launch() {
    // Объявляем переменную own .
    let own = std::process::id();

    // Даже свой собственный PID закрывать нельзя: его приложение
    // не запускало, значит, это не игра.
    // Выполняем операцию: assert!(!close_game(vec![own]).unwrap_or(true));.
    assert!(!close_game(vec![own]).unwrap_or(true));
    // Выполняем операцию: assert!(is_pid_alive(own));.
    assert!(is_pid_alive(own));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_executable_rejects_empty_path.
fn test_validate_executable_rejects_empty_path() {
    // Выполняем операцию: assert!(validate_executable(Path::new("   ")).is_err()).
    assert!(validate_executable(Path::new("   ")).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_executable_rejects_directory.
fn test_validate_executable_rejects_directory() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-launcher-dir");
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(&dir);

    // Выполняем операцию: assert!(validate_executable(&dir).is_err());.
    assert!(validate_executable(&dir).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_executable_rejects_non_exe.
fn test_validate_executable_rejects_non_exe() {
    // Объявляем переменную file .
    let file = std::env::temp_dir().join("zapret-launcher-not-exe.txt");
    // Выполняем операцию: std::fs::write(&file, b"text").unwrap();.
    std::fs::write(&file, b"text").unwrap();

    // Выполняем операцию: assert!(validate_executable(&file).is_err());.
    assert!(validate_executable(&file).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_file(&file);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_executable_accepts_exe.
fn test_validate_executable_accepts_exe() {
    // Объявляем переменную file .
    let file = std::env::temp_dir().join("zapret-launcher-ok.exe");
    // Выполняем операцию: std::fs::write(&file, b"MZ").unwrap();.
    std::fs::write(&file, b"MZ").unwrap();

    // Выполняем операцию: assert!(validate_executable(&file).is_ok());.
    assert!(validate_executable(&file).is_ok());

    // Объявляем переменную _ .
    let _ = std::fs::remove_file(&file);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_launched_pid_tracking.
fn test_launched_pid_tracking() {
    // Объявляем переменную pid .
    let pid = 424_242;

    // Выполняем операцию: assert!(!is_launched_pid(pid));.
    assert!(!is_launched_pid(pid));

    // Выполняем операцию: remember_launched(&[pid]);.
    remember_launched(&[pid]);
    // Выполняем операцию: assert!(is_launched_pid(pid));.
    assert!(is_launched_pid(pid));

    // Выполняем операцию: forget_launched(&[pid]);.
    forget_launched(&[pid]);
    // Выполняем операцию: assert!(!is_launched_pid(pid));.
    assert!(!is_launched_pid(pid));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_process_tree_contains_current_process.
fn test_process_tree_contains_current_process() {
    // Объявляем переменную tree .
    let tree = crate::winapi_helpers::process_tree(std::process::id());

    // Выполняем операцию: assert!(tree.contains(&std::process::id()));.
    assert!(tree.contains(&std::process::id()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_launch_real_executable_returns_pid.
fn test_launch_real_executable_returns_pid() {
    // Объявляем переменную target .
    let target = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    // Объявляем переменную program .
    let program = PathBuf::from(target).join("System32").join("where.exe");

    // Проверяем условие: !program.is_file() {.
    if !program.is_file() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную pid .
    let pid =
        // Выполняем операцию: crate::winapi_helpers::shell_execute_game(&program.to_s.
        crate::winapi_helpers::shell_execute_game(&program.to_string_lossy(), "", program.parent());

    // Выполняем операцию: assert!(pid.unwrap_or(0) > 0);.
    assert!(pid.unwrap_or(0) > 0);
    // Закрываем блок.
}
