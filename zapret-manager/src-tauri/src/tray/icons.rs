// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: tauri::image::Image;.
use tauri::image::Image;
// Подключаем модули: tauri::{AppHandle, Manager};.
use tauri::{AppHandle, Manager};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::tray::TrayState;.
use crate::tray::TrayState;

// Объявляем константу ICONS_DIR.
pub const ICONS_DIR: &str = "icons/tray";
// Объявляем константу ANIMATION_FRAMES.
pub const ANIMATION_FRAMES: usize = 3;
// Объявляем константу ICON_SIZES.
pub const ICON_SIZES: [u32; 2] = [32, 16];
// Объявляем константу PRIMARY_ICON_SIZE.
pub const PRIMARY_ICON_SIZE: u32 = 32;
// Объявляем константу FALLBACK_ICON_SIZE.
pub const FALLBACK_ICON_SIZE: u32 = 16;

// Объявляем функцию icons_dir.
pub fn icons_dir(app: &AppHandle) -> AppResult<PathBuf> {
    // Перебираем элементы коллекции.
    for base in candidate_dirs(app) {
        // Объявляем переменную candidate .
        let candidate = base.join(ICONS_DIR);

        // Проверяем условие: candidate.is_dir() {.
        if candidate.is_dir() {
            // Возвращаем результат из функции.
            return Ok(candidate);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную first .
    let first = candidate_dirs(app)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .next().
        .next()
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Иконки трея не найдены.
        .ok_or_else(|| AppError::custom("Иконки трея не найдены ни в одной папке"))?;

    // Выполняем операцию: Ok(first.join(ICONS_DIR)).
    Ok(first.join(ICONS_DIR))
    // Закрываем блок.
}

// Объявляем функцию candidate_dirs.
fn candidate_dirs(app: &AppHandle) -> Vec<PathBuf> {
    // Объявляем переменную dirs .
    let mut dirs = Vec::new();

    // Проверяем условие: let Ok(resource) = app.path().resource_dir() {.
    if let Ok(resource) = app.path().resource_dir() {
        // Выполняем операцию: dirs.push(resource);.
        dirs.push(resource);
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(exe) = std::env::current_exe() {.
    if let Ok(exe) = std::env::current_exe() {
        // Проверяем условие: let Some(parent) = exe.parent() {.
        if let Some(parent) = exe.parent() {
            // Выполняем операцию: dirs.push(parent.to_path_buf());.
            dirs.push(parent.to_path_buf());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: dirs.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")));.
    dirs.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")));

    // Выполняем операцию: dirs.
    dirs
    // Закрываем блок.
}

// Объявляем функцию frame_index.
pub fn frame_index(frame: usize) -> usize {
    // Проверяем условие: frame == 0 {.
    if frame == 0 {
        // Выполняем операцию: 1.
        1
    // Закрываем блок.
    } else {
        // Выполняем операцию: frame.min(ANIMATION_FRAMES).
        frame.min(ANIMATION_FRAMES)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию icon_file.
pub fn icon_file(dir: &Path, state: TrayState, frame: usize, size: u32) -> PathBuf {
    // Выполняем операцию: dir.join(format!(.
    dir.join(format!(
        // Выполняем операцию: "{}-{size}-{}.png",.
        "{}-{size}-{}.png",
        // Выполняем операцию: state.icon_stem(),.
        state.icon_stem(),
        // Выполняем операцию: frame_index(frame).
        frame_index(frame) // Закрываем выражение или коллекцию.
    ))
    // Закрываем блок.
}

// Объявляем функцию icon_path.
pub fn icon_path(app: &AppHandle, state: TrayState, frame: usize) -> AppResult<PathBuf> {
    // Объявляем переменную dir .
    let dir = icons_dir(app)?;
    // Объявляем переменную primary .
    let primary = icon_file(&dir, state, frame, PRIMARY_ICON_SIZE);

    // Проверяем условие: primary.is_file() {.
    if primary.is_file() {
        // Возвращаем результат из функции.
        return Ok(primary);
        // Закрываем блок.
    }

    // Объявляем переменную fallback .
    let fallback = icon_file(&dir, state, frame, FALLBACK_ICON_SIZE);

    // Проверяем условие: fallback.is_file() {.
    if fallback.is_file() {
        // Возвращаем результат из функции.
        return Ok(fallback);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(primary).
    Ok(primary)
    // Закрываем блок.
}

// Объявляем функцию load_icon.
pub fn load_icon(app: &AppHandle, state: TrayState, frame: usize) -> AppResult<Image<'static>> {
    // Объявляем переменную path .
    let path = icon_path(app, state, frame)?;

    // Выполняем операцию: Image::from_path(&path).map_err(|error| {.
    Image::from_path(&path).map_err(|error| {
        // Выполняем операцию: AppError::custom(format!("Иконка {} не прочитана: {erro.
        AppError::custom(format!("Иконка {} не прочитана: {error}", path.display()))
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию tooltip.
pub fn tooltip(state: TrayState, active_strategy: Option<&str>, vpn_name: Option<&str>) -> String {
    // Выполняем операцию: format!(.
    format!(
        // Выполняем операцию: "{} — {}",.
        "{} — {}",
        // Выполняем операцию: super::APP_NAME,.
        super::APP_NAME,
        // Выполняем операцию: state.status_label(active_strategy, vpn_name).
        state.status_label(active_strategy, vpn_name) // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;
    // Подключаем модули: crate::tray::APP_NAME;.
    use crate::tray::APP_NAME;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_icon_file_uses_frame_one_for_non_animating.
    fn test_icon_file_uses_frame_one_for_non_animating() {
        // Объявляем переменную dir .
        let dir = Path::new("icons/tray");

        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: icon_file(dir, TrayState::Idle, 0, 32),.
            icon_file(dir, TrayState::Idle, 0, 32),
            // Выполняем операцию: dir.join("idle-32-1.png").
            dir.join("idle-32-1.png") // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: icon_file(dir, TrayState::Vpn, 0, 16),.
            icon_file(dir, TrayState::Vpn, 0, 16),
            // Выполняем операцию: dir.join("vpn-16-1.png").
            dir.join("vpn-16-1.png") // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_icon_file_clamps_animation_frames.
    fn test_icon_file_clamps_animation_frames() {
        // Объявляем переменную dir .
        let dir = Path::new("icons/tray");

        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: icon_file(dir, TrayState::Connecting, 2, 32),.
            icon_file(dir, TrayState::Connecting, 2, 32),
            // Выполняем операцию: dir.join("connecting-32-2.png").
            dir.join("connecting-32-2.png") // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: icon_file(dir, TrayState::Connecting, 9, 32),.
            icon_file(dir, TrayState::Connecting, 9, 32),
            // Выполняем операцию: dir.join("connecting-32-3.png").
            dir.join("connecting-32-3.png") // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: icon_file(dir, TrayState::Connecting, 0, 32),.
            icon_file(dir, TrayState::Connecting, 0, 32),
            // Выполняем операцию: dir.join("connecting-32-1.png").
            dir.join("connecting-32-1.png") // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_frame_index_helper.
    fn test_frame_index_helper() {
        // Выполняем операцию: assert_eq!(frame_index(0), 1);.
        assert_eq!(frame_index(0), 1);
        // Выполняем операцию: assert_eq!(frame_index(1), 1);.
        assert_eq!(frame_index(1), 1);
        // Выполняем операцию: assert_eq!(frame_index(3), 3);.
        assert_eq!(frame_index(3), 3);
        // Выполняем операцию: assert_eq!(frame_index(50), 3);.
        assert_eq!(frame_index(50), 3);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_tooltip_contains_app_name_and_state.
    fn test_tooltip_contains_app_name_and_state() {
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: tooltip(TrayState::Idle, None, None),.
            tooltip(TrayState::Idle, None, None),
            // Выполняем операцию: format!("{APP_NAME} — Отключено").
            format!("{APP_NAME} — Отключено") // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: tooltip(TrayState::Vpn, None, Some("Mullvad NL")),.
            tooltip(TrayState::Vpn, None, Some("Mullvad NL")),
            // Выполняем операцию: format!("{APP_NAME} — VPN: Mullvad NL").
            format!("{APP_NAME} — VPN: Mullvad NL") // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_icons_dir_is_relative_to_resources.
    fn test_icons_dir_is_relative_to_resources() {
        // Выполняем операцию: assert_eq!(ICONS_DIR, "icons/tray");.
        assert_eq!(ICONS_DIR, "icons/tray");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_icon_sizes_cover_dpi.
    fn test_icon_sizes_cover_dpi() {
        // Выполняем операцию: assert!(ICON_SIZES.contains(&16));.
        assert!(ICON_SIZES.contains(&16));
        // Выполняем операцию: assert!(ICON_SIZES.contains(&32));.
        assert!(ICON_SIZES.contains(&32));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_icons_exist_for_every_state.
    fn test_icons_exist_for_every_state() {
        // Объявляем переменную dir .
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join(ICONS_DIR);

        // Перебираем элементы коллекции.
        for state in [
            // Выполняем операцию: TrayState::Idle,.
            TrayState::Idle,
            // Выполняем операцию: TrayState::Connected,.
            TrayState::Connected,
            // Выполняем операцию: TrayState::Vpn,.
            TrayState::Vpn,
            // Выполняем операцию: TrayState::Error,.
            TrayState::Error,
            // Выполняем операцию: ] {.
        ] {
            // Перебираем элементы коллекции.
            for size in ICON_SIZES {
                // Объявляем переменную path .
                let path = icon_file(&dir, state, 0, size);

                // Выполняем операцию: assert!(path.is_file(), "нет иконки {}", path.display().
                assert!(path.is_file(), "нет иконки {}", path.display());
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_connecting_has_all_animation_frames.
    fn test_connecting_has_all_animation_frames() {
        // Объявляем переменную dir .
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join(ICONS_DIR);

        // Перебираем элементы коллекции.
        for size in ICON_SIZES {
            // Перебираем элементы коллекции.
            for frame in 1..=ANIMATION_FRAMES {
                // Объявляем переменную path .
                let path = icon_file(&dir, TrayState::Connecting, frame, size);

                // Выполняем операцию: assert!(path.is_file(), "нет кадра {}", path.display()).
                assert!(path.is_file(), "нет кадра {}", path.display());
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_every_icon_is_png_and_small.
    fn test_every_icon_is_png_and_small() {
        // Объявляем переменную dir .
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join(ICONS_DIR);
        // Объявляем переменную Ok(entries) .
        let Ok(entries) = std::fs::read_dir(dir) else {
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        };

        // Объявляем переменную count .
        let mut count = 0;

        // Перебираем элементы коллекции.
        for entry in entries.flatten() {
            // Объявляем переменную path .
            let path = entry.path();

            // Проверяем условие: path.extension().and_then(|value| value.to_str()) .
            if path.extension().and_then(|value| value.to_str()) != Some("png") {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Объявляем переменную size .
            let size = entry.metadata().map(|meta| meta.len()).unwrap_or(0);

            // Выполняем операцию: assert!(size > 0, "пустая иконка {}", path.display());.
            assert!(size > 0, "пустая иконка {}", path.display());
            // Выполняем операцию: assert!(size < 16 * 1024, "иконка велика: {}", path.dis.
            assert!(size < 16 * 1024, "иконка велика: {}", path.display());

            // Выполняем операцию: count += 1;.
            count += 1;
            // Закрываем блок.
        }

        // Выполняем операцию: assert_eq!(count, 14);.
        assert_eq!(count, 14);
        // Закрываем блок.
    }
    // Закрываем блок.
}
