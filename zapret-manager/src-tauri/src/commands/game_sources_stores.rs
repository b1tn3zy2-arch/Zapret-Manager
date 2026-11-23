// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Deserialize;.
use serde::Deserialize;
// Подключаем модули: winapi::um::winreg::{HKEY_CURRENT_USER, HKEY_LOCAL_MACH.
use winapi::um::winreg::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};

// Подключаем модули: super::game_heuristics::{collect_candidates_relaxed, ha.
use super::game_heuristics::{collect_candidates_relaxed, has_unreal_layout};
// Подключаем модули: super::game_model::{GamePlatform, GameSource, Installed.
use super::game_model::{GamePlatform, GameSource, InstalledGame};
// Подключаем модули: super::game_registry::{read_registry_string, VIEW_32, V.
use super::game_registry::{read_registry_string, VIEW_32, VIEW_64};
// Подключаем модули: super::game_scanner_vdf::{parse_acf, parse_install_dir,.
use super::game_scanner_vdf::{parse_acf, parse_install_dir, parse_library_paths};

// Объявляем константу STORE_DEPTH.
pub const STORE_DEPTH: usize = 4;
// Объявляем константу STEAM_KEY.
const STEAM_KEY: &str = r"SOFTWARE\Valve\Steam";
// Объявляем константу STEAM_WOW_KEY.
const STEAM_WOW_KEY: &str = r"SOFTWARE\WOW6432Node\Valve\Steam";
// Объявляем константу EPIC_MANIFEST.
const EPIC_MANIFEST: &str = r"C:\ProgramData\Epic\UnrealEngineLauncher\LauncherInstalled.dat";
// Объявляем константу NON_GAME_STORE_TITLES.
const NON_GAME_STORE_TITLES: &[&str] = &["obs studio", "wallpaper engine"];
// Объявляем константу NON_GAME_APPIDS.
const NON_GAME_APPIDS: &[&str] = &["1905180", "431960"];

// Применяем атрибут к следующему объявлению.
#[derive(Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "PascalCase")]
// Объявляем структуру EpicManifest.
struct EpicManifest {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: installation_list: Vec<EpicEntry>,.
    installation_list: Vec<EpicEntry>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "PascalCase")]
// Объявляем структуру EpicEntry.
struct EpicEntry {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: app_name: String,.
    app_name: String,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: install_location: String,.
    install_location: String,
    // Закрываем блок.
}

// Объявляем функцию same_path.
fn same_path(left: &Path, right: &Path) -> bool {
    // Выполняем операцию: left.to_string_lossy().
    left.to_string_lossy()
        // Выполняем операцию: .replace('/', "\\").
        .replace('/', "\\")
        // Выполняем операцию: .eq_ignore_ascii_case(&right.to_string_lossy().replace(.
        .eq_ignore_ascii_case(&right.to_string_lossy().replace('/', "\\"))
    // Закрываем блок.
}

