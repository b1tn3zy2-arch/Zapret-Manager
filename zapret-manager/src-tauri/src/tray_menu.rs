// Подключаем модули: std::sync::atomic::{AtomicBool, Ordering};.
use std::sync::atomic::{AtomicBool, Ordering};
// Подключаем модули: std::sync::{Mutex, Once};.
use std::sync::{Mutex, Once};
// Подключаем модули: std::time::{Duration, Instant};.
use std::time::{Duration, Instant};

// Подключаем модули: tauri::{.
use tauri::{
    // Выполняем операцию: AppHandle, Emitter, LogicalSize, Manager, PhysicalPosit.
    AppHandle,
    Emitter,
    LogicalSize,
    Manager,
    PhysicalPosition,
    Runtime,
    Window,
    WindowEvent,
    // Закрываем блок.
};
// Подключаем модули: winapi::shared::windef::{HWND, POINT};.
use winapi::shared::windef::{HWND, POINT};
// Подключаем модули: winapi::um::winuser::{.
use winapi::um::winuser::{
    // Выполняем операцию: BringWindowToTop, GetAsyncKeyState, GetCursorPos, GetFo.
    BringWindowToTop,
    GetAsyncKeyState,
    GetCursorPos,
    GetForegroundWindow,
    SetForegroundWindow,
    // Выполняем операцию: VK_LBUTTON, VK_RBUTTON,.
    VK_LBUTTON,
    VK_RBUTTON,
    // Закрываем блок.
};

// Объявляем константу MENU_WINDOW_LABEL.
pub const MENU_WINDOW_LABEL: &str = "tray-menu";
// Объявляем константу EVENT_MENU_OPEN.
pub const EVENT_MENU_OPEN: &str = "tray-menu-open";
// Объявляем константу EVENT_MENU_CORNER.
pub const EVENT_MENU_CORNER: &str = "tray-menu-corner";

// Объявляем константу MENU_WIDTH.
const MENU_WIDTH: f64 = 236.0;
// Объявляем константу MENU_HEIGHT.
const MENU_HEIGHT: f64 = 332.0;
/// Границы, в которые укладывается высота, посчитанная окном меню.
// Объявляем константу MENU_MIN_HEIGHT.
const MENU_MIN_HEIGHT: f64 = 180.0;
// Объявляем константу MENU_MAX_HEIGHT.
const MENU_MAX_HEIGHT: f64 = 720.0;
// Объявляем константу CURSOR_GAP.
const CURSOR_GAP: f64 = 10.0;
// Объявляем константу WATCH_INTERVAL_MS.
const WATCH_INTERVAL_MS: u64 = 60;
// Объявляем константу WARMUP_DELAY_MS.
const WARMUP_DELAY_MS: u64 = 2000;
// Объявляем константу WARMUP_VISIBLE_MS.
const WARMUP_VISIBLE_MS: u64 = 140;
// Объявляем константу SLOW_SHOW_MS.
const SLOW_SHOW_MS: u128 = 100;
/// Пауза между отправкой снимка в webview и `show()`.
///
/// Меню открывается мгновенно: за эти миллисекунды webview успевает
/// применить свежий статус, чтобы первый видимый кадр был финальным.
// Объявляем константу SHOW_SETTLE_MS.
const SHOW_SETTLE_MS: u64 = 15;

// Объявляем константу READY.
static READY: AtomicBool = AtomicBool::new(false);
// Объявляем константу WATCH_STARTED.
static WATCH_STARTED: Once = Once::new();
// Объявляем константу WARMUP_STARTED.
static WARMUP_STARTED: Once = Once::new();
/// Высота меню, посчитанная окном: пункты списка меняются, и окно обязано
/// подстраиваться под них. Ноль означает «использовать константный размер».
// Объявляем константу CONTENT_HEIGHT.
static CONTENT_HEIGHT: Mutex<f64> = Mutex::new(0.0);
/// Высота, которую окну уже выставили: пересоздавать размер при каждом
/// открытии нельзя, Windows на это отвечает заметным пересозданием окна.
// Объявляем константу APPLIED_HEIGHT.
static APPLIED_HEIGHT: Mutex<f64> = Mutex::new(0.0);
/// Момент последнего показа: пока кнопка мыши нажата (пользователь только что
/// нажал на трей), курсор заведомо вне окна меню, и без паузы вотчер сразу
/// его закрывал — меню дёргалось и мигало.
// Объявляем константу SHOWN_AT.
static SHOWN_AT: Mutex<Option<Instant>> = Mutex::new(None);

