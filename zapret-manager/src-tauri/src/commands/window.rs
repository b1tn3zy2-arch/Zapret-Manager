use serde::Serialize;
use tauri::Window;

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonitorInfo {
    pub name: Option<String>,
    pub scale_factor: f64,
    pub width: u32,
    pub height: u32,
    pub logical_width: u32,
    pub logical_height: u32,
    pub x: i32,
    pub y: i32,
}

fn logical_size(width: u32, height: u32, scale: f64) -> (u32, u32) {
    if scale <= 0.0 || !scale.is_finite() {
        return (width, height);
    }

    (
        (width as f64 / scale).round() as u32,
        (height as f64 / scale).round() as u32,
    )
}

fn monitor_info_for(window: &Window) -> Option<MonitorInfo> {
    let monitor = window.current_monitor().ok().flatten()?;
    let scale = monitor.scale_factor();
    let position = monitor.position();
    let size = monitor.size();
    let (logical_width, logical_height) = logical_size(size.width, size.height, scale);

    Some(MonitorInfo {
        name: monitor.name().cloned(),
        scale_factor: scale,
        width: size.width,
        height: size.height,
        logical_width,
        logical_height,
        x: position.x,
        y: position.y,
    })
}

#[tauri::command]
pub fn get_monitor_info(window: Window) -> AppResult<MonitorInfo> {
    monitor_info_for(&window).ok_or_else(|| AppError::custom("монитор недоступен"))
}

#[tauri::command]
pub fn get_display_scale(window: Window) -> AppResult<f64> {
    Ok(window.scale_factor().unwrap_or(1.0))
}

#[tauri::command]
pub fn toggle_fullscreen(window: Window) -> AppResult<bool> {
    let next = !window.is_fullscreen().map_err(|error| {
        AppError::custom(format!("не удалось прочитать состояние окна: {error}"))
    })?;

    window
        .set_fullscreen(next)
        .map_err(|error| AppError::custom(format!("не удалось сменить режим: {error}")))?;

    Ok(next)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn logical_size_divides_physical_by_scale() {
        assert_eq!(logical_size(2880, 1620, 1.5), (1920, 1080));
        assert_eq!(logical_size(2560, 1440, 2.0), (1280, 720));
        assert_eq!(logical_size(800, 600, 1.0), (800, 600));
    }

    #[test]
    fn logical_size_ignores_invalid_scale() {
        assert_eq!(logical_size(1024, 768, 0.0), (1024, 768));
        assert_eq!(logical_size(1024, 768, f64::NAN), (1024, 768));
    }
}
