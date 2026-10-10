use serde::Serialize;
use tauri::{Emitter, State};

use crate::commands::vpn_proxy::{clear_system_proxy, set_system_proxy, ProxyBackup};
use crate::commands::vpn_subscription::{self, SubscriptionServer};
use crate::commands::vpn_xray::{
    self, XrayState, DEFAULT_HTTP_PORT, DEFAULT_SOCKS_PORT,
};
use crate::error::{AppError, AppResult};

pub const EVENT_CORE_PROGRESS: &str = "vpn-core-progress";

#[derive(Default)]
pub struct XrayRuntime {
    pub xray: XrayState,
    pub proxy: ProxyBackup,
}

impl XrayRuntime {
    pub fn new() -> Self {
        Self {
            xray: XrayState::new(),
            proxy: ProxyBackup::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct XrayStatus {
    pub installed: bool,
    pub running: bool,
    pub active_server_id: Option<String>,
    pub uptime_sec: u64,
    pub socks_port: u16,
    pub http_port: u16,
    pub pid: Option<u32>,
}

#[tauri::command]
pub async fn fetch_vpn_subscription(
    url: String,
) -> AppResult<Vec<SubscriptionServer>> {
    vpn_subscription::fetch_subscription(&url).await
}

#[tauri::command]
pub async fn install_vpn_core(app: tauri::AppHandle) -> AppResult<bool> {
    let _ = app.emit(EVENT_CORE_PROGRESS, "Скачиваю ядро Xray…");
    vpn_xray::download_core().await?;
    let _ = app.emit(EVENT_CORE_PROGRESS, "Ядро установлено");

    Ok(true)
}

#[tauri::command]
pub fn vpn_core_status(state: State<'_, XrayRuntime>) -> XrayStatus {
    let installed = vpn_xray::core_installed();
    let runtime = state.inner();
    let running = runtime.xray.is_running();
    let connected_at = runtime.xray.connected_at();

    XrayStatus {
        installed,
        running,
        active_server_id: runtime.xray.active(),
        uptime_sec: uptime_seconds(running, connected_at),
        socks_port: DEFAULT_SOCKS_PORT,
        http_port: DEFAULT_HTTP_PORT,
        pid: if running { runtime.xray.pid() } else { None },
    }
}

fn uptime_seconds(running: bool, connected_at: u64) -> u64 {
    if !running || connected_at == 0 {
        return 0;
    }

    crate::commands::monitor::now_millis()
        .saturating_sub(connected_at)
        .saturating_div(1_000)
}

#[tauri::command]
pub fn connect_vpn_server(
    state: State<'_, XrayRuntime>,
    link: String,
    name: String,
) -> AppResult<XrayStatus> {
    let server = vpn_subscription::parse_link(&link)
        .ok_or_else(|| AppError::custom("Ссылка сервера повреждена"))?;

    if !vpn_xray::core_installed() {
        return Err(AppError::custom(
            "Сначала установите ядро Xray в настройках VPN",
        ));
    }

    let runtime = state.inner();
    let now = crate::commands::monitor::now_millis();

    runtime.xray.reset();

    let full = SubscriptionServer {
        name: if name.trim().is_empty() {
            server.name
        } else {
            name
        },
        ..server
    };

    vpn_xray::start(&runtime.xray, &full, now)?;
    set_system_proxy(&runtime.proxy, "127.0.0.1", DEFAULT_HTTP_PORT)?;

    tracing::info!("VPN подключён через Xray: {}", full.name);

    Ok(XrayStatus {
        installed: true,
        running: true,
        active_server_id: Some(full.id),
        uptime_sec: 0,
        socks_port: DEFAULT_SOCKS_PORT,
        http_port: DEFAULT_HTTP_PORT,
        pid: runtime.xray.pid(),
    })
}

#[tauri::command]
pub fn disconnect_vpn_server(state: State<'_, XrayRuntime>) -> AppResult<XrayStatus> {
    let runtime = state.inner();

    runtime.xray.reset();

    if let Err(error) = clear_system_proxy(&runtime.proxy) {
        tracing::warn!("Прокси не сброшен: {error}");
    }

    tracing::info!("VPN отключён");

    Ok(XrayStatus {
        installed: vpn_xray::core_installed(),
        running: false,
        active_server_id: None,
        uptime_sec: 0,
        socks_port: DEFAULT_SOCKS_PORT,
        http_port: DEFAULT_HTTP_PORT,
        pid: None,
    })
}