/// Пауза после показа, в течение которой вотчер не закрывает меню.
// Объявляем константу SHOW_GRACE.
const SHOW_GRACE: Duration = Duration::from_millis(450);

// Объявляем функцию mark_ready.
pub fn mark_ready() {
    // Выполняем операцию: READY.store(true, Ordering::SeqCst);.
    READY.store(true, Ordering::SeqCst);
    // Закрываем блок.
}

/// Принимает высоту, измеренную в окне меню.
///
/// Высота запоминается, но размер подвижного окна меняется только когда меню
/// не видно. Раньше размер применялся сразу, и окно подстраивалось уже
/// открытым: содержимое измеряется после показа, поэтому меню дёргалось и
/// меняло высоту прямо на глазах.
// Объявляем функцию set_content_height.
pub fn set_content_height<R: Runtime>(app: &AppHandle<R>, height: f64) {
    // Объявляем переменную Some(clamped) .
    let Some(clamped) = store_content_height(height) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную Some(window) .
    let Some(window) = menu_window(app) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Проверяем условие: window.is_visible().unwrap_or(false) {.
    if window.is_visible().unwrap_or(false) {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Выполняем операцию: apply_height(&window, clamped);.
    apply_height(&window, clamped);
    // Закрываем блок.
}

/// Запоминает измеренную высоту содержимого и возвращает её, если значение
/// изменилось.
// Объявляем функцию store_content_height.
fn store_content_height(height: f64) -> Option<f64> {
    // Проверяем условие: !height.is_finite() {.
    if !height.is_finite() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную clamped .
    let clamped = height.clamp(MENU_MIN_HEIGHT, MENU_MAX_HEIGHT);
    // Объявляем переменную slot .
    let mut slot = CONTENT_HEIGHT.lock().ok()?;

    // Проверяем условие: (*slot - clamped).abs() < 0.5 {.
    if (*slot - clamped).abs() < 0.5 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    *slot = clamped;

    // Выполняем операцию: Some(clamped).
    Some(clamped)
    // Закрываем блок.
}

/// Приводит размер окна к измеренной высоте содержимого.
// Объявляем функцию apply_height.
fn apply_height<R: Runtime>(window: &tauri::WebviewWindow<R>, height: f64) {
    // Объявляем переменную changed .
    let changed = APPLIED_HEIGHT
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .map(|current| (*current - height).abs() > 0.5).
        .map(|current| (*current - height).abs() > 0.5)
        // Выполняем операцию: .unwrap_or(true);.
        .unwrap_or(true);

    // Проверяем условие: !changed {.
    if !changed {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = window.set_size(LogicalSize::new(MENU_WIDTH, height));

    // Проверяем условие: let Ok(mut applied) = APPLIED_HEIGHT.lock() {.
    if let Ok(mut applied) = APPLIED_HEIGHT.lock() {
        *applied = height;
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию content_height.
fn content_height() -> f64 {
    // Выполняем операцию: CONTENT_HEIGHT.
    CONTENT_HEIGHT
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .map(|value| *value).
        .map(|value| *value)
        // Выполняем операцию: .unwrap_or(0.0).
        .unwrap_or(0.0)
        // Выполняем операцию: .clamp(MENU_MIN_HEIGHT, MENU_MAX_HEIGHT).
        .clamp(MENU_MIN_HEIGHT, MENU_MAX_HEIGHT)
    // Закрываем блок.
}

// Объявляем функцию resolved_height.
fn resolved_height() -> f64 {
    // Объявляем переменную measured .
    let measured = content_height();

    // Проверяем условие: measured > 0.0 {.
    if measured > 0.0 {
        // Выполняем операцию: measured.
        measured
    // Закрываем блок.
    } else {
        // Выполняем операцию: MENU_HEIGHT.
        MENU_HEIGHT
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_ready.
pub fn is_ready() -> bool {
    // Выполняем операцию: READY.load(Ordering::SeqCst).
    READY.load(Ordering::SeqCst)
    // Закрываем блок.
}

// Объявляем функцию menu_window.
pub fn menu_window<R: Runtime>(app: &AppHandle<R>) -> Option<tauri::WebviewWindow<R>> {
    // Выполняем операцию: app.get_webview_window(MENU_WINDOW_LABEL).
    app.get_webview_window(MENU_WINDOW_LABEL)
    // Закрываем блок.
}

// Объявляем функцию hide.
pub fn hide<R: Runtime>(app: &AppHandle<R>) {
    // Проверяем условие: let Some(window) = menu_window(app) {.
    if let Some(window) = menu_window(app) {
        // Объявляем переменную _ .
        let _ = window.hide();
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию show.
pub fn show<R: Runtime>(app: &AppHandle<R>, cursor: PhysicalPosition<f64>) {
    // Объявляем переменную Some(window) .
    let Some(window) = menu_window(app) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Окно меню создаётся лениво, поэтому на этапе запуска его может ещё не
    // быть. Снимаем системное меню здесь: повторный вызов ничего не стоит.
    // Выполняем операцию: crate::window_menu::suppress_context_menu(&window);.
    crate::window_menu::suppress_context_menu(&window);

    // Проверяем условие: window.is_visible().unwrap_or(false) {.
    if window.is_visible().unwrap_or(false) {
        // Объявляем переменную _ .
        let _ = window.hide();

        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Выполняем операцию: ensure_watch_thread(app);.
    ensure_watch_thread(app);

    // Объявляем переменную started .
    let started = Instant::now();

    // Монитор под курсором нужен и для масштаба: у разных мониторов разная
    // плотность, и масштаб окна не совпадает с масштабом экрана, где меню
    // должно появиться. Из-за этого окно приходилось в неверную точку.
    // Объявляем переменную monitor .
    let monitor = monitor_under_cursor(&window);
    // Объявляем переменную scale .
    let scale = monitor
        // Выполняем операцию: .as_ref().
        .as_ref()
        // Выполняем операцию: .map(|item| item.scale_factor()).
        .map(|item| item.scale_factor())
        // Выполняем операцию: .unwrap_or_else(|| window.scale_factor().unwrap_or(1.0).
        .unwrap_or_else(|| window.scale_factor().unwrap_or(1.0));

    // Размер окна подгоняется под реальное содержимое до позиционирования,
    // иначе меню показывается с обрезанным низом. Пока окно скрыто, размер
    // обновляется свободно; видимое окно не трогаем — пересоздание и
    // перерисовка видимого меню читаются как рывок.
    // Объявляем переменную target_height .
    let target_height = resolved_height();
    // Выполняем операцию: apply_height(&window, target_height);.
    apply_height(&window, target_height);

    // Объявляем переменную width .
    let width = MENU_WIDTH * scale;
    // Объявляем переменную height .
    let height = target_height * scale;

    // Монитор выбирается по позиции курсора, а не по монитору самого окна.
    // Окно меню живёт на основном мониторе, поэтому current_monitor() при
    // втором экране уводил меню на него: трей на дополнительном мониторе
    // открывался не там, где нажали.
    // Объявляем переменную x .
    let mut x = cursor.x - width + 14.0 * scale;
    // Объявляем переменную y .
    let mut y = cursor.y - height - CURSOR_GAP * scale;
    // Объявляем переменную area .
    let mut area = None;

    // Проверяем условие: let Some(monitor) = monitor.as_ref() {.
    if let Some(monitor) = monitor.as_ref() {
        // Объявляем переменную work .
        let work = monitor.work_area();
        // Объявляем переменную left .
        let left = f64::from(work.position.x);
        // Объявляем переменную top .
        let top = f64::from(work.position.y);
        // Объявляем переменную right .
        let right = left + f64::from(work.size.width);
        // Объявляем переменную bottom .
        let bottom = top + f64::from(work.size.height);

        // Выполняем операцию: x = x.clamp(left, (right - width).max(left));.
        x = x.clamp(left, (right - width).max(left));
        // Выполняем операцию: y = y.clamp(top, (bottom - height).max(top));.
        y = y.clamp(top, (bottom - height).max(top));
        // Выполняем операцию: area = Some((left, top, right, bottom));.
        area = Some((left, top, right, bottom));
        // Закрываем блок.
    }

    // Объявляем переменную positioned .
    let positioned = started.elapsed();

    // Объявляем переменную _ .
    let _ = window.set_position(PhysicalPosition::new(x, y));

    // Снимок статуса и угол уезжают в окно ДО показа: webview меню живёт
    // постоянно, но статус обновляется только этим событием, и если
    // показывать окно раньше — первый видимый кадр отрисовывает старое
    // состояние («не сразу отрисовывается»). Пауза отдаёт webview квант на
    // обработку события и перерисовку; она незаметна, зато после `show()`
    // первым же кадром выходит финальная картинка.
    // Объявляем переменную corner .
    let corner = match area {
        // Выполняем операцию: Some(work) => corner_for(x, y, width, height, work),.
        Some(work) => corner_for(x, y, width, height, work),
        // Выполняем операцию: None => "top-left",.
        None => "top-left",
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = app.emit_to(MENU_WINDOW_LABEL, EVENT_MENU_CORNER, corner);
    // Объявляем переменную _ .
    let _ = app.emit_to(MENU_WINDOW_LABEL, EVENT_MENU_OPEN, snapshot_payload(app));
    // Выполняем операцию: std::thread::sleep(Duration::from_millis(SHOW_SETTLE_MS.
    std::thread::sleep(Duration::from_millis(SHOW_SETTLE_MS));

    // Объявляем переменную _ .
    let _ = window.show();

    // Проверяем условие: let Ok(mut shown_at) = SHOWN_AT.lock() {.
    if let Ok(mut shown_at) = SHOWN_AT.lock() {
        *shown_at = Some(Instant::now());
        // Закрываем блок.
    }

    // Объявляем переменную shown .
    let shown = started.elapsed();

    // Объявляем переменную _ .
    let _ = window.set_focus();

    // Проверяем условие: let Ok(handle) = window.hwnd() {.
    if let Ok(handle) = window.hwnd() {
        // Объявляем переменную hwnd .
        let hwnd = handle.0 as HWND;

        // Выполняем операцию: unsafe {.
        unsafe {
            // Выполняем операцию: BringWindowToTop(hwnd);.
            BringWindowToTop(hwnd);
            // Выполняем операцию: SetForegroundWindow(hwnd);.
            SetForegroundWindow(hwnd);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную total .
    let total = started.elapsed();

    // Выполняем операцию: tracing::debug!(.
    tracing::debug!(
        // Выполняем операцию: "tray-menu: pos={}ms show={}ms total={}ms corner={corne.
        "tray-menu: pos={}ms show={}ms total={}ms corner={corner}",
        // Выполняем операцию: positioned.as_millis(),.
        positioned.as_millis(),
        // Выполняем операцию: shown.as_millis(),.
        shown.as_millis(),
        // Выполняем операцию: total.as_millis().
        total.as_millis() // Закрываем выражение или коллекцию.
    );

    // Проверяем условие: total.as_millis() > SLOW_SHOW_MS {.
    if total.as_millis() > SLOW_SHOW_MS {
        // Выполняем операцию: tracing::warn!("tray-menu открылся медленно: {}ms", tot.
        tracing::warn!("tray-menu открылся медленно: {}ms", total.as_millis());
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию snapshot_payload.
fn snapshot_payload<R: Runtime>(app: &AppHandle<R>) -> crate::commands::tray::TrayMenuSnapshot {
    // Объявляем переменную (state, active_strategy, vpn_name) .
    let (state, active_strategy, vpn_name) = crate::tray::snapshot(app);

    // Выполняем операцию: crate::commands::tray::TrayMenuSnapshot::from_parts(sta.
    crate::commands::tray::TrayMenuSnapshot::from_parts(state, active_strategy, vpn_name)
    // Закрываем блок.
}

// Объявляем функцию corner_for.
pub fn corner_for(
    // Выполняем операцию: x: f64,.
    x: f64,
    // Выполняем операцию: y: f64,.
    y: f64,
    // Выполняем операцию: width: f64,.
    width: f64,
    // Выполняем операцию: height: f64,.
    height: f64,
    // Выполняем операцию: area: (f64, f64, f64, f64),.
    area: (f64, f64, f64, f64),
    // Закрываем выражение или коллекцию.
) -> &'static str {
    // Объявляем переменную (left, top, right, bottom) .
    let (left, top, right, bottom) = area;

    // Проверяем условие: x - left < (right - width - x).max(0.0) {.
    if x - left < (right - width - x).max(0.0) {
        // Проверяем условие: y - top < (bottom - height - y).max(0.0) {.
        if y - top < (bottom - height - y).max(0.0) {
            // Выполняем операцию: "top-left".
            "top-left"
        // Закрываем блок.
        } else {
            // Выполняем операцию: "bottom-left".
            "bottom-left"
            // Закрываем блок.
        }
    // Закрываем блок.
    } else if y - top < (bottom - height - y).max(0.0) {
        // Выполняем операцию: "top-right".
        "top-right"
    // Закрываем блок.
    } else {
        // Выполняем операцию: "bottom-right".
        "bottom-right"
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию schedule_warmup.
pub fn schedule_warmup<R: Runtime>(app: AppHandle<R>) {
    // Выполняем операцию: WARMUP_STARTED.call_once(|| {.
    WARMUP_STARTED.call_once(|| {
        // Выполняем операцию: std::thread::spawn(move || {.
        std::thread::spawn(move || {
            // Выполняем операцию: std::thread::sleep(Duration::from_millis(WARMUP_DELAY_M.
            std::thread::sleep(Duration::from_millis(WARMUP_DELAY_MS));

            // Объявляем переменную Some(window) .
            let Some(window) = menu_window(&app) else {
                // Возвращаем результат из функции.
                return;
                // Закрываем блок.
            };

            // Проверяем условие: !is_ready() || window.is_visible().unwrap_or(false.
            if !is_ready() || window.is_visible().unwrap_or(false) {
                // Возвращаем результат из функции.
                return;
                // Закрываем блок.
            }

            // Объявляем переменную _ .
            let _ = window.set_position(PhysicalPosition::new(-1000.0, -1000.0));
            // Объявляем переменную _ .
            let _ = window.show();

            // Прогрев нужен, чтобы окно уже было нарисовано, когда его впервые
            // покажут пользователю. 16 мс не хватало: первый кадр успевал
            // показать пустое прозрачное окно, и меню «моргало» при открытии.
            // Выполняем операцию: std::thread::sleep(Duration::from_millis(WARMUP_VISIBLE.
            std::thread::sleep(Duration::from_millis(WARMUP_VISIBLE_MS));

            // Объявляем переменную _ .
            let _ = window.hide();
            // Выполняем операцию: tracing::debug!("tray-menu прогрет");.
            tracing::debug!("tray-menu прогрет");

            // Прогрев нужен и для окна приложения: вложенное окно WebView2
            // появляется уже после первого вызова, и без повторного подкласса
            // контекстное меню снова работало при первом клике по шапке.
            // Проверяем условие: let Some(main) = app.get_webview_window(crate::tra.
            if let Some(main) = app.get_webview_window(crate::tray::WINDOW_LABEL) {
                // Выполняем операцию: crate::window_menu::retry_context_menu(&main);.
                crate::window_menu::retry_context_menu(&main);
                // Закрываем блок.
            }
            // Закрываем блок.
        });
        // Закрываем блок.
    });
    // Закрываем блок.
}

// Объявляем функцию ensure_watch_thread.
fn ensure_watch_thread<R: Runtime>(app: &AppHandle<R>) {
    // Выполняем операцию: WATCH_STARTED.call_once(|| {.
    WATCH_STARTED.call_once(|| {
        // Объявляем переменную watcher .
        let watcher = app.clone();

        // Выполняем операцию: std::thread::spawn(move || loop {.
        std::thread::spawn(move || loop {
            // Выполняем операцию: std::thread::sleep(Duration::from_millis(WATCH_INTERVAL.
            std::thread::sleep(Duration::from_millis(WATCH_INTERVAL_MS));

            // Объявляем переменную Some(window) .
            let Some(window) = menu_window(&watcher) else {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            };

            // Проверяем условие: !window.is_visible().unwrap_or(false) {.
            if !window.is_visible().unwrap_or(false) {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // сразу после нажатия на трей кнопка ещё зажата, а курсор
            // находится на иконке, то есть заведомо вне окна меню. Без паузы
            // меню закрывалось в тот же кадр и выглядело как рывок
            // Объявляем переменную within_grace .
            let within_grace = SHOWN_AT
                // Выполняем операцию: .lock().
                .lock()
                // Выполняем операцию: .ok().
                .ok()
                // Выполняем операцию: .and_then(|shown| *shown).
                .and_then(|shown| *shown)
                // Выполняем операцию: .map(|shown| shown.elapsed() < SHOW_GRACE).
                .map(|shown| shown.elapsed() < SHOW_GRACE)
                // Выполняем операцию: .unwrap_or(false);.
                .unwrap_or(false);

            // Проверяем условие: within_grace {.
            if within_grace {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Объявляем переменную left .
            let left = unsafe { GetAsyncKeyState(VK_LBUTTON) } < 0;
            // Объявляем переменную right .
            let right = unsafe { GetAsyncKeyState(VK_RBUTTON) } < 0;

            // Проверяем условие: (left || right) && !cursor_inside_current(&window).
            if (left || right) && !cursor_inside_current(&window) {
                // Объявляем переменную _ .
                let _ = window.hide();
                // Закрываем блок.
            }
            // Закрываем блок.
        });
        // Закрываем блок.
    });
    // Закрываем блок.
}

// Объявляем функцию cursor_inside_current.
fn cursor_inside_current<R: Runtime>(window: &tauri::WebviewWindow<R>) -> bool {
    // Объявляем переменную Ok(position) .
    let Ok(position) = window.outer_position() else {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    };
    // Объявляем переменную Ok(size) .
    let Ok(size) = window.outer_size() else {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    };

    // Выполняем операцию: cursor_inside(.
    cursor_inside(
        // Выполняем операцию: f64::from(position.x),.
        f64::from(position.x),
        // Выполняем операцию: f64::from(position.y),.
        f64::from(position.y),
        // Выполняем операцию: f64::from(size.width),.
        f64::from(size.width),
        // Выполняем операцию: f64::from(size.height),.
        f64::from(size.height),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

/// Монитор, на котором в данный момент находится курсор.
// Объявляем функцию monitor_under_cursor.
fn monitor_under_cursor<R: Runtime>(window: &tauri::WebviewWindow<R>) -> Option<tauri::Monitor> {
    // Объявляем переменную point .
    let mut point = POINT { x: 0, y: 0 };

    // Проверяем условие: unsafe { GetCursorPos(&mut point) } == 0 {.
    if unsafe { GetCursorPos(&mut point) } == 0 {
        // Возвращаем результат из функции.
        return window.current_monitor().ok().flatten();
        // Закрываем блок.
    }

    // Объявляем переменную px .
    let px = f64::from(point.x);
    // Объявляем переменную py .
    let py = f64::from(point.y);

    // Объявляем переменную monitors .
    let monitors = window.available_monitors().ok()?;

    // Выполняем операцию: monitors.
    monitors
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .find(|monitor| {.
        .find(|monitor| {
            // Объявляем переменную position .
            let position = monitor.position();
            // Объявляем переменную size .
            let size = monitor.size();
            // Объявляем переменную left .
            let left = f64::from(position.x);
            // Объявляем переменную top .
            let top = f64::from(position.y);

            // Выполняем операцию: px >= left.
            px >= left
                // Выполняем операцию: && px < left + f64::from(size.width).
                && px < left + f64::from(size.width)
                // Выполняем операцию: && py >= top.
                && py >= top
                // Выполняем операцию: && py < top + f64::from(size.height).
                && py < top + f64::from(size.height)
            // Закрываем блок.
        })
        // Выполняем операцию: .or_else(|| window.primary_monitor().ok().flatten()).
        .or_else(|| window.primary_monitor().ok().flatten())
        // Выполняем операцию: .or_else(|| window.current_monitor().ok().flatten()).
        .or_else(|| window.current_monitor().ok().flatten())
    // Закрываем блок.
}

// Объявляем функцию cursor_inside.
fn cursor_inside(x: f64, y: f64, width: f64, height: f64) -> bool {
    // Объявляем переменную point .
    let mut point = POINT { x: 0, y: 0 };
    // Объявляем переменную found .
    let found = unsafe { GetCursorPos(&mut point) };

    // Проверяем условие: found == 0 {.
    if found == 0 {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Объявляем переменную px .
    let px = f64::from(point.x);
    // Объявляем переменную py .
    let py = f64::from(point.y);

    // Выполняем операцию: px >= x && px <= x + width && py >= y && py <= y + heig.
    px >= x && px <= x + width && py >= y && py <= y + height
    // Закрываем блок.
}

// Объявляем функцию handle_window_event.
pub fn handle_window_event<R: Runtime>(window: &Window<R>, event: &WindowEvent) {
    // Выбираем вариант по значению.
    match event {
        // Выполняем операцию: WindowEvent::Focused(false) => {.
        WindowEvent::Focused(false) => {
            // Объявляем переменную hwnd .
            let hwnd = window.hwnd().ok().map(|handle| handle.0 as HWND);

            // Проверяем условие: let Some(hwnd) = hwnd {.
            if let Some(hwnd) = hwnd {
                // Объявляем переменную foreground .
                let foreground = unsafe { GetForegroundWindow() };

                // Проверяем условие: foreground != hwnd {.
                if foreground != hwnd {
                    // Объявляем переменную _ .
                    let _ = window.hide();
                    // Закрываем блок.
                }
            // Закрываем блок.
            } else {
                // Объявляем переменную _ .
                let _ = window.hide();
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Выполняем операцию: WindowEvent::CloseRequested { api, .. } => {.
        WindowEvent::CloseRequested { api, .. } => {
            // Выполняем операцию: api.prevent_close();.
            api.prevent_close();
            // Объявляем переменную _ .
            let _ = window.hide();
            // Закрываем блок.
        }
        // Выполняем операцию: _ => {}.
        _ => {} // Закрываем блок.
    }
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
    // Объявляем функцию test_clamp_keeps_menu_inside_area.
    fn test_clamp_keeps_menu_inside_area() {
        // Объявляем переменную left .
        let left = 0.0;
        // Объявляем переменную right .
        let right = 1920.0;
        // Объявляем переменную width .
        let width = MENU_WIDTH;
        // Объявляем переменную candidates .
        let candidates = [1900.0 - width, 100.0 - width, 960.0 - width];

        // Перебираем элементы коллекции.
        for value in candidates {
            // Объявляем переменную x .
            let x = value.clamp(left, (right - width).max(left));

            // Выполняем операцию: assert!((left..=right - width).contains(&x));.
            assert!((left..=right - width).contains(&x));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_clamp_negative_position.
    fn test_clamp_negative_position() {
        // Выполняем операцию: assert_eq!((-50.0_f64).clamp(0.0, 1000.0), 0.0);.
        assert_eq!((-50.0_f64).clamp(0.0, 1000.0), 0.0);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_menu_dimensions_are_compact.
    fn test_menu_dimensions_are_compact() {
        // Объявляем переменную size .
        let size = (MENU_WIDTH, MENU_HEIGHT);

        // Выполняем операцию: assert!(size.0 <= 260.0 && size.1 <= 340.0);.
        assert!(size.0 <= 260.0 && size.1 <= 340.0);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_cursor_check_math.
    fn test_cursor_check_math() {
        // Объявляем переменную contains .
        let contains =
            // Выполняем операцию: |px: f64, py: f64| (100.0..=300.0).contains(&px) && (10.
            |px: f64, py: f64| (100.0..=300.0).contains(&px) && (100.0..=400.0).contains(&py);

        // Выполняем операцию: assert!(contains(150.0, 200.0));.
        assert!(contains(150.0, 200.0));
        // Выполняем операцию: assert!(!contains(50.0, 200.0));.
        assert!(!contains(50.0, 200.0));
        // Выполняем операцию: assert!(!contains(150.0, 500.0));.
        assert!(!contains(150.0, 500.0));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_corner_detection.
    fn test_corner_detection() {
        // Объявляем переменную area .
        let area = (0.0, 0.0, 1920.0, 1080.0);
        // Объявляем переменную size .
        let size = (MENU_WIDTH, MENU_HEIGHT);

        // Выполняем операцию: assert_eq!(corner_for(10.0, 10.0, size.0, size.1, area).
        assert_eq!(corner_for(10.0, 10.0, size.0, size.1, area), "top-left");
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: corner_for(1920.0 - size.0 - 10.0, 10.0, size.0, size.1.
            corner_for(1920.0 - size.0 - 10.0, 10.0, size.0, size.1, area),
            // Выполняем операцию: "top-right".
            "top-right" // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: corner_for(10.0, 1080.0 - size.1 - 10.0, size.0, size.1.
            corner_for(10.0, 1080.0 - size.1 - 10.0, size.0, size.1, area),
            // Выполняем операцию: "bottom-left".
            "bottom-left" // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: corner_for(.
            corner_for(
                // Выполняем операцию: 1920.0 - size.0 - 10.0,.
                1920.0 - size.0 - 10.0,
                // Выполняем операцию: 1080.0 - size.1 - 10.0,.
                1080.0 - size.1 - 10.0,
                // Выполняем операцию: size.0,.
                size.0,
                // Выполняем операцию: size.1,.
                size.1,
                // Выполняем операцию: area.
                area // Закрываем выражение или коллекцию.
            ),
            // Выполняем операцию: "bottom-right".
            "bottom-right" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_ready_flag_toggles.
    fn test_ready_flag_toggles() {
        // Выполняем операцию: mark_ready();.
        mark_ready();

        // Выполняем операцию: assert!(is_ready());.
        assert!(is_ready());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_content_height_clamps_and_applies.
    fn test_content_height_clamps_and_applies() {
        // Выполняем операцию: assert!(resolved_height() >= MENU_MIN_HEIGHT);.
        assert!(resolved_height() >= MENU_MIN_HEIGHT);

        // Выполняем операцию: store_content_height(409.0);.
        store_content_height(409.0);
        // Выполняем операцию: assert!((resolved_height() - 409.0).abs() < 0.5);.
        assert!((resolved_height() - 409.0).abs() < 0.5);

        // пункт «Выход» живёт в самом низу списка: обрезанная высота означает
        // недоступную кнопку выхода, поэтому границы обязаны быть широкими
        // Выполняем операцию: store_content_height(10_000.0);.
        store_content_height(10_000.0);
        // Выполняем операцию: assert!((resolved_height() - MENU_MAX_HEIGHT).abs() < 0.
        assert!((resolved_height() - MENU_MAX_HEIGHT).abs() < 0.5);

        // Выполняем операцию: store_content_height(1.0);.
        store_content_height(1.0);
        // Выполняем операцию: assert!((resolved_height() - MENU_MIN_HEIGHT).abs() < 0.
        assert!((resolved_height() - MENU_MIN_HEIGHT).abs() < 0.5);

        // Выполняем операцию: store_content_height(f64::NAN);.
        store_content_height(f64::NAN);
        // Выполняем операцию: assert!(resolved_height().is_finite());.
        assert!(resolved_height().is_finite());

        // Выполняем операцию: store_content_height(MENU_HEIGHT);.
        store_content_height(MENU_HEIGHT);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_grace_window_protects_freshly_shown_menu.
    fn test_grace_window_protects_freshly_shown_menu() {
        // сразу после нажатия на трей кнопка мыши ещё зажата, а курсор на
        // иконке: без паузы вотчер закрывал меню в тот же кадр
        // Проверяем условие: let Ok(mut shown_at) = SHOWN_AT.lock() {.
        if let Ok(mut shown_at) = SHOWN_AT.lock() {
            *shown_at = Some(Instant::now());
            // Закрываем блок.
        }

        // Объявляем переменную within_grace .
        let within_grace = SHOWN_AT
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .and_then(|shown| *shown).
            .and_then(|shown| *shown)
            // Выполняем операцию: .map(|shown| shown.elapsed() < SHOW_GRACE).
            .map(|shown| shown.elapsed() < SHOW_GRACE)
            // Выполняем операцию: .unwrap_or(false);.
            .unwrap_or(false);

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: within_grace,.
            within_grace,
            // Выполняем операцию: "только что показанное меню не защищено паузой".
            "только что показанное меню не защищено паузой" // Закрываем выражение или коллекцию.
        );

        // Проверяем условие: let Ok(mut shown_at) = SHOWN_AT.lock() {.
        if let Ok(mut shown_at) = SHOWN_AT.lock() {
            *shown_at = None;
            // Закрываем блок.
        }

        // Объявляем переменную after_hide .
        let after_hide = SHOWN_AT
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .and_then(|shown| *shown).
            .and_then(|shown| *shown)
            // Выполняем операцию: .map(|shown| shown.elapsed() < SHOW_GRACE).
            .map(|shown| shown.elapsed() < SHOW_GRACE)
            // Выполняем операцию: .unwrap_or(false);.
            .unwrap_or(false);

        // Выполняем операцию: assert!(!after_hide, "после закрытия пауза применяться .
        assert!(!after_hide, "после закрытия пауза применяться не должна");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_applied_height_starts_unset.
    fn test_applied_height_starts_unset() {
        // размер выставляется только при изменении высоты: повторный set_size
        // при каждом открытии заставлял Windows пересоздавать окно, и меню
        // открывалось рывком
        // Объявляем переменную applied .
        let applied = APPLIED_HEIGHT
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .map(|value| *value).
            .map(|value| *value)
            // Выполняем операцию: .unwrap_or(0.0);.
            .unwrap_or(0.0);
        // Объявляем переменную height .
        let height = resolved_height();

        // Объявляем переменную changed .
        let changed = (applied - height).abs() > 0.5;

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: changed || applied > 0.0,.
            changed || applied > 0.0,
            // Выполняем операцию: "первое открытие обязательно применить размер окна".
            "первое открытие обязательно применить размер окна" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}
