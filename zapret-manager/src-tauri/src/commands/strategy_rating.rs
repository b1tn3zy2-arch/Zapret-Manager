//! Реальный рейтинг стратегий.
//!
//! Оценка берётся только из HTTPS-замеров: Rust обходит сервисы
//! стратегии, измеряет задержку, джиттер, долю успешных запросов и
//! покрытие сервисов. Никаких выдуманных цифр: пока мало замеров,
//! карточка честно показывает «нет данных».
//!
//! Результат привязан к тройке «содержимое стратегии — сеть — ПК»:
//! другой провайдер или другой компьютер не переиспользует чужой
//! результат, а изменение `.bat` сбрасывает старую оценку.

// Подключаем модули: std::path::Path;.
use std::path::Path;
// Подключаем модули: std::time::{Duration, Instant};.
use std::time::{Duration, Instant};

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};
// Подключаем модули: sha2::{Digest, Sha256};.
use sha2::{Digest, Sha256};

// Подключаем модули: crate::commands::network::{fetch_network_info, NetworkI.
use crate::commands::network::{fetch_network_info, NetworkInfo};
// Подключаем модули: crate::commands::vpn_store::app_data_dir;.
use crate::commands::vpn_store::app_data_dir;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::ensure_size;.
use crate::security::ensure_size;

/// Хранилище рейтингов.
// Объявляем константу RATINGS_FILE.
const RATINGS_FILE: &str = "strategy-ratings.json";

/// Лимит файла.
// Объявляем константу MAX_RATINGS_BYTES.
const MAX_RATINGS_BYTES: u64 = 512 * 1024;

/// Максимальное число сохранённых записей.
// Объявляем константу MAX_RECORDS.
const MAX_RECORDS: usize = 1000;

/// Схема хранилища: старые записи с другим форматом отбрасываются.
// Объявляем константу RATINGS_VERSION.
pub const RATINGS_VERSION: u32 = 2;

/// Сколько серий замеров нужно, чтобы показывать рейтинг.
// Объявляем константу MIN_SAMPLES_FOR_SCORE.
pub const MIN_SAMPLES_FOR_SCORE: u32 = 2;

/// Таймаут одного HTTPS-замера.
// Объявляем константу MEASURE_TIMEOUT_MS.
const MEASURE_TIMEOUT_MS: u64 = 3_000;

/// Сколько проб делается на каждый сервис за одну серию.
///
/// Одна проба за серию делает оценку лотереей: единичный сетевой сбой
/// одновременно обнулял и «успех», и «покрытие», и они всегда совпадали.
/// Три пробы с паузой дают медиане устоять перед разовым выбросом
/// (первая проба платит за TCP+TLS handshake, следующие едут по
/// прогретому соединению), а метрики расходятся: успех — доля проб,
/// покрытие — доля сервисов, ответивших хотя бы раз.
// Объявляем константу PROBES_PER_SERVICE.
const PROBES_PER_SERVICE: usize = 3;

/// Пауза между пробами одного сервиса, мс.
// Объявляем константу PROBE_GAP_MS.
const PROBE_GAP_MS: u64 = 150;

/// Нормировка задержки: 400 мс и выше сводят вклад к нулю.
// Объявляем константу MAX_ACCEPTABLE_LATENCY_MS.
const MAX_ACCEPTABLE_LATENCY_MS: f64 = 400.0;

/// Нормировка джиттера: 100 мС сводят вклад к нулю.
// Объявляем константу MAX_ACCEPTABLE_JITTER_MS.
const MAX_ACCEPTABLE_JITTER_MS: f64 = 100.0;

/// Версия движка замера: меняется вместе с формулой/эндпоинтами.
// Объявляем константу ENGINE_VERSION.
const ENGINE_VERSION: u32 = 2;

/// Один HTTPS-замер.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyCheckResult.
pub struct StrategyCheckResult {
    /// Целевая HTTPS-ссылка.
    // Выполняем операцию: pub target: String,.
    pub target: String,
    // Выполняем операцию: pub latency_ms: Option<u64>,.
    pub latency_ms: Option<u64>,
    // Выполняем операцию: pub success: bool,.
    pub success: bool,
    // Закрываем блок.
}

