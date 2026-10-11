use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::{NotificationExt, PermissionState};

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

pub fn ensure_permission(app: &AppHandle) -> AppResult<()> {
    let notification = app.notification();

    match notification.permission_state() {
        Ok(PermissionState::Granted) => Ok(()),
        _ => notification
            .request_permission()
            .map(|_| ())
            .map_err(|error| {
                crate::error::AppError::custom(format!(
                    "Разрешение на уведомления не получено: {error}"
                ))
            }),
    }
}

pub fn send(
    app: &AppHandle,
    title: &str,
    body: &str,
    kind: NotificationKind,
) -> AppResult<()> {
    let event = emit_event(kind, title, body);
    let _ = app.emit(EVENT_NOTIFY, &event);

    if let Err(error) = ensure_permission(app) {
        tracing::warn!("Уведомления недоступны: {error}");
    }

    let result = app
        .notification()
        .builder()
        .title(full_title(kind, title))
        .body(body)
        .show();

    match result {
        Ok(()) => {
            tracing::debug!("Системное уведомление отправлено: {title}");

            Ok(())
        }
        Err(error) => Err(crate::error::AppError::custom(format!(
            "Уведомление не отправлено: {error}"
        ))),
    }
}

#[cfg(test)]
#[path = "notify_tests.rs"]
mod tests;