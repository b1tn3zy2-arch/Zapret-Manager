// Подключаем модули: std::collections::HashSet;.
use std::collections::HashSet;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: once_cell::sync::Lazy;.
use once_cell::sync::Lazy;
// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;
// Подключаем модули: winapi::shared::minwindef::HKEY;.
use winapi::shared::minwindef::HKEY;
// Подключаем модули: winapi::um::winreg::{HKEY_CURRENT_USER, HKEY_LOCAL_MACH.
use winapi::um::winreg::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};

// Подключаем модули: crate::commands::game_registry::{read_registry_string, .
use crate::commands::game_registry::{read_registry_string, VIEW_32, VIEW_64};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::rate_limit::check_game_launch;.
use crate::security::rate_limit::check_game_launch;
// Подключаем модули: crate::winapi_helpers::{.
use crate::winapi_helpers::{
    // Выполняем операцию: is_image_name_running, is_pid_alive, process_tree, proc.
    is_image_name_running,
    is_pid_alive,
    process_tree,
    processes_by_image_path,
    shell_execute_game,
    // Выполняем операцию: terminate_pid,.
    terminate_pid,
    // Закрываем блок.
};
// Объявляем константу MAX_EXECUTABLE_PATH_LEN.
const MAX_EXECUTABLE_PATH_LEN: usize = 600;
// Объявляем константу MAX_LAUNCH_ARGS_LEN.
const MAX_LAUNCH_ARGS_LEN: usize = 2_048;
// Объявляем константу MAX_TRACKED_PIDS.
const MAX_TRACKED_PIDS: usize = 512;

/// Процессы, которые запустило приложение. `close_game` завершает
/// только их: иначе команда из интерфейса могла бы убить любой
/// процесс в системе, стоило только подсунуть номер.
// Объявляем константу LAUNCHED_PIDS.
static LAUNCHED_PIDS: Lazy<Mutex<HashSet<u32>>> = Lazy::new(|| Mutex::new(HashSet::new()));

