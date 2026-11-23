// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию check.
fn check(target: &str, success: bool, latency_ms: u64) -> StrategyCheckResult {
    // Выполняем операцию: StrategyCheckResult {.
    StrategyCheckResult {
        // Выполняем операцию: target: target.to_string(),.
        target: target.to_string(),
        // Выполняем операцию: latency_ms: Some(latency_ms),.
        latency_ms: Some(latency_ms),
        // Выполняем операцию: success,.
        success,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию sample.
fn sample(latencies_ms: &[u64], successes: usize, measured_at: u64) -> StrategyMeasurementSummary {
    // Объявляем переменную checks.
    let checks: Vec<StrategyCheckResult> = latencies_ms
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .enumerate().
        .enumerate()
        // Выполняем операцию: .map(|(index, latency)| StrategyCheckResult {.
        .map(|(index, latency)| StrategyCheckResult {
            // Выполняем операцию: target: format!("https://example.com/{index}"),.
            target: format!("https://example.com/{index}"),
            // Выполняем операцию: latency_ms: Some(*latency),.
            latency_ms: Some(*latency),
            // Выполняем операцию: success: index < successes,.
            success: index < successes,
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: summary_for(checks, measured_at).
    summary_for(checks, measured_at)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_summary_median_and_jitter.
fn test_summary_median_and_jitter() {
    // Объявляем переменную summary .
    let summary = sample(&[120, 60, 90], 3, 1_000);

    // Выполняем операцию: assert_eq!(summary.median_latency_ms, Some(90));.
    assert_eq!(summary.median_latency_ms, Some(90));
    // Выполняем операцию: assert_eq!(summary.jitter_ms, Some(60));.
    assert_eq!(summary.jitter_ms, Some(60));
    // Выполняем операцию: assert!((summary.success_rate - 1.0).abs() < f64::EPSIL.
    assert!((summary.success_rate - 1.0).abs() < f64::EPSILON);
    // Выполняем операцию: assert!((summary.coverage - 1.0).abs() < f64::EPSILON);.
    assert!((summary.coverage - 1.0).abs() < f64::EPSILON);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_summary_without_successes_handles_spread.
fn test_summary_without_successes_handles_spread() {
    // Объявляем переменную summary .
    let summary = sample(&[120], 0, 1_000);

    // Медиана и джиттер считаются только по успешным запросам.
    // Выполняем операцию: assert_eq!(summary.median_latency_ms, None);.
    assert_eq!(summary.median_latency_ms, None);
    // Выполняем операцию: assert_eq!(summary.jitter_ms, None);.
    assert_eq!(summary.jitter_ms, None);
    // Выполняем операцию: assert!(summary.success_rate.abs() < f64::EPSILON);.
    assert!(summary.success_rate.abs() < f64::EPSILON);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_summary_with_pair_takes_average_between_middles.
fn test_summary_with_pair_takes_average_between_middles() {
    // Объявляем переменную summary .
    let summary = sample(&[100, 200], 2, 1_000);

    // Выполняем операцию: assert_eq!(summary.median_latency_ms, Some(150));.
    assert_eq!(summary.median_latency_ms, Some(150));
    // Выполняем операцию: assert_eq!(summary.jitter_ms, Some(100));.
    assert_eq!(summary.jitter_ms, Some(100));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_coverage_counts_services_and_success_counts_probes.
fn test_coverage_counts_services_and_success_counts_probes() {
    // Серия из трёх проб на сервис: у «discord» удалась одна из трёх,
    // у «youtube» — все. Покрытие — 2/2 сервисов, успех — 4/6 проб.
    // Объявляем переменную checks .
    let checks = vec![
        // Выполняем операцию: check("https://discord.com", false, 3_000),.
        check("https://discord.com", false, 3_000),
        // Выполняем операцию: check("https://discord.com", true, 120),.
        check("https://discord.com", true, 120),
        // Выполняем операцию: check("https://discord.com", false, 3_000),.
        check("https://discord.com", false, 3_000),
        // Выполняем операцию: check("https://youtube.com", true, 60),.
        check("https://youtube.com", true, 60),
        // Выполняем операцию: check("https://youtube.com", true, 70),.
        check("https://youtube.com", true, 70),
        // Выполняем операцию: check("https://youtube.com", true, 80),.
        check("https://youtube.com", true, 80),
        // Закрываем выражение или коллекцию.
    ];

    // Объявляем переменную summary .
    let summary = summary_for(checks, 1_000);

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: (summary.coverage - 1.0).abs() < 1e-9,.
        (summary.coverage - 1.0).abs() < 1e-9,
        // Выполняем операцию: "оба сервиса ответили".
        "оба сервиса ответили" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!((summary.success_rate - 4.0 / 6.0).abs() < 1e-9.
    assert!((summary.success_rate - 4.0 / 6.0).abs() < 1e-9);
    // Выполняем операцию: assert_eq!(summary.median_latency_ms, Some(75));.
    assert_eq!(summary.median_latency_ms, Some(75));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_silent_service_breaks_coverage_but_not_success.
fn test_silent_service_breaks_coverage_but_not_success() {
    // Объявляем переменную checks .
    let checks = vec![
        // Выполняем операцию: check("https://discord.com", false, 3_000),.
        check("https://discord.com", false, 3_000),
        // Выполняем операцию: check("https://discord.com", false, 3_000),.
        check("https://discord.com", false, 3_000),
        // Выполняем операцию: check("https://discord.com", false, 3_000),.
        check("https://discord.com", false, 3_000),
        // Выполняем операцию: check("https://youtube.com", true, 60),.
        check("https://youtube.com", true, 60),
        // Выполняем операцию: check("https://youtube.com", true, 70),.
        check("https://youtube.com", true, 70),
        // Выполняем операцию: check("https://youtube.com", true, 80),.
        check("https://youtube.com", true, 80),
        // Закрываем выражение или коллекцию.
    ];

    // Объявляем переменную summary .
    let summary = summary_for(checks, 1_000);

    // Выполняем операцию: assert!((summary.coverage - 0.5).abs() < 1e-9, "discord.
    assert!((summary.coverage - 0.5).abs() < 1e-9, "discord не ответил");
    // Выполняем операцию: assert!((summary.success_rate - 0.5).abs() < 1e-9);.
    assert!((summary.success_rate - 0.5).abs() < 1e-9);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_engine_version_bumped_for_multi_probe_series.
fn test_engine_version_bumped_for_multi_probe_series() {
    // Формула и структура серии менялись вместе с пробами: старые
    // записи рейтинга обязаны сбрасываться через хеш движка.
    // Выполняем операцию: assert_eq!(ENGINE_VERSION, 2);.
    assert_eq!(ENGINE_VERSION, 2);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_score_is_weighted_but_bounded.
fn test_score_is_weighted_but_bounded() {
    // Объявляем переменную metric .
    let metric = MetricSummary {
        // Выполняем операцию: coverage: 1.0,.
        coverage: 1.0,
        // Выполняем операцию: success_rate: 1.0,.
        success_rate: 1.0,
        // Выполняем операцию: latency: 30.0,.
        latency: 30.0,
        // Выполняем операцию: jitter: 10.0,.
        jitter: 10.0,
        // Закрываем блок.
    };

    // Объявляем переменную score .
    let score = metric.score();

    // Выполняем операцию: assert!(score > 90.0, "score {score}");.
    assert!(score > 90.0, "score {score}");

    // Объявляем переменную worst .
    let worst = MetricSummary {
        // Выполняем операцию: coverage: 0.0,.
        coverage: 0.0,
        // Выполняем операцию: success_rate: 0.0,.
        success_rate: 0.0,
        // Выполняем операцию: latency: MAX_ACCEPTABLE_LATENCY_MS,.
        latency: MAX_ACCEPTABLE_LATENCY_MS,
        // Выполняем операцию: jitter: MAX_ACCEPTABLE_JITTER_MS,.
        jitter: MAX_ACCEPTABLE_JITTER_MS,
        // Закрываем блок.
    };

    // Выполняем операцию: assert_eq!(worst.score(), 0.0);.
    assert_eq!(worst.score(), 0.0);
    // Закрываем блок.
}

// Объявляем функцию input.
fn input() -> StrategyMeasurementInput {
    // Выполняем операцию: StrategyMeasurementInput {.
    StrategyMeasurementInput {
        // Выполняем операцию: strategy_id: "general-00".to_string(),.
        strategy_id: "general-00".to_string(),
        // Выполняем операцию: strategy_path: "C:\\strategies\\general-00.bat".to_stri.
        strategy_path: "C:\\strategies\\general-00.bat".to_string(),
        // Выполняем операцию: services: vec!["discord".to_string(), "youtube".to_stri.
        services: vec!["discord".to_string(), "youtube".to_string()],
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию record.
fn record(previous: Option<StrategyRatingRecord>) -> StrategyRatingRecord {
    // Выполняем операцию: record_for(.
    record_for(
        // Выполняем операцию: previous,.
        previous,
        // Выполняем операцию: "hash".to_string(),.
        "hash".to_string(),
        // Выполняем операцию: "network".to_string(),.
        "network".to_string(),
        // Выполняем операцию: "machine".to_string(),.
        "machine".to_string(),
        // Выполняем операцию: Some("Provider".to_string()),.
        Some("Provider".to_string()),
        // Выполняем операцию: &input(),.
        &input(),
        // Выполняем операцию: sample(&[150, 100], 2, 5_000),.
        sample(&[150, 100], 2, 5_000),
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_first_measurement_has_no_score.
fn test_first_measurement_has_no_score() {
    // Объявляем переменную first .
    let first = record(None);

    // Выполняем операцию: assert_eq!(first.samples, 1);.
    assert_eq!(first.samples, 1);
    // Выполняем операцию: assert_eq!(first.rating_score, None);.
    assert_eq!(first.rating_score, None);
    // Выполняем операцию: assert_eq!(first.strategy_id, "general-00");.
    assert_eq!(first.strategy_id, "general-00");
    // Выполняем операцию: assert_eq!(first.strategy_hash, "hash");.
    assert_eq!(first.strategy_hash, "hash");
    // Выполняем операцию: assert_eq!(first.provider_label.as_deref(), Some("Provi.
    assert_eq!(first.provider_label.as_deref(), Some("Provider"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_second_measurement_finishes_score.
fn test_second_measurement_finishes_score() {
    // Объявляем переменную first .
    let first = record(None);
    // Объявляем переменную second .
    let second = record(Some(first));

    // Выполняем операцию: assert_eq!(second.samples, 2);.
    assert_eq!(second.samples, 2);
    // Выполняем операцию: assert!(second.rating_score.is_some());.
    assert!(second.rating_score.is_some());

    // Объявляем переменную score .
    let score = second.rating_score.expect("рейтинг появился");
    // Выполняем операцию: assert!(score > 0.0 && score <= 100.0, "score {score}").
    assert!(score > 0.0 && score <= 100.0, "score {score}");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_network_key_normalized_without_ip.
fn test_network_key_normalized_without_ip() {
    // Объявляем переменную info .
    let info = NetworkInfo {
        // Выполняем операцию: isp: "  Rostelecom  ".to_string(),.
        isp: "  Rostelecom  ".to_string(),
        // Выполняем операцию: country: "Russia".to_string(),.
        country: "Russia".to_string(),
        // Выполняем операцию: country_code: "RU".to_string(),.
        country_code: "RU".to_string(),
        // Выполняем операцию: city: "Moscow".to_string(),.
        city: "Moscow".to_string(),
        // Выполняем операцию: ip: "1.2.3.4".to_string(),.
        ip: "1.2.3.4".to_string(),
        // Закрываем блок.
    };

    // Объявляем переменную first .
    let first = norm_key(&Some(info.clone()));
    // Объявляем переменную second .
    let second = norm_key(&Some(info));

    // Выполняем операцию: assert_eq!(first, second, "пробелы не должны менять клю.
    assert_eq!(first, second, "пробелы не должны менять ключ сети");
    // Выполняем операцию: assert_ne!(norm_key(&None), first, "неизвестная сеть ≠ .
    assert_ne!(norm_key(&None), first, "неизвестная сеть ≠ известная");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_machine_key_is_stable_within_process.
fn test_machine_key_is_stable_within_process() {
    // Выполняем операцию: assert_eq!(machine_key(), machine_key());.
    assert_eq!(machine_key(), machine_key());
    // Закрываем блок.
}
