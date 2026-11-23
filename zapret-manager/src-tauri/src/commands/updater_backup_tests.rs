// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> PathBuf {
    // Объявляем переменную path .
    let path = std::env::temp_dir().join(name);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&path);
    // Выполняем операцию: std::fs::create_dir_all(&path).unwrap();.
    std::fs::create_dir_all(&path).unwrap();

    // Выполняем операцию: path.
    path
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_excluded_skips_app_and_backups.
fn test_is_excluded_skips_app_and_backups() {
    // Выполняем операцию: assert!(is_excluded("backup"));.
    assert!(is_excluded("backup"));
    // Выполняем операцию: assert!(is_excluded("zapret-manager"));.
    assert!(is_excluded("zapret-manager"));
    // Выполняем операцию: assert!(is_excluded(".git"));.
    assert!(is_excluded(".git"));
    // Выполняем операцию: assert!(is_excluded("How to work"));.
    assert!(is_excluded("How to work"));
    // Выполняем операцию: assert!(is_excluded("BACKUP"));.
    assert!(is_excluded("BACKUP"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_excluded_keeps_strategy_files.
fn test_is_excluded_keeps_strategy_files() {
    // Выполняем операцию: assert!(!is_excluded("general.bat"));.
    assert!(!is_excluded("general.bat"));
    // Выполняем операцию: assert!(!is_excluded("lists"));.
    assert!(!is_excluded("lists"));
    // Выполняем операцию: assert!(!is_excluded("service.bat"));.
    assert!(!is_excluded("service.bat"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_copy_tree_skips_excluded.
fn test_copy_tree_skips_excluded() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-backup-copy");
    // Объявляем переменную from .
    let from = root.join("from");
    // Объявляем переменную to .
    let to = root.join("to");

    // Выполняем операцию: std::fs::create_dir_all(&from).unwrap();.
    std::fs::create_dir_all(&from).unwrap();
    // Выполняем операцию: std::fs::write(from.join("general.bat"), "x").unwrap();.
    std::fs::write(from.join("general.bat"), "x").unwrap();
    // Выполняем операцию: std::fs::create_dir_all(from.join("zapret-manager")).un.
    std::fs::create_dir_all(from.join("zapret-manager")).unwrap();
    // Выполняем операцию: std::fs::write(from.join("zapret-manager/keep.txt"), "y.
    std::fs::write(from.join("zapret-manager/keep.txt"), "y").unwrap();

    // Объявляем переменную copied .
    let copied = copy_tree(&from, &to).unwrap();

    // Выполняем операцию: assert_eq!(copied, 1);.
    assert_eq!(copied, 1);
    // Выполняем операцию: assert!(to.join("general.bat").is_file());.
    assert!(to.join("general.bat").is_file());
    // Выполняем операцию: assert!(!to.join("zapret-manager").exists());.
    assert!(!to.join("zapret-manager").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_create_backup_copies_and_rotates.
fn test_create_backup_copies_and_rotates() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-backup-rotate");

    // Перебираем элементы коллекции.
    for stamp in [100u64, 200, 300, 400] {
        // Выполняем операцию: std::fs::write(dir.join(format!("general-{stamp}.bat")).
        std::fs::write(dir.join(format!("general-{stamp}.bat")), "x").unwrap();
        // Объявляем переменную backup .
        let backup = create_backup(&dir, stamp).unwrap();
        // Выполняем операцию: assert!(backup.is_dir());.
        assert!(backup.is_dir());
        // Закрываем блок.
    }

    // Объявляем переменную listed .
    let listed = list_backups_in(&dir).unwrap();

    // Выполняем операцию: assert_eq!(listed.len(), MAX_BACKUPS);.
    assert_eq!(listed.len(), MAX_BACKUPS);
    // Выполняем операцию: assert_eq!(listed[0].timestamp, 400);.
    assert_eq!(listed[0].timestamp, 400);
    // Выполняем операцию: assert!(!dir.join(BACKUP_DIR_NAME).join("100").exists().
    assert!(!dir.join(BACKUP_DIR_NAME).join("100").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_list_backups_empty_when_absent.
fn test_list_backups_empty_when_absent() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-backup-none");

    // Выполняем операцию: assert!(list_backups_in(&dir).unwrap().is_empty());.
    assert!(list_backups_in(&dir).unwrap().is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_list_backups_reports_version_and_size.
fn test_list_backups_reports_version_and_size() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-backup-info");

    // Выполняем операцию: std::fs::write(dir.join("general.bat"), "payload").unwr.
    std::fs::write(dir.join("general.bat"), "payload").unwrap();
    // Объявляем переменную backup .
    let backup = create_backup(&dir, 555).unwrap();
    // Выполняем операцию: crate::commands::updater::write_version(&backup, "1.9.9.
    crate::commands::updater::write_version(&backup, "1.9.9").unwrap();

    // Объявляем переменную listed .
    let listed = list_backups_in(&dir).unwrap();

    // Выполняем операцию: assert_eq!(listed.len(), 1);.
    assert_eq!(listed.len(), 1);
    // Выполняем операцию: assert_eq!(listed[0].version, "1.9.9");.
    assert_eq!(listed[0].version, "1.9.9");
    // Выполняем операцию: assert!(listed[0].size > 0);.
    assert!(listed[0].size > 0);
    // Выполняем операцию: assert!(listed[0].path.contains("555"));.
    assert!(listed[0].path.contains("555"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_rollback_restores_previous_files.
fn test_rollback_restores_previous_files() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-backup-rollback");

    // Выполняем операцию: std::fs::write(dir.join("general.bat"), "old version")..
    std::fs::write(dir.join("general.bat"), "old version").unwrap();
    // Объявляем переменную backup .
    let backup = create_backup(&dir, 777).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("general.bat"), "new version")..
    std::fs::write(dir.join("general.bat"), "new version").unwrap();

    // Объявляем переменную restored .
    let restored = rollback_from(&backup, &dir).unwrap();

    // Выполняем операцию: assert_eq!(restored, 1);.
    assert_eq!(restored, 1);
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read_to_string(dir.join("general.bat")).unwrap.
        std::fs::read_to_string(dir.join("general.bat")).unwrap(),
        // Выполняем операцию: "old version".
        "old version" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_dir_size_counts_nested_files.
fn test_dir_size_counts_nested_files() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-backup-size");

    // Выполняем операцию: std::fs::write(root.join("a.bin"), vec![0u8; 100]).unwr.
    std::fs::write(root.join("a.bin"), vec![0u8; 100]).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(root.join("nested")).unwrap();.
    std::fs::create_dir_all(root.join("nested")).unwrap();
    // Выполняем операцию: std::fs::write(root.join("nested/b.bin"), vec![0u8; 50].
    std::fs::write(root.join("nested/b.bin"), vec![0u8; 50]).unwrap();

    // Выполняем операцию: assert_eq!(dir_size(&root), 150);.
    assert_eq!(dir_size(&root), 150);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_rotate_backups_keeps_newest.
fn test_rotate_backups_keeps_newest() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-backup-rotate-only");
    // Объявляем переменную root .
    let root = dir.join(BACKUP_DIR_NAME);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();

    // Перебираем элементы коллекции.
    for stamp in [1u64, 2, 3, 4, 5] {
        // Выполняем операцию: std::fs::create_dir_all(root.join(stamp.to_string())).u.
        std::fs::create_dir_all(root.join(stamp.to_string())).unwrap();
        // Закрываем блок.
    }

    // Объявляем переменную removed .
    let removed = rotate_backups(&root).unwrap();

    // Выполняем операцию: assert_eq!(removed, 2);.
    assert_eq!(removed, 2);
    // Выполняем операцию: assert!(!root.join("1").exists());.
    assert!(!root.join("1").exists());
    // Выполняем операцию: assert!(!root.join("2").exists());.
    assert!(!root.join("2").exists());
    // Выполняем операцию: assert!(root.join("5").exists());.
    assert!(root.join("5").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_backup_info_serializes_as_camel_case.
fn test_backup_info_serializes_as_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&BackupInfo {
        // Выполняем операцию: path: "C:/backup/1".to_string(),.
        path: "C:/backup/1".to_string(),
        // Выполняем операцию: timestamp: 1,.
        timestamp: 1,
        // Выполняем операцию: size: 2,.
        size: 2,
        // Выполняем операцию: version: "1.0.0".to_string(),.
        version: "1.0.0".to_string(),
        // Закрываем блок.
    })
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert!(json.contains("\"timestamp\":1"));.
    assert!(json.contains("\"timestamp\":1"));
    // Выполняем операцию: assert!(json.contains("\"version\":\"1.0.0\""));.
    assert!(json.contains("\"version\":\"1.0.0\""));
    // Закрываем блок.
}
