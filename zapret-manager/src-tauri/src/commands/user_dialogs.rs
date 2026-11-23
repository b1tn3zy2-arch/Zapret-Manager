//! Системные диалоги сохранения и открытия файлов.
//!
//! Путь к файлу выбирает сам пользователь в нативном диалоге, а не
//! webview. Поэтому скомпрометированная страница не может через IPC
//! прочитать или перезаписать произвольный файл: у неё нет способа
//! подсунуть путь.

// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;
// Подключаем модули: tauri_plugin_dialog::DialogExt;.
use tauri_plugin_dialog::DialogExt;

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};
// Подключаем модули: crate::security::paths::safe_filename;.
use crate::security::paths::safe_filename;

// Объявляем константу MAX_TITLE_LEN.
const MAX_TITLE_LEN: usize = 120;

/// Тип файла определяет фильтры диалога и разрешённые расширения.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
// Объявляем перечисление FileKind.
pub enum FileKind {
    // Выполняем операцию: Png,.
    Png,
    // Выполняем операцию: Json,.
    Json,
    // Выполняем операцию: TextLog,.
    TextLog,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl FileKind {
    // Объявляем функцию extensions.
    fn extensions(self) -> &'static [&'static str] {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::Png => &["png"],.
            Self::Png => &["png"],
            // Выполняем операцию: Self::Json => &["json"],.
            Self::Json => &["json"],
            // Выполняем операцию: Self::TextLog => &["txt", "log"],.
            Self::TextLog => &["txt", "log"],
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию default_extension.
    fn default_extension(self) -> &'static str {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::Png => "png",.
            Self::Png => "png",
            // Выполняем операцию: Self::Json => "json",.
            Self::Json => "json",
            // Выполняем операцию: Self::TextLog => "txt",.
            Self::TextLog => "txt",
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию dialog_title.
fn dialog_title(title: &str) -> String {
    // Объявляем переменную trimmed .
    let trimmed = title.trim();

    // Проверяем условие: trimmed.is_empty() || trimmed.len() > MAX_TITLE_LE.
    if trimmed.is_empty() || trimmed.len() > MAX_TITLE_LEN {
        // Возвращаем результат из функции.
        return "Zapret Manager".to_string();
        // Закрываем блок.
    }

    // Выполняем операцию: trimmed.
    trimmed
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .filter(|character| !character.is_control()).
        .filter(|character| !character.is_control())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию build_save_dialog.
fn build_save_dialog(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: title: &str,.
    title: &str,
    // Выполняем операцию: default_name: &str,.
    default_name: &str,
    // Выполняем операцию: kind: FileKind,.
    kind: FileKind,
    // Закрываем выражение или коллекцию.
) -> tauri_plugin_dialog::FileDialogBuilder<tauri::Wry> {
    // Объявляем переменную builder .
    let builder = app
        // Выполняем операцию: .dialog().
        .dialog()
        // Выполняем операцию: .file().
        .file()
        // Выполняем операцию: .set_title(dialog_title(title)).
        .set_title(dialog_title(title))
        // Выполняем операцию: .set_file_name(default_name);.
        .set_file_name(default_name);

    // Выбираем вариант по значению.
    match kind {
        // Выполняем операцию: FileKind::Png => builder.add_filter("PNG", &["png"]),.
        FileKind::Png => builder.add_filter("PNG", &["png"]),
        // Выполняем операцию: FileKind::Json => builder.add_filter("JSON", &["json"]).
        FileKind::Json => builder.add_filter("JSON", &["json"]),
        // Выполняем операцию: FileKind::TextLog => builder.
        FileKind::TextLog => builder
            // Выполняем операцию: .add_filter("Text", &["txt"]).
            .add_filter("Text", &["txt"])
            // Выполняем операцию: .add_filter("Log", &["log"]),.
            .add_filter("Log", &["log"]),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию build_open_dialog.
fn build_open_dialog(
    // Выполняем операцию: app: &AppHandle,.
    app: &AppHandle,
    // Выполняем операцию: title: &str,.
    title: &str,
    // Выполняем операцию: kind: FileKind,.
    kind: FileKind,
    // Закрываем выражение или коллекцию.
) -> tauri_plugin_dialog::FileDialogBuilder<tauri::Wry> {
    // Объявляем переменную builder .
    let builder = app.dialog().file().set_title(dialog_title(title));

    // Выбираем вариант по значению.
    match kind {
        // Выполняем операцию: FileKind::Png => builder.add_filter("PNG", &["png"]),.
        FileKind::Png => builder.add_filter("PNG", &["png"]),
        // Выполняем операцию: FileKind::Json => builder.add_filter("JSON", &["json"]).
        FileKind::Json => builder.add_filter("JSON", &["json"]),
        // Выполняем операцию: FileKind::TextLog => builder.
        FileKind::TextLog => builder
            // Выполняем операцию: .add_filter("Text", &["txt"]).
            .add_filter("Text", &["txt"])
            // Выполняем операцию: .add_filter("Log", &["log"]),.
            .add_filter("Log", &["log"]),
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Показывает диалог сохранения и возвращает выбранный путь.
///
/// `None` означает, что пользователь отменил выбор.
// Выполняем операцию: pub async fn save_file(.
pub async fn save_file(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Выполняем операцию: default_name: String,.
    default_name: String,
    // Выполняем операцию: kind: FileKind,.
    kind: FileKind,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<PathBuf>> {
    // Объявляем переменную default_name .
    let default_name = safe_filename(&default_name)?;

    // Выполняем операцию: tokio::task::spawn_blocking(move || {.
    tokio::task::spawn_blocking(move || {
        // Объявляем переменную selected .
        let selected = build_save_dialog(&app, &title, &default_name, kind).blocking_save_file();

        // Выполняем операцию: selected.
        selected
            // Выполняем операцию: .map(|file| {.
            .map(|file| {
                // Выполняем операцию: file.into_path().
                file.into_path()
                    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Путь не выбр.
                    .map_err(|error| AppError::custom(format!("Путь не выбран: {error}")))
                // Закрываем блок.
            })
            // Выполняем операцию: .transpose().
            .transpose()
            // Выполняем операцию: .and_then(|path| path.map(|path| ensure_extension(path,.
            .and_then(|path| path.map(|path| ensure_extension(path, kind)).transpose())
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Диалог сохра.
    .map_err(|error| AppError::custom(format!("Диалог сохранения прерван: {error}")))?
    // Закрываем блок.
}

/// Показывает диалог открытия и возвращает выбранный путь.
///
/// `None` означает, что пользователь отменил выбор.
// Выполняем операцию: pub async fn pick_file(.
pub async fn pick_file(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: title: String,.
    title: String,
    // Выполняем операцию: kind: FileKind,.
    kind: FileKind,
    // Закрываем выражение или коллекцию.
) -> AppResult<Option<PathBuf>> {
    // Выполняем операцию: tokio::task::spawn_blocking(move || {.
    tokio::task::spawn_blocking(move || {
        // Объявляем переменную selected .
        let selected = build_open_dialog(&app, &title, kind).blocking_pick_file();

        // Выполняем операцию: selected.
        selected
            // Выполняем операцию: .map(|file| {.
            .map(|file| {
                // Выполняем операцию: file.into_path().
                file.into_path()
                    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Путь не выбр.
                    .map_err(|error| AppError::custom(format!("Путь не выбран: {error}")))
                // Закрываем блок.
            })
            // Выполняем операцию: .transpose().
            .transpose()
            // Выполняем операцию: .and_then(|path| path.map(|path| ensure_extension(path,.
            .and_then(|path| path.map(|path| ensure_extension(path, kind)).transpose())
        // Закрываем блок.
    })
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Диалог откры.
    .map_err(|error| AppError::custom(format!("Диалог открытия прерван: {error}")))?
    // Закрываем блок.
}

/// Добавляет расширение по умолчанию, если его нет, и отклоняет чужие.
// Объявляем функцию ensure_extension.
pub fn ensure_extension(mut path: PathBuf, kind: FileKind) -> AppResult<PathBuf> {
    // Объявляем переменную extension .
    let extension = path
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .map(str::to_ascii_lowercase);.
        .map(str::to_ascii_lowercase);

    // Выбираем вариант по значению.
    match extension {
        // Выполняем операцию: Some(extension) if kind.extensions().contains(&extensio.
        Some(extension) if kind.extensions().contains(&extension.as_str()) => Ok(path),
        // Выполняем операцию: Some(extension) => Err(AppError::custom(format!(.
        Some(extension) => Err(AppError::custom(format!(
            // Выполняем операцию: "Недопустимое расширение файла: .{extension}".
            "Недопустимое расширение файла: .{extension}" // Закрываем выражение или коллекцию.
        ))),
        // Выполняем операцию: None => {.
        None => {
            // Выполняем операцию: path.set_extension(kind.default_extension());.
            path.set_extension(kind.default_extension());
            // Выполняем операцию: Ok(path).
            Ok(path)
            // Закрываем блок.
        } // Закрываем блок.
    }
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
    // Объявляем функцию test_ensure_extension_accepts_allowed_case_insensitive.
    fn test_ensure_extension_accepts_allowed_case_insensitive() {
        // Объявляем переменную path .
        let path = PathBuf::from(r"C:\temp\shot.PNG");

        // Выполняем операцию: assert!(ensure_extension(path, FileKind::Png).is_ok());.
        assert!(ensure_extension(path, FileKind::Png).is_ok());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_ensure_extension_adds_default.
    fn test_ensure_extension_adds_default() {
        // Объявляем переменную path .
        let path = ensure_extension(PathBuf::from(r"C:\temp\report"), FileKind::TextLog)
            // Выполняем операцию: .expect("расширение добавлено");.
            .expect("расширение добавлено");

        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: path.extension().and_then(|value| value.to_str()),.
            path.extension().and_then(|value| value.to_str()),
            // Выполняем операцию: Some("txt").
            Some("txt") // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_ensure_extension_rejects_foreign_extension.
    fn test_ensure_extension_rejects_foreign_extension() {
        // Выполняем операцию: assert!(ensure_extension(PathBuf::from(r"C:\temp\evil.e.
        assert!(ensure_extension(PathBuf::from(r"C:\temp\evil.exe"), FileKind::Png).is_err());
        // Выполняем операцию: assert!(ensure_extension(PathBuf::from(r"C:\temp\evil.p.
        assert!(ensure_extension(PathBuf::from(r"C:\temp\evil.png"), FileKind::Json).is_err());
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_dialog_title_is_sanitized.
    fn test_dialog_title_is_sanitized() {
        // Выполняем операцию: assert_eq!(dialog_title("  Сохранить  "), "Сохранить");.
        assert_eq!(dialog_title("  Сохранить  "), "Сохранить");
        // Выполняем операцию: assert_eq!(dialog_title(""), "Zapret Manager");.
        assert_eq!(dialog_title(""), "Zapret Manager");
        // Выполняем операцию: assert_eq!(.
        assert_eq!(
            // Выполняем операцию: dialog_title(&"x".repeat(MAX_TITLE_LEN + 1)),.
            dialog_title(&"x".repeat(MAX_TITLE_LEN + 1)),
            // Выполняем операцию: "Zapret Manager".
            "Zapret Manager" // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert!(!dialog_title("bad\0title").contains('\0'));.
        assert!(!dialog_title("bad\0title").contains('\0'));
        // Закрываем блок.
    }
    // Закрываем блок.
}
