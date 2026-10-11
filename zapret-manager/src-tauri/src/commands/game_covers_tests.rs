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