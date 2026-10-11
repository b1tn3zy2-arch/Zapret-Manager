use std::path::{Path, PathBuf};

use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use tauri::AppHandle;

use super::game_known::{known_cover_url, resolve_cover_file};
use crate::commands::resources::{app_dir};
use crate::commands::resources_fs::resources_dir;
use crate::error::{AppError, AppResult};

pub const COVERS_SUBDIR: &str = "covers";
pub const COVER_URL_TEMPLATE: &str =
    "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_600x900.jpg";
pub const MAX_COVER_BYTES: u64 = 4 * 1024 * 1024;

#[tauri::command]
pub async fn game_cover(
    app: AppHandle,
    appid: Option<String>,
    cover: Option<String>,
) -> AppResult<Option<String>> {
    if let Some(cover) = cover.as_deref().filter(|value| !value.trim().is_empty()) {
        if let Some(data) = read_cover(&app, cover)? {
            return Ok(Some(data));
        }
    }

    let Some(appid) = appid.map(|value| value.trim().to_string()) else {
        return Ok(None);
    };
    let cached = covers_dir(&app)?.join(format!("{appid}.jpg"));

    if cached.is_file() {
        return read_file_as_data_uri(&cached);
    }

    if let Some(data) = read_cover(&app, &appid)? {
        return Ok(Some(data));
    }

    let url = COVER_URL_TEMPLATE.replace("{appid}", &appid);

    match fetch_cover(&url).await {
        Ok(bytes) => {
            let _ = std::fs::write(&cached, &bytes);

            Ok(Some(to_data_uri(&bytes, "jpg")?))
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn import_game_cover(app: AppHandle, source_path: String) -> AppResult<String> {
    let source = PathBuf::from(source_path.trim());

    if !source.is_file() {
        return Err(AppError::custom("Файл обложки не найден"));
    }

    let bytes = std::fs::read(&source)?;

    if bytes.len() as u64 > MAX_COVER_BYTES {
        return Err(AppError::custom("Файл обложки больше 4 МБ"));
    }

    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("jpg")
        .to_ascii_lowercase();

    if !matches!(extension.as_str(), "jpg" | "jpeg" | "png" | "webp" | "gif") {
        return Err(AppError::custom("Поддерживаются только изображения"));
    }

    let name = format!("{}.{}", sha_name(&source), extension);
    let target = covers_dir(&app)?.join(&name);

    std::fs::write(&target, &bytes)?;

    Ok(name)
}

fn read_cover(app: &AppHandle, cover: &str) -> AppResult<Option<String>> {
    if cover.contains('\\') || cover.contains('/') || cover.contains("..") {
        return Ok(None);
    }

    let cached = covers_dir(app)?.join(cover);

    if cached.is_file() {
        return read_file_as_data_uri(&cached);
    }

    let resources = resources_dir(app)?;

    let bundled = resolve_cover_file(&resources, cover)
        .or_else(|| known_cover_url(app, cover).map(PathBuf::from));

    match bundled {
        Some(path) => read_file_as_data_uri(&path),
        None => Ok(None),
    }
}

fn read_file_as_data_uri(path: &Path) -> AppResult<Option<String>> {
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("jpg")
        .to_ascii_lowercase();

    match std::fs::read(path) {
        Ok(bytes) => Ok(Some(to_data_uri(&bytes, &extension)?)),
        Err(_) => Ok(None),
    }
}

fn to_data_uri(bytes: &[u8], extension: &str) -> AppResult<String> {
    if bytes.is_empty() || bytes.len() as u64 > MAX_COVER_BYTES {
        return Err(AppError::custom("Обложка повреждена или слишком большая"));
    }

    Ok(format!(
        "data:image/{};base64,{}",
        mime_for(extension),
        BASE64.encode(bytes)
    ))
}

fn mime_for(extension: &str) -> &'static str {
    match extension.to_ascii_lowercase().as_str() {
        "png" => "png",
        "webp" => "webp",
        "gif" => "gif",
        _ => "jpeg",
    }
}

async fn fetch_cover(url: &str) -> AppResult<Vec<u8>> {
    let response = reqwest::get(url)
        .await
        .map_err(|error| AppError::custom(format!("Обложка не загружена: {error}")))?;

    if !response.status().is_success() {
        return Err(AppError::custom("Обложка недоступна"));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|error| AppError::custom(format!("Обложка не прочитана: {error}")))?;

    if bytes.len() as u64 > MAX_COVER_BYTES {
        return Err(AppError::custom("Обложка слишком большая"));
    }

    Ok(bytes.to_vec())
}

fn covers_dir(app: &AppHandle) -> AppResult<PathBuf> {
    let dir = app_dir(app)?.join(COVERS_SUBDIR);

    std::fs::create_dir_all(&dir)?;

    Ok(dir)
}

fn sha_name(path: &Path) -> String {
    use sha2::Digest;

    let mut hasher = sha2::Sha256::new();

    hasher.update(path.to_string_lossy().as_bytes());

    hex::encode(&hasher.finalize()[..8])
}

#[cfg(test)]
#[path = "game_covers_tests.rs"]
mod tests;
#[tauri::command]
pub fn game_exe_icon(path: String) -> Option<String> {
    super::game_icons::exe_icon_data_uri(std::path::Path::new(&path))
}
