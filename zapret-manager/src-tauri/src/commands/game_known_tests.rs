use super::*;
use std::fs;

const SAMPLE: &str = r#"[
  {
    "appid": "1203220",
    "name": "Outlast Trials",
    "cover": "1203220.jpg",
    "domainSettingsId": "outlast-trials",
    "anticheat": "battleye",
    "aliases": ["the outlast trials"]
  },
  {
    "appid": "570",
    "name": "Dota 2",
    "cover": "570.jpg",
    "domainSettingsId": "dota-2"
  }
]"#;

#[test]
fn test_from_json_indexes_appid_and_aliases() {
    let known = KnownGames::from_json(SAMPLE);

    assert_eq!(known.len(), 2);
    assert_eq!(
        known.by_appid("1203220").map(|entry| entry.name.as_str()),
        Some("Outlast Trials")
    );
    assert_eq!(
        known.by_name("the outlast trials").map(|entry| entry.appid.as_str()),
        Some("1203220")
    );
}

#[test]
fn test_by_name_is_case_and_space_insensitive() {
    let known = KnownGames::from_json(SAMPLE);

    assert!(known.by_name("  DOTA   2 ").is_some());
    assert!(known.by_name("unknown game").is_none());
}

#[test]
fn test_from_json_survives_broken_payload() {
    let known = KnownGames::from_json("not json at all");

    assert!(known.is_empty());
}

#[test]
fn test_cover_relative_path_builds_expected_layout() {
    assert_eq!(
        cover_relative_path("620.jpg"),
        PathBuf::from("games").join("covers").join("620.jpg")
    );
}

#[test]
fn test_resolve_cover_file_rejects_traversal() {
    let resources = std::env::temp_dir().join("zapret-cover-test");

    assert!(resolve_cover_file(&resources, "../../secret.jpg").is_none());
}

#[test]
fn test_resolve_cover_file_reads_direct_and_bundled_paths() {
    let resources = std::env::temp_dir().join("zapret-cover-files");

    let _ = fs::create_dir_all(resources.join("games/covers"));
    let _ = fs::write(resources.join("games/covers/730.jpg"), b"x");
    let _ = fs::write(resources.join("direct.jpg"), b"x");

    let bundled = resolve_cover_file(&resources, "730.jpg");
    let direct = resolve_cover_file(&resources, "direct.jpg");
    let _ = fs::remove_dir_all(&resources);

    assert!(bundled.is_some());
    assert!(direct.is_some());
}

#[test]
fn test_anticheat_of_defaults_to_none() {
    let known = KnownGames::from_json(SAMPLE);

    assert_eq!(anticheat_of(&KnownGame {
        appid: "1".to_string(),
        name: "x".to_string(),
        cover: None,
        domain_settings_id: None,
        anticheat: None,
        aliases: Vec::new(),
    }), Anticheat::None);
    assert_eq!(
        anticheat_of(known.by_appid("1203220").unwrap_or(&KnownGame {
            appid: "1".to_string(),
            name: "x".to_string(),
            cover: None,
            domain_settings_id: None,
            anticheat: None,
            aliases: Vec::new(),
        })),
        Anticheat::BattlEye
    );
}