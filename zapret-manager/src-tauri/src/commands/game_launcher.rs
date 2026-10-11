use std::path::{Path, PathBuf};

use tauri::AppHandle;

use crate::error::{AppError, AppResult};
use crate::winapi_helpers::{is_pid_alive, shell_execute_normal};

#[tauri::command]
pub async fn launch_game(
    executable_path: String,
    launch_args: Option<String>,
    working_dir: Option<String>,
) -> AppResult<u32> {
    let path = PathBuf::from(executable_path.trim());

    if !path.is_file() {
        return Err(AppError::custom(format!(
            "Игра не найдена: {}",
            path.display()
        )));
    }

    let working = resolve_working_dir(working_dir.as_deref(), &path);
    let arguments = launch_args.unwrap_or_default();

    tauri::async_runtime::spawn_blocking(move || {
        shell_execute_normal(
            &path.to_string_lossy(),
            &arguments,
            Some(working.as_path()),
        )
    })
    .await
    .map_err(|error| AppError::custom(format!("Запуск прерван: {error}")))?
}

#[tauri::command]
pub fn hide_main_window(app: AppHandle) -> AppResult<()> {
    crate::window_behavior::hide_window(&app);

    Ok(())
}

#[tauri::command]
pub fn is_game_running(pid: u32) -> AppResult<bool> {
    Ok(is_pid_alive(pid))
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