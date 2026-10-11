pub mod bat_env;
mod build_info;
mod commands;
mod constants;
mod error;
mod logger;
mod process_manager;
pub mod security;
mod strategy;
pub mod tray;
mod tray_menu;
mod window_behavior;
mod winapi_helpers;

pub use error::{AppError, AppResult};

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    logger::init();

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
.manage(process_manager::ProcessManager::new())
        .manage(commands::monitor::MonitorState::new())
        .manage(commands::updater::UpdateState::new())
        .manage(commands::vpn::VpnState::new())
        .manage(commands::vpn_core::XrayRuntime::new())
        .manage(commands::runner::ScanState::default())
        .invoke_handler(tauri::generate_handler![
            commands::scanner::scan_strategies,
            commands::scanner::get_default_strategies_path,
            commands::runner::run_strategy,
            commands::runner::run_strategy_native,
            commands::runner::stop_strategy,
            commands::runner::check_strategy_status,
            commands::runner::list_running_processes,
            commands::runner::kill_all_processes,
            commands::log_export::write_log_export,
            commands::injector::inject_outlast,
            commands::injector::restore_backup,
            commands::injector::restore_from_backup,
            commands::injector::list_backups,
            commands::injector::extract_config_paths,
            commands::network::ping_hosts,
            commands::network::ping_endpoints,
            commands::network::fetch_network_info,
            commands::monitor::get_network_stats,
            commands::monitor::start_monitoring,
            commands::monitor::stop_monitoring,
            commands::monitor::is_monitoring,
            commands::monitor_snapshot::write_monitor_snapshot,
            commands::game_scanner::scan_installed_games,
            commands::game_launcher::launch_game,
            commands::game_launcher::hide_main_window,
            commands::game_launcher::is_game_running,
            commands::game_covers::game_cover,
            commands::game_covers::import_game_cover,
            commands::updater::check_for_updates,
            commands::updater_download::download_update,
            commands::updater_apply::install_update,
            commands::updater_apply::cancel_download,
            commands::updater_apply::get_current_version,
            commands::updater_apply::set_current_version,
            commands::updater_apply::list_update_backups,
            commands::updater_apply::rollback_update,
commands::system::get_system_info,
            commands::system::open_folder,
            commands::system::get_folder_path,
            commands::system::verify_configs,
            commands::system::delete_all_backups,
            commands::user_files::open_external_url,
            commands::user_files::read_user_text_file,
            commands::user_files::write_user_text_file,
            commands::vpn::detect_wireguard_command,
            commands::vpn::import_vpn_config,
            commands::vpn::import_vpn_config_text,
            commands::vpn_core::import_vpn_source,
            commands::vpn_core::install_vpn_core,
            commands::vpn_core::vpn_core_status,
            commands::vpn_core::connect_vpn_server,
            commands::vpn_core::disconnect_vpn_server,
            commands::vpn::list_vpn_configs,
            commands::vpn::delete_vpn_config,
            commands::vpn::switch_to_vpn,
            commands::vpn::switch_to_dpi,
            commands::vpn::disconnect_vpn,
            commands::vpn::get_vpn_status,
            commands::vpn::get_vpn_stats,
            commands::vpn::reconcile_vpn_tunnels,
            commands::vpn::enable_kill_switch,
            commands::vpn::disable_kill_switch,
            commands::vpn::is_wireguard_installed,
            commands::tray::update_tray_state,
            commands::tray::update_tray_config,
            commands::tray::show_notification,
            commands::tray::toggle_tray_window,
            commands::tray::show_tray_window,
            commands::tray::tray_menu_snapshot,
            commands::tray::tray_menu_hide,
            commands::tray::tray_menu_action,
            commands::tray::quit_app,
            window_behavior::set_minimize_to_tray_cmd,
            commands::resources_commands::init_resources,
            commands::resources_commands::check_resources_integrity,
            commands::resources_commands::restore_bundled_strategies,
            commands::resources_commands::list_bundled_strategies,
            commands::resources_commands::get_resources_version,
            commands::resources_commands::get_resources_layout,
            commands::resources_commands::get_resources_strategies_path,
commands::resources_commands::read_license_text,
            commands::window::get_monitor_info,
            commands::window::get_display_scale,
            commands::window::toggle_fullscreen,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            let state = handle.state::<process_manager::ProcessManager>();
            window_behavior::register(&handle);
            tray::register(&handle);
            tauri::async_runtime::block_on(async {
                commands::runner::cleanup_orphans(&handle, &state).await;
            });
            tray::create_tray(&handle)?;

            let resources_handle = handle.clone();
            tauri::async_runtime::spawn(async move {
                match commands::resources_commands::init_resources(resources_handle.clone()).await {
                    Ok(report) => {
                        tracing::info!(
                            "Ресурсы готовы: версия {}, стратегий {}, первый запуск {}, распаковано {} байт",
                            report.resources_version,
                            report.strategies_count,
                            report.first_run,
                            report.extracted_bytes
                        );

                        if let Ok(root) = resources_handle.path().app_data_dir() {
                            let cleaned = commands::injector::migrate_legacy_inject(
                                &root.join("strategies").join("lists"),
                            );

                            if cleaned > 0 {
                                tracing::info!(
                                    "Одноразовая миграция инъекций: очищено файлов {cleaned}"
                                );
                            }
                        }
                    }
                    Err(error) => tracing::warn!("Ресурсы не инициализированы: {error}"),
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == tray_menu::MENU_WINDOW_LABEL {
                tray_menu::handle_window_event(window, event);

                return;
            }

            let handle = window.app_handle().clone();

            window_behavior::handle_window_event(&handle, event, || {
                let tracked = window
                    .try_state::<process_manager::ProcessManager>()
                    .map(|state| state.clear())
                    .unwrap_or(0);

                let killed = tauri::async_runtime::block_on(async {
                    commands::runner::kill_winws_for_shutdown().await
                });

                tracing::info!(
                    "Закрытие окна: процессов в менеджере {tracked}, winws.exe {killed}"
                );

                tracked
            });
        });

    let context = tauri::generate_context!();

    if let Err(error) = builder.run(context) {
        tracing::error!("Не удалось запустить приложение: {error}");
        std::process::exit(1);
    }
}