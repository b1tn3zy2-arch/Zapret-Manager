// Подключаем модули: super::*;.
use super::*;

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

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_ensure_app_dirs_creates_all_subfolders.
fn test_ensure_app_dirs_creates_all_subfolders() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-dirs");

    // Выполняем операцию: ensure_app_dirs(&dir).unwrap();.
    ensure_app_dirs(&dir).unwrap();

    // Перебираем элементы коллекции.
    for sub in APP_SUBDIRS {
        // Выполняем операцию: assert!(dir.join(sub).is_dir(), "нет папки {sub}");.
        assert!(dir.join(sub).is_dir(), "нет папки {sub}");
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_ensure_app_dirs_is_idempotent.
fn test_ensure_app_dirs_is_idempotent() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-dirs-twice");

    // Выполняем операцию: ensure_app_dirs(&dir).unwrap();.
    ensure_app_dirs(&dir).unwrap();
    // Выполняем операцию: ensure_app_dirs(&dir).unwrap();.
    ensure_app_dirs(&dir).unwrap();

    // Выполняем операцию: assert!(dir.join(STRATEGIES_SUBDIR).is_dir());.
    assert!(dir.join(STRATEGIES_SUBDIR).is_dir());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_files_flattens_nested_structure.
fn test_collect_files_flattens_nested_structure() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-collect");
    // Объявляем переменную src .
    let src = dir.join("src");
    // Выполняем операцию: std::fs::create_dir_all(src.join("bin")).unwrap();.
    std::fs::create_dir_all(src.join("bin")).unwrap();
    // Выполняем операцию: std::fs::create_dir_all(src.join("lists")).unwrap();.
    std::fs::create_dir_all(src.join("lists")).unwrap();

    // Выполняем операцию: std::fs::write(src.join("service.bat"), b"bat").unwrap(.
    std::fs::write(src.join("service.bat"), b"bat").unwrap();
    // Выполняем операцию: std::fs::write(src.join("bin").join("winws.exe"), b"win.
    std::fs::write(src.join("bin").join("winws.exe"), b"win").unwrap();
    // Выполняем операцию: std::fs::write(src.join("lists").join("list-general.txt.
    std::fs::write(src.join("lists").join("list-general.txt"), b"list").unwrap();

    // Объявляем переменную dst .
    let dst = dir.join("dst");
    // Объявляем переменную entries .
    let entries = collect_files(&src, &dst).unwrap();

    // Выполняем операцию: assert_eq!(entries.len(), 3);.
    assert_eq!(entries.len(), 3);
    // Выполняем операцию: assert!(entries.
    assert!(entries
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|entry| entry.target.ends_with("service.bat")));.
        .any(|entry| entry.target.ends_with("service.bat")));
    // Выполняем операцию: assert!(entries.
    assert!(entries
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|entry| entry.target.ends_with("winws.exe")));.
        .any(|entry| entry.target.ends_with("winws.exe")));
    // Выполняем операцию: assert_eq!(total_bytes(&entries), 3 + 3 + 4);.
    assert_eq!(total_bytes(&entries), 3 + 3 + 4);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_files_on_missing_source_is_empty.
