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

/// Типовые файлы обложек, которые лаунчеры кладут прямо в папку игры.
/// Проверяются по имени без учёта регистра, в этом же порядке.
pub const FOLDER_COVER_NAMES: [&str; 12] = [
    "library_600x900.jpg",
    "library_600x900_2x.jpg",
    "library_hero.jpg",
    "libraryheader.jpg",
    "cover.jpg",
    "cover.png",
    "boxart.jpg",
    "boxfront.jpg",
    "capsule.jpg",
    "header.jpg",
    "logo.png",
    "box.jpg",
];

pub const FOLDER_COVER_EXTENSIONS: [&str; 5] = ["jpg", "jpeg", "png", "webp", "bmp"];
/// Сколько кандидатов смотрим в папке, прежде чем выбрать самый крупный.
const FOLDER_COVER_SCAN_LIMIT: usize = 64;

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

/// Обложка из папки самой игры.
///
/// Сначала ищем типовые файлы лаунчеров (`library_600x900.jpg` у Steam и т. п.),
/// а если их нет — любое изображение в корне папки, самое крупное из просмотренных.
/// Файл копируется в кэш обложек приложения, поэтому карточка не читает диск заново
/// при каждом открытии страницы.
#[tauri::command]
pub fn game_folder_cover(app: AppHandle, dir: String) -> AppResult<Option<String>> {
    let root = PathBuf::from(dir.trim());

    if !root.is_dir() {
        return Ok(None);
    }

    let cached = covers_dir(&app)?.join(format!("{}.index", sha_name(&root)));

    if let Ok(entry) = std::fs::read_to_string(&cached) {
        let name = entry.trim().to_string();

        if !name.is_empty() {
            if let Some(data) = read_file_as_data_uri(&covers_dir(&app)?.join(&name))? {
                return Ok(Some(data));
            }
        }
    }

    let Some(source) = pick_folder_cover(&root) else {
        let _ = std::fs::remove_file(&cached);

        return Ok(None);
    };

    let extension = source
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("jpg")
        .to_ascii_lowercase();
    let name = format!("{}.{}", sha_name(&source), extension);

    match std::fs::copy(&source, covers_dir(&app)?.join(&name)) {
        Ok(_) => {
            let _ = std::fs::write(&cached, &name);
        }
        Err(_) => return read_file_as_data_uri(&source),
    }

    read_file_as_data_uri(&covers_dir(&app)?.join(&name))
}

/// Выбор файла обложки в папке игры: сначала имена из [`FOLDER_COVER_NAMES`],
/// затем самое крупное изображение среди первых [`FOLDER_COVER_SCAN_LIMIT`].
pub fn pick_folder_cover(dir: &Path) -> Option<PathBuf> {
    let entries = std::fs::read_dir(dir).ok()?.flatten().map(|entry| entry.path());

    let mut named: Vec<(usize, PathBuf)> = Vec::new();
    let mut extras: Vec<(u64, PathBuf)> = Vec::new();

    for (index, path) in entries.enumerate() {
        if !path.is_file() {
            continue;
        }

        let Some(extension) = path
            .extension()
            .and_then(|value| value.to_str())
            .map(|value| value.to_ascii_lowercase())
        else {
            continue;
        };

        if !FOLDER_COVER_EXTENSIONS.contains(&extension.as_str()) {
            continue;
        }

        let stem = path
            .file_stem()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_default();

        match FOLDER_COVER_NAMES.iter().position(|known| {
            Path::new(known)
                .file_stem()
                .map(|candidate| candidate.to_string_lossy().eq_ignore_ascii_case(&stem))
                .unwrap_or(false)
        }) {
            Some(position) => named.push((position, path)),
            None => {
                if index < FOLDER_COVER_SCAN_LIMIT {
                    let size = path.metadata().map(|meta| meta.len()).unwrap_or(0);

                    extras.push((size, path));
                }
            }
        }
    }

    // типовые имена важнее «просто большого файла», а среди них порядок
    // задан самим списком: вертикальная обложка важнее логотипа
    named.sort_by_key(|(position, _)| *position);

    if let Some((_, first)) = named.into_iter().next() {
        return Some(first);
    }

    extras.sort_by_key(|(size, _)| std::cmp::Reverse(*size));

    extras.into_iter().next().map(|(_, path)| path)
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
pub fn game_exe_icon(app: AppHandle, path: String) -> AppResult<Option<String>> {
    let source = PathBuf::from(path.trim());

    if !source.is_file() {
        return Ok(None);
    }

    // распаковка ресурсов exe заметно дороже чтения файла, поэтому результат
    // кладём в кэш обложек: ключ учитывает путь, размер и время изменения,
    // иначе переустановленная игра получила бы старую иконку
    let stamp = std::fs::metadata(&source)
        .ok()
        .and_then(|meta| {
            let modified = meta
                .modified()
                .ok()?
                .duration_since(std::time::UNIX_EPOCH)
                .ok()?
                .as_secs();

            Some((meta.len(), modified))
        })
        .unwrap_or((0, 0));
    let key = sha_name(Path::new(&format!("{source:?}:{stamp:?}")));
    let cached = covers_dir(&app)?.join(format!("{key}.png"));

    if cached.is_file() {
        return read_file_as_data_uri(&cached);
    }

    let Some(data) = super::game_icons::exe_icon_data_uri(&source) else {
        return Ok(None);
    };

    if let Some(bytes) = data
        .split_once("base64,")
        .and_then(|(_, payload)| BASE64.decode(payload).ok())
    {
        let _ = std::fs::write(&cached, &bytes);
    }

    Ok(Some(data))
}
