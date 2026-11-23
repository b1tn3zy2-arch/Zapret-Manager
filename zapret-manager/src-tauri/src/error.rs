// Подключаем модули: serde::{ser::SerializeStruct, Serialize, Serializer};.
use serde::{ser::SerializeStruct, Serialize, Serializer};

// Применяем атрибут к следующему объявлению.
#[derive(Debug, thiserror::Error)]
// Объявляем перечисление AppError.
pub enum AppError {
    // Применяем атрибут к следующему объявлению.
    #[error("Ошибка ввода-вывода: {0}")]
    // Выполняем операцию: Io(#[from] std::io::Error),.
    Io(#[from] std::io::Error),

    // Применяем атрибут к следующему объявлению.
    #[error("Ошибка Tauri: {0}")]
    // Выполняем операцию: Tauri(#[from] tauri::Error),.
    Tauri(#[from] tauri::Error),

    // Применяем атрибут к следующему объявлению.
    #[error("Ошибка сериализации: {0}")]
    // Выполняем операцию: Serde(#[from] serde_json::Error),.
    Serde(#[from] serde_json::Error),

    // Применяем атрибут к следующему объявлению.
    #[error("{0}")]
    // Выполняем операцию: Custom(String),.
    Custom(String),
    // Закрываем блок.
}

// Открываем реализацию типа.
impl AppError {
    // Объявляем функцию custom.
    pub fn custom<S: Into<String>>(message: S) -> Self {
        // Выполняем операцию: Self::Custom(message.into()).
        Self::Custom(message.into())
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Serialize for AppError {
    // Объявляем функцию serialize.
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        // Объявляем переменную state .
        let mut state = serializer.serialize_struct("AppError", 1)?;
        // Выполняем операцию: state.serialize_field("message", &self.to_string())?;.
        state.serialize_field("message", &self.to_string())?;
        // Выполняем операцию: state.end().
        state.end()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Выполняем операцию: pub type AppResult<T> = Result<T, AppError>;.
pub type AppResult<T> = Result<T, AppError>;
