use super::*;

#[test]
fn test_mime_for_known_extensions() {
    assert_eq!(mime_for("jpg"), "jpeg");
    assert_eq!(mime_for("PNG"), "png");
    assert_eq!(mime_for("webp"), "webp");
    assert_eq!(mime_for("bin"), "jpeg");
}

#[test]
fn test_to_data_uri_encodes_bytes() {
    let uri = to_data_uri(b"abc", "jpg").unwrap_or_default();

    assert!(uri.starts_with("data:image/jpeg;base64,"));
    assert!(uri.ends_with("YWJj"));
}

#[test]
fn test_to_data_uri_rejects_empty_and_huge_payloads() {
    assert!(to_data_uri(&[], "jpg").is_err());
    assert!(to_data_uri(&vec![0; MAX_COVER_BYTES as usize + 1], "jpg").is_err());
}

#[test]
fn test_sha_name_is_stable_and_short() {
    let first = sha_name(Path::new("C:\\covers\\portal.jpg"));
    let second = sha_name(Path::new("C:\\covers\\portal.jpg"));
    let other = sha_name(Path::new("C:\\covers\\doom.jpg"));

    assert_eq!(first, second);
    assert_eq!(first.len(), 16);
    assert_ne!(first, other);
}

#[test]
fn test_cover_url_template_uses_appid() {
    assert!(COVER_URL_TEMPLATE.contains("{appid}"));
    assert_eq!(
        COVER_URL_TEMPLATE.replace("{appid}", "620"),
        "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900.jpg"
    );
}
#[test]
fn test_steam_search_term_strips_executable_suffix() {
    assert_eq!(
        steam_search_term("EscapeTheBackrooms — Backrooms-Win64-Shipping"),
        "EscapeTheBackrooms"
    );
    assert_eq!(steam_search_term("Zapret Test Game"), "Zapret Test Game");
}

#[test]
fn test_pick_steam_appid_matches_normalized_name() {
    let json = r#"{"total":2,"items":[{"id":1942120,"name":"Escape the Backrooms"},{"id":123,"name":"Other Game"}]}"#;

    assert_eq!(
        pick_steam_appid(json, "EscapeTheBackrooms"),
        Some("1942120".to_string())
    );
}

#[test]
fn test_pick_steam_appid_returns_none_without_match() {
    let json = r#"{"total":1,"items":[{"id":1,"name":"Totally Different"}]}"#;

    assert_eq!(pick_steam_appid(json, "EscapeTheBackrooms"), None);
}

#[test]
fn test_encode_term_escapes_spaces() {
    assert_eq!(encode_term("escape the backrooms"), "escape%20the%20backrooms");
}