/// Одна серия HTTPS-замеров.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyMeasurementSummary.
pub struct StrategyMeasurementSummary {
    // Выполняем операцию: pub checks: Vec<StrategyCheckResult>,.
    pub checks: Vec<StrategyCheckResult>,
    /// Медианная задержка успешных запросов.
    // Выполняем операцию: pub median_latency_ms: Option<u64>,.
    pub median_latency_ms: Option<u64>,
    /// Разброс успешных задержек (макс − мин).
    // Выполняем операцию: pub jitter_ms: Option<u64>,.
    pub jitter_ms: Option<u64>,
    /// Доля успешных запросов, 0..=1.
    // Выполняем операцию: pub success_rate: f64,.
    pub success_rate: f64,
    /// Доля среагировавших сервисов, 0..=1.
    // Выполняем операцию: pub coverage: f64,.
    pub coverage: f64,
    // Выполняем операцию: pub measured_at: u64,.
    pub measured_at: u64,
    // Закрываем блок.
}

/// Вход замера: стратегия и список её сервисов.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyMeasurementInput.
pub struct StrategyMeasurementInput {
    // Выполняем операцию: pub strategy_id: String,.
    pub strategy_id: String,
    // Выполняем операцию: pub strategy_path: String,.
    pub strategy_path: String,
    // Выполняем операцию: pub services: Vec<String>,.
    pub services: Vec<String>,
    // Закрываем блок.
}

/// Ссылка стратегии для чтения рейтинга: содержимое узнаётся из файла.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyRatingStrategyId.
pub struct StrategyRatingStrategyId {
    // Выполняем операцию: pub path: String,.
    pub path: String,
    // Закрываем блок.
}

/// Рейтинг стратегии в конкретной сети на конкретном ПК.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyRatingRecord.
pub struct StrategyRatingRecord {
    // Выполняем операцию: pub strategy_id: String,.
    pub strategy_id: String,
    /// SHA-256 содержимого `.bat` + версия движка замера.
    // Выполняем операцию: pub strategy_hash: String,.
    pub strategy_hash: String,
    // Выполняем операцию: pub network_key: String,.
    pub network_key: String,
    /// Название провайдера из NetworkInfo, для подписи на странице.
    // Выполняем операцию: pub provider_label: Option<String>,.
    pub provider_label: Option<String>,
    /// Локальный хеш машины, никуда не отправляется.
    // Выполняем операцию: pub machine_key: String,.
    pub machine_key: String,
    /// Сколько серий замеров накопилось.
    // Выполняем операцию: pub samples: u32,.
    pub samples: u32,
    /// Рейтинг 0..=100. До [`MIN_SAMPLES_FOR_SCORE`] — `None`.
    // Выполняем операцию: pub rating_score: Option<f64>,.
    pub rating_score: Option<f64>,
    // Выполняем операцию: pub coverage: Option<f64>,.
    pub coverage: Option<f64>,
    // Выполняем операцию: pub success_rate: Option<f64>,.
    pub success_rate: Option<f64>,
    // Выполняем операцию: pub median_latency_ms: Option<u64>,.
    pub median_latency_ms: Option<u64>,
    // Выполняем операцию: pub jitter_ms: Option<u64>,.
    pub jitter_ms: Option<u64>,
    // Выполняем операцию: pub last_measured_at: u64,.
    pub last_measured_at: u64,
    // Закрываем блок.
}

/// Уникальный ключ записи внутри хранилища.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
// Объявляем структуру RatingKey.
struct RatingKey {
    // Выполняем операцию: strategy_hash: String,.
    strategy_hash: String,
    // Выполняем операцию: network_key: String,.
    network_key: String,
    // Выполняем операцию: machine_key: String,.
    machine_key: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default)]
