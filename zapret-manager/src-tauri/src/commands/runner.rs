use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

use crate::commands::log_reader::{
    spawn_log_reader, strategy_line, system_line, EVENT_STRATEGY_LOG,
};
use crate::commands::winws::{
    find_winws_pids, kill_winws_by_name, now_millis,
};
use crate::error::{AppError, AppResult};
use crate::process_manager::{ProcessManager, RunningProcess};
use crate::security::paths::{validate_strategy_file, validate_strategy_id};
use crate::security::rate_limit::check_run_strategy;
use crate::security::sanitize::escape_for_cmd;
use crate::winapi_helpers::{is_pid_alive, shell_execute_runas};

pub const EVENT_STRATEGY_STARTED: &str = "strategy-started";
pub const EVENT_STRATEGY_STOPPED: &str = "strategy-stopped";
pub const NO_UPDATE_CHECK_ENV: &str = "NO_UPDATE_CHECK=1";

#[derive(Default)]
pub struct ScanState {
    folder: Mutex<Option<PathBuf>>,
}

impl ScanState {
    pub fn remember(&self, folder: &Path) {
        if let Ok(mut slot) = self.folder.lock() {
            *slot = Some(folder.to_path_buf());
        }
    }

    pub fn root(&self) -> Option<PathBuf> {
        self.folder.lock().ok().and_then(|slot| slot.clone())
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunResult {
    pub pid: u32,
    pub log_path: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessStatus {
    pub running: bool,
    pub winws_pids: Vec<u32>,
    pub started_at: Option<u64>,
    pub uptime: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunningInfo {
    pub strategy_id: String,
    pub pid: u32,
    pub log_path: String,
    pub started_at: u64,
    pub alive: bool,
}

pub fn log_dir() -> PathBuf {
    std::env::temp_dir().join("zapret-manager").join("logs")
}

pub fn build_arguments(bat_path: &Path, log_path: &Path) -> AppResult<String> {
    let bat = escape_for_cmd(&bat_path.to_string_lossy())?;
    let log = escape_for_cmd(&log_path.to_string_lossy())?;

    Ok(format!(
        "/d /s /c \"set \"{NO_UPDATE_CHECK_ENV}\" && call {bat} > {log} 2>&1\""
    ))
}

async fn ensure_log_dir() -> AppResult<PathBuf> {
    let dir = log_dir();

    if !dir.exists() {
        tokio::fs::create_dir_all(&dir)
            .await
            .map_err(AppError::Io)?;
    }

    Ok(dir)
}

async fn ensure_empty_log(log_path: &Path) -> AppResult<()> {
    if let Some(parent) = log_path.parent() {
        if !parent.exists() {
            tokio::fs::create_dir_all(parent).await.map_err(AppError::Io)?;
        }
    }

    tokio::fs::write(log_path, "")
        .await
        .map_err(AppError::Io)
}

async fn spawn_blocking_kill() -> AppResult<usize> {
    tokio::task::spawn_blocking(kill_winws_by_name)
        .await
        .map_err(|error| AppError::custom(error.to_string()))
}

#[tauri::command]
pub async fn run_strategy(
    app: AppHandle,
    state: State<'_, ProcessManager>,
    scan: State<'_, ScanState>,
    strategy_id: String,
    path: String,
) -> AppResult<RunResult> {
    validate_strategy_id(&strategy_id)?;
    check_run_strategy(&strategy_id)?;

    if state.contains(&strategy_id) {
        return Err(AppError::custom("Стратегия уже запущена"));
    }

    let allowed_root = scan.root();
    let bat_path = validate_strategy_file(Path::new(&path), allowed_root.as_deref())?;

    let dir = ensure_log_dir().await?;
    let started_at = now_millis();
    let log_path = dir.join(format!("{strategy_id}_{started_at}.log"));

    ensure_empty_log(&log_path).await?;

    let arguments = build_arguments(&bat_path, &log_path)?;
    let working_dir = bat_path.parent().map(Path::to_path_buf);

    tracing::info!("Запуск cmd.exe для стратегии {strategy_id}");

    let launched = tokio::task::spawn_blocking({
        let arguments = arguments.clone();
        move || shell_execute_runas("cmd.exe", &arguments, working_dir.as_deref())
    })
    .await
    .map_err(|error| AppError::custom(error.to_string()))?;

    let (handle, pid) = launched?;

    tracing::info!(
        "Стратегия {strategy_id} запущена, cmd PID {pid}, лог {}",
        log_path.display()
    );

    state.insert(
        strategy_id.clone(),
        RunningProcess {
            pid,
            log_path: log_path.clone(),
            started_at,
            handle,
        },
    );

    spawn_log_reader(app.clone(), strategy_id.clone(), log_path.clone());

    let _ = app.emit(EVENT_STRATEGY_STARTED, &strategy_id);

    Ok(RunResult {
        pid,
        log_path: log_path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub async fn stop_strategy(
    app: AppHandle,
    state: State<'_, ProcessManager>,
    strategy_id: String,
) -> AppResult<usize> {
    validate_strategy_id(&strategy_id)?;

    state.terminate(&strategy_id);

    let killed = spawn_blocking_kill().await?;

    let message = if killed > 0 {
        format!(
            "Остановлены все процессы winws.exe ({killed}). Если вы запускали zapret вручную — он тоже остановлен."
        )
    } else {
        "Процессы winws.exe не найдены".to_string()
    };

    tracing::info!("Стратегия {strategy_id} остановлена: {message}");

    let level = if killed > 0 { "warn" } else { "info" };
    let _ = app.emit(
        EVENT_STRATEGY_LOG,
        vec![strategy_line(&strategy_id, level, message)],
    );
    let _ = app.emit(EVENT_STRATEGY_STOPPED, &strategy_id);

    Ok(killed)
}

#[tauri::command]
pub async fn check_strategy_status(
    state: State<'_, ProcessManager>,
    strategy_id: String,
) -> AppResult<ProcessStatus> {
    validate_strategy_id(&strategy_id)?;

    let winws_pids = find_winws_pids();
    let running = !winws_pids.is_empty();
    let entry = state.remove(&strategy_id);

    if !running {
        return Ok(ProcessStatus {
            running: false,
            winws_pids,
            started_at: None,
            uptime: None,
        });
    }

    let started_at = entry.as_ref().map(|item| item.started_at);

    if let Some(item) = entry {
        state.insert(strategy_id, item);
    }

    Ok(ProcessStatus {
        running: true,
        winws_pids,
        started_at,
        uptime: started_at.map(|value| now_millis().saturating_sub(value)),
    })
}

#[tauri::command]
pub async fn list_running_processes(
    state: State<'_, ProcessManager>,
) -> AppResult<Vec<RunningInfo>> {
    let mut entries: Vec<RunningInfo> = Vec::new();

    for strategy_id in state.ids() {
        if let Some(entry) = state.remove(&strategy_id) {
            let info = RunningInfo {
                strategy_id: strategy_id.clone(),
                pid: entry.pid,
                log_path: entry.log_path.to_string_lossy().to_string(),
                started_at: entry.started_at,
                alive: is_pid_alive(entry.pid),
            };
            state.insert(strategy_id, entry);
            entries.push(info);
        }
    }

    Ok(entries)
}

#[tauri::command]
pub async fn kill_all_processes(
    state: State<'_, ProcessManager>,
) -> AppResult<usize> {
    let tracked = state.clear();
    let killed = kill_winws_for_shutdown().await;

    tracing::info!(
        "Завершение приложения: процессов в менеджере {tracked}, winws.exe {killed}"
    );

    Ok(tracked + killed)
}

pub async fn kill_winws_for_shutdown() -> usize {
    tokio::task::spawn_blocking(kill_winws_by_name)
        .await
        .unwrap_or(0)
}

pub async fn cleanup_orphans(app: &AppHandle, manager: &ProcessManager) {
    let stale = manager.ids();

    if !stale.is_empty() {
        tracing::warn!(
            "Найдено {} незакрытых процессов от прошлого запуска",
            stale.len()
        );
        manager.clear();
    }

    let killed = kill_winws_by_name();

    if killed > 0 {
        tracing::warn!("Остановлено осиротевших winws.exe: {killed}");
        let line = system_line(
            "warn",
            format!(
                "При запуске приложения остановлено {killed} процессов winws.exe, оставшихся от прошлого сеанса"
            ),
        );
        let _ = app.emit(EVENT_STRATEGY_LOG, vec![line]);
    }

    let dir = log_dir();

    if let Ok(mut entries) = tokio::fs::read_dir(&dir).await {
        while let Ok(Some(entry)) = entries.next_entry().await {
            let path = entry.path();

            if path.extension().and_then(|value| value.to_str()) == Some("log") {
                let _ = tokio::fs::remove_file(&path).await;
            }
        }
    }
}

#[cfg(test)]
#[path = "runner_tests.rs"]
mod runner_tests;