// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::game_model::{GamePlatform, GameSource}.
use crate::commands::game_model::{GamePlatform, GameSource};

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_excluded_name_matches_installers_and_uninstallers.
fn test_is_excluded_name_matches_installers_and_uninstallers() {
    // Выполняем операцию: assert!(is_excluded_name("uninstall.exe"));.
    assert!(is_excluded_name("uninstall.exe"));
    // Выполняем операцию: assert!(is_excluded_name("Setup.exe"));.
    assert!(is_excluded_name("Setup.exe"));
    // Выполняем операцию: assert!(is_excluded_name("vcredist_x64.exe"));.
    assert!(is_excluded_name("vcredist_x64.exe"));
    // Выполняем операцию: assert!(is_excluded_name("crashpad_handler.exe"));.
    assert!(is_excluded_name("crashpad_handler.exe"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_excluded_name_keeps_real_games.
fn test_is_excluded_name_keeps_real_games() {
    // Выполняем операцию: assert!(!is_excluded_name("game.exe"));.
    assert!(!is_excluded_name("game.exe"));
    // Выполняем операцию: assert!(!is_excluded_name("portal.exe"));.
    assert!(!is_excluded_name("portal.exe"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_excluded_path_skips_stores_and_system.
fn test_is_excluded_path_skips_stores_and_system() {
    // Выполняем операцию: assert!(is_excluded_path(Path::new(.
    assert!(is_excluded_path(Path::new(
        // Выполняем операцию: "D:\\Steam\\steamapps\\downloading\\x".
        "D:\\Steam\\steamapps\\downloading\\x" // Закрываем выражение или коллекцию.
    )));
    // Выполняем операцию: assert!(is_excluded_path(Path::new(.
    assert!(is_excluded_path(Path::new(
        // Выполняем операцию: "C:\\Program Files\\Epic Games\\Launcher\\Portal".
        "C:\\Program Files\\Epic Games\\Launcher\\Portal" // Закрываем выражение или коллекцию.
    )));
    // Выполняем операцию: assert!(!is_excluded_path(Path::new("D:\\Games\\Portal".
    assert!(!is_excluded_path(Path::new("D:\\Games\\Portal")));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_compare_quality_prefers_entry_with_appid.
fn test_compare_quality_prefers_entry_with_appid() {
    // Объявляем переменную plain .
    let mut plain = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::KnownFolder,.
        GameSource::KnownFolder,
        // Выполняем операцию: "C:\\Games\\Portal",.
        "C:\\Games\\Portal",
        // Выполняем операцию: "C:\\Games\\Portal\\portal.exe",.
        "C:\\Games\\Portal\\portal.exe",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную rich .
    let mut rich = plain.clone();

    // Выполняем операцию: rich.appid = Some("620".to_string());.
    rich.appid = Some("620".to_string());

    // Выполняем операцию: assert!(compare_quality(&rich, &plain).is_gt());.
    assert!(compare_quality(&rich, &plain).is_gt());
    // Выполняем операцию: plain.appid = Some("999".to_string());.
    plain.appid = Some("999".to_string());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_compare_quality_prefers_precise_source.
fn test_compare_quality_prefers_precise_source() {
    // Объявляем переменную folder .
    let folder = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::KnownFolder,.
        GameSource::KnownFolder,
        // Выполняем операцию: "C:\\Games\\Portal",.
        "C:\\Games\\Portal",
        // Выполняем операцию: "C:\\Games\\Portal\\portal.exe",.
        "C:\\Games\\Portal\\portal.exe",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную steam .
    let steam = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Steam,.
        GamePlatform::Steam,
        // Выполняем операцию: GameSource::Steam,.
        GameSource::Steam,
        // Выполняем операцию: "D:\\SteamLibrary\\Portal",.
        "D:\\SteamLibrary\\Portal",
        // Выполняем операцию: "D:\\SteamLibrary\\Portal\\portal.exe",.
        "D:\\SteamLibrary\\Portal\\portal.exe",
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(compare_quality(&steam, &folder).is_gt());.
    assert!(compare_quality(&steam, &folder).is_gt());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_games_dedupes_by_executable_path.
fn test_merge_games_dedupes_by_executable_path() {
    // Объявляем переменную first .
    let first = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::KnownFolder,.
        GameSource::KnownFolder,
        // Выполняем операцию: "C:\\Games\\Portal",.
        "C:\\Games\\Portal",
        // Выполняем операцию: "c:\\games\\portal\\PORTAL.exe",.
        "c:\\games\\portal\\PORTAL.exe",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную second .
    let mut second = first.clone();

    // Выполняем операцию: second.appid = Some("620".to_string());.
    second.appid = Some("620".to_string());
    // Выполняем операцию: second.platform = GamePlatform::Steam;.
    second.platform = GamePlatform::Steam;
    // Выполняем операцию: second.source = GameSource::Steam;.
    second.source = GameSource::Steam;

    // Объявляем переменную merged .
    let merged = merge_games(vec![first, second]);

    // Выполняем операцию: assert_eq!(merged.len(), 1);.
    assert_eq!(merged.len(), 1);
    // Выполняем операцию: assert_eq!(merged[0].appid.as_deref(), Some("620"));.
    assert_eq!(merged[0].appid.as_deref(), Some("620"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_games_treats_registry_slashes_as_same_path.
fn test_merge_games_treats_registry_slashes_as_same_path() {
    // Реестр описывает путь прямым слешем, сканер папок — обратным:
    // без нормализации одна и та же игра проходила двойной карточкой,
    // и карточка без appid заслоняла Steam-вариант с обложкой.
    // Объявляем переменную registry .
    let registry = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::Registry,.
        GameSource::Registry,
        // Выполняем операцию: "c:/games/dash",.
        "c:/games/dash",
        // Выполняем операцию: "c:/games/dash/GeometryDash.exe",.
        "c:/games/dash/GeometryDash.exe",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную steam .
    let mut steam = registry.clone();

    // Выполняем операцию: steam.source = GameSource::Steam;.
    steam.source = GameSource::Steam;
    // Выполняем операцию: steam.appid = Some("322170".to_string());.
    steam.appid = Some("322170".to_string());

    // Объявляем переменную merged .
    let merged = merge_games(vec![registry, steam]);

    // Выполняем операцию: assert_eq!(merged.len(), 1);.
    assert_eq!(merged.len(), 1);
    // Выполняем операцию: assert_eq!(merged[0].source, GameSource::Steam);.
    assert_eq!(merged[0].source, GameSource::Steam);
    // Выполняем операцию: assert_eq!(merged[0].appid.as_deref(), Some("322170"));.
    assert_eq!(merged[0].appid.as_deref(), Some("322170"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_relaxed_executable_skips_crash_handlers.
fn test_relaxed_executable_skips_crash_handlers() {
    // UnityCrashHandler64.exe просачивался репаковскими папками:
    // редактор краша игры — не игра.
    // Объявляем переменную folder .
    let folder = std::env::temp_dir().join("zapret-heuristics-crash");
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(&folder);
    // Объявляем переменную path .
    let path = folder.join("UnityCrashHandler64.exe");

    // Объявляем переменную _ .
    let _ = std::fs::File::create(&path).and_then(|file| file.set_len(TRUSTED_MIN_BYTES * 2));

    // Выполняем операцию: assert!(!is_relaxed_executable(&path));.
    assert!(!is_relaxed_executable(&path));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_relaxed_executable_skips_epic_bootstrapper.
fn test_relaxed_executable_skips_epic_bootstrapper() {
    // В распакованных Epic-играх рядом с настоящим exe лежит
    // EOSBootstrapper.exe: заглушка лаунчера — не игра.
    // Объявляем переменную folder .
    let folder = std::env::temp_dir().join("zapret-heuristics-eos");
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(&folder);
    // Объявляем переменную path .
    let path = folder.join("EOSBootstrapper.exe");

    // Объявляем переменную _ .
    let _ = std::fs::File::create(&path).and_then(|file| file.set_len(TRUSTED_MIN_BYTES * 2));

    // Выполняем операцию: assert!(!is_relaxed_executable(&path));.
    assert!(!is_relaxed_executable(&path));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_merge_games_sorts_by_name.
fn test_merge_games_sorts_by_name() {
    // Объявляем переменную first .
    let first = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::KnownFolder,.
        GameSource::KnownFolder,
        // Выполняем операцию: "C:\\Games\\Zeta",.
        "C:\\Games\\Zeta",
        // Выполняем операцию: "C:\\Games\\Zeta\\zeta.exe",.
        "C:\\Games\\Zeta\\zeta.exe",
        // Закрываем выражение или коллекцию.
    );
    // Объявляем переменную second .
    let second = InstalledGame::new(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::KnownFolder,.
        GameSource::KnownFolder,
        // Выполняем операцию: "C:\\Games\\Alpha",.
        "C:\\Games\\Alpha",
        // Выполняем операцию: "C:\\Games\\Alpha\\alpha.exe",.
        "C:\\Games\\Alpha\\alpha.exe",
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную merged .
    let merged = merge_games(vec![first, second]);

    // Выполняем операцию: assert_eq!(merged[0].name, "Alpha");.
    assert_eq!(merged[0].name, "Alpha");
    // Выполняем операцию: assert_eq!(merged[1].name, "Zeta");.
    assert_eq!(merged[1].name, "Zeta");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_candidates_on_missing_folder_is_empty.
fn test_collect_candidates_on_missing_folder_is_empty() {
    // Объявляем переменную missing .
    let missing = PathBuf::from("C:\\definitely\\missing\\folder");

    // Выполняем операцию: assert!(collect_candidates(&missing, 2).is_empty());.
    assert!(collect_candidates(&missing, 2).is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_candidates_skips_small_executables.
fn test_collect_candidates_skips_small_executables() {
    // Объявляем переменную folder .
    let folder = std::env::temp_dir().join("zapret-heuristics-test");
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(&folder);
    // Объявляем переменную _ .
    let _ = std::fs::write(folder.join("tiny.exe"), b"x");

    // Объявляем переменную candidates .
    let candidates = collect_candidates(&folder, 2);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);

    // Выполняем операцию: assert!(candidates.is_empty());.
    assert!(candidates.is_empty());
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_candidates_accepts_small_unity_launcher.
fn test_collect_candidates_accepts_small_unity_launcher() {
    // The Long Dark: в корне лежит tld.exe на 0.6 МБ и папка tld_Data.
    // Раньше такой exe отбрасывался по порогу размера, и игра не находилась.
    // Объявляем переменную folder .
    let folder = std::env::temp_dir().join("zapret-unity-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(folder.join("tld_Data"));
    // Объявляем переменную _ .
    let _ = std::fs::write(folder.join("tld.exe"), vec![0_u8; 2 * 1024 * 1024]);

    // Объявляем переменную candidates .
    let candidates = collect_candidates(&folder, 2);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: candidates.len(),.
        candidates.len(),
        // Выполняем операцию: 1,.
        1,
        // Выполняем операцию: "Unity-игра с маленьким exe должна находиться".
        "Unity-игра с маленьким exe должна находиться" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(candidates[0].ends_with("tld.exe"));.
    assert!(candidates[0].ends_with("tld.exe"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_collect_candidates_still_skips_small_exe_without_unity_folder.
fn test_collect_candidates_still_skips_small_exe_without_unity_folder() {
    // Объявляем переменную folder .
    let folder = std::env::temp_dir().join("zapret-plain-test");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);
    // Объявляем переменную _ .
    let _ = std::fs::create_dir_all(&folder);
    // Объявляем переменную _ .
    let _ = std::fs::write(folder.join("tool.exe"), vec![0_u8; 2 * 1024 * 1024]);

    // Объявляем переменную candidates .
    let candidates = collect_candidates(&folder, 2);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&folder);

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: candidates.is_empty(),.
        candidates.is_empty(),
        // Выполняем операцию: "мелкий exe без признаков игры — это не игра".
        "мелкий exe без признаков игры — это не игра" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}
