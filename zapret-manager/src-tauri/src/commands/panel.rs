//! Клиент панели подписки.
//!
//! Панель — единственный источник правды по тарифам и по состоянию
//! подписки. Здесь только транспорт и разбор ответов: правила цен
//! и всё, что видно пользователю, живут в
//! [`crate::commands::subscription`].
//!
//! Адрес и формат зафиксированы по факту работы панели:
//! `GET /web-app/rate` отдаёт тарифы без авторизации.

// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

/// Базовый адрес API панели.
// Объявляем константу PANEL_API_BASE.
pub const PANEL_API_BASE: &str = "https://maximavps.cloud/api";

/// Таймаут одного запроса к панели.
// Объявляем константу REQUEST_TIMEOUT.
const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);

/// Максимальный размер ответа панели.
///
/// Тарифы — это несколько килобайт, профиль — меньше. Всё, что
/// крупнее, — не наш ответ.
// Объявляем константу MAX_RESPONSE_BYTES.
const MAX_RESPONSE_BYTES: usize = 512 * 1024;

/// Идентификатор приложения для панели.
// Объявляем константу USER_AGENT.
pub const USER_AGENT: &str = concat!("ZapretManager/", env!("CARGO_PKG_VERSION"));

/// Метка ошибки «сессия недействительна».
// Объявляем константу UNAUTHORIZED_MARKER.
const UNAUTHORIZED_MARKER: &str = "Сессия панели недействительна";

/// Метка ошибки «панель не пускает из-за частоты запросов».
// Объявляем константу RATE_LIMITED_MARKER.
const RATE_LIMITED_MARKER: &str = "Панель временно не пускает";

/// Ответ `GET /web-app/rate`.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру RateEnvelope.
pub struct RateEnvelope {
    // Выполняем операцию: pub success: bool,.
    pub success: bool,
    // Выполняем операцию: pub data: RateData,.
    pub data: RateData,
    // Закрываем блок.
}

/// Полезная нагрузка ответа с тарифами.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру RateData.
pub struct RateData {
    // Выполняем операцию: pub rates: Vec<RateEntry>,.
    pub rates: Vec<RateEntry>,
    // Закрываем блок.
}

/// Один тариф в ответе панели.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру RateEntry.
pub struct RateEntry {
    // Выполняем операцию: pub month: RateMonth,.
    pub month: RateMonth,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub rate: Vec<RatePrice>,.
    pub rate: Vec<RatePrice>,
    // Закрываем блок.
}

/// Описание срока тарифа.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру RateMonth.
pub struct RateMonth {
    /// Идентификатор тарифа: он же `rate_id` в заказе оплаты.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub id: Option<i64>,.
    pub id: Option<i64>,
    /// Срок в днях.
    // Выполняем операцию: pub score: i64,.
    pub score: i64,
    // Закрываем блок.
}

/// Цена за указанное количество устройств.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру RatePrice.
pub struct RatePrice {
    // Выполняем операцию: pub devices: u32,.
    pub devices: u32,
    // Выполняем операцию: pub price: u32,.
    pub price: u32,
    // Закрываем блок.
}

/// Ошибка панели в теле ответа.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру ApiErrorEnvelope.
struct ApiErrorEnvelope {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: error: Option<ApiErrorBody>,.
    error: Option<ApiErrorBody>,
    // Закрываем блок.
}

/// Текст ошибки панели.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру ApiErrorBody.
struct ApiErrorBody {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: message: String,.
    message: String,
    // Закрываем блок.
}

/// Тариф в виде, удобном для расчётов.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру PanelTariff.
pub struct PanelTariff {
    /// Срок в месяцах.
    // Выполняем операцию: pub months: u32,.
    pub months: u32,
    /// Срок в днях.
    // Выполняем операцию: pub days: u32,.
    pub days: u32,
    /// Цены по количеству устройств, по возрастанию устройств.
    // Выполняем операцию: pub prices: Vec<PanelPrice>,.
    pub prices: Vec<PanelPrice>,
    // Закрываем блок.
}

/// Цена одного количества устройств.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру PanelPrice.
pub struct PanelPrice {
    // Выполняем операцию: pub devices: u32,.
    pub devices: u32,
    // Выполняем операцию: pub price: u32,.
    pub price: u32,
    // Закрываем блок.
}

