use std::path::{Path, PathBuf};

use serde::Serialize;


/// Каталоги EasyAntiCheat, которые Red Barrel кладёт рядом с игрой.
const EAC_DIRS: &[&str] = &["EasyAntiCheat", "EasyAntiCheat_EOS", "EasyAntiCheat_Outlast"];

/// Домены, по которым видно, что игра ходит через Amazon GameLift.
const GAMELIFT_DOMAINS: &[&str] = &[
    "gamelift.amazonaws.com",
    "gamelift.us-east-1.amazonaws.com",
    "amazonaws.com",
];

/// Порты, которые zapret должен видеть помимо игровых. Диапазон `444-65535`
/// из Issue #879 сюда не попадает намеренно: модель портов у игры — это
/// `Vec<u16>`, а разворачивание диапазона в 65 тысяч значений утянуло бы и
/// `--filter-udp`, и список fake-пакетов. Широкий UDP-диапазон к тому же
/// бьёт по UDP самому античиту.
const GAMELIFT_EXTRA_PORTS: &[u16] = &[80, 88, 500];

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GameTuning {
    pub game_id: String,
    pub game_name: String,
    pub requires_eac_tuning: bool,
    pub uses_gamelift: bool,
    pub ports: Vec<u16>,
    pub added_ports: Vec<u16>,
    /// Не добавлять игровую UDP-группу `--filter-udp ... --dpi-desync=fake`.
    pub drop_udp_filter: bool,
    /// Не подставлять `--ipset` с игровыми адресами.
    pub drop_ipset: bool,
    pub notes: Vec<String>,
}

/// Есть ли рядом с игрой каталог EasyAntiCheat.
pub fn detect_eac(install_path: &Path) -> bool {
    EAC_DIRS
        .iter()
        .any(|name| install_path.join(name).is_dir())
}

fn uses_gamelift(domains: &[String]) -> bool {
    domains.iter().any(|domain| {
        let lowered = domain.to_ascii_lowercase();

        GAMELIFT_DOMAINS.iter().any(|needle| lowered.contains(needle))
    })
}

/// Подбирает параметры стратегии под конкретную игру.
///
/// Возвращает не `StrategyConfig` (он собирается из .bat и живёт в
/// `strategy::parser`), а набор решений, которые применяются при сборке
/// аргументов winws.
pub fn tune_game(
    game_id: &str,
    game_name: &str,
    install_path: &str,
    base_ports: &[u16],
    domains: &[String],
) -> GameTuning {
    let path = PathBuf::from(install_path);
    let eac = detect_eac(&path);
    let gamelift = uses_gamelift(domains);

    let mut ports: Vec<u16> = Vec::with_capacity(base_ports.len() + 4);
    let mut seen = std::collections::HashSet::new();

    for port in base_ports {
        if seen.insert(*port) {
            ports.push(*port);
        }
    }

    let mut added_ports = Vec::new();

    if gamelift {
        for port in GAMELIFT_EXTRA_PORTS {
            if seen.insert(*port) {
                ports.push(*port);
                added_ports.push(*port);
            }
        }
    }

    let mut notes = Vec::new();

    if !added_ports.is_empty() {
        notes.push(format!(
            "Добавлены порты GameLift: {}.",
            join_ports(&added_ports)
        ));
    }

    if eac && !gamelift {
        notes.push(
            "Игра с EasyAntiCheat: игровая UDP-группа и --ipset отключены, \
             они сбивают инициализацию античита."
                .to_string(),
        );
    }

    if gamelift {
        notes.push(
            "Игра с GameLift: UDP-подделка остаётся включённой — без неё игра \
             не доходит даже до лобби и падает на старте движка."
                .to_string(),
        );
    }

    GameTuning {
        game_id: game_id.to_string(),
        game_name: game_name.to_string(),
        requires_eac_tuning: eac,
        uses_gamelift: gamelift,
        ports,
        added_ports,
        // Отключать UDP-подделку можно только для игр без GameLift:
        // на сессии GameLift это роняет игру на старте (проверено: с выключенной
        // подделкой процесс игры завершается кодом 1 ещё до первого запроса).
        drop_udp_filter: eac && !gamelift,
        drop_ipset: eac,
        notes,
    }
}

/// Подбор параметров стратегии под игру: вызывается из интерфейса перед
/// запуском, результат уходит в `run_strategy_native` вместе с профилем.
#[tauri::command]
pub async fn tune_strategy_for_game(
    game_id: String,
    game_name: String,
    install_path: String,
    base_ports: Vec<u16>,
    domains: Vec<String>,
) -> GameTuning {
    let tuning = tune_game(
        &game_id,
        &game_name,
        &install_path,
        &base_ports,
        &domains,
    );

    if !tuning.notes.is_empty() {
        tracing::info!(
            game = %game_id,
            "подбор параметров: {}",
            tuning.notes.join(" ")
        );
    }

    tuning
}

pub fn join_ports(ports: &[u16]) -> String {
    ports
        .iter()
        .map(u16::to_string)
        .collect::<Vec<String>>()
        .join(", ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gamelift_ports_are_added_once() {
        let domains = vec!["gamelift.amazonaws.com".to_string()];
        let tuning = tune_game("outlast", "Outlast Trials", "", &[27015, 80], &domains);

        assert!(tuning.uses_gamelift);
        assert_eq!(tuning.added_ports, vec![88, 500]);
        assert!(tuning.ports.contains(&80));
        assert!(!tuning.requires_eac_tuning);
    }

    #[test]
    fn test_eac_without_gamelift_drops_udp_and_ipset() {
        let tuning = tune_game("g", "G", "", &[27015], &["steamcommunity.com".to_string()]);

        assert!(!tuning.requires_eac_tuning);
        assert!(!tuning.drop_udp_filter);
        assert!(!tuning.drop_ipset);
    }

#[test]
    fn test_gamelift_keeps_udp_fake() {
        // С выключенной UDP-подделкой игра с GameLift падает на старте движка
        // (процесс завершается кодом 1 до первого сетевого запроса).
        let domains = vec!["gamelift.amazonaws.com".to_string()];
        let tuning = tune_game("g", "G", "", &[27015], &domains);

        assert!(tuning.uses_gamelift);
        assert!(
            !tuning.drop_udp_filter,
            "без UDP-подделки игра не стартует"
        );
    }

    #[test]
    fn test_notes_list_added_ports() {
        let domains = vec!["gamelift.amazonaws.com".to_string()];
        let tuning = tune_game("g", "G", "", &[27015], &domains);

        assert!(tuning.notes.iter().any(|note| note.contains("88")));
    }
}