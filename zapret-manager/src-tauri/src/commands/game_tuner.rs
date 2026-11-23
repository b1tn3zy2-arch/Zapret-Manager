// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: serde::Serialize;.
use serde::Serialize;

/// Каталоги EasyAntiCheat, которые Red Barrel кладёт рядом с игрой.
// Объявляем константу EAC_DIRS.
const EAC_DIRS: &[&str] = &[
    // Выполняем операцию: "EasyAntiCheat",.
    "EasyAntiCheat",
    // Выполняем операцию: "EasyAntiCheat_EOS",.
    "EasyAntiCheat_EOS",
    // Выполняем операцию: "EasyAntiCheat_Outlast",.
    "EasyAntiCheat_Outlast",
    // Закрываем выражение или коллекцию.
];

/// Домены, по которым видно, что игра ходит через Amazon GameLift.
// Объявляем константу GAMELIFT_DOMAINS.
const GAMELIFT_DOMAINS: &[&str] = &[
    // Выполняем операцию: "gamelift.amazonaws.com",.
    "gamelift.amazonaws.com",
    // Выполняем операцию: "gamelift.us-east-1.amazonaws.com",.
    "gamelift.us-east-1.amazonaws.com",
    // Выполняем операцию: "amazonaws.com",.
    "amazonaws.com",
    // Закрываем выражение или коллекцию.
];

/// Порты, которые zapret должен видеть помимо игровых. Диапазон `444-65535`
/// из Issue #879 сюда не попадает намеренно: модель портов у игры — это
/// `Vec<u16>`, а разворачивание диапазона в 65 тысяч значений утянуло бы и
/// `--filter-udp`, и список fake-пакетов. Широкий UDP-диапазон к тому же
/// бьёт по UDP самому античиту.
// Объявляем константу GAMELIFT_EXTRA_PORTS.
const GAMELIFT_EXTRA_PORTS: &[u16] = &[80, 88, 500];

// Применяем атрибут к следующему объявлению.
#[derive(Debug, Clone, Serialize)]
// Применяем атрибут к следующему объявлению.
#[serde(rename_all = "camelCase")]
// Объявляем структуру GameTuning.
pub struct GameTuning {
    // Выполняем операцию: pub game_id: String,.
    pub game_id: String,
    // Выполняем операцию: pub game_name: String,.
    pub game_name: String,
    // Выполняем операцию: pub requires_eac_tuning: bool,.
    pub requires_eac_tuning: bool,
    // Выполняем операцию: pub uses_gamelift: bool,.
    pub uses_gamelift: bool,
    // Выполняем операцию: pub ports: Vec<u16>,.
    pub ports: Vec<u16>,
    // Выполняем операцию: pub added_ports: Vec<u16>,.
    pub added_ports: Vec<u16>,
    /// Не добавлять игровую UDP-группу `--filter-udp ... --dpi-desync=fake`.
    // Выполняем операцию: pub drop_udp_filter: bool,.
    pub drop_udp_filter: bool,
    /// Не подставлять `--ipset` с игровыми адресами.
    // Выполняем операцию: pub drop_ipset: bool,.
    pub drop_ipset: bool,
    // Выполняем операцию: pub notes: Vec<String>,.
    pub notes: Vec<String>,
    // Закрываем блок.
}

/// Есть ли рядом с игрой каталог EasyAntiCheat.
// Объявляем функцию detect_eac.
pub fn detect_eac(install_path: &Path) -> bool {
    // Выполняем операцию: EAC_DIRS.iter().any(|name| install_path.join(name).is_d.
    EAC_DIRS.iter().any(|name| install_path.join(name).is_dir())
    // Закрываем блок.
}

