//! Поведение окна, которого нет в API Tauri.
//!
//! Окно приложения своё, без системного заголовка, но Windows всё равно
//! показывает своё меню окна (Восстановить, Переместить, Размер, Закрыть) по
//! правому клику на перетаскиваемой области шапки и по Alt+Пробел. В приложении
//! есть свои кнопки и меню, поэтому системное здесь только мешает и выглядит
//! как чужое окно.
//!
//! Решение — подкласс окна через `SetWindowSubclass`: исходная процедура
//! Tauri продолжает работать, а нужные сообщения возвращаются как
//! обработанные. Клики по содержимому страницы (в том числе меню логов)
//! не затрагиваются: `WM_CONTEXTMENU` пропускается дальше, если клик был
//! ниже шапки.

use tauri::WebviewWindow;
use winapi::shared::minwindef::{LPARAM, LRESULT, UINT, WPARAM};
use winapi::shared::windef::{HWND, POINT};
use winapi::um::commctrl::{DefSubclassProc, SetWindowSubclass};
use winapi::um::winuser::ScreenToClient;

/// Произвольный, но постоянный идентификатор подкласса.
const SUBCLASS_ID: usize = 0x5A9E_0001;

const WM_SYSCOMMAND: UINT = 0x0112;
const WM_CONTEXTMENU: UINT = 0x007B;
const WM_NCRBUTTONDOWN: UINT = 0x00A4;
const WM_NCRBUTTONUP: UINT = 0x00A5;

/// Alt+Пробел: системное меню окна.
const SC_KEYMENU: WPARAM = 0xF090;

/// Высота собственной шапки в логических пикселях. Клик выше неё считается
/// кликом по шапке и не должен поднимать системное меню.
const TITLE_BAR_HEIGHT: i32 = 56;

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

    // Правая кнопка по области, которую рисует Windows (заголовок, рамка).
    // Своё меню у окна без декораций нет, но окно остаётся с WS_SYSMENU,
    // поэтому система всё ещё присылает эти сообщения.
    if code == WM_NCRBUTTONDOWN || code == WM_NCRBUTTONUP {
        return 0;
    }

    if code == WM_CONTEXTMENU && in_title_bar(window, lparam) {
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

/// Отключает системное меню окна. Вызывается один раз при создании окна.
pub fn suppress_system_menu(window: &WebviewWindow) {
    let Ok(handle) = window.hwnd() else {
        tracing::debug!("HWND недоступен: системное меню останется");

        return;
    };

    // hwnd() отдаёт тип из крейта windows, подкласс ждёт указатель из winapi
    let hwnd = handle.0 as HWND;

    unsafe {
        if SetWindowSubclass(hwnd, Some(hook), SUBCLASS_ID, 0) != 0 {
            tracing::info!("Системное меню окна отключено");
        } else {
            tracing::warn!("Не удалось отключить системное меню окна");
        }
    }
}

// Снимать подкласс вручную не нужно: Windows делает это сама при уничтожении
// окна, а процедура живёт всё время работы приложения.
