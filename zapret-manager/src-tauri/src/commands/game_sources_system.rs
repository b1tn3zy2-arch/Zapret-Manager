// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: walkdir::WalkDir;.
use walkdir::WalkDir;

// Подключаем модули: super::game_heuristics::collect_candidates;.
use super::game_heuristics::collect_candidates;
// Подключаем модули: super::game_heuristics::collect_candidates_relaxed;.
use super::game_heuristics::collect_candidates_relaxed;
// Подключаем модули: super::game_heuristics::has_game_markers;.
use super::game_heuristics::has_game_markers;
// Подключаем модули: super::game_heuristics::has_unity_data_folder;.
use super::game_heuristics::has_unity_data_folder;
// Подключаем модули: super::game_heuristics::is_excluded_name;.
use super::game_heuristics::is_excluded_name;
// Подключаем модули: super::game_heuristics::is_excluded_path;.
use super::game_heuristics::is_excluded_path;
// Подключаем модули: super::game_model::{GamePlatform, GameSource, Installed.
use super::game_model::{GamePlatform, GameSource, InstalledGame};
// Подключаем модули: super::game_registry::{parse_icon_target, uninstall_ent.
use super::game_registry::{parse_icon_target, uninstall_entries};
// Подключаем модули: super::game_sources_stores::{scan_store_folder, to_game.
use super::game_sources_stores::{scan_store_folder, to_game};

// Объявляем константу SYSTEM_DEPTH.
pub const SYSTEM_DEPTH: usize = 2;
// Объявляем константу GAME_ROOT_DEPTH.
pub const GAME_ROOT_DEPTH: usize = 4;

