//! Хранилище ссылки на подписку.
//!
//! Подписка содержит токен доступа к серверам, поэтому файл хранится
//! только в зашифрованном виде. Внутри — URL и последний успешный
//! снимок метаданных: остаток срока и трафика видны даже тогда,
//! когда панель подписки временно недоступна.

// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::commands::vpn_store::app_data_dir;.
use crate::commands::vpn_store::app_data_dir;
// Подключаем модули: crate::error::AppError;.
use crate::error::AppError;
// Подключаем модули: crate::security::dpapi;.
use crate::security::dpapi;
// Подключаем модули: crate::security::ensure_size;.
use crate::security::ensure_size;

/// Имя файла с зашифрованной подпиской.
// Объявляем константу STORE_FILE.
const STORE_FILE: &str = "subscription.bin";

/// Предельный размер сохранённой подписки.
// Объявляем константу MAX_STORE_BYTES.
const MAX_STORE_BYTES: u64 = 64 * 1024;

/// Снимок подписки: ссылка плюс последний успешный ответ.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StoredSubscription.
pub struct StoredSubscription {
    /// Ссылка на подписку: единственный источник серверов.
    // Выполняем операцию: pub url: String,.
    pub url: String,
    /// Название профиля из ответа подписки.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub title: Option<String>,.
    pub title: Option<String>,
    /// Израсходованный трафик, байты.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub traffic_used_bytes: u64,.
    pub traffic_used_bytes: u64,
    /// Общий лимит трафика, байты. `0` — лимит не указан.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub traffic_limit_bytes: u64,.
    pub traffic_limit_bytes: u64,
    /// Момент окончания подписки, UNIX-время.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub expires_at: Option<i64>,.
    pub expires_at: Option<i64>,
    /// Сколько серверов было в последнем ответе.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub server_count: usize,.
    pub server_count: usize,
    /// Момент последнего успешного обновления, UNIX-время в секундах.
    // Выполняем операцию: pub updated_at: u64,.
    pub updated_at: u64,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl StoredSubscription {
    // Объявляем функцию new.
    pub fn new(url: &str) -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: url: url.to_string(),.
            url: url.to_string(),
            // Выполняем операцию: title: None,.
            title: None,
            // Выполняем операцию: traffic_used_bytes: 0,.
            traffic_used_bytes: 0,
            // Выполняем операцию: traffic_limit_bytes: 0,.
            traffic_limit_bytes: 0,
            // Выполняем операцию: expires_at: None,.
            expires_at: None,
            // Выполняем операцию: server_count: 0,.
            server_count: 0,
            // Выполняем операцию: updated_at: crate::commands::vpn_wireguard::now_secs(),.
            updated_at: crate::commands::vpn_wireguard::now_secs(),
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Путь к файлу подписки.
// Объявляем функцию store_path.
pub fn store_path() -> Result<PathBuf, AppError> {
    // Выполняем операцию: Ok(app_data_dir()?.join(STORE_FILE)).
    Ok(app_data_dir()?.join(STORE_FILE))
    // Закрываем блок.
}

/// Читает сохранённую подписку. Файла нет — подписки нет.
// Объявляем функцию read.
pub fn read() -> Result<Option<StoredSubscription>, AppError> {
    // Объявляем переменную path .
    let path = store_path()?;

    // Проверяем условие: !path.exists() {.
    if !path.exists() {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Выполняем операцию: ensure_size(&path, MAX_STORE_BYTES, "файл подписки")?;.
    ensure_size(&path, MAX_STORE_BYTES, "файл подписки")?;

    // Объявляем переменную encrypted .
    let encrypted = std::fs::read(&path)?;
    // Объявляем переменную plain .
    let plain = dpapi::unprotect(&encrypted)?;
    // Объявляем переменную text .
    let text = String::from_utf8_lossy(&plain);

    // Объявляем переменную record .
    let record = serde_json::from_str::<StoredSubscription>(&text)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Файл подписк.
        .map_err(|error| AppError::custom(format!("Файл подписки повреждён: {error}")))?;

    // Проверяем условие: record.url.is_empty() {.
    if record.url.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Файл подписки повреждён"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(Some(record)).
    Ok(Some(record))
    // Закрываем блок.
}

/// Читает только ссылку.
// Объявляем функцию read_url.
pub fn read_url() -> Result<Option<String>, AppError> {
    // Выполняем операцию: Ok(read()?.map(|record| record.url)).
    Ok(read()?.map(|record| record.url))
    // Закрываем блок.
}

/// Сохраняет подписку.
// Объявляем функцию write.
pub fn write(record: &StoredSubscription) -> Result<(), AppError> {
    // Объявляем переменную content .
    let content = serde_json::to_vec(record)?;
    // Объявляем переменную encrypted .
    let encrypted = dpapi::protect(&content)?;
    // Объявляем переменную path .
    let path = store_path()?;

    // Запись через временный файл: обрыв питания не оставит
    // наполовину записанный секрет.
    // Объявляем переменную temp .
    let temp = path.with_extension("bin.tmp");
    // Выполняем операцию: std::fs::write(&temp, encrypted)?;.
    std::fs::write(&temp, encrypted)?;
    // Выполняем операцию: std::fs::rename(&temp, &path)?;.
    std::fs::rename(&temp, &path)?;

    // Выполняем операцию: tracing::info!("Ссылка подписки сохранена");.
    tracing::info!("Ссылка подписки сохранена");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Полностью удаляет подписку.
// Объявляем функцию remove.
pub fn remove() -> Result<(), AppError> {
    // Объявляем переменную path .
    let path = store_path()?;

    // Проверяем условие: path.exists() {.
    if path.exists() {
        // Выполняем операцию: std::fs::remove_file(&path)?;.
        std::fs::remove_file(&path)?;
        // Закрываем блок.
    }

    // Обрезать и временный файл, если из-за сбоя он остался.
    // Объявляем переменную temp .
    let temp = path.with_extension("bin.tmp");

    // Проверяем условие: temp.exists() {.
    if temp.exists() {
        // Выполняем операцию: std::fs::remove_file(&temp)?;.
        std::fs::remove_file(&temp)?;
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Ссылка подписки удалена");.
    tracing::info!("Ссылка подписки удалена");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}
