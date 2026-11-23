// Подключаем модули: std::time::{Duration, Instant};.
use std::time::{Duration, Instant};

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};
// Подключаем модули: tokio::net::TcpStream;.
use tokio::net::TcpStream;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::url_validator::{is_public_ip, normaliz.
use crate::security::url_validator::{is_public_ip, normalize_public_host};

// Объявляем константу PING_TIMEOUT.
const PING_TIMEOUT: Duration = Duration::from_millis(1500);
// Объявляем константу HTTP_TIMEOUT.
const HTTP_TIMEOUT: Duration = Duration::from_secs(5);
// Объявляем константу PING_PORT.
const PING_PORT: u16 = 443;
// Объявляем константу MAX_PING_HOSTS.
const MAX_PING_HOSTS: usize = 32;

// Объявляем константу PROVIDER_PRIMARY.
const PROVIDER_PRIMARY: &str = "https://ipwho.is/";
// Объявляем константу PROVIDER_SECONDARY.
const PROVIDER_SECONDARY: &str = "https://freeipapi.com/api/json";
// Объявляем константу PROVIDER_FALLBACK.
const PROVIDER_FALLBACK: &str = "https://ipapi.co/json/";

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру PingResult.
pub struct PingResult {
    // Выполняем операцию: pub host: String,.
    pub host: String,
    // Выполняем операцию: pub latency_ms: Option<u64>,.
    pub latency_ms: Option<u64>,
    // Выполняем операцию: pub success: bool,.
    pub success: bool,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру NetworkInfo.
pub struct NetworkInfo {
    // Выполняем операцию: pub ip: String,.
    pub ip: String,
    // Выполняем операцию: pub country: String,.
    pub country: String,
    // Выполняем операцию: pub country_code: String,.
    pub country_code: String,
    // Выполняем операцию: pub city: String,.
    pub city: String,
    // Выполняем операцию: pub isp: String,.
    pub isp: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Deserialize)]
// Объявляем структуру PrimaryPayload.
struct PrimaryPayload {
    // Выполняем операцию: success: bool,.
    success: bool,
    // Выполняем операцию: ip: Option<String>,.
    ip: Option<String>,
    // Выполняем операцию: country: Option<String>,.
    country: Option<String>,
    // Выполняем операцию: country_code: Option<String>,.
    country_code: Option<String>,
    // Выполняем операцию: city: Option<String>,.
    city: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: connection: Option<ConnectionPayload>,.
    connection: Option<ConnectionPayload>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Deserialize)]
// Объявляем структуру ConnectionPayload.
struct ConnectionPayload {
    // Выполняем операцию: isp: Option<String>,.
    isp: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Deserialize)]
// Объявляем структуру SecondaryPayload.
struct SecondaryPayload {
    // Применяем атрибут к следующему объявлению.
    #[serde(rename = "ipAddress")]
    // Выполняем операцию: ip_address: Option<String>,.
    ip_address: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(rename = "countryName")]
    // Выполняем операцию: country_name: Option<String>,.
    country_name: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(rename = "countryCode")]
    // Выполняем операцию: country_code: Option<String>,.
    country_code: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(rename = "cityName")]
    // Выполняем операцию: city_name: Option<String>,.
    city_name: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default, rename = "asnOrganization")]
    // Выполняем операцию: asn_organization: Option<String>,.
    asn_organization: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Deserialize)]
// Объявляем структуру FallbackPayload.
struct FallbackPayload {
    // Выполняем операцию: ip: Option<String>,.
    ip: Option<String>,
    // Выполняем операцию: country_name: Option<String>,.
    country_name: Option<String>,
    // Выполняем операцию: country_code: Option<String>,.
    country_code: Option<String>,
    // Выполняем операцию: city: Option<String>,.
    city: Option<String>,
    // Выполняем операцию: org: Option<String>,.
    org: Option<String>,
    // Закрываем блок.
}

