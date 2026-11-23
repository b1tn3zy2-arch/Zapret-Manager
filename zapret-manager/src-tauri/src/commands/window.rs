// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Объявляем функцию logical_size.
fn logical_size(width: u32, height: u32, scale: f64) -> (u32, u32) {
    // Проверяем условие: scale <= 0.0 || !scale.is_finite() {.
    if scale <= 0.0 || !scale.is_finite() {
        // Возвращаем результат из функции.
        return (width, height);
        // Закрываем блок.
    }

    // Выполняем операцию: (.
    (
        // Выполняем операцию: (width as f64 / scale).round() as u32,.
        (width as f64 / scale).round() as u32,
        // Выполняем операцию: (height as f64 / scale).round() as u32,.
        (height as f64 / scale).round() as u32,
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию logical_size_divides_physical_by_scale.
    fn logical_size_divides_physical_by_scale() {
        // Выполняем операцию: assert_eq!(logical_size(2880, 1620, 1.5), (1920, 1080)).
        assert_eq!(logical_size(2880, 1620, 1.5), (1920, 1080));
        // Выполняем операцию: assert_eq!(logical_size(2560, 1440, 2.0), (1280, 720));.
        assert_eq!(logical_size(2560, 1440, 2.0), (1280, 720));
        // Выполняем операцию: assert_eq!(logical_size(800, 600, 1.0), (800, 600));.
        assert_eq!(logical_size(800, 600, 1.0), (800, 600));
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию logical_size_ignores_invalid_scale.
    fn logical_size_ignores_invalid_scale() {
        // Выполняем операцию: assert_eq!(logical_size(1024, 768, 0.0), (1024, 768));.
        assert_eq!(logical_size(1024, 768, 0.0), (1024, 768));
        // Выполняем операцию: assert_eq!(logical_size(1024, 768, f64::NAN), (1024, 76.
        assert_eq!(logical_size(1024, 768, f64::NAN), (1024, 768));
        // Закрываем блок.
    }
    // Закрываем блок.
}
