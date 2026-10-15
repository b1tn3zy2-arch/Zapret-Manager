use std::path::{Path, PathBuf};

use tauri::AppHandle;

use crate::error::{AppError, AppResult};
use crate::winapi_helpers::{is_pid_alive, process_tree, shell_execute_game, terminate_pid};

/// Запускает игру и возвращает дерево процессов: сам лаунчер античита и все его
/// потомки.
///
/// Возвращается именно дерево, а не один PID: `start_protected_game.exe` и
/// подобные обёртки запускают настоящую игру и сразу завершаются. Если судить
/// о жизни игры по PID такого лаунчера, кнопка «Закрыть игру» исчезала через
/// несколько секунд, хотя игра продолжала работать.
#[tauri::command]
pub async fn launch_game(
    executable_path: String,
    launch_args: Option<String>,
    working_dir: Option<String>,
) -> AppResult<Vec<u32>> {
    let path = PathBuf::from(executable_path.trim());

    if !path.is_file() {
        return Err(AppError::custom(format!(
            "Игра не найдена: {}",
            path.display()
        )));
    }

    let working = resolve_working_dir(working_dir.as_deref(), &path);
    let arguments = launch_args.unwrap_or_default();

    let pid = tauri::async_runtime::spawn_blocking(move || {
        shell_execute_game(
            &path.to_string_lossy(),
            &arguments,
            Some(working.as_path()),
        )
    })
    .await
    .map_err(|error| AppError::custom(format!("Запуск прерван: {error}")))??;

    if pid == 0 {
        return Ok(Vec::new());
    }

    // Процесс античита может поднять игру с задержкой, поэтому дерево
    // собирается повторно и дополняется найденными потомками.
    let mut tree = process_tree(pid);

    for _ in 0..5 {
        if tree.iter().any(|value| is_pid_alive(*value)) && tree.len() > 1 {
            break;
        }

        std::thread::sleep(std::time::Duration::from_millis(150));

        for child in process_tree(pid) {
            if !tree.contains(&child) {
                tree.push(child);
            }
        }
    }

    Ok(tree)
}

#[tauri::command]
pub fn hide_main_window(app: AppHandle) -> AppResult<()> {
    crate::window_behavior::hide_window(&app);

    Ok(())
}

/// Игра считается запущенной, пока жив хотя бы один процесс из дереня.
#[tauri::command]
pub fn is_game_running(pids: Vec<u32>) -> AppResult<bool> {
    Ok(pids.iter().any(|pid| is_pid_alive(*pid)))
}

#[tauri::command]
pub fn close_game(pids: Vec<u32>) -> AppResult<bool> {
    let mut closed = false;

    // Сначала потомки: иначе игра успевает перезапустить сервис античита
    let mut ordered = pids.clone();
    ordered.reverse();

    for pid in ordered {
        if terminate_pid(pid) {
            closed = true;
        }
    }

    Ok(closed)
}

fn resolve_working_dir(working_dir: Option<&str>, executable: &Path) -> PathBuf {
    working_dir
        .map(|value| PathBuf::from(value.trim()))
        .filter(|path| path.is_dir())
        .or_else(|| {
            executable
                .parent()
                .map(PathBuf::from)
                .filter(|path| path.is_dir())
        })
        .unwrap_or_else(|| PathBuf::from("."))
}

#[cfg(test)]
#[path = "game_launcher_tests.rs"]
mod tests;
