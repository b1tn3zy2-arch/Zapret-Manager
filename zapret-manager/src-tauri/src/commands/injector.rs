use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::commands::injector_backup::{
    create_backup, list_backups_for, restore_from_backup as restore_file_from_backup, BackupInfo,
};
use crate::commands::injector_core::{
    ensure_readable, parse_config_paths, write_content, ConfigKind, ConfigTarget,
};
use crate::commands::injector_text::{
    append_marker_section, chrono_stamp, collect_new_entries, remove_marker_section,
};
use crate::commands::winws::now_millis;
use crate::constants::{MAX_INJECTED_ENTRIES, MIN_PORT};
use crate::error::{AppError, AppResult};
use crate::security::paths::validate_strategy_file;
use crate::security::rate_limit::check_inject;
use crate::security::sanitize::{validate_domain, validate_ip_range};

#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InjectionReport {
    pub files_modified: Vec<String>,
    pub domains_added: usize,
    pub ips_added: usize,
    pub ports_accepted: usize,
    pub backups_created: Vec<String>,
    pub skipped_duplicates: usize,
    pub rejected_entries: usize,
}

fn bat_path_of(strategy_path: &str) -> AppResult<PathBuf> {
    let path = PathBuf::from(strategy_path.trim());

    if !path.is_file() {
        return Err(AppError::custom(format!(
            "Файл стратегии не найден: {strategy_path}"
        )));
    }

    Ok(path)
}

fn validated_bat_path(strategy_path: &str) -> AppResult<PathBuf> {
    validate_strategy_file(&bat_path_of(strategy_path)?, None)
}

fn validate_domains(domains: &[String]) -> AppResult<Vec<String>> {
    let mut result = Vec::with_capacity(domains.len());

    for domain in domains {
        result.push(validate_domain(domain)?);
    }

    Ok(result)
}

fn validate_ips(ips: &[String]) -> AppResult<Vec<String>> {
    let mut result = Vec::with_capacity(ips.len());

    for ip in ips {
        result.push(validate_ip_range(ip)?);
    }

    Ok(result)
}

fn bat_dir_of(bat_path: &Path) -> PathBuf {
    bat_path
        .parent()
        .map(Path::to_path_buf)
        .unwrap_or_else(|| PathBuf::from("."))
}

fn inject_into_target(
    target: &ConfigTarget,
    candidates: &[String],
    backup: bool,
    timestamp: u64,
    report: &mut InjectionReport,
) {
    let path = PathBuf::from(&target.path);
    let content = match ensure_readable(&path) {
        Ok(value) => value,
        Err(error) => {
            tracing::warn!("Инъекция пропущена: {error}");
            report.rejected_entries += candidates.len();
            return;
        }
    };

    if backup {
        match create_backup(&path, timestamp) {
            Ok(info) => report.backups_created.push(info.backup_path),
            Err(error) => {
                tracing::error!("Бэкап не создан, инъекция прервана: {error}");
                report.rejected_entries += candidates.len();
                return;
            }
        }
    }

    let (entries, duplicates, rejected) = collect_new_entries(&content, candidates, target.kind);

    report.skipped_duplicates += duplicates;
    report.rejected_entries += rejected;

    if entries.is_empty() {
        tracing::info!("Новых записей нет, файл без изменений: {}", path.display());
        return;
    }

    let note = format!(
        "Добавлено Zapret: {}",
        chrono_stamp(timestamp)
    );
    let updated = append_marker_section(&content, &entries, &note);

    if let Err(error) = write_content(&path, &updated) {
        tracing::error!("Не удалось сохранить {}: {error}", path.display());
        report.rejected_entries += entries.len();
        return;
    }

    match target.kind {
        ConfigKind::Domains => report.domains_added += entries.len(),
        ConfigKind::Ips => report.ips_added += entries.len(),
    }

    report.files_modified.push(path.to_string_lossy().to_string());
    tracing::info!(
        "Outlast Trials: {} записей добавлено в {}",
        entries.len(),
        path.display()
    );
}

fn valid_port_count(ports: &[u16]) -> usize {
    ports
        .iter()
        .filter(|port| **port >= MIN_PORT)
        .count()
}

