// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: base64::engine::general_purpose::STANDARD as BASE64;.
use base64::engine::general_purpose::STANDARD as BASE64;
// Подключаем модули: base64::Engine;.
use base64::Engine;
// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;

// Подключаем модули: super::game_known::{known_cover_url, resolve_cover_file.
use super::game_known::{known_cover_url, resolve_cover_file};
// Подключаем модули: crate::commands::resources::app_dir;.
use crate::commands::resources::app_dir;
// Подключаем модули: crate::commands::resources_fs::resources_dir;.
use crate::commands::resources_fs::resources_dir;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::paths::is_valid_appid;.
use crate::security::paths::is_valid_appid;

// Объявляем константу COVERS_SUBDIR.
pub const COVERS_SUBDIR: &str = "covers";
// Объявляем константу COVER_URL_TEMPLATE.
pub const COVER_URL_TEMPLATE: &str =
    // Выполняем операцию: "https://cdn.cloudflare.steamstatic.com/steam/apps/{app.
    "https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_600x900.jpg";
// Объявляем константу STEAM_SEARCH_URL.
pub const STEAM_SEARCH_URL: &str =
    // Выполняем операцию: "https://store.steampowered.com/api/storesearch/?term={.
    "https://store.steampowered.com/api/storesearch/?term={term}&l=english&cc=US";
// Объявляем константу MAX_COVER_BYTES.
pub const MAX_COVER_BYTES: u64 = 4 * 1024 * 1024;

