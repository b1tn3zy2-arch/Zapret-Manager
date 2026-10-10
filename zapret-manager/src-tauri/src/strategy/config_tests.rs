use std::path::Path;

use super::config::{BuildOptions, FilterGroup, StrategyConfig};

fn config() -> StrategyConfig {
    StrategyConfig {
        source_filename: "general-04-alt.bat".to_string(),
        winws_path: r"C:\zapret\bin\winws.exe".to_string(),
        wf_tcp: Some("80,443,12".to_string()),
        wf_udp: Some("443,12".to_string()),
        groups: vec![
            FilterGroup {
                args: vec!["--filter-udp=443".to_string(), "--dpi-desync=fake".to_string()],
                uses_general_hostlist: true,
                uses_all_ipset: false,
            },
            FilterGroup {
                args: vec!["--filter-tcp=80,443".to_string(), "--dpi-desync=fake,split2".to_string()],
                uses_general_hostlist: false,
                uses_all_ipset: true,
            },
        ],
    }
}

#[test]
fn test_build_args_basic() {
    let args = config().build_args(&BuildOptions::default());

    assert_eq!(
        args,
        vec![
            "--wf-tcp=80,443,12",
            "--wf-udp=443,12",
            "--filter-udp=443",
            "--dpi-desync=fake",
            "--new",
            "--filter-tcp=80,443",
            "--dpi-desync=fake,split2",
        ]
    );
}

#[test]
fn test_build_args_log_path() {
    let log = Path::new(r"C:\temp\log.txt");
    let options = BuildOptions {
        log_path: Some(log),
        ..BuildOptions::default()
    };

    let args = config().build_args(&options);

    assert_eq!(args[2], r"--debug=@C:\temp\log.txt");
}

#[test]
fn test_build_args_games_injection() {
    let hostlist = Path::new(r"C:\temp\list-games.txt");
    let ipset = Path::new(r"C:\temp\ipset-games.txt");
    let options = BuildOptions {
        games_hostlist: Some(hostlist),
        games_ipset: Some(ipset),
        ..BuildOptions::default()
    };

    let args = config().build_args(&options);

    let hostlist_index = args
        .iter()
        .position(|arg| arg == r"--hostlist=C:\temp\list-games.txt")
        .expect("должен добавиться hostlist игр");
    let ipset_index = args
        .iter()
        .position(|arg| arg == r"--ipset=C:\temp\ipset-games.txt")
        .expect("должен добавиться ipset игр");

    assert!(hostlist_index < ipset_index);
    assert_eq!(args[hostlist_index - 1], "--dpi-desync=fake");
    assert_eq!(args[ipset_index - 1], "--dpi-desync=fake,split2");
}

#[test]
fn test_build_args_games_not_added_without_flag() {
    let hostlist = Path::new(r"C:\temp\list-games.txt");
    let mut target = config();
    target.groups[0].uses_general_hostlist = false;

    let options = BuildOptions {
        games_hostlist: Some(hostlist),
        ..BuildOptions::default()
    };

    let args = target.build_args(&options);

    assert!(!args.iter().any(|arg| arg.contains("list-games.txt")));
}

#[test]
fn test_build_args_extra_args_appended() {
    let extra = vec!["--dpi-desync-repeats=8".to_string()];
    let options = BuildOptions {
        extra_args: &extra,
        ..BuildOptions::default()
    };

    let args = config().build_args(&options);

    assert_eq!(args.last().map(String::as_str), Some("--dpi-desync-repeats=8"));
}

#[test]
fn test_validate_rejects_empty_groups() {
    let mut target = config();
    target.groups = Vec::new();

    assert!(target.validate().is_err());
}

#[test]
fn test_validate_rejects_empty_winws_path() {
    let mut target = config();
    target.winws_path = "  ".to_string();

    assert!(target.validate().is_err());
}

#[test]
fn test_validate_accepts_full_config() {
    assert!(config().validate().is_ok());
}

#[test]
fn test_filter_groups_count() {
    assert_eq!(config().filter_groups_count(), 2);
}
