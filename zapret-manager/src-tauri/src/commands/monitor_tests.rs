// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_clamp_interval_defaults.
fn test_clamp_interval_defaults() {
    // Выполняем операцию: assert_eq!(clamp_interval(None), DEFAULT_INTERVAL_MS);.
    assert_eq!(clamp_interval(None), DEFAULT_INTERVAL_MS);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_clamp_interval_clamps_bounds.
fn test_clamp_interval_clamps_bounds() {
    // Выполняем операцию: assert_eq!(clamp_interval(Some(1)), MIN_INTERVAL_MS);.
    assert_eq!(clamp_interval(Some(1)), MIN_INTERVAL_MS);
    // Выполняем операцию: assert_eq!(clamp_interval(Some(999_999)), MAX_INTERVAL_.
    assert_eq!(clamp_interval(Some(999_999)), MAX_INTERVAL_MS);
    // Выполняем операцию: assert_eq!(clamp_interval(Some(250)), 250);.
    assert_eq!(clamp_interval(Some(250)), 250);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_per_second_scales_by_elapsed.
fn test_per_second_scales_by_elapsed() {
    // Выполняем операцию: assert_eq!(per_second(1000, 100), 10_000);.
    assert_eq!(per_second(1000, 100), 10_000);
    // Выполняем операцию: assert_eq!(per_second(1000, 1000), 1000);.
    assert_eq!(per_second(1000, 1000), 1000);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_per_second_without_elapsed_is_zero.
fn test_per_second_without_elapsed_is_zero() {
    // Выполняем операцию: assert_eq!(per_second(5000, 0), 0);.
    assert_eq!(per_second(5000, 0), 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_per_second_ignores_oversized_delta.
fn test_per_second_ignores_oversized_delta() {
    // Выполняем операцию: assert_eq!(per_second(u64::MAX, 1), u64::MAX);.
    assert_eq!(per_second(u64::MAX, 1), u64::MAX);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_totals_ignores_loopback.
fn test_collect_totals_ignores_loopback() {
    // Объявляем переменную networks .
    let mut networks = Networks::new();
    // Выполняем операцию: networks.refresh(false);.
    networks.refresh(false);
    // Объявляем переменную totals .
    let totals = collect_totals(&networks);

    // Выполняем операцию: assert!(totals.packets_in >= totals.bytes_in / 65_536);.
    assert!(totals.packets_in >= totals.bytes_in / 65_536);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sample_first_call_has_no_speed.
fn test_sample_first_call_has_no_speed() {
    // Объявляем переменную state .
    let state = MonitorState::new();
    // Объявляем переменную first .
    let first = sample(&state).expect("первый сэмпл");

    // Выполняем операцию: assert_eq!(first.speed_in, 0, "у первого сэмпла нет дел.
    assert_eq!(first.speed_in, 0, "у первого сэмпла нет дельты");
    // Выполняем операцию: assert_eq!(first.speed_out, 0);.
    assert_eq!(first.speed_out, 0);
    // Выполняем операцию: assert!(first.timestamp > 1_700_000_000_000);.
    assert!(first.timestamp > 1_700_000_000_000);
    // Выполняем операцию: assert!(first.connections < 100_000);.
    assert!(first.connections < 100_000);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sample_is_repeatable_on_same_state.
fn test_sample_is_repeatable_on_same_state() {
    // Объявляем переменную state .
    let state = MonitorState::new();
    // Объявляем переменную first .
    let first = sample(&state).expect("первый сэмпл");
    // Выполняем операцию: std::thread::sleep(std::time::Duration::from_millis(120.
    std::thread::sleep(std::time::Duration::from_millis(120));
    // Объявляем переменную second .
    let second = sample(&state).expect("второй сэмпл");

    // Выполняем операцию: assert!(second.timestamp >= first.timestamp);.
    assert!(second.timestamp >= first.timestamp);
    // Выполняем операцию: assert!(second.bytes_in >= first.bytes_in);.
    assert!(second.bytes_in >= first.bytes_in);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_new_state_is_not_running.
fn test_new_state_is_not_running() {
    // Выполняем операцию: assert!(!MonitorState::new().is_running());.
    assert!(!MonitorState::new().is_running());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_default_matches_new.
fn test_state_default_matches_new() {
    // Выполняем операцию: assert!(!MonitorState::default().is_running());.
    assert!(!MonitorState::default().is_running());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_now_millis_is_plausible.
fn test_now_millis_is_plausible() {
    // Выполняем операцию: assert!(now_millis() > 1_700_000_000_000);.
    assert!(now_millis() > 1_700_000_000_000);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_stats_serializes_as_camel_case.
fn test_stats_serializes_as_camel_case() {
    // Объявляем переменную stats .
    let stats = NetworkStats {
        // Выполняем операцию: bytes_in: 1,.
        bytes_in: 1,
        // Выполняем операцию: bytes_out: 2,.
        bytes_out: 2,
        // Выполняем операцию: speed_in: 3,.
        speed_in: 3,
        // Выполняем операцию: speed_out: 4,.
        speed_out: 4,
        // Выполняем операцию: packets_in: 5,.
        packets_in: 5,
        // Выполняем операцию: packets_out: 6,.
        packets_out: 6,
        // Выполняем операцию: connections: 7,.
        connections: 7,
        // Выполняем операцию: timestamp: 8,.
        timestamp: 8,
        // Закрываем блок.
    };

    // Объявляем переменную json .
    let json = serde_json::to_string(&stats).expect("сериализация");

    // Выполняем операцию: assert!(json.contains("\"bytesIn\":1"));.
    assert!(json.contains("\"bytesIn\":1"));
    // Выполняем операцию: assert!(json.contains("\"speedOut\":4"));.
    assert!(json.contains("\"speedOut\":4"));
    // Выполняем операцию: assert!(json.contains("\"connections\":7"));.
    assert!(json.contains("\"connections\":7"));
    // Закрываем блок.
}
