// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_appid_prefers_exact_name.
fn test_pick_appid_prefers_exact_name() {
    // Объявляем переменную json .
    let json = r#"{
        "total": 2,
        "items": [
            { "name": "Counter-Strike 2", "id": 730 },
            { "name": "Counter-Strike", "id": 10 }
        ]
    }"#;

    // Выполняем операцию: assert_eq!(pick_appid(json, "Counter-Strike 2").as_dere.
    assert_eq!(pick_appid(json, "Counter-Strike 2").as_deref(), Some("730"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_appid_falls_back_to_partial_match.
fn test_pick_appid_falls_back_to_partial_match() {
    // Объявляем переменную json .
    let json = r#"{
        "items": [
            { "name": "Something Else", "id": 42 },
            { "name": "Counter Strike 2", "id": 730 }
        ]
    }"#;

    // «CounterStrike2» без точного совпадения, но по частичному
    // совпадению находится своя игра.
    // Выполняем операцию: assert_eq!(pick_appid(json, "CounterStrike2").as_deref(.
    assert_eq!(pick_appid(json, "CounterStrike2").as_deref(), Some("730"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_appid_rejects_unrelated_results.
fn test_pick_appid_rejects_unrelated_results() {
    // Совсем чужой результат не берётся никогда: иначе на карточку
    // встанет чужая обложка.
    // Объявляем переменную json .
    let json = r#"{ "items": [ { "name": "Something Else", "id": 42 } ] }"#;

    // Выполняем операцию: assert_eq!(pick_appid(json, "Unknown Game"), None);.
    assert_eq!(pick_appid(json, "Unknown Game"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_appid_returns_none_for_empty_list.
fn test_pick_appid_returns_none_for_empty_list() {
    // Объявляем переменную json .
    let json = r#"{ "total": 0, "items": [] }"#;

    // Выполняем операцию: assert_eq!(pick_appid(json, "Nothing"), None);.
    assert_eq!(pick_appid(json, "Nothing"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_appid_returns_none_for_broken_json.
fn test_pick_appid_returns_none_for_broken_json() {
    // Выполняем операцию: assert_eq!(pick_appid("not json", "Anything"), None);.
    assert_eq!(pick_appid("not json", "Anything"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_search_term_drops_tail_after_dash.
fn test_search_term_drops_tail_after_dash() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: search_term("Counter-Strike 2 — Standard"),.
        search_term("Counter-Strike 2 — Standard"),
        // Выполняем операцию: "Counter-Strike 2".
        "Counter-Strike 2" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(search_term("Geometry Dash."), "Geometry Das.
    assert_eq!(search_term("Geometry Dash."), "Geometry Dash");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_encode_term_escapes_spaces.
fn test_encode_term_escapes_spaces() {
    // Выполняем операцию: assert_eq!(encode_term("Counter Strike"), "Counter%20St.
    assert_eq!(encode_term("Counter Strike"), "Counter%20Strike");
    // Выполняем операцию: assert_eq!(encode_term("Rust"), "Rust");.
    assert_eq!(encode_term("Rust"), "Rust");
    // Закрываем блок.
}

/// Живая проверка: поиск должен находить AppID по названию.
///
/// Запускается вручную: cargo test --lib -- --ignored steam_search_live
// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Применяем атрибут к следующему объявлению.
#[ignore]
// Объявляем функцию test_steam_search_live.
async fn test_steam_search_live() {
    // Объявляем переменную search .
    let search = search_steam("Counter-Strike 2").await;

    // Выполняем операцию: assert!(search.reachable, "Steam должен ответить");.
    assert!(search.reachable, "Steam должен ответить");
    // Выполняем операцию: assert_eq!(search.appid.as_deref(), Some("730"));.
    assert_eq!(search.appid.as_deref(), Some("730"));
    // Закрываем блок.
}
