// Подключаем модули: std::time::{Duration, Instant};.
use std::time::{Duration, Instant};

// Подключаем модули: futures_util::StreamExt;.
use futures_util::StreamExt;
// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: sha2::{Digest, Sha256};.
use sha2::{Digest, Sha256};
// Подключаем модули: tauri::{AppHandle, Emitter, State};.
use tauri::{AppHandle, Emitter, State};

// Подключаем модули: crate::commands::updater::{download_path, UpdateState};.
use crate::commands::updater::{download_path, UpdateState};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::url_validator::validate_host;.
use crate::security::url_validator::validate_host;
// Подключаем модули: crate::security::{security_denied, MAX_ARCHIVE_BYTES};.
use crate::security::{security_denied, MAX_ARCHIVE_BYTES};

// Объявляем константу EVENT_UPDATE_PROGRESS.
pub const EVENT_UPDATE_PROGRESS: &str = "update-download-progress";

// Объявляем константу USER_AGENT.
const USER_AGENT: &str = concat!("Zapret-Manager/", env!("CARGO_PKG_VERSION"));
// Объявляем константу PROGRESS_INTERVAL.
const PROGRESS_INTERVAL: Duration = Duration::from_millis(100);
// Объявляем константу DOWNLOAD_TIMEOUT.
const DOWNLOAD_TIMEOUT: Duration = Duration::from_secs(600);

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру DownloadProgress.
pub struct DownloadProgress {
    // Выполняем операцию: pub downloaded: u64,.
    pub downloaded: u64,
    // Выполняем операцию: pub total: u64,.
    pub total: u64,
    // Выполняем операцию: pub percent: f32,.
    pub percent: f32,
    // Выполняем операцию: pub speed: u64,.
    pub speed: u64,
    // Выполняем операцию: pub eta: Option<u64>,.
    pub eta: Option<u64>,
    // Закрываем блок.
}

// Объявляем функцию validate_download_url.
pub fn validate_download_url(url: &str) -> AppResult<String> {
    // Выполняем операцию: validate_host(url).
    validate_host(url)
    // Закрываем блок.
}

/// Сверяет скачанный файл с хешем `sha256:...`, который отдал
/// GitHub. Пустой ожидаемый хеш — отказ: файл без проверки
/// целостности запускать нельзя.
// Объявляем функцию verify_digest.
pub fn verify_digest(actual: &str, expected: &str) -> bool {
    // Объявляем переменную expected .
    let expected = expected.trim();

    // Проверяем условие: expected.is_empty() {.
    if expected.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: actual.eq_ignore_ascii_case(expected).
    actual.eq_ignore_ascii_case(expected)
    // Закрываем блок.
}

