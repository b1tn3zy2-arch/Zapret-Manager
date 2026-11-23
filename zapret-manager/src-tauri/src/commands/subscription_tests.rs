// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::panel::PanelPrice;.
use crate::commands::panel::PanelPrice;
// Подключаем модули: crate::commands::vpn_subscription::SubscriptionMeta;.
use crate::commands::vpn_subscription::SubscriptionMeta;

// Объявляем функцию snapshot_matrix.
fn snapshot_matrix() -> TariffMatrix {
    // Выполняем операцию: build_tariff_matrix(&snapshot_tariffs()).
    build_tariff_matrix(&snapshot_tariffs())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_has_four_plans.
fn test_matrix_has_four_plans() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Выполняем операцию: assert_eq!(matrix.plans.len(), 4);.
    assert_eq!(matrix.plans.len(), 4);

    // Объявляем переменную ids.
    let ids: Vec<&str> = matrix.plans.iter().map(|plan| plan.id.as_str()).collect();
    // Выполняем операцию: assert_eq!(ids, vec!["1m", "3m", "6m", "12m"]);.
    assert_eq!(ids, vec!["1m", "3m", "6m", "12m"]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_base_prices_match_panel.
fn test_matrix_base_prices_match_panel() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Объявляем переменную prices.
    let prices: Vec<u32> = matrix.plans.iter().map(|plan| plan.base_price).collect();

    // Выполняем операцию: assert_eq!(prices, vec![199, 399, 699, 1199]);.
    assert_eq!(prices, vec![199, 399, 699, 1199]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_covers_every_plan_and_device_count.
fn test_matrix_covers_every_plan_and_device_count() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: matrix.prices.len(),.
        matrix.prices.len(),
        // Выполняем операцию: matrix.plans.len() * MAX_DEVICES as usize.
        matrix.plans.len() * MAX_DEVICES as usize // Закрываем выражение или коллекцию.
    );

    // Перебираем элементы коллекции.
    for plan in &matrix.plans {
        // Перебираем элементы коллекции.
        for devices in MIN_DEVICES..=MAX_DEVICES {
            // Выполняем операцию: assert!(.
            assert!(
                // Выполняем операцию: matrix.
                matrix
                    // Выполняем операцию: .prices.
                    .prices
                    // Выполняем операцию: .iter().
                    .iter()
                    // Выполняем операцию: .any(|price| price.plan_id == plan.id && price.devices .
                    .any(|price| price.plan_id == plan.id && price.devices == devices),
                // Выполняем операцию: "нет цены для {} и {} устройств",.
                "нет цены для {} и {} устройств",
                // Выполняем операцию: plan.id,.
                plan.id,
                // Выполняем операцию: devices.
                devices // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_prices_match_panel_table.
fn test_matrix_prices_match_panel_table() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Объявляем переменную price .
    let price = matrix
        // Выполняем операцию: .prices.
        .prices
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|item| item.plan_id == "1m" && item.devices == 2).
        .find(|item| item.plan_id == "1m" && item.devices == 2)
        // Выполняем операцию: .expect("цена за два устройства");.
        .expect("цена за два устройства");

    // Выполняем операцию: assert_eq!(price.total, 240);.
    assert_eq!(price.total, 240);

    // Объявляем переменную year .
    let year = matrix
        // Выполняем операцию: .prices.
        .prices
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|item| item.plan_id == "12m" && item.devices == 1.
        .find(|item| item.plan_id == "12m" && item.devices == 10)
        // Выполняем операцию: .expect("цена за год");.
        .expect("цена за год");

    // Выполняем операцию: assert_eq!(year.total, 2499);.
    assert_eq!(year.total, 2499);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_per_month_price_rounds_like_panel.
fn test_per_month_price_rounds_like_panel() {
    // 699 ₽ за полгода: 116,5 → 117.
    // Выполняем операцию: assert_eq!(per_month_price(699, 6), 117);.
    assert_eq!(per_month_price(699, 6), 117);
    // 399 ₽ за три месяца: ровно 133.
    // Выполняем операцию: assert_eq!(per_month_price(399, 3), 133);.
    assert_eq!(per_month_price(399, 3), 133);
    // 1199 ₽ за год: 99,9 → 100.
    // Выполняем операцию: assert_eq!(per_month_price(1199, 12), 100);.
    assert_eq!(per_month_price(1199, 12), 100);
    // Выполняем операцию: assert_eq!(per_month_price(199, 0), 199);.
    assert_eq!(per_month_price(199, 0), 199);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_carries_sellable_device_counts.
fn test_matrix_carries_sellable_device_counts() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Выполняем операцию: assert_eq!(matrix.device_counts, vec![1, 3, 5, 7, 10]);.
    assert_eq!(matrix.device_counts, vec![1, 3, 5, 7, 10]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_prices_cover_all_devices.
fn test_matrix_prices_cover_all_devices() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Матрица полная: цена есть для каждого продаваемого тарифа и
    // количества устройств. Ссылки оплаты в матрице нет: заказ
    // создаётся в момент оплаты (payment_orders), иначе ссылка
    // протухает, пока пользователь выбирает тариф.
    // Перебираем элементы коллекции.
    for plan in &matrix.plans {
        // Перебираем элементы коллекции.
        for devices in payment_links::DEVICE_COUNTS {
            // Объявляем переменную price .
            let price = matrix
                // Выполняем операцию: .prices.
                .prices
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .find(|price| price.plan_id == plan.id && price.devices.
                .find(|price| price.plan_id == plan.id && price.devices == *devices)
                // Выполняем операцию: .unwrap_or_else(|| panic!("нет цены {} × {}", plan.id, .
                .unwrap_or_else(|| panic!("нет цены {} × {}", plan.id, devices));

            // Выполняем операцию: assert!(price.total > 0, "нулевая цена {} × {}", plan.i.
            assert!(price.total > 0, "нулевая цена {} × {}", plan.id, devices);
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_matrix_skips_plans_missing_in_panel.
fn test_matrix_skips_plans_missing_in_panel() {
    // Объявляем переменную tariffs .
    let tariffs = vec![PanelTariff {
        // Выполняем операцию: months: 1,.
        months: 1,
        // Выполняем операцию: days: 31,.
        days: 31,
        // Выполняем операцию: prices: vec![PanelPrice {.
        prices: vec![PanelPrice {
            // Выполняем операцию: devices: 1,.
            devices: 1,
            // Выполняем операцию: price: 199,.
            price: 199,
            // Закрываем блок.
        }],
        // Закрываем блок.
    }];

    // Объявляем переменную matrix .
    let matrix = build_tariff_matrix(&tariffs);

    // Выполняем операцию: assert_eq!(matrix.plans.len(), 1);.
    assert_eq!(matrix.plans.len(), 1);
    // Выполняем операцию: assert_eq!(matrix.plans[0].id, "1m");.
    assert_eq!(matrix.plans[0].id, "1m");
    // Выполняем операцию: assert_eq!(matrix.prices.len(), MAX_DEVICES as usize);.
    assert_eq!(matrix.prices.len(), MAX_DEVICES as usize);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем функцию record.
fn record(url: &str, meta: SubscriptionMeta, server_count: usize) -> StoredSubscription {
    // Объявляем переменную stored .
    let mut stored = StoredSubscription::new(url);
    // Выполняем операцию: stored.traffic_used_bytes = meta.traffic_used_bytes;.
    stored.traffic_used_bytes = meta.traffic_used_bytes;
    // Выполняем операцию: stored.traffic_limit_bytes = meta.traffic_limit_bytes;.
    stored.traffic_limit_bytes = meta.traffic_limit_bytes;
    // Выполняем операцию: stored.expires_at = meta.expires_at;.
    stored.expires_at = meta.expires_at;
    // Выполняем операцию: stored.server_count = server_count;.
    stored.server_count = server_count;

    // Выполняем операцию: stored.
    stored
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_without_link_is_honest_empty.
fn test_subscription_without_link_is_honest_empty() {
    // Объявляем переменную info .
    let info = SubscriptionInfo::from_record(&record(
        // Выполняем операцию: "https://example.com/sub",.
        "https://example.com/sub",
        // Выполняем операцию: SubscriptionMeta::default(),.
        SubscriptionMeta::default(),
        // Выполняем операцию: 22,.
        22,
        // Закрываем выражение или коллекцию.
    ));

    // Выполняем операцию: assert!(info.is_linked);.
    assert!(info.is_linked);
    // Выполняем операцию: assert!(info.is_active);.
    assert!(info.is_active);
    // Выполняем операцию: assert_eq!(info.server_count, Some(22));.
    assert_eq!(info.server_count, Some(22));
    // Выполняем операцию: assert_eq!(info.traffic_used_gb, None);.
    assert_eq!(info.traffic_used_gb, None);
    // Выполняем операцию: assert_eq!(info.traffic_limit_gb, None);.
    assert_eq!(info.traffic_limit_gb, None);
    // Выполняем операцию: assert_eq!(info.traffic_percent, None);.
    assert_eq!(info.traffic_percent, None);
    // Выполняем операцию: assert_eq!(info.days_remaining, None);.
    assert_eq!(info.days_remaining, None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_fetch_tariff_matrix_command.
async fn test_fetch_tariff_matrix_command() {
    // Объявляем переменную matrix .
    let matrix = fetch_tariff_matrix().await.expect("матрица тарифов");

    // Выполняем операцию: assert_eq!(matrix.plans.len(), 4);.
    assert_eq!(matrix.plans.len(), 4);
    // Выполняем операцию: assert!(!matrix.prices.is_empty());.
    assert!(!matrix.prices.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_info_serializes_to_frontend_shape.
fn test_subscription_info_serializes_to_frontend_shape() {
    // Объявляем переменную info .
    let info = SubscriptionInfo {
        // Выполняем операцию: traffic_used_gb: Some(41.8),.
        traffic_used_gb: Some(41.8),
        // Выполняем операцию: traffic_limit_gb: Some(100.0),.
        traffic_limit_gb: Some(100.0),
        // Выполняем операцию: traffic_percent: Some(41.8),.
        traffic_percent: Some(41.8),
        // Выполняем операцию: days_remaining: Some(71),.
        days_remaining: Some(71),
        // Выполняем операцию: is_active: true,.
        is_active: true,
        // Выполняем операцию: is_linked: true,.
        is_linked: true,
        // Выполняем операцию: title: Some("3 месяца".to_string()),.
        title: Some("3 месяца".to_string()),
        // Выполняем операцию: server_count: Some(22),.
        server_count: Some(22),
        // Выполняем операцию: expires_at: Some(1_798_782_953),.
        expires_at: Some(1_798_782_953),
        // Выполняем операцию: last_checked_at: Some(1_798_680_000),.
        last_checked_at: Some(1_798_680_000),
        // Закрываем блок.
    };

    // Объявляем переменную json .
    let json = serde_json::to_value(&info).expect("сериализация");

    // Объявляем переменную keys.
    let keys: Vec<&str> = json
        // Выполняем операцию: .as_object().
        .as_object()
        // Выполняем операцию: .expect("объект").
        .expect("объект")
        // Выполняем операцию: .keys().
        .keys()
        // Выполняем операцию: .map(String::as_str).
        .map(String::as_str)
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: keys,.
        keys,
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "daysRemaining",.
            "daysRemaining",
            // Выполняем операцию: "expiresAt",.
            "expiresAt",
            // Выполняем операцию: "isActive",.
            "isActive",
            // Выполняем операцию: "isLinked",.
            "isLinked",
            // Выполняем операцию: "lastCheckedAt",.
            "lastCheckedAt",
            // Выполняем операцию: "serverCount",.
            "serverCount",
            // Выполняем операцию: "title",.
            "title",
            // Выполняем операцию: "trafficLimitGb",.
            "trafficLimitGb",
            // Выполняем операцию: "trafficPercent",.
            "trafficPercent",
            // Выполняем операцию: "trafficUsedGb".
            "trafficUsedGb" // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tariff_matrix_serializes_to_frontend_shape.
fn test_tariff_matrix_serializes_to_frontend_shape() {
    // Объявляем переменную matrix .
    let matrix = snapshot_matrix();

    // Объявляем переменную json .
    let json = serde_json::to_value(&matrix).expect("сериализация");
    // Объявляем переменную object .
    let object = json.as_object().expect("объект");

    // Выполняем операцию: assert_eq!(object.len(), 3);.
    assert_eq!(object.len(), 3);
    // Выполняем операцию: assert!(object.contains_key("plans"));.
    assert!(object.contains_key("plans"));
    // Выполняем операцию: assert!(object.contains_key("prices"));.
    assert!(object.contains_key("prices"));
    // Выполняем операцию: assert!(object.contains_key("deviceCounts"));.
    assert!(object.contains_key("deviceCounts"));

    // Объявляем переменную plan .
    let plan = object["plans"][0].as_object().expect("план");
    // Объявляем переменную plan_keys.
    let mut plan_keys: Vec<&str> = plan.keys().map(String::as_str).collect();
    // Выполняем операцию: plan_keys.sort_unstable();.
    plan_keys.sort_unstable();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: plan_keys,.
        plan_keys,
        // Выполняем операцию: vec!["basePrice", "days", "highlight", "id", "months"].
        vec!["basePrice", "days", "highlight", "id", "months"] // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную price .
    let price = object["prices"][0].as_object().expect("цена");
    // Объявляем переменную price_keys.
    let mut price_keys: Vec<&str> = price.keys().map(String::as_str).collect();
    // Выполняем операцию: price_keys.sort_unstable();.
    price_keys.sort_unstable();

    // Выполняем операцию: assert_eq!(price_keys, vec!["devices", "perMonth", "pla.
    assert_eq!(price_keys, vec!["devices", "perMonth", "planId", "total"]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_record_from_payload_copies_metadata.
fn test_record_from_payload_copies_metadata() {
    // Объявляем переменную servers .
    let servers = vpn_subscription::parse_subscription("vless://uuid@example.com:443#Node");
    // Объявляем переменную payload .
    let payload = SubscriptionPayload {
        // Выполняем операцию: servers,.
        servers,
        // Выполняем операцию: meta: SubscriptionMeta {.
        meta: SubscriptionMeta {
            // Выполняем операцию: traffic_used_bytes: 4_000_000_000,.
            traffic_used_bytes: 4_000_000_000,
            // Выполняем операцию: traffic_limit_bytes: 10_000_000_000,.
            traffic_limit_bytes: 10_000_000_000,
            // Выполняем операцию: expires_at: Some(1_800_000_000),.
            expires_at: Some(1_800_000_000),
            // Закрываем блок.
        },
        // Выполняем операцию: title: Some("Test".to_string()),.
        title: Some("Test".to_string()),
        // Закрываем блок.
    };

    // Объявляем переменную stored .
    let stored = record_from_payload("https://example.com/sub", &payload);

    // Выполняем операцию: assert_eq!(stored.url, "https://example.com/sub");.
    assert_eq!(stored.url, "https://example.com/sub");
    // Выполняем операцию: assert_eq!(stored.server_count, 1);.
    assert_eq!(stored.server_count, 1);
    // Выполняем операцию: assert_eq!(stored.title.as_deref(), Some("Test"));.
    assert_eq!(stored.title.as_deref(), Some("Test"));
    // Выполняем операцию: assert_eq!(stored.traffic_used_bytes, 4_000_000_000);.
    assert_eq!(stored.traffic_used_bytes, 4_000_000_000);
    // Выполняем операцию: assert_eq!(stored.traffic_limit_bytes, 10_000_000_000);.
    assert_eq!(stored.traffic_limit_bytes, 10_000_000_000);
    // Выполняем операцию: assert_eq!(stored.expires_at, Some(1_800_000_000));.
    assert_eq!(stored.expires_at, Some(1_800_000_000));
    // Выполняем операцию: assert!(stored.updated_at > 0);.
    assert!(stored.updated_at > 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_expired_stored_subscription_is_inactive.
fn test_expired_stored_subscription_is_inactive() {
    // Объявляем переменную meta .
    let meta = SubscriptionMeta {
        // Выполняем операцию: traffic_used_bytes: 1024,.
        traffic_used_bytes: 1024,
        // Выполняем операцию: traffic_limit_bytes: 10_000,.
        traffic_limit_bytes: 10_000,
        // Выполняем операцию: expires_at: Some(1),.
        expires_at: Some(1),
        // Закрываем блок.
    };

    // Объявляем переменную info .
    let info = SubscriptionInfo::from_record(&record("https://example.com", meta, 1));

    // Выполняем операцию: assert!(!info.is_active);.
    assert!(!info.is_active);
    // Выполняем операцию: assert_eq!(info.days_remaining, Some(0));.
    assert_eq!(info.days_remaining, Some(0));
    // Выполняем операцию: assert_eq!(info.traffic_percent, Some(10.24));.
    assert_eq!(info.traffic_percent, Some(10.24));
    // Закрываем блок.
}
