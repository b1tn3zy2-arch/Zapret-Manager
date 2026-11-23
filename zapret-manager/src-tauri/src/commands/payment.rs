//! Встроенное окно оплаты.
//!
//! Платёжная страница живёт в отдельном WebView. Это окно не имеет
//! собственных Tauri-команд и не получает capability приложения:
//! содержимое сайта не может вызвать `secureInvoke` или получить
//! пользовательские данные. Навигация разрешена только по HTTPS к публичным
//! хостам: так банковский 3DS-редирект работает, а постороннее
//! содержимое — нет.

// Подключаем модули: std::sync::LazyLock;.
use std::sync::LazyLock;
// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: tauri::webview::Color;.
use tauri::webview::Color;
// Подключаем модули: tauri::AppHandle;.
use tauri::AppHandle;
// Подключаем модули: tauri::Manager;.
use tauri::Manager;
// Подключаем модули: tauri::Theme;.
use tauri::Theme;
// Подключаем модули: tauri::WebviewUrl;.
use tauri::WebviewUrl;
// Подключаем модули: tauri::WebviewWindowBuilder;.
use tauri::WebviewWindowBuilder;
// Подключаем модули: url::Url;.
use url::Url;

// Подключаем модули: crate::error::AppError;.
use crate::error::AppError;
// Подключаем модули: crate::error::AppResult;.
use crate::error::AppResult;
// Подключаем модули: crate::security::url_validator::is_public_host;.
use crate::security::url_validator::is_public_host;
// Подключаем модули: crate::security::url_validator::validate_https_url;.
use crate::security::url_validator::validate_https_url;

// Объявляем константу PAYMENT_WINDOW_LABEL.
const PAYMENT_WINDOW_LABEL: &str = "payment";

/// Заголовок окна по умолчанию. Интерфейс всегда присылает локализованный
/// вариант, константа остаётся для запусков без заголовка.
// Объявляем константу PAYMENT_WINDOW_TITLE.
const PAYMENT_WINDOW_TITLE: &str = "Оплата";

/// Стартовые адреса, на которые можно открывать окно: сайт оплаты
/// (maxima-vps.online), YooMoney для 3DS-редиректов и хосты Maxima,
/// где живёт личный кабинет из приветственного письма
/// (maximavps.cloud, maximacloud.online — включая их поддомены).
// Объявляем константу PAYMENT_ENTRY_HOSTS.
const PAYMENT_ENTRY_HOSTS: [&str; 3] =
    // Выполняем операцию: ["maxima-vps.online", "www.maxima-vps.online", "yoomone.
    ["maxima-vps.online", "www.maxima-vps.online", "yoomoney.ru"];

/// Домены Maxima, у которых принимаются и поддомены. `maxima.run` —
/// короткий домен ссылок-подписок: кабинет может уводить окно на него.
// Объявляем константу MAXIMA_OPEN_HOSTS.
const MAXIMA_OPEN_HOSTS: [&str; 3] = ["maximavps.cloud", "maximacloud.online", "maxima.run"];

