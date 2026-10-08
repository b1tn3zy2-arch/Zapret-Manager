use std::path::{Path, PathBuf};

use tauri::image::Image;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};
use crate::tray::TrayState;

pub const ICONS_DIR: &str = "icons/tray";
pub const ANIMATION_FRAMES: usize = 3;
pub const ICON_SIZES: [u32; 2] = [32, 16];
pub const PRIMARY_ICON_SIZE: u32 = 32;
pub const FALLBACK_ICON_SIZE: u32 = 16;

pub fn icons_dir(app: &AppHandle) -> AppResult<PathBuf> {
    for base in candidate_dirs(app) {
        let candidate = base.join(ICONS_DIR);

        if candidate.is_dir() {
            return Ok(candidate);
        }
    }

    let first = candidate_dirs(app)
        .into_iter()
        .next()
        .ok_or_else(|| AppError::custom("Иконки трея не найдены ни в одной папке"))?;

    Ok(first.join(ICONS_DIR))
}

fn candidate_dirs(app: &AppHandle) -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    if let Ok(resource) = app.path().resource_dir() {
        dirs.push(resource);
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            dirs.push(parent.to_path_buf());
        }
    }

    dirs.push(PathBuf::from(env!("CARGO_MANIFEST_DIR")));

    dirs
}

pub fn frame_index(frame: usize) -> usize {
    if frame == 0 {
        1
    } else {
        frame.min(ANIMATION_FRAMES)
    }
}

pub fn icon_file(dir: &Path, state: TrayState, frame: usize, size: u32) -> PathBuf {
    dir.join(format!(
        "{}-{size}-{}.png",
        state.icon_stem(),
        frame_index(frame)
    ))
}

pub fn icon_path(app: &AppHandle, state: TrayState, frame: usize) -> AppResult<PathBuf> {
    let dir = icons_dir(app)?;
    let primary = icon_file(&dir, state, frame, PRIMARY_ICON_SIZE);

    if primary.is_file() {
        return Ok(primary);
    }

    let fallback = icon_file(&dir, state, frame, FALLBACK_ICON_SIZE);

    if fallback.is_file() {
        return Ok(fallback);
    }

    Ok(primary)
}

pub fn load_icon(app: &AppHandle, state: TrayState, frame: usize) -> AppResult<Image<'static>> {
    let path = icon_path(app, state, frame)?;

    Image::from_path(&path).map_err(|error| {
        AppError::custom(format!("Иконка {} не прочитана: {error}", path.display()))
    })
}

pub fn tooltip(
    state: TrayState,
    active_strategy: Option<&str>,
    vpn_name: Option<&str>,
) -> String {
    format!(
        "{} — {}",
        super::APP_NAME,
        state.status_label(active_strategy, vpn_name)
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tray::APP_NAME;

    #[test]
    fn test_icon_file_uses_frame_one_for_non_animating() {
        let dir = Path::new("icons/tray");

        assert_eq!(
            icon_file(dir, TrayState::Idle, 0, 32),
            dir.join("idle-32-1.png")
        );
        assert_eq!(
            icon_file(dir, TrayState::Vpn, 0, 16),
            dir.join("vpn-16-1.png")
        );
    }

    #[test]
    fn test_icon_file_clamps_animation_frames() {
        let dir = Path::new("icons/tray");

        assert_eq!(
            icon_file(dir, TrayState::Connecting, 2, 32),
            dir.join("connecting-32-2.png")
        );
        assert_eq!(
            icon_file(dir, TrayState::Connecting, 9, 32),
            dir.join("connecting-32-3.png")
        );
        assert_eq!(
            icon_file(dir, TrayState::Connecting, 0, 32),
            dir.join("connecting-32-1.png")
        );
    }

    #[test]
    fn test_frame_index_helper() {
        assert_eq!(frame_index(0), 1);
        assert_eq!(frame_index(1), 1);
        assert_eq!(frame_index(3), 3);
        assert_eq!(frame_index(50), 3);
    }

    #[test]
    fn test_tooltip_contains_app_name_and_state() {
        assert_eq!(
            tooltip(TrayState::Idle, None, None),
            format!("{APP_NAME} — Отключено")
        );
        assert_eq!(
            tooltip(TrayState::Vpn, None, Some("Mullvad NL")),
            format!("{APP_NAME} — VPN: Mullvad NL")
        );
    }

    #[test]
    fn test_icons_dir_is_relative_to_resources() {
        assert_eq!(ICONS_DIR, "icons/tray");
    }

    #[test]
    fn test_icon_sizes_cover_dpi() {
        assert!(ICON_SIZES.contains(&16));
        assert!(ICON_SIZES.contains(&32));
    }

    #[test]
    fn test_icons_exist_for_every_state() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join(ICONS_DIR);

        for state in [
            TrayState::Idle,
            TrayState::Connected,
            TrayState::Vpn,
            TrayState::Error,
        ] {
            for size in ICON_SIZES {
                let path = icon_file(&dir, state, 0, size);

                assert!(path.is_file(), "нет иконки {}", path.display());
            }
        }
    }

    #[test]
    fn test_connecting_has_all_animation_frames() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join(ICONS_DIR);

        for size in ICON_SIZES {
            for frame in 1..=ANIMATION_FRAMES {
                let path = icon_file(&dir, TrayState::Connecting, frame, size);

                assert!(path.is_file(), "нет кадра {}", path.display());
            }
        }
    }

    #[test]
    fn test_every_icon_is_png_and_small() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join(ICONS_DIR);
        let Ok(entries) = std::fs::read_dir(dir) else {
            return;
        };

        let mut count = 0;

        for entry in entries.flatten() {
            let path = entry.path();

            if path.extension().and_then(|value| value.to_str()) != Some("png") {
                continue;
            }

            let size = entry.metadata().map(|meta| meta.len()).unwrap_or(0);

            assert!(size > 0, "пустая иконка {}", path.display());
            assert!(size < 16 * 1024, "иконка велика: {}", path.display());

            count += 1;
        }

        assert_eq!(count, 14);
    }
}