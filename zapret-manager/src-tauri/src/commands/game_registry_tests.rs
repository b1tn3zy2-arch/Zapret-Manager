// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_to_wide_appends_terminator.
fn test_to_wide_appends_terminator() {
    // Объявляем переменную wide .
    let wide = to_wide("abc");

    // Выполняем операцию: assert_eq!(wide, vec![97, 98, 99, 0]);.
    assert_eq!(wide, vec![97, 98, 99, 0]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_icon_target_strips_index.
fn test_parse_icon_target_strips_index() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_icon_target("\"D:\\Games\\game.exe\",0").as_deref.
        parse_icon_target("\"D:\\Games\\game.exe\",0").as_deref(),
        // Выполняем операцию: Some("D:\\Games\\game.exe").
        Some("D:\\Games\\game.exe") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_icon_target_without_index.
fn test_parse_icon_target_without_index() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_icon_target("D:\\Games\\game.exe").as_deref(),.
        parse_icon_target("D:\\Games\\game.exe").as_deref(),
        // Выполняем операцию: Some("D:\\Games\\game.exe").
        Some("D:\\Games\\game.exe") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_icon_target_rejects_non_exe.
fn test_parse_icon_target_rejects_non_exe() {
    // Выполняем операцию: assert!(parse_icon_target("D:\\Games\\data").is_none()).
    assert!(parse_icon_target("D:\\Games\\data").is_none());
    // Выполняем операцию: assert!(parse_icon_target("").is_none());.
    assert!(parse_icon_target("").is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_uninstall_entries_are_sorted_and_unique.
fn test_uninstall_entries_are_sorted_and_unique() {
    // Объявляем переменную entries .
    let mut entries = vec![
        // Выполняем операцию: UninstallEntry {.
        UninstallEntry {
            // Выполняем операцию: display_name: "Zeta".to_string(),.
            display_name: "Zeta".to_string(),
            // Выполняем операцию: install_location: None,.
            install_location: None,
            // Выполняем операцию: icon_path: None,.
            icon_path: None,
            // Закрываем блок.
        },
        // Выполняем операцию: UninstallEntry {.
        UninstallEntry {
            // Выполняем операцию: display_name: "Alpha".to_string(),.
            display_name: "Alpha".to_string(),
            // Выполняем операцию: install_location: None,.
            install_location: None,
            // Выполняем операцию: icon_path: None,.
            icon_path: None,
            // Закрываем блок.
        },
        // Выполняем операцию: UninstallEntry {.
        UninstallEntry {
            // Выполняем операцию: display_name: "Alpha".to_string(),.
            display_name: "Alpha".to_string(),
            // Выполняем операцию: install_location: None,.
            install_location: None,
            // Выполняем операцию: icon_path: None,.
            icon_path: None,
            // Закрываем блок.
        },
        // Закрываем выражение или коллекцию.
    ];

    // Выполняем операцию: entries.sort_by(|left, right| left.display_name.cmp(&ri.
    entries.sort_by(|left, right| left.display_name.cmp(&right.display_name));
    // Выполняем операцию: entries.dedup_by(|left, right| left.display_name == rig.
    entries.dedup_by(|left, right| left.display_name == right.display_name);

    // Выполняем операцию: assert_eq!(entries.len(), 2);.
    assert_eq!(entries.len(), 2);
    // Выполняем операцию: assert_eq!(entries[0].display_name, "Alpha");.
    assert_eq!(entries[0].display_name, "Alpha");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_open_key_on_missing_path_returns_none.
fn test_open_key_on_missing_path_returns_none() {
    // Выполняем операцию: assert!(open_key(HKEY_LOCAL_MACHINE, "Software\\ZapretM.
    assert!(open_key(HKEY_LOCAL_MACHINE, "Software\\ZapretMissing", VIEW_64).is_none());
    // Закрываем блок.
}
