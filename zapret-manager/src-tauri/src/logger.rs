// Подключаем модули: std::fs::OpenOptions;.
use std::fs::OpenOptions;
// Подключаем модули: std::io::{self, Write};.
use std::io::{self, Write};
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};
// Подключаем модули: std::sync::Mutex;.
use std::sync::Mutex;

// Подключаем модули: tracing_subscriber::{.
use tracing_subscriber::{
    // Выполняем операцию: fmt, fmt::MakeWriter, layer::SubscriberExt, util::Subsc.
    fmt,
    fmt::MakeWriter,
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
    Layer,
    // Закрываем блок.
};

// Подключаем модули: crate::security::sanitize::sanitize_log_message;.
use crate::security::sanitize::sanitize_log_message;
// Подключаем модули: crate::security::{app_log_dir, SECURITY_TARGET};.
use crate::security::{app_log_dir, SECURITY_TARGET};

// Объявляем константу MAX_SECURITY_LOG_BYTES.
const MAX_SECURITY_LOG_BYTES: u64 = 1024 * 1024;
// Объявляем константу MAX_APP_LOG_BYTES.
const MAX_APP_LOG_BYTES: u64 = 10 * 1024 * 1024;

// Объявляем структуру RotatingFile.
pub struct RotatingFile {
    // Выполняем операцию: path: Mutex<Option<PathBuf>>,.
    path: Mutex<Option<PathBuf>>,
    // Выполняем операцию: max_bytes: u64,.
    max_bytes: u64,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl RotatingFile {
    // Объявляем функцию writer.
    pub fn writer(path: PathBuf, max_bytes: u64) -> Self {
        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: path: Mutex::new(Some(path)),.
            path: Mutex::new(Some(path)),
            // Выполняем операцию: max_bytes,.
            max_bytes,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию rotate.
    fn rotate(path: &Path, max_bytes: u64) {
        // Объявляем переменную Ok(metadata) .
        let Ok(metadata) = std::fs::metadata(path) else {
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        };

        // Проверяем условие: metadata.len() < max_bytes {.
        if metadata.len() < max_bytes {
            // Возвращаем результат из функции.
            return;
            // Закрываем блок.
        }

        // Объявляем переменную previous .
        let previous = path.with_extension("log.1");
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&previous);
        // Объявляем переменную _ .
        let _ = std::fs::rename(path, previous);
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Write for RotatingFile {
    // Объявляем функцию write.
    fn write(&mut self, buffer: &[u8]) -> io::Result<usize> {
        // Объявляем переменную path .
        let path = self.path.lock().ok().and_then(|guard| guard.clone());

        // Проверяем условие: let Some(path) = path {.
        if let Some(path) = path {
            // Выполняем операцию: Self::rotate(&path, self.max_bytes);.
            Self::rotate(&path, self.max_bytes);

            // Проверяем условие: let Ok(mut file) = OpenOptions::new().create(true).
            if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&path) {
                // В журнал безопасности не попадают ключи и пароли:
                // файл пользователи прикладывают к отчётам об ошибках.
                // Объявляем переменную text .
                let text = String::from_utf8_lossy(buffer);
                // Объявляем переменную _ .
                let _ = file.write_all(sanitize_log_message(&text).as_bytes());
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Выполняем операцию: Ok(buffer.len()).
        Ok(buffer.len())
        // Закрываем блок.
    }

    // Объявляем функцию flush.
    fn flush(&mut self) -> io::Result<()> {
        // Выполняем операцию: Ok(()).
        Ok(())
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Открываем реализацию типа.
impl<'a> MakeWriter<'a> for RotatingFile {
    // Выполняем операцию: type Writer = RotatingFile;.
    type Writer = RotatingFile;

    // Объявляем функцию make_writer.
    fn make_writer(&'a self) -> Self::Writer {
        // Выполняем операцию: RotatingFile {.
        RotatingFile {
            // Выполняем операцию: path: Mutex::new(self.path.lock().ok().and_then(|guard|.
            path: Mutex::new(self.path.lock().ok().and_then(|guard| guard.clone())),
            // Выполняем операцию: max_bytes: self.max_bytes,.
            max_bytes: self.max_bytes,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию security_path.
fn security_path() -> Option<PathBuf> {
    // Объявляем переменную dir .
    let dir = app_log_dir().ok()?;
    // Выполняем операцию: std::fs::create_dir_all(&dir).ok()?;.
    std::fs::create_dir_all(&dir).ok()?;

    // Выполняем операцию: Some(dir.join("security.log")).
    Some(dir.join("security.log"))
    // Закрываем блок.
}

// Объявляем функцию app_path.
fn app_path() -> Option<PathBuf> {
    // Объявляем переменную dir .
    let dir = app_log_dir().ok()?;
    // Выполняем операцию: std::fs::create_dir_all(&dir).ok()?;.
    std::fs::create_dir_all(&dir).ok()?;

    // Выполняем операцию: Some(dir.join("app.log")).
    Some(dir.join("app.log"))
    // Закрываем блок.
}

// Объявляем функцию init.
pub fn init() {
    // Уровни info/warn/error; RUST_LOG позволяет временно включить debug.
    // Объявляем переменную filter .
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    // Объявляем переменную app_layer .
    let app_layer = app_path().map(|path| {
        // Выполняем операцию: fmt::layer().
        fmt::layer()
            // Выполняем операцию: .with_ansi(false).
            .with_ansi(false)
            // Выполняем операцию: .with_target(true).
            .with_target(true)
            // Выполняем операцию: .with_writer(RotatingFile::writer(path, MAX_APP_LOG_BYT.
            .with_writer(RotatingFile::writer(path, MAX_APP_LOG_BYTES))
            // В файл пишем только info/warn/error, независимо от RUST_LOG.
            // Выполняем операцию: .with_filter(EnvFilter::new("info")).
            .with_filter(EnvFilter::new("info"))
        // Закрываем блок.
    });

    // Объявляем переменную security_layer .
    let security_layer = security_path().map(|path| {
        // Выполняем операцию: fmt::layer().
        fmt::layer()
            // Выполняем операцию: .with_ansi(false).
            .with_ansi(false)
            // Выполняем операцию: .with_target(true).
            .with_target(true)
            // Выполняем операцию: .with_writer(RotatingFile::writer(path, MAX_SECURITY_LO.
            .with_writer(RotatingFile::writer(path, MAX_SECURITY_LOG_BYTES))
            // Выполняем операцию: .with_filter(EnvFilter::new(SECURITY_TARGET)).
            .with_filter(EnvFilter::new(SECURITY_TARGET))
        // Закрываем блок.
    });

    // Выполняем операцию: tracing_subscriber::registry().
    tracing_subscriber::registry()
        // Выполняем операцию: .with(filter).
        .with(filter)
        // Выполняем операцию: .with(fmt::layer().with_target(true)).
        .with(fmt::layer().with_target(true))
        // Выполняем операцию: .with(app_layer).
        .with(app_layer)
        // Выполняем операцию: .with(security_layer).
        .with(security_layer)
        // Выполняем операцию: .init();.
        .init();

    // Выполняем операцию: tracing::info!("Логирование инициализировано");.
    tracing::info!("Логирование инициализировано");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Объявляем функцию temp_log.
    fn temp_log(name: &str) -> PathBuf {
        // Выполняем операцию: std::env::temp_dir().join(format!("zapret-sec-{name}.lo.
        std::env::temp_dir().join(format!("zapret-sec-{name}.log"))
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию security_file_appends_lines.
    fn security_file_appends_lines() {
        // Объявляем переменную path .
        let path = temp_log("append");
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&path);

        // Выполняем операцию: {.
        {
            // Объявляем переменную writer .
            let mut writer = RotatingFile::writer(path.clone(), MAX_SECURITY_LOG_BYTES);
            // Объявляем переменную _ .
            let _ = writer.write_all(b"security event one\n");
            // Объявляем переменную _ .
            let _ = writer.write_all(b"security event two\n");
            // Закрываем блок.
        }

        // Объявляем переменную content .
        let content = std::fs::read_to_string(&path).expect("лог создан");
        // Выполняем операцию: assert!(content.contains("security event one"));.
        assert!(content.contains("security event one"));
        // Выполняем операцию: assert!(content.contains("security event two"));.
        assert!(content.contains("security event two"));

        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&path);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию security_file_rotates_when_large.
    fn security_file_rotates_when_large() {
        // Объявляем переменную path .
        let path = temp_log("rotate");
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&path);
        // Выполняем операцию: std::fs::write(&path, vec![b'x'; 2 * 1024 * 1024]).expe.
        std::fs::write(&path, vec![b'x'; 2 * 1024 * 1024]).expect(" большой лог");

        // Объявляем переменную writer .
        let mut writer = RotatingFile::writer(path.clone(), MAX_SECURITY_LOG_BYTES);
        // Объявляем переменную _ .
        let _ = writer.write_all(b"after rotation\n");

        // Объявляем переменную rotated .
        let rotated = path.with_extension("log.1");
        // Выполняем операцию: assert!(rotated.exists(), "ротация не выполнена");.
        assert!(rotated.exists(), "ротация не выполнена");
        // Выполняем операцию: assert!(std::fs::read_to_string(&path).
        assert!(std::fs::read_to_string(&path)
            // Выполняем операцию: .expect("новый лог").
            .expect("новый лог")
            // Выполняем операцию: .contains("after rotation"));.
            .contains("after rotation"));

        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&path);
        // Объявляем переменную _ .
        let _ = std::fs::remove_file(&rotated);
        // Закрываем блок.
    }
    // Закрываем блок.
}
