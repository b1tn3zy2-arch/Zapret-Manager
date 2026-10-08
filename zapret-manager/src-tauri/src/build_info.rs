pub const UNKNOWN_VERSION: &str = "неизвестно";

pub fn version_parts(name: &str) -> Option<Vec<u32>> {
    name.split('.').map(|part| part.parse::<u32>().ok()).collect()
}

fn webview_root() -> Option<std::path::PathBuf> {
    let program_files = std::env::var("PROGRAMFILES(X86)").ok()?;

    Some(
        std::path::Path::new(&program_files)
            .join("Microsoft")
            .join("EdgeWebView")
            .join("Application"),
    )
}

pub fn webview_version() -> String {
    let Some(root) = webview_root() else {
        return UNKNOWN_VERSION.to_string();
    };

    let Ok(entries) = std::fs::read_dir(&root) else {
        return UNKNOWN_VERSION.to_string();
    };

    let mut best: Option<Vec<u32>> = None;

    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();

        if !entry.path().join("msedgewebview2.exe").is_file() {
            continue;
        }

        let Some(parts) = version_parts(&name) else {
            continue;
        };

        if best.as_ref().is_none_or(|current| parts > *current) {
            best = Some(parts);
        }
    }

    match best {
        Some(parts) => parts
            .iter()
            .map(u32::to_string)
            .collect::<Vec<String>>()
            .join("."),
        None => UNKNOWN_VERSION.to_string(),
    }
}

pub fn rust_version() -> String {
    let value = env!("CARGO_PKG_RUST_VERSION").trim();

    if value.is_empty() {
        UNKNOWN_VERSION.to_string()
    } else {
        value.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_parts_handles_chromium_versions() {
        assert_eq!(
            version_parts("154.0.4258.53"),
            Some(vec![154, 0, 4258, 53])
        );
        assert_eq!(version_parts("SetupMetrics"), None);
        assert_eq!(version_parts("1.2.x"), None);
    }

    #[test]
    fn test_webview_version_is_reported_or_unknown() {
        assert!(!webview_version().is_empty());
    }

    #[test]
    fn test_rust_version_is_never_empty() {
        assert!(!rust_version().is_empty());
    }
}