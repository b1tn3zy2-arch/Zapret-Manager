use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::error::AppResult;
use crate::commands::game_tuner::join_ports;

const EAC_DIR: &str = "EasyAntiCheat";
const EAC_EOS_DIR: &str = "EasyAntiCheat_EOS";
const TAIL_BYTES: usize = 256 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DiagnosticCode {
    EacAuthFailed,
    EacTimeout,
    /// EAC не пускает игру из-за лимита одновременных запусков (код 301).
    EacInstanceLimit,
    GameliftTimeout,
    GameliftNotInitialized,
    NoLogsFound,
    NoFailureMarkers,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticResult {
    pub game_id: String,
    pub code: DiagnosticCode,
    pub message: String,
    pub recommendation: String,
    pub log_paths: Vec<String>,
    /// Что приложение уже поправило при запуске.
    pub applied: Vec<String>,
}

/// Маркеры в логах EAC и GameLift. Строки приходят из разных версий клиента,
/// поэтому берём устойчивые куски, а не целые предложения.
const MARKERS: &[(&str, DiagnosticCode)] = &[
    ("launcher finished with: 301", DiagnosticCode::EacInstanceLimit),
    ("too many instances of easy anti-cheat", DiagnosticCode::EacInstanceLimit),
    ("authorization failed", DiagnosticCode::EacAuthFailed),
    ("eac authorization failed", DiagnosticCode::EacAuthFailed),
    ("auth failed", DiagnosticCode::EacAuthFailed),
    ("easyanticheat service has been disabled", DiagnosticCode::EacAuthFailed),
    ("connection to eac server timed out", DiagnosticCode::EacTimeout),
    ("eac server timed out", DiagnosticCode::EacTimeout),
    ("easyanticheat timeout", DiagnosticCode::EacTimeout),
    ("websocket_connect_failure_timeout", DiagnosticCode::GameliftTimeout),
    ("gamelift client not initialized", DiagnosticCode::GameliftNotInitialized),
    ("gamelift_client_not_initialized", DiagnosticCode::GameliftNotInitialized),
];

fn appdata_dir() -> Option<PathBuf> {
    std::env::var_os("APPDATA").map(PathBuf::from)
}

fn eac_log_paths() -> Vec<PathBuf> {
    let Some(base) = appdata_dir() else {
        return Vec::new();
    };

    let mut paths = Vec::new();

    for dir in [EAC_DIR, EAC_EOS_DIR] {
        let root = base.join(dir);

        collect_logs(&root, 0, &mut paths);
    }

    paths
}

fn collect_logs(dir: &Path, depth: u8, out: &mut Vec<PathBuf>) {
    if depth > 2 || out.len() >= 12 {
        return;
    }

    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();

        if path.is_dir() {
            collect_logs(&path, depth + 1, out);

            continue;
        }

        let is_log = path
            .extension()
            .and_then(|value| value.to_str())
            .map(|value| {
                let lowered = value.to_ascii_lowercase();

                lowered == "log" || lowered == "txt"
            })
            .unwrap_or(false);

        if is_log {
            out.push(path);
        }
    }
}

/// Хвост файла: логи античита бывают мегабайтными, а нужны последние строки.
fn read_tail(path: &Path) -> AppResult<String> {
    let bytes = std::fs::read(path)?;

    let start = bytes.len().saturating_sub(TAIL_BYTES);

    Ok(String::from_utf8_lossy(&bytes[start..]).to_ascii_lowercase())
}

fn detect(text: &str) -> Option<DiagnosticCode> {
    for (needle, code) in MARKERS {
        if text.contains(needle) {
            return Some(*code);
        }
    }

    None
}

