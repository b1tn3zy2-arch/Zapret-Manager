use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use serde::{Deserialize, Serialize};

use crate::commands::updater_install::VERSION_FILE_NAME;
use crate::error::{AppError, AppResult};

pub const DEFAULT_REPO: &str = "Flowseal/zapret-discord-youtube";
pub const UNKNOWN_VERSION: &str = "unknown";

const USER_AGENT: &str = "Zapret-Manager/0.1.0";
const API_HOST: &str = "https://api.github.com/repos";
const HTTP_TIMEOUT: Duration = Duration::from_secs(20);

#[derive(Debug, Clone, Deserialize)]
pub struct GitHubAsset {
    pub name: String,
    pub browser_download_url: String,
    pub size: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GitHubRelease {
    pub tag_name: String,
    pub name: Option<String>,
    pub body: Option<String>,
    pub published_at: Option<String>,
    pub assets: Vec<GitHubAsset>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub available: bool,
    pub current_version: String,
    pub latest_version: String,
    pub release_name: String,
    pub release_notes: String,
    pub published_at: String,
    pub download_url: String,
    pub asset_name: String,
    pub size: u64,
    pub is_newer: bool,
    pub ignored: bool,
}

#[derive(Clone)]
pub struct UpdateState {
    cancelled: Arc<AtomicBool>,
}

impl UpdateState {
    pub fn new() -> Self {
        Self {
            cancelled: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn reset(&self) {
        self.cancelled.store(false, Ordering::SeqCst);
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::SeqCst);
    }

    pub fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::SeqCst)
    }
}

impl Default for UpdateState {
    fn default() -> Self {
        Self::new()
    }
}

pub fn validate_repo(repo: &str) -> AppResult<&str> {
    let trimmed = repo.trim().trim_matches('/');
    let mut parts = trimmed.split('/');
    let owner = parts.next().unwrap_or_default();
    let name = parts.next().unwrap_or_default();

    if parts.next().is_some() || owner.is_empty() || name.is_empty() {
        return Err(AppError::custom(
            "Репозиторий указывается в виде владелец/имя",
        ));
    }

    let allowed = |value: &str| {
        value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
    };

    if !allowed(owner) || !allowed(name) {
        return Err(AppError::custom(
            "В имени репозитория допустимы латиница, цифры, дефис, точка",
        ));
    }

    Ok(trimmed)
}

pub fn normalize_version(raw: &str) -> String {
    let trimmed = raw.trim().trim_start_matches(['v', 'V']);
    let base = trimmed.split(['-', '+']).next().unwrap_or_default().trim();

    if base.is_empty() {
        UNKNOWN_VERSION.to_string()
    } else {
        base.to_string()
    }
}

pub fn parse_version(raw: &str) -> Option<semver::Version> {
    semver::Version::parse(&normalize_version(raw)).ok()
}

pub fn is_newer(current: &str, latest: &str) -> bool {
    match (parse_version(current), parse_version(latest)) {
        (Some(current), Some(latest)) => latest > current,
        (None, Some(_)) => true,
        _ => false,
    }
}

pub fn pick_asset(assets: &[GitHubAsset]) -> Option<&GitHubAsset> {
    assets
        .iter()
        .find(|asset| asset.name.to_lowercase().ends_with(".zip"))
}

pub fn read_version(strategies_dir: &std::path::Path) -> String {
    match std::fs::read_to_string(strategies_dir.join(VERSION_FILE_NAME)) {
        Ok(content) => {
            let trimmed = content.trim();

            if trimmed.is_empty() {
                UNKNOWN_VERSION.to_string()
            } else {
                normalize_version(trimmed)
            }
        }
        Err(_) => UNKNOWN_VERSION.to_string(),
    }
}

pub fn write_version(strategies_dir: &std::path::Path, version: &str) -> AppResult<()> {
    std::fs::create_dir_all(strategies_dir)?;
    std::fs::write(
        strategies_dir.join(VERSION_FILE_NAME),
        format!("{}\n", normalize_version(version)),
    )?;

    Ok(())
}

pub fn download_path(version: &str) -> PathBuf {
    let stamp = crate::commands::monitor::now_millis();
    let name = format!("zapret-{}-{stamp}.zip", normalize_version(version));

    std::env::temp_dir()
        .join("zapret-manager")
        .join("downloads")
        .join(name)
}

async fn fetch_latest_release(repo: &str) -> AppResult<GitHubRelease> {
    let client = reqwest::Client::builder()
        .timeout(HTTP_TIMEOUT)
        .user_agent(USER_AGENT)
        .build()
        .map_err(|error| AppError::custom(error.to_string()))?;

    let url = format!("{API_HOST}/{}/releases/latest", validate_repo(repo)?);

    let response = client
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .send()
        .await
        .map_err(|error| AppError::custom(format!("GitHub недоступен: {error}")))?;

    if !response.status().is_success() {
        return Err(AppError::custom(format!(
            "GitHub вернул статус {}",
            response.status().as_u16()
        )));
    }

    response
        .json::<GitHubRelease>()
        .await
        .map_err(|error| AppError::custom(format!("Ответ GitHub не разобран: {error}")))
}

pub fn build_info(release: &GitHubRelease, current: &str, ignored: &[String]) -> UpdateInfo {
    let latest = normalize_version(&release.tag_name);
    let asset = pick_asset(&release.assets);
    let is_ignored = ignored
        .iter()
        .any(|value| normalize_version(value) == latest);
    let known_current = parse_version(current).is_some();
    let newer = is_newer(current, &latest);

    UpdateInfo {
        available: newer && !is_ignored && known_current,
        current_version: normalize_version(current),
        latest_version: latest,
        release_name: release
            .name
            .clone()
            .unwrap_or_else(|| release.tag_name.clone()),
        release_notes: release.body.clone().unwrap_or_default(),
        published_at: release.published_at.clone().unwrap_or_default(),
        download_url: asset
            .map(|item| item.browser_download_url.clone())
            .unwrap_or_default(),
        asset_name: asset.map(|item| item.name.clone()).unwrap_or_default(),
        size: asset.map(|item| item.size).unwrap_or(0),
        is_newer: newer,
        ignored: is_ignored,
    }
}

#[tauri::command]
pub async fn check_for_updates(
    repo: Option<String>,
    ignored_versions: Option<Vec<String>>,
    strategies_dir: String,
) -> AppResult<UpdateInfo> {
    let repo = repo.unwrap_or_else(|| DEFAULT_REPO.to_string());
    let release = fetch_latest_release(&repo).await?;
    let current = read_version(std::path::Path::new(&strategies_dir));
    let info = build_info(&release, &current, &ignored_versions.unwrap_or_default());

    tracing::info!(
        "Проверка обновлений {repo}: текущая {}, доступна {}, обновление {}",
        info.current_version,
        info.latest_version,
        if info.available { "есть" } else { "не требуется" }
    );

    Ok(info)
}

#[cfg(test)]
#[path = "updater_tests.rs"]
mod tests;