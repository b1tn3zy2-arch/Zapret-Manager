mod icons;

mod runtime;

use serde::{Deserialize, Serialize};

use crate::error::{AppError, AppResult};

pub use icons::{
    icon_file, icon_path, icons_dir, load_icon, tooltip, ANIMATION_FRAMES, ICONS_DIR, ICON_SIZES,
};
pub const EVENT_NAVIGATE_DASHBOARD: &str = "navigate-dashboard";
pub const EVENT_NAVIGATE_STRATEGIES: &str = "navigate-strategies";
pub const EVENT_NAVIGATE_LOGS: &str = "navigate-logs";
pub const EVENT_NAVIGATE_SETTINGS: &str = "navigate-settings";

pub use runtime::{
    apply_state, configure, create_tray, register, set_icon_state, show_window, snapshot,
    start_animation, stop_animation, toggle_window, tray_handle, update_tooltip_and_menu,
    TrayStateHolder, ANIMATION_DURATION_MS, ANIMATION_INTERVAL_MS, TRAY_ID, WINDOW_LABEL,
};

pub const EVENT_RUN_STRATEGY: &str = "tray-run-strategy";
pub const EVENT_STOP_STRATEGY: &str = "tray-stop-strategy";
pub const EVENT_QUICK_RUN: &str = "tray-quick-run";
pub const EVENT_CONNECT_VPN: &str = "tray-connect-vpn";
pub const EVENT_DISCONNECT_VPN: &str = "tray-disconnect-vpn";
pub const EVENT_CHECK_UPDATES: &str = "tray-check-updates";
pub const EVENT_QUIT: &str = "tray-quit";
pub const EVENT_TRAY_LEFT_CLICK: &str = "tray-left-click";

pub const NAVIGATION_EVENTS: [&str; 4] = [
    "navigate-dashboard",
    "navigate-strategies",
    "navigate-logs",
    "navigate-settings",
];

pub const APP_NAME: &str = "Zapret Manager";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TrayState {
    Idle,
    Connecting,
    Connected,
    Vpn,
    Error,
}

impl TrayState {
    pub fn parse(raw: &str) -> AppResult<Self> {
        match raw.trim().to_ascii_lowercase().as_str() {
            "idle" => Ok(Self::Idle),
            "connecting" => Ok(Self::Connecting),
            "connected" => Ok(Self::Connected),
            "vpn" => Ok(Self::Vpn),
            "error" => Ok(Self::Error),
            other => Err(AppError::custom(format!("Неизвестное состояние трея: {other}"))),
        }
    }

    pub fn icon_stem(self) -> &'static str {
        match self {
            Self::Idle => "idle",
            Self::Connecting => "connecting",
            Self::Connected => "connected",
            Self::Vpn => "vpn",
            Self::Error => "error",
        }
    }

    pub fn status_label(self, active_strategy: Option<&str>, vpn_name: Option<&str>) -> String {
        match self {
            Self::Idle => "Отключено".to_string(),
            Self::Connecting => "Подключение…".to_string(),
            Self::Connected => match active_strategy {
                Some(name) if !name.is_empty() => format!("Активно: {name}"),
                _ => "Активно".to_string(),
            },
            Self::Vpn => match vpn_name {
                Some(name) if !name.is_empty() => format!("VPN: {name}"),
                _ => "VPN активен".to_string(),
            },
            Self::Error => "Ошибка".to_string(),
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrayConfig {
    pub animate_on_connect: bool,
    pub show_notifications_on_start: bool,
    pub show_notifications_on_stop: bool,
    pub show_update_notifications: bool,
}

impl Default for TrayConfig {
    fn default() -> Self {
        Self {
            animate_on_connect: true,
            show_notifications_on_start: false,
            show_notifications_on_stop: false,
            show_update_notifications: true,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NotificationKind {
    Success,
    Error,
    Warning,
    Info,
}

impl NotificationKind {
    pub fn parse(raw: &str) -> AppResult<Self> {
        match raw.trim().to_ascii_lowercase().as_str() {
            "success" => Ok(Self::Success),
            "error" => Ok(Self::Error),
            "warning" => Ok(Self::Warning),
            "info" => Ok(Self::Info),
            other => Err(AppError::custom(format!("Неизвестный тип уведомления: {other}"))),
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Success => "success",
            Self::Error => "error",
            Self::Warning => "warning",
            Self::Info => "info",
        }
    }
}

#[cfg(test)]
#[path = "tray_tests.rs"]
mod tests;