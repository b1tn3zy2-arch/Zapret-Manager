// Подключаем модули: std::fs;.
use std::fs;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию temp_root.
fn temp_root(name: &str) -> PathBuf {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join(name);

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);
    // Выполняем операцию: fs::create_dir_all(&root).unwrap_or_else(|error| panic!.
    fs::create_dir_all(&root).unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: root.
    root
    // Закрываем блок.
}

// Объявляем функцию write_large_exe.
fn write_large_exe(path: &Path) {
    // Выполняем операцию: fs::create_dir_all(path.parent().unwrap_or(&PathBuf::fr.
    fs::create_dir_all(path.parent().unwrap_or(&PathBuf::from("."))).unwrap_or_default();

    // Объявляем переменную file .
    let file = fs::File::create(path).unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: file.set_len(super::super::game_heuristics::MARKED_EXE_.
    file.set_len(super::super::game_heuristics::MARKED_EXE_BYTES + 1)
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();
    // Закрываем блок.
}

// Объявляем функцию write_marker.
fn write_marker(folder: &Path) {
    // Выполняем операцию: fs::write(folder.join("UnityPlayer.dll"), b"marker").un.
    fs::write(folder.join("UnityPlayer.dll"), b"marker").unwrap_or_else(|error| panic!("{error}"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_executable_priority_prefers_matching_stem.
fn test_executable_priority_prefers_matching_stem() {
    // Объявляем переменную matching .
    let matching = executable_score(Path::new("D:\\Portal\\portal.exe"), "Portal");
    // Объявляем переменную other .
    let other = executable_score(Path::new("D:\\Portal\\hl2.exe"), "Portal");

    // Выполняем операцию: assert!(matching > other);.
    assert!(matching > other);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_executable_priority_prefers_unreal_shipping_binary.
fn test_executable_priority_prefers_unreal_shipping_binary() {
    // Объявляем переменную shipping .
    let shipping = executable_score(
        // Выполняем операцию: Path::new("C:\\Game\\OPP\\Binaries\\Win64\\TOTClient-Wi.
        Path::new("C:\\Game\\OPP\\Binaries\\Win64\\TOTClient-Win64-Shipping.exe"),
        // Выполняем операцию: "The Outlast Trials",.
        "The Outlast Trials",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную launcher .
    let launcher = executable_score(
        // Выполняем операцию: Path::new("C:\\Game\\start_protected_game.exe"),.
        Path::new("C:\\Game\\start_protected_game.exe"),
        // Выполняем операцию: "The Outlast Trials",.
        "The Outlast Trials",
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(shipping > launcher);.
    assert!(shipping > launcher);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_launch_target_prefers_protected_launcher.
fn test_launch_target_prefers_protected_launcher() {
    // Объявляем переменную root .
    let root = temp_root("zapret-launch-target");
    // Объявляем переменную game .
    let game = root.join("Game");

    // Выполняем операцию: fs::create_dir_all(&game).unwrap_or_else(|error| panic!.
    fs::create_dir_all(&game).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: write_marker(&game);.
    write_marker(&game);
    // Выполняем операцию: write_large_exe(&game.join("Game-Win64-Shipping.exe"));.
    write_large_exe(&game.join("Game-Win64-Shipping.exe"));
    // Выполняем операцию: fs::write(game.join("start_protected_game.exe"), b"stub.
    fs::write(game.join("start_protected_game.exe"), b"stub")
        // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
        .unwrap_or_else(|error| panic!("{error}"));

    // Объявляем переменную target .
    let target = launch_target(&game, "Game");
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: target.file_name().and_then(|value| value.to_str()),.
        target.file_name().and_then(|value| value.to_str()),
        // Выполняем операцию: Some("start_protected_game.exe").
        Some("start_protected_game.exe") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_steam_game_reads_manifest_and_finds_executable.
fn test_steam_game_reads_manifest_and_finds_executable() {
    // Объявляем переменную root .
    let root = temp_root("zapret-steam-scan");
    // Объявляем переменную steamapps .
    let steamapps = root.join("steamapps");
    // Объявляем переменную game_folder .
    let game_folder = steamapps.join("common").join("Portal");

    // Выполняем операцию: fs::create_dir_all(&game_folder).unwrap_or_else(|error|.
    fs::create_dir_all(&game_folder).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: write_marker(&game_folder);.
    write_marker(&game_folder);
    // Выполняем операцию: write_large_exe(&game_folder.join("portal.exe"));.
    write_large_exe(&game_folder.join("portal.exe"));
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: steamapps.join("appmanifest_620.acf"),.
        steamapps.join("appmanifest_620.acf"),
        // Выполняем операцию: "\"AppState\"\n{\n\t\"appid\"\t\t\"620\"\n\t\"name\"\t\.
        "\"AppState\"\n{\n\t\"appid\"\t\t\"620\"\n\t\"name\"\t\t\"Portal\"\n\t\"installdir\"\t\t\"Portal\"\n}\n",
    // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
    .unwrap_or_else(|error| panic!("{error}"));

    // Объявляем переменную games .
    let games = scan_steam_library(&root);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);

    // Выполняем операцию: assert_eq!(games.len(), 1);.
    assert_eq!(games.len(), 1);
    // Выполняем операцию: assert_eq!(games[0].appid.as_deref(), Some("620"));.
    assert_eq!(games[0].appid.as_deref(), Some("620"));
    // Выполняем операцию: assert_eq!(games[0].name, "Portal");.
    assert_eq!(games[0].name, "Portal");
    // Выполняем операцию: assert_eq!(games[0].platform, GamePlatform::Steam);.
    assert_eq!(games[0].platform, GamePlatform::Steam);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_steam_game_skips_missing_install_folder.
fn test_steam_game_skips_missing_install_folder() {
    // Объявляем переменную root .
    let root = temp_root("zapret-steam-missing");
    // Объявляем переменную steamapps .
    let steamapps = root.join("steamapps");

    // Выполняем операцию: fs::create_dir_all(&steamapps).unwrap_or_else(|error| p.
    fs::create_dir_all(&steamapps).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: steamapps.join("appmanifest_999.acf"),.
        steamapps.join("appmanifest_999.acf"),
        // Выполняем операцию: "\"AppState\"\n{\n\t\"appid\"\t\t\"999\"\n\t\"name\"\t\.
        "\"AppState\"\n{\n\t\"appid\"\t\t\"999\"\n\t\"name\"\t\t\"Ghost\"\n\t\"installdir\"\t\t\"Ghost\"\n}\n",
    // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
    .unwrap_or_else(|error| panic!("{error}"));

    // Объявляем переменную games .
    let games = scan_steam_library(&root);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);

    // Выполняем операцию: assert!(games.is_empty());.
    assert!(games.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_epic_from_path_reads_installation_list.
fn test_epic_from_path_reads_installation_list() {
    // Объявляем переменную root .
    let root = temp_root("zapret-epic-scan");
    // Объявляем переменную manifest .
    let manifest = root.join("LauncherInstalled.dat");
    // Объявляем переменную game_folder .
    let game_folder = root.join("Fortnite");

    // Выполняем операцию: fs::create_dir_all(&game_folder).unwrap_or_else(|error|.
    fs::create_dir_all(&game_folder).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: write_marker(&game_folder);.
    write_marker(&game_folder);
    // Выполняем операцию: write_large_exe(&game_folder.join("FortniteClient.exe").
    write_large_exe(&game_folder.join("FortniteClient.exe"));
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: &manifest,.
        &manifest,
        // Выполняем операцию: r#"{"InstallationList":[{"AppName":"Fortnite","InstallL.
        r#"{"InstallationList":[{"AppName":"Fortnite","InstallLocation":"PLACEHOLDER"}]}"#.replace(
            // Выполняем операцию: "PLACEHOLDER",.
            "PLACEHOLDER",
            // Выполняем операцию: &game_folder.to_string_lossy().replace("\\", "\\\\"),.
            &game_folder.to_string_lossy().replace("\\", "\\\\"),
            // Закрываем выражение или коллекцию.
        ),
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
    .unwrap_or_else(|error| panic!("{error}"));

    // Объявляем переменную games .
    let games = epic_from_path(&manifest);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);

    // Выполняем операцию: assert_eq!(games.len(), 1);.
    assert_eq!(games.len(), 1);
    // Выполняем операцию: assert_eq!(games[0].name, "Fortnite");.
    assert_eq!(games[0].name, "Fortnite");
    // Выполняем операцию: assert_eq!(games[0].platform, GamePlatform::Epic);.
    assert_eq!(games[0].platform, GamePlatform::Epic);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_epic_from_path_tolerates_broken_manifest.
fn test_epic_from_path_tolerates_broken_manifest() {
    // Объявляем переменную root .
    let root = temp_root("zapret-epic-broken");
    // Объявляем переменную manifest .
    let manifest = root.join("LauncherInstalled.dat");

    // Выполняем операцию: fs::write(&manifest, b"not json").unwrap_or_else(|error.
    fs::write(&manifest, b"not json").unwrap_or_else(|error| panic!("{error}"));

    // Объявляем переменную games .
    let games = epic_from_path(&manifest);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);

    // Выполняем операцию: assert!(games.is_empty());.
    assert!(games.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_store_folder_on_missing_path_is_empty.
fn test_scan_store_folder_on_missing_path_is_empty() {
    // Объявляем переменную games .
    let games = scan_store_folder(
        // Выполняем операцию: Path::new("C:\\definitely\\missing"),.
        Path::new("C:\\definitely\\missing"),
        // Выполняем операцию: GamePlatform::Gog,.
        GamePlatform::Gog,
        // Выполняем операцию: GameSource::Gog,.
        GameSource::Gog,
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(games.is_empty());.
    assert!(games.is_empty());
    // Закрываем блок.
}
