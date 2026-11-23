//! Канал уведомления: «в приложении» (тостер интерфейса) или «в Windows»
//! (системный центр уведомлений). Источник истины — настройка в интерфейсе,
//! она синхронизируется командой set_notification_channel; до первого
//! вызова уведомления идут в приложение.

// Подключаем модули: std::sync::atomic::{AtomicU8, Ordering};.
use std::sync::atomic::{AtomicU8, Ordering};

// Подключаем модули: tauri::{AppHandle, Emitter};.
use tauri::{AppHandle, Emitter};
// Подключаем модули: tauri_plugin_notification::{NotificationExt, Permission.
use tauri_plugin_notification::{NotificationExt, PermissionState};

// Подключаем модули: crate::error::AppError;.
use crate::error::AppError;
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::tray::NotificationKind;.
use crate::tray::NotificationKind;

// Объявляем константу EVENT_NOTIFY.
pub const EVENT_NOTIFY: &str = "app-notification";
// Объявляем константу NOTIFY_PREFIX.
pub const NOTIFY_PREFIX: &str = "notify:";

/// Значения канала в атомике: 0 — тостер интерфейса, 1 — Windows.
// Объявляем константу CHANNEL_APP.
pub const CHANNEL_APP: u8 = 0;
// Объявляем константу CHANNEL_WINDOWS.
pub const CHANNEL_WINDOWS: u8 = 1;

// Объявляем константу CHANNEL.
static CHANNEL: AtomicU8 = AtomicU8::new(CHANNEL_APP);

/// Канал по строке из интерфейса: None — неизвестное значение.
// Объявляем функцию notification_channel_from_str.
pub fn notification_channel_from_str(value: &str) -> Option<u8> {
    // Выбираем вариант по значению.
    match value {
        // Выполняем операцию: "app" => Some(CHANNEL_APP),.
        "app" => Some(CHANNEL_APP),
        // Выполняем операцию: "windows" => Some(CHANNEL_WINDOWS),.
        "windows" => Some(CHANNEL_WINDOWS),
        // Выполняем операцию: _ => None,.
        _ => None,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_windows_channel.
pub fn is_windows_channel() -> bool {
    // Выполняем операцию: CHANNEL.load(Ordering::Relaxed) == CHANNEL_WINDOWS.
    CHANNEL.load(Ordering::Relaxed) == CHANNEL_WINDOWS
    // Закрываем блок.
}

/// Меняет канал уведомлений; используется командой интерфейса.
// Объявляем функцию store_channel.
pub fn store_channel(channel: u8) {
    // Выполняем операцию: CHANNEL.store(channel, Ordering::Relaxed);.
    CHANNEL.store(channel, Ordering::Relaxed);
    // Закрываем блок.
}

/// Команда интерфейса: выбирает, куда идут уведомления.
///
/// Аргумент другому названию не даю: строка читается одинаково в обоих
/// каналах, а проверку значения берёт на себя парсер выше.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn set_notification_channel(channel: String) .
pub async fn set_notification_channel(channel: String) -> AppResult<()> {
    // Объявляем переменную Some(value) .
    let Some(value) = notification_channel_from_str(&channel) else {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Канал уведомлений может быть app или windows",.
            "Канал уведомлений может быть app или windows",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    };

    // Выполняем операцию: store_channel(value);.
    store_channel(value);

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию title_prefix.
pub fn title_prefix(kind: NotificationKind) -> &'static str {
    // Выбираем вариант по значению.
    match kind {
        // Выполняем операцию: NotificationKind::Success => "Успешно",.
        NotificationKind::Success => "Успешно",
        // Выполняем операцию: NotificationKind::Error => "Ошибка",.
        NotificationKind::Error => "Ошибка",
        // Выполняем операцию: NotificationKind::Warning => "Внимание",.
        NotificationKind::Warning => "Внимание",
        // Выполняем операцию: NotificationKind::Info => "Информация",.
        NotificationKind::Info => "Информация",
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию full_title.
pub fn full_title(kind: NotificationKind, title: &str) -> String {
    // Проверяем условие: title.trim().is_empty() {.
    if title.trim().is_empty() {
        // Возвращаем результат из функции.
        return title_prefix(kind).to_string();
        // Закрываем блок.
    }

    // Выполняем операцию: format!("{} — {title}", title_prefix(kind)).
    format!("{} — {title}", title_prefix(kind))
    // Закрываем блок.
}

// Объявляем функцию emit_event.
pub fn emit_event(kind: NotificationKind, title: &str, body: &str) -> String {
    // Выполняем операцию: format!("{NOTIFY_PREFIX}{}:{title}|{body}", kind.as_str.
    format!("{NOTIFY_PREFIX}{}:{title}|{body}", kind.as_str())
    // Закрываем блок.
}

// Объявляем функцию ensure_permission.
pub fn ensure_permission(app: &AppHandle) -> AppResult<()> {
    // Объявляем переменную notification .
    let notification = app.notification();

    // Выбираем вариант по значению.
    match notification.permission_state() {
        // Выполняем операцию: Ok(PermissionState::Granted) => Ok(()),.
        Ok(PermissionState::Granted) => Ok(()),
        // Выполняем операцию: _ => notification.
        _ => notification
            // Выполняем операцию: .request_permission().
            .request_permission()
            // Выполняем операцию: .map(|_| ()).
            .map(|_| ())
            // Выполняем операцию: .map_err(|error| {.
            .map_err(|error| {
                // Выполняем операцию: crate::error::AppError::custom(format!(.
                crate::error::AppError::custom(format!(
                    // Выполняем операцию: "Разрешение на уведомления не получено: {error}".
                    "Разрешение на уведомления не получено: {error}" // Закрываем выражение или коллекцию.
                ))
                // Закрываем блок.
            }),
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Уведомление: событие интерфейсу всегда, а системное окно Windows —
/// только когда настройка выбрала канал «Windows».
// Объявляем функцию send.
pub fn send(app: &AppHandle, title: &str, body: &str, kind: NotificationKind) -> AppResult<()> {
    // Объявляем переменную event .
    let event = emit_event(kind, title, body);
    // Объявляем переменную _ .
    let _ = app.emit(EVENT_NOTIFY, &event);

    // Проверяем условие: !is_windows_channel() {.
    if !is_windows_channel() {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    }

    // Проверяем условие: let Err(error) = ensure_permission(app) {.
    if let Err(error) = ensure_permission(app) {
        // Выполняем операцию: tracing::warn!("Уведомления недоступны: {error}");.
        tracing::warn!("Уведомления недоступны: {error}");
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let result = app
        // Выполняем операцию: .notification().
        .notification()
        // Выполняем операцию: .builder().
        .builder()
        // Выполняем операцию: .title(full_title(kind, title)).
        .title(full_title(kind, title))
        // Выполняем операцию: .body(body).
        .body(body)
        // Выполняем операцию: .show();.
        .show();

    // Выбираем вариант по значению.
    match result {
        // Выполняем операцию: Ok(()) => {.
        Ok(()) => {
            // Выполняем операцию: tracing::debug!("Системное уведомление отправлено: {tit.
            tracing::debug!("Системное уведомление отправлено: {title}");

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: Err(error) => Err(crate::error::AppError::custom(format.
        Err(error) => Err(crate::error::AppError::custom(format!(
            // Выполняем операцию: "Уведомление не отправлено: {error}".
            "Уведомление не отправлено: {error}" // Закрываем выражение или коллекцию.
        ))),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "notify_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
