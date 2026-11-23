// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: base64::engine::general_purpose::STANDARD as BASE64;.
use base64::engine::general_purpose::STANDARD as BASE64;
// Подключаем модули: base64::Engine;.
use base64::Engine;

// Подключаем модули: super::user_dialogs::{save_file, FileKind};.
use super::user_dialogs::{save_file, FileKind};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу MAX_SNAPSHOT_BYTES.
const MAX_SNAPSHOT_BYTES: usize = 32 * 1024 * 1024;
// Объявляем константу DATA_URL_PREFIX.
const DATA_URL_PREFIX: &str = "data:image/png;base64,";
// Объявляем константу PNG_SIGNATURE.
const PNG_SIGNATURE: &[u8] = b"\x89PNG\r\n\x1a\n";

// Объявляем функцию decode_snapshot.
pub fn decode_snapshot(data: &str) -> AppResult<Vec<u8>> {
    // Объявляем переменную trimmed .
    let trimmed = data.trim();
    // Объявляем переменную payload .
    let payload = trimmed.strip_prefix(DATA_URL_PREFIX).unwrap_or(trimmed);

    // Объявляем переменную bytes .
    let bytes = BASE64
        // Выполняем операцию: .decode(payload).
        .decode(payload)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Снимок повре.
        .map_err(|error| AppError::custom(format!("Снимок повреждён: {error}")))?;

    // Проверяем условие: bytes.is_empty() {.
    if bytes.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Снимок пустой"));
        // Закрываем блок.
    }

    // Проверяем условие: !bytes.starts_with(PNG_SIGNATURE) {.
    if !bytes.starts_with(PNG_SIGNATURE) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Снимок не является PNG"));
        // Закрываем блок.
    }

    // Проверяем условие: bytes.len() > MAX_SNAPSHOT_BYTES {.
    if bytes.len() > MAX_SNAPSHOT_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Снимок слишком большой: {} байт при лимите {MAX_SNAPSH.
            "Снимок слишком большой: {} байт при лимите {MAX_SNAPSHOT_BYTES}",
            // Выполняем операцию: bytes.len().
            bytes.len() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(bytes).
    Ok(bytes)
    // Закрываем блок.
}

// Объявляем функцию write_snapshot.
pub fn write_snapshot(target: &Path, data: &str) -> AppResult<usize> {
    // Объявляем переменную bytes .
    let bytes = decode_snapshot(data)?;

    // Проверяем условие: let Some(parent) = target.parent() {.
    if let Some(parent) = target.parent() {
        // Выполняем операцию: std::fs::create_dir_all(parent)?;.
        std::fs::create_dir_all(parent)?;
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::write(target, &bytes)?;.
    std::fs::write(target, &bytes)?;
    // Выполняем операцию: tracing::info!("Снимок монитора сохранён: {}", target.d.
    tracing::info!("Снимок монитора сохранён: {}", target.display());

    // Выполняем операцию: Ok(bytes.len()).
    Ok(bytes.len())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn save_monitor_snapshot(.
pub async fn save_monitor_snapshot(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Выполняем операцию: default_name: String,.
    default_name: String,
    // Выполняем операцию: data: String,.
    data: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<String>> {
    // Объявляем переменную Some(target) .
    let Some(target) = save_file(app, title, default_name, FileKind::Png).await? else {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    };

    // Объявляем переменную display .
    let display = target.to_string_lossy().to_string();

    // Снимок монитора — это картинка на десятки мегабайт;
    // запись идёт вне рабочего потока.
    // Выполняем операцию: tokio::task::spawn_blocking(move || write_snapshot(&tar.
    tokio::task::spawn_blocking(move || write_snapshot(&target, &data))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Снимок не со.
        .map_err(|error| AppError::custom(format!("Снимок не сохранён: {error}")))??;

    // Выполняем операцию: Ok(Some(display)).
    Ok(Some(display))
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "monitor_snapshot_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
