use std::fs;
use std::path::{Path, PathBuf};

use super::*;

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(name);

    let _ = fs::remove_dir_all(&root);
    fs::create_dir_all(&root).unwrap_or_else(|error| panic!("{error}"));

    root
}

fn write_large_exe(path: &Path) {
    fs::create_dir_all(path.parent().unwrap_or(&PathBuf::from("."))).unwrap_or_default();

    let file = fs::File::create(path).unwrap_or_else(|error| panic!("{error}"));

    file.set_len(super::super::game_heuristics::MARKED_EXE_BYTES + 1)
        .unwrap_or_default();
}

fn write_marker(folder: &Path) {
    fs::write(folder.join("UnityPlayer.dll"), b"marker").unwrap_or_else(|error| panic!("{error}"));
}

#[test]
fn test_executable_priority_prefers_matching_stem() {
    let matching = executable_score(Path::new("D:\\Portal\\portal.exe"), "Portal");
    let other = executable_score(Path::new("D:\\Portal\\hl2.exe"), "Portal");

    assert!(matching > other);
}

#[test]
fn test_executable_priority_prefers_unreal_shipping_binary() {
    let shipping = executable_score(
        Path::new("C:\\Game\\OPP\\Binaries\\Win64\\TOTClient-Win64-Shipping.exe"),
        "The Outlast Trials",
    );
    let launcher = executable_score(
        Path::new("C:\\Game\\start_protected_game.exe"),
        "The Outlast Trials",
    );

    assert!(shipping > launcher);
}

#[test]
fn test_launch_target_prefers_protected_launcher() {
    let root = temp_root("zapret-launch-target");
    let game = root.join("Game");

    fs::create_dir_all(&game).unwrap_or_else(|error| panic!("{error}"));
    write_marker(&game);
    write_large_exe(&game.join("Game-Win64-Shipping.exe"));
    fs::write(game.join("start_protected_game.exe"), b"stub")
        .unwrap_or_else(|error| panic!("{error}"));

    let target = launch_target(&game, "Game");
    let _ = fs::remove_dir_all(&root);

    assert_eq!(
        target.file_name().and_then(|value| value.to_str()),
        Some("start_protected_game.exe")
    );
}

#[test]
fn test_steam_game_reads_manifest_and_finds_executable() {
    let root = temp_root("zapret-steam-scan");
    let steamapps = root.join("steamapps");
    let game_folder = steamapps.join("common").join("Portal");

    fs::create_dir_all(&game_folder).unwrap_or_else(|error| panic!("{error}"));
    write_marker(&game_folder);
    write_large_exe(&game_folder.join("portal.exe"));
    fs::write(
        steamapps.join("appmanifest_620.acf"),
        "\"AppState\"\n{\n\t\"appid\"\t\t\"620\"\n\t\"name\"\t\t\"Portal\"\n\t\"installdir\"\t\t\"Portal\"\n}\n",
    )
    .unwrap_or_else(|error| panic!("{error}"));

    let games = scan_steam_library(&root);
    let _ = fs::remove_dir_all(&root);

    assert_eq!(games.len(), 1);
    assert_eq!(games[0].appid.as_deref(), Some("620"));
    assert_eq!(games[0].name, "Portal");
    assert_eq!(games[0].platform, GamePlatform::Steam);
}

#[test]
fn test_steam_game_skips_missing_install_folder() {
    let root = temp_root("zapret-steam-missing");
    let steamapps = root.join("steamapps");

    fs::create_dir_all(&steamapps).unwrap_or_else(|error| panic!("{error}"));
    fs::write(
        steamapps.join("appmanifest_999.acf"),
        "\"AppState\"\n{\n\t\"appid\"\t\t\"999\"\n\t\"name\"\t\t\"Ghost\"\n\t\"installdir\"\t\t\"Ghost\"\n}\n",
    )
    .unwrap_or_else(|error| panic!("{error}"));

    let games = scan_steam_library(&root);
    let _ = fs::remove_dir_all(&root);

    assert!(games.is_empty());
}

#[test]
fn test_epic_from_path_reads_installation_list() {
    let root = temp_root("zapret-epic-scan");
    let manifest = root.join("LauncherInstalled.dat");
    let game_folder = root.join("Fortnite");

    fs::create_dir_all(&game_folder).unwrap_or_else(|error| panic!("{error}"));
    write_marker(&game_folder);
    write_large_exe(&game_folder.join("FortniteClient.exe"));
    fs::write(
        &manifest,
        r#"{"InstallationList":[{"AppName":"Fortnite","InstallLocation":"PLACEHOLDER"}]}"#
            .replace("PLACEHOLDER", &game_folder.to_string_lossy().replace("\\", "\\\\")),
    )
    .unwrap_or_else(|error| panic!("{error}"));

    let games = epic_from_path(&manifest);
    let _ = fs::remove_dir_all(&root);

    assert_eq!(games.len(), 1);
    assert_eq!(games[0].name, "Fortnite");
    assert_eq!(games[0].platform, GamePlatform::Epic);
}

#[test]
fn test_epic_from_path_tolerates_broken_manifest() {
    let root = temp_root("zapret-epic-broken");
    let manifest = root.join("LauncherInstalled.dat");

    fs::write(&manifest, b"not json").unwrap_or_else(|error| panic!("{error}"));

    let games = epic_from_path(&manifest);
    let _ = fs::remove_dir_all(&root);

    assert!(games.is_empty());
}

#[test]
fn test_scan_store_folder_on_missing_path_is_empty() {
    let games = scan_store_folder(
        Path::new("C:\\definitely\\missing"),
        GamePlatform::Gog,
        GameSource::Gog,
    );

    assert!(games.is_empty());
}