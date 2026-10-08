use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

use once_cell::sync::Lazy;

use crate::error::{AppError, AppResult};
use crate::security::security_denied;

const RUN_STRATEGY_PER_MINUTE: usize = 10;
const INSTALL_UPDATE_PER_5_MINUTES: usize = 1;
const VPN_SWITCH_PER_MINUTE: usize = 5;
const INJECT_PER_MINUTE: usize = 20;
const FILE_IO_PER_MINUTE: usize = 60;

pub struct RateLimiter {
    window: Duration,
    max_requests: usize,
    state: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    pub fn new(window: Duration, max_requests: usize) -> Self {
        Self {
            window,
            max_requests,
            state: Mutex::new(HashMap::new()),
        }
    }

    pub fn check(&self, key: &str) -> AppResult<()> {
        let now = Instant::now();
        let mut state = self
            .state
            .lock()
            .map_err(|_| AppError::custom("Лимитер занят"))?;

        let entry = state.entry(key.to_string()).or_default();
        entry.retain(|stamp| now.duration_since(*stamp) < self.window);

        if entry.len() >= self.max_requests {
            return Err(security_denied(
                "rate-limit",
                &format!("{key}: превышен лимит запросов"),
            ));
        }

        entry.push(now);

        Ok(())
    }
}

static RUN_STRATEGY: Lazy<RateLimiter> = Lazy::new(|| {
    RateLimiter::new(Duration::from_secs(60), RUN_STRATEGY_PER_MINUTE)
});
static INSTALL_UPDATE: Lazy<RateLimiter> = Lazy::new(|| {
    RateLimiter::new(Duration::from_secs(300), INSTALL_UPDATE_PER_5_MINUTES)
});
static VPN_SWITCH: Lazy<RateLimiter> =
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), VPN_SWITCH_PER_MINUTE));
static INJECT: Lazy<RateLimiter> =
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), INJECT_PER_MINUTE));
static FILE_IO: Lazy<RateLimiter> =
    Lazy::new(|| RateLimiter::new(Duration::from_secs(60), FILE_IO_PER_MINUTE));

pub fn check_run_strategy(strategy_id: &str) -> AppResult<()> {
    RUN_STRATEGY.check(&format!("run_strategy:{strategy_id}"))
}

pub fn check_install_update() -> AppResult<()> {
    INSTALL_UPDATE.check("install_update")
}

pub fn check_vpn_switch(config_name: &str) -> AppResult<()> {
    VPN_SWITCH.check(&format!("vpn_switch:{config_name}"))
}

pub fn check_inject(strategy_id: &str) -> AppResult<()> {
    INJECT.check(&format!("inject:{strategy_id}"))
}

pub fn check_file_io(operation: &str) -> AppResult<()> {
    FILE_IO.check(&format!("file_io:{operation}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn allows_up_to_limit() {
        let limiter = RateLimiter::new(Duration::from_secs(60), 3);

        for _ in 0..3 {
            assert!(limiter.check("k").is_ok());
        }

        assert!(limiter.check("k").is_err());
    }

    #[test]
    fn keys_are_independent() {
        let limiter = RateLimiter::new(Duration::from_secs(60), 1);

        assert!(limiter.check("a").is_ok());
        assert!(limiter.check("b").is_ok());
        assert!(limiter.check("a").is_err());
    }

    #[test]
    fn window_resets() {
        let limiter = RateLimiter::new(Duration::from_millis(40), 1);

        assert!(limiter.check("k").is_ok());
        assert!(limiter.check("k").is_err());
        std::thread::sleep(Duration::from_millis(70));
        assert!(limiter.check("k").is_ok());
    }
}
