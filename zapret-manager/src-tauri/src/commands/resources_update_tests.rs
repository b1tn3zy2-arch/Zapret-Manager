use super::*;
use crate::commands::resources_core::STRATEGIES_SUBDIR;

fn fixture(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    dir
}

fn manifest_of(files: &[(&str, &[u8])]) -> ResourcesManifest {
    let mut map = std::collections::HashMap::new();

    for (key, body) in files {
        map.insert(
            (*key).to_string(),
            crate::commands::resources_core::hash_bytes(body),
        );
    }

    ResourcesManifest {
        version: "1.10.3".to_string(),
        generated_at: crate::commands::resources_core::now_millis(),
        files: map,
    }
}

fn bundle(root: &Path, files: &[(&str, &[u8])]) {
    let dir = root.join("zapret");
    std::fs::create_dir_all(&dir).unwrap();

    for (key, body) in files {
        let target = dir.join(key.trim_start_matches("zapret/"));

        if let Some(parent) = target.parent() {
            std::fs::create_dir_all(parent).unwrap();
        }

        std::fs::write(target, body).unwrap();
    }
}

fn app_file(root: &Path, name: &str, body: &[u8]) -> PathBuf {
    let dir = root.join("app").join(STRATEGIES_SUBDIR).join(name);

    if let Some(parent) = dir.parent() {
        std::fs::create_dir_all(parent).unwrap();
    }

    std::fs::write(&dir, body).unwrap();

    dir
}

fn apply_update(root: &Path, manifest: &ResourcesManifest, app_dir: &Path) -> (usize, usize) {
    let backup = crate::commands::resources_core::create_backup_dir(app_dir).unwrap();
    crate::commands::resources_core::backup_user_files(app_dir, &backup).unwrap();

    let mut added = 0usize;
    let mut skipped = 0usize;

    for key in manifest_keys_sorted(manifest) {
        if user_owned(&key) {
            skipped += 1;
            continue;
        }

        let Some(expected) = manifest.files.get(&key) else {
            continue;
        };

        let Ok(destination) = target_path(app_dir, &key) else {
            skipped += 1;
            continue;
        };

        let relative = Path::new(&key)
            .strip_prefix("zapret")
            .unwrap_or(Path::new(&key));
        let source = root.join("zapret").join(relative);

        if !source.is_file() {
            skipped += 1;
            continue;
        }

        let user_edited = destination.is_file()
            && !crate::commands::resources_core::verify_file_hash(&destination, expected);

        if user_edited && !always_overwrite(&key) {
            skipped += 1;
            continue;
        }

        if let Some(parent) = destination.parent() {
            std::fs::create_dir_all(parent).unwrap();
        }

        std::fs::copy(&source, &destination).unwrap();
        added += 1;
    }

    (added, skipped)
}

fn apply_restore(root: &Path, manifest: &ResourcesManifest, app_dir: &Path) -> (usize, usize) {
    let mut restored = 0usize;
    let mut skipped = 0usize;

    for key in manifest_keys_sorted(manifest) {
        if user_owned(&key) || !manifest.files.contains_key(&key) {
            skipped += 1;
            continue;
        }

        let Ok(destination) = target_path(app_dir, &key) else {
            skipped += 1;
            continue;
        };

        let relative = Path::new(&key)
            .strip_prefix("zapret")
            .unwrap_or(Path::new(&key));
        let source = root.join("zapret").join(relative);

        if !source.is_file() {
            skipped += 1;
            continue;
        }

        if let Some(parent) = destination.parent() {
            std::fs::create_dir_all(parent).unwrap();
        }

        std::fs::copy(&source, &destination).unwrap();
        restored += 1;
    }

    (restored, skipped)
}

