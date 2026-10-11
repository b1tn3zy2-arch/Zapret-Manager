use std::fs;
use std::path::PathBuf;

use super::*;

fn temp_root(name: &str) -> PathBuf {
    let root = std::env::temp_dir().join(name);

    let _ = fs::remove_dir_all(&root);
    fs::create_dir_all(&root).unwrap_or_else(|error| panic!("{error}"));

    root
}

#[test]
fn test_known_folders_include_program_files() {
    let folders = known_folders();

    assert!(folders.iter().any(|path| path.ends_with("Program Files")));
}

#[test]
fn test_scan_folder_on_missing_path_is_empty() {
    let games = scan_folder(Path::new("C:\\definitely\\missing"), GameSource::UserFolder);

    assert!(games.is_empty());
}

#[test]
fn test_scan_user_folders_skips_blank_entries() {
    let games = scan_user_folders(&["".to_string(), "   ".to_string()]);

    assert!(games.is_empty());
}

#[test]
fn test_registry_game_rejects_non_game_names() {
    let folder = temp_root("zapret-registry-reject");

    let entry = super::super::game_registry::UninstallEntry {
        display_name: "NVIDIA Graphics Driver".to_string(),
        install_location: Some(folder.to_string_lossy().to_string()),
        icon_path: None,
    };

    let game = registry_game(entry);
    let _ = fs::remove_dir_all(&folder);

    assert!(game.is_none());
}

#[test]
fn test_registry_game_uses_icon_path_when_location_missing() {
    let folder = temp_root("zapret-registry-icon");
    fs::write(folder.join("UnityPlayer.dll"), b"marker").unwrap_or_default();

    let exe = folder.join("hollow.exe");
    let file = fs::File::create(&exe).unwrap_or_else(|error| panic!("{error}"));

    file.set_len(super::super::game_heuristics::MARKED_EXE_BYTES + 1)
        .unwrap_or_default();

    let entry = super::super::game_registry::UninstallEntry {
        display_name: "Hollow Knight".to_string(),
        install_location: None,
        icon_path: Some(format!("\"{}\",0", folder.join("hollow.exe").display())),
    };

    let game = registry_game(entry);

    assert!(game.is_some());
    assert_eq!(game.map(|item| item.name).as_deref(), Some("Hollow Knight"));
    let _ = fs::remove_dir_all(&folder);
}
