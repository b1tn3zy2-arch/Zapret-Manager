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

use tauri::{Runtime, WebviewWindow};
use winapi::shared::minwindef::{LPARAM, LRESULT, UINT, WPARAM};
use winapi::shared::windef::{HWND, POINT};
use winapi::um::commctrl::{DefSubclassProc, SetWindowSubclass};
use winapi::um::winuser::{
    FindWindowExW, GetWindowLongPtrW, ScreenToClient, SetWindowLongPtrW,
};

/// Произвольный, но постоянный идентификатор подкласса.
const SUBCLASS_ID: usize = 0x5A9E_0001;

const WM_SYSCOMMAND: UINT = 0x0112;
const WM_CONTEXTMENU: UINT = 0x007B;
const WM_NCRBUTTONDOWN: UINT = 0x00A4;
const WM_NCRBUTTONUP: UINT = 0x00A5;

/// Alt+Пробел: системное меню окна.
const SC_KEYMENU: WPARAM = 0xF090;

/// Высота собственной шапки в логических пикселях: клик выше неё считается
/// кликом по шапке.
const TITLE_BAR_HEIGHT: i32 = 56;

/// Классы вложенных окон. Меню рисуется в самом глубоком из них, поэтому
/// обход обязан начинаться с корня и спускаться по всей цепочке:
/// `WRY_WEBVIEW` → `Chrome_WidgetWin_0` → `Chrome_WidgetWin_1` →
/// `Chrome_RenderWidgetHostHWND`. Начать с `Chrome_WidgetWin_1` нельзя — это
/// внучатый элемент, и перебор прямых потомков его просто не увидит.
const WEBVIEW_CLASSES: [&str; 4] = [
    "WRY_WEBVIEW",
    "Chrome_WidgetWin_0",
    "Chrome_WidgetWin_1",
    "Chrome_RenderWidgetHostHWND",
];

unsafe extern "system" fn hook(
    window: HWND,
    code: UINT,
    wparam: WPARAM,
    lparam: LPARAM,
    _id: usize,
    _data: usize,
) -> LRESULT {
    if code == WM_SYSCOMMAND && wparam == SC_KEYMENU {
        return 0;
    }

    if code == WM_NCRBUTTONDOWN || code == WM_NCRBUTTONUP {
        return 0;
    }

    // Клик по шапке гасим, клик по содержимому страницы пропускаем: там
    // контекстное меню нужно для «Копировать» у выделенного текста.
    if code == WM_CONTEXTMENU && !in_title_bar(window, lparam) {
        return 0;
    }

    DefSubclassProc(window, code, wparam, lparam)
}

/// Точка клика в экранных координатах лежит в пределах шапки окна.
unsafe fn in_title_bar(window: HWND, lparam: LPARAM) -> bool {
    if window.is_null() {
        return true;
    }

    let mut point = POINT {
        x: (lparam as i32 & 0xffff) as i16 as i32,
        y: ((lparam as i32 >> 16) & 0xffff) as i16 as i32,
    };

    ScreenToClient(window, &mut point);

    point.y >= 0 && point.y < TITLE_BAR_HEIGHT
}

fn wide(value: &str) -> Vec<u16> {
    value.encode_utf16().chain(std::iter::once(0)).collect()
}

unsafe fn subclass(handle: HWND) -> usize {
    if handle.is_null() {
        return 0;
    }

    if SetWindowSubclass(handle, Some(hook), SUBCLASS_ID, 0) == 0 {
        return 0;
    }

    1
}

/// Обходит окно и все вложенные окна WebView2.
fn collect_webview_windows(root: HWND, depth: u8) -> Vec<HWND> {
    let mut found = Vec::new();

    if depth > 3 {
        return found;
    }

    for class in WEBVIEW_CLASSES {
        let name = wide(class);

        unsafe {
            let mut child =
                FindWindowExW(root, std::ptr::null_mut(), name.as_ptr(), std::ptr::null());

            while !child.is_null() {
                found.push(child);
                found.extend(collect_webview_windows(child, depth + 1));
                child =
                    FindWindowExW(child, std::ptr::null_mut(), name.as_ptr(), std::ptr::null());
            }
        }
    }

    found
}

/// Стиль окна без системного меню.
///
/// Пока у окна есть `WS_SYSMENU`, Windows по правому клику на перетаскиваемой
/// области шапки показывает своё меню окна, и никакие обработчики в интерфейсе
/// его не видят: клик обрабатывается на уровне оконных сообщений. Убираем сам
/// бит — меню перестаёт существовать в принципе, а не просто не рисуется.
const GWL_STYLE: i32 = -16;
const WS_SYSMENU: isize = 0x0008_0000;

/// Снимает системное меню окна и подкласс на окно и вложенные окна WebView2.
pub fn suppress_context_menu<R: Runtime>(window: &WebviewWindow<R>) {
    let Ok(handle) = window.hwnd() else {
        tracing::debug!("HWND недоступен: контекстное меню останется");

        return;
    };

    let root = handle.0 as HWND;

    unsafe {
        let style = GetWindowLongPtrW(root, GWL_STYLE);
        SetWindowLongPtrW(root, GWL_STYLE, style & !WS_SYSMENU);
    }

    let mut applied = 0;
    let mut targets = vec![root];
    targets.extend(collect_webview_windows(root, 0));

    for target in targets {
        if unsafe { subclass(target) } == 1 {
            applied += 1;
        }
    }

    if applied == 0 {
        tracing::warn!(
            target: "security",
            "контекстное меню: подкласс не установлен ни на одно окно"
        );
    }
}

/// Повторная попытка после прогрева интерфейса: окно WebView2 создаётся уже
/// после первого вызова, и без повтора меню появлялось при первом открытии.
pub fn retry_context_menu<R: Runtime>(window: &WebviewWindow<R>) {
    let Ok(handle) = window.hwnd() else {
        return;
    };

    let root = handle.0 as HWND;
    let mut targets = Vec::new();
    targets.extend(collect_webview_windows(root, 0));

    for target in targets {
        unsafe {
            subclass(target);
        }
    }
}
