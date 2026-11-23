// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::commands::game_tuner::join_ports;.
use crate::commands::game_tuner::join_ports;
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;

// Объявляем константу EAC_DIR.
const EAC_DIR: &str = "EasyAntiCheat";
// Объявляем константу EAC_EOS_DIR.
const EAC_EOS_DIR: &str = "EasyAntiCheat_EOS";
// Объявляем константу TAIL_BYTES.
const TAIL_BYTES: usize = 256 * 1024;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
// Объявляем перечисление DiagnosticCode.
pub enum DiagnosticCode {
    // Выполняем операцию: EacAuthFailed,.
    EacAuthFailed,
    // Выполняем операцию: EacTimeout,.
    EacTimeout,
    /// EAC не пускает игру из-за лимита одновременных запусков (код 301).
    // Выполняем операцию: EacInstanceLimit,.
    EacInstanceLimit,
    // Выполняем операцию: GameliftTimeout,.
    GameliftTimeout,
    // Выполняем операцию: GameliftNotInitialized,.
    GameliftNotInitialized,
    // Выполняем операцию: NoLogsFound,.
    NoLogsFound,
    // Выполняем операцию: NoFailureMarkers,.
    NoFailureMarkers,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру DiagnosticResult.
pub struct DiagnosticResult {
    // Выполняем операцию: pub game_id: String,.
    pub game_id: String,
    // Выполняем операцию: pub code: DiagnosticCode,.
    pub code: DiagnosticCode,
    // Выполняем операцию: pub message: String,.
    pub message: String,
    // Выполняем операцию: pub recommendation: String,.
    pub recommendation: String,
    // Выполняем операцию: pub log_paths: Vec<String>,.
    pub log_paths: Vec<String>,
    /// Что приложение уже поправило при запуске.
    // Выполняем операцию: pub applied: Vec<String>,.
    pub applied: Vec<String>,
    // Закрываем блок.
}

/// Маркеры в логах EAC и GameLift. Строки приходят из разных версий клиента,
/// поэтому берём устойчивые куски, а не целые предложения.
// Объявляем константу MARKERS.
const MARKERS: &[(&str, DiagnosticCode)] = &[
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "launcher finished with: 301",.
        "launcher finished with: 301",
        // Выполняем операцию: DiagnosticCode::EacInstanceLimit,.
        DiagnosticCode::EacInstanceLimit,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "too many instances of easy anti-cheat",.
        "too many instances of easy anti-cheat",
        // Выполняем операцию: DiagnosticCode::EacInstanceLimit,.
        DiagnosticCode::EacInstanceLimit,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: ("authorization failed", DiagnosticCode::EacAuthFailed).
    ("authorization failed", DiagnosticCode::EacAuthFailed),
    // Выполняем операцию: ("eac authorization failed", DiagnosticCode::EacAuthFai.
    ("eac authorization failed", DiagnosticCode::EacAuthFailed),
    // Выполняем операцию: ("auth failed", DiagnosticCode::EacAuthFailed),.
    ("auth failed", DiagnosticCode::EacAuthFailed),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "easyanticheat service has been disabled",.
        "easyanticheat service has been disabled",
        // Выполняем операцию: DiagnosticCode::EacAuthFailed,.
        DiagnosticCode::EacAuthFailed,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "connection to eac server timed out",.
        "connection to eac server timed out",
        // Выполняем операцию: DiagnosticCode::EacTimeout,.
        DiagnosticCode::EacTimeout,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: ("eac server timed out", DiagnosticCode::EacTimeout),.
    ("eac server timed out", DiagnosticCode::EacTimeout),
    // Выполняем операцию: ("easyanticheat timeout", DiagnosticCode::EacTimeout),.
    ("easyanticheat timeout", DiagnosticCode::EacTimeout),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "websocket_connect_failure_timeout",.
        "websocket_connect_failure_timeout",
        // Выполняем операцию: DiagnosticCode::GameliftTimeout,.
        DiagnosticCode::GameliftTimeout,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "gamelift client not initialized",.
        "gamelift client not initialized",
        // Выполняем операцию: DiagnosticCode::GameliftNotInitialized,.
        DiagnosticCode::GameliftNotInitialized,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "gamelift_client_not_initialized",.
        "gamelift_client_not_initialized",
        // Выполняем операцию: DiagnosticCode::GameliftNotInitialized,.
        DiagnosticCode::GameliftNotInitialized,
        // Закрываем выражение или коллекцию.
    ),
    // Закрываем выражение или коллекцию.
];

// Объявляем функцию appdata_dir.
fn appdata_dir() -> Option<PathBuf> {
    // Выполняем операцию: std::env::var_os("APPDATA").map(PathBuf::from).
    std::env::var_os("APPDATA").map(PathBuf::from)
    // Закрываем блок.
}

