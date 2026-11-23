// Подключаем модули: once_cell::sync::Lazy;.
use once_cell::sync::Lazy;
// Подключаем модули: regex::Regex;.
use regex::Regex;

// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::security::security_denied;.
use crate::security::security_denied;

// Объявляем константу MAX_COMMAND_VALUE_LEN.
const MAX_COMMAND_VALUE_LEN: usize = 240;
// Объявляем константу MAX_DOMAIN_LEN.
const MAX_DOMAIN_LEN: usize = 253;
// Объявляем константу MAX_DOMAIN_LABEL_LEN.
const MAX_DOMAIN_LABEL_LEN: usize = 63;

// Объявляем константу SECRET_RE.
static SECRET_RE: Lazy<Option<Regex>> = Lazy::new(|| {
    // Выполняем операцию: Regex::new(.
    Regex::new(
        // Выполняем операцию: r"(?i)(privatekey|presharedkey|secret|password|passwd|t.
        r"(?i)(privatekey|presharedkey|secret|password|passwd|token|apikey|api_key)\s*=\s*\S+",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .ok().
    .ok()
    // Закрываем блок.
});

// Объявляем функцию ensure_cmd_safe_value.
pub fn ensure_cmd_safe_value(value: &str) -> AppResult<()> {
    // Проверяем условие: value.is_empty() {.
    if value.is_empty() {
        // Возвращаем результат из функции.
        return Err(security_denied("cmd-value", "пустое значение"));
        // Закрываем блок.
    }

    // Проверяем условие: value.chars().count() > MAX_COMMAND_VALUE_LEN {.
    if value.chars().count() > MAX_COMMAND_VALUE_LEN {
        // Возвращаем результат из функции.
        return Err(security_denied("cmd-value", "слишком длинное значение"));
        // Закрываем блок.
    }

    // Проверяем условие: value.contains('"') {.
    if value.contains('"') {
        // Возвращаем результат из функции.
        return Err(security_denied("cmd-value", "кавычки в значении"));
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for character in ['%', '!', '\n', '\r', '\0'] {
        // Проверяем условие: value.contains(character) {.
        if value.contains(character) {
            // Возвращаем результат из функции.
            return Err(security_denied(
                // Выполняем операцию: "cmd-value",.
                "cmd-value",
                // Выполняем операцию: "значение содержит символ, который cmd.exe расширяет ил.
                "значение содержит символ, который cmd.exe расширяет или обрезает",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию escape_for_cmd.
pub fn escape_for_cmd(value: &str) -> AppResult<String> {
    // Выполняем операцию: ensure_cmd_safe_value(value)?;.
    ensure_cmd_safe_value(value)?;

    // Выполняем операцию: Ok(format!("\"{}\"", value.replace('"', "\"\""))).
    Ok(format!("\"{}\"", value.replace('"', "\"\"")))
    // Закрываем блок.
}

// Объявляем функцию sanitize_log_message.
pub fn sanitize_log_message(message: &str) -> String {
    // Объявляем переменную redacted .
    let redacted = match SECRET_RE.as_ref() {
        // Выполняем операцию: Some(pattern) => pattern.replace_all(message, "$1 = [ск.
        Some(pattern) => pattern.replace_all(message, "$1 = [скрыто]").into_owned(),
        // Выполняем операцию: None => "[скрыто: фильтр секретов недоступен]".to_strin.
        None => "[скрыто: фильтр секретов недоступен]".to_string(),
        // Закрываем блок.
    };

    // Проверяем условие: redacted.chars().count() > 2000 {.
    if redacted.chars().count() > 2000 {
        // Объявляем переменную truncated .
        let mut truncated = redacted.chars().take(2000).collect::<String>();
        // Выполняем операцию: truncated.push('…');.
        truncated.push('…');
        // Возвращаем результат из функции.
        return truncated;
        // Закрываем блок.
    }

    // Выполняем операцию: redacted.
    redacted
    // Закрываем блок.
}

// Объявляем функцию validate_domain.
pub fn validate_domain(domain: &str) -> AppResult<String> {
    // Объявляем переменную trimmed .
    let trimmed = domain.trim();

    // Проверяем условие: trimmed.is_empty() || trimmed.len() > MAX_DOMAIN_L.
    if trimmed.is_empty() || trimmed.len() > MAX_DOMAIN_LEN {
        // Возвращаем результат из функции.
        return Err(security_denied("domain", "недопустимая длина домена"));
        // Закрываем блок.
    }

    // Объявляем переменную lowered .
    let lowered = trimmed.to_ascii_lowercase();

    // Проверяем условие: !lowered.contains('.') {.
    if !lowered.contains('.') {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "domain",.
            "domain",
            // Выполняем операцию: "домен должен содержать хотя бы одну точку",.
            "домен должен содержать хотя бы одну точку",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Проверяем условие: lowered.contains("..") || lowered.starts_with('.').
    if lowered.contains("..") || lowered.starts_with('.') || lowered.ends_with('.') {
        // Возвращаем результат из функции.
        return Err(security_denied(
            // Выполняем операцию: "domain",.
            "domain",
            // Выполняем операцию: "домен начинается или кончается точкой либо содержит пу.
            "домен начинается или кончается точкой либо содержит пустой ярлык",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Проверяем условие: !lowered.split('.').all(is_valid_domain_label) {.
    if !lowered.split('.').all(is_valid_domain_label) {
        // Возвращаем результат из функции.
        return Err(security_denied("domain", "домен не соответствует шаблону"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(lowered).
    Ok(lowered)
    // Закрываем блок.
}

/// Порт адресата обхода: те же правила, что в `constants::MIN_PORT`
/// и в интерфейсе (`lib/validators.ts`).
// Объявляем функцию validate_port.
pub fn validate_port(port: u16) -> AppResult<u16> {
    // Проверяем условие: port < crate::constants::MIN_PORT {.
    if port < crate::constants::MIN_PORT {
        // Возвращаем результат из функции.
        return Err(security_denied("port", "недопустимый порт"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(port).
    Ok(port)
    // Закрываем блок.
}

// Объявляем функцию validate_ip.
pub fn validate_ip(value: &str) -> AppResult<String> {
    // Объявляем переменную trimmed .
    let trimmed = value.trim();

    // Проверяем условие: trimmed.contains(':') {.
    if trimmed.contains(':') {
        // Возвращаем результат из функции.
        return validate_ipv6(trimmed);
        // Закрываем блок.
    }

    // Выполняем операцию: validate_ipv4(trimmed).
    validate_ipv4(trimmed)
    // Закрываем блок.
}

// Объявляем функцию validate_ip_range.
pub fn validate_ip_range(value: &str) -> AppResult<String> {
    // Объявляем переменную trimmed .
    let trimmed = value.trim();

    // Объявляем переменную Some((address, prefix)) .
    let Some((address, prefix)) = trimmed.split_once('/') else {
        // Выполняем операцию: validate_ip(trimmed)?;.
        validate_ip(trimmed)?;

        // Возвращаем результат из функции.
        return Err(security_denied("ip-range", "нет префикса /маски"));
        // Закрываем блок.
    };

    // Объявляем переменную ipv6 .
    let ipv6 = address.contains(':');
    // Выполняем операцию: validate_ip(address)?;.
    validate_ip(address)?;

    // Объявляем переменную length.
    let length: u8 = prefix
        // Выполняем операцию: .parse().
        .parse()
        // Выполняем операцию: .map_err(|_| security_denied("ip-range", "некорректная .
        .map_err(|_| security_denied("ip-range", "некорректная маска"))?;

    // Объявляем переменную max .
    let max = if ipv6 { 128 } else { 32 };

    // Проверяем условие: length > max {.
    if length > max {
        // Возвращаем результат из функции.
        return Err(security_denied("ip-range", "маска длиннее адреса"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(trimmed.to_string()).
    Ok(trimmed.to_string())
    // Закрываем блок.
}

// Объявляем функцию is_valid_domain_label.
fn is_valid_domain_label(label: &str) -> bool {
    // Проверяем условие: label.is_empty() || label.len() > MAX_DOMAIN_LABEL.
    if label.is_empty() || label.len() > MAX_DOMAIN_LABEL_LEN {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = label.as_bytes();

    // Проверяем условие: bytes[0] == b'-' || bytes[bytes.len() - 1] == b'-'.
    if bytes[0] == b'-' || bytes[bytes.len() - 1] == b'-' {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: bytes.
    bytes
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_.
        .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'-')
    // Закрываем блок.
}

// Объявляем функцию validate_ipv4.
fn validate_ipv4(value: &str) -> AppResult<String> {
    // Объявляем переменную parts.
    let parts: Vec<&str> = value.split('.').collect();

    // Проверяем условие: parts.len() != 4 {.
    if parts.len() != 4 {
        // Возвращаем результат из функции.
        return Err(security_denied("ip", "нужно четыре октета"));
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for part in parts {
        // Проверяем условие: part.is_empty() || part.len() > 3 || !part.bytes().
        if part.is_empty() || part.len() > 3 || !part.bytes().all(|byte| byte.is_ascii_digit()) {
            // Возвращаем результат из функции.
            return Err(security_denied("ip", "окет содержит не цифры"));
            // Закрываем блок.
        }

        // Объявляем переменную octet.
        let octet: u16 = part
            // Выполняем операцию: .parse().
            .parse()
            // Выполняем операцию: .map_err(|_| security_denied("ip", "некорректный октет".
            .map_err(|_| security_denied("ip", "некорректный октет"))?;

        // Проверяем условие: octet > 255 {.
        if octet > 255 {
            // Возвращаем результат из функции.
            return Err(security_denied("ip", "октет больше 255"));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(value.to_string()).
    Ok(value.to_string())
    // Закрываем блок.
}

// Объявляем функцию validate_ipv6.
fn validate_ipv6(value: &str) -> AppResult<String> {
    // Проверяем условие: value.len() < 3 || value.len() > 45 {.
    if value.len() < 3 || value.len() > 45 {
        // Возвращаем результат из функции.
        return Err(security_denied("ip", "некорректная длина адреса"));
        // Закрываем блок.
    }

    // Проверяем условие: value.
    if value
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .all(|character| character.is_ascii_hexdigit() || chara.
        .all(|character| character.is_ascii_hexdigit() || character == ':' || character == '%')
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return Ok(value.to_string());
        // Закрываем блок.
    }

    // Выполняем операцию: Err(security_denied("ip", "адрес содержит недопустимые .
    Err(security_denied("ip", "адрес содержит недопустимые символы"))
    // Закрываем блок.
}
