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
pub const STEAM_SEARCH_URL: &str =
    "https://store.steampowered.com/api/storesearch/?term={term}&l=english&cc=US";
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

    load_appid_cover(&app, &appid).await
}

async fn load_appid_cover(app: &AppHandle, appid: &str) -> AppResult<Option<String>> {
    let cached = covers_dir(app)?.join(format!("{appid}.jpg"));

    if cached.is_file() {
        return read_file_as_data_uri(&cached);
    }

    if let Some(data) = read_cover(app, appid)? {
        return Ok(Some(data));
    }

    let url = COVER_URL_TEMPLATE.replace("{appid}", appid);

    match fetch_cover(&url).await {
        Ok(bytes) => {
            let _ = std::fs::write(&cached, &bytes);

            Ok(Some(to_data_uri(&bytes, "jpg")?))
        }
        Err(_) => Ok(None),
    }
}

#[tauri::command]
pub async fn game_steam_cover(app: AppHandle, name: String) -> AppResult<Option<String>> {
    let term = steam_search_term(&name);

    if term.len() < 2 {
        return Ok(None);
    }

    let known = super::game_known::load_known_games(&app);
    let entry = known.by_name(&term).or_else(|| known.by_name(&name));

    if let Some(entry) = entry {
        if let Some(cover) = entry.cover.as_deref() {
            if let Some(data) = read_cover(&app, cover)? {
                return Ok(Some(data));
            }
        }

        return load_appid_cover(&app, &entry.appid).await;
    }

    let key = sha_name(Path::new(&format!("steam:{}", normalize_name(&term))));
    let index = covers_dir(&app)?.join(format!("{key}.index"));

    if let Ok(cached) = std::fs::read_to_string(&index) {
        let appid = cached.trim();

        if appid.is_empty() {
            return Ok(None);
        }

        return load_appid_cover(&app, appid).await;
    }

    let url = STEAM_SEARCH_URL.replace("{term}", &encode_term(&term));

    let Ok(response) = reqwest::get(&url).await else {
        return Ok(None);
    };

    if !response.status().is_success() {
        return Ok(None);
    }

    let Ok(body) = response.text().await else {
        return Ok(None);
    };

    let Some(appid) = pick_steam_appid(&body, &term) else {
        return Ok(None);
    };

    let _ = std::fs::write(&index, &appid);

    load_appid_cover(&app, &appid).await
}

pub fn steam_search_term(name: &str) -> String {
    let base = name.split(['—', '–']).next().unwrap_or(name).trim();

    base.trim_end_matches(['.', ' ']).to_string()
}

fn normalize_name(value: &str) -> String {
    value
        .chars()
        .filter(|character| character.is_ascii_alphanumeric())
        .map(|character| character.to_ascii_lowercase())
        .collect()
}

pub fn pick_steam_appid(json: &str, query: &str) -> Option<String> {
    let parsed: serde_json::Value = serde_json::from_str(json).ok()?;
    let items = parsed.get("items")?.as_array()?;
    let normalized_query = normalize_name(query);

    if normalized_query.is_empty() {
        return None;
    }

    let mut fallback: Option<String> = None;

    for item in items {
        let Some(id) = item.get("id") else {
            continue;
        };
        let candidate = match id {
            serde_json::Value::Number(number) => number.to_string(),
            serde_json::Value::String(text) => text.clone(),
            _ => continue,
        };
        let Some(name) = item.get("name").and_then(|value| value.as_str()) else {
            continue;
        };
        let normalized = normalize_name(name);

        if normalized == normalized_query {
            return Some(candidate);
        }

        if fallback.is_none()
            && (normalized.contains(&normalized_query)
                || normalized_query.contains(&normalized))
        {
            fallback = Some(candidate);
        }
    }

    fallback
}

fn encode_term(term: &str) -> String {
    let mut encoded = String::new();

    for byte in term.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char);
            }
            b' ' => encoded.push_str("%20"),
            _ => encoded.push_str(&format!("%{byte:02X}")),
        }
    }

    encoded
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
