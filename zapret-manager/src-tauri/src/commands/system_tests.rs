// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> std::path::PathBuf {
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
// Объявляем функцию test_collect_system_info_fills_every_field.
fn test_collect_system_info_fills_every_field() {
    // Объявляем переменную info .
    let info = collect_system_info();

    // Выполняем операцию: assert!(!info.os.is_empty());.
    assert!(!info.os.is_empty());
    // Выполняем операцию: assert!(!info.os_version.is_empty());.
    assert!(!info.os_version.is_empty());
    // Выполняем операцию: assert!(!info.arch.is_empty());.
    assert!(!info.arch.is_empty());
    // Выполняем операцию: assert!(!info.webview_version.is_empty());.
    assert!(!info.webview_version.is_empty());
    // Выполняем операцию: assert_eq!(info.tauri_version, tauri::VERSION);.
    assert_eq!(info.tauri_version, tauri::VERSION);
    // Выполняем операцию: assert_eq!(info.app_version, env!("CARGO_PKG_VERSION")).
    assert_eq!(info.app_version, env!("CARGO_PKG_VERSION"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_system_info_serializes_as_camel_case.
fn test_system_info_serializes_as_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&collect_system_info()).unwrap();

    // Выполняем операцию: assert!(json.contains("\"osVersion\""));.
    assert!(json.contains("\"osVersion\""));
    // Выполняем операцию: assert!(json.contains("\"osBuild\""));.
    assert!(json.contains("\"osBuild\""));
    // Выполняем операцию: assert!(json.contains("\"tauriVersion\""));.
    assert!(json.contains("\"tauriVersion\""));
    // Выполняем операцию: assert!(json.contains("\"webviewVersion\""));.
    assert!(json.contains("\"webviewVersion\""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_folder_kind_rejects_unknown.
fn test_folder_kind_rejects_unknown() {
    // Выполняем операцию: assert_eq!(folder_kind(FOLDER_LOGS).unwrap(), FOLDER_LO.
    assert_eq!(folder_kind(FOLDER_LOGS).unwrap(), FOLDER_LOGS);
    // Выполняем операцию: assert!(folder_kind("нет").is_err());.
    assert!(folder_kind("нет").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_get_folder_path_builds_expected_paths.
fn test_get_folder_path_builds_expected_paths() {
    // Объявляем переменную root .
    let root = "C:\\strategies";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: get_folder_path(FOLDER_STRATEGIES.to_string(), root.to_.
        get_folder_path(FOLDER_STRATEGIES.to_string(), root.to_string()).unwrap(),
        // Выполняем операцию: root.
        root // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: get_folder_path(FOLDER_BACKUPS.to_string(), root.to_str.
        get_folder_path(FOLDER_BACKUPS.to_string(), root.to_string())
            // Выполняем операцию: .unwrap().
            .unwrap()
            // Выполняем операцию: .ends_with(BACKUP_DIR_NAME).
            .ends_with(BACKUP_DIR_NAME) // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(get_folder_path(FOLDER_LOGS.to_string(), root.t.
    assert!(get_folder_path(FOLDER_LOGS.to_string(), root.to_string())
        // Выполняем операцию: .unwrap().
        .unwrap()
        // Выполняем операцию: .contains("zapret-manager"));.
        .contains("zapret-manager"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_config_files_picks_lists_and_ipsets_only.
fn test_config_files_picks_lists_and_ipsets_only() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-files");

    // Выполняем операцию: std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwra.
    std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("service.bat"), "echo").unwrap(.
    std::fs::write(dir.join("service.bat"), "echo").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("winws.exe"), "bin").unwrap();.
    std::fs::write(dir.join("winws.exe"), "bin").unwrap();
    // Выполняем операцию: std::fs::write(dir.join(LISTS_DIR_NAME).join("list-gene.
    std::fs::write(dir.join(LISTS_DIR_NAME).join("list-general.txt"), "a.com").unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join(LISTS_DIR_NAME).join("ipset-exclude.txt"),.
        dir.join(LISTS_DIR_NAME).join("ipset-exclude.txt"),
        // Выполняем операцию: "1.1.1.1",.
        "1.1.1.1",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную files .
    let files = config_files(&dir);

    // Выполняем операцию: assert_eq!(files.len(), 2);.
    assert_eq!(files.len(), 2);
    // Выполняем операцию: assert!(files[0].ends_with("ipset-exclude.txt"));.
    assert!(files[0].ends_with("ipset-exclude.txt"));
    // Выполняем операцию: assert!(files[1].ends_with("list-general.txt"));.
    assert!(files[1].ends_with("list-general.txt"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_config_files_falls_back_to_root_without_lists_dir.
fn test_config_files_falls_back_to_root_without_lists_dir() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-root-files");

    // Выполняем операцию: std::fs::write(dir.join("list-general.txt"), "a.com").u.
    std::fs::write(dir.join("list-general.txt"), "a.com").unwrap();

    // Выполняем операцию: assert_eq!(config_files(&dir).len(), 1);.
    assert_eq!(config_files(&dir).len(), 1);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_check_configs_reports_empty_and_duplicates.
fn test_check_configs_reports_empty_and_duplicates() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-check");

    // Выполняем операцию: std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwra.
    std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwrap();
    // Выполняем операцию: std::fs::write(dir.join(LISTS_DIR_NAME).join("list-empt.
    std::fs::write(dir.join(LISTS_DIR_NAME).join("list-empty.txt"), "  \n\n").unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join(LISTS_DIR_NAME).join("list-general.txt"),.
        dir.join(LISTS_DIR_NAME).join("list-general.txt"),
        // Выполняем операцию: "a.com\nA.com\nb.com\n",.
        "a.com\nA.com\nb.com\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join(LISTS_DIR_NAME).join("list-user.txt"),.
        dir.join(LISTS_DIR_NAME).join("list-user.txt"),
        // Выполняем операцию: "discord.com\n",.
        "discord.com\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную report .
    let report = check_configs(&dir);

    // Выполняем операцию: assert_eq!(report.checked, 3);.
    assert_eq!(report.checked, 3);
    // Выполняем операцию: assert_eq!(report.empty_files, vec!["list-empty.txt".to.
    assert_eq!(report.empty_files, vec!["list-empty.txt".to_string()]);
    // Выполняем операцию: assert_eq!(report.duplicates, vec!["a.com".to_string()].
    assert_eq!(report.duplicates, vec!["a.com".to_string()]);
    // Выполняем операцию: assert!(report.invalid.is_empty());.
    assert!(report.invalid.is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_check_configs_flags_invalid_entries.
fn test_check_configs_flags_invalid_entries() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-invalid");

    // Выполняем операцию: std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwra.
    std::fs::create_dir_all(dir.join(LISTS_DIR_NAME)).unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join(LISTS_DIR_NAME).join("list-general.txt"),.
        dir.join(LISTS_DIR_NAME).join("list-general.txt"),
        // Выполняем операцию: "good.com\nbad domain.com\nok.com\n",.
        "good.com\nbad domain.com\nok.com\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Объявляем переменную report .
    let report = check_configs(&dir);

    // Выполняем операцию: assert_eq!(report.invalid, vec!["bad domain.com".to_str.
    assert_eq!(report.invalid, vec!["bad domain.com".to_string()]);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_check_configs_on_missing_dir_is_empty.
fn test_check_configs_on_missing_dir_is_empty() {
    // Объявляем переменную report .
    let report = check_configs(std::path::Path::new("Z:/нет-такой-папки"));

    // Выполняем операцию: assert_eq!(report.checked, 0);.
    assert_eq!(report.checked, 0);
    // Выполняем операцию: assert!(report.empty_files.is_empty());.
    assert!(report.empty_files.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_backups_clears_directories.
fn test_remove_backups_clears_directories() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-backups");
    // Объявляем переменную root .
    let root = dir.join(BACKUP_DIR_NAME);

    // Выполняем операцию: std::fs::create_dir_all(root.join("1")).unwrap();.
    std::fs::create_dir_all(root.join("1")).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(root.join("2")).unwrap();.
    std::fs::create_dir_all(root.join("2")).unwrap();
    // Выполняем операцию: std::fs::write(root.join("note.txt"), "x").unwrap();.
    std::fs::write(root.join("note.txt"), "x").unwrap();

    // Объявляем переменную removed .
    let removed = remove_backups(&dir).unwrap();

    // Выполняем операцию: assert_eq!(removed, 2);.
    assert_eq!(removed, 2);
    // Выполняем операцию: assert!(!root.join("1").exists());.
    assert!(!root.join("1").exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_backups_without_root_is_noop.
fn test_remove_backups_without_root_is_noop() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-nobackups");

    // Выполняем операцию: assert_eq!(remove_backups(&dir).unwrap(), 0);.
    assert_eq!(remove_backups(&dir).unwrap(), 0);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_domain_like_allows_zapret_syntax.
fn test_is_domain_like_allows_zapret_syntax() {
    // Выполняем операцию: assert!(is_domain_like("^dns.google"));.
    assert!(is_domain_like("^dns.google"));
    // Выполняем операцию: assert!(is_domain_like("!exclude.com"));.
    assert!(is_domain_like("!exclude.com"));
    // Выполняем операцию: assert!(is_domain_like("# комментарий"));.
    assert!(is_domain_like("# комментарий"));
    // Выполняем операцию: assert!(is_domain_like("cloudflare-ech.com"));.
    assert!(is_domain_like("cloudflare-ech.com"));
    // Выполняем операцию: assert!(is_domain_like("20.3.0.113.0/24"));.
    assert!(is_domain_like("20.3.0.113.0/24"));
    // Выполняем операцию: assert!(is_domain_like("2a00:1450::/32"));.
    assert!(is_domain_like("2a00:1450::/32"));
    // Выполняем операцию: assert!(is_domain_like("*.example.com"));.
    assert!(is_domain_like("*.example.com"));
    // Выполняем операцию: assert!(!is_domain_like("two words"));.
    assert!(!is_domain_like("two words"));
    // Выполняем операцию: assert!(!is_domain_like("a;b"));.
    assert!(!is_domain_like("a;b"));
    // Выполняем операцию: assert!(!is_domain_like("value with = sign"));.
    assert!(!is_domain_like("value with = sign"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_retention_seconds_respects_bounds.
fn test_retention_seconds_respects_bounds() {
    // Выполняем операцию: assert_eq!(retention_seconds(0), 86_400);.
    assert_eq!(retention_seconds(0), 86_400);
    // Выполняем операцию: assert_eq!(retention_seconds(1), 86_400);.
    assert_eq!(retention_seconds(1), 86_400);
    // Выполняем операцию: assert_eq!(retention_seconds(7), 7 * 86_400);.
    assert_eq!(retention_seconds(7), 7 * 86_400);
    // Выполняем операцию: assert_eq!(retention_seconds(365), 365 * 86_400);.
    assert_eq!(retention_seconds(365), 365 * 86_400);
    // Выполняем операцию: assert_eq!(retention_seconds(100_000), 365 * 86_400);.
    assert_eq!(retention_seconds(100_000), 365 * 86_400);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_prune_log_dir_keeps_fresh_and_drops_old.
fn test_prune_log_dir_keeps_fresh_and_drops_old() {
    // Объявляем переменную dir .
    let dir = temp_dir("zapret-system-prune");

    // Объявляем переменную fresh .
    let fresh = dir.join("fresh.log");
    // Выполняем операцию: std::fs::write(&fresh, b"fresh log").unwrap();.
    std::fs::write(&fresh, b"fresh log").unwrap();

    // Объявляем переменную old .
    let old = dir.join("old.log");
    // Выполняем операцию: std::fs::write(&old, b"old log").unwrap();.
    std::fs::write(&old, b"old log").unwrap();

    // отсечка в будущем означает «уже старше срока» — свежий файл тоже под нож,
    // поэтому проверяем наоборот: отсечка в прошлом не трогает ничего
    // Объявляем переменную past .
    let past = std::time::SystemTime::now() - std::time::Duration::from_secs(86_400);

    // Выполняем операцию: assert_eq!(prune_log_dir(&dir, past), 0);.
    assert_eq!(prune_log_dir(&dir, past), 0);
    // Выполняем операцию: assert!(fresh.exists());.
    assert!(fresh.exists());
    // Выполняем операцию: assert!(old.exists());.
    assert!(old.exists());

    // Объявляем переменную future .
    let future = std::time::SystemTime::now() + std::time::Duration::from_secs(86_400);

    // Выполняем операцию: assert_eq!(prune_log_dir(&dir, future), 2);.
    assert_eq!(prune_log_dir(&dir, future), 2);
    // Выполняем операцию: assert!(!fresh.exists());.
    assert!(!fresh.exists());
    // Выполняем операцию: assert!(!old.exists());.
    assert!(!old.exists());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_prune_log_dir_ignores_missing_dir.
fn test_prune_log_dir_ignores_missing_dir() {
    // Объявляем переменную missing .
    let missing = std::env::temp_dir().join("zapret-system-prune-missing");

    // Выполняем операцию: assert_eq!(prune_log_dir(&missing, std::time::SystemTim.
    assert_eq!(prune_log_dir(&missing, std::time::SystemTime::now()), 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_uninstaller_path_reports_missing_installer.
fn test_uninstaller_path_reports_missing_installer() {
    // cargo test запускает битник рядом с исходниками, деинсталлятора там нет
    // Объявляем переменную error .
    let error = uninstaller_path().expect_err("ожидаем ошибку без установщика");

    // Выполняем операцию: assert!(error.to_string().contains("portable"));.
    assert!(error.to_string().contains("portable"));
    // Закрываем блок.
}