fn test_collect_files_on_missing_source_is_empty() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-collect-empty");

    // Объявляем переменную entries .
    let entries = collect_files(&dir.join("nope"), &dir.join("dst")).unwrap();

    // Выполняем операцию: assert!(entries.is_empty());.
    assert!(entries.is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_copy_entries_reports_progress_to_hundred.
async fn test_copy_entries_reports_progress_to_hundred() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-copy");
    // Объявляем переменную src .
    let src = dir.join("src");
    // Выполняем операцию: std::fs::create_dir_all(&src).unwrap();.
    std::fs::create_dir_all(&src).unwrap();

    // Перебираем элементы коллекции.
    for index in 0..4 {
        // Выполняем операцию: std::fs::write(src.join(format!("f{index}.txt")), b"dat.
        std::fs::write(src.join(format!("f{index}.txt")), b"data").unwrap();
        // Закрываем блок.
    }

    // Объявляем переменную dst .
    let dst = dir.join("dst");
    // Объявляем переменную entries .
    let entries = collect_files(&src, &dst).unwrap();
    // Объявляем переменную last .
    let mut last = 0u8;
    // Объявляем переменную calls .
    let mut calls = 0;

    // Объявляем переменную copied .
    let copied = copy_entries(&entries, STAGE_ZAPRET, &mut |percent, name| {
        // Выполняем операцию: assert!(percent <= 100);.
        assert!(percent <= 100);
        // Выполняем операцию: assert!(!name.is_empty());.
        assert!(!name.is_empty());
        // Выполняем операцию: assert!(percent >= last, "прогресс убывает: {last} → {p.
        assert!(percent >= last, "прогресс убывает: {last} → {percent}");
        // Выполняем операцию: last = percent;.
        last = percent;
        // Выполняем операцию: calls += 1;.
        calls += 1;
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert_eq!(copied, 16);.
    assert_eq!(copied, 16);
    // Выполняем операцию: assert_eq!(last, 100);.
    assert_eq!(last, 100);
    // Выполняем операцию: assert!(calls >= 1);.
    assert!(calls >= 1);
    // Выполняем операцию: assert!(dst.join("f0.txt").is_file());.
    assert!(dst.join("f0.txt").is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_copy_entries_on_empty_list_finishes_immediately.
async fn test_copy_entries_on_empty_list_finishes_immediately() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-copy-empty");

    // Объявляем переменную seen .
    let mut seen = 0u8;
    // Объявляем переменную copied .
    let copied = copy_entries(&[], STAGE_ZAPRET, &mut |percent, _| seen = percent)
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .unwrap();.
        .unwrap();

    // Выполняем операцию: assert_eq!(copied, 0);.
    assert_eq!(copied, 0);
    // Выполняем операцию: assert_eq!(seen, 100);.
    assert_eq!(seen, 100);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_copy_entries_creates_nested_targets.
async fn test_copy_entries_creates_nested_targets() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-copy-nested");
    // Объявляем переменную src .
    let src = dir.join("src");
    // Выполняем операцию: std::fs::create_dir_all(&src).unwrap();.
    std::fs::create_dir_all(&src).unwrap();
    // Выполняем операцию: std::fs::write(src.join("a.txt"), b"x").unwrap();.
    std::fs::write(src.join("a.txt"), b"x").unwrap();

    // Объявляем переменную dst .
    let dst = dir.join("dst");
    // Объявляем переменную entries .
    let entries = collect_files(&src, &dst.join("bin")).unwrap();

    // Выполняем операцию: copy_entries(&entries, STAGE_ZAPRET, &mut |_, _| {}).
    copy_entries(&entries, STAGE_ZAPRET, &mut |_, _| {})
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .unwrap();.
        .unwrap();

    // Выполняем операцию: assert!(dst.join("bin").join("a.txt").is_file());.
    assert!(dst.join("bin").join("a.txt").is_file());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_count_strategies_counts_bat_only.
fn test_count_strategies_counts_bat_only() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-count");

    // Выполняем операцию: std::fs::write(dir.join("general-00-baseline.bat"), b"a.
    std::fs::write(dir.join("general-00-baseline.bat"), b"a").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("my_custom.bat"), b"a").unwrap(.
    std::fs::write(dir.join("my_custom.bat"), b"a").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("service.bat"), b"a").unwrap();.
    std::fs::write(dir.join("service.bat"), b"a").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("readme.txt"), b"a").unwrap();.
    std::fs::write(dir.join("readme.txt"), b"a").unwrap();

    // Выполняем операцию: assert_eq!(count_strategies(&dir), 2);.
    assert_eq!(count_strategies(&dir), 2);
    // Выполняем операцию: assert_eq!(count_strategies(&dir.join("missing")), 0);.
    assert_eq!(count_strategies(&dir.join("missing")), 0);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_list_bundled_bats_is_sorted_and_only_bat.
fn test_list_bundled_bats_is_sorted_and_only_bat() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-list");
    // Выполняем операцию: std::fs::create_dir_all(dir.join(ZAPRET_SUBDIR)).unwrap.
    std::fs::create_dir_all(dir.join(ZAPRET_SUBDIR)).unwrap();
    // Объявляем переменную zapret .
    let zapret = dir.join(ZAPRET_SUBDIR);

    // Выполняем операцию: std::fs::write(zapret.join("general-10-alt.bat"), b"a").
    std::fs::write(zapret.join("general-10-alt.bat"), b"a").unwrap();
    // Выполняем операцию: std::fs::write(zapret.join("general-02-alt.bat"), b"a").
    std::fs::write(zapret.join("general-02-alt.bat"), b"a").unwrap();
    // Выполняем операцию: std::fs::write(zapret.join("service.bat"), b"a").unwrap.
    std::fs::write(zapret.join("service.bat"), b"a").unwrap();
    // Выполняем операцию: std::fs::write(zapret.join("README.md"), b"a").unwrap().
    std::fs::write(zapret.join("README.md"), b"a").unwrap();

    // Объявляем переменную names .
    let names = list_bundled_bats(&dir);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: names,.
        names,
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "general-02-alt.bat".to_string(),.
            "general-02-alt.bat".to_string(),
            // Выполняем операцию: "general-10-alt.bat".to_string(),.
            "general-10-alt.bat".to_string(),
            // Выполняем операцию: "service.bat".to_string(),.
            "service.bat".to_string(),
            // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_list_bundled_bats_on_missing_dir_is_empty.
fn test_list_bundled_bats_on_missing_dir_is_empty() {
    // Объявляем переменную dir .
    let dir = fixture("zapret-resfs-list-missing");

    // Выполняем операцию: assert!(list_bundled_bats(&dir).is_empty());.
    assert!(list_bundled_bats(&dir).is_empty());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strategies_dir_points_inside_app_dir.
fn test_strategies_dir_points_inside_app_dir() {
    // Объявляем переменную path .
    let path = strategies_dir(Path::new("app"));

    // Выполняем операцию: assert!(path.ends_with(STRATEGIES_SUBDIR));.
    assert!(path.ends_with(STRATEGIES_SUBDIR));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_stage_constants_match_spec.
fn test_stage_constants_match_spec() {
    // Выполняем операцию: assert_eq!(STAGE_ZAPRET, "copying-zapret");.
    assert_eq!(STAGE_ZAPRET, "copying-zapret");
    // Выполняем операцию: assert_eq!(STAGE_STRATEGIES, "copying-strategies");.
    assert_eq!(STAGE_STRATEGIES, "copying-strategies");
    // Выполняем операцию: assert_eq!(STAGE_VPN, "copying-vpn");.
    assert_eq!(STAGE_VPN, "copying-vpn");
    // Выполняем операцию: assert_eq!(STAGE_FINALIZING, "finalizing");.
    assert_eq!(STAGE_FINALIZING, "finalizing");
    // Выполняем операцию: assert_eq!(PROGRESS_THROTTLE_MS, 100);.
    assert_eq!(PROGRESS_THROTTLE_MS, 100);
    // Выполняем операцию: assert_eq!(EVENT_PROGRESS, "resource-extract-progress").
    assert_eq!(EVENT_PROGRESS, "resource-extract-progress");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_init_progress_serializes_camel_case.
fn test_init_progress_serializes_camel_case() {
    // Объявляем переменную progress .
    let progress = InitProgress {
        // Выполняем операцию: stage: STAGE_ZAPRET.to_string(),.
        stage: STAGE_ZAPRET.to_string(),
        // Выполняем операцию: percent: 45,.
        percent: 45,
        // Выполняем операцию: current_file: "winws.exe".to_string(),.
        current_file: "winws.exe".to_string(),
        // Закрываем блок.
    };

    // Объявляем переменную value .
    let value = serde_json::to_string(&progress).unwrap_or_default();

    // Выполняем операцию: assert!(value.contains("\"currentFile\""));.
    assert!(value.contains("\"currentFile\""));
    // Выполняем операцию: assert!(!value.contains("current_file"));.
    assert!(!value.contains("current_file"));
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resource_roots_prefers_resource_dir.
fn test_resource_roots_prefers_resource_dir() {
    // Объявляем переменную roots .
    let roots = build_resource_roots(
        // Выполняем операцию: Some(PathBuf::from(r"C:\\app\\resources")),.
        Some(PathBuf::from(r"C:\\app\\resources")),
        // Выполняем операцию: Some(PathBuf::from(r"C:\\app\\zapret-manager.exe")),.
        Some(PathBuf::from(r"C:\\app\\zapret-manager.exe")),
        // Выполняем операцию: false,.
        false,
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert_eq!(roots[0], PathBuf::from(r"C:\\app\\resources.
    assert_eq!(roots[0], PathBuf::from(r"C:\\app\\resources\\resources"));
    // Выполняем операцию: assert_eq!(roots[1], PathBuf::from(r"C:\\app\\resources.
    assert_eq!(roots[1], PathBuf::from(r"C:\\app\\resources"));
    // Выполняем операцию: assert_eq!(roots[2], PathBuf::from(r"C:\\app\\resources.
    assert_eq!(roots[2], PathBuf::from(r"C:\\app\\resources"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resource_roots_release_has_no_manifest_dir.
fn test_resource_roots_release_has_no_manifest_dir() {
    // Объявляем переменную roots .
    let roots = build_resource_roots(
        // Выполняем операцию: Some(PathBuf::from(r"C:\\app\\resources")),.
        Some(PathBuf::from(r"C:\\app\\resources")),
        // Выполняем операцию: Some(PathBuf::from(r"C:\\app\\zapret-manager.exe")),.
        Some(PathBuf::from(r"C:\\app\\zapret-manager.exe")),
        // Выполняем операцию: false,.
        false,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную manifest .
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(RESOURCES_DIR);

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: !roots.contains(&manifest),.
        !roots.contains(&manifest),
        // Выполняем операцию: "release build must not look into the build machine dir.
        "release build must not look into the build machine directory" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resource_roots_debug_includes_manifest_dir.
fn test_resource_roots_debug_includes_manifest_dir() {
    // Объявляем переменную manifest .
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(RESOURCES_DIR);
    // Объявляем переменную roots .
    let roots = build_resource_roots(None, None, true);

    // Выполняем операцию: assert!(roots.contains(&manifest));.
    assert!(roots.contains(&manifest));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resource_roots_survive_missing_paths.
fn test_resource_roots_survive_missing_paths() {
    // Объявляем переменную roots .
    let roots = build_resource_roots(None, None, false);

    // Выполняем операцию: assert!(roots.is_empty());.
    assert!(roots.is_empty());
    // Закрываем блок.
}
