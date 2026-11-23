// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию candidate.
fn candidate(name: &str, host: &str, port: u16) -> ServerCandidate {
    // Выполняем операцию: ServerCandidate {.
    ServerCandidate {
        // Выполняем операцию: id: format!("id-{name}"),.
        id: format!("id-{name}"),
        // Выполняем операцию: name: name.to_string(),.
        name: name.to_string(),
        // Выполняем операцию: host: host.to_string(),.
        host: host.to_string(),
        // Выполняем операцию: port,.
        port,
        // Выполняем операцию: link: format!("vless://{name}@example.com:443?type=ws#{.
        link: format!("vless://{name}@example.com:443?type=ws#{}", name),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию measured.
fn measured(name: &str, ping: Option<u64>) -> Measured {
    // Выполняем операцию: Measured {.
    Measured {
        // Выполняем операцию: candidate: candidate(name, "example.com", 443),.
        candidate: candidate(name, "example.com", 443),
        // Выполняем операцию: ping_ms: ping,.
        ping_ms: ping,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sort_by_latency_puts_fastest_first.
fn test_sort_by_latency_puts_fastest_first() {
    // Объявляем переменную sorted .
    let sorted = sort_by_latency(vec![
        // Выполняем операцию: measured("slow", Some(120)),.
        measured("slow", Some(120)),
        // Выполняем операцию: measured("fast", Some(24)),.
        measured("fast", Some(24)),
        // Выполняем операцию: measured("medium", Some(60)),.
        measured("medium", Some(60)),
        // Выполняем операцию: ]);.
    ]);

    // Объявляем переменную names.
    let names: Vec<&str> = sorted
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|item| item.candidate.name.as_str()).
        .map(|item| item.candidate.name.as_str())
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: assert_eq!(names, vec!["fast", "medium", "slow"]);.
    assert_eq!(names, vec!["fast", "medium", "slow"]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sort_by_latency_keeps_unreachable_last.
fn test_sort_by_latency_keeps_unreachable_last() {
    // Объявляем переменную sorted .
    let sorted = sort_by_latency(vec![measured("dead", None), measured("alive", Some(30))]);

    // Выполняем операцию: assert_eq!(sorted[0].candidate.name, "alive");.
    assert_eq!(sorted[0].candidate.name, "alive");
    // Выполняем операцию: assert_eq!(sorted[1].candidate.name, "dead");.
    assert_eq!(sorted[1].candidate.name, "dead");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sort_by_latency_is_stable_for_unreachable.
fn test_sort_by_latency_is_stable_for_unreachable() {
    // Объявляем переменную sorted .
    let sorted = sort_by_latency(vec![measured("a", None), measured("b", None)]);

    // Выполняем операцию: assert_eq!(sorted[0].candidate.name, "a");.
    assert_eq!(sorted[0].candidate.name, "a");
    // Выполняем операцию: assert_eq!(sorted[1].candidate.name, "b");.
    assert_eq!(sorted[1].candidate.name, "b");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_measure_latency_fails_fast_for_closed_port.
async fn test_measure_latency_fails_fast_for_closed_port() {
    // Порт 1 на localhost никто не слушает: ответ не придёт.
    // Объявляем переменную result .
    let result = measure_latency("127.0.0.1", 1).await;

    // Выполняем операцию: assert!(result.is_none());.
    assert!(result.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_measure_all_returns_every_candidate.
async fn test_measure_all_returns_every_candidate() {
    // Объявляем переменную candidates .
    let candidates = vec![
        // Выполняем операцию: candidate("a", "127.0.0.1", 1),.
        candidate("a", "127.0.0.1", 1),
        // Выполняем операцию: candidate("b", "127.0.0.1", 2),.
        candidate("b", "127.0.0.1", 2),
        // Закрываем выражение или коллекцию.
    ];

    // Объявляем переменную measured .
    let measured = measure_all(candidates).await;

    // Выполняем операцию: assert_eq!(measured.len(), 2);.
    assert_eq!(measured.len(), 2);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_no_available_servers_error_keeps_code.
fn test_no_available_servers_error_keeps_code() {
    // Объявляем переменную error .
    let error = no_available_servers();

    // Выполняем операцию: assert!(error.to_string().contains(NO_AVAILABLE_SERVERS.
    assert!(error.to_string().contains(NO_AVAILABLE_SERVERS));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_lte_nodes_are_not_used_for_vpn.
fn test_lte_nodes_are_not_used_for_vpn() {
    // Выполняем операцию: assert!(is_excluded_node("🇷🇺 🟢 LTE Обход #1"));.
    assert!(is_excluded_node("🇷🇺 🟢 LTE Обход #1"));
    // Выполняем операцию: assert!(is_excluded_node("LTE Обход"));.
    assert!(is_excluded_node("LTE Обход"));
    // Выполняем операцию: assert!(is_excluded_node("обход"));.
    assert!(is_excluded_node("обход"));

    // Выполняем операцию: assert!(!is_excluded_node("🇳🇱 Амстердам"));.
    assert!(!is_excluded_node("🇳🇱 Амстердам"));
    // Выполняем операцию: assert!(!is_excluded_node("🇩🇪 Германия"));.
    assert!(!is_excluded_node("🇩🇪 Германия"));
    // Выполняем операцию: assert!(!is_excluded_node("Alpha"));.
    assert!(!is_excluded_node("Alpha"));
    // Закрываем блок.
}
