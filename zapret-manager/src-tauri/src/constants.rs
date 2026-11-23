// Подключаем модули: std::sync::LazyLock;.
use std::sync::LazyLock;

// Объявляем константу MAX_CONCURRENT_READS.
pub const MAX_CONCURRENT_READS: usize = 8;

// Объявляем константу MAX_FILE_SIZE_FOR_PARSE.
pub const MAX_FILE_SIZE_FOR_PARSE: u64 = 1024 * 1024;

// Объявляем константу MAX_DESCRIPTION_LENGTH.
pub const MAX_DESCRIPTION_LENGTH: usize = 200;

// Объявляем константу MAX_EXPAND_PASSES.
pub const MAX_EXPAND_PASSES: usize = 8;

// Объявляем константу LOG_READ_INTERVAL_MS.
pub const LOG_READ_INTERVAL_MS: u64 = 100;

// Объявляем константу MAX_LOG_LINES_PER_EVENT.
pub const MAX_LOG_LINES_PER_EVENT: usize = 50;

// Объявляем константу WINWS_PROCESS_NAME.
pub const WINWS_PROCESS_NAME: &str = "winws.exe";

// Объявляем константу GAME_FILTER_DEFAULT_PORT.
pub const GAME_FILTER_DEFAULT_PORT: &str = "12";

// Объявляем константу LOG_TAIL_IDLE_EXIT_TICKS.
pub const LOG_TAIL_IDLE_EXIT_TICKS: usize = 20;

// Объявляем константу EXCLUDED_FILENAMES.
pub const EXCLUDED_FILENAMES: &[&str] = &["service.bat"];

