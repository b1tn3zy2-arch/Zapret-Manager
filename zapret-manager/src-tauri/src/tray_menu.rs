use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Mutex, Once};
use std::time::{Duration, Instant};

use tauri::{
    AppHandle, Emitter, LogicalSize, Manager, PhysicalPosition, Runtime, Window, WindowEvent,
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
/// Границы, в которые укладывается высота, посчитанная окном меню.
const MENU_MIN_HEIGHT: f64 = 180.0;
const MENU_MAX_HEIGHT: f64 = 720.0;
const CURSOR_GAP: f64 = 10.0;
const WATCH_INTERVAL_MS: u64 = 60;
const WARMUP_DELAY_MS: u64 = 2000;
const WARMUP_VISIBLE_MS: u64 = 16;
const SLOW_SHOW_MS: u128 = 100;

static READY: AtomicBool = AtomicBool::new(false);
static WATCH_STARTED: Once = Once::new();
static WARMUP_STARTED: Once = Once::new();
/// Высота меню, посчитанная окном: пункты списка меняются, и окно обязано
/// подстраиваться под них. Ноль означает «использовать константный размер».
static CONTENT_HEIGHT: Mutex<f64> = Mutex::new(0.0);
/// Высота, которую окну уже выставили: пересоздавать размер при каждом
/// открытии нельзя, Windows на это отвечает заметным пересозданием окна.
static APPLIED_HEIGHT: Mutex<f64> = Mutex::new(0.0);
/// Момент последнего показа: пока кнопка мыши нажата (пользователь только что
/// нажал на трей), курсор заведомо вне окна меню, и без паузы вотчер сразу
/// его закрывал — меню дёргалось и мигало.
static SHOWN_AT: Mutex<Option<Instant>> = Mutex::new(None);

/// Пауза после показа, в течение которой вотчер не закрывает меню.
const SHOW_GRACE: Duration = Duration::from_millis(450);

pub fn mark_ready() {
    READY.store(true, Ordering::SeqCst);
}

/// Принимает высоту, измеренную в окне меню.
///
/// Высота запоминается, но размер подвижного окна меняется только когда меню
/// не видно. Раньше размер применялся сразу, и окно подстраивалось уже
/// открытым: содержимое измеряется после показа, поэтому меню дёргалось и
/// меняло высоту прямо на глазах.
pub fn set_content_height<R: Runtime>(app: &AppHandle<R>, height: f64) {
    let Some(clamped) = store_content_height(height) else {
        return;
    };

    let Some(window) = menu_window(app) else {
        return;
    };

    if window.is_visible().unwrap_or(false) {
        return;
    }

    apply_height(&window, clamped);
}

/// Запоминает измеренную высоту содержимого и возвращает её, если значение
/// изменилось.
fn store_content_height(height: f64) -> Option<f64> {
    if !height.is_finite() {
        return None;
    }

    let clamped = height.clamp(MENU_MIN_HEIGHT, MENU_MAX_HEIGHT);
    let mut slot = CONTENT_HEIGHT.lock().ok()?;

    if (*slot - clamped).abs() < 0.5 {
        return None;
    }

    *slot = clamped;

    Some(clamped)
}

/// Приводит размер окна к измеренной высоте содержимого.
fn apply_height<R: Runtime>(window: &tauri::WebviewWindow<R>, height: f64) {
    let changed = APPLIED_HEIGHT
        .lock()
        .map(|current| (*current - height).abs() > 0.5)
        .unwrap_or(true);

    if !changed {
        return;
    }

    let _ = window.set_size(LogicalSize::new(MENU_WIDTH, height));

    if let Ok(mut applied) = APPLIED_HEIGHT.lock() {
        *applied = height;
    }
}

fn content_height() -> f64 {
    CONTENT_HEIGHT
        .lock()
        .map(|value| *value)
        .unwrap_or(0.0)
        .clamp(MENU_MIN_HEIGHT, MENU_MAX_HEIGHT)
}

fn resolved_height() -> f64 {
    let measured = content_height();

    if measured > 0.0 {
        measured
    } else {
        MENU_HEIGHT
    }
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

    // Монитор под курсором нужен и для масштаба: у разных мониторов разная
    // плотность, и масштаб окна не совпадает с масштабом экрана, где меню
    // должно появиться. Из-за этого окно приходилось в неверную точку.
    let monitor = monitor_under_cursor(&window);
    let scale = monitor
        .as_ref()
        .map(|item| item.scale_factor())
        .unwrap_or_else(|| window.scale_factor().unwrap_or(1.0));

    // Размер окна подгоняется под реальное содержимое до позиционирования,
    // иначе меню показывается с обрезанным низом. Пока окно скрыто, размер
    // обновляется свободно; видимое окно не трогаем — пересоздание и
    // перерисовка видимого меню читаются как рывок.
    let target_height = resolved_height();
    apply_height(&window, target_height);

    let width = MENU_WIDTH * scale;
    let height = target_height * scale;

    // Монитор выбирается по позиции курсора, а не по монитору самого окна.
    // Окно меню живёт на основном мониторе, поэтому current_monitor() при
    // втором экране уводил меню на него: трей на дополнительном мониторе
    // открывался не там, где нажали.
    let mut x = cursor.x - width + 14.0 * scale;
    let mut y = cursor.y - height - CURSOR_GAP * scale;
    let mut area = None;

    if let Some(monitor) = monitor.as_ref() {
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

    if let Ok(mut shown_at) = SHOWN_AT.lock() {
        *shown_at = Some(Instant::now());
    }

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

            // сразу после нажатия на трей кнопка ещё зажата, а курсор
            // находится на иконке, то есть заведомо вне окна меню. Без паузы
            // меню закрывалось в тот же кадр и выглядело как рывок
            let within_grace = SHOWN_AT
                .lock()
                .ok()
                .and_then(|shown| *shown)
                .map(|shown| shown.elapsed() < SHOW_GRACE)
                .unwrap_or(false);

            if within_grace {
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

/// Монитор, на котором в данный момент находится курсор.
fn monitor_under_cursor<R: Runtime>(
    window: &tauri::WebviewWindow<R>,
) -> Option<tauri::Monitor> {
    let mut point = POINT { x: 0, y: 0 };

    if unsafe { GetCursorPos(&mut point) } == 0 {
        return window.current_monitor().ok().flatten();
    }

    let px = f64::from(point.x);
    let py = f64::from(point.y);

    let monitors = window.available_monitors().ok()?;

    monitors
        .into_iter()
        .find(|monitor| {
            let position = monitor.position();
            let size = monitor.size();
            let left = f64::from(position.x);
            let top = f64::from(position.y);

            px >= left
                && px < left + f64::from(size.width)
                && py >= top
                && py < top + f64::from(size.height)
        })
        .or_else(|| window.primary_monitor().ok().flatten())
        .or_else(|| window.current_monitor().ok().flatten())
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

    #[test]
    fn test_content_height_clamps_and_applies() {
        assert!(resolved_height() >= MENU_MIN_HEIGHT);

        store_content_height(409.0);
        assert!((resolved_height() - 409.0).abs() < 0.5);

        // пункт «Выход» живёт в самом низу списка: обрезанная высота означает
        // недоступную кнопку выхода, поэтому границы обязаны быть широкими
        store_content_height(10_000.0);
        assert!((resolved_height() - MENU_MAX_HEIGHT).abs() < 0.5);

        store_content_height(1.0);
        assert!((resolved_height() - MENU_MIN_HEIGHT).abs() < 0.5);

        store_content_height(f64::NAN);
        assert!(resolved_height().is_finite());

        store_content_height(MENU_HEIGHT);
    }

    #[test]
    fn test_grace_window_protects_freshly_shown_menu() {
        // сразу после нажатия на трей кнопка мыши ещё зажата, а курсор на
        // иконке: без паузы вотчер закрывал меню в тот же кадр
        if let Ok(mut shown_at) = SHOWN_AT.lock() {
            *shown_at = Some(Instant::now());
        }

        let within_grace = SHOWN_AT
            .lock()
            .ok()
            .and_then(|shown| *shown)
            .map(|shown| shown.elapsed() < SHOW_GRACE)
            .unwrap_or(false);

        assert!(within_grace, "только что показанное меню не защищено паузой");

        if let Ok(mut shown_at) = SHOWN_AT.lock() {
            *shown_at = None;
        }

        let after_hide = SHOWN_AT
            .lock()
            .ok()
            .and_then(|shown| *shown)
            .map(|shown| shown.elapsed() < SHOW_GRACE)
            .unwrap_or(false);

        assert!(!after_hide, "после закрытия пауза применяться не должна");
    }

    #[test]
    fn test_applied_height_starts_unset() {
        // размер выставляется только при изменении высоты: повторный set_size
        // при каждом открытии заставлял Windows пересоздавать окно, и меню
        // открывалось рывком
        let applied = APPLIED_HEIGHT.lock().ok().map(|value| *value).unwrap_or(0.0);
        let height = resolved_height();

        let changed = (applied - height).abs() > 0.5;

        assert!(
            changed || applied > 0.0,
            "первое открытие обязательно применить размер окна"
        );
    }
}