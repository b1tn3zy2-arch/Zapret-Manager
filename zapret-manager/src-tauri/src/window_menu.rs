//! Подавление контекстного меню в окне и в самом WebView2.
//!
//! Меню приходилось с шапки окна, и это было меню WebView2 («Назад»,
//! «Обновить», «Сохранить как…»). Обработчик `contextmenu` в интерфейсе его не
//! останавливал: клик по перетаскиваемой области шапки обрабатывается
//! Chromium нативно и до JavaScript не доходит вовсе. Значит, гасить надо на
//! уровне оконных сообщений — и у окна приложения, и у вложенного окна
//! веб-интерфейса, где меню и рисуется.
//!
//! Механизм — подкласс окна через `SetWindowSubclass`: исходная процедура
//! продолжает работать, а нужные сообщения возвращаются как обработанные.

// Подключаем модули: tauri::{Runtime, WebviewWindow};.
use tauri::{Runtime, WebviewWindow};
// Подключаем модули: winapi::shared::minwindef::{LPARAM, LRESULT, UINT, WPAR.
use winapi::shared::minwindef::{LPARAM, LRESULT, UINT, WPARAM};
// Подключаем модули: winapi::shared::windef::{HWND, POINT};.
use winapi::shared::windef::{HWND, POINT};
// Подключаем модули: winapi::um::commctrl::{DefSubclassProc, SetWindowSubcla.
use winapi::um::commctrl::{DefSubclassProc, SetWindowSubclass};
// Подключаем модули: winapi::um::winuser::{FindWindowExW, GetWindowLongPtrW,.
use winapi::um::winuser::{FindWindowExW, GetWindowLongPtrW, ScreenToClient, SetWindowLongPtrW};

/// Произвольный, но постоянный идентификатор подкласса.
// Объявляем константу SUBCLASS_ID.
const SUBCLASS_ID: usize = 0x5A9E_0001;

// Объявляем константу WM_SYSCOMMAND.
const WM_SYSCOMMAND: UINT = 0x0112;
// Объявляем константу WM_CONTEXTMENU.
const WM_CONTEXTMENU: UINT = 0x007B;
// Объявляем константу WM_NCRBUTTONDOWN.
const WM_NCRBUTTONDOWN: UINT = 0x00A4;
// Объявляем константу WM_NCRBUTTONUP.
const WM_NCRBUTTONUP: UINT = 0x00A5;

/// Alt+Пробел: системное меню окна.
// Объявляем константу SC_KEYMENU.
const SC_KEYMENU: WPARAM = 0xF090;

/// Высота собственной шапки в логических пикселях: клик выше неё считается
/// кликом по шапке.
// Объявляем константу TITLE_BAR_HEIGHT.
const TITLE_BAR_HEIGHT: i32 = 56;

/// Классы вложенных окон. Меню рисуется в самом глубоком из них, поэтому
/// обход обязан начинаться с корня и спускаться по всей цепочке:
/// `WRY_WEBVIEW` → `Chrome_WidgetWin_0` → `Chrome_WidgetWin_1` →
/// `Chrome_RenderWidgetHostHWND`. Начать с `Chrome_WidgetWin_1` нельзя — это
/// внучатый элемент, и перебор прямых потомков его просто не увидит.
// Объявляем константу WEBVIEW_CLASSES.
const WEBVIEW_CLASSES: [&str; 4] = [
    // Выполняем операцию: "WRY_WEBVIEW",.
    "WRY_WEBVIEW",
    // Выполняем операцию: "Chrome_WidgetWin_0",.
    "Chrome_WidgetWin_0",
    // Выполняем операцию: "Chrome_WidgetWin_1",.
    "Chrome_WidgetWin_1",
    // Выполняем операцию: "Chrome_RenderWidgetHostHWND",.
    "Chrome_RenderWidgetHostHWND",
    // Закрываем выражение или коллекцию.
];

