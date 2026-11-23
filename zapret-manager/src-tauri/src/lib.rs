// Выполняем операцию: pub mod bat_env;.
pub mod bat_env;
// Выполняем операцию: mod build_info;.
mod build_info;
// Выполняем операцию: mod commands;.
mod commands;
// Выполняем операцию: mod constants;.
mod constants;
// Выполняем операцию: mod error;.
mod error;
// Выполняем операцию: mod logger;.
mod logger;
// Выполняем операцию: mod process_manager;.
mod process_manager;
// Выполняем операцию: pub mod security;.
pub mod security;
// Выполняем операцию: mod strategy;.
mod strategy;
// Выполняем операцию: pub mod tray;.
pub mod tray;
// Выполняем операцию: mod tray_menu;.
mod tray_menu;
// Выполняем операцию: mod winapi_helpers;.
mod winapi_helpers;
// Выполняем операцию: mod window_behavior;.
mod window_behavior;
// Выполняем операцию: mod window_menu;.
mod window_menu;

// Выполняем операцию: pub use error::{AppError, AppResult};.
pub use error::{AppError, AppResult};

// Подключаем модули: tauri::Manager;.
use tauri::Manager;

// Применяем атрибут к следующему объявлению.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
// Объявляем функцию run.
pub fn run() {
    // Выполняем операцию: logger::init();.
    logger::init();

    // Объявляем переменную builder .
    let builder = tauri::Builder::default()
        // Выполняем операцию: .plugin(tauri_plugin_fs::init()).
        .plugin(tauri_plugin_fs::init())
        // Выполняем операцию: .plugin(tauri_plugin_dialog::init()).
        .plugin(tauri_plugin_dialog::init())
        // Выполняем операцию: .plugin(tauri_plugin_notification::init()).
        .plugin(tauri_plugin_notification::init())
        // Выполняем операцию: .plugin(tauri_plugin_opener::init()).
        .plugin(tauri_plugin_opener::init())
        // Выполняем операцию: .plugin(tauri_plugin_autostart::init(.
        .plugin(tauri_plugin_autostart::init(
            // Выполняем операцию: tauri_plugin_autostart::MacosLauncher::LaunchAgent,.
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            // Выполняем операцию: None,.
            None,
            // Закрываем выражение или коллекцию.
        ))
        // Выполняем операцию: .manage(process_manager::ProcessManager::new()).
        .manage(process_manager::ProcessManager::new())
        // Выполняем операцию: .manage(commands::monitor::MonitorState::new()).
        .manage(commands::monitor::MonitorState::new())
        // Выполняем операцию: .manage(commands::updater::UpdateState::new()).
        .manage(commands::updater::UpdateState::new())
        // Выполняем операцию: .manage(commands::vpn::VpnState::new()).
        .manage(commands::vpn::VpnState::new())
        // Выполняем операцию: .manage(commands::vpn_core::XrayRuntime::new()).
        .manage(commands::vpn_core::XrayRuntime::new())
        // Выполняем операцию: .manage(commands::runner::ScanState::default()).
        .manage(commands::runner::ScanState::default())
        // Выполняем операцию: .invoke_handler(tauri::generate_handler![.
        .invoke_handler(tauri::generate_handler![
            // Выполняем операцию: commands::scanner::scan_strategies,.
            commands::scanner::scan_strategies,
            // Выполняем операцию: commands::runner::run_strategy,.
            commands::runner::run_strategy,
            // Выполняем операцию: commands::runner::run_strategy_native,.
            commands::runner::run_strategy_native,
            // Выполняем операцию: commands::runner::run_strategy_auto,.
            commands::runner::run_strategy_auto,
            // Выполняем операцию: commands::runner::stop_strategy,.
            commands::runner::stop_strategy,
            // Выполняем операцию: commands::runner::check_strategy_status,.
            commands::runner::check_strategy_status,
            // Выполняем операцию: commands::runner::list_running_processes,.
            commands::runner::list_running_processes,
            // Выполняем операцию: commands::log_export::export_logs_file,.
            commands::log_export::export_logs_file,
            // Выполняем операцию: commands::injector::inject_outlast,.
            commands::injector::inject_outlast,
            // Выполняем операцию: commands::injector::restore_backup,.
            commands::injector::restore_backup,
            // Выполняем операцию: commands::injector::list_backups,.
            commands::injector::list_backups,
            // Выполняем операцию: commands::network::ping_hosts,.
            commands::network::ping_hosts,
            // Выполняем операцию: commands::network::fetch_network_info,.
            commands::network::fetch_network_info,
            // Выполняем операцию: commands::monitor::get_network_stats,.
            commands::monitor::get_network_stats,
            // Выполняем операцию: commands::monitor::start_monitoring,.
            commands::monitor::start_monitoring,
            // Выполняем операцию: commands::monitor::stop_monitoring,.
            commands::monitor::stop_monitoring,
            // Выполняем операцию: commands::monitor_snapshot::save_monitor_snapshot,.
            commands::monitor_snapshot::save_monitor_snapshot,
            // Выполняем операцию: commands::game_scanner::scan_installed_games,.
            commands::game_scanner::scan_installed_games,
            // Выполняем операцию: commands::game_scanner::match_known_game,.
            commands::game_scanner::match_known_game,
            // Выполняем операцию: commands::game_launcher::launch_game,.
            commands::game_launcher::launch_game,
            // Выполняем операцию: commands::game_launcher::hide_main_window,.
            commands::game_launcher::hide_main_window,
            // Выполняем операцию: commands::game_launcher::is_game_running,.
            commands::game_launcher::is_game_running,
            // Выполняем операцию: commands::game_launcher::close_game,.
            commands::game_launcher::close_game,
            // Выполняем операцию: commands::game_launcher::close_game_by_path,.
            commands::game_launcher::close_game_by_path,
            // Выполняем операцию: commands::cover_fetcher::game_cover_file,.
            commands::cover_fetcher::game_cover_file,
            // Выполняем операцию: commands::cover_fetcher::game_cover_for,.
            commands::cover_fetcher::game_cover_for,
            // Выполняем операцию: commands::game_launcher::running_games,.
            commands::game_launcher::running_games,
            // Выполняем операцию: commands::game_tuner::tune_strategy_for_game,.
            commands::game_tuner::tune_strategy_for_game,
            // Выполняем операцию: commands::game_healthcheck::check_game_connectivity,.
            commands::game_healthcheck::check_game_connectivity,
            // Выполняем операцию: commands::game_healthcheck::check_game_endpoints,.
            commands::game_healthcheck::check_game_endpoints,
            // Выполняем операцию: commands::log_analyzer::analyze_game_logs,.
            commands::log_analyzer::analyze_game_logs,
            // Выполняем операцию: commands::traffic_probe::detect_game_endpoints,.
            commands::traffic_probe::detect_game_endpoints,
            // Выполняем операцию: commands::traffic_probe::analyze_traffic,.
            commands::traffic_probe::analyze_traffic,
            // Выполняем операцию: commands::game_covers::game_cover,.
            commands::game_covers::game_cover,
            // Выполняем операцию: commands::game_covers::game_steam_cover,.
            commands::game_covers::game_steam_cover,
            // Выполняем операцию: commands::game_covers::game_folder_cover,.
            commands::game_covers::game_folder_cover,
            // Выполняем операцию: commands::game_covers::game_exe_icon,.
            commands::game_covers::game_exe_icon,
            // Выполняем операцию: commands::updater::check_for_updates,.
            commands::updater::check_for_updates,
            // Выполняем операцию: commands::updater_download::download_update,.
            commands::updater_download::download_update,
            // Выполняем операцию: commands::updater_apply::install_update,.
            commands::updater_apply::install_update,
            // Выполняем операцию: commands::updater_apply::cancel_download,.
            commands::updater_apply::cancel_download,
            // Выполняем операцию: commands::updater_apply::set_current_version,.
            commands::updater_apply::set_current_version,
            // Выполняем операцию: commands::updater_apply::list_update_backups,.
            commands::updater_apply::list_update_backups,
            // Выполняем операцию: commands::updater_apply::rollback_update,.
            commands::updater_apply::rollback_update,
            // Выполняем операцию: commands::system::get_system_info,.
            commands::system::get_system_info,
            // Выполняем операцию: commands::system::open_folder,.
            commands::system::open_folder,
            // Выполняем операцию: commands::system::verify_configs,.
            commands::system::verify_configs,
            // Выполняем операцию: commands::system::system_toasts_enabled,.
            commands::system::system_toasts_enabled,
            // Выполняем операцию: commands::system::delete_all_backups,.
            commands::system::delete_all_backups,
            // Выполняем операцию: commands::system::delete_all_logs,.
            commands::system::delete_all_logs,
            // Выполняем операцию: commands::system::prune_logs,.
            commands::system::prune_logs,
            // Выполняем операцию: commands::system::full_uninstall,.
            commands::system::full_uninstall,
            // Выполняем операцию: commands::user_files::open_external_url,.
            commands::user_files::open_external_url,
            // Выполняем операцию: commands::user_files::export_settings_file,.
            commands::user_files::export_settings_file,
            // Выполняем операцию: commands::user_files::import_settings_file,.
            commands::user_files::import_settings_file,
            // Выполняем операцию: commands::vpn::import_vpn_config,.
            commands::vpn::import_vpn_config,
            // Выполняем операцию: commands::vpn_core::install_vpn_core,.
            commands::vpn_core::install_vpn_core,
            // Выполняем операцию: commands::vpn_core::vpn_core_status,.
            commands::vpn_core::vpn_core_status,
            // Выполняем операцию: commands::vpn_orchestrator::auto_connect_vpn,.
            commands::vpn_orchestrator::auto_connect_vpn,
            // Выполняем операцию: commands::subscription::get_subscription,.
            commands::subscription::get_subscription,
            // Выполняем операцию: commands::subscription::fetch_tariff_matrix,.
            commands::subscription::fetch_tariff_matrix,
            // Выполняем операцию: commands::subscription::add_subscription,.
            commands::subscription::add_subscription,
            // Выполняем операцию: commands::subscription::refresh_subscription,.
            commands::subscription::refresh_subscription,
            // Выполняем операцию: commands::subscription::remove_subscription,.
            commands::subscription::remove_subscription,
            // Выполняем операцию: commands::subscription::prepare_subscription_servers,.
            commands::subscription::prepare_subscription_servers,
            // Выполняем операцию: commands::payment::open_payment_window,.
            commands::payment::open_payment_window,
            // Выполняем операцию: commands::payment::payment_window_url,.
            commands::payment::payment_window_url,
            // Выполняем операцию: commands::payment::find_subscription_in_maxima_page,.
            commands::payment::find_subscription_in_maxima_page,
            // Выполняем операцию: commands::payment_orders::create_payment_order_command,.
            commands::payment_orders::create_payment_order_command,
            // Выполняем операцию: commands::strategy_rating::measure_strategy_rating,.
            commands::strategy_rating::measure_strategy_rating,
            // Выполняем операцию: commands::strategy_rating::get_strategy_ratings,.
            commands::strategy_rating::get_strategy_ratings,
            // Выполняем операцию: commands::strategy_rating::reset_strategy_ratings,.
            commands::strategy_rating::reset_strategy_ratings,
            // Выполняем операцию: commands::vpn_core::disconnect_vpn_server,.
            commands::vpn_core::disconnect_vpn_server,
            // Выполняем операцию: commands::vpn::list_vpn_configs,.
            commands::vpn::list_vpn_configs,
            // Выполняем операцию: commands::vpn::delete_vpn_config,.
            commands::vpn::delete_vpn_config,
            // Выполняем операцию: commands::vpn::switch_to_vpn,.
            commands::vpn::switch_to_vpn,
            // Выполняем операцию: commands::vpn::switch_to_dpi,.
            commands::vpn::switch_to_dpi,
            // Выполняем операцию: commands::vpn::disconnect_vpn,.
            commands::vpn::disconnect_vpn,
            // Выполняем операцию: commands::vpn::get_vpn_status,.
            commands::vpn::get_vpn_status,
            // Выполняем операцию: commands::vpn::get_vpn_stats,.
            commands::vpn::get_vpn_stats,
            // Выполняем операцию: commands::vpn::reconcile_vpn_tunnels,.
            commands::vpn::reconcile_vpn_tunnels,
            // Выполняем операцию: commands::vpn::is_wireguard_installed,.
            commands::vpn::is_wireguard_installed,
            // Выполняем операцию: commands::tray::update_tray_state,.
            commands::tray::update_tray_state,
            // Выполняем операцию: commands::tray::update_tray_config,.
            commands::tray::update_tray_config,
            // Выполняем операцию: commands::tray::show_notification,.
            commands::tray::show_notification,
            // Выполняем операцию: commands::notify::set_notification_channel,.
            commands::notify::set_notification_channel,
            // Выполняем операцию: commands::tray::tray_menu_snapshot,.
            commands::tray::tray_menu_snapshot,
            // Выполняем операцию: commands::tray::tray_menu_ready,.
            commands::tray::tray_menu_ready,
            // Выполняем операцию: commands::tray::tray_menu_set_height,.
            commands::tray::tray_menu_set_height,
            // Выполняем операцию: commands::tray::tray_menu_hide,.
            commands::tray::tray_menu_hide,
            // Выполняем операцию: commands::tray::tray_menu_action,.
            commands::tray::tray_menu_action,
            // Выполняем операцию: commands::tray::quit_app,.
            commands::tray::quit_app,
            // Выполняем операцию: window_behavior::set_minimize_to_tray_cmd,.
            window_behavior::set_minimize_to_tray_cmd,
            // Выполняем операцию: commands::resources_commands::init_resources,.
            commands::resources_commands::init_resources,
            // Выполняем операцию: commands::resources_commands::check_resources_integrity.
            commands::resources_commands::check_resources_integrity,
            // Выполняем операцию: commands::resources_commands::restore_bundled_strategie.
            commands::resources_commands::restore_bundled_strategies,
            // Выполняем операцию: commands::resources_commands::get_resources_version,.
            commands::resources_commands::get_resources_version,
            // Выполняем операцию: commands::resources_commands::get_resources_layout,.
            commands::resources_commands::get_resources_layout,
            // Выполняем операцию: commands::resources_commands::get_resources_strategies_.
            commands::resources_commands::get_resources_strategies_path,
            // Выполняем операцию: commands::resources_commands::read_license_text,.
            commands::resources_commands::read_license_text,
            // Выполняем операцию: ]).
        ])
        // Выполняем операцию: .setup(|app| {.
        .setup(|app| {
            // Объявляем переменную handle .
            let handle = app.handle().clone();
            // Объявляем переменную state .
            let state = handle.state::<process_manager::ProcessManager>();
            // Выполняем операцию: window_behavior::register(&handle);.
            window_behavior::register(&handle);

            // Контекстное меню приходило из WebView2 и перехватывалось нативно:
            // обработчик в интерфейсе его не видел, потому что клик по
            // перетаскиваемой области шапки до JavaScript не доходит. Гасим
            // сообщениями окон; вложенное окно веб-интерфейса появляется позже,
            // поэтому подкласс ставится ещё раз после прогрева.
            // Перебираем элементы коллекции.
            for label in [tray::WINDOW_LABEL, crate::tray_menu::MENU_WINDOW_LABEL] {
                // Проверяем условие: let Some(window) = app.get_webview_window(label) {.
                if let Some(window) = app.get_webview_window(label) {
                    // Выполняем операцию: window_menu::suppress_context_menu(&window);.
                    window_menu::suppress_context_menu(&window);
                    // Закрываем блок.
                }
                // Закрываем блок.
            }

            // Выполняем операцию: tray::register(&handle);.
            tray::register(&handle);

            // Прокси от прошлого запуска мог остаться, если приложение
            // убили, не успев его выключить: тогда страницы не
            // открываются ни в приложении, ни в системе.
            // Выполняем операцию: commands::vpn_proxy::clear_stale_tunnel_proxy(commands:.
            commands::vpn_proxy::clear_stale_tunnel_proxy(commands::vpn_xray::DEFAULT_HTTP_PORT);
            // Выполняем операцию: tauri::async_runtime::block_on(async {.
            tauri::async_runtime::block_on(async {
                // Выполняем операцию: commands::runner::cleanup_orphans(&handle, &state).awai.
                commands::runner::cleanup_orphans(&handle, &state).await;
                // Закрываем блок.
            });
            // Выполняем операцию: tray::create_tray(&handle)?;.
            tray::create_tray(&handle)?;
            // Выполняем операцию: tray_menu::schedule_warmup(handle.clone());.
            tray_menu::schedule_warmup(handle.clone());
            // Проверяем условие: let Err(error) = crate::commands::notify::ensure_p.
            if let Err(error) = crate::commands::notify::ensure_permission(&handle) {
                // Выполняем операцию: tracing::warn!("Разрешение на уведомления: {error}");.
                tracing::warn!("Разрешение на уведомления: {error}");
                // Закрываем блок.
            }

            // Обложки игр отдаются файлом через протокол ресурсов.
            // Папке кэша нужен явный доступ: без него картинки не
            // грузятся, а вместо них показывается заглушка.
            // Выбираем вариант по значению.
            match commands::cover_fetcher::covers_cache_dir(&handle) {
                // Выполняем операцию: Ok(dir) => {.
                Ok(dir) => {
                    // Проверяем условие: let Err(error) = app.asset_protocol_scope().allow_.
                    if let Err(error) = app.asset_protocol_scope().allow_directory(&dir, true) {
                        // Выполняем операцию: tracing::warn!("Доступ к обложкам не выдан: {error}");.
                        tracing::warn!("Доступ к обложкам не выдан: {error}");
                        // Закрываем блок.
                    }
                    // Закрываем блок.
                }
                // Выполняем операцию: Err(error) => tracing::warn!("Папка обложек недоступна:.
                Err(error) => tracing::warn!("Папка обложек недоступна: {error}"),
                // Закрываем блок.
            }

            // Инициализацию ресурсов запускает фронтенд: только после
            // подписки на событие прогресса. Из setup она стартовала
            // раньше WebView, и первый экран не видел ни одной стадии.
            // Выполняем операцию: Ok(()).
            Ok(())
            // Закрываем блок.
        })
        // Выполняем операцию: .on_window_event(|window, event| {.
        .on_window_event(|window, event| {
            // Проверяем условие: window.label() == tray_menu::MENU_WINDOW_LABEL {.
            if window.label() == tray_menu::MENU_WINDOW_LABEL {
                // Выполняем операцию: tray_menu::handle_window_event(window, event);.
                tray_menu::handle_window_event(window, event);

                // Возвращаем результат из функции.
                return;
                // Закрываем блок.
            }

            // Схлопывание в трей и чистка процессов — только для главного
            // окна. Служебные окна (оплата и другие) закрываются своим
            // крестиком: раньше перехват вместо их закрытия прятал главную
            // форму, и выглядело это как выход из приложения.
            // Проверяем условие: window.label() != tray::WINDOW_LABEL {.
            if window.label() != tray::WINDOW_LABEL {
                // Возвращаем результат из функции.
                return;
                // Закрываем блок.
            }

            // Объявляем переменную handle .
            let handle = window.app_handle().clone();

            // Выполняем операцию: window_behavior::handle_window_event(&handle, event, ||.
            window_behavior::handle_window_event(&handle, event, || {
                // Объявляем переменную tracked .
                let tracked = window
                    // Выполняем операцию: .try_state::<process_manager::ProcessManager>().
                    .try_state::<process_manager::ProcessManager>()
                    // Выполняем операцию: .map(|state| state.clear()).
                    .map(|state| state.clear())
                    // Выполняем операцию: .unwrap_or(0);.
                    .unwrap_or(0);

                // Проверяем условие: let Some(runtime) = handle.try_state::<commands::v.
                if let Some(runtime) = handle.try_state::<commands::vpn_core::XrayRuntime>() {
                    // Выполняем операцию: runtime.shutdown();.
                    runtime.shutdown();
                    // Закрываем блок.
                }

                // Объявляем переменную killed .
                let killed = tauri::async_runtime::block_on(async {
                    // Выполняем операцию: commands::runner::kill_winws_for_shutdown().await.
                    commands::runner::kill_winws_for_shutdown().await
                    // Закрываем блок.
                });

                // Выполняем операцию: tracing::info!(.
                tracing::info!(
                    // Выполняем операцию: "Закрытие окна: процессов в менеджере {tracked}, winws..
                    "Закрытие окна: процессов в менеджере {tracked}, winws.exe {killed}" // Закрываем выражение или коллекцию.
                );

                // Выполняем операцию: tracked.
                tracked
                // Закрываем блок.
            });
            // Закрываем блок.
        });

    // Объявляем переменную context .
    let context = tauri::generate_context!();

    // Проверяем условие: let Err(error) = builder.run(context) {.
    if let Err(error) = builder.run(context) {
        // Выполняем операцию: tracing::error!("Не удалось запустить приложение: {erro.
        tracing::error!("Не удалось запустить приложение: {error}");
        // Выполняем операцию: std::process::exit(1);.
        std::process::exit(1);
        // Закрываем блок.
    }
    // Закрываем блок.
}
