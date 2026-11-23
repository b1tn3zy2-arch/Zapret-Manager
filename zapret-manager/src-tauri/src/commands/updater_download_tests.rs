// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: std::time::Instant;.
use std::time::Instant;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_progress_reports_percent_and_eta.
fn test_build_progress_reports_percent_and_eta() {
    // Объявляем переменную progress .
    let progress = build_progress(512, 1024, Instant::now());

    // Выполняем операцию: assert_eq!(progress.percent, 50.0);.
    assert_eq!(progress.percent, 50.0);
    // Выполняем операцию: assert_eq!(progress.downloaded, 512);.
    assert_eq!(progress.downloaded, 512);
    // Выполняем операцию: assert!(progress.speed > 0);.
    assert!(progress.speed > 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_progress_without_total_has_zero_percent.
fn test_build_progress_without_total_has_zero_percent() {
    // Объявляем переменную progress .
    let progress = build_progress(512, 0, Instant::now());

    // Выполняем операцию: assert_eq!(progress.percent, 0.0);.
    assert_eq!(progress.percent, 0.0);
    // Выполняем операцию: assert!(progress.eta.is_none());.
    assert!(progress.eta.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_progress_clamps_above_hundred.
fn test_build_progress_clamps_above_hundred() {
    // Объявляем переменную progress .
    let progress = build_progress(2048, 1024, Instant::now());

    // Выполняем операцию: assert_eq!(progress.percent, 100.0);.
    assert_eq!(progress.percent, 100.0);
    // Выполняем операцию: assert_eq!(progress.eta, Some(0));.
    assert_eq!(progress.eta, Some(0));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_progress_serializes_as_camel_case.
fn test_progress_serializes_as_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&build_progress(1, 2, Instant::now())).unwrap();

    // Выполняем операцию: assert!(json.contains("\"downloaded\":1"));.
    assert!(json.contains("\"downloaded\":1"));
    // Выполняем операцию: assert!(json.contains("\"total\":2"));.
    assert!(json.contains("\"total\":2"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_starts_unrequested.
fn test_state_starts_unrequested() {
    // Объявляем переменную state .
    let state = UpdateState::new();

    // Выполняем операцию: assert!(!state.is_cancelled());.
    assert!(!state.is_cancelled());
    // Выполняем операцию: state.cancel();.
    state.cancel();
    // Выполняем операцию: assert!(state.is_cancelled());.
    assert!(state.is_cancelled());
    // Выполняем операцию: state.reset();.
    state.reset();
    // Выполняем операцию: assert!(!state.is_cancelled());.
    assert!(!state.is_cancelled());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_event_name_is_stable.
fn test_event_name_is_stable() {
    // Выполняем операцию: assert_eq!(EVENT_UPDATE_PROGRESS, "update-download-prog.
    assert_eq!(EVENT_UPDATE_PROGRESS, "update-download-progress");
    // Закрываем блок.
}
