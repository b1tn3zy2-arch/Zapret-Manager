// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: winapi::um::winreg::{RegCloseKey, HKEY_CURRENT_USER, HK.
use winapi::um::winreg::{RegCloseKey, HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};

// Подключаем модули: super::game_model::{GamePlatform, GameSource, Installed.
use super::game_model::{GamePlatform, GameSource, InstalledGame};
// Подключаем модули: super::game_registry::{list_subkeys, open_key, query_st.
use super::game_registry::{list_subkeys, open_key, query_string, VIEW_32, VIEW_64};
// Подключаем модули: super::game_sources_stores::{pick_executable, to_game};.
use super::game_sources_stores::{pick_executable, to_game};

// Объявляем константу GOG_KEYS.
const GOG_KEYS: &[&str] = &[
    // Выполняем операцию: r"SOFTWARE\WOW6432Node\GOG.com\Games",.
    r"SOFTWARE\WOW6432Node\GOG.com\Games",
    // Выполняем операцию: r"SOFTWARE\GOG.com\Games",.
    r"SOFTWARE\GOG.com\Games",
    // Закрываем выражение или коллекцию.
];
// Объявляем константу UBISOFT_KEY.
const UBISOFT_KEY: &str = r"Software\Ubisoft\Launcher\Installs";

