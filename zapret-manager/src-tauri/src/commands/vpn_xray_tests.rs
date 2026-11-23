// Подключаем модули: std::io::{Cursor, Read};.
use std::io::{Cursor, Read};

// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::vpn_subscription::parse_link;.
use crate::commands::vpn_subscription::parse_link;

// Объявляем константу CONFIG_LOCK.
static CONFIG_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());

// Объявляем функцию server.
fn server() -> SubscriptionServer {
    // Выполняем операцию: parse_link("vless://uuid@example.com:443?security=tls&s.
    parse_link("vless://uuid@example.com:443?security=tls&sni=example.com#Test").expect("ссылка")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_is_not_running_by_default.
fn test_state_is_not_running_by_default() {
    // Объявляем переменную state .
    let state = XrayState::new();

    // Выполняем операцию: assert!(!state.is_running());.
    assert!(!state.is_running());
    // Выполняем операцию: assert!(state.active().is_none());.
    assert!(state.active().is_none());
    // Выполняем операцию: assert_eq!(state.connected_at(), 0);.
    assert_eq!(state.connected_at(), 0);
    // Выполняем операцию: assert!(state.pid().is_none());.
    assert!(state.pid().is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_state_reset_is_idempotent.
fn test_state_reset_is_idempotent() {
    // Объявляем переменную state .
    let state = XrayState::new();

    // Выполняем операцию: state.reset();.
    state.reset();
    // Выполняем операцию: state.reset();.
    state.reset();

    // Выполняем операцию: assert!(state.active().is_none());.
    assert!(state.active().is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_find_core_in_empty_dir.
fn test_find_core_in_empty_dir() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-core-empty");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Выполняем операцию: assert!(find_core_in(&dir).is_none());.
    assert!(find_core_in(&dir).is_none());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_find_core_in_case_insensitive.
fn test_find_core_in_case_insensitive() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-core-case");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("XRAY.EXE"), b"stub").unwrap();.
    std::fs::write(dir.join("XRAY.EXE"), b"stub").unwrap();

    // Объявляем переменную found .
    let found = find_core_in(&dir).expect("должен найтись");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: found.file_name().and_then(|name| name.to_str()),.
        found.file_name().and_then(|name| name.to_str()),
        // Выполняем операцию: Some("XRAY.EXE").
        Some("XRAY.EXE") // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_core_ports_are_loopback_safe.
fn test_core_ports_are_loopback_safe() {
    // Объявляем переменную ports .
    let ports = [DEFAULT_SOCKS_PORT, DEFAULT_HTTP_PORT];

    // Выполняем операцию: assert_ne!(ports[0], ports[1]);.
    assert_ne!(ports[0], ports[1]);
    // Выполняем операцию: assert!(ports.iter().all(|port| *port > 1024));.
    assert!(ports.iter().all(|port| *port > 1024));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_core_api_url_is_pinned_https_github.
fn test_core_api_url_is_pinned_https_github() {
    // Выполняем операцию: assert!(CORE_API_URL.starts_with("https://api.github.co.
    assert!(CORE_API_URL.starts_with("https://api.github.com/"));
    // Выполняем операцию: assert!(CORE_API_URL.ends_with(&format!("/tags/{BUNDLED.
    assert!(CORE_API_URL.ends_with(&format!("/tags/{BUNDLED_CORE_VERSION}")));
    // Выполняем операцию: assert!(CORE_ASSET_NAME.ends_with(".zip"));.
    assert!(CORE_ASSET_NAME.ends_with(".zip"));
    // Выполняем операцию: assert_eq!(CORE_ASSET_SHA256.len(), "sha256:".len() + 6.
    assert_eq!(CORE_ASSET_SHA256.len(), "sha256:".len() + 64);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_core_asset_requires_digest.
fn test_pick_core_asset_requires_digest() {
    // Объявляем переменную without_digest .
    let without_digest = CoreAsset {
        // Выполняем операцию: name: CORE_ASSET_NAME.to_string(),.
        name: CORE_ASSET_NAME.to_string(),
        // Выполняем операцию: browser_download_url: "https://github.com/x/y.zip".to_s.
        browser_download_url: "https://github.com/x/y.zip".to_string(),
        // Выполняем операцию: digest: None,.
        digest: None,
        // Закрываем блок.
    };

    // Выполняем операцию: assert!(pick_core_asset(&[without_digest]).is_err());.
    assert!(pick_core_asset(&[without_digest]).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_core_asset_returns_url_and_digest.
fn test_pick_core_asset_returns_url_and_digest() {
    // Объявляем переменную asset .
    let asset = CoreAsset {
        // Выполняем операцию: name: CORE_ASSET_NAME.to_string(),.
        name: CORE_ASSET_NAME.to_string(),
        // Выполняем операцию: browser_download_url: "https://github.com/x/y.zip".to_s.
        browser_download_url: "https://github.com/x/y.zip".to_string(),
        // Выполняем операцию: digest: Some("sha256:abc".to_string()),.
        digest: Some("sha256:abc".to_string()),
        // Закрываем блок.
    };

    // Объявляем переменную (url, digest) .
    let (url, digest) = pick_core_asset(&[asset]).expect("asset");

    // Выполняем операцию: assert_eq!(url, "https://github.com/x/y.zip");.
    assert_eq!(url, "https://github.com/x/y.zip");
    // Выполняем операцию: assert_eq!(digest, "sha256:abc");.
    assert_eq!(digest, "sha256:abc");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_verify_core_digest_rejects_mismatch_and_empty.
fn test_verify_core_digest_rejects_mismatch_and_empty() {
    // Объявляем переменную bytes .
    let bytes = b"xray";

    // Выполняем операцию: assert!(!verify_core_digest(bytes, ""));.
    assert!(!verify_core_digest(bytes, ""));
    // Выполняем операцию: assert!(!verify_core_digest(bytes, "sha256:0000"));.
    assert!(!verify_core_digest(bytes, "sha256:0000"));
    // Выполняем операцию: assert!(verify_core_digest(bytes, &hash_bytes(bytes)));.
    assert!(verify_core_digest(bytes, &hash_bytes(bytes)));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_write_config_creates_valid_json.
fn test_write_config_creates_valid_json() {
    // Объявляем переменную _guard .
    let _guard = CONFIG_LOCK.lock().unwrap();
    // Объявляем переменную path .
    let path = write_config(&server()).expect("конфиг должен записаться");
    // Объявляем переменную text .
    let text = std::fs::read_to_string(&path).unwrap();
    // Объявляем переменную value.
    let value: serde_json::Value = serde_json::from_str(&text).unwrap();

    // Выполняем операцию: assert_eq!(value["outbounds"][0]["protocol"], "vless");.
    assert_eq!(value["outbounds"][0]["protocol"], "vless");
    // Выполняем операцию: assert_eq!(value["inbounds"][0]["port"], DEFAULT_SOCKS_.
    assert_eq!(value["inbounds"][0]["port"], DEFAULT_SOCKS_PORT);

    // Объявляем переменную _ .
    let _ = std::fs::remove_file(&path);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Применяем атрибут к следующему объявлению.
#[ignore = "ручная проверка: пишет конфиг реальной ссылки в core_dir"]
// Объявляем функцию dump_real_link_config.
fn dump_real_link_config() {
    // Объявляем переменную link .
    let link = "vless://a0aa9819-ea0d-4134-8371-bae21584ffdd@uk-24.gnodes.club:443?type=tcp&headerType=none&security=reality&fp=firefox&sni=dl.google.com&pbk=HfAZfvgOj5UVpSy5POBr_cyX-W1Tn5LOkIlcx6EBNkM&alpn=h2#%F0%9F%87%AC%F0%9F%87%A7+%D0%A5%D0%BE%D0%B3%D0%B2%D0%B0%D1%80%D1%82%D1%81+%F0%9F%A7%99";
    // Объявляем переменную server .
    let server = parse_link(link).expect("реальная ссылка");
    // Объявляем переменную path .
    let path = write_config(&server).expect("конфиг записан");

    // Выполняем операцию: assert!(path.exists(), "конфиг записан на диск");.
    assert!(path.exists(), "конфиг записан на диск");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_bundled_core_archive_contains_verified_files.
fn test_bundled_core_archive_contains_verified_files() {
    // Объявляем переменную path .
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        // Выполняем операцию: .join("resources").
        .join("resources")
        // Выполняем операцию: .join("vpn").
        .join("vpn")
        // Выполняем операцию: .join("xray-core.zip");.
        .join("xray-core.zip");
    // Объявляем переменную bytes .
    let bytes = std::fs::read(&path).expect("встроенный архив Xray");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: verify_core_digest(&bytes, BUNDLED_CORE_ARCHIVE_SHA256).
        verify_core_digest(&bytes, BUNDLED_CORE_ARCHIVE_SHA256),
        // Выполняем операцию: "хеш встроенного архива Xray должен совпадать с констан.
        "хеш встроенного архива Xray должен совпадать с константой" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную archive .
    let mut archive = zip::ZipArchive::new(Cursor::new(bytes)).expect("zip читается");
    // Объявляем переменную exe .
    let mut exe = Vec::new();
    // Выполняем операцию: archive.
    archive
        // Выполняем операцию: .by_name("xray.exe").
        .by_name("xray.exe")
        // Выполняем операцию: .expect("xray.exe в архиве").
        .expect("xray.exe в архиве")
        // Выполняем операцию: .read_to_end(&mut exe).
        .read_to_end(&mut exe)
        // Выполняем операцию: .unwrap();.
        .unwrap();

    // Выполняем операцию: assert!(verify_core_digest(&exe, BUNDLED_CORE_EXE_SHA25.
    assert!(verify_core_digest(&exe, BUNDLED_CORE_EXE_SHA256));

    // Объявляем переменную geoip .
    let mut geoip = Vec::new();
    // Выполняем операцию: archive.
    archive
        // Выполняем операцию: .by_name("geoip.dat").
        .by_name("geoip.dat")
        // Выполняем операцию: .expect("geoip.dat в архиве").
        .expect("geoip.dat в архиве")
        // Выполняем операцию: .read_to_end(&mut geoip).
        .read_to_end(&mut geoip)
        // Выполняем операцию: .unwrap();.
        .unwrap();

    // Выполняем операцию: assert!(verify_core_digest(&geoip, BUNDLED_CORE_DATA_SH.
    assert!(verify_core_digest(&geoip, BUNDLED_CORE_DATA_SHA256));
    // Выполняем операцию: assert!(!BUNDLED_CORE_VERSION.is_empty());.
    assert!(!BUNDLED_CORE_VERSION.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_has_core_files_requires_both_files.
fn test_has_core_files_requires_both_files() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-core-files-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную exe .
    let exe = std::fs::File::create(dir.join(CORE_EXE)).unwrap();
    // Выполняем операцию: exe.set_len(CORE_MIN_EXE_BYTES).unwrap();.
    exe.set_len(CORE_MIN_EXE_BYTES).unwrap();
    // Объявляем переменную data .
    let data = std::fs::File::create(dir.join(CORE_DATA)).unwrap();
    // Выполняем операцию: data.set_len(CORE_MIN_DATA_BYTES).unwrap();.
    data.set_len(CORE_MIN_DATA_BYTES).unwrap();

    // Выполняем операцию: assert!(has_core_files(&dir));.
    assert!(has_core_files(&dir));
    // Нулевые файлы нужного размера — ещё не рабочее ядро.
    // Выполняем операцию: assert!(!has_healthy_core_files(&dir));.
    assert!(!has_healthy_core_files(&dir));

    // Выполняем операцию: std::fs::remove_file(dir.join(CORE_DATA)).unwrap();.
    std::fs::remove_file(dir.join(CORE_DATA)).unwrap();
    // Выполняем операцию: assert!(!has_core_files(&dir));.
    assert!(!has_core_files(&dir));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_spawn_without_core_fails_cleanly.
fn test_spawn_without_core_fails_cleanly() {
    // Объявляем переменную _guard .
    let _guard = CONFIG_LOCK.lock().unwrap();
    // Объявляем переменную dir .
    let dir = core_dir().unwrap();
    // Объявляем переменную target .
    let target = dir.join(CORE_EXE);
    // Объявляем переменную existed .
    let existed = target.is_file();

    // Проверяем условие: !existed {.
    if !existed {
        // Объявляем переменную config .
        let config = write_config(&server()).unwrap();
        // Объявляем переменную result .
        let result = spawn_core(&config);

        // Выполняем операцию: assert!(result.is_err());.
        assert!(result.is_err());

        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&config);
        // Закрываем блок.
    }
    // Закрываем блок.
}
