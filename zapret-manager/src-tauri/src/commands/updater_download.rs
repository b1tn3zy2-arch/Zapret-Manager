use std::time::{Duration, Instant};

use futures_util::StreamExt;
use serde::Serialize;
use tauri::{AppHandle, Emitter, State};

use crate::commands::updater::{UpdateState, download_path};
use crate::error::{AppError, AppResult};
use crate::security::url_validator::validate_host;
use crate::security::{security_denied, MAX_ARCHIVE_BYTES};

pub const EVENT_UPDATE_PROGRESS: &str = "update-download-progress";

const USER_AGENT: &str = "Zapret-Manager/0.1.0";
const PROGRESS_INTERVAL: Duration = Duration::from_millis(100);
const DOWNLOAD_TIMEOUT: Duration = Duration::from_secs(600);

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
    pub percent: f32,
    pub speed: u64,
    pub eta: Option<u64>,
}

pub fn validate_download_url(url: &str) -> AppResult<String> {
    validate_host(url)
}

pub fn build_progress(downloaded: u64, total: u64, started: Instant) -> DownloadProgress {    let elapsed = started.elapsed().as_secs_f64().max(0.001);
    let speed = (downloaded as f64 / elapsed) as u64;
    let percent = if total == 0 {
        0.0
    } else {
        (downloaded as f64 / total as f64 * 100.0).clamp(0.0, 100.0) as f32
    };

    let eta = match (speed, total) {
        (value, total) if value > 0 && total > 0 => {
            Some(total.saturating_sub(downloaded) / value)
        }
        _ => None,
    };

    DownloadProgress {
        downloaded,
        total,
        percent,
        speed,
        eta,
    }
}

#[tauri::command]
pub async fn download_update(
    app: AppHandle,
    state: State<'_, UpdateState>,
    url: String,
    version: String,
) -> AppResult<String> {
    let validated = validate_download_url(&url)?;

    let monitor = state.inner().clone();
    monitor.reset();

    let target = download_path(&version);

    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let client = reqwest::Client::builder()
        .timeout(DOWNLOAD_TIMEOUT)
        .user_agent(USER_AGENT)
        .build()
        .map_err(|error| AppError::custom(error.to_string()))?;

    let response = client
        .get(validated.as_str())
        .send()
        .await
        .map_err(|error| AppError::custom(format!("Скачивание не началось: {error}")))?;

    if !response.status().is_success() {
        return Err(AppError::custom(format!(
            "Сервер ответил статусом {}",
            response.status().as_u16()
        )));
    }

    let total = response.content_length().unwrap_or(0);

    if total > MAX_ARCHIVE_BYTES {
        return Err(security_denied(
            "download-size",
            &format!("{total} байт при лимите {MAX_ARCHIVE_BYTES}"),
        ));
    }

    let started = Instant::now();
    let mut downloaded: u64 = 0;
    let mut last_emit = Instant::now() - PROGRESS_INTERVAL;
    let mut file = std::fs::File::create(&target)?;
    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        if monitor.is_cancelled() {
            drop(file);
            let _ = std::fs::remove_file(&target);

            return Err(AppError::custom("Скачивание отменено"));
        }

        let chunk = chunk.map_err(|error| AppError::custom(format!("Ошибка сети: {error}")))?;

        downloaded = downloaded.saturating_add(chunk.len() as u64);
        std::io::Write::write_all(&mut file, &chunk)?;

        if last_emit.elapsed() >= PROGRESS_INTERVAL {
            last_emit = Instant::now();
            let _ = app.emit(
                EVENT_UPDATE_PROGRESS,
                build_progress(downloaded, total, started),
            );
        }
    }

    let _ = app.emit(
        EVENT_UPDATE_PROGRESS,
        build_progress(downloaded, total, started),
    );

    tracing::info!("Обновление скачано: {downloaded} байт");

    Ok(target.to_string_lossy().to_string())
}

#[cfg(test)]
#[path = "updater_download_tests.rs"]
mod tests;