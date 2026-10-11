use super::*;

#[test]
fn test_to_wide_appends_terminator() {
    let wide = to_wide("abc");

    assert_eq!(wide, vec![97, 98, 99, 0]);
}

#[test]
fn test_parse_icon_target_strips_index() {
    assert_eq!(
        parse_icon_target("\"D:\\Games\\game.exe\",0").as_deref(),
        Some("D:\\Games\\game.exe")
    );
}

#[test]
fn test_parse_icon_target_without_index() {
    assert_eq!(
        parse_icon_target("D:\\Games\\game.exe").as_deref(),
        Some("D:\\Games\\game.exe")
    );
}

#[test]
fn test_parse_icon_target_rejects_non_exe() {
    assert!(parse_icon_target("D:\\Games\\data").is_none());
    assert!(parse_icon_target("").is_none());
}

#[test]
fn test_uninstall_entries_are_sorted_and_unique() {
    let mut entries = vec![
        UninstallEntry {
            display_name: "Zeta".to_string(),
            install_location: None,
            icon_path: None,
        },
        UninstallEntry {
            display_name: "Alpha".to_string(),
            install_location: None,
            icon_path: None,
        },
        UninstallEntry {
            display_name: "Alpha".to_string(),
            install_location: None,
            icon_path: None,
        },
    ];

    entries.sort_by(|left, right| left.display_name.cmp(&right.display_name));
    entries.dedup_by(|left, right| left.display_name == right.display_name);

    assert_eq!(entries.len(), 2);
    assert_eq!(entries[0].display_name, "Alpha");
}

#[test]
fn test_open_key_on_missing_path_returns_none() {
    assert!(open_key(HKEY_LOCAL_MACHINE, "Software\\ZapretMissing", VIEW_64).is_none());
}