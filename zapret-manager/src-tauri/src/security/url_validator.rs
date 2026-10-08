use url::Url;

use crate::error::AppResult;
use crate::security::security_denied;

pub const ALLOWED_HOSTS: [&str; 6] = [
    "api.github.com",
    "github.com",
    "objects.githubusercontent.com",
    "raw.githubusercontent.com",
    "ipwho.is",
    "ipapi.co",
];

pub const MAX_URL_LEN: usize = 512;

pub fn validate_https_url(raw: &str) -> AppResult<Url> {
    let trimmed = raw.trim();

    if trimmed.is_empty() || trimmed.len() > MAX_URL_LEN {
        return Err(security_denied("url", "недопустимая длина URL"));
    }

    if trimmed.chars().any(char::is_whitespace) {
        return Err(security_denied("url", "пробелы в URL"));
    }

    let parsed = Url::parse(trimmed)
        .map_err(|_| security_denied("url", "URL не разобран"))?;

    if parsed.scheme() != "https" {
        return Err(security_denied("url", "разрешён только https"));
    }

    Ok(parsed)
}

pub fn validate_host(raw: &str) -> AppResult<String> {
    let parsed = validate_https_url(raw)?;

    if !ALLOWED_HOSTS.contains(&parsed.host_str().unwrap_or_default()) {
        return Err(security_denied("url", "домен не в списке разрешённых"));
    }

    Ok(parsed.to_string())
}

pub fn is_allowed_host(host: &str) -> bool {
    ALLOWED_HOSTS.contains(&host)
}

pub fn is_public_host(host: &str) -> bool {
    if host.is_empty() || host.eq_ignore_ascii_case("localhost") {
        return false;
    }

    if host.ends_with(".local") || host.ends_with(".internal") {
        return false;
    }

    if host == "::1" || host.starts_with("fc") || host.starts_with("fd") {
        return false;
    }

    if host == "0.0.0.0" || host.starts_with("127.") || host.starts_with("169.254.") {
        return false;
    }

    if host.starts_with("10.") || host.starts_with("192.168.") {
        return false;
    }

    if is_private_172(host) {
        return false;
    }

    true
}

fn is_private_172(host: &str) -> bool {
    let Some(rest) = host.strip_prefix("172.") else {
        return false;
    };

    let Some(octet) = rest.split('.').next() else {
        return false;
    };

    matches!(octet.parse::<u8>(), Ok(value) if (16..=31).contains(&value))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn private_hosts_rejected_for_browser() {
        assert!(!is_public_host("localhost"));
        assert!(!is_public_host("127.0.0.1"));
        assert!(!is_public_host("10.1.2.3"));
        assert!(!is_public_host("172.16.0.1"));
        assert!(!is_public_host("172.31.255.1"));
        assert!(!is_public_host("192.168.1.1"));
        assert!(!is_public_host("169.254.169.254"));
        assert!(!is_public_host("router.local"));
        assert!(!is_public_host("::1"));
        assert!(!is_public_host("fd00::1"));
    }

    #[test]
    fn public_hosts_allowed_for_browser() {
        assert!(is_public_host("github.com"));
        assert!(is_public_host("172.32.0.1"));
        assert!(is_public_host("8.8.8.8"));
    }

    #[test]
    fn accepts_https() {
        let parsed =
            validate_https_url("https://api.github.com/repos/x/y/releases/latest").expect("url");

        assert_eq!(parsed.host_str(), Some("api.github.com"));
    }

    #[test]
    fn rejects_http() {
        assert!(validate_https_url("http://api.github.com").is_err());
    }

    #[test]
    fn rejects_other_scheme() {
        assert!(validate_https_url("file:///C:/Windows/System32").is_err());
        assert!(validate_https_url("javascript:alert(1)").is_err());
    }

    #[test]
    fn whitelist_rejects_evil_host() {
        assert!(validate_host("https://evil.example.com/x").is_err());
    }

    #[test]
    fn whitelist_accepts_known_hosts() {
        assert!(validate_host("https://github.com").is_ok());
        assert!(validate_host("https://objects.githubusercontent.com/a.zip").is_ok());
        assert!(validate_host("https://ipwho.is/1.1.1.1").is_ok());
    }

    #[test]
    fn rejects_spaces_and_long_values() {
        assert!(validate_https_url("https://api.github.com/a b").is_err());
        assert!(validate_https_url(&format!("https://api.github.com/{}", "a".repeat(600))).is_err());
    }
}