// Объявляем функцию scan_steam.
pub fn scan_steam() -> Vec<InstalledGame> {
    // Объявляем переменную Some(root) .
    let Some(root) = steam_root() else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };
    // Объявляем переменную libraries .
    let mut libraries = vec![root.clone()];

    // Проверяем условие: let Ok(content) = std::fs::read_to_string(root.joi.
    if let Ok(content) = std::fs::read_to_string(root.join("steamapps/libraryfolders.vdf")) {
        // Перебираем элементы коллекции.
        for path in parse_library_paths(&content) {
            // Объявляем переменную candidate .
            let candidate = PathBuf::from(path);

            // Проверяем условие: candidate.is_dir() && !libraries.iter().any(|item|.
            if candidate.is_dir() && !libraries.iter().any(|item| same_path(item, &candidate)) {
                // Выполняем операцию: libraries.push(candidate);.
                libraries.push(candidate);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: libraries.
    libraries
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .flat_map(|library| scan_steam_library(library)).
        .flat_map(|library| scan_steam_library(library))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию steam_root.
fn steam_root() -> Option<PathBuf> {
    // Объявляем переменную found .
    let found = read_registry_string(
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: (HKEY_CURRENT_USER, STEAM_KEY, "SteamPath"),.
            (HKEY_CURRENT_USER, STEAM_KEY, "SteamPath"),
            // Выполняем операцию: (HKEY_LOCAL_MACHINE, STEAM_WOW_KEY, "InstallPath"),.
            (HKEY_LOCAL_MACHINE, STEAM_WOW_KEY, "InstallPath"),
            // Выполняем операцию: (HKEY_LOCAL_MACHINE, STEAM_KEY, "InstallPath"),.
            (HKEY_LOCAL_MACHINE, STEAM_KEY, "InstallPath"),
            // Выполняем операцию: ],.
        ],
        // Выполняем операцию: &[VIEW_64, VIEW_32],.
        &[VIEW_64, VIEW_32],
        // Закрываем выражение или коллекцию.
    )?;
    // Объявляем переменную path .
    let path = PathBuf::from(found);

    // Выполняем операцию: path.is_dir().then_some(path).
    path.is_dir().then_some(path)
    // Закрываем блок.
}

// Объявляем функцию scan_steam_library.
fn scan_steam_library(library: &Path) -> Vec<InstalledGame> {
    // Объявляем переменную steamapps .
    let steamapps = library.join("steamapps");
    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(&steamapps) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Выполняем операцию: entries.
    entries
        // Выполняем операцию: .filter_map(Result::ok).
        .filter_map(Result::ok)
        // Выполняем операцию: .filter(|entry| {.
        .filter(|entry| {
            // Выполняем операцию: entry.
            entry
                // Выполняем операцию: .file_name().
                .file_name()
                // Выполняем операцию: .to_string_lossy().
                .to_string_lossy()
                // Выполняем операцию: .starts_with("appmanifest_").
                .starts_with("appmanifest_")
            // Закрываем блок.
        })
        // Выполняем операцию: .filter_map(|entry| steam_game(&steamapps, &entry.path(.
        .filter_map(|entry| steam_game(&steamapps, &entry.path()))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию steam_game.
fn steam_game(steamapps: &Path, manifest_path: &Path) -> Option<InstalledGame> {
    // Объявляем переменную content .
    let content = std::fs::read_to_string(manifest_path).ok()?;
    // Объявляем переменную pairs .
    let pairs = parse_acf(&content);
    // Объявляем переменную appid .
    let appid = pairs.get("appid")?.trim().to_string();
    // Объявляем переменную folder .
    let folder = parse_install_dir(&content)?;
    // Объявляем переменную name .
    let name = pairs
        // Выполняем операцию: .get("name").
        .get("name")
        // Выполняем операцию: .cloned().
        .cloned()
        // Выполняем операцию: .filter(|value| !value.trim().is_empty()).
        .filter(|value| !value.trim().is_empty())
        // Выполняем операцию: .unwrap_or_else(|| folder.clone());.
        .unwrap_or_else(|| folder.clone());
    // Объявляем переменную install_path .
    let install_path = steamapps.join("common").join(folder);

    // Проверяем условие: !install_path.is_dir() {.
    if !install_path.is_dir() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Проверяем условие: is_non_game(name.to_ascii_lowercase().as_str(), &a.
    if is_non_game(name.to_ascii_lowercase().as_str(), &appid) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную executable .
    let executable = launch_target(&install_path, &name);
    // Объявляем переменную game .
    let mut game = to_game(
        // Выполняем операцию: GamePlatform::Steam,.
        GamePlatform::Steam,
        // Выполняем операцию: GameSource::Steam,.
        GameSource::Steam,
        // Выполняем операцию: &install_path,.
        &install_path,
        // Выполняем операцию: &executable,.
        &executable,
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: game.appid = Some(appid);.
    game.appid = Some(appid);
    // Выполняем операцию: game.name = name;.
    game.name = name;

    // Выполняем операцию: Some(game).
    Some(game)
    // Закрываем блок.
}

// Объявляем функцию scan_epic.
pub fn scan_epic() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = epic_from_path(Path::new(EPIC_MANIFEST));
    // Объявляем переменную seen .
    let mut seen = result
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|game| game.install_path.clone()).
        .map(|game| game.install_path.clone())
        // Выполняем операцию: .collect::<Vec<_>>();.
        .collect::<Vec<_>>();

    // Перебираем элементы коллекции.
    for folder in [
        // Выполняем операцию: "C:\\Program Files\\Epic Games",.
        "C:\\Program Files\\Epic Games",
        // Выполняем операцию: "C:\\Program Files (x86)\\Epic Games",.
        "C:\\Program Files (x86)\\Epic Games",
        // Выполняем операцию: ] {.
    ] {
        // Перебираем элементы коллекции.
        for game in scan_store_folder(Path::new(folder), GamePlatform::Epic, GameSource::Epic) {
            // Проверяем условие: !seen.contains(&game.install_path) {.
            if !seen.contains(&game.install_path) {
                // Выполняем операцию: seen.push(game.install_path.clone());.
                seen.push(game.install_path.clone());
                // Выполняем операцию: result.push(game);.
                result.push(game);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию epic_from_path.
fn epic_from_path(manifest_path: &Path) -> Vec<InstalledGame> {
    // Объявляем переменную Ok(content) .
    let Ok(content) = std::fs::read_to_string(manifest_path) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };
    // Объявляем переменную Ok(manifest) .
    let Ok(manifest) = serde_json::from_str::<EpicManifest>(&content) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Выполняем операцию: manifest.
    manifest
        // Выполняем операцию: .installation_list.
        .installation_list
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|entry| !entry.install_location.trim().is_empty.
        .filter(|entry| !entry.install_location.trim().is_empty())
        // Выполняем операцию: .filter_map(|entry| {.
        .filter_map(|entry| {
            // Объявляем переменную folder .
            let folder = PathBuf::from(entry.install_location.trim());
            // Объявляем переменную executable .
            let executable = pick_executable(&folder, &entry.app_name)?;
            // Объявляем переменную game .
            let mut game = to_game(GamePlatform::Epic, GameSource::Epic, &folder, &executable);

            // Проверяем условие: !entry.app_name.trim().is_empty() {.
            if !entry.app_name.trim().is_empty() {
                // Выполняем операцию: game.name = entry.app_name.trim().to_string();.
                game.name = entry.app_name.trim().to_string();
                // Закрываем блок.
            }

            // Выполняем операцию: Some(game).
            Some(game)
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию is_non_game.
fn is_non_game(name: &str, appid: &str) -> bool {
    // Выполняем операцию: NON_GAME_STORE_TITLES.
    NON_GAME_STORE_TITLES
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|title| name.contains(title)).
        .any(|title| name.contains(title))
        // Выполняем операцию: || NON_GAME_APPIDS.contains(&appid).
        || NON_GAME_APPIDS.contains(&appid)
    // Закрываем блок.
}

// Объявляем функцию scan_store_folder.
pub fn scan_store_folder(
    // Выполняем операцию: folder: &Path,.
    folder: &Path,
    // Выполняем операцию: platform: GamePlatform,.
    platform: GamePlatform,
    // Выполняем операцию: source: GameSource,.
    source: GameSource,
    // Закрываем выражение или коллекцию.
) -> Vec<InstalledGame> {
    // Выполняем операцию: collect_candidates_relaxed(folder, STORE_DEPTH).
    collect_candidates_relaxed(folder, STORE_DEPTH)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_map(|executable| {.
        .filter_map(|executable| {
            // Объявляем переменную install_path .
            let install_path = executable.parent()?.to_path_buf();

            // Выполняем операцию: Some(to_game(platform, source, &install_path, &executab.
            Some(to_game(platform, source, &install_path, &executable))
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию launch_target.
pub fn launch_target(folder: &Path, name_hint: &str) -> PathBuf {
    // Объявляем переменную protected .
    let protected = folder.join("start_protected_game.exe");

    // Проверяем условие: protected.is_file() {.
    if protected.is_file() {
        // Возвращаем результат из функции.
        return protected;
        // Закрываем блок.
    }

    // Выполняем операцию: pick_executable(folder, name_hint).unwrap_or_else(|| fo.
    pick_executable(folder, name_hint).unwrap_or_else(|| folder.to_path_buf())
    // Закрываем блок.
}

// Объявляем функцию pick_executable.
pub fn pick_executable(folder: &Path, name_hint: &str) -> Option<PathBuf> {
    // Выполняем операцию: collect_candidates_relaxed(folder, STORE_DEPTH).
    collect_candidates_relaxed(folder, STORE_DEPTH)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .max_by_key(|path| executable_score(path, name_hint)).
        .max_by_key(|path| executable_score(path, name_hint))
    // Закрываем блок.
}

// Объявляем функцию to_game.
pub fn to_game(
    // Выполняем операцию: platform: GamePlatform,.
    platform: GamePlatform,
    // Выполняем операцию: source: GameSource,.
    source: GameSource,
    // Выполняем операцию: install_path: &Path,.
    install_path: &Path,
    // Выполняем операцию: executable: &Path,.
    executable: &Path,
    // Закрываем выражение или коллекцию.
) -> InstalledGame {
    // Выполняем операцию: InstalledGame::new(.
    InstalledGame::new(
        // Выполняем операцию: platform,.
        platform,
        // Выполняем операцию: source,.
        source,
        // Выполняем операцию: &install_path.to_string_lossy(),.
        &install_path.to_string_lossy(),
        // Выполняем операцию: &executable.to_string_lossy(),.
        &executable.to_string_lossy(),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Объявляем функцию executable_score.
pub fn executable_score(path: &Path, game_name: &str) -> u64 {
    // Объявляем переменную stem .
    let stem = path
        // Выполняем операцию: .file_stem().
        .file_stem()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();
    // Объявляем переменную name.
    let name: String = game_name
        // Выполняем операцию: .to_ascii_lowercase().
        .to_ascii_lowercase()
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .filter(|item| item.is_alphanumeric()).
        .filter(|item| item.is_alphanumeric())
        // Выполняем операцию: .collect();.
        .collect();
    // Объявляем переменную score .
    let mut score = 0;

    // Проверяем условие: !name.is_empty() && stem.replace('-', "").contains.
    if !name.is_empty() && stem.replace('-', "").contains(&name) {
        // Выполняем операцию: score += 100;.
        score += 100;
        // Закрываем блок.
    }

    // Проверяем условие: has_unreal_layout(path) {.
    if has_unreal_layout(path) {
        // Выполняем операцию: score += 50;.
        score += 50;
        // Закрываем блок.
    }

    // Проверяем условие: stem.contains("shipping") {.
    if stem.contains("shipping") {
        // Выполняем операцию: score += 25;.
        score += 25;
        // Закрываем блок.
    }

    // Объявляем переменную megabytes .
    let megabytes = std::fs::metadata(path)
        // Выполняем операцию: .map(|value| value.len() / (1024 * 1024)).
        .map(|value| value.len() / (1024 * 1024))
        // Выполняем операцию: .unwrap_or(0);.
        .unwrap_or(0);

    // Выполняем операцию: score + megabytes.min(30).
    score + megabytes.min(30)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_sources_stores_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
