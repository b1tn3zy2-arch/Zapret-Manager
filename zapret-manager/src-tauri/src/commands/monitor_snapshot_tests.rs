// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию tiny_png.
fn tiny_png() -> String {
    // Объявляем переменную raw .
    let raw = vec![
        // Выполняем операцию: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0.
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44,
        // Выполняем операцию: 0x52,.
        0x52,
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: BASE64.encode(raw).
    BASE64.encode(raw)
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_accepts_data_url.
fn test_decode_accepts_data_url() {
    // Объявляем переменную payload .
    let payload = format!("{DATA_URL_PREFIX}{}", tiny_png());
    // Выполняем операцию: assert!(decode_snapshot(&payload).is_ok());.
    assert!(decode_snapshot(&payload).is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_accepts_raw_base64.
fn test_decode_accepts_raw_base64() {
    // Выполняем операцию: assert!(decode_snapshot(&tiny_png()).is_ok());.
    assert!(decode_snapshot(&tiny_png()).is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_rejects_garbage.
fn test_decode_rejects_garbage() {
    // Выполняем операцию: assert!(decode_snapshot("не base64 !!!").is_err());.
    assert!(decode_snapshot("не base64 !!!").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_rejects_non_png.
fn test_decode_rejects_non_png() {
    // Объявляем переменную payload .
    let payload = BASE64.encode(b"not a png at all");

    // Выполняем операцию: assert!(decode_snapshot(&payload).is_err());.
    assert!(decode_snapshot(&payload).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_rejects_empty.
fn test_decode_rejects_empty() {
    // Выполняем операцию: assert!(decode_snapshot("").is_err());.
    assert!(decode_snapshot("").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_strips_surrounding_spaces.
fn test_decode_strips_surrounding_spaces() {
    // Объявляем переменную padded .
    let padded = format!("  {DATA_URL_PREFIX}{}  ", tiny_png());
    // Выполняем операцию: assert!(decode_snapshot(&padded).is_ok());.
    assert!(decode_snapshot(&padded).is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_write_creates_missing_directories.
fn test_write_creates_missing_directories() {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join("zapret-monitor-snapshot-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Объявляем переменную path .
    let path = root.join("nested").join("shot.png");

    // Объявляем переменную written .
    let written = write_snapshot(&path, &tiny_png()).expect("снимок должен записаться");

    // Выполняем операцию: assert!(written > 0);.
    assert!(written > 0);
    // Выполняем операцию: assert!(path.exists());.
    assert!(path.exists());
    // Закрываем блок.
}
