// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

// Подключаем модули: crate::commands::injector_backup::{create_backup, list_.
use crate::commands::injector_backup::{create_backup, list_backups_for, BackupInfo};
// Подключаем модули: crate::commands::injector_core::{.
use crate::commands::injector_core::{
    // Выполняем операцию: ensure_readable, parse_config_paths, write_content, Con.
    ensure_readable,
    parse_config_paths,
    write_content,
    ConfigKind,
    ConfigTarget,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::injector_text::{.
use crate::commands::injector_text::{
    // Выполняем операцию: append_marker_section, chrono_stamp, collect_new_entrie.
    append_marker_section,
    chrono_stamp,
    collect_new_entries,
    remove_marker_section,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::winws::now_millis;.
use crate::commands::winws::now_millis;
// Подключаем модули: crate::constants::MAX_INJECTED_ENTRIES;.
use crate::constants::MAX_INJECTED_ENTRIES;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::paths::validate_strategy_file;.
use crate::security::paths::validate_strategy_file;
// Подключаем модули: crate::security::rate_limit::check_inject;.
use crate::security::rate_limit::check_inject;
// Подключаем модули: crate::security::sanitize::{validate_domain, validate_i.
use crate::security::sanitize::{validate_domain, validate_ip_range, validate_port};

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру InjectionReport.
pub struct InjectionReport {
    // Выполняем операцию: pub files_modified: Vec<String>,.
    pub files_modified: Vec<String>,
    // Выполняем операцию: pub domains_added: usize,.
    pub domains_added: usize,
    // Выполняем операцию: pub ips_added: usize,.
    pub ips_added: usize,
    // Выполняем операцию: pub ports_accepted: usize,.
    pub ports_accepted: usize,
    // Выполняем операцию: pub backups_created: Vec<String>,.
    pub backups_created: Vec<String>,
    // Выполняем операцию: pub skipped_duplicates: usize,.
    pub skipped_duplicates: usize,
    // Выполняем операцию: pub rejected_entries: usize,.
    pub rejected_entries: usize,
    // Закрываем блок.
}

// Объявляем функцию bat_path_of.
fn bat_path_of(strategy_path: &str) -> AppResult<PathBuf> {
    // Объявляем переменную path .
    let path = PathBuf::from(strategy_path.trim());

    // Проверяем условие: !path.is_file() {.
    if !path.is_file() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Файл стратегии не найден: {strategy_path}".
            "Файл стратегии не найден: {strategy_path}" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(path).
    Ok(path)
    // Закрываем блок.
}

// Объявляем функцию validated_bat_path.
fn validated_bat_path(strategy_path: &str) -> AppResult<PathBuf> {
    // Выполняем операцию: validate_strategy_file(&bat_path_of(strategy_path)?, No.
    validate_strategy_file(&bat_path_of(strategy_path)?, None)
    // Закрываем блок.
}

// Объявляем функцию validate_domains.
fn validate_domains(domains: &[String]) -> AppResult<Vec<String>> {
    // Объявляем переменную result .
    let mut result = Vec::with_capacity(domains.len());

    // Перебираем элементы коллекции.
    for domain in domains {
        // Выполняем операцию: result.push(validate_domain(domain)?);.
        result.push(validate_domain(domain)?);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(result).
    Ok(result)
    // Закрываем блок.
}

// Объявляем функцию validate_ips.
fn validate_ips(ips: &[String]) -> AppResult<Vec<String>> {
    // Объявляем переменную result .
    let mut result = Vec::with_capacity(ips.len());

    // Перебираем элементы коллекции.
    for ip in ips {
        // Выполняем операцию: result.push(validate_ip_range(ip)?);.
        result.push(validate_ip_range(ip)?);
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(result).
    Ok(result)
    // Закрываем блок.
}

// Объявляем функцию bat_dir_of.
fn bat_dir_of(bat_path: &Path) -> PathBuf {
    // Выполняем операцию: bat_path.
    bat_path
        // Выполняем операцию: .parent().
        .parent()
        // Выполняем операцию: .map(Path::to_path_buf).
        .map(Path::to_path_buf)
        // Выполняем операцию: .unwrap_or_else(|| PathBuf::from(".")).
        .unwrap_or_else(|| PathBuf::from("."))
    // Закрываем блок.
}

// Объявляем функцию inject_into_target.
fn inject_into_target(
    // Выполняем операцию: target: &ConfigTarget,.
    target: &ConfigTarget,
    // Выполняем операцию: candidates: &[String],.
    candidates: &[String],
    // Выполняем операцию: backup: bool,.
    backup: bool,
    // Выполняем операцию: timestamp: u64,.
    timestamp: u64,
    // Выполняем операцию: report: &mut InjectionReport,.
    report: &mut InjectionReport,
    // Закрываем выражение или коллекцию.
) {
    // Объявляем переменную path .
    let path = PathBuf::from(&target.path);
    // Объявляем переменную content .
    let content = match ensure_readable(&path) {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Инъекция пропущена: {error}");.
            tracing::warn!("Инъекция пропущена: {error}");
            // Выполняем операцию: report.rejected_entries += candidates.len();.
            report.rejected_entries += candidates.len();
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Проверяем условие: backup {.
    if backup {
        // Выбираем вариант по значению.
        match create_backup(&path, timestamp) {
            // Выполняем операцию: Ok(info) => report.backups_created.push(info.backup_pat.
            Ok(info) => report.backups_created.push(info.backup_path),
            // Выполняем операцию: Err(error) => {.
            Err(error) => {
                // Выполняем операцию: tracing::error!("Бэкап не создан, инъекция прервана: {e.
                tracing::error!("Бэкап не создан, инъекция прервана: {error}");
                // Выполняем операцию: report.rejected_entries += candidates.len();.
                report.rejected_entries += candidates.len();
                // Возвращаем результат из функции.
                return;
                // Закрываем блок.
            } // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную (entries, duplicates, rejected) .
    let (entries, duplicates, rejected) = collect_new_entries(&content, candidates, target.kind);

    // Выполняем операцию: report.skipped_duplicates += duplicates;.
    report.skipped_duplicates += duplicates;
    // Выполняем операцию: report.rejected_entries += rejected;.
    report.rejected_entries += rejected;

    // Проверяем условие: entries.is_empty() {.
    if entries.is_empty() {
        // Выполняем операцию: tracing::info!("Новых записей нет, файл без изменений: .
        tracing::info!("Новых записей нет, файл без изменений: {}", path.display());
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную note .
    let note = format!("Добавлено Zapret: {}", chrono_stamp(timestamp));
    // Объявляем переменную updated .
    let updated = append_marker_section(&content, &entries, &note);

    // Проверяем условие: let Err(error) = write_content(&path, &updated) {.
    if let Err(error) = write_content(&path, &updated) {
        // Выполняем операцию: tracing::error!("Не удалось сохранить {}: {error}", pat.
        tracing::error!("Не удалось сохранить {}: {error}", path.display());
        // Выполняем операцию: report.rejected_entries += entries.len();.
        report.rejected_entries += entries.len();
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Выбираем вариант по значению.
    match target.kind {
        // Выполняем операцию: ConfigKind::Domains => report.domains_added += entries..
        ConfigKind::Domains => report.domains_added += entries.len(),
        // Выполняем операцию: ConfigKind::Ips => report.ips_added += entries.len(),.
        ConfigKind::Ips => report.ips_added += entries.len(),
        // Закрываем блок.
    }

    // Выполняем операцию: report.
    report
        // Выполняем операцию: .files_modified.
        .files_modified
        // Выполняем операцию: .push(path.to_string_lossy().to_string());.
        .push(path.to_string_lossy().to_string());
    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Outlast Trials: {} записей добавлено в {}",.
        "Outlast Trials: {} записей добавлено в {}",
        // Выполняем операцию: entries.len(),.
        entries.len(),
        // Выполняем операцию: path.display().
        path.display() // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Объявляем функцию valid_port_count.
fn valid_port_count(ports: &[u16]) -> usize {
    // Выполняем операцию: ports.
    ports
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|port| validate_port(**port).is_ok()).
        .filter(|port| validate_port(**port).is_ok())
        // Выполняем операцию: .count().
        .count()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn inject_outlast(.
pub async fn inject_outlast(
    // Выполняем операцию: strategy_path: String,.
    strategy_path: String,
    // Выполняем операцию: domains: Vec<String>,.
    domains: Vec<String>,
    // Выполняем операцию: ips: Vec<String>,.
    ips: Vec<String>,
    // Выполняем операцию: ports: Vec<u16>,.
    ports: Vec<u16>,
    // Выполняем операцию: create_backup_flag: bool,.
    create_backup_flag: bool,
    // Закрываем выражение или коллекцию.
) -> AppResult<InjectionReport> {
    // Объявляем переменную bat_path .
    let bat_path = validated_bat_path(&strategy_path)?;
    // Выполняем операцию: check_inject(&bat_path.to_string_lossy())?;.
    check_inject(&bat_path.to_string_lossy())?;

    // Объявляем переменную dir .
    let dir = bat_dir_of(&bat_path);
    // Объявляем переменную content .
    let content = ensure_readable(&bat_path)?;
    // Объявляем переменную targets .
    let targets = parse_config_paths(&content, &dir);

    // Проверяем условие: targets.is_empty() {.
    if targets.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "В стратегии не найдено ни одного списка доменов или IP.
            "В стратегии не найдено ни одного списка доменов или IP",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Проверяем условие: domains.len() + ips.len() > MAX_INJECTED_ENTRIES {.
    if domains.len() + ips.len() > MAX_INJECTED_ENTRIES {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Слишком много записей: {} при лимите {MAX_INJECTED_ENT.
            "Слишком много записей: {} при лимите {MAX_INJECTED_ENTRIES}",
            // Выполняем операцию: domains.len() + ips.len().
            domains.len() + ips.len() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную domains .
    let domains = validate_domains(&domains)?;
    // Объявляем переменную ips .
    let ips = validate_ips(&ips)?;
    // Объявляем переменную accepted_ports .
    let accepted_ports = valid_port_count(&ports);

    // Проверяем условие: accepted_ports > 0 {.
    if accepted_ports > 0 {
        // Выполняем операцию: tracing::warn!(.
        tracing::warn!(
            // Выполняем операцию: "Порты ({accepted_ports}) не записываются в списки: win.
            "Порты ({accepted_ports}) не записываются в списки: winws берёт их из аргументов .bat, а .bat не изменяется"
        // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Объявляем переменную timestamp .
    let timestamp = now_millis();
    // Объявляем переменную report .
    let mut report = InjectionReport {
        // Выполняем операцию: ports_accepted: accepted_ports,.
        ports_accepted: accepted_ports,
        // Выполняем операцию: ..InjectionReport::default().
        ..InjectionReport::default() // Закрываем блок.
    };

    // Перебираем элементы коллекции.
    for target in &targets {
        // Объявляем переменную candidates .
        let candidates = match target.kind {
            // Выполняем операцию: ConfigKind::Domains => domains.clone(),.
            ConfigKind::Domains => domains.clone(),
            // Выполняем операцию: ConfigKind::Ips => ips.clone(),.
            ConfigKind::Ips => ips.clone(),
            // Закрываем блок.
        };

        // Выполняем операцию: inject_into_target(.
        inject_into_target(
            // Выполняем операцию: target,.
            target,
            // Выполняем операцию: &candidates,.
            &candidates,
            // Выполняем операцию: create_backup_flag,.
            create_backup_flag,
            // Выполняем операцию: timestamp,.
            timestamp,
            // Выполняем операцию: &mut report,.
            &mut report,
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(report).
    Ok(report)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn restore_backup(strategy_path: String) -> A.
pub async fn restore_backup(strategy_path: String) -> AppResult<usize> {
    // Объявляем переменную bat_path .
    let bat_path = bat_path_of(&strategy_path)?;
    // Объявляем переменную dir .
    let dir = bat_dir_of(&bat_path);
    // Объявляем переменную content .
    let content = ensure_readable(&bat_path)?;
    // Объявляем переменную targets .
    let targets = parse_config_paths(&content, &dir);
    // Объявляем переменную cleaned .
    let mut cleaned = 0usize;

    // Перебираем элементы коллекции.
    for target in &targets {
        // Объявляем переменную path .
        let path = PathBuf::from(&target.path);

        // Объявляем переменную Ok(original) .
        let Ok(original) = ensure_readable(&path) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную stripped .
        let stripped = remove_marker_section(&original);

        // Проверяем условие: stripped == original {.
        if stripped == original {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: write_content(&path, &stripped)?;.
        write_content(&path, &stripped)?;
        // Выполняем операцию: cleaned += 1;.
        cleaned += 1;
        // Выполняем операцию: tracing::info!("Секция Outlast удалена из {}", path.dis.
        tracing::info!("Секция Outlast удалена из {}", path.display());
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(cleaned).
    Ok(cleaned)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn list_backups(strategy_path: String) -> App.
pub async fn list_backups(strategy_path: String) -> AppResult<Vec<BackupInfo>> {
    // Объявляем переменную bat_path .
    let bat_path = bat_path_of(&strategy_path)?;
    // Объявляем переменную dir .
    let dir = bat_dir_of(&bat_path);
    // Объявляем переменную content .
    let content = ensure_readable(&bat_path)?;
    // Объявляем переменную targets .
    let targets = parse_config_paths(&content, &dir);
    // Объявляем переменную all.
    let mut all: Vec<BackupInfo> = Vec::new();

    // Перебираем элементы коллекции.
    for target in &targets {
        // Выполняем операцию: all.extend(list_backups_for(&PathBuf::from(&target.path.
        all.extend(list_backups_for(&PathBuf::from(&target.path)));
        // Закрываем блок.
    }

    // Выполняем операцию: all.sort_by_key(|item| std::cmp::Reverse(item.created_a.
    all.sort_by_key(|item| std::cmp::Reverse(item.created_at));

    // Выполняем операцию: Ok(all).
    Ok(all)
    // Закрываем блок.
}

// Объявляем функцию migrate_legacy_inject.
pub fn migrate_legacy_inject(lists_dir: &Path) -> usize {
    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(lists_dir) else {
        // Возвращаем результат из функции.
        return 0;
        // Закрываем блок.
    };

    // Объявляем переменную cleaned .
    let mut cleaned = 0usize;

    // Перебираем элементы коллекции.
    for entry in entries.flatten() {
        // Объявляем переменную path .
        let path = entry.path();
        // Объявляем переменную name .
        let name = path
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
            .map(|value| value.to_string_lossy().to_string())
            // Выполняем операцию: .unwrap_or_default();.
            .unwrap_or_default();

        // Проверяем условие: !name.to_ascii_lowercase().ends_with(".txt") || na.
        if !name.to_ascii_lowercase().ends_with(".txt") || name.contains(".bak") {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Ok(content) .
        let Ok(content) = std::fs::read_to_string(&path) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную stripped .
        let stripped = remove_marker_section(&content);

        // Проверяем условие: stripped == content {.
        if stripped == content {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: std::fs::write(&path, stripped).is_ok() {.
        if std::fs::write(&path, stripped).is_ok() {
            // Выполняем операцию: cleaned += 1;.
            cleaned += 1;
            // Выполняем операцию: tracing::info!(.
            tracing::info!(
                // Выполняем операцию: "Миграция инъекций: очищена старая секция в {}",.
                "Миграция инъекций: очищена старая секция в {}",
                // Выполняем операцию: path.display().
                path.display() // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: cleaned.
    cleaned
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "injector_command_tests.rs"]
// Выполняем операцию: mod injector_command_tests;.
mod injector_command_tests;
