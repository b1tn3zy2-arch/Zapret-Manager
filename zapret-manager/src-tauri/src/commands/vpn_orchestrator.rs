// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: serde::Serialize;.
use serde::Serialize;
// Подключаем модули: tauri::State;.
use tauri::State;
// Подключаем модули: tokio::net::TcpStream;.
use tokio::net::TcpStream;

// Подключаем модули: crate::commands::runtime_guard;.
use crate::commands::runtime_guard;
// Подключаем модули: crate::commands::subscription_store;.
use crate::commands::subscription_store;
// Подключаем модули: crate::commands::vpn_core::{install_vpn_core, launch_xr.
use crate::commands::vpn_core::{install_vpn_core, launch_xray, XrayRuntime, XrayStatus};
// Подключаем модули: crate::commands::vpn_subscription;.
use crate::commands::vpn_subscription;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

/// Таймаут одного замера отклика.
// Объявляем константу PING_TIMEOUT.
pub const PING_TIMEOUT: Duration = Duration::from_millis(1_500);

/// Код ошибки «подписка не добавлена».
// Объявляем константу NO_SUBSCRIPTION.
pub const NO_SUBSCRIPTION: &str = "NO_SUBSCRIPTION";

/// Код ошибки, который отдаётся фронтенду, когда ни один сервер
/// не ответил. Фронтенд по нему показывает «Нет доступных серверов».
// Объявляем константу NO_AVAILABLE_SERVERS.
pub const NO_AVAILABLE_SERVERS: &str = "NO_AVAILABLE_SERVERS";

/// Максимум серверов за один заход: список приходит из подписки,
/// и замерять больше сотни адресов бессмысленно.
// Объявляем константу MAX_CANDIDATES.
pub const MAX_CANDIDATES: usize = 64;

