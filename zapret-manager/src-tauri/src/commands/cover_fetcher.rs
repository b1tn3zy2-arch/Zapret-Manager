//! Скачивание обложек игр.
//!
//! Обложка нужна для любой установленной игры: у игр из Steam есть
//! готовый AppID, остальные ищутся по названию через публичный Store
//! API. Файлы кладутся в кэш приложения и переиспользуются: обложка
//! скачивается один раз.

// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;

// Подключаем модули: crate::commands::panel::USER_AGENT;.
use crate::commands::panel::USER_AGENT;
// Подключаем модули: crate::commands::resources::app_dir;.
use crate::commands::resources::app_dir;
// Подключаем модули: crate::commands::steam_search::search_steam;.
use crate::commands::steam_search::search_steam;
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::security::paths::{is_valid_appid, safe_path};.
use crate::security::paths::{is_valid_appid, safe_path};

// Подключаем модули: super::game_model::normalize_title;.
use super::game_model::normalize_title;

// Объявляем константу COVER_FILE_EXTENSIONS.
pub const COVER_FILE_EXTENSIONS: [&str; 5] = ["jpg", "jpeg", "png", "webp", "bmp"];

/// Адреса обложки на CDN Steam, по порядку попыток.
///
/// Вертикальная обложка (library_600x900) предпочтительнее горизонтальной
/// шапки: карточка высокая. У игр, вышедших недавно, этих путей на CDN
/// больше нет: их ассеты отдаются только по адресам с хэшем, который
/// нигде не опубликован. Для них после статических адресов работает
/// справка об игре (см. [`APPDETAILS_URL`]).
// Объявляем константу COVER_URLS.
pub const COVER_URLS: [&str; 2] = [
    // Выполняем операцию: "https://cdn.akamai.steamstatic.com/steam/apps/{appid}/.
    "https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_600x900.jpg",
    // Выполняем операцию: "https://cdn.akamai.steamstatic.com/steam/apps/{appid}/.
    "https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg",
    // Закрываем выражение или коллекцию.
];

/// Адрес справки об игре: в ответе есть готовый адрес шапки для игр,
/// у которых статические пути на CDN уже не работают.
// Объявляем константу APPDETAILS_URL.
pub const APPDETAILS_URL: &str =
    // Выполняем операцию: "https://store.steampowered.com/api/appdetails?appids={.
    "https://store.steampowered.com/api/appdetails?appids={appid}&l=english";

/// Минимальный размер правдоподобной картинки.
///
/// Меньше — это заглушка с CDN или обрывок, такой файл не годен.
// Объявляем константу MIN_COVER_BYTES.
pub const MIN_COVER_BYTES: usize = 5_000;

/// Сколько ждём обложку.
// Объявляем константу COVER_TIMEOUT.
pub const COVER_TIMEOUT: Duration = Duration::from_secs(5);

/// Через сколько обложка считается устаревшей и обновляется.
/// Сами файлы не удаляются: если сеть недоступна, отдаём старую копию.
// Объявляем константу COVER_CACHE_TTL.
pub const COVER_CACHE_TTL: Duration = Duration::from_secs(30 * 24 * 60 * 60);

/// Файл индекса «название игры → AppID в Steam» из прошлых поисков.
///
/// Поиск по названию — сетевой запрос: без индекса каждая не-Steam игра
/// искалась бы заново при каждом сканировании. Пустое значение означает
/// «игры в Steam нет» — такие игры не дёргают поиск повторно. Сетевые
/// сбои в индекс не попадают: при следующем скане попытка повторится.
// Объявляем константу SEARCH_INDEX_FILE.
pub const SEARCH_INDEX_FILE: &str = "search-index.json";

/// Результат добычи обложки: путь к файлу в кэше и AppID, по которому
/// она нашлась. AppID нужен интерфейсу, чтобы запомнить его у игры,
/// у которой его не было.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq)]
// Объявляем структуру ResolvedCover.
pub struct ResolvedCover {
    // Выполняем операцию: pub appid: Option<String>,.
    pub appid: Option<String>,
    // Выполняем операцию: pub path: Option<PathBuf>,.
    pub path: Option<PathBuf>,
    // Закрываем блок.
}

/// Сериализация записи индекса не параллелится: фон докачивает обложки
/// по одной, но ручные игры могут запросить обложку одновременно со сканом.
// Объявляем константу SEARCH_INDEX_LOCK.
static SEARCH_INDEX_LOCK: Mutex<()> = Mutex::new(());