/// Хост годится для старта окна: точное совпадение с оплатой
/// или домен Maxima точно либо по поддомену.
// Объявляем функцию is_openable_payment_host.
fn is_openable_payment_host(host: &str) -> bool {
    // Объявляем переменную host .
    let host = host.trim().to_ascii_lowercase();

    // Проверяем условие: PAYMENT_ENTRY_HOSTS.contains(&host.as_str()) {.
    if PAYMENT_ENTRY_HOSTS.contains(&host.as_str()) {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Выполняем операцию: MAXIMA_OPEN_HOSTS.
    MAXIMA_OPEN_HOSTS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|allowed| host == *allowed || host.ends_with(&form.
        .any(|allowed| host == *allowed || host.ends_with(&format!(".{allowed}")))
    // Закрываем блок.
}

/// Максимальная длина заголовка окна: пользовательская строка не должна
/// растягивать рамку окна на несколько строк.
// Объявляем константу PAYMENT_TITLE_MAX_CHARS.
const PAYMENT_TITLE_MAX_CHARS: usize = 48;

/// Цвет фона окна и загрузочного оверлея: тёмный, как фон приложения,
/// поэтому между окном приложения и сайтом не вспыхивает белый лист.
// Объявляем константу LOADER_BACKGROUND.
const LOADER_BACKGROUND: Color = Color(19, 23, 32, 255);

/// Скрипт, который добавляется в каждую навигацию окна оплаты.
///
/// До отрисовки сайта красит документ и держит сверху плашку загрузки:
/// окно сразу выглядит приложением, а не белым или чёрным листом. Плашка
/// уходит сама по событию `load`; таймаут 8 секунд — на случай, когда
/// сеть стоит, чтобы окно всё равно оставалось кликабельным.
// Объявляем константу LOADER_PRELUDE.
const LOADER_PRELUDE: &str = r#"(() => {
  if (window.__zapretLoader !== undefined) {
    return;
  }
  window.__zapretLoader = 1;
  const label = '"#;

// Объявляем константу LOADER_MID.
const LOADER_MID: &str = r#"';
  const style = document.createElement('style');
  style.textContent = 'html,body{background:#131720 !important}';
  document.documentElement.appendChild(style);
  const overlay = document.createElement('div');
  overlay.id = 'zapret-payment-loader';
  const dialog = document.createElement('div');
  dialog.style.cssText = [
    'width:34px;height:34px;border:3px solid rgba(255,255,255,0.16)',
    'border-top-color:#4cc2ff;border-radius:50%',
    'animation:zapret-spin 0.9s linear infinite',
  ].join(';');
  const text = document.createElement('div');
  text.style.cssText = [
    'color:rgba(235,240,248,0.72);font:13px system-ui,sans-serif',
    'letter-spacing:0.02em',
  ].join(';');
  text.textContent = label;
  overlay.style.cssText = [
    'position:fixed;inset:0;z-index:2147483647;display:flex',
    'flex-direction:column;align-items:center;justify-content:center',
    'gap:16px;background:#131720;opacity:1',
    'transition:opacity 0.25s ease 0.1s',
  ].join(';');
  overlay.appendChild(dialog);
  overlay.appendChild(text);
  const spin = document.createElement('style');
  spin.textContent = '@keyframes zapret-spin{to{transform:rotate(1turn)}}';
  document.documentElement.appendChild(spin);
  document.documentElement.appendChild(overlay);
  let hidden = false;
  const reveal = () => {
    if (hidden) {
      return;
    }
    hidden = true;
    overlay.style.opacity = '0';
    window.setTimeout(() => {
      overlay.remove();
    }, 450);
  };
  if (document.readyState === 'complete') {
    window.setTimeout(reveal, 150);
  } else {
    window.addEventListener('load', reveal, { once: true });
    window.setTimeout(reveal, 8000);
  }
})();"#;

