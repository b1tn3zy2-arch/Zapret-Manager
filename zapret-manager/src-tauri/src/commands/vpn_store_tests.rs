// Подключаем модули: super::*;.
use super::*;

// Объявляем константу VALID.
const VALID: &str = "[Interface]\nPrivateKey = k\nAddress = 10.0.0.2/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = p\nAllowedIPs = 0.0.0.0/0\nEndpoint = 1.2.3.4:51820\n";

// Объявляем функцию fixture.
fn fixture(name: &str, body: &str) -> std::path::PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(name);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Объявляем переменную path .
    let path = dir.join("nl.conf");
    // Выполняем операцию: std::fs::write(&path, body).unwrap();.
    std::fs::write(&path, body).unwrap();

    // Выполняем операцию: path.
    path
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_info_from_file_reads_every_field.
fn test_info_from_file_reads_every_field() {
    // Объявляем переменную path .
    let path = fixture("zapret-vpn-store-ok", VALID);
    // Объявляем переменную info .
    let info = info_from_file(&path, 5).unwrap();

    // Выполняем операцию: assert_eq!(info.id, "nl");.
    assert_eq!(info.id, "nl");
    // Выполняем операцию: assert_eq!(info.endpoint, "1.2.3.4:51820");.
    assert_eq!(info.endpoint, "1.2.3.4:51820");
    // Выполняем операцию: assert_eq!(info.address, vec!["10.0.0.2/32"]);.
    assert_eq!(info.address, vec!["10.0.0.2/32"]);
    // Выполняем операцию: assert_eq!(info.dns, vec!["1.1.1.1"]);.
    assert_eq!(info.dns, vec!["1.1.1.1"]);
    // Выполняем операцию: assert_eq!(info.allowed_ips, vec!["0.0.0.0/0"]);.
    assert_eq!(info.allowed_ips, vec!["0.0.0.0/0"]);
    // Выполняем операцию: assert_eq!(info.imported_at, 5);.
    assert_eq!(info.imported_at, 5);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(path.parent().unwrap());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_info_from_file_rejects_broken_config.
fn test_info_from_file_rejects_broken_config() {
    // Объявляем переменную path .
    let path = fixture("zapret-vpn-store-bad", "не конфиг");
    // Выполняем операцию: assert!(info_from_file(&path, 0).is_err());.
    assert!(info_from_file(&path, 0).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(path.parent().unwrap());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_info_from_file_ignores_files_with_wrong_extension.
fn test_info_from_file_ignores_files_with_wrong_extension() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-vpn-store-ext");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("readme.txt"), VALID).unwrap();.
    std::fs::write(dir.join("readme.txt"), VALID).unwrap();

    // Выполняем операцию: assert!(config_files().
    assert!(config_files()
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .all(|path| path.extension().is_some_and(|value| value .
        .all(|path| path.extension().is_some_and(|value| value == "conf")));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_config_reports_missing_file.
fn test_remove_config_reports_missing_file() {
    // Выполняем операцию: assert!(!remove_config("нет-такого").unwrap_or(false));.
    assert!(!remove_config("нет-такого").unwrap_or(false));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_into_temp_dir_copies_and_lists.
fn test_import_into_temp_dir_copies_and_lists() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-vpn-import");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();

    // Объявляем переменную source .
    let source = root.join("source");
    // Выполняем операцию: std::fs::create_dir_all(&source).unwrap();.
    std::fs::create_dir_all(&source).unwrap();
    // Выполняем операцию: std::fs::write(source.join("nl.conf"), VALID).unwrap();.
    std::fs::write(source.join("nl.conf"), VALID).unwrap();

    // Объявляем переменную target .
    let target = root.join("configs");
    // Выполняем операцию: std::fs::create_dir_all(&target).unwrap();.
    std::fs::create_dir_all(&target).unwrap();

    // Объявляем переменную info .
    let info = import_config_into(&target, &source.join("nl.conf").to_string_lossy()).unwrap();

    // Выполняем операцию: assert_eq!(info.name, "nl");.
    assert_eq!(info.name, "nl");
    // Выполняем операцию: assert_eq!(info.endpoint, "1.2.3.4:51820");.
    assert_eq!(info.endpoint, "1.2.3.4:51820");
    // Выполняем операцию: assert_eq!(list_configs_from(&target).len(), 1);.
    assert_eq!(list_configs_from(&target).len(), 1);
    // Выполняем операцию: assert!(target.join("nl.conf").exists());.
    assert!(target.join("nl.conf").exists());

    // Выполняем операцию: assert!(remove_config_from(&target, "nl"));.
    assert!(remove_config_from(&target, "nl"));
    // Выполняем операцию: assert!(!remove_config_from(&target, "nl"));.
    assert!(!remove_config_from(&target, "nl"));
    // Выполняем операцию: assert!(list_configs_from(&target).is_empty());.
    assert!(list_configs_from(&target).is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_rejects_invalid_config.
fn test_import_rejects_invalid_config() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-vpn-import-bad");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();

    // Объявляем переменную source .
    let source = root.join("broken.conf");
    // Выполняем операцию: std::fs::write(&source, "не конфиг вовсе").unwrap();.
    std::fs::write(&source, "не конфиг вовсе").unwrap();

    // Объявляем переменную target .
    let target = root.join("configs");
    // Выполняем операцию: std::fs::create_dir_all(&target).unwrap();.
    std::fs::create_dir_all(&target).unwrap();

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: import_config_into(&target, &source.to_string_lossy())..
        import_config_into(&target, &source.to_string_lossy()).is_err(),
        // Выполняем операцию: "битый конфиг не должен импортироваться".
        "битый конфиг не должен импортироваться" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(!target.join("broken.conf").exists());.
    assert!(!target.join("broken.conf").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_import_reports_missing_source.
fn test_import_reports_missing_source() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-vpn-import-missing");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Выполняем операцию: std::fs::create_dir_all(&root).unwrap();.
    std::fs::create_dir_all(&root).unwrap();

    // Выполняем операцию: assert!(import_config_into(&root, "нет/такого/файла.con.
    assert!(import_config_into(&root, "нет/такого/файла.conf").is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_app_data_dir_is_created.
fn test_app_data_dir_is_created() {
    // Объявляем переменную dir .
    let dir = app_data_dir().unwrap();

    // Выполняем операцию: assert!(dir.ends_with("com.zapretmanager.app"));.
    assert!(dir.ends_with("com.zapretmanager.app"));
    // Выполняем операцию: assert!(dir.exists());.
    assert!(dir.exists());
    // Закрываем блок.
}
