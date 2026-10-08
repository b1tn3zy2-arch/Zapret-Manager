use super::*;

fn tiny_png() -> String {
    let raw = vec![
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44,
        0x52,
    ];

    BASE64.encode(raw)
}

#[test]
fn test_decode_accepts_data_url() {
    let payload = format!("{DATA_URL_PREFIX}{}", tiny_png());
    assert!(decode_snapshot(&payload).is_ok());
}

#[test]
fn test_decode_accepts_raw_base64() {
    assert!(decode_snapshot(&tiny_png()).is_ok());
}

#[test]
fn test_decode_rejects_garbage() {
    assert!(decode_snapshot("не base64 !!!").is_err());
}

#[test]
fn test_decode_rejects_empty() {
    assert!(decode_snapshot("").is_err());
}

#[test]
fn test_decode_strips_surrounding_spaces() {
    let padded = format!("  {DATA_URL_PREFIX}{}  ", tiny_png());
    assert!(decode_snapshot(&padded).is_ok());
}

#[test]
fn test_validate_rejects_blank_path() {
    assert!(validate_snapshot_path("   ").is_err());
}

#[test]
fn test_validate_rejects_other_extensions() {
    assert!(validate_snapshot_path("C:/pics/shot.jpg").is_err());
    assert!(validate_snapshot_path("C:/pics/shot").is_err());
}

#[test]
fn test_validate_accepts_png_any_case() {
    assert!(validate_snapshot_path(" C:/pics/shot.PNG ").is_ok());
}

#[test]
fn test_write_creates_missing_directories() {
    let root = std::env::temp_dir().join("zapret-monitor-snapshot-test");
    let _ = std::fs::remove_dir_all(&root);
    let path = root.join("nested").join("shot.png");

    let written = write_snapshot(&path, &tiny_png()).expect("снимок должен записаться");

    assert!(written > 0);
    assert!(path.exists());
}

#[test]
fn test_write_snapshot_command_rejects_bad_path() {
    assert!(write_monitor_snapshot("C:/pics/shot.gif".to_string(), tiny_png()).is_err());
}