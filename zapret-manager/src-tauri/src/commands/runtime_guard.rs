//! Runtime-guard для переключения между стратегией и VPN.
//!
//! Состояние каждый раз снимается заново: если процесс убит вне
//! приложения, «залипшего» режима здесь не появится.

// Подключаем модули: crate::commands::vpn_core::XrayRuntime;.
use crate::commands::vpn_core::XrayRuntime;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::process_manager::ProcessManager;.
use crate::process_manager::ProcessManager;
// Подключаем модули: crate::winapi_helpers::is_pid_alive;.
use crate::winapi_helpers::is_pid_alive;

/// Код ошибки «работает стратегия».
// Объявляем константу STRATEGY_RUNNING.
pub const STRATEGY_RUNNING: &str = "STRATEGY_RUNNING";
/// Код ошибки «работает VPN».
// Объявляем константу VPN_RUNNING.
pub const VPN_RUNNING: &str = "VPN_RUNNING";

/// Целевой режим, который собираются включить.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
// Объявляем перечисление RuntimeTarget.
pub enum RuntimeTarget {
    // Выполняем операцию: Strategy,.
    Strategy,
    // Выполняем операцию: Vpn,.
    Vpn,
    // Закрываем блок.
}

/// Мгновенный снимок системы: кто реально работает.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
// Объявляем структуру RuntimeSnapshot.
pub struct RuntimeSnapshot {
    // Выполняем операцию: pub strategy_running: bool,.
    pub strategy_running: bool,
    // Выполняем операцию: pub vpn_running: bool,.
    pub vpn_running: bool,
    // Закрываем блок.
}

/// Проверяет план переключения по снимку.
///
/// Туннель VPN блокирует DPI: если он поднят, системный прокси уже
/// перехватывает трафик, а повторный режим мгновенно перепутает
/// маршрут.
// Объявляем функцию decide.
pub fn decide(target: RuntimeTarget, snapshot: RuntimeSnapshot) -> AppResult<()> {
    // Выбираем вариант по значению.
    match target {
        // Выполняем операцию: RuntimeTarget::Strategy => {.
        RuntimeTarget::Strategy => {
            // Проверяем условие: snapshot.vpn_running {.
            if snapshot.vpn_running {
                // Возвращаем результат из функции.
                return Err(AppError::custom(format!(
                    // Выполняем операцию: "{VPN_RUNNING}|Включён VPN — остановите его перед запус.
                    "{VPN_RUNNING}|Включён VPN — остановите его перед запуском стратегии" // Закрываем выражение или коллекцию.
                )));
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Выполняем операцию: RuntimeTarget::Vpn => {.
        RuntimeTarget::Vpn => {
            // Проверяем условие: snapshot.strategy_running {.
            if snapshot.strategy_running {
                // Возвращаем результат из функции.
                return Err(AppError::custom(format!(
                    // Выполняем операцию: "{STRATEGY_RUNNING}|Остановите запущенную стратегию пер.
                    "{STRATEGY_RUNNING}|Остановите запущенную стратегию перед включением VPN" // Закрываем выражение или коллекцию.
                )));
                // Закрываем блок.
            }

            // Проверяем условие: snapshot.vpn_running {.
            if snapshot.vpn_running {
                // Возвращаем результат из функции.
                return Err(AppError::custom(format!("{VPN_RUNNING}|VPN уже включён")));
                // Закрываем блок.
            }
            // Закрываем блок.
        } // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Собирает свежий снимок: контролируемых процессов и ядра Xray.
// Объявляем функцию snapshot.
pub fn snapshot(xray: &XrayRuntime, manager: &ProcessManager) -> RuntimeSnapshot {
    // Выполняем операцию: RuntimeSnapshot {.
    RuntimeSnapshot {
        // Выполняем операцию: strategy_running: !manager.ids().is_empty(),.
        strategy_running: !manager.ids().is_empty(),
        // Выполняем операцию: vpn_running: xray_alive(xray),.
        vpn_running: xray_alive(xray),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию xray_alive.
fn xray_alive(xray: &XrayRuntime) -> bool {
    // Выполняем операцию: xray.xray.is_running() && xray.xray.pid().map(is_pid_al.
    xray.xray.is_running() && xray.xray.pid().map(is_pid_alive).unwrap_or(false)
    // Закрываем блок.
}

/// Проверяет целевой режим по реальному состоянию.
// Объявляем функцию validate.
pub fn validate(
    // Выполняем операцию: target: RuntimeTarget,.
    target: RuntimeTarget,
    // Выполняем операцию: xray: &XrayRuntime,.
    xray: &XrayRuntime,
    // Выполняем операцию: manager: &ProcessManager,.
    manager: &ProcessManager,
    // Закрываем выражение или коллекцию.
) -> AppResult<()> {
    // Выполняем операцию: decide(target, snapshot(xray, manager)).
    decide(target, snapshot(xray, manager))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "runtime_guard_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
