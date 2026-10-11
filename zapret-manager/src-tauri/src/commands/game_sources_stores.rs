use std::path::{Path, PathBuf};

use serde::Deserialize;
use winapi::um::winreg::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};

use super::game_heuristics::{collect_candidates_relaxed, has_unreal_layout};
use super::game_model::{GamePlatform, GameSource, InstalledGame};
use super::game_registry::{read_registry_string, VIEW_32, VIEW_64};
use super::game_scanner_vdf::{parse_acf, parse_install_dir, parse_library_paths};

pub const STORE_DEPTH: usize = 4;
const STEAM_KEY: &str = r"SOFTWARE\Valve\Steam";
const STEAM_WOW_KEY: &str = r"SOFTWARE\WOW6432Node\Valve\Steam";
const EPIC_MANIFEST: &str = r"C:\ProgramData\Epic\UnrealEngineLauncher\LauncherInstalled.dat";
const NON_GAME_STORE_TITLES: &[&str] = &["obs studio", "wallpaper engine"];
const NON_GAME_APPIDS: &[&str] = &["1905180", "431960"];

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct EpicManifest {
    #[serde(default)]
    installation_list: Vec<EpicEntry>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct EpicEntry {
    #[serde(default)]
    app_name: String,
    #[serde(default)]
    install_location: String,
}

fn same_path(left: &Path, right: &Path) -> bool {
    left.to_string_lossy()
        .replace('/', "\\")
        .eq_ignore_ascii_case(&right.to_string_lossy().replace('/', "\\"))
}

pub fn scan_steam() -> Vec<InstalledGame> {
    let Some(root) = steam_root() else {
        return Vec::new();
    };
    let mut libraries = vec![root.clone()];

    if let Ok(content) = std::fs::read_to_string(root.join("steamapps/libraryfolders.vdf")) {
        for path in parse_library_paths(&content) {
            let candidate = PathBuf::from(path);

            if candidate.is_dir() && !libraries.iter().any(|item| same_path(item, &candidate)) {
                libraries.push(candidate);
            }
        }
    }

    libraries
        .iter()
        .flat_map(|library| scan_steam_library(library))
        .collect()
}

fn steam_root() -> Option<PathBuf> {
    let found = read_registry_string(
        &[
            (HKEY_CURRENT_USER, STEAM_KEY, "SteamPath"),
            (HKEY_LOCAL_MACHINE, STEAM_WOW_KEY, "InstallPath"),
            (HKEY_LOCAL_MACHINE, STEAM_KEY, "InstallPath"),
        ],
        &[VIEW_64, VIEW_32],
    )?;
    let path = PathBuf::from(found);

    path.is_dir().then_some(path)
}

fn scan_steam_library(library: &Path) -> Vec<InstalledGame> {
    let steamapps = library.join("steamapps");
    let Ok(entries) = std::fs::read_dir(&steamapps) else {
        return Vec::new();
    };

    entries
        .filter_map(Result::ok)
        .filter(|entry| {
            entry
                .file_name()
                .to_string_lossy()
                .starts_with("appmanifest_")
        })
        .filter_map(|entry| steam_game(&steamapps, &entry.path()))
        .collect()
}

fn steam_game(steamapps: &Path, manifest_path: &Path) -> Option<InstalledGame> {
    let content = std::fs::read_to_string(manifest_path).ok()?;
    let pairs = parse_acf(&content);
    let appid = pairs.get("appid")?.trim().to_string();
    let folder = parse_install_dir(&content)?;
    let name = pairs
        .get("name")
        .cloned()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| folder.clone());
    let install_path = steamapps.join("common").join(folder);

    if !install_path.is_dir() {
        return None;
    }

    if is_non_game(name.to_ascii_lowercase().as_str(), &appid) {
        return None;
    }

    let executable = launch_target(&install_path, &name);
    let mut game = to_game(
        GamePlatform::Steam,
        GameSource::Steam,
        &install_path,
        &executable,
    );

    game.appid = Some(appid);
    game.name = name;

    Some(game)
}

pub fn scan_epic() -> Vec<InstalledGame> {
    let mut result = epic_from_path(Path::new(EPIC_MANIFEST));
    let mut seen = result
        .iter()
        .map(|game| game.install_path.clone())
        .collect::<Vec<_>>();

    for folder in ["C:\\Program Files\\Epic Games", "C:\\Program Files (x86)\\Epic Games"] {
        for game in scan_store_folder(Path::new(folder), GamePlatform::Epic, GameSource::Epic) {
            if !seen.contains(&game.install_path) {
                seen.push(game.install_path.clone());
                result.push(game);
            }
        }
    }

    result
}

fn epic_from_path(manifest_path: &Path) -> Vec<InstalledGame> {
    let Ok(content) = std::fs::read_to_string(manifest_path) else {
        return Vec::new();
    };
    let Ok(manifest) = serde_json::from_str::<EpicManifest>(&content) else {
        return Vec::new();
    };

    manifest
        .installation_list
        .into_iter()
        .filter(|entry| !entry.install_location.trim().is_empty())
        .filter_map(|entry| {
            let folder = PathBuf::from(entry.install_location.trim());
            let executable = pick_executable(&folder, &entry.app_name)?;
            let mut game = to_game(
                GamePlatform::Epic,
                GameSource::Epic,
                &folder,
                &executable,
            );

            if !entry.app_name.trim().is_empty() {
                game.name = entry.app_name.trim().to_string();
            }

            Some(game)
        })
        .collect()
}

fn is_non_game(name: &str, appid: &str) -> bool {
    NON_GAME_STORE_TITLES.iter().any(|title| name.contains(title))
        || NON_GAME_APPIDS.contains(&appid)
}

pub fn scan_store_folder(
    folder: &Path,
    platform: GamePlatform,
    source: GameSource,
) -> Vec<InstalledGame> {
    collect_candidates_relaxed(folder, STORE_DEPTH)
        .into_iter()
        .filter_map(|executable| {
            let install_path = executable.parent()?.to_path_buf();

            Some(to_game(platform, source, &install_path, &executable))
        })
        .collect()
}

pub fn launch_target(folder: &Path, name_hint: &str) -> PathBuf {
    let protected = folder.join("start_protected_game.exe");

    if protected.is_file() {
        return protected;
    }

    pick_executable(folder, name_hint)
        .unwrap_or_else(|| folder.to_path_buf())
}

pub fn pick_executable(folder: &Path, name_hint: &str) -> Option<PathBuf> {
    collect_candidates_relaxed(folder, STORE_DEPTH)
        .into_iter()
        .max_by_key(|path| executable_score(path, name_hint))
}

pub fn to_game(
    platform: GamePlatform,
    source: GameSource,
    install_path: &Path,
    executable: &Path,
) -> InstalledGame {
    InstalledGame::new(
        platform,
        source,
        &install_path.to_string_lossy(),
        &executable.to_string_lossy(),
    )
}

pub fn executable_score(path: &Path, game_name: &str) -> u64 {
    let stem = path
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let name: String = game_name
        .to_ascii_lowercase()
        .chars()
        .filter(|item| item.is_alphanumeric())
        .collect();
    let mut score = 0;

    if !name.is_empty() && stem.replace('-', "").contains(&name) {
        score += 100;
    }

    if has_unreal_layout(path) {
        score += 50;
    }

    if stem.contains("shipping") {
        score += 25;
    }

    let megabytes = std::fs::metadata(path)
        .map(|value| value.len() / (1024 * 1024))
        .unwrap_or(0);

    score + megabytes.min(30)
}

#[cfg(test)]
#[path = "game_sources_stores_tests.rs"]
mod tests;