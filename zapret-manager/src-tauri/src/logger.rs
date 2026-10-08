use std::fs::OpenOptions;
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use tracing_subscriber::{
    fmt,
    fmt::MakeWriter,
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter, Layer,
};

use crate::security::{app_log_dir, SECURITY_TARGET};

const MAX_SECURITY_LOG_BYTES: u64 = 1024 * 1024;

pub struct SecurityFile {
    path: Mutex<Option<PathBuf>>,
}

impl SecurityFile {
    pub fn writer(path: PathBuf) -> Self {
        Self {
            path: Mutex::new(Some(path)),
        }
    }

    fn rotate(path: &Path) {
        let Ok(metadata) = std::fs::metadata(path) else {
            return;
        };

        if metadata.len() < MAX_SECURITY_LOG_BYTES {
            return;
        }

        let previous = path.with_extension("log.1");
        let _ = std::fs::remove_file(&previous);
        let _ = std::fs::rename(path, previous);
    }
}

impl Write for SecurityFile {
    fn write(&mut self, buffer: &[u8]) -> io::Result<usize> {
        let path = self.path.lock().ok().and_then(|guard| guard.clone());

        if let Some(path) = path {
            Self::rotate(&path);

            if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(&path) {
                let _ = file.write_all(buffer);
            }
        }

        Ok(buffer.len())
    }

    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }
}

impl<'a> MakeWriter<'a> for SecurityFile {
    type Writer = SecurityFile;

    fn make_writer(&'a self) -> Self::Writer {
        SecurityFile {
            path: Mutex::new(self.path.lock().ok().and_then(|guard| guard.clone())),
        }
    }
}

fn security_path() -> Option<PathBuf> {
    let dir = app_log_dir().ok()?;
    std::fs::create_dir_all(&dir).ok()?;

    Some(dir.join("security.log"))
}

pub fn init() {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info,zapret_manager=debug"));

    let security_layer = security_path().map(|path| {
        fmt::layer()
            .with_ansi(false)
            .with_target(true)
            .with_writer(SecurityFile::writer(path))
            .with_filter(EnvFilter::new(SECURITY_TARGET))
    });

    match security_layer {
        Some(layer) => tracing_subscriber::registry()
            .with(fmt::layer().with_target(true))
            .with(filter)
            .with(layer)
            .init(),
        None => tracing_subscriber::registry()
            .with(fmt::layer().with_target(true))
            .with(filter)
            .init(),
    }

    tracing::info!("Логирование инициализировано");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_log(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!("zapret-sec-{name}.log"))
    }

    #[test]
    fn security_file_appends_lines() {
        let path = temp_log("append");
        let _ = std::fs::remove_file(&path);

        {
            let mut writer = SecurityFile::writer(path.clone());
            let _ = writer.write_all(b"security event one\n");
            let _ = writer.write_all(b"security event two\n");
        }

        let content = std::fs::read_to_string(&path).expect("лог создан");
        assert!(content.contains("security event one"));
        assert!(content.contains("security event two"));

        let _ = std::fs::remove_file(&path);
    }

    #[test]
    fn security_file_rotates_when_large() {
        let path = temp_log("rotate");
        let _ = std::fs::remove_file(&path);
        std::fs::write(&path, vec![b'x'; 2 * 1024 * 1024]).expect(" большой лог");

        let mut writer = SecurityFile::writer(path.clone());
        let _ = writer.write_all(b"after rotation\n");

        let rotated = path.with_extension("log.1");
        assert!(rotated.exists(), "ротация не выполнена");
        assert!(std::fs::read_to_string(&path)
            .expect("новый лог")
            .contains("after rotation"));

        let _ = std::fs::remove_file(&path);
        let _ = std::fs::remove_file(&rotated);
    }
}
