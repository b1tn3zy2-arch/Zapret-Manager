use once_cell::sync::Lazy;
use regex::Regex;

use crate::error::AppResult;
use crate::security::security_denied;

const MAX_COMMAND_VALUE_LEN: usize = 240;
const MAX_DOMAIN_LEN: usize = 253;
const MAX_DOMAIN_LABEL_LEN: usize = 63;

static SECRET_RE: Lazy<Option<Regex>> = Lazy::new(|| {
    Regex::new(
        r"(?i)(privatekey|presharedkey|secret|password|passwd|token|apikey|api_key)\s*=\s*\S+",
    )
    .ok()
});

pub fn ensure_cmd_safe_value(value: &str) -> AppResult<()> {
    if value.is_empty() {
        return Err(security_denied("cmd-value", "пустое значение"));
    }

    if value.chars().count() > MAX_COMMAND_VALUE_LEN {
        return Err(security_denied("cmd-value", "слишком длинное значение"));
    }

    if value.contains('"') {
        return Err(security_denied("cmd-value", "кавычки в значении"));
    }

    for character in ['%', '!', '\n', '\r', '\0'] {
        if value.contains(character) {
            return Err(security_denied(
                "cmd-value",
                "значение содержит символ, который cmd.exe расширяет или обрезает",
            ));
        }
    }

    Ok(())
}

pub fn escape_for_cmd(value: &str) -> AppResult<String> {
    ensure_cmd_safe_value(value)?;

    Ok(format!("\"{}\"", value.replace('"', "\"\"")))
}

pub fn sanitize_log_message(message: &str) -> String {
    let redacted = match SECRET_RE.as_ref() {
        Some(pattern) => pattern.replace_all(message, "$1 = [скрыто]").into_owned(),
        None => "[скрыто: фильтр секретов недоступен]".to_string(),
    };

    if redacted.chars().count() > 2000 {
        let mut truncated = redacted.chars().take(2000).collect::<String>();
        truncated.push('…');
        return truncated;
    }

    redacted
}

pub fn validate_domain(domain: &str) -> AppResult<String> {
    let trimmed = domain.trim();

    if trimmed.is_empty() || trimmed.len() > MAX_DOMAIN_LEN {
        return Err(security_denied("domain", "недопустимая длина домена"));
    }

    let lowered = trimmed.to_ascii_lowercase();

    if !lowered.contains('.') {
        return Err(security_denied(
            "domain",
            "домен должен содержать хотя бы одну точку",
        ));
    }

    if lowered.contains("..") || lowered.starts_with('.') || lowered.ends_with('.') {
        return Err(security_denied(
            "domain",
            "домен начинается или кончается точкой либо содержит пустой ярлык",
        ));
    }

    if !lowered
        .split('.')
        .all(is_valid_domain_label)
    {
        return Err(security_denied("domain", "домен не соответствует шаблону"));
    }

    Ok(lowered)
}

pub fn validate_port(port: u16) -> AppResult<u16> {
    if port < 1024 {
        return Err(security_denied("port", "зарезервированный порт"));
    }

    Ok(port)
}

pub fn validate_ip(value: &str) -> AppResult<String> {
    let trimmed = value.trim();

    if trimmed.contains(':') {
        return validate_ipv6(trimmed);
    }

    validate_ipv4(trimmed)
}

pub fn validate_ip_range(value: &str) -> AppResult<String> {
    let trimmed = value.trim();

    let Some((address, prefix)) = trimmed.split_once('/') else {
        validate_ip(trimmed)?;

        return Err(security_denied("ip-range", "нет префикса /маски"));
    };

    let ipv6 = address.contains(':');
    validate_ip(address)?;

    let length: u8 = prefix
        .parse()
        .map_err(|_| security_denied("ip-range", "некорректная маска"))?;

    let max = if ipv6 { 128 } else { 32 };

    if length > max {
        return Err(security_denied("ip-range", "маска длиннее адреса"));
    }

    Ok(trimmed.to_string())
}

fn is_valid_domain_label(label: &str) -> bool {
    if label.is_empty() || label.len() > MAX_DOMAIN_LABEL_LEN {
        return false;
    }

    let bytes = label.as_bytes();

    if bytes[0] == b'-' || bytes[bytes.len() - 1] == b'-' {
        return false;
    }

    bytes
        .iter()
        .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'-')
}

fn validate_ipv4(value: &str) -> AppResult<String> {
    let parts: Vec<&str> = value.split('.').collect();

    if parts.len() != 4 {
        return Err(security_denied("ip", "нужно четыре октета"));
    }

    for part in parts {
        if part.is_empty() || part.len() > 3 || !part.bytes().all(|byte| byte.is_ascii_digit())
        {
            return Err(security_denied("ip", "окет содержит не цифры"));
        }

        let octet: u16 = part
            .parse()
            .map_err(|_| security_denied("ip", "некорректный октет"))?;

        if octet > 255 {
            return Err(security_denied("ip", "октет больше 255"));
        }
    }

    Ok(value.to_string())
}

fn validate_ipv6(value: &str) -> AppResult<String> {
    if value.len() < 3 || value.len() > 45 {
        return Err(security_denied("ip", "некорректная длина адреса"));
    }

    if value.chars().all(|character| {
        character.is_ascii_hexdigit() || character == ':' || character == '%'
    }) {
        return Ok(value.to_string());
    }

    Err(security_denied("ip", "адрес содержит недопустимые символы"))
}
