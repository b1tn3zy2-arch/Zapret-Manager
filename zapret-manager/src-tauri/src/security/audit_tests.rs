use std::path::{Path, PathBuf};

use crate::security::paths::{
    safe_filename, safe_path, strip_extended_prefix, validate_strategy_id,
};
use crate::security::rate_limit::RateLimiter;
use crate::security::sanitize::{
    escape_for_cmd, sanitize_log_message, validate_domain, validate_ip, validate_ip_range,
    validate_port,
};
use crate::security::url_validator::{validate_https_url, validate_host};
use crate::security::{ensure_size, MAX_TEXT_FILE_BYTES};

use std::time::Duration;

struct Sandbox {
    root: PathBuf,
}

impl Sandbox {
    fn new(name: &str) -> Self {
        let root = std::env::temp_dir().join(format!("zapret-sec-{name}"));
        let _ = std::fs::remove_dir_all(&root);
        std::fs::create_dir_all(&root).expect("sandbox");

        Self { root }
    }

    fn write(&self, name: &str, content: &str) -> PathBuf {
        let path = self.root.join(name);
        std::fs::write(&path, content).expect("write");

        path
    }
}

impl Drop for Sandbox {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.root);
    }
}

#[test]
fn safe_path_accepts_child() {
    let sandbox = Sandbox::new("child");
    let file = sandbox.write("ok.bat", "@echo off");

    let resolved = safe_path(&sandbox.root, &file).expect("resolved");

    assert_eq!(resolved, std::fs::canonicalize(&file).expect("canonical"));
}

#[test]
fn safe_path_rejects_traversal() {
    let sandbox = Sandbox::new("traversal");
    let nested = sandbox.root.join("nested");
    std::fs::create_dir_all(&nested).expect("nested");

    let traversal = nested.join("..\\outside.bat");

    assert!(safe_path(&sandbox.root, &traversal).is_err());
}

#[test]
fn safe_path_rejects_file_outside_base() {
    let sandbox = Sandbox::new("outside-base");
    let outside_dir = std::env::temp_dir().join("zapret-sec-other");
    let _ = std::fs::remove_dir_all(&outside_dir);
    std::fs::create_dir_all(&outside_dir).expect("other dir");
    let foreign = outside_dir.join("foreign.bat");
    std::fs::write(&foreign, "echo foreign").expect("write");

    assert!(safe_path(&sandbox.root, &foreign).is_err());

    let _ = std::fs::remove_dir_all(&outside_dir);
}

#[test]
fn safe_path_rejects_symlink_escape() {
    let sandbox = Sandbox::new("symlink");
    let outside_dir = std::env::temp_dir().join("zapret-sec-outside");
    let _ = std::fs::remove_dir_all(&outside_dir);
    std::fs::create_dir_all(&outside_dir).expect("outside dir");
    let secret = outside_dir.join("secret.bat");
    std::fs::write(&secret, "echo secret").expect("secret");

    let link = sandbox.root.join("link.bat");
    let created = std::os::windows::fs::symlink_file(&secret, &link).is_ok();

    if created {
        assert!(safe_path(&sandbox.root, &link).is_err());
    }

    let _ = std::fs::remove_dir_all(&outside_dir);
}

#[test]
fn safe_filename_rules() {
    assert!(safe_filename("list-general.txt").is_ok());
    assert!(safe_filename("my file.txt").is_ok());
    assert!(safe_filename("../escape.txt").is_err());
    assert!(safe_filename("..\\escape.txt").is_err());
    assert!(safe_filename("bad:name.txt").is_err());
    assert!(safe_filename("star*.txt").is_err());
    assert!(safe_filename("   ").is_err());
    assert!(safe_filename(&"n".repeat(300)).is_err());
}

#[test]
fn strategy_id_rules() {
    assert!(validate_strategy_id("st_0123456789abcdef").is_ok());
    assert!(validate_strategy_id("vpn_DPI_general").is_ok());
    assert!(validate_strategy_id("../etc/passwd").is_err());
    assert!(validate_strategy_id("st_1 & calc").is_err());
    assert!(validate_strategy_id("").is_err());
}

