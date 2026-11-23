// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Deserialize;.
use serde::Deserialize;

// Подключаем модули: super::game_model::{normalize_title, Anticheat};.
use super::game_model::{normalize_title, Anticheat};
// Подключаем модули: crate::commands::resources_fs::resources_dir;.
use crate::commands::resources_fs::resources_dir;

// Объявляем константу KNOWN_GAMES_RELATIVE.
pub const KNOWN_GAMES_RELATIVE: &str = "games/known-games.json";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру KnownGame.
pub struct KnownGame {
    // Выполняем операцию: pub appid: String,.
    pub appid: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub cover: Option<String>,.
    pub cover: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub domain_settings_id: Option<String>,.
    pub domain_settings_id: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub anticheat: Option<String>,.
    pub anticheat: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub aliases: Vec<String>,.
    pub aliases: Vec<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Clone, Debug, Default)]
// Объявляем структуру KnownGames.
pub struct KnownGames {
    // Выполняем операцию: by_appid: HashMap<String, KnownGame>,.
    by_appid: HashMap<String, KnownGame>,
    // Выполняем операцию: by_name: HashMap<String, String>,.
    by_name: HashMap<String, String>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl KnownGames {
    // Объявляем функцию from_json.
    pub fn from_json(raw: &str) -> Self {
        // Объявляем переменную entries.
        let entries: Vec<KnownGame> = serde_json::from_str(raw).unwrap_or_default();
        // Объявляем переменную by_appid .
        let mut by_appid = HashMap::with_capacity(entries.len());
        // Объявляем переменную by_name .
        let mut by_name = HashMap::with_capacity(entries.len());

        // Перебираем элементы коллекции.
        for entry in entries {
            // Выполняем операцию: by_name.insert(normalize_title(&entry.name), entry.appi.
            by_name.insert(normalize_title(&entry.name), entry.appid.clone());

            // Перебираем элементы коллекции.
            for alias in &entry.aliases {
                // Выполняем операцию: by_name.insert(normalize_title(alias), entry.appid.clon.
                by_name.insert(normalize_title(alias), entry.appid.clone());
                // Закрываем блок.
            }

            // Выполняем операцию: by_appid.insert(entry.appid.clone(), entry);.
            by_appid.insert(entry.appid.clone(), entry);
            // Закрываем блок.
        }

        // Выполняем операцию: Self { by_appid, by_name }.
        Self { by_appid, by_name }
        // Закрываем блок.
    }

    // Объявляем функцию by_appid.
    pub fn by_appid(&self, appid: &str) -> Option<&KnownGame> {
        // Выполняем операцию: self.by_appid.get(appid).
        self.by_appid.get(appid)
        // Закрываем блок.
    }

    // Объявляем функцию by_name.
    pub fn by_name(&self, name: &str) -> Option<&KnownGame> {
        // Выполняем операцию: self.by_name.
        self.by_name
            // Выполняем операцию: .get(&normalize_title(name)).
            .get(&normalize_title(name))
            // Выполняем операцию: .and_then(|appid| self.by_appid.get(appid)).
            .and_then(|appid| self.by_appid.get(appid))
        // Закрываем блок.
    }

    // Объявляем функцию len.
    pub fn len(&self) -> usize {
        // Выполняем операцию: self.by_appid.len().
        self.by_appid.len()
        // Закрываем блок.
    }

    // Объявляем функцию is_empty.
    pub fn is_empty(&self) -> bool {
        // Выполняем операцию: self.by_appid.is_empty().
        self.by_appid.is_empty()
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Список известных игр не меняется во время работы приложения, а
/// `match_known_game` вызывается из интерфейса по кругу для каждой
/// ручной игры. Без кэша JSON перечитывался и разбирался заново на
/// каждом вызове.
// Объявляем константу KNOWN_GAMES_CACHE.
static KNOWN_GAMES_CACHE: once_cell::sync::Lazy<std::sync::Mutex<Option<(u64, KnownGames)>>> =
    // Выполняем операцию: once_cell::sync::Lazy::new(|| std::sync::Mutex::new(Non.
    once_cell::sync::Lazy::new(|| std::sync::Mutex::new(None));

// Объявляем функцию known_games_mtime.
fn known_games_mtime(resources: &Path) -> u64 {
    // Выполняем операцию: std::fs::metadata(resources.join(KNOWN_GAMES_RELATIVE)).
    std::fs::metadata(resources.join(KNOWN_GAMES_RELATIVE))
        // Выполняем операцию: .and_then(|meta| meta.modified()).
        .and_then(|meta| meta.modified())
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|time| time.duration_since(std::time::UNIX_EP.
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        // Выполняем операцию: .map(|value| value.as_millis() as u64).
        .map(|value| value.as_millis() as u64)
        // Выполняем операцию: .unwrap_or(0).
        .unwrap_or(0)
    // Закрываем блок.
}

/// Известные игры с кэшем: файл перечитывается, только если он
/// изменился на диске.
// Объявляем функцию load_known_games_cached.
pub fn load_known_games_cached(app: &tauri::AppHandle) -> KnownGames {
    // Объявляем переменную resources .
    let resources = resources_dir(app).unwrap_or_else(|_| PathBuf::from("."));
    // Объявляем переменную stamp .
    let stamp = known_games_mtime(&resources);

    // Объявляем переменную Ok(mut cache) .
    let Ok(mut cache) = KNOWN_GAMES_CACHE.lock() else {
        // Возвращаем результат из функции.
        return known_games_at(&resources);
        // Закрываем блок.
    };

    // Проверяем условие: let Some((cached_stamp, known)) = cache.as_ref() {.
    if let Some((cached_stamp, known)) = cache.as_ref() {
        // Проверяем условие: *cached_stamp == stamp {.
        if *cached_stamp == stamp {
            // Возвращаем результат из функции.
            return known.clone();
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную known .
    let known = known_games_at(&resources);
    *cache = Some((stamp, known.clone()));

    // Выполняем операцию: known.
    known
    // Закрываем блок.
}

// Объявляем функцию known_games_at.
pub fn known_games_at(resources: &Path) -> KnownGames {
    // Объявляем переменную path .
    let path = resources.join(KNOWN_GAMES_RELATIVE);

    // Выполняем операцию: std::fs::read_to_string(path).
    std::fs::read_to_string(path)
        // Выполняем операцию: .map(|raw| KnownGames::from_json(&raw)).
        .map(|raw| KnownGames::from_json(&raw))
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
    // Закрываем блок.
}

// Объявляем функцию cover_relative_path.
pub fn cover_relative_path(cover: &str) -> PathBuf {
    // Выполняем операцию: PathBuf::from("games").join("covers").join(cover).
    PathBuf::from("games").join("covers").join(cover)
    // Закрываем блок.
}

// Объявляем функцию known_cover_url.
pub fn known_cover_url(app: &tauri::AppHandle, cover: &str) -> Option<String> {
    // Объявляем переменную resources .
    let resources = resources_dir(app).ok()?;

    // Выполняем операцию: resolve_cover_file(&resources, cover).map(|path| path.t.
    resolve_cover_file(&resources, cover).map(|path| path.to_string_lossy().to_string())
    // Закрываем блок.
}

// Объявляем функцию resolve_cover_file.
pub fn resolve_cover_file(resources: &Path, cover: &str) -> Option<PathBuf> {
    // Проверяем условие: cover.is_empty() || cover.contains("..") {.
    if cover.is_empty() || cover.contains("..") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную direct .
    let direct = resources.join(cover);

    // Проверяем условие: direct.is_file() {.
    if direct.is_file() {
        // Возвращаем результат из функции.
        return Some(direct);
        // Закрываем блок.
    }

    // Объявляем переменную bundled .
    let bundled = resources.join(cover_relative_path(cover));

    // Выполняем операцию: bundled.is_file().then_some(bundled).
    bundled.is_file().then_some(bundled)
    // Закрываем блок.
}

// Объявляем функцию anticheat_of.
pub fn anticheat_of(game: &KnownGame) -> Anticheat {
    // Выполняем операцию: game.anticheat.
    game.anticheat
        // Выполняем операцию: .as_deref().
        .as_deref()
        // Выполняем операцию: .map(Anticheat::parse).
        .map(Anticheat::parse)
        // Выполняем операцию: .unwrap_or(Anticheat::None).
        .unwrap_or(Anticheat::None)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_known_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
