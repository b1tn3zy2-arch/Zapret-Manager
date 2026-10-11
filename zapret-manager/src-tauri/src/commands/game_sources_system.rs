use std::path::{Path, PathBuf};

use super::game_heuristics::collect_candidates;
use super::game_model::{GamePlatform, GameSource, InstalledGame};
use super::game_registry::{parse_icon_target, uninstall_entries};
use super::game_sources_stores::{scan_store_folder, to_game};

pub const SYSTEM_DEPTH: usize = 2;
const STORE_FOLDERS: &[(&str, GamePlatform, GameSource)] = &[
    (
        "EA Games",
        GamePlatform::Ea,
        GameSource::Ea,
    ),
    ("Battle.net", GamePlatform::BattleNet, GameSource::BattleNet),
];
const NON_GAME_WORDS: &[&str] = &[
    "driver",
    "sdk",
    "runtime",
    "redistributable",
    "toolkit",
    "service pack",
    "update",
    "library",
    "fonts",
    "code",
    "harness",
    "telegram",
    "discord",
    "slack",
    "zoom",
    "photoshop",
    "premiere",
    "visual studio",
    "vscode",
    "electron",
    "node",
    "python",
    "java",
    "git",
    "office",
    "edge",
    "chrome",
    "firefox",
    "spotify",
];

pub fn scan_uninstall_registry() -> Vec<InstalledGame> {
    uninstall_entries()
        .into_iter()
        .filter_map(registry_game)
        .collect()
}

fn registry_game(entry: super::game_registry::UninstallEntry) -> Option<InstalledGame> {
    let folder = entry
        .install_location
        .as_deref()
        .map(|value| PathBuf::from(value.trim_matches('"')))
        .or_else(|| {
            entry
                .icon_path
                .as_deref()
                .and_then(parse_icon_target)
                .and_then(|path| PathBuf::from(path).parent().map(Path::to_path_buf))
        })
        .filter(|path| path.is_dir())?;

    if NON_GAME_WORDS
        .iter()
        .any(|word| entry.display_name.to_ascii_lowercase().contains(word))
    {
        return None;
    }

    let executable = collect_candidates(&folder, 2)
        .into_iter()
        .find(|_| super::game_heuristics::is_game_candidate(&folder))?;
    let mut game = to_game(GamePlatform::Unknown, GameSource::Registry, &folder, &executable);

    game.name = entry.display_name;

    Some(game)
}

pub fn known_folders() -> Vec<PathBuf> {
    let mut result = Vec::new();

    for letter in ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'] {
        let root = format!("{letter}:\\");

        if !Path::new(&root).is_dir() {
            continue;
        }

        for suffix in ["Program Files", "Program Files (x86)", "Games"] {
            let folder = PathBuf::from(&root).join(suffix);

            if folder.is_dir() && !result.contains(&folder) {
                result.push(folder);
            }
        }
    }

    result
}

pub fn scan_known_folders() -> Vec<InstalledGame> {
    let mut result = Vec::new();

    for folder in known_folders() {
        result.extend(scan_folder(&folder, GameSource::KnownFolder));
    }

    result
}

pub fn scan_store_folders() -> Vec<InstalledGame> {
    let mut result = Vec::new();

    for (name, platform, source) in STORE_FOLDERS {
        let path = PathBuf::from(name);

        if path.is_dir() {
            result.extend(scan_store_folder(&path, *platform, *source));
        }
    }

    result
}

pub fn scan_user_folders(folders: &[String]) -> Vec<InstalledGame> {
    folders
        .iter()
        .filter(|folder| !folder.trim().is_empty())
        .flat_map(|folder| scan_folder(Path::new(folder.trim()), GameSource::UserFolder))
        .collect()
}

pub fn scan_folder(folder: &Path, source: GameSource) -> Vec<InstalledGame> {
    collect_candidates(folder, SYSTEM_DEPTH)
        .into_iter()
        .filter_map(|executable| {
            let install_path = executable.parent()?.to_path_buf();

            Some(InstalledGame::new(
                GamePlatform::Custom,
                source,
                &install_path.to_string_lossy(),
                &executable.to_string_lossy(),
            ))
        })
        .collect()
}

#[cfg(test)]
#[path = "game_sources_system_tests.rs"]
mod tests;