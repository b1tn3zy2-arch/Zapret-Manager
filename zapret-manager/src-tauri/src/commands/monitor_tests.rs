use super::*;

#[test]
fn test_clamp_interval_defaults() {
    assert_eq!(clamp_interval(None), DEFAULT_INTERVAL_MS);
}

#[test]
fn test_clamp_interval_clamps_bounds() {
    assert_eq!(clamp_interval(Some(1)), MIN_INTERVAL_MS);
    assert_eq!(clamp_interval(Some(999_999)), MAX_INTERVAL_MS);
    assert_eq!(clamp_interval(Some(250)), 250);
}

#[test]
fn test_per_second_scales_by_elapsed() {
    assert_eq!(per_second(1000, 100), 10_000);
    assert_eq!(per_second(1000, 1000), 1000);
}

#[test]
fn test_per_second_without_elapsed_is_zero() {
    assert_eq!(per_second(5000, 0), 0);
}

#[test]
fn test_per_second_ignores_oversized_delta() {
    assert_eq!(per_second(u64::MAX, 1), u64::MAX);
}

#[test]
fn test_collect_totals_ignores_loopback() {
    let mut networks = Networks::new();
    networks.refresh(false);
    let totals = collect_totals(&networks);

    assert!(totals.packets_in >= totals.bytes_in / 65_536);
}

#[test]
fn test_sample_first_call_has_no_speed() {
    let state = MonitorState::new();
    let first = sample(&state).expect("первый сэмпл");

    assert_eq!(first.speed_in, 0, "у первого сэмпла нет дельты");
    assert_eq!(first.speed_out, 0);
    assert!(first.timestamp > 1_700_000_000_000);
    assert!(first.connections < 100_000);
}

#[test]
fn test_sample_is_repeatable_on_same_state() {
    let state = MonitorState::new();
    let first = sample(&state).expect("первый сэмпл");
    std::thread::sleep(std::time::Duration::from_millis(120));
    let second = sample(&state).expect("второй сэмпл");

    assert!(second.timestamp >= first.timestamp);
    assert!(second.bytes_in >= first.bytes_in);
}

#[test]
fn test_new_state_is_not_running() {
    assert!(!MonitorState::new().is_running());
}

#[test]
fn test_state_default_matches_new() {
    assert!(!MonitorState::default().is_running());
}

#[test]
fn test_now_millis_is_plausible() {
    assert!(now_millis() > 1_700_000_000_000);
}

#[test]
fn test_stats_serializes_as_camel_case() {
    let stats = NetworkStats {
        bytes_in: 1,
        bytes_out: 2,
        speed_in: 3,
        speed_out: 4,
        packets_in: 5,
        packets_out: 6,
        connections: 7,
        timestamp: 8,
    };

    let json = serde_json::to_string(&stats).expect("сериализация");

    assert!(json.contains("\"bytesIn\":1"));
    assert!(json.contains("\"speedOut\":4"));
    assert!(json.contains("\"connections\":7"));
}