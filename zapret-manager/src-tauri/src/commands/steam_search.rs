//! Поиск игры в Steam по названию.
//!
//! Публичный Store API отда���� JSON и не требует ключей. HTML-страница
//! поиска не используется: она медленная и ломается при каждой
//! правке вёрстки.

// Подключаем модули: std::time::Duration;.
use std::time::Duration;

// Подключаем модули: serde::Deserialize;.
use serde::Deserialize;

/// Адрес поиска Steam Store.
// Объявляем константу STEAM_SEARCH_URL.
pub const STEAM_SEARCH_URL: &str =
    // Выполняем операцию: "https://store.steampowered.com/api/storesearch/?term={.
    "https://store.steampowered.com/api/storesearch/?term={term}&l=russian&cc=RU";

/// Сколько ждём ответа поиска.
// Объявляем константу SEARCH_TIMEOUT.
pub const SEARCH_TIMEOUT: Duration = Duration::from_secs(3);

/// Ответ поиска Steam.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру SearchResponse.
pub struct SearchResponse {
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub items: Vec<SearchItem>,.
    pub items: Vec<SearchItem>,
    // Закрываем блок.
}

/// Игра в ответе поиска.
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Deserialize)]
// Объявляем структуру SearchItem.
pub struct SearchItem {
    // Выполняем операцию: pub id: u64,.
    pub id: u64,
    // Применяем атрибут к следующему объявлению.
    #[serde(default)]
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Закрываем блок.
}

/// Результат поиска: AppID и признак того, что Steam вообще ответил.
///
/// `reachable: false` отличает «сети нет» от «игры нет в Steam»: сеть —
/// явление временное, и её отсутствие нельзя запоминать в индексе как
/// окончательный «игры нет».
// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq)]
// Объявляем структуру SteamSearch.
pub struct SteamSearch {
    // Выполняем операцию: pub appid: Option<String>,.
    pub appid: Option<String>,
    // Выполняем операцию: pub reachable: bool,.
    pub reachable: bool,
    // Закрываем блок.
}

