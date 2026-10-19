use std::cmp::Ordering;
use std::path::{Path, PathBuf};

use walkdir::WalkDir;

use super::game_model::{InstalledGame, GameSource};

pub const MIN_EXE_BYTES: u64 = 50 * 1024 * 1024;
pub const MARKED_EXE_BYTES: u64 = 8 * 1024 * 1024;
pub const MAX_CANDIDATES: usize = 400;
pub const TRUSTED_MIN_BYTES: u64 = 1024 * 1024;
pub const MAX_GAME_ROOTS: usize = 80;
pub const GAME_ROOTS_DEPTH: usize = 3;

const SKIP_NAME_PARTS: &[&str] = &[
    "uninstall",
    "uninst",
    "setup",
    "vcredist",
    "crashpad",
    "updater",
    "ue4prereq",
    "dxsetup",
    "dotnetfx",
    "directx",
    "redist",
    "_commonredist",
    "agent",
    "service",
    "client",
    "daemon",
    "helper",
    "tray",
    "console",
    "worker",
    "runtime",
    "installer",
    "monitor",
    "crashreportclient",
    "unrealeditor",
    "epicwebhelper",
    "eossdk",
];

const RELAXED_SKIP_NAME_PARTS: &[&str] = &[
    "uninstall",
    "unins",
    "crashpad",
    "prereq",
    "redist",
    "vcredist",
    "dxsetup",
    "dotnetfx",
    "unrealeditor",
    "crashreportclient",
    "epicwebhelper",
    "eossdk",
    "eacsetup",
    "anticheatsetup",
    "vconsole",
];

const SKIP_FOLDER_NAMES: &[&str] = &[
    "common files",
    "windows",
    "windowsapps",
    "nodejs",
    "docker",
    "git",
    "python",
    "java",
    "nvidia",
    "amd",
    "intel",
    "microsoft",
    "adobe",
    "lghub",
    "logitech",
    "razer",
    "corsair",
    "steelseries",
    "uninstall",
];

const SKIP_PATH_PARTS: &[&str] = &[
    "steamapps\\downloading",
    "epic games\\launcher",
    "epic online services",
    "windows defender",
    "\\$recycle.bin",
    "\\engine\\binaries\\",
    "\\node_modules\\",
    "\\.git\\",
];

const PRUNED_DIRS: &[&str] = &[
    "node_modules",
    ".git",
    "target",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "appdata",
    "zapret-discord-youtube",
];

const GAME_MARKERS: &[&str] = &[
    "unityplayer.dll",
    "engine\\binaries",
    "reengine\\",
    "\\binaries\\win64",
    "data\\data",
    "content\\paks",
];

const CONTENT_EXTENSIONS: &[&str] = &[".pak", ".vpk", ".pck", ".ucas", ".utoc"];

pub fn is_excluded_name(name: &str) -> bool {
    let lowered = name.to_ascii_lowercase();
    let without_extension = lowered.trim_end_matches(".exe");

    SKIP_NAME_PARTS
        .iter()
        .any(|part| without_extension == *part || without_extension.starts_with(part))
}

pub fn is_excluded_path(path: &Path) -> bool {
    let lowered = path.to_string_lossy().to_ascii_lowercase();

    SKIP_PATH_PARTS.iter().any(|part| lowered.contains(part))
}

pub fn has_game_markers(directory: &Path) -> bool {
    GAME_MARKERS.iter().any(|marker| directory.join(marker).exists())
        || has_content_bundle(directory)
}

/// Папка данных Unity (`<игра>_Data`) рядом с exe — самостоятельный признак
/// игры. У The Long Dark, например, в корне лежит tld.exe на 0.6 МБ и папка
/// tld_Data: раньше такой exe отбрасывался по порогу размера и игра не
/// находилась вообще.
fn has_unity_data_folder(directory: &Path) -> bool {
    let Ok(entries) = std::fs::read_dir(directory) else {
        return false;
    };

    entries.filter_map(Result::ok).any(|entry| {
        entry
            .file_type()
            .map(|kind| kind.is_dir())
            .unwrap_or(false)
            && entry
                .file_name()
                .to_str()
                .map(|name| {
                    let lowered = name.to_ascii_lowercase();

                    lowered.ends_with("_data") || lowered.ends_with("_data ")
                })
                .unwrap_or(false)
    })
}

fn has_content_bundle(directory: &Path) -> bool {
    let Ok(entries) = std::fs::read_dir(directory) else {
        return false;
    };

    entries.filter_map(Result::ok).any(|entry| {
        CONTENT_EXTENSIONS.iter().any(|extension| {
            entry
                .path()
                .extension()
                .and_then(|value| value.to_str())
                .map(|value| value.eq_ignore_ascii_case(extension))
                .unwrap_or(false)
        })
    })
}

pub fn is_candidate_executable(path: &Path) -> bool {
    let is_exe = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.eq_ignore_ascii_case("exe"))
        .unwrap_or(false);

    if !is_exe || is_excluded_name(&file_name(path)) || is_excluded_path(path) {
        return false;
    }

    if is_skipped_folder(path.parent().unwrap_or(Path::new(""))) {
        return false;
    }

    let Ok(size) = std::fs::metadata(path).map(|value| value.len()) else {
        return false;
    };

    let Some(parent) = path.parent() else {
        return false;
    };
    let marked = has_game_markers(parent) || has_unreal_layout(path);
    // Unity-игра: exe рядом с папкой <игра>_Data. Такие лаунчеры бывают
    // меньше мегабайта, поэтому для них отдельный, более мягкий порог.
    let unity = has_unity_data_folder(parent);

    if !marked && !unity && !has_name_affinity(path) {
        return false;
    }

    let floor = if unity {
        TRUSTED_MIN_BYTES
    } else if marked {
        MARKED_EXE_BYTES
    } else {
        MIN_EXE_BYTES
    };

    size >= floor
}

