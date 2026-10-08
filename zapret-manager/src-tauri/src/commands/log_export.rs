use std::path::{Path, PathBuf};

use crate::error::{AppError, AppResult};

const ALLOWED_EXTENSIONS: [&str; 2] = ["txt", "log"];
const MAX_EXPORT_BYTES: usize = 64 * 1024 * 1024;

pub fn validate_export_path(path: &str) -> AppResult<PathBuf> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err(AppError::custom("Путь к файлу не указан"));
    }

    let target = PathBuf::from(trimmed);

    if target.is_dir() {
        return Err(AppError::custom(format!(
            "Указан каталог, а не файл: {trimmed}"
        )));
    }

    let is_allowed = target
        .extension()
        .and_then(|value| value.to_str())
        .map(|value| ALLOWED_EXTENSIONS.contains(&value.to_lowercase().as_str()))
        .unwrap_or(false);

    if !is_allowed {
        return Err(AppError::custom(
            "Допустимое расширение файла: .txt или .log",
        ));
    }

    Ok(target)
}

pub fn write_export(target: &Path, content: &str) -> AppResult<usize> {
    if content.len() > MAX_EXPORT_BYTES {
        return Err(AppError::custom(format!(
            "Слишком большой файл: {} байт при лимите {MAX_EXPORT_BYTES}",
            content.len()
        )));
    }

    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent)?;
    }

    std::fs::write(target, content)?;

    Ok(content.len())
}

#[tauri::command]
pub fn write_log_export(path: String, content: String) -> AppResult<usize> {
    let target = validate_export_path(&path)?;

    tracing::info!(
        "Экспорт логов в {} ({} байт)",
        target.display(),
        content.len()
    );

    write_export(&target, &content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reject_empty_path() {
        assert!(validate_export_path("   ").is_err());
    }

    #[test]
    fn test_reject_bad_extension() {
        assert!(validate_export_path("C:/logs/report.exe").is_err());
        assert!(validate_export_path("C:/logs/report").is_err());
    }

    #[test]
    fn test_accept_txt_and_log() {
        assert!(validate_export_path("C:/logs/report.txt").is_ok());
        assert!(validate_export_path("C:/logs/report.LOG").is_ok());
    }

    #[test]
    fn test_write_creates_missing_directories() {
        let root = std::env::temp_dir().join("zapret-export-test");
        let _ = std::fs::remove_dir_all(&root);
        let path = root.join("nested").join("out.txt");

        let written = write_export(&path, "[00:00:00.000] [INFO] [system] ok\n").unwrap();

        assert_eq!(written, 34);
        assert!(path.exists());
    }

    #[test]
    fn test_reject_oversized_export() {
        let huge = "x".repeat(MAX_EXPORT_BYTES + 1);

        assert!(write_export(Path::new("C:/x.txt"), &huge).is_err());
    }
}