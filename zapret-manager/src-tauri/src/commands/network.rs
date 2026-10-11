use std::time::{Duration, Instant};

use serde::{Deserialize, Serialize};
use tokio::net::TcpStream;

use crate::error::{AppError, AppResult};

const PING_TIMEOUT: Duration = Duration::from_secs(2);
const HTTP_TIMEOUT: Duration = Duration::from_secs(5);
const PING_PORT: u16 = 443;

const PROVIDER_PRIMARY: &str = "https://ipwho.is/";
const PROVIDER_SECONDARY: &str = "https://freeipapi.com/api/json";
const PROVIDER_FALLBACK: &str = "https://ipapi.co/json/";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PingResult {
    pub host: String,
    pub latency_ms: Option<u64>,
    pub success: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInfo {
    pub ip: String,
    pub country: String,
    pub country_code: String,
    pub city: String,
    pub isp: String,
}

#[derive(Debug, Deserialize)]
struct PrimaryPayload {
    success: bool,
    ip: Option<String>,
    country: Option<String>,
    country_code: Option<String>,
    city: Option<String>,
    #[serde(default)]
    connection: Option<ConnectionPayload>,
}

#[derive(Debug, Deserialize)]
struct ConnectionPayload {
    isp: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SecondaryPayload {
    #[serde(rename = "ipAddress")]
    ip_address: Option<String>,
    #[serde(rename = "countryName")]
    country_name: Option<String>,
    #[serde(rename = "countryCode")]
    country_code: Option<String>,
    #[serde(rename = "cityName")]
    city_name: Option<String>,
    #[serde(default, rename = "asnOrganization")]
    asn_organization: Option<String>,
}

#[derive(Debug, Deserialize)]
struct FallbackPayload {
    ip: Option<String>,
    country_name: Option<String>,
    country_code: Option<String>,
    city: Option<String>,
    org: Option<String>,
}

pub async fn measure(host: &str) -> PingResult {
    let started = Instant::now();

    let connected = tokio::time::timeout(
        PING_TIMEOUT,
        TcpStream::connect((host, PING_PORT)),
    )
    .await
    .ok()
    .map(|result| result.is_ok())
    .unwrap_or(false);

    let latency_ms = connected.then(|| started.elapsed().as_millis() as u64);

    PingResult {
        host: host.to_string(),
        latency_ms,
        success: connected,
    }
}

#[tauri::command]
pub async fn ping_hosts(hosts: Vec<String>) -> Vec<PingResult> {
    let mut set = tokio::task::JoinSet::new();

    for host in &hosts {
        let target = host.clone();
        set.spawn(async move { measure(&target).await });
    }

    let mut results = Vec::new();

    while let Some(joined) = set.join_next().await {
        if let Ok(result) = joined {
            results.push(result);
        }
    }

    results
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointPingResult {
    pub endpoint: String,
    pub latency_ms: Option<u64>,
    pub success: bool,
}

pub async fn measure_endpoint(endpoint: &str, port: u16) -> EndpointPingResult {
    let started = Instant::now();
    let connected = tokio::time::timeout(
        PING_TIMEOUT,
        TcpStream::connect((endpoint, port)),
    )
    .await
    .ok()
    .map(|result| result.is_ok())
    .unwrap_or(false);

    EndpointPingResult {
        endpoint: endpoint.to_string(),
        latency_ms: connected.then(|| started.elapsed().as_millis() as u64),
        success: connected,
    }
}

#[tauri::command]
pub async fn ping_endpoints(
    endpoints: Vec<EndpointInput>,
) -> Vec<EndpointPingResult> {
    let mut set = tokio::task::JoinSet::new();

    for item in &endpoints {
        let host = item.host.clone();
        let port = item.port;
        set.spawn(async move { measure_endpoint(&host, port).await });
    }

    let mut results = Vec::new();

    while let Some(joined) = set.join_next().await {
        if let Ok(result) = joined {
            results.push(result);
        }
    }

    results
}

#[derive(Debug, Clone, Deserialize)]
pub struct EndpointInput {
    pub host: String,
    pub port: u16,
}

fn from_primary(payload: PrimaryPayload) -> Option<NetworkInfo> {
    if !payload.success {
        return None;
    }

    let ip = payload.ip?;
    let isp = payload
        .connection
        .and_then(|connection| connection.isp)
        .unwrap_or_default();

    Some(NetworkInfo {
        ip,
        country: payload.country.unwrap_or_default(),
        country_code: payload.country_code.unwrap_or_default(),
        city: payload.city.unwrap_or_default(),
        isp,
    })
}

fn from_fallback(payload: FallbackPayload) -> Option<NetworkInfo> {
    let ip = payload.ip?;

    Some(NetworkInfo {
        ip,
        country: payload.country_name.unwrap_or_default(),
        country_code: payload.country_code.unwrap_or_default(),
        city: payload.city.unwrap_or_default(),
        isp: payload.org.unwrap_or_default(),
    })
}

pub fn parse_primary(raw: &str) -> Option<NetworkInfo> {
    from_primary(serde_json::from_str(raw).ok()?)
}

pub fn parse_secondary(raw: &str) -> Option<NetworkInfo> {
    let payload: SecondaryPayload = serde_json::from_str(raw).ok()?;
    let ip = payload.ip_address?;

    Some(NetworkInfo {
        ip,
        country: payload.country_name.unwrap_or_default(),
        country_code: payload.country_code.unwrap_or_default(),
        city: payload.city_name.unwrap_or_default(),
        isp: payload.asn_organization.unwrap_or_default(),
    })
}

pub fn parse_fallback(raw: &str) -> Option<NetworkInfo> {
    from_fallback(serde_json::from_str(raw).ok()?)
}

async fn client() -> AppResult<reqwest::Client> {
    reqwest::Client::builder()
        .timeout(HTTP_TIMEOUT)
        .user_agent("ZapretManager/0.1")
        .build()
        .map_err(|error| AppError::custom(format!("Не удалось создать HTTP-клиент: {error}")))
}

#[tauri::command]
pub async fn fetch_network_info() -> AppResult<NetworkInfo> {
    let http = client().await?;

    let mut failures: Vec<String> = Vec::new();

    for (url, parser) in [
        (PROVIDER_PRIMARY, parse_primary as fn(&str) -> Option<NetworkInfo>),
        (PROVIDER_SECONDARY, parse_secondary),
        (PROVIDER_FALLBACK, parse_fallback),
    ] {
        match http.get(url).send().await {
            Ok(response) => match response.text().await {
                Ok(body) => {
                    if let Some(info) = parser(&body) {
                        return Ok(info);
                    }

                    failures.push(format!("{url}: неожиданный формат ответа"));
                }
                Err(error) => failures.push(format!("{url}: пустой ответ ({error})")),
            },
            Err(error) => failures.push(format!("{url}: {error}")),
        }
    }

    Err(AppError::custom(format!(
        "Не удалось определить данные о подключении: {}",
        failures.join("; ")
    )))
}

#[cfg(test)]
#[path = "network_tests.rs"]
mod tests;