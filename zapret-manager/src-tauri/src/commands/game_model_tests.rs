// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sanitize_id_part_collapses_separators.
fn test_sanitize_id_part_collapses_separators() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: sanitize_id_part("C:\\Games\\Some Game!"),.
        sanitize_id_part("C:\\Games\\Some Game!"),
        // Выполняем операцию: "c-games-some-game".
        "c-games-some-game" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(sanitize_id_part("  spaced  name "), "spaced.
    assert_eq!(sanitize_id_part("  spaced  name "), "spaced-name");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_game_id_uses_only_exe_path.
fn test_game_id_uses_only_exe_path() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: game_id("D:\\Steam\\Library\\game.exe"),.
        game_id("D:\\Steam\\Library\\game.exe"),
        // Выполняем операцию: "g-d-steam-library-game-exe".
        "g-d-steam-library-game-exe" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_game_id_does_not_depend_on_platform.
fn test_game_id_does_not_depend_on_platform() {
    // Объявляем переменную steam .
    let steam = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Steam,.
        GamePlatform::Steam,
        // Выполняем операцию: GameSource::Steam,.
        GameSource::Steam,
        // Выполняем операцию: "D:\\Games\\Portal",.
        "D:\\Games\\Portal",
        // Выполняем операцию: "D:\\Games\\Portal\\portal.exe",.
        "D:\\Games\\Portal\\portal.exe",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную custom .
    let custom = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Custom,.
        GamePlatform::Custom,
        // Выполняем операцию: GameSource::KnownFolder,.
        GameSource::KnownFolder,
        // Выполняем операцию: "D:\\Games\\Portal",.
        "D:\\Games\\Portal",
        // Выполняем операцию: "D:\\Games\\Portal\\portal.exe",.
        "D:\\Games\\Portal\\portal.exe",
        // Закрываем выражение или коллекцию.
    );

    // Одна и та же игра, найденная разными источниками, обязана получить
    // один идентификатор: иначе удаление и настройки «отвязываются» от неё.
    // Выполняем операцию: assert_eq!(steam.id, custom.id);.
    assert_eq!(steam.id, custom.id);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_normalize_title_strips_marks_and_collapses_spaces.
fn test_normalize_title_strips_marks_and_collapses_spaces() {
    // Выполняем операцию: assert_eq!(normalize_title("  The   Game\u{2122} "), "t.
    assert_eq!(normalize_title("  The   Game\u{2122} "), "the game");
    // Выполняем операцию: assert_eq!(normalize_title("Game\u{00ae} Deluxe"), "gam.
    assert_eq!(normalize_title("Game\u{00ae} Deluxe"), "game deluxe");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_folder_title_prefers_folder_name.
fn test_folder_title_prefers_folder_name() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: folder_title("C:\\Games\\Portal", "C:\\Games\\Portal\\p.
        folder_title("C:\\Games\\Portal", "C:\\Games\\Portal\\portal.exe"),
        // Выполняем операцию: "Portal".
        "Portal" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_folder_title_adds_file_stem_when_different.
fn test_folder_title_adds_file_stem_when_different() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: folder_title("C:\\Games\\Portal", "C:\\Games\\Portal\\s.
        folder_title("C:\\Games\\Portal", "C:\\Games\\Portal\\shart.exe"),
        // Выполняем операцию: "Portal — shart".
        "Portal — shart" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_anticheat_parse_is_case_insensitive.
fn test_anticheat_parse_is_case_insensitive() {
    // Выполняем операцию: assert_eq!(Anticheat::parse("BattlEye"), Anticheat::Bat.
    assert_eq!(Anticheat::parse("BattlEye"), Anticheat::BattlEye);
    // Выполняем операцию: assert_eq!(Anticheat::parse("EAC"), Anticheat::Eac);.
    assert_eq!(Anticheat::parse("EAC"), Anticheat::Eac);
    // Выполняем операцию: assert_eq!(Anticheat::parse("none"), Anticheat::None);.
    assert_eq!(Anticheat::parse("none"), Anticheat::None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_platform_and_source_serialization_is_camel_case.
fn test_platform_and_source_serialization_is_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&GamePlatform::BattleNet).unwrap_or_default();
    // Объявляем переменную source .
    let source = serde_json::to_string(&GameSource::KnownFolder).unwrap_or_default();

    // Выполняем операцию: assert_eq!(json, "\"battleNet\"");.
    assert_eq!(json, "\"battleNet\"");
    // Выполняем операцию: assert_eq!(source, "\"knownFolder\"");.
    assert_eq!(source, "\"knownFolder\"");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_installed_game_builds_id_and_name.
fn test_installed_game_builds_id_and_name() {
    // Объявляем переменную game .
    let game = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Custom,.
        GamePlatform::Custom,
        // Выполняем операцию: GameSource::UserFolder,.
        GameSource::UserFolder,
        // Выполняем операцию: "C:\\Games\\MyGame",.
        "C:\\Games\\MyGame",
        // Выполняем операцию: "C:\\Games\\MyGame\\bin\\launcher.exe",.
        "C:\\Games\\MyGame\\bin\\launcher.exe",
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(game.id.starts_with("g-"));.
    assert!(game.id.starts_with("g-"));
    // Выполняем операцию: assert!(game.id.ends_with("launcher-exe"));.
    assert!(game.id.ends_with("launcher-exe"));
    // Выполняем операцию: assert_eq!(game.name, "MyGame — launcher");.
    assert_eq!(game.name, "MyGame — launcher");
    // Выполняем операцию: assert_eq!(game.launch_count, 0);.
    assert_eq!(game.launch_count, 0);
    // Закрываем блок.
}
