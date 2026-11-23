// Подключаем модули: std::fs;.
use std::fs;
// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-scanner-{name}"));
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Выполняем операцию: fs::create_dir_all(&dir).expect("создать временную папк.
    fs::create_dir_all(&dir).expect("создать временную папку");
    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_scan_empty_folder.
async fn test_scan_empty_folder() {
    // Объявляем переменную dir .
    let dir = temp_dir("empty");

    // Объявляем переменную result .
    let result = scan_folder(
        // Выполняем операцию: &dir.to_string_lossy(),.
        &dir.to_string_lossy(),
        // Выполняем операцию: &crate::commands::runner::ScanState::default(),.
        &crate::commands::runner::ScanState::default(),
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect("пустая папка не ошибка");.
    .expect("пустая папка не ошибка");

    // Выполняем операцию: assert!(result.is_empty());.
    assert!(result.is_empty());
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_scan_nonexistent_folder.
async fn test_scan_nonexistent_folder() {
    // Объявляем переменную result .
    let result = scan_folder(
        // Выполняем операцию: r"C:\нет-такой-папки-12345",.
        r"C:\нет-такой-папки-12345",
        // Выполняем операцию: &crate::commands::runner::ScanState::default(),.
        &crate::commands::runner::ScanState::default(),
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await;.
    .await;

    // Выполняем операцию: assert!(result.is_err());.
    assert!(result.is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_scan_skips_service_bat_and_non_utf8.
async fn test_scan_skips_service_bat_and_non_utf8() {
    // Объявляем переменную dir .
    let dir = temp_dir("mixed");
    // Выполняем операцию: fs::write(.
    fs::write(
        // Выполняем операцию: dir.join("general.bat"),.
        dir.join("general.bat"),
        // Выполняем операцию: "@echo off\nchcp 65001 > nul\n:: описание\nstart winws..
        "@echo off\nchcp 65001 > nul\n:: описание\nstart winws.exe --dpi-desync=fake\n",
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .expect("записать general.bat");.
    .expect("записать general.bat");
    // Выполняем операцию: fs::write(dir.join("service.bat"), "@echo off\n").expec.
    fs::write(dir.join("service.bat"), "@echo off\n").expect("записать service.bat");
    // Выполняем операцию: fs::write(dir.join("notes.txt"), "не стратегия").expect.
    fs::write(dir.join("notes.txt"), "не стратегия").expect("записать notes.txt");
    // Выполняем операцию: fs::write(dir.join("broken.bat"), [0xff, 0xfe, 0x00, 0x.
    fs::write(dir.join("broken.bat"), [0xff, 0xfe, 0x00, 0x01]).expect("записать broken.bat");

    // Объявляем переменную result .
    let result = scan_folder(
        // Выполняем операцию: &dir.to_string_lossy(),.
        &dir.to_string_lossy(),
        // Выполняем операцию: &crate::commands::runner::ScanState::default(),.
        &crate::commands::runner::ScanState::default(),
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect("сканирование папки");.
    .expect("сканирование папки");

    // Выполняем операцию: assert_eq!(result.len(), 1);.
    assert_eq!(result.len(), 1);
    // Выполняем операцию: assert_eq!(result[0].filename, "general.bat");.
    assert_eq!(result[0].filename, "general.bat");
    // Выполняем операцию: assert_eq!(result[0].name, "General");.
    assert_eq!(result[0].name, "General");
    // Выполняем операцию: assert_eq!(result[0].description, "описание");.
    assert_eq!(result[0].description, "описание");
    // Выполняем операцию: assert_eq!(result[0].file_type, "winws");.
    assert_eq!(result[0].file_type, "winws");
    // Выполняем операцию: assert_eq!(result[0].status, "idle");.
    assert_eq!(result[0].status, "idle");
    // Выполняем операцию: assert_eq!(result[0].services, vec!["general".to_string.
    assert_eq!(result[0].services, vec!["general".to_string()]);

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[tokio::test]
// Объявляем функцию test_scan_sorts_by_filename.
async fn test_scan_sorts_by_filename() {
    // Объявляем переменную dir .
    let dir = temp_dir("sorted");

    // Перебираем элементы коллекции.
    for name in ["general (ALT2).bat", "general (ALT).bat", "general.bat"] {
        // Выполняем операцию: fs::write(dir.join(name), "start winws.exe\n").expect(".
        fs::write(dir.join(name), "start winws.exe\n").expect("записать файл");
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let result = scan_folder(
        // Выполняем операцию: &dir.to_string_lossy(),.
        &dir.to_string_lossy(),
        // Выполняем операцию: &crate::commands::runner::ScanState::default(),.
        &crate::commands::runner::ScanState::default(),
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .await.
    .await
    // Выполняем операцию: .expect("сканирование папки");.
    .expect("сканирование папки");

    // Объявляем переменную names.
    let names: Vec<&str> = result.iter().map(|item| item.filename.as_str()).collect();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: names,.
        names,
        // Выполняем операцию: vec!["general (ALT).bat", "general (ALT2).bat", "genera.
        vec!["general (ALT).bat", "general (ALT2).bat", "general.bat"] // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&dir);
    // Закрываем блок.
}
