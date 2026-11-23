// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Deserialize;.
use serde::Deserialize;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Подключаем модули: super::config::{BuildOptions, StrategyConfig};.
use super::config::{BuildOptions, StrategyConfig};
// Подключаем модули: super::games_hostlist::{self, GamesPayload};.
use super::games_hostlist::{self, GamesPayload};
// Подключаем модули: super::parser;.
use super::parser;

// Объявляем константу USER_LIST_FILES.
const USER_LIST_FILES: &[(&str, &str)] = &[
    // Выполняем операцию: ("ipset-exclude-user.txt", "203.0.113.113/32\r\n"),.
    ("ipset-exclude-user.txt", "203.0.113.113/32\r\n"),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: "list-general-user.txt",.
        "list-general-user.txt",
        // Выполняем операцию: "# Never leave this file empty\r\ndomain.example.abc\r\.
        "# Never leave this file empty\r\ndomain.example.abc\r\n",
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: ("list-exclude-user.txt", "domain.example.abc\r\n"),.
    ("list-exclude-user.txt", "domain.example.abc\r\n"),
    // Закрываем выражение или коллекцию.
];

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру GameRequest.
pub struct GameRequest {
    // Выполняем операцию: pub ports: Vec<u16>,.
    pub ports: Vec<u16>,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub domains: Vec<String>,.
    pub domains: Vec<String>,
    // Выполняем операцию: pub ips: Vec<String>,.
    pub ips: Vec<String>,
    /// id пресета из настроек: попадает только в лог, чтобы было видно,
    /// профиль какой именно игры подставлен в конфиг winws
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub id: Option<String>,.
    pub id: Option<String>,
    /// Игра с античитом: игровую UDP-группу добавлять нельзя, иначе
    /// EasyAntiCheat не проходит инициализацию
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub drop_udp_filter: bool,.
    pub drop_udp_filter: bool,
    /// Игра с античитом: список игровых адресов через `--ipset` не подставляем
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub drop_ipset: bool,.
    pub drop_ipset: bool,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone)]
// Объявляем структуру PreparedRun.
pub struct PreparedRun {
    // Выполняем операцию: pub config: StrategyConfig,.
    pub config: StrategyConfig,
    // Выполняем операцию: pub arguments: Vec<String>,.
    pub arguments: Vec<String>,
    // Выполняем операцию: pub games: GamesPayload,.
    pub games: GamesPayload,
    // Закрываем блок.
}

// Объявляем функцию flatten_games.
fn flatten_games(games: &[GameRequest]) -> (Vec<String>, Vec<String>, Vec<u16>) {
    // Объявляем переменную domains.
    let mut domains: Vec<String> = Vec::new();
    // Объявляем переменную ips.
    let mut ips: Vec<String> = Vec::new();
    // Объявляем переменную ports.
    let mut ports: Vec<u16> = Vec::new();

    // Перебираем элементы коллекции.
    for game in games {
        // Выполняем операцию: domains.extend(game.domains.iter().cloned());.
        domains.extend(game.domains.iter().cloned());
        // Выполняем операцию: ips.extend(game.ips.iter().cloned());.
        ips.extend(game.ips.iter().cloned());
        // Выполняем операцию: ports.extend(game.ports.iter().copied());.
        ports.extend(game.ports.iter().copied());
        // Закрываем блок.
    }

    // Выполняем операцию: (domains, ips, ports).
    (domains, ips, ports)
    // Закрываем блок.
}

