// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: std::fs;.
use std::fs;

// Объявляем константу SAMPLE.
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

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_from_json_indexes_appid_and_aliases.
fn test_from_json_indexes_appid_and_aliases() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(SAMPLE);

    // Выполняем операцию: assert_eq!(known.len(), 2);.
    assert_eq!(known.len(), 2);
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: known.by_appid("1203220").map(|entry| entry.name.as_str.
        known.by_appid("1203220").map(|entry| entry.name.as_str()),
        // Выполняем операцию: Some("Outlast Trials").
        Some("Outlast Trials") // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: known.
        known
            // Выполняем операцию: .by_name("the outlast trials").
            .by_name("the outlast trials")
            // Выполняем операцию: .map(|entry| entry.appid.as_str()),.
            .map(|entry| entry.appid.as_str()),
        // Выполняем операцию: Some("1203220").
        Some("1203220") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_by_name_is_case_and_space_insensitive.
fn test_by_name_is_case_and_space_insensitive() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(SAMPLE);

    // Выполняем операцию: assert!(known.by_name("  DOTA   2 ").is_some());.
    assert!(known.by_name("  DOTA   2 ").is_some());
    // Выполняем операцию: assert!(known.by_name("unknown game").is_none());.
    assert!(known.by_name("unknown game").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_from_json_survives_broken_payload.
fn test_from_json_survives_broken_payload() {
    // Объявляем переменную known .
    let known = KnownGames::from_json("not json at all");

    // Выполняем операцию: assert!(known.is_empty());.
    assert!(known.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cover_relative_path_builds_expected_layout.
fn test_cover_relative_path_builds_expected_layout() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: cover_relative_path("620.jpg"),.
        cover_relative_path("620.jpg"),
        // Выполняем операцию: PathBuf::from("games").join("covers").join("620.jpg").
        PathBuf::from("games").join("covers").join("620.jpg") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_cover_file_rejects_traversal.
fn test_resolve_cover_file_rejects_traversal() {
    // Объявляем переменную resources .
    let resources = std::env::temp_dir().join("zapret-cover-test");

    // Выполняем операцию: assert!(resolve_cover_file(&resources, "../../secret.jp.
    assert!(resolve_cover_file(&resources, "../../secret.jpg").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_cover_file_reads_direct_and_bundled_paths.
fn test_resolve_cover_file_reads_direct_and_bundled_paths() {
    // Объявляем переменную resources .
    let resources = std::env::temp_dir().join("zapret-cover-files");

    // Объявляем переменную _ .
    let _ = fs::create_dir_all(resources.join("games/covers"));
    // Объявляем переменную _ .
    let _ = fs::write(resources.join("games/covers/730.jpg"), b"x");
    // Объявляем переменную _ .
    let _ = fs::write(resources.join("direct.jpg"), b"x");

    // Объявляем переменную bundled .
    let bundled = resolve_cover_file(&resources, "730.jpg");
    // Объявляем переменную direct .
    let direct = resolve_cover_file(&resources, "direct.jpg");
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&resources);

    // Выполняем операцию: assert!(bundled.is_some());.
    assert!(bundled.is_some());
    // Выполняем операцию: assert!(direct.is_some());.
    assert!(direct.is_some());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_anticheat_of_defaults_to_none.
fn test_anticheat_of_defaults_to_none() {
    // Объявляем переменную known .
    let known = KnownGames::from_json(SAMPLE);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: anticheat_of(&KnownGame {.
        anticheat_of(&KnownGame {
            // Выполняем операцию: appid: "1".to_string(),.
            appid: "1".to_string(),
            // Выполняем операцию: name: "x".to_string(),.
            name: "x".to_string(),
            // Выполняем операцию: cover: None,.
            cover: None,
            // Выполняем операцию: domain_settings_id: None,.
            domain_settings_id: None,
            // Выполняем операцию: anticheat: None,.
            anticheat: None,
            // Выполняем операцию: aliases: Vec::new(),.
            aliases: Vec::new(),
            // Закрываем блок.
        }),
        // Выполняем операцию: Anticheat::None.
        Anticheat::None // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: anticheat_of(known.by_appid("1203220").unwrap_or(&Known.
        anticheat_of(known.by_appid("1203220").unwrap_or(&KnownGame {
            // Выполняем операцию: appid: "1".to_string(),.
            appid: "1".to_string(),
            // Выполняем операцию: name: "x".to_string(),.
            name: "x".to_string(),
            // Выполняем операцию: cover: None,.
            cover: None,
            // Выполняем операцию: domain_settings_id: None,.
            domain_settings_id: None,
            // Выполняем операцию: anticheat: None,.
            anticheat: None,
            // Выполняем операцию: aliases: Vec::new(),.
            aliases: Vec::new(),
            // Закрываем блок.
        })),
        // Выполняем операцию: Anticheat::BattlEye.
        Anticheat::BattlEye // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_bundled_known_games_and_covers_exist.
fn test_bundled_known_games_and_covers_exist() {
    // Объявляем переменную resources .
    let resources = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources");
    // Объявляем переменную known .
    let known = known_games_at(&resources);

    // Выполняем операцию: assert!(known.len() >= 50, "expected at least 50 known .
    assert!(known.len() >= 50, "expected at least 50 known games");

    // Объявляем переменную entries.
    let entries: Vec<KnownGame> = readdir::<KnownGame>(&resources);

    // Перебираем элементы коллекции.
    for entry in entries {
        // Объявляем переменную cover .
        let cover = entry.cover.clone().unwrap_or_default();

        // Проверяем условие: cover.is_empty() {.
        if cover.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: resolve_cover_file(&resources, &cover).is_some(),.
            resolve_cover_file(&resources, &cover).is_some(),
            // Выполняем операцию: "missing cover file for {} ({cover})",.
            "missing cover file for {} ({cover})",
            // Выполняем операцию: entry.name.
            entry.name // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию readdir.
fn readdir<T: serde::de::DeserializeOwned>(resources: &Path) -> Vec<T> {
    // Объявляем переменную raw .
    let raw = std::fs::read_to_string(resources.join(KNOWN_GAMES_RELATIVE)).unwrap_or_default();

    // Выполняем операцию: serde_json::from_str(&raw).unwrap_or_default().
    serde_json::from_str(&raw).unwrap_or_default()
    // Закрываем блок.
}
