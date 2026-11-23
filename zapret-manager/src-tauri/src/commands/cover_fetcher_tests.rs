// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cached_cover_path_stays_inside_cache.
fn test_cached_cover_path_stays_inside_cache() {
    // Объявляем переменную sandbox .
    let sandbox = std::env::temp_dir().join(format!("zapret-cover-paths-{}", std::process::id()));
    // Объявляем переменную root .
    let root = sandbox.join("covers");
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&sandbox);
    // Выполняем операцию: std::fs::create_dir_all(&root).expect("кэш");.
    std::fs::create_dir_all(&root).expect("кэш");
    // Выполняем операцию: std::fs::write(root.join("730.jpg"), b"cover").expect(".
    std::fs::write(root.join("730.jpg"), b"cover").expect("обложка");
    // Выполняем операцию: std::fs::write(sandbox.join("secret.jpg"), b"secret").e.
    std::fs::write(sandbox.join("secret.jpg"), b"secret").expect("секрет");
    // Выполняем операцию: std::fs::write(root.join("notes.json"), b"{}").expect(".
    std::fs::write(root.join("notes.json"), b"{}").expect("json");

    // Объявляем переменную inside .
    let inside = resolve_cached_cover(&root, &root.join("730.jpg").to_string_lossy());

    // Выполняем операцию: assert!(inside.is_some(), "обычная обложка должна читат.
    assert!(inside.is_some(), "обычная обложка должна читаться");

    // Объявляем переменную traversal .
    let traversal = sandbox.join("..").join("secret.jpg");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: resolve_cached_cover(&root, &traversal.to_string_lossy(.
        resolve_cached_cover(&root, &traversal.to_string_lossy()).is_none(),
        // Выполняем операцию: "выход из кэша через .. запрещён".
        "выход из кэша через .. запрещён" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную secret .
    let secret = sandbox.join("secret.jpg");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: resolve_cached_cover(&root, &secret.to_string_lossy())..
        resolve_cached_cover(&root, &secret.to_string_lossy()).is_none(),
        // Выполняем операцию: "файл вне кэша запрещён".
        "файл вне кэша запрещён" // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: resolve_cached_cover(&root, &root.join("notes.json").to.
        resolve_cached_cover(&root, &root.join("notes.json").to_string_lossy()).is_none(),
        // Выполняем операцию: "не-картинки из кэша не отдаются".
        "не-картинки из кэша не отдаются" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&sandbox);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_min_cover_size_rejects_short_files.
fn test_min_cover_size_rejects_short_files() {
    // Порог отсекает заглушки CDN: настоящая обложка заметно крупнее.
    // Объявляем переменную short .
    let short = vec![0u8; MIN_COVER_BYTES - 1];
    // Объявляем переменную long .
    let long = vec![0u8; MIN_COVER_BYTES];

    // Выполняем операцию: assert!(short.len() < MIN_COVER_BYTES);.
    assert!(short.len() < MIN_COVER_BYTES);
    // Выполняем операцию: assert_eq!(long.len(), MIN_COVER_BYTES);.
    assert_eq!(long.len(), MIN_COVER_BYTES);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cdn_urls_use_expected_shape.
fn test_cdn_urls_use_expected_shape() {
    // Выполняем операцию: assert_eq!(COVER_URLS.len(), 2);.
    assert_eq!(COVER_URLS.len(), 2);

    // Перебираем элементы коллекции.
    for template in COVER_URLS {
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: template.contains("{appid}"),.
            template.contains("{appid}"),
            // Выполняем операцию: "адрес должен подставлять appid: {template}".
            "адрес должен подставлять appid: {template}" // Закрываем выражение или коллекцию.
        );
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: template.contains("cdn.akamai.steamstatic.com"),.
            template.contains("cdn.akamai.steamstatic.com"),
            // Выполняем операцию: "только CDN Steam: {template}".
            "только CDN Steam: {template}" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Первая попытка — вертикальная обложка (карточка высокая),
    // вторая — горизонтальная шапка как последний статический шанс.
    // Выполняем операцию: assert!(COVER_URLS[0].contains("library_600x900.jpg"));.
    assert!(COVER_URLS[0].contains("library_600x900.jpg"));
    // Выполняем операцию: assert!(COVER_URLS[1].contains("header.jpg"));.
    assert!(COVER_URLS[1].contains("header.jpg"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_appdetails_url_carries_appid.
fn test_appdetails_url_carries_appid() {
    // Объявляем переменную url .
    let url = APPDETAILS_URL.replace("{appid}", "4917440");

    // Выполняем операцию: assert!(url.contains("appids=4917440"));.
    assert!(url.contains("appids=4917440"));
    // Выполняем операцию: assert!(url.starts_with("https://store.steampowered.com.
    assert!(url.starts_with("https://store.steampowered.com"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cached_cover_rejects_broken_file.
fn test_cached_cover_rejects_broken_file() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-covers-{}", std::process::id()));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).expect("временный каталог.
    std::fs::create_dir_all(&dir).expect("временный каталог");

    // Объявляем переменную broken .
    let broken = dir.join("broken.jpg");
    // Выполняем операцию: std::fs::write(&broken, b"not an image").expect("запись.
    std::fs::write(&broken, b"not an image").expect("запись");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: cached_cover(&broken).is_none(),.
        cached_cover(&broken).is_none(),
        // Выполняем операцию: "битый файл не должен считаться обложкой".
        "битый файл не должен считаться обложкой" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную empty .
    let empty = dir.join("empty.jpg");
    // Выполняем операцию: std::fs::write(&empty, b"").expect("запись");.
    std::fs::write(&empty, b"").expect("запись");

    // Выполняем операцию: assert!(cached_cover(&empty).is_none());.
    assert!(cached_cover(&empty).is_none());

    // Объявляем переменную good .
    let good = dir.join("good.jpg");
    // Выполняем операцию: std::fs::write(&good, vec![7u8; MIN_COVER_BYTES]).expec.
    std::fs::write(&good, vec![7u8; MIN_COVER_BYTES]).expect("запись");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: cached_cover(&good),.
        cached_cover(&good),
        // Выполняем операцию: Some(CachedCover::Fresh(good.clone())),.
        Some(CachedCover::Fresh(good.clone())),
        // Выполняем операцию: "свежий файл должен считаться актуальным".
        "свежий файл должен считаться актуальным" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_looks_like_image_accepts_jpeg_and_png.
fn test_looks_like_image_accepts_jpeg_and_png() {
    // Выполняем операцию: assert!(looks_like_image(&[0xFF, 0xD8, 0xFF, 0xE0]));.
    assert!(looks_like_image(&[0xFF, 0xD8, 0xFF, 0xE0]));
    // Выполняем операцию: assert!(looks_like_image(b"\x89PNG\r\n\x1a\nrest"));.
    assert!(looks_like_image(b"\x89PNG\r\n\x1a\nrest"));
    // Выполняем операцию: assert!(!looks_like_image(b"<html>not found</html>"));.
    assert!(!looks_like_image(b"<html>not found</html>"));
    // Выполняем операцию: assert!(!looks_like_image(b""));.
    assert!(!looks_like_image(b""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_index_roundtrip_keeps_names_normalized.
fn test_index_roundtrip_keeps_names_normalized() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-cover-index-{}", std::process::id()));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).expect("временный каталог.
    std::fs::create_dir_all(&dir).expect("временный каталог");

    // Объявляем переменную path .
    let path = dir.join(SEARCH_INDEX_FILE);

    // Объявляем переменную index .
    let mut index = read_index(&path);

    // Выполняем операцию: assert!(index.is_empty(), "пустой индекс для отсутствую.
    assert!(index.is_empty(), "пустой индекс для отсутствующего файла");

    // Объявляем переменную long_dark_key .
    let long_dark_key = normalize_title("The Long Dark — tld");

    // Выполняем операцию: index.insert(long_dark_key.clone(), "460620".to_string(.
    index.insert(long_dark_key.clone(), "460620".to_string());
    // Выполняем операцию: index.insert(normalize_title("Zapret Test Game"), Strin.
    index.insert(normalize_title("Zapret Test Game"), String::new());

    // Выполняем операцию: write_index(&path, &index);.
    write_index(&path, &index);

    // Объявляем переменную reloaded .
    let reloaded = read_index(&path);

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: reloaded.get(&long_dark_key).map(String::as_str),.
        reloaded.get(&long_dark_key).map(String::as_str),
        // Выполняем операцию: Some("460620").
        Some("460620") // Закрываем выражение или коллекцию.
    );
    // Пустое значение — «игры в Steam нет»: поиск повторять не нужно.
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: reloaded.
        reloaded
            // Выполняем операцию: .get(&normalize_title("Zapret Test Game")).
            .get(&normalize_title("Zapret Test Game"))
            // Выполняем операцию: .map(String::as_str),.
            .map(String::as_str),
        // Выполняем операцию: Some("").
        Some("") // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_index_read_survives_broken_file.
fn test_index_read_survives_broken_file() {
    // Объявляем переменную dir .
    let dir = std::env::temp_dir().join(format!("zapret-cover-index-bad-{}", std::process::id()));
    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Выполняем операцию: std::fs::create_dir_all(&dir).expect("временный каталог.
    std::fs::create_dir_all(&dir).expect("временный каталог");

    // Объявляем переменную path .
    let path = dir.join(SEARCH_INDEX_FILE);

    // Выполняем операцию: std::fs::write(&path, b"{ broken json").expect("запись".
    std::fs::write(&path, b"{ broken json").expect("запись");

    // Выполняем операцию: assert!(.
    assert!(
        // Выполняем операцию: read_index(&path).is_empty(),.
        read_index(&path).is_empty(),
        // Выполняем операцию: "битый индекс не должен ломать сканирование".
        "битый индекс не должен ломать сканирование" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную _ .
    let _ = std::fs::remove_dir_all(&dir);
    // Закрываем блок.
}

/// Конфиг приложения: в нём описан протокол ресурсов.
// Объявляем константу CONFIG.
const CONFIG: &str = include_str!("../../tauri.conf.json");

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_asset_scope_allows_only_cover_cache.
fn test_asset_scope_allows_only_cover_cache() {
    // Объявляем переменную config.
    let config: serde_json::Value = serde_json::from_str(CONFIG).expect("конфиг");

    // Объявляем переменную asset .
    let asset = config["app"]["security"]["assetProtocol"]
        // Выполняем операцию: .as_object().
        .as_object()
        // Выполняем операцию: .expect("раздел протокола ресурсов");.
        .expect("раздел протокола ресурсов");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: asset.get("enable").and_then(serde_json::Value::as_bool.
        asset.get("enable").and_then(serde_json::Value::as_bool),
        // Выполняем операцию: Some(true),.
        Some(true),
        // Выполняем операцию: "протокол ресурсов должен быть включён: без него обложк.
        "протокол ресурсов должен быть включён: без него обложки не грузятся" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную scope .
    let scope = asset
        // Выполняем операцию: .get("scope").
        .get("scope")
        // Выполняем операцию: .and_then(serde_json::Value::as_array).
        .and_then(serde_json::Value::as_array)
        // Выполняем операцию: .expect("список разрешений");.
        .expect("список разрешений");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: scope.len(),.
        scope.len(),
        // Выполняем операцию: 1,.
        1,
        // Выполняем операцию: "разрешён должен быть только кэш обложек: {scope:?}".
        "разрешён должен быть только кэш обложек: {scope:?}" // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную entry .
    let entry = scope[0]
        // Выполняем операцию: .as_str().
        .as_str()
        // Выполняем операцию: .expect("строка разрешения").
        .expect("строка разрешения")
        // Выполняем операцию: .replace('\\', "/");.
        .replace('\\', "/");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: entry, "$APPDATA/cache/covers/**",.
        entry,
        "$APPDATA/cache/covers/**",
        // Выполняем операцию: "разрешение должно указывать на папку кэша обложек".
        "разрешение должно указывать на папку кэша обложек" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_asset_scope_does_not_repeat_app_identifier.
fn test_asset_scope_does_not_repeat_app_identifier() {
    // `$APPDATA` в Tauri уже указывает на каталог данных приложения
    // вместе с идентификатором. Если дописать идентификатор ещё раз,
    // путь не совпадёт с реальным и картинки не загрузятся.
    // Объявляем переменную config.
    let config: serde_json::Value = serde_json::from_str(CONFIG).expect("конфиг");
    // Объявляем переменную identifier .
    let identifier = config["identifier"].as_str().expect("идентификатор");

    // Объявляем переменную scope .
    let scope = config["app"]["security"]["assetProtocol"]["scope"]
        // Выполняем операцию: .as_array().
        .as_array()
        // Выполняем операцию: .expect("список разрешений");.
        .expect("список разрешений");

    // Перебираем элементы коллекции.
    for entry in scope {
        // Объявляем переменную entry .
        let entry = entry.as_str().expect("строка разрешения");

        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: !entry.contains(identifier),.
            !entry.contains(identifier),
            // Выполняем операцию: "идентификатор не нужно повторять: {entry}".
            "идентификатор не нужно повторять: {entry}" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}
