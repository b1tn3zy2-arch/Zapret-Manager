use super::*;

fn fixture(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    dir
}

fn manifest_with(files: &[(&str, &str)]) -> ResourcesManifest {
    let mut map = std::collections::HashMap::new();

    for (key, hash) in files {
        map.insert((*key).to_string(), (*hash).to_string());
    }

    ResourcesManifest {
        version: "1.10.3".to_string(),
        generated_at: now_millis(),
        files: map,
    }
}

#[test]
fn test_hash_bytes_is_prefixed_sha256() {
    let value = hash_bytes(b"");

    assert!(value.starts_with(HASH_PREFIX));
    assert_eq!(value.len(), HASH_PREFIX.len() + 64);
}

#[test]
fn test_hash_bytes_is_stable() {
    assert_eq!(hash_bytes(b"zapret"), hash_bytes(b"zapret"));
    assert_ne!(hash_bytes(b"zapret"), hash_bytes(b"zapret "));
}

#[test]
fn test_verify_file_hash_accepts_matching() {
    let dir = fixture("zapret-core-hash-ok");
    let file = dir.join("a.txt");
    std::fs::write(&file, b"content").unwrap();

    let expected = hash_file(&file).unwrap();

    assert!(verify_file_hash(&file, &expected));
    assert!(verify_file_hash(&file, &expected.to_uppercase()));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_verify_file_hash_rejects_wrong_and_missing() {
    let dir = fixture("zapret-core-hash-bad");
    let file = dir.join("a.txt");
    std::fs::write(&file, b"content").unwrap();

    assert!(!verify_file_hash(&file, &hash_bytes(b"other")));
    assert!(!verify_file_hash(&dir.join("missing.txt"), &hash_bytes(b"x")));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_target_path_maps_into_strategies_folder() {
    let expected = PathBuf::from("app")
        .join(STRATEGIES_SUBDIR)
        .join("general-00-baseline.bat");
    let actual = target_path(Path::new("app"), "zapret/general-00-baseline.bat").unwrap();

    assert_eq!(actual, expected);
}

#[test]
fn test_target_path_keeps_nested_structure() {
    let expected = PathBuf::from("app")
        .join(STRATEGIES_SUBDIR)
        .join("lists")
        .join("ipset-all.txt");
    let actual = target_path(Path::new("app"), "zapret/lists/ipset-all.txt").unwrap();

    assert_eq!(actual, expected);
}

#[test]
fn test_target_path_rejects_escape() {
    assert!(target_path(Path::new("app"), "../secret.txt").is_err());
    assert!(target_path(Path::new("app"), "/etc/passwd").is_err());
}

#[test]
fn test_check_integrity_reports_missing_and_modified() {
    let dir = fixture("zapret-core-integrity");
    let zapret = dir.join(STRATEGIES_SUBDIR);
    std::fs::create_dir_all(&zapret).unwrap();

    std::fs::write(zapret.join("good.txt"), b"good").unwrap();
    std::fs::write(zapret.join("changed.txt"), b"modified by user").unwrap();

    let manifest = manifest_with(&[
        ("zapret/good.txt", &hash_bytes(b"good")),
        ("zapret/changed.txt", &hash_bytes(b"original")),
        ("zapret/gone.txt", &hash_bytes(b"absent")),
    ]);

    let report = check_integrity(&manifest, &dir);

    assert_eq!(report.total, 3);
    assert!(!report.ok);
    assert_eq!(report.missing, vec!["zapret/gone.txt".to_string()]);
    assert_eq!(report.modified, vec!["zapret/changed.txt".to_string()]);
    assert_eq!(report.resources_version, "1.10.3");

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_check_integrity_ok_when_all_match() {
    let dir = fixture("zapret-core-integrity-ok");
    let zapret = dir.join(STRATEGIES_SUBDIR);
    std::fs::create_dir_all(&zapret).unwrap();
    std::fs::write(zapret.join("a.txt"), b"a").unwrap();

    let manifest = manifest_with(&[("zapret/a.txt", &hash_bytes(b"a"))]);
    let report = check_integrity(&manifest, &dir);

    assert!(report.ok);
    assert_eq!(report.total, 1);
    assert!(report.missing.is_empty());
    assert!(report.modified.is_empty());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_marker_roundtrip() {
    let dir = fixture("zapret-core-marker");
    let manifest = manifest_with(&[]);

    write_marker(&dir, "0.1.0", &manifest, 22).unwrap();

    let marker = read_marker(&dir).unwrap();

    assert_eq!(marker.version, "0.1.0");
    assert_eq!(marker.resources_version, "1.10.3");
    assert_eq!(marker.strategies_count, 22);
    assert!(marker.initialized_at > 0);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_marker_missing_is_error() {
    let dir = fixture("zapret-core-marker-missing");

    assert!(read_marker(&dir).is_err());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_read_manifest_parses_generated_file() {
    let dir = fixture("zapret-core-readmanifest");
    std::fs::write(
        dir.join(MANIFEST_FILE),
        r#"{"version":"1.10.3","generatedAt":17,"files":{"zapret/a.txt":"sha256:aa"}}"#,
    )
    .unwrap();

    let manifest = read_manifest(&dir).unwrap();

    assert_eq!(manifest.version, "1.10.3");
    assert_eq!(manifest.generated_at, 17);
    assert_eq!(manifest.files.len(), 1);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_read_manifest_rejects_broken_json() {
    let dir = fixture("zapret-core-readmanifest-bad");
    std::fs::write(dir.join(MANIFEST_FILE), "не json").unwrap();

    assert!(read_manifest(&dir).is_err());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_read_manifest_missing_is_error() {
    let dir = fixture("zapret-core-readmanifest-none");

    assert!(read_manifest(&dir).is_err());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_manifest_keys_are_sorted() {
    let manifest = manifest_with(&[
        ("zapret/z.txt", &hash_bytes(b"z")),
        ("zapret/a.txt", &hash_bytes(b"a")),
        ("zapret/m.txt", &hash_bytes(b"m")),
    ]);

    let keys = manifest_keys_sorted(&manifest);

    assert_eq!(keys[0], "zapret/a.txt");
    assert_eq!(keys[2], "zapret/z.txt");
}

#[test]
fn test_manifest_age_is_reported() {
    let dir = fixture("zapret-core-age");
    std::fs::write(
        dir.join(MANIFEST_FILE),
        r#"{"version":"1.10.3","generatedAt":1000,"files":{}}"#,
    )
    .unwrap();

    let manifest = read_manifest(&dir).unwrap();
    let age = manifest.age_millis();

    assert!(age > 1_600_000_000_000);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_backup_dir_name_has_timestamp() {
    let dir = fixture("zapret-core-backup");

    let backup = create_backup_dir(&dir).unwrap();
    let name = backup
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_string();

    assert!(name.starts_with("update-"));
    assert!(backup.is_dir());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_backup_copies_only_bat_files() {
    let dir = fixture("zapret-core-backup-files");
    let strategies = dir.join(STRATEGIES_SUBDIR);
    std::fs::create_dir_all(&strategies).unwrap();

    std::fs::write(strategies.join("general-00-baseline.bat"), b"bat").unwrap();
    std::fs::write(strategies.join("my_custom.bat"), b"custom").unwrap();
    std::fs::write(strategies.join("notes.txt"), b"notes").unwrap();

    let backup = create_backup_dir(&dir).unwrap();
    let copied = backup_user_files(&dir, &backup).unwrap();

    assert_eq!(copied, 2);
    assert!(backup.join("general-00-baseline.bat").is_file());
    assert!(backup.join("my_custom.bat").is_file());
    assert!(!backup.join("notes.txt").exists());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_backup_returns_zero_without_strategies_dir() {
    let dir = fixture("zapret-core-backup-none");
    let backup = create_backup_dir(&dir).unwrap();

    assert_eq!(backup_user_files(&dir, &backup).unwrap(), 0);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_is_binary_covers_binaries() {
    assert!(is_binary("zapret/bin/winws.exe"));
    assert!(is_binary("zapret/bin/WinDivert.dll"));
    assert!(is_binary("zapret/bin/cygwin1.dll"));
    assert!(!is_binary("zapret/general-00-baseline.bat"));
}

#[test]
fn test_app_subdirs_cover_expected_folders() {
    assert!(APP_SUBDIRS.contains(&STRATEGIES_SUBDIR));
    assert!(APP_SUBDIRS.contains(&"vpn"));
    assert!(APP_SUBDIRS.contains(&"backups"));
    assert_eq!(APP_SUBDIRS.len(), 5);
}

#[test]
fn test_init_report_defaults_are_conservative() {
    let report = InitReport::default();

    assert!(!report.first_run);
    assert!(!report.updated);
    assert!(!report.available);
    assert_eq!(report.strategies_count, 0);
    assert_eq!(report.extracted_bytes, 0);
}

#[test]
fn test_now_millis_is_current() {
    let first = now_millis();

    assert!(first > 1_600_000_000_000);
    assert!(now_millis() >= first);
}