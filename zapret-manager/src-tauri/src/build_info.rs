// Объявляем константу UNKNOWN_VERSION.
pub const UNKNOWN_VERSION: &str = "неизвестно";

// Объявляем функцию version_parts.
pub fn version_parts(name: &str) -> Option<Vec<u32>> {
    // Выполняем операцию: name.split('.').
    name.split('.')
        // Выполняем операцию: .map(|part| part.parse::<u32>().ok()).
        .map(|part| part.parse::<u32>().ok())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию webview_root.
fn webview_root() -> Option<std::path::PathBuf> {
    // Объявляем переменную program_files .
    let program_files = std::env::var("PROGRAMFILES(X86)").ok()?;

    // Выполняем операцию: Some(.
    Some(
        // Выполняем операцию: std::path::Path::new(&program_files).
        std::path::Path::new(&program_files)
            // Выполняем операцию: .join("Microsoft").
            .join("Microsoft")
            // Выполняем операцию: .join("EdgeWebView").
            .join("EdgeWebView")
            // Выполняем операцию: .join("Application"),.
            .join("Application"),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Объявляем функцию webview_version.
pub fn webview_version() -> String {
    // Объявляем переменную Some(root) .
    let Some(root) = webview_root() else {
        // Возвращаем результат из функции.
        return UNKNOWN_VERSION.to_string();
        // Закрываем блок.
    };

    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(&root) else {
        // Возвращаем результат из функции.
        return UNKNOWN_VERSION.to_string();
        // Закрываем блок.
    };

    // Объявляем переменную best.
    let mut best: Option<Vec<u32>> = None;

    // Перебираем элементы коллекции.
    for entry in entries.flatten() {
        // Объявляем переменную name .
        let name = entry.file_name().to_string_lossy().to_string();

        // Проверяем условие: !entry.path().join("msedgewebview2.exe").is_file().
        if !entry.path().join("msedgewebview2.exe").is_file() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(parts) .
        let Some(parts) = version_parts(&name) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: best.as_ref().is_none_or(|current| parts > *curren.
        if best.as_ref().is_none_or(|current| parts > *current) {
            // Выполняем операцию: best = Some(parts);.
            best = Some(parts);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match best {
        // Выполняем операцию: Some(parts) => parts.
        Some(parts) => parts
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .map(u32::to_string).
            .map(u32::to_string)
            // Выполняем операцию: .collect::<Vec<String>>().
            .collect::<Vec<String>>()
            // Выполняем операцию: .join("."),.
            .join("."),
        // Выполняем операцию: None => UNKNOWN_VERSION.to_string(),.
        None => UNKNOWN_VERSION.to_string(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию rust_version.
pub fn rust_version() -> String {
    // Объявляем переменную value .
    let value = env!("CARGO_PKG_RUST_VERSION").trim();

    // Проверяем условие: value.is_empty() {.
    if value.is_empty() {
        // Выполняем операцию: UNKNOWN_VERSION.to_string().
        UNKNOWN_VERSION.to_string()
    // Закрываем блок.
    } else {
        // Выполняем операцию: value.to_string().
        value.to_string()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_version_parts_handles_chromium_versions.
    fn test_version_parts_handles_chromium_versions() {
        // Выполняем операцию: assert_eq!(version_parts("154.0.4258.53"), Some(vec![15.
        assert_eq!(version_parts("154.0.4258.53"), Some(vec![154, 0, 4258, 53]));
        // Выполняем операцию: assert_eq!(version_parts("SetupMetrics"), None);.
        assert_eq!(version_parts("SetupMetrics"), None);
        // Выполняем операцию: assert_eq!(version_parts("1.2.x"), None);.
        assert_eq!(version_parts("1.2.x"), None);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_webview_version_is_reported_or_unknown.
    fn test_webview_version_is_reported_or_unknown() {
        // Выполняем операцию: assert!(!webview_version().is_empty());.
        assert!(!webview_version().is_empty());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_rust_version_is_never_empty.
    fn test_rust_version_is_never_empty() {
        // Выполняем операцию: assert!(!rust_version().is_empty());.
        assert!(!rust_version().is_empty());
        // Закрываем блок.
    }
    // Закрываем блок.
}
