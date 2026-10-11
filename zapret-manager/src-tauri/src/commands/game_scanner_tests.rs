use super::super::game_known::KnownGames;
use super::super::game_model::{GamePlatform, GameSource, InstalledGame};
use super::*;

fn raw_game(name: &str, appid: Option<&str>) -> InstalledGame {
    let mut game = InstalledGame::new(
        GamePlatform::Steam,
        GameSource::Steam,
        "D:\\Games",
        "D:\\Games\\portal.exe",
    );

    game.name = name.to_string();
    game.appid = appid.map(|value| value.to_string());

    game
}

#[test]
fn test_enrich_fills_cover_and_bypass_binding() {
    let known = KnownGames::from_json(
        r#"[{"appid":"620","name":"Portal","cover":"620.jpg","domainSettingsId":"portal","anticheat":"none"}]"#,
    );
    let mut games = vec![raw_game("Portal 2", Some("620"))];

    enrich(&known, &mut games);

    assert_eq!(games[0].cover_url.as_deref(), Some("620.jpg"));
    assert_eq!(games[0].game_settings_id.as_deref(), Some("portal"));
    assert_eq!(games[0].anticheat.as_deref(), Some("none"));
    assert_eq!(games[0].name, "Portal");
}

#[test]
fn test_enrich_matches_by_name_without_appid() {
    let known = KnownGames::from_json(
        r#"[{"appid":"1063730","name":"Escape from Tarkov","domainSettingsId":"escape-from-tarkov"}]"#,
    );
    let mut games = vec![raw_game("escape from tarkov", None)];

    enrich(&known, &mut games);

    assert_eq!(games[0].appid.as_deref(), Some("1063730"));
    assert_eq!(
        games[0].game_settings_id.as_deref(),
        Some("escape-from-tarkov")
    );
}

#[test]
fn test_enrich_leaves_unknown_games_untouched() {
    let known = KnownGames::from_json(r#"[{"appid":"620","name":"Portal"}]"#);
    let mut games = vec![raw_game("Some Indie Game", None)];

    enrich(&known, &mut games);

    assert_eq!(games[0].name, "Some Indie Game");
    assert!(games[0].cover_url.is_none());
    assert!(games[0].anticheat.is_none());
}

#[test]
fn test_existing_only_drops_missing_executables() {
    let mut missing = raw_game("Ghost", None);

    missing.executable_path = "C:\\missing\\ghost.exe".to_string();

    assert!(existing_only(vec![missing]).is_empty());
}

#[test]
fn test_scan_steps_cover_all_sources() {
    let sources: Vec<&str> = scan_steps().iter().map(|step| step.source.as_str()).collect();

    assert!(sources.contains(&"registry"));
    assert!(sources.contains(&"steam"));
    assert!(sources.contains(&"epic"));
    assert!(sources.contains(&"gog"));
    assert!(sources.contains(&"ubisoft"));
    assert!(sources.contains(&"knownFolder"));
    assert!(sources.contains(&"userFolder"));
}