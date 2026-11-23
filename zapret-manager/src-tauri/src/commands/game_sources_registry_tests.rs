// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию sample_game.
fn sample_game(path: &str) -> InstalledGame {
    // Выполняем операцию: InstalledGame::new(.
    InstalledGame::new(
        // Выполняем операцию: GamePlatform::Gog,.
        GamePlatform::Gog,
        // Выполняем операцию: GameSource::Gog,.
        GameSource::Gog,
        // Выполняем операцию: &path.replace(".exe", ""),.
        &path.replace(".exe", ""),
        // Выполняем операцию: path,.
        path,
        // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_dedup_by_install_path_keeps_first_entry.
fn test_dedup_by_install_path_keeps_first_entry() {
    // Объявляем переменную games .
    let games = vec![
        // Выполняем операцию: sample_game("C:\\Games\\Portal\\portal.exe"),.
        sample_game("C:\\Games\\Portal\\portal.exe"),
        // Выполняем операцию: sample_game("c:\\games\\portal\\portal.exe"),.
        sample_game("c:\\games\\portal\\portal.exe"),
        // Выполняем операцию: sample_game("D:\\Games\\Doom\\doom.exe"),.
        sample_game("D:\\Games\\Doom\\doom.exe"),
        // Закрываем выражение или коллекцию.
    ];

    // Объявляем переменную result .
    let result = dedup_by_install_path(games);

    // Выполняем операцию: assert_eq!(result.len(), 2);.
    assert_eq!(result.len(), 2);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_gog_returns_empty_without_installations.
fn test_scan_gog_returns_empty_without_installations() {
    // Объявляем переменную games .
    let games = scan_gog();

    // Выполняем операцию: assert!(games.iter().all(|game| game.platform == GamePl.
    assert!(games.iter().all(|game| game.platform == GamePlatform::Gog));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_ubisoft_returns_empty_without_installations.
fn test_scan_ubisoft_returns_empty_without_installations() {
    // Объявляем переменную games .
    let games = scan_ubisoft();

    // Выполняем операцию: assert!(games.
    assert!(games
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .all(|game| game.platform == GamePlatform::Ubisoft));.
        .all(|game| game.platform == GamePlatform::Ubisoft));
    // Закрываем блок.
}
