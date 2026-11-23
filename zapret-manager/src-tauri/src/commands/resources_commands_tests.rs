// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::resources_core::{now_millis, read_mark.
use crate::commands::resources_core::{now_millis, read_marker, write_marker, ResourcesManifest};

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

// Объявляем функцию manifest_of.
fn manifest_of(files: &[(&str, &[u8])]) -> ResourcesManifest {
    // Объявляем переменную map .
    let mut map = std::collections::HashMap::new();

    // Перебираем элементы коллекции.
    for (key, body) in files {
        // Выполняем операцию: map.insert(.
        map.insert(
            // Выполняем операцию: (*key).to_string(),.
            (*key).to_string(),
            // Выполняем операцию: crate::commands::resources_core::hash_bytes(body),.
            crate::commands::resources_core::hash_bytes(body),
            // Закрываем выражение или коллекцию.
        );
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
// Объявляем функцию test_first_run_detected_by_missing_marker.
fn test_first_run_detected_by_missing_marker() {
    // Объявляем переменную root .
    let root = fixture("zapret-cmd-firstrun");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");
    // Выполняем операцию: std::fs::create_dir_all(&app_dir).unwrap();.
    std::fs::create_dir_all(&app_dir).unwrap();

    // Выполняем операцию: assert!(read_marker(&app_dir).is_err());.
    assert!(read_marker(&app_dir).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_marker_after_first_run_blocks_update.
fn test_marker_after_first_run_blocks_update() {
    // Объявляем переменную root .
    let root = fixture("zapret-cmd-marker-same");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");
    // Выполняем операцию: std::fs::create_dir_all(&app_dir).unwrap();.
    std::fs::create_dir_all(&app_dir).unwrap();

    // Объявляем переменную manifest .
    let manifest = manifest_of(&[]);
    // Выполняем операцию: write_marker(&app_dir, "0.1.0", &manifest, 7).unwrap();.
    write_marker(&app_dir, "0.1.0", &manifest, 7).unwrap();

    // Объявляем переменную marker .
    let marker = read_marker(&app_dir).unwrap();

    // Выполняем операцию: assert_eq!(marker.resources_version, "1.10.3");.
    assert_eq!(marker.resources_version, "1.10.3");
    // Выполняем операцию: assert_eq!(marker.version, "0.1.0");.
    assert_eq!(marker.version, "0.1.0");
    // Выполняем операцию: assert_eq!(marker.strategies_count, 7);.
    assert_eq!(marker.strategies_count, 7);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_version_change_is_detected.
fn test_version_change_is_detected() {
    // Объявляем переменную root .
    let root = fixture("zapret-cmd-marker-old");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");
    // Выполняем операцию: std::fs::create_dir_all(&app_dir).unwrap();.
    std::fs::create_dir_all(&app_dir).unwrap();

    // Объявляем переменную manifest .
    let mut manifest = manifest_of(&[]);
    // Выполняем операцию: manifest.version = "1.9.4".to_string();.
    manifest.version = "1.9.4".to_string();
    // Выполняем операцию: write_marker(&app_dir, "0.1.0", &manifest, 5).unwrap();.
    write_marker(&app_dir, "0.1.0", &manifest, 5).unwrap();

    // Объявляем переменную marker .
    let marker = read_marker(&app_dir).unwrap();

    // Выполняем операцию: assert_ne!(marker.resources_version, "1.10.3");.
    assert_ne!(marker.resources_version, "1.10.3");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_license_rejects_unknown_name.
fn test_read_license_rejects_unknown_name() {
    // Выполняем операцию: assert!(license_allowed("secret.txt").is_err());.
    assert!(license_allowed("secret.txt").is_err());
    // Выполняем операцию: assert!(license_allowed("config.json").is_err());.
    assert!(license_allowed("config.json").is_err());
    // Выполняем операцию: assert!(license_allowed("LICENSE-zapret.txt").is_ok());.
    assert!(license_allowed("LICENSE-zapret.txt").is_ok());
    // Выполняем операцию: assert!(license_allowed("README-zapret.md").is_ok());.
    assert!(license_allowed("README-zapret.md").is_ok());
    // Выполняем операцию: assert!(license_allowed("LICENSE-xray.txt").is_ok());.
    assert!(license_allowed("LICENSE-xray.txt").is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_self_heal_restores_missing_and_broken_binaries_only.
async fn test_self_heal_restores_missing_and_broken_binaries_only() {
    // Объявляем переменную root .
    let root = fixture("zapret-cmd-self-heal");
    // Объявляем переменную resources .
    let resources = root.join("resources");
    // Объявляем переменную target .
    let target = root.join("app");
    // Объявляем переменную bundle .
    let bundle = resources.join("zapret");

    // Выполняем операцию: std::fs::create_dir_all(bundle.join("bin")).unwrap();.
    std::fs::create_dir_all(bundle.join("bin")).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(bundle.join("lists")).unwrap();.
    std::fs::create_dir_all(bundle.join("lists")).unwrap();
    // Выполняем операцию: std::fs::write(bundle.join("bin").join("winws.exe"), b".
    std::fs::write(bundle.join("bin").join("winws.exe"), b"good-binary").unwrap();
    // Выполняем операцию: std::fs::write(bundle.join("general-00.bat"), b"good-ba.
    std::fs::write(bundle.join("general-00.bat"), b"good-bat").unwrap();
    // Выполняем операцию: std::fs::write(bundle.join("lists").join("ipset.txt"), .
    std::fs::write(bundle.join("lists").join("ipset.txt"), b"bundle-list").unwrap();

    // Выполняем операцию: std::fs::create_dir_all(target.join("strategies").join(.
    std::fs::create_dir_all(target.join("strategies").join("bin")).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(target.join("strategies").join(.
    std::fs::create_dir_all(target.join("strategies").join("lists")).unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: target.join("strategies").join("bin").join("winws.exe").
        target.join("strategies").join("bin").join("winws.exe"),
        // Выполняем операцию: b"broken",.
        b"broken",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: target.join("strategies").join("lists").join("ipset.txt.
        target.join("strategies").join("lists").join("ipset.txt"),
        // Выполняем операцию: b"user-list",.
        b"user-list",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную manifest .
    let manifest = manifest_of(&[
        // Выполняем операцию: ("zapret/bin/winws.exe", b"good-binary"),.
        ("zapret/bin/winws.exe", b"good-binary"),
        // Выполняем операцию: ("zapret/general-00.bat", b"good-bat"),.
        ("zapret/general-00.bat", b"good-bat"),
        // Выполняем операцию: ("zapret/lists/ipset.txt", b"bundle-list"),.
        ("zapret/lists/ipset.txt", b"bundle-list"),
        // Выполняем операцию: ]);.
    ]);

    // Объявляем переменную repaired .
    let repaired = self_heal_missing(&resources, &target, &manifest)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .unwrap();.
        .unwrap();

    // Выполняем операцию: assert_eq!(repaired, 2, "бинарник и отсутствующий bat").
    assert_eq!(repaired, 2, "бинарник и отсутствующий bat");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read(target.join("strategies").join("bin").joi.
        std::fs::read(target.join("strategies").join("bin").join("winws.exe")).unwrap(),
        // Выполняем операцию: b"good-binary".
        b"good-binary" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read(target.join("strategies").join("general-0.
        std::fs::read(target.join("strategies").join("general-00.bat")).unwrap(),
        // Выполняем операцию: b"good-bat".
        b"good-bat" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read(target.join("strategies").join("lists").j.
        std::fs::read(target.join("strategies").join("lists").join("ipset.txt")).unwrap(),
        // Выполняем операцию: b"user-list",.
        b"user-list",
        // Выполняем операцию: "пользовательский текстовый список не перезаписывается".
        "пользовательский текстовый список не перезаписывается" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_source_path_maps_manifest_key_to_bundle.
fn test_source_path_maps_manifest_key_to_bundle() {
    // Объявляем переменную resources .
    let resources = Path::new("res");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: source_path(resources, "zapret/general-00-baseline.bat".
        source_path(resources, "zapret/general-00-baseline.bat").unwrap(),
        // Выполняем операцию: Path::new("res").
        Path::new("res")
            // Выполняем операцию: .join("zapret").
            .join("zapret")
            // Выполняем операцию: .join("general-00-baseline.bat").
            .join("general-00-baseline.bat") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_source_path_keeps_nested_folders.
fn test_source_path_keeps_nested_folders() {
    // Объявляем переменную expected .
    let expected = Path::new("res")
        // Выполняем операцию: .join("zapret").
        .join("zapret")
        // Выполняем операцию: .join("lists").
        .join("lists")
        // Выполняем операцию: .join("ipset-all.txt");.
        .join("ipset-all.txt");
    // Объявляем переменную resolved .
    let resolved = source_path(Path::new("res"), "zapret/lists/ipset-all.txt").unwrap();

    // Выполняем операцию: assert_eq!(resolved, expected);.
    assert_eq!(resolved, expected);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cleanup_legacy_strategies_keeps_current_and_user_files.
fn test_cleanup_legacy_strategies_keeps_current_and_user_files() {
    // Объявляем переменную root .
    let root = fixture("zapret-cmd-legacy-strategies");
    // Объявляем переменную strategies .
    let strategies = root.join("strategies");
    // Выполняем операцию: std::fs::create_dir_all(&strategies).unwrap();.
    std::fs::create_dir_all(&strategies).unwrap();

    // Выполняем операцию: std::fs::write(strategies.join("general (ALT2).bat"), b.
    std::fs::write(strategies.join("general (ALT2).bat"), b"legacy").unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: strategies.join("general (FAKE TLS AUTO ALT3).bat"),.
        strategies.join("general (FAKE TLS AUTO ALT3).bat"),
        // Выполняем операцию: b"legacy",.
        b"legacy",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("general.bat"), b"legacy.
    std::fs::write(strategies.join("general.bat"), b"legacy").unwrap();
    // актуальные и пользовательские имена не входят в список чистки
    // Выполняем операцию: std::fs::write(strategies.join("general-00-baseline.bat.
    std::fs::write(strategies.join("general-00-baseline.bat"), b"current").unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("outlast-trials.bat"), b.
    std::fs::write(strategies.join("outlast-trials.bat"), b"user").unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("my-own-settings.bat"), .
    std::fs::write(strategies.join("my-own-settings.bat"), b"user").unwrap();

    // Выполняем операцию: cleanup_legacy_strategies(&strategies);.
    cleanup_legacy_strategies(&strategies);
    // Выполняем операцию: cleanup_legacy_strategies(&strategies);.
    cleanup_legacy_strategies(&strategies);

    // Выполняем операцию: assert!(!strategies.join("general (ALT2).bat").exists().
    assert!(!strategies.join("general (ALT2).bat").exists());
    // Выполняем операцию: assert!(!strategies.join("general (FAKE TLS AUTO ALT3)..
    assert!(!strategies.join("general (FAKE TLS AUTO ALT3).bat").exists());
    // Выполняем операцию: assert!(!strategies.join("general.bat").exists());.
    assert!(!strategies.join("general.bat").exists());
    // Выполняем операцию: assert!(strategies.join("general-00-baseline.bat").is_f.
    assert!(strategies.join("general-00-baseline.bat").is_file());
    // Выполняем операцию: assert!(strategies.join("outlast-trials.bat").is_file().
    assert!(strategies.join("outlast-trials.bat").is_file());
    // Выполняем операцию: assert!(strategies.join("my-own-settings.bat").is_file(.
    assert!(strategies.join("my-own-settings.bat").is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}
