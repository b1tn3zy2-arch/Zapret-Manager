// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: super::user_dialogs::{save_file, FileKind};.
use super::user_dialogs::{save_file, FileKind};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::rate_limit::check_file_io;.
use crate::security::rate_limit::check_file_io;

// Объявляем константу MAX_EXPORT_BYTES.
const MAX_EXPORT_BYTES: usize = 64 * 1024 * 1024;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру SavedExport.
pub struct SavedExport {
    // Выполняем операцию: pub path: String,.
    pub path: String,
    // Выполняем операцию: pub bytes: usize,.
    pub bytes: usize,
    // Закрываем блок.
}

// Объявляем функцию write_export.
pub fn write_export(target: &Path, content: &str) -> AppResult<usize> {
    // Проверяем условие: content.len() > MAX_EXPORT_BYTES {.
    if content.len() > MAX_EXPORT_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Слишком большой файл: {} байт при лимите {MAX_EXPORT_B.
            "Слишком большой файл: {} байт при лимите {MAX_EXPORT_BYTES}",
            // Выполняем операцию: content.len().
            content.len() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Проверяем условие: let Some(parent) = target.parent() {.
    if let Some(parent) = target.parent() {
        // Выполняем операцию: std::fs::create_dir_all(parent)?;.
        std::fs::create_dir_all(parent)?;
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::write(target, content)?;.
    std::fs::write(target, content)?;

    // Выполняем операцию: Ok(content.len()).
    Ok(content.len())
    // Закрываем блок.
}

/// Экспортирует журнал в файл, выбранный пользователем в нативном диалоге.
///
/// Путь не приходит из webview, поэтому команда не может перезаписать
/// произвольный файл на диске.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn export_logs_file(.
pub async fn export_logs_file(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Выполняем операцию: default_name: String,.
    default_name: String,
    // Выполняем операцию: content: String,.
    content: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<SavedExport>> {
    // Выполняем операцию: check_file_io("export-logs")?;.
    check_file_io("export-logs")?;

    // Проверяем условие: content.len() > MAX_EXPORT_BYTES {.
    if content.len() > MAX_EXPORT_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Слишком большой файл: {} байт при лимите {MAX_EXPORT_B.
            "Слишком большой файл: {} байт при лимите {MAX_EXPORT_BYTES}",
            // Выполняем операцию: content.len().
            content.len() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную Some(target) .
    let Some(target) = save_file(app, title, default_name, FileKind::TextLog).await? else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную path .
    let path = target.to_string_lossy().to_string();
    // Объявляем переменную display .
    let display = path.clone();

    // Выполняем операцию: tracing::info!("Экспорт логов в {} ({} байт)", path, co.
    tracing::info!("Экспорт логов в {} ({} байт)", path, content.len());

    // Файл может весить десятки мегабайт: запись идёт вне
    // рабочего потока, иначе интерфейс замирает на время экспорта.
    // Объявляем переменную bytes .
    let bytes = tokio::task::spawn_blocking(move || write_export(&target, &content))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Экспорт прер.
        .map_err(|error| AppError::custom(format!("Экспорт прерван: {error}")))??;

    // Выполняем операцию: Ok(Some(SavedExport {.
    Ok(Some(SavedExport {
        // Выполняем операцию: path: display,.
        path: display,
        // Выполняем операцию: bytes,.
        bytes,
        // Закрываем блок.
    }))
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
    // Объявляем функцию test_write_creates_missing_directories.
    fn test_write_creates_missing_directories() {
        // Объявляем переменную root .
        let root = std::env::temp_dir().join("zapret-export-test");
        // Объявляем переменную _ .
        let _ = std::fs::remove_dir_all(&root);
        // Объявляем переменную path .
        let path = root.join("nested").join("out.txt");

        // Объявляем переменную written .
        let written = write_export(&path, "[00:00:00.000] [INFO] [system] ok\n").unwrap();

        // Выполняем операцию: assert_eq!(written, 34);.
        assert_eq!(written, 34);
        // Выполняем операцию: assert!(path.exists());.
        assert!(path.exists());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_reject_oversized_export.
    fn test_reject_oversized_export() {
        // Объявляем переменную huge .
        let huge = "x".repeat(MAX_EXPORT_BYTES + 1);

        // Выполняем операцию: assert!(write_export(Path::new("C:/x.txt"), &huge).is_e.
        assert!(write_export(Path::new("C:/x.txt"), &huge).is_err());
        // Закрываем блок.
    }
    // Закрываем блок.
}
