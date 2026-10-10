use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, PhysicalPosition,
};

const MENU_WIDTH: f64 = 300.0;
const MENU_ESTIMATED_HEIGHT: f64 = 380.0;
const TASKBAR_GAP: f64 = 8.0;

pub const MENU_WINDOW_LABEL: &str = "tray-menu";

pub fn is_menu_window(label: &str) -> bool {
    label == MENU_WINDOW_LABEL
}

pub fn menu_window(app: &AppHandle) -> Option<tauri::WebviewWindow> {
    app.get_webview_window(MENU_WINDOW_LABEL)
}

pub fn hide_menu(app: &AppHandle) {
    if let Some(window) = menu_window(app) {
        let _ = window.hide();
    }
}

pub fn position_near_cursor(app: &AppHandle, cursor: PhysicalPosition<f64>) {
    let Some(window) = menu_window(app) else {
        return;
    };

    let Ok(scale) = window.scale_factor() else {
        return;
    };

    let scale = scale.max(1.0);
    let size = window
        .outer_size()
        .map(|value| value.to_logical::<f64>(scale))
        .unwrap_or(LogicalSize::new(MENU_WIDTH, MENU_ESTIMATED_HEIGHT));

    let (screen_x, screen_y) = window
        .current_monitor()
        .ok()
        .flatten()
        .map(|monitor| {
            let position = monitor.position();

            (f64::from(position.x), f64::from(position.y))
        })
        .unwrap_or((0.0, 0.0));

    let scale_factor = window
        .current_monitor()
        .ok()
        .flatten()
        .map(|monitor| monitor.scale_factor())
        .unwrap_or(scale);

    let cursor_x = (cursor.x - screen_x) / scale_factor;
    let cursor_y = (cursor.y - screen_y) / scale_factor;

    let mut x = cursor_x - size.width / 2.0;
    let mut y = cursor_y + TASKBAR_GAP;

    if y + size.height > work_area_height(app, scale_factor) {
        y = cursor_y - size.height - TASKBAR_GAP;
    }

    x = x.max(0.0);

    let _ = window.set_position(LogicalPosition::new(x, y));
}

fn work_area_height(app: &AppHandle, scale_factor: f64) -> f64 {
    let window = match app.get_webview_window(crate::tray::WINDOW_LABEL) {
        Some(value) => value,
        None => return MENU_ESTIMATED_HEIGHT,
    };

    window
        .current_monitor()
        .ok()
        .flatten()
        .map(|monitor| f64::from(monitor.work_area().size.height) / scale_factor)
        .unwrap_or(MENU_ESTIMATED_HEIGHT)
}

pub fn show_menu(app: &AppHandle, cursor: PhysicalPosition<f64>) {
    let Some(window) = menu_window(app) else {
        return;
    };

    hide_main_window(app);

    let _ = window.show();
    let _ = window.set_focus();
    position_near_cursor(app, cursor);
}

fn hide_main_window(app: &AppHandle) {
    let _ = app.emit("tray:menu-opened", ());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recognizes_menu_window() {
        assert!(is_menu_window("tray-menu"));
        assert!(!is_menu_window("main"));
    }

    #[test]
    fn test_menu_window_label_is_stable() {
        assert_eq!(MENU_WINDOW_LABEL, "tray-menu");
    }
}