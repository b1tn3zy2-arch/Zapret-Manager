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
    pub name: String,
    pub domains: Vec<String>,
    pub ips: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct PreparedRun {
    pub config: StrategyConfig,
    pub arguments: Vec<String>,
    pub games: GamesPayload,
}

fn flatten_games(games: &[GameRequest]) -> (Vec<String>, Vec<String>) {
    let mut domains: Vec<String> = Vec::new();
    let mut ips: Vec<String> = Vec::new();

    for game in games {
        domains.extend(game.domains.iter().cloned());
        ips.extend(game.ips.iter().cloned());
    }

    (domains, ips)
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
    let (domains, ips) = flatten_games(games);

    if !games.is_empty() {
        let names: Vec<&str> = games.iter().map(|game| game.name.as_str()).collect();
        tracing::info!("Инъекция игр: {}", names.join(", "));
    }

    let games_payload = games_hostlist::generate(
        &games_hostlist::games_dir(),
        &domains,
        &ips,
    )?;

    let options = BuildOptions {
        log_path: Some(log_path),
        games_hostlist: games_payload.hostlist.as_deref(),
        games_ipset: games_payload.ipset.as_deref(),
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
