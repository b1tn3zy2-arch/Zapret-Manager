// Подключаем модули: tauri_plugin_opener::OpenerExt;.
use tauri_plugin_opener::OpenerExt;

// Подключаем модули: super::user_dialogs::{pick_file, save_file, FileKind};.
use super::user_dialogs::{pick_file, save_file, FileKind};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::rate_limit::check_file_io;.
use crate::security::rate_limit::check_file_io;
// Подключаем модули: crate::security::url_validator::{is_public_host, valida.
use crate::security::url_validator::{is_public_host, validate_https_url};
// Подключаем модули: crate::security::{ensure_size, MAX_TEXT_FILE_BYTES};.
use crate::security::{ensure_size, MAX_TEXT_FILE_BYTES};

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию open_external_url.
pub fn open_external_url(app: tauri::AppHandle, url: String) -> AppResult<()> {
    // Выполняем операцию: check_file_io("open-url")?;.
    check_file_io("open-url")?;

    // Объявляем переменную parsed .
    let parsed = validate_https_url(&url)?;

    // Проверяем условие: !parsed.username().is_empty() || parsed.password().
    if !parsed.username().is_empty() || parsed.password().is_some() {
        // Возвращаем результат из функции.
        return Err(crate::security::security_denied(
            // Выполняем операцию: "url",.
            "url",
            // Выполняем операцию: "ссылка с логином и паролем запрещена",.
            "ссылка с логином и паролем запрещена",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Проверяем условие: !is_public_host(parsed.host_str().unwrap_or_defaul.
    if !is_public_host(parsed.host_str().unwrap_or_default()) {
        // Возвращаем результат из функции.
        return Err(crate::security::security_denied(
            // Выполняем операцию: "url",.
            "url",
            // Выполняем операцию: "локальные адреса открывать нельзя",.
            "локальные адреса открывать нельзя",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: app.opener().
    app.opener()
        // Выполняем операцию: .open_url(parsed.as_str(), None::<&str>).
        .open_url(parsed.as_str(), None::<&str>)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ссылка не от.
        .map_err(|error| AppError::custom(format!("Ссылка не открыта: {error}")))
    // Закрываем блок.
}

/// Сохраняет настройки в файл, выбранный пользователем в нативном диалоге.
///
/// Путь не приходит из webview: его возвращает системный диалог,
/// поэтому команда не может быть использована для записи в чужой файл.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn export_settings_file(.
pub async fn export_settings_file(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Выполняем операцию: default_name: String,.
    default_name: String,
    // Выполняем операцию: content: String,.
    content: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<String>> {
    // Выполняем операцию: check_file_io("export-settings")?;.
    check_file_io("export-settings")?;
    // Выполняем операцию: ensure_text_size(&content)?;.
    ensure_text_size(&content)?;

    // Объявляем переменную Some(path) .
    let Some(path) = save_file(app, title, default_name, FileKind::Json).await? else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Выполняем операцию: std::fs::write(&path, content).
    std::fs::write(&path, content)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Файл не запи.
        .map_err(|error| AppError::custom(format!("Файл не записан: {error}")))?;

    // Выполняем операцию: Ok(Some(path.to_string_lossy().to_string())).
    Ok(Some(path.to_string_lossy().to_string()))
    // Закрываем блок.
}

/// Читает настройки из файла, выбранного пользователем в нативном диалоге.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn import_settings_file(.
pub async fn import_settings_file(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<String>> {
    // Выполняем операцию: check_file_io("import-settings")?;.
    check_file_io("import-settings")?;

    // Объявляем переменную Some(path) .
    let Some(path) = pick_file(app, title, FileKind::Json).await? else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную size .
    let size = ensure_size(&path, MAX_TEXT_FILE_BYTES, "файл настроек")?;

    // Проверяем условие: size == 0 {.
    if size == 0 {
        // Возвращаем результат из функции.
        return Ok(Some(String::new()));
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::read_to_string(&path).
    std::fs::read_to_string(&path)
        // Выполняем операцию: .map(Some).
        .map(Some)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Файл не проч.
        .map_err(|error| AppError::custom(format!("Файл не прочитан: {error}")))
    // Закрываем блок.
}

// Объявляем функцию ensure_text_size.
fn ensure_text_size(content: &str) -> AppResult<()> {
    // Проверяем условие: content.len() as u64 > MAX_TEXT_FILE_BYTES {.
    if content.len() as u64 > MAX_TEXT_FILE_BYTES {
        // Возвращаем результат из функции.
        return Err(crate::security::security_denied(
            // Выполняем операцию: "write-size",.
            "write-size",
            // Выполняем операцию: "содержимое больше лимита в 1 МБ",.
            "содержимое больше лимита в 1 МБ",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "user_files_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
