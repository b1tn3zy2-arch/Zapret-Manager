// Подключаем модули: std::path::Path;.
use std::path::Path;
// Подключаем модули: std::sync::atomic::{AtomicUsize, Ordering};.
use std::sync::atomic::{AtomicUsize, Ordering};
// Подключаем модули: std::sync::Arc;.
use std::sync::Arc;
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: tauri::{AppHandle, Emitter};.
use tauri::{AppHandle, Emitter};

// Подключаем модули: super::cover_fetcher::{covers_cache_dir, fetch_cover_wi.
use super::cover_fetcher::{covers_cache_dir, fetch_cover_with_appid, load_appid_index};
// Подключаем модули: super::game_heuristics::merge_games;.
use super::game_heuristics::merge_games;
// Подключаем модули: super::game_known::{anticheat_of, KnownGames};.
use super::game_known::{anticheat_of, KnownGames};
// Подключаем модули: super::game_model::{normalize_title, GameScanProgress, .
use super::game_model::{normalize_title, GameScanProgress, GameSource, InstalledGame};
// Подключаем модули: super::game_sources_registry::{scan_gog, scan_gog_folde.
use super::game_sources_registry::{scan_gog, scan_gog_folders, scan_riot, scan_ubisoft};
// Подключаем модули: super::game_sources_stores::{scan_epic, scan_steam};.
use super::game_sources_stores::{scan_epic, scan_steam};
// Подключаем модули: super::game_sources_system::{.
use super::game_sources_system::{
    // Выполняем операцию: scan_known_folders, scan_store_folders, scan_uninstall_.
    scan_known_folders,
    scan_store_folders,
    scan_uninstall_registry,
    scan_user_folders,
    // Выполняем операцию: scan_user_home_games, scan_volume_roots,.
    scan_user_home_games,
    scan_volume_roots,
    // Закрываем блок.
};
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::paths::is_valid_appid;.
use crate::security::paths::is_valid_appid;

// Объявляем константу EVENT_SCAN_PROGRESS.
pub const EVENT_SCAN_PROGRESS: &str = "game-scan-progress";
/// Событие о ходе докачки обложек.
// Объявляем константу EVENT_COVER_PROGRESS.
pub const EVENT_COVER_PROGRESS: &str = "cover-download-progress";
// Объявляем константу MAX_SCANNED_GAMES.
pub const MAX_SCANNED_GAMES: usize = 200;
// Объявляем константу MAX_USER_FOLDERS.
pub const MAX_USER_FOLDERS: usize = 64;

