use std::fs;
use std::path::PathBuf;

fn resources_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/zapret")
}

#[test]
fn test_bundled_strategy_names_are_unique() {
    let dir = resources_dir();
    let mut entries: Vec<String> = fs::read_dir(&dir)
        .expect("ресурсы zapret доступны")
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        .filter(|name| name.to_ascii_lowercase().ends_with(".bat"))
        .filter(|name| !name.eq_ignore_ascii_case("service.bat"))
        .collect();

    assert!(
        entries.len() >= 20,
        "ожидалось не меньше 20 стратегий, найдено {}",
        entries.len()
    );

    entries.sort();

    let mut seen: Vec<String> = Vec::new();
    let mut duplicates: Vec<(String, String)> = Vec::new();

    let mut scanned: Vec<crate::commands::scanner::StrategyInfo> = entries
        .iter()
        .map(|filename| {
            let content = fs::read_to_string(dir.join(filename)).expect("файл читается");

            super::analyze(
                PathBuf::from(filename),
                filename.clone(),
                content,
                0,
                None,
            )
        })
        .collect();

    super::deduplicate_names(&mut scanned);

    for info in &scanned {
        let previous = seen.iter().find(|value| **value == info.name);

        if let Some(previous) = previous {
            duplicates.push((previous.clone(), info.name.clone()));
        }

        seen.push(info.name.clone());
    }

    assert!(
        duplicates.is_empty(),
        "имена стратегий повторяются: {duplicates:?}"
    );
}

#[test]
fn test_bundled_strategies_have_varied_techniques() {
    let dir = resources_dir();
    let mut signatures: Vec<String> = fs::read_dir(&dir)
        .expect("ресурсы zapret доступны")
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        .filter(|name| name.to_ascii_lowercase().ends_with(".bat"))
        .filter(|name| !name.eq_ignore_ascii_case("service.bat"))
        .filter_map(|filename| {
            let content = fs::read_to_string(dir.join(&filename)).ok()?;
            let mut techniques = super::extract_techniques(&content);
            techniques.sort();
            Some(techniques.join("+"))
        })
        .collect();

    signatures.sort();

    signatures.dedup();

    assert!(
        signatures.len() >= 8,
        "техники стратегий должны различаться, получено только {} наборов: {signatures:?}",
        signatures.len()
    );
}

#[test]
fn test_service_bat_is_excluded_from_scanning() {
    let dir = resources_dir();

    assert!(
        super::is_excluded("service.bat"),
        "service.bat должен исключаться при сканировании"
    );
    assert!(
        dir.join("service.bat").exists(),
        "service.bat должен оставаться в ресурсах как fallback"
    );
}