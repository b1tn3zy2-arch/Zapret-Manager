use std::time::Duration;

use tauri::{
    AppHandle, Manager, PhysicalPosition, Runtime, Window, WindowEvent,
};
use winapi::shared::windef::{HWND, POINT};
use winapi::um::winuser::{
    BringWindowToTop, GetAsyncKeyState, GetCursorPos, GetForegroundWindow,
    SetForegroundWindow, VK_LBUTTON, VK_RBUTTON,
};

pub const MENU_WINDOW_LABEL: &str = "tray-menu";

const MENU_WIDTH: f64 = 236.0;
const MENU_HEIGHT: f64 = 332.0;
const CURSOR_GAP: f64 = 10.0;
const WATCH_INTERVAL_MS: u64 = 60;

pub fn menu_window<R: Runtime>(app: &AppHandle<R>) -> Option<tauri::WebviewWindow<R>> {
    app.get_webview_window(MENU_WINDOW_LABEL)
}

pub fn hide<R: Runtime>(app: &AppHandle<R>) {
    if let Some(window) = menu_window(app) {
        let _ = window.hide();
    }
}

pub fn show<R: Runtime>(app: &AppHandle<R>, cursor: PhysicalPosition<f64>) {
    let Some(window) = menu_window(app) else {
        return;
    };

    if window.is_visible().unwrap_or(false) {
        let _ = window.hide();

        return;
    }

    let scale = window.scale_factor().unwrap_or(1.0);
    let width = MENU_WIDTH * scale;
    let height = MENU_HEIGHT * scale;

    let mut x = cursor.x - width + 14.0 * scale;
    let mut y = cursor.y - height - CURSOR_GAP * scale;

    if let Some(monitor) = window.current_monitor().ok().flatten() {
        let area = monitor.work_area();
        let left = f64::from(area.position.x);
        let top = f64::from(area.position.y);
        let right = left + f64::from(area.size.width);
        let bottom = top + f64::from(area.size.height);

        x = x.clamp(left, (right - width).max(left));
        y = y.clamp(top, (bottom - height).max(top));
    }

    let _ = window.set_position(PhysicalPosition::new(x, y));
    let _ = window.show();
    let _ = window.set_focus();

    if let Ok(handle) = window.hwnd() {
        let hwnd = handle.0 as HWND;

        unsafe {
            BringWindowToTop(hwnd);
            SetForegroundWindow(hwnd);
        }
    }

    spawn_outside_click_watch(app.clone(), x, y, width, height);
}

fn spawn_outside_click_watch<R: Runtime>(
    app: AppHandle<R>,
    x: f64,
    y: f64,
    width: f64,
    height: f64,
) {
    std::thread::spawn(move || {
        let mut armed = false;

        loop {
            std::thread::sleep(Duration::from_millis(WATCH_INTERVAL_MS));

            let Some(window) = menu_window(&app) else {
                break;
            };

            if !window.is_visible().unwrap_or(false) {
                break;
            }

            let left = unsafe { GetAsyncKeyState(VK_LBUTTON) } < 0;
            let right = unsafe { GetAsyncKeyState(VK_RBUTTON) } < 0;
            let button_down = left || right;

            if !armed {
                if !button_down {
                    armed = true;
                }

                continue;
            }

            if button_down && !cursor_inside(x, y, width, height) {
                let _ = window.hide();

                break;
            }
        }
    });
}

fn cursor_inside(x: f64, y: f64, width: f64, height: f64) -> bool {
    let mut point = POINT { x: 0, y: 0 };
    let found = unsafe { GetCursorPos(&mut point) };

    if found == 0 {
        return true;
    }

    let px = f64::from(point.x);
    let py = f64::from(point.y);

    px >= x && px <= x + width && py >= y && py <= y + height
}

pub fn handle_window_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    match event {
        WindowEvent::Focused(false) => {
            let hwnd = window.hwnd().ok().map(|handle| handle.0 as HWND);

            if let Some(hwnd) = hwnd {
                let foreground = unsafe { GetForegroundWindow() };

                if foreground != hwnd {
                    let _ = window.hide();
                }
            } else {
                let _ = window.hide();
            }
        }
        WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let _ = window.hide();
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clamp_keeps_menu_inside_area() {
        let left = 0.0;
        let right = 1920.0;
        let width = MENU_WIDTH;
        let candidates = [1900.0 - width, 100.0 - width, 960.0 - width];

        for value in candidates {
            let x = value.clamp(left, (right - width).max(left));

            assert!((left..=right - width).contains(&x));
        }
    }

    #[test]
    fn test_clamp_negative_position() {
        assert_eq!((-50.0_f64).clamp(0.0, 1000.0), 0.0);
    }

    #[test]
    fn test_menu_dimensions_are_compact() {
        let size = (MENU_WIDTH, MENU_HEIGHT);

        assert!(size.0 <= 260.0 && size.1 <= 340.0);
    }

    #[test]
    fn test_cursor_check_math() {
        let contains = |px: f64, py: f64| {
            (100.0..=300.0).contains(&px) && (100.0..=400.0).contains(&py)
        };

        assert!(contains(150.0, 200.0));
        assert!(!contains(50.0, 200.0));
        assert!(!contains(150.0, 500.0));
    }
}