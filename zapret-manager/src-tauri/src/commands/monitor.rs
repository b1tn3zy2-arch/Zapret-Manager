// Подключаем модули: std::sync::atomic::{AtomicBool, AtomicU64, Ordering};.
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
// Подключаем модули: std::sync::{Arc, Mutex, MutexGuard};.
use std::sync::{Arc, Mutex, MutexGuard};
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: sysinfo::Networks;.
use sysinfo::Networks;
// Подключаем модули: tauri::{AppHandle, Emitter, State};.
use tauri::{AppHandle, Emitter, State};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::winapi_helpers::count_tcp_connections;.
use crate::winapi_helpers::count_tcp_connections;

// Объявляем константу EVENT_NETWORK_STATS.
pub const EVENT_NETWORK_STATS: &str = "network-stats";

// Объявляем константу DEFAULT_INTERVAL_MS.
const DEFAULT_INTERVAL_MS: u64 = 100;
// Объявляем константу MIN_INTERVAL_MS.
const MIN_INTERVAL_MS: u64 = 50;
// Объявляем константу MAX_INTERVAL_MS.
const MAX_INTERVAL_MS: u64 = 5000;

/// Как часто пересчитывается количество TCP-соединений.
// Объявляем константу CONNECTIONS_REFRESH_MS.
const CONNECTIONS_REFRESH_MS: u64 = 1000;

/// Как часто сэмплер отдаёт данные интерфейсу.
///
/// Замер идёт часто, чтобы скорость считалась точно, но события в веб-интерфейс
/// уходят вдвое реже: раньше поток шёл 20 раз в секунду, интерфейс тонул в
/// обновлениях и визуально подвисал — цифры успевали показаться и замирали.
// Объявляем константу EMIT_INTERVAL_MS.
const EMIT_INTERVAL_MS: u64 = 500;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру NetworkStats.
pub struct NetworkStats {
    // Выполняем операцию: pub bytes_in: u64,.
    pub bytes_in: u64,
    // Выполняем операцию: pub bytes_out: u64,.
    pub bytes_out: u64,
    // Выполняем операцию: pub speed_in: u64,.
    pub speed_in: u64,
    // Выполняем операцию: pub speed_out: u64,.
    pub speed_out: u64,
    // Выполняем операцию: pub packets_in: u64,.
    pub packets_in: u64,
    // Выполняем операцию: pub packets_out: u64,.
    pub packets_out: u64,
    // Выполняем операцию: pub connections: u32,.
    pub connections: u32,
    // Выполняем операцию: pub timestamp: u64,.
    pub timestamp: u64,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, Default)]
// Объявляем структуру Totals.
struct Totals {
    // Выполняем операцию: bytes_in: u64,.
    bytes_in: u64,
    // Выполняем операцию: bytes_out: u64,.
    bytes_out: u64,
    // Выполняем операцию: packets_in: u64,.
    packets_in: u64,
    // Выполняем операцию: packets_out: u64,.
    packets_out: u64,
    // Закрываем блок.
}

// Объявляем структуру Sampler.
struct Sampler {
    // Выполняем операцию: networks: Networks,.
    networks: Networks,
    // Выполняем операцию: primed: bool,.
    primed: bool,
    // Выполняем операцию: last_ms: u64,.
    last_ms: u64,
    // Выполняем операцию: last: Totals,.
    last: Totals,
    /// Сколько TCP-соединений было на прошлом полном обходе таблицы.
    // Выполняем операцию: connections: u32,.
    connections: u32,
    // Выполняем операцию: connections_checked_ms: u64,.
    connections_checked_ms: u64,
    // Закрываем блок.
}

// Объявляем структуру MonitorInner.
struct MonitorInner {
    // Выполняем операцию: sampler: Mutex<Option<Sampler>>,.
    sampler: Mutex<Option<Sampler>>,
    // Выполняем операцию: stop: AtomicBool,.
    stop: AtomicBool,
    // Выполняем операцию: running: AtomicBool,.
    running: AtomicBool,
    // Выполняем операцию: generation: AtomicU64,.
    generation: AtomicU64,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Clone)]
