// Подключаем модули: std::collections::HashMap;.
use std::collections::HashMap;
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;
// Подключаем модули: std::time::{Duration, Instant};.
use std::time::{Duration, Instant};

// Подключаем модули: once_cell::sync::Lazy;.
use once_cell::sync::Lazy;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::security_denied;.
use crate::security::security_denied;

// Объявляем константу RUN_STRATEGY_PER_MINUTE.
const RUN_STRATEGY_PER_MINUTE: usize = 10;
// Объявляем константу INSTALL_UPDATE_PER_5_MINUTES.
const INSTALL_UPDATE_PER_5_MINUTES: usize = 1;
// Объявляем константу VPN_SWITCH_PER_MINUTE.
const VPN_SWITCH_PER_MINUTE: usize = 5;
// Объявляем константу INJECT_PER_MINUTE.
const INJECT_PER_MINUTE: usize = 20;
// Объявляем константу FILE_IO_PER_MINUTE.
const FILE_IO_PER_MINUTE: usize = 60;
// Объявляем константу GAME_LAUNCH_PER_MINUTE.
const GAME_LAUNCH_PER_MINUTE: usize = 20;

// Объявляем структуру RateLimiter.
pub struct RateLimiter {
    // Выполняем операцию: window: Duration,.
    window: Duration,
    // Выполняем операцию: max_requests: usize,.
    max_requests: usize,
    // Выполняем операцию: state: Mutex<HashMap<String, Vec<Instant>>>,.
    state: Mutex<HashMap<String, Vec<Instant>>>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl RateLimiter {
    // Объявляем функцию new.
    pub fn new(window: Duration, max_requests: usize) -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: window,.
            window,
            // Выполняем операцию: max_requests,.
            max_requests,
            // Выполняем операцию: state: Mutex::new(HashMap::new()),.
            state: Mutex::new(HashMap::new()),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию check.
    pub fn check(&self, key: &str) -> AppResult<()> {
        // Объявляем переменную now .
        let now = Instant::now();
        // Объявляем переменную state .
        let mut state = self
            // Выполняем операцию: .state.
            .state
            // Выполняем операцию: .lock().
            .lock()
            // Выполняем операцию: .map_err(|_| AppError::custom("Лимитер занят"))?;.
            .map_err(|_| AppError::custom("Лимитер занят"))?;

        // Объявляем переменную entry .
        let entry = state.entry(key.to_string()).or_default();
        // Выполняем операцию: entry.retain(|stamp| now.duration_since(*stamp) < self..
        entry.retain(|stamp| now.duration_since(*stamp) < self.window);

        // Проверяем условие: entry.len() >= self.max_requests {.
        if entry.len() >= self.max_requests {
            // Возвращаем результат из функции.
            return Err(security_denied(
                // Выполняем операцию: "rate-limit",.
                "rate-limit",
                // Выполняем операцию: &format!("{key}: превышен лимит запросов"),.
                &format!("{key}: превышен лимит запросов"),
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Выполняем операцию: entry.push(now);.
        entry.push(now);

        // Выполняем операцию: Ok(()).
        Ok(())
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем константу RUN_STRATEGY.
static RUN_STRATEGY: Lazy<RateLimiter> =
    // Выполняем операцию: Lazy::new(|| RateLimiter::new(Duration::from_secs(60), .
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), RUN_STRATEGY_PER_MINUTE));
// Объявляем константу INSTALL_UPDATE.
static INSTALL_UPDATE: Lazy<RateLimiter> =
    // Выполняем операцию: Lazy::new(|| RateLimiter::new(Duration::from_secs(300),.
    Lazy::new(|| RateLimiter::new(Duration::from_secs(300), INSTALL_UPDATE_PER_5_MINUTES));
// Объявляем константу VPN_SWITCH.
static VPN_SWITCH: Lazy<RateLimiter> =
    // Выполняем операцию: Lazy::new(|| RateLimiter::new(Duration::from_secs(60), .
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), VPN_SWITCH_PER_MINUTE));
// Объявляем константу INJECT.
static INJECT: Lazy<RateLimiter> =
    // Выполняем операцию: Lazy::new(|| RateLimiter::new(Duration::from_secs(60), .
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), INJECT_PER_MINUTE));
// Объявляем константу FILE_IO.
static FILE_IO: Lazy<RateLimiter> =
    // Выполняем операцию: Lazy::new(|| RateLimiter::new(Duration::from_secs(60), .
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), FILE_IO_PER_MINUTE));
// Объявляем константу GAME_LAUNCH.
static GAME_LAUNCH: Lazy<RateLimiter> =
    // Выполняем операцию: Lazy::new(|| RateLimiter::new(Duration::from_secs(60), .
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), GAME_LAUNCH_PER_MINUTE));

