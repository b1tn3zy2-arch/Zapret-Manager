use super::*;

fn asset(name: &str, url: &str, size: u64) -> GitHubAsset {
    GitHubAsset {
        name: name.to_string(),
        browser_download_url: url.to_string(),
        size,
    }
}

fn release(tag: &str, assets: Vec<GitHubAsset>) -> GitHubRelease {
    GitHubRelease {
        tag_name: tag.to_string(),
        name: Some(format!("Релиз {tag}")),
        body: Some("Изменения".to_string()),
        published_at: Some("2026-09-20T08:46:37Z".to_string()),
        assets,
    }
}

#[test]
fn test_validate_repo_accepts_owner_and_name() {
    assert_eq!(validate_repo(" Flowseal/zapret-discord-youtube ").unwrap(), "Flowseal/zapret-discord-youtube");
}

#[test]
fn test_validate_repo_rejects_wrong_shapes() {
    assert!(validate_repo("").is_err());
    assert!(validate_repo("Flowseal").is_err());
    assert!(validate_repo("a/b/c").is_err());
    assert!(validate_repo("flow seal/repo").is_err());
    assert!(validate_repo("owner/re po").is_err());
}

#[test]
fn test_normalize_version_strips_prefix_and_suffix() {
    assert_eq!(normalize_version("v1.9.5"), "1.9.5");
    assert_eq!(normalize_version("V2.0"), "2.0");
    assert_eq!(normalize_version("1.10.3-beta1"), "1.10.3");
    assert_eq!(normalize_version("1.10.3+build"), "1.10.3");
    assert_eq!(normalize_version("  1.2.3  "), "1.2.3");
}

#[test]
fn test_normalize_version_handles_garbage() {
    assert_eq!(normalize_version(""), UNKNOWN_VERSION);
    assert_eq!(normalize_version("v"), UNKNOWN_VERSION);
    assert_eq!(normalize_version("не версия"), "не версия");
    assert!(parse_version("не версия").is_none());
}

#[test]
fn test_semver_compares_numerically_not_lexicographically() {
    assert!(is_newer("1.9.5", "1.10.0"));
    assert!(!is_newer("1.10.0", "1.9.5"));
}

#[test]
fn test_is_newer_for_equal_and_lower() {
    assert!(!is_newer("1.10.3", "1.10.3"));
    assert!(!is_newer("1.10.3", "1.10.2"));
    assert!(is_newer("1.10.2", "1.10.3"));
}

#[test]
fn test_is_newer_when_current_unknown() {
    assert!(is_newer(UNKNOWN_VERSION, "1.10.3"));
    assert!(!is_newer("1.10.3", UNKNOWN_VERSION));
}

#[test]
fn test_parse_version_handles_prefix() {
    assert_eq!(parse_version("v1.2.3").unwrap().to_string(), "1.2.3");
    assert!(parse_version("banana").is_none());
}

#[test]
fn test_pick_asset_prefers_zip() {
    let assets = vec![
        asset("pack.rar", "u1", 1),
        asset("pack.tar.gz", "u2", 2),
        asset("pack.zip", "u3", 3),
    ];

    assert_eq!(pick_asset(&assets).unwrap().name, "pack.zip");
}

#[test]
fn test_pick_asset_skips_tar_gz_and_rar() {
    let assets = vec![asset("pack.rar", "u1", 1), asset("pack.tar.gz", "u2", 2)];

    assert!(pick_asset(&assets).is_none());
}

#[test]
fn test_pick_asset_returns_none_without_supported() {
    assert!(pick_asset(&[asset("pack.rar", "u1", 1)]).is_none());
    assert!(pick_asset(&[]).is_none());
}

#[test]
fn test_build_info_does_not_nag_when_current_unknown() {
    let info = build_info(&release("1.10.3", vec![asset("p.zip", "u", 5)]), UNKNOWN_VERSION, &[]);

    assert!(!info.available);
    assert!(info.is_newer);
    assert_eq!(info.current_version, UNKNOWN_VERSION);
}

#[test]
fn test_build_info_marks_update_available() {
    let info = build_info(&release("1.10.3", vec![asset("p.zip", "u", 5)]), "1.10.2", &[]);

    assert!(info.available);
    assert!(info.is_newer);
    assert!(!info.ignored);
    assert_eq!(info.latest_version, "1.10.3");
    assert_eq!(info.size, 5);
}

#[test]
fn test_build_info_respects_ignored_versions() {
    let info = build_info(
        &release("v1.10.3", vec![asset("p.zip", "u", 5)]),
        "1.10.2",
        &["1.10.3".to_string()],
    );

    assert!(!info.available);
    assert!(info.ignored);
    assert!(info.is_newer);
}

#[test]
fn test_build_info_without_archive_asset() {
    let info = build_info(&release("1.11.0", vec![asset("p.rar", "u", 5)]), "1.10.3", &[]);

    assert!(info.is_newer);
    assert!(info.download_url.is_empty());
    assert_eq!(info.size, 0);
}

