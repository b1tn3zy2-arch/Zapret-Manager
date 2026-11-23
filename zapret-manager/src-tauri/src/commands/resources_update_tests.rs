// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::resources_core::STRATEGIES_SUBDIR;.
use crate::commands::resources_core::STRATEGIES_SUBDIR;

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
        // Выполняем операцию: generated_at: crate::commands::resources_core::now_mill.
        generated_at: crate::commands::resources_core::now_millis(),
        // Выполняем операцию: files: map,.
        files: map,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию bundle.
fn bundle(root: &Path, files: &[(&str, &[u8])]) {
    // Объявляем переменную dir .
    let dir = root.join("zapret");
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Перебираем элементы коллекции.
    for (key, body) in files {
        // Объявляем переменную target .
        let target = dir.join(key.trim_start_matches("zapret/"));

        // Проверяем условие: let Some(parent) = target.parent() {.
        if let Some(parent) = target.parent() {
            // Выполняем операцию: std::fs::create_dir_all(parent).unwrap();.
            std::fs::create_dir_all(parent).unwrap();
            // Закрываем блок.
        }

        // Выполняем операцию: std::fs::write(target, body).unwrap();.
        std::fs::write(target, body).unwrap();
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию app_file.
fn app_file(root: &Path, name: &str, body: &[u8]) -> PathBuf {
    // Объявляем переменную dir .
    let dir = root.join("app").join(STRATEGIES_SUBDIR).join(name);

    // Проверяем условие: let Some(parent) = dir.parent() {.
    if let Some(parent) = dir.parent() {
        // Выполняем операцию: std::fs::create_dir_all(parent).unwrap();.
        std::fs::create_dir_all(parent).unwrap();
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::write(&dir, body).unwrap();.
    std::fs::write(&dir, body).unwrap();

    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Объявляем функцию apply_update.
fn apply_update(root: &Path, manifest: &ResourcesManifest, app_dir: &Path) -> (usize, usize) {
    // Объявляем переменную backup .
    let backup = crate::commands::resources_core::create_backup_dir(app_dir).unwrap();
    // Выполняем операцию: crate::commands::resources_core::backup_user_files(app_.
    crate::commands::resources_core::backup_user_files(app_dir, &backup).unwrap();

    // Объявляем переменную added .
    let mut added = 0usize;
    // Объявляем переменную skipped .
    let mut skipped = 0usize;

    // Перебираем элементы коллекции.
    for key in manifest_keys_sorted(manifest) {
        // Проверяем условие: user_owned(&key) {.
        if user_owned(&key) {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(expected) .
        let Some(expected) = manifest.files.get(&key) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную Ok(destination) .
        let Ok(destination) = target_path(app_dir, &key) else {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную relative .
        let relative = Path::new(&key)
            // Выполняем операцию: .strip_prefix("zapret").
            .strip_prefix("zapret")
            // Выполняем операцию: .unwrap_or(Path::new(&key));.
            .unwrap_or(Path::new(&key));
        // Объявляем переменную source .
        let source = root.join("zapret").join(relative);

        // Проверяем условие: !source.is_file() {.
        if !source.is_file() {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную user_edited .
        let user_edited = destination.is_file()
            // Выполняем операцию: && !crate::commands::resources_core::verify_file_hash(&.
            && !crate::commands::resources_core::verify_file_hash(&destination, expected);

        // Проверяем условие: user_edited && !always_overwrite(&key) {.
        if user_edited && !always_overwrite(&key) {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(parent) = destination.parent() {.
        if let Some(parent) = destination.parent() {
            // Выполняем операцию: std::fs::create_dir_all(parent).unwrap();.
            std::fs::create_dir_all(parent).unwrap();
            // Закрываем блок.
        }

        // Выполняем операцию: std::fs::copy(&source, &destination).unwrap();.
        std::fs::copy(&source, &destination).unwrap();
        // Выполняем операцию: added += 1;.
        added += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: (added, skipped).
    (added, skipped)
    // Закрываем блок.
}

// Объявляем функцию apply_restore.
fn apply_restore(root: &Path, manifest: &ResourcesManifest, app_dir: &Path) -> (usize, usize) {
    // Объявляем переменную restored .
    let mut restored = 0usize;
    // Объявляем переменную skipped .
    let mut skipped = 0usize;

    // Перебираем элементы коллекции.
    for key in manifest_keys_sorted(manifest) {
        // Проверяем условие: user_owned(&key) || !manifest.files.contains_key(&.
        if user_owned(&key) || !manifest.files.contains_key(&key) {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Ok(destination) .
        let Ok(destination) = target_path(app_dir, &key) else {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную relative .
        let relative = Path::new(&key)
            // Выполняем операцию: .strip_prefix("zapret").
            .strip_prefix("zapret")
            // Выполняем операцию: .unwrap_or(Path::new(&key));.
            .unwrap_or(Path::new(&key));
        // Объявляем переменную source .
        let source = root.join("zapret").join(relative);

        // Проверяем условие: !source.is_file() {.
        if !source.is_file() {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(parent) = destination.parent() {.
        if let Some(parent) = destination.parent() {
            // Выполняем операцию: std::fs::create_dir_all(parent).unwrap();.
            std::fs::create_dir_all(parent).unwrap();
            // Закрываем блок.
        }

        // Выполняем операцию: std::fs::copy(&source, &destination).unwrap();.
        std::fs::copy(&source, &destination).unwrap();
        // Выполняем операцию: restored += 1;.
        restored += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: (restored, skipped).
    (restored, skipped)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_smart_update_adds_missing_file.
fn test_smart_update_adds_missing_file() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-add");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"bat")]);

    // Выполняем операцию: bundle(&root, &[("zapret/general-00-baseline.bat", b"ba.
    bundle(&root, &[("zapret/general-00-baseline.bat", b"bat")]);

    // Объявляем переменную app_dir .
    let app_dir = root.join("app");
    // Выполняем операцию: std::fs::create_dir_all(app_dir.join("strategies")).unw.
    std::fs::create_dir_all(app_dir.join("strategies")).unwrap();

    // Объявляем переменную (added, skipped) .
    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    // Выполняем операцию: assert_eq!(added, 1);.
    assert_eq!(added, 1);
    // Выполняем операцию: assert_eq!(skipped, 0);.
    assert_eq!(skipped, 0);
    // Выполняем операцию: assert!(app_dir.
    assert!(app_dir
        // Выполняем операцию: .join(STRATEGIES_SUBDIR).
        .join(STRATEGIES_SUBDIR)
        // Выполняем операцию: .join("general-00-baseline.bat").
        .join("general-00-baseline.bat")
        // Выполняем операцию: .is_file());.
        .is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_smart_update_keeps_user_edited_strategy.
fn test_smart_update_keeps_user_edited_strategy() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-keep");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"original")]);

    // Выполняем операцию: bundle(&root, &[("zapret/general-00-baseline.bat", b"ne.
    bundle(&root, &[("zapret/general-00-baseline.bat", b"new version")]);

    // Объявляем переменную path .
    let path = app_file(&root, "general-00-baseline.bat", b"my edit");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");

    // Объявляем переменную (added, skipped) .
    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    // Выполняем операцию: assert_eq!(added, 0);.
    assert_eq!(added, 0);
    // Выполняем операцию: assert_eq!(skipped, 1);.
    assert_eq!(skipped, 1);
    // Выполняем операцию: assert_eq!(std::fs::read(&path).unwrap(), b"my edit");.
    assert_eq!(std::fs::read(&path).unwrap(), b"my edit");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_smart_update_refreshes_untouched_file.
fn test_smart_update_refreshes_untouched_file() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-refresh");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"original")]);

    // Выполняем операцию: bundle(&root, &[("zapret/general-00-baseline.bat", b"fr.
    bundle(&root, &[("zapret/general-00-baseline.bat", b"fresh")]);

    // Объявляем переменную path .
    let path = app_file(&root, "general-00-baseline.bat", b"original");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");

    // Объявляем переменную (added, skipped) .
    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    // Выполняем операцию: assert_eq!(added, 1);.
    assert_eq!(added, 1);
    // Выполняем операцию: assert_eq!(skipped, 0);.
    assert_eq!(skipped, 0);
    // Выполняем операцию: assert_eq!(std::fs::read(&path).unwrap(), b"fresh");.
    assert_eq!(std::fs::read(&path).unwrap(), b"fresh");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_smart_update_never_touches_user_lists.
fn test_smart_update_never_touches_user_lists() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-lists");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[("zapret/lists/list-general.txt", b"original")]);

    // Выполняем операцию: bundle(&root, &[("zapret/lists/list-general.txt", b"fre.
    bundle(&root, &[("zapret/lists/list-general.txt", b"fresh")]);

    // Объявляем переменную path .
    let path = app_file(&root, "lists/list-general.txt", b"my domains");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");

    // Объявляем переменную (added, skipped) .
    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    // Выполняем операцию: assert_eq!(added, 0);.
    assert_eq!(added, 0);
    // Выполняем операцию: assert_eq!(skipped, 1);.
    assert_eq!(skipped, 1);
    // Выполняем операцию: assert_eq!(std::fs::read(&path).unwrap(), b"my domains".
    assert_eq!(std::fs::read(&path).unwrap(), b"my domains");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_smart_update_replaces_broken_binary_anyway.
fn test_smart_update_replaces_broken_binary_anyway() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-binary");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[("zapret/bin/winws.exe", b"good binary")]);

    // Выполняем операцию: bundle(&root, &[("zapret/bin/winws.exe", b"good binary".
    bundle(&root, &[("zapret/bin/winws.exe", b"good binary")]);

    // Объявляем переменную path .
    let path = app_file(&root, "bin/winws.exe", b"corrupted");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");

    // Объявляем переменную (added, skipped) .
    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    // Выполняем операцию: assert_eq!(added, 1);.
    assert_eq!(added, 1);
    // Выполняем операцию: assert_eq!(skipped, 0);.
    assert_eq!(skipped, 0);
    // Выполняем операцию: assert_eq!(std::fs::read(&path).unwrap(), b"good binary.
    assert_eq!(std::fs::read(&path).unwrap(), b"good binary");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_smart_update_creates_backup_with_user_bats.
fn test_smart_update_creates_backup_with_user_bats() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-backup");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"bat")]);

    // Выполняем операцию: bundle(&root, &[("zapret/general-00-baseline.bat", b"ba.
    bundle(&root, &[("zapret/general-00-baseline.bat", b"bat")]);

    // Объявляем переменную app_dir .
    let app_dir = root.join("app");
    // Объявляем переменную strategies .
    let strategies = app_dir.join("strategies");
    // Выполняем операцию: std::fs::create_dir_all(&strategies).unwrap();.
    std::fs::create_dir_all(&strategies).unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("general-00-baseline.bat.
    std::fs::write(strategies.join("general-00-baseline.bat"), b"mine").unwrap();
    // Выполняем операцию: std::fs::write(strategies.join("my_custom.bat"), b"mine.
    std::fs::write(strategies.join("my_custom.bat"), b"mine").unwrap();

    // Выполняем операцию: apply_update(&root, &manifest, &app_dir);.
    apply_update(&root, &manifest, &app_dir);

    // Объявляем переменную backup_dir .
    let backup_dir = std::fs::read_dir(app_dir.join("backups"))
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .and_then(|entries| entries.flatten().next()).
        .and_then(|entries| entries.flatten().next())
        // Выполняем операцию: .map(|entry| entry.path()).
        .map(|entry| entry.path())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: assert!(backup_dir.is_dir());.
    assert!(backup_dir.is_dir());
    // Выполняем операцию: assert!(backup_dir.join("my_custom.bat").is_file());.
    assert!(backup_dir.join("my_custom.bat").is_file());
    // Выполняем операцию: assert!(backup_dir.join("general-00-baseline.bat").is_f.
    assert!(backup_dir.join("general-00-baseline.bat").is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_restore_overwrites_broken_and_keeps_custom.
fn test_restore_overwrites_broken_and_keeps_custom() {
    // Объявляем переменную root .
    let root = fixture("zapret-upd-restore");
    // Объявляем переменную manifest .
    let manifest = manifest_of(&[
        // Выполняем операцию: ("zapret/general-00-baseline.bat", b"fresh"),.
        ("zapret/general-00-baseline.bat", b"fresh"),
        // Выполняем операцию: ("zapret/lists/list-general.txt", b"fresh list"),.
        ("zapret/lists/list-general.txt", b"fresh list"),
        // Выполняем операцию: ]);.
    ]);

    // Выполняем операцию: bundle(.
    bundle(
        // Выполняем операцию: &root,.
        &root,
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: ("zapret/general-00-baseline.bat", b"fresh"),.
            ("zapret/general-00-baseline.bat", b"fresh"),
            // Выполняем операцию: ("zapret/lists/list-general.txt", b"fresh list"),.
            ("zapret/lists/list-general.txt", b"fresh list"),
            // Выполняем операцию: ],.
        ],
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную broken .
    let broken = app_file(&root, "general-00-baseline.bat", b"broken");
    // Объявляем переменную custom .
    let custom = app_file(&root, "my_custom.bat", b"mine");
    // Объявляем переменную app_dir .
    let app_dir = root.join("app");

    // Объявляем переменную (restored, skipped) .
    let (restored, skipped) = apply_restore(&root, &manifest, &app_dir);

    // Выполняем операцию: assert_eq!(restored, 1);.
    assert_eq!(restored, 1);
    // Выполняем операцию: assert_eq!(skipped, 1);.
    assert_eq!(skipped, 1);
    // Выполняем операцию: assert_eq!(std::fs::read(&broken).unwrap(), b"fresh");.
    assert_eq!(std::fs::read(&broken).unwrap(), b"fresh");
    // Выполняем операцию: assert!(custom.is_file());.
    assert!(custom.is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_user_owned_covers_lists_and_outlast.
fn test_user_owned_covers_lists_and_outlast() {
    // Выполняем операцию: assert!(user_owned("zapret/lists/list-general.txt"));.
    assert!(user_owned("zapret/lists/list-general.txt"));
    // Выполняем операцию: assert!(user_owned("zapret/outlast/default-domains.txt".
    assert!(user_owned("zapret/outlast/default-domains.txt"));
    // Выполняем операцию: assert!(!user_owned("zapret/general-00-baseline.bat"));.
    assert!(!user_owned("zapret/general-00-baseline.bat"));
    // Выполняем операцию: assert!(!user_owned("zapret/bin/winws.exe"));.
    assert!(!user_owned("zapret/bin/winws.exe"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_always_overwrite_covers_binaries_only.
fn test_always_overwrite_covers_binaries_only() {
    // Выполняем операцию: assert!(always_overwrite("zapret/bin/winws.exe"));.
    assert!(always_overwrite("zapret/bin/winws.exe"));
    // Выполняем операцию: assert!(always_overwrite("zapret/bin/WinDivert.dll"));.
    assert!(always_overwrite("zapret/bin/WinDivert.dll"));
    // Выполняем операцию: assert!(!always_overwrite("zapret/general-00-baseline.b.
    assert!(!always_overwrite("zapret/general-00-baseline.bat"));
    // Закрываем блок.
}
