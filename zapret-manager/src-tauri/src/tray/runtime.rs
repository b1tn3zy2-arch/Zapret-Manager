use std::sync::RwLock;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};

use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, Manager, Runtime, Wry};

use crate::error::{AppError, AppResult};
use crate::tray::icons::{load_icon, tooltip};

use crate::tray::TrayState;

pub const TRAY_ID: &str = "zapret-manager-tray";
pub const ANIMATION_INTERVAL_MS: u64 = 300;
pub const ANIMATION_DURATION_MS: u64 = 3000;

pub const WINDOW_LABEL: &str = "main";

pub struct TrayStateHolder {
    pub state: RwLock<TrayState>,
    pub active_strategy: RwLock<Option<String>>,
    pub vpn_name: RwLock<Option<String>>,
    pub animate: AtomicBool,
    pub animation_token: AtomicBool,
}

impl Default for TrayStateHolder {
    fn default() -> Self {
        Self::new()
    }
}

impl TrayStateHolder {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(TrayState::Idle),
            active_strategy: RwLock::new(None),
            vpn_name: RwLock::new(None),
            animate: AtomicBool::new(true),
            animation_token: AtomicBool::new(false),
        }
    }

    pub fn snapshot(&self) -> (TrayState, Option<String>, Option<String>) {
        let state = self.state.read().map(|value| *value).unwrap_or(TrayState::Idle);
        let active = self
            .active_strategy
            .read()
            .ok()
            .and_then(|value| value.clone());
        let vpn = self.vpn_name.read().ok().and_then(|value| value.clone());

        (state, active, vpn)
    }

    pub fn store(
        &self,
        state: TrayState,
        active_strategy: Option<String>,
        vpn_name: Option<String>,
    ) {
        if let Ok(mut slot) = self.state.write() {
            *slot = state;
        }

        if let Ok(mut slot) = self.active_strategy.write() {
            *slot = active_strategy;
        }

        if let Ok(mut slot) = self.vpn_name.write() {
            *slot = vpn_name;
        }
    }

    pub fn animation_enabled(&self) -> bool {
        self.animate.load(Ordering::SeqCst)
    }

    pub fn set_animation_enabled(&self, value: bool) {
        self.animate.store(value, Ordering::SeqCst);
    }
}

pub fn register(app: &AppHandle) {
    app.manage(TrayStateHolder::new());
}

pub fn tray_handle(app: &AppHandle) -> Option<TrayIcon<Wry>> {
    app.tray_by_id(TRAY_ID)
}

pub fn show_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        return;
    };

    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

pub fn toggle_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        return;
    };

    match window.is_visible() {
        Ok(true) => {
            let _ = window.hide();
        }
        _ => show_window(app),
    }
}

pub fn set_icon_state(app: &AppHandle, state: TrayState, frame: usize) -> AppResult<()> {
    let Some(tray) = tray_handle(app) else {
        return Ok(());
    };

    tray.set_icon(Some(load_icon(app, state, frame)?))?;

    Ok(())
}

pub fn update_tooltip_and_menu(app: &AppHandle) -> AppResult<()> {
    let Some(tray) = tray_handle(app) else {
        return Ok(());
    };

    let (state, active, vpn) = snapshot(app);

    tray.set_tooltip(Some(tooltip(state, active.as_deref(), vpn.as_deref())))?;

    Ok(())
}

pub fn snapshot<R: Runtime>(app: &AppHandle<R>) -> (TrayState, Option<String>, Option<String>) {
    app.try_state::<TrayStateHolder>()
        .map(|holder| holder.snapshot())
        .unwrap_or((TrayState::Idle, None, None))
}

pub fn stop_animation(app: &AppHandle) {
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        holder.animation_token.store(false, Ordering::SeqCst);
    }
}

pub fn start_animation(app: &AppHandle, enabled: bool) {
    stop_animation(app);

    if !enabled {
        return;
    }

    let Some(holder) = app.try_state::<TrayStateHolder>() else {
        return;
    };

    holder.animation_token.store(true, Ordering::SeqCst);
    let handle = app.clone();
    let frames = super::icons::ANIMATION_FRAMES;

    tauri::async_runtime::spawn(async move {
        let deadline = Instant::now() + Duration::from_millis(ANIMATION_DURATION_MS);

        for frame in 1..=frames {
            if Instant::now() >= deadline {
                break;
            }

            if set_icon_state(&handle, TrayState::Connecting, frame).is_err() {
                break;
            }

            tokio::time::sleep(Duration::from_millis(ANIMATION_INTERVAL_MS)).await;
        }

        let _ = set_icon_state(&handle, TrayState::Connecting, 0);

        if let Some(state) = handle.try_state::<TrayStateHolder>() {
            state.animation_token.store(false, Ordering::SeqCst);
        }
    });
}

pub fn apply_state(
    app: &AppHandle,
    state: TrayState,
    active_strategy: Option<String>,
    vpn_name: Option<String>,
) -> AppResult<()> {
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        holder.store(state, active_strategy.clone(), vpn_name.clone());
    }

    update_tooltip_and_menu(app)?;

    let animating = state == TrayState::Connecting
        && app
            .try_state::<TrayStateHolder>()
            .map(|holder| holder.animation_enabled())
            .unwrap_or(true);

    set_icon_state(app, state, usize::from(!animating))?;
    start_animation(app, animating);

    Ok(())
}

pub fn configure(app: &AppHandle, animate_on_connect: bool) {
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        holder.set_animation_enabled(animate_on_connect);
    }
}

pub fn create_tray(app: &AppHandle) -> AppResult<TrayIcon<Wry>> {
    let icon = load_icon(app, TrayState::Idle, 0)?;

    let tray = TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .tooltip(tooltip(TrayState::Idle, None, None))
        .show_menu_on_left_click(false)
        .on_tray_icon_event(handle_tray_event)
        .build(app)
        .map_err(|error| AppError::custom(format!("Трей не создан: {error}")))?;

    let shown = super::icons::icon_path(app, TrayState::Idle, 0)
        .map(|path| path.display().to_string())
        .unwrap_or_default();
    tracing::info!("Трей создан, иконка {shown}");

    Ok(tray)
}

fn handle_tray_event(
    tray: &tauri::tray::TrayIcon<Wry>,
    event: TrayIconEvent,
) {
    let app = tray.app_handle();

    match event {
        TrayIconEvent::Click {
            button: tauri::tray::MouseButton::Left,
            button_state: tauri::tray::MouseButtonState::Up,
            ..
        } => toggle_window(app),
        TrayIconEvent::Click {
            button: tauri::tray::MouseButton::Right,
            button_state: tauri::tray::MouseButtonState::Up,
            position,
            ..
        } => crate::tray_menu::show(app, position),
        TrayIconEvent::Click {
            button: tauri::tray::MouseButton::Middle,
            button_state: tauri::tray::MouseButtonState::Up,
            ..
        } => {
            let _ = app.emit(super::EVENT_QUICK_RUN, ());
        }
        TrayIconEvent::DoubleClick { .. } => {
            show_window(app);
            let _ = app.emit(super::EVENT_NAVIGATE_DASHBOARD, ());
        }
        _ => {}
    }
}

#[cfg(test)]
#[path = "runtime_tests.rs"]
mod tests;