/// Минимальный объём exe в уже подтверждённом игровом корне.
///
/// Корень признан игрой движковыми маркерами, поэтому порог сильно ниже
/// общих фильтров: лаунчер Unity-игры весит около 0.6 МБ
/// («Nomad Drive.exe») и не проходит ни строгий, ни расслабленный порог.
// Объявляем константу ROOT_EXE_MIN_BYTES.
const ROOT_EXE_MIN_BYTES: u64 = 200 * 1024;
/// Подпапки лаунчеров относительно корня диска.
///
/// Раньше здесь лежали относительные пути ("EA Games", "Battle.net"), которые
/// разрешались от рабочего каталога процесса — то есть EA и Battle.net не
/// сканировались вообще, ни на одном диске.
// Объявляем константу STORE_SUBFOLDERS.
const STORE_SUBFOLDERS: &[(&[&str], GamePlatform, GameSource)] = &[
    // Выполняем операцию: (.
    (
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: "Program Files\\EA Games",.
            "Program Files\\EA Games",
            // Выполняем операцию: "Program Files (x86)\\EA Games",.
            "Program Files (x86)\\EA Games",
            // Выполняем операцию: "EA Games",.
            "EA Games",
            // Выполняем операцию: ],.
        ],
        // Выполняем операцию: GamePlatform::Ea,.
        GamePlatform::Ea,
        // Выполняем операцию: GameSource::Ea,.
        GameSource::Ea,
        // Закрываем выражение или коллекцию.
    ),
    // Выполняем операцию: (.
    (
        // Выполняем операцию: &[.
        &[
            // Выполняем операцию: "Program Files\\Battle.net",.
            "Program Files\\Battle.net",
            // Выполняем операцию: "Program Files (x86)\\Battle.net",.
            "Program Files (x86)\\Battle.net",
            // Выполняем операцию: "Battle.net",.
            "Battle.net",
            // Выполняем операцию: ],.
        ],
        // Выполняем операцию: GamePlatform::BattleNet,.
        GamePlatform::BattleNet,
        // Выполняем операцию: GameSource::BattleNet,.
        GameSource::BattleNet,
        // Закрываем выражение или коллекцию.
    ),
    // Закрываем выражение или коллекцию.
];
// Объявляем константу NON_GAME_WORDS.
const NON_GAME_WORDS: &[&str] = &[
    // Выполняем операцию: "driver",.
    "driver",
    // Выполняем операцию: "sdk",.
    "sdk",
    // Выполняем операцию: "runtime",.
    "runtime",
    // Выполняем операцию: "redistributable",.
    "redistributable",
    // Выполняем операцию: "toolkit",.
    "toolkit",
    // Выполняем операцию: "service pack",.
    "service pack",
    // Выполняем операцию: "update",.
    "update",
    // Выполняем операцию: "library",.
    "library",
    // Выполняем операцию: "fonts",.
    "fonts",
    // Выполняем операцию: "code",.
    "code",
    // Выполняем операцию: "harness",.
    "harness",
    // Выполняем операцию: "telegram",.
    "telegram",
    // Выполняем операцию: "discord",.
    "discord",
    // Выполняем операцию: "slack",.
    "slack",
    // Выполняем операцию: "zoom",.
    "zoom",
    // Выполняем операцию: "photoshop",.
    "photoshop",
    // Выполняем операцию: "premiere",.
    "premiere",
    // Выполняем операцию: "visual studio",.
    "visual studio",
    // Выполняем операцию: "vscode",.
    "vscode",
    // Выполняем операцию: "electron",.
    "electron",
    // Выполняем операцию: "node",.
    "node",
    // Выполняем операцию: "python",.
    "python",
    // Выполняем операцию: "java",.
    "java",
    // Выполняем операцию: "git",.
    "git",
    // Выполняем операцию: "office",.
    "office",
    // Выполняем операцию: "edge",.
    "edge",
    // Выполняем операцию: "chrome",.
    "chrome",
    // Выполняем операцию: "firefox",.
    "firefox",
    // Выполняем операцию: "spotify",.
    "spotify",
    // Утилиты из списка удаления Windows, которые раньше просачивались
    // как «игры»: архиваторы, торрент-клиенты, браузеры и VPN, средства
    // разработки и обслуживания, GPU-бенчмарки, античиты, DAW.
    // Выполняем операцию: "winrar",.
    "winrar",
    // Выполняем операцию: "7-zip",.
    "7-zip",
    // Выполняем операцию: "7zip",.
    "7zip",
    // Выполняем операцию: "winzip",.
    "winzip",
    // Выполняем операцию: "archiver",.
    "archiver",
    // Выполняем операцию: "архиватор",.
    "архиватор",
    // Выполняем операцию: "qbittorrent",.
    "qbittorrent",
    // Выполняем операцию: "torrent",.
    "torrent",
    // Выполняем операцию: "торрент",.
    "торрент",
    // Выполняем операцию: "onedrive",.
    "onedrive",
    // Выполняем операцию: "dropbox",.
    "dropbox",
    // Выполняем операцию: "opera",.
    "opera",
    // Выполняем операцию: "browser",.
    "browser",
    // Выполняем операцию: "браузер",.
    "браузер",
    // Выполняем операцию: "vpn",.
    "vpn",
    // Выполняем операцию: "proxy",.
    "proxy",
    // Выполняем операцию: "прокси",.
    "прокси",
    // Выполняем операцию: "anticheat",.
    "anticheat",
    // Выполняем операцию: "античит",.
    "античит",
    // Выполняем операцию: "faceit",.
    "faceit",
    // Выполняем операцию: "antivirus",.
    "antivirus",
    // Выполняем операцию: "антивирус",.
    "антивирус",
    // Выполняем операцию: "malwarebytes",.
    "malwarebytes",
    // Выполняем операцию: "kaspersky",.
    "kaspersky",
    // Выполняем операцию: "malware",.
    "malware",
    // Выполняем операцию: "furmark",.
    "furmark",
    // Выполняем операцию: "geeks3d",.
    "geeks3d",
    // Выполняем операцию: "afterburner",.
    "afterburner",
    // Выполняем операцию: "gpuz",.
    "gpuz",
    // Выполняем операцию: "hwmonitor",.
    "hwmonitor",
    // Выполняем операцию: "lasso",.
    "lasso",
    // Выполняем операцию: "tlauncher",.
    "tlauncher",
    // Выполняем операцию: "zapret",.
    "zapret",
    // Выполняем операцию: "ableton",.
    "ableton",
    // Выполняем операцию: "broadcast",.
    "broadcast",
    // Выполняем операцию: "plugin",.
    "plugin",
    // Выполняем операцию: "плагин",.
    "плагин",
    // Выполняем операцию: "nullsoft",.
    "nullsoft",
    // Выполняем операцию: "nsis",.
    "nsis",
    // Выполняем операцию: "install system",.
    "install system",
    // Выполняем операцию: "inno setup",.
    "inno setup",
    // Выполняем операцию: "development kit",.
    "development kit",
    // Выполняем операцию: "winget",.
    "winget",
    // Выполняем операцию: "helper",.
    "helper",
    // Выполняем операцию: "помощник",.
    "помощник",
    // Выполняем операцию: "утилит",.
    "утилит",
    // Русские названия утилит в списке удаления Windows: «Комплект средств
    // развертывания и оценки Windows ADK», пакеты драйверов, обновления.
    // Выполняем операцию: "комплект",.
    "комплект",
    // Выполняем операцию: "драйвер",.
    "драйвер",
    // Выполняем операцию: "средств",.
    "средств",
    // Выполняем операцию: "панель управления",.
    "панель управления",
    // Выполняем операцию: "консоль",.
    "консоль",
    // Выполняем операцию: "обновлен",.
    "обновлен",
    // Выполняем операцию: "установлен",.
    "установлен",
    // Выполняем операцию: "сборка",.
    "сборка",
    // Выполняем операцию: "средства",.
    "средства",
    // Выполняем операцию: "просмотр",.
    "просмотр",
    // Выполняем операцию: "отладка",.
    "отладка",
    // Выполняем операцию: "монитор",.
    "монитор",
    // Выполняем операцию: "вебview",.
    "вебview",
    // Выполняем операцию: "webview",.
    "webview",
    // Выполняем операцию: "поддержка",.
    "поддержка",
    // Закрываем выражение или коллекцию.
];

