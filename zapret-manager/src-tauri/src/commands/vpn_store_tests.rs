use super::*;

const VALID: &str = "[Interface]\nPrivateKey = k\nAddress = 10.0.0.2/32\nDNS = 1.1.1.1\n\n[Peer]\nPublicKey = p\nAllowedIPs = 0.0.0.0/0\nEndpoint = 1.2.3.4:51820\n";

fn fixture(name: &str, body: &str) -> std::path::PathBuf {
    let dir = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let path = dir.join("nl.conf");
    std::fs::write(&path, body).unwrap();

    path
}

#[test]
fn test_info_from_file_reads_every_field() {
    let path = fixture("zapret-vpn-store-ok", VALID);
    let info = info_from_file(&path, 5).unwrap();

    assert_eq!(info.id, "nl");
    assert_eq!(info.endpoint, "1.2.3.4:51820");
    assert_eq!(info.address, vec!["10.0.0.2/32"]);
    assert_eq!(info.dns, vec!["1.1.1.1"]);
    assert_eq!(info.allowed_ips, vec!["0.0.0.0/0"]);
    assert_eq!(info.imported_at, 5);

    let _ = std::fs::remove_dir_all(path.parent().unwrap());
}

#[test]
fn test_info_from_file_rejects_broken_config() {
    let path = fixture("zapret-vpn-store-bad", "не конфиг");
    assert!(info_from_file(&path, 0).is_err());

    let _ = std::fs::remove_dir_all(path.parent().unwrap());
}

#[test]
fn test_info_from_file_ignores_files_with_wrong_extension() {
    let dir = std::env::temp_dir().join("zapret-vpn-store-ext");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(dir.join("readme.txt"), VALID).unwrap();

    assert!(
        config_files()
            .iter()
            .all(|path| path.extension().is_some_and(|value| value == "conf"))
    );

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_remove_config_reports_missing_file() {
    assert!(!remove_config("нет-такого").unwrap_or(false));
}

#[test]
fn test_import_into_temp_dir_copies_and_lists() {
    let root = std::env::temp_dir().join("zapret-vpn-import");
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();

    let source = root.join("source");
    std::fs::create_dir_all(&source).unwrap();
    std::fs::write(source.join("nl.conf"), VALID).unwrap();

    let target = root.join("configs");
    std::fs::create_dir_all(&target).unwrap();

    let info = import_config_into(
        &target,
        &source.join("nl.conf").to_string_lossy(),
    )
    .unwrap();

    assert_eq!(info.name, "nl");
    assert_eq!(info.endpoint, "1.2.3.4:51820");
    assert_eq!(list_configs_from(&target).len(), 1);
    assert!(target.join("nl.conf").exists());

    assert!(remove_config_from(&target, "nl"));
    assert!(!remove_config_from(&target, "nl"));
    assert!(list_configs_from(&target).is_empty());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_import_rejects_invalid_config() {
    let root = std::env::temp_dir().join("zapret-vpn-import-bad");
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();

    let source = root.join("broken.conf");
    std::fs::write(&source, "не конфиг вовсе").unwrap();

    let target = root.join("configs");
    std::fs::create_dir_all(&target).unwrap();

    assert!(
        import_config_into(&target, &source.to_string_lossy()).is_err(),
        "битый конфиг не должен импортироваться"
    );
    assert!(!target.join("broken.conf").exists());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_import_reports_missing_source() {
    let root = std::env::temp_dir().join("zapret-vpn-import-missing");
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).unwrap();

    assert!(import_config_into(&root, "нет/такого/файла.conf").is_err());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_app_data_dir_is_created() {
    let dir = app_data_dir().unwrap();

    assert!(dir.ends_with("com.zapretmanager.app"));
    assert!(dir.exists());
}