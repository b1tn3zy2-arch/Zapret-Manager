use super::*;
use std::path::PathBuf;

struct Sandbox {
    root: PathBuf,
}

impl Sandbox {
    fn new(name: &str) -> Self {
        let root = std::env::temp_dir().join(format!("zapret-files-{name}"));
        let _ = std::fs::remove_dir_all(&root);
        std::fs::create_dir_all(&root).expect("sandbox");

        Self { root }
    }
}

impl Drop for Sandbox {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.root);
    }
}

#[test]
fn text_extensions_checked() {
    assert!(is_text_extension(Path::new("C:/x/config.conf")));
    assert!(is_text_extension(Path::new("C:/x/out.log")));
    assert!(!is_text_extension(Path::new("C:/x/run.bat")));
    assert!(!is_text_extension(Path::new("C:/x/noext")));
}

#[test]
fn relative_path_rejected() {
    assert!(validated_text_path("config.json").is_err());
    assert!(validated_text_path("sub\\config.json").is_err());
}

#[test]
fn forbidden_extension_rejected() {
    assert!(validated_text_path("C:/temp/evil.bat").is_err());
    assert!(validated_text_path("C:/temp/evil.exe").is_err());
}

#[test]
fn valid_path_accepted() {
    assert!(validated_text_path("C:/temp/zapret/config.json").is_ok());
}

#[test]
fn write_rejects_oversized_content() {
    let sandbox = Sandbox::new("size");
    let target = sandbox.root.join("out.json");

    let payload = "a".repeat(MAX_TEXT_FILE_BYTES as usize + 1);

    assert!(write_user_text_file(target.to_string_lossy().to_string(), payload).is_err());
}
