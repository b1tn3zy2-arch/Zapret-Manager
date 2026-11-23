// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_primary_success.
fn test_parse_primary_success() {
    // Объявляем переменную raw .
    let raw = r#"{
        "success": true,
        "ip": "185.13.45.67",
        "country": "Нидерланды",
        "country_code": "NL",
        "city": "Амстердам",
        "connection": { "isp": "Example B.V." }
    }"#;

    // Объявляем переменную info .
    let info = parse_primary(raw).expect("должен распарситься");

    // Выполняем операцию: assert_eq!(info.ip, "185.13.45.67");.
    assert_eq!(info.ip, "185.13.45.67");
    // Выполняем операцию: assert_eq!(info.country_code, "NL");.
    assert_eq!(info.country_code, "NL");
    // Выполняем операцию: assert_eq!(info.city, "Амстердам");.
    assert_eq!(info.city, "Амстердам");
    // Выполняем операцию: assert_eq!(info.isp, "Example B.V.");.
    assert_eq!(info.isp, "Example B.V.");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_primary_rejects_failed_flag.
fn test_parse_primary_rejects_failed_flag() {
    // Объявляем переменную raw .
    let raw = r#"{"success": false, "message": "Rate limited"}"#;

    // Выполняем операцию: assert!(parse_primary(raw).is_none());.
    assert!(parse_primary(raw).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_primary_tolerates_missing_isp.
fn test_parse_primary_tolerates_missing_isp() {
    // Объявляем переменную raw .
    let raw = r#"{"success": true, "ip": "1.2.3.4", "country_code": "DE"}"#;

    // Объявляем переменную info .
    let info = parse_primary(raw).expect("должен распарситься");

    // Выполняем операцию: assert_eq!(info.isp, "");.
    assert_eq!(info.isp, "");
    // Выполняем операцию: assert_eq!(info.country, "");.
    assert_eq!(info.country, "");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_primary_rejects_garbage.
fn test_parse_primary_rejects_garbage() {
    // Выполняем операцию: assert!(parse_primary("не json").is_none());.
    assert!(parse_primary("не json").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_fallback_maps_field_names.
fn test_parse_fallback_maps_field_names() {
    // Объявляем переменную raw .
    let raw = r#"{
        "ip": "203.0.113.9",
        "country_name": "Германия",
        "country_code": "DE",
        "city": "Берлин",
        "org": "AS64496 Example"
    }"#;

    // Объявляем переменную info .
    let info = parse_fallback(raw).expect("должен распарситься");

    // Выполняем операцию: assert_eq!(info.ip, "203.0.113.9");.
    assert_eq!(info.ip, "203.0.113.9");
    // Выполняем операцию: assert_eq!(info.country, "Германия");.
    assert_eq!(info.country, "Германия");
    // Выполняем операцию: assert_eq!(info.country_code, "DE");.
    assert_eq!(info.country_code, "DE");
    // Выполняем операцию: assert_eq!(info.isp, "AS64496 Example");.
    assert_eq!(info.isp, "AS64496 Example");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_fallback_rejects_missing_ip.
fn test_parse_fallback_rejects_missing_ip() {
    // Выполняем операцию: assert!(parse_fallback(r#"{"country_code":"NL"}"#).is_n.
    assert!(parse_fallback(r#"{"country_code":"NL"}"#).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_secondary_maps_field_names.
fn test_parse_secondary_maps_field_names() {
    // Объявляем переменную raw .
    let raw = r#"{
        "ipVersion": 4,
        "ipAddress": "79.139.162.72",
        "countryName": "Russia",
        "countryCode": "RU",
        "cityName": "Moscow",
        "asnOrganization": "PJSC Mgts"
    }"#;

    // Объявляем переменную info .
    let info = parse_secondary(raw).expect("должен распарситься");

    // Выполняем операцию: assert_eq!(info.ip, "79.139.162.72");.
    assert_eq!(info.ip, "79.139.162.72");
    // Выполняем операцию: assert_eq!(info.country, "Russia");.
    assert_eq!(info.country, "Russia");
    // Выполняем операцию: assert_eq!(info.country_code, "RU");.
    assert_eq!(info.country_code, "RU");
    // Выполняем операцию: assert_eq!(info.city, "Moscow");.
    assert_eq!(info.city, "Moscow");
    // Выполняем операцию: assert_eq!(info.isp, "PJSC Mgts");.
    assert_eq!(info.isp, "PJSC Mgts");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_secondary_rejects_missing_ip.
fn test_parse_secondary_rejects_missing_ip() {
    // Выполняем операцию: assert!(parse_secondary(r#"{"countryCode":"RU"}"#).is_n.
    assert!(parse_secondary(r#"{"countryCode":"RU"}"#).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_measure_reports_failure_for_unreachable.
async fn test_measure_reports_failure_for_unreachable() {
    // Объявляем переменную result .
    let result = measure("127.0.0.1:1").await;

    // Выполняем операцию: assert_eq!(result.host, "127.0.0.1:1");.
    assert_eq!(result.host, "127.0.0.1:1");
    // Выполняем операцию: assert!(!result.success);.
    assert!(!result.success);
    // Выполняем операцию: assert!(result.latency_ms.is_none());.
    assert!(result.latency_ms.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_ping_hosts_returns_one_per_host.
async fn test_ping_hosts_returns_one_per_host() {
    // Объявляем переменную results .
    let results = ping_hosts(vec!["127.0.0.1:1".to_string(), "127.0.0.1:2".to_string()]).await;

    // Выполняем операцию: assert_eq!(results.len(), 2);.
    assert_eq!(results.len(), 2);

    // Перебираем элементы коллекции.
    for result in &results {
        // Выполняем операцию: assert!(!result.success);.
        assert!(!result.success);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_ping_hosts_empty_input.
async fn test_ping_hosts_empty_input() {
    // Выполняем операцию: assert!(ping_hosts(Vec::new()).await.is_empty());.
    assert!(ping_hosts(Vec::new()).await.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_ping_hosts_caps_input.
async fn test_ping_hosts_caps_input() {
    // Объявляем переменную hosts .
    let hosts = (0..MAX_PING_HOSTS + 10)
        // Выполняем операцию: .map(|index| format!("127.0.0.1:{index}")).
        .map(|index| format!("127.0.0.1:{index}"))
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную results .
    let results = ping_hosts(hosts).await;

    // Выполняем операцию: assert_eq!(results.len(), MAX_PING_HOSTS);.
    assert_eq!(results.len(), MAX_PING_HOSTS);
    // Выполняем операцию: assert!(results.iter().all(|result| !result.success));.
    assert!(results.iter().all(|result| !result.success));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_ping_result_serializes_camel_case.
fn test_ping_result_serializes_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&PingResult {
        // Выполняем операцию: host: "discord.com".to_string(),.
        host: "discord.com".to_string(),
        // Выполняем операцию: latency_ms: Some(42),.
        latency_ms: Some(42),
        // Выполняем операцию: success: true,.
        success: true,
        // Закрываем блок.
    })
    // Выполняем операцию: .expect("сериализуется");.
    .expect("сериализуется");

    // Выполняем операцию: assert!(json.contains("\"latencyMs\":42"));.
    assert!(json.contains("\"latencyMs\":42"));
    // Выполняем операцию: assert!(json.contains("\"host\":\"discord.com\""));.
    assert!(json.contains("\"host\":\"discord.com\""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_network_info_serializes_camel_case.
fn test_network_info_serializes_camel_case() {
    // Объявляем переменную json .
    let json = serde_json::to_string(&NetworkInfo {
        // Выполняем операцию: ip: "1.2.3.4".to_string(),.
        ip: "1.2.3.4".to_string(),
        // Выполняем операцию: country: "NL".to_string(),.
        country: "NL".to_string(),
        // Выполняем операцию: country_code: "NL".to_string(),.
        country_code: "NL".to_string(),
        // Выполняем операцию: city: "Амстердам".to_string(),.
        city: "Амстердам".to_string(),
        // Выполняем операцию: isp: "Example".to_string(),.
        isp: "Example".to_string(),
        // Закрываем блок.
    })
    // Выполняем операцию: .expect("сериализуется");.
    .expect("сериализуется");

    // Выполняем операцию: assert!(json.contains("\"countryCode\":\"NL\""));.
    assert!(json.contains("\"countryCode\":\"NL\""));
    // Выполняем операцию: assert!(!json.contains("country_code"));.
    assert!(!json.contains("country_code"));
    // Закрываем блок.
}
