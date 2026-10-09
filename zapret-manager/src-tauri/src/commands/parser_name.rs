use crate::commands::parser::strip_bat_extension;
use crate::commands::scanner::StrategyInfo;
use crate::constants::{NAME_ACRONYMS, NAME_COMPOUNDS};

fn capitalize_word(word: &str) -> String {
    if word.is_empty() {
        return String::new();
    }

    let upper = word.to_ascii_uppercase();

    if NAME_ACRONYMS.contains(&upper.as_str()) {
        return upper;
    }

    if let Some((_, expansion)) =
        NAME_COMPOUNDS.iter().find(|(key, _)| *key == upper)
    {
        return (*expansion).to_string();
    }

    let mut chars = word.chars();

    match chars.next() {
        Some(first) => {
            first.to_uppercase().collect::<String>()
                + &chars.as_str().to_lowercase()
        }
        None => String::new(),
    }
}

fn split_trailing_digits(token: &str) -> (&str, &str) {
    let trimmed = token.trim_end_matches(|c: char| c.is_ascii_digit());

    if trimmed.is_empty() {
        return ("", token);
    }

    (trimmed, &token[trimmed.len()..])
}

fn fallback_name(base: &str) -> String {
    let cleaned: String = base
        .chars()
        .map(|c| match c {
            '(' | ')' | '[' | ']' => ' ',
            '_' | '-' => ' ',
            other => other,
        })
        .collect();

    let words: Vec<String> = cleaned
        .split_whitespace()
        .filter(|word| !word.chars().all(|c| c.is_ascii_digit()))
        .map(capitalize_word)
        .filter(|word| !word.is_empty())
        .collect();

    if words.is_empty() {
        capitalize_word(base)
    } else {
        words.join(" ")
    }
}

pub(crate) fn extract_name(filename: &str) -> String {
    let base = strip_bat_extension(filename);

    let cleaned: String = base
        .chars()
        .map(|c| match c {
            '(' | ')' | '[' | ']' => ' ',
            '_' | '-' => ' ',
            other => other,
        })
        .collect();

    let tokens: Vec<&str> = cleaned.split_whitespace().collect();

    let without_common = match tokens.first().copied() {
        Some(first) if first.eq_ignore_ascii_case("general") => &tokens[1..],
        _ => &tokens[..],
    };

    let mut words: Vec<String> = Vec::new();
    let mut pending_number: Option<String> = None;

    for token in without_common {
        let (letters, digits) = split_trailing_digits(token);

        if letters.is_empty() {
            continue;
        }

        if !words.is_empty() {
            if let Some(number) = pending_number.take() {
                words.push(number);
            }
        }

        words.push(capitalize_word(letters));

        if !digits.is_empty() {
            pending_number = Some(digits.to_string());
        }
    }

    if words.is_empty() {
        return fallback_name(base);
    }

    if let Some(number) = pending_number {
        words.push(number);
    }

    words.join(" ")
}

fn leading_index(filename: &str) -> Option<u32> {
    let base = strip_bat_extension(filename);
    let mut digits = String::new();
    let mut started = false;

    for c in base.chars() {
        if c.is_ascii_digit() {
            digits.push(c);
            started = true;
        } else if started {
            break;
        }
    }

    digits.parse().ok()
}

fn disambiguate_group(results: &mut [StrategyInfo], group: &[usize]) {
    let mut ordered: Vec<usize> = group.to_vec();

    ordered.sort_by_key(|index| {
        (
            leading_index(&results[*index].filename).unwrap_or(u32::MAX),
            results[*index].filename.clone(),
        )
    });

    for (position, index) in ordered.into_iter().enumerate() {
        if position == 0 {
            continue;
        }

        results[index].name = match leading_index(&results[index].filename) {
            Some(number) => format!("{} {}", results[index].name, number),
            None => format!("{} ({})", results[index].name, position),
        };
    }
}

pub(crate) fn deduplicate_names(results: &mut [StrategyInfo]) {
    let mut sorted: Vec<usize> = (0..results.len()).collect();

    sorted.sort_by(|left, right| {
        results[*left]
            .name
            .to_lowercase()
            .cmp(&results[*right].name.to_lowercase())
    });

    let mut start = 0usize;

    while start < sorted.len() {
        let name = results[sorted[start]].name.to_lowercase();
        let mut end = start + 1;

        while end < sorted.len()
            && results[sorted[end]].name.to_lowercase() == name
        {
            end += 1;
        }

        if end - start > 1 {
            disambiguate_group(results, &sorted[start..end]);
        }

        start = end;
    }
}