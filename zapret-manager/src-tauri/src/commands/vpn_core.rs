// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tauri::{Emitter, State};.
use tauri::{Emitter, State};

// Подключаем модули: crate::commands::vpn_proxy::{clear_system_proxy, set_sy.
use crate::commands::vpn_proxy::{clear_system_proxy, set_system_proxy, ProxyBackup};
// Подключаем модули: crate::commands::vpn_subscription::SubscriptionServer;.
use crate::commands::vpn_subscription::SubscriptionServer;
// Подключаем модули: crate::commands::vpn_xray::{self, XrayState, DEFAULT_HT.
use crate::commands::vpn_xray::{self, XrayState, DEFAULT_HTTP_PORT, DEFAULT_SOCKS_PORT};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу EVENT_CORE_PROGRESS.
pub const EVENT_CORE_PROGRESS: &str = "vpn-core-progress";

// Применяем атрибут к следующему объявлению.
#[derive(Default)]
// Объявляем структуру XrayRuntime.
pub struct XrayRuntime {
    // Выполняем операцию: pub xray: XrayState,.
    pub xray: XrayState,
    // Выполняем операцию: pub proxy: ProxyBackup,.
    pub proxy: ProxyBackup,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl XrayRuntime {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: xray: XrayState::new(),.
            xray: XrayState::new(),
            // Выполняем операцию: proxy: ProxyBackup::default(),.
            proxy: ProxyBackup::default(),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    /// Немедленно останавливает ядро и возвращает системный прокси.
    ///
    /// Вызывается при выходе из приложения, не полагаясь только на `Drop`
    /// managed-состояния: при `app.exit()` порядок уничтожения не гарантирован.
    // Объявляем функцию shutdown.
    pub fn shutdown(&self) {
        // Выполняем операцию: self.xray.reset();.
        self.xray.reset();

        // Проверяем условие: !self.proxy.has_backup() {.
        if !self.proxy.has_backup() {
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        }

        // Проверяем условие: let Err(error) = clear_system_proxy(&self.proxy) {.
        if let Err(error) = clear_system_proxy(&self.proxy) {
            // Выполняем операцию: tracing::warn!("Не удалось вернуть системный прокси: {e.
            tracing::warn!("Не удалось вернуть системный прокси: {error}");
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// При выходе из приложения системный прокси возвращается в
/// исходное состояние. Иначе он остался бы указывать на
/// `127.0.0.1:12081`, где уже никто не слушает, и весь трафик
/// уходил бы в никуда без единого признака в интерфейсе.
// Открываем реализацию типа.
impl Drop for XrayRuntime {
    // Объявляем функцию drop.
    fn drop(&mut self) {
        // Выполняем операцию: self.shutdown();.
        self.shutdown();
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру XrayStatus.
pub struct XrayStatus {
    // Выполняем операцию: pub installed: bool,.
    pub installed: bool,
    // Выполняем операцию: pub running: bool,.
    pub running: bool,
    // Выполняем операцию: pub active_server_id: Option<String>,.
    pub active_server_id: Option<String>,
    // Выполняем операцию: pub uptime_sec: u64,.
    pub uptime_sec: u64,
    // Выполняем операцию: pub socks_port: u16,.
    pub socks_port: u16,
    // Выполняем операцию: pub http_port: u16,.
    pub http_port: u16,
    // Выполняем операцию: pub pid: Option<u32>,.
    pub pid: Option<u32>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn install_vpn_core(app: tauri::AppHandle) ->.
pub async fn install_vpn_core(app: tauri::AppHandle) -> AppResult<bool> {
    // Объявляем переменную _ .
    let _ = app.emit(EVENT_CORE_PROGRESS, "checking");

    // Выбираем вариант по значению.
    match vpn_xray::ensure_bundled_core(&app).await {
        // Выполняем операцию: Ok(true) => {.
        Ok(true) => {
            // Объявляем переменную _ .
            let _ = app.emit(EVENT_CORE_PROGRESS, "ready");

            // Возвращаем результат из функции.
            return Ok(true);
            // Закрываем блок.
        }
        // Выполняем операцию: Ok(false) => {.
        Ok(false) => {
            // Выполняем операцию: tracing::warn!("Встроенное ядро Xray недоступно, пробую.
            tracing::warn!("Встроенное ядро Xray недоступно, пробую скачать с GitHub");
            // Закрываем блок.
        }
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Встроенное ядро Xray не подготовлено: {.
            tracing::warn!("Встроенное ядро Xray не подготовлено: {error}");
            // Закрываем блок.
        } // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_CORE_PROGRESS, "downloading");
    // Выполняем операцию: vpn_xray::download_core().await?;.
    vpn_xray::download_core().await?;
    // Объявляем переменную _ .
    let _ = app.emit(EVENT_CORE_PROGRESS, "ready");

    // Выполняем операцию: Ok(true).
    Ok(true)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию vpn_core_status.
pub fn vpn_core_status(state: State<'_, XrayRuntime>) -> XrayStatus {
    // Объявляем переменную installed .
    let installed = vpn_xray::core_installed();
    // Объявляем переменную runtime .
    let runtime = state.inner();
    // Объявляем переменную running .
    let running = runtime.xray.is_running();
    // Объявляем переменную connected_at .
    let connected_at = runtime.xray.connected_at();

    // Выполняем операцию: XrayStatus {.
    XrayStatus {
        // Выполняем операцию: installed,.
        installed,
        // Выполняем операцию: running,.
        running,
        // Выполняем операцию: active_server_id: runtime.xray.active(),.
        active_server_id: runtime.xray.active(),
        // Выполняем операцию: uptime_sec: uptime_seconds(running, connected_at),.
        uptime_sec: uptime_seconds(running, connected_at),
        // Выполняем операцию: socks_port: DEFAULT_SOCKS_PORT,.
        socks_port: DEFAULT_SOCKS_PORT,
        // Выполняем операцию: http_port: DEFAULT_HTTP_PORT,.
        http_port: DEFAULT_HTTP_PORT,
        // Выполняем операцию: pid: if running { runtime.xray.pid() } else { None },.
        pid: if running { runtime.xray.pid() } else { None },
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию uptime_seconds.
fn uptime_seconds(running: bool, connected_at: u64) -> u64 {
    // Проверяем условие: !running || connected_at == 0 {.
    if !running || connected_at == 0 {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Выполняем операцию: crate::commands::monitor::now_millis().
    crate::commands::monitor::now_millis()
        // Выполняем операцию: .saturating_sub(connected_at).
        .saturating_sub(connected_at)
        // Выполняем операцию: .saturating_div(1_000).
        .saturating_div(1_000)
    // Закрываем блок.
}

/// Поднимает ядро Xray на указанном сервере и включает системный
/// прокси. Общая часть для ручного подключения и для умного
/// подключения, которое само выбирает самый быстрый сервер.
// Выполняем операцию: pub async fn launch_xray(.
pub async fn launch_xray(
    // Выполняем операцию: runtime: &XrayRuntime,.
    runtime: &XrayRuntime,
    // Выполняем операцию: server: &SubscriptionServer,.
    server: &SubscriptionServer,
    // Закрываем выражение или коллекцию.
) -> AppResult<XrayStatus> {
    // Проверяем условие: !vpn_xray::core_healthy() {.
    if !vpn_xray::core_healthy() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Ядро Xray повреждено. Переустановите его в настройках .
            "Ядро Xray повреждено. Переустановите его в настройках VPN",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную now .
    let now = crate::commands::monitor::now_millis();

    // Выполняем операцию: runtime.xray.reset();.
    runtime.xray.reset();

    // Выполняем операцию: vpn_xray::start(&runtime.xray, server, now).await?;.
    vpn_xray::start(&runtime.xray, server, now).await?;
    // Выполняем операцию: set_system_proxy(&runtime.proxy, "127.0.0.1", DEFAULT_H.
    set_system_proxy(&runtime.proxy, "127.0.0.1", DEFAULT_HTTP_PORT)?;

    // Выполняем операцию: tracing::info!("VPN подключён через Xray: {}", server.n.
    tracing::info!("VPN подключён через Xray: {}", server.name);

    // Выполняем операцию: Ok(XrayStatus {.
    Ok(XrayStatus {
        // Выполняем операцию: installed: true,.
        installed: true,
        // Выполняем операцию: running: true,.
        running: true,
        // Выполняем операцию: active_server_id: Some(server.id.clone()),.
        active_server_id: Some(server.id.clone()),
        // Выполняем операцию: uptime_sec: 0,.
        uptime_sec: 0,
        // Выполняем операцию: socks_port: DEFAULT_SOCKS_PORT,.
        socks_port: DEFAULT_SOCKS_PORT,
        // Выполняем операцию: http_port: DEFAULT_HTTP_PORT,.
        http_port: DEFAULT_HTTP_PORT,
        // Выполняем операцию: pid: runtime.xray.pid(),.
        pid: runtime.xray.pid(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Гасит VPN без Tauri-состояния: безопасно звать из других
/// подсистем (например, перед стартом стратегии).
// Объявляем функцию disconnect_vpn_core.
pub fn disconnect_vpn_core(runtime: &XrayRuntime) -> AppResult<XrayStatus> {
    // Выполняем операцию: runtime.xray.reset();.
    runtime.xray.reset();

    // Проверяем условие: let Err(error) = clear_system_proxy(&runtime.proxy.
    if let Err(error) = clear_system_proxy(&runtime.proxy) {
        // Выполняем операцию: tracing::warn!("Прокси не сброшен: {error}");.
        tracing::warn!("Прокси не сброшен: {error}");
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("VPN отключён");.
    tracing::info!("VPN отключён");

    // Выполняем операцию: Ok(XrayStatus {.
    Ok(XrayStatus {
        // Выполняем операцию: installed: vpn_xray::core_installed(),.
        installed: vpn_xray::core_installed(),
        // Выполняем операцию: running: false,.
        running: false,
        // Выполняем операцию: active_server_id: None,.
        active_server_id: None,
        // Выполняем операцию: uptime_sec: 0,.
        uptime_sec: 0,
        // Выполняем операцию: socks_port: DEFAULT_SOCKS_PORT,.
        socks_port: DEFAULT_SOCKS_PORT,
        // Выполняем операцию: http_port: DEFAULT_HTTP_PORT,.
        http_port: DEFAULT_HTTP_PORT,
        // Выполняем операцию: pid: None,.
        pid: None,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию disconnect_vpn_server.
pub fn disconnect_vpn_server(state: State<'_, XrayRuntime>) -> AppResult<XrayStatus> {
    // Выполняем операцию: disconnect_vpn_core(state.inner()).
    disconnect_vpn_core(state.inner())
    // Закрываем блок.
}
