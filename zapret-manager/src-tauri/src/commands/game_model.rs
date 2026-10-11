use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum GamePlatform {
    Steam,
    Epic,
    Gog,
    Ubisoft,
    Ea,
    BattleNet,
    Custom,
    Unknown,
}

impl GamePlatform {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Steam => "steam",
            Self::Epic => "epic",
            Self::Gog => "gog",
            Self::Ubisoft => "ubisoft",
            Self::Ea => "ea",
            Self::BattleNet => "battlenet",
            Self::Custom => "custom",
            Self::Unknown => "unknown",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum GameSource {
    Registry,
    Steam,
    Epic,
    Gog,
    Ubisoft,
    Ea,
    BattleNet,
    KnownFolder,
    UserFolder,
}

impl GameSource {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Registry => "registry",
            Self::Steam => "steam",
            Self::Epic => "epic",
            Self::Gog => "gog",
            Self::Ubisoft => "ubisoft",
            Self::Ea => "ea",
            Self::BattleNet => "battlenet",
            Self::KnownFolder => "knownFolder",
            Self::UserFolder => "userFolder",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledGame {
    pub id: String,
    pub name: String,
    pub appid: Option<String>,
    pub platform: GamePlatform,
    pub source: GameSource,
    pub install_path: String,
    pub executable_path: String,
    pub launch_args: Option<String>,
    pub cover_url: Option<String>,
    pub game_settings_id: Option<String>,
    pub anticheat: Option<String>,
    pub bypass_mode: Option<String>,
    pub last_launched_at: Option<u64>,
    pub launch_count: u64,
}

impl InstalledGame {
    pub fn new(
        platform: GamePlatform,
        source: GameSource,
        install_path: &str,
        executable_path: &str,
    ) -> Self {
        let name = folder_title(install_path, executable_path);

        Self {
            id: game_id(platform, executable_path),
            name,
            appid: None,
            platform,
            source,
            install_path: install_path.to_string(),
            executable_path: executable_path.to_string(),
            launch_args: None,
            cover_url: None,
            game_settings_id: None,
            anticheat: None,
            bypass_mode: None,
            last_launched_at: None,
            launch_count: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameScanProgress {
    pub source: String,
    pub found: usize,
    pub current: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Anticheat {
    BattlEye,
    Eac,
    None,
}

impl Anticheat {
    pub fn parse(value: &str) -> Self {
        match value.trim().to_ascii_lowercase().as_str() {
            "battleye" => Self::BattlEye,
            "eac" => Self::Eac,
            _ => Self::None,
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::BattlEye => "battleye",
            Self::Eac => "eac",
            Self::None => "none",
        }
    }
}

pub fn sanitize_id_part(value: &str) -> String {
    let cleaned: String = value
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() {
                character.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect();
    let mut result = String::with_capacity(cleaned.len());
    let mut last_dash = false;

    for character in cleaned.chars() {
        if character == '-' {
            if !last_dash {
                result.push('-');
            }
            last_dash = true;
        } else {
            result.push(character);
            last_dash = false;
        }
    }

    result.trim_matches('-').to_string()
}

pub fn game_id(platform: GamePlatform, executable_path: &str) -> String {
    format!(
        "{}-{}",
        platform.as_str(),
        sanitize_id_part(&normalize_title(executable_path))
    )
}

pub fn normalize_title(value: &str) -> String {
    let mut result = String::with_capacity(value.len());

    for character in value.chars() {
        match character {
            '\u{2122}' | '\u{00ae}' | '\u{00a9}' => {}
            character if character.is_whitespace() => result.push(' '),
            character => result.push(character.to_ascii_lowercase()),
        }
    }

    result.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn folder_title(install_path: &str, executable_path: &str) -> String {
    let file_name = std::path::Path::new(executable_path)
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_string();
    let folder_name = std::path::Path::new(install_path)
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_string();

    if file_name.is_empty() || file_name.eq_ignore_ascii_case(folder_name.as_str()) {
        if folder_name.is_empty() {
            return file_name;
        }
        return folder_name;
    }

    format!("{folder_name} — {file_name}")
}

#[cfg(test)]
#[path = "game_model_tests.rs"]
mod tests;