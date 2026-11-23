// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_single_entry_host_is_accepted.
fn test_single_entry_host_is_accepted() {
    // Объявляем переменную url .
    let url = validate_payment_entry_url("https://maxima-vps.online/ru/vpn").expect("url");

    // Выполняем операцию: assert_eq!(url.host_str(), Some("maxima-vps.online"));.
    assert_eq!(url.host_str(), Some("maxima-vps.online"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_unknown_entry_host_is_rejected.
fn test_unknown_entry_host_is_rejected() {
    // Объявляем переменную error .
    let error = validate_payment_entry_url("https://evil.example.com/pay")
        // Выполняем операцию: .expect_err("чужой домен не открывается");.
        .expect_err("чужой домен не открывается");

    // Выполняем операцию: assert!(error.to_string().contains("доверенном"));.
    assert!(error.to_string().contains("доверенном"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_non_https_entry_is_rejected.
fn test_non_https_entry_is_rejected() {
    // Выполняем операцию: assert!(validate_payment_entry_url("http://maxima-vps.o.
    assert!(validate_payment_entry_url("http://maxima-vps.online/").is_err());
    // Выполняем операцию: assert!(validate_payment_entry_url("javascript:alert(1).
    assert!(validate_payment_entry_url("javascript:alert(1)").is_err());
    // Выполняем операцию: assert!(validate_payment_entry_url("file:///C:/Windows".
    assert!(validate_payment_entry_url("file:///C:/Windows").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_cabinet_host_of_maxima_is_accepted.
fn test_cabinet_host_of_maxima_is_accepted() {
    // Перебираем элементы коллекции.
    for uri in [
        // Выполняем операцию: "https://maximavps.cloud/lk/panel",.
        "https://maximavps.cloud/lk/panel",
        // Выполняем операцию: "https://cabinet.maximavps.cloud/login",.
        "https://cabinet.maximavps.cloud/login",
        // Выполняем операцию: "https://maximacloud.online/ru",.
        "https://maximacloud.online/ru",
        // Выполняем операцию: "https://panel.maximacloud.online/dashboard?token=abc",.
        "https://panel.maximacloud.online/dashboard?token=abc",
        // Короткий домен ссылок-подписок: кабинет может вести на него.
        // Выполняем операцию: "https://maxima.run/PCDqYMIF",.
        "https://maxima.run/PCDqYMIF",
        // Выполняем операцию: ] {.
    ] {
        // Выполняем операцию: assert!(.
        assert!(
            // Выполняем операцию: validate_payment_entry_url(uri).is_ok(),.
            validate_payment_entry_url(uri).is_ok(),
            // Выполняем операцию: "кабинет Maxima должен открываться: {uri}".
            "кабинет Maxima должен открываться: {uri}" // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_lookalike_maxima_host_is_rejected.
fn test_lookalike_maxima_host_is_rejected() {
    // Выполняем операцию: assert!(validate_payment_entry_url("https://maximavps.c.
    assert!(validate_payment_entry_url("https://maximavps.cloud.evil.io/ru").is_err());
    // Выполняем операцию: assert!(validate_payment_entry_url("https://fake-maxima.
    assert!(validate_payment_entry_url("https://fake-maximavps.cloud/ru").is_err());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_link_is_extracted_from_panel_html.
fn test_subscription_link_is_extracted_from_panel_html() {
    // Объявляем переменную html .
    let html = r#"<html><script>window.__PANEL__ = {"subscription_url":"https://maximavps.cloud/sub/8f2a1b3c"}</script></html>"#;

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_subscription_link(html).as_deref(),.
        extract_subscription_link(html).as_deref(),
        // Выполняем операцию: Some("https://maximavps.cloud/sub/8f2a1b3c").
        Some("https://maximavps.cloud/sub/8f2a1b3c") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_link_with_token_is_extracted.
fn test_subscription_link_with_token_is_extracted() {
    // Объявляем переменную html .
    let html = r#"<a href="https://panel.maximacloud.online/api/v1/client/subscribe?token=Ab12Cd34">Подписка</a>"#;

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_subscription_link(html).as_deref(),.
        extract_subscription_link(html).as_deref(),
        // Выполняем операцию: Some("https://panel.maximacloud.online/api/v1/client/su.
        Some("https://panel.maximacloud.online/api/v1/client/subscribe?token=Ab12Cd34") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_foreign_subscription_links_are_ignored.
fn test_foreign_subscription_links_are_ignored() {
    // Объявляем переменную html .
    let html = r#"<a href="https://evil.cloud/sub/aabbccdd">Ловушка</a>
        <a href="https://www.maximavps.cloud/sub/ff1122aa">Максима</a>"#;

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_subscription_link(html).as_deref(),.
        extract_subscription_link(html).as_deref(),
        // Выполняем операцию: Some("https://www.maximavps.cloud/sub/ff1122aa").
        Some("https://www.maximavps.cloud/sub/ff1122aa") // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: assert_eq!(extract_subscription_link("<p>ничего похожег.
    assert_eq!(extract_subscription_link("<p>ничего похожего</p>"), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_maxima_short_link_is_extracted.
fn test_maxima_short_link_is_extracted() {
    // Объявляем переменную html .
    let html = r#"<button data-link="https://maxima.run/PCDqYMIF">Скопировать</button>"#;

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_subscription_link(html).as_deref(),.
        extract_subscription_link(html).as_deref(),
        // Выполняем операцию: Some("https://maxima.run/PCDqYMIF").
        Some("https://maxima.run/PCDqYMIF") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_maxima_sub_path_is_extracted.
fn test_maxima_sub_path_is_extracted() {
    // Объявляем переменную html .
    let html = r#"<a href="https://maxima.run/sub/1a2b3c4d">Подписка</a>"#;

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: extract_subscription_link(html).as_deref(),.
        extract_subscription_link(html).as_deref(),
        // Выполняем операцию: Some("https://maxima.run/sub/1a2b3c4d").
        Some("https://maxima.run/sub/1a2b3c4d") // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_maxima_site_pages_are_not_subscription_links.
fn test_maxima_site_pages_are_not_subscription_links() {
    // Объявляем переменную html .
    let html = r#"<nav><a href="https://maxima.run/dashboard">Кабинет</a>
        <a href="https://maxima.run/pricing">Тарифы</a></nav>"#;

    // Выполняем операцию: assert_eq!(extract_subscription_link(html), None);.
    assert_eq!(extract_subscription_link(html), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_maxima_single_case_token_is_not_subscription_link.
fn test_maxima_single_case_token_is_not_subscription_link() {
    // Токен короткой ссылки всегда смешанного регистра; слова страниц
    // сайта — нет. Одиночный регистр отсекается как ложный кандидат.
    // Объявляем переменную html .
    let html = r#"<a href="https://maxima.run/tok12345">Страница</a>
        <a href="https://maxima.run/ABC12345">Плашка</a>"#;

    // Выполняем операцию: assert_eq!(extract_subscription_link(html), None);.
    assert_eq!(extract_subscription_link(html), None);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_subscription_search_hosts_include_subdomains.
fn test_subscription_search_hosts_include_subdomains() {
    // Выполняем операцию: assert!(is_maxima_search_host("panel.maximacloud.online.
    assert!(is_maxima_search_host("panel.maximacloud.online"));
    // Выполняем операцию: assert!(is_maxima_search_host("maximavps.cloud"));.
    assert!(is_maxima_search_host("maximavps.cloud"));
    // Выполняем операцию: assert!(is_maxima_search_host("maxima.run"));.
    assert!(is_maxima_search_host("maxima.run"));
    // Выполняем операцию: assert!(!is_maxima_search_host("maximavps.cloud.evil.io.
    assert!(!is_maxima_search_host("maximavps.cloud.evil.io"));
    // Выполняем операцию: assert!(!is_maxima_search_host(""));.
    assert!(!is_maxima_search_host(""));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_navigation_allows_public_https_only.
fn test_navigation_allows_public_https_only() {
    // Выполняем операцию: assert!(is_allowed_navigation("https://yoomoney.ru/pay".
    assert!(is_allowed_navigation("https://yoomoney.ru/pay"));
    // Выполняем операцию: assert!(is_allowed_navigation("https://www.3ds-mirror.c.
    assert!(is_allowed_navigation("https://www.3ds-mirror.com/verify"));

    // Выполняем операцию: assert!(!is_allowed_navigation("http://yoomoney.ru/pay".
    assert!(!is_allowed_navigation("http://yoomoney.ru/pay"));
    // Выполняем операцию: assert!(!is_allowed_navigation("file:///etc/passwd"));.
    assert!(!is_allowed_navigation("file:///etc/passwd"));
    // Выполняем операцию: assert!(!is_allowed_navigation("javascript:alert(1)"));.
    assert!(!is_allowed_navigation("javascript:alert(1)"));
    // Выполняем операцию: assert!(!is_allowed_navigation("data:text/html;base64,P.
    assert!(!is_allowed_navigation("data:text/html;base64,PHNjcmlwdD4="));
    // Выполняем операцию: assert!(!is_allowed_navigation("https://192.168.1.10/ad.
    assert!(!is_allowed_navigation("https://192.168.1.10/admin"));
    // Выполняем операцию: assert!(!is_allowed_navigation("https://localhost/pay").
    assert!(!is_allowed_navigation("https://localhost/pay"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_payment_window_title_has_service_name.
fn test_payment_window_title_has_service_name() {
    // Название сервиса не должно попадать в заголовок нашего окна.
    // Выполняем операцию: assert_eq!(PAYMENT_WINDOW_TITLE, "Оплата");.
    assert_eq!(PAYMENT_WINDOW_TITLE, "Оплата");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_window_title_sanitize.
fn test_window_title_sanitize() {
    // Пустой и разорванный заголовок заменяется дефолтом.
    // Выполняем операцию: assert_eq!(sanitize_window_title(None), "Оплата");.
    assert_eq!(sanitize_window_title(None), "Оплата");
    // Выполняем операцию: assert_eq!(sanitize_window_title(Some("   ")), "Оплата".
    assert_eq!(sanitize_window_title(Some("   ")), "Оплата");
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: sanitize_window_title(Some("Оплата\n\u{0}VPN")),.
        sanitize_window_title(Some("Оплата\n\u{0}VPN")),
        // Выполняем операцию: "Оплата VPN".
        "Оплата VPN" // Закрываем выражение или коллекцию.
    );

    // Локализованный заголовок проходит как есть.
    // Выполняем операцию: assert_eq!(sanitize_window_title(Some("Payment")), "Pay.
    assert_eq!(sanitize_window_title(Some("Payment")), "Payment");
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_window_title_truncated.
fn test_window_title_truncated() {
    // Объявляем переменную long .
    let long = "О".repeat(120);
    // Объявляем переменную title .
    let title = sanitize_window_title(Some(&long));

    // Выполняем операцию: assert_eq!(title.chars().count(), PAYMENT_TITLE_MAX_CHA.
    assert_eq!(title.chars().count(), PAYMENT_TITLE_MAX_CHARS);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_js_escape_closes_no_context.
fn test_js_escape_closes_no_context() {
    // Объявляем переменную escaped .
    let escaped = js_escape("Оплата '</script> & \"x\" \n\t\u{1}");

    // Апостроф экранирован и уже не закрывает JS-литерал.
    // Выполняем операцию: assert!(escaped.contains("\\'"));.
    assert!(escaped.contains("\\'"));
    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: escaped,.
        escaped,
        // Выполняем операцию: "Оплата \\'\\u003C/script\\u003E \\u0026 \\\"x\\\" ".
        "Оплата \\'\\u003C/script\\u003E \\u0026 \\\"x\\\" " // Закрываем выражение или коллекцию.
    );
    // Управляющие символы выкинуты: литерал остаётся однострочным.
    // Выполняем операцию: assert!(!escaped.contains('\n'));.
    assert!(!escaped.contains('\n'));
    // Выполняем операцию: assert!(!escaped.contains('\u{1}'));.
    assert!(!escaped.contains('\u{1}'));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_loader_script_contains_label.
fn test_loader_script_contains_label() {
    // Объявляем переменную script .
    let script = format!("{LOADER_PRELUDE}{}{LOADER_MID}", js_escape("Оплата"));

    // Выполняем операцию: assert!(script.contains("Оплата"));.
    assert!(script.contains("Оплата"));
    // Выполняем операцию: assert!(script.contains("zapret-spinner") || script.con.
    assert!(script.contains("zapret-spinner") || script.contains("zapret-spin"));
    // Плашка убирается сама: обработчик load плюс запасной таймаут.
    // Выполняем операцию: assert!(script.contains("'load'"));.
    assert!(script.contains("'load'"));
    // Выполняем операцию: assert!(script.contains("8000"));.
    assert!(script.contains("8000"));
    // Закрываем блок.
}
