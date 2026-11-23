// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::log_reader::detect_level;.
use crate::commands::log_reader::detect_level;
// Подключаем модули: crate::commands::winws::find_winws_pids;.
use crate::commands::winws::find_winws_pids;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_log_line_info.
fn test_parse_log_line_info() {
    // Выполняем операцию: assert_eq!(detect_level("Winws работает"), "info");.
    assert_eq!(detect_level("Winws работает"), "info");
    // Выполняем операцию: assert_eq!(detect_level("обычное сообщение"), "info");.
    assert_eq!(detect_level("обычное сообщение"), "info");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_log_line_startup_is_success.
fn test_parse_log_line_startup_is_success() {
    // Выполняем операцию: assert_eq!(detect_level("Winws запущен"), "success");.
    assert_eq!(detect_level("Winws запущен"), "success");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_log_line_error.
fn test_parse_log_line_error() {
    // Выполняем операцию: assert_eq!(detect_level("ERROR: не удалось"), "error");.
    assert_eq!(detect_level("ERROR: не удалось"), "error");
    // Выполняем операцию: assert_eq!(detect_level("Отказано в доступе"), "error").
    assert_eq!(detect_level("Отказано в доступе"), "error");
    // Выполняем операцию: assert_eq!(detect_level("Access is denied"), "error");.
    assert_eq!(detect_level("Access is denied"), "error");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_log_line_warn.
fn test_parse_log_line_warn() {
    // Выполняем операцию: assert_eq!(detect_level("WARNING: пропущено"), "warn");.
    assert_eq!(detect_level("WARNING: пропущено"), "warn");
    // Выполняем операцию: assert_eq!(detect_level("Предупреждение"), "warn");.
    assert_eq!(detect_level("Предупреждение"), "warn");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_log_line_success.
fn test_parse_log_line_success() {
    // Выполняем операцию: assert_eq!(detect_level("SUCCESS"), "success");.
    assert_eq!(detect_level("SUCCESS"), "success");
    // Выполняем операцию: assert_eq!(detect_level("Стратегия запущена"), "success.
    assert_eq!(detect_level("Стратегия запущена"), "success");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_log_line_debug.
fn test_parse_log_line_debug() {
    // Выполняем операцию: assert_eq!(detect_level("DEBUG filter=443"), "debug");.
    assert_eq!(detect_level("DEBUG filter=443"), "debug");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_arguments_quotes_paths_with_spaces.
fn test_build_arguments_quotes_paths_with_spaces() {
    // Объявляем переменную bat .
    let bat = PathBuf::from(r"C:\Program Files\Zapret\general.bat");
    // Объявляем переменную log .
    let log = PathBuf::from(r"C:\Users\me\AppData\Local\Temp\a b.log");

    // Объявляем переменную arguments .
    let arguments = build_arguments(&bat, &log).expect("arguments");

    // Выполняем операцию: assert!(arguments.starts_with("/d /s /c \""));.
    assert!(arguments.starts_with("/d /s /c \""));
    // Выполняем операцию: assert!(arguments.contains("general.bat"));.
    assert!(arguments.contains("general.bat"));
    // Выполняем операцию: assert!(arguments.contains("a b.log"));.
    assert!(arguments.contains("a b.log"));
    // Выполняем операцию: assert!(arguments.contains("2>&1"));.
    assert!(arguments.contains("2>&1"));
    // Выполняем операцию: assert!(arguments.ends_with('"'));.
    assert!(arguments.ends_with('"'));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_build_arguments_rejects_expandable_path.
fn test_build_arguments_rejects_expandable_path() {
    // Объявляем переменную bat .
    let bat = PathBuf::from(r"C:\Users\%USERNAME%\general.bat");
    // Объявляем переменную log .
    let log = PathBuf::from(r"C:\temp\out.log");

    // Выполняем операцию: assert!(build_arguments(&bat, &log).is_err());.
    assert!(build_arguments(&bat, &log).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_log_dir_under_temp.
fn test_log_dir_under_temp() {
    // Объявляем переменную dir .
    let dir = log_dir();

    // Выполняем операцию: assert!(dir.to_string_lossy().contains("zapret-manager".
    assert!(dir.to_string_lossy().contains("zapret-manager"));
    // Выполняем операцию: assert!(dir.to_string_lossy().contains("logs"));.
    assert!(dir.to_string_lossy().contains("logs"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_find_winws_pids_returns_vec.
fn test_find_winws_pids_returns_vec() {
    // Объявляем переменную pids .
    let pids = find_winws_pids();
    // Выполняем операцию: assert!(pids.len() < 512);.
    assert!(pids.len() < 512);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_now_millis_is_plausible.
fn test_now_millis_is_plausible() {
    // Объявляем переменную value .
    let value = now_millis();
    // Выполняем операцию: assert!(value > 1_600_000_000_000);.
    assert!(value > 1_600_000_000_000);
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strategy_is_native_accepts_standard_bat.
fn test_strategy_is_native_accepts_standard_bat() {
    // Объявляем переменную content .
    let content = "@echo off\r\n\
set \"BIN=%~dp0bin\\\"\r\n\
start \"zapret\" /min \"%BIN%winws.exe\" --wf-tcp=80,443 --filter-udp=443 --dpi-desync=fake\r\n";

    // Выполняем операцию: assert!(strategy_is_native(.
    assert!(strategy_is_native(
        // Выполняем операцию: content,.
        content,
        // Выполняем операцию: Path::new("C:/zapret/general-01-alt.bat").
        Path::new("C:/zapret/general-01-alt.bat") // Закрываем выражение или коллекцию.
    ));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strategy_is_native_rejects_bat_without_winws.
fn test_strategy_is_native_rejects_bat_without_winws() {
    // Выполняем операцию: assert!(!strategy_is_native(.
    assert!(!strategy_is_native(
        // Выполняем операцию: "@echo off\r\nnotepad.exe\r\n",.
        "@echo off\r\nnotepad.exe\r\n",
        // Выполняем операцию: Path::new("C:/zapret/custom.bat").
        Path::new("C:/zapret/custom.bat") // Закрываем выражение или коллекцию.
    ));
    // Закрываем блок.
}
