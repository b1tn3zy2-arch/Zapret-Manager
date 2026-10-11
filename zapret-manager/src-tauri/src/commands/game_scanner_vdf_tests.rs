use super::*;

const ACF: &str = r#""AppState"
{
	"appid"		"1203220"
	"name"		"Outlast Trials"
	"installdir"		"Outlast Trials"
	"StateFlags"		"4"
}
"#;

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

const LIBRARY_NEW: &str = r#""libraryfolders"
{
	"0"		"C:\\Program Files (x86)\\Steam"
	"1"		"D:\\SteamLibrary"
}
"#;

#[test]
fn test_parse_acf_reads_core_fields() {
    let pairs = parse_acf(ACF);

    assert_eq!(pairs.get("appid").map(String::as_str), Some("1203220"));
    assert_eq!(
        pairs.get("name").map(String::as_str),
        Some("Outlast Trials")
    );
    assert_eq!(pairs.get("StateFlags").map(String::as_str), Some("4"));
}

#[test]
fn test_parse_acf_ignores_nested_blocks() {
    let content = "\"AppState\"\n{\n\t\"userinfo\"\n\t{\n\t\t\"steamid\"\t\t\"42\"\n\t}\n\t\"appid\"\t\t\"570\"\n}\n";

    assert_eq!(parse_acf(content).get("appid").map(String::as_str), Some("570"));
}

#[test]
fn test_parse_acf_handles_escaped_backslashes() {
    let content = "\"AppState\"\n{\n\t\"installdir\"\t\t\"Games\\\\Folder\"\n}\n";

    assert_eq!(
        parse_install_dir(content).as_deref(),
        Some("Games\\Folder")
    );
}

#[test]
fn test_parse_install_dir_falls_back_to_name() {
    let content = "\"AppState\"\n{\n\t\"name\"\t\t\"Portal 2\"\n}\n";

    assert_eq!(
        parse_install_dir(content).as_deref(),
        Some("Portal 2")
    );
}

#[test]
fn test_parse_library_paths_old_format() {
    let paths = parse_library_paths(LIBRARY_OLD);

    assert_eq!(paths, vec!["D:\\SteamLibrary", "E:\\Games\\steam"]);
}

#[test]
fn test_parse_library_paths_new_format() {
    let paths = parse_library_paths(LIBRARY_NEW);

    assert_eq!(
        paths,
        vec!["C:\\Program Files (x86)\\Steam", "D:\\SteamLibrary"]
    );
}

#[test]
fn test_parse_library_paths_skips_empty_entries() {
    let content = "\"libraryfolders\"\n{\n\t\"0\"\t\t\"\"\n\t\"1\"\t\t\"D:\\\\Games\"\n}\n";

    assert_eq!(parse_library_paths(content), vec!["D:\\Games"]);
}

#[test]
fn test_parse_empty_content_is_safe() {
    assert!(parse_acf("").is_empty());
    assert!(parse_library_paths("").is_empty());
}