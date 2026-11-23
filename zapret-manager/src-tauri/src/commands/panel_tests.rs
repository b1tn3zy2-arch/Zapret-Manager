// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::panel_snapshot::RATES_SNAPSHOT;.
use crate::commands::panel_snapshot::RATES_SNAPSHOT;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_snapshot_has_four_terms.
fn test_snapshot_has_four_terms() {
    // Объявляем переменную tariffs .
    let tariffs = parse_tariffs(RATES_SNAPSHOT).expect("тарифы из снимка");

    // Выполняем операцию: assert_eq!(tariffs.len(), 4);.
    assert_eq!(tariffs.len(), 4);

    // Объявляем переменную days.
    let days: Vec<u32> = tariffs.iter().map(|tariff| tariff.days).collect();
    // Выполняем операцию: assert_eq!(days, vec![31, 92, 184, 365]);.
    assert_eq!(days, vec![31, 92, 184, 365]);

    // Объявляем переменную months.
    let months: Vec<u32> = tariffs.iter().map(|tariff| tariff.months).collect();
    // Выполняем операцию: assert_eq!(months, vec![1, 3, 6, 12]);.
    assert_eq!(months, vec![1, 3, 6, 12]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_snapshot_prices_match_panel.
fn test_snapshot_prices_match_panel() {
    // Объявляем переменную tariffs .
    let tariffs = parse_tariffs(RATES_SNAPSHOT).expect("тарифы из снимка");

    // Объявляем переменную one_device.
    let one_device: Vec<u32> = tariffs
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|tariff| price_for_devices(&tariff.prices, 1)).
        .map(|tariff| price_for_devices(&tariff.prices, 1))
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: assert_eq!(one_device, vec![199, 399, 699, 1199]);.
    assert_eq!(one_device, vec![199, 399, 699, 1199]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_price_for_devices_takes_exact_match.
fn test_price_for_devices_takes_exact_match() {
    // Объявляем переменную prices .
    let prices = vec![
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 1,.
            devices: 1,
            // Выполняем операцию: price: 199,.
            price: 199,
            // Закрываем блок.
        },
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 2,.
            devices: 2,
            // Выполняем операцию: price: 240,.
            price: 240,
            // Закрываем блок.
        },
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 3,.
            devices: 3,
            // Выполняем операцию: price: 299,.
            price: 299,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: assert_eq!(price_for_devices(&prices, 2), 240);.
    assert_eq!(price_for_devices(&prices, 2), 240);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_price_for_devices_takes_nearest_higher.
fn test_price_for_devices_takes_nearest_higher() {
    // Объявляем переменную prices .
    let prices = vec![
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 1,.
            devices: 1,
            // Выполняем операцию: price: 199,.
            price: 199,
            // Закрываем блок.
        },
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 3,.
            devices: 3,
            // Выполняем операцию: price: 299,.
            price: 299,
            // Закрываем блок.
        },
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 10,.
            devices: 10,
            // Выполняем операцию: price: 599,.
            price: 599,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    ];

    // Двух устройств в списке нет: берётся ближайшее большее.
    // Выполняем операцию: assert_eq!(price_for_devices(&prices, 2), 299);.
    assert_eq!(price_for_devices(&prices, 2), 299);
    // Выполняем операцию: assert_eq!(price_for_devices(&prices, 4), 599);.
    assert_eq!(price_for_devices(&prices, 4), 599);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_price_for_devices_falls_back_to_maximum.
fn test_price_for_devices_falls_back_to_maximum() {
    // Объявляем переменную prices .
    let prices = vec![
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 1,.
            devices: 1,
            // Выполняем операцию: price: 199,.
            price: 199,
            // Закрываем блок.
        },
        // Выполняем операцию: PanelPrice {.
        PanelPrice {
            // Выполняем операцию: devices: 3,.
            devices: 3,
            // Выполняем операцию: price: 299,.
            price: 299,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    ];

    // Больше трёх не продаётся: остаётся максимальная цена.
    // Выполняем операцию: assert_eq!(price_for_devices(&prices, 50), 299);.
    assert_eq!(price_for_devices(&prices, 50), 299);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_price_for_devices_without_prices_is_zero.
fn test_price_for_devices_without_prices_is_zero() {
    // Выполняем операцию: assert_eq!(price_for_devices(&[], 1), 0);.
    assert_eq!(price_for_devices(&[], 1), 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_months_for_days_follows_panel_rule.
fn test_months_for_days_follows_panel_rule() {
    // Выполняем операцию: assert_eq!(months_for_days(31), 1);.
    assert_eq!(months_for_days(31), 1);
    // Выполняем операцию: assert_eq!(months_for_days(92), 3);.
    assert_eq!(months_for_days(92), 3);
    // Выполняем операцию: assert_eq!(months_for_days(184), 6);.
    assert_eq!(months_for_days(184), 6);
    // Выполняем операцию: assert_eq!(months_for_days(365), 12);.
    assert_eq!(months_for_days(365), 12);
    // Выполняем операцию: assert_eq!(months_for_days(0), 1);.
    assert_eq!(months_for_days(0), 1);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_tariffs_rejects_garbage.
fn test_parse_tariffs_rejects_garbage() {
    // Выполняем операцию: assert!(parse_tariffs("не json").is_err());.
    assert!(parse_tariffs("не json").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_panel_error_uses_message_from_body.
fn test_panel_error_uses_message_from_body() {
    // Объявляем переменную body .
    let body =
        // Выполняем операцию: r#"{"success":false,"error":{"code":"INVALID_TOKEN","me.
        r#"{"success":false,"error":{"code":"INVALID_TOKEN","message":"Токен недействителен"}}"#;

    // Объявляем переменную error .
    let error = panel_error(422, body);

    // Выполняем операцию: assert!(error.to_string().contains("Токен недействителе.
    assert!(error.to_string().contains("Токен недействителен"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_panel_error_marks_rate_limit.
fn test_panel_error_marks_rate_limit() {
    // Объявляем переменную body .
    let body =
        // Выполняем операцию: r#"{"success":false,"error":{"code":"RATE_LIMITED","mes.
        r#"{"success":false,"error":{"code":"RATE_LIMITED","message":"Слишком много запросов"}}"#;

    // Объявляем переменную error .
    let error = panel_error(429, body);

    // Выполняем операцию: assert!(error.to_string().contains("Панель временно не .
    assert!(error.to_string().contains("Панель временно не пускает"));
    // Выполняем операцию: assert!(error.to_string().contains("Слишком много запро.
    assert!(error.to_string().contains("Слишком много запросов"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_panel_error_falls_back_to_status.
fn test_panel_error_falls_back_to_status() {
    // Объявляем переменную error .
    let error = panel_error(502, "<html>плохой шлюз</html>");

    // Выполняем операцию: assert!(error.to_string().contains("502"));.
    assert!(error.to_string().contains("502"));
    // Закрываем блок.
}

/// Ручная проверка на живой панели.
///
/// Запускается вручную: `cargo test -- --ignored panel_live`.
// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Применяем атрибут к следующему объявлению.
#[ignore]
// Объявляем функцию test_panel_live.
async fn test_panel_live() {
    // Объявляем переменную client .
    let client = build_client().expect("клиент");

    // Объявляем переменную tariffs .
    let tariffs = fetch_tariffs(&client).await.expect("тарифы с панели");
    // Выполняем операцию: assert!(!tariffs.is_empty(), "панель вернула тарифы");.
    assert!(!tariffs.is_empty(), "панель вернула тарифы");
    // Перебираем элементы коллекции.
    for tariff in &tariffs {
        // Выполняем операцию: assert!(price_for_devices(&tariff.prices, 1) > 0);.
        assert!(price_for_devices(&tariff.prices, 1) > 0);
        // Закрываем блок.
    }
    // Закрываем блок.
}
