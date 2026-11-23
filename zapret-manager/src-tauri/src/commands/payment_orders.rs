//! Создание заказа на оплату в момент нажатия «Оплатить».
//!
//! Раньше ссылки на оплату собирались один раз и вшивались в
//! бинарник: панель создаёт транзакцию на каждую пару «тариф +
//! количество устройств», а платёжная система закрывает
//! неиспользованный заказ по таймауту — пользователь открывал окно
//! оплаты и видел «Время истекло». Теперь заказ создаётся при каждом
//! клике, поэтому ссылка всегда свежая и всегда с актуальной суммой.
//!
//! Email обязателен: панель привязывает к нему аккаунт и присылает
//! письмо со ссылкой на подписку после успешного платежа.

// Подключаем модули: serde::Deserialize;.
use serde::Deserialize;
// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::commands::panel;.
use crate::commands::panel;
// Подключаем модули: crate::commands::payment_links;.
use crate::commands::payment_links;
// Подключаем модули: crate::commands::subscription::MAX_DEVICES;.
use crate::commands::subscription::MAX_DEVICES;
// Подключаем модули: crate::commands::subscription::MIN_DEVICES;.
use crate::commands::subscription::MIN_DEVICES;
// Подключаем модули: crate::error::AppError;.
use crate::error::AppError;
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::security::url_validator::is_public_host;.
use crate::security::url_validator::is_public_host;
// Подключаем модули: crate::security::url_validator::validate_https_url;.
use crate::security::url_validator::validate_https_url;

/// Запасное соответствие «срок в днях → идентификатор тарифа панели».
///
/// Живой идентификатор берётся из ответа `GET /web-app/rate`
/// (`month.id`); запасной нужен, когда тарифы не получились, но
/// платёжный эндпоинт доступен.
// Объявляем константу FALLBACK_RATE_IDS.
const FALLBACK_RATE_IDS: [(u32, u32); 4] = [(31, 2), (92, 3), (184, 4), (365, 5)];

/// Куда панель возвращает пользователя после оплаты.
///
/// Сайт сам отправляет на свой адрес приложения: повторяем его.
// Объявляем константу RETURN_URL.
const RETURN_URL: &str = "https://maximavps.cloud/";

/// Готовый заказ: свежая ссылка на оплату.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру CreatedOrder.
pub struct CreatedOrder {
    /// Свежая ссылка оплаты: открывается во встроенном окне.
    // Выполняем операцию: pub url: String,.
    pub url: String,
    /// Идентификатор транзакции панели.
    // Выполняем операцию: pub guid: String,.
    pub guid: String,
    /// Сумма заказа, рубли. None — панель не прислала сумму.
    // Выполняем операцию: pub amount: Option<u32>,.
    pub amount: Option<u32>,
    // Закрываем блок.
}

/// Тело ответа панели на создание заказа.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру CreateOrderEnvelope.
struct CreateOrderEnvelope {
    // Выполняем операцию: success: bool,.
    success: bool,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: data: Option<CreateOrderData>,.
    data: Option<CreateOrderData>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: error: Option<PanelErrorBody>,.
    error: Option<PanelErrorBody>,
    // Закрываем блок.
}

/// Полезная нагрузка создания заказа.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "snake_case")]
// Объявляем структуру CreateOrderData.
struct CreateOrderData {
    // Выполняем операцию: guid: String,.
    guid: String,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: amount: Option<u32>,.
    amount: Option<u32>,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: payment_url: Option<String>,.
    payment_url: Option<String>,
    // Закрываем блок.
}

/// Ошибка панели в теле ответа.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру PanelErrorBody.
struct PanelErrorBody {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: message: Option<String>,.
    message: Option<String>,
    // Закрываем блок.
}

/// Тело ответа `GET /web-app/transaction/{guid}`: запасной путь,
/// когда в ответе создания заказа нет ссылки.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру TransactionBody.
struct TransactionBody {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: yookassa_payment_url: Option<String>,.
    yookassa_payment_url: Option<String>,
    // Закрываем блок.
}

/// Идентификатор тарифа панели для срока в днях.
///
/// Панель нумерует тарифы сама (`month.id`), поэтому идентификатор
/// читается из живого ответа. Запасное значение — на случай, когда
/// тарифы не прочитались: соответствие зафиксировано по факту работы
/// панели и не менялось.
// Объявляем функцию fallback_rate_id.
pub fn fallback_rate_id(days: u32) -> Option<u32> {
    // Выполняем операцию: FALLBACK_RATE_IDS.
    FALLBACK_RATE_IDS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|(rate_days, _)| *rate_days == days).
        .find(|(rate_days, _)| *rate_days == days)
        // Выполняем операцию: .map(|(_, rate_id)| *rate_id).
        .map(|(_, rate_id)| *rate_id)
    // Закрываем блок.
}

