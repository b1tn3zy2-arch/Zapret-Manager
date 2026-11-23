// Подключаем модули: std::path::PathBuf;.
use std::path::PathBuf;

// Подключаем модули: super::*;.
use super::*;
// Подключаем модули: crate::commands::injector_backup::{create_backup, list_.
use crate::commands::injector_backup::{create_backup, list_backups_for, restore_from_backup};
// Подключаем модули: crate::commands::injector_text::{.
use crate::commands::injector_text::{
    // Выполняем операцию: append_marker_section, chrono_stamp, collect_new_entrie.
    append_marker_section,
    chrono_stamp,
    collect_new_entries,
    read_existing_entries,
    // Выполняем операцию: remove_marker_section,.
    remove_marker_section,
    // Закрываем блок.
};
// Подключаем модули: crate::constants::{MARKER_END, MARKER_START};.
use crate::constants::{MARKER_END, MARKER_START};

// Объявляем константу SAMPLE_BAT.
const SAMPLE_BAT: &str = r#"@echo off
cd /d "%~dp0"
set "BIN=%~dp0bin\"
set "LISTS=%~dp0lists\"
start "zapret" /min "%BIN%winws.exe" --wf-tcp=80,443 ^
--filter-tcp=443 --hostlist="%LISTS%list-general.txt" --hostlist="%LISTS%list-general-user.txt" --hostlist-exclude="%LISTS%list-exclude.txt" ^
--filter-tcp=2053 --hostlist-domains=discord.media ^
--filter-tcp=80,443 --ipset="%LISTS%ipset-all.txt" --ipset-exclude="%LISTS%ipset-exclude.txt""#;

