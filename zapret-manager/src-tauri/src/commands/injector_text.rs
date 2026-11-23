// Подключаем модули: std::collections::HashSet;.
use std::collections::HashSet;

// Подключаем модули: crate::commands::injector_core::{is_valid_domain, is_va.
use crate::commands::injector_core::{is_valid_domain, is_valid_ip, normalize_domain, ConfigKind};
// Подключаем модули: crate::constants::{MARKER_END, MARKER_START};.
use crate::constants::{MARKER_END, MARKER_START};

// Объявляем функцию read_existing_entries.
pub fn read_existing_entries(content: &str) -> HashSet<String> {
    // Объявляем переменную entries .
    let mut entries = HashSet::new();

    // Перебираем элементы коллекции.
    for line in content.lines() {
        // Объявляем переменную trimmed .
        let trimmed = line.trim();

        // Проверяем условие: trimmed.is_empty() || trimmed.starts_with('#') || .
        if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with(';') {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: trimmed.starts_with(MARKER_START) {.
        if trimmed.starts_with(MARKER_START) {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: entries.insert(normalize_domain(trimmed));.
        entries.insert(normalize_domain(trimmed));
        // Закрываем блок.
    }

    // Выполняем операцию: entries.
    entries
    // Закрываем блок.
}

// Объявляем функцию remove_marker_section.
pub fn remove_marker_section(content: &str) -> String {
    // Объявляем переменную kept.
    let mut kept: Vec<&str> = Vec::new();
    // Объявляем переменную inside .
    let mut inside = false;

    // Перебираем элементы коллекции.
    for line in content.lines() {
        // Объявляем переменную trimmed .
        let trimmed = line.trim();

        // Проверяем условие: !inside && trimmed.starts_with(MARKER_START) {.
        if !inside && trimmed.starts_with(MARKER_START) {
            // Выполняем операцию: inside = true;.
            inside = true;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: inside {.
        if inside {
            // Проверяем условие: trimmed.starts_with(MARKER_END) {.
            if trimmed.starts_with(MARKER_END) {
                // Выполняем операцию: inside = false;.
                inside = false;
                // Закрываем блок.
            }

            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: kept.push(line);.
        kept.push(line);
        // Закрываем блок.
    }

    // Объявляем переменную text .
    let text = kept.join("\r\n").trim_end().to_string();

    // Проверяем условие: text.is_empty() {.
    if text.is_empty() {
        // Выполняем операцию: String::new().
        String::new()
    // Закрываем блок.
    } else {
        // Выполняем операцию: format!("{text}\r\n").
        format!("{text}\r\n")
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию extract_marker_entries.
pub fn extract_marker_entries(content: &str) -> Vec<String> {
    // Объявляем переменную entries.
    let mut entries: Vec<String> = Vec::new();
    // Объявляем переменную inside .
    let mut inside = false;

    // Перебираем элементы коллекции.
    for line in content.lines() {
        // Объявляем переменную trimmed .
        let trimmed = line.trim();

        // Проверяем условие: !inside && trimmed.starts_with(MARKER_START) {.
        if !inside && trimmed.starts_with(MARKER_START) {
            // Выполняем операцию: inside = true;.
            inside = true;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: !inside {.
        if !inside {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: trimmed.starts_with(MARKER_END) {.
        if trimmed.starts_with(MARKER_END) {
            // Выполняем операцию: inside = false;.
            inside = false;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Проверяем условие: trimmed.is_empty() || trimmed.starts_with('#') || .
        if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with(';') {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную entry .
        let entry = normalize_domain(trimmed);

        // Проверяем условие: is_valid_domain(&entry) || is_valid_ip(&entry) {.
        if is_valid_domain(&entry) || is_valid_ip(&entry) {
            // Выполняем операцию: entries.push(entry);.
            entries.push(entry);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: entries.
    entries
    // Закрываем блок.
}

// Объявляем функцию append_marker_section.
pub fn append_marker_section(content: &str, entries: &[String], note: &str) -> String {
    // Объявляем переменную base .
    let mut base = remove_marker_section(content);

    // Проверяем условие: !base.is_empty() {.
    if !base.is_empty() {
        // Выполняем операцию: base.push_str("\r\n");.
        base.push_str("\r\n");
        // Закрываем блок.
    }

    // Объявляем переменную block .
    let mut block = String::new();
    // Выполняем операцию: block.push_str(MARKER_START);.
    block.push_str(MARKER_START);
    // Выполняем операцию: block.push_str("\r\n# ");.
    block.push_str("\r\n# ");
    // Выполняем операцию: block.push_str(note);.
    block.push_str(note);
    // Выполняем операцию: block.push_str("\r\n");.
    block.push_str("\r\n");

    // Перебираем элементы коллекции.
    for entry in entries {
        // Выполняем операцию: block.push_str(entry);.
        block.push_str(entry);
        // Выполняем операцию: block.push_str("\r\n");.
        block.push_str("\r\n");
        // Закрываем блок.
    }

    // Выполняем операцию: block.push_str(MARKER_END);.
    block.push_str(MARKER_END);
    // Выполняем операцию: block.push_str("\r\n");.
    block.push_str("\r\n");

    // Выполняем операцию: format!("{base}{block}").
    format!("{base}{block}")
    // Закрываем блок.
}

// Объявляем функцию collect_new_entries.
pub fn collect_new_entries(
    // Выполняем операцию: content: &str,.
    content: &str,
    // Выполняем операцию: candidates: &[String],.
    candidates: &[String],
    // Выполняем операцию: kind: ConfigKind,.
    kind: ConfigKind,
    // Закрываем выражение или коллекцию.
) -> (Vec<String>, usize, usize) {
    // Объявляем переменную existing .
    let existing = read_existing_entries(content);
    // Объявляем переменную accepted.
    let mut accepted: Vec<String> = Vec::new();
    // Объявляем переменную seen.
    let mut seen: Vec<String> = Vec::new();
    // Объявляем переменную duplicates .
    let mut duplicates = 0usize;
    // Объявляем переменную rejected .
    let mut rejected = 0usize;

    // Перебираем элементы коллекции.
    for candidate in candidates {
        // Объявляем переменную trimmed .
        let trimmed = candidate.trim();

        // Проверяем условие: trimmed.is_empty() {.
        if trimmed.is_empty() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную valid .
        let valid = match kind {
            // Выполняем операцию: ConfigKind::Domains => is_valid_domain(trimmed),.
            ConfigKind::Domains => is_valid_domain(trimmed),
            // Выполняем операцию: ConfigKind::Ips => is_valid_ip(trimmed),.
            ConfigKind::Ips => is_valid_ip(trimmed),
            // Закрываем блок.
        };

        // Проверяем условие: !valid {.
        if !valid {
            // Выполняем операцию: rejected += 1;.
            rejected += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную normalized .
        let normalized = match kind {
            // Выполняем операцию: ConfigKind::Domains => normalize_domain(trimmed),.
            ConfigKind::Domains => normalize_domain(trimmed),
            // Выполняем операцию: ConfigKind::Ips => trimmed.to_string(),.
            ConfigKind::Ips => trimmed.to_string(),
            // Закрываем блок.
        };

        // Проверяем условие: existing.contains(&normalized) || seen.contains(&n.
        if existing.contains(&normalized) || seen.contains(&normalized) {
            // Выполняем операцию: duplicates += 1;.
            duplicates += 1;
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Выполняем операцию: seen.push(normalized.clone());.
        seen.push(normalized.clone());
        // Выполняем операцию: accepted.push(normalized);.
        accepted.push(normalized);
        // Закрываем блок.
    }

    // Выполняем операцию: (accepted, duplicates, rejected).
    (accepted, duplicates, rejected)
    // Закрываем блок.
}

// Объявляем функцию civil_from_days.
fn civil_from_days(days: i64) -> (i64, i64, i64) {
    // Объявляем переменную shifted .
    let shifted = days + 719_468;
    // Объявляем переменную era .
    let era = shifted.div_euclid(146_097);
    // Объявляем переменную day_of_era .
    let day_of_era = shifted.rem_euclid(146_097);
    // Объявляем переменную year_of_era .
    let year_of_era =
        // Выполняем операцию: (day_of_era - day_of_era / 1460 + day_of_era / 36_524 -.
        (day_of_era - day_of_era / 1460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    // Объявляем переменную year .
    let year = year_of_era + era * 400;
    // Объявляем переменную day_of_year .
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    // Объявляем переменную month_index .
    let month_index = (5 * day_of_year + 2) / 153;
    // Объявляем переменную date .
    let date = day_of_year - (153 * month_index + 2) / 5 + 1;
    // Объявляем переменную month .
    let month = if month_index < 10 {
        // Выполняем операцию: month_index + 3.
        month_index + 3
    // Закрываем блок.
    } else {
        // Выполняем операцию: month_index - 9.
        month_index - 9
        // Закрываем блок.
    };

    // Выполняем операцию: (if month <= 2 { year + 1 } else { year }, month, date).
    (if month <= 2 { year + 1 } else { year }, month, date)
    // Закрываем блок.
}

// Объявляем функцию chrono_stamp.
pub fn chrono_stamp(timestamp: u64) -> String {
    // Объявляем переменную seconds .
    let seconds = (timestamp / 1000) as i64;
    // Объявляем переменную (year, month, date) .
    let (year, month, date) = civil_from_days(seconds.div_euclid(86_400));
    // Объявляем переменную time_of_day .
    let time_of_day = seconds.rem_euclid(86_400);

    // Выполняем операцию: format!(.
    format!(
        // Выполняем операцию: "{year:04}-{month:02}-{date:02} {:02}:{:02}:{:02} UTC",.
        "{year:04}-{month:02}-{date:02} {:02}:{:02}:{:02} UTC",
        // Выполняем операцию: time_of_day / 3600,.
        time_of_day / 3600,
        // Выполняем операцию: (time_of_day % 3600) / 60,.
        (time_of_day % 3600) / 60,
        // Выполняем операцию: time_of_day % 60.
        time_of_day % 60 // Закрываем выражение или коллекцию.
    )
    // Закрываем блок.
}
