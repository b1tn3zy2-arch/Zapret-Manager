use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;

use crate::error::AppResult;
use crate::tray::NotificationKind;

pub const EVENT_NOTIFY: &str = "app-notification";
pub const NOTIFY_PREFIX: &str = "notify:";

pub fn title_prefix(kind: NotificationKind) -> &'static str {
    match kind {
        NotificationKind::Success => "Успешно",
        NotificationKind::Error => "Ошибка",
        NotificationKind::Warning => "Внимание",
        NotificationKind::Info => "Информация",
    }
}

pub fn full_title(kind: NotificationKind, title: &str) -> String {
    if title.trim().is_empty() {
        return title_prefix(kind).to_string();
    }

    format!("{} — {title}", title_prefix(kind))
}

pub fn emit_event(kind: NotificationKind, title: &str, body: &str) -> String {
    format!("{NOTIFY_PREFIX}{}:{title}|{body}", kind.as_str())
}

pub fn send(
    app: &AppHandle,
    title: &str,
    body: &str,
    kind: NotificationKind,
) -> AppResult<()> {
    let event = emit_event(kind, title, body);

    if app.emit(EVENT_NOTIFY, &event).is_ok() {
        return Ok(());
    }

    tracing::debug!("Событие уведомления не доставлено, отправляю системное: {event}");

    app.notification()
        .builder()
        .title(full_title(kind, title))
        .body(body)
        .show()
        .map_err(|error| crate::error::AppError::custom(format!("Уведомление не отправлено: {error}")))
}

#[cfg(test)]
#[path = "notify_tests.rs"]
mod tests;