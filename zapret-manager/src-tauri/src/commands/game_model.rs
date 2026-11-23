// Подключаем модули: serde::{Deserialize, Serialize};.
use serde::{Deserialize, Serialize};

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем перечисление GamePlatform.
pub enum GamePlatform {
    // Выполняем операцию: Steam,.
    Steam,
    // Выполняем операцию: Epic,.
    Epic,
    // Выполняем операцию: Gog,.
    Gog,
    // Выполняем операцию: Ubisoft,.
    Ubisoft,
    // Выполняем операцию: Riot,.
    Riot,
    // Выполняем операцию: Ea,.
    Ea,
    // Выполняем операцию: BattleNet,.
    BattleNet,
    // Выполняем операцию: Custom,.
    Custom,
    // Выполняем операцию: Unknown,.
    Unknown,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем перечисление GameSource.
pub enum GameSource {
    // Выполняем операцию: Registry,.
    Registry,
    // Выполняем операцию: Steam,.
    Steam,
    // Выполняем операцию: Epic,.
    Epic,
    // Выполняем операцию: Gog,.
    Gog,
    // Выполняем операцию: Ubisoft,.
    Ubisoft,
    // Выполняем операцию: Riot,.
    Riot,
    // Выполняем операцию: Ea,.
    Ea,
    // Выполняем операцию: BattleNet,.
    BattleNet,
    // Выполняем операцию: KnownFolder,.
    KnownFolder,
    // Выполняем операцию: UserFolder,.
    UserFolder,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl GameSource {
    // Объявляем функцию as_str.
    pub fn as_str(self) -> &'static str {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::Registry => "registry",.
            Self::Registry => "registry",
            // Выполняем операцию: Self::Steam => "steam",.
            Self::Steam => "steam",
            // Выполняем операцию: Self::Epic => "epic",.
            Self::Epic => "epic",
            // Выполняем операцию: Self::Gog => "gog",.
            Self::Gog => "gog",
            // Выполняем операцию: Self::Ubisoft => "ubisoft",.
            Self::Ubisoft => "ubisoft",
            // Выполняем операцию: Self::Riot => "riot",.
            Self::Riot => "riot",
            // Выполняем операцию: Self::Ea => "ea",.
            Self::Ea => "ea",
            // Выполняем операцию: Self::BattleNet => "battlenet",.
            Self::BattleNet => "battlenet",
            // Выполняем операцию: Self::KnownFolder => "knownFolder",.
            Self::KnownFolder => "knownFolder",
            // Выполняем операцию: Self::UserFolder => "userFolder",.
            Self::UserFolder => "userFolder",
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize, Deserialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру InstalledGame.
pub struct InstalledGame {
    // Выполняем операцию: pub id: String,.
    pub id: String,
    // Выполняем операцию: pub name: String,.
    pub name: String,
    // Выполняем операцию: pub appid: Option<String>,.
    pub appid: Option<String>,
    // Выполняем операцию: pub platform: GamePlatform,.
    pub platform: GamePlatform,
    // Выполняем операцию: pub source: GameSource,.
    pub source: GameSource,
    // Выполняем операцию: pub install_path: String,.
    pub install_path: String,
    // Выполняем операцию: pub executable_path: String,.
    pub executable_path: String,
    // Выполняем операцию: pub launch_args: Option<String>,.
    pub launch_args: Option<String>,
    // Выполняем операцию: pub cover_url: Option<String>,.
    pub cover_url: Option<String>,
    /// Путь к скачанной обложке в кэше приложения.
    // Выполняем операцию: pub cover_path: Option<String>,.
    pub cover_path: Option<String>,
    // Выполняем операцию: pub game_settings_id: Option<String>,.
    pub game_settings_id: Option<String>,
    // Выполняем операцию: pub anticheat: Option<String>,.
    pub anticheat: Option<String>,
    // Выполняем операцию: pub last_launched_at: Option<u64>,.
    pub last_launched_at: Option<u64>,
    // Выполняем операцию: pub launch_count: u64,.
    pub launch_count: u64,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl InstalledGame {
    // Объявляем функцию new.
    pub fn new(
        // Выполняем операцию: platform: GamePlatform,.
        platform: GamePlatform,
        // Выполняем операцию: source: GameSource,.
        source: GameSource,
        // Выполняем операцию: install_path: &str,.
        install_path: &str,
        // Выполняем операцию: executable_path: &str,.
        executable_path: &str,
        // Закрываем выражение или коллекцию.
    ) -> Self {
        // Объявляем переменную name .
        let name = folder_title(install_path, executable_path);

        // Выполняем операцию: Self {.
        Self {
            // Выполняем операцию: id: game_id(executable_path),.
            id: game_id(executable_path),
            // Выполняем операцию: name,.
            name,
            // Выполняем операцию: appid: None,.
            appid: None,
            // Выполняем операцию: platform,.
            platform,
            // Выполняем операцию: source,.
            source,
            // Выполняем операцию: install_path: install_path.to_string(),.
            install_path: install_path.to_string(),
            // Выполняем операцию: executable_path: executable_path.to_string(),.
            executable_path: executable_path.to_string(),
            // Выполняем операцию: launch_args: None,.
            launch_args: None,
            // Выполняем операцию: cover_url: None,.
            cover_url: None,
            // Выполняем операцию: cover_path: None,.
            cover_path: None,
            // Выполняем операцию: game_settings_id: None,.
            game_settings_id: None,
            // Выполняем операцию: anticheat: None,.
            anticheat: None,
            // Выполняем операцию: last_launched_at: None,.
            last_launched_at: None,
            // Выполняем операцию: launch_count: 0,.
            launch_count: 0,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру GameScanProgress.
pub struct GameScanProgress {
    // Выполняем операцию: pub source: String,.
    pub source: String,
    // Выполняем операцию: pub found: usize,.
    pub found: usize,
    // Выполняем операцию: pub current: String,.
    pub current: String,
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
// Объявляем перечисление Anticheat.
pub enum Anticheat {
    // Выполняем операцию: BattlEye,.
    BattlEye,
    // Выполняем операцию: Eac,.
    Eac,
    // Выполняем операцию: None,.
    None,
    // Закрываем блок.
}

// Открываем реализацию типа.
impl Anticheat {
    // Объявляем функцию parse.
    pub fn parse(value: &str) -> Self {
        // Выбираем вариант по значению.
        match value.trim().to_ascii_lowercase().as_str() {
            // Выполняем операцию: "battleye" => Self::BattlEye,.
            "battleye" => Self::BattlEye,
            // Выполняем операцию: "eac" => Self::Eac,.
            "eac" => Self::Eac,
            // Выполняем операцию: _ => Self::None,.
            _ => Self::None,
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем функцию as_str.
    pub fn as_str(self) -> &'static str {
        // Выбираем вариант по значению.
        match self {
            // Выполняем операцию: Self::BattlEye => "battleye",.
            Self::BattlEye => "battleye",
            // Выполняем операцию: Self::Eac => "eac",.
            Self::Eac => "eac",
            // Выполняем операцию: Self::None => "none",.
            Self::None => "none",
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию sanitize_id_part.
pub fn sanitize_id_part(value: &str) -> String {
    // Объявляем переменную cleaned.
    let cleaned: String = value
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .map(|character| {.
        .map(|character| {
            // Проверяем условие: character.is_ascii_alphanumeric() {.
            if character.is_ascii_alphanumeric() {
                // Выполняем операцию: character.to_ascii_lowercase().
                character.to_ascii_lowercase()
            // Закрываем блок.
            } else {
                // Выполняем операцию: '-'.
                '-'
                // Закрываем блок.
            }
            // Закрываем блок.
        })
        // Выполняем операцию: .collect();.
        .collect();
    // Объявляем переменную result .
    let mut result = String::with_capacity(cleaned.len());
    // Объявляем переменную last_dash .
    let mut last_dash = false;

    // Перебираем элементы коллекции.
    for character in cleaned.chars() {
        // Проверяем условие: character == '-' {.
        if character == '-' {
            // Проверяем условие: !last_dash {.
            if !last_dash {
                // Выполняем операцию: result.push('-');.
                result.push('-');
                // Закрываем блок.
            }
            // Выполняем операцию: last_dash = true;.
            last_dash = true;
        // Закрываем блок.
        } else {
            // Выполняем операцию: result.push(character);.
            result.push(character);
            // Выполняем операцию: last_dash = false;.
            last_dash = false;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.trim_matches('-').to_string().
    result.trim_matches('-').to_string()
    // Закрываем блок.
}

/// Идентификатор строится только из пути к exe, без платформы.
///
/// Платформа может переклассифицироваться между сканами (игра нашлась
/// в реестре, потом через библиотеку Steam), а на идентификатор завязаны
/// «удалённые» игры и выбор способа запуска: со сменой платформы в id
/// удалённая крестиком игра возвращалась при пересканировании.
/// Префикс `g-` отделяет новый формат от идентификаторов старых версий.
// Объявляем функцию game_id.
pub fn game_id(executable_path: &str) -> String {
    // Выполняем операцию: format!("g-{}", sanitize_id_part(&normalize_title(execu.
    format!("g-{}", sanitize_id_part(&normalize_title(executable_path)))
    // Закрываем блок.
}

// Объявляем функцию normalize_title.
pub fn normalize_title(value: &str) -> String {
    // Объявляем переменную result .
    let mut result = String::with_capacity(value.len());

    // Перебираем элементы коллекции.
    for character in value.chars() {
        // Выбираем вариант по значению.
        match character {
            // Выполняем операцию: '\u{2122}' | '\u{00ae}' | '\u{00a9}' => {}.
            '\u{2122}' | '\u{00ae}' | '\u{00a9}' => {}
            // Выполняем операцию: character if character.is_whitespace() => result.push('.
            character if character.is_whitespace() => result.push(' '),
            // Выполняем операцию: character => result.push(character.to_ascii_lowercase().
            character => result.push(character.to_ascii_lowercase()),
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.split_whitespace().collect::<Vec<_>>().join(" ").
    result.split_whitespace().collect::<Vec<_>>().join(" ")
    // Закрываем блок.
}

// Объявляем функцию folder_title.
pub fn folder_title(install_path: &str, executable_path: &str) -> String {
    // Объявляем переменную file_name .
    let file_name = std::path::Path::new(executable_path)
        // Выполняем операцию: .file_stem().
        .file_stem()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();
    // Объявляем переменную folder_name .
    let folder_name = std::path::Path::new(install_path)
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string();.
        .to_string();

    // Проверяем условие: file_name.is_empty() || file_name.eq_ignore_ascii_.
    if file_name.is_empty() || file_name.eq_ignore_ascii_case(folder_name.as_str()) {
        // Проверяем условие: folder_name.is_empty() {.
        if folder_name.is_empty() {
            // Возвращаем результат из функции.
            return file_name;
            // Закрываем блок.
        }
        // Возвращаем результат из функции.
        return folder_name;
        // Закрываем блок.
    }

    // Выполняем операцию: format!("{folder_name} — {file_name}").
    format!("{folder_name} — {file_name}")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_model_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
