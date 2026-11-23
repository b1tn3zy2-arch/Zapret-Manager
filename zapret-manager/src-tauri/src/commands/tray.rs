// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: tauri::{Emitter, Manager};.
use tauri::{Emitter, Manager};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::tray::{NotificationKind, TrayConfig, TrayState};.
use crate::tray::{NotificationKind, TrayConfig, TrayState};

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TrayUpdate.
pub struct TrayUpdate {
    // Выполняем операцию: pub state: String,.
    pub state: String,
    // Выполняем операцию: pub active_strategy: Option<String>,.
    pub active_strategy: Option<String>,
    // Выполняем операцию: pub vpn_name: Option<String>,.
    pub vpn_name: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию update_tray_state.
pub fn update_tray_state(app: tauri::AppHandle, update: TrayUpdate) -> AppResult<()> {
    // Объявляем переменную state .
    let state = TrayState::parse(&update.state)?;
    // Объявляем переменную active .
    let active = clean(update.active_strategy);
    // Объявляем переменную vpn .
    let vpn = clean(update.vpn_name);

    // Выполняем операцию: tracing::debug!("Трей: состояние {state:?}, стратегия {.
    tracing::debug!("Трей: состояние {state:?}, стратегия {active:?}, vpn {vpn:?}");

    // Выполняем операцию: crate::tray::apply_state(&app, state, active, vpn).
    crate::tray::apply_state(&app, state, active, vpn)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию update_tray_config.
pub fn update_tray_config(app: tauri::AppHandle, config: TrayConfig) -> AppResult<()> {
    // Выполняем операцию: crate::tray::configure(&app, config.animate_on_connect).
    crate::tray::configure(&app, config.animate_on_connect);
    // Выполняем операцию: crate::tray::update_tooltip_and_menu(&app).
    crate::tray::update_tooltip_and_menu(&app)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию show_notification.
pub fn show_notification(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Выполняем операцию: body: String,.
    body: String,
    // Выполняем операцию: kind: String,.
    kind: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<()> {
    // Объявляем переменную kind .
    let kind = NotificationKind::parse(&kind)?;
    // Выполняем операцию: crate::commands::notify::send(&app, &title, &body, kind.
    crate::commands::notify::send(&app, &title, &body, kind)
    // Закрываем блок.
}

/// Единая процедура завершения приложения.
///
/// Раньше пункт «Выход» в меню трея выходил через app.exit(0) напрямую и не
/// трогал процессы: winws.exe оставались висеть после закрытия приложения.
// Выполняем операцию: pub async fn shutdown(app: &tauri::AppHandle) -> AppRes.
pub async fn shutdown(app: &tauri::AppHandle) -> AppResult<()> {
    // Выполняем операцию: crate::window_behavior::begin_quit(app);.
    crate::window_behavior::begin_quit(app);

    // Объявляем переменную state .
    let state = app.state::<crate::process_manager::ProcessManager>();

    // Выполняем операцию: state.clear();.
    state.clear();

    // Проверяем условие: let Some(runtime) = app.try_state::<crate::command.
    if let Some(runtime) = app.try_state::<crate::commands::vpn_core::XrayRuntime>() {
        // Выполняем операцию: runtime.shutdown();.
        runtime.shutdown();
        // Выполняем операцию: tracing::info!("Выход из приложения: Xray остановлен, п.
        tracing::info!("Выход из приложения: Xray остановлен, прокси восстановлен");
        // Закрываем блок.
    }

    // Объявляем переменную killed .
    let killed = crate::commands::runner::kill_winws_for_shutdown().await;

    // Выполняем операцию: tracing::info!("Выход из приложения: остановлено процес.
    tracing::info!("Выход из приложения: остановлено процессов winws.exe {killed}");
    // Выполняем операцию: app.exit(0);.
    app.exit(0);

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn quit_app(app: tauri::AppHandle) -> AppResu.
pub async fn quit_app(app: tauri::AppHandle) -> AppResult<()> {
    // Выполняем операцию: shutdown(&app).await.
    shutdown(&app).await
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TrayMenuSnapshot.
pub struct TrayMenuSnapshot {
    // Выполняем операцию: pub state: String,.
    pub state: String,
    // Выполняем операцию: pub active_strategy: Option<String>,.
    pub active_strategy: Option<String>,
    // Выполняем операцию: pub vpn_name: Option<String>,.
    pub vpn_name: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию tray_menu_snapshot.
pub fn tray_menu_snapshot(app: tauri::AppHandle) -> TrayMenuSnapshot {
    // Выполняем операцию: tray_snapshot(&app).
    tray_snapshot(&app)
    // Закрываем блок.
}

// Объявляем функцию tray_snapshot.
pub fn tray_snapshot<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> TrayMenuSnapshot {
    // Объявляем переменную (state, active_strategy, vpn_name) .
    let (state, active_strategy, vpn_name) = crate::tray::snapshot(app);

    // Выполняем операцию: TrayMenuSnapshot::from_parts(state, active_strategy, vp.
    TrayMenuSnapshot::from_parts(state, active_strategy, vpn_name)
    // Закрываем блок.
}

// Открываем реализацию типа.
impl TrayMenuSnapshot {
    // Объявляем функцию from_parts.
    pub fn from_parts(
        // Выполняем операцию: state: TrayState,.
        state: TrayState,
        // Выполняем операцию: active_strategy: Option<String>,.
        active_strategy: Option<String>,
        // Выполняем операцию: vpn_name: Option<String>,.
        vpn_name: Option<String>,
        // Закрываем выражение или коллекцию.
    ) -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: state: match state {.
            state: match state {
                // Выполняем операцию: TrayState::Idle => "idle",.
                TrayState::Idle => "idle",
                // Выполняем операцию: TrayState::Connecting => "connecting",.
                TrayState::Connecting => "connecting",
                // Выполняем операцию: TrayState::Connected => "connected",.
                TrayState::Connected => "connected",
                // Выполняем операцию: TrayState::Vpn => "vpn",.
                TrayState::Vpn => "vpn",
                // Выполняем операцию: TrayState::Error => "error",.
                TrayState::Error => "error",
                // Закрываем блок.
            }
            // Выполняем операцию: .to_string(),.
            .to_string(),
            // Выполняем операцию: active_strategy,.
            active_strategy,
            // Выполняем операцию: vpn_name,.
            vpn_name,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию tray_menu_hide.
pub fn tray_menu_hide(app: tauri::AppHandle) {
    // Выполняем операцию: crate::tray_menu::hide(&app);.
    crate::tray_menu::hide(&app);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию tray_menu_ready.
pub fn tray_menu_ready() {
    // Выполняем операцию: crate::tray_menu::mark_ready();.
    crate::tray_menu::mark_ready();
    // Закрываем блок.
}

/// Сообщение от окна трея о реальной высоте меню: списокitems меняется
/// (VPN-сервер, статус стратегии), и окно обязано подстроиться, иначе нижние
/// пункты вместе с «Выход» снова окажутся за краем.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию tray_menu_set_height.
pub fn tray_menu_set_height(app: tauri::AppHandle, height: f64) {
    // Выполняем операцию: crate::tray_menu::set_content_height(&app, height);.
    crate::tray_menu::set_content_height(&app, height);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn tray_menu_action(app: tauri::AppHandle, ac.
pub async fn tray_menu_action(app: tauri::AppHandle, action: String) -> AppResult<()> {
    // Выполняем операцию: crate::tray_menu::hide(&app);.
    crate::tray_menu::hide(&app);

    // Выбираем вариант по значению.
    match action.as_str() {
        // Выполняем операцию: "open" => {.
        "open" => {
            // Выполняем операцию: crate::tray::show_window(&app);.
            crate::tray::show_window(&app);

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "run" => {.
        "run" => {
            // Выполняем операцию: crate::tray::show_window(&app);.
            crate::tray::show_window(&app);
            // Объявляем переменную _ .
            let _ = app.emit(crate::tray::EVENT_QUICK_RUN, ());

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "stop" => {.
        "stop" => {
            // Объявляем переменную _ .
            let _ = app.emit(crate::tray::EVENT_STOP_STRATEGY, ());

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "dashboard" | "strategies" | "logs" | "settings" | "abo.
        "dashboard" | "strategies" | "logs" | "settings" | "about" => {
            // Выполняем операцию: crate::tray::show_window(&app);.
            crate::tray::show_window(&app);
            // Объявляем переменную _ .
            let _ = app.emit(navigation_event(&action), ());

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "vpn-connect" => {.
        "vpn-connect" => {
            // Объявляем переменную _ .
            let _ = app.emit(crate::tray::EVENT_CONNECT_VPN, ());

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "vpn-disconnect" => {.
        "vpn-disconnect" => {
            // Объявляем переменную _ .
            let _ = app.emit(crate::tray::EVENT_DISCONNECT_VPN, ());

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "updates" => {.
        "updates" => {
            // Выполняем операцию: crate::tray::show_window(&app);.
            crate::tray::show_window(&app);
            // Объявляем переменную _ .
            let _ = app.emit(crate::tray::EVENT_CHECK_UPDATES, ());

            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        }
        // Выполняем операцию: "quit" => shutdown(&app).await,.
        "quit" => shutdown(&app).await,
        // Выполняем операцию: other => Err(AppError::custom(format!(.
        other => Err(AppError::custom(format!(
            // Выполняем операцию: "Неизвестное действие меню: {other}".
            "Неизвестное действие меню: {other}" // Закрываем выражение или коллекцию.
        ))),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию navigation_event.
fn navigation_event(action: &str) -> &'static str {
    // Выбираем вариант по значению.
    match action {
        // Выполняем операцию: "strategies" => crate::tray::EVENT_NAVIGATE_STRATEGIES,.
        "strategies" => crate::tray::EVENT_NAVIGATE_STRATEGIES,
        // Выполняем операцию: "logs" => crate::tray::EVENT_NAVIGATE_LOGS,.
        "logs" => crate::tray::EVENT_NAVIGATE_LOGS,
        // Выполняем операцию: "settings" => crate::tray::EVENT_NAVIGATE_SETTINGS,.
        "settings" => crate::tray::EVENT_NAVIGATE_SETTINGS,
        // Выполняем операцию: "about" => crate::tray::EVENT_NAVIGATE_ABOUT,.
        "about" => crate::tray::EVENT_NAVIGATE_ABOUT,
        // Выполняем операцию: _ => crate::tray::EVENT_NAVIGATE_DASHBOARD,.
        _ => crate::tray::EVENT_NAVIGATE_DASHBOARD,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию clean.
fn clean(value: Option<String>) -> Option<String> {
    // Выполняем операцию: value.
    value
        // Выполняем операцию: .map(|item| item.trim().to_string()).
        .map(|item| item.trim().to_string())
        // Выполняем операцию: .filter(|item| !item.is_empty()).
        .filter(|item| !item.is_empty())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "tray_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