#[tauri::command]
pub async fn inject_outlast(
    strategy_path: String,
    domains: Vec<String>,
    ips: Vec<String>,
    ports: Vec<u16>,
    create_backup_flag: bool,
) -> AppResult<InjectionReport> {
    let bat_path = validated_bat_path(&strategy_path)?;
    check_inject(&bat_path.to_string_lossy())?;

    let dir = bat_dir_of(&bat_path);
    let content = ensure_readable(&bat_path)?;
    let targets = parse_config_paths(&content, &dir);

    if targets.is_empty() {
        return Err(AppError::custom(
            "В стратегии не найдено ни одного списка доменов или IP",
        ));
    }

    if domains.len() + ips.len() > MAX_INJECTED_ENTRIES {
        return Err(AppError::custom(format!(
            "Слишком много записей: {} при лимите {MAX_INJECTED_ENTRIES}",
            domains.len() + ips.len()
        )));
    }

    let domains = validate_domains(&domains)?;
    let ips = validate_ips(&ips)?;
    let accepted_ports = valid_port_count(&ports);

    if accepted_ports > 0 {
        tracing::warn!(
            "Порты ({accepted_ports}) не записываются в списки: winws берёт их из аргументов .bat, а .bat не изменяется"
        );
    }

    let timestamp = now_millis();
    let mut report = InjectionReport {
        ports_accepted: accepted_ports,
        ..InjectionReport::default()
    };

    for target in &targets {
        let candidates = match target.kind {
            ConfigKind::Domains => domains.clone(),
            ConfigKind::Ips => ips.clone(),
        };

        inject_into_target(target, &candidates, create_backup_flag, timestamp, &mut report);
    }

    Ok(report)
}

#[tauri::command]
pub async fn restore_backup(strategy_path: String) -> AppResult<usize> {
    let bat_path = bat_path_of(&strategy_path)?;
    let dir = bat_dir_of(&bat_path);
    let content = ensure_readable(&bat_path)?;
    let targets = parse_config_paths(&content, &dir);
    let mut cleaned = 0usize;

    for target in &targets {
        let path = PathBuf::from(&target.path);

        let Ok(original) = ensure_readable(&path) else {
            continue;
        };

        let stripped = remove_marker_section(&original);

        if stripped == original {
            continue;
        }

        write_content(&path, &stripped)?;
        cleaned += 1;
        tracing::info!("Секция Outlast удалена из {}", path.display());
    }

    Ok(cleaned)
}

#[tauri::command]
pub async fn restore_from_backup(
    strategy_path: String,
    backup_timestamp: Option<u64>,
) -> AppResult<usize> {
    let bat_path = bat_path_of(&strategy_path)?;
    let dir = bat_dir_of(&bat_path);
    let content = ensure_readable(&bat_path)?;
    let targets = parse_config_paths(&content, &dir);
    let mut restored = 0usize;

    for target in &targets {
        if restore_file_from_backup(&PathBuf::from(&target.path), backup_timestamp).is_ok() {
            restored += 1;
        }
    }

    Ok(restored)
}

#[tauri::command]
pub async fn list_backups(strategy_path: String) -> AppResult<Vec<BackupInfo>> {
    let bat_path = bat_path_of(&strategy_path)?;
    let dir = bat_dir_of(&bat_path);
    let content = ensure_readable(&bat_path)?;
    let targets = parse_config_paths(&content, &dir);
    let mut all: Vec<BackupInfo> = Vec::new();

    for target in &targets {
        all.extend(list_backups_for(&PathBuf::from(&target.path)));
    }

    all.sort_by_key(|item| std::cmp::Reverse(item.created_at));

    Ok(all)
}

#[tauri::command]
pub async fn extract_config_paths(strategy_path: String) -> AppResult<Vec<String>> {
    let bat_path = bat_path_of(&strategy_path)?;
    let dir = bat_dir_of(&bat_path);
    let content = ensure_readable(&bat_path)?;

    Ok(parse_config_paths(&content, &dir)
        .into_iter()
        .map(|target| target.path)
        .collect())
}

pub fn migrate_legacy_inject(lists_dir: &Path) -> usize {
    let Ok(entries) = std::fs::read_dir(lists_dir) else {
        return 0;
    };

    let mut cleaned = 0usize;

    for entry in entries.flatten() {
        let path = entry.path();
        let name = path
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_default();

        if !name.to_ascii_lowercase().ends_with(".txt") || name.contains(".bak") {
            continue;
        }

        let Ok(content) = std::fs::read_to_string(&path) else {
            continue;
        };

        let stripped = remove_marker_section(&content);

        if stripped == content {
            continue;
        }

        if std::fs::write(&path, stripped).is_ok() {
            cleaned += 1;
            tracing::info!(
                "Миграция инъекций: очищена старая секция в {}",
                path.display()
            );
        }
    }

    cleaned
}