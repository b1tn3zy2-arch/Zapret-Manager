use std::sync::LazyLock;

pub const MAX_CONCURRENT_READS: usize = 8;

pub const MAX_FILE_SIZE_FOR_PARSE: u64 = 1024 * 1024;

pub const MAX_DESCRIPTION_LENGTH: usize = 200;

pub const MAX_EXPAND_PASSES: usize = 8;

pub const LOG_READ_INTERVAL_MS: u64 = 100;

pub const MAX_LOG_LINES_PER_EVENT: usize = 50;

pub const WINWS_PROCESS_NAME: &str = "winws.exe";

pub const EXCLUDED_FILENAMES: &[&str] = &["service.bat"];

pub static SERVICE_KEYWORDS: LazyLock<Vec<(&str, Vec<&str>)>> = LazyLock::new(|| {
    vec![
        (
            "discord",
            vec![
                "discord",
                "discord.com",
                "discordapp.com",
                "list-discord",
            ],
        ),
        (
            "youtube",
            vec![
                "youtube",
                "youtu.be",
                "googlevideo",
                "list-google",
                "list-youtube",
            ],
        ),
        (
            "outlast-trials",
            vec![
                "outlast",
                "outlasttrials",
                "list-outlast",
                "outlast-trials",
            ],
        ),
        ("general", vec!["general", "list-general", "baseline"]),
    ]
});

pub static STRATEGY_TYPE_KEYWORDS: LazyLock<Vec<(&str, Vec<&str>)>> =
    LazyLock::new(|| {
        vec![
            ("winws", vec!["winws.exe", "winws "]),
            ("goodbye-dpi", vec!["goodbyedpi.exe", "goodbye-dpi"]),
            ("zapret", vec!["zapret"]),
        ]
    });

pub static TECHNIQUE_KEYWORDS: LazyLock<Vec<(&str, Vec<&str>)>> =
    LazyLock::new(|| {
        vec![
            (
                "faketls",
                vec!["faketls", "fake-tls", "tls_clienthello_", "--dpi-desync-fake-tls"],
            ),
            ("multisplit", vec!["--dpi-desync=multisplit"]),
            ("split-seqovl", vec!["--dpi-desync-split-seqovl="]),
            ("quic-fake", vec!["--dpi-desync-fake-quic="]),
            ("l7-filter", vec!["--filter-l7="]),
            ("ipset", vec!["--ipset=\""]),
            ("any-protocol", vec!["--dpi-desync-any-protocol"]),
            ("cutoff", vec!["--dpi-desync-cutoff="]),
            ("fake", vec!["--dpi-desync=fake"]),
        ]
    });

pub static DESCRIPTION_LINE_PREFIXES: &[&str] =
    &["REM", "::", "@echo off", "echo"];

pub static SKIP_DESCRIPTION_PREFIXES: &[&str] = &[
    ":: 65001",
    "chcp ",
    "@echo off",
    "call ",
    "set ",
    "cd /d",
    "echo:",
];

pub static NAME_ACRONYMS: &[&str] =
    &["TLS", "ALT", "TCP", "UDP", "UTF8", "EXP", "DNS", "HTTP", "QUIC"];

pub const MARKER_START: &str = "# === ZAPRET MANAGER: OUTLAST TRIALS (start) ===";

pub const MARKER_END: &str = "# === ZAPRET MANAGER: OUTLAST TRIALS (end) ===";

pub const MAX_BACKUPS_PER_FILE: usize = 10;

pub const BACKUP_SUFFIX: &str = ".bak";

pub const MAX_DOMAIN_LENGTH: usize = 253;

pub const MIN_PORT: u16 = 1;

pub const MAX_INJECTED_ENTRIES: usize = 5_000;

pub static HOSTLIST_REGEX: LazyLock<Option<regex::Regex>> = LazyLock::new(|| {
    regex::Regex::new(r#"(?i)--hostlist=(?:"([^"]+)"|([^\s^"]+))"#).ok()
});

pub static IPSET_REGEX: LazyLock<Option<regex::Regex>> =
    LazyLock::new(|| regex::Regex::new(r#"(?i)--ipset=(?:"([^"]+)"|([^\s^"]+))"#).ok());
