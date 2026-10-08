use super::*;

fn temp_dir(name: &str) -> PathBuf {
    let path = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&path);
    std::fs::create_dir_all(&path).unwrap();

    path
}

#[test]
fn test_manifest_round_trip_keeps_unique_files() {
    let root = temp_dir("zapret-manifest-round");
    let files = vec![
        "general.bat".to_string(),
        "lists/list-general.txt".to_string(),
        "general.bat".to_string(),
    ];

    write_manifest(&root, &files).unwrap();

    let read = read_manifest(&root);

    assert_eq!(read.len(), 2);
    assert_eq!(read[0], "general.bat");
    assert_eq!(read[1], "lists/list-general.txt");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_manifest_missing_file_returns_empty() {
    let root = temp_dir("zapret-manifest-missing");

    assert!(read_manifest(&root).is_empty());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_manifest_broken_json_returns_empty() {
    let root = temp_dir("zapret-manifest-broken");

    std::fs::write(manifest_path(&root), "not json").unwrap();

    assert!(read_manifest(&root).is_empty());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_remove_extras_deletes_only_new_files() {
    let root = temp_dir("zapret-manifest-extras");
    let dir = root.join("live");
    let backup = root.join("backup");

    std::fs::create_dir_all(&dir).unwrap();
    std::fs::create_dir_all(dir.join("lists")).unwrap();
    std::fs::create_dir_all(backup.join("lists")).unwrap();

    std::fs::write(backup.join("general.bat"), "old").unwrap();
    std::fs::write(backup.join("lists/list-general.txt"), "old list").unwrap();
    std::fs::write(dir.join("general.bat"), "new").unwrap();
    std::fs::write(dir.join("lists/list-general.txt"), "new list").unwrap();
    std::fs::write(dir.join("general (ALT).bat"), "extra").unwrap();
    std::fs::write(dir.join("user-own.bat"), "mine").unwrap();

    write_manifest(
        &backup,
        &[
            "general.bat".to_string(),
            "lists/list-general.txt".to_string(),
            "general (ALT).bat".to_string(),
        ],
    )
    .unwrap();

    let removed = remove_installed_extras(&backup, &dir);

    assert_eq!(removed, 1);
    assert!(!dir.join("general (ALT).bat").exists());
    assert!(dir.join("user-own.bat").exists());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_remove_extras_ignores_unsafe_paths() {
    let root = temp_dir("zapret-manifest-unsafe");
    let dir = root.join("live");
    let backup = root.join("backup");

    std::fs::create_dir_all(&dir).unwrap();
    std::fs::create_dir_all(&backup).unwrap();
    std::fs::write(dir.join("keep.bat"), "x").unwrap();

    write_manifest(
        &backup,
        &[
            "../escape.bat".to_string(),
            "C:/absolute.txt".to_string(),
            String::new(),
        ],
    )
    .unwrap();

    let removed = remove_installed_extras(&backup, &dir);

    assert_eq!(removed, 0);
    assert!(dir.join("keep.bat").exists());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_remove_extras_without_manifest_is_noop() {
    let root = temp_dir("zapret-manifest-noop");
    let dir = root.join("live");
    let backup = root.join("backup");

    std::fs::create_dir_all(&dir).unwrap();
    std::fs::create_dir_all(&backup).unwrap();
    std::fs::write(dir.join("general.bat"), "x").unwrap();

    assert_eq!(remove_installed_extras(&backup, &dir), 0);
    assert!(dir.join("general.bat").exists());

    let _ = std::fs::remove_dir_all(&root);
}