/// Типовые файлы обложек, которые лаунчеры кладут прямо в папку игры.
/// Проверяются по имени без учёта регистра, в этом же порядке.
// Объявляем константу FOLDER_COVER_NAMES.
pub const FOLDER_COVER_NAMES: [&str; 12] = [
    // Выполняем операцию: "library_600x900.jpg",.
    "library_600x900.jpg",
    // Выполняем операцию: "library_600x900_2x.jpg",.
    "library_600x900_2x.jpg",
    // Выполняем операцию: "library_hero.jpg",.
    "library_hero.jpg",
    // Выполняем операцию: "libraryheader.jpg",.
    "libraryheader.jpg",
    // Выполняем операцию: "cover.jpg",.
    "cover.jpg",
    // Выполняем операцию: "cover.png",.
    "cover.png",
    // Выполняем операцию: "boxart.jpg",.
    "boxart.jpg",
    // Выполняем операцию: "boxfront.jpg",.
    "boxfront.jpg",
    // Выполняем операцию: "capsule.jpg",.
    "capsule.jpg",
    // Выполняем операцию: "header.jpg",.
    "header.jpg",
    // Выполняем операцию: "logo.png",.
    "logo.png",
    // Выполняем операцию: "box.jpg",.
    "box.jpg",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу FOLDER_COVER_EXTENSIONS.
pub const FOLDER_COVER_EXTENSIONS: [&str; 5] = ["jpg", "jpeg", "png", "webp", "bmp"];
/// Минимальный размер картинки-кандидата без «правильного» имени.
///
/// Файлы с типовыми именами (library_600x900.jpg, cover.jpg) — настоящие
/// обложки от лаунчеров. А «самый большой файл в папке» без порога
/// превращается в иконку на 64×64, растянутую на всю карточку.
// Объявляем константу MIN_FOLDER_COVER_BYTES.
pub const MIN_FOLDER_COVER_BYTES: u64 = 20_000;
/// Сколько кандидатов смотрим в папке, прежде чем выбрать самый крупный.
// Объявляем константу FOLDER_COVER_SCAN_LIMIT.
const FOLDER_COVER_SCAN_LIMIT: usize = 64;

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn game_cover(.
pub async fn game_cover(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: appid: Option<String>,.
    appid: Option<String>,
    // Выполняем операцию: cover: Option<String>,.
    cover: Option<String>,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<String>> {
    // Проверяем условие: let Some(cover) = cover.as_deref().filter(|value| .
    if let Some(cover) = cover.as_deref().filter(|value| !value.trim().is_empty()) {
        // Проверяем условие: let Some(data) = read_cover(&app, cover)? {.
        if let Some(data) = read_cover(&app, cover)? {
            // Возвращаем результат из функции.
            return Ok(Some(data));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную Some(appid) .
    let Some(appid) = appid.map(|value| value.trim().to_string()) else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Выполняем операцию: load_appid_cover(&app, &appid).await.
    load_appid_cover(&app, &appid).await
    // Закрываем блок.
}

// Объявляем функцию load_appid_cover.
async fn load_appid_cover(app: &AppHandle, appid: &str) -> AppResult<Option<String>> {
    // Объявляем переменную appid .
    let appid = appid.trim();

    // Проверяем условие: !is_valid_appid(appid) {.
    if !is_valid_appid(appid) {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную cached .
    let cached = covers_dir(app)?.join(format!("{appid}.jpg"));

    // Проверяем условие: cached.is_file() {.
    if cached.is_file() {
        // Возвращаем результат из функции.
        return read_file_as_data_uri(&cached);
        // Закрываем блок.
    }

    // Проверяем условие: let Some(data) = read_cover(app, appid)? {.
    if let Some(data) = read_cover(app, appid)? {
        // Возвращаем результат из функции.
        return Ok(Some(data));
        // Закрываем блок.
    }

    // Объявляем переменную template .
    let template = COVER_URL_TEMPLATE.replace("{appid}", appid);

    // Выбираем вариант по значению.
    match fetch_cover(&template).await {
        // Выполняем операцию: Ok(bytes) => {.
        Ok(bytes) => {
            // Объявляем переменную _ .
            let _ = std::fs::write(&cached, &bytes);

            // Выполняем операцию: Ok(Some(to_data_uri(&bytes, "jpg")?)).
            Ok(Some(to_data_uri(&bytes, "jpg")?))
            // Закрываем блок.
        }
        // Выполняем операцию: Err(_) => Ok(None),.
        Err(_) => Ok(None),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn game_steam_cover(app: AppHandle, name: Str.
pub async fn game_steam_cover(app: AppHandle, name: String) -> AppResult<Option<String>> {
    // Объявляем переменную term .
    let term = steam_search_term(&name);

    // Проверяем условие: term.len() < 2 {.
    if term.len() < 2 {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную known .
    let known = super::game_known::load_known_games_cached(&app);
    // Объявляем переменную entry .
    let entry = known.by_name(&term).or_else(|| known.by_name(&name));

    // Проверяем условие: let Some(entry) = entry {.
    if let Some(entry) = entry {
        // Проверяем условие: let Some(cover) = entry.cover.as_deref() {.
        if let Some(cover) = entry.cover.as_deref() {
            // Проверяем условие: let Some(data) = read_cover(&app, cover)? {.
            if let Some(data) = read_cover(&app, cover)? {
                // Возвращаем результат из функции.
                return Ok(Some(data));
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Возвращаем результат из функции.
        return load_appid_cover(&app, &entry.appid).await;
        // Закрываем блок.
    }

    // Объявляем переменную key .
    let key = sha_name(Path::new(&format!("steam:{}", normalize_name(&term))));
    // Объявляем переменную index .
    let index = covers_dir(&app)?.join(format!("{key}.index"));

    // Проверяем условие: let Ok(cached) = std::fs::read_to_string(&index) {.
    if let Ok(cached) = std::fs::read_to_string(&index) {
        // Объявляем переменную appid .
        let appid = cached.trim();

        // Проверяем условие: appid.is_empty() {.
        if appid.is_empty() {
            // Возвращаем результат из функции.
            return Ok(None);
            // Закрываем блок.
        }

        // Возвращаем результат из функции.
        return load_appid_cover(&app, appid).await;
        // Закрываем блок.
    }

    // Объявляем переменную url .
    let url = STEAM_SEARCH_URL.replace("{term}", &encode_term(&term));

    // Объявляем переменную Ok(response) .
    let Ok(response) = reqwest::get(&url).await else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную Ok(body) .
    let Ok(body) = response.text().await else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную Some(appid) .
    let Some(appid) = pick_steam_appid(&body, &term) else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = std::fs::write(&index, &appid);

    // Выполняем операцию: load_appid_cover(&app, &appid).await.
    load_appid_cover(&app, &appid).await
    // Закрываем блок.
}

// Объявляем функцию steam_search_term.
pub fn steam_search_term(name: &str) -> String {
    // Объявляем переменную base .
    let base = name.split(['—', '–']).next().unwrap_or(name).trim();

    // Выполняем операцию: base.trim_end_matches(['.', ' ']).to_string().
    base.trim_end_matches(['.', ' ']).to_string()
    // Закрываем блок.
}

// Объявляем функцию normalize_name.
fn normalize_name(value: &str) -> String {
    // Выполняем операцию: value.
    value
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .filter(|character| character.is_ascii_alphanumeric()).
        .filter(|character| character.is_ascii_alphanumeric())
        // Выполняем операцию: .map(|character| character.to_ascii_lowercase()).
        .map(|character| character.to_ascii_lowercase())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию pick_steam_appid.
pub fn pick_steam_appid(json: &str, query: &str) -> Option<String> {
    // Объявляем переменную parsed.
    let parsed: serde_json::Value = serde_json::from_str(json).ok()?;
    // Объявляем переменную items .
    let items = parsed.get("items")?.as_array()?;
    // Объявляем переменную normalized_query .
    let normalized_query = normalize_name(query);

    // Проверяем условие: normalized_query.is_empty() {.
    if normalized_query.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную fallback.
    let mut fallback: Option<String> = None;

    // Перебираем элементы коллекции.
    for item in items {
        // Объявляем переменную Some(id) .
        let Some(id) = item.get("id") else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };
        // Объявляем переменную candidate .
        let candidate = match id {
            // Выполняем операцию: serde_json::Value::Number(number) => number.to_string().
            serde_json::Value::Number(number) => number.to_string(),
            // Выполняем операцию: serde_json::Value::String(text) => text.clone(),.
            serde_json::Value::String(text) => text.clone(),
            // Выполняем операцию: _ => continue,.
            _ => continue,
            // Закрываем блок.
        };

        // Проверяем условие: !is_valid_appid(&candidate) {.
        if !is_valid_appid(&candidate) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(name) .
        let Some(name) = item.get("name").and_then(|value| value.as_str()) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };
        // Объявляем переменную normalized .
        let normalized = normalize_name(name);

        // Проверяем условие: normalized == normalized_query {.
        if normalized == normalized_query {
            // Возвращаем результат из функции.
            return Some(candidate);
            // Закрываем блок.
        }

        // Проверяем условие: fallback.is_none().
        if fallback.is_none()
            // Выполняем операцию: && (normalized.contains(&normalized_query) || normalize.
            && (normalized.contains(&normalized_query) || normalized_query.contains(&normalized))
        // Выполняем операцию: {.
        {
            // Выполняем операцию: fallback = Some(candidate);.
            fallback = Some(candidate);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: fallback.
    fallback
    // Закрываем блок.
}

// Объявляем функцию encode_term.
fn encode_term(term: &str) -> String {
    // Объявляем переменную encoded .
    let mut encoded = String::new();

    // Перебираем элементы коллекции.
    for byte in term.bytes() {
        // Выбираем вариант по значению.
        match byte {
            // Выполняем операцию: b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' |.
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                // Выполняем операцию: encoded.push(byte as char);.
                encoded.push(byte as char);
                // Закрываем блок.
            }
            // Выполняем операцию: b' ' => encoded.push_str("%20"),.
            b' ' => encoded.push_str("%20"),
            // Выполняем операцию: _ => encoded.push_str(&format!("%{byte:02X}")),.
            _ => encoded.push_str(&format!("%{byte:02X}")),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: encoded.
    encoded
    // Закрываем блок.
}

// Объявляем функцию read_cover.
fn read_cover(app: &AppHandle, cover: &str) -> AppResult<Option<String>> {
    // Проверяем условие: cover.contains('\\') || cover.contains('/') || cov.
    if cover.contains('\\') || cover.contains('/') || cover.contains("..") {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную cached .
    let cached = covers_dir(app)?.join(cover);

    // Проверяем условие: cached.is_file() {.
    if cached.is_file() {
        // Возвращаем результат из функции.
        return read_file_as_data_uri(&cached);
        // Закрываем блок.
    }

    // Объявляем переменную resources .
    let resources = resources_dir(app)?;

    // Объявляем переменную bundled .
    let bundled = resolve_cover_file(&resources, cover)
        // Выполняем операцию: .or_else(|| known_cover_url(app, cover).map(PathBuf::fr.
        .or_else(|| known_cover_url(app, cover).map(PathBuf::from));

    // Выбираем вариант по значению.
    match bundled {
        // Выполняем операцию: Some(path) => read_file_as_data_uri(&path),.
        Some(path) => read_file_as_data_uri(&path),
        // Выполняем операцию: None => Ok(None),.
        None => Ok(None),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию read_file_as_data_uri.
fn read_file_as_data_uri(path: &Path) -> AppResult<Option<String>> {
    // Объявляем переменную extension .
    let extension = path
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or("jpg").
        .unwrap_or("jpg")
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Выбираем вариант по значению.
    match std::fs::read(path) {
        // Выполняем операцию: Ok(bytes) => Ok(Some(to_data_uri(&bytes, &extension)?)).
        Ok(bytes) => Ok(Some(to_data_uri(&bytes, &extension)?)),
        // Выполняем операцию: Err(_) => Ok(None),.
        Err(_) => Ok(None),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию to_data_uri.
pub fn to_data_uri(bytes: &[u8], extension: &str) -> AppResult<String> {
    // Проверяем условие: bytes.is_empty() || bytes.len() as u64 > MAX_COVER.
    if bytes.is_empty() || bytes.len() as u64 > MAX_COVER_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Обложка повреждена или слишком большая"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(format!(.
    Ok(format!(
        // Выполняем операцию: "data:image/{};base64,{}",.
        "data:image/{};base64,{}",
        // Выполняем операцию: mime_for(bytes, extension),.
        mime_for(bytes, extension),
        // Выполняем операцию: BASE64.encode(bytes).
        BASE64.encode(bytes) // Закрываем выражение или коллекцию.
    ))
    // Закрываем блок.
}

// Объявляем функцию mime_for.
fn mime_for(bytes: &[u8], extension: &str) -> &'static str {
    // Проверяем условие: bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {.
    if bytes.starts_with(&[0xFF, 0xD8, 0xFF]) {
        // Возвращаем результат из функции.
        return "jpeg";
        // Закрываем блок.
    }

    // Проверяем условие: bytes.starts_with(b"\x89PNG\r\n\x1a\n") {.
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        // Возвращаем результат из функции.
        return "png";
        // Закрываем блок.
    }

    // Проверяем условие: bytes.starts_with(b"GIF87a") || bytes.starts_with(.
    if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        // Возвращаем результат из функции.
        return "gif";
        // Закрываем блок.
    }

    // Проверяем условие: bytes.len() >= 12 && &bytes[..4] == b"RIFF" && &by.
    if bytes.len() >= 12 && &bytes[..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        // Возвращаем результат из функции.
        return "webp";
        // Закрываем блок.
    }

    // Проверяем условие: bytes.starts_with(b"BM") {.
    if bytes.starts_with(b"BM") {
        // Возвращаем результат из функции.
        return "bmp";
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match extension.to_ascii_lowercase().as_str() {
        // Выполняем операцию: "png" => "png",.
        "png" => "png",
        // Выполняем операцию: "webp" => "webp",.
        "webp" => "webp",
        // Выполняем операцию: "gif" => "gif",.
        "gif" => "gif",
        // Выполняем операцию: "bmp" => "bmp",.
        "bmp" => "bmp",
        // Выполняем операцию: _ => "jpeg",.
        _ => "jpeg",
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию fetch_cover.
async fn fetch_cover(url: &str) -> AppResult<Vec<u8>> {
    // Объявляем переменную response .
    let response = reqwest::get(url)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Обложка не з.
        .map_err(|error| AppError::custom(format!("Обложка не загружена: {error}")))?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Обложка недоступна"));
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = response
        // Выполняем операцию: .bytes().
        .bytes()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Обложка не п.
        .map_err(|error| AppError::custom(format!("Обложка не прочитана: {error}")))?;

    // Проверяем условие: bytes.len() as u64 > MAX_COVER_BYTES {.
    if bytes.len() as u64 > MAX_COVER_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Обложка слишком большая"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(bytes.to_vec()).
    Ok(bytes.to_vec())
    // Закрываем блок.
}

// Объявляем функцию covers_dir.
fn covers_dir(app: &AppHandle) -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = app_dir(app)?.join(COVERS_SUBDIR);

    // Выполняем операцию: std::fs::create_dir_all(&dir)?;.
    std::fs::create_dir_all(&dir)?;

    // Выполняем операцию: Ok(dir).
    Ok(dir)
    // Закрываем блок.
}

/// Обложка из папки самой игры.
///
/// Сначала ищем типовые файлы лаунчеров (`library_600x900.jpg` у Steam и т. п.),
/// а если их нет — любое изображение в корне папки, самое крупное из просмотренных.
/// Файл копируется в кэш обложек приложения, поэтому карточка не читает диск заново
/// при каждом открытии страницы.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn game_folder_cover(app: AppHandle, dir: Str.
pub async fn game_folder_cover(app: AppHandle, dir: String) -> AppResult<Option<String>> {
    // Чтение каталога, копирование файла и кодирование в base64 —
    // это мегабайты синхронной работы. Вне рабочего потока.
    // Выполняем операцию: tokio::task::spawn_blocking(move || game_folder_cover_b.
    tokio::task::spawn_blocking(move || game_folder_cover_blocking(app, dir))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Обложка не н.
        .map_err(|error| AppError::custom(format!("Обложка не найдена: {error}")))?
    // Закрываем блок.
}

// Объявляем функцию game_folder_cover_blocking.
fn game_folder_cover_blocking(app: AppHandle, dir: String) -> AppResult<Option<String>> {
    // Объявляем переменную root .
    let root = PathBuf::from(dir.trim());

    // Проверяем условие: !root.is_dir() {.
    if !root.is_dir() {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную cached .
    let cached = covers_dir(&app)?.join(format!("{}.index", sha_name(&root)));

    // Проверяем условие: let Ok(entry) = std::fs::read_to_string(&cached) {.
    if let Ok(entry) = std::fs::read_to_string(&cached) {
        // Объявляем переменную name .
        let name = entry.trim().to_string();

        // Проверяем условие: !name.is_empty() {.
        if !name.is_empty() {
            // Объявляем переменную path .
            let path = covers_dir(&app)?.join(&name);
            // Объявляем переменную big_enough .
            let big_enough = std::fs::metadata(&path).map(|meta| meta.len()).unwrap_or(0)
                // Выполняем операцию: >= MIN_FOLDER_COVER_BYTES;.
                >= MIN_FOLDER_COVER_BYTES;

            // Проверяем условие: big_enough {.
            if big_enough {
                // Проверяем условие: let Some(data) = read_file_as_data_uri(&path)? {.
                if let Some(data) = read_file_as_data_uri(&path)? {
                    // Возвращаем результат из функции.
                    return Ok(Some(data));
                    // Закрываем блок.
                }
                // Закрываем блок.
            }

            // Слишком мелкая или пропавшая картинка кэш больше не годится:
            // в нём могла застрять иконка 64×64 со времён старого выбора.
            // Объявляем переменную _ .
            let _ = std::fs::remove_file(&cached);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную Some(source) .
    let Some(source) = pick_folder_cover(&root) else {
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&cached);

        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную extension .
    let extension = source
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or("jpg").
        .unwrap_or("jpg")
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();
    // Объявляем переменную name .
    let name = format!("{}.{}", sha_name(&source), extension);

    // Выбираем вариант по значению.
    match std::fs::copy(&source, covers_dir(&app)?.join(&name)) {
        // Выполняем операцию: Ok(_) => {.
        Ok(_) => {
            // Объявляем переменную _ .
            let _ = std::fs::write(&cached, &name);
            // Закрываем блок.
        }
        // Выполняем операцию: Err(_) => return read_file_as_data_uri(&source),.
        Err(_) => return read_file_as_data_uri(&source),
        // Закрываем блок.
    }

    // Выполняем операцию: read_file_as_data_uri(&covers_dir(&app)?.join(&name)).
    read_file_as_data_uri(&covers_dir(&app)?.join(&name))
    // Закрываем блок.
}

/// Выбор файла обложки в папке игры: сначала имена из [`FOLDER_COVER_NAMES`],
/// затем самое крупное изображение среди первых [`FOLDER_COVER_SCAN_LIMIT`].
// Объявляем функцию pick_folder_cover.
pub fn pick_folder_cover(dir: &Path) -> Option<PathBuf> {
    // Объявляем переменную entries .
    let entries = std::fs::read_dir(dir)
        // Выполняем операцию: .ok()?.
        .ok()?
        // Выполняем операцию: .flatten().
        .flatten()
        // Выполняем операцию: .map(|entry| entry.path());.
        .map(|entry| entry.path());

    // Объявляем переменную named.
    let mut named: Vec<(usize, PathBuf)> = Vec::new();
    // Объявляем переменную extras.
    let mut extras: Vec<(u64, PathBuf)> = Vec::new();

    // Перебираем элементы коллекции.
    for (index, path) in entries.enumerate() {
        // Проверяем условие: !path.is_file() {.
        if !path.is_file() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(extension) .
        let Some(extension) = path
            // Выполняем операцию: .extension().
            .extension()
            // Выполняем операцию: .and_then(|value| value.to_str()).
            .and_then(|value| value.to_str())
            // Выполняем операцию: .map(|value| value.to_ascii_lowercase()).
            .map(|value| value.to_ascii_lowercase())
        // Выполняем операцию: else {.
        else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: !FOLDER_COVER_EXTENSIONS.contains(&extension.as_st.
        if !FOLDER_COVER_EXTENSIONS.contains(&extension.as_str()) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную stem .
        let stem = path
            // Выполняем операцию: .file_stem().
            .file_stem()
            // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
            .map(|value| value.to_string_lossy().to_string())
            // Выполняем операцию: .unwrap_or_default();.
            .unwrap_or_default();

        // Выбираем вариант по значению.
        match FOLDER_COVER_NAMES.iter().position(|known| {
            // Выполняем операцию: Path::new(known).
            Path::new(known)
                // Выполняем операцию: .file_stem().
                .file_stem()
                // Выполняем операцию: .map(|candidate| candidate.to_string_lossy().eq_ignore_.
                .map(|candidate| candidate.to_string_lossy().eq_ignore_ascii_case(&stem))
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
            // Закрываем блок.
        }) {
            // Выполняем операцию: Some(position) => named.push((position, path)),.
            Some(position) => named.push((position, path)),
            // Выполняем операцию: None => {.
            None => {
                // Проверяем условие: index < FOLDER_COVER_SCAN_LIMIT {.
                if index < FOLDER_COVER_SCAN_LIMIT {
                    // Объявляем переменную size .
                    let size = path.metadata().map(|meta| meta.len()).unwrap_or(0);

                    // Мелкие файлы — иконки и логотипы, не обложки.
                    // Проверяем условие: size >= MIN_FOLDER_COVER_BYTES {.
                    if size >= MIN_FOLDER_COVER_BYTES {
                        // Выполняем операцию: extras.push((size, path));.
                        extras.push((size, path));
                        // Закрываем блок.
                    }
                    // Закрываем блок.
                }
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // типовые имена важнее «просто большого файла», а среди них порядок
    // задан самим списком: вертикальная обложка важнее логотипа
    // Выполняем операцию: named.sort_by_key(|(position, _)| *position);.
    named.sort_by_key(|(position, _)| *position);

    // Проверяем условие: let Some((_, first)) = named.into_iter().next() {.
    if let Some((_, first)) = named.into_iter().next() {
        // Возвращаем результат из функции.
        return Some(first);
        // Закрываем блок.
    }

    // Выполняем операцию: extras.sort_by_key(|(size, _)| std::cmp::Reverse(*size).
    extras.sort_by_key(|(size, _)| std::cmp::Reverse(*size));

    // Выполняем операцию: extras.into_iter().next().map(|(_, path)| path).
    extras.into_iter().next().map(|(_, path)| path)
    // Закрываем блок.
}

// Объявляем функцию sha_name.
fn sha_name(path: &Path) -> String {
    // Подключаем модули: sha2::Digest;.
    use sha2::Digest;

    // Объявляем переменную hasher .
    let mut hasher = sha2::Sha256::new();

    // Выполняем операцию: hasher.update(path.to_string_lossy().as_bytes());.
    hasher.update(path.to_string_lossy().as_bytes());

    // Выполняем операцию: hex::encode(&hasher.finalize()[..8]).
    hex::encode(&hasher.finalize()[..8])
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_covers_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn game_exe_icon(app: AppHandle, path: String.
pub async fn game_exe_icon(app: AppHandle, path: String) -> AppResult<Option<String>> {
    // Декодирование иконки и PNG-кодирование — вне рабочего потока.
    // Выполняем операцию: tokio::task::spawn_blocking(move || game_exe_icon_block.
    tokio::task::spawn_blocking(move || game_exe_icon_blocking(app, path))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Иконка не по.
        .map_err(|error| AppError::custom(format!("Иконка не получена: {error}")))?
    // Закрываем блок.
}

// Объявляем функцию game_exe_icon_blocking.
fn game_exe_icon_blocking(app: AppHandle, path: String) -> AppResult<Option<String>> {
    // Объявляем переменную source .
    let source = PathBuf::from(path.trim());

    // Проверяем условие: !source.is_file() {.
    if !source.is_file() {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // распаковка ресурсов exe заметно дороже чтения файла, поэтому результат
    // кладём в кэш обложек: ключ учитывает путь, размер и время изменения,
    // иначе переустановленная игра получила бы старую иконку
    // Объявляем переменную stamp .
    let stamp = std::fs::metadata(&source)
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|meta| {.
        .and_then(|meta| {
            // Объявляем переменную modified .
            let modified = meta
                // Выполняем операцию: .modified().
                .modified()
                // Выполняем операцию: .ok()?.
                .ok()?
                // Выполняем операцию: .duration_since(std::time::UNIX_EPOCH).
                .duration_since(std::time::UNIX_EPOCH)
                // Выполняем операцию: .ok()?.
                .ok()?
                // Выполняем операцию: .as_secs();.
                .as_secs();

            // Выполняем операцию: Some((meta.len(), modified)).
            Some((meta.len(), modified))
            // Закрываем блок.
        })
        // Выполняем операцию: .unwrap_or((0, 0));.
        .unwrap_or((0, 0));
    // Объявляем переменную key .
    let key = sha_name(Path::new(&format!("{source:?}:{stamp:?}")));
    // Объявляем переменную cached .
    let cached = covers_dir(&app)?.join(format!("{key}.png"));

    // Проверяем условие: cached.is_file() {.
    if cached.is_file() {
        // Возвращаем результат из функции.
        return read_file_as_data_uri(&cached);
        // Закрываем блок.
    }

    // Объявляем переменную Some(data) .
    let Some(data) = super::game_icons::exe_icon_data_uri(&source) else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Проверяем условие: let Some(bytes) = data.
    if let Some(bytes) = data
        // Выполняем операцию: .split_once("base64,").
        .split_once("base64,")
        // Выполняем операцию: .and_then(|(_, payload)| BASE64.decode(payload).ok()).
        .and_then(|(_, payload)| BASE64.decode(payload).ok())
    // Выполняем операцию: {.
    {
        // Объявляем переменную _ .
        let _ = std::fs::write(&cached, &bytes);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(Some(data)).
    Ok(Some(data))
    // Закрываем блок.
}
