use super::*;

fn temp_dir(name: &str) -> PathBuf {
    let path = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&path);
    std::fs::create_dir_all(&path).unwrap();

    path
}

fn write(path: &Path, content: &str) {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).unwrap();
    }
    std::fs::write(path, content).unwrap();
}

fn build_zip(path: &Path, files: &[(&str, &str)]) {
    let file = std::fs::File::create(path).unwrap();
    let mut zip = zip::ZipWriter::new(file);
    let options: zip::write::SimpleFileOptions = zip::write::SimpleFileOptions::default();

    for (name, content) in files {
        zip.start_file(*name, options).unwrap();
        std::io::Write::write_all(&mut zip, content.as_bytes()).unwrap();
    }

    zip.finish().unwrap();
}

#[test]
fn test_strip_single_root_detects_common_folder() {
    let names = vec![
        "pack-1.0/general.bat".to_string(),
        "pack-1.0/lists/list.txt".to_string(),
    ];

    assert_eq!(strip_single_root(&names), Some("pack-1.0".to_string()));
}

#[test]
fn test_strip_single_root_keeps_flat_archive() {
    let names = vec!["general.bat".to_string(), "service.bat".to_string()];

    assert_eq!(strip_single_root(&names), None);
}

#[test]
fn test_extract_archive_strips_root_and_keeps_structure() {
    let root = temp_dir("zapret-install-extract");
    let archive = root.join("pack.zip");
    let dest = root.join("out");

    build_zip(
        &archive,
        &[
            ("pack-1.0/general.bat", "@echo off"),
            ("pack-1.0/lists/list-general.txt", "dns.google\n"),
        ],
    );

    let count = extract_archive(&archive, &dest).unwrap();

    assert_eq!(count, 2);
    assert!(dest.join("general.bat").is_file());
    assert!(dest.join("lists/list-general.txt").is_file());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_extract_archive_rejects_broken_file() {
    let root = temp_dir("zapret-install-broken");
    let archive = root.join("broken.zip");
    write(&archive, "not a zip");

    assert!(extract_archive(&archive, &root.join("out")).is_err());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_merge_file_keeps_marker_entries() {
    use crate::constants::{MARKER_END, MARKER_START};

    let root = temp_dir("zapret-install-merge");
    let source = root.join("new.txt");
    let target = root.join("old.txt");

    write(&source, "dns.google\n");
    write(
        &target,
        &format!(
            "dns.google\n{MARKER_START}\n# outlast\noutlasttrials.com\n{MARKER_END}\n"
        ),
    );

    let preserved = merge_file(&source, &target).unwrap();
    let merged = std::fs::read_to_string(&target).unwrap();

    assert_eq!(preserved, 1);
    assert!(merged.contains("outlasttrials.com"));
    assert!(merged.contains(MARKER_START));

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_merge_file_without_marker_replaces_content() {
    let root = temp_dir("zapret-install-nomarker");
    let source = root.join("new.txt");
    let target = root.join("old.txt");

    write(&source, "fresh\n");
    write(&target, "stale\n");

    assert_eq!(merge_file(&source, &target).unwrap(), 0);
    assert_eq!(std::fs::read_to_string(&target).unwrap(), "fresh\n");

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_merge_file_creates_missing_target() {
    let root = temp_dir("zapret-install-new");
    let source = root.join("new.txt");
    let target = root.join("fresh.txt");

    write(&source, "created\n");

    assert_eq!(merge_file(&source, &target).unwrap(), 0);
    assert!(target.is_file());

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_merge_file_copies_binary_without_reading() {
    let root = temp_dir("zapret-install-binary");
    let source = root.join("new-winws.exe");
    let target = root.join("winws.exe");

    std::fs::write(&source, vec![0u8, 1, 2, 3]).unwrap();

    assert_eq!(merge_file(&source, &target).unwrap(), 0);
    assert_eq!(std::fs::read(&target).unwrap().len(), 4);

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_install_archive_reports_and_removes_check_updates_flag() {
    let root = temp_dir("zapret-install-full");
    let dir = root.join("strategies");
    let staging = root.join("staging");
    let archive = root.join("pack.zip");
    let backup = root.join("backup/1");

    write(&dir.join("general.bat"), "old");
    write(&dir.join(CHECK_UPDATES_FLAG), "enabled");
    std::fs::create_dir_all(&backup).unwrap();

    build_zip(
        &archive,
        &[
            ("pack-1.0/general.bat", "new"),
            ("pack-1.0/service.bat", "service"),
        ],
    );

    let report = install_archive(&archive, &dir, &staging, "1.11.0", &backup).unwrap();

    assert_eq!(report.version, "1.11.0");
    assert_eq!(report.files, 2);
    assert!(report.check_updates_disabled);
    assert!(!dir.join(CHECK_UPDATES_FLAG).exists());
    assert_eq!(
        std::fs::read_to_string(dir.join("general.bat")).unwrap(),
        "new"
    );
    assert_eq!(
        std::fs::read_to_string(dir.join(".version")).unwrap().trim(),
        "1.11.0"
    );

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_install_archive_merges_markers_inside_subdirectories() {
    let root = temp_dir("zapret-install-nested");
    let dir = root.join("strategies");
    let staging = root.join("staging");
    let archive = root.join("pack.zip");
    let backup = root.join("backup/1");

    let marked = format!(
        "dns.google\n{}\nmy-own.example\n{}\n",
        crate::constants::MARKER_START,
        crate::constants::MARKER_END
    );

    write(&dir.join("lists/list-general.txt"), &marked);
    std::fs::create_dir_all(&backup).unwrap();

    build_zip(
        &archive,
        &[("pack-1.0/lists/list-general.txt", "discord.com\nyoutube.com\n")],
    );

    let report = install_archive(&archive, &dir, &staging, "1.11.0", &backup).unwrap();

    assert_eq!(report.files, 1);
    assert_eq!(report.preserved_entries, 1);

    let merged = std::fs::read_to_string(dir.join("lists/list-general.txt")).unwrap();

    assert!(merged.contains("discord.com"));
    assert!(merged.contains("my-own.example"));
    assert!(merged.contains(crate::constants::MARKER_START));

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_install_archive_writes_manifest_of_installed_files() {
    let root = temp_dir("zapret-install-manifest");
    let dir = root.join("strategies");
    let staging = root.join("staging");
    let archive = root.join("pack.zip");
    let backup = root.join("backup/1");

    std::fs::create_dir_all(&backup).unwrap();

    build_zip(
        &archive,
        &[
            ("pack-1.0/general.bat", "a"),
            ("pack-1.0/bin/winws.exe", "b"),
        ],
    );

    install_archive(&archive, &dir, &staging, "1.11.0", &backup).unwrap();

    let manifest = crate::commands::updater_manifest::read_manifest(&backup);

    assert!(manifest.contains(&"general.bat".to_string()));
    assert!(manifest.contains(&"bin/winws.exe".to_string()));

    let _ = std::fs::remove_dir_all(&root);
}

#[test]
fn test_staging_dir_is_inside_temp() {
    assert!(staging_dir().to_string_lossy().contains("zapret-manager"));
}

#[test]
fn test_install_report_defaults_are_empty() {
    let report = InstallReport::default();

    assert_eq!(report.files, 0);
    assert_eq!(report.preserved_entries, 0);
    assert!(!report.check_updates_disabled);
}