#[test]
fn test_smart_update_adds_missing_file() {
    let root = fixture("zapret-upd-add");
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"bat")]);

    bundle(&root, &[("zapret/general-00-baseline.bat", b"bat")]);

    let app_dir = root.join("app");
    std::fs::create_dir_all(app_dir.join("strategies")).unwrap();

    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    assert_eq!(added, 1);
    assert_eq!(skipped, 0);
    assert!(app_dir
        .join(STRATEGIES_SUBDIR)
        .join("general-00-baseline.bat")
        .is_file());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_smart_update_keeps_user_edited_strategy() {
    let root = fixture("zapret-upd-keep");
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"original")]);

    bundle(&root, &[("zapret/general-00-baseline.bat", b"new version")]);

    let path = app_file(&root, "general-00-baseline.bat", b"my edit");
    let app_dir = root.join("app");

    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    assert_eq!(added, 0);
    assert_eq!(skipped, 1);
    assert_eq!(std::fs::read(&path).unwrap(), b"my edit");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_smart_update_refreshes_untouched_file() {
    let root = fixture("zapret-upd-refresh");
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"original")]);

    bundle(&root, &[("zapret/general-00-baseline.bat", b"fresh")]);

    let path = app_file(&root, "general-00-baseline.bat", b"original");
    let app_dir = root.join("app");

    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    assert_eq!(added, 1);
    assert_eq!(skipped, 0);
    assert_eq!(std::fs::read(&path).unwrap(), b"fresh");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_smart_update_never_touches_user_lists() {
    let root = fixture("zapret-upd-lists");
    let manifest = manifest_of(&[("zapret/lists/list-general.txt", b"original")]);

    bundle(&root, &[("zapret/lists/list-general.txt", b"fresh")]);

    let path = app_file(&root, "lists/list-general.txt", b"my domains");
    let app_dir = root.join("app");

    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    assert_eq!(added, 0);
    assert_eq!(skipped, 1);
    assert_eq!(std::fs::read(&path).unwrap(), b"my domains");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_smart_update_replaces_broken_binary_anyway() {
    let root = fixture("zapret-upd-binary");
    let manifest = manifest_of(&[("zapret/bin/winws.exe", b"good binary")]);

    bundle(&root, &[("zapret/bin/winws.exe", b"good binary")]);

    let path = app_file(&root, "bin/winws.exe", b"corrupted");
    let app_dir = root.join("app");

    let (added, skipped) = apply_update(&root, &manifest, &app_dir);

    assert_eq!(added, 1);
    assert_eq!(skipped, 0);
    assert_eq!(std::fs::read(&path).unwrap(), b"good binary");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_smart_update_creates_backup_with_user_bats() {
    let root = fixture("zapret-upd-backup");
    let manifest = manifest_of(&[("zapret/general-00-baseline.bat", b"bat")]);

    bundle(&root, &[("zapret/general-00-baseline.bat", b"bat")]);

    let app_dir = root.join("app");
    let strategies = app_dir.join("strategies");
    std::fs::create_dir_all(&strategies).unwrap();
    std::fs::write(strategies.join("general-00-baseline.bat"), b"mine").unwrap();
    std::fs::write(strategies.join("my_custom.bat"), b"mine").unwrap();

    apply_update(&root, &manifest, &app_dir);

    let backup_dir = std::fs::read_dir(app_dir.join("backups"))
        .ok()
        .and_then(|entries| entries.flatten().next())
        .map(|entry| entry.path())
        .unwrap_or_default();

    assert!(backup_dir.is_dir());
    assert!(backup_dir.join("my_custom.bat").is_file());
    assert!(backup_dir.join("general-00-baseline.bat").is_file());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_restore_overwrites_broken_and_keeps_custom() {
    let root = fixture("zapret-upd-restore");
    let manifest = manifest_of(&[
        ("zapret/general-00-baseline.bat", b"fresh"),
        ("zapret/lists/list-general.txt", b"fresh list"),
    ]);

    bundle(
        &root,
        &[
            ("zapret/general-00-baseline.bat", b"fresh"),
            ("zapret/lists/list-general.txt", b"fresh list"),
        ],
    );

    let broken = app_file(&root, "general-00-baseline.bat", b"broken");
    let custom = app_file(&root, "my_custom.bat", b"mine");
    let app_dir = root.join("app");

    let (restored, skipped) = apply_restore(&root, &manifest, &app_dir);

    assert_eq!(restored, 1);
    assert_eq!(skipped, 1);
    assert_eq!(std::fs::read(&broken).unwrap(), b"fresh");
    assert!(custom.is_file());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_user_owned_covers_lists_and_outlast() {
    assert!(user_owned("zapret/lists/list-general.txt"));
    assert!(user_owned("zapret/outlast/default-domains.txt"));
    assert!(!user_owned("zapret/general-00-baseline.bat"));
    assert!(!user_owned("zapret/bin/winws.exe"));
}

#[test]
fn test_always_overwrite_covers_binaries_only() {
    assert!(always_overwrite("zapret/bin/winws.exe"));
    assert!(always_overwrite("zapret/bin/WinDivert.dll"));
    assert!(!always_overwrite("zapret/general-00-baseline.bat"));
}