// Выполняем операцию: unsafe extern "system" fn hook(.
unsafe extern "system" fn hook(
    // Выполняем операцию: window: HWND,.
    window: HWND,
    // Выполняем операцию: code: UINT,.
    code: UINT,
    // Выполняем операцию: wparam: WPARAM,.
    wparam: WPARAM,
    // Выполняем операцию: lparam: LPARAM,.
    lparam: LPARAM,
    // Выполняем операцию: _id: usize,.
    _id: usize,
    // Выполняем операцию: _data: usize,.
    _data: usize,
    // Закрываем выражение или коллекцию.
) -> LRESULT {
    // Проверяем условие: code == WM_SYSCOMMAND && wparam == SC_KEYMENU {.
    if code == WM_SYSCOMMAND && wparam == SC_KEYMENU {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Проверяем условие: code == WM_NCRBUTTONDOWN || code == WM_NCRBUTTONUP.
    if code == WM_NCRBUTTONDOWN || code == WM_NCRBUTTONUP {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Клик по шапке гасим, клик по содержимому страницы пропускаем: там
    // контекстное меню нужно для «Копировать» у выделенного текста.
    // Проверяем условие: code == WM_CONTEXTMENU && !in_title_bar(window, lp.
    if code == WM_CONTEXTMENU && !in_title_bar(window, lparam) {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Выполняем операцию: DefSubclassProc(window, code, wparam, lparam).
    DefSubclassProc(window, code, wparam, lparam)
    // Закрываем блок.
}

/// Точка клика в экранных координатах лежит в пределах шапки окна.
// Объявляем функцию in_title_bar.
unsafe fn in_title_bar(window: HWND, lparam: LPARAM) -> bool {
    // Проверяем условие: window.is_null() {.
    if window.is_null() {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Объявляем переменную point .
    let mut point = POINT {
        // Выполняем операцию: x: (lparam as i32 & 0xffff) as i16 as i32,.
        x: (lparam as i32 & 0xffff) as i16 as i32,
        // Выполняем операцию: y: ((lparam as i32 >> 16) & 0xffff) as i16 as i32,.
        y: ((lparam as i32 >> 16) & 0xffff) as i16 as i32,
        // Закрываем блок.
    };

    // Выполняем операцию: ScreenToClient(window, &mut point);.
    ScreenToClient(window, &mut point);

    // Выполняем операцию: point.y >= 0 && point.y < TITLE_BAR_HEIGHT.
    point.y >= 0 && point.y < TITLE_BAR_HEIGHT
    // Закрываем блок.
}

// Объявляем функцию wide.
fn wide(value: &str) -> Vec<u16> {
    // Выполняем операцию: value.encode_utf16().chain(std::iter::once(0)).collect(.
    value.encode_utf16().chain(std::iter::once(0)).collect()
    // Закрываем блок.
}

// Объявляем функцию subclass.
unsafe fn subclass(handle: HWND) -> usize {
    // Проверяем условие: handle.is_null() {.
    if handle.is_null() {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Проверяем условие: SetWindowSubclass(handle, Some(hook), SUBCLASS_ID,.
    if SetWindowSubclass(handle, Some(hook), SUBCLASS_ID, 0) == 0 {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Выполняем операцию: 1.
    1
    // Закрываем блок.
}

/// Обходит окно и все вложенные окна WebView2.
// Объявляем функцию collect_webview_windows.
fn collect_webview_windows(root: HWND, depth: u8) -> Vec<HWND> {
    // Объявляем переменную found .
    let mut found = Vec::new();

    // Проверяем условие: depth > 3 {.
    if depth > 3 {
        // Возвращаем результат из функции.
        return found;
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for class in WEBVIEW_CLASSES {
        // Объявляем переменную name .
        let name = wide(class);

        // Выполняем операцию: unsafe {.
        unsafe {
            // Объявляем переменную child .
            let mut child =
                // Выполняем операцию: FindWindowExW(root, std::ptr::null_mut(), name.as_ptr().
                FindWindowExW(root, std::ptr::null_mut(), name.as_ptr(), std::ptr::null());

            // Повторяем, пока выполняется условие.
            while !child.is_null() {
                // Выполняем операцию: found.push(child);.
                found.push(child);
                // Выполняем операцию: found.extend(collect_webview_windows(child, depth + 1)).
                found.extend(collect_webview_windows(child, depth + 1));
                // Выполняем операцию: child = FindWindowExW(child, std::ptr::null_mut(), name.
                child = FindWindowExW(child, std::ptr::null_mut(), name.as_ptr(), std::ptr::null());
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: found.
    found
    // Закрываем блок.
}

/// Стиль окна без системного меню.
///
/// Пока у окна есть `WS_SYSMENU`, Windows по правому клику на перетаскиваемой
/// области шапки показывает своё меню окна, и никакие обработчики в интерфейсе
/// его не видят: клик обрабатывается на уровне оконных сообщений. Убираем сам
/// бит — меню перестаёт существовать в принципе, а не просто не рисуется.
// Объявляем константу GWL_STYLE.
const GWL_STYLE: i32 = -16;
// Объявляем константу WS_SYSMENU.
const WS_SYSMENU: isize = 0x0008_0000;

/// Снимает системное меню окна и подкласс на окно и вложенные окна WebView2.
// Объявляем функцию suppress_context_menu.
pub fn suppress_context_menu<R: Runtime>(window: &WebviewWindow<R>) {
    // Объявляем переменную Ok(handle) .
    let Ok(handle) = window.hwnd() else {
        // Выполняем операцию: tracing::debug!("HWND недоступен: контекстное меню оста.
        tracing::debug!("HWND недоступен: контекстное меню останется");

        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную root .
    let root = handle.0 as HWND;

    // Выполняем операцию: unsafe {.
    unsafe {
        // Объявляем переменную style .
        let style = GetWindowLongPtrW(root, GWL_STYLE);
        // Выполняем операцию: SetWindowLongPtrW(root, GWL_STYLE, style & !WS_SYSMENU).
        SetWindowLongPtrW(root, GWL_STYLE, style & !WS_SYSMENU);
        // Закрываем блок.
    }

    // Объявляем переменную applied .
    let mut applied = 0;
    // Объявляем переменную targets .
    let mut targets = vec![root];
    // Выполняем операцию: targets.extend(collect_webview_windows(root, 0));.
    targets.extend(collect_webview_windows(root, 0));

    // Перебираем элементы коллекции.
    for target in targets {
        // Проверяем условие: unsafe { subclass(target) } == 1 {.
        if unsafe { subclass(target) } == 1 {
            // Выполняем операцию: applied += 1;.
            applied += 1;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: applied == 0 {.
    if applied == 0 {
        // Выполняем операцию: tracing::warn!(.
        tracing::warn!(
            // Выполняем операцию: target: "security",.
            target: "security",
            // Выполняем операцию: "контекстное меню: подкласс не установлен ни на одно ок.
            "контекстное меню: подкласс не установлен ни на одно окно"
        // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Повторная попытка после прогрева интерфейса: окно WebView2 создаётся уже
/// после первого вызова, и без повтора меню появлялось при первом открытии.
// Объявляем функцию retry_context_menu.
pub fn retry_context_menu<R: Runtime>(window: &WebviewWindow<R>) {
    // Объявляем переменную Ok(handle) .
    let Ok(handle) = window.hwnd() else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную root .
    let root = handle.0 as HWND;
    // Объявляем переменную targets .
    let mut targets = Vec::new();
    // Выполняем операцию: targets.extend(collect_webview_windows(root, 0));.
    targets.extend(collect_webview_windows(root, 0));

    // Перебираем элементы коллекции.
    for target in targets {
        // Выполняем операцию: unsafe {.
        unsafe {
            // Выполняем операцию: subclass(target);.
            subclass(target);
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}
