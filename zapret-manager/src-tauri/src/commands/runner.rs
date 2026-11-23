// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tauri::{AppHandle, Emitter, State};.
use tauri::{AppHandle, Emitter, State};

// Подключаем модули: crate::commands::log_reader::{.
use crate::commands::log_reader::{
    // Выполняем операцию: spawn_log_reader, strategy_line, system_line, EVENT_STR.
    spawn_log_reader,
    strategy_line,
    system_line,
    EVENT_STRATEGY_LOG,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::runtime_guard;.
use crate::commands::runtime_guard;
// Подключаем модули: crate::commands::vpn_core::{disconnect_vpn_core, XrayRu.
use crate::commands::vpn_core::{disconnect_vpn_core, XrayRuntime};
// Подключаем модули: crate::commands::winws::{kill_process_tree, kill_winws_.
use crate::commands::winws::{kill_process_tree, kill_winws_by_name, now_millis};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::process_manager::{ProcessManager, RunningProcess.
use crate::process_manager::{ProcessManager, RunningProcess};
// Подключаем модули: crate::security::paths::{validate_strategy_file, valida.
use crate::security::paths::{validate_strategy_file, validate_strategy_id};
// Подключаем модули: crate::security::rate_limit::check_run_strategy;.
use crate::security::rate_limit::check_run_strategy;
// Подключаем модули: crate::security::sanitize::escape_for_cmd;.
use crate::security::sanitize::escape_for_cmd;
// Подключаем модули: crate::strategy::runner::{cleanup_games, prepare_run, r.
use crate::strategy::runner::{cleanup_games, prepare_run, resolve_winws_path, GameRequest};
// Подключаем модули: crate::winapi_helpers::{args_to_command_line, is_pid_al.
use crate::winapi_helpers::{args_to_command_line, is_pid_alive, shell_execute_runas};

// Объявляем константу EVENT_STRATEGY_STARTED.
pub const EVENT_STRATEGY_STARTED: &str = "strategy-started";
// Объявляем константу EVENT_STRATEGY_STOPPED.
pub const EVENT_STRATEGY_STOPPED: &str = "strategy-stopped";
// Объявляем константу NO_UPDATE_CHECK_ENV.
pub const NO_UPDATE_CHECK_ENV: &str = "NO_UPDATE_CHECK=1";

// Применяем атрибут к следующему объявлению.
#[derive(Default)]
// Объявляем структуру ScanState.
pub struct ScanState {
    // Выполняем операцию: folder: Mutex<Option<PathBuf>>,.
    folder: Mutex<Option<PathBuf>>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl ScanState {
    // Объявляем функцию remember.
    pub fn remember(&self, folder: &Path) {
        // Проверяем условие: let Ok(mut slot) = self.folder.lock() {.
        if let Ok(mut slot) = self.folder.lock() {
            *slot = Some(folder.to_path_buf());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию root.
    pub fn root(&self) -> Option<PathBuf> {
        // Выполняем операцию: self.folder.lock().ok().and_then(|slot| slot.clone()).
        self.folder.lock().ok().and_then(|slot| slot.clone())
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру RunResult.
pub struct RunResult {
    // Выполняем операцию: pub pid: u32,.
    pub pid: u32,
    // Выполняем операцию: pub log_path: String,.
    pub log_path: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру ProcessStatus.
pub struct ProcessStatus {
    // Выполняем операцию: pub running: bool,.
    pub running: bool,
    // Выполняем операцию: pub winws_pids: Vec<u32>,.
    pub winws_pids: Vec<u32>,
    // Выполняем операцию: pub started_at: Option<u64>,.
    pub started_at: Option<u64>,
    // Выполняем операцию: pub uptime: Option<u64>,.
    pub uptime: Option<u64>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру RunningInfo.
pub struct RunningInfo {
    // Выполняем операцию: pub strategy_id: String,.
    pub strategy_id: String,
    // Выполняем операцию: pub pid: u32,.
    pub pid: u32,
    // Выполняем операцию: pub log_path: String,.
    pub log_path: String,
    // Выполняем операцию: pub started_at: u64,.
    pub started_at: u64,
    // Выполняем операцию: pub alive: bool,.
    pub alive: bool,
    // Закрываем блок.
}

// Объявляем функцию log_dir.
pub fn log_dir() -> PathBuf {
    // Выполняем операцию: std::env::temp_dir().join("zapret-manager").join("logs".
    std::env::temp_dir().join("zapret-manager").join("logs")
    // Закрываем блок.
}

// Объявляем функцию build_arguments.
pub fn build_arguments(bat_path: &Path, log_path: &Path) -> AppResult<String> {
    // Объявляем переменную bat .
    let bat = escape_for_cmd(&bat_path.to_string_lossy())?;
    // Объявляем переменную log .
    let log = escape_for_cmd(&log_path.to_string_lossy())?;

    // Выполняем операцию: Ok(format!(.
    Ok(format!(
        // Выполняем операцию: "/d /s /c \"set \"{NO_UPDATE_CHECK_ENV}\" && call {bat}.
        "/d /s /c \"set \"{NO_UPDATE_CHECK_ENV}\" && call {bat} > {log} 2>&1\"" // Закрываем выражение или коллекцию.
    ))
    // Закрываем блок.
}

// Объявляем функцию ensure_log_dir.
async fn ensure_log_dir() -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = log_dir();

    // Проверяем условие: !dir.exists() {.
    if !dir.exists() {
        // Выполняем операцию: tokio::fs::create_dir_all(&dir).
        tokio::fs::create_dir_all(&dir)
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .map_err(AppError::Io)?;.
            .map_err(AppError::Io)?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(dir).
    Ok(dir)
    // Закрываем блок.
}

// Объявляем функцию ensure_empty_log.
async fn ensure_empty_log(log_path: &Path) -> AppResult<()> {
    // Проверяем условие: let Some(parent) = log_path.parent() {.
    if let Some(parent) = log_path.parent() {
        // Проверяем условие: !parent.exists() {.
        if !parent.exists() {
            // Выполняем операцию: tokio::fs::create_dir_all(parent).
            tokio::fs::create_dir_all(parent)
                // Выполняем операцию: .await.
                .await
                // Выполняем операцию: .map_err(AppError::Io)?;.
                .map_err(AppError::Io)?;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: tokio::fs::write(log_path, "").await.map_err(AppError::.
    tokio::fs::write(log_path, "").await.map_err(AppError::Io)
    // Закрываем блок.
}

// Объявляем функцию spawn_blocking_kill_tree.
async fn spawn_blocking_kill_tree(pid: u32) -> AppResult<bool> {
    // Выполняем операцию: tokio::task::spawn_blocking(move || kill_process_tree(p.
    tokio::task::spawn_blocking(move || kill_process_tree(pid))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string())).
        .map_err(|error| AppError::custom(error.to_string()))
    // Закрываем блок.
}

/// Гасит VPN перед стартом стратегии.
///
/// Порядок: сначала сбрасываем туннель и системный прокси, потом
/// guard проверяет стратегию. Так режимы не пересекаются по
/// маршрутам.
// Объявляем функцию stop_vpn_before_strategy.
fn stop_vpn_before_strategy(xray: &XrayRuntime) {
    // Проверяем условие: !xray.xray.is_running() {.
    if !xray.xray.is_running() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match disconnect_vpn_core(xray) {
        // Выполняем операцию: Ok(_) => tracing::info!("VPN остановлен перед стартом с.
        Ok(_) => tracing::info!("VPN остановлен перед стартом стратегии"),
        // Выполняем операцию: Err(error) => tracing::warn!("VPN не остановился перед .
        Err(error) => tracing::warn!("VPN не остановился перед стратегией: {error}"),
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Гасит все запущенные стратегии, кроме `keep`, и возвращает число
/// остановленных процессов.
///
/// Режимы не могут работать одновременно: раньше второй запуск просто
/// блокировали («остановите текущую стратегию»), теперь приложение
/// само выключает старую стратегию — и запускает новую.
// Объявляем функцию stop_other_strategies.
async fn stop_other_strategies(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: state: &ProcessManager,.
    state: &ProcessManager,
    // Выполняем операцию: keep: &str,.
    keep: &str,
    // Выполняем операцию: reason: &str,.
    reason: &str,
    // Закрываем выражение или коллекцию.
) -> usize {
    // Объявляем переменную stopped_total .
    let mut stopped_total = 0usize;

    // Перебираем элементы коллекции.
    for strategy_id in state.ids() {
        // Пустой `keep` — это «остановить вообще всех»: случай
        // подготовки VPN, где не оставляем ни одну стратегию.
        // Проверяем условие: !keep.is_empty() && strategy_id == keep {.
        if !keep.is_empty() && strategy_id == keep {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную killed .
        let killed = match state.terminate(&strategy_id) {
            // Выполняем операцию: Some(pid) => {.
            Some(pid) => {
                // Объявляем переменную stopped .
                let stopped = spawn_blocking_kill_tree(pid)
                    // Выполняем операцию: .await.
                    .await
                    // Выполняем операцию: .map_err(|error| {.
                    .map_err(|error| {
                        // Выполняем операцию: tracing::warn!("Не удалось остановить {strategy_id}: {e.
                        tracing::warn!("Не удалось остановить {strategy_id}: {error}");

                        // Выполняем операцию: error.
                        error
                        // Закрываем блок.
                    })
                    // Выполняем операцию: .unwrap_or(false);.
                    .unwrap_or(false);

                // Выполняем операцию: usize::from(stopped).
                usize::from(stopped)
                // Закрываем блок.
            }
            // Выполняем операцию: None => 0,.
            None => 0,
            // Закрываем блок.
        };

        // Объявляем переменную _ .
        let _ = app.emit(EVENT_STRATEGY_STOPPED, &strategy_id);
        // Объявляем переменную _ .
        let _ = app.emit(
            // Выполняем операцию: EVENT_STRATEGY_LOG,.
            EVENT_STRATEGY_LOG,
            // Выполняем операцию: vec![strategy_line(.
            vec![strategy_line(
                // Выполняем операцию: &strategy_id,.
                &strategy_id,
                // Выполняем операцию: "warn",.
                "warn",
                // Выполняем операцию: format!("Стратегия остановлена автоматически: {reason}".
                format!("Стратегия остановлена автоматически: {reason}"),
                // Закрываем выражение или коллекцию.
            )],
            // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: stopped_total += killed;.
        stopped_total += killed;
        // Закрываем блок.
    }

    // Проверяем условие: stopped_total > 0 {.
    if stopped_total > 0 {
        // Выполняем операцию: cleanup_games();.
        cleanup_games();
        // Закрываем блок.
    }

    // Выполняем операцию: stopped_total.
    stopped_total
    // Закрываем блок.
}

/// Останавливает все стратегии перед подъемом VPN-туннеля.
// Выполняем операцию: pub async fn stop_strategies_for_vpn(app: &AppHandle, s.
pub async fn stop_strategies_for_vpn(app: &AppHandle, state: &ProcessManager) -> usize {
    // Выполняем операцию: stop_other_strategies(app, state, "", "включается VPN").
    stop_other_strategies(app, state, "", "включается VPN").await
    // Закрываем блок.
}

/// Останавливает другие стратегии перед запуском новой.
// Объявляем функцию stop_strategies_for_strategy.
async fn stop_strategies_for_strategy(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: state: &ProcessManager,.
    state: &ProcessManager,
    // Выполняем операцию: keep: &str,.
    keep: &str,
    // Закрываем выражение или коллекцию.
) -> usize {
    // Выполняем операцию: stop_other_strategies(app, state, keep, "запускается др.
    stop_other_strategies(app, state, keep, "запускается другая стратегия").await
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn run_strategy(.
pub async fn run_strategy(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Выполняем операцию: scan: State<'_, ScanState>,.
    scan: State<'_, ScanState>,
    // Выполняем операцию: xray: State<'_, XrayRuntime>,.
    xray: State<'_, XrayRuntime>,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Выполняем операцию: path: String,.
    path: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<RunResult> {
    // Выполняем операцию: stop_vpn_before_strategy(xray.inner());.
    stop_vpn_before_strategy(xray.inner());
    // Выполняем операцию: stop_strategies_for_strategy(&app, state.inner(), &stra.
    stop_strategies_for_strategy(&app, state.inner(), &strategy_id).await;
    // Выполняем операцию: runtime_guard::validate(.
    runtime_guard::validate(
        // Выполняем операцию: runtime_guard::RuntimeTarget::Strategy,.
        runtime_guard::RuntimeTarget::Strategy,
        // Выполняем операцию: xray.inner(),.
        xray.inner(),
        // Выполняем операцию: state.inner(),.
        state.inner(),
        // Закрываем выражение или коллекцию.
    )?;
    // Выполняем операцию: validate_strategy_id(&strategy_id)?;.
    validate_strategy_id(&strategy_id)?;
    // Выполняем операцию: check_run_strategy(&strategy_id)?;.
    check_run_strategy(&strategy_id)?;

    // Проверяем условие: state.contains(&strategy_id) {.
    if state.contains(&strategy_id) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Стратегия уже запущена"));
        // Закрываем блок.
    }

    // Объявляем переменную allowed_root .
    let allowed_root = scan.root();
    // Объявляем переменную bat_path .
    let bat_path = validate_strategy_file(Path::new(&path), allowed_root.as_deref())?;

    // Объявляем переменную dir .
    let dir = ensure_log_dir().await?;
    // Объявляем переменную started_at .
    let started_at = now_millis();
    // Объявляем переменную log_path .
    let log_path = dir.join(format!("{strategy_id}_{started_at}.log"));

    // Выполняем операцию: ensure_empty_log(&log_path).await?;.
    ensure_empty_log(&log_path).await?;

    // Объявляем переменную arguments .
    let arguments = build_arguments(&bat_path, &log_path)?;
    // Объявляем переменную working_dir .
    let working_dir = bat_path.parent().map(Path::to_path_buf);

    // Выполняем операцию: tracing::info!("Запуск cmd.exe для стратегии {strategy_.
    tracing::info!("Запуск cmd.exe для стратегии {strategy_id}");

    // Объявляем переменную launched .
    let launched = tokio::task::spawn_blocking({
        // Объявляем переменную arguments .
        let arguments = arguments.clone();
        // Выполняем операцию: move || shell_execute_runas("cmd.exe", &arguments, work.
        move || shell_execute_runas("cmd.exe", &arguments, working_dir.as_deref())
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?;.
    .map_err(|error| AppError::custom(error.to_string()))?;

    // Объявляем переменную (handle, pid) .
    let (handle, pid) = launched?;

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Стратегия {strategy_id} запущена, cmd PID {pid}, лог {.
        "Стратегия {strategy_id} запущена, cmd PID {pid}, лог {}",
        // Выполняем операцию: log_path.display().
        log_path.display() // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: state.insert(.
    state.insert(
        // Выполняем операцию: strategy_id.clone(),.
        strategy_id.clone(),
        // Выполняем операцию: RunningProcess {.
        RunningProcess {
            // Выполняем операцию: pid,.
            pid,
            // Выполняем операцию: log_path: log_path.clone(),.
            log_path: log_path.clone(),
            // Выполняем операцию: started_at,.
            started_at,
            // Выполняем операцию: handle,.
            handle,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: spawn_log_reader(app.clone(), strategy_id.clone(), log_.
    spawn_log_reader(app.clone(), strategy_id.clone(), log_path.clone());

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_STRATEGY_STARTED, &strategy_id);

    // Выполняем операцию: Ok(RunResult {.
    Ok(RunResult {
        // Выполняем операцию: pid,.
        pid,
        // Выполняем операцию: log_path: log_path.to_string_lossy().to_string(),.
        log_path: log_path.to_string_lossy().to_string(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию games_summary.
fn games_summary(games: &crate::strategy::games_hostlist::GamesPayload) -> String {
    // Объявляем переменную target .
    let target = games
        // Выполняем операцию: .hostlist.
        .hostlist
        // Выполняем операцию: .as_ref().
        .as_ref()
        // Выполняем операцию: .map(|path| path.display().to_string()).
        .map(|path| path.display().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: format!(.
    format!(
        // Выполняем операцию: "Игры: домены {}, IP {} → {}",.
        "Игры: домены {}, IP {} → {}",
        // Выполняем операцию: games.domains_count, games.ips_count, target.
        games.domains_count,
        games.ips_count,
        target // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn run_strategy_native(.
pub async fn run_strategy_native(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Выполняем операцию: scan: State<'_, ScanState>,.
    scan: State<'_, ScanState>,
    // Выполняем операцию: xray: State<'_, XrayRuntime>,.
    xray: State<'_, XrayRuntime>,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Выполняем операцию: path: String,.
    path: String,
    // Выполняем операцию: games: Vec<GameRequest>,.
    games: Vec<GameRequest>,
    // Закрываем выражение или коллекцию.
) -> AppResult<RunResult> {
    // Выполняем операцию: stop_vpn_before_strategy(xray.inner());.
    stop_vpn_before_strategy(xray.inner());
    // Выполняем операцию: stop_strategies_for_strategy(&app, state.inner(), &stra.
    stop_strategies_for_strategy(&app, state.inner(), &strategy_id).await;
    // Выполняем операцию: runtime_guard::validate(.
    runtime_guard::validate(
        // Выполняем операцию: runtime_guard::RuntimeTarget::Strategy,.
        runtime_guard::RuntimeTarget::Strategy,
        // Выполняем операцию: xray.inner(),.
        xray.inner(),
        // Выполняем операцию: state.inner(),.
        state.inner(),
        // Закрываем выражение или коллекцию.
    )?;
    // Выполняем операцию: validate_strategy_id(&strategy_id)?;.
    validate_strategy_id(&strategy_id)?;
    // Выполняем операцию: check_run_strategy(&strategy_id)?;.
    check_run_strategy(&strategy_id)?;

    // Проверяем условие: state.contains(&strategy_id) {.
    if state.contains(&strategy_id) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Стратегия уже запущена"));
        // Закрываем блок.
    }

    // Объявляем переменную allowed_root .
    let allowed_root = scan.root();
    // Объявляем переменную bat_path .
    let bat_path = validate_strategy_file(Path::new(&path), allowed_root.as_deref())?;
    // Объявляем переменную working_dir .
    let working_dir = bat_path.parent().map(Path::to_path_buf);

    // Объявляем переменную content .
    let content = tokio::fs::read_to_string(&bat_path)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(AppError::Io)?;.
        .map_err(AppError::Io)?;

    // Объявляем переменную dir .
    let dir = ensure_log_dir().await?;
    // Объявляем переменную started_at .
    let started_at = now_millis();
    // Объявляем переменную log_path .
    let log_path = dir.join(format!("{strategy_id}_{started_at}.log"));

    // Выполняем операцию: ensure_empty_log(&log_path).await?;.
    ensure_empty_log(&log_path).await?;

    // Объявляем переменную prepared .
    let prepared = prepare_run(&bat_path, &content, &games, &log_path)?;
    // Объявляем переменную fallback_dir .
    let fallback_dir = working_dir.as_deref().unwrap_or_else(|| Path::new("."));
    // Объявляем переменную winws_path .
    let winws_path = resolve_winws_path(&prepared.config, fallback_dir);

    // Проверяем условие: !winws_path.is_file() {.
    if !winws_path.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "winws.exe не найден: {}",.
            "winws.exe не найден: {}",
            // Выполняем операцию: winws_path.display().
            winws_path.display() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную command_line .
    let command_line = args_to_command_line(&prepared.arguments);

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Запуск winws.exe напрямую для стратегии {strategy_id}:.
        "Запуск winws.exe напрямую для стратегии {strategy_id}: {}",
        // Выполняем операцию: prepared.config.source_filename.
        prepared.config.source_filename // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную launched .
    let launched = tokio::task::spawn_blocking({
        // Объявляем переменную program .
        let program = winws_path.to_string_lossy().to_string();
        // Объявляем переменную arguments .
        let arguments = command_line.clone();
        // Выполняем операцию: move || shell_execute_runas(&program, &arguments, worki.
        move || shell_execute_runas(&program, &arguments, working_dir.as_deref())
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?;.
    .map_err(|error| AppError::custom(error.to_string()))?;

    // Объявляем переменную (handle, pid) .
    let (handle, pid) = launched?;

    // Объявляем переменную startup_lines.
    let mut startup_lines: Vec<crate::commands::log_reader::LogLine> = vec![strategy_line(
        // Выполняем операцию: &strategy_id,.
        &strategy_id,
        // Выполняем операцию: "success",.
        "success",
        // Выполняем операцию: format!(.
        format!(
            // Выполняем операцию: "Встроенный движок: winws.exe запущен напрямую (PID {pi.
            "Встроенный движок: winws.exe запущен напрямую (PID {pid}), групп фильтров {}",
            // Выполняем операцию: prepared.config.filter_groups_count().
            prepared.config.filter_groups_count() // Закрываем выражение или коллекцию.
        ),
        // Закрываем выражение или коллекцию.
    )];

    // Проверяем условие: prepared.games.domains_count > 0 || prepared.games.
    if prepared.games.domains_count > 0 || prepared.games.ips_count > 0 {
        // Выполняем операцию: startup_lines.push(strategy_line(.
        startup_lines.push(strategy_line(
            // Выполняем операцию: &strategy_id,.
            &strategy_id,
            // Выполняем операцию: "info",.
            "info",
            // Выполняем операцию: games_summary(&prepared.games),.
            games_summary(&prepared.games),
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_STRATEGY_LOG, startup_lines);

    // Выполняем операцию: state.insert(.
    state.insert(
        // Выполняем операцию: strategy_id.clone(),.
        strategy_id.clone(),
        // Выполняем операцию: RunningProcess {.
        RunningProcess {
            // Выполняем операцию: pid,.
            pid,
            // Выполняем операцию: log_path: log_path.clone(),.
            log_path: log_path.clone(),
            // Выполняем операцию: started_at,.
            started_at,
            // Выполняем операцию: handle,.
            handle,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: spawn_log_reader(app.clone(), strategy_id.clone(), log_.
    spawn_log_reader(app.clone(), strategy_id.clone(), log_path.clone());

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_STRATEGY_STARTED, &strategy_id);

    // Выполняем операцию: Ok(RunResult {.
    Ok(RunResult {
        // Выполняем операцию: pid,.
        pid,
        // Выполняем операцию: log_path: log_path.to_string_lossy().to_string(),.
        log_path: log_path.to_string_lossy().to_string(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию strategy_is_native.
fn strategy_is_native(content: &str, bat_path: &Path) -> bool {
    // Объявляем переменную filename .
    let filename = bat_path
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .map(|name| name.to_string_lossy().to_string()).
        .map(|name| name.to_string_lossy().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();
    // Объявляем переменную dir .
    let dir = bat_path.parent().unwrap_or_else(|| Path::new("."));

    // Выполняем операцию: crate::strategy::parser::parse_bat(content, &filename, .
    crate::strategy::parser::parse_bat(content, &filename, dir).is_ok()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn run_strategy_auto(.
pub async fn run_strategy_auto(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Выполняем операцию: scan: State<'_, ScanState>,.
    scan: State<'_, ScanState>,
    // Выполняем операцию: xray: State<'_, XrayRuntime>,.
    xray: State<'_, XrayRuntime>,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Выполняем операцию: path: String,.
    path: String,
    // Выполняем операцию: games: Vec<GameRequest>,.
    games: Vec<GameRequest>,
    // Закрываем выражение или коллекцию.
) -> AppResult<RunResult> {
    // Выполняем операцию: stop_vpn_before_strategy(xray.inner());.
    stop_vpn_before_strategy(xray.inner());
    // Выполняем операцию: stop_strategies_for_strategy(&app, state.inner(), &stra.
    stop_strategies_for_strategy(&app, state.inner(), &strategy_id).await;
    // Выполняем операцию: runtime_guard::validate(.
    runtime_guard::validate(
        // Выполняем операцию: runtime_guard::RuntimeTarget::Strategy,.
        runtime_guard::RuntimeTarget::Strategy,
        // Выполняем операцию: xray.inner(),.
        xray.inner(),
        // Выполняем операцию: state.inner(),.
        state.inner(),
        // Закрываем выражение или коллекцию.
    )?;
    // Выполняем операцию: validate_strategy_id(&strategy_id)?;.
    validate_strategy_id(&strategy_id)?;

    // Объявляем переменную allowed_root .
    let allowed_root = scan.root();
    // Объявляем переменную bat_path .
    let bat_path = validate_strategy_file(Path::new(&path), allowed_root.as_deref())?;
    // Объявляем переменную content .
    let content = tokio::fs::read_to_string(&bat_path)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(AppError::Io)?;.
        .map_err(AppError::Io)?;

    // Проверяем условие: strategy_is_native(&content, &bat_path) {.
    if strategy_is_native(&content, &bat_path) {
        // Возвращаем результат из функции.
        return run_strategy_native(app, state, scan, xray, strategy_id, path, games).await;
        // Закрываем блок.
    }

    // Выполняем операцию: run_legacy_with_games(app, state, xray, strategy_id, ba.
    run_legacy_with_games(app, state, xray, strategy_id, bat_path, games).await
    // Закрываем блок.
}

// Объявляем функцию run_legacy_with_games.
async fn run_legacy_with_games(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Выполняем операцию: xray: State<'_, XrayRuntime>,.
    xray: State<'_, XrayRuntime>,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Выполняем операцию: bat_path: PathBuf,.
    bat_path: PathBuf,
    // Выполняем операцию: games: Vec<GameRequest>,.
    games: Vec<GameRequest>,
    // Закрываем выражение или коллекцию.
) -> AppResult<RunResult> {
    // Выполняем операцию: stop_vpn_before_strategy(xray.inner());.
    stop_vpn_before_strategy(xray.inner());
    // Выполняем операцию: stop_strategies_for_strategy(&app, state.inner(), &stra.
    stop_strategies_for_strategy(&app, state.inner(), &strategy_id).await;
    // Выполняем операцию: runtime_guard::validate(.
    runtime_guard::validate(
        // Выполняем операцию: runtime_guard::RuntimeTarget::Strategy,.
        runtime_guard::RuntimeTarget::Strategy,
        // Выполняем операцию: xray.inner(),.
        xray.inner(),
        // Выполняем операцию: state.inner(),.
        state.inner(),
        // Закрываем выражение или коллекцию.
    )?;
    // Выполняем операцию: check_run_strategy(&strategy_id)?;.
    check_run_strategy(&strategy_id)?;

    // Проверяем условие: state.contains(&strategy_id) {.
    if state.contains(&strategy_id) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Стратегия уже запущена"));
        // Закрываем блок.
    }

    // Объявляем переменную working_dir .
    let working_dir = bat_path.parent().map(Path::to_path_buf);

    // Проверяем условие: !games.is_empty() {.
    if !games.is_empty() {
        // Объявляем переменную names.
        let names: Vec<&str> = games.iter().map(|game| game.name.as_str()).collect();

        // Выполняем операцию: tracing::info!("Инъекция игр (режим совместимости): {}".
        tracing::info!("Инъекция игр (режим совместимости): {}", names.join(", "));

        // Перебираем элементы коллекции.
        for game in &games {
            // Выполняем операцию: crate::commands::injector::inject_outlast(.
            crate::commands::injector::inject_outlast(
                // Выполняем операцию: bat_path.to_string_lossy().to_string(),.
                bat_path.to_string_lossy().to_string(),
                // Выполняем операцию: game.domains.clone(),.
                game.domains.clone(),
                // Выполняем операцию: game.ips.clone(),.
                game.ips.clone(),
                // Выполняем операцию: game.ports.clone(),.
                game.ports.clone(),
                // Выполняем операцию: true,.
                true,
                // Закрываем выражение или коллекцию.
            )
            // Выполняем операцию: .await?;.
            .await?;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную dir .
    let dir = ensure_log_dir().await?;
    // Объявляем переменную started_at .
    let started_at = now_millis();
    // Объявляем переменную log_path .
    let log_path = dir.join(format!("{strategy_id}_{started_at}.log"));

    // Выполняем операцию: ensure_empty_log(&log_path).await?;.
    ensure_empty_log(&log_path).await?;

    // Объявляем переменную arguments .
    let arguments = build_arguments(&bat_path, &log_path)?;

    // Выполняем операцию: tracing::info!("Запуск cmd.exe для стратегии {strategy_.
    tracing::info!("Запуск cmd.exe для стратегии {strategy_id} (режим совместимости)");

    // Объявляем переменную launched .
    let launched = tokio::task::spawn_blocking({
        // Объявляем переменную arguments .
        let arguments = arguments.clone();
        // Выполняем операцию: move || shell_execute_runas("cmd.exe", &arguments, work.
        move || shell_execute_runas("cmd.exe", &arguments, working_dir.as_deref())
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?;.
    .map_err(|error| AppError::custom(error.to_string()))?;

    // Объявляем переменную (handle, pid) .
    let (handle, pid) = launched?;

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Стратегия {strategy_id} запущена, cmd PID {pid}, лог {.
        "Стратегия {strategy_id} запущена, cmd PID {pid}, лог {}",
        // Выполняем операцию: log_path.display().
        log_path.display() // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = app.emit(
        // Выполняем операцию: EVENT_STRATEGY_LOG,.
        EVENT_STRATEGY_LOG,
        // Выполняем операцию: vec![strategy_line(.
        vec![strategy_line(
            // Выполняем операцию: &strategy_id,.
            &strategy_id,
            // Выполняем операцию: "info",.
            "info",
            // Выполняем операцию: "Режим совместимости: запуск через cmd.exe".to_string().
            "Режим совместимости: запуск через cmd.exe".to_string(),
            // Закрываем выражение или коллекцию.
        )],
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: state.insert(.
    state.insert(
        // Выполняем операцию: strategy_id.clone(),.
        strategy_id.clone(),
        // Выполняем операцию: RunningProcess {.
        RunningProcess {
            // Выполняем операцию: pid,.
            pid,
            // Выполняем операцию: log_path: log_path.clone(),.
            log_path: log_path.clone(),
            // Выполняем операцию: started_at,.
            started_at,
            // Выполняем операцию: handle,.
            handle,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: spawn_log_reader(app.clone(), strategy_id.clone(), log_.
    spawn_log_reader(app.clone(), strategy_id.clone(), log_path.clone());

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_STRATEGY_STARTED, &strategy_id);

    // Выполняем операцию: Ok(RunResult {.
    Ok(RunResult {
        // Выполняем операцию: pid,.
        pid,
        // Выполняем операцию: log_path: log_path.to_string_lossy().to_string(),.
        log_path: log_path.to_string_lossy().to_string(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn stop_strategy(.
pub async fn stop_strategy(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<usize> {
    // Выполняем операцию: validate_strategy_id(&strategy_id)?;.
    validate_strategy_id(&strategy_id)?;

    // Убиваем только своё дерево процессов. Общий поиск по имени
    // останавливал ещё и чужие winws.exe, запущенные вручную.
    // Объявляем переменную killed .
    let killed = match state.terminate(&strategy_id) {
        // Выполняем операцию: Some(pid) => {.
        Some(pid) => {
            // Объявляем переменную stopped .
            let stopped = spawn_blocking_kill_tree(pid).await?;

            // Выполняем операцию: usize::from(stopped).
            usize::from(stopped)
            // Закрываем блок.
        }
        // Выполняем операцию: None => 0,.
        None => 0,
        // Закрываем блок.
    };

    // Выполняем операцию: cleanup_games();.
    cleanup_games();

    // Объявляем переменную message .
    let message = if killed > 0 {
        // Выполняем операцию: "Стратегия остановлена.".to_string().
        "Стратегия остановлена.".to_string()
    // Закрываем блок.
    } else {
        // Выполняем операцию: "Стратегия не была запущена".to_string().
        "Стратегия не была запущена".to_string()
        // Закрываем блок.
    };

    // Выполняем операцию: tracing::info!("Стратегия {strategy_id} остановлена: {m.
    tracing::info!("Стратегия {strategy_id} остановлена: {message}");

    // Объявляем переменную level .
    let level = if killed > 0 { "warn" } else { "info" };
    // Объявляем переменную _ .
    let _ = app.emit(
        // Выполняем операцию: EVENT_STRATEGY_LOG,.
        EVENT_STRATEGY_LOG,
        // Выполняем операцию: vec![strategy_line(&strategy_id, level, message)],.
        vec![strategy_line(&strategy_id, level, message)],
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную _ .
    let _ = app.emit(EVENT_STRATEGY_STOPPED, &strategy_id);

    // Выполняем операцию: Ok(killed).
    Ok(killed)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn check_strategy_status(.
pub async fn check_strategy_status(
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Выполняем операцию: strategy_id: String,.
    strategy_id: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<ProcessStatus> {
    // Выполняем операцию: validate_strategy_id(&strategy_id)?;.
    validate_strategy_id(&strategy_id)?;

    // Статус — про конкретную стратегию. Наличие любого
    // winws.exe в системе не делает нашу стратегию запущенной.
    // Объявляем переменную Some(entry) .
    let Some(entry) = state.remove(&strategy_id) else {
        // Возвращаем результат из функции.
        return Ok(ProcessStatus {
            // Выполняем операцию: running: false,.
            running: false,
            // Выполняем операцию: winws_pids: Vec::new(),.
            winws_pids: Vec::new(),
            // Выполняем операцию: started_at: None,.
            started_at: None,
            // Выполняем операцию: uptime: None,.
            uptime: None,
            // Закрываем блок.
        });
        // Закрываем блок.
    };

    // Объявляем переменную pid .
    let pid = entry.pid;
    // Объявляем переменную started_at .
    let started_at = entry.started_at;
    // Объявляем переменную running .
    let running = entry.handle.is_running();

    // Проверяем условие: running {.
    if running {
        // Выполняем операцию: state.insert(strategy_id, entry);.
        state.insert(strategy_id, entry);

        // Возвращаем результат из функции.
        return Ok(ProcessStatus {
            // Выполняем операцию: running: true,.
            running: true,
            // Выполняем операцию: winws_pids: vec![pid],.
            winws_pids: vec![pid],
            // Выполняем операцию: started_at: Some(started_at),.
            started_at: Some(started_at),
            // Выполняем операцию: uptime: Some(now_millis().saturating_sub(started_at)),.
            uptime: Some(now_millis().saturating_sub(started_at)),
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(ProcessStatus {.
    Ok(ProcessStatus {
        // Выполняем операцию: running: false,.
        running: false,
        // Выполняем операцию: winws_pids: Vec::new(),.
        winws_pids: Vec::new(),
        // Выполняем операцию: started_at: None,.
        started_at: None,
        // Выполняем операцию: uptime: None,.
        uptime: None,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn list_running_processes(.
pub async fn list_running_processes(
    // Выполняем операцию: state: State<'_, ProcessManager>,.
    state: State<'_, ProcessManager>,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<RunningInfo>> {
    // Объявляем переменную entries.
    let mut entries: Vec<RunningInfo> = Vec::new();

    // Перебираем элементы коллекции.
    for strategy_id in state.ids() {
        // Проверяем условие: let Some(entry) = state.remove(&strategy_id) {.
        if let Some(entry) = state.remove(&strategy_id) {
            // Объявляем переменную info .
            let info = RunningInfo {
                // Выполняем операцию: strategy_id: strategy_id.clone(),.
                strategy_id: strategy_id.clone(),
                // Выполняем операцию: pid: entry.pid,.
                pid: entry.pid,
                // Выполняем операцию: log_path: entry.log_path.to_string_lossy().to_string(),.
                log_path: entry.log_path.to_string_lossy().to_string(),
                // Выполняем операцию: started_at: entry.started_at,.
                started_at: entry.started_at,
                // Выполняем операцию: alive: is_pid_alive(entry.pid),.
                alive: is_pid_alive(entry.pid),
                // Закрываем блок.
            };
            // Выполняем операцию: state.insert(strategy_id, entry);.
            state.insert(strategy_id, entry);
            // Выполняем операцию: entries.push(info);.
            entries.push(info);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(entries).
    Ok(entries)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn kill_all_processes(state: State<'_, Proces.
pub async fn kill_all_processes(state: State<'_, ProcessManager>) -> AppResult<usize> {
    // Объявляем переменную tracked .
    let tracked = state.clear();
    // Объявляем переменную killed .
    let killed = kill_winws_for_shutdown().await;

    // Выполняем операцию: tracing::info!("Завершение приложения: процессов в мене.
    tracing::info!("Завершение приложения: процессов в менеджере {tracked}, winws.exe {killed}");

    // Выполняем операцию: Ok(tracked + killed).
    Ok(tracked + killed)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn kill_winws_for_shutdown() -> usize {.
pub async fn kill_winws_for_shutdown() -> usize {
    // Выполняем операцию: tokio::task::spawn_blocking(kill_winws_by_name).
    tokio::task::spawn_blocking(kill_winws_by_name)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .unwrap_or(0).
        .unwrap_or(0)
    // Закрываем блок.
}

// Выполняем операцию: pub async fn cleanup_orphans(app: &AppHandle, manager: .
pub async fn cleanup_orphans(app: &AppHandle, manager: &ProcessManager) {
    // Выполняем операцию: cleanup_games();.
    cleanup_games();

    // Объявляем переменную stale .
    let stale = manager.ids();

    // Проверяем условие: !stale.is_empty() {.
    if !stale.is_empty() {
        // Выполняем операцию: tracing::warn!(.
        tracing::warn!(
            // Выполняем операцию: "Найдено {} незакрытых процессов от прошлого запуска",.
            "Найдено {} незакрытых процессов от прошлого запуска",
            // Выполняем операцию: stale.len().
            stale.len() // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: manager.clear();.
        manager.clear();
        // Закрываем блок.
    }

    // Объявляем переменную killed .
    let killed = kill_winws_by_name();

    // Проверяем условие: killed > 0 {.
    if killed > 0 {
        // Выполняем операцию: tracing::warn!("Остановлено осиротевших winws.exe: {kil.
        tracing::warn!("Остановлено осиротевших winws.exe: {killed}");
        // Объявляем переменную line .
        let line = system_line(
            // Выполняем операцию: "warn",.
            "warn",
            // Выполняем операцию: format!(.
            format!(
                // Выполняем операцию: "При запуске приложения остановлено {killed} процессов .
                "При запуске приложения остановлено {killed} процессов winws.exe, оставшихся от прошлого сеанса"
            // Закрываем выражение или коллекцию.
            ),
        // Закрываем выражение или коллекцию.
        );
        // Объявляем переменную _ .
        let _ = app.emit(EVENT_STRATEGY_LOG, vec![line]);
        // Закрываем блок.
    }

    // Объявляем переменную dir .
    let dir = log_dir();

    // Проверяем условие: let Ok(mut entries) = tokio::fs::read_dir(&dir).aw.
    if let Ok(mut entries) = tokio::fs::read_dir(&dir).await {
        // Повторяем, пока выполняется условие.
        while let Ok(Some(entry)) = entries.next_entry().await {
            // Объявляем переменную path .
            let path = entry.path();

            // Проверяем условие: path.extension().and_then(|value| value.to_str()) .
            if path.extension().and_then(|value| value.to_str()) == Some("log") {
                // Объявляем переменную _ .
                let _ = tokio::fs::remove_file(&path).await;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "runner_tests.rs"]
// Выполняем операцию: mod runner_tests;.
mod runner_tests;
