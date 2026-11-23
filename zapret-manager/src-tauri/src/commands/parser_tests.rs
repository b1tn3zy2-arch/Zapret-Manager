// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_name.
fn test_extract_name() {
    // Выполняем операцию: assert_eq!(extract_name("general-00-baseline.bat"), "Ba.
    assert_eq!(extract_name("general-00-baseline.bat"), "Baseline");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_name_with_parens.
fn test_extract_name_with_parens() {
    // Выполняем операцию: assert_eq!(extract_name("general (ALT2).bat"), "ALT 2").
    assert_eq!(extract_name("general (ALT2).bat"), "ALT 2");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_name_acronyms.
fn test_extract_name_acronyms() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_name("general (FAKE TLS AUTO ALT2).bat"),.
        extract_name("general (FAKE TLS AUTO ALT2).bat"),
        // Выполняем операцию: "Fake TLS Auto ALT 2".
        "Fake TLS Auto ALT 2" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_name_keeps_glued_numbers.
fn test_extract_name_keeps_glued_numbers() {
    // Объявляем переменную names.
    let names: Vec<String> = [
        // Выполняем операцию: "general-00-baseline.bat",.
        "general-00-baseline.bat",
        // Выполняем операцию: "general (ALT).bat",.
        "general (ALT).bat",
        // Выполняем операцию: "general (ALT2).bat",.
        "general (ALT2).bat",
        // Выполняем операцию: "general (EXPERIMENTAL).bat",.
        "general (EXPERIMENTAL).bat",
        // Выполняем операцию: "general (SIMPLE FAKE).bat",.
        "general (SIMPLE FAKE).bat",
        // Выполняем операцию: "general (SIMPLE FAKE ALT2).bat",.
        "general (SIMPLE FAKE ALT2).bat",
        // Выполняем операцию: "general (FAKE TLS AUTO).bat",.
        "general (FAKE TLS AUTO).bat",
        // Выполняем операцию: "general (FAKE TLS AUTO ALT3).bat",.
        "general (FAKE TLS AUTO ALT3).bat",
        // Выполняем операцию: ].
    ]
    // Выполняем операцию: .iter().
    .iter()
    // Выполняем операцию: .map(|name| extract_name(name)).
    .map(|name| extract_name(name))
    // Выполняем операцию: .collect();.
    .collect();

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: names,.
        names,
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "Baseline",.
            "Baseline",
            // Выполняем операцию: "ALT",.
            "ALT",
            // Выполняем операцию: "ALT 2",.
            "ALT 2",
            // Выполняем операцию: "Experimental",.
            "Experimental",
            // Выполняем операцию: "Simple Fake",.
            "Simple Fake",
            // Выполняем операцию: "Simple Fake ALT 2",.
            "Simple Fake ALT 2",
            // Выполняем операцию: "Fake TLS Auto",.
            "Fake TLS Auto",
            // Выполняем операцию: "Fake TLS Auto ALT 3",.
            "Fake TLS Auto ALT 3",
            // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную unique.
    let unique: std::collections::BTreeSet<&String> = names.iter().collect();
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: unique.len(),.
        unique.len(),
        // Выполняем операцию: names.len(),.
        names.len(),
        // Выполняем операцию: "имена стратегий должны быть уникальными".
        "имена стратегий должны быть уникальными" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_faketls_token_splits_into_words.
fn test_faketls_token_splits_into_words() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_name("general-18-faketls-auto-alt3.bat"),.
        extract_name("general-18-faketls-auto-alt3.bat"),
        // Выполняем операцию: "Fake TLS Auto ALT 3".
        "Fake TLS Auto ALT 3" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_name_underscores.
fn test_extract_name_underscores() {
    // Выполняем операцию: assert_eq!(extract_name("discord_youtube.bat"), "Discor.
    assert_eq!(extract_name("discord_youtube.bat"), "Discord Youtube");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_detect_services_by_name.
fn test_detect_services_by_name() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: detect_services("discord_youtube", ""),.
        detect_services("discord_youtube", ""),
        // Выполняем операцию: vec!["discord".to_string(), "youtube".to_string()].
        vec!["discord".to_string(), "youtube".to_string()] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_detect_services_priority_name.
fn test_detect_services_priority_name() {
    // Объявляем переменную content .
    let content = "--hostlist=\"%LISTS%list-discord.txt\"";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: detect_services("general-05-alt", content),.
        detect_services("general-05-alt", content),
        // Выполняем операцию: vec!["general".to_string()].
        vec!["general".to_string()] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_detect_services_fallback_content.
fn test_detect_services_fallback_content() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: detect_services("custom-1", "--hostlist=\"%LISTS%list-o.
        detect_services("custom-1", "--hostlist=\"%LISTS%list-outlast.txt\""),
        // Выполняем операцию: vec!["outlast-trials".to_string()].
        vec!["outlast-trials".to_string()] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_detect_services_fallback_general.
fn test_detect_services_fallback_general() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: detect_services("custom-2", "ничего подходящего"),.
        detect_services("custom-2", "ничего подходящего"),
        // Выполняем операцию: vec!["general".to_string()].
        vec!["general".to_string()] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_techniques_real_bat.
fn test_extract_techniques_real_bat() {
    // Объявляем переменную content .
    let content = concat!(
        // Выполняем операцию: "start \"zapret\" /min \"%BIN%winws.exe\" --new ",.
        "start \"zapret\" /min \"%BIN%winws.exe\" --new ",
        // Выполняем операцию: "--ipset=\"%LISTS%ipset-all.txt\" --new ",.
        "--ipset=\"%LISTS%ipset-all.txt\" --new ",
        // Выполняем операцию: "--filter-l7=discord,stun --dpi-desync=fake --new ".
        "--filter-l7=discord,stun --dpi-desync=fake --new " // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную techniques .
    let techniques = extract_techniques(content);

    // Выполняем операцию: assert!(techniques.contains(&"ipset".to_string()));.
    assert!(techniques.contains(&"ipset".to_string()));
    // Выполняем операцию: assert!(techniques.contains(&"l7-filter".to_string()));.
    assert!(techniques.contains(&"l7-filter".to_string()));
    // Выполняем операцию: assert!(techniques.contains(&"fake".to_string()));.
    assert!(techniques.contains(&"fake".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_techniques_unique_and_ordered.
fn test_extract_techniques_unique_and_ordered() {
    // Объявляем переменную content .
    let content = concat!(
        // Выполняем операцию: "start \"zapret\" /min \"%BIN%winws.exe\" --dpi-desync=.
        "start \"zapret\" /min \"%BIN%winws.exe\" --dpi-desync=fake ",
        // Выполняем операцию: "--filter-l7=x --ipset=\"y\"".
        "--filter-l7=x --ipset=\"y\"" // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_techniques(content),.
        extract_techniques(content),
        // Выполняем операцию: vec![.
        vec![
            // Выполняем операцию: "l7-filter".to_string(),.
            "l7-filter".to_string(),
            // Выполняем операцию: "ipset".to_string(),.
            "ipset".to_string(),
            // Выполняем операцию: "fake".to_string().
            "fake".to_string() // Выполняем операцию: ].
        ] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_techniques_ignores_service_bat_calls.
fn test_extract_techniques_ignores_service_bat_calls() {
    // Объявляем переменную content .
    let content = concat!(
        // Выполняем операцию: "call service.bat load_game_filter\n",.
        "call service.bat load_game_filter\n",
        // Выполняем операцию: "call service.bat load_user_lists\n",.
        "call service.bat load_user_lists\n",
        // Выполняем операцию: "start \"zapret\" /min \"%BIN%winws.exe\" --dpi-desync=.
        "start \"zapret\" /min \"%BIN%winws.exe\" --dpi-desync=fake" // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert_eq!(extract_techniques(content), vec!["fake".to_.
    assert_eq!(extract_techniques(content), vec!["fake".to_string()]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_techniques_follows_multiline_continuation.
fn test_extract_techniques_follows_multiline_continuation() {
    // Объявляем переменную content .
    let content = concat!(
        // Выполняем операцию: "@echo off\n",.
        "@echo off\n",
        // Выполняем операцию: "start \"zapret\" /min \"%BIN%winws.exe\" --wf-tcp=80,4.
        "start \"zapret\" /min \"%BIN%winws.exe\" --wf-tcp=80,443 ^\n",
        // Выполняем операцию: "--dpi-desync=multisplit --new ^\n",.
        "--dpi-desync=multisplit --new ^\n",
        // Выполняем операцию: "--dpi-desync-fake-tls=\"%BIN%tls_clienthello_ru.bin\"".
        "--dpi-desync-fake-tls=\"%BIN%tls_clienthello_ru.bin\"" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную techniques .
    let techniques = extract_techniques(content);

    // Выполняем операцию: assert!(techniques.contains(&"multisplit".to_string())).
    assert!(techniques.contains(&"multisplit".to_string()));
    // Выполняем операцию: assert!(techniques.contains(&"faketls".to_string()));.
    assert!(techniques.contains(&"faketls".to_string()));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_detect_file_type.
fn test_detect_file_type() {
    // Выполняем операцию: assert_eq!(detect_file_type("start ... winws.exe --new".
    assert_eq!(detect_file_type("start ... winws.exe --new"), "winws");
    // Выполняем операцию: assert_eq!(detect_file_type("goodbyedpi.exe"), "goodbye.
    assert_eq!(detect_file_type("goodbyedpi.exe"), "goodbye-dpi");
    // Выполняем операцию: assert_eq!(detect_file_type("никаких exe"), "unknown");.
    assert_eq!(detect_file_type("никаких exe"), "unknown");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_description_skips_chcp.
fn test_extract_description_skips_chcp() {
    // Объявляем переменную content .
    let content =
        // Выполняем операцию: "@echo off\nchcp 65001 > nul\n:: 65001 - UTF-8\ncd /d \.
        "@echo off\nchcp 65001 > nul\n:: 65001 - UTF-8\ncd /d \"%~dp0\"\ncall service.bat status\n";

    // Выполняем операцию: assert_eq!(extract_description(content), "");.
    assert_eq!(extract_description(content), "");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_description.
fn test_extract_description() {
    // Объявляем переменную content .
    let content = "@echo off\nchcp 65001 > nul\nREM Разблокировка Discord и YouTube\n";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_description(content),.
        extract_description(content),
        // Выполняем операцию: "Разблокировка Discord и YouTube".
        "Разблокировка Discord и YouTube" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_description_colon_prefix.
fn test_extract_description_colon_prefix() {
    // Объявляем переменную content .
    let content = "@echo off\n:: Обход DPI по TCP\n";

    // Выполняем операцию: assert_eq!(extract_description(content), "Обход DPI по .
    assert_eq!(extract_description(content), "Обход DPI по TCP");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_extract_version.
fn test_extract_version() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_version("zapret v1.10.3 release"),.
        extract_version("zapret v1.10.3 release"),
        // Выполняем операцию: Some("1.10.3".to_string()).
        Some("1.10.3".to_string()) // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(extract_version("версия 1.2"), Some("1.2".to.
    assert_eq!(extract_version("версия 1.2"), Some("1.2".to_string()));
    // Выполняем операцию: assert_eq!(extract_version("без версии"), None);.
    assert_eq!(extract_version("без версии"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_excluded_service_bat.
fn test_is_excluded_service_bat() {
    // Выполняем операцию: assert!(is_excluded("service.bat"));.
    assert!(is_excluded("service.bat"));
    // Выполняем операцию: assert!(is_excluded("SERVICE.BAT"));.
    assert!(is_excluded("SERVICE.BAT"));
    // Выполняем операцию: assert!(!is_excluded("general.bat"));.
    assert!(!is_excluded("general.bat"));
    // Закрываем блок.
}
