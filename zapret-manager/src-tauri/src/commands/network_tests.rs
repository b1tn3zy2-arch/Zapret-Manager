use super::*;

#[test]
fn test_parse_primary_success() {
    let raw = r#"{
        "success": true,
        "ip": "185.13.45.67",
        "country": "Нидерланды",
        "country_code": "NL",
        "city": "Амстердам",
        "connection": { "isp": "Example B.V." }
    }"#;

    let info = parse_primary(raw).expect("должен распарситься");

    assert_eq!(info.ip, "185.13.45.67");
    assert_eq!(info.country_code, "NL");
    assert_eq!(info.city, "Амстердам");
    assert_eq!(info.isp, "Example B.V.");
}

#[test]
fn test_parse_primary_rejects_failed_flag() {
    let raw = r#"{"success": false, "message": "Rate limited"}"#;

    assert!(parse_primary(raw).is_none());
}

#[test]
fn test_parse_primary_tolerates_missing_isp() {
    let raw = r#"{"success": true, "ip": "1.2.3.4", "country_code": "DE"}"#;

    let info = parse_primary(raw).expect("должен распарситься");

    assert_eq!(info.isp, "");
    assert_eq!(info.country, "");
}

#[test]
fn test_parse_primary_rejects_garbage() {
    assert!(parse_primary("не json").is_none());
}

#[test]
fn test_parse_fallback_maps_field_names() {
    let raw = r#"{
        "ip": "203.0.113.9",
        "country_name": "Германия",
        "country_code": "DE",
        "city": "Берлин",
        "org": "AS64496 Example"
    }"#;

    let info = parse_fallback(raw).expect("должен распарситься");

    assert_eq!(info.ip, "203.0.113.9");
    assert_eq!(info.country, "Германия");
    assert_eq!(info.country_code, "DE");
    assert_eq!(info.isp, "AS64496 Example");
}

#[test]
fn test_parse_fallback_rejects_missing_ip() {
    assert!(parse_fallback(r#"{"country_code":"NL"}"#).is_none());
}

#[test]
fn test_parse_secondary_maps_field_names() {
    let raw = r#"{
        "ipVersion": 4,
        "ipAddress": "79.139.162.72",
        "countryName": "Russia",
        "countryCode": "RU",
        "cityName": "Moscow",
        "asnOrganization": "PJSC Mgts"
    }"#;

    let info = parse_secondary(raw).expect("должен распарситься");

    assert_eq!(info.ip, "79.139.162.72");
    assert_eq!(info.country, "Russia");
    assert_eq!(info.country_code, "RU");
    assert_eq!(info.city, "Moscow");
    assert_eq!(info.isp, "PJSC Mgts");
}

#[test]
fn test_parse_secondary_rejects_missing_ip() {
    assert!(parse_secondary(r#"{"countryCode":"RU"}"#).is_none());
}

#[tokio::test]
async fn test_measure_reports_failure_for_unreachable() {
    let result = measure("127.0.0.1:1").await;

    assert_eq!(result.host, "127.0.0.1:1");
    assert!(!result.success);
    assert!(result.latency_ms.is_none());
}

#[tokio::test]
async fn test_ping_hosts_returns_one_per_host() {
    let results = ping_hosts(vec!["127.0.0.1:1".to_string(), "127.0.0.1:2".to_string()]).await;

    assert_eq!(results.len(), 2);

    for result in &results {
        assert!(!result.success);
    }
}

#[tokio::test]
async fn test_ping_hosts_empty_input() {
    assert!(ping_hosts(Vec::new()).await.is_empty());
}

#[test]
fn test_ping_result_serializes_camel_case() {
    let json = serde_json::to_string(&PingResult {
        host: "discord.com".to_string(),
        latency_ms: Some(42),
        success: true,
    })
    .expect("сериализуется");

    assert!(json.contains("\"latencyMs\":42"));
    assert!(json.contains("\"host\":\"discord.com\""));
}

#[test]
fn test_network_info_serializes_camel_case() {
    let json = serde_json::to_string(&NetworkInfo {
        ip: "1.2.3.4".to_string(),
        country: "NL".to_string(),
        country_code: "NL".to_string(),
        city: "Амстердам".to_string(),
        isp: "Example".to_string(),
    })
    .expect("сериализуется");

    assert!(json.contains("\"countryCode\":\"NL\""));
    assert!(!json.contains("country_code"));
}