/// Годится ли адрес для оплаты.
///
/// Проверка та же, что у навигации окна: https и публичный хост.
/// Список стартовых доменов дополнительно проверит команда
/// `open_payment_window`.
// Объявляем функцию validate_payment_order_url.
pub fn validate_payment_order_url(raw: &str) -> AppResult<String> {
    // Объявляем переменную url .
    let url = validate_https_url(raw)?;
    // Объявляем переменную host .
    let host = url.host_str().unwrap_or_default().to_ascii_lowercase();

    // Проверяем условие: host.is_empty() || !is_public_host(&host) {.
    if host.is_empty() || !is_public_host(&host) {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Панель прислала недопустимую ссылку оплаты",.
            "Панель прислала недопустимую ссылку оплаты",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(url.to_string()).
    Ok(url.to_string())
    // Закрываем блок.
}

/// Разбирает тело ответа на создание заказа.
///
/// Отдельная функция ради тестов: сетевая часть команды тонкая.
// Объявляем функцию parse_create_order_body.
pub fn parse_create_order_body(body: &str) -> AppResult<CreatedOrder> {
    // Объявляем переменную envelope.
    let envelope: CreateOrderEnvelope = serde_json::from_str(body)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не разобран .
        .map_err(|error| AppError::custom(format!("Не разобран ответ панели: {error}")))?;

    // Проверяем условие: !envelope.success {.
    if !envelope.success {
        // Объявляем переменную message .
        let message = envelope
            // Выполняем операцию: .error.
            .error
            // Выполняем операцию: .and_then(|error| error.message).
            .and_then(|error| error.message)
            // Выполняем операцию: .unwrap_or_else(|| "Панель не создала заказ".to_string(.
            .unwrap_or_else(|| "Панель не создала заказ".to_string());

        // Возвращаем результат из функции.
        return Err(AppError::custom(message));
        // Закрываем блок.
    }

    // Объявляем переменную data .
    let data = envelope
        // Выполняем операцию: .data.
        .data
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Панель не создала зака.
        .ok_or_else(|| AppError::custom("Панель не создала заказ"))?;

    // Выполняем операцию: Ok(CreatedOrder {.
    Ok(CreatedOrder {
        // Выполняем операцию: guid: data.guid,.
        guid: data.guid,
        // Выполняем операцию: amount: data.amount,.
        amount: data.amount,
        // Выполняем операцию: url: data.payment_url.unwrap_or_default(),.
        url: data.payment_url.unwrap_or_default(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Разбирает запасной ответ транзакции.
// Объявляем функцию parse_transaction_body.
pub fn parse_transaction_body(body: &str) -> AppResult<String> {
    // Объявляем переменную transaction.
    let transaction: TransactionBody = serde_json::from_str(body)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Не разобран .
        .map_err(|error| AppError::custom(format!("Не разобран ответ панели: {error}")))?;

    // Выполняем операцию: transaction.
    transaction
        // Выполняем операцию: .yookassa_payment_url.
        .yookassa_payment_url
        // Выполняем операцию: .filter(|url| !url.is_empty()).
        .filter(|url| !url.is_empty())
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Панель не прислала ссы.
        .ok_or_else(|| AppError::custom("Панель не прислала ссылку оплаты"))
    // Закрываем блок.
}

/// Проверяет email пользователя.
///
/// Правило то же, что у формы заказа Maxima: локальная часть без
/// пробелов, затем `@`, затем домен с точкой.
// Объявляем функцию is_valid_email.
pub fn is_valid_email(email: &str) -> bool {
    // Объявляем переменную email .
    let email = email.trim();

    // Проверяем условие: email.is_empty() || email.len() > 254 {.
    if email.is_empty() || email.len() > 254 {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную (local, domain) .
    let (local, domain) = match email.split_once('@') {
        // Выполняем операцию: Some(parts) => parts,.
        Some(parts) => parts,
        // Выполняем операцию: None => return false,.
        None => return false,
        // Закрываем блок.
    };

    // Выполняем операцию: !local.is_empty().
    !local.is_empty()
        // Выполняем операцию: && !local.contains(' ').
        && !local.contains(' ')
        // Выполняем операцию: && domain.contains('.').
        && domain.contains('.')
        // Выполняем операцию: && !domain.contains(' ').
        && !domain.contains(' ')
        // Выполняем операцию: && !domain.contains('@').
        && !domain.contains('@')
        // Выполняем операцию: && domain.split('.').all(|part| !part.is_empty()).
        && domain.split('.').all(|part| !part.is_empty())
    // Закрываем блок.
}

/// Создаёт заказ для тарифа и количества устройств.
///
/// Панель создаёт транзакцию и присылает свежую ссылку оплаты.
/// Если в ответе ссылки нет — она дочитывается из транзакции.
// Выполняем операцию: pub async fn create_payment_order(.
pub async fn create_payment_order(
    // Выполняем операцию: plan_id: &str,.
    plan_id: &str,
    // Выполняем операцию: devices: u32,.
    devices: u32,
    // Выполняем операцию: email: &str,.
    email: &str,
    // Закрываем выражение или коллекцию.
) -> AppResult<CreatedOrder> {
    // Объявляем переменную spec .
    let spec = payment_links::PLANS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|item| item.id == plan_id).
        .find(|item| item.id == plan_id)
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Неизвестный тариф"))?;.
        .ok_or_else(|| AppError::custom("Неизвестный тариф"))?;

    // Объявляем переменную email .
    let email = email.trim();

    // Проверяем условие: !is_valid_email(email) {.
    if !is_valid_email(email) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Укажите корректный email"));
        // Закрываем блок.
    }

    // Проверяем условие: !(MIN_DEVICES..=MAX_DEVICES).contains(&devices) {.
    if !(MIN_DEVICES..=MAX_DEVICES).contains(&devices) {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Недопустимое количество устройств"));
        // Закрываем блок.
    }

    // Объявляем переменную client .
    let client = panel::build_client()?;
    // Объявляем переменную rate_id .
    let rate_id = panel::rate_id_for_days(&client, spec.days)
        // Выполняем операцию: .await?.
        .await?
        // Выполняем операцию: .or_else(|| fallback_rate_id(spec.days)).
        .or_else(|| fallback_rate_id(spec.days))
        // Выполняем операцию: .ok_or_else(|| AppError::custom("Неизвестный срок тариф.
        .ok_or_else(|| AppError::custom("Неизвестный срок тарифа"))?;

    // Объявляем переменную payload .
    let payload = serde_json::json!({
        // Выполняем операцию: "email": email,.
        "email": email,
        // Выполняем операцию: "rate_id": rate_id,.
        "rate_id": rate_id,
        // Выполняем операцию: "count_devices": devices,.
        "count_devices": devices,
        // Выполняем операцию: "count_days": spec.days,.
        "count_days": spec.days,
        // Выполняем операцию: "return_url": RETURN_URL,.
        "return_url": RETURN_URL,
    // Закрываем блок.
    });

    // Объявляем переменную body .
    let body = panel::read_body(
        // Выполняем операцию: client.
        client
            // Выполняем операцию: .post(format!("{}/web-app/payments/create", panel::PANE.
            .post(format!("{}/web-app/payments/create", panel::PANEL_API_BASE))
            // Выполняем операцию: .header(reqwest::header::ACCEPT, "application/json").
            .header(reqwest::header::ACCEPT, "application/json")
            // Выполняем операцию: .json(&payload).
            .json(&payload)
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
                    // Выполняем операцию: panel::describe_network_error(&error).
                    panel::describe_network_error(&error) // Закрываем выражение или коллекцию.
                ))
                // Закрываем блок.
            })?,
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await?;.
    .await?;

    // Объявляем переменную order .
    let mut order = parse_create_order_body(&body)?;

    // Проверяем условие: order.url.is_empty() {.
    if order.url.is_empty() {
        // Объявляем переменную transaction_body .
        let transaction_body = panel::read_body(
            // Выполняем операцию: client.
            client
                // Выполняем операцию: .get(format!(.
                .get(format!(
                    // Выполняем операцию: "{}/web-app/transaction/{}",.
                    "{}/web-app/transaction/{}",
                    // Выполняем операцию: panel::PANEL_API_BASE,.
                    panel::PANEL_API_BASE,
                    // Выполняем операцию: order.guid.
                    order.guid // Закрываем выражение или коллекцию.
                ))
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
                        // Выполняем операцию: panel::describe_network_error(&error).
                        panel::describe_network_error(&error) // Закрываем выражение или коллекцию.
                    ))
                    // Закрываем блок.
                })?,
            // Закрываем выражение или коллекцию.
        )
        // Выполняем операцию: .await?;.
        .await?;

        // Выполняем операцию: order.url = parse_transaction_body(&transaction_body)?;.
        order.url = parse_transaction_body(&transaction_body)?;
        // Закрываем блок.
    }

    // Выполняем операцию: order.url = validate_payment_order_url(&order.url)?;.
    order.url = validate_payment_order_url(&order.url)?;

    // Выполняем операцию: Ok(order).
    Ok(order)
    // Закрываем блок.
}

/// Создаёт заказ и отдаёт свежую ссылку оплаты.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn create_payment_order_command(.
pub async fn create_payment_order_command(
    // Выполняем операцию: plan: String,.
    plan: String,
    // Выполняем операцию: devices: u32,.
    devices: u32,
    // Выполняем операцию: email: String,.
    email: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<CreatedOrder> {
    // Выполняем операцию: create_payment_order(&plan, devices, &email).await.
    create_payment_order(&plan, devices, &email).await
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "payment_orders_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