// Объявляем функцию eac_log_paths.
fn eac_log_paths() -> Vec<PathBuf> {
    // Объявляем переменную Some(base) .
    let Some(base) = appdata_dir() else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную paths .
    let mut paths = Vec::new();

    // Перебираем элементы коллекции.
    for dir in [EAC_DIR, EAC_EOS_DIR] {
        // Объявляем переменную root .
        let root = base.join(dir);

        // Выполняем операцию: collect_logs(&root, 0, &mut paths);.
        collect_logs(&root, 0, &mut paths);
        // Закрываем блок.
    }

    // Выполняем операцию: paths.
    paths
    // Закрываем блок.
}

// Объявляем функцию collect_logs.
fn collect_logs(dir: &Path, depth: u8, out: &mut Vec<PathBuf>) {
    // Проверяем условие: depth > 2 || out.len() >= 12 {.
    if depth > 2 || out.len() >= 12 {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(dir) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Перебираем элементы коллекции.
    for entry in entries.flatten() {
        // Объявляем переменную path .
        let path = entry.path();

        // Проверяем условие: path.is_dir() {.
        if path.is_dir() {
            // Выполняем операцию: collect_logs(&path, depth + 1, out);.
            collect_logs(&path, depth + 1, out);

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную is_log .
        let is_log = path
            // Выполняем операцию: .extension().
            .extension()
            // Выполняем операцию: .and_then(|value| value.to_str()).
            .and_then(|value| value.to_str())
            // Выполняем операцию: .map(|value| {.
            .map(|value| {
                // Объявляем переменную lowered .
                let lowered = value.to_ascii_lowercase();

                // Выполняем операцию: lowered == "log" || lowered == "txt".
                lowered == "log" || lowered == "txt"
                // Закрываем блок.
            })
            // Выполняем операцию: .unwrap_or(false);.
            .unwrap_or(false);

        // Проверяем условие: is_log {.
        if is_log {
            // Выполняем операцию: out.push(path);.
            out.push(path);
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Хвост файла: логи античита бывают мегабайтными, а нужны последние строки.
// Читаем только хвост файла: логи античита могут занимать мегабайты,
// а для поиска маркеров нужны последние TAIL_BYTES байт.
// Объявляем функцию read_tail.
fn read_tail(path: &Path) -> AppResult<String> {
    // Подключаем модули: std::io::{Read, Seek, SeekFrom};.
    use std::io::{Read, Seek, SeekFrom};

    // Объявляем переменную file .
    let mut file = std::fs::File::open(path)?;
    // Объявляем переменную length .
    let length = file.metadata()?.len();
    // Объявляем переменную start .
    let start = length.saturating_sub(TAIL_BYTES as u64);

    // Выполняем операцию: file.seek(SeekFrom::Start(start))?;.
    file.seek(SeekFrom::Start(start))?;

    // Объявляем переменную bytes .
    let mut bytes = Vec::with_capacity((length - start) as usize);
    // Выполняем операцию: file.read_to_end(&mut bytes)?;.
    file.read_to_end(&mut bytes)?;

    // Выполняем операцию: Ok(String::from_utf8_lossy(&bytes).to_ascii_lowercase().
    Ok(String::from_utf8_lossy(&bytes).to_ascii_lowercase())
    // Закрываем блок.
}

// Объявляем функцию detect.
fn detect(text: &str) -> Option<DiagnosticCode> {
    // Перебираем элементы коллекции.
    for (needle, code) in MARKERS {
        // Проверяем условие: text.contains(needle) {.
        if text.contains(needle) {
            // Возвращаем результат из функции.
            return Some(*code);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию describe.
fn describe(code: DiagnosticCode, game_name: &str, ports: &[u16]) -> (String, String) {
    // Объявляем переменную port_list .
    let port_list = join_ports(ports);

    // Выбираем вариант по значению.
    match code {
        // Выполняем операцию: DiagnosticCode::EacAuthFailed => (.
        DiagnosticCode::EacAuthFailed => (
            // Выполняем операцию: format!("EasyAntiCheat не прошёл авторизацию при запуск.
            format!("EasyAntiCheat не прошёл авторизацию при запуске {game_name}."),
            // Выполняем операцию: "Приложение уже отключило для этой игры игровую UDP-гру.
            "Приложение уже отключило для этой игры игровую UDP-группу и \
             --ipset — они вызывают ошибку инициализации античита. Убедитесь, \
             что в каталоге игры есть EasyAntiCheat, и попробуйте другую \
             стратегию: простые fake-варианты меньше трогают UDP."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: DiagnosticCode::EacTimeout => (.
        DiagnosticCode::EacTimeout => (
            // Выполняем операцию: format!("EasyAntiCheat не дождался ответа сервера автор.
            format!("EasyAntiCheat не дождался ответа сервера авторизации ({game_name})."),
            // Выполняем операцию: "Проверьте, что домены античита идут через обход, а не .
            "Проверьте, что домены античита идут через обход, а не напрямую: \
             они уже в списке игры. Если таймаут повторяется, отключите игровую \
             UDP-группу и запустите стратегию заново."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: DiagnosticCode::EacInstanceLimit => (.
        DiagnosticCode::EacInstanceLimit => (
            // Выполняем операцию: format!(.
            format!(
                // Выполняем операцию: "Античит не пускает запуск: достигнут лимит одновременн.
                "Античит не пускает запуск: достигнут лимит одновременных сессий ({game_name})." // Закрываем выражение или коллекцию.
            ),
            // Выполняем операцию: "Сеть тут ни при чём — EasyAntiCheat успешно скачал мод.
            "Сеть тут ни при чём — EasyAntiCheat успешно скачал модуль и только \
             потом отказал. Закройте все запущенные игры и их лаунчеры, затем \
             перезапустите службу EasyAntiCheat_EOS (или перезагрузите \
             компьютер) и запустите игру снова. Не запускайте игру несколько раз \
             подряд: пока сессия не закрылась, лимит остаётся занятым."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: DiagnosticCode::GameliftTimeout => (.
        DiagnosticCode::GameliftTimeout => (
            // Выполняем операцию: format!("Таймаут соединения с серверами Amazon GameLift.
            format!("Таймаут соединения с серверами Amazon GameLift ({game_name})."),
            // Выполняем операцию: format!(.
            format!(
                // Выполняем операцию: "GameLift ходит по UDP. Проверьте, что порты {port_list.
                "GameLift ходит по UDP. Проверьте, что порты {port_list} \
                 перехватываются стратегией, и запустите игру с включённым обходом." // Закрываем выражение или коллекцию.
            ),
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: DiagnosticCode::GameliftNotInitialized => (.
        DiagnosticCode::GameliftNotInitialized => (
            // Выполняем операцию: format!("Не удалось инициализировать клиент GameLift ({.
            format!("Не удалось инициализировать клиент GameLift ({game_name})."),
            // Выполняем операцию: "Клиент не дошёл до этапа подключения. Перезапустите иг.
            "Клиент не дошёл до этапа подключения. Перезапустите игру при \
             уже запущенной стратегии — приложение запускает обход до старта игры."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: DiagnosticCode::NoLogsFound => (.
        DiagnosticCode::NoLogsFound => (
            // Выполняем операцию: format!("Логи EasyAntiCheat для {game_name} не найдены..
            format!("Логи EasyAntiCheat для {game_name} не найдены."),
            // Выполняем операцию: "Лог появляется, когда античит действительно запускался.
            "Лог появляется, когда античит действительно запускался. Запустите \
             игру через приложение и повторите диагностику."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: DiagnosticCode::NoFailureMarkers => (.
        DiagnosticCode::NoFailureMarkers => (
            // Выполняем операцию: format!("В логах {game_name} нет признаков сетевой ошиб.
            format!("В логах {game_name} нет признаков сетевой ошибки."),
            // Выполняем операцию: "Смотрите логи самой игры: если соединение рвётся уже п.
            "Смотрите логи самой игры: если соединение рвётся уже после входа, \
             проблема не в сети. Проверьте выбранную стратегию на \
             странице «Стратегии»."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        ),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру AnalyzeInput.
pub struct AnalyzeInput {
    // Выполняем операцию: pub game_id: String,.
    pub game_id: String,
    // Выполняем операцию: pub game_name: String,.
    pub game_name: String,
    // Выполняем операцию: pub ports: Vec<u16>,.
    pub ports: Vec<u16>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub applied: Vec<String>,.
    pub applied: Vec<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn analyze_game_logs(input: AnalyzeInput) -> .
pub async fn analyze_game_logs(input: AnalyzeInput) -> AppResult<DiagnosticResult> {
    // Объявляем переменную paths .
    let paths = eac_log_paths();

    // Проверяем условие: paths.is_empty() {.
    if paths.is_empty() {
        // Объявляем переменную (message, recommendation) .
        let (message, recommendation) =
            // Выполняем операцию: describe(DiagnosticCode::NoLogsFound, &input.game_name,.
            describe(DiagnosticCode::NoLogsFound, &input.game_name, &input.ports);

        // Возвращаем результат из функции.
        return Ok(DiagnosticResult {
            // Выполняем операцию: game_id: input.game_id,.
            game_id: input.game_id,
            // Выполняем операцию: code: DiagnosticCode::NoLogsFound,.
            code: DiagnosticCode::NoLogsFound,
            // Выполняем операцию: message,.
            message,
            // Выполняем операцию: recommendation,.
            recommendation,
            // Выполняем операцию: log_paths: Vec::new(),.
            log_paths: Vec::new(),
            // Выполняем операцию: applied: input.applied,.
            applied: input.applied,
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Объявляем переменную code .
    let mut code = None;

    // Перебираем элементы коллекции.
    for path in &paths {
        // Объявляем переменную text .
        let text = read_tail(path)?;

        // Проверяем условие: let Some(found) = detect(&text) {.
        if let Some(found) = detect(&text) {
            // Выполняем операцию: code = Some(found);.
            code = Some(found);

            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную code .
    let code = code.unwrap_or(DiagnosticCode::NoFailureMarkers);
    // Объявляем переменную (message, recommendation) .
    let (message, recommendation) = describe(code, &input.game_name, &input.ports);

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: game = %input.game_id,.
        game = %input.game_id,
        // Выполняем операцию: code = ?code,.
        code = ?code,
        // Выполняем операцию: "диагностика игровых логов".
        "диагностика игровых логов"
    // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(DiagnosticResult {.
    Ok(DiagnosticResult {
        // Выполняем операцию: game_id: input.game_id,.
        game_id: input.game_id,
        // Выполняем операцию: code,.
        code,
        // Выполняем операцию: message,.
        message,
        // Выполняем операцию: recommendation,.
        recommendation,
        // Выполняем операцию: log_paths: paths.
        log_paths: paths
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .map(|path| path.display().to_string()).
            .map(|path| path.display().to_string())
            // Выполняем операцию: .collect(),.
            .collect(),
        // Выполняем операцию: applied: input.applied,.
        applied: input.applied,
        // Закрываем блок.
    })
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
    // Объявляем функцию test_detects_eac_auth_failure.
    fn test_detects_eac_auth_failure() {
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: detect("error: eac authorization failed for this sessio.
            detect("error: eac authorization failed for this session"),
            // Выполняем операцию: Some(DiagnosticCode::EacAuthFailed).
            Some(DiagnosticCode::EacAuthFailed) // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_detects_gamelift_timeout.
    fn test_detects_gamelift_timeout() {
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: detect("result websocket_connect_failure_timeout"),.
            detect("result websocket_connect_failure_timeout"),
            // Выполняем операцию: Some(DiagnosticCode::GameliftTimeout).
            Some(DiagnosticCode::GameliftTimeout) // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_read_tail_lowercases_like_the_marker_table.
    fn test_read_tail_lowercases_like_the_marker_table() {
        // Объявляем переменную dir .
        let dir = std::env::temp_dir().join("zapret-log-analyzer-test");
        // Объявляем переменную path .
        let path = dir.join("loader.log");

        // Выполняем операцию: std::fs::create_dir_all(&dir).expect("temp dir");.
        std::fs::create_dir_all(&dir).expect("temp dir");
        // Выполняем операцию: std::fs::write(&path, b"EAC AUTHORIZATION FAILED").expe.
        std::fs::write(&path, b"EAC AUTHORIZATION FAILED").expect("write log");

        // Объявляем переменную tail .
        let tail = read_tail(&path).expect("read log");

        // Выполняем операцию: assert_eq!(detect(&tail), Some(DiagnosticCode::EacAuthF.
        assert_eq!(detect(&tail), Some(DiagnosticCode::EacAuthFailed));

        // Выполняем операцию: std::fs::remove_file(&path).ok();.
        std::fs::remove_file(&path).ok();
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_ignores_clean_log.
    fn test_ignores_clean_log() {
        // Выполняем операцию: assert_eq!(detect("player joined the match"), None);.
        assert_eq!(detect("player joined the match"), None);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_detects_instance_limit.
    fn test_detects_instance_limit() {
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: detect("launcher finished with: 301, 'too many instance.
            detect("launcher finished with: 301, 'too many instances'"),
            // Выполняем операцию: Some(DiagnosticCode::EacInstanceLimit).
            Some(DiagnosticCode::EacInstanceLimit) // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_reachable_cdn_is_not_treated_as_failure.
    fn test_reachable_cdn_is_not_treated_as_failure() {
        // Объявляем переменную log .
        let log = "[connection] connect result: no error (0) response code: 200 \
                   destination ip: 13.33.235.105";

        // Выполняем операцию: assert_eq!(detect(log), None);.
        assert_eq!(detect(log), None);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_recommendation_never_mentions_vpn.
    fn test_recommendation_never_mentions_vpn() {
        // Перебираем элементы коллекции.
        for (_, code) in MARKERS {
            // Объявляем переменную (message, recommendation) .
            let (message, recommendation) = describe(*code, "Outlast Trials", &[27015]);
            // Объявляем переменную haystack .
            let haystack = format!("{message} {recommendation}").to_ascii_lowercase();

            // Выполняем операцию: assert!(!haystack.contains("vpn"), "VPN упоминается в {.
            assert!(!haystack.contains("vpn"), "VPN упоминается в {code:?}");
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}