#[test]
fn test_build_info_uses_tag_when_name_missing() {
    let mut value = release("1.11.0", Vec::new());
    value.name = None;
    value.body = None;
    let info = build_info(&value, "1.10.3", &[]);

    assert_eq!(info.release_name, "1.11.0");
    assert!(info.release_notes.is_empty());
}

#[test]
fn test_version_roundtrip_on_disk() {
    let root = std::env::temp_dir().join("zapret-updater-version-test");
    let _ = std::fs::remove_dir_all(&root);

    assert_eq!(read_version(&root), UNKNOWN_VERSION);
    write_version(&root, "v1.10.4").unwrap();

    assert_eq!(read_version(&root), "1.10.4");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_read_version_treats_empty_file_as_unknown() {
    let root = std::env::temp_dir().join("zapret-updater-empty-test");
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(root.join(VERSION_FILE_NAME), "   ").unwrap();

    assert_eq!(read_version(&root), UNKNOWN_VERSION);

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_read_version_falls_back_to_service_bat() {
    let root = std::env::temp_dir().join("zapret-updater-fallback-test");
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(
        root.join("service.bat"),
        "@echo off\r\nset \"VERSION=1.10.3\"\r\n",
    )
    .unwrap();

    assert_eq!(read_version(&root), "1.10.3");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_read_version_prefers_version_file_over_service_bat() {
    let root = std::env::temp_dir().join("zapret-updater-priority-test");
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(root.join(VERSION_FILE_NAME), "1.11.0\n").unwrap();
    std::fs::write(root.join("service.bat"), "set \"VERSION=1.10.3\"").unwrap();

    assert_eq!(read_version(&root), "1.11.0");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_read_version_ignores_unparsable_service_bat() {
    let root = std::env::temp_dir().join("zapret-updater-garbage-test");
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();
    std::fs::write(root.join("service.bat"), "@echo off\r\n:: no version here\r\n").unwrap();

    assert_eq!(read_version(&root), UNKNOWN_VERSION);

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_download_path_uses_version_and_temp() {
    let path = download_path("v1.10.3");
    let name = path.file_name().unwrap().to_string_lossy().to_string();

    assert!(name.starts_with("zapret-1.10.3-"));
    assert!(name.ends_with(".zip"));
    assert!(path.to_string_lossy().contains("zapret-manager"));
}

#[test]
fn test_update_info_serializes_as_camel_case() {
    let info = build_info(&release("1.10.3", vec![asset("p.zip", "u", 7)]), "1.10.2", &[]);
    let json = serde_json::to_string(&info).unwrap();

    assert!(json.contains("\"currentVersion\""));
    assert!(json.contains("\"latestVersion\""));
    assert!(json.contains("\"releaseNotes\""));
    assert!(json.contains("\"isNewer\":true"));
}

#[test]
fn test_github_release_deserializes_from_api_shape() {
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

    let parsed: GitHubRelease = serde_json::from_str(raw).unwrap();

    assert_eq!(parsed.tag_name, "1.10.3");
    assert_eq!(parsed.assets.len(), 1);
    assert_eq!(parsed.assets[0].size, 1_510_219);
}

#[test]
fn test_build_info_against_real_upstream_release() {
    let raw = include_str!("../../tests/fixtures/upstream_release_1.10.3.json");
    let release: GitHubRelease = serde_json::from_str(raw).expect("fixture is valid");

    let info = build_info(&release, "1.10.2", &[]);

    assert!(info.available, "обновление должно предлагаться");
    assert_eq!(info.latest_version, "1.10.3");
    assert_eq!(info.current_version, "1.10.2");
    assert_eq!(
        info.asset_name, "zapret-discord-youtube-1.10.3.zip",
        "выбирается zip, а не rar или tar.gz"
    );
    assert_eq!(info.size, 1_510_219);
    assert_eq!(
        info.download_url,
        "https://github.com/Flowseal/zapret-discord-youtube/releases/download/1.10.3/zapret-discord-youtube-1.10.3.zip"
    );
    assert_eq!(info.published_at, "2026-09-20T08:46:37Z");
    assert!(info.release_notes.contains("GameFilter"));
    assert!(!info.release_notes.is_empty());
}

#[test]
fn test_build_info_real_release_is_up_to_date_for_same_version() {
    let raw = include_str!("../../tests/fixtures/upstream_release_1.10.3.json");
    let release: GitHubRelease = serde_json::from_str(raw).expect("fixture is valid");

    let info = build_info(&release, "1.10.3", &[]);

    assert!(!info.available, "актуальная версия не должна предлагаться");
    assert!(!info.is_newer);
}

#[test]
fn test_build_info_real_release_honours_ignore() {
    let raw = include_str!("../../tests/fixtures/upstream_release_1.10.3.json");
    let release: GitHubRelease = serde_json::from_str(raw).expect("fixture is valid");

    let info = build_info(&release, "1.10.2", &["v1.10.3".to_string()]);

    assert!(info.ignored);
    assert!(!info.available);
}