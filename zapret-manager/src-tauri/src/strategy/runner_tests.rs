// Подключаем модули: std::fs;.
use std::fs;
// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;
// Подключаем модули: std::process::Command;.
use std::process::Command;

// Подключаем модули: super::games_hostlist::{cleanup, games_dir, GAMES_HOSTL.
use super::games_hostlist::{cleanup, games_dir, GAMES_HOSTLIST_NAME};
// Подключаем модули: super::runner::{ensure_user_lists, prepare_run, resolve.
use super::runner::{ensure_user_lists, prepare_run, resolve_winws_path, GameRequest};
// Подключаем модули: crate::strategy::config::StrategyConfig;.
use crate::strategy::config::StrategyConfig;

// Применяем атрибут к следующему объявлению.
#[cfg(windows)]
// Подключаем модули: std::os::windows::process::CommandExt;.
use std::os::windows::process::CommandExt;

// Подключаем модули: crate::winapi_helpers::CREATE_NO_WINDOW;.
use crate::winapi_helpers::CREATE_NO_WINDOW;

// Объявляем константу SAMPLE_BAT.
const SAMPLE_BAT: &str = "@echo off\r\n\
set \"BIN=%~dp0bin\\\"\r\n\
set \"LISTS=%~dp0lists\\\"\r\n\
start \"zapret\" /min \"%BIN%winws.exe\" --wf-tcp=80,443,%GameFilterTCP% --wf-udp=443,%GameFilterUDP% ^\r\n\
--filter-udp=443 --hostlist=\"%LISTS%list-general.txt\" --dpi-desync=fake\r\n";

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-runner-{name}"));
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: fs::create_dir_all(&dir).expect("создать папку");.
    fs::create_dir_all(&dir).expect("создать папку");
    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Объявляем функцию game.