// Выполняем операцию: pub async fn measure(host: &str) -> PingResult {.
pub async fn measure(host: &str) -> PingResult {
    // Объявляем переменную started .
    let started = Instant::now();
    // Объявляем переменную raw .
    let raw = host.trim().to_string();

    // Объявляем переменную Some(target) .
    let Some(target) = normalize_public_host(host) else {
        // Возвращаем результат из функции.
        return PingResult {
            // Выполняем операцию: host: raw,.
            host: raw,
            // Выполняем операцию: latency_ms: None,.
            latency_ms: None,
            // Выполняем операцию: success: false,.
            success: false,
            // Закрываем блок.
        };
        // Закрываем блок.
    };

    // Соединяемся по уже проверенному IP, а не по имени: иначе DNS
    // может ответить публичным адресом, а при повторном запросе — локальным.
    // Объявляем переменную addresses .
    let addresses = match tokio::net::lookup_host((target.as_str(), PING_PORT)).await {
        // Выполняем операцию: Ok(addresses) => addresses.collect::<Vec<_>>(),.
        Ok(addresses) => addresses.collect::<Vec<_>>(),
        // Выполняем операцию: Err(_) => Vec::new(),.
        Err(_) => Vec::new(),
        // Закрываем блок.
    };

    // Проверяем условие: addresses.is_empty() || addresses.iter().any(|addr.
    if addresses.is_empty() || addresses.iter().any(|address| !is_public_ip(address.ip())) {
        // Возвращаем результат из функции.
        return PingResult {
            // Выполняем операцию: host: raw,.
            host: raw,
            // Выполняем операцию: latency_ms: None,.
            latency_ms: None,
            // Выполняем операцию: success: false,.
            success: false,
            // Закрываем блок.
        };
        // Закрываем блок.
    }

    // Объявляем переменную connected .
    let connected = tokio::time::timeout(PING_TIMEOUT, TcpStream::connect(addresses[0]))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .ok().
        .ok()
        // Выполняем операцию: .map(|result| result.is_ok()).
        .map(|result| result.is_ok())
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Объявляем переменную latency_ms .
    let latency_ms = connected.then(|| started.elapsed().as_millis() as u64);

    // Выполняем операцию: PingResult {.
    PingResult {
        // Выполняем операцию: host: raw,.
        host: raw,
        // Выполняем операцию: latency_ms,.
        latency_ms,
        // Выполняем операцию: success: connected,.
        success: connected,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn ping_hosts(hosts: Vec<String>) -> Vec<Ping.
pub async fn ping_hosts(hosts: Vec<String>) -> Vec<PingResult> {
    // Объявляем переменную set .
    let mut set = tokio::task::JoinSet::new();

    // Перебираем элементы коллекции.
    for host in hosts.iter().take(MAX_PING_HOSTS) {
        // Объявляем переменную target .
        let target = host.clone();
        // Выполняем операцию: set.spawn(async move { measure(&target).await });.
        set.spawn(async move { measure(&target).await });
        // Закрываем блок.
    }

    // Объявляем переменную results .
    let mut results = Vec::new();

    // Повторяем, пока выполняется условие.
    while let Some(joined) = set.join_next().await {
        // Проверяем условие: let Ok(result) = joined {.
        if let Ok(result) = joined {
            // Выполняем операцию: results.push(result);.
            results.push(result);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: results.
    results
    // Закрываем блок.
}

// Объявляем функцию from_primary.
fn from_primary(payload: PrimaryPayload) -> Option<NetworkInfo> {
    // Проверяем условие: !payload.success {.
    if !payload.success {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную ip .
    let ip = payload.ip?;
    // Объявляем переменную isp .
    let isp = payload
        // Выполняем операцию: .connection.
        .connection
        // Выполняем операцию: .and_then(|connection| connection.isp).
        .and_then(|connection| connection.isp)
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: Some(NetworkInfo {.
    Some(NetworkInfo {
        // Выполняем операцию: ip,.
        ip,
        // Выполняем операцию: country: payload.country.unwrap_or_default(),.
        country: payload.country.unwrap_or_default(),
        // Выполняем операцию: country_code: payload.country_code.unwrap_or_default(),.
        country_code: payload.country_code.unwrap_or_default(),
        // Выполняем операцию: city: payload.city.unwrap_or_default(),.
        city: payload.city.unwrap_or_default(),
        // Выполняем операцию: isp,.
        isp,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию from_fallback.
fn from_fallback(payload: FallbackPayload) -> Option<NetworkInfo> {
    // Объявляем переменную ip .
    let ip = payload.ip?;

    // Выполняем операцию: Some(NetworkInfo {.
    Some(NetworkInfo {
        // Выполняем операцию: ip,.
        ip,
        // Выполняем операцию: country: payload.country_name.unwrap_or_default(),.
        country: payload.country_name.unwrap_or_default(),
        // Выполняем операцию: country_code: payload.country_code.unwrap_or_default(),.
        country_code: payload.country_code.unwrap_or_default(),
        // Выполняем операцию: city: payload.city.unwrap_or_default(),.
        city: payload.city.unwrap_or_default(),
        // Выполняем операцию: isp: payload.org.unwrap_or_default(),.
        isp: payload.org.unwrap_or_default(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию parse_primary.
pub fn parse_primary(raw: &str) -> Option<NetworkInfo> {
    // Выполняем операцию: from_primary(serde_json::from_str(raw).ok()?).
    from_primary(serde_json::from_str(raw).ok()?)
    // Закрываем блок.
}

// Объявляем функцию parse_secondary.
pub fn parse_secondary(raw: &str) -> Option<NetworkInfo> {
    // Объявляем переменную payload.
    let payload: SecondaryPayload = serde_json::from_str(raw).ok()?;
    // Объявляем переменную ip .
    let ip = payload.ip_address?;

    // Выполняем операцию: Some(NetworkInfo {.
    Some(NetworkInfo {
        // Выполняем операцию: ip,.
        ip,
        // Выполняем операцию: country: payload.country_name.unwrap_or_default(),.
        country: payload.country_name.unwrap_or_default(),
        // Выполняем операцию: country_code: payload.country_code.unwrap_or_default(),.
        country_code: payload.country_code.unwrap_or_default(),
        // Выполняем операцию: city: payload.city_name.unwrap_or_default(),.
        city: payload.city_name.unwrap_or_default(),
        // Выполняем операцию: isp: payload.asn_organization.unwrap_or_default(),.
        isp: payload.asn_organization.unwrap_or_default(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию parse_fallback.
pub fn parse_fallback(raw: &str) -> Option<NetworkInfo> {
    // Выполняем операцию: from_fallback(serde_json::from_str(raw).ok()?).
    from_fallback(serde_json::from_str(raw).ok()?)
    // Закрываем блок.
}

// Объявляем функцию client.
async fn client() -> AppResult<reqwest::Client> {
    // Выполняем операцию: reqwest::Client::builder().
    reqwest::Client::builder()
        // Выполняем операцию: .timeout(HTTP_TIMEOUT).
        .timeout(HTTP_TIMEOUT)
        // Выполняем операцию: .user_agent("ZapretManager/0.1").
        .user_agent("ZapretManager/0.1")
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не удалось с.
        .map_err(|error| AppError::custom(format!("Не удалось создать HTTP-клиент: {error}")))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn fetch_network_info() -> AppResult<NetworkI.
pub async fn fetch_network_info() -> AppResult<NetworkInfo> {
    // Объявляем переменную http .
    let http = client().await?;

    // Объявляем переменную failures.
    let mut failures: Vec<String> = Vec::new();

    // Перебираем элементы коллекции.
    for (url, parser) in [
        // Выполняем операцию: (.
        (
            // Выполняем операцию: PROVIDER_PRIMARY,.
            PROVIDER_PRIMARY,
            // Выполняем операцию: parse_primary as fn(&str) -> Option<NetworkInfo>,.
            parse_primary as fn(&str) -> Option<NetworkInfo>,
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: (PROVIDER_SECONDARY, parse_secondary),.
        (PROVIDER_SECONDARY, parse_secondary),
        // Выполняем операцию: (PROVIDER_FALLBACK, parse_fallback),.
        (PROVIDER_FALLBACK, parse_fallback),
        // Выполняем операцию: ] {.
    ] {
        // Выбираем вариант по значению.
        match http.get(url).send().await {
            // Выполняем операцию: Ok(response) => match response.text().await {.
            Ok(response) => match response.text().await {
                // Выполняем операцию: Ok(body) => {.
                Ok(body) => {
                    // Проверяем условие: let Some(info) = parser(&body) {.
                    if let Some(info) = parser(&body) {
                        // Возвращаем результат из функции.
                        return Ok(info);
                        // Закрываем блок.
                    }

                    // Выполняем операцию: failures.push(format!("{url}: неожиданный формат ответа.
                    failures.push(format!("{url}: неожиданный формат ответа"));
                    // Закрываем блок.
                }
                // Выполняем операцию: Err(error) => failures.push(format!("{url}: пустой отве.
                Err(error) => failures.push(format!("{url}: пустой ответ ({error})")),
                // Закрываем блок.
            },
            // Выполняем операцию: Err(error) => failures.push(format!("{url}: {error}")),.
            Err(error) => failures.push(format!("{url}: {error}")),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Err(AppError::custom(format!(.
    Err(AppError::custom(format!(
        // Выполняем операцию: "Не удалось определить данные о подключении: {}",.
        "Не удалось определить данные о подключении: {}",
        // Выполняем операцию: failures.join("; ").
        failures.join("; ") // Закрываем выражение или коллекцию.
    )))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "network_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