// Объявляем структуру MonitorState.
pub struct MonitorState {
    // Выполняем операцию: inner: Arc<MonitorInner>,.
    inner: Arc<MonitorInner>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl MonitorState {
    /// из интерфейса состояние читается иначе.
    // Применяем атрибут к следующему объявлению.
    #[cfg(test)]
    /// Жив ли монитор. Проверяется только в тестах:
    /// из интерфейса состояние читается иначе.
    // Применяем атрибут к следующему объявлению.
    #[cfg(test)]
    // Объявляем функцию is_running.
    pub fn is_running(&self) -> bool {
        // Выполняем операцию: self.inner.running.load(Ordering::Relaxed).
        self.inner.running.load(Ordering::Relaxed)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl MonitorState {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: inner: Arc::new(MonitorInner {.
            inner: Arc::new(MonitorInner {
                // Выполняем операцию: sampler: Mutex::new(None),.
                sampler: Mutex::new(None),
                // Выполняем операцию: stop: AtomicBool::new(true),.
                stop: AtomicBool::new(true),
                // Выполняем операцию: running: AtomicBool::new(false),.
                running: AtomicBool::new(false),
                // Выполняем операцию: generation: AtomicU64::new(0),.
                generation: AtomicU64::new(0),
                // Закрываем блок.
            }),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию lock_sampler.
    fn lock_sampler(&self) -> AppResult<MutexGuard<'_, Option<Sampler>>> {
        // Выполняем операцию: self.inner.
        self.inner
            // Выполняем операцию: .sampler.
            .sampler
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .map_err(|_| AppError::custom("Сборщик трафика занят др.
            .map_err(|_| AppError::custom("Сборщик трафика занят другим потоком"))
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Default for MonitorState {
    // Объявляем функцию default.
    fn default() -> Self {
        // Выполняем операцию: Self::new().
        Self::new()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию now_millis.
pub fn now_millis() -> u64 {
    // Выполняем операцию: std::time::SystemTime::now().
    std::time::SystemTime::now()
        // Выполняем операцию: .duration_since(std::time::UNIX_EPOCH).
        .duration_since(std::time::UNIX_EPOCH)
        // Выполняем операцию: .map(|delta| delta.as_millis() as u64).
        .map(|delta| delta.as_millis() as u64)
        // Выполняем операцию: .unwrap_or(0).
        .unwrap_or(0)
    // Закрываем блок.
}

// Объявляем функцию clamp_interval.
pub fn clamp_interval(value: Option<u64>) -> u64 {
    // Выбираем вариант по значению.
    match value {
        // Выполняем операцию: Some(raw) => raw.clamp(MIN_INTERVAL_MS, MAX_INTERVAL_MS.
        Some(raw) => raw.clamp(MIN_INTERVAL_MS, MAX_INTERVAL_MS),
        // Выполняем операцию: None => DEFAULT_INTERVAL_MS,.
        None => DEFAULT_INTERVAL_MS,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_loopback.
fn is_loopback(name: &str) -> bool {
    // Выполняем операцию: name.to_lowercase().contains("loopback").
    name.to_lowercase().contains("loopback")
    // Закрываем блок.
}

// Объявляем функцию collect_totals.
fn collect_totals(networks: &Networks) -> Totals {
    // Объявляем переменную totals .
    let mut totals = Totals::default();

    // Перебираем элементы коллекции.
    for (name, data) in networks {
        // Проверяем условие: is_loopback(name) {.
        if is_loopback(name) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: totals.bytes_in = totals.bytes_in.saturating_add(data.t.
        totals.bytes_in = totals.bytes_in.saturating_add(data.total_received());
        // Выполняем операцию: totals.bytes_out = totals.bytes_out.saturating_add(data.
        totals.bytes_out = totals.bytes_out.saturating_add(data.total_transmitted());
        // Выполняем операцию: totals.packets_in = totals.
        totals.packets_in = totals
            // Выполняем операцию: .packets_in.
            .packets_in
            // Выполняем операцию: .saturating_add(data.total_packets_received());.
            .saturating_add(data.total_packets_received());
        // Выполняем операцию: totals.packets_out = totals.
        totals.packets_out = totals
            // Выполняем операцию: .packets_out.
            .packets_out
            // Выполняем операцию: .saturating_add(data.total_packets_transmitted());.
            .saturating_add(data.total_packets_transmitted());
        // Закрываем блок.
    }

    // Выполняем операцию: totals.
    totals
    // Закрываем блок.
}

// Объявляем функцию per_second.
fn per_second(delta: u64, elapsed_ms: u64) -> u64 {
    // Проверяем условие: elapsed_ms == 0 {.
    if elapsed_ms == 0 {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    }

    // Выполняем операцию: delta.saturating_mul(1000) / elapsed_ms.
    delta.saturating_mul(1000) / elapsed_ms
    // Закрываем блок.
}

// Объявляем функцию sample.
pub fn sample(state: &MonitorState) -> AppResult<NetworkStats> {
    // Объявляем переменную guard .
    let mut guard = state.lock_sampler()?;
    // Объявляем переменную sampler .
    let sampler = guard.get_or_insert_with(|| {
        // Объявляем переменную networks .
        let mut networks = Networks::new();
        // Выполняем операцию: networks.refresh(false);.
        networks.refresh(false);

        // Выполняем операцию: Sampler {.
        Sampler {
            // Выполняем операцию: networks,.
            networks,
            // Выполняем операцию: primed: false,.
            primed: false,
            // Выполняем операцию: last_ms: 0,.
            last_ms: 0,
            // Выполняем операцию: last: Totals::default(),.
            last: Totals::default(),
            // Выполняем операцию: connections: 0,.
            connections: 0,
            // Выполняем операцию: connections_checked_ms: 0,.
            connections_checked_ms: 0,
            // Закрываем блок.
        }
        // Закрываем блок.
    });

    // Выполняем операцию: sampler.networks.refresh(false);.
    sampler.networks.refresh(false);

    // Объявляем переменную totals .
    let totals = collect_totals(&sampler.networks);
    // Объявляем переменную timestamp .
    let timestamp = now_millis();

    // Полный обход таблицы соединений заметно дороже чтения счётчиков
    // интерфейсов, поэтому он идёт раз в секунду, а не на каждом замере.
    // Раньше он выполнялся 20 раз в секунду и съедал заметную долю CPU.
    // Проверяем условие: timestamp.saturating_sub(sampler.connections_check.
    if timestamp.saturating_sub(sampler.connections_checked_ms) >= CONNECTIONS_REFRESH_MS {
        // Выполняем операцию: sampler.connections = count_tcp_connections();.
        sampler.connections = count_tcp_connections();
        // Выполняем операцию: sampler.connections_checked_ms = timestamp;.
        sampler.connections_checked_ms = timestamp;
        // Закрываем блок.
    }

    // Объявляем переменную (speed_in, speed_out) .
    let (speed_in, speed_out) = if sampler.primed && timestamp > sampler.last_ms {
        // Объявляем переменную elapsed .
        let elapsed = timestamp - sampler.last_ms;

        // Выполняем операцию: (.
        (
            // Выполняем операцию: per_second(.
            per_second(
                // Выполняем операцию: totals.bytes_in.saturating_sub(sampler.last.bytes_in),.
                totals.bytes_in.saturating_sub(sampler.last.bytes_in),
                // Выполняем операцию: elapsed,.
                elapsed,
                // Закрываем выражение или коллекцию.
            ),
            // Выполняем операцию: per_second(.
            per_second(
                // Выполняем операцию: totals.bytes_out.saturating_sub(sampler.last.bytes_out).
                totals.bytes_out.saturating_sub(sampler.last.bytes_out),
                // Выполняем операцию: elapsed,.
                elapsed,
                // Закрываем выражение или коллекцию.
            ),
            // Закрываем выражение или коллекцию.
        )
    // Закрываем блок.
    } else {
        // Выполняем операцию: (0, 0).
        (0, 0)
        // Закрываем блок.
    };

    // Выполняем операцию: sampler.last_ms = timestamp;.
    sampler.last_ms = timestamp;
    // Выполняем операцию: sampler.last = totals;.
    sampler.last = totals;
    // Выполняем операцию: sampler.primed = true;.
    sampler.primed = true;
    // Объявляем переменную connections .
    let connections = sampler.connections;
    // Выполняем операцию: drop(guard);.
    drop(guard);

    // Выполняем операцию: Ok(NetworkStats {.
    Ok(NetworkStats {
        // Выполняем операцию: bytes_in: totals.bytes_in,.
        bytes_in: totals.bytes_in,
        // Выполняем операцию: bytes_out: totals.bytes_out,.
        bytes_out: totals.bytes_out,
        // Выполняем операцию: speed_in,.
        speed_in,
        // Выполняем операцию: speed_out,.
        speed_out,
        // Выполняем операцию: packets_in: totals.packets_in,.
        packets_in: totals.packets_in,
        // Выполняем операцию: packets_out: totals.packets_out,.
        packets_out: totals.packets_out,
        // Выполняем операцию: connections,.
        connections,
        // Выполняем операцию: timestamp,.
        timestamp,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_network_stats(state: State<'_, Monitor.
pub async fn get_network_stats(state: State<'_, MonitorState>) -> AppResult<NetworkStats> {
    // Объявляем переменную monitor .
    let monitor = state.inner().clone();

    // Выполняем операцию: tokio::task::spawn_blocking(move || sample(&monitor)).
    tokio::task::spawn_blocking(move || sample(&monitor))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?.
        .map_err(|error| AppError::custom(error.to_string()))?
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn start_monitoring(.
pub async fn start_monitoring(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: state: State<'_, MonitorState>,.
    state: State<'_, MonitorState>,
    // Выполняем операцию: interval_ms: Option<u64>,.
    interval_ms: Option<u64>,
    // Закрываем выражение или коллекцию.
) -> AppResult<bool> {
    // Объявляем переменную monitor .
    let monitor = state.inner().clone();
    // Объявляем переменную interval .
    let interval = clamp_interval(interval_ms);
    // Объявляем переменную generation .
    let generation = monitor.inner.generation.fetch_add(1, Ordering::SeqCst) + 1;

    // Выполняем операцию: monitor.inner.stop.store(false, Ordering::SeqCst);.
    monitor.inner.stop.store(false, Ordering::SeqCst);
    // Выполняем операцию: monitor.inner.running.store(true, Ordering::SeqCst);.
    monitor.inner.running.store(true, Ordering::SeqCst);
    // Выполняем операцию: tracing::debug!("Монитор трафика запущен, интервал {int.
    tracing::debug!("Монитор трафика запущен, интервал {interval} мс");

    // Выполняем операцию: tauri::async_runtime::spawn(async move {.
    tauri::async_runtime::spawn(async move {
        // Объявляем переменную last_emit_ms.
        let mut last_emit_ms: u64 = 0;

        // Выполняем операцию: loop {.
        loop {
            // Объявляем переменную finished .
            let finished = monitor.inner.stop.load(Ordering::SeqCst)
                // Выполняем операцию: || monitor.inner.generation.load(Ordering::SeqCst) != g.
                || monitor.inner.generation.load(Ordering::SeqCst) != generation;

            // Проверяем условие: finished {.
            if finished {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }

            // Объявляем переменную worker .
            let worker = monitor.clone();
            // Объявляем переменную outcome .
            let outcome = tokio::task::spawn_blocking(move || sample(&worker)).await;

            // Выбираем вариант по значению.
            match outcome {
                // Выполняем операцию: Ok(Ok(stats)) => {.
                Ok(Ok(stats)) => {
                    // Проверяем условие: stats.timestamp.saturating_sub(last_emit_ms) >= EM.
                    if stats.timestamp.saturating_sub(last_emit_ms) >= EMIT_INTERVAL_MS {
                        // Выполняем операцию: last_emit_ms = stats.timestamp;.
                        last_emit_ms = stats.timestamp;
                        // Объявляем переменную _ .
                        let _ = app.emit(EVENT_NETWORK_STATS, &stats);
                        // Закрываем блок.
                    }
                    // Закрываем блок.
                }
                // Выполняем операцию: Ok(Err(error)) => {.
                Ok(Err(error)) => {
                    // Выполняем операцию: tracing::debug!("Сбор трафика не удался: {error}");.
                    tracing::debug!("Сбор трафика не удался: {error}");
                    // Закрываем блок.
                }
                // Выполняем операцию: Err(error) => {.
                Err(error) => {
                    // Выполняем операцию: tracing::debug!("Задача сбора трафика прервана: {error}.
                    tracing::debug!("Задача сбора трафика прервана: {error}");
                    // Закрываем блок.
                } // Закрываем блок.
            }

            // Выполняем операцию: tokio::time::sleep(Duration::from_millis(interval)).awa.
            tokio::time::sleep(Duration::from_millis(interval)).await;
            // Закрываем блок.
        }

        // Проверяем условие: monitor.inner.generation.load(Ordering::SeqCst) ==.
        if monitor.inner.generation.load(Ordering::SeqCst) == generation {
            // Выполняем операцию: monitor.inner.running.store(false, Ordering::SeqCst);.
            monitor.inner.running.store(false, Ordering::SeqCst);
            // Выполняем операцию: tracing::debug!("Монитор трафика остановлен");.
            tracing::debug!("Монитор трафика остановлен");
            // Закрываем блок.
        }
        // Закрываем блок.
    });

    // Выполняем операцию: Ok(true).
    Ok(true)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию stop_monitoring.
pub fn stop_monitoring(state: State<'_, MonitorState>) -> AppResult<bool> {
    // Объявляем переменную monitor .
    let monitor = state.inner().clone();
    // Выполняем операцию: monitor.inner.stop.store(true, Ordering::SeqCst);.
    monitor.inner.stop.store(true, Ordering::SeqCst);
    // Выполняем операцию: monitor.inner.generation.fetch_add(1, Ordering::SeqCst).
    monitor.inner.generation.fetch_add(1, Ordering::SeqCst);
    // Выполняем операцию: monitor.inner.running.store(false, Ordering::SeqCst);.
    monitor.inner.running.store(false, Ordering::SeqCst);

    // Выполняем операцию: Ok(true).
    Ok(true)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "monitor_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
