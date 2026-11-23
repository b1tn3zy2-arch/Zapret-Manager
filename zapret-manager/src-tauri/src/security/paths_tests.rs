//! Тесты валидации путей: id стратегий, имена файлов и защита
//! от выхода за разрешённую папку (path traversal).

// Подключаем модули: super::*;.
use super::*;

// Объявляем функцию temp_dir.
fn temp_dir(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-paths-{name}-{}", std::process::id()));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).expect("временный каталог.
    std::fs::create_dir_all(&dir).expect("временный каталог");
    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_appid_accepts_only_digits.
fn test_appid_accepts_only_digits() {
    // Выполняем операцию: assert!(is_valid_appid("730"));.
    assert!(is_valid_appid("730"));
    // Выполняем операцию: assert!(is_valid_appid(" 1234567890 "));.
    assert!(is_valid_appid(" 1234567890 "));
    // Выполняем операцию: assert!(!is_valid_appid(""));.
    assert!(!is_valid_appid(""));
    // Выполняем операцию: assert!(!is_valid_appid("../730"));.
    assert!(!is_valid_appid("../730"));
    // Выполняем операцию: assert!(!is_valid_appid("730/evil"));.
    assert!(!is_valid_appid("730/evil"));
    // Выполняем операцию: assert!(!is_valid_appid("730.jpg"));.
    assert!(!is_valid_appid("730.jpg"));
    // Выполняем операцию: assert!(!is_valid_appid(&"1".repeat(21)));.
    assert!(!is_valid_appid(&"1".repeat(21)));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strategy_id_accepts_safe_ids.
fn test_strategy_id_accepts_safe_ids() {
    // Выполняем операцию: assert!(validate_strategy_id("strategy_1").is_ok());.
    assert!(validate_strategy_id("strategy_1").is_ok());
    // Выполняем операцию: assert!(validate_strategy_id("a-b-c").is_ok());.
    assert!(validate_strategy_id("a-b-c").is_ok());
    // Выполняем операцию: assert!(validate_strategy_id("_hidden").is_ok());.
    assert!(validate_strategy_id("_hidden").is_ok());
    // Выполняем операцию: assert!(validate_strategy_id(&"a".repeat(MAX_STRATEGY_I.
    assert!(validate_strategy_id(&"a".repeat(MAX_STRATEGY_ID_LEN)).is_ok());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strategy_id_rejects_unsafe_ids.
fn test_strategy_id_rejects_unsafe_ids() {
    // Перебираем элементы коллекции.
    for id in [
        // Выполняем операцию: "",.
        "",
        // Выполняем операцию: "..",.
        "..",
        // Выполняем операцию: "../evil",.
        "../evil",
        // Выполняем операцию: "a/b",.
        "a/b",
        // Выполняем операцию: "a\\b",.
        "a\\b",
        // Выполняем операцию: "-leading-dash",.
        "-leading-dash",
        // Выполняем операцию: "with space",.
        "with space",
        // Выполняем операцию: "точка",.
        "точка",
        // Выполняем операцию: "a.b",.
        "a.b",
        // Выполняем операцию: ] {.
    ] {
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: validate_strategy_id(id).is_err(),.
            validate_strategy_id(id).is_err(),
            // Выполняем операцию: "id «{id}» должен быть отклонён".
            "id «{id}» должен быть отклонён" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: assert!(validate_strategy_id(&"a".repeat(MAX_STRATEGY_I.
    assert!(validate_strategy_id(&"a".repeat(MAX_STRATEGY_ID_LEN + 1)).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_safe_filename_accepts_plain_names.
fn test_safe_filename_accepts_plain_names() {
    // Выполняем операцию: assert_eq!(safe_filename("strategy.bat").unwrap(), "str.
    assert_eq!(safe_filename("strategy.bat").unwrap(), "strategy.bat");
    // Выполняем операцию: assert_eq!(safe_filename("  list.txt  ").unwrap(), "lis.
    assert_eq!(safe_filename("  list.txt  ").unwrap(), "list.txt");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_safe_filename_rejects_traversal_and_specials.
fn test_safe_filename_rejects_traversal_and_specials() {
    // Перебираем элементы коллекции.
    for name in [
        // Выполняем операцию: "",.
        "",
        // Выполняем операцию: "   ",.
        "   ",
        // Выполняем операцию: ".",.
        ".",
        // Выполняем операцию: "..",.
        "..",
        // Выполняем операцию: "..\\secret.txt",.
        "..\\secret.txt",
        // Выполняем операцию: "a/../b",.
        "a/../b",
        // Выполняем операцию: "a\\b",.
        "a\\b",
        // Выполняем операцию: "a:b",.
        "a:b",
        // Выполняем операцию: "a*b",.
        "a*b",
        // Выполняем операцию: "a?b",.
        "a?b",
        // Выполняем операцию: "a\"b",.
        "a\"b",
        // Выполняем операцию: "a<b",.
        "a<b",
        // Выполняем операцию: "a>b",.
        "a>b",
        // Выполняем операцию: "a|b",.
        "a|b",
        // Выполняем операцию: ] {.
    ] {
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: safe_filename(name).is_err(),.
            safe_filename(name).is_err(),
            // Выполняем операцию: "имя «{name}» должно быть отклонено".
            "имя «{name}» должно быть отклонено" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: assert!(safe_filename(&"a".repeat(MAX_FILENAME_LEN + 1).
    assert!(safe_filename(&"a".repeat(MAX_FILENAME_LEN + 1)).is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_safe_path_accepts_file_inside_base.
fn test_safe_path_accepts_file_inside_base() {
    // Объявляем переменную dir .
    let dir = temp_dir("inside");
    // Объявляем переменную file .
    let file = dir.join("ok.txt");
    // Выполняем операцию: std::fs::write(&file, "x").expect("файл");.
    std::fs::write(&file, "x").expect("файл");

    // Выполняем операцию: assert!(safe_path(&dir, &file).is_ok());.
    assert!(safe_path(&dir, &file).is_ok());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_safe_path_rejects_traversal.
fn test_safe_path_rejects_traversal() {
    // Объявляем переменную dir .
    let dir = temp_dir("base");
    // Объявляем переменную outside .
    let outside = temp_dir("outside");
    // Объявляем переменную file .
    let file = outside.join("secret.txt");
    // Выполняем операцию: std::fs::write(&file, "secret").expect("файл");.
    std::fs::write(&file, "secret").expect("файл");

    // Объявляем переменную error .
    let error = safe_path(&dir, &file).expect_err("путь вне базы");

    // Выполняем операцию: assert!(error.to_string().contains("проверкой безопасно.
    assert!(error.to_string().contains("проверкой безопасности"));

    // Классический обход через `..` тоже отклоняется: canonicalize
    // разворачивает его до проверки вхождения.
    // Объявляем переменную sneaky .
    let sneaky = dir.join("..").join("..").join("secret.txt");
    // Выполняем операцию: assert!(safe_path(&dir, &sneaky).is_err());.
    assert!(safe_path(&dir, &sneaky).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&outside);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_safe_path_rejects_missing_candidate.
fn test_safe_path_rejects_missing_candidate() {
    // Объявляем переменную dir .
    let dir = temp_dir("missing");

    // Выполняем операцию: assert!(safe_path(&dir, &dir.join("nope.txt")).is_err().
    assert!(safe_path(&dir, &dir.join("nope.txt")).is_err());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_is_within_compares_components.
fn test_is_within_compares_components() {
    // Выполняем операцию: assert!(is_within(Path::new(r"C:\a\b\c"), Path::new(r"C.
    assert!(is_within(Path::new(r"C:\a\b\c"), Path::new(r"C:\a\b")));
    // Выполняем операцию: assert!(!is_within(Path::new(r"C:\a\bb"), Path::new(r"C.
    assert!(!is_within(Path::new(r"C:\a\bb"), Path::new(r"C:\a\b")));
    // Выполняем операцию: assert!(!is_within(Path::new(r"C:\a\b"), Path::new(r"C:.
    assert!(!is_within(Path::new(r"C:\a\b"), Path::new(r"C:\a\b\c")));
    // Выполняем операцию: assert!(is_within(Path::new(r"C:\a\b\.\c"), Path::new(r.
    assert!(is_within(Path::new(r"C:\a\b\.\c"), Path::new(r"C:\a\b")));
    // Выполняем операцию: assert!(!is_within(.
    assert!(!is_within(
        // Выполняем операцию: Path::new(r"C:\a\b\..\..\secret"),.
        Path::new(r"C:\a\b\..\..\secret"),
        // Выполняем операцию: Path::new(r"C:\a\b").
        Path::new(r"C:\a\b") // Закрываем выражение или коллекцию.
    ));
    // Выполняем операцию: assert!(!is_within(Path::new(r"C:\a\b"), Path::new("")).
    assert!(!is_within(Path::new(r"C:\a\b"), Path::new("")));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_strip_extended_prefix.
fn test_strip_extended_prefix() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: strip_extended_prefix(PathBuf::from(r"\\?\C:\zapret")),.
        strip_extended_prefix(PathBuf::from(r"\\?\C:\zapret")),
        // Выполняем операцию: PathBuf::from(r"C:\zapret").
        PathBuf::from(r"C:\zapret") // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: strip_extended_prefix(PathBuf::from(r"\\?\UNC\server\sh.
        strip_extended_prefix(PathBuf::from(r"\\?\UNC\server\share")),
        // Выполняем операцию: PathBuf::from(r"\\server\share").
        PathBuf::from(r"\\server\share") // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: strip_extended_prefix(PathBuf::from(r"C:\plain")),.
        strip_extended_prefix(PathBuf::from(r"C:\plain")),
        // Выполняем операцию: PathBuf::from(r"C:\plain").
        PathBuf::from(r"C:\plain") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_strategy_file_checks_extension.
fn test_validate_strategy_file_checks_extension() {
    // Объявляем переменную dir .
    let dir = temp_dir("ext");
    // Объявляем переменную txt .
    let txt = dir.join("strategy.txt");
    // Выполняем операцию: std::fs::write(&txt, "x").expect("файл");.
    std::fs::write(&txt, "x").expect("файл");

    // Объявляем переменную error .
    let error = validate_strategy_file(&txt, None).expect_err("не .bat");

    // Выполняем операцию: assert!(error.to_string().contains("проверкой безопасно.
    assert!(error.to_string().contains("проверкой безопасности"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_validate_strategy_file_enforces_root.
fn test_validate_strategy_file_enforces_root() {
    // Объявляем переменную root .
    let root = temp_dir("root");
    // Объявляем переменную inside .
    let inside = root.join("strategy.bat");
    // Выполняем операцию: std::fs::write(&inside, "@echo off").expect("стратегия".
    std::fs::write(&inside, "@echo off").expect("стратегия");

    // Объявляем переменную outside .
    let outside = temp_dir("outside-bat");
    // Объявляем переменную outside_bat .
    let outside_bat = outside.join("strategy.bat");
    // Выполняем операцию: std::fs::write(&outside_bat, "@echo off").expect("страт.
    std::fs::write(&outside_bat, "@echo off").expect("стратегия");

    // Объявляем переменную resolved .
    let resolved = validate_strategy_file(&inside, Some(&root)).expect("внутри корня");
    // Выполняем операцию: assert_eq!(resolved.file_name().unwrap(), "strategy.bat.
    assert_eq!(resolved.file_name().unwrap(), "strategy.bat");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: validate_strategy_file(&outside_bat, Some(&root)).is_er.
        validate_strategy_file(&outside_bat, Some(&root)).is_err(),
        // Выполняем операцию: "файл вне корня отклоняется".
        "файл вне корня отклоняется" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&root);
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&outside);
    // Закрываем блок.
}