#[test]
fn escape_for_cmd_wraps_in_quotes() {
    let escaped = escape_for_cmd("C:\\My Folder\\strategy.bat").expect("escaped");

    assert_eq!(escaped, "\"C:\\My Folder\\strategy.bat\"");
}

#[test]
fn escape_for_cmd_blocks_injection() {
    assert!(escape_for_cmd("C:\\x&del C:\\important").is_ok());
    assert!(escape_for_cmd("C:\\%USERNAME%\\x.bat").is_err());
    assert!(escape_for_cmd("C:\\x\"y.bat").is_err());
    assert!(escape_for_cmd("C:\\x\ny.bat").is_err());
}

#[test]
fn rate_limit_blocks_burst() {
    let limiter = RateLimiter::new(Duration::from_secs(60), 10);

    for index in 0..10 {
        assert!(limiter.check("st_1").is_ok(), "запрос {index}");
    }

    assert!(limiter.check("st_1").is_err());
}

#[test]
fn url_validator_https_only() {
    assert!(validate_https_url("http://api.github.com").is_err());
    assert!(validate_https_url("https://api.github.com").is_ok());
    assert!(validate_host("https://evil.example.com").is_err());
}

#[test]
fn domain_validation() {
    assert_eq!(validate_domain("Discord.com").expect("ok"), "discord.com");
    assert!(validate_domain("not a domain").is_err());
    assert!(validate_domain("-bad.example").is_err());
    assert!(validate_domain("bad-.example").is_err());
    assert!(validate_domain("localhost").is_err());
}

#[test]
fn port_validation() {
    assert_eq!(validate_port(51820).expect("ok"), 51820);
    assert_eq!(validate_port(1024).expect("ok"), 1024);
    assert!(validate_port(80).is_err());
    assert!(validate_port(0).is_err());
}

#[test]
fn ip_validation() {
    assert!(validate_ip("1.1.1.1").is_ok());
    assert!(validate_ip("256.1.1.1").is_err());
    assert!(validate_ip("fe80::1").is_ok());
    assert!(validate_ip("не адрес").is_err());
    assert!(validate_ip_range("10.0.0.0/8").is_ok());
    assert!(validate_ip_range("10.0.0.0/40").is_err());
    assert!(validate_ip_range("10.0.0.0").is_err());
}

#[test]
fn sanitize_log_hides_secrets() {
    let message = "PrivateKey = 5Gb4Y1234567890abcdefghijklmnopqrstuvwxyz=";

    let clean = sanitize_log_message(message);

    assert!(!clean.contains("5Gb4Y1234567890"));
    assert!(clean.contains("скрыто"));
}

#[test]
fn sanitize_log_keeps_ordinary_text() {
    let message = "Найдено стратегий: 22, папка C:\\zapret";

    assert_eq!(sanitize_log_message(message), message);
}

#[test]
fn max_file_size_enforced() {
    let sandbox = Sandbox::new("size");
    let small = sandbox.write("small.txt", "hello");
    assert!(ensure_size(&small, MAX_TEXT_FILE_BYTES, "config").is_ok());

    let big = sandbox.write("big.txt", &"a".repeat(64));
    assert!(ensure_size(Path::new(&big), 16, "config").is_err());
}

#[test]
fn max_file_size_rejects_directory() {
    let sandbox = Sandbox::new("dir");

    assert!(ensure_size(&sandbox.root, MAX_TEXT_FILE_BYTES, "config").is_err());
}

#[test]
fn strip_extended_prefix_removes_dos_prefix() {
    let stripped = strip_extended_prefix(PathBuf::from(r"\\?\C:\zapret\bin\winws.exe"));

    assert_eq!(stripped, PathBuf::from(r"C:\zapret\bin\winws.exe"));
}

#[test]
fn strip_extended_prefix_restores_unc() {
    let stripped = strip_extended_prefix(PathBuf::from(r"\\?\UNC\server\share\file.bat"));

    assert_eq!(stripped, PathBuf::from(r"\\server\share\file.bat"));
}

#[test]
fn strip_extended_prefix_keeps_plain_path() {
    let plain = PathBuf::from(r"C:\zapret\general.bat");

    assert_eq!(strip_extended_prefix(plain.clone()), plain);
}