fn describe(code: DiagnosticCode, game_name: &str, ports: &[u16]) -> (String, String) {
    let port_list = join_ports(ports);

    match code {
        DiagnosticCode::EacAuthFailed => (
            format!(
                "EasyAntiCheat не прошёл авторизацию при запуске {game_name}."
            ),
            "Приложение уже отключило для этой игры игровую UDP-группу и \
             --ipset — они вызывают ошибку инициализации античита. Убедитесь, \
             что в каталоге игры есть EasyAntiCheat, и попробуйте другую \
             стратегию: простые fake-варианты меньше трогают UDP."
                .to_string(),
        ),
        DiagnosticCode::EacTimeout => (
            format!("EasyAntiCheat не дождался ответа сервера авторизации ({game_name})."),
            "Проверьте, что домены античита идут через обход, а не напрямую: \
             они уже в списке игры. Если таймаут повторяется, отключите игровую \
             UDP-группу и запустите стратегию заново."
                .to_string(),
        ),
        DiagnosticCode::EacInstanceLimit => (
            format!("Античит не пускает запуск: достигнут лимит одновременных сессий ({game_name})."),
            "Сеть тут ни при чём — EasyAntiCheat успешно скачал модуль и только \
             потом отказал. Закройте все запущенные игры и их лаунчеры, затем \
             перезапустите службу EasyAntiCheat_EOS (или перезагрузите \
             компьютер) и запустите игру снова. Не запускайте игру несколько раз \
             подряд: пока сессия не закрылась, лимит остаётся занятым."
                .to_string(),
        ),
        DiagnosticCode::GameliftTimeout => (
            format!("Таймаут соединения с серверами Amazon GameLift ({game_name})."),
            format!(
                "GameLift ходит по UDP. Проверьте, что порты {port_list} \
                 перехватываются стратегией, и запустите игру с включённым обходом."
            ),
        ),
        DiagnosticCode::GameliftNotInitialized => (
            format!("Не удалось инициализировать клиент GameLift ({game_name})."),
            "Клиент не дошёл до этапа подключения. Перезапустите игру при \
             уже запущенной стратегии — приложение запускает обход до старта игры."
                .to_string(),
        ),
        DiagnosticCode::NoLogsFound => (
            format!("Логи EasyAntiCheat для {game_name} не найдены."),
            "Лог появляется, когда античит действительно запускался. Запустите \
             игру через приложение и повторите диагностику."
                .to_string(),
        ),
        DiagnosticCode::NoFailureMarkers => (
            format!("В логах {game_name} нет признаков сетевой ошибки."),
            "Смотрите логи самой игры: если соединение рвётся уже после входа, \
             проблема не в сети. Проверьте выбранную стратегию на \
             странице «Стратегии»."
                .to_string(),
        ),
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyzeInput {
    pub game_id: String,
    pub game_name: String,
    pub ports: Vec<u16>,
    #[serde(default)]
    pub applied: Vec<String>,
}

#[tauri::command]
pub async fn analyze_game_logs(input: AnalyzeInput) -> AppResult<DiagnosticResult> {
    let paths = eac_log_paths();

    if paths.is_empty() {
        let (message, recommendation) =
            describe(DiagnosticCode::NoLogsFound, &input.game_name, &input.ports);

        return Ok(DiagnosticResult {
            game_id: input.game_id,
            code: DiagnosticCode::NoLogsFound,
            message,
            recommendation,
            log_paths: Vec::new(),
            applied: input.applied,
        });
    }

    let mut code = None;

    for path in &paths {
        let text = read_tail(path)?;

        if let Some(found) = detect(&text) {
            code = Some(found);

            break;
        }
    }

    let code = code.unwrap_or(DiagnosticCode::NoFailureMarkers);
    let (message, recommendation) = describe(code, &input.game_name, &input.ports);

    tracing::info!(
        game = %input.game_id,
        code = ?code,
        "диагностика игровых логов"
    );

    Ok(DiagnosticResult {
        game_id: input.game_id,
        code,
        message,
        recommendation,
        log_paths: paths
            .iter()
            .map(|path| path.display().to_string())
            .collect(),
        applied: input.applied,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detects_eac_auth_failure() {
        assert_eq!(
            detect("error: eac authorization failed for this session"),
            Some(DiagnosticCode::EacAuthFailed)
        );
    }

    #[test]
    fn test_detects_gamelift_timeout() {
        assert_eq!(
            detect("result websocket_connect_failure_timeout"),
            Some(DiagnosticCode::GameliftTimeout)
        );
    }

    #[test]
    fn test_read_tail_lowercases_like_the_marker_table() {
        let dir = std::env::temp_dir().join("zapret-log-analyzer-test");
        let path = dir.join("loader.log");

        std::fs::create_dir_all(&dir).expect("temp dir");
        std::fs::write(&path, b"EAC AUTHORIZATION FAILED").expect("write log");

        let tail = read_tail(&path).expect("read log");

        assert_eq!(
            detect(&tail),
            Some(DiagnosticCode::EacAuthFailed)
        );

        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn test_ignores_clean_log() {
        assert_eq!(detect("player joined the match"), None);
    }

    #[test]
    fn test_detects_instance_limit() {
        assert_eq!(
            detect("launcher finished with: 301, 'too many instances'"),
            Some(DiagnosticCode::EacInstanceLimit)
        );
    }

    #[test]
    fn test_reachable_cdn_is_not_treated_as_failure() {
        let log = "[connection] connect result: no error (0) response code: 200 \
                   destination ip: 13.33.235.105";

        assert_eq!(detect(log), None);
    }

    #[test]
    fn test_recommendation_never_mentions_vpn() {
        for (_, code) in MARKERS {
            let (message, recommendation) = describe(*code, "Outlast Trials", &[27015]);
            let haystack = format!("{message} {recommendation}").to_ascii_lowercase();

            assert!(!haystack.contains("vpn"), "VPN упоминается в {code:?}");
        }
    }
}