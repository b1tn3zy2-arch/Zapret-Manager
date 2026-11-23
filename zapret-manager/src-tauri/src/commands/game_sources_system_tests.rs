// Подключаем модули: std::fs;.
use std::fs;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: super::super::game_heuristics;.
use super::super::game_heuristics;

// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию temp_root.
fn temp_root(name: &str) -> PathBuf {
    // Объявляем переменную root .
    let root = std::env::temp_dir().join(name);

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);
    // Выполняем операцию: fs::create_dir_all(&root).unwrap_or_else(|error| panic!.
    fs::create_dir_all(&root).unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: root.
    root
    // Закрываем блок.
}

/// Корень вне AppData: temp_dir в Windows лежит внутри AppData, а для
/// проверок программных корней нужна папка, где AppData-отказ не сработает.
// Объявляем функцию build_root.
fn build_root(name: &str) -> PathBuf {
    // Объявляем переменную root .
    let root = Path::new(env!("CARGO_MANIFEST_DIR"))
        // Выполняем операцию: .join("target").
        .join("target")
        // Выполняем операцию: .join("test-tmp").
        .join("test-tmp")
        // Выполняем операцию: .join(name);.
        .join(name);

    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&root);
    // Выполняем операцию: fs::create_dir_all(&root).unwrap_or_else(|error| panic!.
    fs::create_dir_all(&root).unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: root.
    root
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_known_folders_include_program_files.
fn test_known_folders_include_program_files() {
    // Объявляем переменную folders .
    let folders = known_folders();

    // Выполняем операцию: assert!(folders.iter().any(|path| path.ends_with("Progr.
    assert!(folders.iter().any(|path| path.ends_with("Program Files")));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_folder_on_missing_path_is_empty.
fn test_scan_folder_on_missing_path_is_empty() {
    // Объявляем переменную games .
    let games = scan_folder(Path::new("C:\\definitely\\missing"), GameSource::UserFolder);

    // Выполняем операцию: assert!(games.is_empty());.
    assert!(games.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_user_folders_skips_blank_entries.
fn test_scan_user_folders_skips_blank_entries() {
    // Объявляем переменную games .
    let games = scan_user_folders(&["".to_string(), "   ".to_string()]);

    // Выполняем операцию: assert!(games.is_empty());.
    assert!(games.is_empty());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_scan_game_root_prefers_named_exe_over_bootstrapper.
fn test_scan_game_root_prefers_named_exe_over_bootstrapper() {
    // Распакованная Unity-игра: лаунчер весит меньше мегабайта, рядом
    // лежит _Data и заглушка Epic. Подбор по сродству имени берёт
    // настоящий exe, а не загрузчик лаунчера.
    // Объявляем переменную base .
    let base = build_root("zapret-root-nomad");
    // Объявляем переменную root .
    let root = base.join("Nomad Drive");

    // Выполняем операцию: fs::create_dir_all(&root).unwrap_or_else(|error| panic!.
    fs::create_dir_all(&root).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: fs::create_dir_all(base.join("Nomad Drive_BurstDebugInf.
    fs::create_dir_all(base.join("Nomad Drive_BurstDebugInformation_DoNotShip"))
        // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
        .unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: fs::File::create(root.join("EOSBootstrapper.exe")).
    fs::File::create(root.join("EOSBootstrapper.exe"))
        // Выполняем операцию: .and_then(|file| file.set_len(game_heuristics::TRUSTED_.
        .and_then(|file| file.set_len(game_heuristics::TRUSTED_MIN_BYTES * 3))
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();
    // Выполняем операцию: fs::File::create(root.join("UnityCrashHandler64.exe")).
    fs::File::create(root.join("UnityCrashHandler64.exe"))
        // Выполняем операцию: .and_then(|file| file.set_len(game_heuristics::TRUSTED_.
        .and_then(|file| file.set_len(game_heuristics::TRUSTED_MIN_BYTES * 2))
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Объявляем переменную launcher .
    let launcher = root.join("Nomad Drive.exe");

    // Выполняем операцию: fs::File::create(&launcher).
    fs::File::create(&launcher)
        // Выполняем операцию: .and_then(|file| file.set_len(600 * 1024)).
        .and_then(|file| file.set_len(600 * 1024))
        // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
        .unwrap_or_else(|error| panic!("{error}"));

    // Объявляем переменную games .
    let games = scan_game_root(&root);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&base);

    // Выполняем операцию: assert_eq!(games.len(), 1);.
    assert_eq!(games.len(), 1);
    // Выполняем операцию: assert_eq!(games[0].name, "Nomad Drive");.
    assert_eq!(games[0].name, "Nomad Drive");
    // Выполняем операцию: assert!(games[0].executable_path.ends_with("Nomad Drive.
    assert!(games[0].executable_path.ends_with("Nomad Drive.exe"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_rejects_non_game_names.
fn test_registry_game_rejects_non_game_names() {
    // Объявляем переменную folder .
    let folder = temp_root("zapret-registry-reject");

    // Объявляем переменную entry .
    let entry = super::super::game_registry::UninstallEntry {
        // Выполняем операцию: display_name: "NVIDIA Graphics Driver".to_string(),.
        display_name: "NVIDIA Graphics Driver".to_string(),
        // Выполняем операцию: install_location: Some(folder.to_string_lossy().to_stri.
        install_location: Some(folder.to_string_lossy().to_string()),
        // Выполняем операцию: icon_path: None,.
        icon_path: None,
        // Закрываем блок.
    };

    // Объявляем переменную game .
    let game = registry_game(entry);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert!(game.is_none());.
    assert!(game.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_rejects_russian_service_names.
fn test_registry_game_rejects_russian_service_names() {
    // Названия системных утилит приходят из реестра в верхнем регистре
    // («Комплект средств...»): фильтр должен опускать кириллицу тоже.
    // Перебираем элементы коллекции.
    for name in [
        // Выполняем операцию: "Комплект средств развертывания и оценки Windows ADK",.
        "Комплект средств развертывания и оценки Windows ADK",
        // Выполняем операцию: "Пакет драйверов NVIDIA",.
        "Пакет драйверов NVIDIA",
        // Выполняем операцию: "Клиент поддержки",.
        "Клиент поддержки",
        // Выполняем операцию: ] {.
    ] {
        // Объявляем переменную folder .
        let folder = temp_root("zapret-registry-ru-reject");

        // Объявляем переменную entry .
        let entry = super::super::game_registry::UninstallEntry {
            // Выполняем операцию: display_name: name.to_string(),.
            display_name: name.to_string(),
            // Выполняем операцию: install_location: Some(folder.to_string_lossy().to_stri.
            install_location: Some(folder.to_string_lossy().to_string()),
            // Выполняем операцию: icon_path: None,.
            icon_path: None,
            // Закрываем блок.
        };

        // Объявляем переменную game .
        let game = registry_game(entry);
        // Объявляем переменную _ .
        let _ = fs::remove_dir_all(&folder);

        // Выполняем операцию: assert!(game.is_none(), "не-игра должна отбрасываться: .
        assert!(game.is_none(), "не-игра должна отбрасываться: {name}");
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_rejects_utility_packages.
fn test_registry_game_rejects_utility_packages() {
    // Утилиты, браузеры и античиты из списка удаления Windows приходили
    // в карточки как «игры»: их имена не содержат слов о дискретных
    // коллективах, но это не развлечение.
    // Перебираем элементы коллекции.
    for name in [
        // Выполняем операцию: "WinRAR 7.22 (64-разрядная)",.
        "WinRAR 7.22 (64-разрядная)",
        // Выполняем операцию: "qBittorrent",.
        "qBittorrent",
        // Выполняем операцию: "Microsoft OneDrive",.
        "Microsoft OneDrive",
        // Выполняем операцию: "FACEIT Anti-Cheat",.
        "FACEIT Anti-Cheat",
        // Выполняем операцию: "Radmin VPN 2.1.1",.
        "Radmin VPN 2.1.1",
        // Выполняем операцию: "Яндекс Браузер с Алисой",.
        "Яндекс Браузер с Алисой",
        // Выполняем операцию: "Ableton Live 12 Suite",.
        "Ableton Live 12 Suite",
        // Выполняем операцию: "Steam",.
        "Steam",
        // Выполняем операцию: "Steam Client Bootstrapper",.
        "Steam Client Bootstrapper",
        // Выполняем операцию: "GOG Galaxy",.
        "GOG Galaxy",
        // Выполняем операцию: ] {.
    ] {
        // Объявляем переменную folder .
        let folder = temp_root("zapret-registry-utility-reject");

        // Объявляем переменную entry .
        let entry = super::super::game_registry::UninstallEntry {
            // Выполняем операцию: display_name: name.to_string(),.
            display_name: name.to_string(),
            // Выполняем операцию: install_location: Some(folder.to_string_lossy().to_stri.
            install_location: Some(folder.to_string_lossy().to_string()),
            // Выполняем операцию: icon_path: None,.
            icon_path: None,
            // Закрываем блок.
        };

        // Объявляем переменную game .
        let game = registry_game(entry);
        // Объявляем переменную _ .
        let _ = fs::remove_dir_all(&folder);

        // Выполняем операцию: assert!(game.is_none(), "утилита должна отбрасываться: .
        assert!(game.is_none(), "утилита должна отбрасываться: {name}");
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_skips_relaxed_lookup_in_program_roots.
fn test_registry_game_skips_relaxed_lookup_in_program_roots() {
    // Папка в Program Files без игровых маркеров: расслабленный подбор
    // раньше выдавал раннер-служебные exe как «игры». Установки вне
    // программных корней он сохраняет (репаки, самоделки).
    // Объявляем переменную folder .
    let folder = build_root("zapret-registry-program-files");
    // Объявляем переменную target .
    let target = folder.join("Program Files").join("SomeTool");

    // Выполняем операцию: fs::create_dir_all(&target).unwrap_or_else(|error| pani.
    fs::create_dir_all(&target).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &target.join("watch.exe"),.
        &target.join("watch.exe"),
        // Выполняем операцию: game_heuristics::TRUSTED_MIN_BYTES * 2,.
        game_heuristics::TRUSTED_MIN_BYTES * 2,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную entry .
    let entry = super::super::game_registry::UninstallEntry {
        // Выполняем операцию: display_name: "SomeTool 3.1".to_string(),.
        display_name: "SomeTool 3.1".to_string(),
        // Выполняем операцию: install_location: Some(target.to_string_lossy().to_stri.
        install_location: Some(target.to_string_lossy().to_string()),
        // Выполняем операцию: icon_path: None,.
        icon_path: None,
        // Закрываем блок.
    };

    // Объявляем переменную game .
    let game = registry_game(entry);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert!(game.is_none());.
    assert!(game.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_uses_icon_path_when_location_missing.
fn test_registry_game_uses_icon_path_when_location_missing() {
    // Объявляем переменную folder .
    let folder = temp_root("zapret-registry-icon");
    // Выполняем операцию: fs::write(folder.join("UnityPlayer.dll"), b"marker").un.
    fs::write(folder.join("UnityPlayer.dll"), b"marker").unwrap_or_default();

    // Объявляем переменную exe .
    let exe = folder.join("hollow.exe");
    // Объявляем переменную file .
    let file = fs::File::create(&exe).unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: file.set_len(super::super::game_heuristics::MARKED_EXE_.
    file.set_len(super::super::game_heuristics::MARKED_EXE_BYTES + 1)
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Объявляем переменную entry .
    let entry = super::super::game_registry::UninstallEntry {
        // Выполняем операцию: display_name: "Hollow Knight".to_string(),.
        display_name: "Hollow Knight".to_string(),
        // Выполняем операцию: install_location: None,.
        install_location: None,
        // Выполняем операцию: icon_path: Some(format!("\"{}\",0", folder.join("hollow.
        icon_path: Some(format!("\"{}\",0", folder.join("hollow.exe").display())),
        // Закрываем блок.
    };

    // Объявляем переменную game .
    let game = registry_game(entry);

    // Выполняем операцию: assert!(game.is_some());.
    assert!(game.is_some());
    // Выполняем операцию: assert_eq!(game.map(|item| item.name).as_deref(), Some(.
    assert_eq!(game.map(|item| item.name).as_deref(), Some("Hollow Knight"));
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);
    // Закрываем блок.
}

// Объявляем функцию sparse_exe.
fn sparse_exe(path: &Path, bytes: u64) {
    // Объявляем переменную file .
    let file = fs::File::create(path).unwrap_or_else(|error| panic!("{error}"));

    // Выполняем операцию: file.set_len(bytes).
    file.set_len(bytes)
        // Выполняем операцию: .unwrap_or_else(|error| panic!("{error}"));.
        .unwrap_or_else(|error| panic!("{error}"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_registry_executable_prefers_name_match.
fn test_pick_registry_executable_prefers_name_match() {
    // Объявляем переменную folder .
    let folder = temp_root("zapret-registry-pick");
    // Маркер делает папку «игровой» для строгой фильтрации.
    // Выполняем операцию: fs::write(folder.join("UnityPlayer.dll"), b"marker").un.
    fs::write(folder.join("UnityPlayer.dll"), b"marker").unwrap_or_default();

    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &folder.join("rewards.exe"),.
        &folder.join("rewards.exe"),
        // Выполняем операцию: game_heuristics::MARKED_EXE_BYTES + 1,.
        game_heuristics::MARKED_EXE_BYTES + 1,
        // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &folder.join("zerohour.exe"),.
        &folder.join("zerohour.exe"),
        // Выполняем операцию: game_heuristics::MARKED_EXE_BYTES + 2,.
        game_heuristics::MARKED_EXE_BYTES + 2,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную picked .
    let picked = pick_registry_executable(&folder, "Zero Hour", false);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: picked.
        picked
            // Выполняем операцию: .as_ref().
            .as_ref()
            // Выполняем операцию: .and_then(|path| path.file_stem()).
            .and_then(|path| path.file_stem())
            // Выполняем операцию: .and_then(|stem| stem.to_str()),.
            .and_then(|stem| stem.to_str()),
        // Выполняем операцию: Some("zerohour").
        Some("zerohour") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_registry_executable_relaxed_fallback.
fn test_pick_registry_executable_relaxed_fallback() {
    // Папка без маркеров игры: строгая фильтрация ничего не даёт,
    // реестровая запись всё равно должна распознать exe объёмом > МБ,
    // если тот назван ровно как игра из записи.
    // Объявляем переменную folder .
    let folder = temp_root("zapret-registry-relaxed");

    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &folder.join("forgottensea.exe"),.
        &folder.join("forgottensea.exe"),
        // Выполняем операцию: game_heuristics::TRUSTED_MIN_BYTES * 4,.
        game_heuristics::TRUSTED_MIN_BYTES * 4,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную picked .
    let picked = pick_registry_executable(&folder, "Forgotten Sea", true);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: picked.
        picked
            // Выполняем операцию: .as_ref().
            .as_ref()
            // Выполняем операцию: .and_then(|path| path.file_stem()).
            .and_then(|path| path.file_stem())
            // Выполняем операцию: .and_then(|stem| stem.to_str()),.
            .and_then(|stem| stem.to_str()),
        // Выполняем операцию: Some("forgottensea").
        Some("forgottensea") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_registry_executable_relaxed_requires_name_match_in_program_roots.
fn test_pick_registry_executable_relaxed_requires_name_match_in_program_roots() {
    // В программных корнях расслабленный подбор отдаёт только exe,
    // названный ровно как запись: иначе там снова утилиты.
    // Объявляем переменную folder .
    let folder = temp_root("zapret-registry-relaxed-mismatch");

    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &folder.join("watch.exe"),.
        &folder.join("watch.exe"),
        // Выполняем операцию: game_heuristics::TRUSTED_MIN_BYTES * 4,.
        game_heuristics::TRUSTED_MIN_BYTES * 4,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную picked .
    let picked = pick_registry_executable(&folder, "Forgotten Sea", true);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert!(picked.is_none());.
    assert!(picked.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_rejects_appdata_apps_without_markers.
fn test_registry_game_rejects_appdata_apps_without_markers() {
    // AppData — место автоустановщиков приложений: имя exe совпадает с
    // записью (OpenHuman), но игра это не игра. Без маркеров — мимо.
    // Объявляем переменную folder .
    let folder = temp_root("zapret-registry-appdata");
    // Объявляем переменную target .
    let target = folder.join("AppData").join("Local").join("OpenHuman");

    // Выполняем операцию: fs::create_dir_all(&target).unwrap_or_else(|error| pani.
    fs::create_dir_all(&target).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &target.join("openhuman.exe"),.
        &target.join("openhuman.exe"),
        // Выполняем операцию: game_heuristics::TRUSTED_MIN_BYTES * 4,.
        game_heuristics::TRUSTED_MIN_BYTES * 4,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную entry .
    let entry = super::super::game_registry::UninstallEntry {
        // Выполняем операцию: display_name: "OpenHuman".to_string(),.
        display_name: "OpenHuman".to_string(),
        // Выполняем операцию: install_location: Some(target.to_string_lossy().to_stri.
        install_location: Some(target.to_string_lossy().to_string()),
        // Выполняем операцию: icon_path: None,.
        icon_path: None,
        // Закрываем блок.
    };

    // Объявляем переменную game .
    let game = registry_game(entry);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert!(game.is_none());.
    assert!(game.is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_registry_game_accepts_exact_name_in_program_files.
fn test_registry_game_accepts_exact_name_in_program_files() {
    // Маленькие игры без движка ставятся в Program Files: точное
    // совпадение имени exe с записью оставляет их в списке.
    // Объявляем переменную folder .
    let folder = build_root("zapret-registry-pf-exact");
    // Объявляем переменную target .
    let target = folder.join("Program Files").join("Forgotten Sea");

    // Выполняем операцию: fs::create_dir_all(&target).unwrap_or_else(|error| pani.
    fs::create_dir_all(&target).unwrap_or_else(|error| panic!("{error}"));
    // Выполняем операцию: sparse_exe(.
    sparse_exe(
        // Выполняем операцию: &target.join("forgottensea.exe"),.
        &target.join("forgottensea.exe"),
        // Выполняем операцию: game_heuristics::TRUSTED_MIN_BYTES * 4,.
        game_heuristics::TRUSTED_MIN_BYTES * 4,
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную entry .
    let entry = super::super::game_registry::UninstallEntry {
        // Выполняем операцию: display_name: "Forgotten Sea".to_string(),.
        display_name: "Forgotten Sea".to_string(),
        // Выполняем операцию: install_location: Some(target.to_string_lossy().to_stri.
        install_location: Some(target.to_string_lossy().to_string()),
        // Выполняем операцию: icon_path: None,.
        icon_path: None,
        // Закрываем блок.
    };

    // Объявляем переменную game .
    let game = registry_game(entry);
    // Объявляем переменную _ .
    let _ = fs::remove_dir_all(&folder);

    // Выполняем операцию: assert_eq!(game.map(|item| item.name).as_deref(), Some(.
    assert_eq!(game.map(|item| item.name).as_deref(), Some("Forgotten Sea"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_walk_title_rejects_utilities_but_keeps_test_game.
fn test_walk_title_rejects_utilities_but_keeps_test_game() {
    // Папочные обходы: утилиты по слову в названии, тестовая игра
    // пользователя со словом «zapret» — остаётся.
    // Выполняем операцию: assert!(is_non_game_walk_title("Adobe Photoshop 2026 — .
    assert!(is_non_game_walk_title("Adobe Photoshop 2026 — Photoshop"));
    // Выполняем операцию: assert!(is_non_game_walk_title("NVIDIA Broadcast"));.
    assert!(is_non_game_walk_title("NVIDIA Broadcast"));
    // Выполняем операцию: assert!(is_non_game_walk_title("Telegram Desktop — Tele.
    assert!(is_non_game_walk_title("Telegram Desktop — Telegram"));
    // Выполняем операцию: assert!(is_non_game_walk_title("client — uTorrentClient.
    assert!(is_non_game_walk_title("client — uTorrentClients"));
    // Выполняем операцию: assert!(!is_non_game_walk_title("Zapret Test Game"));.
    assert!(!is_non_game_walk_title("Zapret Test Game"));
    // Выполняем операцию: assert!(!is_non_game_walk_title("The Long Dark"));.
    assert!(!is_non_game_walk_title("The Long Dark"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_volume_skip_roots.
fn test_volume_skip_roots() {
    // Выполняем операцию: assert!(has_skip_root(.
    assert!(has_skip_root(
        // Выполняем операцию: Path::new("D:\\"),.
        Path::new("D:\\"),
        // Выполняем операцию: Path::new("D:\\Program Files\\SomeGame\\game.exe").
        Path::new("D:\\Program Files\\SomeGame\\game.exe") // Закрываем выражение или коллекцию.
    ));
    // Выполняем операцию: assert!(!has_skip_root(.
    assert!(!has_skip_root(
        // Выполняем операцию: Path::new("D:\\"),.
        Path::new("D:\\"),
        // Выполняем операцию: Path::new("D:\\Games\\SomeGame\\bin\\game.exe").
        Path::new("D:\\Games\\SomeGame\\bin\\game.exe") // Закрываем выражение или коллекцию.
    ));
    // Относительный путь вне корня тома — не считается служебным.
    // Выполняем операцию: assert!(!has_skip_root(.
    assert!(!has_skip_root(
        // Выполняем операцию: Path::new("D:\\Games"),.
        Path::new("D:\\Games"),
        // Выполняем операцию: Path::new("C:\\Program Files\\Other").
        Path::new("C:\\Program Files\\Other") // Закрываем выражение или коллекцию.
    ));
    // Закрываем блок.
}
