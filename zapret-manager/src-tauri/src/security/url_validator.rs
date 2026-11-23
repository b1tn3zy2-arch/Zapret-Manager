// Подключаем модули: std::net::{IpAddr, Ipv4Addr, Ipv6Addr};.
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};

// Подключаем модули: url::Url;.
use url::Url;

// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::security::security_denied;.
use crate::security::security_denied;

// Объявляем константу ALLOWED_HOSTS.
pub const ALLOWED_HOSTS: [&str; 6] = [
    // Выполняем операцию: "api.github.com",.
    "api.github.com",
    // Выполняем операцию: "github.com",.
    "github.com",
    // Выполняем операцию: "objects.githubusercontent.com",.
    "objects.githubusercontent.com",
    // Выполняем операцию: "raw.githubusercontent.com",.
    "raw.githubusercontent.com",
    // Выполняем операцию: "ipwho.is",.
    "ipwho.is",
    // Выполняем операцию: "ipapi.co",.
    "ipapi.co",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу MAX_URL_LEN.
pub const MAX_URL_LEN: usize = 512;

// Объявляем функцию validate_https_url.
pub fn validate_https_url(raw: &str) -> AppResult<Url> {
    // Объявляем переменную trimmed .
    let trimmed = raw.trim();

    // Проверяем условие: trimmed.is_empty() || trimmed.len() > MAX_URL_LEN .
    if trimmed.is_empty() || trimmed.len() > MAX_URL_LEN {
        // Возвращаем результат из функции.
        return Err(security_denied("url", "недопустимая длина URL"));
        // Закрываем блок.
    }

    // Проверяем условие: trimmed.chars().any(char::is_whitespace) {.
    if trimmed.chars().any(char::is_whitespace) {
        // Возвращаем результат из функции.
        return Err(security_denied("url", "пробелы в URL"));
        // Закрываем блок.
    }

    // Объявляем переменную parsed .
    let parsed = Url::parse(trimmed).map_err(|_| security_denied("url", "URL не разобран"))?;

    // Проверяем условие: parsed.scheme() != "https" {.
    if parsed.scheme() != "https" {
        // Возвращаем результат из функции.
        return Err(security_denied("url", "разрешён только https"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(parsed).
    Ok(parsed)
    // Закрываем блок.
}

// Объявляем функцию validate_host.
pub fn validate_host(raw: &str) -> AppResult<String> {
    // Объявляем переменную parsed .
    let parsed = validate_https_url(raw)?;

    // Проверяем условие: !ALLOWED_HOSTS.contains(&parsed.host_str().unwrap_.
    if !ALLOWED_HOSTS.contains(&parsed.host_str().unwrap_or_default()) {
        // Возвращаем результат из функции.
        return Err(security_denied("url", "домен не в списке разрешённых"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(parsed.to_string()).
    Ok(parsed.to_string())
    // Закрываем блок.
}

// Объявляем функцию is_allowed_host.
pub fn is_allowed_host(host: &str) -> bool {
    // Выполняем операцию: ALLOWED_HOSTS.contains(&host).
    ALLOWED_HOSTS.contains(&host)
    // Закрываем блок.
}

// Объявляем функцию is_public_host.
pub fn is_public_host(host: &str) -> bool {
    // Объявляем переменную bare .
    let bare = host
        // Выполняем операцию: .trim().
        .trim()
        // Выполняем операцию: .strip_prefix('[').
        .strip_prefix('[')
        // Выполняем операцию: .and_then(|value| value.strip_suffix(']')).
        .and_then(|value| value.strip_suffix(']'))
        // Выполняем операцию: .unwrap_or_else(|| host.trim());.
        .unwrap_or_else(|| host.trim());

    // Проверяем условие: bare.is_empty() || bare.len() > 253 {.
    if bare.is_empty() || bare.len() > 253 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: let Ok(ip) = bare.parse::<IpAddr>() {.
    if let Ok(ip) = bare.parse::<IpAddr>() {
        // Возвращаем результат из функции.
        return is_public_ip(ip);
        // Закрываем блок.
    }

    // Объявляем переменную name .
    let name = bare.trim_end_matches('.').to_ascii_lowercase();

    // Проверяем условие: name == "localhost".
    if name == "localhost"
        // Выполняем операцию: || name.ends_with(".localhost").
        || name.ends_with(".localhost")
        // Выполняем операцию: || name.ends_with(".local").
        || name.ends_with(".local")
        // Выполняем операцию: || name.ends_with(".internal").
        || name.ends_with(".internal")
        // Выполняем операцию: || name.ends_with(".home.arpa").
        || name.ends_with(".home.arpa")
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Односоставные имена вроде `intranet` резолвятся только внутри сети.
    // Проверяем условие: !name.contains('.') {.
    if !name.contains('.') {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: name.split('.').all(|label| {.
    name.split('.').all(|label| {
        // Выполняем операцию: !label.is_empty().
        !label.is_empty()
            // Выполняем операцию: && label.len() <= 63.
            && label.len() <= 63
            // Выполняем операцию: && label.
            && label
                // Выполняем операцию: .chars().
                .chars()
                // Выполняем операцию: .all(|ch| ch.is_ascii_alphanumeric() || ch == '-').
                .all(|ch| ch.is_ascii_alphanumeric() || ch == '-')
            // Выполняем операцию: && !label.starts_with('-').
            && !label.starts_with('-')
            // Выполняем операцию: && !label.ends_with('-').
            && !label.ends_with('-')
            // Числовые и hex-формы вроде `2130706433` и `0x7f.1`
            // Windows умеет трактовать как адрес, поэтому не пускаем.
            // Выполняем операцию: && !label.chars().all(|ch| ch.is_ascii_digit()).
            && !label.chars().all(|ch| ch.is_ascii_digit())
            // Выполняем операцию: && !label.starts_with("0x").
            && !label.starts_with("0x")
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Проверяет IP-адрес: локальные, служебные и multicast-адреса запрещены.
// Объявляем функцию is_public_ip.
pub fn is_public_ip(ip: IpAddr) -> bool {
    // Выбираем вариант по значению.
    match ip {
        // Выполняем операцию: IpAddr::V4(value) => is_public_ipv4(value),.
        IpAddr::V4(value) => is_public_ipv4(value),
        // Выполняем операцию: IpAddr::V6(value) => is_public_ipv6(value),.
        IpAddr::V6(value) => is_public_ipv6(value),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию is_public_ipv4.
fn is_public_ipv4(value: Ipv4Addr) -> bool {
    // Объявляем переменную octets .
    let octets = value.octets();
    // Объявляем переменную cgnat .
    let cgnat = octets[0] == 100 && (64..=127).contains(&octets[1]);
    // Объявляем переменную this_network .
    let this_network = octets[0] == 0;
    // Объявляем переменную reserved .
    let reserved = octets[0] == 192 && octets[1] == 0 && octets[2] == 0;
    // Объявляем переменную benchmarking .
    let benchmarking = octets[0] == 198 && (octets[1] == 18 || octets[1] == 19);

    // Выполняем операцию: !(value.is_private().
    !(value.is_private()
        // Выполняем операцию: || value.is_loopback().
        || value.is_loopback()
        // Выполняем операцию: || value.is_link_local().
        || value.is_link_local()
        // Выполняем операцию: || value.is_unspecified().
        || value.is_unspecified()
        // Выполняем операцию: || value.is_multicast().
        || value.is_multicast()
        // Выполняем операцию: || value.is_broadcast().
        || value.is_broadcast()
        // Выполняем операцию: || value.is_documentation().
        || value.is_documentation()
        // Выполняем операцию: || cgnat.
        || cgnat
        // Выполняем операцию: || this_network.
        || this_network
        // Выполняем операцию: || reserved.
        || reserved
        // Выполняем операцию: || benchmarking).
        || benchmarking)
    // Закрываем блок.
}

// Объявляем функцию is_public_ipv6.
fn is_public_ipv6(value: Ipv6Addr) -> bool {
    // Проверяем условие: let Some(mapped) = value.to_ipv4_mapped() {.
    if let Some(mapped) = value.to_ipv4_mapped() {
        // Возвращаем результат из функции.
        return is_public_ipv4(mapped);
        // Закрываем блок.
    }

    // Устаревшие IPv4-compatible адреса (`::127.0.0.1`) тоже ведут в IPv4.
    // Объявляем переменную segments .
    let segments = value.segments();

    // Проверяем условие: segments[..6].iter().all(|segment| *segment == 0) .
    if segments[..6].iter().all(|segment| *segment == 0) {
        // Объявляем переменную compatible .
        let compatible = Ipv4Addr::new(
            // Выполняем операцию: (segments[6] >> 8) as u8,.
            (segments[6] >> 8) as u8,
            // Выполняем операцию: segments[6] as u8,.
            segments[6] as u8,
            // Выполняем операцию: (segments[7] >> 8) as u8,.
            (segments[7] >> 8) as u8,
            // Выполняем операцию: segments[7] as u8,.
            segments[7] as u8,
            // Закрываем выражение или коллекцию.
        );

        // Проверяем условие: !compatible.is_unspecified() && !is_public_ipv4(co.
        if !compatible.is_unspecified() && !is_public_ipv4(compatible) {
            // Возвращаем результат из функции.
            return false;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: !(value.is_loopback().
    !(value.is_loopback()
        // Выполняем операцию: || value.is_unspecified().
        || value.is_unspecified()
        // Выполняем операцию: || value.is_unique_local().
        || value.is_unique_local()
        // Выполняем операцию: || value.is_unicast_link_local().
        || value.is_unicast_link_local()
        // Выполняем операцию: || value.is_multicast()).
        || value.is_multicast())
    // Закрываем блок.
}

/// Нормализует домен из пользовательского ввода и отсекает всё,
/// что не является публичным хостом.
// Объявляем функцию normalize_public_host.
pub fn normalize_public_host(raw: &str) -> Option<String> {
    // Объявляем переменную trimmed .
    let trimmed = raw
        // Выполняем операцию: .trim().
        .trim()
        // Выполняем операцию: .trim_start_matches("https://").
        .trim_start_matches("https://")
        // Выполняем операцию: .trim_start_matches("http://").
        .trim_start_matches("http://")
        // Выполняем операцию: .trim_end_matches('/');.
        .trim_end_matches('/');

    // Проверяем условие: trimmed.is_empty().
    if trimmed.is_empty()
        // Выполняем операцию: || trimmed.len() > 253.
        || trimmed.len() > 253
        // Выполняем операцию: || trimmed.
        || trimmed
            // Выполняем операцию: .chars().
            .chars()
            // Выполняем операцию: .any(|ch| ch.is_whitespace() || matches!(ch, '/' | '\\'.
            .any(|ch| ch.is_whitespace() || matches!(ch, '/' | '\\' | '@' | '?' | '#' | '%'))
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную host .
    let host = trimmed
        // Выполняем операцию: .strip_prefix('[').
        .strip_prefix('[')
        // Выполняем операцию: .and_then(|value| value.strip_suffix(']')).
        .and_then(|value| value.strip_suffix(']'))
        // Выполняем операцию: .unwrap_or(trimmed).
        .unwrap_or(trimmed)
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Порт в этих командах не поддерживается: только 443.
    // Проверяем условие: host.contains(':') && host.parse::<Ipv6Addr>().is_.
    if host.contains(':') && host.parse::<Ipv6Addr>().is_err() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: is_public_host(&host).then_some(host).
    is_public_host(&host).then_some(host)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию private_hosts_rejected_for_browser.
    fn private_hosts_rejected_for_browser() {
        // Выполняем операцию: assert!(!is_public_host("localhost"));.
        assert!(!is_public_host("localhost"));
        // Выполняем операцию: assert!(!is_public_host("127.0.0.1"));.
        assert!(!is_public_host("127.0.0.1"));
        // Выполняем операцию: assert!(!is_public_host("10.1.2.3"));.
        assert!(!is_public_host("10.1.2.3"));
        // Выполняем операцию: assert!(!is_public_host("172.16.0.1"));.
        assert!(!is_public_host("172.16.0.1"));
        // Выполняем операцию: assert!(!is_public_host("172.31.255.1"));.
        assert!(!is_public_host("172.31.255.1"));
        // Выполняем операцию: assert!(!is_public_host("192.168.1.1"));.
        assert!(!is_public_host("192.168.1.1"));
        // Выполняем операцию: assert!(!is_public_host("169.254.169.254"));.
        assert!(!is_public_host("169.254.169.254"));
        // Выполняем операцию: assert!(!is_public_host("router.local"));.
        assert!(!is_public_host("router.local"));
        // Выполняем операцию: assert!(!is_public_host("::1"));.
        assert!(!is_public_host("::1"));
        // Выполняем операцию: assert!(!is_public_host("[::1]"));.
        assert!(!is_public_host("[::1]"));
        // Выполняем операцию: assert!(!is_public_host("fd00::1"));.
        assert!(!is_public_host("fd00::1"));
        // Выполняем операцию: assert!(!is_public_host("fe80::1"));.
        assert!(!is_public_host("fe80::1"));
        // Выполняем операцию: assert!(!is_public_host("::ffff:127.0.0.1"));.
        assert!(!is_public_host("::ffff:127.0.0.1"));
        // Выполняем операцию: assert!(!is_public_host("100.64.0.1"));.
        assert!(!is_public_host("100.64.0.1"));
        // Выполняем операцию: assert!(!is_public_host("0.0.0.0"));.
        assert!(!is_public_host("0.0.0.0"));
        // Выполняем операцию: assert!(!is_public_host("2130706433"));.
        assert!(!is_public_host("2130706433"));
        // Выполняем операцию: assert!(!is_public_host("0x7f.1"));.
        assert!(!is_public_host("0x7f.1"));
        // Выполняем операцию: assert!(!is_public_host("127.1"));.
        assert!(!is_public_host("127.1"));
        // Выполняем операцию: assert!(!is_public_host("intranet"));.
        assert!(!is_public_host("intranet"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию public_hosts_allowed_for_browser.
    fn public_hosts_allowed_for_browser() {
        // Выполняем операцию: assert!(is_public_host("github.com"));.
        assert!(is_public_host("github.com"));
        // Выполняем операцию: assert!(is_public_host("172.32.0.1"));.
        assert!(is_public_host("172.32.0.1"));
        // Выполняем операцию: assert!(is_public_host("8.8.8.8"));.
        assert!(is_public_host("8.8.8.8"));
        // Выполняем операцию: assert!(is_public_host("2606:4700:4700::1111"));.
        assert!(is_public_host("2606:4700:4700::1111"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию normalize_public_host_strips_scheme_and_rejects_paths.
    fn normalize_public_host_strips_scheme_and_rejects_paths() {
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: normalize_public_host("https://rbg-services.com/"),.
            normalize_public_host("https://rbg-services.com/"),
            // Выполняем операцию: Some("rbg-services.com".to_string()).
            Some("rbg-services.com".to_string()) // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: normalize_public_host("prod.rbg-services.com"),.
            normalize_public_host("prod.rbg-services.com"),
            // Выполняем операцию: Some("prod.rbg-services.com".to_string()).
            Some("prod.rbg-services.com".to_string()) // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert!(normalize_public_host("https://example.com@127..
        assert!(normalize_public_host("https://example.com@127.0.0.1/").is_none());
        // Выполняем операцию: assert!(normalize_public_host("example.com:8080").is_no.
        assert!(normalize_public_host("example.com:8080").is_none());
        // Выполняем операцию: assert!(normalize_public_host("example.com/path").is_no.
        assert!(normalize_public_host("example.com/path").is_none());
        // Выполняем операцию: assert!(normalize_public_host("localhost").is_none());.
        assert!(normalize_public_host("localhost").is_none());
        // Выполняем операцию: assert!(normalize_public_host("192.168.0.1").is_none()).
        assert!(normalize_public_host("192.168.0.1").is_none());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию accepts_https.
    fn accepts_https() {
        // Объявляем переменную parsed .
        let parsed =
            // Выполняем операцию: validate_https_url("https://api.github.com/repos/x/y/re.
            validate_https_url("https://api.github.com/repos/x/y/releases/latest").expect("url");

        // Выполняем операцию: assert_eq!(parsed.host_str(), Some("api.github.com"));.
        assert_eq!(parsed.host_str(), Some("api.github.com"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию rejects_http.
    fn rejects_http() {
        // Выполняем операцию: assert!(validate_https_url("http://api.github.com").is_.
        assert!(validate_https_url("http://api.github.com").is_err());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию rejects_other_scheme.
    fn rejects_other_scheme() {
        // Выполняем операцию: assert!(validate_https_url("file:///C:/Windows/System32.
        assert!(validate_https_url("file:///C:/Windows/System32").is_err());
        // Выполняем операцию: assert!(validate_https_url("javascript:alert(1)").is_er.
        assert!(validate_https_url("javascript:alert(1)").is_err());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию whitelist_rejects_evil_host.
    fn whitelist_rejects_evil_host() {
        // Выполняем операцию: assert!(validate_host("https://evil.example.com/x").is_.
        assert!(validate_host("https://evil.example.com/x").is_err());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию whitelist_accepts_known_hosts.
    fn whitelist_accepts_known_hosts() {
        // Выполняем операцию: assert!(validate_host("https://github.com").is_ok());.
        assert!(validate_host("https://github.com").is_ok());
        // Выполняем операцию: assert!(validate_host("https://objects.githubuserconten.
        assert!(validate_host("https://objects.githubusercontent.com/a.zip").is_ok());
        // Выполняем операцию: assert!(validate_host("https://ipwho.is/1.1.1.1").is_ok.
        assert!(validate_host("https://ipwho.is/1.1.1.1").is_ok());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию rejects_spaces_and_long_values.
    fn rejects_spaces_and_long_values() {
        // Выполняем операцию: assert!(validate_https_url("https://api.github.com/a b".
        assert!(validate_https_url("https://api.github.com/a b").is_err());
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: validate_https_url(&format!("https://api.github.com/{}".
            validate_https_url(&format!("https://api.github.com/{}", "a".repeat(600))).is_err() // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}
