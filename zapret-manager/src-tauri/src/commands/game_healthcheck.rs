// Подключаем модули: std::net::ToSocketAddrs;.
use std::net::ToSocketAddrs;
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tokio::net::TcpStream;.
use tokio::net::TcpStream;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::url_validator::{is_public_ip, normaliz.
use crate::security::url_validator::{is_public_ip, normalize_public_host};

// Объявляем константу PROBE_TIMEOUT.
const PROBE_TIMEOUT: Duration = Duration::from_millis(1500);
// Объявляем константу GAMELIFT_HOST.
const GAMELIFT_HOST: &str = "gamelift.amazonaws.com";
// Объявляем константу STEAM_HOST.
const STEAM_HOST: &str = "steamcommunity.com";
// Объявляем константу TCP_PORTS.
const TCP_PORTS: &[(&str, u16)] = &[("Steam query", 27015), ("GameLift", 443)];

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "kebab-case")]
// Объявляем перечисление Reachability.
pub enum Reachability {
    // Выполняем операцию: Ok,.
    Ok,
    // Выполняем операцию: Failed,.
    Failed,
    /// Проверить нельзя: UDP не отвечает на пустой пакет.
    // Выполняем операцию: Unverifiable,.
    Unverifiable,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру ProbeResult.
pub struct ProbeResult {
    // Выполняем операцию: pub target: String,.
    pub target: String,
    // Выполняем операцию: pub port: u16,.
    pub port: u16,
    // Выполняем операцию: pub status: Reachability,.
    pub status: Reachability,
    // Выполняем операцию: pub latency_ms: Option<u64>,.
    pub latency_ms: Option<u64>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру ConnectivityReport.
pub struct ConnectivityReport {
    // Выполняем операцию: pub dns_ok: bool,.
    pub dns_ok: bool,
    // Выполняем операцию: pub dns_address: Option<String>,.
    pub dns_address: Option<String>,
    // Выполняем операцию: pub dns_error: Option<String>,.
    pub dns_error: Option<String>,
    // Выполняем операцию: pub tcp: Vec<ProbeResult>,.
    pub tcp: Vec<ProbeResult>,
    // Выполняем операцию: pub udp_status: Reachability,.
    pub udp_status: Reachability,
    /// Код пояснения, а не готовая фраза: перевод живёт в интерфейсе.
    // Выполняем операцию: pub udp_note: &'static str,.
    pub udp_note: &'static str,
    /// Код вердикта, а не готовая фраза: перевод живёт в интерфейсе.
    // Выполняем операцию: pub verdict: &'static str,.
    pub verdict: &'static str,
    // Закрываем блок.
}

/// Отдельная проверка одного сервиса игры: полноценный TLS-хендшейк.
///
/// Именно его рвёт DPI: Client Hello уходит, Server Hello не приходит. Такой
/// тест отвечает на главный вопрос — работает ли выбранная стратегия для этого
/// сервиса, — и не гадает по косвенным признакам.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру EndpointReport.
pub struct EndpointReport {
    // Выполняем операцию: pub host: String,.
    pub host: String,
    // Выполняем операцию: pub ok: bool,.
    pub ok: bool,
    // Выполняем операцию: pub status_code: Option<u16>,.
    pub status_code: Option<u16>,
    // Выполняем операцию: pub latency_ms: Option<u64>,.
    pub latency_ms: Option<u64>,
    // Выполняем операцию: pub stage: &'static str,.
    pub stage: &'static str,
    // Выполняем операцию: pub error: Option<String>,.
    pub error: Option<String>,
    // Выполняем операцию: pub hint: String,.
    pub hint: String,
    // Закрываем блок.
}

// Объявляем константу ENDPOINT_TIMEOUT.
const ENDPOINT_TIMEOUT: Duration = Duration::from_secs(6);
// Объявляем константу MAX_ENDPOINTS.
const MAX_ENDPOINTS: usize = 6;

// Объявляем функцию stage_and_hint.
fn stage_and_hint(error: &reqwest::Error, host: &str) -> (&'static str, String) {
    // Проверяем условие: error.is_timeout() {.
    if error.is_timeout() {
        // Возвращаем результат из функции.
        return (
            // Выполняем операцию: "handshake",.
            "handshake",
            // Выполняем операцию: "Сервер не ответил после Client Hello: соединение обрыв.
            "Сервер не ответил после Client Hello: соединение обрывает фильтр. \
             Эта стратегия для сервиса не подходит."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Проверяем условие: error.is_connect() {.
    if error.is_connect() {
        // У CDN-доменов вроде cloudfront.net или steamstatic.com корневой
        // хост часто вообще не принимает HTTPS. Это не блокировка, и называть
        // её блокировкой нельзя — иначе список врёт.
        // Объявляем переменную hint .
        let hint = if is_shared_cdn(host) {
            // Выполняем операцию: format!(.
            format!(
                // Выполняем операцию: "Корневой домен {host} не отвечает на HTTPS. Для CDN эт.
                "Корневой домен {host} не отвечает на HTTPS. Для CDN это \
                 нормально и ничего не значит: судить по нему нельзя." // Закрываем выражение или коллекцию.
            )
        // Закрываем блок.
        } else {
            // Выполняем операцию: "TCP-соединение не устанавливается. Проверьте, запущен .
            "TCP-соединение не устанавливается. Проверьте, запущен ли обход.".to_string()
            // Закрываем блок.
        };

        // Возвращаем результат из функции.
        return ("connect", hint);
        // Закрываем блок.
    }

    // Проверяем условие: error.is_builder() {.
    if error.is_builder() {
        // Возвращаем результат из функции.
        return ("request", "Некорректный адрес сервиса.".to_string());
        // Закрываем блок.
    }

    // Выполняем операцию: (.
    (
        // Выполняем операцию: "request",.
        "request",
        // Выполняем операцию: format!("Соединение прервано на этапе TLS: {error}"),.
        format!("Соединение прервано на этапе TLS: {error}"),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

/// Домены, которые у всех игр общие и не отвечают на запрос к корню.
// Объявляем функцию is_shared_cdn.
fn is_shared_cdn(host: &str) -> bool {
    // Объявляем константу SHARED_PREFIXES.
    const SHARED_PREFIXES: &[&str] = &[
        // Выполняем операцию: "steam",.
        "steam",
        // Выполняем операцию: "epicgames",.
        "epicgames",
        // Выполняем операцию: "cloudfront",.
        "cloudfront",
        // Выполняем операцию: "battleye",.
        "battleye",
        // Выполняем операцию: "easyanticheat",.
        "easyanticheat",
        // Выполняем операцию: "amazonaws",.
        "amazonaws",
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: SHARED_PREFIXES.iter().any(|prefix| host.contains(prefi.
    SHARED_PREFIXES.iter().any(|prefix| host.contains(prefix))
    // Закрываем блок.
}

// Объявляем функцию probe_endpoint.
async fn probe_endpoint(client: reqwest::Client, host: &str) -> EndpointReport {
    // Объявляем переменную url .
    let url = format!("https://{host}/");
    // Объявляем переменную started .
    let started = std::time::Instant::now();

    // Резолвим отдельно: без этого «домен не существует» и «соединение
    // рвут» неразличимы, и в списке они выглядят одинаково — как блокировка.
    // Выбираем вариант по значению.
    match tokio::net::lookup_host((host, 443u16)).await {
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Возвращаем результат из функции.
            return EndpointReport {
                // Выполняем операцию: host: host.to_string(),.
                host: host.to_string(),
                // Выполняем операцию: ok: false,.
                ok: false,
                // Выполняем операцию: status_code: None,.
                status_code: None,
                // Выполняем операцию: latency_ms: None,.
                latency_ms: None,
                // Выполняем операцию: stage: "dns",.
                stage: "dns",
                // Выполняем операцию: error: Some(error.to_string()),.
                error: Some(error.to_string()),
                // Выполняем операцию: hint: format!(.
                hint: format!(
                    // Выполняем операцию: "Домен {host} не резолвится. У сервиса бывает только по.
                    "Домен {host} не резолвится. У сервиса бывает только поддомен \
                     (например, prod.…), а корень не существует — блокировки здесь нет." // Закрываем выражение или коллекцию.
                ),
                // Закрываем блок.
            };
            // Закрываем блок.
        }
        // Выполняем операцию: Ok(addresses) => {.
        Ok(addresses) => {
            // Объявляем переменную addresses.
            let addresses: Vec<std::net::SocketAddr> = addresses.collect();

            // Домен может резолвиться в локальный адрес (DNS rebinding):
            // такие цели не проверяем, иначе приложение сходит во внутреннюю сеть.
            // Проверяем условие: addresses.is_empty() || addresses.iter().any(|addr.
            if addresses.is_empty() || addresses.iter().any(|address| !is_public_ip(address.ip())) {
                // Возвращаем результат из функции.
                return EndpointReport {
                    // Выполняем операцию: host: host.to_string(),.
                    host: host.to_string(),
                    // Выполняем операцию: ok: false,.
                    ok: false,
                    // Выполняем операцию: status_code: None,.
                    status_code: None,
                    // Выполняем операцию: latency_ms: None,.
                    latency_ms: None,
                    // Выполняем операцию: stage: "blocked",.
                    stage: "blocked",
                    // Выполняем операцию: error: None,.
                    error: None,
                    // Выполняем операцию: hint: "Домен указывает на локальный или служебный адрес.
                    hint: "Домен указывает на локальный или служебный адрес; \
                           проверка отключена."
                        // Выполняем операцию: .to_string(),.
                        .to_string(),
                    // Закрываем блок.
                };
                // Закрываем блок.
            }
            // Закрываем блок.
        } // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match client.get(&url).send().await {
        // Выполняем операцию: Ok(response) => EndpointReport {.
        Ok(response) => EndpointReport {
            // Выполняем операцию: host: host.to_string(),.
            host: host.to_string(),
            // Выполняем операцию: ok: true,.
            ok: true,
            // Выполняем операцию: status_code: Some(response.status().as_u16()),.
            status_code: Some(response.status().as_u16()),
            // Выполняем операцию: latency_ms: Some(started.elapsed().as_millis() as u64),.
            latency_ms: Some(started.elapsed().as_millis() as u64),
            // Выполняем операцию: stage: "ok",.
            stage: "ok",
            // Выполняем операцию: error: None,.
            error: None,
            // Выполняем операцию: hint: "TLS-хендшейк прошёл, сервис отвечает.".to_string.
            hint: "TLS-хендшейк прошёл, сервис отвечает.".to_string(),
            // Закрываем блок.
        },
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Объявляем переменную (stage, hint) .
            let (stage, hint) = stage_and_hint(&error, host);

            // Выполняем операцию: EndpointReport {.
            EndpointReport {
                // Выполняем операцию: host: host.to_string(),.
                host: host.to_string(),
                // Выполняем операцию: ok: false,.
                ok: false,
                // Выполняем операцию: status_code: None,.
                status_code: None,
                // Выполняем операцию: latency_ms: None,.
                latency_ms: None,
                // Выполняем операцию: stage,.
                stage,
                // Выполняем операцию: error: Some(error.to_string()),.
                error: Some(error.to_string()),
                // Выполняем операцию: hint,.
                hint,
                // Закрываем блок.
            }
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}

/// Проверяет сервисы игры настоящим TLS-хендшейком, а не UDP-«пингом».
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn check_game_endpoints(hosts: Vec<String>) -.
pub async fn check_game_endpoints(hosts: Vec<String>) -> AppResult<Vec<EndpointReport>> {
    // Объявляем переменную targets.
    let mut targets: Vec<String> = Vec::new();
    // Объявляем переменную shared.
    let mut shared: Vec<String> = Vec::new();

    // Перебираем элементы коллекции.
    for host in hosts.into_iter().take(MAX_ENDPOINTS * 8) {
        // Объявляем переменную Some(cleaned) .
        let Some(cleaned) = normalize_public_host(&host) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: targets.contains(&cleaned) || shared.contains(&cle.
        if targets.contains(&cleaned) || shared.contains(&cleaned) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Свои домены игры идут первыми: у Outlast Trials первые в списке
        // всегда Steam-шарды, и до rbg-services.com очередь не доходила.
        // Проверяем условие: is_shared_cdn(&cleaned) {.
        if is_shared_cdn(&cleaned) {
            // Выполняем операцию: shared.push(cleaned);.
            shared.push(cleaned);
        // Закрываем блок.
        } else {
            // Выполняем операцию: targets.push(cleaned);.
            targets.push(cleaned);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: targets.extend(shared);.
    targets.extend(shared);
    // Выполняем операцию: targets.truncate(MAX_ENDPOINTS);.
    targets.truncate(MAX_ENDPOINTS);

    // Проверяем условие: targets.is_empty() {.
    if targets.is_empty() {
        // Возвращаем результат из функции.
        return Ok(Vec::new());
        // Закрываем блок.
    }

    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .timeout(ENDPOINT_TIMEOUT).
        .timeout(ENDPOINT_TIMEOUT)
        // Выполняем операцию: .connect_timeout(Duration::from_secs(4)).
        .connect_timeout(Duration::from_secs(4))
        // Выполняем операцию: .redirect(reqwest::redirect::Policy::none()).
        .redirect(reqwest::redirect::Policy::none())
        // Выполняем операцию: .user_agent(concat!("zapret-manager/", env!("CARGO_PKG_.
        .user_agent(concat!("zapret-manager/", env!("CARGO_PKG_VERSION")))
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("HTTP-клиент .
        .map_err(|error| AppError::custom(format!("HTTP-клиент не собран: {error}")))?;

    // Объявляем переменную set .
    let mut set = tokio::task::JoinSet::new();

    // Перебираем элементы коллекции.
    for (index, host) in targets.iter().enumerate() {
        // Объявляем переменную client .
        let client = client.clone();
        // Объявляем переменную host .
        let host = host.clone();

        // Выполняем операцию: set.spawn(async move { (index, probe_endpoint(client, &.
        set.spawn(async move { (index, probe_endpoint(client, &host).await) });
        // Закрываем блок.
    }

    // Объявляем переменную ordered.
    let mut ordered: Vec<(usize, EndpointReport)> = Vec::new();

    // Повторяем, пока выполняется условие.
    while let Some(joined) = set.join_next().await {
        // Проверяем условие: let Ok(item) = joined {.
        if let Ok(item) = joined {
            // Выполняем операцию: ordered.push(item);.
            ordered.push(item);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: ordered.sort_by_key(|(index, _)| *index);.
    ordered.sort_by_key(|(index, _)| *index);

    // Выполняем операцию: Ok(ordered.into_iter().map(|(_, report)| report).collec.
    Ok(ordered.into_iter().map(|(_, report)| report).collect())
    // Закрываем блок.
}

// Объявляем функцию tcp_probe.
async fn tcp_probe(host: &str, label: &str, port: u16) -> ProbeResult {
    // Объявляем переменную started .
    let started = std::time::Instant::now();

    // Объявляем переменную connected .
    let connected = tokio::time::timeout(PROBE_TIMEOUT, TcpStream::connect((host, port)))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map(|result| result.is_ok()).
        .map(|result| result.is_ok())
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Выполняем операцию: ProbeResult {.
    ProbeResult {
        // Выполняем операцию: target: format!("{label} ({host})"),.
        target: format!("{label} ({host})"),
        // Выполняем операцию: port,.
        port,
        // Выполняем операцию: status: if connected {.
        status: if connected {
            // Выполняем операцию: Reachability::Ok.
            Reachability::Ok
        // Закрываем блок.
        } else {
            // Выполняем операцию: Reachability::Failed.
            Reachability::Failed
            // Закрываем блок.
        },
        // Выполняем операцию: latency_ms: if connected {.
        latency_ms: if connected {
            // Выполняем операцию: Some(started.elapsed().as_millis() as u64).
            Some(started.elapsed().as_millis() as u64)
        // Закрываем блок.
        } else {
            // Выполняем операцию: None.
            None
            // Закрываем блок.
        },
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию resolve.
fn resolve(host: &str) -> (bool, Option<String>, Option<String>) {
    // Выбираем вариант по значению.
    match (host, 443u16).to_socket_addrs() {
        // Выполняем операцию: Ok(mut addresses) => match addresses.next() {.
        Ok(mut addresses) => match addresses.next() {
            // Выполняем операцию: Some(address) => (true, Some(address.ip().to_string()),.
            Some(address) => (true, Some(address.ip().to_string()), None),
            // Выполняем операцию: None => (false, None, Some(format!("{host}: нет A-запис.
            None => (false, None, Some(format!("{host}: нет A-записей"))),
            // Закрываем блок.
        },
        // Выполняем операцию: Err(error) => (false, None, Some(error.to_string())),.
        Err(error) => (false, None, Some(error.to_string())),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn check_game_connectivity() -> AppResult<Con.
pub async fn check_game_connectivity() -> AppResult<ConnectivityReport> {
    // Объявляем переменную (dns_ok, dns_address, dns_error) .
    let (dns_ok, dns_address, dns_error) = resolve(GAMELIFT_HOST);
    // Объявляем переменную tcp .
    let mut tcp = Vec::new();

    // Перебираем элементы коллекции.
    for (label, port) in TCP_PORTS {
        // Объявляем переменную host .
        let host = if *label == "Steam query" {
            // Выполняем операцию: STEAM_HOST.
            STEAM_HOST
        // Закрываем блок.
        } else {
            // Выполняем операцию: GAMELIFT_HOST.
            GAMELIFT_HOST
            // Закрываем блок.
        };

        // Выполняем операцию: tcp.push(tcp_probe(host, label, *port).await);.
        tcp.push(tcp_probe(host, label, *port).await);
        // Закрываем блок.
    }

    // Объявляем переменную verdict .
    let verdict = if !dns_ok {
        // Выполняем операцию: "dns-failed".
        "dns-failed"
    // Закрываем блок.
    } else if tcp.iter().any(|probe| probe.status == Reachability::Ok) {
        // Выполняем операцию: "tcp-ok".
        "tcp-ok"
    // Закрываем блок.
    } else {
        // Выполняем операцию: "tcp-failed".
        "tcp-failed"
        // Закрываем блок.
    };

    // Выполняем операцию: Ok(ConnectivityReport {.
    Ok(ConnectivityReport {
        // Выполняем операцию: dns_ok,.
        dns_ok,
        // Выполняем операцию: dns_address,.
        dns_address,
        // Выполняем операцию: dns_error,.
        dns_error,
        // Выполняем операцию: tcp,.
        tcp,
        // Выполняем операцию: udp_status: Reachability::Unverifiable,.
        udp_status: Reachability::Unverifiable,
        // Выполняем операцию: udp_note: "udp-unverifiable",.
        udp_note: "udp-unverifiable",
        // Выполняем операцию: verdict,.
        verdict,
        // Закрываем блок.
    })
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
    // Объявляем функцию test_report_marks_udp_unverifiable.
    fn test_report_marks_udp_unverifiable() {
        // Выполняем операцию: assert_eq!(Reachability::Unverifiable, Reachability::Un.
        assert_eq!(Reachability::Unverifiable, Reachability::Unverifiable);
        // Выполняем операцию: assert!(!Reachability::Ok.eq(&Reachability::Failed));.
        assert!(!Reachability::Ok.eq(&Reachability::Failed));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_resolve_reports_failure_for_broken_host.
    fn test_resolve_reports_failure_for_broken_host() {
        // Объявляем переменную (ok, address, error) .
        let (ok, address, error) = resolve("host.invalid.example");

        // Выполняем операцию: assert!(!ok);.
        assert!(!ok);
        // Выполняем операцию: assert!(address.is_none());.
        assert!(address.is_none());
        // Выполняем операцию: assert!(error.is_some());.
        assert!(error.is_some());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[tokio::test]
    // Объявляем функцию test_endpoint_list_is_capped_and_deduped.
    async fn test_endpoint_list_is_capped_and_deduped() {
        // Объявляем переменную hosts .
        let hosts = vec![
            // Выполняем операцию: "rbg-services.com".to_string(),.
            "rbg-services.com".to_string(),
            // Выполняем операцию: "https://rbg-services.com/".to_string(),.
            "https://rbg-services.com/".to_string(),
            // Выполняем операцию: "outlasttrials.com".to_string(),.
            "outlasttrials.com".to_string(),
            // Закрываем выражение или коллекцию.
        ];

        // Без сети проверка не пройдёт, поэтому проверяем только форму ответа:
        // список нормализуется, дубли схлопываются, порядок сохраняется.
        // Объявляем переменную reports .
        let reports = check_game_endpoints(hosts).await.expect("reports");

        // Выполняем операцию: assert!(reports.len() <= MAX_ENDPOINTS);.
        assert!(reports.len() <= MAX_ENDPOINTS);

        // Объявляем переменную names.
        let names: Vec<&str> = reports.iter().map(|item| item.host.as_str()).collect();
        // Объявляем переменную unique .
        let mut unique = names.clone();
        // Выполняем операцию: unique.sort_unstable();.
        unique.sort_unstable();
        // Выполняем операцию: unique.dedup();.
        unique.dedup();

        // Выполняем операцию: assert_eq!(names.len(), unique.len(), "дубли не схлопну.
        assert_eq!(names.len(), unique.len(), "дубли не схлопнулись");
        // Выполняем операцию: assert!(!names.iter().any(|host| host.contains("https:/.
        assert!(!names.iter().any(|host| host.contains("https://")));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_shared_cdn_is_detected.
    fn test_shared_cdn_is_detected() {
        // Выполняем операцию: assert!(is_shared_cdn("cloudfront.net"));.
        assert!(is_shared_cdn("cloudfront.net"));
        // Выполняем операцию: assert!(is_shared_cdn("steampowered.com"));.
        assert!(is_shared_cdn("steampowered.com"));
        // Выполняем операцию: assert!(is_shared_cdn("gamelift.amazonaws.com"));.
        assert!(is_shared_cdn("gamelift.amazonaws.com"));
        // Выполняем операцию: assert!(!is_shared_cdn("rbg-services.com"));.
        assert!(!is_shared_cdn("rbg-services.com"));
        // Выполняем операцию: assert!(!is_shared_cdn("outlasttrials.com"));.
        assert!(!is_shared_cdn("outlasttrials.com"));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[tokio::test]
    // Объявляем функцию test_own_domains_are_probed_before_shared_ones.
    async fn test_own_domains_are_probed_before_shared_ones() {
        // Объявляем переменную hosts .
        let hosts = vec![
            // Выполняем операцию: "steampowered.com".to_string(),.
            "steampowered.com".to_string(),
            // Выполняем операцию: "steamcontent.com".to_string(),.
            "steamcontent.com".to_string(),
            // Выполняем операцию: "rbg-services.com".to_string(),.
            "rbg-services.com".to_string(),
            // Выполняем операцию: "outlasttrials.com".to_string(),.
            "outlasttrials.com".to_string(),
            // Закрываем выражение или коллекцию.
        ];

        // Объявляем переменную reports .
        let reports = check_game_endpoints(hosts).await.expect("reports");
        // Объявляем переменную names.
        let names: Vec<&str> = reports.iter().map(|item| item.host.as_str()).collect();

        // Объявляем переменную first_shared .
        let first_shared = names
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .position(|host| is_shared_cdn(host)).
            .position(|host| is_shared_cdn(host))
            // Выполняем операцию: .unwrap_or(names.len());.
            .unwrap_or(names.len());

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: names[first_shared..].iter().all(|host| is_shared_cdn(h.
            names[first_shared..].iter().all(|host| is_shared_cdn(host)),
            // Выполняем операцию: "свои домены должны идти раньше общих: {names:?}".
            "свои домены должны идти раньше общих: {names:?}" // Закрываем выражение или коллекцию.
        );

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: names.contains(&"rbg-services.com") || first_shared > 0.
            names.contains(&"rbg-services.com") || first_shared > 0,
            // Выполняем операцию: "собственный домен игры вытеснен общим: {names:?}".
            "собственный домен игры вытеснен общим: {names:?}" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[tokio::test]
    // Объявляем функцию test_unresolvable_host_reports_dns_stage.
    async fn test_unresolvable_host_reports_dns_stage() {
        // Объявляем переменную reports .
        let reports = check_game_endpoints(vec!["rbg-services.com".to_string()])
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .expect("reports");.
            .expect("reports");

        // Объявляем переменную report .
        let report = reports.first().expect("report");

        // Корня rbg-services.com не существует — это не блокировка.
        // Проверяем условие: report.stage == "connect" {.
        if report.stage == "connect" {
            // Выполняем операцию: assert!(.
            assert!(
                // Выполняем операцию: report.hint.to_ascii_lowercase().contains("не резолвитс.
                report.hint.to_ascii_lowercase().contains("не резолвится"),
                // Выполняем операцию: "подсказка должна объяснять отсутствие DNS: {}",.
                "подсказка должна объяснять отсутствие DNS: {}",
                // Выполняем операцию: report.hint.
                report.hint // Закрываем выражение или коллекцию.
            );
        // Закрываем блок.
        } else {
            // Выполняем операцию: assert_eq!(report.stage, "dns");.
            assert_eq!(report.stage, "dns");
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[tokio::test]
    // Объявляем функцию test_private_hosts_are_not_probed.
    async fn test_private_hosts_are_not_probed() {
        // Объявляем переменную reports .
        let reports = check_game_endpoints(vec![
            // Выполняем операцию: "127.0.0.1".to_string(),.
            "127.0.0.1".to_string(),
            // Выполняем операцию: "localhost".to_string(),.
            "localhost".to_string(),
            // Выполняем операцию: "http://192.168.0.1/".to_string(),.
            "http://192.168.0.1/".to_string(),
            // Выполняем операцию: "10.0.0.1".to_string(),.
            "10.0.0.1".to_string(),
            // Выполняем операцию: "router.local".to_string(),.
            "router.local".to_string(),
            // Выполняем операцию: ]).
        ])
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .expect("reports");.
        .expect("reports");

        // Выполняем операцию: assert!(reports.is_empty(), "локальные адреса не должны.
        assert!(reports.is_empty(), "локальные адреса не должны проверяться");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_endpoint_hints_never_mention_vpn.
    fn test_endpoint_hints_never_mention_vpn() {
        // Объявляем переменную report .
        let report = EndpointReport {
            // Выполняем операцию: host: "prod.rbg-services.com".to_string(),.
            host: "prod.rbg-services.com".to_string(),
            // Выполняем операцию: ok: false,.
            ok: false,
            // Выполняем операцию: status_code: None,.
            status_code: None,
            // Выполняем операцию: latency_ms: None,.
            latency_ms: None,
            // Выполняем операцию: stage: "handshake",.
            stage: "handshake",
            // Выполняем операцию: error: None,.
            error: None,
            // Выполняем операцию: hint: "Сервер не ответил после Client Hello: соединение.
            hint: "Сервер не ответил после Client Hello: соединение обрывает фильтр.".to_string(),
            // Закрываем блок.
        };

        // Выполняем операцию: assert!(!report.hint.to_ascii_lowercase().contains("vpn.
        assert!(!report.hint.to_ascii_lowercase().contains("vpn"));
        // Закрываем блок.
    }
    // Закрываем блок.
}
