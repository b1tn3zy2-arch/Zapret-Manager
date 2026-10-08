use std::path::PathBuf;

use super::*;
use crate::commands::injector_backup::{create_backup, list_backups_for, restore_from_backup};
use crate::commands::injector_text::{
    append_marker_section, chrono_stamp, collect_new_entries, read_existing_entries,
    remove_marker_section,
};
use crate::constants::{MARKER_END, MARKER_START};

const SAMPLE_BAT: &str = r#"@echo off
cd /d "%~dp0"
set "BIN=%~dp0bin\"
set "LISTS=%~dp0lists\"
start "zapret" /min "%BIN%winws.exe" --wf-tcp=80,443 ^
--filter-tcp=443 --hostlist="%LISTS%list-general.txt" --hostlist="%LISTS%list-general-user.txt" --hostlist-exclude="%LISTS%list-exclude.txt" ^
--filter-tcp=2053 --hostlist-domains=discord.media ^
--filter-tcp=80,443 --ipset="%LISTS%ipset-all.txt" --ipset-exclude="%LISTS%ipset-exclude.txt""#;

fn dir() -> PathBuf {
    PathBuf::from(r"C:\zapret")
}

#[test]
fn test_parse_config_paths_resolves_variables() {
    let targets = parse_config_paths(SAMPLE_BAT, &dir());
    let paths: Vec<&str> = targets.iter().map(|item| item.path.as_str()).collect();

    assert!(paths.contains(&r"C:\zapret\lists\list-general.txt"));
    assert!(paths.contains(&r"C:\zapret\lists\ipset-all.txt"));
}

#[test]
fn test_parse_config_paths_skips_user_lists() {
    let targets = parse_config_paths(SAMPLE_BAT, &dir());

    assert!(
        !targets
            .iter()
            .any(|item| item.path.contains("-user.txt")),
        "пользовательские списки не должны инъецироваться"
    );
}

#[test]
fn test_parse_config_paths_skips_excludes_and_inline_domains() {
    let targets = parse_config_paths(SAMPLE_BAT, &dir());

    assert!(!targets.iter().any(|item| item.path.contains("exclude")));
    assert!(
        !targets.iter().any(|item| item.path.contains("discord.media")),
        "--hostlist-domains это inline-домен, а не файл"
    );
}

#[test]
fn test_parse_config_paths_deduplicates() {
    let bat = r#"set "L=%~dp0lists\"
winws.exe --hostlist="%L%list-general.txt" --hostlist="%L%list-general.txt""#;

    let targets = parse_config_paths(bat, &dir());

    assert_eq!(targets.len(), 1);
}

