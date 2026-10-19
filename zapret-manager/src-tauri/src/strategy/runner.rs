use std::path::{Path, PathBuf};

use serde::Deserialize;

use crate::error::{AppError, AppResult};

use super::config::{BuildOptions, StrategyConfig};
use super::games_hostlist::{self, GamesPayload};
use super::parser;

const USER_LIST_FILES: &[(&str, &str)] = &[
    ("ipset-exclude-user.txt", "203.0.113.113/32\r\n"),
    (
        "list-general-user.txt",
        "# Never leave this file empty\r\ndomain.example.abc\r\n",
    ),
    ("list-exclude-user.txt", "domain.example.abc\r\n"),
];

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameRequest {
    pub ports: Vec<u16>,
    pub name: String,
    pub domains: Vec<String>,
    pub ips: Vec<String>,
    /// id пресета из настроек: попадает только в лог, чтобы было видно,
    /// профиль какой именно игры подставлен в конфиг winws
    #[serde(default)]
    pub id: Option<String>,
    /// Игра с античитом: игровую UDP-группу добавлять нельзя, иначе
    /// EasyAntiCheat не проходит инициализацию
    #[serde(default)]
    pub drop_udp_filter: bool,
    /// Игра с античитом: список игровых адресов через `--ipset` не подставляем
    #[serde(default)]
    pub drop_ipset: bool,
}

#[derive(Debug, Clone)]
pub struct PreparedRun {
    pub config: StrategyConfig,
    pub arguments: Vec<String>,
    pub games: GamesPayload,
}

fn flatten_games(games: &[GameRequest]) -> (Vec<String>, Vec<String>, Vec<u16>) {
    let mut domains: Vec<String> = Vec::new();
    let mut ips: Vec<String> = Vec::new();
    let mut ports: Vec<u16> = Vec::new();

    for game in games {
        domains.extend(game.domains.iter().cloned());
        ips.extend(game.ips.iter().cloned());
        ports.extend(game.ports.iter().copied());
    }

    (domains, ips, ports)
}

pub fn ensure_user_lists(working_dir: &Path) -> AppResult<()> {
    let lists_dir = working_dir.join("lists");

    for (name, content) in USER_LIST_FILES {
        let path = lists_dir.join(name);

        if path.exists() {
            continue;
        }

        std::fs::create_dir_all(&lists_dir).map_err(AppError::Io)?;
        std::fs::write(&path, content).map_err(AppError::Io)?;
        tracing::info!("Создан отсутствующий список {}", path.display());
    }

    Ok(())
}

pub fn prepare_run(
    bat_path: &Path,
    content: &str,
    games: &[GameRequest],
    log_path: &Path,
) -> AppResult<PreparedRun> {
    let working_dir = bat_path.parent().unwrap_or_else(|| Path::new("."));
    let filename = bat_path
        .file_name()
        .map(|name| name.to_string_lossy().to_string())
        .unwrap_or_default();

    ensure_user_lists(working_dir)?;

    let config = parser::parse_bat(content, &filename, working_dir)?;
    let (domains, ips, ports) = flatten_games(games);

    if !games.is_empty() {
        let names: Vec<String> = games
            .iter()
            .map(|game| match game.id.as_deref() {
                Some(id) if !id.is_empty() => format!("{} [{}]", game.name, id),
                _ => game.name.clone(),
            })
            .collect();
        tracing::info!("Инъекция игр: {}", names.join(", "));
        tracing::info!(
            "Игры в конфиге: {} доменов, {} портов (udp: {:?})",
            domains.len(),
            ports.len(),
            ports
        );
    }

    let games_payload = games_hostlist::generate(
        &games_hostlist::games_dir(),
        &domains,
        &ips,
        &ports,
        Some(working_dir),
    )?;

    // Игры с античитом идут без UDP-fake и без `--ipset`: обе опции заставляют
    // EasyAntiCheat спотыкаться на инициализации. Хостлист при этом остаётся —
    // именно он выводит трафик игры под обход.
    let eac_safe = games.iter().any(|game| game.drop_udp_filter);
    let ipset_off = games.iter().any(|game| game.drop_ipset);

    if eac_safe || ipset_off {
        tracing::warn!(
            "античит: игровая UDP-группа и/или --ipset отключены для {}",
            games
                .iter()
                .filter(|game| game.drop_udp_filter || game.drop_ipset)
                .map(|game| game.name.as_str())
                .collect::<Vec<&str>>()
                .join(", ")
        );
    }

    let options = BuildOptions {
        log_path: Some(log_path),
        games_hostlist: games_payload.hostlist.as_deref(),
        games_hostlist_exclude: games_payload.exclude.as_deref(),
        games_udp_ports: (!eac_safe).then_some(games_payload.udp_ports.as_slice()),
        games_udp_fake: (!eac_safe).then_some(games_payload.udp_fake.as_deref()).flatten(),
        games_ipset: (!ipset_off)
            .then_some(games_payload.ipset.as_deref())
            .flatten(),
        extra_args: &[],
    };

    let arguments = config.build_args(&options);

    Ok(PreparedRun {
        config,
        arguments,
        games: games_payload,
    })
}

pub fn resolve_winws_path(config: &StrategyConfig, working_dir: &Path) -> PathBuf {
    let configured = PathBuf::from(&config.winws_path);

    if configured.is_file() {
        return configured;
    }

    working_dir.join("bin").join("winws.exe")
}

pub fn cleanup_games() {
    games_hostlist::cleanup(&games_hostlist::games_dir());
}
