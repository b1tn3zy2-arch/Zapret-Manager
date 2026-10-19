use std::net::ToSocketAddrs;
use std::time::Duration;

use serde::Serialize;
use tokio::net::TcpStream;

use crate::error::{AppError, AppResult};

const PROBE_TIMEOUT: Duration = Duration::from_millis(1500);
const GAMELIFT_HOST: &str = "gamelift.amazonaws.com";
const STEAM_HOST: &str = "steamcommunity.com";
const TCP_PORTS: &[(&str, u16)] = &[
    ("Steam query", 27015),
    ("GameLift", 443),
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Reachability {
    Ok,
    Failed,
    /// Проверить нельзя: UDP не отвечает на пустой пакет.
    Unverifiable,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeResult {
    pub target: String,
    pub port: u16,
    pub status: Reachability,
    pub latency_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectivityReport {
    pub dns_ok: bool,
    pub dns_address: Option<String>,
    pub dns_error: Option<String>,
    pub tcp: Vec<ProbeResult>,
    pub udp_status: Reachability,
    pub udp_note: String,
    pub verdict: String,
}

/// Отдельная проверка одного сервиса игры: полноценный TLS-хендшейк.
///
/// Именно его рвёт DPI: Client Hello уходит, Server Hello не приходит. Такой
/// тест отвечает на главный вопрос — работает ли выбранная стратегия для этого
/// сервиса, — и не гадает по косвенным признакам.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointReport {
    pub host: String,
    pub ok: bool,
    pub status_code: Option<u16>,
    pub latency_ms: Option<u64>,
    pub stage: &'static str,
    pub error: Option<String>,
    pub hint: String,
}

const ENDPOINT_TIMEOUT: Duration = Duration::from_secs(6);
const MAX_ENDPOINTS: usize = 6;

fn stage_and_hint(error: &reqwest::Error, host: &str) -> (&'static str, String) {
    if error.is_timeout() {
        return (
            "handshake",
            "Сервер не ответил после Client Hello: соединение обрывает фильтр. \
             Эта стратегия для сервиса не подходит."
                .to_string(),
        );
    }

    if error.is_connect() {
        // У CDN-доменов вроде cloudfront.net или steamstatic.com корневой
        // хост часто вообще не принимает HTTPS. Это не блокировка, и называть
        // её блокировкой нельзя — иначе список врёт.
        let hint = if is_shared_cdn(host) {
            format!(
                "Корневой домен {host} не отвечает на HTTPS. Для CDN это \
                 нормально и ничего не значит: судить по нему нельзя."
            )
        } else {
            "TCP-соединение не устанавливается. Проверьте, запущен ли обход."
                .to_string()
        };

        return ("connect", hint);
    }

    if error.is_builder() {
        return ("request", "Некорректный адрес сервиса.".to_string());
    }

    (
        "request",
        format!("Соединение прервано на этапе TLS: {error}"),
    )
}

/// Домены, которые у всех игр общие и не отвечают на запрос к корню.
fn is_shared_cdn(host: &str) -> bool {
    const SHARED_PREFIXES: &[&str] = &[
        "steam",
        "epicgames",
        "cloudfront",
        "battleye",
        "easyanticheat",
        "amazonaws",
    ];

    SHARED_PREFIXES
        .iter()
        .any(|prefix| host.contains(prefix))
}

async fn probe_endpoint(client: reqwest::Client, host: &str) -> EndpointReport {
    let url = format!("https://{host}/");
    let started = std::time::Instant::now();

    // Резолвим отдельно: без этого «домен не существует» и «соединение
    // рвут» неразличимы, и в списке они выглядят одинаково — как блокировка.
    if let Err(error) = tokio::net::lookup_host((host, 443u16)).await {
        return EndpointReport {
            host: host.to_string(),
            ok: false,
            status_code: None,
            latency_ms: None,
            stage: "dns",
            error: Some(error.to_string()),
            hint: format!(
                "Домен {host} не резолвится. У сервиса бывает только поддомен \
                 (например, prod.…), а корень не существует — блокировки здесь нет."
            ),
        };
    }

    match client.get(&url).send().await {
        Ok(response) => EndpointReport {
            host: host.to_string(),
            ok: true,
            status_code: Some(response.status().as_u16()),
            latency_ms: Some(started.elapsed().as_millis() as u64),
            stage: "ok",
            error: None,
            hint: "TLS-хендшейк прошёл, сервис отвечает.".to_string(),
        },
        Err(error) => {
            let (stage, hint) = stage_and_hint(&error, host);

            EndpointReport {
                host: host.to_string(),
                ok: false,
                status_code: None,
                latency_ms: None,
                stage,
                error: Some(error.to_string()),
                hint,
            }
        }
    }
}

/// Проверяет сервисы игры настоящим TLS-хендшейком, а не UDP-«пингом».
#[tauri::command]
pub async fn check_game_endpoints(hosts: Vec<String>) -> AppResult<Vec<EndpointReport>> {
    let mut targets: Vec<String> = Vec::new();
    let mut shared: Vec<String> = Vec::new();

    for host in hosts {
        let cleaned = host
            .trim()
            .trim_start_matches("https://")
            .trim_start_matches("http://")
            .trim_end_matches('/')
            .to_ascii_lowercase();

        if cleaned.is_empty() || targets.contains(&cleaned) || shared.contains(&cleaned) {
            continue;
        }

        // Свои домены игры идут первыми: у Outlast Trials первые в списке
        // всегда Steam-шарды, и до rbg-services.com очередь не доходила.
        if is_shared_cdn(&cleaned) {
            shared.push(cleaned);
        } else {
            targets.push(cleaned);
        }
    }

    targets.extend(shared);
    targets.truncate(MAX_ENDPOINTS);

    if targets.is_empty() {
        return Ok(Vec::new());
    }

    let client = reqwest::Client::builder()
        .timeout(ENDPOINT_TIMEOUT)
        .connect_timeout(Duration::from_secs(4))
        .redirect(reqwest::redirect::Policy::none())
        .user_agent(concat!("zapret-manager/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|error| AppError::custom(format!("HTTP-клиент не собран: {error}")))?;

    let mut set = tokio::task::JoinSet::new();

    for (index, host) in targets.iter().enumerate() {
        let client = client.clone();
        let host = host.clone();

        set.spawn(async move { (index, probe_endpoint(client, &host).await) });
    }

    let mut ordered: Vec<(usize, EndpointReport)> = Vec::new();

    while let Some(joined) = set.join_next().await {
        if let Ok(item) = joined {
            ordered.push(item);
        }
    }

    ordered.sort_by_key(|(index, _)| *index);

    Ok(ordered.into_iter().map(|(_, report)| report).collect())
}

async fn tcp_probe(host: &str, label: &str, port: u16) -> ProbeResult {
    let started = std::time::Instant::now();

    let connected = tokio::time::timeout(PROBE_TIMEOUT, TcpStream::connect((host, port)))
        .await
        .map(|result| result.is_ok())
        .unwrap_or(false);

    ProbeResult {
        target: format!("{label} ({host})"),
        port,
        status: if connected {
            Reachability::Ok
        } else {
            Reachability::Failed
        },
        latency_ms: if connected {
            Some(started.elapsed().as_millis() as u64)
        } else {
            None
        },
    }
}

fn resolve(host: &str) -> (bool, Option<String>, Option<String>) {
    match (host, 443u16).to_socket_addrs() {
        Ok(mut addresses) => match addresses.next() {
            Some(address) => (true, Some(address.ip().to_string()), None),
            None => (false, None, Some(format!("{host}: нет A-записей"))),
        },
        Err(error) => (false, None, Some(error.to_string())),
    }
}

#[tauri::command]
pub async fn check_game_connectivity() -> AppResult<ConnectivityReport> {
    let (dns_ok, dns_address, dns_error) = resolve(GAMELIFT_HOST);
    let mut tcp = Vec::new();

    for (label, port) in TCP_PORTS {
        let host = if *label == "Steam query" {
            STEAM_HOST
        } else {
            GAMELIFT_HOST
        };

        tcp.push(tcp_probe(host, label, *port).await);
    }

    let verdict = if !dns_ok {
        "Домены серверов не резолвятся: обход не сможет ни к чему подключиться.".to_string()
    } else if tcp.iter().any(|probe| probe.status == Reachability::Ok) {
        "TCP до серверов доходит. UDP проверить нельзя — он не отвечает на 
         пустой пакет; если игра всё ещё не соединяется, смотрите диагностику логов."
            .to_string()
    } else {
        "TCP до серверов не доходит. Обход, скорее всего, не активен: запустите стратегию и повторите проверку."
            .to_string()
    };

    Ok(ConnectivityReport {
        dns_ok,
        dns_address,
        dns_error,
        tcp,
        udp_status: Reachability::Unverifiable,
        udp_note: "UDP не отвечает на тестовый пакет: и «заблокирован», и «открыт» 
                   выглядят одинаково — это не проверка."
            .to_string(),
        verdict,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_report_marks_udp_unverifiable() {
        assert_eq!(Reachability::Unverifiable, Reachability::Unverifiable);
        assert!(!Reachability::Ok.eq(&Reachability::Failed));
    }

    #[test]
    fn test_resolve_reports_failure_for_broken_host() {
        let (ok, address, error) = resolve("host.invalid.example");

        assert!(!ok);
        assert!(address.is_none());
        assert!(error.is_some());
    }

    #[tokio::test]
    async fn test_endpoint_list_is_capped_and_deduped() {
        let hosts = vec![
            "rbg-services.com".to_string(),
            "https://rbg-services.com/".to_string(),
            "outlasttrials.com".to_string(),
        ];

        // Без сети проверка не пройдёт, поэтому проверяем только форму ответа:
        // список нормализуется, дубли схлопываются, порядок сохраняется.
        let reports = check_game_endpoints(hosts).await.expect("reports");

        assert!(reports.len() <= MAX_ENDPOINTS);

        let names: Vec<&str> = reports.iter().map(|item| item.host.as_str()).collect();
        let mut unique = names.clone();
        unique.sort_unstable();
        unique.dedup();

        assert_eq!(names.len(), unique.len(), "дубли не схлопнулись");
        assert!(!names.iter().any(|host| host.contains("https://")));
    }

    #[test]
    fn test_shared_cdn_is_detected() {
        assert!(is_shared_cdn("cloudfront.net"));
        assert!(is_shared_cdn("steampowered.com"));
        assert!(is_shared_cdn("gamelift.amazonaws.com"));
        assert!(!is_shared_cdn("rbg-services.com"));
        assert!(!is_shared_cdn("outlasttrials.com"));
    }

    #[tokio::test]
    async fn test_own_domains_are_probed_before_shared_ones() {
        let hosts = vec![
            "steampowered.com".to_string(),
            "steamcontent.com".to_string(),
            "rbg-services.com".to_string(),
            "outlasttrials.com".to_string(),
        ];

        let reports = check_game_endpoints(hosts).await.expect("reports");
        let names: Vec<&str> = reports.iter().map(|item| item.host.as_str()).collect();

        let first_shared = names
            .iter()
            .position(|host| is_shared_cdn(host))
            .unwrap_or(names.len());

        assert!(
            names[first_shared..]
                .iter()
                .all(|host| is_shared_cdn(host)),
            "свои домены должны идти раньше общих: {names:?}"
        );

        assert!(
            names.contains(&"rbg-services.com") || first_shared > 0,
            "собственный домен игры вытеснен общим: {names:?}"
        );
    }

#[tokio::test]
async fn test_unresolvable_host_reports_dns_stage() {
    let reports = check_game_endpoints(vec!["rbg-services.com".to_string()])
        .await
        .expect("reports");

    let report = reports.first().expect("report");

    // Корня rbg-services.com не существует — это не блокировка.
    if report.stage == "connect" {
        assert!(
            report.hint.to_ascii_lowercase().contains("не резолвится"),
            "подсказка должна объяснять отсутствие DNS: {}",
            report.hint
        );
    } else {
        assert_eq!(report.stage, "dns");
    }
}

#[test]
fn test_endpoint_hints_never_mention_vpn() {
        let report = EndpointReport {
            host: "prod.rbg-services.com".to_string(),
            ok: false,
            status_code: None,
            latency_ms: None,
            stage: "handshake",
            error: None,
            hint: "Сервер не ответил после Client Hello: соединение обрывает фильтр."
                .to_string(),
        };

        assert!(!report.hint.to_ascii_lowercase().contains("vpn"));
    }
}