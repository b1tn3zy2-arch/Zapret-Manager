use std::path::{Path, PathBuf};

use winapi::um::winreg::{RegCloseKey, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};

use super::game_model::{GamePlatform, GameSource, InstalledGame};
use super::game_registry::{list_subkeys, open_key, query_string, VIEW_32, VIEW_64};
use super::game_sources_stores::{pick_executable, to_game};

const GOG_KEYS: &[&str] = &[
    r"SOFTWARE\WOW6432Node\GOG.com\Games",
    r"SOFTWARE\GOG.com\Games",
];
const UBISOFT_KEY: &str = r"Software\Ubisoft\Launcher\Installs";

pub fn scan_gog() -> Vec<InstalledGame> {
    let mut result = Vec::new();

    for key in GOG_KEYS {
        for view in [VIEW_64, VIEW_32] {
            result.extend(gog_from_registry(key, view));
        }
    }

    dedup_by_install_path(result)
}

fn gog_from_registry(key: &str, view: u32) -> Vec<InstalledGame> {
    let Some(root) = open_key(HKEY_LOCAL_MACHINE, key, view) else {
        return Vec::new();
    };

    let names = list_subkeys(root);

    unsafe { RegCloseKey(root) };

    names
        .iter()
        .filter_map(|name| gog_entry(key, view, name))
        .collect()
}

fn gog_entry(key: &str, view: u32, name: &str) -> Option<InstalledGame> {
    let handle = open_key(HKEY_LOCAL_MACHINE, &format!("{key}\\{name}"), view)?;
    let path = query_string(handle, "path");
    let label = query_string(handle, "gameName");

    unsafe { RegCloseKey(handle) };

    let folder = PathBuf::from(path?);

    if !folder.is_dir() {
        return None;
    }

    let hint = label.clone().unwrap_or_else(|| name.to_string());
    let executable = pick_executable(&folder, &hint)?;
    let mut game = to_game(GamePlatform::Gog, GameSource::Gog, &folder, &executable);

    if let Some(label) = label.filter(|value| !value.trim().is_empty()) {
        game.name = label;
    }

    Some(game)
}

pub fn scan_gog_folders() -> Vec<InstalledGame> {
    let mut result = Vec::new();

    for folder in [
        "C:\\Program Files (x86)\\GOG Games",
        "C:\\Program Files\\GOG Games",
    ] {
        result.extend(super::game_sources_stores::scan_store_folder(
            Path::new(folder),
            GamePlatform::Gog,
            GameSource::Gog,
        ));
    }

    dedup_by_install_path(result)
}

pub fn scan_ubisoft() -> Vec<InstalledGame> {
    let mut result = Vec::new();

    for view in [VIEW_64, VIEW_32] {
        result.extend(ubisoft_from_view(view));
    }

    result
}

fn ubisoft_from_view(view: u32) -> Vec<InstalledGame> {
    let Some(root) = open_key(HKEY_CURRENT_USER, UBISOFT_KEY, view) else {
        return Vec::new();
    };

    let names = list_subkeys(root);

    unsafe { RegCloseKey(root) };

    names.iter().filter_map(|name| ubisoft_entry(view, name)).collect()
}

fn ubisoft_entry(view: u32, name: &str) -> Option<InstalledGame> {
    let handle = open_key(HKEY_CURRENT_USER, &format!("{UBISOFT_KEY}\\{name}"), view)?;
    let install_dir = query_string(handle, "InstallDir");

    unsafe { RegCloseKey(handle) };

    let folder = PathBuf::from(install_dir?);

    if !folder.is_dir() {
        return None;
    }

    let executable = pick_executable(&folder, name)
        .or_else(|| super::game_heuristics::collect_candidates(&folder, 2).into_iter().next())?;

    Some(to_game(
        GamePlatform::Ubisoft,
        GameSource::Ubisoft,
        &folder,
        &executable,
    ))
}

fn dedup_by_install_path(games: Vec<InstalledGame>) -> Vec<InstalledGame> {
    let mut result: Vec<InstalledGame> = Vec::with_capacity(games.len());

    for game in games {
        if !result
            .iter()
            .any(|item| item.install_path.eq_ignore_ascii_case(&game.install_path))
        {
            result.push(game);
        }
    }

    result
}

#[cfg(test)]
#[path = "game_sources_registry_tests.rs"]
mod tests;