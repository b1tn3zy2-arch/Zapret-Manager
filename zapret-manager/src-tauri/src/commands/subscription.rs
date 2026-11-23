//! Подписка и тарифы.
//!
//! Источник данных поставщика один — ссылка на подписку, добавленная
//! пользователем. Сама ссылка содержит токен доступа, поэтому она
//! хранится только зашифрованной. Тарифы оплаты приходят из снимка
//! панели; все числа считаются здесь, а фронтенд только показывает их.

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::commands::panel;.
use crate::commands::panel;
// Подключаем модули: crate::commands::panel::PanelTariff;.
use crate::commands::panel::PanelTariff;
// Подключаем модули: crate::commands::panel_snapshot::RATES_SNAPSHOT;.
use crate::commands::panel_snapshot::RATES_SNAPSHOT;
// Подключаем модули: crate::commands::payment_links;.
use crate::commands::payment_links;
// Подключаем модули: crate::commands::subscription_store::{self, StoredSubsc.
use crate::commands::subscription_store::{self, StoredSubscription};
// Подключаем модули: crate::commands::vpn_subscription::{self, SubscriptionP.
use crate::commands::vpn_subscription::{self, SubscriptionPayload};
// Подключаем модули: crate::commands::vpn_wireguard::now_secs;.
use crate::commands::vpn_wireguard::now_secs;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

