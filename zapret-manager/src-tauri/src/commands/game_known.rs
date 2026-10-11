use std::collections::HashMap;
use std::path::{Path, PathBuf};

use serde::Deserialize;

use super::game_model::{normalize_title, Anticheat};
use crate::commands::resources_fs::resources_dir;

pub const KNOWN_GAMES_RELATIVE: &str = "games/known-games.json";

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KnownGame {
    pub appid: String,
    pub name: String,
    #[serde(default)]
    pub cover: Option<String>,
    #[serde(default)]
    pub domain_settings_id: Option<String>,
    #[serde(default)]
    pub anticheat: Option<String>,
    #[serde(default)]
    pub bypass_mode: Option<String>,
    #[serde(default)]
    pub aliases: Vec<String>,
}

#[derive(Debug, Default)]
pub struct KnownGames {
    by_appid: HashMap<String, KnownGame>,
    by_name: HashMap<String, String>,
}

impl KnownGames {
    pub fn from_json(raw: &str) -> Self {
        let entries: Vec<KnownGame> = serde_json::from_str(raw).unwrap_or_default();
        let mut by_appid = HashMap::with_capacity(entries.len());
        let mut by_name = HashMap::with_capacity(entries.len());

        for entry in entries {
            by_name.insert(normalize_title(&entry.name), entry.appid.clone());

            for alias in &entry.aliases {
                by_name.insert(normalize_title(alias), entry.appid.clone());
            }

            by_appid.insert(entry.appid.clone(), entry);
        }

        Self { by_appid, by_name }
    }

    pub fn by_appid(&self, appid: &str) -> Option<&KnownGame> {
        self.by_appid.get(appid)
    }

    pub fn by_name(&self, name: &str) -> Option<&KnownGame> {
        self.by_name
            .get(&normalize_title(name))
            .and_then(|appid| self.by_appid.get(appid))
    }

    pub fn len(&self) -> usize {
        self.by_appid.len()
    }

    pub fn is_empty(&self) -> bool {
        self.by_appid.is_empty()
    }
}

pub fn load_known_games(app: &tauri::AppHandle) -> KnownGames {
    known_games_at(&resources_dir(app).unwrap_or_else(|_| PathBuf::from(".")))
}

pub fn known_games_at(resources: &Path) -> KnownGames {
    let path = resources.join(KNOWN_GAMES_RELATIVE);

    std::fs::read_to_string(path)
        .map(|raw| KnownGames::from_json(&raw))
        .unwrap_or_default()
}

pub fn cover_relative_path(cover: &str) -> PathBuf {
    PathBuf::from("games").join("covers").join(cover)
}

pub fn known_cover_url(app: &tauri::AppHandle, cover: &str) -> Option<String> {
    let resources = resources_dir(app).ok()?;

    resolve_cover_file(&resources, cover).map(|path| path.to_string_lossy().to_string())
}

pub fn resolve_cover_file(resources: &Path, cover: &str) -> Option<PathBuf> {
    if cover.is_empty() || cover.contains("..") {
        return None;
    }

    let direct = resources.join(cover);

    if direct.is_file() {
        return Some(direct);
    }

    let bundled = resources.join(cover_relative_path(cover));

    bundled.is_file().then_some(bundled)
}

pub fn anticheat_of(game: &KnownGame) -> Anticheat {
    game.anticheat
        .as_deref()
        .map(Anticheat::parse)
        .unwrap_or(Anticheat::None)
}

#[cfg(test)]
#[path = "game_known_tests.rs"]
mod tests;