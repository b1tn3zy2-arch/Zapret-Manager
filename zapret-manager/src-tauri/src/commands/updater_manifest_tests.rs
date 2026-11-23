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
// Объявляем функцию test_manifest_round_trip_keeps_unique_files.
fn test_manifest_round_trip_keeps_unique_files() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-manifest-round");
    // Объявляем переменную files .
    let files = vec![
        // Выполняем операцию: "general.bat".to_string(),.
        "general.bat".to_string(),
        // Выполняем операцию: "lists/list-general.txt".to_string(),.
        "lists/list-general.txt".to_string(),
        // Выполняем операцию: "general.bat".to_string(),.
        "general.bat".to_string(),
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: write_manifest(&root, &files).unwrap();.
    write_manifest(&root, &files).unwrap();

    // Объявляем переменную read .
    let read = read_manifest(&root);

    // Выполняем операцию: assert_eq!(read.len(), 2);.
    assert_eq!(read.len(), 2);
    // Выполняем операцию: assert_eq!(read[0], "general.bat");.
    assert_eq!(read[0], "general.bat");
    // Выполняем операцию: assert_eq!(read[1], "lists/list-general.txt");.
    assert_eq!(read[1], "lists/list-general.txt");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_manifest_missing_file_returns_empty.
fn test_manifest_missing_file_returns_empty() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-manifest-missing");

    // Выполняем операцию: assert!(read_manifest(&root).is_empty());.
    assert!(read_manifest(&root).is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_manifest_broken_json_returns_empty.
fn test_manifest_broken_json_returns_empty() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-manifest-broken");

    // Выполняем операцию: std::fs::write(manifest_path(&root), "not json").unwrap.
    std::fs::write(manifest_path(&root), "not json").unwrap();

    // Выполняем операцию: assert!(read_manifest(&root).is_empty());.
    assert!(read_manifest(&root).is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_extras_deletes_only_new_files.
fn test_remove_extras_deletes_only_new_files() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-manifest-extras");
    // Объявляем переменную dir .
    let dir = root.join("live");
    // Объявляем переменную backup .
    let backup = root.join("backup");

    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(dir.join("lists")).unwrap();.
    std::fs::create_dir_all(dir.join("lists")).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(backup.join("lists")).unwrap();.
    std::fs::create_dir_all(backup.join("lists")).unwrap();

    // Выполняем операцию: std::fs::write(backup.join("general.bat"), "old").unwra.
    std::fs::write(backup.join("general.bat"), "old").unwrap();
    // Выполняем операцию: std::fs::write(backup.join("lists/list-general.txt"), ".
    std::fs::write(backup.join("lists/list-general.txt"), "old list").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("general.bat"), "new").unwrap().
    std::fs::write(dir.join("general.bat"), "new").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("lists/list-general.txt"), "new.
    std::fs::write(dir.join("lists/list-general.txt"), "new list").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("general (ALT).bat"), "extra")..
    std::fs::write(dir.join("general (ALT).bat"), "extra").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("user-own.bat"), "mine").unwrap.
    std::fs::write(dir.join("user-own.bat"), "mine").unwrap();

    // Выполняем операцию: write_manifest(.
    write_manifest(
        // Выполняем операцию: &backup,.
        &backup,
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: "general.bat".to_string(),.
            "general.bat".to_string(),
            // Выполняем операцию: "lists/list-general.txt".to_string(),.
            "lists/list-general.txt".to_string(),
            // Выполняем операцию: "general (ALT).bat".to_string(),.
            "general (ALT).bat".to_string(),
            // Выполняем операцию: ],.
        ],
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную removed .
    let removed = remove_installed_extras(&backup, &dir);

    // Выполняем операцию: assert_eq!(removed, 1);.
    assert_eq!(removed, 1);
    // Выполняем операцию: assert!(!dir.join("general (ALT).bat").exists());.
    assert!(!dir.join("general (ALT).bat").exists());
    // Выполняем операцию: assert!(dir.join("user-own.bat").exists());.
    assert!(dir.join("user-own.bat").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_extras_ignores_unsafe_paths.
fn test_remove_extras_ignores_unsafe_paths() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-manifest-unsafe");
    // Объявляем переменную dir .
    let dir = root.join("live");
    // Объявляем переменную backup .
    let backup = root.join("backup");

    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(&backup).unwrap();.
    std::fs::create_dir_all(&backup).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("keep.bat"), "x").unwrap();.
    std::fs::write(dir.join("keep.bat"), "x").unwrap();

    // Выполняем операцию: write_manifest(.
    write_manifest(
        // Выполняем операцию: &backup,.
        &backup,
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: "../escape.bat".to_string(),.
            "../escape.bat".to_string(),
            // Выполняем операцию: "C:/absolute.txt".to_string(),.
            "C:/absolute.txt".to_string(),
            // Выполняем операцию: String::new(),.
            String::new(),
            // Выполняем операцию: ],.
        ],
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную removed .
    let removed = remove_installed_extras(&backup, &dir);

    // Выполняем операцию: assert_eq!(removed, 0);.
    assert_eq!(removed, 0);
    // Выполняем операцию: assert!(dir.join("keep.bat").exists());.
    assert!(dir.join("keep.bat").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_extras_without_manifest_is_noop.
fn test_remove_extras_without_manifest_is_noop() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-manifest-noop");
    // Объявляем переменную dir .
    let dir = root.join("live");
    // Объявляем переменную backup .
    let backup = root.join("backup");

    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(&backup).unwrap();.
    std::fs::create_dir_all(&backup).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("general.bat"), "x").unwrap();.
    std::fs::write(dir.join("general.bat"), "x").unwrap();

    // Выполняем операцию: assert_eq!(remove_installed_extras(&backup, &dir), 0);.
    assert_eq!(remove_installed_extras(&backup, &dir), 0);
    // Выполняем операцию: assert!(dir.join("general.bat").exists());.
    assert!(dir.join("general.bat").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}
