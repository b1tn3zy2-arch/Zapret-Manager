use std::fs;
use std::path::PathBuf;
use std::process::Command;

use super::games_hostlist::{cleanup, games_dir, GAMES_HOSTLIST_NAME};
use super::runner::{ensure_user_lists, prepare_run, resolve_winws_path, GameRequest};
use crate::strategy::config::StrategyConfig;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

use crate::winapi_helpers::CREATE_NO_WINDOW;

const SAMPLE_BAT: &str = "@echo off\r\n\
set \"BIN=%~dp0bin\\\"\r\n\
set \"LISTS=%~dp0lists\\\"\r\n\
start \"zapret\" /min \"%BIN%winws.exe\" --wf-tcp=80,443,%GameFilterTCP% --wf-udp=443,%GameFilterUDP% ^\r\n\
--filter-udp=443 --hostlist=\"%LISTS%list-general.txt\" --dpi-desync=fake\r\n";

fn temp_dir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("zapret-runner-{name}"));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("создать папку");
    dir
}

fn game() -> GameRequest {
    GameRequest {
        name: "Outlast Trials".to_string(),
        domains: vec![
            "Example.com".to_string(),
            "example.com.".to_string(),
            "steamcommunity.com".to_string(),
        ],
        ips: Vec::new(),
        ports: vec![7780],
        id: Some("outlast-trials".to_string()),
    }
}

#[test]
fn test_prepare_run_builds_args_with_log() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("basic");
    let bat = dir.join("general.bat");
    fs::write(&bat, SAMPLE_BAT).expect("записать bat");
    let log = dir.join("run.log");

    let prepared = prepare_run(&bat, SAMPLE_BAT, &[], &log).expect("prepare");

    assert_eq!(prepared.config.wf_tcp.as_deref(), Some("80,443,12"));
    assert_eq!(prepared.config.filter_groups_count(), 1);
    assert!(prepared
        .arguments
        .iter()
        .any(|arg| arg == &format!("--debug=@{}", log.display())));

    let _ = fs::remove_dir_all(&dir);
    cleanup(&games_dir());
}

#[test]
fn test_prepare_run_with_games_adds_hostlist() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("games");
    let bat = dir.join("general.bat");
    fs::write(&bat, SAMPLE_BAT).expect("записать bat");
    let log = dir.join("run.log");

    let prepared = prepare_run(&bat, SAMPLE_BAT, &[game()], &log).expect("prepare");
    let expected = games_dir().join(GAMES_HOSTLIST_NAME);

    assert_eq!(prepared.games.domains_count, 2);
    assert!(prepared.games.hostlist.is_some());
    assert!(prepared
        .arguments
        .iter()
        .any(|arg| arg == &format!("--hostlist={}", expected.display())));

    let content = fs::read_to_string(&expected).expect("прочитать list-games.txt");

    assert_eq!(content.matches("example.com").count(), 1);
    assert_eq!(content.matches("steamcommunity.com").count(), 1);

    let _ = fs::remove_dir_all(&dir);
    cleanup(&games_dir());
}

#[test]
fn test_prepare_run_without_games_has_no_games_args() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("no-games");
    let bat = dir.join("general.bat");
    fs::write(&bat, SAMPLE_BAT).expect("записать bat");
    let log = dir.join("run.log");

    let prepared = prepare_run(&bat, SAMPLE_BAT, &[], &log).expect("prepare");

    assert!(!prepared
        .arguments
        .iter()
        .any(|arg| arg.contains("list-games.txt")));

    let _ = fs::remove_dir_all(&dir);
    cleanup(&games_dir());
}