// Объявляем функцию scan_gog.
pub fn scan_gog() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for key in GOG_KEYS {
        // Перебираем элементы коллекции.
        for view in [VIEW_64, VIEW_32] {
            // Выполняем операцию: result.extend(gog_from_registry(key, view));.
            result.extend(gog_from_registry(key, view));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: dedup_by_install_path(result).
    dedup_by_install_path(result)
    // Закрываем блок.
}

// Объявляем функцию gog_from_registry.
fn gog_from_registry(key: &str, view: u32) -> Vec<InstalledGame> {
    // Объявляем переменную Some(root) .
    let Some(root) = open_key(HKEY_LOCAL_MACHINE, key, view) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную names .
    let names = list_subkeys(root);

    // Выполняем операцию: unsafe { RegCloseKey(root) };.
    unsafe { RegCloseKey(root) };

    // Выполняем операцию: names.
    names
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter_map(|name| gog_entry(key, view, name)).
        .filter_map(|name| gog_entry(key, view, name))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию gog_entry.
fn gog_entry(key: &str, view: u32, name: &str) -> Option<InstalledGame> {
    // Объявляем переменную handle .
    let handle = open_key(HKEY_LOCAL_MACHINE, &format!("{key}\\{name}"), view)?;
    // Объявляем переменную path .
    let path = query_string(handle, "path");
    // Объявляем переменную label .
    let label = query_string(handle, "gameName");

    // Выполняем операцию: unsafe { RegCloseKey(handle) };.
    unsafe { RegCloseKey(handle) };

    // Объявляем переменную folder .
    let folder = PathBuf::from(path?);

    // Проверяем условие: !folder.is_dir() {.
    if !folder.is_dir() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную hint .
    let hint = label.clone().unwrap_or_else(|| name.to_string());
    // Объявляем переменную executable .
    let executable = pick_executable(&folder, &hint)?;
    // Объявляем переменную game .
    let mut game = to_game(GamePlatform::Gog, GameSource::Gog, &folder, &executable);

    // Проверяем условие: let Some(label) = label.filter(|value| !value.trim.
    if let Some(label) = label.filter(|value| !value.trim().is_empty()) {
        // Выполняем операцию: game.name = label;.
        game.name = label;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(game).
    Some(game)
    // Закрываем блок.
}

// Объявляем функцию scan_gog_folders.
pub fn scan_gog_folders() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for folder in [
        // Выполняем операцию: "C:\\Program Files (x86)\\GOG Games",.
        "C:\\Program Files (x86)\\GOG Games",
        // Выполняем операцию: "C:\\Program Files\\GOG Games",.
        "C:\\Program Files\\GOG Games",
        // Выполняем операцию: ] {.
    ] {
        // Выполняем операцию: result.extend(super::game_sources_stores::scan_store_fo.
        result.extend(super::game_sources_stores::scan_store_folder(
            // Выполняем операцию: Path::new(folder),.
            Path::new(folder),
            // Выполняем операцию: GamePlatform::Gog,.
            GamePlatform::Gog,
            // Выполняем операцию: GameSource::Gog,.
            GameSource::Gog,
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: dedup_by_install_path(result).
    dedup_by_install_path(result)
    // Закрываем блок.
}

// Объявляем функцию scan_ubisoft.
pub fn scan_ubisoft() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for view in [VIEW_64, VIEW_32] {
        // Выполняем операцию: result.extend(ubisoft_from_view(view));.
        result.extend(ubisoft_from_view(view));
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

/// Riot не пишет установки в реестр: League, Valorant и остальные лежат в
/// `C:\Riot Games\<Игра>` на каждом диске, поэтому источник папковый.
// Объявляем константу RIOT_FOLDER.
const RIOT_FOLDER: &str = "Riot Games";

/// Сам клиент Riot — не игра, его запускать нечего.
// Объявляем константу RIOT_SKIP.
const RIOT_SKIP: &[&str] = &["riot client", "riotclient"];

// Объявляем функцию scan_riot.
pub fn scan_riot() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for root in super::game_sources_system::drive_roots() {
        // Объявляем переменную base .
        let base = PathBuf::from(&root).join(RIOT_FOLDER);

        // Проверяем условие: !base.is_dir() {.
        if !base.is_dir() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Ok(entries) .
        let Ok(entries) = std::fs::read_dir(&base) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Перебираем элементы коллекции.
        for entry in entries.flatten() {
            // Объявляем переменную folder .
            let folder = entry.path();

            // Проверяем условие: !folder.is_dir() {.
            if !folder.is_dir() {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Объявляем переменную name .
            let name = folder
                // Выполняем операцию: .file_name().
                .file_name()
                // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
                .map(|value| value.to_string_lossy().to_string())
                // Выполняем операцию: .unwrap_or_default();.
                .unwrap_or_default();

            // Проверяем условие: name.is_empty() || RIOT_SKIP.iter().any(|skip| nam.
            if name.is_empty() || RIOT_SKIP.iter().any(|skip| name.contains(skip)) {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Объявляем переменную Some(executable) .
            let Some(executable) = super::game_heuristics::collect_candidates(&folder, 2)
                // Выполняем операцию: .into_iter().
                .into_iter()
                // Выполняем операцию: .next().
                .next()
            // Выполняем операцию: else {.
            else {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            };

            // Выполняем операцию: result.push(to_game(.
            result.push(to_game(
                // Выполняем операцию: GamePlatform::Riot,.
                GamePlatform::Riot,
                // Выполняем операцию: GameSource::Riot,.
                GameSource::Riot,
                // Выполняем операцию: &folder,.
                &folder,
                // Выполняем операцию: &executable,.
                &executable,
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию ubisoft_from_view.
fn ubisoft_from_view(view: u32) -> Vec<InstalledGame> {
    // Объявляем переменную Some(root) .
    let Some(root) = open_key(HKEY_CURRENT_USER, UBISOFT_KEY, view) else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };

    // Объявляем переменную names .
    let names = list_subkeys(root);

    // Выполняем операцию: unsafe { RegCloseKey(root) };.
    unsafe { RegCloseKey(root) };

    // Выполняем операцию: names.
    names
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter_map(|name| ubisoft_entry(view, name)).
        .filter_map(|name| ubisoft_entry(view, name))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию ubisoft_entry.
fn ubisoft_entry(view: u32, name: &str) -> Option<InstalledGame> {
    // Объявляем переменную handle .
    let handle = open_key(HKEY_CURRENT_USER, &format!("{UBISOFT_KEY}\\{name}"), view)?;
    // Объявляем переменную install_dir .
    let install_dir = query_string(handle, "InstallDir");

    // Выполняем операцию: unsafe { RegCloseKey(handle) };.
    unsafe { RegCloseKey(handle) };

    // Объявляем переменную folder .
    let folder = PathBuf::from(install_dir?);

    // Проверяем условие: !folder.is_dir() {.
    if !folder.is_dir() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную executable .
    let executable = pick_executable(&folder, name).or_else(|| {
        // Выполняем операцию: super::game_heuristics::collect_candidates(&folder, 2).
        super::game_heuristics::collect_candidates(&folder, 2)
            // Выполняем операцию: .into_iter().
            .into_iter()
            // Выполняем операцию: .next().
            .next()
        // Закрываем блок.
    })?;

    // Выполняем операцию: Some(to_game(.
    Some(to_game(
        // Выполняем операцию: GamePlatform::Ubisoft,.
        GamePlatform::Ubisoft,
        // Выполняем операцию: GameSource::Ubisoft,.
        GameSource::Ubisoft,
        // Выполняем операцию: &folder,.
        &folder,
        // Выполняем операцию: &executable,.
        &executable,
        // Закрываем выражение или коллекцию.
    ))
    // Закрываем блок.
}

// Объявляем функцию dedup_by_install_path.
fn dedup_by_install_path(games: Vec<InstalledGame>) -> Vec<InstalledGame> {
    // Объявляем переменную result.
    let mut result: Vec<InstalledGame> = Vec::with_capacity(games.len());

    // Перебираем элементы коллекции.
    for game in games {
        // Проверяем условие: !result.
        if !result
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .any(|item| item.install_path.eq_ignore_ascii_case(&gam.
            .any(|item| item.install_path.eq_ignore_ascii_case(&game.install_path))
        // Выполняем операцию: {.
        {
            // Выполняем операцию: result.push(game);.
            result.push(game);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_sources_registry_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