// Объявляем структуру RatingStorage.
struct RatingStorage {
    // Выполняем операцию: records: std::collections::BTreeMap<RatingKey, Strategy.
    records: std::collections::BTreeMap<RatingKey, StrategyRatingRecord>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру RatingFile.
struct RatingFile {
    // Выполняем операцию: version: u32,.
    version: u32,
    // Выполняем операцию: records: Vec<StrategyRatingRecord>,.
    records: Vec<StrategyRatingRecord>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl RatingStorage {
    // Объявляем функцию insert.
    fn insert(&mut self, record: StrategyRatingRecord) {
        // Объявляем переменную key .
        let key = RatingKey {
            // Выполняем операцию: strategy_hash: record.strategy_hash.clone(),.
            strategy_hash: record.strategy_hash.clone(),
            // Выполняем операцию: network_key: record.network_key.clone(),.
            network_key: record.network_key.clone(),
            // Выполняем операцию: machine_key: record.machine_key.clone(),.
            machine_key: record.machine_key.clone(),
            // Закрываем блок.
        };

        // Выполняем операцию: self.records.insert(key, record);.
        self.records.insert(key, record);
        // Закрываем блок.
    }

    // Объявляем функцию prune.
    fn prune(&mut self) {
        // Проверяем условие: self.records.len() <= MAX_RECORDS {.
        if self.records.len() <= MAX_RECORDS {
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        }

        // Объявляем переменную extra .
        let extra = self.records.len().saturating_sub(MAX_RECORDS);
        // Объявляем переменную sorted.
        let mut sorted: Vec<(&RatingKey, &StrategyRatingRecord)> = self.records.iter().collect();
        // Выполняем операцию: sorted.sort_by_key(|(_, record)| record.last_measured_a.
        sorted.sort_by_key(|(_, record)| record.last_measured_at);

        // Отдельный owned-список: ссылки из `sorted` держат заём
        // `self.records`, и удалять записи внутри того же цикла нельзя.
        // Объявляем переменную keys.
        let mut keys: Vec<RatingKey> = Vec::with_capacity(extra);
        // Перебираем элементы коллекции.
        for (key, _) in sorted.into_iter().take(extra) {
            // Выполняем операцию: keys.push(key.clone());.
            keys.push(key.clone());
            // Закрываем блок.
        }

        // Перебираем элементы коллекции.
        for key in keys {
            // Выполняем операцию: self.records.remove(&key);.
            self.records.remove(&key);
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию ratings_path.
fn ratings_path() -> AppResult<std::path::PathBuf> {
    // Выполняем операцию: Ok(app_data_dir()?.join(RATINGS_FILE)).
    Ok(app_data_dir()?.join(RATINGS_FILE))
    // Закрываем блок.
}

// Объявляем функцию read_storage.
fn read_storage() -> AppResult<RatingStorage> {
    // Объявляем переменную path .
    let path = ratings_path()?;

    // Проверяем условие: !path.exists() {.
    if !path.exists() {
        // Возвращаем результат из функции.
        return Ok(RatingStorage::default());
        // Закрываем блок.
    }

    // Выполняем операцию: ensure_size(&path, MAX_RATINGS_BYTES, "файл рейтингов").
    ensure_size(&path, MAX_RATINGS_BYTES, "файл рейтингов")?;
    // Объявляем переменную content .
    let content = std::fs::read_to_string(&path)?;

    // Объявляем переменную file .
    let file = serde_json::from_str::<RatingFile>(&content)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Файл рейтинг.
        .map_err(|error| AppError::custom(format!("Файл рейтингов повреждён: {error}")))?;

    // Проверяем условие: file.version != RATINGS_VERSION {.
    if file.version != RATINGS_VERSION {
        // Возвращаем результат из функции.
        return Ok(RatingStorage::default());
        // Закрываем блок.
    }

    // Объявляем переменную storage .
    let mut storage = RatingStorage::default();

    // Перебираем элементы коллекции.
    for record in file.records {
        // Выполняем операцию: storage.insert(record);.
        storage.insert(record);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(storage).
    Ok(storage)
    // Закрываем блок.
}

// Объявляем функцию write_storage.
fn write_storage(storage: &RatingStorage) -> AppResult<()> {
    // Объявляем переменную pruned .
    let mut pruned = storage.clone();
    // Выполняем операцию: pruned.prune();.
    pruned.prune();

    // Объявляем переменную path .
    let path = ratings_path()?;
    // Объявляем переменную content .
    let content = serde_json::to_vec_pretty(&RatingFile {
        // Выполняем операцию: version: RATINGS_VERSION,.
        version: RATINGS_VERSION,
        // Выполняем операцию: records: pruned.records.values().cloned().collect(),.
        records: pruned.records.values().cloned().collect(),
        // Закрываем блок.
    })?;
    // Объявляем переменную temp .
    let temp = path.with_extension("json.tmp");

    // Выполняем операцию: std::fs::write(&temp, content)?;.
    std::fs::write(&temp, content)?;
    // Выполняем операцию: std::fs::rename(&temp, &path)?;.
    std::fs::rename(&temp, &path)?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Идентификатор сети.
///
/// ISP + код страны + город, без публичного IP: смена адреса внутри
/// той же сети не должна обнулять пользовательский результат.
// Объявляем функцию norm_key.
fn norm_key(info: &Option<NetworkInfo>) -> String {
    // Объявляем переменную Some(info) .
    let Some(info) = info else {
        // Возвращаем результат из функции.
        return hash_string("|unknown-network");
        // Закрываем блок.
    };

    // Объявляем переменную source .
    let source = format!(
        // Выполняем операцию: "{}|{}|{}",.
        "{}|{}|{}",
        // Выполняем операцию: normalize_text(&info.isp),.
        normalize_text(&info.isp),
        // Выполняем операцию: normalize_text(&info.country_code),.
        normalize_text(&info.country_code),
        // Выполняем операцию: normalize_text(&info.city).
        normalize_text(&info.city) // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: hash_string(&source).
    hash_string(&source)
    // Закрываем блок.
}

/// Имя провайдера для подписи рейтинга.
// Объявляем функцию provider_label.
fn provider_label(info: &Option<NetworkInfo>) -> Option<String> {
    // Объявляем переменную info .
    let info = info.as_ref()?;
    // Объявляем переменную value .
    let value = normalize_text(&info.isp);

    // Проверяем условие: value.is_empty() {.
    if value.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(value).
    Some(value)
    // Закрываем блок.
}

/// Стабильный ключ машины.
///
/// Только локальный хеш сред Windows-системных переменных: он нужен,
/// чтобы на другом ПК с тем же провайдером не показывали чужой
/// рейтинг. За пределы приложения никогда не выходит.
// Объявляем функцию machine_key.
fn machine_key() -> String {
    // Объявляем переменную source .
    let mut source = String::with_capacity(64);

    // Перебираем элементы коллекции.
    for variable in [
        // Выполняем операцию: "COMPUTERNAME",.
        "COMPUTERNAME",
        // Выполняем операцию: "PROCESSOR_IDENTIFIER",.
        "PROCESSOR_IDENTIFIER",
        // Выполняем операцию: "PROCESSOR_ARCHITECTURE",.
        "PROCESSOR_ARCHITECTURE",
        // Выполняем операцию: ] {.
    ] {
        // Проверяем условие: let Ok(value) = std::env::var(variable) {.
        if let Ok(value) = std::env::var(variable) {
            // Выполняем операцию: source.push_str(&normalize_text(&value));.
            source.push_str(&normalize_text(&value));
            // Выполняем операцию: source.push(';');.
            source.push(';');
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: hash_string(&source).
    hash_string(&source)
    // Закрываем блок.
}

/// SHA-256 содержимого стратегии + версия движка.
// Выполняем операцию: pub async fn strategy_hash(path: &str) -> AppResult<Str.
pub async fn strategy_hash(path: &str) -> AppResult<String> {
    // Объявляем переменную bytes .
    let bytes = tokio::fs::read(Path::new(path))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(AppError::Io)?;.
        .map_err(AppError::Io)?;

    // Объявляем переменную hash .
    let mut hash = Sha256::new();
    // Выполняем операцию: hash.update(&bytes);.
    hash.update(&bytes);
    // Выполняем операцию: hash.update(format!("|engine-{ENGINE_VERSION}").as_byte.
    hash.update(format!("|engine-{ENGINE_VERSION}").as_bytes());

    // Выполняем операцию: Ok(hex::encode(hash.finalize())).
    Ok(hex::encode(hash.finalize()))
    // Закрываем блок.
}

// Объявляем функцию hash_string.
fn hash_string(source: &str) -> String {
    // Объявляем переменную hash .
    let mut hash = Sha256::new();
    // Выполняем операцию: hash.update(source.as_bytes());.
    hash.update(source.as_bytes());

    // Выполняем операцию: hex::encode(hash.finalize()).
    hex::encode(hash.finalize())
    // Закрываем блок.
}

// Объявляем функцию normalize_text.
fn normalize_text(value: &str) -> String {
    // Выполняем операцию: value.trim().to_string().
    value.trim().to_string()
    // Закрываем блок.
}

/// HTTPS-эндпоинт одного сервиса стратегии.
// Объявляем функцию service_endpoint.
fn service_endpoint(service: &str) -> Option<&'static str> {
    // Объявляем переменную service .
    let service = service.trim().to_ascii_lowercase();

    // Выбираем вариант по значению.
    match service.as_str() {
        // Выполняем операцию: "discord" => Some("https://discord.com/api/v10/gateway".
        "discord" => Some("https://discord.com/api/v10/gateway"),
        // Выполняем операцию: "youtube" => Some("https://www.youtube.com/generate_204.
        "youtube" => Some("https://www.youtube.com/generate_204"),
        // Выполняем операцию: "telegram" => Some("https://api.telegram.org"),.
        "telegram" => Some("https://api.telegram.org"),
        // Выполняем операцию: "outlast-trials" => Some("https://store.steampowered.co.
        "outlast-trials" => Some("https://store.steampowered.com/api/appdetails?appid=1261130"),
        // Выполняем операцию: "general" => Some("https://www.google.com/generate_204".
        "general" => Some("https://www.google.com/generate_204"),
        // Выполняем операцию: _ => None,.
        _ => None,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Замеряет все сервисы стратегии.
///
/// Пробы идут последовательно: параллельные запросы соревновались бы
/// за канал и завышали задержку друг другу.
// Объявляем функцию measure_services.
async fn measure_services(services: &[String]) -> StrategyMeasurementSummary {
    // Объявляем переменную endpoints.
    let endpoints: Vec<String> = services
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter_map(|service| service_endpoint(service)).
        .filter_map(|service| service_endpoint(service))
        // Выполняем операцию: .map(str::to_string).
        .map(str::to_string)
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .timeout(Duration::from_millis(MEASURE_TIMEOUT_MS)).
        .timeout(Duration::from_millis(MEASURE_TIMEOUT_MS))
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .ok();.
        .ok();

    // Объявляем переменную checks .
    let mut checks = Vec::with_capacity(endpoints.len() * PROBES_PER_SERVICE);

    // Перебираем элементы коллекции.
    for endpoint in &endpoints {
        // Перебираем элементы коллекции.
        for probe in 0..PROBES_PER_SERVICE {
            // Проверяем условие: probe > 0 {.
            if probe > 0 {
                // Выполняем операцию: tokio::time::sleep(Duration::from_millis(PROBE_GAP_MS)).
                tokio::time::sleep(Duration::from_millis(PROBE_GAP_MS)).await;
                // Закрываем блок.
            }

            // Объявляем переменную started .
            let started = Instant::now();
            // Объявляем переменную response .
            let response = match &client {
                // Выполняем операцию: Some(client) => client.get(endpoint).send().await.ok(),.
                Some(client) => client.get(endpoint).send().await.ok(),
                // Выполняем операцию: None => None,.
                None => None,
                // Закрываем блок.
            };
            // Объявляем переменную latency .
            let latency = started.elapsed().as_millis() as u64;

            // Объявляем переменную success .
            let success = response
                // Выполняем операцию: .map(|response| response.status().is_success()).
                .map(|response| response.status().is_success())
                // Выполняем операцию: .unwrap_or(false);.
                .unwrap_or(false);

            // Выполняем операцию: checks.push(StrategyCheckResult {.
            checks.push(StrategyCheckResult {
                // Выполняем операцию: target: endpoint.clone(),.
                target: endpoint.clone(),
                // Выполняем операцию: latency_ms: Some(latency),.
                latency_ms: Some(latency),
                // Выполняем операцию: success,.
                success,
                // Закрываем блок.
            });
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную measured_at .
    let measured_at = crate::commands::vpn_wireguard::now_secs();

    // Выполняем операцию: summary_for(checks, measured_at).
    summary_for(checks, measured_at)
    // Закрываем блок.
}

/// Считает медиану, джиттер, успех и покрытие по серии замеров.
///
/// Медленно: медиана устойчивее среднего. Успех — доля удавшихся проб,
/// покрытие — доля сервисов, ответивших хотя бы одной пробой: так
/// серия различает «сервис недоступен целиком» и «единичный сбой
/// сети на одной пробе».
// Объявляем функцию summary_for.
fn summary_for(checks: Vec<StrategyCheckResult>, measured_at: u64) -> StrategyMeasurementSummary {
    // Объявляем переменную successful_latencies.
    let mut successful_latencies: Vec<u64> = checks
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|check| check.success).
        .filter(|check| check.success)
        // Выполняем операцию: .filter_map(|check| check.latency_ms).
        .filter_map(|check| check.latency_ms)
        // Выполняем операцию: .collect();.
        .collect();
    // Выполняем операцию: successful_latencies.sort_unstable();.
    successful_latencies.sort_unstable();

    // Объявляем переменную median .
    let median = if successful_latencies.is_empty() {
        // Выполняем операцию: None.
        None
    // Закрываем блок.
    } else if successful_latencies.len().is_multiple_of(2) {
        // Объявляем переменную middle_sum .
        let middle_sum = successful_latencies[successful_latencies.len() / 2 - 1]
            // Выполняем операцию: + successful_latencies[successful_latencies.len() / 2];.
            + successful_latencies[successful_latencies.len() / 2];

        // Выполняем операцию: Some(middle_sum / 2).
        Some(middle_sum / 2)
    // Закрываем блок.
    } else {
        // Выполняем операцию: Some(successful_latencies[successful_latencies.len() / .
        Some(successful_latencies[successful_latencies.len() / 2])
        // Закрываем блок.
    };

    // Объявляем переменную jitter .
    let jitter = if successful_latencies.len() > 1 {
        // Выполняем операцию: Some(.
        Some(
            // Выполняем операцию: successful_latencies.
            successful_latencies
                // Выполняем операцию: .last().
                .last()
                // Выполняем операцию: .copied().
                .copied()
                // Выполняем операцию: .unwrap_or_default().
                .unwrap_or_default()
                // Выполняем операцию: .saturating_sub(successful_latencies.first().copied().u.
                .saturating_sub(successful_latencies.first().copied().unwrap_or_default()),
            // Закрываем выражение или коллекцию.
        )
    // Закрываем блок.
    } else {
        // Выполняем операцию: None.
        None
        // Закрываем блок.
    };

    // Объявляем переменную targets.
    let mut targets: Vec<&str> = checks.iter().map(|check| check.target.as_str()).collect();
    // Выполняем операцию: targets.sort_unstable();.
    targets.sort_unstable();
    // Выполняем операцию: targets.dedup();.
    targets.dedup();

    // Объявляем переменную covered .
    let covered = targets
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|target| {.
        .filter(|target| {
            // Выполняем операцию: checks.
            checks
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .any(|check| check.target == **target && check.success).
                .any(|check| check.target == **target && check.success)
            // Закрываем блок.
        })
        // Выполняем операцию: .count();.
        .count();

    // Объявляем переменную successes .
    let successes = checks.iter().filter(|check| check.success).count();
    // Объявляем переменную probe_total .
    let probe_total = checks.len().max(1);
    // Объявляем переменную service_total .
    let service_total = targets.len().max(1);

    // Выполняем операцию: StrategyMeasurementSummary {.
    StrategyMeasurementSummary {
        // Выполняем операцию: checks,.
        checks,
        // Выполняем операцию: median_latency_ms: median,.
        median_latency_ms: median,
        // Выполняем операцию: jitter_ms: jitter,.
        jitter_ms: jitter,
        // Выполняем операцию: success_rate: successes as f64 / probe_total as f64,.
        success_rate: successes as f64 / probe_total as f64,
        // Выполняем операцию: coverage: covered as f64 / service_total as f64,.
        coverage: covered as f64 / service_total as f64,
        // Выполняем операцию: measured_at,.
        measured_at,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Оценки одной серии: 0..=1 по каждому измерению.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy)]
// Объявляем структуру MetricSummary.
struct MetricSummary {
    // Выполняем операцию: coverage: f64,.
    coverage: f64,
    // Выполняем операцию: success_rate: f64,.
    success_rate: f64,
    // Выполняем операцию: latency: f64,.
    latency: f64,
    // Выполняем операцию: jitter: f64,.
    jitter: f64,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl MetricSummary {
    /// Взвешенная оценка 0..=100.
    ///
    /// Веса: покрытие 40%, успехи 25%, задержка 20%, джиттер 15%.
    // Объявляем функцию score.
    fn score(self) -> f64 {
        // Объявляем переменную latency_norm .
        let latency_norm = (1.0 - self.latency / MAX_ACCEPTABLE_LATENCY_MS).clamp(0.0, 1.0);
        // Объявляем переменную jitter_norm .
        let jitter_norm = (1.0 - self.jitter / MAX_ACCEPTABLE_JITTER_MS).clamp(0.0, 1.0);

        // Выполняем операцию: (40.0 * self.coverage + 25.0 * self.success_rate + 20.0.
        (40.0 * self.coverage + 25.0 * self.success_rate + 20.0 * latency_norm + 15.0 * jitter_norm)
            // Выполняем операцию: .clamp(0.0, 100.0).
            .clamp(0.0, 100.0)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl From<&StrategyMeasurementSummary> for MetricSummary {
    // Объявляем функцию from.
    fn from(sample: &StrategyMeasurementSummary) -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: coverage: sample.coverage.clamp(0.0, 1.0),.
            coverage: sample.coverage.clamp(0.0, 1.0),
            // Выполняем операцию: success_rate: sample.success_rate.clamp(0.0, 1.0),.
            success_rate: sample.success_rate.clamp(0.0, 1.0),
            // Выполняем операцию: latency: sample.
            latency: sample
                // Выполняем операцию: .median_latency_ms.
                .median_latency_ms
                // Выполняем операцию: .unwrap_or(MAX_ACCEPTABLE_LATENCY_MS as u64) as f64,.
                .unwrap_or(MAX_ACCEPTABLE_LATENCY_MS as u64) as f64,
            // Выполняем операцию: jitter: sample.jitter_ms.unwrap_or(MAX_ACCEPTABLE_JITTE.
            jitter: sample.jitter_ms.unwrap_or(MAX_ACCEPTABLE_JITTER_MS as u64) as f64,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Строит новую запись по предыдущей серии.
// Объявляем функцию record_for.
fn record_for(
    // Выполняем операцию: previous: Option<StrategyRatingRecord>,.
    previous: Option<StrategyRatingRecord>,
    // Выполняем операцию: hash: String,.
    hash: String,
    // Выполняем операцию: network_key: String,.
    network_key: String,
    // Выполняем операцию: machine_key: String,.
    machine_key: String,
    // Выполняем операцию: provider: Option<String>,.
    provider: Option<String>,
    // Выполняем операцию: input: &StrategyMeasurementInput,.
    input: &StrategyMeasurementInput,
    // Выполняем операцию: sample: StrategyMeasurementSummary,.
    sample: StrategyMeasurementSummary,
    // Закрываем выражение или коллекцию.
) -> StrategyRatingRecord {
    // Объявляем переменную samples .
    let samples = previous.as_ref().map_or(1, |record| record.samples + 1);
    // Объявляем переменную metric .
    let metric = MetricSummary::from(&sample);

    // Выполняем операцию: StrategyRatingRecord {.
    StrategyRatingRecord {
        // Выполняем операцию: strategy_id: input.strategy_id.clone(),.
        strategy_id: input.strategy_id.clone(),
        // Выполняем операцию: strategy_hash: hash,.
        strategy_hash: hash,
        // Выполняем операцию: network_key,.
        network_key,
        // Выполняем операцию: provider_label: provider,.
        provider_label: provider,
        // Выполняем операцию: machine_key,.
        machine_key,
        // Выполняем операцию: samples,.
        samples,
        // Выполняем операцию: rating_score: (samples >= MIN_SAMPLES_FOR_SCORE).then(|.
        rating_score: (samples >= MIN_SAMPLES_FOR_SCORE).then(|| metric.score()),
        // Выполняем операцию: coverage: Some(metric.coverage),.
        coverage: Some(metric.coverage),
        // Выполняем операцию: success_rate: Some(metric.success_rate),.
        success_rate: Some(metric.success_rate),
        // Выполняем операцию: median_latency_ms: sample.median_latency_ms,.
        median_latency_ms: sample.median_latency_ms,
        // Выполняем операцию: jitter_ms: sample.jitter_ms,.
        jitter_ms: sample.jitter_ms,
        // Выполняем операцию: last_measured_at: sample.measured_at,.
        last_measured_at: sample.measured_at,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Замеряет сервисы стратегии и обновляет запись рейтинга.
///
/// Команда вызывается после старта стратегии: замер идёт в фоне
/// Tokio, интерфейс не ждёт результат, но получает свежую запись для
/// обновления кеша.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn measure_strategy_rating(.
pub async fn measure_strategy_rating(
    // Выполняем операцию: input: StrategyMeasurementInput,.
    input: StrategyMeasurementInput,
    // Закрываем выражение или коллекцию.
) -> AppResult<StrategyRatingRecord> {
    // Проверяем условие: input.strategy_id.trim().is_empty() || input.strat.
    if input.strategy_id.trim().is_empty() || input.strategy_path.trim().is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Некорректный замер стратегии: пустой идентификатор или.
            "Некорректный замер стратегии: пустой идентификатор или путь",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную strategy_hash .
    let strategy_hash = strategy_hash(&input.strategy_path).await?;
    // Объявляем переменную network_info .
    let network_info = fetch_network_info().await.ok();
    // Объявляем переменную network .
    let network = norm_key(&network_info);
    // Объявляем переменную machine .
    let machine = machine_key();
    // Объявляем переменную provider .
    let provider = provider_label(&network_info);
    // Объявляем переменную sample .
    let sample = measure_services(&input.services).await;

    // Объявляем переменную storage .
    let mut storage = read_storage()?;
    // Объявляем переменную key .
    let key = RatingKey {
        // Выполняем операцию: strategy_hash: strategy_hash.clone(),.
        strategy_hash: strategy_hash.clone(),
        // Выполняем операцию: network_key: network.clone(),.
        network_key: network.clone(),
        // Выполняем операцию: machine_key: machine.clone(),.
        machine_key: machine.clone(),
        // Закрываем блок.
    };
    // Объявляем переменную previous .
    let previous = storage.records.get(&key).cloned();

    // Объявляем переменную record .
    let record = record_for(
        // Выполняем операцию: previous,.
        previous,
        // Выполняем операцию: strategy_hash,.
        strategy_hash,
        // Выполняем операцию: network,.
        network,
        // Выполняем операцию: machine,.
        machine,
        // Выполняем операцию: provider,.
        provider,
        // Выполняем операцию: &input,.
        &input,
        // Выполняем операцию: sample,.
        sample,
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: storage.insert(record.clone());.
    storage.insert(record.clone());
    // Выполняем операцию: write_storage(&storage)?;.
    write_storage(&storage)?;

    // Выполняем операцию: Ok(record).
    Ok(record)
    // Закрываем блок.
}

/// Только чтение рейтингов по списку стратегий.
///
/// Записи, чей файл не совпал по хешу или сети, не возвращаются:
/// увиденная цифра всегда отвечает за текущий файл стратегии.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_strategy_ratings(.
pub async fn get_strategy_ratings(
    // Выполняем операцию: strategies: Vec<StrategyRatingStrategyId>,.
    strategies: Vec<StrategyRatingStrategyId>,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<StrategyRatingRecord>> {
    // Объявляем переменную network_info .
    let network_info = fetch_network_info().await.ok();
    // Объявляем переменную network .
    let network = norm_key(&network_info);
    // Объявляем переменную machine .
    let machine = machine_key();
    // Объявляем переменную storage .
    let storage = read_storage()?;

    // Объявляем переменную result .
    let mut result = Vec::with_capacity(strategies.len());

    // Перебираем элементы коллекции.
    for strategy in &strategies {
        // Объявляем переменную Ok(hash) .
        let Ok(hash) = strategy_hash(&strategy.path).await else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: let Some(record) = storage.records.get(&RatingKey .
        if let Some(record) = storage.records.get(&RatingKey {
            // Выполняем операцию: strategy_hash: hash,.
            strategy_hash: hash,
            // Выполняем операцию: network_key: network.clone(),.
            network_key: network.clone(),
            // Выполняем операцию: machine_key: machine.clone(),.
            machine_key: machine.clone(),
            // Закрываем блок.
        }) {
            // Выполняем операцию: result.push(record.clone());.
            result.push(record.clone());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(result).
    Ok(result)
    // Закрываем блок.
}

/// Удаляет локальные замеры.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn reset_strategy_ratings() -> AppResult<bool.
pub async fn reset_strategy_ratings() -> AppResult<bool> {
    // Объявляем переменную path .
    let path = ratings_path()?;

    // Проверяем условие: path.exists() {.
    if path.exists() {
        // Выполняем операцию: std::fs::remove_file(&path)?;.
        std::fs::remove_file(&path)?;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(true).
    Ok(true)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "strategy_rating_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