/// Результат проверки файла в кэше.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq)]
// Объявляем перечисление CachedCover.
enum CachedCover {
    // Выполняем операцию: Fresh(PathBuf),.
    Fresh(PathBuf),
    // Выполняем операцию: Stale(PathBuf),.
    Stale(PathBuf),
    // Закрываем блок.
}

/// Каталог кэша обложек.
// Объявляем функцию covers_cache_dir.
pub fn covers_cache_dir(app: &AppHandle) -> AppResult<PathBuf> {
    // Папки склеиваются по отдельности: в пути не должно быть
    // смешанных разделителей, иначе его сложно сравнивать с
    // разрешениями протокола ресурсов.
    // Объявляем переменную dir .
    let dir = app_dir(app)?.join("cache").join("covers");

    // Выполняем операцию: std::fs::create_dir_all(&dir)?;.
    std::fs::create_dir_all(&dir)?;

    // Выполняем операцию: Ok(dir).
    Ok(dir)
    // Закрываем блок.
}

// Объявляем функцию search_index_path.
fn search_index_path(app: &AppHandle) -> AppResult<PathBuf> {
    // Выполняем операцию: Ok(covers_cache_dir(app)?.join(SEARCH_INDEX_FILE)).
    Ok(covers_cache_dir(app)?.join(SEARCH_INDEX_FILE))
    // Закрываем блок.
}

/// Читает индекс поиска с диска.
// Объявляем функцию read_index.
fn read_index(path: &Path) -> HashMap<String, String> {
    // Выполняем операцию: std::fs::read_to_string(path).
    std::fs::read_to_string(path)
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|raw| serde_json::from_str(&raw).ok()).
        .and_then(|raw| serde_json::from_str(&raw).ok())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию write_index.
