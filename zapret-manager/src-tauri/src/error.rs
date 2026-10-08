use serde::{ser::SerializeStruct, Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Ошибка ввода-вывода: {0}")]
    Io(#[from] std::io::Error),

    #[error("Ошибка Tauri: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("Ошибка сериализации: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("{0}")]
    Custom(String),
}

impl AppError {
    pub fn custom<S: Into<String>>(message: S) -> Self {
        Self::Custom(message.into())
    }
}

impl Serialize for AppError {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut state = serializer.serialize_struct("AppError", 1)?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

pub type AppResult<T> = Result<T, AppError>;