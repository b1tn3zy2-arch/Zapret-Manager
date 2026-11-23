// Выполняем операцию: mod icons;.
mod icons;

// Выполняем операцию: mod runtime;.
mod runtime;

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Выполняем операцию: pub use icons::{.
pub use icons::{
    // Выполняем операцию: icon_file, icon_path, icons_dir, load_icon, tooltip, AN.
    icon_file,
    icon_path,
    icons_dir,
    load_icon,
    tooltip,
    ANIMATION_FRAMES,
    ICONS_DIR,
    ICON_SIZES,
    // Закрываем блок.
};
// Объявляем константу EVENT_NAVIGATE_DASHBOARD.
pub const EVENT_NAVIGATE_DASHBOARD: &str = "navigate-dashboard";
// Объявляем константу EVENT_NAVIGATE_STRATEGIES.
pub const EVENT_NAVIGATE_STRATEGIES: &str = "navigate-strategies";
// Объявляем константу EVENT_NAVIGATE_LOGS.
pub const EVENT_NAVIGATE_LOGS: &str = "navigate-logs";
// Объявляем константу EVENT_NAVIGATE_SETTINGS.
pub const EVENT_NAVIGATE_SETTINGS: &str = "navigate-settings";
// Объявляем константу EVENT_NAVIGATE_ABOUT.
pub const EVENT_NAVIGATE_ABOUT: &str = "navigate-about";

// Выполняем операцию: pub use runtime::{.
pub use runtime::{
    // Выполняем операцию: apply_state, configure, create_tray, register, set_icon.
    apply_state,
    configure,
    create_tray,
    register,
    set_icon_state,
    show_window,
    snapshot,
    // Выполняем операцию: start_animation, stop_animation, sync_vpn_state, toggle.
    start_animation,
    stop_animation,
    sync_vpn_state,
    toggle_window,
    tray_handle,
    // Выполняем операцию: update_tooltip_and_menu, TrayStateHolder, ANIMATION_INT.
    update_tooltip_and_menu,
    TrayStateHolder,
    ANIMATION_INTERVAL_MS,
    TRAY_ID,
    WINDOW_LABEL,
    // Закрываем блок.
};

// Объявляем константу EVENT_STOP_STRATEGY.
pub const EVENT_STOP_STRATEGY: &str = "tray-stop-strategy";
// Объявляем константу EVENT_QUICK_RUN.
pub const EVENT_QUICK_RUN: &str = "tray-quick-run";
// Объявляем константу EVENT_CONNECT_VPN.
pub const EVENT_CONNECT_VPN: &str = "tray-connect-vpn";
// Объявляем константу EVENT_DISCONNECT_VPN.
pub const EVENT_DISCONNECT_VPN: &str = "tray-disconnect-vpn";
// Объявляем константу EVENT_CHECK_UPDATES.
pub const EVENT_CHECK_UPDATES: &str = "tray-check-updates";

// Объявляем константу NAVIGATION_EVENTS.
pub const NAVIGATION_EVENTS: [&str; 4] = [
    // Выполняем операцию: "navigate-dashboard",.
    "navigate-dashboard",
    // Выполняем операцию: "navigate-strategies",.
    "navigate-strategies",
    // Выполняем операцию: "navigate-logs",.
    "navigate-logs",
    // Выполняем операцию: "navigate-settings",.
    "navigate-settings",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу APP_NAME.
pub const APP_NAME: &str = "Zapret";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "lowercase")]
// Объявляем перечисление TrayState.
pub enum TrayState {
    // Выполняем операцию: Idle,.
    Idle,
    // Выполняем операцию: Connecting,.
    Connecting,
    // Выполняем операцию: Connected,.
    Connected,
    // Выполняем операцию: Vpn,.
    Vpn,
    // Выполняем операцию: Error,.
    Error,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl TrayState {
    // Объявляем функцию parse.
    pub fn parse(raw: &str) -> AppResult<Self> {
        // Выбираем вариант по значению.
        match raw.trim().to_ascii_lowercase().as_str() {
            // Выполняем операцию: "idle" => Ok(Self::Idle),.
            "idle" => Ok(Self::Idle),
            // Выполняем операцию: "connecting" => Ok(Self::Connecting),.
            "connecting" => Ok(Self::Connecting),
            // Выполняем операцию: "connected" => Ok(Self::Connected),.
            "connected" => Ok(Self::Connected),
            // Выполняем операцию: "vpn" => Ok(Self::Vpn),.
            "vpn" => Ok(Self::Vpn),
            // Выполняем операцию: "error" => Ok(Self::Error),.
            "error" => Ok(Self::Error),
            // Выполняем операцию: other => Err(AppError::custom(format!(.
            other => Err(AppError::custom(format!(
                // Выполняем операцию: "Неизвестное состояние трея: {other}".
                "Неизвестное состояние трея: {other}" // Закрываем выражение или коллекцию.
            ))),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию icon_stem.
    pub fn icon_stem(self) -> &'static str {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::Idle => "idle",.
            Self::Idle => "idle",
            // Выполняем операцию: Self::Connecting => "connecting",.
            Self::Connecting => "connecting",
            // Выполняем операцию: Self::Connected => "connected",.
            Self::Connected => "connected",
            // Выполняем операцию: Self::Vpn => "vpn",.
            Self::Vpn => "vpn",
            // Выполняем операцию: Self::Error => "error",.
            Self::Error => "error",
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию status_label.
    pub fn status_label(self, active_strategy: Option<&str>, vpn_name: Option<&str>) -> String {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::Idle => "Отключено".to_string(),.
            Self::Idle => "Отключено".to_string(),
            // Выполняем операцию: Self::Connecting => "Подключение…".to_string(),.
            Self::Connecting => "Подключение…".to_string(),
            // Выполняем операцию: Self::Connected => match active_strategy {.
            Self::Connected => match active_strategy {
                // Выполняем операцию: Some(name) if !name.is_empty() => format!("Активно: {na.
                Some(name) if !name.is_empty() => format!("Активно: {name}"),
                // Выполняем операцию: _ => "Активно".to_string(),.
                _ => "Активно".to_string(),
                // Закрываем блок.
            },
            // Выполняем операцию: Self::Vpn => match vpn_name {.
            Self::Vpn => match vpn_name {
                // Выполняем операцию: Some(name) if !name.is_empty() => format!("VPN: {name}".
                Some(name) if !name.is_empty() => format!("VPN: {name}"),
                // Выполняем операцию: _ => "VPN активен".to_string(),.
                _ => "VPN активен".to_string(),
                // Закрываем блок.
            },
            // Выполняем операцию: Self::Error => "Ошибка".to_string(),.
            Self::Error => "Ошибка".to_string(),
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TrayConfig.
pub struct TrayConfig {
    // Выполняем операцию: pub animate_on_connect: bool,.
    pub animate_on_connect: bool,
    // Выполняем операцию: pub show_notifications_on_start: bool,.
    pub show_notifications_on_start: bool,
    // Выполняем операцию: pub show_notifications_on_stop: bool,.
    pub show_notifications_on_stop: bool,
    // Выполняем операцию: pub show_update_notifications: bool,.
    pub show_update_notifications: bool,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Default for TrayConfig {
    // Объявляем функцию default.
    fn default() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: animate_on_connect: true,.
            animate_on_connect: true,
            // Выполняем операцию: show_notifications_on_start: false,.
            show_notifications_on_start: false,
            // Выполняем операцию: show_notifications_on_stop: false,.
            show_notifications_on_stop: false,
            // Выполняем операцию: show_update_notifications: true,.
            show_update_notifications: true,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "lowercase")]
// Объявляем перечисление NotificationKind.
pub enum NotificationKind {
    // Выполняем операцию: Success,.
    Success,
    // Выполняем операцию: Error,.
    Error,
    // Выполняем операцию: Warning,.
    Warning,
    // Выполняем операцию: Info,.
    Info,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl NotificationKind {
    // Объявляем функцию parse.
    pub fn parse(raw: &str) -> AppResult<Self> {
        // Выбираем вариант по значению.
        match raw.trim().to_ascii_lowercase().as_str() {
            // Выполняем операцию: "success" => Ok(Self::Success),.
            "success" => Ok(Self::Success),
            // Выполняем операцию: "error" => Ok(Self::Error),.
            "error" => Ok(Self::Error),
            // Выполняем операцию: "warning" => Ok(Self::Warning),.
            "warning" => Ok(Self::Warning),
            // Выполняем операцию: "info" => Ok(Self::Info),.
            "info" => Ok(Self::Info),
            // Выполняем операцию: other => Err(AppError::custom(format!(.
            other => Err(AppError::custom(format!(
                // Выполняем операцию: "Неизвестный тип уведомления: {other}".
                "Неизвестный тип уведомления: {other}" // Закрываем выражение или коллекцию.
            ))),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию as_str.
    pub fn as_str(self) -> &'static str {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::Success => "success",.
            Self::Success => "success",
            // Выполняем операцию: Self::Error => "error",.
            Self::Error => "error",
            // Выполняем операцию: Self::Warning => "warning",.
            Self::Warning => "warning",
            // Выполняем операцию: Self::Info => "info",.
            Self::Info => "info",
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "tray_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
