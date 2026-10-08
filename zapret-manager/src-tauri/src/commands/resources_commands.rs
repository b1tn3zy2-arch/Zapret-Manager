use std::path::{Path, PathBuf};

use tauri::AppHandle;

use crate::commands::resources::{
    app_dir, app_version, copy_configs_tree, copy_zapret_tree, smart_update, user_owned,
};
use crate::commands::resources_core::{
    check_integrity, manifest_keys_sorted, read_marker, read_manifest, target_path, write_marker,
    InitReport, IntegrityReport, RestoreReport, APP_SUBDIRS, MANIFEST_FILE, ZAPRET_SUBDIR,
};
use crate::commands::resources_fs::{
    count_strategies, ensure_app_dirs, list_bundled_bats, resources_dir, strategies_dir,
};
use crate::error::{AppError, AppResult};

#[tauri::command]
pub async fn init_resources(app: AppHandle) -> AppResult<InitReport> {
    let resources = resources_dir(&app)?;
    let target = app_dir(&app)?;

    ensure_app_dirs(&target)?;

    let manifest = match read_manifest(&resources) {
        Ok(value) => value,
        Err(error) => {
            tracing::warn!("Ресурсы не инициализированы: {error}");

            return Ok(InitReport {
                first_run: false,
                updated: false,
                strategies_count: count_strategies(&strategies_dir(&target)),
                resources_version: String::new(),
                extracted_bytes: 0,
                available: false,
            });
        }
    };

    let marker = read_marker(&target).ok();
    let strategies = strategies_dir(&target);
    let first_run = marker.is_none();
    let updated = marker
        .as_ref()
        .is_some_and(|value| value.resources_version != manifest.version);

    if !first_run && !updated {
        let report = InitReport {
            first_run: false,
            updated: false,
            strategies_count: count_strategies(&strategies),
            resources_version: manifest.version.clone(),
            extracted_bytes: 0,
            available: true,
        };

        write_marker(
            &target,
            &app_version(&app),
            &manifest,
            report.strategies_count,
        )?;

        return Ok(report);
    }

    let mut extracted = copy_zapret_tree(&app, &resources, &strategies).await?;
    extracted += copy_configs_tree(&app, &resources, &strategies).await?;

    if updated {
        smart_update(&app, &manifest, &resources, &target).await?;
    }

    let count = count_strategies(&strategies);

    write_marker(&target, &app_version(&app), &manifest, count)?;
    tracing::info!(
        "Ресурсы {}: распаковано {extracted} байт, стратегий {count}, первый запуск {first_run}, обновление {updated}, манифест собран {} мс назад",
        manifest.version,
        manifest.age_millis()
    );

    Ok(InitReport {
        first_run,
        updated,
        strategies_count: count,
        resources_version: manifest.version.clone(),
        extracted_bytes: extracted,
        available: true,
    })
}

#[tauri::command]
pub async fn check_resources_integrity(app: AppHandle) -> AppResult<IntegrityReport> {
    let resources = resources_dir(&app)?;
    let target = app_dir(&app)?;
    let manifest = read_manifest(&resources)?;

    Ok(check_integrity(&manifest, &target))
}

#[tauri::command]
pub async fn restore_bundled_strategies(app: AppHandle) -> AppResult<RestoreReport> {
    let resources = resources_dir(&app)?;
    let target = app_dir(&app)?;
    let manifest = read_manifest(&resources)?;
    let mut restored = 0usize;
    let mut skipped = 0usize;

    for key in manifest_keys_sorted(&manifest) {
        if user_owned(&key) || !manifest.files.contains_key(&key) {
            skipped += 1;
            continue;
        }

        let (Ok(destination), Ok(source)) =
            (target_path(&target, &key), source_path(&resources, &key))
        else {
            skipped += 1;
            continue;
        };

        if !source.is_file() {
            skipped += 1;
            continue;
        }

        if let Some(parent) = destination.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }

        tokio::fs::copy(&source, &destination).await?;
        restored += 1;
    }

    let strategies = count_strategies(&strategies_dir(&target));

    write_marker(&target, &app_version(&app), &manifest, strategies)?;
    tracing::info!("Восстановлено {restored} файлов, пропущено {skipped}");

    Ok(RestoreReport {
        restored,
        skipped,
        resources_version: manifest.version.clone(),
    })
}

#[tauri::command]
pub async fn list_bundled_strategies(app: AppHandle) -> AppResult<Vec<String>> {
    let resources = resources_dir(&app)?;

    Ok(list_bundled_bats(&resources))
}

#[tauri::command]
pub async fn get_resources_version(app: AppHandle) -> AppResult<String> {
    let resources = resources_dir(&app)?;

    match read_manifest(&resources) {
        Ok(manifest) => Ok(manifest.version),
        Err(error) => {
            tracing::warn!("Версия ресурсов неизвестна: {error}");

            Ok(String::new())
        }
    }
}

pub fn license_allowed(name: &str) -> AppResult<()> {
    let allowed = ["LICENSE-zapret.txt", "README-zapret.md"];

    if !allowed.contains(&name) {
        return Err(AppError::custom(format!(
            "Файл лицензии {name} не найден"
        )));
    }

    Ok(())
}

#[tauri::command]
pub async fn read_license_text(app: AppHandle, name: String) -> AppResult<String> {
    let resources = resources_dir(&app)?;
    license_allowed(&name)?;

    let path = resources.join(ZAPRET_SUBDIR).join(&name);

    std::fs::read_to_string(&path).map_err(|error| {
        AppError::custom(format!("Лицензия не прочитана: {error}"))
    })
}

#[tauri::command]
pub async fn get_resources_strategies_path(app: AppHandle) -> AppResult<String> {
    let target = app_dir(&app)?;

    Ok(strategies_dir(&target).to_string_lossy().to_string())
}

#[tauri::command]
pub async fn get_resources_layout(app: AppHandle) -> AppResult<Vec<String>> {
    app_dir(&app)?;

    let mut layout: Vec<String> =
        APP_SUBDIRS.iter().map(|value| (*value).to_string()).collect();

    layout.push(MANIFEST_FILE.to_string());

    Ok(layout)
}

fn source_path(resources: &Path, key: &str) -> AppResult<PathBuf> {
    let relative = Path::new(key)
        .strip_prefix(ZAPRET_SUBDIR)
        .unwrap_or(Path::new(key));

    Ok(resources.join(ZAPRET_SUBDIR).join(relative))
}

#[cfg(test)]
#[path = "resources_commands_tests.rs"]
mod tests;