#[test]
fn test_parse_config_paths_fallback() {
    let dir = std::env::temp_dir().join("zapret-injector-fallback");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(dir.join("lists")).unwrap();
    std::fs::write(dir.join("lists").join("list-general.txt"), "a.com\r\n").unwrap();

    let targets = parse_config_paths("winws.exe --dpi-desync=fake", &dir);

    assert_eq!(targets.len(), 1);
    assert_eq!(targets[0].kind, ConfigKind::Domains);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_normalize_domain_strips_zapret_prefix() {
    assert_eq!(normalize_domain("Discord.COM "), "discord.com");
    assert_eq!(normalize_domain("^dns.google"), "dns.google");
    assert_eq!(normalize_domain("steam.com."), "steam.com");
}

#[test]
fn test_is_valid_domain_accepts_and_rejects() {
    assert!(is_valid_domain("battleye.com"));
    assert!(is_valid_domain("sub.domain.co.uk"));
    assert!(!is_valid_domain("localhost"));
    assert!(!is_valid_domain("not_a_domain!"));
    assert!(!is_valid_domain("-bad.com"));
    assert!(!is_valid_domain("bad-.com"));
    assert!(!is_valid_domain(""));
}

#[test]
fn test_is_valid_ip_variants() {
    assert!(is_valid_ip("8.8.8.8"));
    assert!(is_valid_ip("8.8.8.0/24"));
    assert!(!is_valid_ip("999.1.1.1"));
    assert!(!is_valid_ip("1.2.3"));
    assert!(!is_valid_ip("1.2.3.4/40"));
    assert!(is_valid_ip("2001:db8::1"));
    assert!(!is_valid_ip("2001:db8:::1"));
}

#[test]
fn test_read_existing_entries_ignores_comments() {
    let content = "# comment\r\n; another\r\n^dns.google\r\ndiscord.com\r\n\r\n";
    let entries = read_existing_entries(content);

    assert!(entries.contains("dns.google"));
    assert!(entries.contains("discord.com"));
    assert_eq!(entries.len(), 2);
}

#[test]
fn test_append_and_remove_marker_roundtrip() {
    let original = "# header\r\ndiscord.com\r\n";
    let entries = vec!["battleye.com".to_string(), "steampowered.com".to_string()];

    let injected = append_marker_section(original, &entries, "Добавлено 2026-10-06");

    assert!(injected.contains(MARKER_START));
    assert!(injected.contains(MARKER_END));
    assert!(injected.contains("battleye.com"));
    assert!(injected.contains("discord.com"));

    let restored = remove_marker_section(&injected);

    assert_eq!(restored, original);
}

#[test]
fn test_remove_marker_keeps_user_edits_outside() {
    let original = "discord.com\r\n";
    let injected = append_marker_section(original, &["battleye.com".to_string()], "note");
    let user_added = format!("{injected}my-own-domain.com\r\n");

    let restored = remove_marker_section(&user_added);

    assert!(restored.contains("my-own-domain.com"));
    assert!(!restored.contains("battleye.com"));
    assert!(!restored.contains(MARKER_START));
}

#[test]
fn test_append_replaces_previous_block_without_duplicates() {
    let first = append_marker_section("discord.com\r\n", &["a.com".to_string()], "note");
    let second = append_marker_section(&first, &["b.com".to_string()], "note");

    assert_eq!(second.matches(MARKER_START).count(), 1);
    assert!(!second.contains("a.com"));
    assert!(second.contains("b.com"));
}

#[test]
fn test_inject_skips_duplicates() {
    let content = "discord.com\r\n";
    let candidates = vec!["discord.com".to_string(), "battleye.com".to_string()];

    let (entries, duplicates, rejected) = collect_new_entries(content, &candidates, ConfigKind::Domains);

    assert_eq!(entries, vec!["battleye.com".to_string()]);
    assert_eq!(duplicates, 1);
    assert_eq!(rejected, 0);
}

#[test]
fn test_inject_rejects_invalid_entries() {
    let candidates = vec![
        "not_a_domain!".to_string(),
        "good.com".to_string(),
        "good.com".to_string(),
    ];

    let (entries, duplicates, rejected) =
        collect_new_entries("", &candidates, ConfigKind::Domains);

    assert_eq!(entries, vec!["good.com".to_string()]);
    assert_eq!(duplicates, 1);
    assert_eq!(rejected, 1);
}

#[test]
fn test_marker_roundtrip_with_crlf() {
    let original = "a.com\r\nb.com\r\n";
    let injected = append_marker_section(original, &["c.com".to_string()], "note");

    assert!(injected.contains("\r\n"));
    assert!(!injected.contains('\n') || injected.matches("\r\n").count() == injected.matches('\n').count());
}

#[test]
fn test_chrono_stamp_format() {
    let stamp = chrono_stamp(1_767_225_600_000);

    assert!(stamp.starts_with("2026-01-01 "), "получено: {stamp}");
    assert!(stamp.ends_with(" UTC"));
}

#[test]
fn test_backup_rotation_keeps_ten() {
    let dir = std::env::temp_dir().join("zapret-injector-backups");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    let original = dir.join("list-general.txt");
    std::fs::write(&original, "a.com\r\n").unwrap();

    for index in 0..14u64 {
        create_backup(&original, 1_700_000_000_000 + index).unwrap();
    }

    let remaining = list_backups_for(&original);

    assert_eq!(remaining.len(), 10);
    assert_eq!(remaining[0].created_at, 1_700_000_000_013);

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_restore_from_backup_rejects_empty() {
    let dir = std::env::temp_dir().join("zapret-injector-restore");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    let original = dir.join("list-general.txt");
    std::fs::write(&original, "a.com\r\n").unwrap();

    let info = create_backup(&original, 1_700_000_000_000).unwrap();
    std::fs::write(&info.backup_path, "").unwrap();

    assert!(restore_from_backup(&original, None).is_err());

    let _ = std::fs::remove_dir_all(&dir);
}

#[test]
fn test_restore_from_backup_returns_original() {
    let dir = std::env::temp_dir().join("zapret-injector-restore-ok");
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();

    let original = dir.join("list-general.txt");
    std::fs::write(&original, "original.com\r\n").unwrap();

    create_backup(&original, 1_700_000_000_000).unwrap();
    std::fs::write(&original, "changed.com\r\n").unwrap();

    let size = restore_from_backup(&original, None).unwrap();
    let restored = std::fs::read_to_string(&original).unwrap();

    assert!(size > 0);
    assert_eq!(restored, "original.com\r\n");

    let _ = std::fs::remove_dir_all(&dir);
}