use super::*;

#[test]
fn test_extract_name() {
    assert_eq!(extract_name("general-00-baseline.bat"), "General Baseline");
}

#[test]
fn test_extract_name_with_parens() {
    assert_eq!(extract_name("general (ALT2).bat"), "General Alt2");
}

#[test]
fn test_extract_name_acronyms() {
    assert_eq!(
        extract_name("general (FAKE TLS AUTO ALT2).bat"),
        "General Fake TLS Auto Alt2"
    );
}

#[test]
fn test_extract_name_underscores() {
    assert_eq!(extract_name("discord_youtube.bat"), "Discord Youtube");
}

#[test]
fn test_detect_services_by_name() {
    assert_eq!(
        detect_services("discord_youtube", ""),
        vec!["discord".to_string(), "youtube".to_string()]
    );
}

#[test]
fn test_detect_services_priority_name() {
    let content = "--hostlist=\"%LISTS%list-discord.txt\"";

    assert_eq!(
        detect_services("general-05-alt", content),
        vec!["general".to_string()]
    );
}

#[test]
fn test_detect_services_fallback_content() {
    assert_eq!(
        detect_services("custom-1", "--hostlist=\"%LISTS%list-outlast.txt\""),
        vec!["outlast-trials".to_string()]
    );
}

#[test]
fn test_detect_services_fallback_general() {
    assert_eq!(
        detect_services("custom-2", "ничего подходящего"),
        vec!["general".to_string()]
    );
}

#[test]
fn test_extract_techniques_real_bat() {
    let content = concat!(
        "start \"zapret\" /min \"%BIN%winws.exe\" --new ",
        "--ipset=\"%LISTS%ipset-all.txt\" --new ",
        "--filter-l7=discord,stun --dpi-desync=fake --new "
    );

    let techniques = extract_techniques(content);

    assert!(techniques.contains(&"ipset".to_string()));
    assert!(techniques.contains(&"l7-filter".to_string()));
    assert!(techniques.contains(&"fake".to_string()));
}

#[test]
fn test_extract_techniques_unique_and_ordered() {
    let content = "--dpi-desync=fake --filter-l7=x --ipset=\"y\"";

    assert_eq!(
        extract_techniques(content),
        vec![
            "l7-filter".to_string(),
            "ipset".to_string(),
            "fake".to_string()
        ]
    );
}

#[test]
fn test_detect_file_type() {
    assert_eq!(detect_file_type("start ... winws.exe --new"), "winws");
    assert_eq!(detect_file_type("goodbyedpi.exe"), "goodbye-dpi");
    assert_eq!(detect_file_type("никаких exe"), "unknown");
}

#[test]
fn test_extract_description_skips_chcp() {
    let content = "@echo off\nchcp 65001 > nul\n:: 65001 - UTF-8\ncd /d \"%~dp0\"\ncall service.bat status\n";

    assert_eq!(extract_description(content), "");
}

#[test]
fn test_extract_description() {
    let content = "@echo off\nchcp 65001 > nul\nREM Разблокировка Discord и YouTube\n";

    assert_eq!(
        extract_description(content),
        "Разблокировка Discord и YouTube"
    );
}

#[test]
fn test_extract_description_colon_prefix() {
    let content = "@echo off\n:: Обход DPI по TCP\n";

    assert_eq!(extract_description(content), "Обход DPI по TCP");
}

#[test]
fn test_extract_version() {
    assert_eq!(
        extract_version("zapret v1.10.3 release"),
        Some("1.10.3".to_string())
    );
    assert_eq!(extract_version("версия 1.2"), Some("1.2".to_string()));
    assert_eq!(extract_version("без версии"), None);
}

#[test]
fn test_is_excluded_service_bat() {
    assert!(is_excluded("service.bat"));
    assert!(is_excluded("SERVICE.BAT"));
    assert!(!is_excluded("general.bat"));
}