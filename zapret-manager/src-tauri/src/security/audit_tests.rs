// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: crate::security::paths::{.
use crate::security::paths::{
    // Выполняем операцию: safe_filename, safe_path, strip_extended_prefix, valida.
    safe_filename,
    safe_path,
    strip_extended_prefix,
    validate_strategy_id,
    // Закрываем блок.
};
// Подключаем модули: crate::security::rate_limit::RateLimiter;.
use crate::security::rate_limit::RateLimiter;
// Подключаем модули: crate::security::sanitize::{.
use crate::security::sanitize::{
    // Выполняем операцию: escape_for_cmd, sanitize_log_message, validate_domain, .
    escape_for_cmd,
    sanitize_log_message,
    validate_domain,
    validate_ip,
    validate_ip_range,
    // Выполняем операцию: validate_port,.
    validate_port,
    // Закрываем блок.
};
// Подключаем модули: crate::security::url_validator::{validate_host, validat.
use crate::security::url_validator::{validate_host, validate_https_url};
// Подключаем модули: crate::security::{ensure_size, MAX_TEXT_FILE_BYTES};.
use crate::security::{ensure_size, MAX_TEXT_FILE_BYTES};

// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Объявляем структуру Sandbox.
struct Sandbox {
    // Выполняем операцию: root: PathBuf,.
    root: PathBuf,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Sandbox {
    // Объявляем функцию new.
    fn new(name: &str) -> Self {
        // Объявляем переменную root .
        let root = std::env::temp_dir().join(format!("zapret-sec-{name}"));
        // Объявляем переменную _ .
        let _ = std::fs::remove_dir_all(&root);
        // Выполняем операцию: std::fs::create_dir_all(&root).expect("sandbox");.
        std::fs::create_dir_all(&root).expect("sandbox");

        // Выполняем операцию: Self { root }.
        Self { root }
        // Закрываем блок.
    }

    // Объявляем функцию write.
    fn write(&self, name: &str, content: &str) -> PathBuf {
        // Объявляем переменную path .
        let path = self.root.join(name);
        // Выполняем операцию: std::fs::write(&path, content).expect("write");.
        std::fs::write(&path, content).expect("write");

        // Выполняем операцию: path.
        path
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Drop for Sandbox {
    // Объявляем функцию drop.
    fn drop(&mut self) {
        // Объявляем переменную _ .
        let _ = std::fs::remove_dir_all(&self.root);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию safe_path_accepts_child.
fn safe_path_accepts_child() {
    // Объявляем переменную sandbox .
    let sandbox = Sandbox::new("child");
    // Объявляем переменную file .
    let file = sandbox.write("ok.bat", "@echo off");

    // Объявляем переменную resolved .
    let resolved = safe_path(&sandbox.root, &file).expect("resolved");

    // Выполняем операцию: assert_eq!(resolved, std::fs::canonicalize(&file).expec.
    assert_eq!(resolved, std::fs::canonicalize(&file).expect("canonical"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию safe_path_rejects_traversal.
fn safe_path_rejects_traversal() {
    // Объявляем переменную sandbox .
    let sandbox = Sandbox::new("traversal");
    // Объявляем переменную nested .
    let nested = sandbox.root.join("nested");
    // Выполняем операцию: std::fs::create_dir_all(&nested).expect("nested");.
    std::fs::create_dir_all(&nested).expect("nested");

    // Объявляем переменную traversal .
    let traversal = nested.join("..\\outside.bat");

    // Выполняем операцию: assert!(safe_path(&sandbox.root, &traversal).is_err());.
    assert!(safe_path(&sandbox.root, &traversal).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию safe_path_rejects_file_outside_base.
fn safe_path_rejects_file_outside_base() {
    // Объявляем переменную sandbox .
    let sandbox = Sandbox::new("outside-base");
    // Объявляем переменную outside_dir .
    let outside_dir = std::env::temp_dir().join("zapret-sec-other");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&outside_dir);
    // Выполняем операцию: std::fs::create_dir_all(&outside_dir).expect("other dir.
    std::fs::create_dir_all(&outside_dir).expect("other dir");
    // Объявляем переменную foreign .
    let foreign = outside_dir.join("foreign.bat");
    // Выполняем операцию: std::fs::write(&foreign, "echo foreign").expect("write".
    std::fs::write(&foreign, "echo foreign").expect("write");

    // Выполняем операцию: assert!(safe_path(&sandbox.root, &foreign).is_err());.
    assert!(safe_path(&sandbox.root, &foreign).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&outside_dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию safe_path_rejects_symlink_escape.
fn safe_path_rejects_symlink_escape() {
    // Объявляем переменную sandbox .
    let sandbox = Sandbox::new("symlink");
    // Объявляем переменную outside_dir .
    let outside_dir = std::env::temp_dir().join("zapret-sec-outside");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&outside_dir);
    // Выполняем операцию: std::fs::create_dir_all(&outside_dir).expect("outside d.
    std::fs::create_dir_all(&outside_dir).expect("outside dir");
    // Объявляем переменную secret .
    let secret = outside_dir.join("secret.bat");
    // Выполняем операцию: std::fs::write(&secret, "echo secret").expect("secret").
    std::fs::write(&secret, "echo secret").expect("secret");

    // Объявляем переменную link .
    let link = sandbox.root.join("link.bat");
    // Объявляем переменную created .
    let created = std::os::windows::fs::symlink_file(&secret, &link).is_ok();

    // Проверяем условие: created {.
    if created {
        // Выполняем операцию: assert!(safe_path(&sandbox.root, &link).is_err());.
        assert!(safe_path(&sandbox.root, &link).is_err());
        // Закрываем блок.
    }

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&outside_dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию safe_filename_rules.
fn safe_filename_rules() {
    // Выполняем операцию: assert!(safe_filename("list-general.txt").is_ok());.
    assert!(safe_filename("list-general.txt").is_ok());
    // Выполняем операцию: assert!(safe_filename("my file.txt").is_ok());.
    assert!(safe_filename("my file.txt").is_ok());
    // Выполняем операцию: assert!(safe_filename("../escape.txt").is_err());.
    assert!(safe_filename("../escape.txt").is_err());
    // Выполняем операцию: assert!(safe_filename("..\\escape.txt").is_err());.
    assert!(safe_filename("..\\escape.txt").is_err());
    // Выполняем операцию: assert!(safe_filename("bad:name.txt").is_err());.
    assert!(safe_filename("bad:name.txt").is_err());
    // Выполняем операцию: assert!(safe_filename("star*.txt").is_err());.
    assert!(safe_filename("star*.txt").is_err());
    // Выполняем операцию: assert!(safe_filename("   ").is_err());.
    assert!(safe_filename("   ").is_err());
    // Выполняем операцию: assert!(safe_filename(&"n".repeat(300)).is_err());.
    assert!(safe_filename(&"n".repeat(300)).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию strategy_id_rules.
fn strategy_id_rules() {
    // Выполняем операцию: assert!(validate_strategy_id("st_0123456789abcdef").is_.
    assert!(validate_strategy_id("st_0123456789abcdef").is_ok());
    // Выполняем операцию: assert!(validate_strategy_id("vpn_DPI_general").is_ok().
    assert!(validate_strategy_id("vpn_DPI_general").is_ok());
    // Выполняем операцию: assert!(validate_strategy_id("../etc/passwd").is_err()).
    assert!(validate_strategy_id("../etc/passwd").is_err());
    // Выполняем операцию: assert!(validate_strategy_id("st_1 & calc").is_err());.
    assert!(validate_strategy_id("st_1 & calc").is_err());
    // Выполняем операцию: assert!(validate_strategy_id("").is_err());.
    assert!(validate_strategy_id("").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию escape_for_cmd_wraps_in_quotes.
fn escape_for_cmd_wraps_in_quotes() {
    // Объявляем переменную escaped .
    let escaped = escape_for_cmd("C:\\My Folder\\strategy.bat").expect("escaped");

    // Выполняем операцию: assert_eq!(escaped, "\"C:\\My Folder\\strategy.bat\"");.
    assert_eq!(escaped, "\"C:\\My Folder\\strategy.bat\"");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию escape_for_cmd_blocks_injection.
fn escape_for_cmd_blocks_injection() {
    // Выполняем операцию: assert!(escape_for_cmd("C:\\x&del C:\\important").is_ok.
    assert!(escape_for_cmd("C:\\x&del C:\\important").is_ok());
    // Выполняем операцию: assert!(escape_for_cmd("C:\\%USERNAME%\\x.bat").is_err(.
    assert!(escape_for_cmd("C:\\%USERNAME%\\x.bat").is_err());
    // Выполняем операцию: assert!(escape_for_cmd("C:\\x\"y.bat").is_err());.
    assert!(escape_for_cmd("C:\\x\"y.bat").is_err());
    // Выполняем операцию: assert!(escape_for_cmd("C:\\x\ny.bat").is_err());.
    assert!(escape_for_cmd("C:\\x\ny.bat").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию rate_limit_blocks_burst.
fn rate_limit_blocks_burst() {
    // Объявляем переменную limiter .
    let limiter = RateLimiter::new(Duration::from_secs(60), 10);

    // Перебираем элементы коллекции.
    for index in 0..10 {
        // Выполняем операцию: assert!(limiter.check("st_1").is_ok(), "запрос {index}".
        assert!(limiter.check("st_1").is_ok(), "запрос {index}");
        // Закрываем блок.
    }

    // Выполняем операцию: assert!(limiter.check("st_1").is_err());.
    assert!(limiter.check("st_1").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию url_validator_https_only.
fn url_validator_https_only() {
    // Выполняем операцию: assert!(validate_https_url("http://api.github.com").is_.
    assert!(validate_https_url("http://api.github.com").is_err());
    // Выполняем операцию: assert!(validate_https_url("https://api.github.com").is.
    assert!(validate_https_url("https://api.github.com").is_ok());
    // Выполняем операцию: assert!(validate_host("https://evil.example.com").is_er.
    assert!(validate_host("https://evil.example.com").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию domain_validation.
fn domain_validation() {
    // Выполняем операцию: assert_eq!(validate_domain("Discord.com").expect("ok"),.
    assert_eq!(validate_domain("Discord.com").expect("ok"), "discord.com");
    // Выполняем операцию: assert!(validate_domain("not a domain").is_err());.
    assert!(validate_domain("not a domain").is_err());
    // Выполняем операцию: assert!(validate_domain("-bad.example").is_err());.
    assert!(validate_domain("-bad.example").is_err());
    // Выполняем операцию: assert!(validate_domain("bad-.example").is_err());.
    assert!(validate_domain("bad-.example").is_err());
    // Выполняем операцию: assert!(validate_domain("localhost").is_err());.
    assert!(validate_domain("localhost").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию port_validation.
fn port_validation() {
    // Выполняем операцию: assert_eq!(validate_port(51820).expect("ok"), 51820);.
    assert_eq!(validate_port(51820).expect("ok"), 51820);
    // Выполняем операцию: assert_eq!(validate_port(1024).expect("ok"), 1024);.
    assert_eq!(validate_port(1024).expect("ok"), 1024);
    // Выполняем операцию: assert!(validate_port(0).is_err());.
    assert!(validate_port(0).is_err());
    // Выполняем операцию: assert!(validate_port(0).is_err());.
    assert!(validate_port(0).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию ip_validation.
fn ip_validation() {
    // Выполняем операцию: assert!(validate_ip("1.1.1.1").is_ok());.
    assert!(validate_ip("1.1.1.1").is_ok());
    // Выполняем операцию: assert!(validate_ip("256.1.1.1").is_err());.
    assert!(validate_ip("256.1.1.1").is_err());
    // Выполняем операцию: assert!(validate_ip("fe80::1").is_ok());.
    assert!(validate_ip("fe80::1").is_ok());
    // Выполняем операцию: assert!(validate_ip("не адрес").is_err());.
    assert!(validate_ip("не адрес").is_err());
    // Выполняем операцию: assert!(validate_ip_range("10.0.0.0/8").is_ok());.
    assert!(validate_ip_range("10.0.0.0/8").is_ok());
    // Выполняем операцию: assert!(validate_ip_range("10.0.0.0/40").is_err());.
    assert!(validate_ip_range("10.0.0.0/40").is_err());
    // Выполняем операцию: assert!(validate_ip_range("10.0.0.0").is_err());.
    assert!(validate_ip_range("10.0.0.0").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию sanitize_log_hides_secrets.
fn sanitize_log_hides_secrets() {
    // Объявляем переменную message .
    let message = "PrivateKey = 5Gb4Y1234567890abcdefghijklmnopqrstuvwxyz=";

    // Объявляем переменную clean .
    let clean = sanitize_log_message(message);

    // Выполняем операцию: assert!(!clean.contains("5Gb4Y1234567890"));.
    assert!(!clean.contains("5Gb4Y1234567890"));
    // Выполняем операцию: assert!(clean.contains("скрыто"));.
    assert!(clean.contains("скрыто"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию sanitize_log_keeps_ordinary_text.
fn sanitize_log_keeps_ordinary_text() {
    // Объявляем переменную message .
    let message = "Найдено стратегий: 22, папка C:\\zapret";

    // Выполняем операцию: assert_eq!(sanitize_log_message(message), message);.
    assert_eq!(sanitize_log_message(message), message);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию max_file_size_enforced.
fn max_file_size_enforced() {
    // Объявляем переменную sandbox .
    let sandbox = Sandbox::new("size");
    // Объявляем переменную small .
    let small = sandbox.write("small.txt", "hello");
    // Выполняем операцию: assert!(ensure_size(&small, MAX_TEXT_FILE_BYTES, "confi.
    assert!(ensure_size(&small, MAX_TEXT_FILE_BYTES, "config").is_ok());

    // Объявляем переменную big .
    let big = sandbox.write("big.txt", &"a".repeat(64));
    // Выполняем операцию: assert!(ensure_size(Path::new(&big), 16, "config").is_e.
    assert!(ensure_size(Path::new(&big), 16, "config").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию max_file_size_rejects_directory.
fn max_file_size_rejects_directory() {
    // Объявляем переменную sandbox .
    let sandbox = Sandbox::new("dir");

    // Выполняем операцию: assert!(ensure_size(&sandbox.root, MAX_TEXT_FILE_BYTES,.
    assert!(ensure_size(&sandbox.root, MAX_TEXT_FILE_BYTES, "config").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию strip_extended_prefix_removes_dos_prefix.
fn strip_extended_prefix_removes_dos_prefix() {
    // Объявляем переменную stripped .
    let stripped = strip_extended_prefix(PathBuf::from(r"\\?\C:\zapret\bin\winws.exe"));

    // Выполняем операцию: assert_eq!(stripped, PathBuf::from(r"C:\zapret\bin\winw.
    assert_eq!(stripped, PathBuf::from(r"C:\zapret\bin\winws.exe"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию strip_extended_prefix_restores_unc.
fn strip_extended_prefix_restores_unc() {
    // Объявляем переменную stripped .
    let stripped = strip_extended_prefix(PathBuf::from(r"\\?\UNC\server\share\file.bat"));

    // Выполняем операцию: assert_eq!(stripped, PathBuf::from(r"\\server\share\fil.
    assert_eq!(stripped, PathBuf::from(r"\\server\share\file.bat"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию strip_extended_prefix_keeps_plain_path.
fn strip_extended_prefix_keeps_plain_path() {
    // Объявляем переменную plain .
    let plain = PathBuf::from(r"C:\zapret\general.bat");

    // Выполняем операцию: assert_eq!(strip_extended_prefix(plain.clone()), plain).
    assert_eq!(strip_extended_prefix(plain.clone()), plain);
    // Закрываем блок.
}
