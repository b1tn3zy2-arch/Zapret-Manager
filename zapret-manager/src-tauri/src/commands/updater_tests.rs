// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию asset.
fn asset(name: &str, url: &str, size: u64) -> GitHubAsset {
    // Выполняем операцию: GitHubAsset {.
    GitHubAsset {
        // Выполняем операцию: name: name.to_string(),.
        name: name.to_string(),
        // Выполняем операцию: browser_download_url: url.to_string(),.
        browser_download_url: url.to_string(),
        // Выполняем операцию: size,.
        size,
        // Выполняем операцию: digest: Some("sha256:0123456789abcdef".to_string()),.
        digest: Some("sha256:0123456789abcdef".to_string()),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию release.
fn release(tag: &str, assets: Vec<GitHubAsset>) -> GitHubRelease {
    // Выполняем операцию: GitHubRelease {.
    GitHubRelease {
        // Выполняем операцию: tag_name: tag.to_string(),.
        tag_name: tag.to_string(),
        // Выполняем операцию: name: Some(format!("Релиз {tag}")),.
        name: Some(format!("Релиз {tag}")),
        // Выполняем операцию: body: Some("Изменения".to_string()),.
        body: Some("Изменения".to_string()),
        // Выполняем операцию: published_at: Some("2026-09-20T08:46:37Z".to_string()),.
        published_at: Some("2026-09-20T08:46:37Z".to_string()),
        // Выполняем операцию: assets,.
        assets,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_repo_accepts_owner_and_name.
fn test_validate_repo_accepts_owner_and_name() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: validate_repo(" Flowseal/zapret-discord-youtube ").unwr.
        validate_repo(" Flowseal/zapret-discord-youtube ").unwrap(),
        // Выполняем операцию: "Flowseal/zapret-discord-youtube".
        "Flowseal/zapret-discord-youtube" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_repo_rejects_wrong_shapes.
fn test_validate_repo_rejects_wrong_shapes() {
    // Выполняем операцию: assert!(validate_repo("").is_err());.
    assert!(validate_repo("").is_err());
    // Выполняем операцию: assert!(validate_repo("Flowseal").is_err());.
    assert!(validate_repo("Flowseal").is_err());
    // Выполняем операцию: assert!(validate_repo("a/b/c").is_err());.
    assert!(validate_repo("a/b/c").is_err());
    // Выполняем операцию: assert!(validate_repo("flow seal/repo").is_err());.
    assert!(validate_repo("flow seal/repo").is_err());
    // Выполняем операцию: assert!(validate_repo("owner/re po").is_err());.
    assert!(validate_repo("owner/re po").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_normalize_version_strips_prefix_and_suffix.
fn test_normalize_version_strips_prefix_and_suffix() {
    // Выполняем операцию: assert_eq!(normalize_version("v1.9.5"), "1.9.5");.
    assert_eq!(normalize_version("v1.9.5"), "1.9.5");
    // Выполняем операцию: assert_eq!(normalize_version("V2.0"), "2.0");.
    assert_eq!(normalize_version("V2.0"), "2.0");
    // Выполняем операцию: assert_eq!(normalize_version("1.10.3-beta1"), "1.10.3").
    assert_eq!(normalize_version("1.10.3-beta1"), "1.10.3");
    // Выполняем операцию: assert_eq!(normalize_version("1.10.3+build"), "1.10.3").
    assert_eq!(normalize_version("1.10.3+build"), "1.10.3");
    // Выполняем операцию: assert_eq!(normalize_version("  1.2.3  "), "1.2.3");.
    assert_eq!(normalize_version("  1.2.3  "), "1.2.3");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_normalize_version_handles_garbage.
fn test_normalize_version_handles_garbage() {
    // Выполняем операцию: assert_eq!(normalize_version(""), UNKNOWN_VERSION);.
    assert_eq!(normalize_version(""), UNKNOWN_VERSION);
    // Выполняем операцию: assert_eq!(normalize_version("v"), UNKNOWN_VERSION);.
    assert_eq!(normalize_version("v"), UNKNOWN_VERSION);
    // Выполняем операцию: assert_eq!(normalize_version("не версия"), "не версия").
    assert_eq!(normalize_version("не версия"), "не версия");
    // Выполняем операцию: assert!(parse_version("не версия").is_none());.
    assert!(parse_version("не версия").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_semver_compares_numerically_not_lexicographically.
fn test_semver_compares_numerically_not_lexicographically() {
    // Выполняем операцию: assert!(is_newer("1.9.5", "1.10.0"));.
    assert!(is_newer("1.9.5", "1.10.0"));
    // Выполняем операцию: assert!(!is_newer("1.10.0", "1.9.5"));.
    assert!(!is_newer("1.10.0", "1.9.5"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_newer_for_equal_and_lower.
fn test_is_newer_for_equal_and_lower() {
    // Выполняем операцию: assert!(!is_newer("1.10.3", "1.10.3"));.
    assert!(!is_newer("1.10.3", "1.10.3"));
    // Выполняем операцию: assert!(!is_newer("1.10.3", "1.10.2"));.
    assert!(!is_newer("1.10.3", "1.10.2"));
    // Выполняем операцию: assert!(is_newer("1.10.2", "1.10.3"));.
    assert!(is_newer("1.10.2", "1.10.3"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_newer_when_current_unknown.
fn test_is_newer_when_current_unknown() {
    // Выполняем операцию: assert!(is_newer(UNKNOWN_VERSION, "1.10.3"));.
    assert!(is_newer(UNKNOWN_VERSION, "1.10.3"));
    // Выполняем операцию: assert!(!is_newer("1.10.3", UNKNOWN_VERSION));.
    assert!(!is_newer("1.10.3", UNKNOWN_VERSION));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_version_handles_prefix.
fn test_parse_version_handles_prefix() {
    // Выполняем операцию: assert_eq!(parse_version("v1.2.3").unwrap().to_string().
    assert_eq!(parse_version("v1.2.3").unwrap().to_string(), "1.2.3");
    // Выполняем операцию: assert!(parse_version("banana").is_none());.
    assert!(parse_version("banana").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_asset_prefers_zip.
fn test_pick_asset_prefers_zip() {
    // Объявляем переменную assets .
    let assets = vec![
        // Выполняем операцию: asset("pack.rar", "u1", 1),.
        asset("pack.rar", "u1", 1),
        // Выполняем операцию: asset("pack.tar.gz", "u2", 2),.
        asset("pack.tar.gz", "u2", 2),
        // Выполняем операцию: asset("pack.zip", "u3", 3),.
        asset("pack.zip", "u3", 3),
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: assert_eq!(pick_asset(&assets).unwrap().name, "pack.zip.
    assert_eq!(pick_asset(&assets).unwrap().name, "pack.zip");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_asset_skips_tar_gz_and_rar.
fn test_pick_asset_skips_tar_gz_and_rar() {
    // Объявляем переменную assets .
    let assets = vec![asset("pack.rar", "u1", 1), asset("pack.tar.gz", "u2", 2)];

    // Выполняем операцию: assert!(pick_asset(&assets).is_none());.
    assert!(pick_asset(&assets).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_asset_returns_none_without_supported.
fn test_pick_asset_returns_none_without_supported() {
    // Выполняем операцию: assert!(pick_asset(&[asset("pack.rar", "u1", 1)]).is_no.
    assert!(pick_asset(&[asset("pack.rar", "u1", 1)]).is_none());
    // Выполняем операцию: assert!(pick_asset(&[]).is_none());.
    assert!(pick_asset(&[]).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_does_not_nag_when_current_unknown.
fn test_build_info_does_not_nag_when_current_unknown() {
    // Объявляем переменную info .
    let info = build_info(
        // Выполняем операцию: &release("1.10.3", vec![asset("p.zip", "u", 5)]),.
        &release("1.10.3", vec![asset("p.zip", "u", 5)]),
        // Выполняем операцию: UNKNOWN_VERSION,.
        UNKNOWN_VERSION,
        // Выполняем операцию: &[],.
        &[],
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(!info.available);.
    assert!(!info.available);
    // Выполняем операцию: assert!(info.is_newer);.
    assert!(info.is_newer);
    // Выполняем операцию: assert_eq!(info.current_version, UNKNOWN_VERSION);.
    assert_eq!(info.current_version, UNKNOWN_VERSION);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_marks_update_available.
fn test_build_info_marks_update_available() {
    // Объявляем переменную info .
    let info = build_info(
        // Выполняем операцию: &release("1.10.3", vec![asset("p.zip", "u", 5)]),.
        &release("1.10.3", vec![asset("p.zip", "u", 5)]),
        // Выполняем операцию: "1.10.2",.
        "1.10.2",
        // Выполняем операцию: &[],.
        &[],
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(info.available);.
    assert!(info.available);
    // Выполняем операцию: assert!(info.is_newer);.
    assert!(info.is_newer);
    // Выполняем операцию: assert!(!info.ignored);.
    assert!(!info.ignored);
    // Выполняем операцию: assert_eq!(info.latest_version, "1.10.3");.
    assert_eq!(info.latest_version, "1.10.3");
    // Выполняем операцию: assert_eq!(info.size, 5);.
    assert_eq!(info.size, 5);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_respects_ignored_versions.
fn test_build_info_respects_ignored_versions() {
    // Объявляем переменную info .
    let info = build_info(
        // Выполняем операцию: &release("v1.10.3", vec![asset("p.zip", "u", 5)]),.
        &release("v1.10.3", vec![asset("p.zip", "u", 5)]),
        // Выполняем операцию: "1.10.2",.
        "1.10.2",
        // Выполняем операцию: &["1.10.3".to_string()],.
        &["1.10.3".to_string()],
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(!info.available);.
    assert!(!info.available);
    // Выполняем операцию: assert!(info.ignored);.
    assert!(info.ignored);
    // Выполняем операцию: assert!(info.is_newer);.
    assert!(info.is_newer);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_without_archive_asset.
fn test_build_info_without_archive_asset() {
    // Объявляем переменную info .
    let info = build_info(
        // Выполняем операцию: &release("1.11.0", vec![asset("p.rar", "u", 5)]),.
        &release("1.11.0", vec![asset("p.rar", "u", 5)]),
        // Выполняем операцию: "1.10.3",.
        "1.10.3",
        // Выполняем операцию: &[],.
        &[],
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(info.is_newer);.
    assert!(info.is_newer);
    // Выполняем операцию: assert!(info.download_url.is_empty());.
    assert!(info.download_url.is_empty());
    // Выполняем операцию: assert_eq!(info.size, 0);.
    assert_eq!(info.size, 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_uses_tag_when_name_missing.
fn test_build_info_uses_tag_when_name_missing() {
    // Объявляем переменную value .
    let mut value = release("1.11.0", Vec::new());
    // Выполняем операцию: value.name = None;.
    value.name = None;
    // Выполняем операцию: value.body = None;.
    value.body = None;
    // Объявляем переменную info .
    let info = build_info(&value, "1.10.3", &[]);

    // Выполняем операцию: assert_eq!(info.release_name, "1.11.0");.
    assert_eq!(info.release_name, "1.11.0");
    // Выполняем операцию: assert!(info.release_notes.is_empty());.
    assert!(info.release_notes.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_version_roundtrip_on_disk.
fn test_version_roundtrip_on_disk() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-updater-version-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);

    // Выполняем операцию: assert_eq!(read_version(&root), UNKNOWN_VERSION);.
    assert_eq!(read_version(&root), UNKNOWN_VERSION);
    // Выполняем операцию: write_version(&root, "v1.10.4").unwrap();.
    write_version(&root, "v1.10.4").unwrap();

    // Выполняем операцию: assert_eq!(read_version(&root), "1.10.4");.
    assert_eq!(read_version(&root), "1.10.4");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_version_treats_empty_file_as_unknown.
fn test_read_version_treats_empty_file_as_unknown() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-updater-empty-test");
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();
    // Выполняем операцию: std::fs::write(root.join(VERSION_FILE_NAME), "   ").unw.
    std::fs::write(root.join(VERSION_FILE_NAME), "   ").unwrap();

    // Выполняем операцию: assert_eq!(read_version(&root), UNKNOWN_VERSION);.
    assert_eq!(read_version(&root), UNKNOWN_VERSION);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_version_falls_back_to_service_bat.
fn test_read_version_falls_back_to_service_bat() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-updater-fallback-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: root.join("service.bat"),.
        root.join("service.bat"),
        // Выполняем операцию: "@echo off\r\nset \"VERSION=1.10.3\"\r\n",.
        "@echo off\r\nset \"VERSION=1.10.3\"\r\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert_eq!(read_version(&root), "1.10.3");.
    assert_eq!(read_version(&root), "1.10.3");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_version_prefers_version_file_over_service_bat.
fn test_read_version_prefers_version_file_over_service_bat() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-updater-priority-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();
    // Выполняем операцию: std::fs::write(root.join(VERSION_FILE_NAME), "1.11.0\n".
    std::fs::write(root.join(VERSION_FILE_NAME), "1.11.0\n").unwrap();
    // Выполняем операцию: std::fs::write(root.join("service.bat"), "set \"VERSION.
    std::fs::write(root.join("service.bat"), "set \"VERSION=1.10.3\"").unwrap();

    // Выполняем операцию: assert_eq!(read_version(&root), "1.11.0");.
    assert_eq!(read_version(&root), "1.11.0");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_version_ignores_unparsable_service_bat.
fn test_read_version_ignores_unparsable_service_bat() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-updater-garbage-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: root.join("service.bat"),.
        root.join("service.bat"),
        // Выполняем операцию: "@echo off\r\n:: no version here\r\n",.
        "@echo off\r\n:: no version here\r\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert_eq!(read_version(&root), UNKNOWN_VERSION);.
    assert_eq!(read_version(&root), UNKNOWN_VERSION);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_download_path_uses_version_and_temp.
fn test_download_path_uses_version_and_temp() {
    // Объявляем переменную path .
    let path = download_path("v1.10.3");
    // Объявляем переменную name .
    let name = path.file_name().unwrap().to_string_lossy().to_string();

    // Выполняем операцию: assert!(name.starts_with("zapret-1.10.3-"));.
    assert!(name.starts_with("zapret-1.10.3-"));
    // Выполняем операцию: assert!(name.ends_with(".zip"));.
    assert!(name.ends_with(".zip"));
    // Выполняем операцию: assert!(path.to_string_lossy().contains("zapret-manager.
    assert!(path.to_string_lossy().contains("zapret-manager"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_update_info_serializes_as_camel_case.
fn test_update_info_serializes_as_camel_case() {
    // Объявляем переменную info .
    let info = build_info(
        // Выполняем операцию: &release("1.10.3", vec![asset("p.zip", "u", 7)]),.
        &release("1.10.3", vec![asset("p.zip", "u", 7)]),
        // Выполняем операцию: "1.10.2",.
        "1.10.2",
        // Выполняем операцию: &[],.
        &[],
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную json .
    let json = serde_json::to_string(&info).unwrap();

    // Выполняем операцию: assert!(json.contains("\"currentVersion\""));.
    assert!(json.contains("\"currentVersion\""));
    // Выполняем операцию: assert!(json.contains("\"latestVersion\""));.
    assert!(json.contains("\"latestVersion\""));
    // Выполняем операцию: assert!(json.contains("\"releaseNotes\""));.
    assert!(json.contains("\"releaseNotes\""));
    // Выполняем операцию: assert!(json.contains("\"isNewer\":true"));.
    assert!(json.contains("\"isNewer\":true"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_github_release_deserializes_from_api_shape.
fn test_github_release_deserializes_from_api_shape() {
    // Объявляем переменную raw .
    let raw = r#"{
        "tag_name": "1.10.3",
        "name": "1.10.3",
        "body": "changelog",
        "published_at": "2026-09-20T08:46:37Z",
        "assets": [
            {
                "name": "zapret.zip",
                "browser_download_url": "https://example.test/zapret.zip",
                "size": 1510219
            }
        ]
    }"#;

    // Объявляем переменную parsed.
    let parsed: GitHubRelease = serde_json::from_str(raw).unwrap();

    // Выполняем операцию: assert_eq!(parsed.tag_name, "1.10.3");.
    assert_eq!(parsed.tag_name, "1.10.3");
    // Выполняем операцию: assert_eq!(parsed.assets.len(), 1);.
    assert_eq!(parsed.assets.len(), 1);
    // Выполняем операцию: assert_eq!(parsed.assets[0].size, 1_510_219);.
    assert_eq!(parsed.assets[0].size, 1_510_219);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_against_real_upstream_release.
fn test_build_info_against_real_upstream_release() {
    // Объявляем переменную raw .
    let raw = include_str!("../../tests/fixtures/upstream_release_1.10.3.json");
    // Объявляем переменную release.
    let release: GitHubRelease = serde_json::from_str(raw).expect("fixture is valid");

    // Объявляем переменную info .
    let info = build_info(&release, "1.10.2", &[]);

    // Выполняем операцию: assert!(info.available, "обновление должно предлагаться.
    assert!(info.available, "обновление должно предлагаться");
    // Выполняем операцию: assert_eq!(info.latest_version, "1.10.3");.
    assert_eq!(info.latest_version, "1.10.3");
    // Выполняем операцию: assert_eq!(info.current_version, "1.10.2");.
    assert_eq!(info.current_version, "1.10.2");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: info.asset_name, "zapret-discord-youtube-1.10.3.zip",.
        info.asset_name,
        "zapret-discord-youtube-1.10.3.zip",
        // Выполняем операцию: "выбирается zip, а не rar или tar.gz".
        "выбирается zip, а не rar или tar.gz" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(info.size, 1_510_219);.
    assert_eq!(info.size, 1_510_219);
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: info.download_url,.
        info.download_url,
        // Выполняем операцию: "https://github.com/Flowseal/zapret-discord-youtube/rel.
        "https://github.com/Flowseal/zapret-discord-youtube/releases/download/1.10.3/zapret-discord-youtube-1.10.3.zip"
    // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(info.published_at, "2026-09-20T08:46:37Z");.
    assert_eq!(info.published_at, "2026-09-20T08:46:37Z");
    // Выполняем операцию: assert!(info.release_notes.contains("GameFilter"));.
    assert!(info.release_notes.contains("GameFilter"));
    // Выполняем операцию: assert!(!info.release_notes.is_empty());.
    assert!(!info.release_notes.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_real_release_is_up_to_date_for_same_version.
fn test_build_info_real_release_is_up_to_date_for_same_version() {
    // Объявляем переменную raw .
    let raw = include_str!("../../tests/fixtures/upstream_release_1.10.3.json");
    // Объявляем переменную release.
    let release: GitHubRelease = serde_json::from_str(raw).expect("fixture is valid");

    // Объявляем переменную info .
    let info = build_info(&release, "1.10.3", &[]);

    // Выполняем операцию: assert!(!info.available, "актуальная версия не должна п.
    assert!(!info.available, "актуальная версия не должна предлагаться");
    // Выполняем операцию: assert!(!info.is_newer);.
    assert!(!info.is_newer);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_info_real_release_honours_ignore.
fn test_build_info_real_release_honours_ignore() {
    // Объявляем переменную raw .
    let raw = include_str!("../../tests/fixtures/upstream_release_1.10.3.json");
    // Объявляем переменную release.
    let release: GitHubRelease = serde_json::from_str(raw).expect("fixture is valid");

    // Объявляем переменную info .
    let info = build_info(&release, "1.10.2", &["v1.10.3".to_string()]);

    // Выполняем операцию: assert!(info.ignored);.
    assert!(info.ignored);
    // Выполняем операцию: assert!(!info.available);.
    assert!(!info.available);
    // Закрываем блок.
}
