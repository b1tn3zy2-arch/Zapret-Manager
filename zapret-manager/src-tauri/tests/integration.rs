use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use zapret_manager_lib::bat_env::{
    expand_percent_vars, extract_set_vars, resolve_path, strip_quotes,
};
use zapret_manager_lib::security::paths::{
    is_within, safe_filename, safe_path, validate_strategy_id,
};
use zapret_manager_lib::security::sanitize::{
    escape_for_cmd, sanitize_log_message, validate_domain, validate_ip_range, validate_port,
};
use zapret_manager_lib::tray::TrayState;

fn write_temp_script(name: &str, content: &str) -> PathBuf {
    let dir = std::env::temp_dir().join("zapret-manager-integration");
    fs::create_dir_all(&dir).expect("temp dir");

    let path = dir.join(name);
    fs::write(&path, content).expect("write script");

    path
}

#[test]
fn extract_set_vars_reads_bat_assignments() {
    let content = "@echo off\r\nset DISCORD=true\r\nset \"YOUTUBE=1\"\r\n";

    let vars = extract_set_vars(content);

    assert_eq!(vars.get("DISCORD").map(String::as_str), Some("true"));
    assert_eq!(vars.get("YOUTUBE").map(String::as_str), Some("1"));
}

#[test]
fn strip_quotes_removes_wrapping_quotes() {
    assert_eq!(strip_quotes("\"value\""), "value");
    assert_eq!(strip_quotes("plain"), "plain");
}

#[test]
fn expand_percent_vars_substitutes_known_keys() {
    let mut vars = HashMap::new();
    vars.insert("DISCORD".to_string(), "true".to_string());

    let expanded = expand_percent_vars("%DISCORD%", &vars, Path::new("C:\\zapret"));

    assert_eq!(expanded.trim(), "true");
}

#[test]
fn resolve_path_joins_script_dir_for_relative_values() {
    let vars = HashMap::new();

    let resolved = resolve_path("lists\\general.txt", &vars, Path::new("C:\\zapret"))
        .expect("relative path resolves");

    assert!(resolved.ends_with("lists\\general.txt"));
}

#[test]
fn escape_for_cmd_rejects_command_injection() {
    assert!(escape_for_cmd("value %PATH%").is_err());
    assert!(escape_for_cmd("value !delayed").is_err());
    assert!(escape_for_cmd("C:\\Program Files\\app").is_ok());
}

#[test]
fn validate_domain_accepts_and_rejects() {
    assert!(validate_domain("Discord.com").is_ok());
    assert!(validate_domain("not a domain").is_err());
    assert!(validate_domain("discord.com; calc").is_err());
}

#[test]
fn validate_port_and_ip_range_bounds() {
    assert!(validate_port(8443).is_ok());
    assert!(validate_port(0).is_err());
    assert!(validate_ip_range("10.0.0.0/8").is_ok());
    assert!(validate_ip_range("2606:4700::/32").is_ok());
    assert!(validate_ip_range("999.0.0.1").is_err());
    assert!(validate_ip_range("10.0.0.1").is_err());
}

#[test]
fn sanitize_log_message_redacts_secrets() {
    let redacted = sanitize_log_message("token=abcdef1234567890");

    assert!(!redacted.contains("abcdef1234567890"));
}

#[test]
fn validate_strategy_id_rejects_traversal() {
    assert!(validate_strategy_id("st_0000000000000001").is_ok());
    assert!(validate_strategy_id("../../etc/passwd").is_err());
    assert!(validate_strategy_id("st_1; calc").is_err());
}

#[test]
fn safe_path_accepts_existing_file_and_rejects_missing() {
    let root = std::env::temp_dir().join("zapret-manager-safe-path");
    fs::create_dir_all(root.join("lists")).expect("create root");
    let target = root.join("lists\\general.txt");
    fs::write(&target, b"@echo off").expect("write file");

    assert!(safe_path(&root, &target).is_ok());
    assert!(safe_path(&root, &root.join("lists\\missing.txt")).is_err());

    fs::remove_dir_all(&root).ok();
}

#[test]
fn is_within_detects_escapes() {
    let base = Path::new("C:/zapret");

    assert!(is_within(&base.join("lists"), base));
    assert!(!is_within(&base.join("../other"), base));
}

#[test]
fn safe_filename_strips_directories() {
    assert_eq!(safe_filename("general.bat").unwrap(), "general.bat");
    assert!(safe_filename("../evil.bat").is_err());
    assert!(safe_filename("sub\\evil.bat").is_err());
}

#[test]
fn tray_states_are_distinct() {
    assert_ne!(TrayState::Idle, TrayState::Connected);
    assert_ne!(TrayState::Connected, TrayState::Error);
}

#[test]
fn bat_file_is_read_and_parsed_end_to_end() {
    let path = write_temp_script(
        "general.bat",
        "@echo off\r\nREM Test\r\nset DISCORD=true\r\necho Hello\r\n",
    );

    let content = fs::read_to_string(&path).expect("read script");
    let vars = extract_set_vars(&content);

    assert!(content.contains("echo Hello"));
    assert_eq!(vars.get("DISCORD").map(String::as_str), Some("true"));

    fs::remove_dir_all(path.parent().expect("parent")).ok();
}