// Объявляем функцию uses_gamelift.
fn uses_gamelift(domains: &[String]) -> bool {
    // Выполняем операцию: domains.iter().any(|domain| {.
    domains.iter().any(|domain| {
        // Объявляем переменную lowered .
        let lowered = domain.to_ascii_lowercase();

        // Выполняем операцию: GAMELIFT_DOMAINS.
        GAMELIFT_DOMAINS
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .any(|needle| lowered.contains(needle)).
            .any(|needle| lowered.contains(needle))
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Подбирает параметры стратегии под конкретную игру.
///
/// Возвращает не `StrategyConfig` (он собирается из .bat и живёт в
/// `strategy::parser`), а набор решений, которые применяются при сборке
/// аргументов winws.
// Объявляем функцию tune_game.
pub fn tune_game(
    // Выполняем операцию: game_id: &str,.
    game_id: &str,
    // Выполняем операцию: game_name: &str,.
    game_name: &str,
    // Выполняем операцию: install_path: &str,.
    install_path: &str,
    // Выполняем операцию: base_ports: &[u16],.
    base_ports: &[u16],
    // Выполняем операцию: domains: &[String],.
    domains: &[String],
    // Закрываем выражение или коллекцию.
) -> GameTuning {
    // Объявляем переменную path .
    let path = PathBuf::from(install_path);
    // Объявляем переменную eac .
    let eac = detect_eac(&path);
    // Объявляем переменную gamelift .
    let gamelift = uses_gamelift(domains);

    // Объявляем переменную ports.
    let mut ports: Vec<u16> = Vec::with_capacity(base_ports.len() + 4);
    // Объявляем переменную seen .
    let mut seen = std::collections::HashSet::new();

    // Перебираем элементы коллекции.
    for port in base_ports {
        // Проверяем условие: seen.insert(*port) {.
        if seen.insert(*port) {
            // Выполняем операцию: ports.push(*port);.
            ports.push(*port);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную added_ports .
    let mut added_ports = Vec::new();

    // Проверяем условие: gamelift {.
    if gamelift {
        // Перебираем элементы коллекции.
        for port in GAMELIFT_EXTRA_PORTS {
            // Проверяем условие: seen.insert(*port) {.
            if seen.insert(*port) {
                // Выполняем операцию: ports.push(*port);.
                ports.push(*port);
                // Выполняем операцию: added_ports.push(*port);.
                added_ports.push(*port);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную notes .
    let mut notes = Vec::new();

    // Проверяем условие: !added_ports.is_empty() {.
    if !added_ports.is_empty() {
        // Выполняем операцию: notes.push(format!(.
        notes.push(format!(
            // Выполняем операцию: "Добавлены порты GameLift: {}.",.
            "Добавлены порты GameLift: {}.",
            // Выполняем операцию: join_ports(&added_ports).
            join_ports(&added_ports) // Закрываем выражение или коллекцию.
        ));
        // Закрываем блок.
    }

    // Проверяем условие: eac && !gamelift {.
    if eac && !gamelift {
        // Выполняем операцию: notes.push(.
        notes.push(
            // Выполняем операцию: "Игра с EasyAntiCheat: игровая UDP-группа и --ipset отк.
            "Игра с EasyAntiCheat: игровая UDP-группа и --ipset отключены, \
             они сбивают инициализацию античита."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Проверяем условие: gamelift {.
    if gamelift {
        // Выполняем операцию: notes.push(.
        notes.push(
            // Выполняем операцию: "Игра с GameLift: UDP-подделка остаётся включённой — бе.
            "Игра с GameLift: UDP-подделка остаётся включённой — без неё игра \
             не доходит даже до лобби и падает на старте движка."
                // Выполняем операцию: .to_string(),.
                .to_string(),
            // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: GameTuning {.
    GameTuning {
        // Выполняем операцию: game_id: game_id.to_string(),.
        game_id: game_id.to_string(),
        // Выполняем операцию: game_name: game_name.to_string(),.
        game_name: game_name.to_string(),
        // Выполняем операцию: requires_eac_tuning: eac,.
        requires_eac_tuning: eac,
        // Выполняем операцию: uses_gamelift: gamelift,.
        uses_gamelift: gamelift,
        // Выполняем операцию: ports,.
        ports,
        // Выполняем операцию: added_ports,.
        added_ports,
        // Отключать UDP-подделку можно только для игр без GameLift:
        // на сессии GameLift это роняет игру на старте (проверено: с выключенной
        // подделкой процесс игры завершается кодом 1 ещё до первого запроса).
        // Выполняем операцию: drop_udp_filter: eac && !gamelift,.
        drop_udp_filter: eac && !gamelift,
        // Выполняем операцию: drop_ipset: eac,.
        drop_ipset: eac,
        // Выполняем операцию: notes,.
        notes,
        // Закрываем блок.
    }
    // Закрываем блок.
}

/// Подбор параметров стратегии под игру: вызывается из интерфейса перед
/// запуском, результат уходит в `run_strategy_native` вместе с профилем.
// Применяем атрибут к следующему объявлению.
#[tauri::command]
// Выполняем операцию: pub async fn tune_strategy_for_game(.
pub async fn tune_strategy_for_game(
    // Выполняем операцию: game_id: String,.
    game_id: String,
    // Выполняем операцию: game_name: String,.
    game_name: String,
    // Выполняем операцию: install_path: String,.
    install_path: String,
    // Выполняем операцию: base_ports: Vec<u16>,.
    base_ports: Vec<u16>,
    // Выполняем операцию: domains: Vec<String>,.
    domains: Vec<String>,
    // Закрываем выражение или коллекцию.
) -> GameTuning {
    // Объявляем переменную tuning .
    let tuning = tune_game(&game_id, &game_name, &install_path, &base_ports, &domains);

    // Проверяем условие: !tuning.notes.is_empty() {.
    if !tuning.notes.is_empty() {
        // Выполняем операцию: tracing::info!(.
        tracing::info!(
            // Выполняем операцию: game = %game_id,.
            game = %game_id,
            // Выполняем операцию: "подбор параметров: {}",.
            "подбор параметров: {}",
            // Выполняем операцию: tuning.notes.join(" ").
            tuning.notes.join(" ")
        // Закрываем выражение или коллекцию.
        );
        // Закрываем блок.
    }

    // Выполняем операцию: tuning.
    tuning
    // Закрываем блок.
}

// Объявляем функцию join_ports.
pub fn join_ports(ports: &[u16]) -> String {
    // Выполняем операцию: ports.
    ports
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(u16::to_string).
        .map(u16::to_string)
        // Выполняем операцию: .collect::<Vec<String>>().
        .collect::<Vec<String>>()
        // Выполняем операцию: .join(", ").
        .join(", ")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Выполняем операцию: mod tests {.
mod tests {
    // Подключаем модули: super::*;.
    use super::*;

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_gamelift_ports_are_added_once.
    fn test_gamelift_ports_are_added_once() {
        // Объявляем переменную domains .
        let domains = vec!["gamelift.amazonaws.com".to_string()];
        // Объявляем переменную tuning .
        let tuning = tune_game("outlast", "Outlast Trials", "", &[27015, 80], &domains);

        // Выполняем операцию: assert!(tuning.uses_gamelift);.
        assert!(tuning.uses_gamelift);
        // Выполняем операцию: assert_eq!(tuning.added_ports, vec![88, 500]);.
        assert_eq!(tuning.added_ports, vec![88, 500]);
        // Выполняем операцию: assert!(tuning.ports.contains(&80));.
        assert!(tuning.ports.contains(&80));
        // Выполняем операцию: assert!(!tuning.requires_eac_tuning);.
        assert!(!tuning.requires_eac_tuning);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_eac_without_gamelift_drops_udp_and_ipset.
    fn test_eac_without_gamelift_drops_udp_and_ipset() {
        // Объявляем переменную tuning .
        let tuning = tune_game("g", "G", "", &[27015], &["steamcommunity.com".to_string()]);

        // Выполняем операцию: assert!(!tuning.requires_eac_tuning);.
        assert!(!tuning.requires_eac_tuning);
        // Выполняем операцию: assert!(!tuning.drop_udp_filter);.
        assert!(!tuning.drop_udp_filter);
        // Выполняем операцию: assert!(!tuning.drop_ipset);.
        assert!(!tuning.drop_ipset);
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_gamelift_keeps_udp_fake.
    fn test_gamelift_keeps_udp_fake() {
        // С выключенной UDP-подделкой игра с GameLift падает на старте движка
        // (процесс завершается кодом 1 до первого сетевого запроса).
        // Объявляем переменную domains .
        let domains = vec!["gamelift.amazonaws.com".to_string()];
        // Объявляем переменную tuning .
        let tuning = tune_game("g", "G", "", &[27015], &domains);

        // Выполняем операцию: assert!(tuning.uses_gamelift);.
        assert!(tuning.uses_gamelift);
        // Выполняем операцию: assert!(!tuning.drop_udp_filter, "без UDP-подделки игра.
        assert!(!tuning.drop_udp_filter, "без UDP-подделки игра не стартует");
        // Закрываем блок.
    }

    // Применяем атрибут к следующему объявлению.
    #[test]
    // Объявляем функцию test_notes_list_added_ports.
    fn test_notes_list_added_ports() {
        // Объявляем переменную domains .
        let domains = vec!["gamelift.amazonaws.com".to_string()];
        // Объявляем переменную tuning .
        let tuning = tune_game("g", "G", "", &[27015], &domains);

        // Выполняем операцию: assert!(tuning.notes.iter().any(|note| note.contains("8.
        assert!(tuning.notes.iter().any(|note| note.contains("88")));
        // Закрываем блок.
    }
    // Закрываем блок.
}
