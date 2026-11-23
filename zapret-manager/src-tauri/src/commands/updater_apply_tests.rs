// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_rejects_missing_archive.
fn test_install_rejects_missing_archive() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-apply-missing-archive");
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную error .
    let error = tauri::async_runtime::block_on(apply_update(
        // Выполняем операцию: &dir.join("nope.zip").to_string_lossy(),.
        &dir.join("nope.zip").to_string_lossy(),
        // Выполняем операцию: &dir.to_string_lossy(),.
        &dir.to_string_lossy(),
        // Выполняем операцию: "1.10.3",.
        "1.10.3",
        // Закрываем выражение или коллекцию.
    ))
    // Выполняем операцию: .expect_err("архива нет");.
    .expect_err("архива нет");

    // Выполняем операцию: assert!(error.to_string().contains("архив не найден"));.
    assert!(error.to_string().contains("архив не найден"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_rejects_missing_directory.
fn test_install_rejects_missing_directory() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-apply-missing-dir");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную archive .
    let archive = dir.join("pack.zip");
    // Выполняем операцию: std::fs::write(&archive, b"PK").unwrap();.
    std::fs::write(&archive, b"PK").unwrap();

    // Объявляем переменную error .
    let error = tauri::async_runtime::block_on(apply_update(
        // Выполняем операцию: &archive.to_string_lossy(),.
        &archive.to_string_lossy(),
        // Выполняем операцию: &dir.join("nowhere").to_string_lossy(),.
        &dir.join("nowhere").to_string_lossy(),
        // Выполняем операцию: "1.10.3",.
        "1.10.3",
        // Закрываем выражение или коллекцию.
    ))
    // Выполняем операцию: .expect_err("папки нет");.
    .expect_err("папки нет");

    // Выполняем операцию: assert!(error.to_string().contains("Папка стратегий не .
    assert!(error.to_string().contains("Папка стратегий не найдена"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_rollback_rejects_missing_backup.
fn test_rollback_rejects_missing_backup() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-apply-rollback-missing");
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную error .
    let error = rollback_checked(&dir.join("no-such-backup").to_string_lossy(), &dir)
        // Выполняем операцию: .expect_err("бэкапа нет");.
        .expect_err("бэкапа нет");

    // Выполняем операцию: assert!(error.to_string().contains("Бэкап не найден"));.
    assert!(error.to_string().contains("Бэкап не найден"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_version_commands_roundtrip.
fn test_version_commands_roundtrip() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-apply-version");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Выполняем операцию: write_version(&dir, "v1.10.3").unwrap();.
    write_version(&dir, "v1.10.3").unwrap();
    // Выполняем операцию: assert_eq!(crate::commands::updater::read_version(&dir).
    assert_eq!(crate::commands::updater::read_version(&dir), "1.10.3");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_list_update_backups_is_empty_for_clean_dir.
fn test_list_update_backups_is_empty_for_clean_dir() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-apply-empty-backups");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Выполняем операцию: assert!(list_backups_in(&dir).unwrap().is_empty());.
    assert!(list_backups_in(&dir).unwrap().is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}