// Объявляем функцию check_run_strategy.
pub fn check_run_strategy(strategy_id: &str) -> AppResult<()> {
    // Выполняем операцию: RUN_STRATEGY.check(&format!("run_strategy:{strategy_id}.
    RUN_STRATEGY.check(&format!("run_strategy:{strategy_id}"))
    // Закрываем блок.
}

// Объявляем функцию check_install_update.
pub fn check_install_update() -> AppResult<()> {
    // Выполняем операцию: INSTALL_UPDATE.check("install_update").
    INSTALL_UPDATE.check("install_update")
    // Закрываем блок.
}

// Объявляем функцию check_vpn_switch.
pub fn check_vpn_switch(config_name: &str) -> AppResult<()> {
    // Выполняем операцию: VPN_SWITCH.check(&format!("vpn_switch:{config_name}")).
    VPN_SWITCH.check(&format!("vpn_switch:{config_name}"))
    // Закрываем блок.
}

// Объявляем функцию check_inject.
pub fn check_inject(strategy_id: &str) -> AppResult<()> {
    // Выполняем операцию: INJECT.check(&format!("inject:{strategy_id}")).
    INJECT.check(&format!("inject:{strategy_id}"))
    // Закрываем блок.
}

// Объявляем функцию check_file_io.
pub fn check_file_io(operation: &str) -> AppResult<()> {
    // Выполняем операцию: FILE_IO.check(&format!("file_io:{operation}")).
    FILE_IO.check(&format!("file_io:{operation}"))
    // Закрываем блок.
}

/// Запуск и закрытие игр ограничены: иначе из интерфейса можно было
/// бы запускать процессы пачками.
// Объявляем функцию check_game_launch.
pub fn check_game_launch(operation: &str) -> AppResult<()> {
    // Выполняем операцию: GAME_LAUNCH.check(&format!("game_launch:{operation}")).
    GAME_LAUNCH.check(&format!("game_launch:{operation}"))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию allows_up_to_limit.
    fn allows_up_to_limit() {
        // Объявляем переменную limiter .
        let limiter = RateLimiter::new(Duration::from_secs(60), 3);

        // Перебираем элементы коллекции.
        for _ in 0..3 {
            // Выполняем операцию: assert!(limiter.check("k").is_ok());.
            assert!(limiter.check("k").is_ok());
            // Закрываем блок.
        }

        // Выполняем операцию: assert!(limiter.check("k").is_err());.
        assert!(limiter.check("k").is_err());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию keys_are_independent.
    fn keys_are_independent() {
        // Объявляем переменную limiter .
        let limiter = RateLimiter::new(Duration::from_secs(60), 1);

        // Выполняем операцию: assert!(limiter.check("a").is_ok());.
        assert!(limiter.check("a").is_ok());
        // Выполняем операцию: assert!(limiter.check("b").is_ok());.
        assert!(limiter.check("b").is_ok());
        // Выполняем операцию: assert!(limiter.check("a").is_err());.
        assert!(limiter.check("a").is_err());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию window_resets.
    fn window_resets() {
        // Объявляем переменную limiter .
        let limiter = RateLimiter::new(Duration::from_millis(40), 1);

        // Выполняем операцию: assert!(limiter.check("k").is_ok());.
        assert!(limiter.check("k").is_ok());
        // Выполняем операцию: assert!(limiter.check("k").is_err());.
        assert!(limiter.check("k").is_err());
        // Выполняем операцию: std::thread::sleep(Duration::from_millis(70));.
        std::thread::sleep(Duration::from_millis(70));
        // Выполняем операцию: assert!(limiter.check("k").is_ok());.
        assert!(limiter.check("k").is_ok());
        // Закрываем блок.
    }
    // Закрываем блок.
}
