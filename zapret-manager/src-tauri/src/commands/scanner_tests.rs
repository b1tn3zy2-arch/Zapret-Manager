use std::fs;
use std::path::PathBuf;

use super::*;

fn temp_dir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("zapret-scanner-{name}"));
    let _ = fs::remove_dir_all(&dir);
    fs::create_dir_all(&dir).expect("создать временную папку");
    dir
}

#[tokio::test]
async fn test_scan_empty_folder() {
    let dir = temp_dir("empty");

    let result = scan_folder(&dir.to_string_lossy(), &crate::commands::runner::ScanState::default())
        .await
        .expect("пустая папка не ошибка");

    assert!(result.is_empty());
    let _ = fs::remove_dir_all(&dir);
}

#[tokio::test]
async fn test_scan_nonexistent_folder() {
    let result = scan_folder(
        r"C:\нет-такой-папки-12345",
        &crate::commands::runner::ScanState::default(),
    )
    .await;

    assert!(result.is_err());
}

#[tokio::test]
async fn test_scan_skips_service_bat_and_non_utf8() {
    let dir = temp_dir("mixed");
    fs::write(
        dir.join("general.bat"),
        "@echo off\nchcp 65001 > nul\n:: описание\nstart winws.exe --dpi-desync=fake\n",
    )
    .expect("записать general.bat");
    fs::write(dir.join("service.bat"), "@echo off\n").expect("записать service.bat");
    fs::write(dir.join("notes.txt"), "не стратегия").expect("записать notes.txt");
    fs::write(dir.join("broken.bat"), [0xff, 0xfe, 0x00, 0x01])
        .expect("записать broken.bat");

    let result = scan_folder(&dir.to_string_lossy(), &crate::commands::runner::ScanState::default())
        .await
        .expect("сканирование папки");

    assert_eq!(result.len(), 1);
    assert_eq!(result[0].filename, "general.bat");
    assert_eq!(result[0].name, "General");
    assert_eq!(result[0].description, "описание");
    assert_eq!(result[0].file_type, "winws");
    assert_eq!(result[0].status, "idle");
    assert_eq!(result[0].services, vec!["general".to_string()]);

    let _ = fs::remove_dir_all(&dir);
}

#[tokio::test]
async fn test_scan_sorts_by_filename() {
    let dir = temp_dir("sorted");

    for name in ["general (ALT2).bat", "general (ALT).bat", "general.bat"] {
        fs::write(dir.join(name), "start winws.exe\n").expect("записать файл");
    }

    let result = scan_folder(&dir.to_string_lossy(), &crate::commands::runner::ScanState::default())
        .await
        .expect("сканирование папки");

    let names: Vec<&str> = result
        .iter()
        .map(|item| item.filename.as_str())
        .collect();

    assert_eq!(
        names,
        vec!["general (ALT).bat", "general (ALT2).bat", "general.bat"]
    );

    let _ = fs::remove_dir_all(&dir);
}