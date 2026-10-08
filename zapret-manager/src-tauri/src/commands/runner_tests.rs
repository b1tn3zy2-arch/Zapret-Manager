use super::*;
use crate::commands::log_reader::detect_level;

#[test]
fn test_parse_log_line_info() {
    assert_eq!(detect_level("Winws работает"), "info");
    assert_eq!(detect_level("обычное сообщение"), "info");
}

#[test]
fn test_parse_log_line_startup_is_success() {
    assert_eq!(detect_level("Winws запущен"), "success");
}

#[test]
fn test_parse_log_line_error() {
    assert_eq!(detect_level("ERROR: не удалось"), "error");
    assert_eq!(detect_level("Отказано в доступе"), "error");
    assert_eq!(detect_level("Access is denied"), "error");
}

#[test]
fn test_parse_log_line_warn() {
    assert_eq!(detect_level("WARNING: пропущено"), "warn");
    assert_eq!(detect_level("Предупреждение"), "warn");
}

#[test]
fn test_parse_log_line_success() {
    assert_eq!(detect_level("SUCCESS"), "success");
    assert_eq!(detect_level("Стратегия запущена"), "success");
}

#[test]
fn test_parse_log_line_debug() {
    assert_eq!(detect_level("DEBUG filter=443"), "debug");
}

#[test]
fn test_build_arguments_quotes_paths_with_spaces() {
    let bat = PathBuf::from(r"C:\Program Files\Zapret\general.bat");
    let log = PathBuf::from(r"C:\Users\me\AppData\Local\Temp\a b.log");

    let arguments = build_arguments(&bat, &log).expect("arguments");

    assert!(arguments.starts_with("/d /s /c \""));
    assert!(arguments.contains("general.bat"));
    assert!(arguments.contains("a b.log"));
    assert!(arguments.contains("2>&1"));
    assert!(arguments.ends_with('"'));
}

#[test]
fn test_build_arguments_rejects_expandable_path() {
    let bat = PathBuf::from(r"C:\Users\%USERNAME%\general.bat");
    let log = PathBuf::from(r"C:\temp\out.log");

    assert!(build_arguments(&bat, &log).is_err());
}

#[test]
fn test_log_dir_under_temp() {
    let dir = log_dir();

    assert!(dir.to_string_lossy().contains("zapret-manager"));
    assert!(dir.to_string_lossy().contains("logs"));
}

#[test]
fn test_find_winws_pids_returns_vec() {
    let pids = find_winws_pids();
    assert!(pids.len() < 512);
}

#[test]
fn test_now_millis_is_plausible() {
    let value = now_millis();
    assert!(value > 1_600_000_000_000);
}