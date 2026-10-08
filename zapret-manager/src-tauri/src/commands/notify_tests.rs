use super::*;

#[test]
fn test_title_prefix_covers_all_kinds() {
    assert_eq!(title_prefix(NotificationKind::Success), "Успешно");
    assert_eq!(title_prefix(NotificationKind::Error), "Ошибка");
    assert_eq!(title_prefix(NotificationKind::Warning), "Внимание");
    assert_eq!(title_prefix(NotificationKind::Info), "Информация");
}

#[test]
fn test_full_title_appends_prefix() {
    assert_eq!(
        full_title(NotificationKind::Success, "Стратегия запущена"),
        "Успешно — Стратегия запущена"
    );
}

#[test]
fn test_full_title_falls_back_to_prefix_for_empty_title() {
    assert_eq!(full_title(NotificationKind::Error, "   "), "Ошибка");
    assert_eq!(full_title(NotificationKind::Info, ""), "Информация");
}

#[test]
fn test_emit_event_uses_prefixed_format() {
    let event = emit_event(NotificationKind::Success, "Запущено", "Discord");

    assert_eq!(event, "notify:success:Запущено|Discord");
    assert!(event.starts_with(NOTIFY_PREFIX));
}

#[test]
fn test_emit_event_kind_is_first_segment() {
    let event = emit_event(NotificationKind::Warning, "Требуется внимание", "");

    assert!(event.contains(":warning:"));
}

#[test]
fn test_emit_event_keeps_pipe_in_body() {
    let event = emit_event(NotificationKind::Info, "Заголовок", "a|b");

    assert_eq!(event, "notify:info:Заголовок|a|b");
}

#[test]
fn test_event_name_is_stable() {
    assert_eq!(EVENT_NOTIFY, "app-notification");
}