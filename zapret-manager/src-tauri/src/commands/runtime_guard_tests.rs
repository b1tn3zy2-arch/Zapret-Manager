// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию codes.
fn codes(error: &AppError) -> String {
    // Выполняем операцию: error.to_string().
    error.to_string()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strategy_blocked_by_running_vpn.
fn test_strategy_blocked_by_running_vpn() {
    // Объявляем переменную snapshot .
    let snapshot = RuntimeSnapshot {
        // Выполняем операцию: strategy_running: false,.
        strategy_running: false,
        // Выполняем операцию: vpn_running: true,.
        vpn_running: true,
        // Закрываем блок.
    };

    // Объявляем переменную error .
    let error = decide(RuntimeTarget::Strategy, snapshot)
        // Выполняем операцию: .expect_err("запуск стратегии при VPN должен быть забло.
        .expect_err("запуск стратегии при VPN должен быть заблокирован");

    // Выполняем операцию: assert!(codes(&error).contains(VPN_RUNNING));.
    assert!(codes(&error).contains(VPN_RUNNING));
    // Выполняем операцию: assert!(codes(&error).contains("остановите"));.
    assert!(codes(&error).contains("остановите"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_blocked_by_running_strategy.
fn test_vpn_blocked_by_running_strategy() {
    // Объявляем переменную snapshot .
    let snapshot = RuntimeSnapshot {
        // Выполняем операцию: strategy_running: true,.
        strategy_running: true,
        // Выполняем операцию: vpn_running: false,.
        vpn_running: false,
        // Закрываем блок.
    };

    // Объявляем переменную error .
    let error = decide(RuntimeTarget::Vpn, snapshot)
        // Выполняем операцию: .expect_err("запуск VPN при стратегии должен быть забло.
        .expect_err("запуск VPN при стратегии должен быть заблокирован");

    // Выполняем операцию: assert!(codes(&error).contains(STRATEGY_RUNNING));.
    assert!(codes(&error).contains(STRATEGY_RUNNING));
    // Выполняем операцию: assert!(codes(&error).contains("Остановите"));.
    assert!(codes(&error).contains("Остановите"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_vpn_blocked_twice_has_same_code.
fn test_vpn_blocked_twice_has_same_code() {
    // Объявляем переменную busy .
    let busy = decide(
        // Выполняем операцию: RuntimeTarget::Vpn,.
        RuntimeTarget::Vpn,
        // Выполняем операцию: RuntimeSnapshot {.
        RuntimeSnapshot {
            // Выполняем операцию: strategy_running: false,.
            strategy_running: false,
            // Выполняем операцию: vpn_running: true,.
            vpn_running: true,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .expect_err("повторный запуск VPN");.
    .expect_err("повторный запуск VPN");

    // Выполняем операцию: assert!(codes(&busy).contains(VPN_RUNNING));.
    assert!(codes(&busy).contains(VPN_RUNNING));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_free_decision_is_allowed.
fn test_free_decision_is_allowed() {
    // Выполняем операцию: assert!(decide(.
    assert!(decide(
        // Выполняем операцию: RuntimeTarget::Vpn,.
        RuntimeTarget::Vpn,
        // Выполняем операцию: RuntimeSnapshot {.
        RuntimeSnapshot {
            // Выполняем операцию: strategy_running: false,.
            strategy_running: false,
            // Выполняем операцию: vpn_running: false,.
            vpn_running: false,
            // Закрываем блок.
        } // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .is_ok());.
    .is_ok());
    // Выполняем операцию: assert!(decide(.
    assert!(decide(
        // Выполняем операцию: RuntimeTarget::Strategy,.
        RuntimeTarget::Strategy,
        // Выполняем операцию: RuntimeSnapshot {.
        RuntimeSnapshot {
            // Выполняем операцию: strategy_running: false,.
            strategy_running: false,
            // Выполняем операцию: vpn_running: false,.
            vpn_running: false,
            // Закрываем блок.
        } // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .is_ok());.
    .is_ok());
    // Выполняем операцию: assert!(decide(.
    assert!(decide(
        // Выполняем операцию: RuntimeTarget::Strategy,.
        RuntimeTarget::Strategy,
        // Выполняем операцию: RuntimeSnapshot {.
        RuntimeSnapshot {
            // Выполняем операцию: strategy_running: false,.
            strategy_running: false,
            // Выполняем операцию: vpn_running: false,.
            vpn_running: false,
            // Закрываем блок.
        } // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .is_ok());.
    .is_ok());
    // Закрываем блок.
}
