// Подключаем модули: std::fs;.
use std::fs;
// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: super::parser::{extract_winws_command, parse_bat, resol.
use super::parser::{extract_winws_command, parse_bat, resolve_game_filter, tokenize_command};

// Объявляем константу SAMPLE_BAT.
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

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-parser-{name}"));
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: fs::create_dir_all(&dir).expect("создать временную папк.
    fs::create_dir_all(&dir).expect("создать временную папку");
    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_winws_command_joins_continuations.
fn test_extract_winws_command_joins_continuations() {
    // Объявляем переменную command .
    let command = extract_winws_command(SAMPLE_BAT).expect("команда должна найтись");

    // Выполняем операцию: assert!(command.contains("winws.exe"));.
    assert!(command.contains("winws.exe"));
    // Выполняем операцию: assert!(command.contains("--dpi-desync=fake,split2"));.
    assert!(command.contains("--dpi-desync=fake,split2"));
    // Выполняем операцию: assert!(!command.contains('^'));.
    assert!(!command.contains('^'));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_tokenize_keeps_quoted_paths_together.
fn test_tokenize_keeps_quoted_paths_together() {
    // Объявляем переменную tokens .
    let tokens = tokenize_command(r#"--hostlist="C:\My Dir\list.txt" --new"#);

    // Выполняем операцию: assert_eq!(tokens, vec![r"--hostlist=C:\My Dir\list.txt.
    assert_eq!(tokens, vec![r"--hostlist=C:\My Dir\list.txt", "--new"]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_bat_basic.
fn test_parse_bat_basic() {
    // Объявляем переменную dir .
    let dir = temp_dir("basic");
    // Объявляем переменную config .
    let config = parse_bat(SAMPLE_BAT, "general-04-alt.bat", &dir).expect("парсинг");

    // Выполняем операцию: assert_eq!(config.wf_tcp.as_deref(), Some("80,443,12")).
    assert_eq!(config.wf_tcp.as_deref(), Some("80,443,12"));
    // Выполняем операцию: assert_eq!(config.wf_udp.as_deref(), Some("443,12"));.
    assert_eq!(config.wf_udp.as_deref(), Some("443,12"));
    // Выполняем операцию: assert_eq!(config.filter_groups_count(), 2);.
    assert_eq!(config.filter_groups_count(), 2);
    // Выполняем операцию: assert!(config.winws_path.ends_with("winws.exe"));.
    assert!(config.winws_path.ends_with("winws.exe"));
    // Выполняем операцию: assert!(config.winws_path.contains("bin"));.
    assert!(config.winws_path.contains("bin"));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_bat_resolves_lists_and_general_flags.
fn test_parse_bat_resolves_lists_and_general_flags() {
    // Объявляем переменную dir .
    let dir = temp_dir("flags");
    // Объявляем переменную config .
    let config = parse_bat(SAMPLE_BAT, "general-04-alt.bat", &dir).expect("парсинг");

    // Объявляем переменную first .
    let first = &config.groups[0];
    // Объявляем переменную second .
    let second = &config.groups[1];

    // Выполняем операцию: assert!(first.uses_general_hostlist);.
    assert!(first.uses_general_hostlist);
    // Выполняем операцию: assert!(!first.uses_all_ipset);.
    assert!(!first.uses_all_ipset);
    // Выполняем операцию: assert!(second.uses_all_ipset);.
    assert!(second.uses_all_ipset);
    // Выполняем операцию: assert!(first.
    assert!(first
        // Выполняем операцию: .args.
        .args
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|arg| arg.ends_with("lists\\list-general.txt")));.
        .any(|arg| arg.ends_with("lists\\list-general.txt")));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_bat_with_spaces_in_working_dir.
fn test_parse_bat_with_spaces_in_working_dir() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret dir with spaces");
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: fs::create_dir_all(&dir).expect("создать папку");.
    fs::create_dir_all(&dir).expect("создать папку");

    // Объявляем переменную config .
    let config = parse_bat(SAMPLE_BAT, "general.bat", &dir).expect("парсинг");
    // Объявляем переменную expected .
    let expected = dir.join("lists").join("list-general.txt");

    // Выполняем операцию: assert!(config.groups[0].
    assert!(config.groups[0]
        // Выполняем операцию: .args.
        .args
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|arg| arg == &format!("--hostlist={}", expected.di.
        .any(|arg| arg == &format!("--hostlist={}", expected.display())));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_bat_missing_winws_is_error.
fn test_parse_bat_missing_winws_is_error() {
    // Объявляем переменную dir .
    let dir = temp_dir("nowinws");
    // Объявляем переменную result .
    let result = parse_bat("@echo off\necho nothing\n", "bad.bat", &dir);

    // Выполняем операцию: assert!(result.is_err());.
    assert!(result.is_err());

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_game_filter_disabled_by_default.
fn test_resolve_game_filter_disabled_by_default() {
    // Объявляем переменную dir .
    let dir = temp_dir("gf-none");
    // Объявляем переменную (tcp, udp) .
    let (tcp, udp) = resolve_game_filter(&dir);

    // Выполняем операцию: assert_eq!((tcp.as_str(), udp.as_str()), ("12", "12"));.
    assert_eq!((tcp.as_str(), udp.as_str()), ("12", "12"));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_game_filter_all_mode.
fn test_resolve_game_filter_all_mode() {
    // Объявляем переменную dir .
    let dir = temp_dir("gf-all");
    // Объявляем переменную utils .
    let utils = dir.join("utils");
    // Выполняем операцию: fs::create_dir_all(&utils).expect("utils");.
    fs::create_dir_all(&utils).expect("utils");
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: utils.join("game_filter.enabled"),.
        utils.join("game_filter.enabled"),
        // Выполняем операцию: "mode=all\ntcp=8080-8090\nudp=50000-50100\n",.
        "mode=all\ntcp=8080-8090\nudp=50000-50100\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .expect("записать game_filter.enabled");.
    .expect("записать game_filter.enabled");

    // Объявляем переменную (tcp, udp) .
    let (tcp, udp) = resolve_game_filter(&dir);

    // Выполняем операцию: assert_eq!((tcp.as_str(), udp.as_str()), ("8080-8090", .
    assert_eq!((tcp.as_str(), udp.as_str()), ("8080-8090", "50000-50100"));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_game_filter_tcp_only.
fn test_resolve_game_filter_tcp_only() {
    // Объявляем переменную dir .
    let dir = temp_dir("gf-tcp");
    // Объявляем переменную utils .
    let utils = dir.join("utils");
    // Выполняем операцию: fs::create_dir_all(&utils).expect("utils");.
    fs::create_dir_all(&utils).expect("utils");
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: utils.join("game_filter.enabled"),.
        utils.join("game_filter.enabled"),
        // Выполняем операцию: "mode=tcp\ntcp=1024-65535\n",.
        "mode=tcp\ntcp=1024-65535\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .expect("записать game_filter.enabled");.
    .expect("записать game_filter.enabled");

    // Объявляем переменную (tcp, udp) .
    let (tcp, udp) = resolve_game_filter(&dir);

    // Выполняем операцию: assert_eq!((tcp.as_str(), udp.as_str()), ("1024-65535",.
    assert_eq!((tcp.as_str(), udp.as_str()), ("1024-65535", "12"));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_game_filter_range_without_mode_stays_disabled.
fn test_resolve_game_filter_range_without_mode_stays_disabled() {
    // Объявляем переменную dir .
    let dir = temp_dir("gf-range-no-mode");
    // Объявляем переменную utils .
    let utils = dir.join("utils");
    // Выполняем операцию: fs::create_dir_all(&utils).expect("utils");.
    fs::create_dir_all(&utils).expect("utils");
    // Выполняем операцию: fs::write(utils.join("game_filter.enabled"), "tcp=1024-.
    fs::write(utils.join("game_filter.enabled"), "tcp=1024-65535\n")
        // Выполняем операцию: .expect("записать game_filter.enabled");.
        .expect("записать game_filter.enabled");

    // Объявляем переменную (tcp, udp) .
    let (tcp, udp) = resolve_game_filter(&dir);

    // Выполняем операцию: assert_eq!((tcp.as_str(), udp.as_str()), ("12", "12"));.
    assert_eq!((tcp.as_str(), udp.as_str()), ("12", "12"));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_resolve_game_filter_rejects_invalid_range.
fn test_resolve_game_filter_rejects_invalid_range() {
    // Объявляем переменную dir .
    let dir = temp_dir("gf-bad");
    // Объявляем переменную utils .
    let utils = dir.join("utils");
    // Выполняем операцию: fs::create_dir_all(&utils).expect("utils");.
    fs::create_dir_all(&utils).expect("utils");
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: utils.join("game_filter.enabled"),.
        utils.join("game_filter.enabled"),
        // Выполняем операцию: "mode=all\ntcp=99999-1\nudp=0-100\n",.
        "mode=all\ntcp=99999-1\nudp=0-100\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .expect("записать game_filter.enabled");.
    .expect("записать game_filter.enabled");

    // Объявляем переменную (tcp, udp) .
    let (tcp, udp) = resolve_game_filter(&dir);

    // Выполняем операцию: assert_eq!((tcp.as_str(), udp.as_str()), ("1024-65535",.
    assert_eq!((tcp.as_str(), udp.as_str()), ("1024-65535", "1024-65535"));

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_all_real_strategies_when_available.
fn test_parse_all_real_strategies_when_available() {
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

    // Проверяем условие: !dir.is_dir() {.
    if !dir.is_dir() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную parsed .
    let mut parsed = 0usize;
    // Объявляем переменную failed.
    let mut failed: Vec<String> = Vec::new();

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

        // Выбираем вариант по значению.
        match parse_bat(&content, &name, &dir) {
            // Выполняем операцию: Ok(_) => parsed += 1,.
            Ok(_) => parsed += 1,
            // Выполняем операцию: Err(error) => failed.push(format!("{name}: {error}")),.
            Err(error) => failed.push(format!("{name}: {error}")),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: assert!(parsed >= 22, "распарсено только {parsed} страт.
    assert!(parsed >= 22, "распарсено только {parsed} стратегий");
    // Выполняем операцию: assert!(failed.is_empty(), "не распарсились: {failed:?}.
    assert!(failed.is_empty(), "не распарсились: {failed:?}");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_winws_command_unescapes_caret_bang.
fn test_extract_winws_command_unescapes_caret_bang() {
    // Объявляем переменную content .
    let content = "start winws.exe --dpi-desync-fake-tls=^! --new\n";
    // Объявляем переменную command .
    let command = extract_winws_command(content).expect("команда");

    // Выполняем операцию: assert!(command.contains("--dpi-desync-fake-tls=!"));.
    assert!(command.contains("--dpi-desync-fake-tls=!"));
    // Выполняем операцию: assert!(!command.contains("^!"));.
    assert!(!command.contains("^!"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_winws_command_returns_none_without_winws.
fn test_extract_winws_command_returns_none_without_winws() {
    // Выполняем операцию: assert!(extract_winws_command("@echo off\necho hello\n".
    assert!(extract_winws_command("@echo off\necho hello\n").is_none());
    // Закрываем блок.
}