fn game() -> GameRequest {
    // Выполняем операцию: GameRequest {.
    GameRequest {
        // Выполняем операцию: name: "Outlast Trials".to_string(),.
        name: "Outlast Trials".to_string(),
        // Выполняем операцию: domains: vec![.
        domains: vec![
            // Выполняем операцию: "Example.com".to_string(),.
            "Example.com".to_string(),
            // Выполняем операцию: "example.com.".to_string(),.
            "example.com.".to_string(),
            // Выполняем операцию: "steamcommunity.com".to_string(),.
            "steamcommunity.com".to_string(),
            // Выполняем операцию: ],.
        ],
        // Выполняем операцию: ips: Vec::new(),.
        ips: Vec::new(),
        // Выполняем операцию: ports: vec![7780],.
        ports: vec![7780],
        // Выполняем операцию: drop_udp_filter: false,.
        drop_udp_filter: false,
        // Выполняем операцию: drop_ipset: false,.
        drop_ipset: false,
        // Выполняем операцию: id: Some("outlast-trials".to_string()),.
        id: Some("outlast-trials".to_string()),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_prepare_run_builds_args_with_log.
fn test_prepare_run_builds_args_with_log() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("basic");
    // Объявляем переменную bat .
    let bat = dir.join("general.bat");
    // Выполняем операцию: fs::write(&bat, SAMPLE_BAT).expect("записать bat");.
    fs::write(&bat, SAMPLE_BAT).expect("записать bat");
    // Объявляем переменную log .
    let log = dir.join("run.log");

    // Объявляем переменную prepared .
    let prepared = prepare_run(&bat, SAMPLE_BAT, &[], &log).expect("prepare");

    // Выполняем операцию: assert_eq!(prepared.config.wf_tcp.as_deref(), Some("80,.
    assert_eq!(prepared.config.wf_tcp.as_deref(), Some("80,443,12"));
    // Выполняем операцию: assert_eq!(prepared.config.filter_groups_count(), 1);.
    assert_eq!(prepared.config.filter_groups_count(), 1);
    // Выполняем операцию: assert!(prepared.
    assert!(prepared
        // Выполняем операцию: .arguments.
        .arguments
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|arg| arg == &format!("--debug=@{}", log.display().
        .any(|arg| arg == &format!("--debug=@{}", log.display())));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: cleanup(&games_dir());.
    cleanup(&games_dir());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_prepare_run_with_games_adds_hostlist.
fn test_prepare_run_with_games_adds_hostlist() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("games");
    // Объявляем переменную bat .
    let bat = dir.join("general.bat");
    // Выполняем операцию: fs::write(&bat, SAMPLE_BAT).expect("записать bat");.
    fs::write(&bat, SAMPLE_BAT).expect("записать bat");
    // Объявляем переменную log .
    let log = dir.join("run.log");

    // Объявляем переменную prepared .
    let prepared = prepare_run(&bat, SAMPLE_BAT, &[game()], &log).expect("prepare");
    // Объявляем переменную expected .
    let expected = games_dir().join(GAMES_HOSTLIST_NAME);

    // Выполняем операцию: assert_eq!(prepared.games.domains_count, 2);.
    assert_eq!(prepared.games.domains_count, 2);
    // Выполняем операцию: assert!(prepared.games.hostlist.is_some());.
    assert!(prepared.games.hostlist.is_some());
    // Выполняем операцию: assert!(prepared.
    assert!(prepared
        // Выполняем операцию: .arguments.
        .arguments
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|arg| arg == &format!("--hostlist={}", expected.di.
        .any(|arg| arg == &format!("--hostlist={}", expected.display())));

    // Объявляем переменную content .
    let content = fs::read_to_string(&expected).expect("прочитать list-games.txt");

    // Выполняем операцию: assert_eq!(content.matches("example.com").count(), 1);.
    assert_eq!(content.matches("example.com").count(), 1);
    // Выполняем операцию: assert_eq!(content.matches("steamcommunity.com").count(.
    assert_eq!(content.matches("steamcommunity.com").count(), 1);

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: cleanup(&games_dir());.
    cleanup(&games_dir());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_prepare_run_without_games_has_no_games_args.
fn test_prepare_run_without_games_has_no_games_args() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("no-games");
    // Объявляем переменную bat .
    let bat = dir.join("general.bat");
    // Выполняем операцию: fs::write(&bat, SAMPLE_BAT).expect("записать bat");.
    fs::write(&bat, SAMPLE_BAT).expect("записать bat");
    // Объявляем переменную log .
    let log = dir.join("run.log");

    // Объявляем переменную prepared .
    let prepared = prepare_run(&bat, SAMPLE_BAT, &[], &log).expect("prepare");

    // Выполняем операцию: assert!(!prepared.
    assert!(!prepared
        // Выполняем операцию: .arguments.
        .arguments
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|arg| arg.contains("list-games.txt")));.
        .any(|arg| arg.contains("list-games.txt")));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: cleanup(&games_dir());.
    cleanup(&games_dir());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_winws_path_uses_configured_existing_file.
fn test_resolve_winws_path_uses_configured_existing_file() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("winws-configured");
    // Объявляем переменную winws .
    let winws = dir.join("winws.exe");
    // Выполняем операцию: fs::write(&winws, b"stub").expect("записать winws.exe").
    fs::write(&winws, b"stub").expect("записать winws.exe");

    // Объявляем переменную config .
    let config = StrategyConfig {
        // Выполняем операцию: source_filename: "general.bat".to_string(),.
        source_filename: "general.bat".to_string(),
        // Выполняем операцию: winws_path: winws.to_string_lossy().to_string(),.
        winws_path: winws.to_string_lossy().to_string(),
        // Выполняем операцию: wf_tcp: Some("80".to_string()),.
        wf_tcp: Some("80".to_string()),
        // Выполняем операцию: wf_udp: None,.
        wf_udp: None,
        // Выполняем операцию: groups: vec![crate::strategy::config::FilterGroup::defa.
        groups: vec![crate::strategy::config::FilterGroup::default()],
        // Закрываем блок.
    };

    // Выполняем операцию: assert_eq!(resolve_winws_path(&config, &dir), winws);.
    assert_eq!(resolve_winws_path(&config, &dir), winws);

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_winws_path_falls_back_to_bin_dir.
fn test_resolve_winws_path_falls_back_to_bin_dir() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("winws-fallback");

    // Объявляем переменную config .
    let config = StrategyConfig {
        // Выполняем операцию: source_filename: "general.bat".to_string(),.
        source_filename: "general.bat".to_string(),
        // Выполняем операцию: winws_path: r"C:\missing\winws.exe".to_string(),.
        winws_path: r"C:\missing\winws.exe".to_string(),
        // Выполняем операцию: wf_tcp: Some("80".to_string()),.
        wf_tcp: Some("80".to_string()),
        // Выполняем операцию: wf_udp: None,.
        wf_udp: None,
        // Выполняем операцию: groups: vec![crate::strategy::config::FilterGroup::defa.
        groups: vec![crate::strategy::config::FilterGroup::default()],
        // Закрываем блок.
    };

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: resolve_winws_path(&config, &dir),.
        resolve_winws_path(&config, &dir),
        // Выполняем операцию: dir.join("bin").join("winws.exe").
        dir.join("bin").join("winws.exe") // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_generated_args_have_no_extended_prefix_when_available.
fn test_generated_args_have_no_extended_prefix_when_available() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную Some(appdata) .
    let Some(appdata) = std::env::var_os("APPDATA") else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // Объявляем переменную dir .
    let dir = PathBuf::from(appdata)
        // Выполняем операцию: .join("com.zapretmanager.app").
        .join("com.zapretmanager.app")
        // Выполняем операцию: .join("strategies");.
        .join("strategies");
    // Объявляем переменную bat .
    let bat = dir.join("general-07-alt.bat");

    // Проверяем условие: !bat.is_file() {.
    if !bat.is_file() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную validated .
    let validated =
        // Выполняем операцию: crate::security::paths::validate_strategy_file(&bat, So.
        crate::security::paths::validate_strategy_file(&bat, Some(&dir)).expect("validate");
    // Объявляем переменную content .
    let content = fs::read_to_string(&validated).expect("прочитать");
    // Объявляем переменную log .
    let log = std::env::temp_dir().join("zapret-prefix-check.log");
    // Объявляем переменную prepared .
    let prepared = prepare_run(&validated, &content, &[], &log).expect("prepare");

    // Выполняем операцию: assert!(!prepared.config.winws_path.contains(r"\\?\"));.
    assert!(!prepared.config.winws_path.contains(r"\\?\"));

    // Перебираем элементы коллекции.
    for arg in &prepared.arguments {
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: !arg.contains(r"\\?\"),.
            !arg.contains(r"\\?\"),
            // Выполняем операцию: "аргумент содержит extended-префикс: {arg}".
            "аргумент содержит extended-префикс: {arg}" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: cleanup(&games_dir());.
    cleanup(&games_dir());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_ensure_user_lists_creates_missing_files.
fn test_ensure_user_lists_creates_missing_files() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("user-lists");

    // Выполняем операцию: ensure_user_lists(&dir).expect("создать списки");.
    ensure_user_lists(&dir).expect("создать списки");

    // Объявляем переменную lists .
    let lists = dir.join("lists");

    // Перебираем элементы коллекции.
    for name in [
        // Выполняем операцию: "ipset-exclude-user.txt",.
        "ipset-exclude-user.txt",
        // Выполняем операцию: "list-general-user.txt",.
        "list-general-user.txt",
        // Выполняем операцию: "list-exclude-user.txt",.
        "list-exclude-user.txt",
        // Выполняем операцию: ] {.
    ] {
        // Выполняем операцию: assert!(lists.join(name).is_file(), "{name} должен быть.
        assert!(lists.join(name).is_file(), "{name} должен быть создан");
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_ensure_user_lists_does_not_overwrite.
fn test_ensure_user_lists_does_not_overwrite() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную dir .
    let dir = temp_dir("user-lists-keep");
    // Объявляем переменную lists .
    let lists = dir.join("lists");
    // Выполняем операцию: fs::create_dir_all(&lists).expect("создать lists");.
    fs::create_dir_all(&lists).expect("создать lists");
    // Объявляем переменную custom .
    let custom = lists.join("list-general-user.txt");
    // Выполняем операцию: fs::write(&custom, "my-custom-domain.example\r\n").expe.
    fs::write(&custom, "my-custom-domain.example\r\n").expect("записать файл");

    // Выполняем операцию: ensure_user_lists(&dir).expect("ensure");.
    ensure_user_lists(&dir).expect("ensure");

    // Объявляем переменную content .
    let content = fs::read_to_string(&custom).expect("прочитать файл");

    // Выполняем операцию: assert_eq!(content, "my-custom-domain.example\r\n");.
    assert_eq!(content, "my-custom-domain.example\r\n");

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_winws_dry_run_all_real_strategies_when_available.
fn test_winws_dry_run_all_real_strategies_when_available() {
    // Объявляем переменную _guard .
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|error| error.into_inner());.
        .unwrap_or_else(|error| error.into_inner());
    // Объявляем переменную Some(appdata) .
    let Some(appdata) = std::env::var_os("APPDATA") else {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    };

    // winws.exe требует повышения прав; без UAC тест не может его запустить.
    // Проверяем условие: !crate::winapi_helpers::is_process_elevated() {.
    if !crate::winapi_helpers::is_process_elevated() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную _guard .
    let _guard = crate::commands::winws::WINWS_TEST_LOCK
        // Выполняем операцию: .lock().
        .lock()
        // Выполняем операцию: .unwrap_or_else(|poisoned| poisoned.into_inner());.
        .unwrap_or_else(|poisoned| poisoned.into_inner());

    // Объявляем переменную dir .
    let dir = PathBuf::from(appdata)
        // Выполняем операцию: .join("com.zapretmanager.app").
        .join("com.zapretmanager.app")
        // Выполняем операцию: .join("strategies");.
        .join("strategies");
    // Объявляем переменную winws .
    let winws = dir.join("bin").join("winws.exe");

    // Проверяем условие: !winws.is_file() {.
    if !winws.is_file() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную log .
    let log = std::env::temp_dir().join("zapret-dry-run.log");

    // Перебираем элементы коллекции.
    for entry in fs::read_dir(&dir).expect("прочитать папку стратегий") {
        // Объявляем переменную path .
        let path = entry.expect("запись").path();
        // Объявляем переменную name .
        let name = path
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .map(|value| value.to_string_lossy().to_string()).
            .map(|value| value.to_string_lossy().to_string())
            // Выполняем операцию: .unwrap_or_default();.
            .unwrap_or_default();

        // Проверяем условие: !name.to_ascii_lowercase().ends_with(".bat") || na.
        if !name.to_ascii_lowercase().ends_with(".bat") || name.eq_ignore_ascii_case("service.bat")
        // Выполняем операцию: {.
        {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную content .
        let content = fs::read_to_string(&path).expect("прочитать .bat");
        // Объявляем переменную prepared .
        let prepared = prepare_run(&path, &content, &[], &log).expect("prepare");

        // Объявляем переменную command .
        let mut command = Command::new(&winws);
        // Выполняем операцию: command.current_dir(&dir);.
        command.current_dir(&dir);
        // Выполняем операцию: command.args(&prepared.arguments);.
        command.args(&prepared.arguments);
        // Выполняем операцию: command.arg("--dry-run");.
        command.arg("--dry-run");
        // Выполняем операцию: command.creation_flags(CREATE_NO_WINDOW);.
        command.creation_flags(CREATE_NO_WINDOW);

        // Объявляем переменную output .
        let output = command.output().expect("запустить winws.exe");
        // Объявляем переменную stderr .
        let stderr = String::from_utf8_lossy(&output.stderr);
        // Объявляем переменную stdout .
        let stdout = String::from_utf8_lossy(&output.stdout);

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: output.status.success(),.
            output.status.success(),
            // Выполняем операцию: "{name}: winws.exe отклонил аргументы: {}\nstdout: {std.
            "{name}: winws.exe отклонил аргументы: {}\nstdout: {stdout}\nstderr: {stderr}",
            // Выполняем операцию: output.status.
            output.status // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: cleanup(&games_dir());.
    cleanup(&games_dir());
    // Объявляем переменную _ .
    let _ = fs::remove_file(&log);
    // Закрываем блок.
}