// Объявляем функцию ensure_user_lists.
pub fn ensure_user_lists(working_dir: &Path) -> AppResult<()> {
    // Объявляем переменную lists_dir .
    let lists_dir = working_dir.join("lists");

    // Перебираем элементы коллекции.
    for (name, content) in USER_LIST_FILES {
        // Объявляем переменную path .
        let path = lists_dir.join(name);

        // Проверяем условие: path.exists() {.
        if path.exists() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: std::fs::create_dir_all(&lists_dir).map_err(AppError::I.
        std::fs::create_dir_all(&lists_dir).map_err(AppError::Io)?;
        // Выполняем операцию: std::fs::write(&path, content).map_err(AppError::Io)?;.
        std::fs::write(&path, content).map_err(AppError::Io)?;
        // Выполняем операцию: tracing::info!("Создан отсутствующий список {}", path.d.
        tracing::info!("Создан отсутствующий список {}", path.display());
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию prepare_run.
pub fn prepare_run(
    // Выполняем операцию: bat_path: &Path,.
    bat_path: &Path,
    // Выполняем операцию: content: &str,.
    content: &str,
    // Выполняем операцию: games: &[GameRequest],.
    games: &[GameRequest],
    // Выполняем операцию: log_path: &Path,.
    log_path: &Path,
    // Закрываем выражение или коллекцию.
) -> AppResult<PreparedRun> {
    // Объявляем переменную working_dir .
    let working_dir = bat_path.parent().unwrap_or_else(|| Path::new("."));
    // Объявляем переменную filename .
    let filename = bat_path
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .map(|name| name.to_string_lossy().to_string()).
        .map(|name| name.to_string_lossy().to_string())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: ensure_user_lists(working_dir)?;.
    ensure_user_lists(working_dir)?;

    // Объявляем переменную config .
    let config = parser::parse_bat(content, &filename, working_dir)?;
    // Объявляем переменную (domains, ips, ports) .
    let (domains, ips, ports) = flatten_games(games);

    // Проверяем условие: !games.is_empty() {.
    if !games.is_empty() {
        // Объявляем переменную names.
        let names: Vec<String> = games
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .map(|game| match game.id.as_deref() {.
            .map(|game| match game.id.as_deref() {
                // Выполняем операцию: Some(id) if !id.is_empty() => format!("{} [{}]", game.n.
                Some(id) if !id.is_empty() => format!("{} [{}]", game.name, id),
                // Выполняем операцию: _ => game.name.clone(),.
                _ => game.name.clone(),
                // Закрываем блок.
            })
            // Выполняем операцию: .collect();.
            .collect();
        // Выполняем операцию: tracing::info!("Инъекция игр: {}", names.join(", "));.
        tracing::info!("Инъекция игр: {}", names.join(", "));
        // Выполняем операцию: tracing::info!(.
        tracing::info!(
            // Выполняем операцию: "Игры в конфиге: {} доменов, {} портов (udp: {:?})",.
            "Игры в конфиге: {} доменов, {} портов (udp: {:?})",
            // Выполняем операцию: domains.len(),.
            domains.len(),
            // Выполняем операцию: ports.len(),.
            ports.len(),
            // Выполняем операцию: ports.
            ports // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Объявляем переменную games_payload .
    let games_payload = games_hostlist::generate(
        // Выполняем операцию: &games_hostlist::games_dir(),.
        &games_hostlist::games_dir(),
        // Выполняем операцию: &domains,.
        &domains,
        // Выполняем операцию: &ips,.
        &ips,
        // Выполняем операцию: &ports,.
        &ports,
        // Выполняем операцию: Some(working_dir),.
        Some(working_dir),
        // Закрываем выражение или коллекцию.
    )?;

    // Игры с античитом идут без UDP-fake и без `--ipset`: обе опции заставляют
    // EasyAntiCheat спотыкаться на инициализации. Хостлист при этом остаётся —
    // именно он выводит трафик игры под обход.
    // Объявляем переменную eac_safe .
    let eac_safe = games.iter().any(|game| game.drop_udp_filter);
    // Объявляем переменную ipset_off .
    let ipset_off = games.iter().any(|game| game.drop_ipset);

    // Проверяем условие: eac_safe || ipset_off {.
    if eac_safe || ipset_off {
        // Выполняем операцию: tracing::warn!(.
        tracing::warn!(
            // Выполняем операцию: "античит: игровая UDP-группа и/или --ipset отключены дл.
            "античит: игровая UDP-группа и/или --ipset отключены для {}",
            // Выполняем операцию: games.
            games
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .filter(|game| game.drop_udp_filter || game.drop_ipset).
                .filter(|game| game.drop_udp_filter || game.drop_ipset)
                // Выполняем операцию: .map(|game| game.name.as_str()).
                .map(|game| game.name.as_str())
                // Выполняем операцию: .collect::<Vec<&str>>().
                .collect::<Vec<&str>>()
                // Выполняем операцию: .join(", ").
                .join(", ") // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Объявляем переменную options .
    let options = BuildOptions {
        // Выполняем операцию: log_path: Some(log_path),.
        log_path: Some(log_path),
        // Выполняем операцию: games_hostlist: games_payload.hostlist.as_deref(),.
        games_hostlist: games_payload.hostlist.as_deref(),
        // Выполняем операцию: games_hostlist_exclude: games_payload.exclude.as_deref(.
        games_hostlist_exclude: games_payload.exclude.as_deref(),
        // Выполняем операцию: games_udp_ports: (!eac_safe).then_some(games_payload.ud.
        games_udp_ports: (!eac_safe).then_some(games_payload.udp_ports.as_slice()),
        // Выполняем операцию: games_udp_fake: (!eac_safe).
        games_udp_fake: (!eac_safe)
            // Выполняем операцию: .then_some(games_payload.udp_fake.as_deref()).
            .then_some(games_payload.udp_fake.as_deref())
            // Выполняем операцию: .flatten(),.
            .flatten(),
        // Выполняем операцию: games_ipset: (!ipset_off).
        games_ipset: (!ipset_off)
            // Выполняем операцию: .then_some(games_payload.ipset.as_deref()).
            .then_some(games_payload.ipset.as_deref())
            // Выполняем операцию: .flatten(),.
            .flatten(),
        // Выполняем операцию: extra_args: &[],.
        extra_args: &[],
        // Закрываем блок.
    };

    // Объявляем переменную arguments .
    let arguments = config.build_args(&options);

    // Выполняем операцию: Ok(PreparedRun {.
    Ok(PreparedRun {
        // Выполняем операцию: config,.
        config,
        // Выполняем операцию: arguments,.
        arguments,
        // Выполняем операцию: games: games_payload,.
        games: games_payload,
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию resolve_winws_path.
pub fn resolve_winws_path(config: &StrategyConfig, working_dir: &Path) -> PathBuf {
    // Объявляем переменную configured .
    let configured = PathBuf::from(&config.winws_path);

    // Проверяем условие: configured.is_file() {.
    if configured.is_file() {
        // Возвращаем результат из функции.
        return configured;
        // Закрываем блок.
    }

    // Выполняем операцию: working_dir.join("bin").join("winws.exe").
    working_dir.join("bin").join("winws.exe")
    // Закрываем блок.
}

// Объявляем функцию cleanup_games.
pub fn cleanup_games() {
    // Выполняем операцию: games_hostlist::cleanup(&games_hostlist::games_dir());.
    games_hostlist::cleanup(&games_hostlist::games_dir());
    // Закрываем блок.
}
