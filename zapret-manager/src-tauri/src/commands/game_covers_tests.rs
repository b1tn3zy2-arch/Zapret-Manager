// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_mime_for_known_extensions.
fn test_mime_for_known_extensions() {
    // Выполняем операцию: assert_eq!(mime_for(b"plain", "jpg"), "jpeg");.
    assert_eq!(mime_for(b"plain", "jpg"), "jpeg");
    // Выполняем операцию: assert_eq!(mime_for(b"\x89PNG\r\n\x1a\nrest", "jpg"), ".
    assert_eq!(mime_for(b"\x89PNG\r\n\x1a\nrest", "jpg"), "png");
    // Выполняем операцию: assert_eq!(mime_for(b"RIFFxxxxWEBP", "bin"), "webp");.
    assert_eq!(mime_for(b"RIFFxxxxWEBP", "bin"), "webp");
    // Выполняем операцию: assert_eq!(mime_for(b"GIF89a", "bin"), "gif");.
    assert_eq!(mime_for(b"GIF89a", "bin"), "gif");
    // Выполняем операцию: assert_eq!(mime_for(b"BM", "bin"), "bmp");.
    assert_eq!(mime_for(b"BM", "bin"), "bmp");
    // Выполняем операцию: assert_eq!(mime_for(b"plain", "webp"), "webp");.
    assert_eq!(mime_for(b"plain", "webp"), "webp");
    // Выполняем операцию: assert_eq!(mime_for(b"plain", "bin"), "jpeg");.
    assert_eq!(mime_for(b"plain", "bin"), "jpeg");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_to_data_uri_encodes_bytes.
fn test_to_data_uri_encodes_bytes() {
    // Объявляем переменную uri .
    let uri = to_data_uri(b"abc", "jpg").unwrap_or_default();

    // Выполняем операцию: assert!(uri.starts_with("data:image/jpeg;base64,"));.
    assert!(uri.starts_with("data:image/jpeg;base64,"));
    // Выполняем операцию: assert!(uri.ends_with("YWJj"));.
    assert!(uri.ends_with("YWJj"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_to_data_uri_rejects_empty_and_huge_payloads.
fn test_to_data_uri_rejects_empty_and_huge_payloads() {
    // Выполняем операцию: assert!(to_data_uri(&[], "jpg").is_err());.
    assert!(to_data_uri(&[], "jpg").is_err());
    // Выполняем операцию: assert!(to_data_uri(&vec![0; MAX_COVER_BYTES as usize +.
    assert!(to_data_uri(&vec![0; MAX_COVER_BYTES as usize + 1], "jpg").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_sha_name_is_stable_and_short.
fn test_sha_name_is_stable_and_short() {
    // Объявляем переменную first .
    let first = sha_name(Path::new("C:\\covers\\portal.jpg"));
    // Объявляем переменную second .
    let second = sha_name(Path::new("C:\\covers\\portal.jpg"));
    // Объявляем переменную other .
    let other = sha_name(Path::new("C:\\covers\\doom.jpg"));

    // Выполняем операцию: assert_eq!(first, second);.
    assert_eq!(first, second);
    // Выполняем операцию: assert_eq!(first.len(), 16);.
    assert_eq!(first.len(), 16);
    // Выполняем операцию: assert_ne!(first, other);.
    assert_ne!(first, other);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cover_url_template_uses_appid.
fn test_cover_url_template_uses_appid() {
    // Выполняем операцию: assert!(COVER_URL_TEMPLATE.contains("{appid}"));.
    assert!(COVER_URL_TEMPLATE.contains("{appid}"));
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: COVER_URL_TEMPLATE.replace("{appid}", "620"),.
        COVER_URL_TEMPLATE.replace("{appid}", "620"),
        // Выполняем операцию: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/.
        "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900.jpg" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_steam_search_term_strips_executable_suffix.
fn test_steam_search_term_strips_executable_suffix() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: steam_search_term("EscapeTheBackrooms — Backrooms-Win64.
        steam_search_term("EscapeTheBackrooms — Backrooms-Win64-Shipping"),
        // Выполняем операцию: "EscapeTheBackrooms".
        "EscapeTheBackrooms" // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert_eq!(steam_search_term("Zapret Test Game"), "Zapr.
    assert_eq!(steam_search_term("Zapret Test Game"), "Zapret Test Game");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_steam_appid_matches_normalized_name.
fn test_pick_steam_appid_matches_normalized_name() {
    // Объявляем переменную json .
    let json = r#"{"total":2,"items":[{"id":1942120,"name":"Escape the Backrooms"},{"id":123,"name":"Other Game"}]}"#;

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: pick_steam_appid(json, "EscapeTheBackrooms"),.
        pick_steam_appid(json, "EscapeTheBackrooms"),
        // Выполняем операцию: Some("1942120".to_string()).
        Some("1942120".to_string()) // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_steam_appid_returns_none_without_match.
fn test_pick_steam_appid_returns_none_without_match() {
    // Объявляем переменную json .
    let json = r#"{"total":1,"items":[{"id":1,"name":"Totally Different"}]}"#;

    // Выполняем операцию: assert_eq!(pick_steam_appid(json, "EscapeTheBackrooms").
    assert_eq!(pick_steam_appid(json, "EscapeTheBackrooms"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_encode_term_escapes_spaces.
fn test_encode_term_escapes_spaces() {
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: encode_term("escape the backrooms"),.
        encode_term("escape the backrooms"),
        // Выполняем операцию: "escape%20the%20backrooms".
        "escape%20the%20backrooms" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Объявляем функцию temp_game_dir.
fn temp_game_dir(name: &str) -> PathBuf {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-cover-{name}"));

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).expect("папка создана");.
    std::fs::create_dir_all(&dir).expect("папка создана");

    // Выполняем операцию: dir.
    dir
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_folder_cover_prefers_library_cover.
fn test_pick_folder_cover_prefers_library_cover() {
    // Объявляем переменную dir .
    let dir = temp_game_dir("prefer");

    // Выполняем операцию: std::fs::write(dir.join("logo.png"), b"tiny").unwrap();.
    std::fs::write(dir.join("logo.png"), b"tiny").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("library_600x900.jpg"), b"cover.
    std::fs::write(dir.join("library_600x900.jpg"), b"cover").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("screenshot.jpg"), b"huge paylo.
    std::fs::write(dir.join("screenshot.jpg"), b"huge payload").unwrap();

    // Объявляем переменную picked .
    let picked = pick_folder_cover(&dir).expect("обложка найдена");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: picked.file_name().and_then(|name| name.to_str()),.
        picked.file_name().and_then(|name| name.to_str()),
        // Выполняем операцию: Some("library_600x900.jpg").
        Some("library_600x900.jpg") // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_folder_cover_is_case_insensitive.
fn test_pick_folder_cover_is_case_insensitive() {
    // Объявляем переменную dir .
    let dir = temp_game_dir("case");

    // Выполняем операцию: std::fs::write(dir.join("Cover.JPG"), b"cover").unwrap(.
    std::fs::write(dir.join("Cover.JPG"), b"cover").unwrap();
    // Выполняем операцию: std::fs::write(dir.join("random.jpg"), b"whatever").unw.
    std::fs::write(dir.join("random.jpg"), b"whatever").unwrap();

    // Объявляем переменную picked .
    let picked = pick_folder_cover(&dir).expect("обложка найдена");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: picked.file_name().and_then(|name| name.to_str()),.
        picked.file_name().and_then(|name| name.to_str()),
        // Выполняем операцию: Some("Cover.JPG").
        Some("Cover.JPG") // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_folder_cover_falls_back_to_largest_image.
fn test_pick_folder_cover_falls_back_to_largest_image() {
    // Объявляем переменную dir .
    let dir = temp_game_dir("largest");

    // Выполняем операцию: std::fs::write(dir.join("small.jpg"), b"12").unwrap();.
    std::fs::write(dir.join("small.jpg"), b"12").unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join("big.png"),.
        dir.join("big.png"),
        // Выполняем операцию: vec![7_u8; MIN_FOLDER_COVER_BYTES as usize + 1],.
        vec![7_u8; MIN_FOLDER_COVER_BYTES as usize + 1],
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();
    // Выполняем операцию: std::fs::write(dir.join("notes.txt"), b"ignored").unwra.
    std::fs::write(dir.join("notes.txt"), b"ignored").unwrap();

    // Объявляем переменную picked .
    let picked = pick_folder_cover(&dir).expect("обложка найдена");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: picked.file_name().and_then(|name| name.to_str()),.
        picked.file_name().and_then(|name| name.to_str()),
        // Выполняем операцию: Some("big.png").
        Some("big.png") // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_folder_cover_skips_tiny_extras.
fn test_pick_folder_cover_skips_tiny_extras() {
    // Мелкие картинки — иконки: на вертикальной карточке они
    // растягиваются в мыло, поэтому кандидатом быть не должны.
    // Объявляем переменную dir .
    let dir = temp_game_dir("tiny-extras");

    // Выполняем операцию: std::fs::write(dir.join("icon.png"), vec![1_u8; 2048])..
    std::fs::write(dir.join("icon.png"), vec![1_u8; 2048]).unwrap();
    // Выполняем операцию: std::fs::write(.
    std::fs::write(
        // Выполняем операцию: dir.join("poster.png"),.
        dir.join("poster.png"),
        // Выполняем операцию: vec![2_u8; MIN_FOLDER_COVER_BYTES as usize - 1],.
        vec![2_u8; MIN_FOLDER_COVER_BYTES as usize - 1],
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .unwrap();.
    .unwrap();

    // Выполняем операцию: assert!(pick_folder_cover(&dir).is_none());.
    assert!(pick_folder_cover(&dir).is_none());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_folder_cover_ignores_unsupported_files.
fn test_pick_folder_cover_ignores_unsupported_files() {
    // Объявляем переменную dir .
    let dir = temp_game_dir("unsupported");

    // Выполняем операцию: std::fs::write(dir.join("config.ini"), vec![0_u8; 4096].
    std::fs::write(dir.join("config.ini"), vec![0_u8; 4096]).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("data.bin"), vec![0_u8; 4096])..
    std::fs::write(dir.join("data.bin"), vec![0_u8; 4096]).unwrap();

    // Выполняем операцию: assert!(pick_folder_cover(&dir).is_none());.
    assert!(pick_folder_cover(&dir).is_none());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_pick_folder_cover_skips_subfolders.
fn test_pick_folder_cover_skips_subfolders() {
    // Объявляем переменную dir .
    let dir = temp_game_dir("subfolders");

    // Выполняем операцию: std::fs::create_dir_all(dir.join("Art")).unwrap();.
    std::fs::create_dir_all(dir.join("Art")).unwrap();
    // Выполняем операцию: std::fs::write(dir.join("Art").join("cover.jpg"), b"nes.
    std::fs::write(dir.join("Art").join("cover.jpg"), b"nested").unwrap();

    // Выполняем операцию: assert!(pick_folder_cover(&dir).is_none());.
    assert!(pick_folder_cover(&dir).is_none());

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}
