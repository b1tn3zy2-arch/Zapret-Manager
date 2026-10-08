use super::*;
use crate::commands::resources_core::{
    now_millis, read_marker, write_marker, ResourcesManifest,
};

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
        generated_at: now_millis(),
        files: map,
    }
}

#[test]
fn test_first_run_detected_by_missing_marker() {
    let root = fixture("zapret-cmd-firstrun");
    let app_dir = root.join("app");
    std::fs::create_dir_all(&app_dir).unwrap();

    assert!(read_marker(&app_dir).is_err());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_marker_after_first_run_blocks_update() {
    let root = fixture("zapret-cmd-marker-same");
    let app_dir = root.join("app");
    std::fs::create_dir_all(&app_dir).unwrap();

    let manifest = manifest_of(&[]);
    write_marker(&app_dir, "0.1.0", &manifest, 7).unwrap();

    let marker = read_marker(&app_dir).unwrap();

    assert_eq!(marker.resources_version, "1.10.3");
    assert_eq!(marker.version, "0.1.0");
    assert_eq!(marker.strategies_count, 7);

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_version_change_is_detected() {
    let root = fixture("zapret-cmd-marker-old");
    let app_dir = root.join("app");
    std::fs::create_dir_all(&app_dir).unwrap();

    let mut manifest = manifest_of(&[]);
    manifest.version = "1.9.4".to_string();
    write_marker(&app_dir, "0.1.0", &manifest, 5).unwrap();

    let marker = read_marker(&app_dir).unwrap();

    assert_ne!(marker.resources_version, "1.10.3");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_read_license_rejects_unknown_name() {
    assert!(license_allowed("secret.txt").is_err());
    assert!(license_allowed("config.json").is_err());
    assert!(license_allowed("LICENSE-zapret.txt").is_ok());
    assert!(license_allowed("README-zapret.md").is_ok());
}

#[test]
fn test_source_path_maps_manifest_key_to_bundle() {
    let resources = Path::new("res");

    assert_eq!(
        source_path(resources, "zapret/general-00-baseline.bat").unwrap(),
        Path::new("res")
            .join("zapret")
            .join("general-00-baseline.bat")
    );
}

#[test]
fn test_source_path_keeps_nested_folders() {
    let expected = Path::new("res")
        .join("zapret")
        .join("lists")
        .join("ipset-all.txt");
    let resolved = source_path(Path::new("res"), "zapret/lists/ipset-all.txt").unwrap();

    assert_eq!(resolved, expected);
}