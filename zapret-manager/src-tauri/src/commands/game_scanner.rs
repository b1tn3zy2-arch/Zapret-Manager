use std::path::Path;

use tauri::{AppHandle, Emitter};

use super::game_heuristics::merge_games;
use super::game_known::{anticheat_of, KnownGames};
use super::game_model::{GameScanProgress, GameSource, InstalledGame};
use super::game_sources_registry::{scan_gog, scan_gog_folders, scan_ubisoft};
use super::game_sources_stores::{scan_epic, scan_steam};
use super::game_sources_system::{
    scan_known_folders, scan_store_folders, scan_uninstall_registry, scan_user_folders,
    scan_user_home_games,
};
use crate::error::{AppError, AppResult};

pub const EVENT_SCAN_PROGRESS: &str = "game-scan-progress";
pub const MAX_SCANNED_GAMES: usize = 200;

struct ScanStep {
    source: GameSource,
    run: fn(&[String]) -> Vec<InstalledGame>,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KnownGameMatch {
    pub appid: String,
    pub name: String,
    pub cover: Option<String>,
    pub domain_settings_id: Option<String>,
    pub anticheat: String,
    pub bypass_mode: Option<String>,
}

#[tauri::command]
pub fn match_known_game(app: AppHandle, name: String) -> Option<KnownGameMatch> {
    let known = super::game_known::load_known_games(&app);
    let entry = known.by_name(&name)?;

    Some(KnownGameMatch {
        appid: entry.appid.clone(),
        name: entry.name.clone(),
        cover: entry.cover.clone(),
        domain_settings_id: entry.domain_settings_id.clone(),
        anticheat: super::game_known::anticheat_of(entry).as_str().to_string(),
        bypass_mode: entry.bypass_mode.clone(),
    })
}

#[tauri::command]
pub async fn scan_installed_games(
    app: AppHandle,
    user_folders: Option<Vec<String>>,
) -> AppResult<Vec<InstalledGame>> {
    let handle = app.clone();
    let folders = user_folders.unwrap_or_default();

    tauri::async_runtime::spawn_blocking(move || run_scan(&handle, &folders))
        .await
        .map_err(|error| AppError::custom(format!("Сканирование прервано: {error}")))?
}

fn run_scan(app: &AppHandle, user_folders: &[String]) -> AppResult<Vec<InstalledGame>> {
    let known = super::game_known::load_known_games(app);
    let mut found: Vec<InstalledGame> = Vec::new();

    for step in scan_steps() {
        emit_progress(app, step.source, found.len());

        found.extend((step.run)(user_folders));
    }

    let mut merged = merge_games(existing_only(found));

    enrich(&known, &mut merged);
    merged.truncate(MAX_SCANNED_GAMES);
    emit_progress(app, GameSource::UserFolder, merged.len());

    if known.is_empty() {
        tracing::debug!("База известных игр пуста");
    }

    tracing::info!("Игр найдено: {} из базы {}", merged.len(), known.len());
    tracing::debug!(
        "Найдены игры: {}",
        merged
            .iter()
            .map(|game| game.name.as_str())
            .collect::<Vec<_>>()
            .join(", ")
    );

    Ok(merged)
}

fn scan_steps() -> Vec<ScanStep> {
    vec![
        ScanStep {
            source: GameSource::Registry,
            run: |_| scan_uninstall_registry(),
        },
        ScanStep {
            source: GameSource::Steam,
            run: |_| scan_steam(),
        },
        ScanStep {
            source: GameSource::Epic,
            run: |_| scan_epic(),
        },
        ScanStep {
            source: GameSource::Gog,
            run: |_| {
                let mut games = scan_gog();

                games.extend(scan_gog_folders());

                games
            },
        },
        ScanStep {
            source: GameSource::Ubisoft,
            run: |_| scan_ubisoft(),
        },
        ScanStep {
            source: GameSource::Ea,
            run: |_| scan_store_folders(),
        },
        ScanStep {
            source: GameSource::KnownFolder,
            run: |_| {
                let mut games = scan_known_folders();

                games.extend(scan_user_home_games());

                games
            },
        },
        ScanStep {
            source: GameSource::UserFolder,
            run: |folders| scan_user_folders(folders),
        },
    ]
}

fn emit_progress(app: &AppHandle, source: GameSource, found: usize) {
    let payload = GameScanProgress {
        source: source.as_str().to_string(),
        found,
        current: source.as_str().to_string(),
    };

    let _ = app.emit(EVENT_SCAN_PROGRESS, payload);
}

fn existing_only(games: Vec<InstalledGame>) -> Vec<InstalledGame> {
    games
        .into_iter()
        .filter(|game| Path::new(&game.executable_path).is_file())
        .collect()
}

pub fn enrich(known: &KnownGames, games: &mut [InstalledGame]) {
    for game in games.iter_mut() {
        let entry = game
            .appid
            .as_deref()
            .and_then(|appid| known.by_appid(appid))
            .or_else(|| known.by_name(&game.name));

        if let Some(entry) = entry {
            game.appid = game
                .appid
                .clone()
                .or_else(|| Some(entry.appid.clone()));
            game.cover_url = entry.cover.clone();
            game.game_settings_id = entry.domain_settings_id.clone();
            game.anticheat = Some(anticheat_of(entry).as_str().to_string());
            game.bypass_mode = entry.bypass_mode.clone();
            game.name = entry.name.clone();
        }
    }
}

#[cfg(test)]
#[path = "game_scanner_tests.rs"]
mod tests;