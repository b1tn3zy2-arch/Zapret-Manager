// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию fixture.
fn fixture(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(name);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Объявляем функцию manifest_with.
fn manifest_with(files: &[(&str, &str)]) -> ResourcesManifest {
    // Объявляем переменную map .
    let mut map = std::collections::HashMap::new();

    // Перебираем элементы коллекции.
    for (key, hash) in files {
        // Выполняем операцию: map.insert((*key).to_string(), (*hash).to_string());.
        map.insert((*key).to_string(), (*hash).to_string());
        // Закрываем блок.
    }

    // Выполняем операцию: ResourcesManifest {.
    ResourcesManifest {
        // Выполняем операцию: version: "1.10.3".to_string(),.
        version: "1.10.3".to_string(),
        // Выполняем операцию: generated_at: now_millis(),.
        generated_at: now_millis(),
        // Выполняем операцию: files: map,.
        files: map,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_hash_bytes_is_prefixed_sha256.
fn test_hash_bytes_is_prefixed_sha256() {
    // Объявляем переменную value .
    let value = hash_bytes(b"");

    // Выполняем операцию: assert!(value.starts_with(HASH_PREFIX));.
    assert!(value.starts_with(HASH_PREFIX));
    // Выполняем операцию: assert_eq!(value.len(), HASH_PREFIX.len() + 64);.
    assert_eq!(value.len(), HASH_PREFIX.len() + 64);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_hash_bytes_is_stable.
fn test_hash_bytes_is_stable() {
    // Выполняем операцию: assert_eq!(hash_bytes(b"zapret"), hash_bytes(b"zapret").
    assert_eq!(hash_bytes(b"zapret"), hash_bytes(b"zapret"));
    // Выполняем операцию: assert_ne!(hash_bytes(b"zapret"), hash_bytes(b"zapret ".
    assert_ne!(hash_bytes(b"zapret"), hash_bytes(b"zapret "));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_verify_file_hash_accepts_matching.
fn test_verify_file_hash_accepts_matching() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-hash-ok");
    // Объявляем переменную file .
    let file = dir.join("a.txt");
    // Выполняем операцию: std::fs::write(&file, b"content").unwrap();.
    std::fs::write(&file, b"content").unwrap();

    // Объявляем переменную expected .
    let expected = hash_file(&file).unwrap();

    // Выполняем операцию: assert!(verify_file_hash(&file, &expected));.
    assert!(verify_file_hash(&file, &expected));
    // Выполняем операцию: assert!(verify_file_hash(&file, &expected.to_uppercase(.
    assert!(verify_file_hash(&file, &expected.to_uppercase()));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_verify_file_hash_rejects_wrong_and_missing.
fn test_verify_file_hash_rejects_wrong_and_missing() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-hash-bad");
    // Объявляем переменную file .
    let file = dir.join("a.txt");
    // Выполняем операцию: std::fs::write(&file, b"content").unwrap();.
    std::fs::write(&file, b"content").unwrap();

    // Выполняем операцию: assert!(!verify_file_hash(&file, &hash_bytes(b"other")).
    assert!(!verify_file_hash(&file, &hash_bytes(b"other")));
    // Выполняем операцию: assert!(!verify_file_hash(.
    assert!(!verify_file_hash(
        // Выполняем операцию: &dir.join("missing.txt"),.
        &dir.join("missing.txt"),
        // Выполняем операцию: &hash_bytes(b"x").
        &hash_bytes(b"x") // Закрываем выражение или коллекцию.
    ));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_target_path_maps_into_strategies_folder.
fn test_target_path_maps_into_strategies_folder() {
    // Объявляем переменную expected .
    let expected = PathBuf::from("app")
        // Выполняем операцию: .join(STRATEGIES_SUBDIR).
        .join(STRATEGIES_SUBDIR)
        // Выполняем операцию: .join("general-00-baseline.bat");.
        .join("general-00-baseline.bat");
    // Объявляем переменную actual .
    let actual = target_path(Path::new("app"), "zapret/general-00-baseline.bat").unwrap();

    // Выполняем операцию: assert_eq!(actual, expected);.
    assert_eq!(actual, expected);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_target_path_keeps_nested_structure.
fn test_target_path_keeps_nested_structure() {
    // Объявляем переменную expected .
    let expected = PathBuf::from("app")
        // Выполняем операцию: .join(STRATEGIES_SUBDIR).
        .join(STRATEGIES_SUBDIR)
        // Выполняем операцию: .join("lists").
        .join("lists")
        // Выполняем операцию: .join("ipset-all.txt");.
        .join("ipset-all.txt");
    // Объявляем переменную actual .
    let actual = target_path(Path::new("app"), "zapret/lists/ipset-all.txt").unwrap();

    // Выполняем операцию: assert_eq!(actual, expected);.
    assert_eq!(actual, expected);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_target_path_rejects_escape.
fn test_target_path_rejects_escape() {
    // Выполняем операцию: assert!(target_path(Path::new("app"), "../secret.txt")..
    assert!(target_path(Path::new("app"), "../secret.txt").is_err());
    // Выполняем операцию: assert!(target_path(Path::new("app"), "/etc/passwd").is.
    assert!(target_path(Path::new("app"), "/etc/passwd").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_check_integrity_reports_missing_and_modified.
fn test_check_integrity_reports_missing_and_modified() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-integrity");
    // Объявляем переменную zapret .
    let zapret = dir.join(STRATEGIES_SUBDIR);
    // Выполняем операцию: std::fs::create_dir_all(&zapret).unwrap();.
    std::fs::create_dir_all(&zapret).unwrap();

    // Выполняем операцию: std::fs::write(zapret.join("good.txt"), b"good").unwrap.
    std::fs::write(zapret.join("good.txt"), b"good").unwrap();
    // Выполняем операцию: std::fs::write(zapret.join("changed.txt"), b"modified b.
    std::fs::write(zapret.join("changed.txt"), b"modified by user").unwrap();

    // Объявляем переменную manifest .
    let manifest = manifest_with(&[
        // Выполняем операцию: ("zapret/good.txt", &hash_bytes(b"good")),.
        ("zapret/good.txt", &hash_bytes(b"good")),
        // Выполняем операцию: ("zapret/changed.txt", &hash_bytes(b"original")),.
        ("zapret/changed.txt", &hash_bytes(b"original")),
        // Выполняем операцию: ("zapret/gone.txt", &hash_bytes(b"absent")),.
        ("zapret/gone.txt", &hash_bytes(b"absent")),
        // Выполняем операцию: ]);.
    ]);

    // Объявляем переменную report .
    let report = check_integrity(&manifest, &dir);

    // Выполняем операцию: assert_eq!(report.total, 3);.
    assert_eq!(report.total, 3);
    // Выполняем операцию: assert!(!report.ok);.
    assert!(!report.ok);
    // Выполняем операцию: assert_eq!(report.missing, vec!["zapret/gone.txt".to_st.
    assert_eq!(report.missing, vec!["zapret/gone.txt".to_string()]);
    // Выполняем операцию: assert_eq!(report.modified, vec!["zapret/changed.txt".t.
    assert_eq!(report.modified, vec!["zapret/changed.txt".to_string()]);
    // Выполняем операцию: assert_eq!(report.resources_version, "1.10.3");.
    assert_eq!(report.resources_version, "1.10.3");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_check_integrity_ok_when_all_match.
fn test_check_integrity_ok_when_all_match() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-integrity-ok");
    // Объявляем переменную zapret .
    let zapret = dir.join(STRATEGIES_SUBDIR);
    // Выполняем операцию: std::fs::create_dir_all(&zapret).unwrap();.
    std::fs::create_dir_all(&zapret).unwrap();
    // Выполняем операцию: std::fs::write(zapret.join("a.txt"), b"a").unwrap();.
    std::fs::write(zapret.join("a.txt"), b"a").unwrap();

    // Объявляем переменную manifest .
    let manifest = manifest_with(&[("zapret/a.txt", &hash_bytes(b"a"))]);
    // Объявляем переменную report .
    let report = check_integrity(&manifest, &dir);

    // Выполняем операцию: assert!(report.ok);.
    assert!(report.ok);
    // Выполняем операцию: assert_eq!(report.total, 1);.
    assert_eq!(report.total, 1);
    // Выполняем операцию: assert!(report.missing.is_empty());.
    assert!(report.missing.is_empty());
    // Выполняем операцию: assert!(report.modified.is_empty());.
    assert!(report.modified.is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_marker_roundtrip.
fn test_marker_roundtrip() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-marker");
    // Объявляем переменную manifest .
    let manifest = manifest_with(&[]);

    // Выполняем операцию: write_marker(&dir, "0.1.0", &manifest, 22).unwrap();.
    write_marker(&dir, "0.1.0", &manifest, 22).unwrap();

    // Объявляем переменную marker .
    let marker = read_marker(&dir).unwrap();

    // Выполняем операцию: assert_eq!(marker.version, "0.1.0");.
    assert_eq!(marker.version, "0.1.0");
    // Выполняем операцию: assert_eq!(marker.resources_version, "1.10.3");.
    assert_eq!(marker.resources_version, "1.10.3");
    // Выполняем операцию: assert_eq!(marker.strategies_count, 22);.
    assert_eq!(marker.strategies_count, 22);
    // Выполняем операцию: assert!(marker.initialized_at > 0);.
    assert!(marker.initialized_at > 0);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_marker_missing_is_error.
fn test_marker_missing_is_error() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-marker-missing");

    // Выполняем операцию: assert!(read_marker(&dir).is_err());.
    assert!(read_marker(&dir).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_manifest_parses_generated_file.
fn test_read_manifest_parses_generated_file() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-readmanifest");
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join(MANIFEST_FILE),.
        dir.join(MANIFEST_FILE),
        // Выполняем операцию: r#"{"version":"1.10.3","generatedAt":17,"files":{"zapre.
        r#"{"version":"1.10.3","generatedAt":17,"files":{"zapret/a.txt":"sha256:aa"}}"#,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную manifest .
    let manifest = read_manifest(&dir).unwrap();

    // Выполняем операцию: assert_eq!(manifest.version, "1.10.3");.
    assert_eq!(manifest.version, "1.10.3");
    // Выполняем операцию: assert_eq!(manifest.generated_at, 17);.
    assert_eq!(manifest.generated_at, 17);
    // Выполняем операцию: assert_eq!(manifest.files.len(), 1);.
    assert_eq!(manifest.files.len(), 1);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_manifest_rejects_broken_json.
fn test_read_manifest_rejects_broken_json() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-readmanifest-bad");
    // Выполняем операцию: std::fs::write(dir.join(MANIFEST_FILE), "не json").unwr.
    std::fs::write(dir.join(MANIFEST_FILE), "не json").unwrap();

    // Выполняем операцию: assert!(read_manifest(&dir).is_err());.
    assert!(read_manifest(&dir).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_manifest_missing_is_error.
fn test_read_manifest_missing_is_error() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-readmanifest-none");

    // Выполняем операцию: assert!(read_manifest(&dir).is_err());.
    assert!(read_manifest(&dir).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_manifest_keys_are_sorted.
fn test_manifest_keys_are_sorted() {
    // Объявляем переменную manifest .
    let manifest = manifest_with(&[
        // Выполняем операцию: ("zapret/z.txt", &hash_bytes(b"z")),.
        ("zapret/z.txt", &hash_bytes(b"z")),
        // Выполняем операцию: ("zapret/a.txt", &hash_bytes(b"a")),.
        ("zapret/a.txt", &hash_bytes(b"a")),
        // Выполняем операцию: ("zapret/m.txt", &hash_bytes(b"m")),.
        ("zapret/m.txt", &hash_bytes(b"m")),
        // Выполняем операцию: ]);.
    ]);

    // Объявляем переменную keys .
    let keys = manifest_keys_sorted(&manifest);

    // Выполняем операцию: assert_eq!(keys[0], "zapret/a.txt");.
    assert_eq!(keys[0], "zapret/a.txt");
    // Выполняем операцию: assert_eq!(keys[2], "zapret/z.txt");.
    assert_eq!(keys[2], "zapret/z.txt");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_manifest_age_is_reported.
fn test_manifest_age_is_reported() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-age");
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join(MANIFEST_FILE),.
        dir.join(MANIFEST_FILE),
        // Выполняем операцию: r#"{"version":"1.10.3","generatedAt":1000,"files":{}}"#.
        r#"{"version":"1.10.3","generatedAt":1000,"files":{}}"#,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную manifest .
    let manifest = read_manifest(&dir).unwrap();
    // Объявляем переменную age .
    let age = manifest.age_millis();

    // Выполняем операцию: assert!(age > 1_600_000_000_000);.
    assert!(age > 1_600_000_000_000);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_backup_dir_name_has_timestamp.
fn test_backup_dir_name_has_timestamp() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-backup");

    // Объявляем переменную backup .
    let backup = create_backup_dir(&dir).unwrap();
    // Объявляем переменную name .
    let name = backup
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();

    // Выполняем операцию: assert!(name.starts_with("update-"));.
    assert!(name.starts_with("update-"));
    // Выполняем операцию: assert!(backup.is_dir());.
    assert!(backup.is_dir());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_backup_copies_only_bat_files.
fn test_backup_copies_only_bat_files() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-backup-files");
    // Объявляем переменную strategies .
    let strategies = dir.join(STRATEGIES_SUBDIR);
    // Выполняем операцию: std::fs::create_dir_all(&strategies).unwrap();.
    std::fs::create_dir_all(&strategies).unwrap();

    // Выполняем операцию: std::fs::write(strategies.join("general-00-baseline.bat.
    std::fs::write(strategies.join("general-00-baseline.bat"), b"bat").unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("my_custom.bat"), b"cust.
    std::fs::write(strategies.join("my_custom.bat"), b"custom").unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("notes.txt"), b"notes")..
    std::fs::write(strategies.join("notes.txt"), b"notes").unwrap();

    // Объявляем переменную backup .
    let backup = create_backup_dir(&dir).unwrap();
    // Объявляем переменную copied .
    let copied = backup_user_files(&dir, &backup).unwrap();

    // Выполняем операцию: assert_eq!(copied, 2);.
    assert_eq!(copied, 2);
    // Выполняем операцию: assert!(backup.join("general-00-baseline.bat").is_file(.
    assert!(backup.join("general-00-baseline.bat").is_file());
    // Выполняем операцию: assert!(backup.join("my_custom.bat").is_file());.
    assert!(backup.join("my_custom.bat").is_file());
    // Выполняем операцию: assert!(!backup.join("notes.txt").exists());.
    assert!(!backup.join("notes.txt").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_backup_returns_zero_without_strategies_dir.
fn test_backup_returns_zero_without_strategies_dir() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-core-backup-none");
    // Объявляем переменную backup .
    let backup = create_backup_dir(&dir).unwrap();

    // Выполняем операцию: assert_eq!(backup_user_files(&dir, &backup).unwrap(), 0.
    assert_eq!(backup_user_files(&dir, &backup).unwrap(), 0);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_binary_covers_binaries.
fn test_is_binary_covers_binaries() {
    // Выполняем операцию: assert!(is_binary("zapret/bin/winws.exe"));.
    assert!(is_binary("zapret/bin/winws.exe"));
    // Выполняем операцию: assert!(is_binary("zapret/bin/WinDivert.dll"));.
    assert!(is_binary("zapret/bin/WinDivert.dll"));
    // Выполняем операцию: assert!(is_binary("zapret/bin/cygwin1.dll"));.
    assert!(is_binary("zapret/bin/cygwin1.dll"));
    // Выполняем операцию: assert!(!is_binary("zapret/general-00-baseline.bat"));.
    assert!(!is_binary("zapret/general-00-baseline.bat"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_app_subdirs_cover_expected_folders.
fn test_app_subdirs_cover_expected_folders() {
    // Выполняем операцию: assert!(APP_SUBDIRS.contains(&STRATEGIES_SUBDIR));.
    assert!(APP_SUBDIRS.contains(&STRATEGIES_SUBDIR));
    // Выполняем операцию: assert!(APP_SUBDIRS.contains(&"vpn"));.
    assert!(APP_SUBDIRS.contains(&"vpn"));
    // Выполняем операцию: assert!(APP_SUBDIRS.contains(&"backups"));.
    assert!(APP_SUBDIRS.contains(&"backups"));
    // Выполняем операцию: assert_eq!(APP_SUBDIRS.len(), 5);.
    assert_eq!(APP_SUBDIRS.len(), 5);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_init_report_defaults_are_conservative.
fn test_init_report_defaults_are_conservative() {
    // Объявляем переменную report .
    let report = InitReport::default();

    // Выполняем операцию: assert!(!report.first_run);.
    assert!(!report.first_run);
    // Выполняем операцию: assert!(!report.updated);.
    assert!(!report.updated);
    // Выполняем операцию: assert!(!report.available);.
    assert!(!report.available);
    // Выполняем операцию: assert_eq!(report.strategies_count, 0);.
    assert_eq!(report.strategies_count, 0);
    // Выполняем операцию: assert_eq!(report.extracted_bytes, 0);.
    assert_eq!(report.extracted_bytes, 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_now_millis_is_current.
fn test_now_millis_is_current() {
    // Объявляем переменную first .
    let first = now_millis();

    // Выполняем операцию: assert!(first > 1_600_000_000_000);.
    assert!(first > 1_600_000_000_000);
    // Выполняем операцию: assert!(now_millis() >= first);.
    assert!(now_millis() >= first);
    // Закрываем блок.
}
