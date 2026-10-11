use std::cmp::Ordering;
use std::path::{Path, PathBuf};

use walkdir::WalkDir;

use super::game_model::{InstalledGame, GameSource};

pub const MIN_EXE_BYTES: u64 = 50 * 1024 * 1024;
pub const MARKED_EXE_BYTES: u64 = 8 * 1024 * 1024;
pub const MAX_CANDIDATES: usize = 400;

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
    let marked = has_game_markers(parent);

    if !marked && !has_name_affinity(path) {
        return false;
    }

    size >= if marked { MARKED_EXE_BYTES } else { MIN_EXE_BYTES }
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

pub fn collect_candidates(root: &Path, depth: usize) -> Vec<PathBuf> {
    if !root.is_dir() {
        return Vec::new();
    }

    WalkDir::new(root)
        .max_depth(depth)
        .into_iter()
        .filter_entry(|entry| !is_excluded_path(entry.path()))
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| is_candidate_executable(entry.path()))
        .map(|entry| entry.path().to_path_buf())
        .take(MAX_CANDIDATES)
        .collect()
}

fn file_name(path: &Path) -> String {
    path.file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_string()
}

pub fn is_game_candidate(folder: &Path, executable: &Path) -> bool {
    if has_game_markers(folder) {
        return true;
    }

    let folder_name = folder
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let stem = executable
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    !stem.is_empty() && stem == folder_name
}


fn source_priority(source: GameSource) -> u8 {
    match source {
        GameSource::Steam | GameSource::Epic | GameSource::Gog => 3,
        GameSource::Ubisoft | GameSource::Ea | GameSource::BattleNet => 2,
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