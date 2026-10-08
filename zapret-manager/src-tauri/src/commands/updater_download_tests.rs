use super::*;
use std::time::Instant;

#[test]
fn test_build_progress_reports_percent_and_eta() {
    let progress = build_progress(512, 1024, Instant::now());

    assert_eq!(progress.percent, 50.0);
    assert_eq!(progress.downloaded, 512);
    assert!(progress.speed > 0);
}

#[test]
fn test_build_progress_without_total_has_zero_percent() {
    let progress = build_progress(512, 0, Instant::now());

    assert_eq!(progress.percent, 0.0);
    assert!(progress.eta.is_none());
}

#[test]
fn test_build_progress_clamps_above_hundred() {
    let progress = build_progress(2048, 1024, Instant::now());

    assert_eq!(progress.percent, 100.0);
    assert_eq!(progress.eta, Some(0));
}

#[test]
fn test_progress_serializes_as_camel_case() {
    let json = serde_json::to_string(&build_progress(1, 2, Instant::now())).unwrap();

    assert!(json.contains("\"downloaded\":1"));
    assert!(json.contains("\"total\":2"));
}

#[test]
fn test_state_starts_unrequested() {
    let state = UpdateState::new();

    assert!(!state.is_cancelled());
    state.cancel();
    assert!(state.is_cancelled());
    state.reset();
    assert!(!state.is_cancelled());
}

#[test]
fn test_event_name_is_stable() {
    assert_eq!(EVENT_UPDATE_PROGRESS, "update-download-progress");
}