// Объявляем функцию remember_launched.
fn remember_launched(pids: &[u32]) {
    // Объявляем переменную Ok(mut tracked) .
    let Ok(mut tracked) = LAUNCHED_PIDS.lock() else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Перебираем элементы коллекции.
    for pid in pids {
        // Проверяем условие: tracked.len() >= MAX_TRACKED_PIDS {.
        if tracked.len() >= MAX_TRACKED_PIDS {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Выполняем операцию: tracked.insert(*pid);.
        tracked.insert(*pid);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию forget_launched.
fn forget_launched(pids: &[u32]) {
    // Объявляем переменную Ok(mut tracked) .
    let Ok(mut tracked) = LAUNCHED_PIDS.lock() else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Перебираем элементы коллекции.
    for pid in pids {
        // Выполняем операцию: tracked.remove(pid);.
        tracked.remove(pid);
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Запускалось ли это приложение.
// Объявляем функцию is_launched_pid.
pub fn is_launched_pid(pid: u32) -> bool {
    // Выполняем операцию: LAUNCHED_PIDS.
    LAUNCHED_PIDS
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .map(|tracked| tracked.contains(&pid)).
        .map(|tracked| tracked.contains(&pid))
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

/// Проверяет путь к исполняемому файлу игры: он должен существовать,
/// быть файлом и оканчиваться на `.exe`.
// Объявляем функцию validate_executable.
pub fn validate_executable(path: &Path) -> AppResult<()> {
    // Объявляем переменную text .
    let text = path.to_string_lossy();

    // Проверяем условие: text.trim().is_empty() {.
    if text.trim().is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Путь к игре не задан"));
        // Закрываем блок.
    }

    // Проверяем условие: text.len() > MAX_EXECUTABLE_PATH_LEN {.
    if text.len() > MAX_EXECUTABLE_PATH_LEN {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Путь к игре слишком длинный"));
        // Закрываем блок.
    }

    // Проверяем условие: text.contains('\0') {.
    if text.contains('\0') {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Путь к игре содержит недопустимые символы",.
            "Путь к игре содержит недопустимые символы",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Проверяем условие: !path.is_file() {.
    if !path.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Игра не найдена: {}",.
            "Игра не найдена: {}",
            // Выполняем операцию: path.display().
            path.display() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную is_exe .
    let is_exe = path
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("exe")).
        .map(|value| value.eq_ignore_ascii_case("exe"))
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Проверяем условие: !is_exe {.
    if !is_exe {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Это не исполняемый файл игры: {}",.
            "Это не исполняемый файл игры: {}",
            // Выполняем операцию: path.display().
            path.display() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Запускает игру и возвращает дерево процессов: сам лаунчер античита и все его
/// потомки.
///
/// Возвращается именно дерево, а не один PID: `start_protected_game.exe` и
/// подобные обёртки запускают настоящую игру и сразу завершаются. Если судить
/// о жизни игры по PID такого лаунчера, кнопка «Закрыть игру» исчезала через
/// несколько секунд, хотя игра продолжала работать.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn launch_game(.
pub async fn launch_game(
    // Выполняем операцию: executable_path: String,.
    executable_path: String,
    // Выполняем операцию: launch_args: Option<String>,.
    launch_args: Option<String>,
    // Выполняем операцию: working_dir: Option<String>,.
    working_dir: Option<String>,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<u32>> {
    // Выполняем операцию: check_game_launch("launch")?;.
    check_game_launch("launch")?;

    // Объявляем переменную path .
    let path = PathBuf::from(executable_path.trim());

    // Выполняем операцию: validate_executable(&path)?;.
    validate_executable(&path)?;

    // Выполняем операцию: tracing::info!("Запуск игры: {}", path.display());.
    tracing::info!("Запуск игры: {}", path.display());

    // Объявляем переменную arguments .
    let arguments = launch_args.unwrap_or_default();

    // Проверяем условие: arguments.len() > MAX_LAUNCH_ARGS_LEN {.
    if arguments.len() > MAX_LAUNCH_ARGS_LEN {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Аргументы запуска слишком длинные"));
        // Закрываем блок.
    }

    // Проверяем условие: arguments.contains('\0') {.
    if arguments.contains('\0') {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Аргументы запуска содержат недопустимые символы",.
            "Аргументы запуска содержат недопустимые символы",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную working .
    let working = resolve_working_dir(working_dir.as_deref(), &path);

    // Игры со steam_api.dll без включённого клиента показывают фатальную
    // ошибку вместо запуска: сначала тихо поднимаем Steam, потом exe.
    // Выполняем операцию: ensure_steam_client(&path, &working).await?;.
    ensure_steam_client(&path, &working).await?;

    // Объявляем переменную pid .
    let pid = tauri::async_runtime::spawn_blocking(move || {
        // Выполняем операцию: shell_execute_game(&path.to_string_lossy(), &arguments,.
        shell_execute_game(&path.to_string_lossy(), &arguments, Some(working.as_path()))
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Запуск прерв.
    .map_err(|error| AppError::custom(format!("Запуск прерван: {error}")))??;

    // Проверяем условие: pid == 0 {.
    if pid == 0 {
        // Возвращаем результат из функции.
        return Ok(Vec::new());
        // Закрываем блок.
    }

    // Процесс античита может поднять игру с задержкой, поэтому дерево
    // собирается повторно и дополняется найденными потомками.
    // Объявляем переменную tree .
    let mut tree = process_tree(pid);

    // Перебираем элементы коллекции.
    for _ in 0..5 {
        // Проверяем условие: tree.iter().any(|value| is_pid_alive(*value)) && t.
        if tree.iter().any(|value| is_pid_alive(*value)) && tree.len() > 1 {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Выполняем операцию: std::thread::sleep(std::time::Duration::from_millis(150.
        std::thread::sleep(std::time::Duration::from_millis(150));

        // Перебираем элементы коллекции.
        for child in process_tree(pid) {
            // Проверяем условие: !tree.contains(&child) {.
            if !tree.contains(&child) {
                // Выполняем операцию: tree.push(child);.
                tree.push(child);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: remember_launched(&tree);.
    remember_launched(&tree);

    // Выполняем операцию: Ok(tree).
    Ok(tree)
    // Закрываем блок.
}

/// Имена DLL Steam API рядом с игрой: с ними игру без работающего
/// клиента не поднимут, она показывает фатальную ошибку steam_api.
// Объявляем константу STEAM_MARKERS.
const STEAM_MARKERS: [&str; 3] = ["steam_api64.dll", "steam_api.dll", "steamclient.dll"];

/// Ключи реестра, где Steam прописывает свою папку.
// Объявляем константу STEAM_DIRECTORY_KEYS.
const STEAM_DIRECTORY_KEYS: &[(HKEY, &str, &str)] = &[
    // Выполняем операцию: (HKEY_CURRENT_USER, r"Software\Valve\Steam", "SteamPath.
    (HKEY_CURRENT_USER, r"Software\Valve\Steam", "SteamPath"),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: HKEY_LOCAL_MACHINE,.
        HKEY_LOCAL_MACHINE,
        // Выполняем операцию: r"SOFTWARE\WOW6432Node\Valve\Steam",.
        r"SOFTWARE\WOW6432Node\Valve\Steam",
        // Выполняем операцию: "InstallPath",.
        "InstallPath",
        // Закрываем выражение или коллекцию.
    ),
    // Закрываем выражение или коллекцию.
];

/// Сколько ждём клиента Steam после тихого запуска.
// Объявляем константу STEAM_START_TIMEOUT_MS.
const STEAM_START_TIMEOUT_MS: u64 = 25_000;

/// Шаг проверки, запустился ли клиент.
// Объявляем константу STEAM_START_STEP_MS.
const STEAM_START_STEP_MS: u64 = 600;

/// Есть ли рядом с игрой библиотеки Steam API.
// Объявляем функцию needs_steam_client.
fn needs_steam_client(executable: &Path, working_dir: &Path) -> bool {
    // Объявляем переменную directories.
    let mut directories: Vec<&Path> = Vec::new();

    // Проверяем условие: let Some(exe_dir) = executable.parent() {.
    if let Some(exe_dir) = executable.parent() {
        // Выполняем операцию: directories.push(exe_dir);.
        directories.push(exe_dir);
        // Закрываем блок.
    }

    // Выполняем операцию: directories.push(working_dir);.
    directories.push(working_dir);

    // steam_api.dll живёт рядом с exe, но её раздают и уровнем выше:
    // проверяем пару родительских папок каждого кандидата.
    // Объявляем переменную ancestors .
    let ancestors = directories
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .flat_map(|directory| directory.ancestors().take(3));.
        .flat_map(|directory| directory.ancestors().take(3));

    // Перебираем элементы коллекции.
    for directory in ancestors {
        // Перебираем элементы коллекции.
        for marker in STEAM_MARKERS {
            // Проверяем условие: directory.join(marker).is_file() {.
            if directory.join(marker).is_file() {
                // Возвращаем результат из функции.
                return true;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: false.
    false
    // Закрываем блок.
}

/// Путь к steam.exe из реестра Steam.
// Объявляем функцию resolve_steam_exe.
fn resolve_steam_exe() -> Option<PathBuf> {
    // Объявляем переменную directory .
    let directory = read_registry_string(STEAM_DIRECTORY_KEYS, &[VIEW_64, VIEW_32])?;
    // Объявляем переменную candidate .
    let candidate = PathBuf::from(directory.trim().trim_matches('"')).join("steam.exe");

    // Выполняем операцию: candidate.is_file().then_some(candidate).
    candidate.is_file().then_some(candidate)
    // Закрываем блок.
}

/// Поднимает клиент Steam для игр со steam_api.dll.
///
/// Тихий запуск (-silent): клиент сворачивается в трей, не открывая
/// библиотеку поверх игры. Дальше ждём появления процесса до
/// 25 секунд — игрок тогда видит окно Steam, а не ошибку steam_api.
// Объявляем функцию ensure_steam_client.
async fn ensure_steam_client(executable: &Path, working_dir: &Path) -> AppResult<()> {
    // Проверяем условие: !needs_steam_client(executable, working_dir) {.
    if !needs_steam_client(executable, working_dir) {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    }

    // Проверяем условие: is_image_name_running("steam.exe") {.
    if is_image_name_running("steam.exe") {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    }

    // Объявляем переменную Some(steam_exe) .
    let Some(steam_exe) = resolve_steam_exe() else {
        // Steam не найден на стандартных путях: игра сама расскажет
        // о недостающем клиенте — перехватывать нечего.
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    };

    // Выполняем операцию: tracing::info!("Клиент Steam не запущен — стартую его п.
    tracing::info!("Клиент Steam не запущен — стартую его перед игрой");

    // Объявляем переменную spawn_path .
    let spawn_path = steam_exe.to_string_lossy().to_string();

    // Выполняем операцию: tauri::async_runtime::spawn_blocking(move || shell_exec.
    tauri::async_runtime::spawn_blocking(move || shell_execute_game(&spawn_path, "-silent", None))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Запуск прерв.
        .map_err(|error| AppError::custom(format!("Запуск прерван: {error}")))??;

    // Объявляем переменную appeared .
    let appeared = tauri::async_runtime::spawn_blocking(|| {
        // Объявляем переменную deadline .
        let deadline =
            // Выполняем операцию: std::time::Instant::now() + std::time::Duration::from_m.
            std::time::Instant::now() + std::time::Duration::from_millis(STEAM_START_TIMEOUT_MS);

        // Повторяем, пока выполняется условие.
        while std::time::Instant::now() < deadline {
            // Проверяем условие: is_image_name_running("steam.exe") {.
            if is_image_name_running("steam.exe") {
                // Возвращаем результат из функции.
                return true;
                // Закрываем блок.
            }

            // Выполняем операцию: std::thread::sleep(std::time::Duration::from_millis(STE.
            std::thread::sleep(std::time::Duration::from_millis(STEAM_START_STEP_MS));
            // Закрываем блок.
        }

        // Выполняем операцию: false.
        false
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ожидание пре.
    .map_err(|error| AppError::custom(format!("Ожидание прервано: {error}")))?;

    // Проверяем условие: !appeared {.
    if !appeared {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Клиент Steam не запустился: откройте Steam вручную и з.
            "Клиент Steam не запустился: откройте Steam вручную и запустите игру ещё раз",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Клиент Steam запущен — запускаю игру");.
    tracing::info!("Клиент Steam запущен — запускаю игру");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию hide_main_window.
pub fn hide_main_window(app: AppHandle) -> AppResult<()> {
    // Выполняем операцию: crate::window_behavior::hide_window(&app);.
    crate::window_behavior::hide_window(&app);

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Игра считается запущенной, пока жив хотя бы один процесс из дереня.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию is_game_running.
pub fn is_game_running(pids: Vec<u32>) -> AppResult<bool> {
    // Выполняем операцию: Ok(pids.iter().any(|pid| is_pid_alive(*pid))).
    Ok(pids.iter().any(|pid| is_pid_alive(*pid)))
    // Закрываем блок.
}

/// Закрывает игру. Завершаются только те процессы, которые приложение
/// само запустило: чужие PID, присланные из интерфейса, игнорируются.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию close_game.
pub fn close_game(pids: Vec<u32>) -> AppResult<bool> {
    // Выполняем операцию: check_game_launch("close")?;.
    check_game_launch("close")?;

    // Объявляем переменную closed .
    let mut closed = false;

    // Сначала потомки: иначе игра успевает перезапустить сервис античита
    // Объявляем переменную ordered .
    let mut ordered = pids.clone();
    // Выполняем операцию: ordered.reverse();.
    ordered.reverse();

    // Перебираем элементы коллекции.
    for pid in ordered {
        // Проверяем условие: !is_launched_pid(pid) {.
        if !is_launched_pid(pid) {
            // Выполняем операцию: tracing::warn!("Процесс {pid} не запускался приложением.
            tracing::warn!("Процесс {pid} не запускался приложением: не трогаем");

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: terminate_pid(pid) {.
        if terminate_pid(pid) {
            // Выполняем операцию: closed = true;.
            closed = true;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: forget_launched(&pids);.
    forget_launched(&pids);

    // Выполняем операцию: Ok(closed).
    Ok(closed)
    // Закрываем блок.
}

/// Какие из перечисленных игр сейчас запущены.
///
/// Путь сравнивается целиком, поэтому игра с тем же именем в другой
/// папке не считается запущенной.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию running_games.
pub fn running_games(paths: Vec<String>) -> Vec<String> {
    // Выполняем операцию: paths.
    paths
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|path| {.
        .filter(|path| {
            // Объявляем переменную path .
            let path = PathBuf::from(path.trim());

            // Выполняем операцию: !path.as_os_str().is_empty().
            !path.as_os_str().is_empty()
                // Выполняем операцию: && !processes_by_image_path(&path.to_string_lossy()).is.
                && !processes_by_image_path(&path.to_string_lossy()).is_empty()
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

/// Закрывает игру по пути к её файлу.
///
/// Реестр запусков живёт в памяти и после перезапуска приложения
/// пустеет: игра, запущенная вручную или до перезапуска, через него
/// не закрывалась. Поэтому игра опознаётся по полному пути к
/// исполняемому файлу — закрывается только она и её потомки.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию close_game_by_path.
pub fn close_game_by_path(executable_path: String) -> AppResult<bool> {
    // Выполняем операцию: check_game_launch("close")?;.
    check_game_launch("close")?;

    // Объявляем переменную path .
    let path = PathBuf::from(executable_path.trim());

    // Выполняем операцию: validate_executable(&path)?;.
    validate_executable(&path)?;

    // Объявляем переменную pids .
    let pids = processes_by_image_path(&path.to_string_lossy());

    // Проверяем условие: pids.is_empty() {.
    if pids.is_empty() {
        // Возвращаем результат из функции.
        return Ok(false);
        // Закрываем блок.
    }

    // Объявляем переменную closed .
    let mut closed = false;

    // Перебираем элементы коллекции.
    for pid in pids {
        // Потомки закрываются первыми: иначе игра успевает поднять
        // античит заново.
        // Перебираем элементы коллекции.
        for child in process_tree(pid).into_iter().rev() {
            // Проверяем условие: terminate_pid(child) {.
            if terminate_pid(child) {
                // Выполняем операцию: closed = true;.
                closed = true;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Игра закрыта по пути: {}", path.display.
    tracing::info!("Игра закрыта по пути: {}", path.display());

    // Выполняем операцию: Ok(closed).
    Ok(closed)
    // Закрываем блок.
}

// Объявляем функцию resolve_working_dir.
fn resolve_working_dir(working_dir: Option<&str>, executable: &Path) -> PathBuf {
    // Выполняем операцию: working_dir.
    working_dir
        // Выполняем операцию: .map(|value| PathBuf::from(value.trim())).
        .map(|value| PathBuf::from(value.trim()))
        // Выполняем операцию: .filter(|path| path.is_dir()).
        .filter(|path| path.is_dir())
        // Выполняем операцию: .or_else(|| {.
        .or_else(|| {
            // Выполняем операцию: executable.
            executable
                // Выполняем операцию: .parent().
                .parent()
                // Выполняем операцию: .map(PathBuf::from).
                .map(PathBuf::from)
                // Выполняем операцию: .filter(|path| path.is_dir()).
                .filter(|path| path.is_dir())
            // Закрываем блок.
        })
        // Выполняем операцию: .unwrap_or_else(|| PathBuf::from(".")).
        .unwrap_or_else(|| PathBuf::from("."))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_launcher_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
