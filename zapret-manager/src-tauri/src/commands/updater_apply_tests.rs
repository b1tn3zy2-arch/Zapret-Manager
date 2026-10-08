use super::*;

#[test]
fn test_install_rejects_missing_archive() {
    let dir = std::env::temp_dir().join("zapret-apply-missing-archive");
    std::fs::create_dir_all(&dir).unwrap();

    let error = tauri::async_runtime::block_on(apply_update(
        &dir.join("nope.zip").to_string_lossy(),
        &dir.to_string_lossy(),
        "1.10.3",
    ))
    .expect_err("архива нет");

    assert!(error.to_string().contains("архив не найден"));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_install_rejects_missing_directory() {
    let dir = std::env::temp_dir().join("zapret-apply-missing-dir");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    let archive = dir.join("pack.zip");
    std::fs::write(&archive, b"PK").unwrap();

    let error = tauri::async_runtime::block_on(apply_update(
        &archive.to_string_lossy(),
        &dir.join("nowhere").to_string_lossy(),
        "1.10.3",
    ))
    .expect_err("папки нет");

    assert!(error.to_string().contains("Папка стратегий не найдена"));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_rollback_rejects_missing_backup() {
    let dir = std::env::temp_dir().join("zapret-apply-rollback-missing");
    std::fs::create_dir_all(&dir).unwrap();

    let error = rollback_update(
        dir.join("no-such-backup").to_string_lossy().to_string(),
        dir.to_string_lossy().to_string(),
    )
    .expect_err("бэкапа нет");

    assert!(error.to_string().contains("Бэкап не найден"));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_version_commands_roundtrip() {
    let dir = std::env::temp_dir().join("zapret-apply-version");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    let path = dir.to_string_lossy().to_string();

    assert_eq!(get_current_version(path.clone()).unwrap(), "unknown");
    assert!(set_current_version(path.clone(), "v1.10.3".to_string()).unwrap());
    assert_eq!(get_current_version(path).unwrap(), "1.10.3");

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_list_update_backups_is_empty_for_clean_dir() {
    let dir = std::env::temp_dir().join("zapret-apply-empty-backups");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    assert!(
        list_update_backups(dir.to_string_lossy().to_string())
            .unwrap()
            .is_empty()
    );

    let _ = std::fs::remove_dir_all(&dir);
}