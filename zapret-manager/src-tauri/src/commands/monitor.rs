use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex, MutexGuard};
use std::time::Duration;

use serde::Serialize;
use sysinfo::Networks;
use tauri::{AppHandle, Emitter, State};

use crate::error::{AppError, AppResult};
use crate::winapi_helpers::count_tcp_connections;

pub const EVENT_NETWORK_STATS: &str = "network-stats";

const DEFAULT_INTERVAL_MS: u64 = 100;
const MIN_INTERVAL_MS: u64 = 50;
const MAX_INTERVAL_MS: u64 = 5000;

/// Как часто пересчитывается количество TCP-соединений.
const CONNECTIONS_REFRESH_MS: u64 = 1000;

/// Как часто сэмплер отдаёт данные интерфейсу.
///
/// Замер идёт часто, чтобы скорость считалась точно, но события в веб-интерфейс
/// уходят вдвое реже: раньше поток шёл 20 раз в секунду, интерфейс тонул в
/// обновлениях и визуально подвисал — цифры успевали показаться и замирали.
const EMIT_INTERVAL_MS: u64 = 500;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkStats {
    pub bytes_in: u64,
    pub bytes_out: u64,
    pub speed_in: u64,
    pub speed_out: u64,
    pub packets_in: u64,
    pub packets_out: u64,
    pub connections: u32,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Copy, Default)]
struct Totals {
    bytes_in: u64,
    bytes_out: u64,
    packets_in: u64,
    packets_out: u64,
}

struct Sampler {
    networks: Networks,
    primed: bool,
    last_ms: u64,
    last: Totals,
    /// Сколько TCP-соединений было на прошлом полном обходе таблицы.
    connections: u32,
    connections_checked_ms: u64,
}

struct MonitorInner {
    sampler: Mutex<Option<Sampler>>,
    stop: AtomicBool,
    running: AtomicBool,
    generation: AtomicU64,
}

#[derive(Clone)]
pub struct MonitorState {
    inner: Arc<MonitorInner>,
}

impl MonitorState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(MonitorInner {
                sampler: Mutex::new(None),
                stop: AtomicBool::new(true),
                running: AtomicBool::new(false),
                generation: AtomicU64::new(0),
            }),
        }
    }

    fn lock_sampler(&self) -> AppResult<MutexGuard<'_, Option<Sampler>>> {
        self.inner
            .sampler
            .lock()
            .map_err(|_| AppError::custom("Сборщик трафика занят другим потоком"))
    }

    fn is_running(&self) -> bool {
        self.inner.running.load(Ordering::Relaxed)
    }
}

impl Default for MonitorState {
    fn default() -> Self {
        Self::new()
    }
}

pub fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|delta| delta.as_millis() as u64)
        .unwrap_or(0)
}

pub fn clamp_interval(value: Option<u64>) -> u64 {
    match value {
        Some(raw) => raw.clamp(MIN_INTERVAL_MS, MAX_INTERVAL_MS),
        None => DEFAULT_INTERVAL_MS,
    }
}

fn is_loopback(name: &str) -> bool {
    name.to_lowercase().contains("loopback")
}

fn collect_totals(networks: &Networks) -> Totals {
    let mut totals = Totals::default();

    for (name, data) in networks {
        if is_loopback(name) {
            continue;
        }

        totals.bytes_in = totals.bytes_in.saturating_add(data.total_received());
        totals.bytes_out = totals
            .bytes_out
            .saturating_add(data.total_transmitted());
        totals.packets_in = totals
            .packets_in
            .saturating_add(data.total_packets_received());
        totals.packets_out = totals
            .packets_out
            .saturating_add(data.total_packets_transmitted());
    }

    totals
}

fn per_second(delta: u64, elapsed_ms: u64) -> u64 {
    if elapsed_ms == 0 {
        return 0;
    }

    delta.saturating_mul(1000) / elapsed_ms
}

