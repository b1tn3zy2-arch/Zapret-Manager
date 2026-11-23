// Подключаем модули: std::sync::RwLock;.
use std::sync::RwLock;

// Подключаем модули: tauri::{AppHandle, Manager, WindowEvent};.
use tauri::{AppHandle, Manager, WindowEvent};

// Подключаем модули: crate::tray::WINDOW_LABEL;.
use crate::tray::WINDOW_LABEL;

// Применяем атрибут к следующему объявлению.
#[derive(Default)]
// Объявляем структуру WindowBehavior.
pub struct WindowBehavior {
    // Выполняем операцию: pub minimize_to_tray: RwLock<bool>,.
    pub minimize_to_tray: RwLock<bool>,
    // Выполняем операцию: pub quitting: RwLock<bool>,.
    pub quitting: RwLock<bool>,
    // Выполняем операцию: pub minimize_hint_shown: RwLock<bool>,.
    pub minimize_hint_shown: RwLock<bool>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl WindowBehavior {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: minimize_to_tray: RwLock::new(true),.
            minimize_to_tray: RwLock::new(true),
            // Выполняем операцию: quitting: RwLock::new(false),.
            quitting: RwLock::new(false),
            // Выполняем операцию: minimize_hint_shown: RwLock::new(false),.
            minimize_hint_shown: RwLock::new(false),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию minimize_to_tray.
    pub fn minimize_to_tray(&self) -> bool {
        // Выполняем операцию: self.minimize_to_tray.
        self.minimize_to_tray
            // Выполняем операцию: .read().
            .read()
            // Выполняем операцию: .map(|value| *value).
            .map(|value| *value)
            // Выполняем операцию: .unwrap_or(true).
            .unwrap_or(true)
        // Закрываем блок.
    }

    // Объявляем функцию set_minimize_to_tray.
    pub fn set_minimize_to_tray(&self, value: bool) {
        // Проверяем условие: let Ok(mut slot) = self.minimize_to_tray.write() {.
        if let Ok(mut slot) = self.minimize_to_tray.write() {
            *slot = value;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию is_quitting.
    pub fn is_quitting(&self) -> bool {
        // Выполняем операцию: self.quitting.read().map(|value| *value).unwrap_or(fals.
        self.quitting.read().map(|value| *value).unwrap_or(false)
        // Закрываем блок.
    }

    // Объявляем функцию begin_quit.
    pub fn begin_quit(&self) {
        // Проверяем условие: let Ok(mut slot) = self.quitting.write() {.
        if let Ok(mut slot) = self.quitting.write() {
            *slot = true;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию mark_minimize_hint_shown.
    pub fn mark_minimize_hint_shown(&self) -> bool {
        // Объявляем переменную Ok(mut slot) .
        let Ok(mut slot) = self.minimize_hint_shown.write() else {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        };

        // Проверяем условие: *slot {.
        if *slot {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }

        *slot = true;

        // Выполняем операцию: true.
        true
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию notify_first_minimize.
fn notify_first_minimize(app: &AppHandle, state: &WindowBehavior) {
    // Проверяем условие: !state.mark_minimize_hint_shown() {.
    if !state.mark_minimize_hint_shown() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = crate::commands::notify::send(
        // Выполняем операцию: app,.
        app,
        // Выполняем операцию: "Zapret",.
        "Zapret",
        // Выполняем операцию: "Приложение свёрнуто в трей. Окно можно вернуть кликом .
        "Приложение свёрнуто в трей. Окно можно вернуть кликом по иконке.",
        // Выполняем операцию: crate::tray::NotificationKind::Info,.
        crate::tray::NotificationKind::Info,
        // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Объявляем функцию register.
pub fn register(app: &AppHandle) {
    // Выполняем операцию: app.manage(WindowBehavior::new());.
    app.manage(WindowBehavior::new());
    // Закрываем блок.
}

// Объявляем функцию set_minimize_to_tray.
pub fn set_minimize_to_tray(app: &AppHandle, value: bool) {
    // Проверяем условие: let Some(state) = app.try_state::<WindowBehavior>(.
    if let Some(state) = app.try_state::<WindowBehavior>() {
        // Выполняем операцию: state.set_minimize_to_tray(value);.
        state.set_minimize_to_tray(value);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию set_minimize_to_tray_cmd.
pub fn set_minimize_to_tray_cmd(app: AppHandle, value: bool) {
    // Выполняем операцию: set_minimize_to_tray(&app, value);.
    set_minimize_to_tray(&app, value);
    // Закрываем блок.
}

// Объявляем функцию begin_quit.
pub fn begin_quit(app: &AppHandle) {
    // Проверяем условие: let Some(state) = app.try_state::<WindowBehavior>(.
    if let Some(state) = app.try_state::<WindowBehavior>() {
        // Выполняем операцию: state.begin_quit();.
        state.begin_quit();
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию hide_window.
pub fn hide_window(app: &AppHandle) {
    // Проверяем условие: let Some(window) = app.get_webview_window(WINDOW_L.
    if let Some(window) = app.get_webview_window(WINDOW_LABEL) {
        // Объявляем переменную _ .
        let _ = window.hide();
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию handle_window_event.
pub fn handle_window_event(app: &AppHandle, event: &WindowEvent, cleanup: impl FnOnce() -> usize) {
    // Объявляем переменную WindowEvent.
    let WindowEvent::CloseRequested { api, .. } = event else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную Some(state) .
    let Some(state) = app.try_state::<WindowBehavior>() else {
        // Выполняем операцию: cleanup();.
        cleanup();

        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Проверяем условие: state.is_quitting() || !state.minimize_to_tray() {.
    if state.is_quitting() || !state.minimize_to_tray() {
        // Выполняем операцию: cleanup();.
        cleanup();

        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Выполняем операцию: api.prevent_close();.
    api.prevent_close();
    // Выполняем операцию: hide_window(app);.
    hide_window(app);
    // Выполняем операцию: notify_first_minimize(app, &state);.
    notify_first_minimize(app, &state);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_default_behavior_minimizes_to_tray.
    fn test_default_behavior_minimizes_to_tray() {
        // Объявляем переменную behavior .
        let behavior = WindowBehavior::new();

        // Выполняем операцию: assert!(behavior.minimize_to_tray());.
        assert!(behavior.minimize_to_tray());
        // Выполняем операцию: assert!(!behavior.is_quitting());.
        assert!(!behavior.is_quitting());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_set_minimize_to_tray_flips_flag.
    fn test_set_minimize_to_tray_flips_flag() {
        // Объявляем переменную behavior .
        let behavior = WindowBehavior::new();
        // Выполняем операцию: behavior.set_minimize_to_tray(false);.
        behavior.set_minimize_to_tray(false);

        // Выполняем операцию: assert!(!behavior.minimize_to_tray());.
        assert!(!behavior.minimize_to_tray());

        // Выполняем операцию: behavior.set_minimize_to_tray(true);.
        behavior.set_minimize_to_tray(true);

        // Выполняем операцию: assert!(behavior.minimize_to_tray());.
        assert!(behavior.minimize_to_tray());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_begin_quit_latches.
    fn test_begin_quit_latches() {
        // Объявляем переменную behavior .
        let behavior = WindowBehavior::new();
        // Выполняем операцию: behavior.begin_quit();.
        behavior.begin_quit();

        // Выполняем операцию: assert!(behavior.is_quitting());.
        assert!(behavior.is_quitting());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_minimize_hint_shown_only_once.
    fn test_minimize_hint_shown_only_once() {
        // Объявляем переменную behavior .
        let behavior = WindowBehavior::new();

        // Выполняем операцию: assert!(behavior.mark_minimize_hint_shown());.
        assert!(behavior.mark_minimize_hint_shown());
        // Выполняем операцию: assert!(!behavior.mark_minimize_hint_shown());.
        assert!(!behavior.mark_minimize_hint_shown());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_minimize_does_not_latch_quit.
    fn test_minimize_does_not_latch_quit() {
        // Объявляем переменную behavior .
        let behavior = WindowBehavior::new();

        // Выполняем операцию: assert!(behavior.minimize_to_tray());.
        assert!(behavior.minimize_to_tray());

        // Выполняем операцию: behavior.mark_minimize_hint_shown();.
        behavior.mark_minimize_hint_shown();

        // Выполняем операцию: assert!(!behavior.is_quitting());.
        assert!(!behavior.is_quitting());
        // Закрываем блок.
    }
    // Закрываем блок.
}
