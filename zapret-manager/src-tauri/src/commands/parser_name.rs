// Подключаем модули: crate::commands::parser::strip_bat_extension;.
use crate::commands::parser::strip_bat_extension;
// Подключаем модули: crate::commands::scanner::StrategyInfo;.
use crate::commands::scanner::StrategyInfo;
// Подключаем модули: crate::constants::{NAME_ACRONYMS, NAME_COMPOUNDS};.
use crate::constants::{NAME_ACRONYMS, NAME_COMPOUNDS};

// Объявляем функцию capitalize_word.
fn capitalize_word(word: &str) -> String {
    // Проверяем условие: word.is_empty() {.
    if word.is_empty() {
        // Возвращаем результат из функции.
        return String::new();
        // Закрываем блок.
    }

    // Объявляем переменную upper .
    let upper = word.to_ascii_uppercase();

    // Проверяем условие: NAME_ACRONYMS.contains(&upper.as_str()) {.
    if NAME_ACRONYMS.contains(&upper.as_str()) {
        // Возвращаем результат из функции.
        return upper;
        // Закрываем блок.
    }

    // Проверяем условие: let Some((_, expansion)) = NAME_COMPOUNDS.iter().f.
    if let Some((_, expansion)) = NAME_COMPOUNDS.iter().find(|(key, _)| *key == upper) {
        // Возвращаем результат из функции.
        return (*expansion).to_string();
        // Закрываем блок.
    }

    // Объявляем переменную chars .
    let mut chars = word.chars();

    // Выбираем вариант по значению.
    match chars.next() {
        // Выполняем операцию: Some(first) => first.to_uppercase().collect::<String>().
        Some(first) => first.to_uppercase().collect::<String>() + &chars.as_str().to_lowercase(),
        // Выполняем операцию: None => String::new(),.
        None => String::new(),
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию split_trailing_digits.
fn split_trailing_digits(token: &str) -> (&str, &str) {
    // Объявляем переменную trimmed .
    let trimmed = token.trim_end_matches(|c: char| c.is_ascii_digit());

    // Проверяем условие: trimmed.is_empty() {.
    if trimmed.is_empty() {
        // Возвращаем результат из функции.
        return ("", token);
        // Закрываем блок.
    }

    // Выполняем операцию: (trimmed, &token[trimmed.len()..]).
    (trimmed, &token[trimmed.len()..])
    // Закрываем блок.
}

// Объявляем функцию fallback_name.
fn fallback_name(base: &str) -> String {
    // Объявляем переменную cleaned.
    let cleaned: String = base
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .map(|c| match c {.
        .map(|c| match c {
            // Выполняем операцию: '(' | ')' | '[' | ']' => ' ',.
            '(' | ')' | '[' | ']' => ' ',
            // Выполняем операцию: '_' | '-' => ' ',.
            '_' | '-' => ' ',
            // Выполняем операцию: other => other,.
            other => other,
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную words.
    let words: Vec<String> = cleaned
        // Выполняем операцию: .split_whitespace().
        .split_whitespace()
        // Выполняем операцию: .filter(|word| !word.chars().all(|c| c.is_ascii_digit().
        .filter(|word| !word.chars().all(|c| c.is_ascii_digit()))
        // Выполняем операцию: .map(capitalize_word).
        .map(capitalize_word)
        // Выполняем операцию: .filter(|word| !word.is_empty()).
        .filter(|word| !word.is_empty())
        // Выполняем операцию: .collect();.
        .collect();

    // Проверяем условие: words.is_empty() {.
    if words.is_empty() {
        // Выполняем операцию: capitalize_word(base).
        capitalize_word(base)
    // Закрываем блок.
    } else {
        // Выполняем операцию: words.join(" ").
        words.join(" ")
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn extract_name(filename: &str) -> String {.
pub(crate) fn extract_name(filename: &str) -> String {
    // Объявляем переменную base .
    let base = strip_bat_extension(filename);

    // Объявляем переменную cleaned.
    let cleaned: String = base
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .map(|c| match c {.
        .map(|c| match c {
            // Выполняем операцию: '(' | ')' | '[' | ']' => ' ',.
            '(' | ')' | '[' | ']' => ' ',
            // Выполняем операцию: '_' | '-' => ' ',.
            '_' | '-' => ' ',
            // Выполняем операцию: other => other,.
            other => other,
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную tokens.
    let tokens: Vec<&str> = cleaned.split_whitespace().collect();

    // Объявляем переменную without_common .
    let without_common = match tokens.first().copied() {
        // Выполняем операцию: Some(first) if first.eq_ignore_ascii_case("general") =>.
        Some(first) if first.eq_ignore_ascii_case("general") => &tokens[1..],
        // Выполняем операцию: _ => &tokens[..],.
        _ => &tokens[..],
        // Закрываем блок.
    };

    // Объявляем переменную words.
    let mut words: Vec<String> = Vec::new();
    // Объявляем переменную pending_number.
    let mut pending_number: Option<String> = None;

    // Перебираем элементы коллекции.
    for token in without_common {
        // Объявляем переменную (letters, digits) .
        let (letters, digits) = split_trailing_digits(token);

        // Проверяем условие: letters.is_empty() {.
        if letters.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: !words.is_empty() {.
        if !words.is_empty() {
            // Проверяем условие: let Some(number) = pending_number.take() {.
            if let Some(number) = pending_number.take() {
                // Выполняем операцию: words.push(number);.
                words.push(number);
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Выполняем операцию: words.push(capitalize_word(letters));.
        words.push(capitalize_word(letters));

        // Проверяем условие: !digits.is_empty() {.
        if !digits.is_empty() {
            // Выполняем операцию: pending_number = Some(digits.to_string());.
            pending_number = Some(digits.to_string());
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: words.is_empty() {.
    if words.is_empty() {
        // Возвращаем результат из функции.
        return fallback_name(base);
        // Закрываем блок.
    }

    // Проверяем условие: let Some(number) = pending_number {.
    if let Some(number) = pending_number {
        // Выполняем операцию: words.push(number);.
        words.push(number);
        // Закрываем блок.
    }

    // Выполняем операцию: words.join(" ").
    words.join(" ")
    // Закрываем блок.
}

// Объявляем функцию leading_index.
fn leading_index(filename: &str) -> Option<u32> {
    // Объявляем переменную base .
    let base = strip_bat_extension(filename);
    // Объявляем переменную digits .
    let mut digits = String::new();
    // Объявляем переменную started .
    let mut started = false;

    // Перебираем элементы коллекции.
    for c in base.chars() {
        // Проверяем условие: c.is_ascii_digit() {.
        if c.is_ascii_digit() {
            // Выполняем операцию: digits.push(c);.
            digits.push(c);
            // Выполняем операцию: started = true;.
            started = true;
        // Закрываем блок.
        } else if started {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: digits.parse().ok().
    digits.parse().ok()
    // Закрываем блок.
}

// Объявляем функцию disambiguate_group.
fn disambiguate_group(results: &mut [StrategyInfo], group: &[usize]) {
    // Объявляем переменную ordered.
    let mut ordered: Vec<usize> = group.to_vec();

    // Выполняем операцию: ordered.sort_by_key(|index| {.
    ordered.sort_by_key(|index| {
        // Выполняем операцию: (.
        (
            // Выполняем операцию: leading_index(&results[*index].filename).unwrap_or(u32:.
            leading_index(&results[*index].filename).unwrap_or(u32::MAX),
            // Выполняем операцию: results[*index].filename.clone(),.
            results[*index].filename.clone(),
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    });

    // Перебираем элементы коллекции.
    for (position, index) in ordered.into_iter().enumerate() {
        // Проверяем условие: position == 0 {.
        if position == 0 {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: results[index].name = match leading_index(&results[inde.
        results[index].name = match leading_index(&results[index].filename) {
            // Выполняем операцию: Some(number) => format!("{} {}", results[index].name, n.
            Some(number) => format!("{} {}", results[index].name, number),
            // Выполняем операцию: None => format!("{} ({})", results[index].name, positio.
            None => format!("{} ({})", results[index].name, position),
            // Закрываем блок.
        };
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Выполняем операцию: pub(crate) fn deduplicate_names(results: &mut [Strategy.
pub(crate) fn deduplicate_names(results: &mut [StrategyInfo]) {
    // Объявляем переменную sorted.
    let mut sorted: Vec<usize> = (0..results.len()).collect();

    // Выполняем операцию: sorted.sort_by(|left, right| {.
    sorted.sort_by(|left, right| {
        // Выполняем операцию: results[*left].
        results[*left]
            // Выполняем операцию: .name.
            .name
            // Выполняем операцию: .to_lowercase().
            .to_lowercase()
            // Выполняем операцию: .cmp(&results[*right].name.to_lowercase()).
            .cmp(&results[*right].name.to_lowercase())
        // Закрываем блок.
    });

    // Объявляем переменную start .
    let mut start = 0usize;

    // Повторяем, пока выполняется условие.
    while start < sorted.len() {
        // Объявляем переменную name .
        let name = results[sorted[start]].name.to_lowercase();
        // Объявляем переменную end .
        let mut end = start + 1;

        // Повторяем, пока выполняется условие.
        while end < sorted.len() && results[sorted[end]].name.to_lowercase() == name {
            // Выполняем операцию: end += 1;.
            end += 1;
            // Закрываем блок.
        }

        // Проверяем условие: end - start > 1 {.
        if end - start > 1 {
            // Выполняем операцию: disambiguate_group(results, &sorted[start..end]);.
            disambiguate_group(results, &sorted[start..end]);
            // Закрываем блок.
        }

        // Выполняем операцию: start = end;.
        start = end;
        // Закрываем блок.
    }
    // Закрываем блок.
}
