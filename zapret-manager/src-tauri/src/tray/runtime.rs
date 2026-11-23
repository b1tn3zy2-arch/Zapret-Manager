// Подключаем модули: std::sync::atomic::{AtomicBool, Ordering};.
use std::sync::atomic::{AtomicBool, Ordering};
// Подключаем модули: std::sync::RwLock;.
use std::sync::RwLock;
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent}.
use tauri::tray::{TrayIcon, TrayIconBuilder, TrayIconEvent};
// Подключаем модули: tauri::{AppHandle, Emitter, Manager, Runtime, Wry};.
use tauri::{AppHandle, Emitter, Manager, Runtime, Wry};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::tray::icons::{load_icon, tooltip};.
use crate::tray::icons::{load_icon, tooltip};

// Подключаем модули: crate::tray::TrayState;.
use crate::tray::TrayState;

// Объявляем константу TRAY_ID.
pub const TRAY_ID: &str = "zapret-manager-tray";
// Объявляем константу ANIMATION_INTERVAL_MS.
pub const ANIMATION_INTERVAL_MS: u64 = 300;

// Объявляем константу WINDOW_LABEL.
pub const WINDOW_LABEL: &str = "main";

// Объявляем структуру TrayStateHolder.
pub struct TrayStateHolder {
    // Выполняем операцию: pub state: RwLock<TrayState>,.
    pub state: RwLock<TrayState>,
    // Выполняем операцию: pub active_strategy: RwLock<Option<String>>,.
    pub active_strategy: RwLock<Option<String>>,
    // Выполняем операцию: pub vpn_name: RwLock<Option<String>>,.
    pub vpn_name: RwLock<Option<String>>,
    // Выполняем операцию: pub animate: AtomicBool,.
    pub animate: AtomicBool,
    // Выполняем операцию: pub animation_token: AtomicBool,.
    pub animation_token: AtomicBool,
    /// Последняя реально применённая иконка.
    ///
    /// Windows очищает и перерисовывает область уведомления на каждый
    /// `set_icon`, даже если картинка не изменилась — на частых push'ах
    /// статуса иконка мигала. Совпадение кэша пропускает такой вызов.
    // Выполняем операцию: pub shown: RwLock<(TrayState, usize)>,.
    pub shown: RwLock<(TrayState, usize)>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Default for TrayStateHolder {
    // Объявляем функцию default.
    fn default() -> Self {
        // Выполняем операцию: Self::new().
        Self::new()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl TrayStateHolder {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: state: RwLock::new(TrayState::Idle),.
            state: RwLock::new(TrayState::Idle),
            // Выполняем операцию: active_strategy: RwLock::new(None),.
            active_strategy: RwLock::new(None),
            // Выполняем операцию: vpn_name: RwLock::new(None),.
            vpn_name: RwLock::new(None),
            // Выполняем операцию: animate: AtomicBool::new(true),.
            animate: AtomicBool::new(true),
            // Выполняем операцию: animation_token: AtomicBool::new(false),.
            animation_token: AtomicBool::new(false),
            // Выполняем операцию: shown: RwLock::new((TrayState::Idle, 0)),.
            shown: RwLock::new((TrayState::Idle, 0)),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию snapshot.
    pub fn snapshot(&self) -> (TrayState, Option<String>, Option<String>) {
        // Объявляем переменную state .
        let state = self
            // Выполняем операцию: .state.
            .state
            // Выполняем операцию: .read().
            .read()
            // Выполняем операцию: .map(|value| *value).
            .map(|value| *value)
            // Выполняем операцию: .unwrap_or(TrayState::Idle);.
            .unwrap_or(TrayState::Idle);
        // Объявляем переменную active .
        let active = self
            // Выполняем операцию: .active_strategy.
            .active_strategy
            // Выполняем операцию: .read().
            .read()
            // Выполняем операцию: .ok().
            .ok()
            // Выполняем операцию: .and_then(|value| value.clone());.
            .and_then(|value| value.clone());
        // Объявляем переменную vpn .
        let vpn = self.vpn_name.read().ok().and_then(|value| value.clone());

        // Выполняем операцию: (state, active, vpn).
        (state, active, vpn)
        // Закрываем блок.
    }

    // Объявляем функцию store.
    pub fn store(
        // Выполняем операцию: &self,.
        &self,
        // Выполняем операцию: state: TrayState,.
        state: TrayState,
        // Выполняем операцию: active_strategy: Option<String>,.
        active_strategy: Option<String>,
        // Выполняем операцию: vpn_name: Option<String>,.
        vpn_name: Option<String>,
        // Закрываем выражение или коллекцию.
    ) {
        // Проверяем условие: let Ok(mut slot) = self.state.write() {.
        if let Ok(mut slot) = self.state.write() {
            *slot = state;
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = self.active_strategy.write() {.
        if let Ok(mut slot) = self.active_strategy.write() {
            *slot = active_strategy;
            // Закрываем блок.
        }

        // Проверяем условие: let Ok(mut slot) = self.vpn_name.write() {.
        if let Ok(mut slot) = self.vpn_name.write() {
            *slot = vpn_name;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию animation_enabled.
    pub fn animation_enabled(&self) -> bool {
        // Выполняем операцию: self.animate.load(Ordering::SeqCst).
        self.animate.load(Ordering::SeqCst)
        // Закрываем блок.
    }

    // Объявляем функцию set_animation_enabled.
    pub fn set_animation_enabled(&self, value: bool) {
        // Выполняем операцию: self.animate.store(value, Ordering::SeqCst);.
        self.animate.store(value, Ordering::SeqCst);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию register.
pub fn register(app: &AppHandle) {
    // Выполняем операцию: app.manage(TrayStateHolder::new());.
    app.manage(TrayStateHolder::new());
    // Закрываем блок.
}

// Объявляем функцию tray_handle.
pub fn tray_handle(app: &AppHandle) -> Option<TrayIcon<Wry>> {
    // Выполняем операцию: app.tray_by_id(TRAY_ID).
    app.tray_by_id(TRAY_ID)
    // Закрываем блок.
}

// Объявляем функцию show_window.
pub fn show_window(app: &AppHandle) {
    // Объявляем переменную Some(window) .
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = window.unminimize();
    // Объявляем переменную _ .
    let _ = window.show();
    // Объявляем переменную _ .
    let _ = window.set_focus();
    // Закрываем блок.
}

// Объявляем функцию toggle_window.
pub fn toggle_window(app: &AppHandle) {
    // Объявляем переменную Some(window) .
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Выбираем вариант по значению.
    match window.is_visible() {
        // Выполняем операцию: Ok(true) => {.
        Ok(true) => {
            // Объявляем переменную _ .
            let _ = window.hide();
            // Закрываем блок.
        }
        // Выполняем операцию: _ => show_window(app),.
        _ => show_window(app),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию set_icon_state.
pub fn set_icon_state(app: &AppHandle, state: TrayState, frame: usize) -> AppResult<()> {
    // Проверяем условие: let Some(holder) = app.try_state::<TrayStateHolder.
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        // Объявляем переменную unchanged .
        let unchanged = holder
            // Выполняем операцию: .shown.
            .shown
            // Выполняем операцию: .read().
            .read()
            // Выполняем операцию: .map(|shown| *shown == (state, frame)).
            .map(|shown| *shown == (state, frame))
            // Выполняем операцию: .unwrap_or(false);.
            .unwrap_or(false);

        // Проверяем условие: unchanged {.
        if unchanged {
            // Возвращаем результат из функции.
            return Ok(());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную Some(tray) .
    let Some(tray) = tray_handle(app) else {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    };

    // Выполняем операцию: tray.set_icon(Some(load_icon(app, state, frame)?))?;.
    tray.set_icon(Some(load_icon(app, state, frame)?))?;

    // Проверяем условие: let Some(holder) = app.try_state::<TrayStateHolder.
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        // Проверяем условие: let Ok(mut shown) = holder.shown.write() {.
        if let Ok(mut shown) = holder.shown.write() {
            *shown = (state, frame);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию update_tooltip_and_menu.
pub fn update_tooltip_and_menu(app: &AppHandle) -> AppResult<()> {
    // Объявляем переменную Some(tray) .
    let Some(tray) = tray_handle(app) else {
        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    };

    // Объявляем переменную (state, active, vpn) .
    let (state, active, vpn) = snapshot(app);

    // Выполняем операцию: tray.set_tooltip(Some(tooltip(state, active.as_deref(),.
    tray.set_tooltip(Some(tooltip(state, active.as_deref(), vpn.as_deref())))?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию snapshot.
pub fn snapshot<R: Runtime>(app: &AppHandle<R>) -> (TrayState, Option<String>, Option<String>) {
    // Выполняем операцию: app.try_state::<TrayStateHolder>().
    app.try_state::<TrayStateHolder>()
        // Выполняем операцию: .map(|holder| holder.snapshot()).
        .map(|holder| holder.snapshot())
        // Выполняем операцию: .unwrap_or((TrayState::Idle, None, None)).
        .unwrap_or((TrayState::Idle, None, None))
    // Закрываем блок.
}

// Объявляем функцию stop_animation.
pub fn stop_animation(app: &AppHandle) {
    // Проверяем условие: let Some(holder) = app.try_state::<TrayStateHolder.
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        // Выполняем операцию: holder.animation_token.store(false, Ordering::SeqCst);.
        holder.animation_token.store(false, Ordering::SeqCst);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию start_animation.
pub fn start_animation(app: &AppHandle, enabled: bool) {
    // Проверяем условие: !enabled {.
    if !enabled {
        // Выполняем операцию: stop_animation(app);.
        stop_animation(app);

        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную Some(holder) .
    let Some(holder) = app.try_state::<TrayStateHolder>() else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Анимация уже идёт: частые apply_state(Connecting) из разных
    // push'ей состояния сбрасывали её на первый кадр, и этот скачок
    // выглядел как мигание иконки. Рестарт нужен только на новом
    // переходе: токен сбрасывается после завершения прошлого цикла.
    // Проверяем условие: holder.animation_token.load(Ordering::SeqCst) {.
    if holder.animation_token.load(Ordering::SeqCst) {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Выполняем операцию: holder.animation_token.store(true, Ordering::SeqCst);.
    holder.animation_token.store(true, Ordering::SeqCst);
    // Объявляем переменную handle .
    let handle = app.clone();
    // Объявляем переменную frames .
    let frames = super::icons::ANIMATION_FRAMES;

    // Выполняем операцию: tauri::async_runtime::spawn(async move {.
    tauri::async_runtime::spawn(async move {
        // Кадры крутятся, пока состояние остаётся «подключается»:
        // соединение может устанавливаться дольше трёх секунд, и
        // замороженная иконка посреди долгого хендшейка читалась
        // как зависание. Отмена — только сменой состояния (токен).
        // Выполняем операцию: 'cycles: loop {.
        'cycles: loop {
            // Перебираем элементы коллекции.
            for frame in 1..=frames {
                // Объявляем переменную cancelled .
                let cancelled = handle
                    // Выполняем операцию: .try_state::<TrayStateHolder>().
                    .try_state::<TrayStateHolder>()
                    // Выполняем операцию: .map(|holder| !holder.animation_token.load(Ordering::Se.
                    .map(|holder| !holder.animation_token.load(Ordering::SeqCst))
                    // Выполняем операцию: .unwrap_or(true);.
                    .unwrap_or(true);

                // Проверяем условие: cancelled {.
                if cancelled {
                    // Выполняем операцию: break 'cycles;.
                    break 'cycles;
                    // Закрываем блок.
                }

                // Проверяем условие: set_icon_state(&handle, TrayState::Connecting, fra.
                if set_icon_state(&handle, TrayState::Connecting, frame).is_err() {
                    // Выполняем операцию: break 'cycles;.
                    break 'cycles;
                    // Закрываем блок.
                }

                // Выполняем операцию: tokio::time::sleep(Duration::from_millis(ANIMATION_INTE.
                tokio::time::sleep(Duration::from_millis(ANIMATION_INTERVAL_MS)).await;
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Последний кадр мог доехать после смены состояния: возвращаем
        // статичную иконку актуального состояния (совпадение с уже
        // показанной отсекается кэшем).
        // Объявляем переменную (state, _, _) .
        let (state, _, _) = snapshot(&handle);
        // Объявляем переменную _ .
        let _ = set_icon_state(&handle, state, 0);

        // Проверяем условие: let Some(holder) = handle.try_state::<TrayStateHol.
        if let Some(holder) = handle.try_state::<TrayStateHolder>() {
            // Выполняем операцию: holder.animation_token.store(false, Ordering::SeqCst);.
            holder.animation_token.store(false, Ordering::SeqCst);
            // Закрываем блок.
        }
        // Закрываем блок.
    });
    // Закрываем блок.
}

// Объявляем функцию apply_state.
pub fn apply_state(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: state: TrayState,.
    state: TrayState,
    // Выполняем операцию: active_strategy: Option<String>,.
    active_strategy: Option<String>,
    // Выполняем операцию: vpn_name: Option<String>,.
    vpn_name: Option<String>,
    // Закрываем выражение или коллекцию.
) -> AppResult<()> {
    // Проверяем условие: let Some(holder) = app.try_state::<TrayStateHolder.
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        // Выполняем операцию: holder.store(state, active_strategy.clone(), vpn_name.c.
        holder.store(state, active_strategy.clone(), vpn_name.clone());
        // Закрываем блок.
    }

    // Выполняем операцию: update_tooltip_and_menu(app)?;.
    update_tooltip_and_menu(app)?;

    // Другое состояние пришло, пока крутилась анимация «подключается»:
    // без сброса токена кадры продолжали затирать иконку «подключено».
    // Проверяем условие: state != TrayState::Connecting {.
    if state != TrayState::Connecting {
        // Выполняем операцию: stop_animation(app);.
        stop_animation(app);
        // Закрываем блок.
    }

    // Объявляем переменную animating .
    let animating = state == TrayState::Connecting
        // Выполняем операцию: && app.
        && app
            // Выполняем операцию: .try_state::<TrayStateHolder>().
            .try_state::<TrayStateHolder>()
            // Выполняем операцию: .map(|holder| holder.animation_enabled()).
            .map(|holder| holder.animation_enabled())
            // Выполняем операцию: .unwrap_or(true);.
            .unwrap_or(true);

    // Выполняем операцию: set_icon_state(app, state, usize::from(!animating))?;.
    set_icon_state(app, state, usize::from(!animating))?;
    // Выполняем операцию: start_animation(app, animating);.
    start_animation(app, animating);

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию configure.
pub fn configure(app: &AppHandle, animate_on_connect: bool) {
    // Проверяем условие: let Some(holder) = app.try_state::<TrayStateHolder.
    if let Some(holder) = app.try_state::<TrayStateHolder>() {
        // Выполняем операцию: holder.set_animation_enabled(animate_on_connect);.
        holder.set_animation_enabled(animate_on_connect);
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Приводит трей в соответствие с реальным состоянием VPN.
///
/// Раньше состояние трея целиком зависело от того, что пришлёт интерфейс. Но
/// интерфейс — это скрытое окно, и когда его таймеры приостановлены, отправка
/// не доходит: пользователь подключал VPN и сразу открывал трей, а там всё ещё
/// было «обход». Теперь истина берётся из состояния ядра, а окно лишь уточняет
/// имя сервера.
// Объявляем функцию sync_vpn_state.
pub fn sync_vpn_state(app: &AppHandle) {
    // Объявляем переменную connected .
    let connected = app
        // Выполняем операцию: .try_state::<crate::commands::vpn::VpnState>().
        .try_state::<crate::commands::vpn::VpnState>()
        // Выполняем операцию: .map(|state| state.active().is_some()).
        .map(|state| state.active().is_some())
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Объявляем переменную (state, active, vpn) .
    let (state, active, vpn) = snapshot(app);

    // Объявляем переменную Some(next) .
    let Some(next) = next_state(state, connected, active.is_some()) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = apply_state(app, next, active, vpn);
    // Закрываем блок.
}

/// Состояние трея после синхронизации с ядром VPN.
///
/// `None` означает, что менять нечего: состояние уже верное. Отдельно важна
/// ветка отключения — без неё трей навсегда оставался в режиме «VPN активен»,
/// пока скрытое окно интерфейса не пришлёт своё состояние.
// Объявляем функцию next_state.
fn next_state(state: TrayState, vpn_connected: bool, strategy_active: bool) -> Option<TrayState> {
    // Проверяем условие: vpn_connected {.
    if vpn_connected {
        // Возвращаем результат из функции.
        return (state != TrayState::Vpn).then_some(TrayState::Vpn);
        // Закрываем блок.
    }

    // Проверяем условие: state != TrayState::Vpn {.
    if state != TrayState::Vpn {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(if strategy_active {.
    Some(if strategy_active {
        // Выполняем операцию: TrayState::Connected.
        TrayState::Connected
    // Закрываем блок.
    } else {
        // Выполняем операцию: TrayState::Idle.
        TrayState::Idle
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию create_tray.
pub fn create_tray(app: &AppHandle) -> AppResult<TrayIcon<Wry>> {
    // Объявляем переменную icon .
    let icon = load_icon(app, TrayState::Idle, 0)?;

    // Объявляем переменную tray .
    let tray = TrayIconBuilder::with_id(TRAY_ID)
        // Выполняем операцию: .icon(icon).
        .icon(icon)
        // Выполняем операцию: .tooltip(tooltip(TrayState::Idle, None, None)).
        .tooltip(tooltip(TrayState::Idle, None, None))
        // Выполняем операцию: .show_menu_on_left_click(false).
        .show_menu_on_left_click(false)
        // Выполняем операцию: .on_tray_icon_event(handle_tray_event).
        .on_tray_icon_event(handle_tray_event)
        // Выполняем операцию: .build(app).
        .build(app)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Трей не созд.
        .map_err(|error| AppError::custom(format!("Трей не создан: {error}")))?;

    // Объявляем переменную shown .
    let shown = super::icons::icon_path(app, TrayState::Idle, 0)
        // Выполняем операцию: .map(|path| path.display().to_string()).
        .map(|path| path.display().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();
    // Выполняем операцию: tracing::info!("Трей создан, иконка {shown}");.
    tracing::info!("Трей создан, иконка {shown}");

    // Выполняем операцию: Ok(tray).
    Ok(tray)
    // Закрываем блок.
}

// Объявляем функцию handle_tray_event.
fn handle_tray_event(tray: &tauri::tray::TrayIcon<Wry>, event: TrayIconEvent) {
    // Объявляем переменную app .
    let app = tray.app_handle();

    // Выбираем вариант по значению.
    match event {
        // Выполняем операцию: TrayIconEvent::Click {.
        TrayIconEvent::Click {
            // Выполняем операцию: button: tauri::tray::MouseButton::Left,.
            button: tauri::tray::MouseButton::Left,
            // Выполняем операцию: button_state: tauri::tray::MouseButtonState::Up,.
            button_state: tauri::tray::MouseButtonState::Up,
            // Выполняем операцию: ...
            ..
        // Закрываем блок.
        } => toggle_window(app),
        // Выполняем операцию: TrayIconEvent::Click {.
        TrayIconEvent::Click {
            // Выполняем операцию: button: tauri::tray::MouseButton::Right,.
            button: tauri::tray::MouseButton::Right,
            // Выполняем операцию: button_state: tauri::tray::MouseButtonState::Up,.
            button_state: tauri::tray::MouseButtonState::Up,
            // Выполняем операцию: position,.
            position,
            // Выполняем операцию: ...
            ..
        // Закрываем блок.
        } => crate::tray_menu::show(app, position),
        // Выполняем операцию: TrayIconEvent::Click {.
        TrayIconEvent::Click {
            // Выполняем операцию: button: tauri::tray::MouseButton::Middle,.
            button: tauri::tray::MouseButton::Middle,
            // Выполняем операцию: button_state: tauri::tray::MouseButtonState::Up,.
            button_state: tauri::tray::MouseButtonState::Up,
            // Выполняем операцию: ...
            ..
        // Закрываем блок.
        } => {
            // Объявляем переменную _ .
            let _ = app.emit(super::EVENT_QUICK_RUN, ());
        // Закрываем блок.
        }
        // Выполняем операцию: TrayIconEvent::DoubleClick { .. } => {.
        TrayIconEvent::DoubleClick { .. } => {
            // Выполняем операцию: show_window(app);.
            show_window(app);
            // Объявляем переменную _ .
            let _ = app.emit(super::EVENT_NAVIGATE_DASHBOARD, ());
        // Закрываем блок.
        }
        // Выполняем операцию: _ => {}.
        _ => {}
    // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "runtime_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