// Объявляем функцию dir.
fn dir() -> PathBuf {
    // Выполняем операцию: PathBuf::from(r"C:\zapret").
    PathBuf::from(r"C:\zapret")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_paths_resolves_variables.
fn test_parse_config_paths_resolves_variables() {
    // Объявляем переменную targets .
    let targets = parse_config_paths(SAMPLE_BAT, &dir());
    // Объявляем переменную paths.
    let paths: Vec<&str> = targets.iter().map(|item| item.path.as_str()).collect();

    // Выполняем операцию: assert!(paths.contains(&r"C:\zapret\lists\list-general..
    assert!(paths.contains(&r"C:\zapret\lists\list-general.txt"));
    // Выполняем операцию: assert!(paths.contains(&r"C:\zapret\lists\ipset-all.txt.
    assert!(paths.contains(&r"C:\zapret\lists\ipset-all.txt"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_paths_skips_user_lists.
fn test_parse_config_paths_skips_user_lists() {
    // Объявляем переменную targets .
    let targets = parse_config_paths(SAMPLE_BAT, &dir());

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: !targets.iter().any(|item| item.path.contains("-user.tx.
        !targets.iter().any(|item| item.path.contains("-user.txt")),
        // Выполняем операцию: "пользовательские списки не должны инъецироваться".
        "пользовательские списки не должны инъецироваться" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_paths_skips_excludes_and_inline_domains.
fn test_parse_config_paths_skips_excludes_and_inline_domains() {
    // Объявляем переменную targets .
    let targets = parse_config_paths(SAMPLE_BAT, &dir());

    // Выполняем операцию: assert!(!targets.iter().any(|item| item.path.contains(".
    assert!(!targets.iter().any(|item| item.path.contains("exclude")));
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: !targets.
        !targets
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .any(|item| item.path.contains("discord.media")),.
            .any(|item| item.path.contains("discord.media")),
        // Выполняем операцию: "--hostlist-domains это inline-домен, а не файл".
        "--hostlist-domains это inline-домен, а не файл" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_paths_deduplicates.
fn test_parse_config_paths_deduplicates() {
    // Объявляем переменную bat .
    let bat = r#"set "L=%~dp0lists\"
winws.exe --hostlist="%L%list-general.txt" --hostlist="%L%list-general.txt""#;

    // Объявляем переменную targets .
    let targets = parse_config_paths(bat, &dir());

    // Выполняем операцию: assert_eq!(targets.len(), 1);.
    assert_eq!(targets.len(), 1);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_config_paths_fallback.
fn test_parse_config_paths_fallback() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-injector-fallback");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(dir.join("lists")).unwrap();.
    std::fs::create_dir_all(dir.join("lists")).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("lists").join("list-general.txt.
    std::fs::write(dir.join("lists").join("list-general.txt"), "a.com\r\n").unwrap();

    // Объявляем переменную targets .
    let targets = parse_config_paths("winws.exe --dpi-desync=fake", &dir);

    // Выполняем операцию: assert_eq!(targets.len(), 1);.
    assert_eq!(targets.len(), 1);
    // Выполняем операцию: assert_eq!(targets[0].kind, ConfigKind::Domains);.
    assert_eq!(targets[0].kind, ConfigKind::Domains);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_normalize_domain_strips_zapret_prefix.
fn test_normalize_domain_strips_zapret_prefix() {
    // Выполняем операцию: assert_eq!(normalize_domain("Discord.COM "), "discord.c.
    assert_eq!(normalize_domain("Discord.COM "), "discord.com");
    // Выполняем операцию: assert_eq!(normalize_domain("^dns.google"), "dns.google.
    assert_eq!(normalize_domain("^dns.google"), "dns.google");
    // Выполняем операцию: assert_eq!(normalize_domain("steam.com."), "steam.com").
    assert_eq!(normalize_domain("steam.com."), "steam.com");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_valid_domain_accepts_and_rejects.
fn test_is_valid_domain_accepts_and_rejects() {
    // Выполняем операцию: assert!(is_valid_domain("battleye.com"));.
    assert!(is_valid_domain("battleye.com"));
    // Выполняем операцию: assert!(is_valid_domain("sub.domain.co.uk"));.
    assert!(is_valid_domain("sub.domain.co.uk"));
    // Выполняем операцию: assert!(!is_valid_domain("localhost"));.
    assert!(!is_valid_domain("localhost"));
    // Выполняем операцию: assert!(!is_valid_domain("not_a_domain!"));.
    assert!(!is_valid_domain("not_a_domain!"));
    // Выполняем операцию: assert!(!is_valid_domain("-bad.com"));.
    assert!(!is_valid_domain("-bad.com"));
    // Выполняем операцию: assert!(!is_valid_domain("bad-.com"));.
    assert!(!is_valid_domain("bad-.com"));
    // Выполняем операцию: assert!(!is_valid_domain(""));.
    assert!(!is_valid_domain(""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_valid_ip_variants.
fn test_is_valid_ip_variants() {
    // Выполняем операцию: assert!(is_valid_ip("8.8.8.8"));.
    assert!(is_valid_ip("8.8.8.8"));
    // Выполняем операцию: assert!(is_valid_ip("8.8.8.0/24"));.
    assert!(is_valid_ip("8.8.8.0/24"));
    // Выполняем операцию: assert!(!is_valid_ip("999.1.1.1"));.
    assert!(!is_valid_ip("999.1.1.1"));
    // Выполняем операцию: assert!(!is_valid_ip("1.2.3"));.
    assert!(!is_valid_ip("1.2.3"));
    // Выполняем операцию: assert!(!is_valid_ip("1.2.3.4/40"));.
    assert!(!is_valid_ip("1.2.3.4/40"));
    // Выполняем операцию: assert!(is_valid_ip("2001:db8::1"));.
    assert!(is_valid_ip("2001:db8::1"));
    // Выполняем операцию: assert!(!is_valid_ip("2001:db8:::1"));.
    assert!(!is_valid_ip("2001:db8:::1"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_read_existing_entries_ignores_comments.
fn test_read_existing_entries_ignores_comments() {
    // Объявляем переменную content .
    let content = "# comment\r\n; another\r\n^dns.google\r\ndiscord.com\r\n\r\n";
    // Объявляем переменную entries .
    let entries = read_existing_entries(content);

    // Выполняем операцию: assert!(entries.contains("dns.google"));.
    assert!(entries.contains("dns.google"));
    // Выполняем операцию: assert!(entries.contains("discord.com"));.
    assert!(entries.contains("discord.com"));
    // Выполняем операцию: assert_eq!(entries.len(), 2);.
    assert_eq!(entries.len(), 2);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_append_and_remove_marker_roundtrip.
fn test_append_and_remove_marker_roundtrip() {
    // Объявляем переменную original .
    let original = "# header\r\ndiscord.com\r\n";
    // Объявляем переменную entries .
    let entries = vec!["battleye.com".to_string(), "steampowered.com".to_string()];

    // Объявляем переменную injected .
    let injected = append_marker_section(original, &entries, "Добавлено 2026-10-06");

    // Выполняем операцию: assert!(injected.contains(MARKER_START));.
    assert!(injected.contains(MARKER_START));
    // Выполняем операцию: assert!(injected.contains(MARKER_END));.
    assert!(injected.contains(MARKER_END));
    // Выполняем операцию: assert!(injected.contains("battleye.com"));.
    assert!(injected.contains("battleye.com"));
    // Выполняем операцию: assert!(injected.contains("discord.com"));.
    assert!(injected.contains("discord.com"));

    // Объявляем переменную restored .
    let restored = remove_marker_section(&injected);

    // Выполняем операцию: assert_eq!(restored, original);.
    assert_eq!(restored, original);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_remove_marker_keeps_user_edits_outside.
fn test_remove_marker_keeps_user_edits_outside() {
    // Объявляем переменную original .
    let original = "discord.com\r\n";
    // Объявляем переменную injected .
    let injected = append_marker_section(original, &["battleye.com".to_string()], "note");
    // Объявляем переменную user_added .
    let user_added = format!("{injected}my-own-domain.com\r\n");

    // Объявляем переменную restored .
    let restored = remove_marker_section(&user_added);

    // Выполняем операцию: assert!(restored.contains("my-own-domain.com"));.
    assert!(restored.contains("my-own-domain.com"));
    // Выполняем операцию: assert!(!restored.contains("battleye.com"));.
    assert!(!restored.contains("battleye.com"));
    // Выполняем операцию: assert!(!restored.contains(MARKER_START));.
    assert!(!restored.contains(MARKER_START));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_append_replaces_previous_block_without_duplicates.
fn test_append_replaces_previous_block_without_duplicates() {
    // Объявляем переменную first .
    let first = append_marker_section("discord.com\r\n", &["a.com".to_string()], "note");
    // Объявляем переменную second .
    let second = append_marker_section(&first, &["b.com".to_string()], "note");

    // Выполняем операцию: assert_eq!(second.matches(MARKER_START).count(), 1);.
    assert_eq!(second.matches(MARKER_START).count(), 1);
    // Выполняем операцию: assert!(!second.contains("a.com"));.
    assert!(!second.contains("a.com"));
    // Выполняем операцию: assert!(second.contains("b.com"));.
    assert!(second.contains("b.com"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_inject_skips_duplicates.
fn test_inject_skips_duplicates() {
    // Объявляем переменную content .
    let content = "discord.com\r\n";
    // Объявляем переменную candidates .
    let candidates = vec!["discord.com".to_string(), "battleye.com".to_string()];

    // Объявляем переменную (entries, duplicates, rejected) .
    let (entries, duplicates, rejected) =
        // Выполняем операцию: collect_new_entries(content, &candidates, ConfigKind::D.
        collect_new_entries(content, &candidates, ConfigKind::Domains);

    // Выполняем операцию: assert_eq!(entries, vec!["battleye.com".to_string()]);.
    assert_eq!(entries, vec!["battleye.com".to_string()]);
    // Выполняем операцию: assert_eq!(duplicates, 1);.
    assert_eq!(duplicates, 1);
    // Выполняем операцию: assert_eq!(rejected, 0);.
    assert_eq!(rejected, 0);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_inject_rejects_invalid_entries.
fn test_inject_rejects_invalid_entries() {
    // Объявляем переменную candidates .
    let candidates = vec![
        // Выполняем операцию: "not_a_domain!".to_string(),.
        "not_a_domain!".to_string(),
        // Выполняем операцию: "good.com".to_string(),.
        "good.com".to_string(),
        // Выполняем операцию: "good.com".to_string(),.
        "good.com".to_string(),
        // Закрываем выражение или коллекцию.
    ];

    // Объявляем переменную (entries, duplicates, rejected) .
    let (entries, duplicates, rejected) = collect_new_entries("", &candidates, ConfigKind::Domains);

    // Выполняем операцию: assert_eq!(entries, vec!["good.com".to_string()]);.
    assert_eq!(entries, vec!["good.com".to_string()]);
    // Выполняем операцию: assert_eq!(duplicates, 1);.
    assert_eq!(duplicates, 1);
    // Выполняем операцию: assert_eq!(rejected, 1);.
    assert_eq!(rejected, 1);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_marker_roundtrip_with_crlf.
fn test_marker_roundtrip_with_crlf() {
    // Объявляем переменную original .
    let original = "a.com\r\nb.com\r\n";
    // Объявляем переменную injected .
    let injected = append_marker_section(original, &["c.com".to_string()], "note");

    // Выполняем операцию: assert!(injected.contains("\r\n"));.
    assert!(injected.contains("\r\n"));
    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: !injected.contains('\n').
        !injected.contains('\n')
            // Выполняем операцию: || injected.matches("\r\n").count() == injected.matches.
            || injected.matches("\r\n").count() == injected.matches('\n').count() // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_chrono_stamp_format.
fn test_chrono_stamp_format() {
    // Объявляем переменную stamp .
    let stamp = chrono_stamp(1_767_225_600_000);

    // Выполняем операцию: assert!(stamp.starts_with("2026-01-01 "), "получено: {s.
    assert!(stamp.starts_with("2026-01-01 "), "получено: {stamp}");
    // Выполняем операцию: assert!(stamp.ends_with(" UTC"));.
    assert!(stamp.ends_with(" UTC"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_backup_rotation_keeps_ten.
fn test_backup_rotation_keeps_ten() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-injector-backups");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную original .
    let original = dir.join("list-general.txt");
    // Выполняем операцию: std::fs::write(&original, "a.com\r\n").unwrap();.
    std::fs::write(&original, "a.com\r\n").unwrap();

    // Перебираем элементы коллекции.
    for index in 0..14u64 {
        // Выполняем операцию: create_backup(&original, 1_700_000_000_000 + index).unw.
        create_backup(&original, 1_700_000_000_000 + index).unwrap();
        // Закрываем блок.
    }

    // Объявляем переменную remaining .
    let remaining = list_backups_for(&original);

    // Выполняем операцию: assert_eq!(remaining.len(), 10);.
    assert_eq!(remaining.len(), 10);
    // Выполняем операцию: assert_eq!(remaining[0].created_at, 1_700_000_000_013);.
    assert_eq!(remaining[0].created_at, 1_700_000_000_013);

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_restore_from_backup_rejects_empty.
fn test_restore_from_backup_rejects_empty() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-injector-restore");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную original .
    let original = dir.join("list-general.txt");
    // Выполняем операцию: std::fs::write(&original, "a.com\r\n").unwrap();.
    std::fs::write(&original, "a.com\r\n").unwrap();

    // Объявляем переменную info .
    let info = create_backup(&original, 1_700_000_000_000).unwrap();
    // Выполняем операцию: std::fs::write(&info.backup_path, "").unwrap();.
    std::fs::write(&info.backup_path, "").unwrap();

    // Выполняем операцию: assert!(restore_from_backup(&original, None).is_err());.
    assert!(restore_from_backup(&original, None).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_restore_from_backup_returns_original.
fn test_restore_from_backup_returns_original() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join("zapret-injector-restore-ok");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).unwrap();.
    std::fs::create_dir_all(&dir).unwrap();

    // Объявляем переменную original .
    let original = dir.join("list-general.txt");
    // Выполняем операцию: std::fs::write(&original, "original.com\r\n").unwrap();.
    std::fs::write(&original, "original.com\r\n").unwrap();

    // Выполняем операцию: create_backup(&original, 1_700_000_000_000).unwrap();.
    create_backup(&original, 1_700_000_000_000).unwrap();
    // Выполняем операцию: std::fs::write(&original, "changed.com\r\n").unwrap();.
    std::fs::write(&original, "changed.com\r\n").unwrap();

    // Объявляем переменную size .
    let size = restore_from_backup(&original, None).unwrap();
    // Объявляем переменную restored .
    let restored = std::fs::read_to_string(&original).unwrap();

    // Выполняем операцию: assert!(size > 0);.
    assert!(size > 0);
    // Выполняем операцию: assert_eq!(restored, "original.com\r\n");.
    assert_eq!(restored, "original.com\r\n");

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}