/// Ищет игру в Steam по названию с признаком доступности сервиса.
// Выполняем операцию: pub async fn search_steam(name: &str) -> SteamSearch {.
pub async fn search_steam(name: &str) -> SteamSearch {
    // Объявляем переменную reachable .
    let mut reachable = false;

    // Перебираем элементы коллекции.
    for term in search_terms(name) {
        // Проверяем условие: term.len() < 2 {.
        if term.len() < 2 {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную url .
        let url = STEAM_SEARCH_URL.replace("{term}", &encode_term(&term));

        // Объявляем переменную Ok(client) .
        let Ok(client) = reqwest::Client::builder()
            // Выполняем операцию: .timeout(SEARCH_TIMEOUT).
            .timeout(SEARCH_TIMEOUT)
            // Выполняем операцию: .user_agent(crate::commands::panel::USER_AGENT).
            .user_agent(crate::commands::panel::USER_AGENT)
            // Выполняем операцию: .build().
            .build()
        // Выполняем операцию: else {.
        else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную Ok(response) .
        let Ok(response) = client.get(url).send().await else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Проверяем условие: !response.status().is_success() {.
        if !response.status().is_success() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: reachable = true;.
        reachable = true;

        // Объявляем переменную Ok(body) .
        let Ok(body) = response.text().await else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Объявляем переменную found .
        let found = pick_appid(&body, &term);

        // Проверяем условие: found.is_some() {.
        if found.is_some() {
            // Возвращаем результат из функции.
            return SteamSearch {
                // Выполняем операцию: appid: found,.
                appid: found,
                // Выполняем операцию: reachable: true,.
                reachable: true,
                // Закрываем блок.
            };
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: SteamSearch {.
    SteamSearch {
        // Выполняем операцию: appid: None,.
        appid: None,
        // Выполняем операцию: reachable,.
        reachable,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Выбирает AppID из ответа поиска.
///
/// Сначала ищется точное совпадение названия: у Steam в выдаче
/// первым нередко идёт похожая, но другая игра. Если точного нет,
/// берётся частичное совпадение. Совсем чужие результаты не берутся
/// никогда: иначе на карточку чужой игры встанет чужая обложка.
// Объявляем функцию pick_appid.
pub fn pick_appid(json: &str, query: &str) -> Option<String> {
    // Объявляем переменную parsed.
    let parsed: SearchResponse = serde_json::from_str(json).ok()?;
    // Объявляем переменную normalized_query .
    let normalized_query = normalize_name(query);

    // Проверяем условие: normalized_query.is_empty() {.
    if normalized_query.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Проверяем условие: let Some(item) = parsed.
    if let Some(item) = parsed
        // Выполняем операцию: .items.
        .items
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|item| normalize_name(&item.name) == normalized_q.
        .find(|item| normalize_name(&item.name) == normalized_query)
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return Some(item.id.to_string());
        // Закрываем блок.
    }

    // Выполняем операцию: parsed.
    parsed
        // Выполняем операцию: .items.
        .items
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .find(|item| {.
        .find(|item| {
            // Объявляем переменную normalized .
            let normalized = normalize_name(&item.name);

            // Выполняем операцию: normalized.contains(&normalized_query) || normalized_qu.
            normalized.contains(&normalized_query) || normalized_query.contains(&normalized)
            // Закрываем блок.
        })
        // Выполняем операцию: .map(|item| item.id.to_string()).
        .map(|item| item.id.to_string())
    // Закрываем блок.
}

/// Имя для поиска: без хвоста после тире и без точки в конце.
// Объявляем функцию search_term.
pub fn search_term(name: &str) -> String {
    // Объявляем переменную base .
    let base = name.split(['—', '–']).next().unwrap_or(name).trim();

    // Выполняем операцию: base.trim_end_matches(['.', ' ']).to_string().
    base.trim_end_matches(['.', ' ']).to_string()
    // Закрываем блок.
}

/// Варианты поискового запроса: как написано и по словам.
///
/// Пользователь часто добавляет игру по имени exe, где пробелы
/// вырезаны: EscapeTheBackrooms. Steam такое название не находит,
/// а «Escape The Backrooms» находит.
// Объявляем функцию search_terms.
pub fn search_terms(name: &str) -> Vec<String> {
    // Объявляем переменную base .
    let base = search_term(name);
    // Объявляем переменную humanized .
    let humanized = humanize_name(&base);

    // Проверяем условие: !humanized.is_empty() && humanized != base {.
    if !humanized.is_empty() && humanized != base {
        // Возвращаем результат из функции.
        return vec![base, humanized];
        // Закрываем блок.
    }

    // Выполняем операцию: vec![base].
    vec![base]
    // Закрываем блок.
}

/// Разделяет слитные слова: EscapeTheBackrooms → Escape The Backrooms.
// Объявляем функцию humanize_name.
pub fn humanize_name(name: &str) -> String {
    // Объявляем переменную chars.
    let chars: Vec<char> = name.chars().collect();
    // Объявляем переменную out .
    let mut out = String::with_capacity(name.len() + 4);

    // Перебираем элементы коллекции.
    for (index, &character) in chars.iter().enumerate() {
        // Объявляем переменную boundary .
        let boundary = character.is_uppercase()
            // Выполняем операцию: && index > 0.
            && index > 0
            // Выполняем операцию: && (chars[index - 1].is_lowercase().
            && (chars[index - 1].is_lowercase()
                // Выполняем операцию: || (index + 1 < chars.len() && chars[index + 1].is_lowe.
                || (index + 1 < chars.len() && chars[index + 1].is_lowercase()));

        // Проверяем условие: boundary && !out.ends_with(' ') {.
        if boundary && !out.ends_with(' ') {
            // Выполняем операцию: out.push(' ');.
            out.push(' ');
            // Закрываем блок.
        }

        // Выполняем операцию: out.push(character);.
        out.push(character);
        // Закрываем блок.
    }

    // Выполняем операцию: out.trim().to_string().
    out.trim().to_string()
    // Закрываем блок.
}

/// Приводит название к сравнимому виду.
// Объявляем функцию normalize_name.
fn normalize_name(value: &str) -> String {
    // Выполняем операцию: value.
    value
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .filter(|character| character.is_ascii_alphanumeric()).
        .filter(|character| character.is_ascii_alphanumeric())
        // Выполняем операцию: .map(|character| character.to_ascii_lowercase()).
        .map(|character| character.to_ascii_lowercase())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

/// Кодирует строку для адреса.
// Объявляем функцию encode_term.
fn encode_term(term: &str) -> String {
    // Объявляем переменную encoded .
    let mut encoded = String::new();

    // Перебираем элементы коллекции.
    for byte in term.bytes() {
        // Выбираем вариант по значению.
        match byte {
            // Выполняем операцию: b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' |.
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                // Выполняем операцию: encoded.push(byte as char);.
                encoded.push(byte as char);
                // Закрываем блок.
            }
            // Выполняем операцию: b' ' => encoded.push_str("%20"),.
            b' ' => encoded.push_str("%20"),
            // Выполняем операцию: _ => encoded.push_str(&format!("%{byte:02X}")),.
            _ => encoded.push_str(&format!("%{byte:02X}")),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: encoded.
    encoded
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "steam_search_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
