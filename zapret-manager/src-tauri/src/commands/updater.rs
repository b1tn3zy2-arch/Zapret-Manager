// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;
// Подключаем модули: std::sync::atomic::{AtomicBool, Ordering};.
use std::sync::atomic::{AtomicBool, Ordering};
// Подключаем модули: std::sync::{Arc, LazyLock};.
use std::sync::{Arc, LazyLock};
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: regex::Regex;.
use regex::Regex;
// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::commands::updater_install::VERSION_FILE_NAME;.
use crate::commands::updater_install::VERSION_FILE_NAME;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Объявляем константу DEFAULT_REPO.
pub const DEFAULT_REPO: &str = "Flowseal/zapret-discord-youtube";
// Объявляем константу UNKNOWN_VERSION.
pub const UNKNOWN_VERSION: &str = "unknown";

// Объявляем константу USER_AGENT.
const USER_AGENT: &str = concat!("Zapret-Manager/", env!("CARGO_PKG_VERSION"));
// Объявляем константу API_HOST.
const API_HOST: &str = "https://api.github.com/repos";
// Объявляем константу HTTP_TIMEOUT.
const HTTP_TIMEOUT: Duration = Duration::from_secs(10);

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру GitHubAsset.
pub struct GitHubAsset {
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub browser_download_url: String,.
    pub browser_download_url: String,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    /// Хеш файла по данным GitHub (`sha256:...`). Без него
    /// загруженный архив нельзя отличить от подменённого.
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub digest: Option<String>,.
    pub digest: Option<String>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру GitHubRelease.
pub struct GitHubRelease {
    // Выполняем операцию: pub tag_name: String,.
    pub tag_name: String,
    // Выполняем операцию: pub name: Option<String>,.
    pub name: Option<String>,
    // Выполняем операцию: pub body: Option<String>,.
    pub body: Option<String>,
    // Выполняем операцию: pub published_at: Option<String>,.
    pub published_at: Option<String>,
    // Выполняем операцию: pub assets: Vec<GitHubAsset>,.
    pub assets: Vec<GitHubAsset>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру UpdateInfo.
pub struct UpdateInfo {
    // Выполняем операцию: pub available: bool,.
    pub available: bool,
    // Выполняем операцию: pub current_version: String,.
    pub current_version: String,
    // Выполняем операцию: pub latest_version: String,.
    pub latest_version: String,
    // Выполняем операцию: pub release_name: String,.
    pub release_name: String,
    // Выполняем операцию: pub release_notes: String,.
    pub release_notes: String,
    // Выполняем операцию: pub published_at: String,.
    pub published_at: String,
    // Выполняем операцию: pub download_url: String,.
    pub download_url: String,
    // Выполняем операцию: pub asset_name: String,.
    pub asset_name: String,
    /// Ожидаемый SHA-256 архива (`sha256:...`), если GitHub его
    /// отдал. Пустая строка — хеша нет, и загрузка будет отклонена.
    // Выполняем операцию: pub digest: String,.
    pub digest: String,
    // Выполняем операцию: pub size: u64,.
    pub size: u64,
    // Выполняем операцию: pub is_newer: bool,.
    pub is_newer: bool,
    // Выполняем операцию: pub ignored: bool,.
    pub ignored: bool,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Clone)]
// Объявляем структуру UpdateState.
pub struct UpdateState {
    // Выполняем операцию: cancelled: Arc<AtomicBool>,.
    cancelled: Arc<AtomicBool>,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl UpdateState {
    // Объявляем функцию new.
    pub fn new() -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: cancelled: Arc::new(AtomicBool::new(false)),.
            cancelled: Arc::new(AtomicBool::new(false)),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию reset.
    pub fn reset(&self) {
        // Выполняем операцию: self.cancelled.store(false, Ordering::SeqCst);.
        self.cancelled.store(false, Ordering::SeqCst);
        // Закрываем блок.
    }

    // Объявляем функцию cancel.
    pub fn cancel(&self) {
        // Выполняем операцию: self.cancelled.store(true, Ordering::SeqCst);.
        self.cancelled.store(true, Ordering::SeqCst);
        // Закрываем блок.
    }

    // Объявляем функцию is_cancelled.
    pub fn is_cancelled(&self) -> bool {
        // Выполняем операцию: self.cancelled.load(Ordering::SeqCst).
        self.cancelled.load(Ordering::SeqCst)
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Default for UpdateState {
    // Объявляем функцию default.
    fn default() -> Self {
        // Выполняем операцию: Self::new().
        Self::new()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию validate_repo.
pub fn validate_repo(repo: &str) -> AppResult<&str> {
    // Объявляем переменную trimmed .
    let trimmed = repo.trim().trim_matches('/');
    // Объявляем переменную parts .
    let mut parts = trimmed.split('/');
    // Объявляем переменную owner .
    let owner = parts.next().unwrap_or_default();
    // Объявляем переменную name .
    let name = parts.next().unwrap_or_default();

    // Проверяем условие: parts.next().is_some() || owner.is_empty() || name.
    if parts.next().is_some() || owner.is_empty() || name.is_empty() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Репозиторий указывается в виде владелец/имя",.
            "Репозиторий указывается в виде владелец/имя",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную allowed .
    let allowed = |value: &str| {
        // Выполняем операцию: value.
        value
            // Выполняем операцию: .chars().
            .chars()
            // Выполняем операцию: .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' |.
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.'))
        // Закрываем блок.
    };

    // Проверяем условие: !allowed(owner) || !allowed(name) {.
    if !allowed(owner) || !allowed(name) {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "В имени репозитория допустимы латиница, цифры, дефис, .
            "В имени репозитория допустимы латиница, цифры, дефис, точка",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(trimmed).
    Ok(trimmed)
    // Закрываем блок.
}

// Объявляем функцию normalize_version.
pub fn normalize_version(raw: &str) -> String {
    // Объявляем переменную trimmed .
    let trimmed = raw.trim().trim_start_matches(['v', 'V']);
    // Объявляем переменную base .
    let base = trimmed.split(['-', '+']).next().unwrap_or_default().trim();

    // Проверяем условие: base.is_empty() {.
    if base.is_empty() {
        // Выполняем операцию: UNKNOWN_VERSION.to_string().
        UNKNOWN_VERSION.to_string()
    // Закрываем блок.
    } else {
        // Выполняем операцию: base.to_string().
        base.to_string()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию parse_version.
pub fn parse_version(raw: &str) -> Option<semver::Version> {
    // Выполняем операцию: semver::Version::parse(&normalize_version(raw)).ok().
    semver::Version::parse(&normalize_version(raw)).ok()
    // Закрываем блок.
}

// Объявляем функцию is_newer.
pub fn is_newer(current: &str, latest: &str) -> bool {
    // Выбираем вариант по значению.
    match (parse_version(current), parse_version(latest)) {
        // Выполняем операцию: (Some(current), Some(latest)) => latest > current,.
        (Some(current), Some(latest)) => latest > current,
        // Выполняем операцию: (None, Some(_)) => true,.
        (None, Some(_)) => true,
        // Выполняем операцию: _ => false,.
        _ => false,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию pick_asset.
pub fn pick_asset(assets: &[GitHubAsset]) -> Option<&GitHubAsset> {
    // Выполняем операцию: assets.
    assets
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|asset| asset.name.to_lowercase().ends_with(".zip.
        .find(|asset| asset.name.to_lowercase().ends_with(".zip"))
    // Закрываем блок.
}

// Объявляем константу VERSION_FALLBACK_PATTERNS.
static VERSION_FALLBACK_PATTERNS: LazyLock<Vec<Regex>> = LazyLock::new(|| {
    // Выполняем операцию: [.
    [
        // Выполняем операцию: r#"(?i)"?version"?\s*[:=]\s*"?v?(\d+\.\d+(?:\.\d+)?)"?".
        r#"(?i)"?version"?\s*[:=]\s*"?v?(\d+\.\d+(?:\.\d+)?)"?"#,
        // Выполняем операцию: r"(?i)zapret[-_ ]?v?(\d+\.\d+(?:\.\d+)?)",.
        r"(?i)zapret[-_ ]?v?(\d+\.\d+(?:\.\d+)?)",
        // Выполняем операцию: ].
    ]
    // Выполняем операцию: .iter().
    .iter()
    // Выполняем операцию: .filter_map(|pattern| Regex::new(pattern).ok()).
    .filter_map(|pattern| Regex::new(pattern).ok())
    // Выполняем операцию: .collect().
    .collect()
    // Закрываем блок.
});

// Объявляем функцию version_from_service_bat.
fn version_from_service_bat(strategies_dir: &std::path::Path) -> Option<String> {
    // Объявляем переменную content .
    let content = std::fs::read_to_string(strategies_dir.join("service.bat")).ok()?;

    // Перебираем элементы коллекции.
    for pattern in VERSION_FALLBACK_PATTERNS.iter() {
        // Проверяем условие: let Some(found) = pattern.
        if let Some(found) = pattern
            // Выполняем операцию: .captures(&content).
            .captures(&content)
            // Выполняем операцию: .and_then(|caps| caps.get(1)).
            .and_then(|caps| caps.get(1))
            // Выполняем операцию: .map(|value| value.as_str()).
            .map(|value| value.as_str())
        // Выполняем операцию: {.
        {
            // Возвращаем результат из функции.
            return Some(normalize_version(found));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: None.
    None
    // Закрываем блок.
}

// Объявляем функцию read_version.
pub fn read_version(strategies_dir: &std::path::Path) -> String {
    // Проверяем условие: let Ok(content) = std::fs::read_to_string(strategi.
    if let Ok(content) = std::fs::read_to_string(strategies_dir.join(VERSION_FILE_NAME)) {
        // Объявляем переменную trimmed .
        let trimmed = content.trim();

        // Проверяем условие: !trimmed.is_empty() {.
        if !trimmed.is_empty() {
            // Возвращаем результат из функции.
            return normalize_version(trimmed);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: version_from_service_bat(strategies_dir).unwrap_or_else.
    version_from_service_bat(strategies_dir).unwrap_or_else(|| UNKNOWN_VERSION.to_string())
    // Закрываем блок.
}

// Объявляем функцию write_version.
pub fn write_version(strategies_dir: &std::path::Path, version: &str) -> AppResult<()> {
    // Выполняем операцию: std::fs::create_dir_all(strategies_dir)?;.
    std::fs::create_dir_all(strategies_dir)?;
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: strategies_dir.join(VERSION_FILE_NAME),.
        strategies_dir.join(VERSION_FILE_NAME),
        // Выполняем операцию: format!("{}\n", normalize_version(version)),.
        format!("{}\n", normalize_version(version)),
        // Закрываем выражение или коллекцию.
    )?;

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Объявляем функцию download_path.
pub fn download_path(version: &str) -> PathBuf {
    // Объявляем переменную stamp .
    let stamp = crate::commands::monitor::now_millis();
    // Объявляем переменную name .
    let name = format!("zapret-{}-{stamp}.zip", normalize_version(version));

    // Выполняем операцию: std::env::temp_dir().
    std::env::temp_dir()
        // Выполняем операцию: .join("zapret-manager").
        .join("zapret-manager")
        // Выполняем операцию: .join("downloads").
        .join("downloads")
        // Выполняем операцию: .join(name).
        .join(name)
    // Закрываем блок.
}

// Объявляем функцию fetch_latest_release.
async fn fetch_latest_release(repo: &str) -> AppResult<GitHubRelease> {
    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .timeout(HTTP_TIMEOUT).
        .timeout(HTTP_TIMEOUT)
        // Выполняем операцию: .user_agent(USER_AGENT).
        .user_agent(USER_AGENT)
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(error.to_string()))?;.
        .map_err(|error| AppError::custom(error.to_string()))?;

    // Объявляем переменную url .
    let url = format!("{API_HOST}/{}/releases/latest", validate_repo(repo)?);

    // Объявляем переменную response .
    let response = client
        // Выполняем операцию: .get(&url).
        .get(&url)
        // Выполняем операцию: .header("Accept", "application/vnd.github+json").
        .header("Accept", "application/vnd.github+json")
        // Выполняем операцию: .send().
        .send()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("GitHub недос.
        .map_err(|error| AppError::custom(format!("GitHub недоступен: {error}")))?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "GitHub вернул статус {}",.
            "GitHub вернул статус {}",
            // Выполняем операцию: response.status().as_u16().
            response.status().as_u16() // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Выполняем операцию: response.
    response
        // Выполняем операцию: .json::<GitHubRelease>().
        .json::<GitHubRelease>()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Ответ GitHub.
        .map_err(|error| AppError::custom(format!("Ответ GitHub не разобран: {error}")))
    // Закрываем блок.
}

// Объявляем функцию build_info.
pub fn build_info(release: &GitHubRelease, current: &str, ignored: &[String]) -> UpdateInfo {
    // Объявляем переменную latest .
    let latest = normalize_version(&release.tag_name);
    // Объявляем переменную asset .
    let asset = pick_asset(&release.assets);
    // Объявляем переменную is_ignored .
    let is_ignored = ignored
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|value| normalize_version(value) == latest);.
        .any(|value| normalize_version(value) == latest);
    // Объявляем переменную known_current .
    let known_current = parse_version(current).is_some();
    // Объявляем переменную newer .
    let newer = is_newer(current, &latest);

    // Выполняем операцию: UpdateInfo {.
    UpdateInfo {
        // Выполняем операцию: available: newer && !is_ignored && known_current,.
        available: newer && !is_ignored && known_current,
        // Выполняем операцию: current_version: normalize_version(current),.
        current_version: normalize_version(current),
        // Выполняем операцию: latest_version: latest,.
        latest_version: latest,
        // Выполняем операцию: release_name: release.
        release_name: release
            // Выполняем операцию: .name.
            .name
            // Выполняем операцию: .clone().
            .clone()
            // Выполняем операцию: .unwrap_or_else(|| release.tag_name.clone()),.
            .unwrap_or_else(|| release.tag_name.clone()),
        // Выполняем операцию: release_notes: release.body.clone().unwrap_or_default().
        release_notes: release.body.clone().unwrap_or_default(),
        // Выполняем операцию: published_at: release.published_at.clone().unwrap_or_de.
        published_at: release.published_at.clone().unwrap_or_default(),
        // Выполняем операцию: download_url: asset.
        download_url: asset
            // Выполняем операцию: .map(|item| item.browser_download_url.clone()).
            .map(|item| item.browser_download_url.clone())
            // Выполняем операцию: .unwrap_or_default(),.
            .unwrap_or_default(),
        // Выполняем операцию: asset_name: asset.map(|item| item.name.clone()).unwrap_.
        asset_name: asset.map(|item| item.name.clone()).unwrap_or_default(),
        // Выполняем операцию: digest: asset.
        digest: asset
            // Выполняем операцию: .and_then(|item| item.digest.clone()).
            .and_then(|item| item.digest.clone())
            // Выполняем операцию: .unwrap_or_default(),.
            .unwrap_or_default(),
        // Выполняем операцию: size: asset.map(|item| item.size).unwrap_or(0),.
        size: asset.map(|item| item.size).unwrap_or(0),
        // Выполняем операцию: is_newer: newer,.
        is_newer: newer,
        // Выполняем операцию: ignored: is_ignored,.
        ignored: is_ignored,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn check_for_updates(.
pub async fn check_for_updates(
    // Выполняем операцию: app: tauri::AppHandle,.
    app: tauri::AppHandle,
    // Выполняем операцию: repo: Option<String>,.
    repo: Option<String>,
    // Выполняем операцию: ignored_versions: Option<Vec<String>>,.
    ignored_versions: Option<Vec<String>>,
    // Выполняем операцию: strategies_dir: String,.
    strategies_dir: String,
    // Закрываем выражение или коллекцию.
) -> AppResult<UpdateInfo> {
    // Объявляем переменную dir .
    let dir = crate::commands::resources_fs::validate_strategies_dir(&app, &strategies_dir)?;
    // Объявляем переменную repo .
    let repo = repo.unwrap_or_else(|| DEFAULT_REPO.to_string());
    // Объявляем переменную release .
    let release = fetch_latest_release(&repo).await?;
    // Объявляем переменную current .
    let current = read_version(&dir);
    // Объявляем переменную info .
    let info = build_info(&release, &current, &ignored_versions.unwrap_or_default());

    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Проверка обновлений {repo}: текущая {}, доступна {}, о.
        "Проверка обновлений {repo}: текущая {}, доступна {}, обновление {}",
        // Выполняем операцию: info.current_version,.
        info.current_version,
        // Выполняем операцию: info.latest_version,.
        info.latest_version,
        // Проверяем условие: info.available {.
        if info.available {
            // Выполняем операцию: "есть".
            "есть"
        // Закрываем блок.
        } else {
            // Выполняем операцию: "не требуется".
            "не требуется"
            // Закрываем блок.
        } // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(info).
    Ok(info)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "updater_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
