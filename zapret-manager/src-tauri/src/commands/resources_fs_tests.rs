use super::*;

fn fixture(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(name);
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    dir
}

#[test]
fn test_ensure_app_dirs_creates_all_subfolders() {
    let dir = fixture("zapret-resfs-dirs");

    ensure_app_dirs(&dir).unwrap();

    for sub in APP_SUBDIRS {
        assert!(dir.join(sub).is_dir(), "нет папки {sub}");
    }

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_ensure_app_dirs_is_idempotent() {
    let dir = fixture("zapret-resfs-dirs-twice");

    ensure_app_dirs(&dir).unwrap();
    ensure_app_dirs(&dir).unwrap();

    assert!(dir.join(STRATEGIES_SUBDIR).is_dir());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_collect_files_flattens_nested_structure() {
    let dir = fixture("zapret-resfs-collect");
    let src = dir.join("src");
    std::fs::create_dir_all(src.join("bin")).unwrap();
    std::fs::create_dir_all(src.join("lists")).unwrap();

    std::fs::write(src.join("service.bat"), b"bat").unwrap();
    std::fs::write(src.join("bin").join("winws.exe"), b"win").unwrap();
    std::fs::write(src.join("lists").join("list-general.txt"), b"list").unwrap();

    let dst = dir.join("dst");
    let entries = collect_files(&src, &dst).unwrap();

    assert_eq!(entries.len(), 3);
    assert!(entries.iter().any(|entry| entry.target.ends_with("service.bat")));
    assert!(entries.iter().any(|entry| entry.target.ends_with("winws.exe")));
    assert_eq!(total_bytes(&entries), 3 + 3 + 4);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_collect_files_on_missing_source_is_empty() {
    let dir = fixture("zapret-resfs-collect-empty");

    let entries = collect_files(&dir.join("nope"), &dir.join("dst")).unwrap();

    assert!(entries.is_empty());

    let _ = std::fs::remove_dir_all(&dir);
}

#[tokio::test]
async fn test_copy_entries_reports_progress_to_hundred() {
    let dir = fixture("zapret-resfs-copy");
    let src = dir.join("src");
    std::fs::create_dir_all(&src).unwrap();

    for index in 0..4 {
        std::fs::write(src.join(format!("f{index}.txt")), b"data").unwrap();
    }

    let dst = dir.join("dst");
    let entries = collect_files(&src, &dst).unwrap();
    let mut last = 0u8;
    let mut calls = 0;

    let copied = copy_entries(&entries, STAGE_ZAPRET, &mut |percent, name| {
        assert!(percent <= 100);
        assert!(!name.is_empty());
        assert!(percent >= last, "прогресс убывает: {last} → {percent}");
        last = percent;
        calls += 1;
    })
    .await
    .unwrap();

    assert_eq!(copied, 16);
    assert_eq!(last, 100);
    assert!(calls >= 1);
    assert!(dst.join("f0.txt").is_file());

    let _ = std::fs::remove_dir_all(&dir);
}

#[tokio::test]
async fn test_copy_entries_on_empty_list_finishes_immediately() {
    let dir = fixture("zapret-resfs-copy-empty");

    let mut seen = 0u8;
    let copied = copy_entries(&[], STAGE_ZAPRET, &mut |percent, _| seen = percent)
        .await
        .unwrap();

    assert_eq!(copied, 0);
    assert_eq!(seen, 100);

    let _ = std::fs::remove_dir_all(&dir);
}

#[tokio::test]
async fn test_copy_entries_creates_nested_targets() {
    let dir = fixture("zapret-resfs-copy-nested");
    let src = dir.join("src");
    std::fs::create_dir_all(&src).unwrap();
    std::fs::write(src.join("a.txt"), b"x").unwrap();

    let dst = dir.join("dst");
    let entries = collect_files(&src, &dst.join("bin")).unwrap();

    copy_entries(&entries, STAGE_ZAPRET, &mut |_, _| {}).await.unwrap();

    assert!(dst.join("bin").join("a.txt").is_file());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_count_strategies_counts_bat_only() {
    let dir = fixture("zapret-resfs-count");

    std::fs::write(dir.join("general-00-baseline.bat"), b"a").unwrap();
    std::fs::write(dir.join("my_custom.bat"), b"a").unwrap();
    std::fs::write(dir.join("readme.txt"), b"a").unwrap();

    assert_eq!(count_strategies(&dir), 2);
    assert_eq!(count_strategies(&dir.join("missing")), 0);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_list_bundled_bats_is_sorted_and_only_bat() {
    let dir = fixture("zapret-resfs-list");
    std::fs::create_dir_all(dir.join(ZAPRET_SUBDIR)).unwrap();
    let zapret = dir.join(ZAPRET_SUBDIR);

    std::fs::write(zapret.join("general-10-alt.bat"), b"a").unwrap();
    std::fs::write(zapret.join("general-02-alt.bat"), b"a").unwrap();
    std::fs::write(zapret.join("service.bat"), b"a").unwrap();
    std::fs::write(zapret.join("README.md"), b"a").unwrap();

    let names = list_bundled_bats(&dir);

    assert_eq!(
        names,
        vec![
            "general-02-alt.bat".to_string(),
            "general-10-alt.bat".to_string(),
            "service.bat".to_string(),
        ]
    );

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_list_bundled_bats_on_missing_dir_is_empty() {
    let dir = fixture("zapret-resfs-list-missing");

    assert!(list_bundled_bats(&dir).is_empty());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_strategies_dir_points_inside_app_dir() {
    let path = strategies_dir(Path::new("app"));

    assert!(path.ends_with(STRATEGIES_SUBDIR));
}

#[test]
fn test_stage_constants_match_spec() {
    assert_eq!(STAGE_ZAPRET, "copying-zapret");
    assert_eq!(STAGE_STRATEGIES, "copying-strategies");
    assert_eq!(STAGE_FINALIZING, "finalizing");
    assert_eq!(PROGRESS_THROTTLE_MS, 100);
    assert_eq!(EVENT_PROGRESS, "resource-extract-progress");
}

#[test]
fn test_init_progress_serializes_camel_case() {
    let progress = InitProgress {
        stage: STAGE_ZAPRET.to_string(),
        percent: 45,
        current_file: "winws.exe".to_string(),
    };

    let value = serde_json::to_string(&progress).unwrap_or_default();

    assert!(value.contains("\"currentFile\""));
    assert!(!value.contains("current_file"));
}
#[test]
fn test_resource_roots_prefers_resource_dir() {
    let roots = build_resource_roots(
        Some(PathBuf::from(r"C:\\app\\resources")),
        Some(PathBuf::from(r"C:\\app\\zapret-manager.exe")),
        false,
    );

    assert_eq!(roots[0], PathBuf::from(r"C:\\app\\resources\\resources"));
    assert_eq!(roots[1], PathBuf::from(r"C:\\app\\resources"));
    assert_eq!(roots[2], PathBuf::from(r"C:\\app\\resources"));
}

#[test]
fn test_resource_roots_release_has_no_manifest_dir() {
    let roots = build_resource_roots(
        Some(PathBuf::from(r"C:\\app\\resources")),
        Some(PathBuf::from(r"C:\\app\\zapret-manager.exe")),
        false,
    );

    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(RESOURCES_DIR);

    assert!(
        !roots.contains(&manifest),
        "release build must not look into the build machine directory"
    );
}

#[test]
fn test_resource_roots_debug_includes_manifest_dir() {
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(RESOURCES_DIR);
    let roots = build_resource_roots(None, None, true);

    assert!(roots.contains(&manifest));
}

#[test]
fn test_resource_roots_survive_missing_paths() {
    let roots = build_resource_roots(None, None, false);

    assert!(roots.is_empty());
}