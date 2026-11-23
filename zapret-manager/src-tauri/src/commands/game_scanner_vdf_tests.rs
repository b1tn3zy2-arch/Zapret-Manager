// Подключаем модули: super::*;.
use super::*;

// Объявляем константу ACF.
const ACF: &str = r#""AppState"
{
	"appid"		"1203220"
	"name"		"Outlast Trials"
	"installdir"		"Outlast Trials"
	"StateFlags"		"4"
}
"#;

// Объявляем константу LIBRARY_OLD.
const LIBRARY_OLD: &str = r#""libraryfolders"
{
	"0"
	{
		"path"		"D:\\SteamLibrary"
		"label"		""
	}
	"1"
	{
		"path"		"E:\\Games\\steam"
	}
}
"#;

// Объявляем константу LIBRARY_NEW.
const LIBRARY_NEW: &str = r#""libraryfolders"
{
	"0"		"C:\\Program Files (x86)\\Steam"
	"1"		"D:\\SteamLibrary"
}
"#;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_acf_reads_core_fields.
fn test_parse_acf_reads_core_fields() {
    // Объявляем переменную pairs .
    let pairs = parse_acf(ACF);

    // Выполняем операцию: assert_eq!(pairs.get("appid").map(String::as_str), Some.
    assert_eq!(pairs.get("appid").map(String::as_str), Some("1203220"));
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: pairs.get("name").map(String::as_str),.
        pairs.get("name").map(String::as_str),
        // Выполняем операцию: Some("Outlast Trials").
        Some("Outlast Trials") // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(pairs.get("StateFlags").map(String::as_str),.
    assert_eq!(pairs.get("StateFlags").map(String::as_str), Some("4"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_acf_ignores_nested_blocks.
fn test_parse_acf_ignores_nested_blocks() {
    // Объявляем переменную content .
    let content = "\"AppState\"\n{\n\t\"userinfo\"\n\t{\n\t\t\"steamid\"\t\t\"42\"\n\t}\n\t\"appid\"\t\t\"570\"\n}\n";

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parse_acf(content).get("appid").map(String::as_str),.
        parse_acf(content).get("appid").map(String::as_str),
        // Выполняем операцию: Some("570").
        Some("570") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_acf_handles_escaped_backslashes.
fn test_parse_acf_handles_escaped_backslashes() {
    // Объявляем переменную content .
    let content = "\"AppState\"\n{\n\t\"installdir\"\t\t\"Games\\\\Folder\"\n}\n";

    // Выполняем операцию: assert_eq!(parse_install_dir(content).as_deref(), Some(.
    assert_eq!(parse_install_dir(content).as_deref(), Some("Games\\Folder"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_install_dir_falls_back_to_name.
fn test_parse_install_dir_falls_back_to_name() {
    // Объявляем переменную content .
    let content = "\"AppState\"\n{\n\t\"name\"\t\t\"Portal 2\"\n}\n";

    // Выполняем операцию: assert_eq!(parse_install_dir(content).as_deref(), Some(.
    assert_eq!(parse_install_dir(content).as_deref(), Some("Portal 2"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_library_paths_old_format.
fn test_parse_library_paths_old_format() {
    // Объявляем переменную paths .
    let paths = parse_library_paths(LIBRARY_OLD);

    // Выполняем операцию: assert_eq!(paths, vec!["D:\\SteamLibrary", "E:\\Games\\.
    assert_eq!(paths, vec!["D:\\SteamLibrary", "E:\\Games\\steam"]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_library_paths_new_format.
fn test_parse_library_paths_new_format() {
    // Объявляем переменную paths .
    let paths = parse_library_paths(LIBRARY_NEW);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: paths,.
        paths,
        // Выполняем операцию: vec!["C:\\Program Files (x86)\\Steam", "D:\\SteamLibrar.
        vec!["C:\\Program Files (x86)\\Steam", "D:\\SteamLibrary"] // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_library_paths_skips_empty_entries.
fn test_parse_library_paths_skips_empty_entries() {
    // Объявляем переменную content .
    let content = "\"libraryfolders\"\n{\n\t\"0\"\t\t\"\"\n\t\"1\"\t\t\"D:\\\\Games\"\n}\n";

    // Выполняем операцию: assert_eq!(parse_library_paths(content), vec!["D:\\Game.
    assert_eq!(parse_library_paths(content), vec!["D:\\Games"]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_parse_empty_content_is_safe.
fn test_parse_empty_content_is_safe() {
    // Выполняем операцию: assert!(parse_acf("").is_empty());.
    assert!(parse_acf("").is_empty());
    // Выполняем операцию: assert!(parse_library_paths("").is_empty());.
    assert!(parse_library_paths("").is_empty());
    // Закрываем блок.
}