fn is_skipped_folder(folder: &Path) -> bool {
    let name = folder
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    SKIP_FOLDER_NAMES.contains(&name.as_str())
}

fn has_name_affinity(executable: &Path) -> bool {
    let Some(parent) = executable.parent() else {
        return false;
    };
    let folder = parent
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let stem = executable
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    if folder.is_empty() || stem.is_empty() {
        return false;
    }

    if stem == folder {
        return true;
    }

    let folder_alnum: String = folder
        .chars()
        .filter(|item| item.is_alphanumeric())
        .collect();
    let stem_alnum: String = stem
        .chars()
        .filter(|item| item.is_alphanumeric())
        .collect();

    !stem_alnum.is_empty()
        && !folder_alnum.is_empty()
        && (stem_alnum.contains(&folder_alnum) || folder_alnum.contains(&stem_alnum))
}

pub fn has_unreal_layout(path: &Path) -> bool {
    let lowered = path.to_string_lossy().to_ascii_lowercase();

    lowered.contains("\\binaries\\win64\\")
}

pub fn is_pruned_dir(path: &Path) -> bool {
    let name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    PRUNED_DIRS.contains(&name.as_str())
}

pub fn is_game_root(dir: &Path) -> bool {
    dir.join("UnityPlayer.dll").is_file()
        || dir.join("Engine").join("Binaries").is_dir()
        || dir.join("REEngine").is_dir()
        || dir.join("Binaries").join("Win64").is_dir()
        || dir.join("Content").join("Paks").is_dir()
        || has_content_bundle(dir)
}

pub fn collect_game_roots(root: &Path, depth: usize) -> Vec<PathBuf> {
    if !root.is_dir() {
        return Vec::new();
    }

    WalkDir::new(root)
        .max_depth(depth)
        .into_iter()
        .filter_entry(|entry| {
            !is_excluded_path(entry.path()) && !is_pruned_dir(entry.path())
        })
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_dir())
        .filter(|entry| is_game_root(entry.path()))
        .map(|entry| entry.path().to_path_buf())
        .take(MAX_GAME_ROOTS)
        .collect()
}

pub fn install_root(executable: &Path) -> PathBuf {
    let mut current = executable
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_default();

    loop {
        let name = current
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase();

        if name != "win64" && name != "binaries" {
            return current;
        }

        match current.parent() {
            Some(parent) => current = parent.to_path_buf(),
            None => return current,
        }
    }
}

pub fn collect_candidates(root: &Path, depth: usize) -> Vec<PathBuf> {
    collect(root, depth, false)
}

pub fn collect_candidates_relaxed(root: &Path, depth: usize) -> Vec<PathBuf> {
    collect(root, depth, true)
}

fn collect(root: &Path, depth: usize, relaxed: bool) -> Vec<PathBuf> {
    if !root.is_dir() {
        return Vec::new();
    }

    WalkDir::new(root)
        .max_depth(depth)
        .into_iter()
        .filter_entry(|entry| !is_excluded_path(entry.path()))
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| {
            if relaxed {
                is_relaxed_executable(entry.path())
            } else {
                is_candidate_executable(entry.path())
            }
        })
        .map(|entry| entry.path().to_path_buf())
        .take(MAX_CANDIDATES)
        .collect()
}

pub fn is_relaxed_executable(path: &Path) -> bool {
    let name = file_name(path).to_ascii_lowercase();
    let is_exe = path
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| value.eq_ignore_ascii_case("exe"))
        .unwrap_or(false);

    if !is_exe || is_excluded_path(path) {
        return false;
    }

    if RELAXED_SKIP_NAME_PARTS
        .iter()
        .any(|part| name.contains(part))
    {
        return false;
    }

    std::fs::metadata(path)
        .map(|value| value.len() >= TRUSTED_MIN_BYTES)
        .unwrap_or(false)
}

fn file_name(path: &Path) -> String {
    path.file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_string()
}

pub fn is_game_candidate(folder: &Path) -> bool {
    has_game_markers(folder)
}

fn source_priority(source: GameSource) -> u8 {
    match source {
        GameSource::Steam | GameSource::Epic | GameSource::Gog => 3,
        GameSource::Ubisoft | GameSource::Riot | GameSource::Ea | GameSource::BattleNet => 2,
        GameSource::Registry => 1,
        GameSource::KnownFolder | GameSource::UserFolder => 0,
    }
}

fn compare_quality(left: &InstalledGame, right: &InstalledGame) -> Ordering {
    left
        .appid
        .is_some()
        .cmp(&right.appid.is_some())
        .then(source_priority(left.source).cmp(&source_priority(right.source)))
        .then(left.executable_path.len().cmp(&right.executable_path.len()))
}

pub fn merge_games(games: Vec<InstalledGame>) -> Vec<InstalledGame> {
    let mut merged: Vec<InstalledGame> = Vec::with_capacity(games.len());

    for game in games {
        match merged
            .iter_mut()
            .find(|item| item.executable_path.eq_ignore_ascii_case(&game.executable_path))
        {
            Some(existing) if compare_quality(&game, existing).is_gt() => *existing = game,
            Some(_) => {}
            None => merged.push(game),
        }
    }

    merged.sort_by(|left, right| left.name.cmp(&right.name));
    merged
}

#[cfg(test)]
#[path = "game_heuristics_tests.rs"]
mod tests;