fn write_index(path: &Path, index: &HashMap<String, String>) {
    // Проверяем условие: let Ok(raw) = serde_json::to_string(index) {.
    if let Ok(raw) = serde_json::to_string(index) {
        // Объявляем переменную _ .
        let _ = std::fs::write(path, raw);
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Индекс «нормализованное название → AppID» из прошлых поисков.
// Объявляем функцию load_appid_index.
pub fn load_appid_index(app: &AppHandle) -> HashMap<String, String> {
    // Выполняем операцию: read_index(&search_index_path(app).unwrap_or_default()).
    read_index(&search_index_path(app).unwrap_or_default())
    // Закрываем блок.
}

/// Запоминает результат поиска по названию.
///
/// `None` — игра в Steam не нашлась: в индекс пишется пустая строка,
/// чтобы повторные сканы не искали её снова. Сетевые сбои сюда не
/// доходят: они не доносят ни AppID, ни уверенность в отсутствии игры
/// (см. `search_steam`).
// Объявляем функцию remember_appid_result.
pub fn remember_appid_result(app: &AppHandle, name: &str, appid: Option<&str>) {
    // Объявляем переменную key .
    let key = normalize_title(name.trim());

    // Проверяем условие: key.is_empty() {.
    if key.is_empty() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную Ok(_guard) .
    let Ok(_guard) = SEARCH_INDEX_LOCK.lock() else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную Ok(path) .
    let Ok(path) = search_index_path(app) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную index .
    let mut index = read_index(&path);

    // Выполняем операцию: index.insert(key, appid.unwrap_or_default().to_string().
    index.insert(key, appid.unwrap_or_default().to_string());

    // Выполняем операцию: write_index(&path, &index);.
    write_index(&path, &index);
    // Закрываем блок.
}

/// AppID для игры: явный, из индекса прошлых поисков или свежий поиск.
///
/// Последнее слагаемое возвращает и признак того, что поиск сам ходил
/// в сеть: по нему решается, стоит ли запоминать результат в индексе.
// Объявляем функцию resolve_appid.
async fn resolve_appid(app: &AppHandle, appid: Option<&str>, name: &str) -> Option<String> {
    // Проверяем условие: let Some(value) = appid.map(str::trim).filter(|val.
    if let Some(value) = appid.map(str::trim).filter(|value| !value.is_empty()) {
        // Возвращаем результат из функции.
        return Some(value.to_string());
        // Закрываем блок.
    }

    // Объявляем переменную index .
    let index = load_appid_index(app);

    // Выбираем вариант по значению.
    match index.get(&normalize_title(name)).map(String::as_str) {
        // Прошлый поиск уже закончился тем, что игры нет в Steam.
        // Выполняем операцию: Some("") => None,.
        Some("") => None,
        // Выполняем операцию: Some(found) => Some(found.to_string()),.
        Some(found) => Some(found.to_string()),
        // Выполняем операцию: None => {.
        None => {
            // Объявляем переменную search .
            let search = search_steam(name).await;

            // Проверяем условие: search.reachable {.
            if search.reachable {
                // Выполняем операцию: remember_appid_result(app, name, search.appid.as_deref(.
                remember_appid_result(app, name, search.appid.as_deref());
                // Закрываем блок.
            }

            // Выполняем операцию: search.appid.
            search.appid
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}

/// Скачивает обложку игры и возвращает путь к файлу в кэше вместе
/// с AppID, по которому обложка нашлась.
///
/// AppID берётся из игры, из индекса прошлых поисков, иначе игра ищется
/// по названию. Если обложку добыть не удалось, `path` пуст — интерфейс
/// покажет заглушку.
// Выполняем операцию: pub async fn fetch_cover_with_appid(.
pub async fn fetch_cover_with_appid(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: appid: Option<&str>,.
    appid: Option<&str>,
    // Выполняем операцию: name: &str,.
    name: &str,
    // Закрываем выражение или коллекцию.
) -> ResolvedCover {
    // Объявляем переменную name .
    let name = name.trim();
    // Объявляем переменную Some(appid) .
    let Some(appid) = resolve_appid(app, appid, name)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .filter(|value| is_valid_appid(value)).
        .filter(|value| is_valid_appid(value))
    // Выполняем операцию: else {.
    else {
        // Возвращаем результат из функции.
        return ResolvedCover {
            // Выполняем операцию: appid: None,.
            appid: None,
            // Выполняем операцию: path: None,.
            path: None,
            // Закрываем блок.
        };
        // Закрываем блок.
    };

    // Объявляем переменную Ok(cache) .
    let Ok(cache) = covers_cache_dir(app) else {
        // Возвращаем результат из функции.
        return ResolvedCover {
            // Выполняем операцию: appid: Some(appid),.
            appid: Some(appid),
            // Выполняем операцию: path: None,.
            path: None,
            // Закрываем блок.
        };
        // Закрываем блок.
    };

    // Объявляем переменную target .
    let target = cache.join(format!("{appid}.jpg"));
    // Объявляем переменную cached .
    let cached = cached_cover(&target);

    // Проверяем условие: let Some(CachedCover::Fresh(path)) = cached {.
    if let Some(CachedCover::Fresh(path)) = cached {
        // Возвращаем результат из функции.
        return ResolvedCover {
            // Выполняем операцию: appid: Some(appid),.
            appid: Some(appid),
            // Выполняем операцию: path: Some(path),.
            path: Some(path),
            // Закрываем блок.
        };
        // Закрываем блок.
    }

    // Битый файл из кэша удаляется и скачивается заново. Устаревший —
    // остаётся как fallback на случай, если сеть недоступна.
    // Проверяем условие: cached.is_none() {.
    if cached.is_none() {
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&target);
        // Закрываем блок.
    }

    // Объявляем переменную fallback .
    let fallback = match cached {
        // Выполняем операцию: Some(CachedCover::Stale(path)) => Some(path),.
        Some(CachedCover::Stale(path)) => Some(path),
        // Выполняем операцию: _ => None,.
        _ => None,
        // Закрываем блок.
    };

    // Объявляем переменную bytes .
    let mut bytes = None;

    // Перебираем элементы коллекции.
    for template in COVER_URLS {
        // Проверяем условие: let Some(data) = download(&template.replace("{appi.
        if let Some(data) = download(&template.replace("{appid}", &appid)).await {
            // Выполняем операцию: bytes = Some(data);.
            bytes = Some(data);

            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Статические адреса не сработали — у новых игр это норма, у них
    // остаётся шанс через справку об игре.
    // Объявляем переменную bytes .
    let bytes = match bytes {
        // Выполняем операцию: Some(bytes) => bytes,.
        Some(bytes) => bytes,
        // Выполняем операцию: None => fetch_header_via_appdetails(&appid).
        None => fetch_header_via_appdetails(&appid)
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .unwrap_or_default(),.
            .unwrap_or_default(),
        // Закрываем блок.
    };

    // Проверяем условие: bytes.is_empty() {.
    if bytes.is_empty() {
        // Возвращаем результат из функции.
        return ResolvedCover {
            // Выполняем операцию: appid: Some(appid),.
            appid: Some(appid),
            // Выполняем операцию: path: fallback,.
            path: fallback,
            // Закрываем блок.
        };
        // Закрываем блок.
    }

    // Проверяем условие: std::fs::write(&target, &bytes).is_err() {.
    if std::fs::write(&target, &bytes).is_err() {
        // Возвращаем результат из функции.
        return ResolvedCover {
            // Выполняем операцию: appid: Some(appid),.
            appid: Some(appid),
            // Выполняем операцию: path: fallback,.
            path: fallback,
            // Закрываем блок.
        };
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Обложка {appid} скачана: {}", target.di.
    tracing::info!("Обложка {appid} скачана: {}", target.display());

    // Выполняем операцию: ResolvedCover {.
    ResolvedCover {
        // Выполняем операцию: appid: Some(appid),.
        appid: Some(appid),
        // Выполняем операцию: path: Some(target),.
        path: Some(target),
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Скачивает обложку игры и возвращает путь к файлу в кэше.
///
/// AppID берётся из игры, если он известен, иначе игра ищется по
/// названию. Если обложку добыть не удалось, возвращается `None` —
/// интерфейс покажет заглушку.
// Выполняем операцию: pub async fn fetch_cover(app: &AppHandle, appid: Option.
pub async fn fetch_cover(app: &AppHandle, appid: Option<&str>, name: &str) -> Option<PathBuf> {
    // Выполняем операцию: fetch_cover_with_appid(app, appid, name).await.path.
    fetch_cover_with_appid(app, appid, name).await.path
    // Закрываем блок.
}

/// Возвращает обложку из кэша, если файл целый.
///
/// `Fresh` — можно отдавать сразу, `Stale` — стоит обновить, но при
/// ошибке сети он лучше заглушки.
// Объявляем функцию cached_cover.
fn cached_cover(path: &PathBuf) -> Option<CachedCover> {
    // Объявляем переменную meta .
    let meta = std::fs::metadata(path).ok()?;

    // Проверяем условие: !meta.is_file() || meta.len() < MIN_COVER_BYTES as.
    if !meta.is_file() || meta.len() < MIN_COVER_BYTES as u64 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную fresh .
    let fresh = meta
        // Выполняем операцию: .modified().
        .modified()
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|modified| modified.elapsed().ok()).
        .and_then(|modified| modified.elapsed().ok())
        // Выполняем операцию: .is_some_and(|age| age < COVER_CACHE_TTL);.
        .is_some_and(|age| age < COVER_CACHE_TTL);

    // Проверяем условие: fresh {.
    if fresh {
        // Выполняем операцию: Some(CachedCover::Fresh(path.clone())).
        Some(CachedCover::Fresh(path.clone()))
    // Закрываем блок.
    } else {
        // Выполняем операцию: Some(CachedCover::Stale(path.clone())).
        Some(CachedCover::Stale(path.clone()))
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Проверяет сигнатуру файла: CDN может вернуть HTML-заглушку.
// Объявляем функцию looks_like_image.
fn looks_like_image(bytes: &[u8]) -> bool {
    // Выполняем операцию: bytes.starts_with(&[0xFF, 0xD8, 0xFF]) || bytes.starts_.
    bytes.starts_with(&[0xFF, 0xD8, 0xFF]) || bytes.starts_with(b"\x89PNG\r\n\x1a\n")
    // Закрываем блок.
}

/// Скачивает файл и проверяет, что он похож на картинку.
// Объявляем функцию download.
async fn download(url: &str) -> Option<Vec<u8>> {
    // Объявляем переменную bytes .
    let bytes = raw_download(url).await?;

    // Проверяем условие: bytes.len() < MIN_COVER_BYTES || !looks_like_image.
    if bytes.len() < MIN_COVER_BYTES || !looks_like_image(&bytes) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(bytes).
    Some(bytes)
    // Закрываем блок.
}

/// Скачивает файл без проверки содержимого.
///
/// Проверка на месте вызова: картинки проверяются на «похожесть», а
/// ответы API (например, справка об игре) — на разбираемость.
// Объявляем функцию raw_download.
async fn raw_download(url: &str) -> Option<Vec<u8>> {
    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .timeout(COVER_TIMEOUT).
        .timeout(COVER_TIMEOUT)
        // Выполняем операцию: .user_agent(USER_AGENT).
        .user_agent(USER_AGENT)
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .ok()?;.
        .ok()?;

    // Объявляем переменную response .
    let response = client.get(url).send().await.ok()?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = response.bytes().await.ok()?;

    // Проверяем условие: bytes.is_empty() {.
    if bytes.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(bytes.to_vec()).
    Some(bytes.to_vec())
    // Закрываем блок.
}

/// Адрес шапки игры через справку appdetails.
///
/// У недавно вышедших игр на CDN не осталось статических адресов: их
/// ассеты живут по адресам с хэшем, который публично не публикуется.
/// Справка отдаёт готовый адрес горизонтальной шапки — форма не
/// вертикальная, зато картинка настоящая и карточка остаётся узнаваемой.
// Объявляем функцию fetch_header_via_appdetails.
async fn fetch_header_via_appdetails(appid: &str) -> Option<Vec<u8>> {
    // Объявляем переменную body .
    let body = raw_download(&APPDETAILS_URL.replace("{appid}", appid)).await?;
    // Объявляем переменную value.
    let value: serde_json::Value = serde_json::from_slice(&body).ok()?;

    // Объявляем переменную header .
    let header = value
        // Выполняем операцию: .get(appid)?.
        .get(appid)?
        // Выполняем операцию: .get("data")?.
        .get("data")?
        // Выполняем операцию: .get("header_image")?.
        .get("header_image")?
        // Выполняем операцию: .as_str()?;.
        .as_str()?;

    // Дальше адрес уходит в загрузчик, поэтому запрещаем всё, кроме https.
    // Проверяем условие: !header.starts_with("https://") {.
    if !header.starts_with("https://") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: download(header).await.
    download(header).await
    // Закрываем блок.
}

/// Обложка для игры, добавленной вручную.
///
/// Ручные игры не проходят через скан, поэтому обложка для них
/// скачивается по требованию — сразу после добавления в список.
/// Имя приходит из интерфейса, appid — результат совпадения с
/// известной базой (`match_known_game`).
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn game_cover_for(.
pub async fn game_cover_for(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: appid: Option<String>,.
    appid: Option<String>,
    // Выполняем операцию: name: String,.
    name: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<String>> {
    // Объявляем переменную name .
    let name = name.trim().to_string();

    // Проверяем условие: name.is_empty() {.
    if name.is_empty() {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(fetch_cover(&app, appid.as_deref().map(str::trim), &.
    Ok(fetch_cover(&app, appid.as_deref().map(str::trim), &name)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map(|path| path.to_string_lossy().to_string())).
        .map(|path| path.to_string_lossy().to_string()))
    // Закрываем блок.
}

/// Отдаёт обложку из кэша как data-uri.
///
/// Путь приходит из интерфейса, поэтому принимается только файл
/// внутри каталога кэша обложек. `safe_path` канонизирует путь и
/// отсекает `..` и символические ссылки наружу.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn game_cover_file(app: AppHandle, path: Stri.
pub async fn game_cover_file(app: AppHandle, path: String) -> AppResult<Option<String>> {
    // Объявляем переменную root .
    let root = covers_cache_dir(&app)?;

    // Объявляем переменную Some(target) .
    let Some(target) = resolve_cached_cover(&root, &path) else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную Ok(bytes) .
    let Ok(bytes) = std::fs::read(&target) else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Проверяем условие: bytes.len() < MIN_COVER_BYTES {.
    if bytes.len() < MIN_COVER_BYTES {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную extension .
    let extension = target
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or("jpg").
        .unwrap_or("jpg")
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Выполняем операцию: Ok(Some(super::game_covers::to_data_uri(&bytes, &extens.
    Ok(Some(super::game_covers::to_data_uri(&bytes, &extension)?))
    // Закрываем блок.
}

// Объявляем функцию resolve_cached_cover.
fn resolve_cached_cover(root: &Path, raw: &str) -> Option<PathBuf> {
    // Объявляем переменную target .
    let target = PathBuf::from(raw.trim());
    // Объявляем переменную resolved .
    let resolved = safe_path(root, &target).ok()?;

    // Проверяем условие: !resolved.is_file() {.
    if !resolved.is_file() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную extension .
    let extension = resolved
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .map(str::to_ascii_lowercase).
        .map(str::to_ascii_lowercase)
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: COVER_FILE_EXTENSIONS.
    COVER_FILE_EXTENSIONS
        // Выполняем операцию: .contains(&extension.as_str()).
        .contains(&extension.as_str())
        // Выполняем операцию: .then_some(resolved).
        .then_some(resolved)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "cover_fetcher_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
