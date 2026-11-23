// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;

// Подключаем модули: crate::commands::resources::{.
use crate::commands::resources::{
    // Выполняем операцию: app_dir, app_version, copy_configs_tree, copy_zapret_tr.
    app_dir,
    app_version,
    copy_configs_tree,
    copy_zapret_tree,
    smart_update,
    user_owned,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::resources_core::{.
use crate::commands::resources_core::{
    // Выполняем операцию: check_integrity, is_binary, is_installed, manifest_keys.
    check_integrity,
    is_binary,
    is_installed,
    manifest_keys_sorted,
    read_manifest,
    read_marker,
    // Выполняем операцию: target_path, verify_file_hash, write_marker, InitReport.
    target_path,
    verify_file_hash,
    write_marker,
    InitReport,
    IntegrityReport,
    ResourcesManifest,
    // Выполняем операцию: RestoreReport, APP_SUBDIRS, MANIFEST_FILE, ZAPRET_SUBDI.
    RestoreReport,
    APP_SUBDIRS,
    MANIFEST_FILE,
    ZAPRET_SUBDIR,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::resources_fs::{.
use crate::commands::resources_fs::{
    // Выполняем операцию: count_strategies, emit_progress, ensure_app_dirs, resou.
    count_strategies,
    emit_progress,
    ensure_app_dirs,
    resources_dir,
    strategies_dir,
    // Выполняем операцию: STAGE_FINALIZING,.
    STAGE_FINALIZING,
    // Закрываем блок.
};
// Подключаем модули: crate::commands::vpn_xray;.
use crate::commands::vpn_xray;
// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

/// Имена стратегий прошлых релизов.
///
/// В 1.0.0 файлы переименованы в стабильную схему `general-NN-*` и
/// добавляются только из пакета; старые варианты, прибывшие с апдейтом или
/// ручным копированием, не должны ни попадать в коллекцию, ни занимать место
/// рядом с актуальными. `outlast-trials.bat` в списке отсутствует — он
/// усиливается приложением и остаётся пользовательским файлом.
// Объявляем константу LEGACY_STRATEGY_FILENAMES.
static LEGACY_STRATEGY_FILENAMES: &[&str] = &[
    // Выполняем операцию: "general.bat",.
    "general.bat",
    // Выполняем операцию: "general (EXP).bat",.
    "general (EXP).bat",
    // Выполняем операцию: "general (ALT).bat",.
    "general (ALT).bat",
    // Выполняем операцию: "general (ALT2).bat",.
    "general (ALT2).bat",
    // Выполняем операцию: "general (ALT3).bat",.
    "general (ALT3).bat",
    // Выполняем операцию: "general (ALT4).bat",.
    "general (ALT4).bat",
    // Выполняем операцию: "general (ALT5).bat",.
    "general (ALT5).bat",
    // Выполняем операцию: "general (ALT6).bat",.
    "general (ALT6).bat",
    // Выполняем операцию: "general (ALT7).bat",.
    "general (ALT7).bat",
    // Выполняем операцию: "general (ALT8).bat",.
    "general (ALT8).bat",
    // Выполняем операцию: "general (ALT9).bat",.
    "general (ALT9).bat",
    // Выполняем операцию: "general (ALT10).bat",.
    "general (ALT10).bat",
    // Выполняем операцию: "general (ALT11).bat",.
    "general (ALT11).bat",
    // Выполняем операцию: "general (ALT12).bat",.
    "general (ALT12).bat",
    // Выполняем операцию: "general (ALT13).bat",.
    "general (ALT13).bat",
    // Выполняем операцию: "general (SIMPLE FAKE).bat",.
    "general (SIMPLE FAKE).bat",
    // Выполняем операцию: "general (SIMPLE FAKE ALT).bat",.
    "general (SIMPLE FAKE ALT).bat",
    // Выполняем операцию: "general (SIMPLE FAKE ALT2).bat",.
    "general (SIMPLE FAKE ALT2).bat",
    // Выполняем операцию: "general (FAKE TLS AUTO).bat",.
    "general (FAKE TLS AUTO).bat",
    // Выполняем операцию: "general (FAKE TLS AUTO ALT).bat",.
    "general (FAKE TLS AUTO ALT).bat",
    // Выполняем операцию: "general (FAKE TLS AUTO ALT2).bat",.
    "general (FAKE TLS AUTO ALT2).bat",
    // Выполняем операцию: "general (FAKE TLS AUTO ALT3).bat",.
    "general (FAKE TLS AUTO ALT3).bat",
    // Закрываем выражение или коллекцию.
];

/// Удаляет устаревшие имена стратегий из папки пользователя.
///
/// Выполняется при каждой инициализации: имена фиксированные, поэтому
/// отдельный маркер «чистили уже» не нужен, а повторный проход ничего
/// не трогает. Только точные имена файлов — пользовательские списки и
/// чужие .bat не затрагиваются.
// Объявляем функцию cleanup_legacy_strategies.
fn cleanup_legacy_strategies(strategies: &Path) {
    // Объявляем переменную removed .
    let mut removed = 0usize;

    // Перебираем элементы коллекции.
    for name in LEGACY_STRATEGY_FILENAMES {
        // Объявляем переменную path .
        let path = strategies.join(name);

        // Проверяем условие: !path.is_file() {.
        if !path.is_file() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: std::fs::remove_file(&path).is_ok() {.
        if std::fs::remove_file(&path).is_ok() {
            // Выполняем операцию: removed += 1;.
            removed += 1;
        // Закрываем блок.
        } else {
            // Выполняем операцию: tracing::warn!("Устаревшая стратегия не удалена: {name}.
            tracing::warn!("Устаревшая стратегия не удалена: {name}");
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: removed > 0 {.
    if removed > 0 {
        // Выполняем операцию: tracing::info!("Устаревшие стратегии удалены: {removed}.
        tracing::info!("Устаревшие стратегии удалены: {removed}");
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Инициализацию может запросить интерфейс, а также повторный вызов
/// после перезагрузки WebView. Без общей блокировки два прохода могли
/// копировать одни и те же файлы и мешать друг другу на Windows.
// Объявляем константу INIT_LOCK.
static INIT_LOCK: tokio::sync::Mutex<()> = tokio::sync::Mutex::const_new(());

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn init_resources(app: AppHandle) -> AppResul.
pub async fn init_resources(app: AppHandle) -> AppResult<InitReport> {
    // Объявляем переменную _guard .
    let _guard = INIT_LOCK.lock().await;

    // Объявляем переменную resources .
    let resources = resources_dir(&app)?;
    // Объявляем переменную target .
    let target = app_dir(&app)?;

    // Выполняем операцию: ensure_app_dirs(&target)?;.
    ensure_app_dirs(&target)?;

    // Пути стратегий нужны и чистке legacy-файлов, и отчёту: вычисляем
    // один раз до любого ветвления.
    // Объявляем переменную strategies .
    let strategies = strategies_dir(&target);
    // Выполняем операцию: cleanup_legacy_strategies(&strategies);.
    cleanup_legacy_strategies(&strategies);

    // Объявляем переменную manifest .
    let manifest = match read_manifest(&resources) {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Ресурсы не инициализированы: {error}");.
            tracing::warn!("Ресурсы не инициализированы: {error}");

            // Возвращаем результат из функции.
            return Ok(InitReport {
                // Выполняем операцию: first_run: false,.
                first_run: false,
                // Выполняем операцию: updated: false,.
                updated: false,
                // Выполняем операцию: strategies_count: count_strategies(&strategies),.
                strategies_count: count_strategies(&strategies),
                // Выполняем операцию: resources_version: String::new(),.
                resources_version: String::new(),
                // Выполняем операцию: extracted_bytes: 0,.
                extracted_bytes: 0,
                // Выполняем операцию: available: false,.
                available: false,
                // Выполняем операцию: vpn_core_included: false,.
                vpn_core_included: false,
                // Закрываем блок.
            });
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Объявляем переменную marker .
    let marker = read_marker(&target).ok();
    // Объявляем переменную first_run .
    let first_run = marker.is_none();
    // Объявляем переменную updated .
    let updated = marker
        // Выполняем операцию: .as_ref().
        .as_ref()
        // Выполняем операцию: .is_some_and(|value| value.resources_version != manifes.
        .is_some_and(|value| value.resources_version != manifest.version);

    // Проверяем условие: !first_run && !updated {.
    if !first_run && !updated {
        // Объявляем переменную repaired .
        let repaired = self_heal_missing(&resources, &target, &manifest).await?;
        // Объявляем переменную vpn_core_included .
        let vpn_core_included = ensure_vpn_core(&app).await;
        // Объявляем переменную report .
        let report = InitReport {
            // Выполняем операцию: first_run: false,.
            first_run: false,
            // Выполняем операцию: updated: false,.
            updated: false,
            // Выполняем операцию: strategies_count: count_strategies(&strategies),.
            strategies_count: count_strategies(&strategies),
            // Выполняем операцию: resources_version: manifest.version.clone(),.
            resources_version: manifest.version.clone(),
            // Выполняем операцию: extracted_bytes: 0,.
            extracted_bytes: 0,
            // Выполняем операцию: available: true,.
            available: true,
            // Выполняем операцию: vpn_core_included,.
            vpn_core_included,
            // Закрываем блок.
        };

        // Проверяем условие: repaired > 0 {.
        if repaired > 0 {
            // Выполняем операцию: tracing::warn!("Самовосстановление ресурсов: возвращено.
            tracing::warn!("Самовосстановление ресурсов: возвращено {repaired} файлов");
            // Закрываем блок.
        }

        // Выполняем операцию: emit_progress(&app, STAGE_FINALIZING, 100, "готово");.
        emit_progress(&app, STAGE_FINALIZING, 100, "готово");
        // Выполняем операцию: cleanup_legacy_injects(&target);.
        cleanup_legacy_injects(&target);
        // Выполняем операцию: write_marker(.
        write_marker(
            // Выполняем операцию: &target,.
            &target,
            // Выполняем операцию: &app_version(&app),.
            &app_version(&app),
            // Выполняем операцию: &manifest,.
            &manifest,
            // Выполняем операцию: report.strategies_count,.
            report.strategies_count,
            // Закрываем выражение или коллекцию.
        )?;

        // Возвращаем результат из функции.
        return Ok(report);
        // Закрываем блок.
    }

    // Объявляем переменную extracted .
    let mut extracted = copy_zapret_tree(&app, &resources, &strategies).await?;
    // Выполняем операцию: extracted += copy_configs_tree(&app, &resources, &strat.
    extracted += copy_configs_tree(&app, &resources, &strategies).await?;

    // Проверяем условие: updated {.
    if updated {
        // Выполняем операцию: smart_update(&app, &manifest, &resources, &target).awai.
        smart_update(&app, &manifest, &resources, &target).await?;
        // Закрываем блок.
    }

    // Объявляем переменную repaired .
    let repaired = self_heal_missing(&resources, &target, &manifest).await?;
    // Объявляем переменную vpn_core_included .
    let vpn_core_included = ensure_vpn_core(&app).await;
    // Выполняем операцию: emit_progress(&app, STAGE_FINALIZING, 100, "готово");.
    emit_progress(&app, STAGE_FINALIZING, 100, "готово");
    // Объявляем переменную count .
    let count = count_strategies(&strategies);

    // Выполняем операцию: cleanup_legacy_injects(&target);.
    cleanup_legacy_injects(&target);
    // Выполняем операцию: write_marker(&target, &app_version(&app), &manifest, co.
    write_marker(&target, &app_version(&app), &manifest, count)?;
    // Выполняем операцию: tracing::info!(.
    tracing::info!(
        // Выполняем операцию: "Ресурсы {}: распаковано {extracted} байт, стратегий {c.
        "Ресурсы {}: распаковано {extracted} байт, стратегий {count}, первый запуск {first_run}, обновление {updated}, восстановлено {repaired}, Xray {vpn_core_included}, манифест собран {} мс назад",
        // Выполняем операцию: manifest.version,.
        manifest.version,
        // Выполняем операцию: manifest.age_millis().
        manifest.age_millis()
    // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Ok(InitReport {.
    Ok(InitReport {
        // Выполняем операцию: first_run,.
        first_run,
        // Выполняем операцию: updated,.
        updated,
        // Выполняем операцию: strategies_count: count,.
        strategies_count: count,
        // Выполняем операцию: resources_version: manifest.version.clone(),.
        resources_version: manifest.version.clone(),
        // Выполняем операцию: extracted_bytes: extracted,.
        extracted_bytes: extracted,
        // Выполняем операцию: available: true,.
        available: true,
        // Выполняем операцию: vpn_core_included,.
        vpn_core_included,
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Провижининг ядра не должен ломать инициализацию ресурсов: при
/// ошибке VPN просто останется недоступен, а DPI-режим продолжит
/// работать. Повторная проверка нужна для случая, когда архив
/// распаковался в прошлый раз, но файлы уже были на месте.
// Объявляем функцию ensure_vpn_core.
async fn ensure_vpn_core(app: &AppHandle) -> bool {
    // Объявляем переменную ready .
    let ready = match vpn_xray::ensure_bundled_core(app).await {
        // Выполняем операцию: Ok(value) => value,.
        Ok(value) => value,
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Встроенное ядро Xray не подготовлено: {.
            tracing::warn!("Встроенное ядро Xray не подготовлено: {error}");

            // Выполняем операцию: false.
            false
            // Закрываем блок.
        } // Закрываем блок.
    };

    // Выполняем операцию: ready || vpn_xray::core_healthy().
    ready || vpn_xray::core_healthy()
    // Закрываем блок.
}

/// Возвращает только отсутствующие или повреждённые бинарники.
/// Пользовательские правки текстовых стратегий и списков не
/// перезаписываются: иначе самовосстановление затирало бы работу
/// пользователя при каждом запуске.
// Объявляем функцию self_heal_missing.
async fn self_heal_missing(
    // Выполняем операцию: resources: &Path,.
    resources: &Path,
    // Выполняем операцию: target: &Path,.
    target: &Path,
    // Выполняем операцию: manifest: &ResourcesManifest,.
    manifest: &ResourcesManifest,
    // Закрываем выражение или коллекцию.
) -> AppResult<usize> {
    // Объявляем переменную repaired .
    let mut repaired = 0usize;

    // Перебираем элементы коллекции.
    for key in manifest_keys_sorted(manifest) {
        // Проверяем условие: !is_installed(&key) {.
        if !is_installed(&key) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(expected) .
        let Some(expected) = manifest.files.get(&key) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную (Ok(destination), Ok(source)) .
        let (Ok(destination), Ok(source)) =
            // Выполняем операцию: (target_path(target, &key), source_path(resources, &key.
            (target_path(target, &key), source_path(resources, &key))
        // Выполняем операцию: else {.
        else {
            // Выполняем операцию: continue;.
            continue;
        // Закрываем блок.
        };

        // Проверяем условие: !source.is_file() {.
        if !source.is_file() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную broken .
        let broken = if destination.is_file() {
            // Выполняем операцию: is_binary(&key) && !verify_file_hash(&destination, expe.
            is_binary(&key) && !verify_file_hash(&destination, expected)
        // Закрываем блок.
        } else {
            // Выполняем операцию: true.
            true
            // Закрываем блок.
        };

        // Проверяем условие: !broken {.
        if !broken {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(parent) = destination.parent() {.
        if let Some(parent) = destination.parent() {
            // Выполняем операцию: tokio::fs::create_dir_all(parent).await?;.
            tokio::fs::create_dir_all(parent).await?;
            // Закрываем блок.
        }

        // Выполняем операцию: tokio::fs::copy(&source, &destination).await?;.
        tokio::fs::copy(&source, &destination).await?;
        // Выполняем операцию: repaired += 1;.
        repaired += 1;
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(repaired).
    Ok(repaired)
    // Закрываем блок.
}

/// Одноразовая миграция старых инъекций в списки доменов. Ошибки
/// сканирования не должны блокировать первый запуск, поэтому helper
/// только логирует результат.
// Объявляем функцию cleanup_legacy_injects.
fn cleanup_legacy_injects(target: &Path) {
    // Объявляем переменную cleaned .
    let cleaned =
        // Выполняем операцию: crate::commands::injector::migrate_legacy_inject(&targe.
        crate::commands::injector::migrate_legacy_inject(&target.join("strategies").join("lists"));

    // Проверяем условие: cleaned > 0 {.
    if cleaned > 0 {
        // Выполняем операцию: tracing::info!("Одноразовая миграция инъекций: очищено .
        tracing::info!("Одноразовая миграция инъекций: очищено файлов {cleaned}");
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn check_resources_integrity(app: AppHandle) .
pub async fn check_resources_integrity(app: AppHandle) -> AppResult<IntegrityReport> {
    // Объявляем переменную resources .
    let resources = resources_dir(&app)?;
    // Объявляем переменную target .
    let target = app_dir(&app)?;
    // Объявляем переменную manifest .
    let manifest = read_manifest(&resources)?;

    // Хеширование файлов — синхронный I/O; уводим с рабочего потока.
    // Выполняем операцию: tokio::task::spawn_blocking(move || check_integrity(&ma.
    tokio::task::spawn_blocking(move || check_integrity(&manifest, &target))
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Проверка цел.
        .map_err(|error| AppError::custom(format!("Проверка целостности прервана: {error}")))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn restore_bundled_strategies(app: AppHandle).
pub async fn restore_bundled_strategies(app: AppHandle) -> AppResult<RestoreReport> {
    // Объявляем переменную resources .
    let resources = resources_dir(&app)?;
    // Объявляем переменную target .
    let target = app_dir(&app)?;
    // Объявляем переменную manifest .
    let manifest = read_manifest(&resources)?;
    // Объявляем переменную restored .
    let mut restored = 0usize;
    // Объявляем переменную skipped .
    let mut skipped = 0usize;

    // Перебираем элементы коллекции.
    for key in manifest_keys_sorted(&manifest) {
        // Проверяем условие: user_owned(&key) || !manifest.files.contains_key(&.
        if user_owned(&key) || !manifest.files.contains_key(&key) {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную (Ok(destination), Ok(source)) .
        let (Ok(destination), Ok(source)) =
            // Выполняем операцию: (target_path(&target, &key), source_path(&resources, &k.
            (target_path(&target, &key), source_path(&resources, &key))
        // Выполняем операцию: else {.
        else {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
        // Закрываем блок.
        };

        // Проверяем условие: !source.is_file() {.
        if !source.is_file() {
            // Выполняем операцию: skipped += 1;.
            skipped += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: let Some(parent) = destination.parent() {.
        if let Some(parent) = destination.parent() {
            // Выполняем операцию: tokio::fs::create_dir_all(parent).await?;.
            tokio::fs::create_dir_all(parent).await?;
            // Закрываем блок.
        }

        // Выполняем операцию: tokio::fs::copy(&source, &destination).await?;.
        tokio::fs::copy(&source, &destination).await?;
        // Выполняем операцию: restored += 1;.
        restored += 1;
        // Закрываем блок.
    }

    // Объявляем переменную strategies .
    let strategies = count_strategies(&strategies_dir(&target));

    // Выполняем операцию: write_marker(&target, &app_version(&app), &manifest, st.
    write_marker(&target, &app_version(&app), &manifest, strategies)?;
    // Выполняем операцию: tracing::info!("Восстановлено {restored} файлов, пропущ.
    tracing::info!("Восстановлено {restored} файлов, пропущено {skipped}");

    // Выполняем операцию: Ok(RestoreReport {.
    Ok(RestoreReport {
        // Выполняем операцию: restored,.
        restored,
        // Выполняем операцию: skipped,.
        skipped,
        // Выполняем операцию: resources_version: manifest.version.clone(),.
        resources_version: manifest.version.clone(),
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_resources_version(app: AppHandle) -> A.
pub async fn get_resources_version(app: AppHandle) -> AppResult<String> {
    // Объявляем переменную resources .
    let resources = resources_dir(&app)?;

    // Выбираем вариант по значению.
    match read_manifest(&resources) {
        // Выполняем операцию: Ok(manifest) => Ok(manifest.version),.
        Ok(manifest) => Ok(manifest.version),
        // Выполняем операцию: Err(error) => {.
        Err(error) => {
            // Выполняем операцию: tracing::warn!("Версия ресурсов неизвестна: {error}");.
            tracing::warn!("Версия ресурсов неизвестна: {error}");

            // Выполняем операцию: Ok(String::new()).
            Ok(String::new())
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию license_allowed.
pub fn license_allowed(name: &str) -> AppResult<()> {
    // Объявляем переменную allowed .
    let allowed = ["LICENSE-zapret.txt", "README-zapret.md", "LICENSE-xray.txt"];

    // Проверяем условие: !allowed.contains(&name) {.
    if !allowed.contains(&name) {
        // Возвращаем результат из функции.
        return Err(AppError::custom(format!("Файл лицензии {name} не найден")));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn read_license_text(app: AppHandle, name: St.
pub async fn read_license_text(app: AppHandle, name: String) -> AppResult<String> {
    // Объявляем переменную resources .
    let resources = resources_dir(&app)?;
    // Выполняем операцию: license_allowed(&name)?;.
    license_allowed(&name)?;

    // Объявляем переменную path .
    let path = if name == "LICENSE-xray.txt" {
        // Выполняем операцию: resources.join("vpn").join(&name).
        resources.join("vpn").join(&name)
    // Закрываем блок.
    } else {
        // Выполняем операцию: resources.join(ZAPRET_SUBDIR).join(&name).
        resources.join(ZAPRET_SUBDIR).join(&name)
        // Закрываем блок.
    };

    // Выполняем операцию: std::fs::read_to_string(&path).
    std::fs::read_to_string(&path)
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Лицензия не .
        .map_err(|error| AppError::custom(format!("Лицензия не прочитана: {error}")))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_resources_strategies_path(app: AppHand.
pub async fn get_resources_strategies_path(app: AppHandle) -> AppResult<String> {
    // Объявляем переменную target .
    let target = app_dir(&app)?;

    // Выполняем операцию: Ok(strategies_dir(&target).to_string_lossy().to_string(.
    Ok(strategies_dir(&target).to_string_lossy().to_string())
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn get_resources_layout(app: AppHandle) -> Ap.
pub async fn get_resources_layout(app: AppHandle) -> AppResult<Vec<String>> {
    // Выполняем операцию: app_dir(&app)?;.
    app_dir(&app)?;

    // Объявляем переменную layout.
    let mut layout: Vec<String> = APP_SUBDIRS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|value| (*value).to_string()).
        .map(|value| (*value).to_string())
        // Выполняем операцию: .collect();.
        .collect();

    // Выполняем операцию: layout.push(MANIFEST_FILE.to_string());.
    layout.push(MANIFEST_FILE.to_string());

    // Выполняем операцию: Ok(layout).
    Ok(layout)
    // Закрываем блок.
}

// Объявляем функцию source_path.
fn source_path(resources: &Path, key: &str) -> AppResult<PathBuf> {
    // Объявляем переменную relative .
    let relative = Path::new(key)
        // Выполняем операцию: .strip_prefix(ZAPRET_SUBDIR).
        .strip_prefix(ZAPRET_SUBDIR)
        // Выполняем операцию: .unwrap_or(Path::new(key));.
        .unwrap_or(Path::new(key));

    // Выполняем операцию: Ok(resources.join(ZAPRET_SUBDIR).join(relative)).
    Ok(resources.join(ZAPRET_SUBDIR).join(relative))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "resources_commands_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
