//! Тесты команд инъекции списков (`injector.rs`).
//!
//! Модуль подключается из `injector.rs`, поэтому видит приватные
//! функции и проверяет полный цикл на временных файлах: инъекция →
//! повтор (дубликаты) → бэкапы → восстановление.

// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::constants::{MARKER_END, MARKER_START};.
use crate::constants::{MARKER_END, MARKER_START};

// Объявляем константу STRATEGY.
const STRATEGY: &str = "@echo off\r\nset \"LISTS=%~dp0lists\\\"\r\nstart winws.exe --hostlist=\"%LISTS%list-general.txt\" --ipset=\"%LISTS%ipset-all.txt\"\r\n";

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-injector-{name}-{}", std::process::id()));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(dir.join("lists")).expect("врем.
    std::fs::create_dir_all(dir.join("lists")).expect("временный каталог");
    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Объявляем функцию write_strategy.
fn write_strategy(dir: &Path) -> PathBuf {
    // Объявляем переменную bat .
    let bat = dir.join("strategy.bat");
    // Выполняем операцию: std::fs::write(&bat, STRATEGY).expect("стратегия");.
    std::fs::write(&bat, STRATEGY).expect("стратегия");
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join("lists").join("list-general.txt"),.
        dir.join("lists").join("list-general.txt"),
        // Выполняем операцию: "existing.com\r\n",.
        "existing.com\r\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .expect("список доменов");.
    .expect("список доменов");
    // Выполняем операцию: std::fs::write(dir.join("lists").join("ipset-all.txt"),.
    std::fs::write(dir.join("lists").join("ipset-all.txt"), "1.1.1.1\r\n").expect("ipset");
    // Выполняем операцию: bat.
    bat
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_bat_path_of_rejects_missing_file.
fn test_bat_path_of_rejects_missing_file() {
    // Объявляем переменную error .
    let error = bat_path_of(r"C:\nope\strategy.bat").expect_err("файла нет");

    // Выполняем операцию: assert!(error.to_string().contains("не найден"));.
    assert!(error.to_string().contains("не найден"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_bat_dir_of_returns_parent.
fn test_bat_dir_of_returns_parent() {
    // Объявляем переменную dir .
    let dir = bat_dir_of(Path::new(r"C:\zapret\strategy.bat"));

    // Выполняем операцию: assert_eq!(dir, PathBuf::from(r"C:\zapret"));.
    assert_eq!(dir, PathBuf::from(r"C:\zapret"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_valid_port_count_ignores_zero.
fn test_valid_port_count_ignores_zero() {
    // Выполняем операцию: assert_eq!(valid_port_count(&[0, 80, 443, 65535]), 3);.
    assert_eq!(valid_port_count(&[0, 80, 443, 65535]), 3);
    // Выполняем операцию: assert_eq!(valid_port_count(&[0]), 0);.
    assert_eq!(valid_port_count(&[0]), 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validated_bat_path_rejects_non_bat.
fn test_validated_bat_path_rejects_non_bat() {
    // Объявляем переменную dir .
    let dir = temp_dir("ext");
    // Объявляем переменную txt .
    let txt = dir.join("strategy.txt");
    // Выполняем операцию: std::fs::write(&txt, "x").expect("файл");.
    std::fs::write(&txt, "x").expect("файл");

    // Объявляем переменную error .
    let error = validated_bat_path(&txt.to_string_lossy()).expect_err("не .bat");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: error.to_string().contains("проверкой безопасности"),.
        error.to_string().contains("проверкой безопасности"),
        // Выполняем операцию: "неожиданная ошибка: {error}".
        "неожиданная ошибка: {error}" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_migrate_legacy_inject_cleans_only_txt.
fn test_migrate_legacy_inject_cleans_only_txt() {
    // Объявляем переменную dir .
    let dir = temp_dir("migrate");
    // Объявляем переменную lists .
    let lists = dir.join("lists");
    // Объявляем переменную injected .
    let injected = format!("existing.com\r\n{MARKER_START}\r\nold.com\r\n{MARKER_END}\r\n");

    // Выполняем операцию: std::fs::write(lists.join("list.txt"), &injected).expec.
    std::fs::write(lists.join("list.txt"), &injected).expect("txt");
    // Выполняем операцию: std::fs::write(lists.join("list.txt.bak"), &injected).e.
    std::fs::write(lists.join("list.txt.bak"), &injected).expect("bak");
    // Выполняем операцию: std::fs::write(lists.join("notes.md"), &injected).expec.
    std::fs::write(lists.join("notes.md"), &injected).expect("md");

    // Объявляем переменную cleaned .
    let cleaned = migrate_legacy_inject(&lists);

    // Выполняем операцию: assert_eq!(cleaned, 1, "чистится только .txt, не .bak и.
    assert_eq!(cleaned, 1, "чистится только .txt, не .bak и не .md");

    // Объявляем переменную txt .
    let txt = std::fs::read_to_string(lists.join("list.txt")).expect("txt");
    // Выполняем операцию: assert!(!txt.contains(MARKER_START));.
    assert!(!txt.contains(MARKER_START));
    // Выполняем операцию: assert!(std::fs::read_to_string(lists.join("list.txt.ba.
    assert!(std::fs::read_to_string(lists.join("list.txt.bak"))
        // Выполняем операцию: .expect("bak").
        .expect("bak")
        // Выполняем операцию: .contains(MARKER_START));.
        .contains(MARKER_START));
    // Выполняем операцию: assert!(std::fs::read_to_string(lists.join("notes.md")).
    assert!(std::fs::read_to_string(lists.join("notes.md"))
        // Выполняем операцию: .expect("md").
        .expect("md")
        // Выполняем операцию: .contains(MARKER_START));.
        .contains(MARKER_START));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_inject_outlast_full_cycle.
async fn test_inject_outlast_full_cycle() {
    // Объявляем переменную dir .
    let dir = temp_dir("cycle");
    // Объявляем переменную bat .
    let bat = write_strategy(&dir);
    // Объявляем переменную path .
    let path = bat.to_string_lossy().to_string();

    // Объявляем переменную report .
    let report = inject_outlast(
        // Выполняем операцию: path.clone(),.
        path.clone(),
        // Выполняем операцию: vec!["battleye.com".to_string()],.
        vec!["battleye.com".to_string()],
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: vec![80, 0],.
        vec![80, 0],
        // Выполняем операцию: true,.
        true,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect("инъекция");.
    .expect("инъекция");

    // Выполняем операцию: assert_eq!(report.domains_added, 1);.
    assert_eq!(report.domains_added, 1);
    // Выполняем операцию: assert_eq!(report.ports_accepted, 1);.
    assert_eq!(report.ports_accepted, 1);
    // Выполняем операцию: assert_eq!(report.files_modified.len(), 1);.
    assert_eq!(report.files_modified.len(), 1);
    // Выполняем операцию: assert!(!report.backups_created.is_empty(), "бэкап созд.
    assert!(!report.backups_created.is_empty(), "бэкап создан");

    // Объявляем переменную domain_list .
    let domain_list = dir.join("lists").join("list-general.txt");
    // Объявляем переменную content .
    let content = std::fs::read_to_string(&domain_list).expect("список");
    // Выполняем операцию: assert!(content.contains("battleye.com"));.
    assert!(content.contains("battleye.com"));
    // Выполняем операцию: assert!(content.contains(MARKER_START));.
    assert!(content.contains(MARKER_START));

    // Объявляем переменную backups .
    let backups = list_backups(path.clone()).await.expect("бэкапы");
    // Выполняем операцию: assert!(!backups.is_empty(), "список бэкапов не пуст");.
    assert!(!backups.is_empty(), "список бэкапов не пуст");

    // Повторная инъекция того же домена ничего не добавляет.
    // Объявляем переменную again .
    let again = inject_outlast(
        // Выполняем операцию: path.clone(),.
        path.clone(),
        // Выполняем операцию: vec!["battleye.com".to_string()],.
        vec!["battleye.com".to_string()],
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: false,.
        false,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect("повтор");.
    .expect("повтор");

    // Выполняем операцию: assert_eq!(again.skipped_duplicates, 1);.
    assert_eq!(again.skipped_duplicates, 1);
    // Выполняем операцию: assert!(again.domains_added == 0);.
    assert!(again.domains_added == 0);
    // Выполняем операцию: assert!(again.files_modified.is_empty());.
    assert!(again.files_modified.is_empty());

    // Восстановление убирает секцию маркера, бэкап остаётся на диске.
    // Объявляем переменную cleaned .
    let cleaned = restore_backup(path).await.expect("восстановление");

    // Выполняем операцию: assert_eq!(cleaned, 1);.
    assert_eq!(cleaned, 1);

    // Объявляем переменную restored .
    let restored = std::fs::read_to_string(&domain_list).expect("список");
    // Выполняем операцию: assert!(!restored.contains(MARKER_START));.
    assert!(!restored.contains(MARKER_START));
    // Выполняем операцию: assert!(restored.contains("existing.com"));.
    assert!(restored.contains("existing.com"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_inject_outlast_rejects_invalid_domain.
async fn test_inject_outlast_rejects_invalid_domain() {
    // Объявляем переменную dir .
    let dir = temp_dir("invalid");
    // Объявляем переменную bat .
    let bat = write_strategy(&dir);

    // Объявляем переменную error .
    let error = inject_outlast(
        // Выполняем операцию: bat.to_string_lossy().to_string(),.
        bat.to_string_lossy().to_string(),
        // Выполняем операцию: vec!["not_a_domain!!".to_string()],.
        vec!["not_a_domain!!".to_string()],
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: false,.
        false,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect_err("домен невалиден");.
    .expect_err("домен невалиден");

    // Выполняем операцию: assert!(!error.to_string().is_empty());.
    assert!(!error.to_string().is_empty());

    // Объявляем переменную content .
    let content =
        // Выполняем операцию: std::fs::read_to_string(dir.join("lists").join("list-ge.
        std::fs::read_to_string(dir.join("lists").join("list-general.txt")).expect("список");
    // Выполняем операцию: assert!(!content.contains("not_a_domain"));.
    assert!(!content.contains("not_a_domain"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_inject_outlast_requires_targets.
async fn test_inject_outlast_requires_targets() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-injector-empty-{}", std::process::id()));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).expect("каталог");.
    std::fs::create_dir_all(&dir).expect("каталог");

    // Объявляем переменную bat .
    let bat = dir.join("strategy.bat");
    // Выполняем операцию: std::fs::write(&bat, "@echo off\r\nwinws.exe --dpi-desy.
    std::fs::write(&bat, "@echo off\r\nwinws.exe --dpi-desync=fake\r\n").expect("стратегия");

    // Объявляем переменную error .
    let error = inject_outlast(
        // Выполняем операцию: bat.to_string_lossy().to_string(),.
        bat.to_string_lossy().to_string(),
        // Выполняем операцию: vec!["example.com".to_string()],.
        vec!["example.com".to_string()],
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: false,.
        false,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect_err("списков нет");.
    .expect_err("списков нет");

    // Выполняем операцию: assert!(error.to_string().contains("не найдено"));.
    assert!(error.to_string().contains("не найдено"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_inject_outlast_limits_entries.
async fn test_inject_outlast_limits_entries() {
    // Объявляем переменную dir .
    let dir = temp_dir("limit");
    // Объявляем переменную bat .
    let bat = write_strategy(&dir);
    // Объявляем переменную domains.
    let domains: Vec<String> = (0..=MAX_INJECTED_ENTRIES)
        // Выполняем операцию: .map(|index| format!("host{index}.example.com")).
        .map(|index| format!("host{index}.example.com"))
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную error .
    let error = inject_outlast(
        // Выполняем операцию: bat.to_string_lossy().to_string(),.
        bat.to_string_lossy().to_string(),
        // Выполняем операцию: domains,.
        domains,
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: Vec::new(),.
        Vec::new(),
        // Выполняем операцию: false,.
        false,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect_err("превышен лимит");.
    .expect_err("превышен лимит");

    // Выполняем операцию: assert!(error.to_string().contains("Слишком много"));.
    assert!(error.to_string().contains("Слишком много"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}
