//! Тесты создания заказа оплаты.

// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_fallback_rate_id_matches_panel.
fn test_fallback_rate_id_matches_panel() {
    // Выполняем операцию: assert_eq!(fallback_rate_id(31), Some(2));.
    assert_eq!(fallback_rate_id(31), Some(2));
    // Выполняем операцию: assert_eq!(fallback_rate_id(92), Some(3));.
    assert_eq!(fallback_rate_id(92), Some(3));
    // Выполняем операцию: assert_eq!(fallback_rate_id(184), Some(4));.
    assert_eq!(fallback_rate_id(184), Some(4));
    // Выполняем операцию: assert_eq!(fallback_rate_id(365), Some(5));.
    assert_eq!(fallback_rate_id(365), Some(5));

    // Срока приложения в запасной таблице нет — и не должно быть:
    // срок берётся из каталога тарифов.
    // Выполняем операцию: assert_eq!(fallback_rate_id(30), None);.
    assert_eq!(fallback_rate_id(30), None);
    // Выполняем операцию: assert_eq!(fallback_rate_id(0), None);.
    assert_eq!(fallback_rate_id(0), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_valid_email.
fn test_valid_email() {
    // Выполняем операцию: assert!(is_valid_email("user@example.com"));.
    assert!(is_valid_email("user@example.com"));
    // Выполняем операцию: assert!(is_valid_email("  spaced@example.com  "));.
    assert!(is_valid_email("  spaced@example.com  "));
    // Выполняем операцию: assert!(is_valid_email("a.b-c_d+tag@sub.domain.ru"));.
    assert!(is_valid_email("a.b-c_d+tag@sub.domain.ru"));

    // Выполняем операцию: assert!(!is_valid_email(""));.
    assert!(!is_valid_email(""));
    // Выполняем операцию: assert!(!is_valid_email("   "));.
    assert!(!is_valid_email("   "));
    // Выполняем операцию: assert!(!is_valid_email("no-at-sign"));.
    assert!(!is_valid_email("no-at-sign"));
    // Выполняем операцию: assert!(!is_valid_email("@example.com"));.
    assert!(!is_valid_email("@example.com"));
    // Выполняем операцию: assert!(!is_valid_email("user@"));.
    assert!(!is_valid_email("user@"));
    // Выполняем операцию: assert!(!is_valid_email("user@nodot"));.
    assert!(!is_valid_email("user@nodot"));
    // Выполняем операцию: assert!(!is_valid_email("user@.example.com"));.
    assert!(!is_valid_email("user@.example.com"));
    // Выполняем операцию: assert!(!is_valid_email("user@example..com"));.
    assert!(!is_valid_email("user@example..com"));
    // Выполняем операцию: assert!(!is_valid_email("user@exa mple.com"));.
    assert!(!is_valid_email("user@exa mple.com"));
    // Выполняем операцию: assert!(!is_valid_email("user@two@example.com"));.
    assert!(!is_valid_email("user@two@example.com"));
    // Выполняем операцию: assert!(!is_valid_email(&("a".repeat(255) + "@example.c.
    assert!(!is_valid_email(&("a".repeat(255) + "@example.com")));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_create_order_body_success.
fn test_parse_create_order_body_success() {
    // Объявляем переменную body .
    let body = r#"{
        "success": true,
        "data": {
            "transaction_id": 1067776,
            "guid": "328cbda6-000f-5001-8000-1cbaf758ed8b",
            "amount": 199,
            "payment_url": "https://maximacloud.online/pay/transactions/abc",
            "status": "created"
        }
    }"#;

    // Объявляем переменную order .
    let order = parse_create_order_body(body).expect("заказ разобран");

    // Выполняем операцию: assert_eq!(order.guid, "328cbda6-000f-5001-8000-1cbaf75.
    assert_eq!(order.guid, "328cbda6-000f-5001-8000-1cbaf758ed8b");
    // Выполняем операцию: assert_eq!(order.amount, Some(199));.
    assert_eq!(order.amount, Some(199));
    // Выполняем операцию: assert_eq!(order.url, "https://maximacloud.online/pay/t.
    assert_eq!(order.url, "https://maximacloud.online/pay/transactions/abc");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_create_order_body_without_url.
fn test_parse_create_order_body_without_url() {
    // Панель может не прислать ссылку в создании: тогда команда
    // дочитывает её из транзакции. Разбор обязан не падать.
    // Объявляем переменную body .
    let body = r#"{
        "success": true,
        "data": { "guid": "guid-1", "amount": 399 }
    }"#;

    // Объявляем переменную order .
    let order = parse_create_order_body(body).expect("заказ разобран");

    // Выполняем операцию: assert_eq!(order.guid, "guid-1");.
    assert_eq!(order.guid, "guid-1");
    // Выполняем операцию: assert_eq!(order.amount, Some(399));.
    assert_eq!(order.amount, Some(399));
    // Выполняем операцию: assert_eq!(order.url, "");.
    assert_eq!(order.url, "");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_create_order_body_error.
fn test_parse_create_order_body_error() {
    // Объявляем переменную body .
    let body = r#"{ "success": false, "error": { "message": "email обязателен" } }"#;

    // Объявляем переменную error .
    let error = parse_create_order_body(body).expect_err("ошибка панели");

    // Выполняем операцию: assert!(error.to_string().contains("email обязателен")).
    assert!(error.to_string().contains("email обязателен"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_transaction_body.
fn test_parse_transaction_body() {
    // Объявляем переменную body .
    let body = r#"{ "yookassa_payment_url": "https://yoomoney.ru/checkout/payments/v2/contract?orderId=abc" }"#;

    // Объявляем переменную url .
    let url = parse_transaction_body(body).expect("ссылка найдена");

    // Выполняем операцию: assert!(url.contains("yoomoney.ru"));.
    assert!(url.contains("yoomoney.ru"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_transaction_body_without_url.
fn test_parse_transaction_body_without_url() {
    // Объявляем переменную error .
    let error = parse_transaction_body("{}").expect_err("ссылки нет");

    // Выполняем операцию: assert!(error.to_string().contains("не прислала ссылку".
    assert!(error.to_string().contains("не прислала ссылку"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_payment_order_url.
fn test_validate_payment_order_url() {
    // Объявляем переменную url .
    let url = validate_payment_order_url("https://maximacloud.online/pay/transactions/abc?track=x")
        // Выполняем операцию: .expect("публичный хост разрешён");.
        .expect("публичный хост разрешён");

    // Выполняем операцию: assert!(url.starts_with("https://maximacloud.online/")).
    assert!(url.starts_with("https://maximacloud.online/"));
    // Выполняем операцию: assert!(url.ends_with("track=x"));.
    assert!(url.ends_with("track=x"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_payment_order_url_rejects_private_host.
fn test_validate_payment_order_url_rejects_private_host() {
    // Выполняем операцию: assert!(validate_payment_order_url("https://localhost/p.
    assert!(validate_payment_order_url("https://localhost/pay").is_err());
    // Выполняем операцию: assert!(validate_payment_order_url("https://192.168.0.1.
    assert!(validate_payment_order_url("https://192.168.0.1/pay").is_err());
    // Выполняем операцию: assert!(validate_payment_order_url("http://maximacloud..
    assert!(validate_payment_order_url("http://maximacloud.online/pay").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_create_payment_order_rejects_bad_email_without_network.
async fn test_create_payment_order_rejects_bad_email_without_network() {
    // Некорректный email отсекается до обращения к панели: ошибки
    // валидации не зависят от сети.
    // Объявляем переменную error .
    let error = create_payment_order("1m", 1, "broken e-mail")
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .expect_err("email не годится");.
        .expect_err("email не годится");

    // Выполняем операцию: assert!(error.to_string().contains("email"));.
    assert!(error.to_string().contains("email"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_create_payment_order_rejects_unknown_plan.
async fn test_create_payment_order_rejects_unknown_plan() {
    // Объявляем переменную error .
    let error = create_payment_order("2m", 1, "user@example.com")
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .expect_err("тарифа нет");.
        .expect_err("тарифа нет");

    // Выполняем операцию: assert!(error.to_string().contains("Неизвестный тариф").
    assert!(error.to_string().contains("Неизвестный тариф"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_create_payment_order_rejects_bad_devices.
async fn test_create_payment_order_rejects_bad_devices() {
    // Объявляем переменную error .
    let error = create_payment_order("1m", 11, "user@example.com")
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .expect_err("устройств слишком много");.
        .expect_err("устройств слишком много");

    // Выполняем операцию: assert!(error.to_string().contains("устройств"));.
    assert!(error.to_string().contains("устройств"));
    // Закрываем блок.
}