/// Создаёт HTTP-клиент для панели.
///
/// TLS берётся системный (SChannel на Windows), а не rustls: у
/// rustls отпечаток ClientHello заметно отличается от браузерного,
/// и фильтры, которые рвут такие соединения, отсекают панель
/// целиком. С системным TLS панель видна как обычный браузер.
// Объявляем функцию build_client.
pub fn build_client() -> AppResult<reqwest::Client> {
    // Выполняем операцию: reqwest::Client::builder().
    reqwest::Client::builder()
        // Выполняем операцию: .timeout(REQUEST_TIMEOUT).
        .timeout(REQUEST_TIMEOUT)
        // Выполняем операцию: .user_agent(USER_AGENT).
        .user_agent(USER_AGENT)
        // Выполняем операцию: .use_native_tls().
        .use_native_tls()
        // Системный прокси — это туннель самого приложения: запросы
        // панели через него уходят в VPN-узел, который до панели не
        // дотягивается. Поэтому панель опрашивается напрямую.
        // Выполняем операцию: .no_proxy().
        .no_proxy()
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("HTTP клиент .
        .map_err(|error| AppError::custom(format!("HTTP клиент не создан: {error}")))
    // Закрываем блок.
}

/// Срок тарифа в месяцах.
///
/// Панель переводит дни в месяцы по своему правилу, и на нём же
/// считает цену за месяц. Повторяем это правило, чтобы цифры
/// совпадали с панелью.
// Объявляем функцию months_for_days.
pub fn months_for_days(days: i64) -> u32 {
    // Выбираем вариант по значению.
    match days {
        // Выполняем операцию: d if d <= 31 => 1,.
        d if d <= 31 => 1,
        // Выполняем операцию: d if d <= 93 => 3,.
        d if d <= 93 => 3,
        // Выполняем операцию: d if d <= 186 => 6,.
        d if d <= 186 => 6,
        // Выполняем операцию: _ => 12,.
        _ => 12,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Цена для указанного количества устройств.
///
/// Правило панели: если ровно такого количества нет, берётся
/// ближайшее большее; если нет и такого — самое большое из
/// имеющихся.
// Объявляем функцию price_for_devices.
pub fn price_for_devices(prices: &[PanelPrice], devices: u32) -> u32 {
    // Проверяем условие: let Some(exact) = prices.iter().find(|item| item.d.
    if let Some(exact) = prices.iter().find(|item| item.devices == devices) {
        // Возвращаем результат из функции.
        return exact.price;
        // Закрываем блок.
    }

    // Проверяем условие: let Some(nearest) = prices.
    if let Some(nearest) = prices
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|item| item.devices > devices).
        .filter(|item| item.devices > devices)
        // Выполняем операцию: .min_by_key(|item| item.devices).
        .min_by_key(|item| item.devices)
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return nearest.price;
        // Закрываем блок.
    }

    // Выполняем операцию: prices.
    prices
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .max_by_key(|item| item.devices).
        .max_by_key(|item| item.devices)
        // Выполняем операцию: .map_or(0, |item| item.price).
        .map_or(0, |item| item.price)
    // Закрываем блок.
}

/// Разбирает ответ панели с тарифами.
// Объявляем функцию parse_tariffs.
pub fn parse_tariffs(payload: &str) -> AppResult<Vec<PanelTariff>> {
    // Объявляем переменную envelope.
    let envelope: RateEnvelope = serde_json::from_str(payload)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не разобран .
        .map_err(|error| AppError::custom(format!("Не разобран ответ панели: {error}")))?;

    // Проверяем условие: !envelope.success {.
    if !envelope.success {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Панель не отдала тарифы"));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(envelope.
    Ok(envelope
        // Выполняем операцию: .data.
        .data
        // Выполняем операцию: .rates.
        .rates
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|entry| PanelTariff {.
        .map(|entry| PanelTariff {
            // Выполняем операцию: months: months_for_days(entry.month.score),.
            months: months_for_days(entry.month.score),
            // Выполняем операцию: days: u32::try_from(entry.month.score).unwrap_or(0),.
            days: u32::try_from(entry.month.score).unwrap_or(0),
            // Выполняем операцию: prices: entry.
            prices: entry
                // Выполняем операцию: .rate.
                .rate
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .map(|price| PanelPrice {.
                .map(|price| PanelPrice {
                    // Выполняем операцию: devices: price.devices,.
                    devices: price.devices,
                    // Выполняем операцию: price: price.price,.
                    price: price.price,
                    // Закрываем блок.
                })
                // Выполняем операцию: .collect(),.
                .collect(),
            // Закрываем блок.
        })
        // Выполняем операцию: .collect()).
        .collect())
    // Закрываем блок.
}

/// Идентификатор тарифа панели для срока в днях.
///
/// Панель нумерует тарифы сама: идентификатор нужен заказу оплаты
/// (`rate_id`). None — тарифы не ответили или срока в них нет:
/// заказ возьмёт запасное соответствие.
// Выполняем операцию: pub async fn rate_id_for_days(client: &reqwest::Client,.
pub async fn rate_id_for_days(client: &reqwest::Client, days: u32) -> AppResult<Option<u32>> {
    // Объявляем переменную body .
    let body = read_body(
        // Выполняем операцию: client.
        client
            // Выполняем операцию: .get(format!("{PANEL_API_BASE}/web-app/rate")).
            .get(format!("{PANEL_API_BASE}/web-app/rate"))
            // Выполняем операцию: .header(reqwest::header::ACCEPT, "application/json").
            .header(reqwest::header::ACCEPT, "application/json")
            // Выполняем операцию: .send().
            .send()
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .map_err(|error| {.
            .map_err(|error| {
                // Выполняем операцию: AppError::custom(format!(.
                AppError::custom(format!(
                    // Выполняем операцию: "Панель недоступна: {}",.
                    "Панель недоступна: {}",
                    // Выполняем операцию: describe_network_error(&error).
                    describe_network_error(&error) // Закрываем выражение или коллекцию.
                ))
                // Закрываем блок.
            })?,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await?;.
    .await?;

    // Объявляем переменную envelope.
    let envelope: RateEnvelope = serde_json::from_str(&body)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не разобран .
        .map_err(|error| AppError::custom(format!("Не разобран ответ панели: {error}")))?;

    // Проверяем условие: !envelope.success {.
    if !envelope.success {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(envelope.
    Ok(envelope
        // Выполняем операцию: .data.
        .data
        // Выполняем операцию: .rates.
        .rates
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|entry| u32::try_from(entry.month.score).unwrap_o.
        .find(|entry| u32::try_from(entry.month.score).unwrap_or(0) == days)
        // Выполняем операцию: .and_then(|entry| entry.month.id).
        .and_then(|entry| entry.month.id)
        // Выполняем операцию: .and_then(|id| u32::try_from(id).ok())).
        .and_then(|id| u32::try_from(id).ok()))
    // Закрываем блок.
}

/// Забирает тарифы с панели.
// Выполняем операцию: pub async fn fetch_tariffs(client: &reqwest::Client) ->.
pub async fn fetch_tariffs(client: &reqwest::Client) -> AppResult<Vec<PanelTariff>> {
    // Объявляем переменную body .
    let body = read_body(
        // Выполняем операцию: client.
        client
            // Выполняем операцию: .get(format!("{PANEL_API_BASE}/web-app/rate")).
            .get(format!("{PANEL_API_BASE}/web-app/rate"))
            // Выполняем операцию: .header(reqwest::header::ACCEPT, "application/json").
            .header(reqwest::header::ACCEPT, "application/json")
            // Выполняем операцию: .send().
            .send()
            // Выполняем операцию: .await.
            .await
            // Выполняем операцию: .map_err(|error| {.
            .map_err(|error| {
                // Выполняем операцию: AppError::custom(format!(.
                AppError::custom(format!(
                    // Выполняем операцию: "Панель недоступна: {}",.
                    "Панель недоступна: {}",
                    // Выполняем операцию: describe_network_error(&error).
                    describe_network_error(&error) // Закрываем выражение или коллекцию.
                ))
                // Закрываем блок.
            })?,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await?;.
    .await?;

    // Выполняем операцию: parse_tariffs(&body).
    parse_tariffs(&body)
    // Закрываем блок.
}

/// Читает тело ответа и превращает ошибку панели в понятный текст.
// Выполняем операцию: pub(crate) async fn read_body(response: reqwest::Respon.
pub(crate) async fn read_body(response: reqwest::Response) -> AppResult<String> {
    // Объявляем переменную status .
    let status = response.status();

    // Проверяем условие: let Some(length) = response.content_length() {.
    if let Some(length) = response.content_length() {
        // Проверяем условие: length > MAX_RESPONSE_BYTES as u64 {.
        if length > MAX_RESPONSE_BYTES as u64 {
            // Возвращаем результат из функции.
            return Err(AppError::custom("Ответ панели слишком велик"));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную bytes .
    let bytes = response
        // Выполняем операцию: .bytes().
        .bytes()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ошибка сети:.
        .map_err(|error| AppError::custom(format!("Ошибка сети: {error}")))?;

    // Проверяем условие: bytes.len() > MAX_RESPONSE_BYTES {.
    if bytes.len() > MAX_RESPONSE_BYTES {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Ответ панели слишком велик"));
        // Закрываем блок.
    }

    // Объявляем переменную body .
    let body = String::from_utf8_lossy(&bytes).to_string();

    // Проверяем условие: !status.is_success() {.
    if !status.is_success() {
        // Возвращаем результат из функции.
        return Err(panel_error(status.as_u16(), &body));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(body).
    Ok(body)
    // Закрываем блок.
}

/// Ошибка входа: сессия панели недействительна.
// Объявляем функцию unauthorized_error.
pub fn unauthorized_error() -> AppError {
    // Выполняем операцию: AppError::custom(UNAUTHORIZED_MARKER).
    AppError::custom(UNAUTHORIZED_MARKER)
    // Закрываем блок.
}

/// Ошибка лимита: панель временно не пускает.
// Объявляем функцию rate_limited_error.
pub fn rate_limited_error(message: &str) -> AppError {
    // Выполняем операцию: AppError::custom(message.to_string()).
    AppError::custom(message.to_string())
    // Закрываем блок.
}

/// Описание сетевой ошибки с причиной.
///
/// Без цепочки причин ошибка выглядит одинаково при любой проблеме:
/// не резолвится домен, не проходит TLS или просто нет сети. Пользователю
/// это различие нужно.
// Объявляем функцию describe_network_error.
pub fn describe_network_error(error: &reqwest::Error) -> String {
    // Объявляем переменную text .
    let mut text = error.to_string();
    // Объявляем переменную source .
    let mut source = std::error::Error::source(error);

    // Повторяем, пока выполняется условие.
    while let Some(cause) = source {
        // Объявляем переменную message .
        let message = cause.to_string();

        // Проверяем условие: !message.is_empty() && !text.contains(&message) {.
        if !message.is_empty() && !text.contains(&message) {
            // Выполняем операцию: text.push_str(": ");.
            text.push_str(": ");
            // Выполняем операцию: text.push_str(&message);.
            text.push_str(&message);
            // Закрываем блок.
        }

        // Выполняем операцию: source = cause.source();.
        source = cause.source();
        // Закрываем блок.
    }

    // Выполняем операцию: text.
    text
    // Закрываем блок.
}

/// Текст ошибки панели из тела ответа.
// Объявляем функцию error_message.
pub fn error_message(body: &str) -> String {
    // Проверяем условие: let Ok(envelope) = serde_json::from_str::<ApiError.
    if let Ok(envelope) = serde_json::from_str::<ApiErrorEnvelope>(body) {
        // Проверяем условие: let Some(error) = envelope.error {.
        if let Some(error) = envelope.error {
            // Объявляем переменную message .
            let message = error.message.trim();

            // Проверяем условие: !message.is_empty() {.
            if !message.is_empty() {
                // Возвращаем результат из функции.
                return message.to_string();
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: "неизвестная ошибка".to_string().
    "неизвестная ошибка".to_string()
    // Закрываем блок.
}

/// Текст ошибки панели.
// Объявляем функцию panel_error.
fn panel_error(status: u16, body: &str) -> AppError {
    // Проверяем условие: status == 401 {.
    if status == 401 {
        // Возвращаем результат из функции.
        return unauthorized_error();
        // Закрываем блок.
    }

    // Объявляем переменную message .
    let message = error_message(body);

    // Проверяем условие: message == "неизвестная ошибка" {.
    if message == "неизвестная ошибка" {
        // Возвращаем результат из функции.
        return AppError::custom(format!("Панель ответила {status}"));
        // Закрываем блок.
    }

    // Проверяем условие: status == 429 {.
    if status == 429 {
        // Возвращаем результат из функции.
        return rate_limited_error(&format!("{RATE_LIMITED_MARKER}: {message}"));
        // Закрываем блок.
    }

    // Выполняем операцию: AppError::custom(format!("Панель ответила {status}: {me.
    AppError::custom(format!("Панель ответила {status}: {message}"))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "panel_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