pub fn sample(state: &MonitorState) -> AppResult<NetworkStats> {
    let mut guard = state.lock_sampler()?;
    let sampler = guard.get_or_insert_with(|| {
        let mut networks = Networks::new();
        networks.refresh(false);

        Sampler {
            networks,
            primed: false,
            last_ms: 0,
            last: Totals::default(),
            connections: 0,
            connections_checked_ms: 0,
        }
    });

    sampler.networks.refresh(false);

    let totals = collect_totals(&sampler.networks);
    let timestamp = now_millis();

    // Полный обход таблицы соединений заметно дороже чтения счётчиков
    // интерфейсов, поэтому он идёт раз в секунду, а не на каждом замере.
    // Раньше он выполнялся 20 раз в секунду и съедал заметную долю CPU.
    if timestamp.saturating_sub(sampler.connections_checked_ms) >= CONNECTIONS_REFRESH_MS {
        sampler.connections = count_tcp_connections();
        sampler.connections_checked_ms = timestamp;
    }

    let (speed_in, speed_out) = if sampler.primed && timestamp > sampler.last_ms {
        let elapsed = timestamp - sampler.last_ms;

        (
            per_second(totals.bytes_in.saturating_sub(sampler.last.bytes_in), elapsed),
            per_second(totals.bytes_out.saturating_sub(sampler.last.bytes_out), elapsed),
        )
    } else {
        (0, 0)
    };

    sampler.last_ms = timestamp;
    sampler.last = totals;
    sampler.primed = true;
    let connections = sampler.connections;
    drop(guard);

    Ok(NetworkStats {
        bytes_in: totals.bytes_in,
        bytes_out: totals.bytes_out,
        speed_in,
        speed_out,
        packets_in: totals.packets_in,
        packets_out: totals.packets_out,
        connections,
        timestamp,
    })
}

#[tauri::command]
pub async fn get_network_stats(state: State<'_, MonitorState>) -> AppResult<NetworkStats> {
    let monitor = state.inner().clone();

    tokio::task::spawn_blocking(move || sample(&monitor))
        .await
        .map_err(|error| AppError::custom(error.to_string()))?
}

#[tauri::command]
pub async fn start_monitoring(
    app: AppHandle,
    state: State<'_, MonitorState>,
    interval_ms: Option<u64>,
) -> AppResult<bool> {
    let monitor = state.inner().clone();
    let interval = clamp_interval(interval_ms);
    let generation = monitor.inner.generation.fetch_add(1, Ordering::SeqCst) + 1;

    monitor.inner.stop.store(false, Ordering::SeqCst);
    monitor.inner.running.store(true, Ordering::SeqCst);
    tracing::debug!("Монитор трафика запущен, интервал {interval} мс");

    tauri::async_runtime::spawn(async move {
        let mut last_emit_ms: u64 = 0;

        loop {
            let finished = monitor.inner.stop.load(Ordering::SeqCst)
                || monitor.inner.generation.load(Ordering::SeqCst) != generation;

            if finished {
                break;
            }

            let worker = monitor.clone();
            let outcome = tokio::task::spawn_blocking(move || sample(&worker)).await;

            match outcome {
                Ok(Ok(stats)) => {
                    if stats.timestamp.saturating_sub(last_emit_ms) >= EMIT_INTERVAL_MS {
                        last_emit_ms = stats.timestamp;
                        let _ = app.emit(EVENT_NETWORK_STATS, &stats);
                    }
                }
                Ok(Err(error)) => {
                    tracing::debug!("Сбор трафика не удался: {error}");
                }
                Err(error) => {
                    tracing::debug!("Задача сбора трафика прервана: {error}");
                }
            }

            tokio::time::sleep(Duration::from_millis(interval)).await;
        }

        if monitor.inner.generation.load(Ordering::SeqCst) == generation {
            monitor.inner.running.store(false, Ordering::SeqCst);
            tracing::debug!("Монитор трафика остановлен");
        }
    });

    Ok(true)
}

#[tauri::command]
pub fn stop_monitoring(state: State<'_, MonitorState>) -> AppResult<bool> {
    let monitor = state.inner().clone();
    monitor.inner.stop.store(true, Ordering::SeqCst);
    monitor.inner.generation.fetch_add(1, Ordering::SeqCst);
    monitor.inner.running.store(false, Ordering::SeqCst);

    Ok(true)
}

#[tauri::command]
pub fn is_monitoring(state: State<'_, MonitorState>) -> AppResult<bool> {
    Ok(state.inner().is_running())
}

#[cfg(test)]
#[path = "monitor_tests.rs"]
mod tests;

