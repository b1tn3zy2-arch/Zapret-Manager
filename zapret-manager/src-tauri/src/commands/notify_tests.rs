// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_title_prefix_covers_all_kinds.
fn test_title_prefix_covers_all_kinds() {
    // Выполняем операцию: assert_eq!(title_prefix(NotificationKind::Success), "Ус.
    assert_eq!(title_prefix(NotificationKind::Success), "Успешно");
    // Выполняем операцию: assert_eq!(title_prefix(NotificationKind::Error), "Ошиб.
    assert_eq!(title_prefix(NotificationKind::Error), "Ошибка");
    // Выполняем операцию: assert_eq!(title_prefix(NotificationKind::Warning), "Вн.
    assert_eq!(title_prefix(NotificationKind::Warning), "Внимание");
    // Выполняем операцию: assert_eq!(title_prefix(NotificationKind::Info), "Инфор.
    assert_eq!(title_prefix(NotificationKind::Info), "Информация");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_full_title_appends_prefix.
fn test_full_title_appends_prefix() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: full_title(NotificationKind::Success, "Стратегия запуще.
        full_title(NotificationKind::Success, "Стратегия запущена"),
        // Выполняем операцию: "Успешно — Стратегия запущена".
        "Успешно — Стратегия запущена" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_full_title_falls_back_to_prefix_for_empty_title.
fn test_full_title_falls_back_to_prefix_for_empty_title() {
    // Выполняем операцию: assert_eq!(full_title(NotificationKind::Error, "   "), .
    assert_eq!(full_title(NotificationKind::Error, "   "), "Ошибка");
    // Выполняем операцию: assert_eq!(full_title(NotificationKind::Info, ""), "Инф.
    assert_eq!(full_title(NotificationKind::Info, ""), "Информация");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_emit_event_uses_prefixed_format.
fn test_emit_event_uses_prefixed_format() {
    // Объявляем переменную event .
    let event = emit_event(NotificationKind::Success, "Запущено", "Discord");

    // Выполняем операцию: assert_eq!(event, "notify:success:Запущено|Discord");.
    assert_eq!(event, "notify:success:Запущено|Discord");
    // Выполняем операцию: assert!(event.starts_with(NOTIFY_PREFIX));.
    assert!(event.starts_with(NOTIFY_PREFIX));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_emit_event_kind_is_first_segment.
fn test_emit_event_kind_is_first_segment() {
    // Объявляем переменную event .
    let event = emit_event(NotificationKind::Warning, "Требуется внимание", "");

    // Выполняем операцию: assert!(event.contains(":warning:"));.
    assert!(event.contains(":warning:"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_emit_event_keeps_pipe_in_body.
fn test_emit_event_keeps_pipe_in_body() {
    // Объявляем переменную event .
    let event = emit_event(NotificationKind::Info, "Заголовок", "a|b");

    // Выполняем операцию: assert_eq!(event, "notify:info:Заголовок|a|b");.
    assert_eq!(event, "notify:info:Заголовок|a|b");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_event_name_is_stable.
fn test_event_name_is_stable() {
    // Выполняем операцию: assert_eq!(EVENT_NOTIFY, "app-notification");.
    assert_eq!(EVENT_NOTIFY, "app-notification");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_notification_channel_from_str.
fn test_notification_channel_from_str() {
    // Выполняем операцию: assert_eq!(notification_channel_from_str("app"), Some(C.
    assert_eq!(notification_channel_from_str("app"), Some(CHANNEL_APP));
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: notification_channel_from_str("windows"),.
        notification_channel_from_str("windows"),
        // Выполняем операцию: Some(CHANNEL_WINDOWS).
        Some(CHANNEL_WINDOWS) // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(notification_channel_from_str("tray"), None).
    assert_eq!(notification_channel_from_str("tray"), None);
    // Выполняем операцию: assert_eq!(notification_channel_from_str(""), None);.
    assert_eq!(notification_channel_from_str(""), None);
    // Закрываем блок.
}
