// Подключаем модули: std::fs;.
use std::fs;
// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Объявляем функцию resources_dir.
fn resources_dir() -> PathBuf {
    // Выполняем операцию: PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resourc.
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("resources/zapret")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_bundled_strategy_names_are_unique.
fn test_bundled_strategy_names_are_unique() {
    // Объявляем переменную dir .
    let dir = resources_dir();
    // Объявляем переменную entries.
    let mut entries: Vec<String> = fs::read_dir(&dir)
        // Выполняем операцию: .expect("ресурсы zapret доступны").
        .expect("ресурсы zapret доступны")
        // Выполняем операцию: .filter_map(|entry| entry.ok()).
        .filter_map(|entry| entry.ok())
        // Выполняем операцию: .map(|entry| entry.file_name().to_string_lossy().to_str.
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        // Выполняем операцию: .filter(|name| name.to_ascii_lowercase().ends_with(".ba.
        .filter(|name| name.to_ascii_lowercase().ends_with(".bat"))
        // Выполняем операцию: .filter(|name| !name.eq_ignore_ascii_case("service.bat".
        .filter(|name| !name.eq_ignore_ascii_case("service.bat"))
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: entries.len() >= 20,.
        entries.len() >= 20,
        // Выполняем операцию: "ожидалось не меньше 20 стратегий, найдено {}",.
        "ожидалось не меньше 20 стратегий, найдено {}",
        // Выполняем операцию: entries.len().
        entries.len() // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: entries.sort();.
    entries.sort();

    // Объявляем переменную seen.
    let mut seen: Vec<String> = Vec::new();
    // Объявляем переменную duplicates.
    let mut duplicates: Vec<(String, String)> = Vec::new();

    // Объявляем переменную scanned.
    let mut scanned: Vec<crate::commands::scanner::StrategyInfo> = entries
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|filename| {.
        .map(|filename| {
            // Объявляем переменную content .
            let content = fs::read_to_string(dir.join(filename)).expect("файл читается");

            // Выполняем операцию: super::analyze(PathBuf::from(filename), filename.clone(.
            super::analyze(PathBuf::from(filename), filename.clone(), content, 0, None)
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: super::deduplicate_names(&mut scanned);.
    super::deduplicate_names(&mut scanned);

    // Перебираем элементы коллекции.
    for info in &scanned {
        // Объявляем переменную previous .
        let previous = seen.iter().find(|value| **value == info.name);

        // Проверяем условие: let Some(previous) = previous {.
        if let Some(previous) = previous {
            // Выполняем операцию: duplicates.push((previous.clone(), info.name.clone()));.
            duplicates.push((previous.clone(), info.name.clone()));
            // Закрываем блок.
        }

        // Выполняем операцию: seen.push(info.name.clone());.
        seen.push(info.name.clone());
        // Закрываем блок.
    }

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: duplicates.is_empty(),.
        duplicates.is_empty(),
        // Выполняем операцию: "имена стратегий повторяются: {duplicates:?}".
        "имена стратегий повторяются: {duplicates:?}" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_bundled_strategies_have_varied_techniques.
fn test_bundled_strategies_have_varied_techniques() {
    // Объявляем переменную dir .
    let dir = resources_dir();
    // Объявляем переменную signatures.
    let mut signatures: Vec<String> = fs::read_dir(&dir)
        // Выполняем операцию: .expect("ресурсы zapret доступны").
        .expect("ресурсы zapret доступны")
        // Выполняем операцию: .filter_map(|entry| entry.ok()).
        .filter_map(|entry| entry.ok())
        // Выполняем операцию: .map(|entry| entry.file_name().to_string_lossy().to_str.
        .map(|entry| entry.file_name().to_string_lossy().to_string())
        // Выполняем операцию: .filter(|name| name.to_ascii_lowercase().ends_with(".ba.
        .filter(|name| name.to_ascii_lowercase().ends_with(".bat"))
        // Выполняем операцию: .filter(|name| !name.eq_ignore_ascii_case("service.bat".
        .filter(|name| !name.eq_ignore_ascii_case("service.bat"))
        // Выполняем операцию: .filter_map(|filename| {.
        .filter_map(|filename| {
            // Объявляем переменную content .
            let content = fs::read_to_string(dir.join(&filename)).ok()?;
            // Объявляем переменную techniques .
            let mut techniques = super::extract_techniques(&content);
            // Выполняем операцию: techniques.sort();.
            techniques.sort();
            // Выполняем операцию: Some(techniques.join("+")).
            Some(techniques.join("+"))
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: signatures.sort();.
    signatures.sort();

    // Выполняем операцию: signatures.dedup();.
    signatures.dedup();

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: signatures.len() >= 8,.
        signatures.len() >= 8,
        // Выполняем операцию: "техники стратегий должны различаться, получено только .
        "техники стратегий должны различаться, получено только {} наборов: {signatures:?}",
        // Выполняем операцию: signatures.len().
        signatures.len() // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_service_bat_is_excluded_from_scanning.
fn test_service_bat_is_excluded_from_scanning() {
    // Объявляем переменную dir .
    let dir = resources_dir();

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: super::is_excluded("service.bat"),.
        super::is_excluded("service.bat"),
        // Выполняем операцию: "service.bat должен исключаться при сканировании".
        "service.bat должен исключаться при сканировании" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: dir.join("service.bat").exists(),.
        dir.join("service.bat").exists(),
        // Выполняем операцию: "service.bat должен оставаться в ресурсах как fallback".
        "service.bat должен оставаться в ресурсах как fallback" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}
