use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterGroup {
    pub args: Vec<String>,
    pub uses_general_hostlist: bool,
    pub uses_all_ipset: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StrategyConfig {
    pub source_filename: String,
    pub winws_path: String,
    pub wf_tcp: Option<String>,
    pub wf_udp: Option<String>,
    pub groups: Vec<FilterGroup>,
}

#[derive(Debug, Clone, Default)]
pub struct BuildOptions<'a> {
    pub log_path: Option<&'a Path>,
    pub games_hostlist: Option<&'a Path>,
    pub games_ipset: Option<&'a Path>,
    pub extra_args: &'a [String],
}

impl StrategyConfig {
    pub fn build_args(&self, options: &BuildOptions<'_>) -> Vec<String> {
        let mut args: Vec<String> = Vec::new();

        if let Some(value) = &self.wf_tcp {
            args.push(format!("--wf-tcp={value}"));
        }

        if let Some(value) = &self.wf_udp {
            args.push(format!("--wf-udp={value}"));
        }

        if let Some(path) = options.log_path {
            args.push(format!("--debug=@{}", path.display()));
        }

        for (index, group) in self.groups.iter().enumerate() {
            if index > 0 {
                args.push("--new".to_string());
            }

            args.extend(group.args.iter().cloned());

            if group.uses_general_hostlist {
                if let Some(path) = options.games_hostlist {
                    args.push(format!("--hostlist={}", path.display()));
                }
            }

            if group.uses_all_ipset {
                if let Some(path) = options.games_ipset {
                    args.push(format!("--ipset={}", path.display()));
                }
            }
        }

        args.extend(options.extra_args.iter().cloned());

        args
    }

    pub fn validate(&self) -> AppResult<()> {
        if self.winws_path.trim().is_empty() {
            return Err(AppError::custom(
                "В конфигурации стратегии не указан winws.exe",
            ));
        }

        if self.groups.is_empty() || self.groups.iter().all(|group| group.args.is_empty())
        {
            return Err(AppError::custom(
                "В конфигурации стратегии нет ни одной группы фильтров",
            ));
        }

        Ok(())
    }

    pub fn filter_groups_count(&self) -> usize {
        self.groups.len()
    }
}
