// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: std::collections::HashSet;.
use std::collections::HashSet;

// Объявляем функцию names.
fn names(values: &[&str]) -> Vec<String> {
    // Выполняем операцию: values.iter().map(|value| (*value).to_string()).collect.
    values.iter().map(|value| (*value).to_string()).collect()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_owned_tunnels_keeps_only_managed_ones.
fn test_owned_tunnels_keeps_only_managed_ones() {
    // Объявляем переменную tunnels .
    let tunnels = names(&["nl", "corp", "gamenet"]);
    // Объявляем переменную owned.
    let owned: HashSet<String> = names(&["nl", "gamenet"]).into_iter().collect();

    // Объявляем переменную kept .
    let kept = owned_tunnels(&tunnels, &owned);

    // Выполняем операцию: assert_eq!(kept.len(), 2);.
    assert_eq!(kept.len(), 2);
    // Выполняем операцию: assert!(kept.contains(&&"nl".to_string()));.
    assert!(kept.contains(&&"nl".to_string()));
    // Выполняем операцию: assert!(kept.contains(&&"gamenet".to_string()));.
    assert!(kept.contains(&&"gamenet".to_string()));
    // Выполняем операцию: assert!(!kept.contains(&&"corp".to_string()));.
    assert!(!kept.contains(&&"corp".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_owned_tunnels_ignores_foreign_interfaces.
fn test_owned_tunnels_ignores_foreign_interfaces() {
    // Объявляем переменную tunnels .
    let tunnels = names(&["corp-vpn", "wg0"]);
    // Объявляем переменную owned.
    let owned: HashSet<String> = HashSet::new();

    // Выполняем операцию: assert!(owned_tunnels(&tunnels, &owned).is_empty());.
    assert!(owned_tunnels(&tunnels, &owned).is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_owned_tunnels_with_empty_input.
fn test_owned_tunnels_with_empty_input() {
    // Объявляем переменную owned.
    let owned: HashSet<String> = names(&["nl"]).into_iter().collect();

    // Выполняем операцию: assert!(owned_tunnels(&[], &owned).is_empty());.
    assert!(owned_tunnels(&[], &owned).is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_handshake_freshness_constants_agree.
fn test_handshake_freshness_constants_agree() {
    // Свежесть хендшейка проверяется в двух местах: в константе и в
    // байе-файле, где она используется.
    // Выполняем операцию: assert_eq!(HANDSHAKE_FRESH_SEC, 60);.
    assert_eq!(HANDSHAKE_FRESH_SEC, 60);
    // Выполняем операцию: assert_eq!(HANDSHAKE_DEFAULT_SEC, 15);.
    assert_eq!(HANDSHAKE_DEFAULT_SEC, 15);
    // Закрываем блок.
}
