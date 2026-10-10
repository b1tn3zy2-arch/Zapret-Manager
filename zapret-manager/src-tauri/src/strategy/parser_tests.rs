use std::fs;
use std::path::PathBuf;

use super::parser::{
    extract_winws_command, parse_bat, resolve_game_filter, tokenize_command,
};

const SAMPLE_BAT: &str = "@echo off\r\n\
chcp 65001 > nul\r\n\
:: 65001 - UTF-8\r\n\
\r\n\
cd /d \"%~dp0\"\r\n\
call service.bat status_zapret\r\n\
\r\n\
set \"BIN=%~dp0bin\\\"\r\n\
set \"LISTS=%~dp0lists\\\"\r\n\
cd /d %BIN%\r\n\
\r\n\
start \"zapret: %~n0\" /min \"%BIN%winws.exe\" --wf-tcp=80,443,%GameFilterTCP% --wf-udp=443,%GameFilterUDP% ^\r\n\
--filter-udp=443 --hostlist=\"%LISTS%list-general.txt\" --dpi-desync=fake --dpi-desync-repeats=6 --new ^\r\n\
--filter-tcp=80,443 --hostlist=\"%LISTS%list-general.txt\" --ipset=\"%LISTS%ipset-all.txt\" --dpi-desync=fake,split2\r\n";

fn temp_dir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("zapret-parser-{name}"));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("создать временную папку");
    dir
}

#[test]
fn test_extract_winws_command_joins_continuations() {
    let command = extract_winws_command(SAMPLE_BAT).expect("команда должна найтись");

    assert!(command.contains("winws.exe"));
    assert!(command.contains("--dpi-desync=fake,split2"));
    assert!(!command.contains('^'));
}

#[test]
fn test_tokenize_keeps_quoted_paths_together() {
    let tokens = tokenize_command(r#"--hostlist="C:\My Dir\list.txt" --new"#);

    assert_eq!(tokens, vec![r"--hostlist=C:\My Dir\list.txt", "--new"]);
}

#[test]
fn test_parse_bat_basic() {
    let dir = temp_dir("basic");
    let config = parse_bat(SAMPLE_BAT, "general-04-alt.bat", &dir).expect("парсинг");

    assert_eq!(config.wf_tcp.as_deref(), Some("80,443,12"));
    assert_eq!(config.wf_udp.as_deref(), Some("443,12"));
    assert_eq!(config.filter_groups_count(), 2);
    assert!(config.winws_path.ends_with("winws.exe"));
    assert!(config.winws_path.contains("bin"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_parse_bat_resolves_lists_and_general_flags() {
    let dir = temp_dir("flags");
    let config = parse_bat(SAMPLE_BAT, "general-04-alt.bat", &dir).expect("парсинг");

    let first = &config.groups[0];
    let second = &config.groups[1];

    assert!(first.uses_general_hostlist);
    assert!(!first.uses_all_ipset);
    assert!(second.uses_all_ipset);
    assert!(first
        .args
        .iter()
        .any(|arg| arg.ends_with("lists\\list-general.txt")));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_parse_bat_with_spaces_in_working_dir() {
    let dir = std::env::temp_dir().join("zapret dir with spaces");
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("создать папку");

    let config = parse_bat(SAMPLE_BAT, "general.bat", &dir).expect("парсинг");
    let expected = dir.join("lists").join("list-general.txt");

    assert!(config.groups[0]
        .args
        .iter()
        .any(|arg| arg == &format!("--hostlist={}", expected.display())));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_parse_bat_missing_winws_is_error() {
    let dir = temp_dir("nowinws");
    let result = parse_bat("@echo off\necho nothing\n", "bad.bat", &dir);

    assert!(result.is_err());

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_resolve_game_filter_disabled_by_default() {
    let dir = temp_dir("gf-none");
    let (tcp, udp) = resolve_game_filter(&dir);

    assert_eq!((tcp.as_str(), udp.as_str()), ("12", "12"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_resolve_game_filter_all_mode() {
    let dir = temp_dir("gf-all");
    let utils = dir.join("utils");
    fs::create_dir_all(&utils).expect("utils");
    fs::write(
        utils.join("game_filter.enabled"),
        "mode=all\ntcp=8080-8090\nudp=50000-50100\n",
    )
    .expect("записать game_filter.enabled");

    let (tcp, udp) = resolve_game_filter(&dir);

    assert_eq!((tcp.as_str(), udp.as_str()), ("8080-8090", "50000-50100"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_resolve_game_filter_tcp_only() {
    let dir = temp_dir("gf-tcp");
    let utils = dir.join("utils");
    fs::create_dir_all(&utils).expect("utils");
    fs::write(
        utils.join("game_filter.enabled"),
        "mode=tcp\ntcp=1024-65535\n",
    )
    .expect("записать game_filter.enabled");

    let (tcp, udp) = resolve_game_filter(&dir);

    assert_eq!((tcp.as_str(), udp.as_str()), ("1024-65535", "12"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_resolve_game_filter_range_without_mode_stays_disabled() {
    let dir = temp_dir("gf-range-no-mode");
    let utils = dir.join("utils");
    fs::create_dir_all(&utils).expect("utils");
    fs::write(
        utils.join("game_filter.enabled"),
        "tcp=1024-65535\n",
    )
    .expect("записать game_filter.enabled");

    let (tcp, udp) = resolve_game_filter(&dir);

    assert_eq!((tcp.as_str(), udp.as_str()), ("12", "12"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_resolve_game_filter_rejects_invalid_range() {
    let dir = temp_dir("gf-bad");
    let utils = dir.join("utils");
    fs::create_dir_all(&utils).expect("utils");
    fs::write(
        utils.join("game_filter.enabled"),
        "mode=all\ntcp=99999-1\nudp=0-100\n",
    )
    .expect("записать game_filter.enabled");

    let (tcp, udp) = resolve_game_filter(&dir);

    assert_eq!((tcp.as_str(), udp.as_str()), ("1024-65535", "1024-65535"));

    let _ = fs::remove_dir_all(&dir);
}

#[test]
fn test_parse_all_real_strategies_when_available() {
    let Some(appdata) = std::env::var_os("APPDATA") else {
        return;
    };

    let dir = PathBuf::from(appdata)
        .join("com.zapretmanager.app")
        .join("strategies");

    if !dir.is_dir() {
        return;
    }

    let mut parsed = 0usize;
    let mut failed: Vec<String> = Vec::new();

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

        match parse_bat(&content, &name, &dir) {
            Ok(_) => parsed += 1,
            Err(error) => failed.push(format!("{name}: {error}")),
        }
    }

    assert!(parsed >= 22, "распарсено только {parsed} стратегий");
    assert!(failed.is_empty(), "не распарсились: {failed:?}");
}

#[test]
fn test_extract_winws_command_unescapes_caret_bang() {
    let content = "start winws.exe --dpi-desync-fake-tls=^! --new\n";
    let command = extract_winws_command(content).expect("команда");

    assert!(command.contains("--dpi-desync-fake-tls=!"));
    assert!(!command.contains("^!"));
}

#[test]
fn test_extract_winws_command_returns_none_without_winws() {
    assert!(extract_winws_command("@echo off\necho hello\n").is_none());
}
