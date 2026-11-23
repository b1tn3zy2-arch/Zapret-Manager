// Подключаем модули: std::collections::HashSet;.
use std::collections::HashSet;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::sanitize::{validate_domain, validate_i.
use crate::security::sanitize::{validate_domain, validate_ip_range};

// Объявляем константу GAMES_DIR_NAME.
pub const GAMES_DIR_NAME: &str = "zapret-manager";
// Объявляем константу GAMES_HOSTLIST_NAME.
pub const GAMES_HOSTLIST_NAME: &str = "list-games.txt";
// Объявляем константу GAMES_IPSET_NAME.
pub const GAMES_IPSET_NAME: &str = "ipset-games.txt";
// Объявляем константу GAMES_EXCLUDE_NAME.
pub const GAMES_EXCLUDE_NAME: &str = "list-games-exclude.txt";

// Объявляем константу ANTICHEAT_EXCLUDE.
pub const ANTICHEAT_EXCLUDE: &[&str] = &[
    // Выполняем операцию: "easyanticheat.net",.
    "easyanticheat.net",
    // Выполняем операцию: "battleye.com",.
    "battleye.com",
    // Выполняем операцию: "battleye.net",.
    "battleye.net",
    // Выполняем операцию: "eac-cleanup.com",.
    "eac-cleanup.com",
    // Закрываем выражение или коллекцию.
];
// Объявляем константу GAMES_ENTRY_LIMIT.
pub const GAMES_ENTRY_LIMIT: usize = 2000;

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
// Объявляем структуру GamesPayload.
pub struct GamesPayload {
    // Выполняем операцию: pub exclude: Option<PathBuf>,.
    pub exclude: Option<PathBuf>,
    // Выполняем операцию: pub udp_ports: Vec<u16>,.
    pub udp_ports: Vec<u16>,
    // Выполняем операцию: pub udp_fake: Option<PathBuf>,.
    pub udp_fake: Option<PathBuf>,
    // Выполняем операцию: pub hostlist: Option<PathBuf>,.
    pub hostlist: Option<PathBuf>,
    // Выполняем операцию: pub ipset: Option<PathBuf>,.
    pub ipset: Option<PathBuf>,
    // Выполняем операцию: pub domains_count: usize,.
    pub domains_count: usize,
    // Выполняем операцию: pub ips_count: usize,.
    pub ips_count: usize,
    // Закрываем блок.
}

// Объявляем функцию games_dir.
pub fn games_dir() -> PathBuf {
    // Выполняем операцию: std::env::temp_dir().join(GAMES_DIR_NAME).
    std::env::temp_dir().join(GAMES_DIR_NAME)
    // Закрываем блок.
}

// Объявляем функцию normalize_domain.
pub fn normalize_domain(raw: &str) -> Option<String> {
    // Объявляем переменную value .
    let value = raw.trim().trim_end_matches('.').to_ascii_lowercase();

    // Проверяем условие: value.is_empty() || value.contains(char::is_whites.
    if value.is_empty() || value.contains(char::is_whitespace) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(value).
    Some(value)
    // Закрываем блок.
}

// Объявляем функцию normalize_ip.
pub fn normalize_ip(raw: &str) -> Option<String> {
    // Объявляем переменную value .
    let value = raw.trim().to_string();

    // Проверяем условие: value.is_empty() || value.contains(char::is_whites.
    if value.is_empty() || value.contains(char::is_whitespace) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(value).
    Some(value)
    // Закрываем блок.
}

// Объявляем функцию valid_domains.
fn valid_domains(values: &[String]) -> Vec<String> {
    // Выполняем операцию: values.
    values
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter_map(|value| normalize_domain(value)).
        .filter_map(|value| normalize_domain(value))
        // Выполняем операцию: .filter(|value| validate_domain(value).is_ok()).
        .filter(|value| validate_domain(value).is_ok())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию valid_ips.
fn valid_ips(values: &[String]) -> Vec<String> {
    // Выполняем операцию: values.
    values
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter_map(|value| normalize_ip(value)).
        .filter_map(|value| normalize_ip(value))
        // Выполняем операцию: .filter(|value| validate_ip_range(value).is_ok()).
        .filter(|value| validate_ip_range(value).is_ok())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию collect_unique.
fn collect_unique(
    // Выполняем операцию: values: &[String],.
    values: &[String],
    // Выполняем операцию: normalize: fn(&str) -> Option<String>,.
    normalize: fn(&str) -> Option<String>,
    // Выполняем операцию: limit: usize,.
    limit: usize,
    // Закрываем выражение или коллекцию.
) -> Vec<String> {
    // Объявляем переменную seen.
    let mut seen: HashSet<String> = HashSet::new();
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for value in values {
        // Объявляем переменную Some(normalized) .
        let Some(normalized) = normalize(value) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: seen.insert(normalized.clone()) {.
        if seen.insert(normalized.clone()) {
            // Выполняем операцию: result.push(normalized);.
            result.push(normalized);
            // Проверяем условие: result.len() >= limit {.
            if result.len() >= limit {
                // Выполняем операцию: break;.
                break;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию write_list.
fn write_list(dir: &Path, name: &str, header: &str, entries: &[String]) -> AppResult<PathBuf> {
    // Выполняем операцию: std::fs::create_dir_all(dir).map_err(AppError::Io)?;.
    std::fs::create_dir_all(dir).map_err(AppError::Io)?;

    // Объявляем переменную path .
    let path = dir.join(name);
    // Объявляем переменную content .
    let mut content = String::from(header);

    // Проверяем условие: !content.ends_with('\n') {.
    if !content.ends_with('\n') {
        // Выполняем операцию: content.push('\n');.
        content.push('\n');
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for entry in entries {
        // Выполняем операцию: content.push_str(entry);.
        content.push_str(entry);
        // Выполняем операцию: content.push('\n');.
        content.push('\n');
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::write(&path, content).map_err(AppError::Io)?;.
    std::fs::write(&path, content).map_err(AppError::Io)?;

    // Выполняем операцию: Ok(path).
    Ok(path)
    // Закрываем блок.
}

// Объявляем функцию generate.
pub fn generate(
    // Выполняем операцию: dir: &Path,.
    dir: &Path,
    // Выполняем операцию: domains: &[String],.
    domains: &[String],
    // Выполняем операцию: ips: &[String],.
    ips: &[String],
    // Выполняем операцию: ports: &[u16],.
    ports: &[u16],
    // Выполняем операцию: strategy_dir: Option<&Path>,.
    strategy_dir: Option<&Path>,
    // Закрываем выражение или коллекцию.
) -> AppResult<GamesPayload> {
    // Объявляем переменную unique_domains .
    let unique_domains =
        // Выполняем операцию: collect_unique(&valid_domains(domains), normalize_domai.
        collect_unique(&valid_domains(domains), normalize_domain, GAMES_ENTRY_LIMIT);
    // Объявляем переменную unique_ips .
    let unique_ips = collect_unique(&valid_ips(ips), normalize_ip, GAMES_ENTRY_LIMIT);

    // Объявляем переменную exclude .
    let exclude = if unique_domains.is_empty() {
        // Выполняем операцию: None.
        None
    // Закрываем блок.
    } else {
        // Выполняем операцию: Some(write_list(.
        Some(write_list(
            // Выполняем операцию: dir,.
            dir,
            // Выполняем операцию: GAMES_EXCLUDE_NAME,.
            GAMES_EXCLUDE_NAME,
            // Выполняем операцию: "# Generated by Zapret",.
            "# Generated by Zapret",
            // Выполняем операцию: &ANTICHEAT_EXCLUDE.
            &ANTICHEAT_EXCLUDE
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .map(|value| (*value).to_string()).
                .map(|value| (*value).to_string())
                // Выполняем операцию: .collect::<Vec<String>>(),.
                .collect::<Vec<String>>(),
            // Закрываем выражение или коллекцию.
        )?)
        // Закрываем блок.
    };

    // Объявляем переменную hostlist .
    let hostlist = if unique_domains.is_empty() {
        // Выполняем операцию: None.
        None
    // Закрываем блок.
    } else {
        // Выполняем операцию: Some(write_list(.
        Some(write_list(
            // Выполняем операцию: dir,.
            dir,
            // Выполняем операцию: GAMES_HOSTLIST_NAME,.
            GAMES_HOSTLIST_NAME,
            // Выполняем операцию: "# Generated by Zapret",.
            "# Generated by Zapret",
            // Выполняем операцию: &unique_domains,.
            &unique_domains,
            // Закрываем выражение или коллекцию.
        )?)
        // Закрываем блок.
    };

    // Объявляем переменную ipset .
    let ipset = if unique_ips.is_empty() {
        // Выполняем операцию: None.
        None
    // Закрываем блок.
    } else {
        // Выполняем операцию: Some(write_list(.
        Some(write_list(
            // Выполняем операцию: dir,.
            dir,
            // Выполняем операцию: GAMES_IPSET_NAME,.
            GAMES_IPSET_NAME,
            // Выполняем операцию: "# Generated by Zapret",.
            "# Generated by Zapret",
            // Выполняем операцию: &unique_ips,.
            &unique_ips,
            // Закрываем выражение или коллекцию.
        )?)
        // Закрываем блок.
    };

    // Объявляем переменную udp_ports.
    let udp_ports: Vec<u16> = {
        // Объявляем переменную unique.
        let mut unique: Vec<u16> = ports
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .copied().
            .copied()
            // Выполняем операцию: .filter(|value| *value > 0 && *value != 80 && *value !=.
            .filter(|value| *value > 0 && *value != 80 && *value != 443)
            // Выполняем операцию: .collect();.
            .collect();

        // Выполняем операцию: unique.sort_unstable();.
        unique.sort_unstable();
        // Выполняем операцию: unique.dedup();.
        unique.dedup();
        // Выполняем операцию: unique.truncate(24);.
        unique.truncate(24);
        // Выполняем операцию: unique.
        unique
        // Закрываем блок.
    };

    // Объявляем переменную udp_fake .
    let udp_fake = if udp_ports.is_empty() {
        // Выполняем операцию: None.
        None
    // Закрываем блок.
    } else {
        // Выполняем операцию: resolve_udp_fake(dir, strategy_dir).
        resolve_udp_fake(dir, strategy_dir)
        // Закрываем блок.
    };

    // Выполняем операцию: Ok(GamesPayload {.
    Ok(GamesPayload {
        // Выполняем операцию: exclude,.
        exclude,
        // Выполняем операцию: udp_ports,.
        udp_ports,
        // Выполняем операцию: udp_fake,.
        udp_fake,
        // Выполняем операцию: hostlist,.
        hostlist,
        // Выполняем операцию: ipset,.
        ipset,
        // Выполняем операцию: domains_count: unique_domains.len(),.
        domains_count: unique_domains.len(),
        // Выполняем операцию: ips_count: unique_ips.len(),.
        ips_count: unique_ips.len(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Ищет payload для поддельных UDP-пакетов игрового фильтра.
///
/// Раньше смотрели только в каталоге игр (`%TEMP%\zapret-manager`), где
/// `stun.bin` не лежит: он лежит в `bin` рядом со стратегией. Из-за этого
/// `udp_fake` был `None`, условие добавления игровой UDP-группы не
/// выполнялось, и трафик игр вообще не проходил через обход по UDP.
// Объявляем функцию resolve_udp_fake.
fn resolve_udp_fake(dir: &Path, strategy_dir: Option<&Path>) -> Option<PathBuf> {
    // Объявляем переменную candidates.
    let mut candidates: Vec<PathBuf> = Vec::new();

    // Проверяем условие: let Some(strategy) = strategy_dir {.
    if let Some(strategy) = strategy_dir {
        // Выполняем операцию: candidates.push(strategy.join("bin").join("stun.bin"));.
        candidates.push(strategy.join("bin").join("stun.bin"));
        // Выполняем операцию: candidates.push(strategy.join("bin").join("ACTIVE_GAME_.
        candidates.push(strategy.join("bin").join("ACTIVE_GAME_UDP.bin"));
        // Выполняем операцию: candidates.push(strategy.join("stun.bin"));.
        candidates.push(strategy.join("stun.bin"));
        // Закрываем блок.
    }

    // Выполняем операцию: candidates.push(dir.join("bin").join("stun.bin"));.
    candidates.push(dir.join("bin").join("stun.bin"));
    // Выполняем операцию: candidates.push(dir.join("stun.bin"));.
    candidates.push(dir.join("stun.bin"));

    // Проверяем условие: let Some(parent) = dir.parent() {.
    if let Some(parent) = dir.parent() {
        // Выполняем операцию: candidates.push(parent.join("bin").join("stun.bin"));.
        candidates.push(parent.join("bin").join("stun.bin"));
        // Закрываем блок.
    }

    // Выполняем операцию: candidates.into_iter().find(|path| path.is_file()).
    candidates.into_iter().find(|path| path.is_file())
    // Закрываем блок.
}

// Объявляем функцию cleanup.
pub fn cleanup(dir: &Path) {
    // Перебираем элементы коллекции.
    for name in [GAMES_HOSTLIST_NAME, GAMES_IPSET_NAME, GAMES_EXCLUDE_NAME] {
        // Объявляем переменную path .
        let path = dir.join(name);

        // Проверяем условие: path.exists() {.
        if path.exists() {
            // Проверяем условие: let Err(error) = std::fs::remove_file(&path) {.
            if let Err(error) = std::fs::remove_file(&path) {
                // Выполняем операцию: tracing::warn!("Не удалось удалить {}: {error}", path.d.
                tracing::warn!("Не удалось удалить {}: {error}", path.display());
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем константу GAMES_TEST_LOCK.
pub static GAMES_TEST_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());
