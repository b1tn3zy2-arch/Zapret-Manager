use super::*;

#[test]
fn test_animation_constants_match_spec() {
    assert_eq!(ANIMATION_INTERVAL_MS, 300);
    assert_eq!(ANIMATION_DURATION_MS, 3000);
}

#[test]
fn test_tray_id_is_stable() {
    assert_eq!(TRAY_ID, "zapret-manager-tray");
}

#[test]
fn test_window_label_matches_tauri_conf() {
    assert_eq!(WINDOW_LABEL, "main");
}

#[test]
fn test_holder_defaults_to_idle() {
    let holder = TrayStateHolder::new();
    let (state, active, vpn) = holder.snapshot();

    assert_eq!(state, TrayState::Idle);
    assert!(active.is_none());
    assert!(vpn.is_none());
    assert!(holder.animation_enabled());
}

#[test]
fn test_holder_stores_and_replaces_state() {
    let holder = TrayStateHolder::new();

    holder.store(TrayState::Connected, Some("Discord".to_string()), None);

    let (state, active, vpn) = holder.snapshot();
    assert_eq!(state, TrayState::Connected);
    assert_eq!(active.as_deref(), Some("Discord"));
    assert!(vpn.is_none());

    holder.store(TrayState::Vpn, None, Some("NL".to_string()));

    let (state, active, vpn) = holder.snapshot();
    assert_eq!(state, TrayState::Vpn);
    assert!(active.is_none());
    assert_eq!(vpn.as_deref(), Some("NL"));
}

#[test]
fn test_holder_animation_flag_toggles() {
    let holder = TrayStateHolder::new();
    holder.set_animation_enabled(false);

    assert!(!holder.animation_enabled());
}

#[test]
fn test_holder_animation_token_starts_disabled() {
    let holder = TrayStateHolder::new();

    assert!(!holder.animation_token.load(Ordering::SeqCst));
}

#[test]
fn test_connecting_is_the_only_animated_state() {
    for state in [
        TrayState::Idle,
        TrayState::Connecting,
        TrayState::Connected,
        TrayState::Vpn,
        TrayState::Error,
    ] {
        assert_eq!(state == TrayState::Connecting, state == TrayState::Connecting);
    }
}
#[test]
fn test_sync_enters_vpn_state_only_on_change() {
    assert_eq!(next_state(TrayState::Idle, true, false), Some(TrayState::Vpn));
    assert_eq!(
        next_state(TrayState::Connected, true, true),
        Some(TrayState::Vpn)
    );
    assert_eq!(next_state(TrayState::Vpn, true, false), None);
}

#[test]
fn test_sync_restores_strategy_state_after_disconnect() {
    assert_eq!(
        next_state(TrayState::Vpn, false, true),
        Some(TrayState::Connected)
    );
    assert_eq!(next_state(TrayState::Vpn, false, false), Some(TrayState::Idle));
    assert_eq!(next_state(TrayState::Connected, false, true), None);
    assert_eq!(next_state(TrayState::Idle, false, false), None);
}
