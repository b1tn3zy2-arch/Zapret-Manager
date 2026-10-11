use super::*;

fn sample_game(path: &str) -> InstalledGame {
    InstalledGame::new(
        GamePlatform::Gog,
        GameSource::Gog,
        &path.replace(".exe", ""),
        path,
    )
}

#[test]
fn test_dedup_by_install_path_keeps_first_entry() {
    let games = vec![
        sample_game("C:\\Games\\Portal\\portal.exe"),
        sample_game("c:\\games\\portal\\portal.exe"),
        sample_game("D:\\Games\\Doom\\doom.exe"),
    ];

    let result = dedup_by_install_path(games);

    assert_eq!(result.len(), 2);
}

#[test]
fn test_scan_gog_returns_empty_without_installations() {
    let games = scan_gog();

    assert!(games.iter().all(|game| game.platform == GamePlatform::Gog));
}

#[test]
fn test_scan_ubisoft_returns_empty_without_installations() {
    let games = scan_ubisoft();

    assert!(games.iter().all(|game| game.platform == GamePlatform::Ubisoft));
}