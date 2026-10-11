use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Once;
use std::time::{Duration, Instant};

use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, Runtime, Window, WindowEvent,
};
use winapi::shared::windef::{HWND, POINT};
use winapi::um::winuser::{
    BringWindowToTop, GetAsyncKeyState, GetCursorPos, GetForegroundWindow,
    SetForegroundWindow, VK_LBUTTON, VK_RBUTTON,
};

pub const MENU_WINDOW_LABEL: &str = "tray-menu";
pub const EVENT_MENU_OPEN: &str = "tray-menu-open";
pub const EVENT_MENU_CORNER: &str = "tray-menu-corner";

const MENU_WIDTH: f64 = 236.0;
const MENU_HEIGHT: f64 = 332.0;
const CURSOR_GAP: f64 = 10.0;
const WATCH_INTERVAL_MS: u64 = 60;
const WARMUP_DELAY_MS: u64 = 2000;
const WARMUP_VISIBLE_MS: u64 = 16;
const SLOW_SHOW_MS: u128 = 100;

static READY: AtomicBool = AtomicBool::new(false);
static WATCH_STARTED: Once = Once::new();
static WARMUP_STARTED: Once = Once::new();

pub fn mark_ready() {
    READY.store(true, Ordering::SeqCst);
}

pub fn is_ready() -> bool {
    READY.load(Ordering::SeqCst)
}

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

    ensure_watch_thread(app);

    let started = Instant::now();
    let scale = window.scale_factor().unwrap_or(1.0);
    let width = MENU_WIDTH * scale;
    let height = MENU_HEIGHT * scale;

    let mut x = cursor.x - width + 14.0 * scale;
    let mut y = cursor.y - height - CURSOR_GAP * scale;
    let mut area = None;

    if let Some(monitor) = window.current_monitor().ok().flatten() {
        let work = monitor.work_area();
        let left = f64::from(work.position.x);
        let top = f64::from(work.position.y);
        let right = left + f64::from(work.size.width);
        let bottom = top + f64::from(work.size.height);

        x = x.clamp(left, (right - width).max(left));
        y = y.clamp(top, (bottom - height).max(top));
        area = Some((left, top, right, bottom));
    }

    let positioned = started.elapsed();

    let _ = window.set_position(PhysicalPosition::new(x, y));
    let _ = window.show();

    let shown = started.elapsed();

    let corner = match area {
        Some(work) => corner_for(x, y, width, height, work),
        None => "top-left",
    };

    let _ = app.emit_to(MENU_WINDOW_LABEL, EVENT_MENU_CORNER, corner);
    let _ = app.emit_to(
        MENU_WINDOW_LABEL,
        EVENT_MENU_OPEN,
        snapshot_payload(app),
    );

    let _ = window.set_focus();

    if let Ok(handle) = window.hwnd() {
        let hwnd = handle.0 as HWND;

        unsafe {
            BringWindowToTop(hwnd);
            SetForegroundWindow(hwnd);
        }
    }

    let total = started.elapsed();

    tracing::debug!(
        "tray-menu: pos={}ms show={}ms total={}ms corner={corner}",
        positioned.as_millis(),
        shown.as_millis(),
        total.as_millis()
    );

    if total.as_millis() > SLOW_SHOW_MS {
        tracing::warn!("tray-menu открылся медленно: {}ms", total.as_millis());
    }
}

fn snapshot_payload<R: Runtime>(app: &AppHandle<R>) -> crate::commands::tray::TrayMenuSnapshot {
    let (state, active_strategy, vpn_name) = crate::tray::snapshot(app);

    crate::commands::tray::TrayMenuSnapshot::from_parts(state, active_strategy, vpn_name)
}

pub fn corner_for(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    area: (f64, f64, f64, f64),
) -> &'static str {
    let (left, top, right, bottom) = area;

    if x - left < (right - width - x).max(0.0) {
        if y - top < (bottom - height - y).max(0.0) {
            "top-left"
        } else {
            "bottom-left"
        }
    } else if y - top < (bottom - height - y).max(0.0) {
        "top-right"
    } else {
        "bottom-right"
    }
}

pub fn schedule_warmup<R: Runtime>(app: AppHandle<R>) {
    WARMUP_STARTED.call_once(|| {
        std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(WARMUP_DELAY_MS));

            let Some(window) = menu_window(&app) else {
                return;
            };

            if !is_ready() || window.is_visible().unwrap_or(false) {
                return;
            }

            let _ = window.set_position(PhysicalPosition::new(-1000.0, -1000.0));
            let _ = window.show();
            std::thread::sleep(Duration::from_millis(WARMUP_VISIBLE_MS));
            let _ = window.hide();
            tracing::debug!("tray-menu прогрет");
        });
    });
}

fn ensure_watch_thread<R: Runtime>(app: &AppHandle<R>) {
    WATCH_STARTED.call_once(|| {
        let watcher = app.clone();

        std::thread::spawn(move || loop {
            std::thread::sleep(Duration::from_millis(WATCH_INTERVAL_MS));

            let Some(window) = menu_window(&watcher) else {
                continue;
            };

            if !window.is_visible().unwrap_or(false) {
                continue;
            }

            let left = unsafe { GetAsyncKeyState(VK_LBUTTON) } < 0;
            let right = unsafe { GetAsyncKeyState(VK_RBUTTON) } < 0;

            if (left || right) && !cursor_inside_current(&window) {
                let _ = window.hide();
            }
        });
    });
}

fn cursor_inside_current<R: Runtime>(window: &tauri::WebviewWindow<R>) -> bool {
    let Ok(position) = window.outer_position() else {
        return true;
    };
    let Ok(size) = window.outer_size() else {
        return true;
    };

    cursor_inside(
        f64::from(position.x),
        f64::from(position.y),
        f64::from(size.width),
        f64::from(size.height),
    )
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

    #[test]
    fn test_corner_detection() {
        let area = (0.0, 0.0, 1920.0, 1080.0);
        let size = (MENU_WIDTH, MENU_HEIGHT);

        assert_eq!(
            corner_for(10.0, 10.0, size.0, size.1, area),
            "top-left"
        );
        assert_eq!(
            corner_for(1920.0 - size.0 - 10.0, 10.0, size.0, size.1, area),
            "top-right"
        );
        assert_eq!(
            corner_for(10.0, 1080.0 - size.1 - 10.0, size.0, size.1, area),
            "bottom-left"
        );
        assert_eq!(
            corner_for(
                1920.0 - size.0 - 10.0,
                1080.0 - size.1 - 10.0,
                size.0,
                size.1,
                area
            ),
            "bottom-right"
        );
    }

    #[test]
    fn test_ready_flag_toggles() {
        mark_ready();

        assert!(is_ready());
    }
}