// Объявляем структуру ScanStep.
struct ScanStep {
    // Выполняем операцию: source: GameSource,.
    source: GameSource,
    // Выполняем операцию: run: fn(&[String]) -> Vec<InstalledGame>,.
    run: fn(&[String]) -> Vec<InstalledGame>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, serde::Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру KnownGameMatch.
pub struct KnownGameMatch {
    // Выполняем операцию: pub appid: String,.
    pub appid: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub cover: Option<String>,.
    pub cover: Option<String>,
    // Выполняем операцию: pub domain_settings_id: Option<String>,.
    pub domain_settings_id: Option<String>,
    // Выполняем операцию: pub anticheat: String,.
    pub anticheat: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Объявляем функцию match_known_game.
pub fn match_known_game(app: AppHandle, name: String) -> Option<KnownGameMatch> {
    // Объявляем переменную known .
    let known = super::game_known::load_known_games_cached(&app);

    // Название из имени exe часто без пробелов: EscapeTheBackrooms.
    // Известная база хранит человеческие названия, поэтому второй
    // попыткой берём вариант со словами, разделёнными по CamelCase.
    // Объявляем переменную entry .
    let entry = known
        // Выполняем операцию: .by_name(&name).
        .by_name(&name)
        // Выполняем операцию: .or_else(|| known.by_name(&super::steam_search::humaniz.
        .or_else(|| known.by_name(&super::steam_search::humanize_name(&name)))?;

    // Выполняем операцию: Some(KnownGameMatch {.
    Some(KnownGameMatch {
        // Выполняем операцию: appid: entry.appid.clone(),.
        appid: entry.appid.clone(),
        // Выполняем операцию: name: entry.name.clone(),.
        name: entry.name.clone(),
        // Выполняем операцию: cover: entry.cover.clone(),.
        cover: entry.cover.clone(),
        // Выполняем операцию: domain_settings_id: entry.domain_settings_id.clone(),.
        domain_settings_id: entry.domain_settings_id.clone(),
        // Выполняем операцию: anticheat: super::game_known::anticheat_of(entry).as_st.
        anticheat: super::game_known::anticheat_of(entry).as_str().to_string(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn scan_installed_games(.
pub async fn scan_installed_games(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: user_folders: Option<Vec<String>>,.
    user_folders: Option<Vec<String>>,
    // Закрываем выражение или коллекцию.
) -> AppResult<Vec<InstalledGame>> {
    // Объявляем переменную handle .
    let handle = app.clone();
    // Объявляем переменную folders .
    let folders = validate_user_folders(user_folders.as_deref().unwrap_or(&[]))?;

    // Объявляем переменную games .
    let games = tauri::async_runtime::spawn_blocking(move || run_scan(&handle, &folders))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Сканирование.
        .map_err(|error| AppError::custom(format!("Сканирование прервано: {error}")))??;

    // Обложки не блокируют сканирование. Раньше команда ждала загрузку
    // всех обложек (на плохой сети — десятки секунд), и новые игры
    // появлялись на странице только после следующего запуска
    // приложения: интерфейс успевал решить, что сканирование не сработало.
    // Сами обложки кэшируются один раз, поэтому повторный скан быстрый.
    // Выполняем операцию: spawn_background_covers(app, games.clone());.
    spawn_background_covers(app, games.clone());

    // Выполняем операцию: Ok(games).
    Ok(games)
    // Закрываем блок.
}

/// Ставит в карточки обложки, уже лежащие в кэше.
///
/// Это мгновенная проверка файлов, сеть не нужна: игры из прошлых
/// запусков получают обложку в том же ответе скана, а недостающие
/// докачиваются фоном (см. `spawn_background_covers`).
///
/// Играм без AppID он берётся из индекса прошлых поисков: обложка
/// и идентификатор перестают искаться в сети заново при каждом скане.
// Объявляем функцию assign_cached_covers.
fn assign_cached_covers(app: &AppHandle, games: &mut [InstalledGame]) {
    // Объявляем переменную Ok(root) .
    let Ok(root) = covers_cache_dir(app) else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную index .
    let index = load_appid_index(app);

    // Перебираем элементы коллекции.
    for game in games {
        // Объявляем переменную appid .
        let appid = game
            // Выполняем операцию: .appid.
            .appid
            // Выполняем операцию: .as_deref().
            .as_deref()
            // Выполняем операцию: .map(str::trim).
            .map(str::trim)
            // Выполняем операцию: .filter(|value| !value.is_empty()).
            .filter(|value| !value.is_empty())
            // Выполняем операцию: .map(str::to_string).
            .map(str::to_string)
            // Выполняем операцию: .or_else(|| {.
            .or_else(|| {
                // Выполняем операцию: index.
                index
                    // Выполняем операцию: .get(&normalize_title(&game.name)).
                    .get(&normalize_title(&game.name))
                    // Выполняем операцию: .filter(|value| !value.is_empty()).
                    .filter(|value| !value.is_empty())
                    // Выполняем операцию: .cloned().
                    .cloned()
                // Закрываем блок.
            });

        // Объявляем переменную Some(appid) .
        let Some(appid) = appid.filter(|value| is_valid_appid(value)) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // AppID из поиска остаётся у игры и в следующих сканах: без него
        // игра снова считалась бы «неизвестной», а обложка — ненайденной.
        // Выполняем операцию: game.appid = Some(appid.clone());.
        game.appid = Some(appid.clone());

        // Объявляем переменную candidate .
        let candidate = root.join(format!("{appid}.jpg"));

        // Проверяем условие: candidate.is_file() {.
        if candidate.is_file() {
            // Выполняем операцию: game.cover_path = Some(candidate.to_string_lossy().to_s.
            game.cover_path = Some(candidate.to_string_lossy().to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Докачивает отсутствующие обложки в фоне.
///
/// Задача отчуждается от команды: интерфейс уже получает список игр, а
/// каждая готовая обложка приезжает событием с идентификатором карточки
/// и путём файла — страница обновляет только свою карточку.
// Объявляем функцию spawn_background_covers.
fn spawn_background_covers(app: AppHandle, games: Vec<InstalledGame>) {
    // Объявляем переменную pending.
    let pending: Vec<InstalledGame> = games
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|game| game.cover_path.is_none()).
        .filter(|game| game.cover_path.is_none())
        // Выполняем операцию: .collect();.
        .collect();

    // Проверяем условие: pending.is_empty() {.
    if pending.is_empty() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную total .
    let total = pending.len();

    // Выполняем операцию: tauri::async_runtime::spawn(async move {.
    tauri::async_runtime::spawn(async move {
        // Интерфейс ещё применяет список из ответа скана: мгновенные
        // события успевают приехать раньше него и затираются. Секунда
        // дает ему спокойно закончить, обложки не спешат никуда.
        // Выполняем операцию: tokio::time::sleep(Duration::from_secs(1)).await;.
        tokio::time::sleep(Duration::from_secs(1)).await;

        // Объявляем переменную done .
        let done = Arc::new(AtomicUsize::new(0));

        // По одной, а не пачкой: поиск в Steam и запись индекса не любят
        // параллельных запросов, а обложкам не нужно приезжать разом.
        // Перебираем элементы коллекции.
        for game in pending {
            // Объявляем переменную resolved .
            let resolved = fetch_cover_with_appid(&app, game.appid.as_deref(), &game.name).await;
            // Объявляем переменную current .
            let current = done.fetch_add(1, Ordering::SeqCst) + 1;

            // Выполняем операцию: emit_cover(.
            emit_cover(
                // Выполняем операцию: &app,.
                &app,
                // Выполняем операцию: current,.
                current,
                // Выполняем операцию: total,.
                total,
                // Выполняем операцию: Some(&game.id),.
                Some(&game.id),
                // Выполняем операцию: resolved.appid.as_deref().or(game.appid.as_deref()),.
                resolved.appid.as_deref().or(game.appid.as_deref()),
                // Выполняем операцию: resolved.path.as_deref(),.
                resolved.path.as_deref(),
                // Закрываем выражение или коллекцию.
            );
            // Закрываем блок.
        }
        // Закрываем блок.
    });
    // Закрываем блок.
}

/// Событие докачки одной обложки: счётчик для индикатора и, если картинка
/// получена, источник для конкретной карточки.
// Объявляем функцию emit_cover.
fn emit_cover(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: current: usize,.
    current: usize,
    // Выполняем операцию: total: usize,.
    total: usize,
    // Выполняем операцию: game_id: Option<&str>,.
    game_id: Option<&str>,
    // Выполняем операцию: appid: Option<&str>,.
    appid: Option<&str>,
    // Выполняем операцию: path: Option<&Path>,.
    path: Option<&Path>,
    // Закрываем выражение или коллекцию.
) {
    // Объявляем переменную payload .
    let payload = CoverProgress {
        // Выполняем операцию: current,.
        current,
        // Выполняем операцию: total,.
        total,
        // Выполняем операцию: game_id: game_id.map(str::to_string),.
        game_id: game_id.map(str::to_string),
        // Выполняем операцию: app_id: appid.map(str::to_string),.
        app_id: appid.map(str::to_string),
        // Выполняем операцию: cover_path: path.map(|value| value.to_string_lossy().to.
        cover_path: path.map(|value| value.to_string_lossy().to_string()),
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_COVER_PROGRESS, payload);
    // Закрываем блок.
}

/// Ход докачки обложек.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, serde::Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру CoverProgress.
pub struct CoverProgress {
    // Выполняем операцию: pub current: usize,.
    pub current: usize,
    // Выполняем операцию: pub total: usize,.
    pub total: usize,
    /// Идентификатор карточки в интерфейсе: обложки игр без AppID
    /// иначе некуда «прицепить».
    // Применяем атрибут к следующему объявлению.
    #[serde(skip_serializing_if = "Option::is_none")]
    // Выполняем операцию: pub game_id: Option<String>,.
    pub game_id: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(skip_serializing_if = "Option::is_none")]
    // Выполняем операцию: pub app_id: Option<String>,.
    pub app_id: Option<String>,
    // Применяем атрибут к следующему объявлению.
    #[serde(skip_serializing_if = "Option::is_none")]
    // Выполняем операцию: pub cover_path: Option<String>,.
    pub cover_path: Option<String>,
    // Закрываем блок.
}

/// Папки для сканирования приходят из интерфейса, поэтому проверяются:
/// их должно быть немного, они должны быть абсолютными и существовать.
/// Иначе через команду можно было бы заставить приложение обойти
/// произвольный каталог.
// Объявляем функцию validate_user_folders.
pub fn validate_user_folders(folders: &[String]) -> AppResult<Vec<String>> {
    // Проверяем условие: folders.len() > MAX_USER_FOLDERS {.
    if folders.len() > MAX_USER_FOLDERS {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!(
            // Выполняем операцию: "Слишком много папок для сканирования: максимум {MAX_US.
            "Слишком много папок для сканирования: максимум {MAX_USER_FOLDERS}" // Закрываем выражение или коллекцию.
        )));
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let mut result = Vec::with_capacity(folders.len());

    // Перебираем элементы коллекции.
    for folder in folders {
        // Объявляем переменную trimmed .
        let trimmed = folder.trim();

        // Проверяем условие: trimmed.is_empty() {.
        if trimmed.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: trimmed.contains('\0') {.
        if trimmed.contains('\0') {
            // Возвращаем результат из функции.
            return Err(AppError::custom("Путь к папке повреждён"));
            // Закрываем блок.
        }

        // Объявляем переменную path .
        let path = Path::new(trimmed);

        // Проверяем условие: !path.is_absolute() {.
        if !path.is_absolute() {
            // Возвращаем результат из функции.
            return Err(AppError::custom(format!(
                // Выполняем операцию: "Путь к папке должен быть абсолютным: {trimmed}".
                "Путь к папке должен быть абсолютным: {trimmed}" // Закрываем выражение или коллекцию.
            )));
            // Закрываем блок.
        }

        // Проверяем условие: !path.is_dir() {.
        if !path.is_dir() {
            // Возвращаем результат из функции.
            return Err(AppError::custom(format!("Папка не найдена: {trimmed}")));
            // Закрываем блок.
        }

        // Выполняем операцию: result.push(trimmed.to_string());.
        result.push(trimmed.to_string());
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(result).
    Ok(result)
    // Закрываем блок.
}

// Объявляем функцию run_scan.
fn run_scan(app: &AppHandle, user_folders: &[String]) -> AppResult<Vec<InstalledGame>> {
    // Объявляем переменную known .
    let known = super::game_known::load_known_games_cached(app);
    // Объявляем переменную found.
    let mut found: Vec<InstalledGame> = Vec::new();

    // Перебираем элементы коллекции.
    for step in scan_steps() {
        // Выполняем операцию: emit_progress(app, step.source, found.len());.
        emit_progress(app, step.source, found.len());

        // Выполняем операцию: found.extend((step.run)(user_folders));.
        found.extend((step.run)(user_folders));
        // Закрываем блок.
    }

    // Объявляем переменную merged .
    let mut merged = merge_games(existing_only(found));

    // Сначала кэш и индекс прошлых поисков: они мгновенны и дают AppID
    // играм без него, после чего enrich может сопоставить игру с базой
    // известных уже по AppID.
    // Выполняем операцию: assign_cached_covers(app, &mut merged);.
    assign_cached_covers(app, &mut merged);
    // Выполняем операцию: enrich(&known, &mut merged);.
    enrich(&known, &mut merged);
    // Второй прогон: enrich дал AppID играм из базы известных, и теперь
    // для них применим кэш обложек — в ответ скана обложка попадёт сразу,
    // без гонки с событием докачки.
    // Выполняем операцию: assign_cached_covers(app, &mut merged);.
    assign_cached_covers(app, &mut merged);
    // Выполняем операцию: merged.truncate(MAX_SCANNED_GAMES);.
    merged.truncate(MAX_SCANNED_GAMES);
    // Выполняем операцию: emit_progress(app, GameSource::UserFolder, merged.len().
    emit_progress(app, GameSource::UserFolder, merged.len());

    // Проверяем условие: known.is_empty() {.
    if known.is_empty() {
        // Выполняем операцию: tracing::debug!("База известных игр пуста");.
        tracing::debug!("База известных игр пуста");
        // Закрываем блок.
    }

    // Выполняем операцию: tracing::info!("Игр найдено: {} из базы {}", merged.len.
    tracing::info!("Игр найдено: {} из базы {}", merged.len(), known.len());
    // Выполняем операцию: tracing::debug!(.
    tracing::debug!(
        // Выполняем операцию: "Найдены игры: {}",.
        "Найдены игры: {}",
        // Выполняем операцию: merged.
        merged
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .map(|game| game.name.as_str()).
            .map(|game| game.name.as_str())
            // Выполняем операцию: .collect::<Vec<_>>().
            .collect::<Vec<_>>()
            // Выполняем операцию: .join(", ").
            .join(", ") // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(merged).
    Ok(merged)
    // Закрываем блок.
}

// Объявляем функцию scan_steps.
fn scan_steps() -> Vec<ScanStep> {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Registry,.
            source: GameSource::Registry,
            // Выполняем операцию: run: |_| scan_uninstall_registry(),.
            run: |_| scan_uninstall_registry(),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Steam,.
            source: GameSource::Steam,
            // Выполняем операцию: run: |_| scan_steam(),.
            run: |_| scan_steam(),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Epic,.
            source: GameSource::Epic,
            // Выполняем операцию: run: |_| scan_epic(),.
            run: |_| scan_epic(),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Gog,.
            source: GameSource::Gog,
            // Выполняем операцию: run: |_| {.
            run: |_| {
                // Объявляем переменную games .
                let mut games = scan_gog();

                // Выполняем операцию: games.extend(scan_gog_folders());.
                games.extend(scan_gog_folders());

                // Выполняем операцию: games.
                games
                // Закрываем блок.
            },
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Ubisoft,.
            source: GameSource::Ubisoft,
            // Выполняем операцию: run: |_| scan_ubisoft(),.
            run: |_| scan_ubisoft(),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Riot,.
            source: GameSource::Riot,
            // Выполняем операцию: run: |_| scan_riot(),.
            run: |_| scan_riot(),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::Ea,.
            source: GameSource::Ea,
            // Выполняем операцию: run: |_| scan_store_folders(),.
            run: |_| scan_store_folders(),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::KnownFolder,.
            source: GameSource::KnownFolder,
            // Выполняем операцию: run: |_| {.
            run: |_| {
                // Объявляем переменную games .
                let mut games = scan_known_folders();

                // Выполняем операцию: games.extend(scan_user_home_games());.
                games.extend(scan_user_home_games());
                // игры, установленные прямо в корень диска (C:\The Long Dark):
                // раньше такой путь не проверялся ни одним источником
                // Выполняем операцию: games.extend(scan_volume_roots());.
                games.extend(scan_volume_roots());

                // Выполняем операцию: games.
                games
                // Закрываем блок.
            },
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Выполняем операцию: source: GameSource::UserFolder,.
            source: GameSource::UserFolder,
            // Выполняем операцию: run: |folders| scan_user_folders(folders),.
            run: |folders| scan_user_folders(folders),
            // Закрываем блок.
        },
        // Выполняем операцию: ScanStep {.
        ScanStep {
            // Игры, поставленные установщиком в произвольную папку:
            // реестр о них не знает, зато в «Пуск» лежит ярлык.
            // Выполняем операцию: source: GameSource::UserFolder,.
            source: GameSource::UserFolder,
            // Выполняем операцию: run: |_| super::game_sources_shortcuts::scan_start_menu.
            run: |_| super::game_sources_shortcuts::scan_start_menu_links(),
            // Закрываем блок.
        },
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
}

// Объявляем функцию emit_progress.
fn emit_progress(app: &AppHandle, source: GameSource, found: usize) {
    // Объявляем переменную payload .
    let payload = GameScanProgress {
        // Выполняем операцию: source: source.as_str().to_string(),.
        source: source.as_str().to_string(),
        // Выполняем операцию: found,.
        found,
        // Выполняем операцию: current: source.as_str().to_string(),.
        current: source.as_str().to_string(),
        // Закрываем блок.
    };

    // Объявляем переменную _ .
    let _ = app.emit(EVENT_SCAN_PROGRESS, payload);
    // Закрываем блок.
}

// Объявляем функцию existing_only.
fn existing_only(games: Vec<InstalledGame>) -> Vec<InstalledGame> {
    // Выполняем операцию: games.
    games
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|game| Path::new(&game.executable_path).is_file.
        .filter(|game| Path::new(&game.executable_path).is_file())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию enrich.
pub fn enrich(known: &KnownGames, games: &mut [InstalledGame]) {
    // Перебираем элементы коллекции.
    for game in games.iter_mut() {
        // Объявляем переменную entry .
        let entry = game
            // Выполняем операцию: .appid.
            .appid
            // Выполняем операцию: .as_deref().
            .as_deref()
            // Выполняем операцию: .and_then(|appid| known.by_appid(appid)).
            .and_then(|appid| known.by_appid(appid))
            // Выполняем операцию: .or_else(|| known.by_name(&game.name)).
            .or_else(|| known.by_name(&game.name))
            // Название из папки часто идёт с хвостом («The Long Dark — tld»),
            // а база известных игр хранит человеческое название.
            // Выполняем операцию: .or_else(|| known.by_name(&super::steam_search::search_.
            .or_else(|| known.by_name(&super::steam_search::search_term(&game.name)))
            // Слитные слова: exe называется «EscapeTheBackrooms»,
            // база хранит «Escape the Backrooms».
            // Выполняем операцию: .or_else(|| {.
            .or_else(|| {
                // Объявляем переменную humanized .
                let humanized = super::steam_search::humanize_name(
                    // Выполняем операцию: &super::steam_search::search_term(&game.name),.
                    &super::steam_search::search_term(&game.name),
                    // Закрываем выражение или коллекцию.
                );

                // Выполняем операцию: known.by_name(&humanized).
                known.by_name(&humanized)
                // Закрываем блок.
            });

        // Проверяем условие: let Some(entry) = entry {.
        if let Some(entry) = entry {
            // Выполняем операцию: game.appid = game.appid.clone().or_else(|| Some(entry.a.
            game.appid = game.appid.clone().or_else(|| Some(entry.appid.clone()));
            // Выполняем операцию: game.cover_url = entry.cover.clone();.
            game.cover_url = entry.cover.clone();
            // Выполняем операцию: game.game_settings_id = entry.domain_settings_id.clone(.
            game.game_settings_id = entry.domain_settings_id.clone();
            // Выполняем операцию: game.anticheat = Some(anticheat_of(entry).as_str().to_s.
            game.anticheat = Some(anticheat_of(entry).as_str().to_string());
            // Выполняем операцию: game.name = entry.name.clone();.
            game.name = entry.name.clone();
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_scanner_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
