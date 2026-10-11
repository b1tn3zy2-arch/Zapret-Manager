use super::*;

#[test]
fn test_sanitize_id_part_collapses_separators() {
    assert_eq!(sanitize_id_part("C:\\Games\\Some Game!"), "c-games-some-game");
    assert_eq!(sanitize_id_part("  spaced  name "), "spaced-name");
}

#[test]
fn test_game_id_uses_platform_and_path() {
    let id = game_id(GamePlatform::Steam, "D:\\Steam\\Library\\game.exe");

    assert!(id.starts_with("steam-"));
    assert!(id.ends_with("game-exe"));
}

#[test]
fn test_normalize_title_strips_marks_and_collapses_spaces() {
    assert_eq!(normalize_title("  The   Game\u{2122} "), "the game");
    assert_eq!(normalize_title("Game\u{00ae} Deluxe"), "game deluxe");
}

#[test]
fn test_folder_title_prefers_folder_name() {
    assert_eq!(
        folder_title("C:\\Games\\Portal", "C:\\Games\\Portal\\portal.exe"),
        "Portal"
    );
}

#[test]
fn test_folder_title_adds_file_stem_when_different() {
    assert_eq!(
        folder_title("C:\\Games\\Portal", "C:\\Games\\Portal\\shart.exe"),
        "Portal — shart"
    );
}

#[test]
fn test_anticheat_parse_is_case_insensitive() {
    assert_eq!(Anticheat::parse("BattlEye"), Anticheat::BattlEye);
    assert_eq!(Anticheat::parse("EAC"), Anticheat::Eac);
    assert_eq!(Anticheat::parse("none"), Anticheat::None);
}

#[test]
fn test_platform_and_source_serialization_is_camel_case() {
    let json = serde_json::to_string(&GamePlatform::BattleNet).unwrap_or_default();
    let source = serde_json::to_string(&GameSource::KnownFolder).unwrap_or_default();

    assert_eq!(json, "\"battleNet\"");
    assert_eq!(source, "\"knownFolder\"");
}

#[test]
fn test_installed_game_builds_id_and_name() {
    let game = InstalledGame::new(
        GamePlatform::Custom,
        GameSource::UserFolder,
        "C:\\Games\\MyGame",
        "C:\\Games\\MyGame\\bin\\launcher.exe",
    );

    assert!(game.id.starts_with("custom-"));
    assert_eq!(game.name, "MyGame — launcher");
    assert_eq!(game.launch_count, 0);
}