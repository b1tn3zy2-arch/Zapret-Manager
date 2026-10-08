use super::*;

fn temp_dir(name: &str) -> std::path::PathBuf {
    let path = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&path);
    std::fs::create_dir_all(&path).unwrap();

    path
}

#[test]
fn test_collect_system_info_fills_every_field() {
    let info = collect_system_info();

    assert!(!info.os.is_empty());
    assert!(!info.os_version.is_empty());
    assert!(!info.arch.is_empty());
    assert!(!info.webview_version.is_empty());
    assert_eq!(info.tauri_version, tauri::VERSION);
    assert_eq!(info.app_version, env!("CARGO_PKG_VERSION"));
}

#[test]
fn test_system_info_serializes_as_camel_case() {
    let json = serde_json::to_string(&collect_system_info()).unwrap();

    assert!(json.contains("\"osVersion\""));
    assert!(json.contains("\"osBuild\""));
    assert!(json.contains("\"tauriVersion\""));
    assert!(json.contains("\"webviewVersion\""));
}

#[test]
fn test_folder_kind_rejects_unknown() {
    assert_eq!(folder_kind(FOLDER_LOGS).unwrap(), FOLDER_LOGS);
    assert!(folder_kind("нет").is_err());
}

#[test]
fn test_get_folder_path_builds_expected_paths() {
    let root = "C:\\strategies";

    assert_eq!(
        get_folder_path(FOLDER_STRATEGIES.to_string(), root.to_string()).unwrap(),
        root
    );
    assert!(get_folder_path(FOLDER_BACKUPS.to_string(), root.to_string())
        .unwrap()
        .ends_with(BACKUP_DIR_NAME));
    assert!(get_folder_path(FOLDER_LOGS.to_string(), root.to_string())
        .unwrap()
        .contains("zapret-manager"));
}

#[test]
fn test_config_files_picks_lists_and_ipsets_only() {
    let dir = temp_dir("zapret-system-files");

    std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwrap();
    std::fs::write(dir.join("service.bat"), "echo").unwrap();
    std::fs::write(dir.join("winws.exe"), "bin").unwrap();
    std::fs::write(dir.join(LISTS_DIR_NAME).join("list-general.txt"), "a.com").unwrap();
    std::fs::write(
        dir.join(LISTS_DIR_NAME).join("ipset-exclude.txt"),
        "1.1.1.1",
    )
    .unwrap();

    let files = config_files(&dir);

    assert_eq!(files.len(), 2);
    assert!(files[0].ends_with("ipset-exclude.txt"));
    assert!(files[1].ends_with("list-general.txt"));

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_config_files_falls_back_to_root_without_lists_dir() {
    let dir = temp_dir("zapret-system-root-files");

    std::fs::write(dir.join("list-general.txt"), "a.com").unwrap();

    assert_eq!(config_files(&dir).len(), 1);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_check_configs_reports_empty_and_duplicates() {
    let dir = temp_dir("zapret-system-check");

    std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwrap();
    std::fs::write(
        dir.join(LISTS_DIR_NAME).join("list-empty.txt"),
        "  \n\n",
    )
    .unwrap();
    std::fs::write(
        dir.join(LISTS_DIR_NAME).join("list-general.txt"),
        "a.com\nA.com\nb.com\n",
    )
    .unwrap();
    std::fs::write(
        dir.join(LISTS_DIR_NAME).join("list-user.txt"),
        "discord.com\n",
    )
    .unwrap();

    let report = check_configs(&dir);

    assert_eq!(report.checked, 3);
    assert_eq!(report.empty_files, vec!["list-empty.txt".to_string()]);
    assert_eq!(report.duplicates, vec!["a.com".to_string()]);
    assert!(report.invalid.is_empty());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_check_configs_flags_invalid_entries() {
    let dir = temp_dir("zapret-system-invalid");

    std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwrap();
    std::fs::write(
        dir.join(LISTS_DIR_NAME).join("list-general.txt"),
        "good.com\nbad domain.com\nok.com\n",
    )
    .unwrap();

    let report = check_configs(&dir);

    assert_eq!(report.invalid, vec!["bad domain.com".to_string()]);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_check_configs_on_missing_dir_is_empty() {
    let report = check_configs(std::path::Path::new("Z:/нет-такой-папки"));

    assert_eq!(report.checked, 0);
    assert!(report.empty_files.is_empty());
}

#[test]
fn test_remove_backups_clears_directories() {
    let dir = temp_dir("zapret-system-backups");
    let root = dir.join(BACKUP_DIR_NAME);

    std::fs::create_dir_all(root.join("1")).unwrap();
    std::fs::create_dir_all(root.join("2")).unwrap();
    std::fs::write(root.join("note.txt"), "x").unwrap();

    let removed = remove_backups(&dir).unwrap();

    assert_eq!(removed, 2);
    assert!(!root.join("1").exists());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_remove_backups_without_root_is_noop() {
    let dir = temp_dir("zapret-system-nobackups");

    assert_eq!(remove_backups(&dir).unwrap(), 0);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_is_domain_like_allows_zapret_syntax() {
    assert!(is_domain_like("^dns.google"));
    assert!(is_domain_like("!exclude.com"));
    assert!(is_domain_like("# комментарий"));
    assert!(is_domain_like("cloudflare-ech.com"));
    assert!(is_domain_like("20.3.0.113.0/24"));
    assert!(is_domain_like("2a00:1450::/32"));
    assert!(is_domain_like("*.example.com"));
    assert!(!is_domain_like("two words"));
    assert!(!is_domain_like("a;b"));
    assert!(!is_domain_like("value with = sign"));
}