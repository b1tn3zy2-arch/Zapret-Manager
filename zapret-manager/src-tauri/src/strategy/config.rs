// Подключаем модули: std::path::Path;.
use std::path::Path;

// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Подключаем модули: crate::error::{AppError, AppResult};.
use crate::error::{AppError, AppResult};

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру FilterGroup.
pub struct FilterGroup {
    // Выполняем операцию: pub args: Vec<String>,.
    pub args: Vec<String>,
    // Выполняем операцию: pub uses_general_hostlist: bool,.
    pub uses_general_hostlist: bool,
    // Выполняем операцию: pub uses_all_ipset: bool,.
    pub uses_all_ipset: bool,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру StrategyConfig.
pub struct StrategyConfig {
    // Выполняем операцию: pub source_filename: String,.
    pub source_filename: String,
    // Выполняем операцию: pub winws_path: String,.
    pub winws_path: String,
    // Выполняем операцию: pub wf_tcp: Option<String>,.
    pub wf_tcp: Option<String>,
    // Выполняем операцию: pub wf_udp: Option<String>,.
    pub wf_udp: Option<String>,
    // Выполняем операцию: pub groups: Vec<FilterGroup>,.
    pub groups: Vec<FilterGroup>,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Default)]
// Объявляем структуру BuildOptions.
pub struct BuildOptions<'a> {
    // Выполняем операцию: pub log_path: Option<&'a Path>,.
    pub log_path: Option<&'a Path>,
    // Выполняем операцию: pub games_hostlist: Option<&'a Path>,.
    pub games_hostlist: Option<&'a Path>,
    // Выполняем операцию: pub games_hostlist_exclude: Option<&'a Path>,.
    pub games_hostlist_exclude: Option<&'a Path>,
    // Выполняем операцию: pub games_udp_ports: Option<&'a [u16]>,.
    pub games_udp_ports: Option<&'a [u16]>,
    // Выполняем операцию: pub games_udp_fake: Option<&'a Path>,.
    pub games_udp_fake: Option<&'a Path>,
    // Выполняем операцию: pub games_ipset: Option<&'a Path>,.
    pub games_ipset: Option<&'a Path>,
    // Выполняем операцию: pub extra_args: &'a [String],.
    pub extra_args: &'a [String],
    // Закрываем блок.
}

