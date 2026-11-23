// Подключаем модули: super::super::game_known::KnownGames;.
use super::super::game_known::KnownGames;
// Подключаем модули: super::super::game_model::{GamePlatform, GameSource, In.
use super::super::game_model::{GamePlatform, GameSource, InstalledGame};
// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию raw_game.
fn raw_game(name: &str, appid: Option<&str>) -> InstalledGame {
    // Объявляем переменную game .
    let mut game = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Steam,.
        GamePlatform::Steam,
        // Выполняем операцию: GameSource::Steam,.
        GameSource::Steam,
        // Выполняем операцию: "D:\\Games",.
        "D:\\Games",
        // Выполняем операцию: "D:\\Games\\portal.exe",.
        "D:\\Games\\portal.exe",
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: game.name = name.to_string();.
    game.name = name.to_string();
    // Выполняем операцию: game.appid = appid.map(|value| value.to_string());.
    game.appid = appid.map(|value| value.to_string());

    // Выполняем операцию: game.
    game
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_enrich_fills_cover_and_bypass_binding.
fn test_enrich_fills_cover_and_bypass_binding() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(
        // Выполняем операцию: r#"[{"appid":"620","name":"Portal","cover":"620.jpg","d.
        r#"[{"appid":"620","name":"Portal","cover":"620.jpg","domainSettingsId":"portal","anticheat":"none"}]"#,
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную games .
    let mut games = vec![raw_game("Portal 2", Some("620"))];

    // Выполняем операцию: enrich(&known, &mut games);.
    enrich(&known, &mut games);

    // Выполняем операцию: assert_eq!(games[0].cover_url.as_deref(), Some("620.jpg.
    assert_eq!(games[0].cover_url.as_deref(), Some("620.jpg"));
    // Выполняем операцию: assert_eq!(games[0].game_settings_id.as_deref(), Some(".
    assert_eq!(games[0].game_settings_id.as_deref(), Some("portal"));
    // Выполняем операцию: assert_eq!(games[0].anticheat.as_deref(), Some("none")).
    assert_eq!(games[0].anticheat.as_deref(), Some("none"));
    // Выполняем операцию: assert_eq!(games[0].name, "Portal");.
    assert_eq!(games[0].name, "Portal");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_enrich_matches_by_name_without_appid.
fn test_enrich_matches_by_name_without_appid() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(
        // Выполняем операцию: r#"[{"appid":"1063730","name":"Escape from Tarkov","dom.
        r#"[{"appid":"1063730","name":"Escape from Tarkov","domainSettingsId":"escape-from-tarkov"}]"#,
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную games .
    let mut games = vec![raw_game("escape from tarkov", None)];

    // Выполняем операцию: enrich(&known, &mut games);.
    enrich(&known, &mut games);

    // Выполняем операцию: assert_eq!(games[0].appid.as_deref(), Some("1063730"));.
    assert_eq!(games[0].appid.as_deref(), Some("1063730"));
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: games[0].game_settings_id.as_deref(),.
        games[0].game_settings_id.as_deref(),
        // Выполняем операцию: Some("escape-from-tarkov").
        Some("escape-from-tarkov") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_enrich_matches_name_with_executable_tail.
fn test_enrich_matches_name_with_executable_tail() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(
        // Выполняем операцию: r#"[{"appid":"460620","name":"The Long Dark","anticheat.
        r#"[{"appid":"460620","name":"The Long Dark","anticheat":"none","aliases":["tld"]}]"#,
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную games .
    let mut games = vec![raw_game("The Long Dark — tld", None)];

    // Выполняем операцию: enrich(&known, &mut games);.
    enrich(&known, &mut games);

    // Выполняем операцию: assert_eq!(games[0].appid.as_deref(), Some("460620"));.
    assert_eq!(games[0].appid.as_deref(), Some("460620"));
    // Выполняем операцию: assert_eq!(games[0].name, "The Long Dark");.
    assert_eq!(games[0].name, "The Long Dark");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_enrich_matches_camel_case_name.
fn test_enrich_matches_camel_case_name() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(
        // Выполняем операцию: r#"[{"appid":"1942120","name":"Escape the Backrooms","a.
        r#"[{"appid":"1942120","name":"Escape the Backrooms","aliases":["escapethebackrooms"]}]"#,
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную games .
    let mut games = vec![raw_game(
        // Выполняем операцию: "EscapeTheBackrooms — Backrooms-Win64-Shipping",.
        "EscapeTheBackrooms — Backrooms-Win64-Shipping",
        // Выполняем операцию: None,.
        None,
        // Закрываем выражение или коллекцию.
    )];

    // Выполняем операцию: enrich(&known, &mut games);.
    enrich(&known, &mut games);

    // Выполняем операцию: assert_eq!(games[0].appid.as_deref(), Some("1942120"));.
    assert_eq!(games[0].appid.as_deref(), Some("1942120"));
    // Выполняем операцию: assert_eq!(games[0].name, "Escape the Backrooms");.
    assert_eq!(games[0].name, "Escape the Backrooms");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_enrich_leaves_unknown_games_untouched.
fn test_enrich_leaves_unknown_games_untouched() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(r#"[{"appid":"620","name":"Portal"}]"#);
    // Объявляем переменную games .
    let mut games = vec![raw_game("Some Indie Game", None)];

    // Выполняем операцию: enrich(&known, &mut games);.
    enrich(&known, &mut games);

    // Выполняем операцию: assert_eq!(games[0].name, "Some Indie Game");.
    assert_eq!(games[0].name, "Some Indie Game");
    // Выполняем операцию: assert!(games[0].cover_url.is_none());.
    assert!(games[0].cover_url.is_none());
    // Выполняем операцию: assert!(games[0].anticheat.is_none());.
    assert!(games[0].anticheat.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_existing_only_drops_missing_executables.
fn test_existing_only_drops_missing_executables() {
    // Объявляем переменную missing .
    let mut missing = raw_game("Ghost", None);

    // Выполняем операцию: missing.executable_path = "C:\\missing\\ghost.exe".to_s.
    missing.executable_path = "C:\\missing\\ghost.exe".to_string();

    // Выполняем операцию: assert!(existing_only(vec![missing]).is_empty());.
    assert!(existing_only(vec![missing]).is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_steps_cover_all_sources.
fn test_scan_steps_cover_all_sources() {
    // Объявляем переменную sources.
    let sources: Vec<&str> = scan_steps()
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|step| step.source.as_str()).
        .map(|step| step.source.as_str())
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: assert!(sources.contains(&"registry"));.
    assert!(sources.contains(&"registry"));
    // Выполняем операцию: assert!(sources.contains(&"steam"));.
    assert!(sources.contains(&"steam"));
    // Выполняем операцию: assert!(sources.contains(&"epic"));.
    assert!(sources.contains(&"epic"));
    // Выполняем операцию: assert!(sources.contains(&"gog"));.
    assert!(sources.contains(&"gog"));
    // Выполняем операцию: assert!(sources.contains(&"ubisoft"));.
    assert!(sources.contains(&"ubisoft"));
    // Выполняем операцию: assert!(sources.contains(&"knownFolder"));.
    assert!(sources.contains(&"knownFolder"));
    // Выполняем операцию: assert!(sources.contains(&"userFolder"));.
    assert!(sources.contains(&"userFolder"));
    // Закрываем блок.
}
