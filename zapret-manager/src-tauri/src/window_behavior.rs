use std::sync::RwLock;

use tauri::{AppHandle, Manager, WindowEvent};

use crate::tray::WINDOW_LABEL;

#[derive(Default)]
pub struct WindowBehavior {
    pub minimize_to_tray: RwLock<bool>,
    pub quitting: RwLock<bool>,
}

impl WindowBehavior {
    pub fn new() -> Self {
        Self {
            minimize_to_tray: RwLock::new(true),
            quitting: RwLock::new(false),
        }
    }

    pub fn minimize_to_tray(&self) -> bool {
        self.minimize_to_tray
            .read()
            .map(|value| *value)
            .unwrap_or(true)
    }

    pub fn set_minimize_to_tray(&self, value: bool) {
        if let Ok(mut slot) = self.minimize_to_tray.write() {
            *slot = value;
        }
    }

    pub fn is_quitting(&self) -> bool {
        self.quitting.read().map(|value| *value).unwrap_or(false)
    }

    pub fn begin_quit(&self) {
        if let Ok(mut slot) = self.quitting.write() {
            *slot = true;
        }
    }
}

pub fn register(app: &AppHandle) {
    app.manage(WindowBehavior::new());
}

pub fn set_minimize_to_tray(app: &AppHandle, value: bool) {
    if let Some(state) = app.try_state::<WindowBehavior>() {
        state.set_minimize_to_tray(value);
    }
}

#[tauri::command]
pub fn set_minimize_to_tray_cmd(app: AppHandle, value: bool) {
    set_minimize_to_tray(&app, value);
}

pub fn begin_quit(app: &AppHandle) {
    if let Some(state) = app.try_state::<WindowBehavior>() {
        state.begin_quit();
    }
}

pub fn hide_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL) {
        let _ = window.hide();
    }
}

pub fn handle_window_event(
    app: &AppHandle,
    event: &WindowEvent,
    cleanup: impl FnOnce() -> usize,
) {
    if !matches!(event, WindowEvent::CloseRequested { .. }) {
        return;
    }

    let Some(state) = app.try_state::<WindowBehavior>() else {
        cleanup();

        return;
    };

    if !state.is_quitting() && state.minimize_to_tray() {
        state.begin_quit();
        hide_window(app);

        return;
    }

    cleanup();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_behavior_minimizes_to_tray() {
        let behavior = WindowBehavior::new();

        assert!(behavior.minimize_to_tray());
        assert!(!behavior.is_quitting());
    }

    #[test]
    fn test_set_minimize_to_tray_flips_flag() {
        let behavior = WindowBehavior::new();
        behavior.set_minimize_to_tray(false);

        assert!(!behavior.minimize_to_tray());

        behavior.set_minimize_to_tray(true);

        assert!(behavior.minimize_to_tray());
    }

    #[test]
    fn test_begin_quit_latches() {
        let behavior = WindowBehavior::new();
        behavior.begin_quit();

        assert!(behavior.is_quitting());
    }
}