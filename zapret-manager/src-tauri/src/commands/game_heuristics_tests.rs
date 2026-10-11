use std::path::PathBuf;

use super::*;
use crate::commands::game_model::{GamePlatform, GameSource};

#[test]
fn test_is_excluded_name_matches_installers_and_uninstallers() {
    assert!(is_excluded_name("uninstall.exe"));
    assert!(is_excluded_name("Setup.exe"));
    assert!(is_excluded_name("vcredist_x64.exe"));
    assert!(is_excluded_name("crashpad_handler.exe"));
}

#[test]
fn test_is_excluded_name_keeps_real_games() {
    assert!(!is_excluded_name("game.exe"));
    assert!(!is_excluded_name("portal.exe"));
}

#[test]
fn test_is_excluded_path_skips_stores_and_system() {
    assert!(is_excluded_path(Path::new("D:\\Steam\\steamapps\\downloading\\x")));
    assert!(is_excluded_path(Path::new(
        "C:\\Program Files\\Epic Games\\Launcher\\Portal"
    )));
    assert!(!is_excluded_path(Path::new("D:\\Games\\Portal")));
}

#[test]
fn test_compare_quality_prefers_entry_with_appid() {
    let mut plain = InstalledGame::new(
        GamePlatform::Unknown,
        GameSource::KnownFolder,
        "C:\\Games\\Portal",
        "C:\\Games\\Portal\\portal.exe",
    );
    let mut rich = plain.clone();

    rich.appid = Some("620".to_string());

    assert!(compare_quality(&rich, &plain).is_gt());
    plain.appid = Some("999".to_string());
}

#[test]
fn test_compare_quality_prefers_precise_source() {
    let folder = InstalledGame::new(
        GamePlatform::Unknown,
        GameSource::KnownFolder,
        "C:\\Games\\Portal",
        "C:\\Games\\Portal\\portal.exe",
    );
    let steam = InstalledGame::new(
        GamePlatform::Steam,
        GameSource::Steam,
        "D:\\SteamLibrary\\Portal",
        "D:\\SteamLibrary\\Portal\\portal.exe",
    );

    assert!(compare_quality(&steam, &folder).is_gt());
}

#[test]
fn test_merge_games_dedupes_by_executable_path() {
    let first = InstalledGame::new(
        GamePlatform::Unknown,
        GameSource::KnownFolder,
        "C:\\Games\\Portal",
        "c:\\games\\portal\\PORTAL.exe",
    );
    let mut second = first.clone();

    second.appid = Some("620".to_string());
    second.platform = GamePlatform::Steam;
    second.source = GameSource::Steam;

    let merged = merge_games(vec![first, second]);

    assert_eq!(merged.len(), 1);
    assert_eq!(merged[0].appid.as_deref(), Some("620"));
}

#[test]
fn test_merge_games_sorts_by_name() {
    let first = InstalledGame::new(
        GamePlatform::Unknown,
        GameSource::KnownFolder,
        "C:\\Games\\Zeta",
        "C:\\Games\\Zeta\\zeta.exe",
    );
    let second = InstalledGame::new(
        GamePlatform::Unknown,
        GameSource::KnownFolder,
        "C:\\Games\\Alpha",
        "C:\\Games\\Alpha\\alpha.exe",
    );

    let merged = merge_games(vec![first, second]);

    assert_eq!(merged[0].name, "Alpha");
    assert_eq!(merged[1].name, "Zeta");
}

#[test]
fn test_collect_candidates_on_missing_folder_is_empty() {
    let missing = PathBuf::from("C:\\definitely\\missing\\folder");

    assert!(collect_candidates(&missing, 2).is_empty());
}

#[test]
fn test_collect_candidates_skips_small_executables() {
    let folder = std::env::temp_dir().join("zapret-heuristics-test");
    let _ = std::fs::create_dir_all(&folder);
    let _ = std::fs::write(folder.join("tiny.exe"), b"x");

    let candidates = collect_candidates(&folder, 2);
    let _ = std::fs::remove_dir_all(&folder);

    assert!(candidates.is_empty());
}