// Открываем реализацию типа.
impl StrategyConfig {
    // Объявляем функцию build_args.
    pub fn build_args(&self, options: &BuildOptions<'_>) -> Vec<String> {
        // Объявляем переменную args.
        let mut args: Vec<String> = Vec::new();
        // Объявляем переменную game_ports .
        let game_ports = options
            // Выполняем операцию: .games_udp_ports.
            .games_udp_ports
            // Выполняем операцию: .map(|ports| {.
            .map(|ports| {
                // Выполняем операцию: ports.
                ports
                    // Выполняем операцию: .iter().
                    .iter()
                    // Выполняем операцию: .map(u16::to_string).
                    .map(u16::to_string)
                    // Выполняем операцию: .collect::<Vec<String>>().
                    .collect::<Vec<String>>()
                    // Выполняем операцию: .join(",").
                    .join(",")
                // Закрываем блок.
            })
            // Выполняем операцию: .filter(|list| !list.is_empty());.
            .filter(|list| !list.is_empty());
        // Объявляем переменную wf_udp .
        let wf_udp = merge_port_lists(self.wf_udp.as_deref(), game_ports.as_deref());

        // Проверяем условие: let Some(value) = &self.wf_tcp {.
        if let Some(value) = &self.wf_tcp {
            // Выполняем операцию: args.push(format!("--wf-tcp={value}"));.
            args.push(format!("--wf-tcp={value}"));
            // Закрываем блок.
        }

        // Проверяем условие: let Some(value) = &wf_udp {.
        if let Some(value) = &wf_udp {
            // Выполняем операцию: args.push(format!("--wf-udp={value}"));.
            args.push(format!("--wf-udp={value}"));
            // Закрываем блок.
        }

        // Проверяем условие: let Some(path) = options.log_path {.
        if let Some(path) = options.log_path {
            // Выполняем операцию: args.push(format!("--debug=@{}", path.display()));.
            args.push(format!("--debug=@{}", path.display()));
            // Закрываем блок.
        }

        // Перебираем элементы коллекции.
        for (index, group) in self.groups.iter().enumerate() {
            // Проверяем условие: index > 0 {.
            if index > 0 {
                // Выполняем операцию: args.push("--new".to_string());.
                args.push("--new".to_string());
                // Закрываем блок.
            }

            // Выполняем операцию: args.extend(group.args.iter().cloned());.
            args.extend(group.args.iter().cloned());

            // Проверяем условие: needs_any_protocol(&args) {.
            if needs_any_protocol(&args) {
                // Выполняем операцию: args.push("--dpi-desync-any-protocol".to_string());.
                args.push("--dpi-desync-any-protocol".to_string());
                // Закрываем блок.
            }

            // Проверяем условие: group.uses_general_hostlist {.
            if group.uses_general_hostlist {
                // Проверяем условие: let Some(path) = options.games_hostlist {.
                if let Some(path) = options.games_hostlist {
                    // Выполняем операцию: args.push(format!("--hostlist={}", path.display()));.
                    args.push(format!("--hostlist={}", path.display()));
                    // Закрываем блок.
                }

                // Проверяем условие: let Some(path) = options.games_hostlist_exclude {.
                if let Some(path) = options.games_hostlist_exclude {
                    // Выполняем операцию: args.push(format!("--hostlist-exclude={}", path.display.
                    args.push(format!("--hostlist-exclude={}", path.display()));
                    // Закрываем блок.
                }
                // Закрываем блок.
            }

            // Проверяем условие: group.uses_all_ipset {.
            if group.uses_all_ipset {
                // Проверяем условие: let Some(path) = options.games_ipset {.
                if let Some(path) = options.games_ipset {
                    // Выполняем операцию: args.push(format!("--ipset={}", path.display()));.
                    args.push(format!("--ipset={}", path.display()));
                    // Закрываем блок.
                }
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Проверяем условие: let (Some(ports), Some(fake)) = (options.games_udp.
        if let (Some(ports), Some(fake)) = (options.games_udp_ports, options.games_udp_fake) {
            // Объявляем переменную list .
            let list = ports
                // Выполняем операцию: .iter().
                .iter()
                // Выполняем операцию: .map(|value| value.to_string()).
                .map(|value| value.to_string())
                // Выполняем операцию: .collect::<Vec<String>>().
                .collect::<Vec<String>>()
                // Выполняем операцию: .join(",");.
                .join(",");

            // Проверяем условие: !list.is_empty() {.
            if !list.is_empty() {
                // Выполняем операцию: args.push("--new".to_string());.
                args.push("--new".to_string());
                // Выполняем операцию: args.push(format!("--filter-udp={list}"));.
                args.push(format!("--filter-udp={list}"));
                // Выполняем операцию: args.push("--dpi-desync=fake".to_string());.
                args.push("--dpi-desync=fake".to_string());
                // Выполняем операцию: args.push("--dpi-desync-repeats=3".to_string());.
                args.push("--dpi-desync-repeats=3".to_string());
                // Выполняем операцию: args.push(format!("--dpi-desync-fake-unknown-udp={}", f.
                args.push(format!("--dpi-desync-fake-unknown-udp={}", fake.display()));
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Выполняем операцию: args.extend(options.extra_args.iter().cloned());.
        args.extend(options.extra_args.iter().cloned());

        // Выполняем операцию: args.
        args
        // Закрываем блок.
    }

    // Объявляем функцию validate.
    pub fn validate(&self) -> AppResult<()> {
        // Проверяем условие: self.winws_path.trim().is_empty() {.
        if self.winws_path.trim().is_empty() {
            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "В конфигурации стратегии не указан winws.exe",.
                "В конфигурации стратегии не указан winws.exe",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Проверяем условие: self.groups.is_empty() || self.groups.iter().all(|.
        if self.groups.is_empty() || self.groups.iter().all(|group| group.args.is_empty()) {
            // Возвращаем результат из функции.
            return Err(AppError::custom(
                // Выполняем операцию: "В конфигурации стратегии нет ни одной группы фильтров".
                "В конфигурации стратегии нет ни одной группы фильтров",
                // Закрываем выражение или коллекцию.
            ));
            // Закрываем блок.
        }

        // Выполняем операцию: Ok(()).
        Ok(())
        // Закрываем блок.
    }

    // Объявляем функцию filter_groups_count.
    pub fn filter_groups_count(&self) -> usize {
        // Выполняем операцию: self.groups.len().
        self.groups.len()
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию needs_any_protocol.
pub fn needs_any_protocol(args: &[String]) -> bool {
    // Объявляем переменную joined .
    let joined = args.join(" ");

    // Выполняем операцию: joined.contains("--filter-udp=").
    joined.contains("--filter-udp=")
        // Выполняем операцию: && joined.contains("--dpi-desync=").
        && joined.contains("--dpi-desync=")
        // Выполняем операцию: && !joined.contains("--dpi-desync-any-protocol").
        && !joined.contains("--dpi-desync-any-protocol")
    // Закрываем блок.
}

// Объявляем функцию merge_port_lists.
pub fn merge_port_lists(base: Option<&str>, extra: Option<&str>) -> Option<String> {
    // Выбираем вариант по значению.
    match (base, extra) {
        // Выполняем операцию: (None, None) => None,.
        (None, None) => None,
        // Выполняем операцию: (Some(base), None) => Some(base.to_string()),.
        (Some(base), None) => Some(base.to_string()),
        // Выполняем операцию: (None, Some(extra)) => Some(extra.to_string()),.
        (None, Some(extra)) => Some(extra.to_string()),
        // Выполняем операцию: (Some(base), Some(extra)) => {.
        (Some(base), Some(extra)) => {
            // Проверяем условие: base.is_empty() {.
            if base.is_empty() {
                // Выполняем операцию: Some(extra.to_string()).
                Some(extra.to_string())
            // Закрываем блок.
            } else if extra.is_empty() {
                // Выполняем операцию: Some(base.to_string()).
                Some(base.to_string())
            // Закрываем блок.
            } else {
                // Выполняем операцию: Some(format!("{base},{extra}")).
                Some(format!("{base},{extra}"))
                // Закрываем блок.
            }
            // Закрываем блок.
        } // Закрываем блок.
    }
    // Закрываем блок.
}