// Объявляем константу SERVICE_KEYWORDS.
pub static SERVICE_KEYWORDS: LazyLock<Vec<(&str, Vec<&str>)>> = LazyLock::new(|| {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: (.
        (
            // Выполняем операцию: "discord",.
            "discord",
            // Выполняем операцию: vec!["discord", "discord.com", "discordapp.com", "list-.
            vec!["discord", "discord.com", "discordapp.com", "list-discord"],
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: (.
        (
            // Выполняем операцию: "youtube",.
            "youtube",
            // Выполняем операцию: vec![.
            vec![
                // Выполняем операцию: "youtube",.
                "youtube",
                // Выполняем операцию: "youtu.be",.
                "youtu.be",
                // Выполняем операцию: "googlevideo",.
                "googlevideo",
                // Выполняем операцию: "list-google",.
                "list-google",
                // Выполняем операцию: "list-youtube",.
                "list-youtube",
                // Выполняем операцию: ],.
            ],
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: (.
        (
            // Выполняем операцию: "outlast-trials",.
            "outlast-trials",
            // Выполняем операцию: vec!["outlast", "outlasttrials", "list-outlast", "outla.
            vec!["outlast", "outlasttrials", "list-outlast", "outlast-trials"],
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: ("general", vec!["general", "list-general", "baseline"].
        ("general", vec!["general", "list-general", "baseline"]),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
});

// Объявляем константу STRATEGY_TYPE_KEYWORDS.
pub static STRATEGY_TYPE_KEYWORDS: LazyLock<Vec<(&str, Vec<&str>)>> = LazyLock::new(|| {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: ("winws", vec!["winws.exe", "winws "]),.
        ("winws", vec!["winws.exe", "winws "]),
        // Выполняем операцию: ("goodbye-dpi", vec!["goodbyedpi.exe", "goodbye-dpi"]),.
        ("goodbye-dpi", vec!["goodbyedpi.exe", "goodbye-dpi"]),
        // Выполняем операцию: ("zapret", vec!["zapret"]),.
        ("zapret", vec!["zapret"]),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
});

// Объявляем константу TECHNIQUE_KEYWORDS.
pub static TECHNIQUE_KEYWORDS: LazyLock<Vec<(&str, Vec<&str>)>> = LazyLock::new(|| {
    // Выполняем операцию: vec![.
    vec![
        // Выполняем операцию: (.
        (
            // Выполняем операцию: "faketls",.
            "faketls",
            // Выполняем операцию: vec![.
            vec![
                // Выполняем операцию: "faketls",.
                "faketls",
                // Выполняем операцию: "fake-tls",.
                "fake-tls",
                // Выполняем операцию: "tls_clienthello_",.
                "tls_clienthello_",
                // Выполняем операцию: "--dpi-desync-fake-tls",.
                "--dpi-desync-fake-tls",
                // Выполняем операцию: ],.
            ],
            // Закрываем выражение или коллекцию.
        ),
        // Выполняем операцию: ("multisplit", vec!["--dpi-desync=multisplit"]),.
        ("multisplit", vec!["--dpi-desync=multisplit"]),
        // Выполняем операцию: ("split-seqovl", vec!["--dpi-desync-split-seqovl="]),.
        ("split-seqovl", vec!["--dpi-desync-split-seqovl="]),
        // Выполняем операцию: ("quic-fake", vec!["--dpi-desync-fake-quic="]),.
        ("quic-fake", vec!["--dpi-desync-fake-quic="]),
        // Выполняем операцию: ("l7-filter", vec!["--filter-l7="]),.
        ("l7-filter", vec!["--filter-l7="]),
        // Выполняем операцию: ("ipset", vec!["--ipset=\""]),.
        ("ipset", vec!["--ipset=\""]),
        // Выполняем операцию: ("any-protocol", vec!["--dpi-desync-any-protocol"]),.
        ("any-protocol", vec!["--dpi-desync-any-protocol"]),
        // Выполняем операцию: ("cutoff", vec!["--dpi-desync-cutoff="]),.
        ("cutoff", vec!["--dpi-desync-cutoff="]),
        // Выполняем операцию: ("fakedsplit", vec!["fakedsplit"]),.
        ("fakedsplit", vec!["fakedsplit"]),
        // Выполняем операцию: ("hostfakesplit", vec!["hostfakesplit"]),.
        ("hostfakesplit", vec!["hostfakesplit"]),
        // Выполняем операцию: ("multidisorder", vec!["multidisorder"]),.
        ("multidisorder", vec!["multidisorder"]),
        // Выполняем операцию: ("syndata", vec!["syndata"]),.
        ("syndata", vec!["syndata"]),
        // Выполняем операцию: ("fake", vec!["--dpi-desync=fake"]),.
        ("fake", vec!["--dpi-desync=fake"]),
        // Выполняем операцию: ].
    ]
    // Закрываем блок.
});

// Объявляем константу DESCRIPTION_LINE_PREFIXES.
pub static DESCRIPTION_LINE_PREFIXES: &[&str] = &["REM", "::", "@echo off", "echo"];

// Объявляем константу SKIP_DESCRIPTION_PREFIXES.
pub static SKIP_DESCRIPTION_PREFIXES: &[&str] = &[
    // Выполняем операцию: ":: 65001",.
    ":: 65001",
    // Выполняем операцию: "chcp ",.
    "chcp ",
    // Выполняем операцию: "@echo off",.
    "@echo off",
    // Выполняем операцию: "call ",.
    "call ",
    // Выполняем операцию: "set ",.
    "set ",
    // Выполняем операцию: "cd /d",.
    "cd /d",
    // Выполняем операцию: "echo:",.
    "echo:",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу NAME_ACRONYMS.
pub static NAME_ACRONYMS: &[&str] = &[
    // Выполняем операцию: "TLS", "ALT", "TCP", "UDP", "UTF8", "EXP", "DNS", "HTTP.
    "TLS", "ALT", "TCP", "UDP", "UTF8", "EXP", "DNS", "HTTP",
    "QUIC",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу NAME_COMPOUNDS.
pub static NAME_COMPOUNDS: &[(&str, &str)] = &[("FAKETLS", "Fake TLS")];

// Объявляем константу MARKER_START.
pub const MARKER_START: &str = "# === ZAPRET MANAGER: OUTLAST TRIALS (start) ===";

// Объявляем константу MARKER_END.
pub const MARKER_END: &str = "# === ZAPRET MANAGER: OUTLAST TRIALS (end) ===";

// Объявляем константу MAX_BACKUPS_PER_FILE.
pub const MAX_BACKUPS_PER_FILE: usize = 10;

// Объявляем константу BACKUP_SUFFIX.
pub const BACKUP_SUFFIX: &str = ".bak";

// Объявляем константу MAX_DOMAIN_LENGTH.
pub const MAX_DOMAIN_LENGTH: usize = 253;

// Объявляем константу MIN_PORT.
pub const MIN_PORT: u16 = 1;

// Объявляем константу MAX_INJECTED_ENTRIES.
pub const MAX_INJECTED_ENTRIES: usize = 5_000;

// Объявляем константу HOSTLIST_REGEX.
pub static HOSTLIST_REGEX: LazyLock<Option<regex::Regex>> =
    // Выполняем операцию: LazyLock::new(|| regex::Regex::new(r#"(?i)--hostlist=(?.
    LazyLock::new(|| regex::Regex::new(r#"(?i)--hostlist=(?:"([^"]+)"|([^\s^"]+))"#).ok());

// Объявляем константу IPSET_REGEX.
pub static IPSET_REGEX: LazyLock<Option<regex::Regex>> =
    // Выполняем операцию: LazyLock::new(|| regex::Regex::new(r#"(?i)--ipset=(?:"(.
    LazyLock::new(|| regex::Regex::new(r#"(?i)--ipset=(?:"([^"]+)"|([^\s^"]+))"#).ok());

/// Хендшейк считается свежим, если он был недавно. Значение одно
/// на весь проект: и отчёт о статусе, и гейт подключения считают
/// его одинаково, иначе VPN «подключается» к мёртвому туннелю.
// Объявляем константу HANDSHAKE_FRESH_SEC.
pub const HANDSHAKE_FRESH_SEC: u64 = 60;

/// Отрезок времени, который показывается как «соединение ещё живо»,
/// пока свежий хендшейк не получен.
// Объявляем константу HANDSHAKE_DEFAULT_SEC.
pub const HANDSHAKE_DEFAULT_SEC: u64 = 15;
