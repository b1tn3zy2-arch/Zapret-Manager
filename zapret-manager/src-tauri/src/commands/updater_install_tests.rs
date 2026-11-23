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

// Объявляем функцию write.
fn write(path: &Path, content: &str) {
    // Проверяем условие: let Some(parent) = path.parent() {.
    if let Some(parent) = path.parent() {
        // Выполняем операцию: std::fs::create_dir_all(parent).unwrap();.
        std::fs::create_dir_all(parent).unwrap();
        // Закрываем блок.
    }
    // Выполняем операцию: std::fs::write(path, content).unwrap();.
    std::fs::write(path, content).unwrap();
    // Закрываем блок.
}

// Объявляем функцию build_zip.
fn build_zip(path: &Path, files: &[(&str, &str)]) {
    // Объявляем переменную file .
    let file = std::fs::File::create(path).unwrap();
    // Объявляем переменную zip .
    let mut zip = zip::ZipWriter::new(file);
    // Объявляем переменную options.
    let options: zip::write::SimpleFileOptions = zip::write::SimpleFileOptions::default();

    // Перебираем элементы коллекции.
    for (name, content) in files {
        // Выполняем операцию: zip.start_file(*name, options).unwrap();.
        zip.start_file(*name, options).unwrap();
        // Выполняем операцию: std::io::Write::write_all(&mut zip, content.as_bytes()).
        std::io::Write::write_all(&mut zip, content.as_bytes()).unwrap();
        // Закрываем блок.
    }

    // Выполняем операцию: zip.finish().unwrap();.
    zip.finish().unwrap();
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strip_single_root_detects_common_folder.
fn test_strip_single_root_detects_common_folder() {
    // Объявляем переменную names .
    let names = vec![
        // Выполняем операцию: "pack-1.0/general.bat".to_string(),.
        "pack-1.0/general.bat".to_string(),
        // Выполняем операцию: "pack-1.0/lists/list.txt".to_string(),.
        "pack-1.0/lists/list.txt".to_string(),
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: assert_eq!(strip_single_root(&names), Some("pack-1.0".t.
    assert_eq!(strip_single_root(&names), Some("pack-1.0".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strip_single_root_keeps_flat_archive.
fn test_strip_single_root_keeps_flat_archive() {
    // Объявляем переменную names .
    let names = vec!["general.bat".to_string(), "service.bat".to_string()];

    // Выполняем операцию: assert_eq!(strip_single_root(&names), None);.
    assert_eq!(strip_single_root(&names), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_archive_strips_root_and_keeps_structure.
fn test_extract_archive_strips_root_and_keeps_structure() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-extract");
    // Объявляем переменную archive .
    let archive = root.join("pack.zip");
    // Объявляем переменную dest .
    let dest = root.join("out");

    // Выполняем операцию: build_zip(.
    build_zip(
        // Выполняем операцию: &archive,.
        &archive,
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: ("pack-1.0/general.bat", "@echo off"),.
            ("pack-1.0/general.bat", "@echo off"),
            // Выполняем операцию: ("pack-1.0/lists/list-general.txt", "dns.google\n"),.
            ("pack-1.0/lists/list-general.txt", "dns.google\n"),
            // Выполняем операцию: ],.
        ],
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную count .
    let count = extract_archive(&archive, &dest).unwrap();

    // Выполняем операцию: assert_eq!(count, 2);.
    assert_eq!(count, 2);
    // Выполняем операцию: assert!(dest.join("general.bat").is_file());.
    assert!(dest.join("general.bat").is_file());
    // Выполняем операцию: assert!(dest.join("lists/list-general.txt").is_file());.
    assert!(dest.join("lists/list-general.txt").is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_archive_rejects_broken_file.
fn test_extract_archive_rejects_broken_file() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-broken");
    // Объявляем переменную archive .
    let archive = root.join("broken.zip");
    // Выполняем операцию: write(&archive, "not a zip");.
    write(&archive, "not a zip");

    // Выполняем операцию: assert!(extract_archive(&archive, &root.join("out")).is.
    assert!(extract_archive(&archive, &root.join("out")).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_file_keeps_marker_entries.
fn test_merge_file_keeps_marker_entries() {
    // Подключаем модули: crate::constants::{MARKER_END, MARKER_START};.
    use crate::constants::{MARKER_END, MARKER_START};

    // Объявляем переменную root .
    let root = temp_dir("zapret-install-merge");
    // Объявляем переменную source .
    let source = root.join("new.txt");
    // Объявляем переменную target .
    let target = root.join("old.txt");

    // Выполняем операцию: write(&source, "dns.google\n");.
    write(&source, "dns.google\n");
    // Выполняем операцию: write(.
    write(
        // Выполняем операцию: &target,.
        &target,
        // Выполняем операцию: &format!("dns.google\n{MARKER_START}\n# outlast\noutlas.
        &format!("dns.google\n{MARKER_START}\n# outlast\noutlasttrials.com\n{MARKER_END}\n"),
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную preserved .
    let preserved = merge_file(&source, &target).unwrap();
    // Объявляем переменную merged .
    let merged = std::fs::read_to_string(&target).unwrap();

    // Выполняем операцию: assert_eq!(preserved, 1);.
    assert_eq!(preserved, 1);
    // Выполняем операцию: assert!(merged.contains("outlasttrials.com"));.
    assert!(merged.contains("outlasttrials.com"));
    // Выполняем операцию: assert!(merged.contains(MARKER_START));.
    assert!(merged.contains(MARKER_START));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_file_without_marker_replaces_content.
fn test_merge_file_without_marker_replaces_content() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-nomarker");
    // Объявляем переменную source .
    let source = root.join("new.txt");
    // Объявляем переменную target .
    let target = root.join("old.txt");

    // Выполняем операцию: write(&source, "fresh\n");.
    write(&source, "fresh\n");
    // Выполняем операцию: write(&target, "stale\n");.
    write(&target, "stale\n");

    // Выполняем операцию: assert_eq!(merge_file(&source, &target).unwrap(), 0);.
    assert_eq!(merge_file(&source, &target).unwrap(), 0);
    // Выполняем операцию: assert_eq!(std::fs::read_to_string(&target).unwrap(), ".
    assert_eq!(std::fs::read_to_string(&target).unwrap(), "fresh\n");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_file_creates_missing_target.
fn test_merge_file_creates_missing_target() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-new");
    // Объявляем переменную source .
    let source = root.join("new.txt");
    // Объявляем переменную target .
    let target = root.join("fresh.txt");

    // Выполняем операцию: write(&source, "created\n");.
    write(&source, "created\n");

    // Выполняем операцию: assert_eq!(merge_file(&source, &target).unwrap(), 0);.
    assert_eq!(merge_file(&source, &target).unwrap(), 0);
    // Выполняем операцию: assert!(target.is_file());.
    assert!(target.is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_file_copies_binary_without_reading.
fn test_merge_file_copies_binary_without_reading() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-binary");
    // Объявляем переменную source .
    let source = root.join("new-winws.exe");
    // Объявляем переменную target .
    let target = root.join("winws.exe");

    // Выполняем операцию: std::fs::write(&source, vec![0u8, 1, 2, 3]).unwrap();.
    std::fs::write(&source, vec![0u8, 1, 2, 3]).unwrap();

    // Выполняем операцию: assert_eq!(merge_file(&source, &target).unwrap(), 0);.
    assert_eq!(merge_file(&source, &target).unwrap(), 0);
    // Выполняем операцию: assert_eq!(std::fs::read(&target).unwrap().len(), 4);.
    assert_eq!(std::fs::read(&target).unwrap().len(), 4);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_archive_reports_and_removes_check_updates_flag.
fn test_install_archive_reports_and_removes_check_updates_flag() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-full");
    // Объявляем переменную dir .
    let dir = root.join("strategies");
    // Объявляем переменную staging .
    let staging = root.join("staging");
    // Объявляем переменную archive .
    let archive = root.join("pack.zip");
    // Объявляем переменную backup .
    let backup = root.join("backup/1");

    // Выполняем операцию: write(&dir.join("general.bat"), "old");.
    write(&dir.join("general.bat"), "old");
    // Выполняем операцию: write(&dir.join(CHECK_UPDATES_FLAG), "enabled");.
    write(&dir.join(CHECK_UPDATES_FLAG), "enabled");
    // Выполняем операцию: std::fs::create_dir_all(&backup).unwrap();.
    std::fs::create_dir_all(&backup).unwrap();

    // Выполняем операцию: build_zip(.
    build_zip(
        // Выполняем операцию: &archive,.
        &archive,
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: ("pack-1.0/general.bat", "new"),.
            ("pack-1.0/general.bat", "new"),
            // Выполняем операцию: ("pack-1.0/service.bat", "service"),.
            ("pack-1.0/service.bat", "service"),
            // Выполняем операцию: ],.
        ],
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную report .
    let report = install_archive(&archive, &dir, &staging, "1.11.0", &backup).unwrap();

    // Выполняем операцию: assert_eq!(report.version, "1.11.0");.
    assert_eq!(report.version, "1.11.0");
    // Выполняем операцию: assert_eq!(report.files, 2);.
    assert_eq!(report.files, 2);
    // Выполняем операцию: assert!(report.check_updates_disabled);.
    assert!(report.check_updates_disabled);
    // Выполняем операцию: assert!(!dir.join(CHECK_UPDATES_FLAG).exists());.
    assert!(!dir.join(CHECK_UPDATES_FLAG).exists());
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read_to_string(dir.join("general.bat")).unwrap.
        std::fs::read_to_string(dir.join("general.bat")).unwrap(),
        // Выполняем операцию: "new".
        "new" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: std::fs::read_to_string(dir.join(".version")).
        std::fs::read_to_string(dir.join(".version"))
            // Выполняем операцию: .unwrap().
            .unwrap()
            // Выполняем операцию: .trim(),.
            .trim(),
        // Выполняем операцию: "1.11.0".
        "1.11.0" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_archive_merges_markers_inside_subdirectories.
fn test_install_archive_merges_markers_inside_subdirectories() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-nested");
    // Объявляем переменную dir .
    let dir = root.join("strategies");
    // Объявляем переменную staging .
    let staging = root.join("staging");
    // Объявляем переменную archive .
    let archive = root.join("pack.zip");
    // Объявляем переменную backup .
    let backup = root.join("backup/1");

    // Объявляем переменную marked .
    let marked = format!(
        // Выполняем операцию: "dns.google\n{}\nmy-own.example\n{}\n",.
        "dns.google\n{}\nmy-own.example\n{}\n",
        // Выполняем операцию: crate::constants::MARKER_START,.
        crate::constants::MARKER_START,
        // Выполняем операцию: crate::constants::MARKER_END.
        crate::constants::MARKER_END // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: write(&dir.join("lists/list-general.txt"), &marked);.
    write(&dir.join("lists/list-general.txt"), &marked);
    // Выполняем операцию: std::fs::create_dir_all(&backup).unwrap();.
    std::fs::create_dir_all(&backup).unwrap();

    // Выполняем операцию: build_zip(.
    build_zip(
        // Выполняем операцию: &archive,.
        &archive,
        // Выполняем операцию: &[(.
        &[(
            // Выполняем операцию: "pack-1.0/lists/list-general.txt",.
            "pack-1.0/lists/list-general.txt",
            // Выполняем операцию: "discord.com\nyoutube.com\n",.
            "discord.com\nyoutube.com\n",
            // Закрываем выражение или коллекцию.
        )],
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную report .
    let report = install_archive(&archive, &dir, &staging, "1.11.0", &backup).unwrap();

    // Выполняем операцию: assert_eq!(report.files, 1);.
    assert_eq!(report.files, 1);
    // Выполняем операцию: assert_eq!(report.preserved_entries, 1);.
    assert_eq!(report.preserved_entries, 1);

    // Объявляем переменную merged .
    let merged = std::fs::read_to_string(dir.join("lists/list-general.txt")).unwrap();

    // Выполняем операцию: assert!(merged.contains("discord.com"));.
    assert!(merged.contains("discord.com"));
    // Выполняем операцию: assert!(merged.contains("my-own.example"));.
    assert!(merged.contains("my-own.example"));
    // Выполняем операцию: assert!(merged.contains(crate::constants::MARKER_START).
    assert!(merged.contains(crate::constants::MARKER_START));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_archive_writes_manifest_of_installed_files.
fn test_install_archive_writes_manifest_of_installed_files() {
    // Объявляем переменную root .
    let root = temp_dir("zapret-install-manifest");
    // Объявляем переменную dir .
    let dir = root.join("strategies");
    // Объявляем переменную staging .
    let staging = root.join("staging");
    // Объявляем переменную archive .
    let archive = root.join("pack.zip");
    // Объявляем переменную backup .
    let backup = root.join("backup/1");

    // Выполняем операцию: std::fs::create_dir_all(&backup).unwrap();.
    std::fs::create_dir_all(&backup).unwrap();

    // Выполняем операцию: build_zip(.
    build_zip(
        // Выполняем операцию: &archive,.
        &archive,
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: ("pack-1.0/general.bat", "a"),.
            ("pack-1.0/general.bat", "a"),
            // Выполняем операцию: ("pack-1.0/bin/winws.exe", "b"),.
            ("pack-1.0/bin/winws.exe", "b"),
            // Выполняем операцию: ],.
        ],
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: install_archive(&archive, &dir, &staging, "1.11.0", &ba.
    install_archive(&archive, &dir, &staging, "1.11.0", &backup).unwrap();

    // Объявляем переменную manifest .
    let manifest = crate::commands::updater_manifest::read_manifest(&backup);

    // Выполняем операцию: assert!(manifest.contains(&"general.bat".to_string()));.
    assert!(manifest.contains(&"general.bat".to_string()));
    // Выполняем операцию: assert!(manifest.contains(&"bin/winws.exe".to_string()).
    assert!(manifest.contains(&"bin/winws.exe".to_string()));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_staging_dir_is_inside_temp.
fn test_staging_dir_is_inside_temp() {
    // Выполняем операцию: assert!(staging_dir().to_string_lossy().contains("zapre.
    assert!(staging_dir().to_string_lossy().contains("zapret-manager"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_install_report_defaults_are_empty.
fn test_install_report_defaults_are_empty() {
    // Объявляем переменную report .
    let report = InstallReport::default();

    // Выполняем операцию: assert_eq!(report.files, 0);.
    assert_eq!(report.files, 0);
    // Выполняем операцию: assert_eq!(report.preserved_entries, 0);.
    assert_eq!(report.preserved_entries, 0);
    // Выполняем операцию: assert!(!report.check_updates_disabled);.
    assert!(!report.check_updates_disabled);
    // Закрываем блок.
}
