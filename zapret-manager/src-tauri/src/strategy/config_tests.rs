// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: super::config::{needs_any_protocol, BuildOptions, Filte.
use super::config::{needs_any_protocol, BuildOptions, FilterGroup, StrategyConfig};

// Объявляем функцию config.
fn config() -> StrategyConfig {
    // Выполняем операцию: StrategyConfig {.
    StrategyConfig {
        // Выполняем операцию: source_filename: "general-04-alt.bat".to_string(),.
        source_filename: "general-04-alt.bat".to_string(),
        // Выполняем операцию: winws_path: r"C:\zapret\bin\winws.exe".to_string(),.
        winws_path: r"C:\zapret\bin\winws.exe".to_string(),
        // Выполняем операцию: wf_tcp: Some("80,443,12".to_string()),.
        wf_tcp: Some("80,443,12".to_string()),
        // Выполняем операцию: wf_udp: Some("443,12".to_string()),.
        wf_udp: Some("443,12".to_string()),
        // Выполняем операцию: groups: vec![.
        groups: vec![
            // Выполняем операцию: FilterGroup {.
            FilterGroup {
                // Выполняем операцию: args: vec![.
                args: vec![
                    // Выполняем операцию: "--filter-udp=443".to_string(),.
                    "--filter-udp=443".to_string(),
                    // Выполняем операцию: "--dpi-desync=fake".to_string(),.
                    "--dpi-desync=fake".to_string(),
                    // Выполняем операцию: ],.
                ],
                // Выполняем операцию: uses_general_hostlist: true,.
                uses_general_hostlist: true,
                // Выполняем операцию: uses_all_ipset: false,.
                uses_all_ipset: false,
                // Закрываем блок.
            },
            // Выполняем операцию: FilterGroup {.
            FilterGroup {
                // Выполняем операцию: args: vec![.
                args: vec![
                    // Выполняем операцию: "--filter-tcp=80,443".to_string(),.
                    "--filter-tcp=80,443".to_string(),
                    // Выполняем операцию: "--dpi-desync=fake,split2".to_string(),.
                    "--dpi-desync=fake,split2".to_string(),
                    // Выполняем операцию: ],.
                ],
                // Выполняем операцию: uses_general_hostlist: false,.
                uses_general_hostlist: false,
                // Выполняем операцию: uses_all_ipset: true,.
                uses_all_ipset: true,
                // Закрываем блок.
            },
            // Выполняем операцию: ],.
        ],
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_args_basic.
fn test_build_args_basic() {
    // Объявляем переменную args .
    let args = config().build_args(&BuildOptions::default());

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: args,.
        args,
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "--wf-tcp=80,443,12",.
            "--wf-tcp=80,443,12",
            // Выполняем операцию: "--wf-udp=443,12",.
            "--wf-udp=443,12",
            // Выполняем операцию: "--filter-udp=443",.
            "--filter-udp=443",
            // Выполняем операцию: "--dpi-desync=fake",.
            "--dpi-desync=fake",
            // Выполняем операцию: "--dpi-desync-any-protocol",.
            "--dpi-desync-any-protocol",
            // Выполняем операцию: "--new",.
            "--new",
            // Выполняем операцию: "--filter-tcp=80,443",.
            "--filter-tcp=80,443",
            // Выполняем операцию: "--dpi-desync=fake,split2",.
            "--dpi-desync=fake,split2",
            // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_args_log_path.
fn test_build_args_log_path() {
    // Объявляем переменную log .
    let log = Path::new(r"C:\temp\log.txt");
    // Объявляем переменную options .
    let options = BuildOptions {
        // Выполняем операцию: log_path: Some(log),.
        log_path: Some(log),
        // Выполняем операцию: ..BuildOptions::default().
        ..BuildOptions::default() // Закрываем блок.
    };

    // Объявляем переменную args .
    let args = config().build_args(&options);

    // Выполняем операцию: assert_eq!(args[2], r"--debug=@C:\temp\log.txt");.
    assert_eq!(args[2], r"--debug=@C:\temp\log.txt");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_args_games_injection.
fn test_build_args_games_injection() {
    // Объявляем переменную hostlist .
    let hostlist = Path::new(r"C:\temp\list-games.txt");
    // Объявляем переменную ipset .
    let ipset = Path::new(r"C:\temp\ipset-games.txt");
    // Объявляем переменную options .
    let options = BuildOptions {
        // Выполняем операцию: games_hostlist: Some(hostlist),.
        games_hostlist: Some(hostlist),
        // Выполняем операцию: games_ipset: Some(ipset),.
        games_ipset: Some(ipset),
        // Выполняем операцию: ..BuildOptions::default().
        ..BuildOptions::default() // Закрываем блок.
    };

    // Объявляем переменную args .
    let args = config().build_args(&options);

    // Объявляем переменную hostlist_index .
    let hostlist_index = args
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .position(|arg| arg == r"--hostlist=C:\temp\list-games..
        .position(|arg| arg == r"--hostlist=C:\temp\list-games.txt")
        // Выполняем операцию: .expect("должен добавиться hostlist игр");.
        .expect("должен добавиться hostlist игр");
    // Объявляем переменную ipset_index .
    let ipset_index = args
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .position(|arg| arg == r"--ipset=C:\temp\ipset-games.tx.
        .position(|arg| arg == r"--ipset=C:\temp\ipset-games.txt")
        // Выполняем операцию: .expect("должен добавиться ipset игр");.
        .expect("должен добавиться ipset игр");

    // Выполняем операцию: assert!(hostlist_index < ipset_index);.
    assert!(hostlist_index < ipset_index);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_args_games_not_added_without_flag.
fn test_build_args_games_not_added_without_flag() {
    // Объявляем переменную hostlist .
    let hostlist = Path::new(r"C:\temp\list-games.txt");
    // Объявляем переменную target .
    let mut target = config();
    // Выполняем операцию: target.groups[0].uses_general_hostlist = false;.
    target.groups[0].uses_general_hostlist = false;

    // Объявляем переменную options .
    let options = BuildOptions {
        // Выполняем операцию: games_hostlist: Some(hostlist),.
        games_hostlist: Some(hostlist),
        // Выполняем операцию: ..BuildOptions::default().
        ..BuildOptions::default() // Закрываем блок.
    };

    // Объявляем переменную args .
    let args = target.build_args(&options);

    // Выполняем операцию: assert!(!args.iter().any(|arg| arg.contains("list-games.
    assert!(!args.iter().any(|arg| arg.contains("list-games.txt")));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_args_extra_args_appended.
fn test_build_args_extra_args_appended() {
    // Объявляем переменную extra .
    let extra = vec!["--dpi-desync-repeats=8".to_string()];
    // Объявляем переменную options .
    let options = BuildOptions {
        // Выполняем операцию: extra_args: &extra,.
        extra_args: &extra,
        // Выполняем операцию: ..BuildOptions::default().
        ..BuildOptions::default() // Закрываем блок.
    };

    // Объявляем переменную args .
    let args = config().build_args(&options);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: args.last().map(String::as_str),.
        args.last().map(String::as_str),
        // Выполняем операцию: Some("--dpi-desync-repeats=8").
        Some("--dpi-desync-repeats=8") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_rejects_empty_groups.
fn test_validate_rejects_empty_groups() {
    // Объявляем переменную target .
    let mut target = config();
    // Выполняем операцию: target.groups = Vec::new();.
    target.groups = Vec::new();

    // Выполняем операцию: assert!(target.validate().is_err());.
    assert!(target.validate().is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_rejects_empty_winws_path.
fn test_validate_rejects_empty_winws_path() {
    // Объявляем переменную target .
    let mut target = config();
    // Выполняем операцию: target.winws_path = "  ".to_string();.
    target.winws_path = "  ".to_string();

    // Выполняем операцию: assert!(target.validate().is_err());.
    assert!(target.validate().is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_accepts_full_config.
fn test_validate_accepts_full_config() {
    // Выполняем операцию: assert!(config().validate().is_ok());.
    assert!(config().validate().is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_filter_groups_count.
fn test_filter_groups_count() {
    // Выполняем операцию: assert_eq!(config().filter_groups_count(), 2);.
    assert_eq!(config().filter_groups_count(), 2);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_any_protocol_flag_for_quic_groups.
fn test_any_protocol_flag_for_quic_groups() {
    // Объявляем переменную quic .
    let quic = vec![
        // Выполняем операцию: "--filter-udp=443".to_string(),.
        "--filter-udp=443".to_string(),
        // Выполняем операцию: "--dpi-desync=fake".to_string(),.
        "--dpi-desync=fake".to_string(),
        // Закрываем выражение или коллекцию.
    ];
    // Объявляем переменную already .
    let already = vec![
        // Выполняем операцию: "--filter-udp=443".to_string(),.
        "--filter-udp=443".to_string(),
        // Выполняем операцию: "--dpi-desync=fake".to_string(),.
        "--dpi-desync=fake".to_string(),
        // Выполняем операцию: "--dpi-desync-any-protocol".to_string(),.
        "--dpi-desync-any-protocol".to_string(),
        // Закрываем выражение или коллекцию.
    ];
    // Объявляем переменную tcp .
    let tcp = vec![
        // Выполняем операцию: "--filter-tcp=443".to_string(),.
        "--filter-tcp=443".to_string(),
        // Выполняем операцию: "--dpi-desync=fake".to_string(),.
        "--dpi-desync=fake".to_string(),
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: assert!(needs_any_protocol(&quic));.
    assert!(needs_any_protocol(&quic));
    // Выполняем операцию: assert!(!needs_any_protocol(&already));.
    assert!(!needs_any_protocol(&already));
    // Выполняем операцию: assert!(!needs_any_protocol(&tcp));.
    assert!(!needs_any_protocol(&tcp));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_game_ports_extend_wf_udp_filter.
fn test_game_ports_extend_wf_udp_filter() {
    // Объявляем переменную ports.
    let ports: Vec<u16> = vec![7780, 7795];
    // Объявляем переменную fake .
    let fake = Path::new(r"C:\zapret\bin\stun.bin");
    // Объявляем переменную options .
    let options = BuildOptions {
        // Выполняем операцию: games_udp_ports: Some(&ports),.
        games_udp_ports: Some(&ports),
        // Выполняем операцию: games_udp_fake: Some(fake),.
        games_udp_fake: Some(fake),
        // Выполняем операцию: ..BuildOptions::default().
        ..BuildOptions::default() // Закрываем блок.
    };
    // Объявляем переменную args .
    let args = config().build_args(&options);
    // Объявляем переменную wf_udp .
    let wf_udp = args
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|arg| arg.starts_with("--wf-udp=")).
        .find(|arg| arg.starts_with("--wf-udp="))
        // Выполняем операцию: .cloned().
        .cloned()
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: assert_eq!(wf_udp, "--wf-udp=443,12,7780,7795");.
    assert_eq!(wf_udp, "--wf-udp=443,12,7780,7795");
    // Выполняем операцию: assert!(args.iter().any(|arg| arg == "--filter-udp=7780.
    assert!(args.iter().any(|arg| arg == "--filter-udp=7780,7795"));
    // Закрываем блок.
}