/// Точные названия записей удаления, где каталог нельзя перепутать
/// игрой по слову: клиенты магазинов сканер источников видит сам.
// Объявляем константу NON_GAME_EXACT_WORDS.
const NON_GAME_EXACT_WORDS: &[&str] = &[
    // Выполняем операцию: "steam",.
    "steam",
    // Выполняем операцию: "steam client",.
    "steam client",
    // Выполняем операцию: "steam client bootstrapper",.
    "steam client bootstrapper",
    // Выполняем операцию: "epic games launcher",.
    "epic games launcher",
    // Выполняем операцию: "gog galaxy",.
    "gog galaxy",
    // Выполняем операцию: "ubisoft connect",.
    "ubisoft connect",
    // Выполняем операцию: "riot client",.
    "riot client",
    // Выполняем операцию: "battle.net",.
    "battle.net",
    // Выполняем операцию: "battlenet",.
    "battlenet",
    // Выполняем операцию: "ea app",.
    "ea app",
    // Закрываем выражение или коллекцию.
];

// Объявляем функцию scan_uninstall_registry.
pub fn scan_uninstall_registry() -> Vec<InstalledGame> {
    // Выполняем операцию: uninstall_entries().
    uninstall_entries()
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_map(registry_game).
        .filter_map(registry_game)
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию registry_game.
fn registry_game(entry: super::game_registry::UninstallEntry) -> Option<InstalledGame> {
    // Объявляем переменную folder .
    let folder = entry
        // Выполняем операцию: .install_location.
        .install_location
        // Выполняем операцию: .as_deref().
        .as_deref()
        // Выполняем операцию: .map(|value| PathBuf::from(value.trim_matches('"'))).
        .map(|value| PathBuf::from(value.trim_matches('"')))
        // Выполняем операцию: .or_else(|| {.
        .or_else(|| {
            // Выполняем операцию: entry.
            entry
                // Выполняем операцию: .icon_path.
                .icon_path
                // Выполняем операцию: .as_deref().
                .as_deref()
                // Выполняем операцию: .and_then(parse_icon_target).
                .and_then(parse_icon_target)
                // Выполняем операцию: .and_then(|path| PathBuf::from(path).parent().map(Path:.
                .and_then(|path| PathBuf::from(path).parent().map(Path::to_path_buf))
            // Закрываем блок.
        })
        // Выполняем операцию: .filter(|path| path.is_dir())?;.
        .filter(|path| path.is_dir())?;

    // Объявляем переменную lowered_name .
    let lowered_name = entry.display_name.to_lowercase();
    // Нормализуем имя один раз вместо повторного выделения строки на каждое слово.
    // Объявляем переменную normalized_display_name .
    let normalized_display_name = normalized_name(&entry.display_name);

    // Проверяем условие: NON_GAME_WORDS.
    if NON_GAME_WORDS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|word| lowered_name.contains(word)).
        .any(|word| lowered_name.contains(word))
        // Выполняем операцию: || NON_GAME_EXACT_WORDS.
        || NON_GAME_EXACT_WORDS
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .any(|word| normalized_display_name == normalized_name(.
            .any(|word| normalized_display_name == normalized_name(word))
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную lowered_install .
    let lowered_install = lowered_path(&folder);

    // Установки Steam описывает отдельный скан: реестровая копия той же
    // игры без appid и обложки только дублирует карточку.
    // Проверяем условие: lowered_install.contains("\\steamapps\\") {.
    if lowered_install.contains("\\steamapps\\") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // В программных папках (Program Files, ProgramData, AppData) записи
    // установки без «игровых» маркеров — это утилиты, браузеры, пакеты
    // разработки. Исключение — запускной файл, названный ровно как игра
    // из записи: маленькие игры без движка такое имя имеют, а имена
    // утилит почти всегда с версией или «x64». AppData исключение не
    // получает: там автоустановщики оставляют приложения, чьё имя
    // совпадает с записью один в один (OpenHuman и им подобные).
    // Объявляем переменную no_markers .
    let no_markers = !has_game_markers(&folder) && !has_unity_data_folder(&folder);

    // Проверяем условие: no_markers && lowered_install.contains("\\appdata\.
    if no_markers && lowered_install.contains("\\appdata\\") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную require_name_match .
    let require_name_match = no_markers && is_program_root(&folder);

    // Раньше запись отбрасывалась, если у папки нет «маркеров игры»
    // (UnityPlayer.dll, Binaries\Win64). Репаки и самодельные сборки
    // таких маркеров не имеют — зато collect_candidates уже отфильтровал
    // установщики, поэтому выбираем exe по совпадению с названием.
    // Объявляем переменную executable .
    let executable = pick_registry_executable(&folder, &entry.display_name, require_name_match)?;

    // Объявляем переменную game .
    let mut game = to_game(
        // Выполняем операцию: GamePlatform::Unknown,.
        GamePlatform::Unknown,
        // Выполняем операцию: GameSource::Registry,.
        GameSource::Registry,
        // Выполняем операцию: &folder,.
        &folder,
        // Выполняем операцию: &executable,.
        &executable,
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: game.name = entry.display_name;.
    game.name = entry.display_name;

    // Выполняем операцию: Some(game).
    Some(game)
    // Закрываем блок.
}

/// Программные корни, где игры не живут: списки установленных там
/// пакетов — утилиты, браузеры, средства разработки. Ложное
/// срабатывание стоит дешевле десятка «игр»-архиваторов.
// Объявляем функцию is_program_root.
fn is_program_root(folder: &Path) -> bool {
    // Объявляем переменную lowered .
    let lowered = lowered_path(folder);

    // Выполняем операцию: lowered.contains("program files").
    lowered.contains("program files")
        // Выполняем операцию: || lowered.contains("programdata").
        || lowered.contains("programdata")
        // Выполняем операцию: || lowered.contains("\\appdata\\").
        || lowered.contains("\\appdata\\")
    // Закрываем блок.
}

/// Название, приведённое к буквам и цифрам.
///
/// «Zero Hour — Enhanced» и «ZeroHour.exe» сравниваются одинаково.
// Объявляем функцию normalized_name.
fn normalized_name(value: &str) -> String {
    // Выполняем операцию: value.
    value
        // Выполняем операцию: .to_ascii_lowercase().
        .to_ascii_lowercase()
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .filter(|item| item.is_alphanumeric()).
        .filter(|item| item.is_alphanumeric())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

/// Название утилиты для папочных обходов: сканы Program Files, домашних
/// папок, корней дисков и ярлыков пользователь не направляет руками,
/// поэтому утилиты в них отсеиваются по слову в названии.
///
/// «zapret» здесь не проверяется: тестовая игра пользователя
/// («Zapret Test Game») не должна пропадать, а сам менеджер в реестре
/// отсекается точным названием записи.
// Выполняем операцию: pub(crate) fn is_non_game_walk_title(title: &str) -> bo.
pub(crate) fn is_non_game_walk_title(title: &str) -> bool {
    // Объявляем переменную lowered .
    let lowered = title.to_lowercase();
    // Нормализуем заголовок один раз: раньше это делалось внутри каждого сравнения.
    // Объявляем переменную normalized_title .
    let normalized_title = normalized_name(title);

    // Выполняем операцию: NON_GAME_WORDS.
    NON_GAME_WORDS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|word| **word != "zapret").
        .filter(|word| **word != "zapret")
        // Выполняем операцию: .any(|word| lowered.contains(word)).
        .any(|word| lowered.contains(word))
        // Выполняем операцию: || NON_GAME_EXACT_WORDS.
        || NON_GAME_EXACT_WORDS
            // Выполняем операцию: .iter().
            .iter()
            // Выполняем операцию: .any(|word| normalized_title == normalized_name(word)).
            .any(|word| normalized_title == normalized_name(word))
    // Закрываем блок.
}

/// Игры папочных обходов без названий утилит.
// Объявляем функцию keep_real_game.
fn keep_real_game(game: &InstalledGame) -> bool {
    // Выполняем операцию: !is_non_game_walk_title(&game.name).
    !is_non_game_walk_title(&game.name)
    // Закрываем блок.
}

/// Выбор запускаемого файла для записи реестра.
///
/// Приоритет — совпадение имени exe с названием игры из реестра:
/// «Zero Hour» → «ZeroHour.exe». При равном приоритете остаётся больший
/// файл (у лаунчеров и служебных exe объём меньше). Когда строгая
/// фильтрация ничего не нашла, падаем на мягкую: реестровая папка
/// подтверждена установщиком, и ложное срабатывание здесь дёшево.
/// В программных корнях мягкий подбор оставляет только exe, названный
/// ровно как запись, — иначе там снова появляются утилиты. Когда
/// `require_name_match` (программный корень без маркеров), итоговый
/// файл тоже обязан совпасть с названием.
// Объявляем функцию pick_registry_executable.
fn pick_registry_executable(
    // Выполняем операцию: folder: &Path,.
    folder: &Path,
    // Выполняем операцию: display_name: &str,.
    display_name: &str,
    // Выполняем операцию: require_name_match: bool,.
    require_name_match: bool,
    // Закрываем выражение или коллекцию.
) -> Option<PathBuf> {
    // Объявляем переменную query .
    let query = normalized_name(display_name);
    // Объявляем переменную score .
    let score = |path: &PathBuf| {
        // Объявляем переменную stem .
        let stem = normalized_name(
            // Выполняем операцию: path.file_stem().
            path.file_stem()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .unwrap_or_default(),.
                .unwrap_or_default(),
            // Закрываем выражение или коллекцию.
        );
        // Объявляем переменную name_match .
        let name_match = match () {
            // Выполняем операцию: _ if !query.is_empty() && stem == query => 3u8,.
            _ if !query.is_empty() && stem == query => 3u8,
            // Выполняем операцию: _ if !query.is_empty() && (stem.contains(&query) || que.
            _ if !query.is_empty() && (stem.contains(&query) || query.contains(&stem)) => 2,
            // Выполняем операцию: _ => 0,.
            _ => 0,
            // Закрываем блок.
        };
        // Объявляем переменную size .
        let size = std::fs::metadata(path)
            // Выполняем операцию: .map(|value| value.len()).
            .map(|value| value.len())
            // Выполняем операцию: .unwrap_or(0);.
            .unwrap_or(0);

        // Выполняем операцию: (name_match, size).
        (name_match, size)
        // Закрываем блок.
    };

    // Объявляем переменную candidates .
    let mut candidates = collect_candidates(folder, 2);

    // Проверяем условие: candidates.is_empty() {.
    if candidates.is_empty() {
        // Запасной подбор нужен только играм без «игровых» маркеров
        // (репаки, самоделки). В программных корнях расслабленная
        // фильтрация выпускала утилиты: WinRAR, qBittorrent, античиты,
        // браузеры, — поэтому там остаются только exe, названные ровно
        // как запись.
        // Выполняем операцию: candidates = collect_candidates_relaxed(folder, 2);.
        candidates = collect_candidates_relaxed(folder, 2);

        // Проверяем условие: is_program_root(folder) {.
        if is_program_root(folder) {
            // Выполняем операцию: candidates.retain(|path| exact_name_match(path, display.
            candidates.retain(|path| exact_name_match(path, display_name));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную picked .
    let picked = candidates.into_iter().max_by_key(score)?;

    // Проверяем условие: require_name_match && !exact_name_match(&picked, d.
    if require_name_match && !exact_name_match(&picked, display_name) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(picked).
    Some(picked)
    // Закрываем блок.
}

/// Запускной файл назван ровно как игра из записи удаления:
/// «Forgotten Sea» → «forgottensea.exe». Совпадение по буквам и цифрам,
/// без пробелов и знаков.
// Объявляем функцию exact_name_match.
fn exact_name_match(executable: &Path, display_name: &str) -> bool {
    // Объявляем переменную stem .
    let stem = executable
        // Выполняем операцию: .file_stem().
        .file_stem()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: !stem.is_empty() && normalized_name(stem) == normalized.
    !stem.is_empty() && normalized_name(stem) == normalized_name(display_name)
    // Закрываем блок.
}

/// Нижний регистр пути с одинаковыми разделителями — для сравнения.
// Объявляем функцию lowered_path.
fn lowered_path(folder: &Path) -> String {
    // Выполняем операцию: folder.
    folder
        // Выполняем операцию: .to_string_lossy().
        .to_string_lossy()
        // Выполняем операцию: .replace('/', "\\").
        .replace('/', "\\")
        // Выполняем операцию: .to_ascii_lowercase().
        .to_ascii_lowercase()
    // Закрываем блок.
}

// Объявляем функцию user_home_roots.
pub fn user_home_roots() -> Vec<PathBuf> {
    // Объявляем переменную Some(home) .
    let Some(home) = std::env::var_os("USERPROFILE") else {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    };
    // Объявляем переменную home .
    let home = PathBuf::from(home);

    // «Игры» рядом с «Games»: у многих пользователей папка названа по-русски.
    // Выполняем операцию: ["Downloads", "Desktop", "Documents", "Games", "Игры"].
    ["Downloads", "Desktop", "Documents", "Games", "Игры"]
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|name| home.join(name)).
        .map(|name| home.join(name))
        // Выполняем операцию: .filter(|path| path.is_dir()).
        .filter(|path| path.is_dir())
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию scan_user_home_games.
pub fn scan_user_home_games() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for root in user_home_roots() {
        // Перебираем элементы коллекции.
        for game_root in super::game_heuristics::collect_game_roots(
            // Выполняем операцию: &root,.
            &root,
            // Выполняем операцию: super::game_heuristics::GAME_ROOTS_DEPTH,.
            super::game_heuristics::GAME_ROOTS_DEPTH,
            // Закрываем выражение или коллекцию.
        ) {
            // Выполняем операцию: result.extend(scan_game_root(&game_root));.
            result.extend(scan_game_root(&game_root));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Обход домашних папок никто не направляет руками: утилиты из
    // Downloads (Telegram, uTorrent) отсеиваются по названию.
    // Выполняем операцию: result.into_iter().filter(keep_real_game).collect().
    result.into_iter().filter(keep_real_game).collect()
    // Закрываем блок.
}

// Объявляем функцию scan_game_root.
pub fn scan_game_root(root: &Path) -> Vec<InstalledGame> {
    // Корень уже подтверждён движковыми маркерами (collect_game_roots),
    // поэтому размер exe здесь не решает: лаунчер Unity-игры весит
    // меньше мегабайта. Выбираем по сродству имени с корнем, при
    // равенстве — по объёму.
    // Объявляем переменную query .
    let query = normalized_name(
        // Выполняем операцию: root.file_name().
        root.file_name()
            // Выполняем операцию: .and_then(|value| value.to_str()).
            .and_then(|value| value.to_str())
            // Выполняем операцию: .unwrap_or_default(),.
            .unwrap_or_default(),
        // Закрываем выражение или коллекцию.
    );

    // Объявляем переменную score .
    let score = |path: &PathBuf| -> (u64, u64) {
        // Объявляем переменную stem .
        let stem = normalized_name(
            // Выполняем операцию: path.file_stem().
            path.file_stem()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .unwrap_or_default(),.
                .unwrap_or_default(),
            // Закрываем выражение или коллекцию.
        );
        // Суффиксы сборок мешают сродству: «Backrooms-Win64-Shipping»
        // не выглядит как «EscapeTheBackrooms», пока хвост не снят.
        // Объявляем переменную comparable .
        let mut comparable = stem.as_str();

        // Перебираем элементы коллекции.
        for suffix in ["shipping", "win64", "win32"] {
            // Проверяем условие: let Some(stripped) = comparable.strip_suffix(suffi.
            if let Some(stripped) = comparable.strip_suffix(suffix) {
                // Выполняем операцию: comparable = stripped;.
                comparable = stripped;
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Объявляем переменную affinity .
        let affinity = match () {
            // Выполняем операцию: _ if !query.is_empty() && comparable == query => 3u64,.
            _ if !query.is_empty() && comparable == query => 3u64,
            // Выполняем операцию: _ if !query.is_empty().
            _ if !query.is_empty()
                // Выполняем операцию: && (comparable.contains(&query) || query.contains(compa.
                && (comparable.contains(&query) || query.contains(comparable)) =>
            // Выполняем операцию: {.
            {
                // Выполняем операцию: 2.
                2
                // Закрываем блок.
            }
            // Выполняем операцию: _ => 0,.
            _ => 0,
            // Закрываем блок.
        };
        // Объявляем переменную size .
        let size = std::fs::metadata(path)
            // Выполняем операцию: .map(|value| value.len()).
            .map(|value| value.len())
            // Выполняем операцию: .unwrap_or(0);.
            .unwrap_or(0);

        // Выполняем операцию: (affinity, size).
        (affinity, size)
        // Закрываем блок.
    };

    // Объявляем переменную picked .
    let picked = WalkDir::new(root)
        // Выполняем операцию: .max_depth(GAME_ROOT_DEPTH).
        .max_depth(GAME_ROOT_DEPTH)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_entry(|entry| !is_excluded_path(entry.path())).
        .filter_entry(|entry| !is_excluded_path(entry.path()))
        // Выполняем операцию: .filter_map(Result::ok).
        .filter_map(Result::ok)
        // Выполняем операцию: .filter(|entry| entry.file_type().is_file()).
        .filter(|entry| entry.file_type().is_file())
        // Выполняем операцию: .map(|entry| entry.into_path()).
        .map(|entry| entry.into_path())
        // Выполняем операцию: .filter(|path| {.
        .filter(|path| {
            // Выполняем операцию: path.extension().
            path.extension()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("exe")).
                .map(|value| value.eq_ignore_ascii_case("exe"))
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
                // Выполняем операцию: && !is_excluded_name(.
                && !is_excluded_name(
                    // Выполняем операцию: path.file_name().
                    path.file_name()
                        // Выполняем операцию: .and_then(|value| value.to_str()).
                        .and_then(|value| value.to_str())
                        // Выполняем операцию: .unwrap_or_default(),.
                        .unwrap_or_default(),
                // Закрываем выражение или коллекцию.
                )
                // Выполняем операцию: && std::fs::metadata(path).
                && std::fs::metadata(path)
                    // Выполняем операцию: .map(|value| value.len() >= ROOT_EXE_MIN_BYTES).
                    .map(|value| value.len() >= ROOT_EXE_MIN_BYTES)
                    // Выполняем операцию: .unwrap_or(false).
                    .unwrap_or(false)
            // Закрываем блок.
        })
        // Выполняем операцию: .max_by_key(score);.
        .max_by_key(score);

    // Выполняем операцию: picked.
    picked
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .map(|executable| {.
        .map(|executable| {
            // Объявляем переменную install_path .
            let install_path = super::game_heuristics::install_root(&executable);

            // Выполняем операцию: InstalledGame::new(.
            InstalledGame::new(
                // Выполняем операцию: GamePlatform::Custom,.
                GamePlatform::Custom,
                // Выполняем операцию: GameSource::KnownFolder,.
                GameSource::KnownFolder,
                // Выполняем операцию: &install_path.to_string_lossy(),.
                &install_path.to_string_lossy(),
                // Выполняем операцию: &executable.to_string_lossy(),.
                &executable.to_string_lossy(),
                // Закрываем выражение или коллекцию.
            )
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию known_folders.
pub fn known_folders() -> Vec<PathBuf> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for letter in ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'] {
        // Объявляем переменную root .
        let root = format!("{letter}:\\");

        // Проверяем условие: !Path::new(&root).is_dir() {.
        if !Path::new(&root).is_dir() {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // «Игры» — от установки в русскоименованные папки, которых
        // раньше стандартный список не касался.
        // Перебираем элементы коллекции.
        for suffix in ["Program Files", "Program Files (x86)", "Games", "Игры"] {
            // Объявляем переменную folder .
            let folder = PathBuf::from(&root).join(suffix);

            // Проверяем условие: folder.is_dir() && !result.contains(&folder) {.
            if folder.is_dir() && !result.contains(&folder) {
                // Выполняем операцию: result.push(folder);.
                result.push(folder);
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию scan_known_folders.
pub fn scan_known_folders() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for folder in known_folders() {
        // Выполняем операцию: result.extend(scan_folder(&folder, GameSource::KnownFol.
        result.extend(scan_folder(&folder, GameSource::KnownFolder));
        // Закрываем блок.
    }

    // Program Files и «Игры» никто не направляет руками: утилиты
    // (Photoshop, NVIDIA Broadcast) отсеиваются по названию.
    // Выполняем операцию: result.into_iter().filter(keep_real_game).collect().
    result.into_iter().filter(keep_real_game).collect()
    // Закрываем блок.
}

/// Все существующие диски: корень диска — единственное место, где лежат
/// игры, установленные «в корень», вроде C:\\The Long Dark.
// Объявляем функцию drive_roots.
pub fn drive_roots() -> Vec<PathBuf> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for letter in b'C'..=b'Z' {
        // Объявляем переменную root .
        let root = format!("{}:\\", letter as char);

        // Проверяем условие: Path::new(&root).is_dir() {.
        if Path::new(&root).is_dir() {
            // Выполняем операцию: result.push(PathBuf::from(root));.
            result.push(PathBuf::from(root));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию store_folder_paths.
pub fn store_folder_paths() -> Vec<(PathBuf, GamePlatform, GameSource)> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for root in drive_roots() {
        // Перебираем элементы коллекции.
        for (subfolders, platform, source) in STORE_SUBFOLDERS {
            // Перебираем элементы коллекции.
            for subfolder in *subfolders {
                // Объявляем переменную path .
                let path = root.join(subfolder);

                // Проверяем условие: path.is_dir() {.
                if path.is_dir() {
                    // Выполняем операцию: result.push((path, *platform, *source));.
                    result.push((path, *platform, *source));
                    // Закрываем блок.
                }
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию scan_store_folders.
pub fn scan_store_folders() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for (path, platform, source) in store_folder_paths() {
        // Выполняем операцию: result.extend(scan_store_folder(&path, platform, source.
        result.extend(scan_store_folder(&path, platform, source));
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

/// Служебные каталоги верхнего уровня, внутри которых пользовательских
/// игр нет: они тормозят обход и дают ложные находки системных утилит.
/// «Program Files» уже просканирован exe-фильтром через known_folders,
/// «Users» — через scan_user_home_games (точечно, по реальным папкам).
// Объявляем константу VOLUME_SKIP_ROOTS.
const VOLUME_SKIP_ROOTS: &[&str] = &[
    // Выполняем операцию: "windows",.
    "windows",
    // Выполняем операцию: "program files",.
    "program files",
    // Выполняем операцию: "program files (x86)",.
    "program files (x86)",
    // Выполняем операцию: "programdata",.
    "programdata",
    // Выполняем операцию: "users",.
    "users",
    // Закрываем выражение или коллекцию.
];

/// Есть ли среди компонентов пути (относительно корня тома) служебный
/// каталог из VOLUME_SKIP_ROOTS.
// Объявляем функцию has_skip_root.
fn has_skip_root(root: &Path, path: &Path) -> bool {
    // Объявляем переменную relative .
    let relative = path.strip_prefix(root).ok();

    // any() ходит по Components изменяюще, переменная — mut.
    // Объявляем переменную components .
    let mut components = match relative {
        // Выполняем операцию: Some(value) => value.components(),.
        Some(value) => value.components(),
        // Выполняем операцию: None => return false,.
        None => return false,
        // Закрываем блок.
    };

    // Выполняем операцию: components.any(|component| {.
    components.any(|component| {
        // Выполняем операцию: component.
        component
            // Выполняем операцию: .as_os_str().
            .as_os_str()
            // Выполняем операцию: .to_str().
            .to_str()
            // Выполняем операцию: .map(|name| VOLUME_SKIP_ROOTS.contains(&name.to_ascii_l.
            .map(|name| VOLUME_SKIP_ROOTS.contains(&name.to_ascii_lowercase().as_str()))
            // Выполняем операцию: .unwrap_or(false).
            .unwrap_or(false)
        // Закрываем блок.
    })
    // Закрываем блок.
}

/// Игры, установленные прямо в корень диска (C:\\The Long Dark),
/// и игры в произвольных папках верхнего уровня, о которых известные
/// каталоги не знают: ищем характерные каталоги движков от корня тома
/// и сканируем каждый такой корень целиком.
// Объявляем функцию scan_volume_roots.
pub fn scan_volume_roots() -> Vec<InstalledGame> {
    // Объявляем переменную result .
    let mut result = Vec::new();

    // Перебираем элементы коллекции.
    for root in drive_roots() {
        // Установленные «в корень» (C:\The Long Dark).
        // Выполняем операцию: result.extend(scan_folder_depth(&root, GameSource::Know.
        result.extend(scan_folder_depth(&root, GameSource::KnownFolder, 1));

        // Установленные в произвольные папки верхнего уровня:
        // Перебираем элементы коллекции.
        for game_root in super::game_heuristics::collect_game_roots(
            // Выполняем операцию: &root,.
            &root,
            // Выполняем операцию: super::game_heuristics::GAME_ROOTS_DEPTH,.
            super::game_heuristics::GAME_ROOTS_DEPTH,
            // Закрываем выражение или коллекцию.
        ) {
            // Проверяем условие: has_skip_root(&root, &game_root) {.
            if has_skip_root(&root, &game_root) {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            }

            // Выполняем операцию: result.extend(scan_game_root(&game_root));.
            result.extend(scan_game_root(&game_root));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Обход корней дисков никто не направляет руками: утилиты
    // отсеиваются по названию.
    // Выполняем операцию: result.into_iter().filter(keep_real_game).collect().
    result.into_iter().filter(keep_real_game).collect()
    // Закрываем блок.
}

// Объявляем функцию scan_user_folders.
pub fn scan_user_folders(folders: &[String]) -> Vec<InstalledGame> {
    // Выполняем операцию: folders.
    folders
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .filter(|folder| !folder.trim().is_empty()).
        .filter(|folder| !folder.trim().is_empty())
        // Выполняем операцию: .flat_map(|folder| scan_folder(Path::new(folder.trim()).
        .flat_map(|folder| scan_folder(Path::new(folder.trim()), GameSource::UserFolder))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию scan_folder.
pub fn scan_folder(folder: &Path, source: GameSource) -> Vec<InstalledGame> {
    // Выполняем операцию: scan_folder_depth(folder, source, SYSTEM_DEPTH).
    scan_folder_depth(folder, source, SYSTEM_DEPTH)
    // Закрываем блок.
}

/// Сканирование папки с заданной глубиной вложенности.
// Объявляем функцию scan_folder_depth.
pub fn scan_folder_depth(folder: &Path, source: GameSource, depth: usize) -> Vec<InstalledGame> {
    // Выполняем операцию: collect_candidates(folder, depth).
    collect_candidates(folder, depth)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_map(|executable| {.
        .filter_map(|executable| {
            // Объявляем переменную install_path .
            let install_path = executable.parent()?.to_path_buf();

            // Выполняем операцию: Some(InstalledGame::new(.
            Some(InstalledGame::new(
                // Выполняем операцию: GamePlatform::Custom,.
                GamePlatform::Custom,
                // Выполняем операцию: source,.
                source,
                // Выполняем операцию: &install_path.to_string_lossy(),.
                &install_path.to_string_lossy(),
                // Выполняем операцию: &executable.to_string_lossy(),.
                &executable.to_string_lossy(),
                // Закрываем выражение или коллекцию.
            ))
            // Закрываем блок.
        })
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_sources_system_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
