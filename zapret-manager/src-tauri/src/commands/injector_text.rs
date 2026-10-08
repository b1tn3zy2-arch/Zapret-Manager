use std::collections::HashSet;

use crate::commands::injector_core::{
    is_valid_domain, is_valid_ip, normalize_domain, ConfigKind,
};
use crate::constants::{MARKER_END, MARKER_START};

pub fn read_existing_entries(content: &str) -> HashSet<String> {
    let mut entries = HashSet::new();

    for line in content.lines() {
        let trimmed = line.trim();

        if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with(';') {
            continue;
        }

        if trimmed.starts_with(MARKER_START) {
            continue;
        }

        entries.insert(normalize_domain(trimmed));
    }

    entries
}

pub fn remove_marker_section(content: &str) -> String {
    let mut kept: Vec<&str> = Vec::new();
    let mut inside = false;

    for line in content.lines() {
        let trimmed = line.trim();

        if !inside && trimmed.starts_with(MARKER_START) {
            inside = true;
            continue;
        }

        if inside {
            if trimmed.starts_with(MARKER_END) {
                inside = false;
            }

            continue;
        }

        kept.push(line);
    }

    let text = kept.join("\r\n").trim_end().to_string();

    if text.is_empty() {
        String::new()
    } else {
        format!("{text}\r\n")
    }
}

pub fn extract_marker_entries(content: &str) -> Vec<String> {
    let mut entries: Vec<String> = Vec::new();
    let mut inside = false;

    for line in content.lines() {
        let trimmed = line.trim();

        if !inside && trimmed.starts_with(MARKER_START) {
            inside = true;
            continue;
        }

        if !inside {
            continue;
        }

        if trimmed.starts_with(MARKER_END) {
            inside = false;
            continue;
        }

        if trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with(';') {
            continue;
        }

        let entry = normalize_domain(trimmed);

        if is_valid_domain(&entry) || is_valid_ip(&entry) {
            entries.push(entry);
        }
    }

    entries
}

pub fn append_marker_section(content: &str, entries: &[String], note: &str) -> String {
    let mut base = remove_marker_section(content);

    if !base.is_empty() {
        base.push_str("\r\n");
    }

    let mut block = String::new();
    block.push_str(MARKER_START);
    block.push_str("\r\n# ");
    block.push_str(note);
    block.push_str("\r\n");

    for entry in entries {
        block.push_str(entry);
        block.push_str("\r\n");
    }

    block.push_str(MARKER_END);
    block.push_str("\r\n");

    format!("{base}{block}")
}


pub fn collect_new_entries(
    content: &str,
    candidates: &[String],
    kind: ConfigKind,
) -> (Vec<String>, usize, usize) {
    let existing = read_existing_entries(content);
    let mut accepted: Vec<String> = Vec::new();
    let mut seen: Vec<String> = Vec::new();
    let mut duplicates = 0usize;
    let mut rejected = 0usize;

    for candidate in candidates {
        let trimmed = candidate.trim();

        if trimmed.is_empty() {
            continue;
        }

        let valid = match kind {
            ConfigKind::Domains => is_valid_domain(trimmed),
            ConfigKind::Ips => is_valid_ip(trimmed),
        };

        if !valid {
            rejected += 1;
            continue;
        }

        let normalized = match kind {
            ConfigKind::Domains => normalize_domain(trimmed),
            ConfigKind::Ips => trimmed.to_string(),
        };

        if existing.contains(&normalized) || seen.contains(&normalized) {
            duplicates += 1;
            continue;
        }

        seen.push(normalized.clone());
        accepted.push(normalized);
    }

    (accepted, duplicates, rejected)
}

fn civil_from_days(days: i64) -> (i64, i64, i64) {
    let shifted = days + 719_468;
    let era = shifted.div_euclid(146_097);
    let day_of_era = shifted.rem_euclid(146_097);
    let year_of_era =
        (day_of_era - day_of_era / 1460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_index = (5 * day_of_year + 2) / 153;
    let date = day_of_year - (153 * month_index + 2) / 5 + 1;
    let month = if month_index < 10 {
        month_index + 3
    } else {
        month_index - 9
    };

    (if month <= 2 { year + 1 } else { year }, month, date)
}

pub fn chrono_stamp(timestamp: u64) -> String {
    let seconds = (timestamp / 1000) as i64;
    let (year, month, date) = civil_from_days(seconds.div_euclid(86_400));
    let time_of_day = seconds.rem_euclid(86_400);

    format!(
        "{year:04}-{month:02}-{date:02} {:02}:{:02}:{:02} UTC",
        time_of_day / 3600,
        (time_of_day % 3600) / 60,
        time_of_day % 60
    )
}
