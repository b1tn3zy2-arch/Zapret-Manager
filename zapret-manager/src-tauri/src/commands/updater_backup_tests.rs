use super::*;

fn temp_dir(name: &str) -> PathBuf {
    let path = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&path);
    std::fs::create_dir_all(&path).unwrap();

    path
}

#[test]
fn test_is_excluded_skips_app_and_backups() {
    assert!(is_excluded("backup"));
    assert!(is_excluded("zapret-manager"));
    assert!(is_excluded(".git"));
    assert!(is_excluded("How to work"));
    assert!(is_excluded("BACKUP"));
}

#[test]
fn test_is_excluded_keeps_strategy_files() {
    assert!(!is_excluded("general.bat"));
    assert!(!is_excluded("lists"));
    assert!(!is_excluded("service.bat"));
}

#[test]
fn test_copy_tree_skips_excluded() {
    let root = temp_dir("zapret-backup-copy");
    let from = root.join("from");
    let to = root.join("to");

    std::fs::create_dir_all(&from).unwrap();
    std::fs::write(from.join("general.bat"), "x").unwrap();
    std::fs::create_dir_all(from.join("zapret-manager")).unwrap();
    std::fs::write(from.join("zapret-manager/keep.txt"), "y").unwrap();

    let copied = copy_tree(&from, &to).unwrap();

    assert_eq!(copied, 1);
    assert!(to.join("general.bat").is_file());
    assert!(!to.join("zapret-manager").exists());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_create_backup_copies_and_rotates() {
    let dir = temp_dir("zapret-backup-rotate");

    for stamp in [100u64, 200, 300, 400] {
        std::fs::write(dir.join(format!("general-{stamp}.bat")), "x").unwrap();
        let backup = create_backup(&dir, stamp).unwrap();
        assert!(backup.is_dir());
    }

    let listed = list_backups_in(&dir).unwrap();

    assert_eq!(listed.len(), MAX_BACKUPS);
    assert_eq!(listed[0].timestamp, 400);
    assert!(!dir.join(BACKUP_DIR_NAME).join("100").exists());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_list_backups_empty_when_absent() {
    let dir = temp_dir("zapret-backup-none");

    assert!(list_backups_in(&dir).unwrap().is_empty());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_list_backups_reports_version_and_size() {
    let dir = temp_dir("zapret-backup-info");

    std::fs::write(dir.join("general.bat"), "payload").unwrap();
    let backup = create_backup(&dir, 555).unwrap();
    crate::commands::updater::write_version(&backup, "1.9.9").unwrap();

    let listed = list_backups_in(&dir).unwrap();

    assert_eq!(listed.len(), 1);
    assert_eq!(listed[0].version, "1.9.9");
    assert!(listed[0].size > 0);
    assert!(listed[0].path.contains("555"));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_rollback_restores_previous_files() {
    let dir = temp_dir("zapret-backup-rollback");

    std::fs::write(dir.join("general.bat"), "old version").unwrap();
    let backup = create_backup(&dir, 777).unwrap();
    std::fs::write(dir.join("general.bat"), "new version").unwrap();

    let restored = rollback_from(&backup, &dir).unwrap();

    assert_eq!(restored, 1);
    assert_eq!(
        std::fs::read_to_string(dir.join("general.bat")).unwrap(),
        "old version"
    );

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_dir_size_counts_nested_files() {
    let root = temp_dir("zapret-backup-size");

    std::fs::write(root.join("a.bin"), vec![0u8; 100]).unwrap();
    std::fs::create_dir_all(root.join("nested")).unwrap();
    std::fs::write(root.join("nested/b.bin"), vec![0u8; 50]).unwrap();

    assert_eq!(dir_size(&root), 150);

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_rotate_backups_keeps_newest() {
    let dir = temp_dir("zapret-backup-rotate-only");
    let root = dir.join(BACKUP_DIR_NAME);
    std::fs::create_dir_all(&root).unwrap();

    for stamp in [1u64, 2, 3, 4, 5] {
        std::fs::create_dir_all(root.join(stamp.to_string())).unwrap();
    }

    let removed = rotate_backups(&root).unwrap();

    assert_eq!(removed, 2);
    assert!(!root.join("1").exists());
    assert!(!root.join("2").exists());
    assert!(root.join("5").exists());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_backup_info_serializes_as_camel_case() {
    let json = serde_json::to_string(&BackupInfo {
        path: "C:/backup/1".to_string(),
        timestamp: 1,
        size: 2,
        version: "1.0.0".to_string(),
    })
    .unwrap();

    assert!(json.contains("\"timestamp\":1"));
    assert!(json.contains("\"version\":\"1.0.0\""));
}