// Объявляем функцию build_progress.
pub fn build_progress(downloaded: u64, total: u64, started: Instant) -> DownloadProgress {
    // Объявляем переменную elapsed .
    let elapsed = started.elapsed().as_secs_f64().max(0.001);
    // Объявляем переменную speed .
    let speed = (downloaded as f64 / elapsed) as u64;
    // Объявляем переменную percent .
    let percent = if total == 0 {
        // Выполняем операцию: 0.0.
        0.0
    // Закрываем блок.
    } else {
        // Выполняем операцию: (downloaded as f64 / total as f64 * 100.0).clamp(0.0, 1.
        (downloaded as f64 / total as f64 * 100.0).clamp(0.0, 100.0) as f32
        // Закрываем блок.
    };

    // Объявляем переменную eta .
    let eta = match (speed, total) {
        // Выполняем операцию: (value, total) if value > 0 && total > 0 => Some(total..
        (value, total) if value > 0 && total > 0 => Some(total.saturating_sub(downloaded) / value),
        // Выполняем операцию: _ => None,.
        _ => None,
        // Закрываем блок.
    };

    // Выполняем операцию: DownloadProgress {.
    DownloadProgress {
        // Выполняем операцию: downloaded,.
        downloaded,
        // Выполняем операцию: total,.
        total,
        // Выполняем операцию: percent,.
        percent,
        // Выполняем операцию: speed,.
        speed,
        // Выполняем операцию: eta,.
        eta,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn download_update(.
pub async fn download_update(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, UpdateState>,.
    state: State<'_, UpdateState>,
    // Выполняем операцию: url: String,.
    url: String,
    // Выполняем операцию: version: String,.
    version: String,
    // Выполняем операцию: expected_digest: String,.
    expected_digest: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<String> {
    // Объявляем переменную validated .
    let validated = validate_download_url(&url)?;

    // Проверяем условие: expected_digest.trim().is_empty() {.
    if expected_digest.trim().is_empty() {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "download-digest",.
            "download-digest",
            // Выполняем операцию: "GitHub не отдал хеш архива: загрузка без проверки цело.
            "GitHub не отдал хеш архива: загрузка без проверки целостности запрещена",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную monitor .
    let monitor = state.inner().clone();
    // Выполняем операцию: monitor.reset();.
    monitor.reset();

    // Объявляем переменную target .
    let target = download_path(&version);

    // Проверяем условие: let Some(parent) = target.parent() {.
    if let Some(parent) = target.parent() {
        // Выполняем операцию: std::fs::create_dir_all(parent)?;.
        std::fs::create_dir_all(parent)?;
        // Закрываем блок.
    }

    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .connect_timeout(std::time::Duration::from_secs(10)).
        .connect_timeout(std::time::Duration::from_secs(10))
        // Выполняем операцию: .timeout(DOWNLOAD_TIMEOUT).
        .timeout(DOWNLOAD_TIMEOUT)
        // Выполняем операцию: .user_agent(USER_AGENT).
        .user_agent(USER_AGENT)
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?;.
        .map_err(|error| AppError::custom(error.to_string()))?;

    // Объявляем переменную response .
    let response = client
        // Выполняем операцию: .get(validated.as_str()).
        .get(validated.as_str())
        // Выполняем операцию: .send().
        .send()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Скачивание н.
        .map_err(|error| AppError::custom(format!("Скачивание не началось: {error}")))?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Сервер ответил статусом {}",.
            "Сервер ответил статусом {}",
            // Выполняем операцию: response.status().as_u16().
            response.status().as_u16() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную total .
    let total = response.content_length().unwrap_or(0);

    // Проверяем условие: total > MAX_ARCHIVE_BYTES {.
    if total > MAX_ARCHIVE_BYTES {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "download-size",.
            "download-size",
            // Выполняем операцию: &format!("{total} байт при лимите {MAX_ARCHIVE_BYTES}").
            &format!("{total} байт при лимите {MAX_ARCHIVE_BYTES}"),
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную started .
    let started = Instant::now();
    // Объявляем переменную downloaded.
    let mut downloaded: u64 = 0;
    // Объявляем переменную last_emit .
    let mut last_emit = Instant::now() - PROGRESS_INTERVAL;
    // Объявляем переменную file .
    let mut file = std::fs::File::create(&target)?;
    // Объявляем переменную stream .
    let mut stream = response.bytes_stream();
    // Объявляем переменную hasher .
    let mut hasher = Sha256::new();

    // Повторяем, пока выполняется условие.
    while let Some(chunk) = stream.next().await {
        // Проверяем условие: monitor.is_cancelled() {.
        if monitor.is_cancelled() {
            // Выполняем операцию: drop(file);.
            drop(file);
            // Объявляем переменную _ .
            let _ = std::fs::remove_file(&target);

            // Возвращаем результат из функции.
            return Err(AppError::custom("Скачивание отменено"));
            // Закрываем блок.
        }

        // Объявляем переменную chunk .
        let chunk = chunk.map_err(|error| AppError::custom(format!("Ошибка сети: {error}")))?;

        // Выполняем операцию: downloaded = downloaded.saturating_add(chunk.len() as u.
        downloaded = downloaded.saturating_add(chunk.len() as u64);
        // Выполняем операцию: hasher.update(&chunk);.
        hasher.update(&chunk);
        // Выполняем операцию: std::io::Write::write_all(&mut file, &chunk)?;.
        std::io::Write::write_all(&mut file, &chunk)?;

        // Проверяем условие: last_emit.elapsed() >= PROGRESS_INTERVAL {.
        if last_emit.elapsed() >= PROGRESS_INTERVAL {
            // Выполняем операцию: last_emit = Instant::now();.
            last_emit = Instant::now();
            // Объявляем переменную _ .
            let _ = app.emit(
                // Выполняем операцию: EVENT_UPDATE_PROGRESS,.
                EVENT_UPDATE_PROGRESS,
                // Выполняем операцию: build_progress(downloaded, total, started),.
                build_progress(downloaded, total, started),
                // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = app.emit(
        // Выполняем операцию: EVENT_UPDATE_PROGRESS,.
        EVENT_UPDATE_PROGRESS,
        // Выполняем операцию: build_progress(downloaded, total, started),.
        build_progress(downloaded, total, started),
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную actual .
    let actual = format!("sha256:{}", hex::encode(hasher.finalize()));

    // Проверяем условие: !verify_digest(&actual, &expected_digest) {.
    if !verify_digest(&actual, &expected_digest) {
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&target);

        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "download-digest",.
            "download-digest",
            // Выполняем операцию: &format!("Хеш архива не совпал: ожидался {expected_dige.
            &format!("Хеш архива не совпал: ожидался {expected_digest}, получен {actual}"),
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Обновление скачано и проверено: {downlo.
    tracing::info!("Обновление скачано и проверено: {downloaded} байт");

    // Выполняем операцию: Ok(target.to_string_lossy().to_string()).
    Ok(target.to_string_lossy().to_string())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "updater_download_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
