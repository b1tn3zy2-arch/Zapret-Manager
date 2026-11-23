// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию text_size_accepts_small_content.
fn text_size_accepts_small_content() {
    // Выполняем операцию: assert!(ensure_text_size("{}").is_ok());.
    assert!(ensure_text_size("{}").is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию text_size_rejects_oversized_content.
fn text_size_rejects_oversized_content() {
    // Объявляем переменную payload .
    let payload = "a".repeat(MAX_TEXT_FILE_BYTES as usize + 1);

    // Выполняем операцию: assert!(ensure_text_size(&payload).is_err());.
    assert!(ensure_text_size(&payload).is_err());
    // Закрываем блок.
}