/// Кандидат на подключение: всё, что нужно, чтобы замерить отклик
/// и поднять туннель.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone)]
// Объявляем структуру ServerCandidate.
pub struct ServerCandidate {
    // Выполняем операцию: pub id: String,.
    pub id: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub host: String,.
    pub host: String,
    // Выполняем операцию: pub port: u16,.
    pub port: u16,
    /// Ссылка в формате vless://, vmess:// и т.п. Из неё
    /// собирается конфиг ядра.
    // Выполняем операцию: pub link: String,.
    pub link: String,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl From<&vpn_subscription::SubscriptionServer> for ServerCandidate {
    // Объявляем функцию from.
    fn from(server: &vpn_subscription::SubscriptionServer) -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: id: server.id.clone(),.
            id: server.id.clone(),
            // Выполняем операцию: name: server.name.clone(),.
            name: server.name.clone(),
            // Выполняем операцию: host: server.host.clone(),.
            host: server.host.clone(),
            // Выполняем операцию: port: server.port,.
            port: server.port,
            // Выполняем операцию: link: server.link.clone(),.
            link: server.link.clone(),
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Узел, который в VPN не берётся.
///
/// LTE-узлы обхода — это мобильные узлы российских операторов: в
/// подписке они лежат рядом с зарубежными, но для VPN они не годятся
/// (и не дают зарубежный адрес). Поэтому в VPN попадают только
/// обычные серверы.
// Объявляем функцию is_excluded_node.
pub fn is_excluded_node(name: &str) -> bool {
    // Объявляем переменную upper .
    let upper = name.to_uppercase();

    // Выполняем операцию: upper.contains("LTE") || upper.contains("ОБХОД").
    upper.contains("LTE") || upper.contains("ОБХОД")
    // Закрываем блок.
}

/// Отчёт об умном подключении.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру AutoConnectReport.
pub struct AutoConnectReport {
    // Выполняем операцию: pub server_id: String,.
    pub server_id: String,
    // Выполняем операцию: pub server_name: String,.
    pub server_name: String,
    // Выполняем операцию: pub ping_ms: u64,.
    pub ping_ms: u64,
    /// Состояние после подключения: команда сама подняла туннель,
    /// поэтому интерфейсу не нужно делать второй запрос.
    // Выполняем операцию: pub status: XrayStatus,.
    pub status: XrayStatus,
    // Закрываем блок.
}

/// Замеряет время установки TCP-соединения до адреса. `None`, если
/// сервер не ответил за [`PING_TIMEOUT`].
// Выполняем операцию: pub async fn measure_latency(host: &str, port: u16) -> .
pub async fn measure_latency(host: &str, port: u16) -> Option<u64> {
    // Объявляем переменную started .
    let started = tokio::time::Instant::now();
    // Объявляем переменную connect .
    let connect = TcpStream::connect((host, port));

    // Объявляем переменную stream .
    let stream = match tokio::time::timeout(PING_TIMEOUT, connect).await {
        // Выполняем операцию: Ok(Ok(stream)) => stream,.
        Ok(Ok(stream)) => stream,
        // Выполняем операцию: Ok(Err(_)) | Err(_) => return None,.
        Ok(Err(_)) | Err(_) => return None,
        // Закрываем блок.
    };

    // Объявляем переменную elapsed .
    let elapsed = started.elapsed().as_millis().min(u128::from(u64::MAX)) as u64;

    // Выполняем операцию: drop(stream);.
    drop(stream);

    // Выполняем операцию: Some(elapsed).
    Some(elapsed)
    // Закрываем блок.
}

/// Результат замера одного сервера.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone)]
// Объявляем структуру Measured.
pub struct Measured {
    // Выполняем операцию: pub candidate: ServerCandidate,.
    pub candidate: ServerCandidate,
    // Выполняем операцию: pub ping_ms: Option<u64>,.
    pub ping_ms: Option<u64>,
    // Закрываем блок.
}

/// Сортирует серверы по возрастанию отклика. Не ответившие уходят в
/// конец списка и из выбора выпадают.
// Объявляем функцию sort_by_latency.
pub fn sort_by_latency(mut measured: Vec<Measured>) -> Vec<Measured> {
    // Выполняем операцию: measured.sort_by(|left, right| match (left.ping_ms, rig.
    measured.sort_by(|left, right| match (left.ping_ms, right.ping_ms) {
        // Выполняем операцию: (Some(a), Some(b)) => a.cmp(&b),.
        (Some(a), Some(b)) => a.cmp(&b),
        // Выполняем операцию: (Some(_), None) => std::cmp::Ordering::Less,.
        (Some(_), None) => std::cmp::Ordering::Less,
        // Выполняем операцию: (None, Some(_)) => std::cmp::Ordering::Greater,.
        (None, Some(_)) => std::cmp::Ordering::Greater,
        // Выполняем операцию: (None, None) => std::cmp::Ordering::Equal,.
        (None, None) => std::cmp::Ordering::Equal,
        // Закрываем блок.
    });

    // Выполняем операцию: measured.
    measured
    // Закрываем блок.
}

/// Замеряет все серверы параллельно и возвращает отсортированный
/// список. Отклик измеряется по TCP-соединению: UDP в этом приложении
/// не используется, а открытый порт — надёжный признак живости.
// Выполняем операцию: pub async fn measure_all(candidates: Vec<ServerCandidat.
pub async fn measure_all(candidates: Vec<ServerCandidate>) -> Vec<Measured> {
    // Объявляем переменную set .
    let mut set = tokio::task::JoinSet::new();

    // Перебираем элементы коллекции.
    for candidate in candidates {
        // Выполняем операцию: set.spawn(async move {.
        set.spawn(async move {
            // Объявляем переменную ping_ms .
            let ping_ms = measure_latency(&candidate.host, candidate.port).await;

            // Выполняем операцию: Measured { candidate, ping_ms }.
            Measured { candidate, ping_ms }
            // Закрываем блок.
        });
        // Закрываем блок.
    }

    // Объявляем переменную measured .
    let mut measured = Vec::new();

    // Повторяем, пока выполняется условие.
    while let Some(joined) = set.join_next().await {
        // Проверяем условие: let Ok(result) = joined {.
        if let Ok(result) = joined {
            // Выполняем операцию: measured.push(result);.
            measured.push(result);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: sort_by_latency(measured).
    sort_by_latency(measured)
    // Закрываем блок.
}

/// Поднимает туннель на самом быстром сервере.
///
/// Порядок работы: подписка → замер отклика до всех
/// серверов → выбор лучшего → запуск ядра на нём. Список серверов
/// берётся здесь же, поэтому он всегда свежий, а интерфейс не может
/// подсунуть свой. Если ни один сервер не ответил, команда
/// возвращает ошибку с кодом [`NO_AVAILABLE_SERVERS`].
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn auto_connect_vpn(.
pub async fn auto_connect_vpn(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: state: State<'_, XrayRuntime>,.
    state: State<'_, XrayRuntime>,
    // Выполняем операцию: processes: State<'_, crate::process_manager::ProcessMan.
    processes: State<'_, crate::process_manager::ProcessManager>,
    // Закрываем выражение или коллекцию.
) -> AppResult<AutoConnectReport> {
    // Раньше это место блокировалось: «работает стратегия — остановите
    // её». Режимы всё равно не работают одновременно, поэтому теперь
    // приложение само гасит стратегии: старая выключается, и VPN
    // подключается без лишних действий со стороны пользователя.
    // Объявляем переменную stopped .
    let stopped = crate::commands::runner::stop_strategies_for_vpn(&app, processes.inner()).await;

    // Проверяем условие: stopped > 0 {.
    if stopped > 0 {
        // Выполняем операцию: tracing::info!("Остановлено стратегий перед включением .
        tracing::info!("Остановлено стратегий перед включением VPN: {stopped}");
        // Закрываем блок.
    }

    // Выполняем операцию: runtime_guard::validate(.
    runtime_guard::validate(
        // Выполняем операцию: runtime_guard::RuntimeTarget::Vpn,.
        runtime_guard::RuntimeTarget::Vpn,
        // Выполняем операцию: state.inner(),.
        state.inner(),
        // Выполняем операцию: processes.inner(),.
        processes.inner(),
        // Закрываем выражение или коллекцию.
    )?;

    // Ядро нужно до подключения: без него туннель не поднять.
    // Проверяем и хеши, иначе повреждённый exe свалит запуск.
    // Проверяем условие: !crate::commands::vpn_xray::core_healthy() {.
    if !crate::commands::vpn_xray::core_healthy() {
        // Выполняем операцию: install_vpn_core(app).await?;.
        install_vpn_core(app).await?;
        // Закрываем блок.
    }

    // Объявляем переменную Some(subscription_url) .
    let Some(subscription_url) = subscription_store::read_url()? else {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "{NO_SUBSCRIPTION}|Добавьте ссылку на подписку".
            "{NO_SUBSCRIPTION}|Добавьте ссылку на подписку" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    };

    // Объявляем переменную payload .
    let payload = vpn_subscription::fetch_subscription_payload(&subscription_url).await?;

    // Проверяем условие: payload.servers.is_empty() {.
    if payload.servers.is_empty() {
        // Возвращаем результат из функции.
        return Err(no_available_servers());
        // Закрываем блок.
    }

    // Объявляем переменную candidates.
    let candidates: Vec<ServerCandidate> = payload
        // Выполняем операцию: .servers.
        .servers
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|server| !is_excluded_node(&server.name)).
        .filter(|server| !is_excluded_node(&server.name))
        // Выполняем операцию: .take(MAX_CANDIDATES).
        .take(MAX_CANDIDATES)
        // Выполняем операцию: .map(ServerCandidate::from).
        .map(ServerCandidate::from)
        // Выполняем операцию: .collect();.
        .collect();

    // Проверяем условие: candidates.is_empty() {.
    if candidates.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "В подписке нет серверов, к которым можно подключиться".
            "В подписке нет серверов, к которым можно подключиться",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную measured .
    let measured = measure_all(candidates).await;

    // Объявляем переменную best .
    let best = measured
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .find(|item| item.ping_ms.is_some()).
        .find(|item| item.ping_ms.is_some())
        // Выполняем операцию: .ok_or_else(no_available_servers)?;.
        .ok_or_else(no_available_servers)?;

    // Объявляем переменную ping_ms .
    let ping_ms = best.ping_ms.unwrap_or_default();
    // Объявляем переменную runtime .
    let runtime = state.inner();

    // Объявляем переменную server .
    let server = vpn_subscription::parse_link(&best.candidate.link)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Ссылка сервера поврежд.
        .ok_or_else(|| AppError::custom("Ссылка сервера повреждена"))?;

    // Объявляем переменную status .
    let status = launch_xray(runtime, &server).await?;

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Умное подключение: {} ({ping_ms} мс), pid {:?}",.
        "Умное подключение: {} ({ping_ms} мс), pid {:?}",
        // Выполняем операцию: best.candidate.name,.
        best.candidate.name,
        // Выполняем операцию: status.pid.
        status.pid // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(AutoConnectReport {.
    Ok(AutoConnectReport {
        // Выполняем операцию: status,.
        status,
        // Выполняем операцию: server_id: best.candidate.id,.
        server_id: best.candidate.id,
        // Выполняем операцию: server_name: best.candidate.name,.
        server_name: best.candidate.name,
        // Выполняем операцию: ping_ms,.
        ping_ms,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию no_available_servers.
fn no_available_servers() -> AppError {
    // Выполняем операцию: AppError::custom(NO_AVAILABLE_SERVERS).
    AppError::custom(NO_AVAILABLE_SERVERS)
    // Закрываем блок.
}

/// Приводит адрес к socket-паре. Используется в тестах и при
/// разборе ссылок, где уже есть готовый `SocketAddr`.
// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "vpn_orchestrator_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