/// Состояние подписки, которое показывает карточка «Моя подписка».
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру SubscriptionInfo.
pub struct SubscriptionInfo {
    /// Израсходованный трафик, ГБ. `None`, если панель его не отдала.
    // Выполняем операцию: pub traffic_used_gb: Option<f64>,.
    pub traffic_used_gb: Option<f64>,
    /// Лимит трафика, ГБ. `None`, если лимит не указан.
    // Выполняем операцию: pub traffic_limit_gb: Option<f64>,.
    pub traffic_limit_gb: Option<f64>,
    /// Доля израсходованного трафика в процентах, 0..=100.
    // Выполняем операцию: pub traffic_percent: Option<f64>,.
    pub traffic_percent: Option<f64>,
    /// Сколько дней осталось до конца оплаченного периода.
    // Выполняем операцию: pub days_remaining: Option<u32>,.
    pub days_remaining: Option<u32>,
    /// Активна ли подписка. Без метаданных срока она считается
    /// активной: ссылка есть, а серверы — источник доступа.
    // Выполняем операцию: pub is_active: bool,.
    pub is_active: bool,
    /// Ссылка на подписку добавлена.
    // Выполняем операцию: pub is_linked: bool,.
    pub is_linked: bool,
    /// Название профиля из ответа подписки.
    // Выполняем операцию: pub title: Option<String>,.
    pub title: Option<String>,
    /// Сколько серверов было в последнем ответе.
    // Выполняем операцию: pub server_count: Option<u32>,.
    pub server_count: Option<u32>,
    /// Момент окончания оплаченного периода, UNIX-время.
    // Выполняем операцию: pub expires_at: Option<i64>,.
    pub expires_at: Option<i64>,
    /// Момент последнего успешного обновления, UNIX-время.
    // Выполняем операцию: pub last_checked_at: Option<u64>,.
    pub last_checked_at: Option<u64>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl SubscriptionInfo {
    /// Считает долю израсходованного трафика в процентах, 0..=100.
    // Объявляем функцию percent.
    fn percent(used: Option<f64>, limit: Option<f64>) -> Option<f64> {
        // Объявляем переменную (used, limit) .
        let (used, limit) = (used?, limit?);

        // Проверяем условие: limit <= 0.0 {.
        if limit <= 0.0 {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }

        // Выполняем операцию: Some((used / limit * 100.0).clamp(0.0, 100.0)).
        Some((used / limit * 100.0).clamp(0.0, 100.0))
        // Закрываем блок.
    }

    /// Состояние до добавления ссылки.
    // Объявляем функцию empty.
    fn empty() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: traffic_used_gb: None,.
            traffic_used_gb: None,
            // Выполняем операцию: traffic_limit_gb: None,.
            traffic_limit_gb: None,
            // Выполняем операцию: traffic_percent: None,.
            traffic_percent: None,
            // Выполняем операцию: days_remaining: None,.
            days_remaining: None,
            // Выполняем операцию: is_active: false,.
            is_active: false,
            // Выполняем операцию: is_linked: false,.
            is_linked: false,
            // Выполняем операцию: title: None,.
            title: None,
            // Выполняем операцию: server_count: None,.
            server_count: None,
            // Выполняем операцию: expires_at: None,.
            expires_at: None,
            // Выполняем операцию: last_checked_at: None,.
            last_checked_at: None,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    /// Состояние по последнему сохранённому снимку.
    // Объявляем функцию from_record.
    fn from_record(record: &StoredSubscription) -> Self {
        // Объявляем константу BYTES_PER_GB.
        const BYTES_PER_GB: f64 = 1024.0 * 1024.0 * 1024.0;

        // Объявляем переменную used .
        let used = if record.traffic_used_bytes == 0 {
            // Выполняем операцию: None.
            None
        // Закрываем блок.
        } else {
            // Выполняем операцию: Some(record.traffic_used_bytes as f64 / BYTES_PER_GB).
            Some(record.traffic_used_bytes as f64 / BYTES_PER_GB)
            // Закрываем блок.
        };

        // Объявляем переменную limit .
        let limit = if record.traffic_limit_bytes == 0 {
            // Выполняем операцию: None.
            None
        // Закрываем блок.
        } else {
            // Выполняем операцию: Some(record.traffic_limit_bytes as f64 / BYTES_PER_GB).
            Some(record.traffic_limit_bytes as f64 / BYTES_PER_GB)
            // Закрываем блок.
        };

        // Объявляем переменную now .
        let now = now_secs() as i64;

        // Объявляем переменную days_remaining .
        let days_remaining = record
            // Выполняем операцию: .expires_at.
            .expires_at
            // Выполняем операцию: .map(|expires| u32::try_from(expires.saturating_sub(now.
            .map(|expires| u32::try_from(expires.saturating_sub(now) / 86_400).unwrap_or(0));

        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: traffic_used_gb: used,.
            traffic_used_gb: used,
            // Выполняем операцию: traffic_limit_gb: limit,.
            traffic_limit_gb: limit,
            // Выполняем операцию: traffic_percent: Self::percent(used, limit),.
            traffic_percent: Self::percent(used, limit),
            // Выполняем операцию: days_remaining,.
            days_remaining,
            // Выполняем операцию: is_active: record.
            is_active: record
                // Выполняем операцию: .expires_at.
                .expires_at
                // Выполняем операцию: .map(|expires| expires > now).
                .map(|expires| expires > now)
                // Выполняем операцию: .unwrap_or(true),.
                .unwrap_or(true),
            // Выполняем операцию: is_linked: true,.
            is_linked: true,
            // Выполняем операцию: title: record.title.clone(),.
            title: record.title.clone(),
            // Выполняем операцию: server_count: u32::try_from(record.server_count).ok(),.
            server_count: u32::try_from(record.server_count).ok(),
            // Выполняем операцию: expires_at: record.expires_at,.
            expires_at: record.expires_at,
            // Выполняем операцию: last_checked_at: if record.updated_at == 0 {.
            last_checked_at: if record.updated_at == 0 {
                // Выполняем операцию: None.
                None
            // Закрываем блок.
            } else {
                // Выполняем операцию: Some(record.updated_at).
                Some(record.updated_at)
                // Закрываем блок.
            },
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Приводит ответ подписки к снимку метаданных.
// Объявляем функцию record_from_payload.
fn record_from_payload(url: &str, payload: &SubscriptionPayload) -> StoredSubscription {
    // Объявляем переменную record .
    let mut record = StoredSubscription::new(url);

    // Выполняем операцию: record.title = payload.title.clone();.
    record.title = payload.title.clone();
    // Выполняем операцию: record.traffic_used_bytes = payload.meta.traffic_used_b.
    record.traffic_used_bytes = payload.meta.traffic_used_bytes;
    // Выполняем операцию: record.traffic_limit_bytes = payload.meta.traffic_limit.
    record.traffic_limit_bytes = payload.meta.traffic_limit_bytes;
    // Выполняем операцию: record.expires_at = payload.meta.expires_at;.
    record.expires_at = payload.meta.expires_at;
    // Выполняем операцию: record.server_count = payload.servers.len();.
    record.server_count = payload.servers.len();
    // Выполняем операцию: record.updated_at = now_secs();.
    record.updated_at = now_secs();

    // Выполняем операцию: record.
    record
    // Закрываем блок.
}

/// Скачивает подписку и обновляет сохранённый снимок.
// Объявляем функцию download_and_store.
async fn download_and_store(url: &str) -> AppResult<StoredSubscription> {
    // Объявляем переменную payload .
    let payload = vpn_subscription::fetch_subscription_payload(url).await?;
    // Объявляем переменную record .
    let record = record_from_payload(url, &payload);

    // Выполняем операцию: subscription_store::write(&record)?;.
    subscription_store::write(&record)?;

    // Выполняем операцию: Ok(record).
    Ok(record)
    // Закрываем блок.
}

/// Тарифный план.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TariffPlan.
pub struct TariffPlan {
    /// Идентификатор плана: `1m`, `3m`, `6m`, `12m`.
    // Выполняем операцию: pub id: String,.
    pub id: String,
    /// Срок в месяцах. Из него считается цена за месяц.
    // Выполняем операцию: pub months: u32,.
    pub months: u32,
    /// Срок в днях.
    // Выполняем операцию: pub days: u32,.
    pub days: u32,
    /// Цена за одно устройство, рубли.
    // Выполняем операцию: pub base_price: u32,.
    pub base_price: u32,
    /// Пометка карточки: `none`, `popular`, `profitable`, `best`.
    // Выполняем операцию: pub highlight: String,.
    pub highlight: String,
    // Закрываем блок.
}

/// Посчитанная цена для конкретного плана и количества устройств.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TariffPrice.
pub struct TariffPrice {
    // Выполняем операцию: pub plan_id: String,.
    pub plan_id: String,
    // Выполняем операцию: pub devices: u32,.
    pub devices: u32,
    /// Итоговая цена, рубли.
    // Выполняем операцию: pub total: u32,.
    pub total: u32,
    /// Цена за месяц, рубли.
    // Выполняем операцию: pub per_month: u32,.
    pub per_month: u32,
    // Закрываем блок.
}

/// Полная матрица цен: все планы × все допустимые количества
/// устройств. Считается один раз в Rust, поэтому фронтенду не
/// приходится умножать деньги самостоятельно.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру TariffMatrix.
pub struct TariffMatrix {
    // Выполняем операцию: pub plans: Vec<TariffPlan>,.
    pub plans: Vec<TariffPlan>,
    // Выполняем операцию: pub prices: Vec<TariffPrice>,.
    pub prices: Vec<TariffPrice>,
    /// Количества устройств, которые можно купить: не подряд, а
    /// те, что продаёт панель.
    // Выполняем операцию: pub device_counts: Vec<u32>,.
    pub device_counts: Vec<u32>,
    // Закрываем блок.
}

/// Минимальное количество устройств.
// Объявляем константу MIN_DEVICES.
pub const MIN_DEVICES: u32 = 1;
/// Максимальное количество устройств.
// Объявляем константу MAX_DEVICES.
pub const MAX_DEVICES: u32 = 10;

/// Строит матрицу цен по тарифам панели.
///
/// Цены берутся из панели как есть. Если панели нет тарифа с
/// нужным сроком, план в матрицу не попадает: показывать цену,
/// которой нет, хуже, чем не показывать тариф вовсе.
// Объявляем функцию build_tariff_matrix.
pub fn build_tariff_matrix(tariffs: &[PanelTariff]) -> TariffMatrix {
    // Объявляем переменную plans .
    let mut plans = Vec::with_capacity(payment_links::PLANS.len());
    // Объявляем переменную prices .
    let mut prices = Vec::with_capacity(payment_links::PLANS.len() * MAX_DEVICES as usize);

    // Перебираем элементы коллекции.
    for spec in payment_links::PLANS {
        // Объявляем переменную Some(tariff) .
        let Some(tariff) = tariffs.iter().find(|item| item.days == spec.days) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Выполняем операцию: plans.push(TariffPlan {.
        plans.push(TariffPlan {
            // Выполняем операцию: id: spec.id.to_string(),.
            id: spec.id.to_string(),
            // Выполняем операцию: months: spec.months,.
            months: spec.months,
            // Выполняем операцию: days: spec.days,.
            days: spec.days,
            // Выполняем операцию: base_price: panel::price_for_devices(&tariff.prices, MI.
            base_price: panel::price_for_devices(&tariff.prices, MIN_DEVICES),
            // Выполняем операцию: highlight: spec.highlight.to_string(),.
            highlight: spec.highlight.to_string(),
            // Закрываем блок.
        });

        // Перебираем элементы коллекции.
        for devices in MIN_DEVICES..=MAX_DEVICES {
            // Объявляем переменную total .
            let total = panel::price_for_devices(&tariff.prices, devices);

            // Выполняем операцию: prices.push(TariffPrice {.
            prices.push(TariffPrice {
                // Выполняем операцию: plan_id: spec.id.to_string(),.
                plan_id: spec.id.to_string(),
                // Выполняем операцию: devices,.
                devices,
                // Выполняем операцию: total,.
                total,
                // Выполняем операцию: per_month: per_month_price(total, spec.months),.
                per_month: per_month_price(total, spec.months),
                // Закрываем блок.
            });
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: TariffMatrix {.
    TariffMatrix {
        // Выполняем операцию: plans,.
        plans,
        // Выполняем операцию: prices,.
        prices,
        // Выполняем операцию: device_counts: payment_links::DEVICE_COUNTS.to_vec(),.
        device_counts: payment_links::DEVICE_COUNTS.to_vec(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Цена за месяц: итоговая цена, делённая на срок.
///
/// Округление такое же, как у панели: сначала деление, потом
/// округление до целого.
// Объявляем функцию per_month_price.
pub fn per_month_price(total: u32, months: u32) -> u32 {
    // Проверяем условие: months == 0 {.
    if months == 0 {
        // Возвращаем результат из функции.
        return total;
        // Закрываем блок.
    }

    // Выполняем операцию: (f64::from(total) / f64::from(months)).round() as u32.
    (f64::from(total) / f64::from(months)).round() as u32
    // Закрываем блок.
}

/// Тарифы из снимка, сохранённого при сборке.
// Объявляем функцию snapshot_tariffs.
pub fn snapshot_tariffs() -> Vec<PanelTariff> {
    // Выполняем операцию: panel::parse_tariffs(RATES_SNAPSHOT).unwrap_or_default(.
    panel::parse_tariffs(RATES_SNAPSHOT).unwrap_or_default()
    // Закрываем блок.
}

/// Отдаёт состояние подписки без сети.
///
/// Команда предназначена для первого рендера: карточка всегда
/// показывает то, что точно сохранено, а не подгадывает под сеть.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_subscription() -> AppResult<Subscripti.
pub async fn get_subscription() -> AppResult<SubscriptionInfo> {
    // Объявляем переменную record .
    let record = subscription_store::read()?;

    // Выполняем операцию: Ok(record.
    Ok(record
        // Выполняем операцию: .map(|record| SubscriptionInfo::from_record(&record)).
        .map(|record| SubscriptionInfo::from_record(&record))
        // Выполняем операцию: .unwrap_or_else(SubscriptionInfo::empty)).
        .unwrap_or_else(SubscriptionInfo::empty))
    // Закрываем блок.
}

/// Добавляет ссылку на подписку.
///
/// URL сначала проверяется на HTTPS и публичный хост, затем
/// скачивается. Пока если список серверов пуст, ссылка не
/// сохраняется: идти работать по подписке без серверов бессмысленно.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn add_subscription(url: String) -> AppResult.
pub async fn add_subscription(url: String) -> AppResult<SubscriptionInfo> {
    // Объявляем переменную url .
    let url = vpn_subscription::validate_subscription_url(&url)?;
    // Объявляем переменную record .
    let record = download_and_store(&url).await?;

    // Выполняем операцию: Ok(SubscriptionInfo::from_record(&record)).
    Ok(SubscriptionInfo::from_record(&record))
    // Закрываем блок.
}

/// Обновляет метаданные подписки по сохранённой ссылке.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn refresh_subscription() -> AppResult<Subscr.
pub async fn refresh_subscription() -> AppResult<SubscriptionInfo> {
    // Объявляем переменную Some(stored) .
    let Some(stored) = subscription_store::read()? else {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Подписка не добавлена"));
        // Закрываем блок.
    };

    // URL валиден: он был проверен при сохранении; повторная
    // проверка защищает от ручной правки файла.
    // Объявляем переменную url .
    let url = vpn_subscription::validate_subscription_url(&stored.url)?;
    // Объявляем переменную record .
    let record = download_and_store(&url).await?;

    // Выполняем операцию: Ok(SubscriptionInfo::from_record(&record)).
    Ok(SubscriptionInfo::from_record(&record))
    // Закрываем блок.
}

/// Предзагружает список серверов после добавления.
///
/// Список в память не пишется: он считается актуальным только перед
/// подключением. Задача команды — сразу подтвердить пользователю,
/// что серверы есть.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn prepare_subscription_servers() -> AppResul.
pub async fn prepare_subscription_servers() -> AppResult<u32> {
    // Объявляем переменную Some(stored) .
    let Some(stored) = subscription_store::read()? else {
        // Возвращаем результат из функции.
        return Err(AppError::custom("Подписка не добавлена"));
        // Закрываем блок.
    };

    // Объявляем переменную url .
    let url = vpn_subscription::validate_subscription_url(&stored.url)?;
    // Объявляем переменную payload .
    let payload = vpn_subscription::fetch_subscription_payload(&url).await?;
    // Объявляем переменную count .
    let count = u32::try_from(payload.servers.len()).unwrap_or(0);

    // Проверяем условие: count == 0 {.
    if count == 0 {
        // Возвращаем результат из функции.
        return Err(AppError::custom("В подписке нет серверов"));
        // Закрываем блок.
    }

    // Метаданные могли измениться, пока пользователь вводил ссылку.
    // Объявляем переменную record .
    let mut record = record_from_payload(&stored.url, &payload);
    // Выполняем операцию: record.expires_at = stored.expires_at;.
    record.expires_at = stored.expires_at;
    // Выполняем операцию: record.traffic_used_bytes = stored.
    record.traffic_used_bytes = stored
        // Выполняем операцию: .traffic_used_bytes.
        .traffic_used_bytes
        // Выполняем операцию: .max(payload.meta.traffic_used_bytes);.
        .max(payload.meta.traffic_used_bytes);
    // Выполняем операцию: record.traffic_limit_bytes = payload.
    record.traffic_limit_bytes = payload
        // Выполняем операцию: .meta.
        .meta
        // Выполняем операцию: .traffic_limit_bytes.
        .traffic_limit_bytes
        // Выполняем операцию: .max(stored.traffic_limit_bytes);.
        .max(stored.traffic_limit_bytes);

    // Выполняем операцию: subscription_store::write(&record)?;.
    subscription_store::write(&record)?;

    // Выполняем операцию: Ok(count).
    Ok(count)
    // Закрываем блок.
}

/// Полностью удаляет подписку.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn remove_subscription() -> AppResult<()> {.
pub async fn remove_subscription() -> AppResult<()> {
    // Выполняем операцию: subscription_store::remove()?;.
    subscription_store::remove()?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Отдаёт тарифы и полную матрицу цен.
///
/// Тарифы берутся с панели. Если сеть недоступна, показываются
/// последние известные цены из снимка: показывать выдуманные
/// цены нельзя, а молчащий экран хуже, чем честные старые цифры.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn fetch_tariff_matrix() -> AppResult<TariffM.
pub async fn fetch_tariff_matrix() -> AppResult<TariffMatrix> {
    // Выполняем операцию: Ok(build_tariff_matrix(&load_tariffs().await)).
    Ok(build_tariff_matrix(&load_tariffs().await))
    // Закрываем блок.
}

/// Тарифы с панели, со снимком в запас.
// Объявляем функцию load_tariffs.
async fn load_tariffs() -> Vec<PanelTariff> {
    // Выбираем вариант по значению.
    match panel::build_client() {
        // Выполняем операцию: Ok(client) => match panel::fetch_tariffs(&client).await.
        Ok(client) => match panel::fetch_tariffs(&client).await {
            // Выполняем операцию: Ok(tariffs) if !tariffs.is_empty() => return tariffs,.
            Ok(tariffs) if !tariffs.is_empty() => return tariffs,
            // Выполняем операцию: Ok(_) => tracing::warn!("Панель вернула пустой список т.
            Ok(_) => tracing::warn!("Панель вернула пустой список тарифов"),
            // Выполняем операцию: Err(error) => tracing::warn!("Тарифы с панели не получе.
            Err(error) => tracing::warn!("Тарифы с панели не получены: {error}"),
            // Закрываем блок.
        },
        // Выполняем операцию: Err(error) => tracing::warn!("HTTP клиент не создан: {e.
        Err(error) => tracing::warn!("HTTP клиент не создан: {error}"),
        // Закрываем блок.
    }

    // Выполняем операцию: snapshot_tariffs().
    snapshot_tariffs()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "subscription_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