/// Экранирует пользовательскую строку для вставки в JS-литерал.
///
/// Строка попадает в одинарные кавычки инлайн-скрипта: закрывать кавычки,
/// ломать контекст тега и вставлять Unicode-запрещено.
// Объявляем функцию js_escape.
fn js_escape(value: &str) -> String {
    // Объявляем переменную out .
    let mut out = String::with_capacity(value.len());

    // Перебираем элементы коллекции.
    for character in value.chars() {
        // Выбираем вариант по значению.
        match character {
            // Выполняем операцию: '\\' => out.push_str("\\\\"),.
            '\\' => out.push_str("\\\\"),
            // Выполняем операцию: '\'' => out.push_str("\\'"),.
            '\'' => out.push_str("\\'"),
            // Выполняем операцию: '"' => out.push_str("\\\""),.
            '"' => out.push_str("\\\""),
            // Выполняем операцию: '<' => out.push_str("\\u003C"),.
            '<' => out.push_str("\\u003C"),
            // Выполняем операцию: '>' => out.push_str("\\u003E"),.
            '>' => out.push_str("\\u003E"),
            // Выполняем операцию: '&' => out.push_str("\\u0026"),.
            '&' => out.push_str("\\u0026"),
            // Выполняем операцию: '\n' | '\r' | '\t' | '\u{0}'..='\u{1f}' => {}.
            '\n' | '\r' | '\t' | '\u{0}'..='\u{1f}' => {}
            // Выполняем операцию: other => out.push(other),.
            other => out.push(other),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: out.
    out
    // Закрываем блок.
}

/// Приводит заголовок окна к безопасной однострочной форме.
// Объявляем функцию sanitize_window_title.
fn sanitize_window_title(raw: Option<&str>) -> String {
    // Объявляем переменную title .
    let mut title = raw
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .split(['\n', '\r']).
        .split(['\n', '\r'])
        // Выполняем операцию: .map(str::trim).
        .map(str::trim)
        // Выполняем операцию: .filter(|line| !line.is_empty()).
        .filter(|line| !line.is_empty())
        // Выполняем операцию: .collect::<Vec<_>>().
        .collect::<Vec<_>>()
        // Выполняем операцию: .join(" ");.
        .join(" ");

    // Заголовок уходит в рамку окна: управляющие символы из него выкидываем
    // Выполняем операцию: title = title.chars().filter(|c| !c.is_control()).colle.
    title = title.chars().filter(|c| !c.is_control()).collect();
    // Выполняем операцию: title = title.chars().take(PAYMENT_TITLE_MAX_CHARS).col.
    title = title.chars().take(PAYMENT_TITLE_MAX_CHARS).collect();

    // Проверяем условие: title.trim().is_empty() {.
    if title.trim().is_empty() {
        // Возвращаем результат из функции.
        return PAYMENT_WINDOW_TITLE.to_string();
        // Закрываем блок.
    }

    // Выполняем операцию: title.trim().to_string().
    title.trim().to_string()
    // Закрываем блок.
}

/// Открывает окно оплаты.
///
/// Окно не пересоздаётся: если пользователь уже начал оплату,
/// перезапуск окна сломал бы сессию банка.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn open_payment_window(.
pub async fn open_payment_window(
    // Выполняем операцию: app: AppHandle,.
    app: AppHandle,
    // Выполняем операцию: url: String,.
    url: String,
    // Выполняем операцию: title: Option<String>,.
    title: Option<String>,
    // Закрываем выражение или коллекцию.
) -> AppResult<()> {
    // Объявляем переменную url .
    let url = validate_payment_entry_url(&url)?;
    // Объявляем переменную title .
    let title = sanitize_window_title(title.as_deref());
    // Объявляем переменную loader_script .
    let loader_script = format!("{LOADER_PRELUDE}{}{LOADER_MID}", js_escape(&title));

    // Проверяем условие: let Some(window) = app.get_webview_window(PAYMENT_.
    if let Some(window) = app.get_webview_window(PAYMENT_WINDOW_LABEL) {
        // Выполняем операцию: window.set_title(&title)?;.
        window.set_title(&title)?;
        // Выполняем операцию: window.
        window
            // Выполняем операцию: .navigate(url.clone()).
            .navigate(url.clone())
            // Выполняем операцию: .map_err(|error| AppError::custom(format!("Окно оплаты .
            .map_err(|error| AppError::custom(format!("Окно оплаты не получено: {error}")))?;
        // Выполняем операцию: window.show()?;.
        window.show()?;
        // Выполняем операцию: window.set_focus()?;.
        window.set_focus()?;

        // Выполняем операцию: tracing::info!("Открыто окно оплаты");.
        tracing::info!("Открыто окно оплаты");

        // Возвращаем результат из функции.
        return Ok(());
        // Закрываем блок.
    }

    // Выполняем операцию: WebviewWindowBuilder::new(.
    WebviewWindowBuilder::new(
        // Выполняем операцию: &app,.
        &app,
        // Выполняем операцию: PAYMENT_WINDOW_LABEL,.
        PAYMENT_WINDOW_LABEL,
        // Выполняем операцию: WebviewUrl::External(url.clone()),.
        WebviewUrl::External(url.clone()),
        // Закрываем выражение или коллекцию.
    )
    // Выполняем операцию: .title(title).
    .title(title)
    // Выполняем операцию: .inner_size(980.0, 720.0).
    .inner_size(980.0, 720.0)
    // Выполняем операцию: .min_inner_size(480.0, 480.0).
    .min_inner_size(480.0, 480.0)
    // Выполняем операцию: .center().
    .center()
    // Выполняем операцию: .resizable(true).
    .resizable(true)
    // Принудительно тёмная тема: рамка окна и заголовок всегда
    // совпадают с приложением, даже на системах со светлой темой.
    // Выполняем операцию: .theme(Some(Theme::Dark)).
    .theme(Some(Theme::Dark))
    // Выполняем операцию: .background_color(LOADER_BACKGROUND).
    .background_color(LOADER_BACKGROUND)
    // Выполняем операцию: .initialization_script(loader_script).
    .initialization_script(loader_script)
    // Выполняем операцию: .on_navigation(move |next| is_allowed_navigation(next.a.
    .on_navigation(move |next| is_allowed_navigation(next.as_str()))
    // Выполняем операцию: .build().
    .build()
    // Выполняем операцию: .map_err(|error| AppError::custom(format!("Окно оплаты .
    .map_err(|error| AppError::custom(format!("Окно оплаты не удалось открыть: {error}")))?;

    // Выполняем операцию: tracing::info!("Открыто окно оплаты");.
    tracing::info!("Открыто окно оплаты");

    // Выполняем операцию: Ok(()).
    Ok(())
    // Закрываем блок.
}

/// Становится ли URL допустимым стартовой страницей.
///
/// Проскок в интерфейсе вызывается только из приложения: основной
/// платёжный домен и YooMoney разрешены явно.
// Объявляем функцию validate_payment_entry_url.
pub fn validate_payment_entry_url(raw: &str) -> AppResult<Url> {
    // Объявляем переменную url .
    let url = validate_https_url(raw)?;
    // Объявляем переменную host .
    let host = url.host_str().unwrap_or_default().to_ascii_lowercase();

    // Проверяем условие: !is_openable_payment_host(&host) {.
    if !is_openable_payment_host(&host) {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Открыть оплату можно только на доверенном сайте",.
            "Открыть оплату можно только на доверенном сайте",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Выполняем операцию: Ok(url).
    Ok(url)
    // Закрываем блок.
}

/// Разрешён ли переход в окне оплаты.
// Объявляем функцию is_allowed_navigation.
pub fn is_allowed_navigation(raw_url: &str) -> bool {
    // Объявляем переменную Ok(url) .
    let Ok(url) = Url::parse(raw_url) else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Проверяем условие: url.scheme() != "https" {.
    if url.scheme() != "https" {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную host .
    let host = url.host_str().unwrap_or_default();

    // Проверяем условие: host.is_empty() {.
    if host.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: is_public_host(host).
    is_public_host(host)
    // Закрываем блок.
}

/// Предел ожидания ответа страницы личного кабинета Maxima.
// Объявляем константу MAXIMA_PAGE_TIMEOUT.
const MAXIMA_PAGE_TIMEOUT: Duration = Duration::from_secs(12);

/// Хосты Maxima, на которых разрешено искать ссылку подписки.
/// `maxima.run` — короткий домен самих ссылок подписки: страница
/// кабинета может показывать адрес именно оттуда.
// Объявляем константу MAXIMA_SEARCH_HOSTS.
const MAXIMA_SEARCH_HOSTS: [&str; 4] = [
    // Выполняем операцию: "maxima-vps.online",.
    "maxima-vps.online",
    // Выполняем операцию: "maximavps.cloud",.
    "maximavps.cloud",
    // Выполняем операцию: "maximacloud.online",.
    "maximacloud.online",
    // Выполняем операцию: "maxima.run",.
    "maxima.run",
    // Закрываем выражение или коллекцию.
];

/// Подходит ли домен для поиска ссылки подписки (поддомены тоже).
// Объявляем функцию is_maxima_search_host.
fn is_maxima_search_host(host: &str) -> bool {
    // Объявляем переменную host .
    let host = host.trim().to_ascii_lowercase();

    // Выполняем операцию: MAXIMA_SEARCH_HOSTS.
    MAXIMA_SEARCH_HOSTS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|allowed| host == *allowed || host.ends_with(&form.
        .any(|allowed| host == *allowed || host.ends_with(&format!(".{allowed}")))
    // Закрываем блок.
}

/// Шаблон ссылок на подписку вёрстки Maxima/Marzban: путь вида
/// «/sub/ключ», «/subscribe?token=ключ», token в адресе либо короткая
/// ссылка подписки вида maxima.run/токен.
// Объявляем константу SUBSCRIPTION_LINK_PATTERN.
const SUBSCRIPTION_LINK_PATTERN: &str = r#"(?i)https?://[a-z0-9.-]+/(?:[\w./-]*/)?(?:sub|subscribe)/[a-z0-9_-]{6,}(?:\?[\w=&%-]*)?|https?://[a-z0-9.-]+/[\w./-]*\?(?:[^"'<>\s]*&)*?token=[a-z0-9._-]{6,}|https?://[a-z0-9.-]*maxima\.run/[A-Za-z0-9]{6,24}"#;

/// Слова-пути сайта на коротком домене — страницы, а не токены подписки.
// Объявляем константу MAXIMA_SHORT_LINK_STOP_WORDS.
const MAXIMA_SHORT_LINK_STOP_WORDS: [&str; 10] = [
    // Выполняем операцию: "dashboard",.
    "dashboard",
    // Выполняем операцию: "profile",.
    "profile",
    // Выполняем операцию: "settings",.
    "settings",
    // Выполняем операцию: "account",.
    "account",
    // Выполняем операцию: "cabinet",.
    "cabinet",
    // Выполняем операцию: "panel",.
    "panel",
    // Выполняем операцию: "login",.
    "login",
    // Выполняем операцию: "register",.
    "register",
    // Выполняем операцию: "support",.
    "support",
    // Выполняем операцию: "help",.
    "help",
    // Закрываем выражение или коллекцию.
];

/// Годится ли найденный кандидат на роль ссылки подписки.
///
/// Для коротких ссылок maxima.run/токен добавляются проверки: путь —
/// один сегмент без query, не слово-страница, а токен — со смешанным
/// регистром (у настоящих токенов он такой; это отсекает страничные
/// слова вроде /pricing). Остальные кандидаты проходят как есть —
/// их уже отобрал шаблон.
// Объявляем функцию is_valid_subscription_candidate.
fn is_valid_subscription_candidate(candidate: &str) -> bool {
    // Объявляем переменную Ok(url) .
    let Ok(url) = Url::parse(candidate) else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Объявляем переменную host .
    let host = url.host_str().unwrap_or_default().to_ascii_lowercase();

    // Проверяем условие: host != "maxima.run" && !host.ends_with(".maxima.r.
    if host != "maxima.run" && !host.ends_with(".maxima.run") {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Объявляем переменную path .
    let path = url.path();

    // Пути марзбана (/sub/ключ, /subscribe) и ссылки с query — не
    // короткий формат, шаблон уже отобрал их как подписку.
    // Проверяем условие: path.
    if path
        // Выполняем операцию: .trim_matches('/').
        .trim_matches('/')
        // Выполняем операцию: .split('/').
        .split('/')
        // Выполняем операцию: .filter(|s| !s.is_empty()).
        .filter(|s| !s.is_empty())
        // Выполняем операцию: .count().
        .count()
        // Выполняем операцию: != 1.
        != 1
        // Выполняем операцию: || url.query().is_some().
        || url.query().is_some()
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Объявляем переменную token .
    let token = path.trim_start_matches('/');

    // Выполняем операцию: token.len() >= 6.
    token.len() >= 6
        // Выполняем операцию: && !MAXIMA_SHORT_LINK_STOP_WORDS.contains(&token.to_asc.
        && !MAXIMA_SHORT_LINK_STOP_WORDS.contains(&token.to_ascii_lowercase().as_str())
        // Выполняем операцию: && token.chars().any(|c| c.is_ascii_lowercase()).
        && token.chars().any(|c| c.is_ascii_lowercase())
        // Выполняем операцию: && token.chars().any(|c| c.is_ascii_uppercase()).
        && token.chars().any(|c| c.is_ascii_uppercase())
    // Закрываем блок.
}

/// Первая ссылка на подписку, найденная в HTML страницы.
///
/// Личный кабинет Maxima — SPA, но токен подписки часто прошит в его
/// начальную разметку (настройки пользователя при autologin). Ищем
/// кандидатов по шаблону и отдаём первый; None — ссылки в разметке нет,
/// значит пользователь копирует её в кабинете вручную.
// Объявляем функцию extract_subscription_link.
pub fn extract_subscription_link(html: &str) -> Option<String> {
    // Регулярное выражение компилируется один раз на всё время работы процесса:
    // эта функция вызывается при каждом опросе окна оплаты (несколько раз в секунду).
    // Объявляем константу LINK_REGEX.
    static LINK_REGEX: LazyLock<Option<regex::Regex>> =
        // Выполняем операцию: LazyLock::new(|| regex::Regex::new(SUBSCRIPTION_LINK_PA.
        LazyLock::new(|| regex::Regex::new(SUBSCRIPTION_LINK_PATTERN).ok());

    // Объявляем переменную regex .
    let regex = LINK_REGEX.as_ref()?;

    // Объявляем переменную raw .
    let raw = regex
        // Выполняем операцию: .find_iter(html).
        .find_iter(html)
        // Выполняем операцию: .map(|match_| match_.as_str().to_string()).
        .map(|match_| match_.as_str().to_string())
        // Выполняем операцию: .find(|candidate| {.
        .find(|candidate| {
            // Выполняем операцию: Url::parse(candidate).
            Url::parse(candidate)
                // Выполняем операцию: .map(|url| is_maxima_search_host(url.host_str().unwrap_.
                .map(|url| is_maxima_search_host(url.host_str().unwrap_or_default()))
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
                // Выполняем операцию: && is_valid_subscription_candidate(candidate).
                && is_valid_subscription_candidate(candidate)
            // Закрываем блок.
        })?;

    // Объявляем переменную url .
    let mut url = Url::parse(&raw).ok()?;

    // Фрагмент (#...) в подписке не участвует — отбрасываем.
    // Выполняем операцию: url.set_fragment(None);.
    url.set_fragment(None);

    // Выполняем операцию: Some(url.to_string()).
    Some(url.to_string())
    // Закрываем блок.
}

/// Смотрит текущий адрес окна оплаты.
///
/// Фронт опрашивает его на фоне после клика «Оплатить»: как только сайт
/// после платежа перекидывает браузер на страницу с токеном подписки
/// или autologin-кабинетом, приложение само добавляет подписку.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn payment_window_url(app: AppHandle) -> AppR.
pub async fn payment_window_url(app: AppHandle) -> AppResult<Option<String>> {
    // Объявляем переменную url .
    let url = app
        // Выполняем операцию: .get_webview_window(PAYMENT_WINDOW_LABEL).
        .get_webview_window(PAYMENT_WINDOW_LABEL)
        // Выполняем операцию: .and_then(|window| {.
        .and_then(|window| {
            // Выполняем операцию: window.
            window
                // Выполняем операцию: .url().
                .url()
                // Выполняем операцию: .ok().
                .ok()
                // Выполняем операцию: .filter(|url| url.scheme() == "https").
                .filter(|url| url.scheme() == "https")
                // Выполняем операцию: .map(|url| url.to_string()).
                .map(|url| url.to_string())
            // Закрываем блок.
        });

    // Выполняем операцию: Ok(url).
    Ok(url)
    // Закрываем блок.
}

/// Пытается найти ссылку подписки в странице личного кабинета Maxima.
///
/// Приёмка на Maxima-хостах обязательна: запрос уходит только туда,
/// куда разрешено открывать сам кабинет. None — ссылки в разметке не
/// нашлось, интерфейс в этом случае просит пользователя скопировать её
/// в кабинете вручную.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn find_subscription_in_maxima_page(raw: &str.
pub async fn find_subscription_in_maxima_page(raw: &str) -> AppResult<Option<String>> {
    // Объявляем переменную url .
    let url = validate_https_url(raw)?;
    // Объявляем переменную host .
    let host = url.host_str().unwrap_or_default().to_ascii_lowercase();

    // Проверяем условие: !is_maxima_search_host(&host) {.
    if !is_maxima_search_host(&host) {
        // Возвращаем результат из функции.
        return Err(AppError::custom(
            // Выполняем операцию: "Подписку можно искать только на сайте Maxima",.
            "Подписку можно искать только на сайте Maxima",
            // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Объявляем переменную client .
    let client = reqwest::Client::builder()
        // Выполняем операцию: .timeout(MAXIMA_PAGE_TIMEOUT).
        .timeout(MAXIMA_PAGE_TIMEOUT)
        // Выполняем операцию: .user_agent(crate::commands::panel::USER_AGENT).
        .user_agent(crate::commands::panel::USER_AGENT)
        // Выполняем операцию: .build().
        .build()
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("HTTP-клиент .
        .map_err(|error| AppError::custom(format!("HTTP-клиент не собрался: {error}")))?;

    // Объявляем переменную response .
    let response = client
        // Выполняем операцию: .get(url).
        .get(url)
        // Выполняем операцию: .send().
        .send()
        // Выполняем операцию: .await.
        .await
        // Выполняем операцию: .map_err(|error| AppError::custom(format!("Кабинет не о.
        .map_err(|error| AppError::custom(format!("Кабинет не отвечает: {error}")))?;

    // Проверяем условие: !response.status().is_success() {.
    if !response.status().is_success() {
        // Возвращаем результат из функции.
        return Ok(None);
        // Закрываем блок.
    }

    // Объявляем переменную html .
    let html = response.text().await.unwrap_or_default();

    // Выполняем операцию: Ok(extract_subscription_link(&html)).
    Ok(extract_subscription_link(&html))
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "payment_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