#[test]
fn test_resolve_winws_path_uses_configured_existing_file() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("winws-configured");
    let winws = dir.join("winws.exe");
    fs::write(&winws, b"stub").expect("записать winws.exe");

    let config = StrategyConfig {
        source_filename: "general.bat".to_string(),
        winws_path: winws.to_string_lossy().to_string(),
        wf_tcp: Some("80".to_string()),
        wf_udp: None,
        groups: vec![crate::strategy::config::FilterGroup::default()],
    };

    assert_eq!(resolve_winws_path(&config, &dir), winws);

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_resolve_winws_path_falls_back_to_bin_dir() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("winws-fallback");

    let config = StrategyConfig {
        source_filename: "general.bat".to_string(),
        winws_path: r"C:\missing\winws.exe".to_string(),
        wf_tcp: Some("80".to_string()),
        wf_udp: None,
        groups: vec![crate::strategy::config::FilterGroup::default()],
    };

    assert_eq!(
        resolve_winws_path(&config, &dir),
        dir.join("bin").join("winws.exe")
    );

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_generated_args_have_no_extended_prefix_when_available() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let Some(appdata) = std::env::var_os("APPDATA") else {
        return;
    };

    let dir = PathBuf::from(appdata)
        .join("com.zapretmanager.app")
        .join("strategies");
    let bat = dir.join("general-07-alt.bat");

    if !bat.is_file() {
        return;
    }

    let validated =
        crate::security::paths::validate_strategy_file(&bat, Some(&dir)).expect("validate");
    let content = fs::read_to_string(&validated).expect("прочитать");
    let log = std::env::temp_dir().join("zapret-prefix-check.log");
    let prepared = prepare_run(&validated, &content, &[], &log).expect("prepare");

    assert!(!prepared.config.winws_path.contains(r"\\?\"));

    for arg in &prepared.arguments {
        assert!(
            !arg.contains(r"\\?\"),
            "аргумент содержит extended-префикс: {arg}"
        );
    }

    cleanup(&games_dir());
}

#[test]
fn test_ensure_user_lists_creates_missing_files() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("user-lists");

    ensure_user_lists(&dir).expect("создать списки");

    let lists = dir.join("lists");

    for name in [
        "ipset-exclude-user.txt",
        "list-general-user.txt",
        "list-exclude-user.txt",
    ] {
        assert!(lists.join(name).is_file(), "{name} должен быть создан");
    }

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_ensure_user_lists_does_not_overwrite() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let dir = temp_dir("user-lists-keep");
    let lists = dir.join("lists");
    fs::create_dir_all(&lists).expect("создать lists");
    let custom = lists.join("list-general-user.txt");
    fs::write(&custom, "my-custom-domain.example\r\n").expect("записать файл");

    ensure_user_lists(&dir).expect("ensure");

    let content = fs::read_to_string(&custom).expect("прочитать файл");

    assert_eq!(content, "my-custom-domain.example\r\n");

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_winws_dry_run_all_real_strategies_when_available() {
    let _guard = crate::strategy::games_hostlist::GAMES_TEST_LOCK
        .lock()
        .unwrap_or_else(|error| error.into_inner());
    let Some(appdata) = std::env::var_os("APPDATA") else {
        return;
    };

    let _guard = crate::commands::winws::WINWS_TEST_LOCK
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());

    let dir = PathBuf::from(appdata)
        .join("com.zapretmanager.app")
        .join("strategies");
    let winws = dir.join("bin").join("winws.exe");

    if !winws.is_file() {
        return;
    }

    let log = std::env::temp_dir().join("zapret-dry-run.log");

    for entry in fs::read_dir(&dir).expect("прочитать папку стратегий") {
        let path = entry.expect("запись").path();
        let name = path
            .file_name()
            .map(|value| value.to_string_lossy().to_string())
            .unwrap_or_default();

        if !name.to_ascii_lowercase().ends_with(".bat")
            || name.eq_ignore_ascii_case("service.bat")
        {
            continue;
        }

        let content = fs::read_to_string(&path).expect("прочитать .bat");
        let prepared = prepare_run(&path, &content, &[], &log).expect("prepare");

        let mut command = Command::new(&winws);
        command.current_dir(&dir);
        command.args(&prepared.arguments);
        command.arg("--dry-run");
        command.creation_flags(CREATE_NO_WINDOW);

        let output = command.output().expect("запустить winws.exe");
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);

        assert!(
            output.status.success(),
            "{name}: winws.exe отклонил аргументы: {}\nstdout: {stdout}\nstderr: {stderr}",
            output.status
        );
    }

    cleanup(&games_dir());
    let _ = fs::remove_file(&log);
}
