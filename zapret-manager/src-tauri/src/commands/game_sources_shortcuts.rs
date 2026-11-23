//! Игры из ярлыков меню «Пуск» и рабочего стола.
//!
//! Реестровые сканеры покрывают магазины (Steam, Epic, GOG…), а
//! игры, поставленные установщиком в произвольную папку (D:\Games\ …),
//! регистрируются только ярлыком в «Пуск» или на рабочем столе. Без
//! этого источника ровно такие установки в приложение не попадали.

// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: walkdir::WalkDir;.
use walkdir::WalkDir;

// Подключаем модули: super::game_heuristics::is_candidate_executable;.
use super::game_heuristics::is_candidate_executable;
// Подключаем модули: super::game_model::{GamePlatform, GameSource, Installed.
use super::game_model::{GamePlatform, GameSource, InstalledGame};
// Подключаем модули: super::game_sources_stores::to_game;.
use super::game_sources_stores::to_game;

/// Максимум ярлыков на один каталог ссылки («Пуск»).
// Объявляем константу MAX_LINKS_PER_ROOT.
const MAX_LINKS_PER_ROOT: usize = 400;

/// Глубина обхода дерева «Пуск» (Programs включает каталоги издателей).
// Объявляем константу LINK_SCAN_DEPTH.
const LINK_SCAN_DEPTH: usize = 5;

/// Ссылки на служебные пути, которые не является играми.
// Объявляем константу SKIP_TARGET_MARKS.
const SKIP_TARGET_MARKS: &[&str] = &[
    // Выполняем операцию: "steam.exe",.
    "steam.exe",
    // Выполняем операцию: "steamwebhelper",.
    "steamwebhelper",
    // Выполняем операцию: "epicgameslauncher",.
    "epicgameslauncher",
    // Выполняем операцию: "epicgames",.
    "epicgames",
    // Выполняем операцию: "riotclient",.
    "riotclient",
    // Выполняем операцию: "galaxyclient",.
    "galaxyclient",
    // Выполняем операцию: "battle.net.exe",.
    "battle.net.exe",
    // Выполняем операцию: "battlenet",.
    "battlenet",
    // Выполняем операцию: "origin.exe",.
    "origin.exe",
    // Выполняем операцию: "eaapp",.
    "eaapp",
    // Выполняем операцию: "uplay.exe",.
    "uplay.exe",
    // Выполняем операцию: "vcredist",.
    "vcredist",
    // Выполняем операцию: "directx",.
    "directx",
    // Выполняем операцию: "dotnet",.
    "dotnet",
    // Выполняем операцию: "uninstall",.
    "uninstall",
    // Выполняем операцию: "crashreport",.
    "crashreport",
    // Выполняем операцию: "controlpanel",.
    "controlpanel",
    // Выполняем операцию: "website",.
    "website",
    // Выполняем операцию: "homepage",.
    "homepage",
    // Выполняем операцию: "readme",.
    "readme",
    // Выполняем операцию: "eula",.
    "eula",
    // Закрываем выражение или коллекцию.
];

/// Каталоги ярлыков: «Пуск» (пользовательский и общесистемный) и рабочий
/// стол. Игры, установленные вне Steam, чаще всего попадают в приложение
/// только через ярлык, который пользователь держит на рабочем столе.
// Объявляем функцию link_roots.
fn link_roots() -> Vec<PathBuf> {
    // Объявляем переменную roots.
    let mut roots: Vec<PathBuf> = Vec::with_capacity(8);

    // Проверяем условие: let Some(appdata) = std::env::var_os("APPDATA") {.
    if let Some(appdata) = std::env::var_os("APPDATA") {
        // Выполняем операцию: roots.push(PathBuf::from(appdata).join(r"Microsoft\Wind.
        roots.push(PathBuf::from(appdata).join(r"Microsoft\Windows\Start Menu\Programs"));
        // Закрываем блок.
    }

    // Проверяем условие: let Some(program_data) = std::env::var_os("Program.
    if let Some(program_data) = std::env::var_os("ProgramData") {
        // Выполняем операцию: roots.push(PathBuf::from(program_data).join(r"Microsoft.
        roots.push(PathBuf::from(program_data).join(r"Microsoft\Windows\Start Menu\Programs"));
        // Закрываем блок.
    }

    // Проверяем условие: let Some(profile) = std::env::var_os("USERPROFILE".
    if let Some(profile) = std::env::var_os("USERPROFILE") {
        // Выполняем операцию: roots.push(PathBuf::from(profile).join(r"Desktop"));.
        roots.push(PathBuf::from(profile).join(r"Desktop"));
        // Закрываем блок.
    }

    // Проверяем условие: let Some(public_dir) = std::env::var_os("PUBLIC") .
    if let Some(public_dir) = std::env::var_os("PUBLIC") {
        // Выполняем операцию: roots.push(PathBuf::from(public_dir).join(r"Desktop"));.
        roots.push(PathBuf::from(public_dir).join(r"Desktop"));
        // Закрываем блок.
    }

    // Выполняем операцию: roots.retain(|root| root.is_dir());.
    roots.retain(|root| root.is_dir());
    // Выполняем операцию: roots.
    roots
    // Закрываем блок.
}

/// Игры, найденные по ярлыкам «Пуск» и рабочего стола.
// Объявляем функцию scan_start_menu_links.
pub fn scan_start_menu_links() -> Vec<InstalledGame> {
    // Объявляем переменную roots .
    let roots = link_roots();
    // Объявляем переменную result.
    let mut result: Vec<InstalledGame> = Vec::new();

    // Перебираем элементы коллекции.
    for root in roots {
        // Объявляем переменную links.
        let links: Vec<PathBuf> = WalkDir::new(root)
            // Выполняем операцию: .max_depth(LINK_SCAN_DEPTH).
            .max_depth(LINK_SCAN_DEPTH)
            // Выполняем операцию: .into_iter().
            .into_iter()
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
                    // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("lnk")).
                    .map(|value| value.eq_ignore_ascii_case("lnk"))
                    // Выполняем операцию: .unwrap_or(false).
                    .unwrap_or(false)
                // Закрываем блок.
            })
            // Выполняем операцию: .take(MAX_LINKS_PER_ROOT).
            .take(MAX_LINKS_PER_ROOT)
            // Выполняем операцию: .collect();.
            .collect();

        // Перебираем элементы коллекции.
        for link in links {
            // Выполняем операцию: result.extend(game_from_link(&link));.
            result.extend(game_from_link(&link));
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Ярлыки «Пуск» указывают на всё подряд: Telegram, uTorrent и
    // прочие утилиты отсеиваются по названию цели.
    // Выполняем операцию: result.
    result
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter(|game| !super::game_sources_system::is_non_game.
        .filter(|game| !super::game_sources_system::is_non_game_walk_title(&game.name))
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

/// Игра, на которую указывает ярлык.
///
/// URL-ярлыки ( steam:// ) и ссылки на лаунчеры не дают запускаемой
/// игры, поэтому отбрасываются до создания записи.
// Объявляем функцию game_from_link.
fn game_from_link(link: &Path) -> Option<InstalledGame> {
    // Объявляем переменную bytes .
    let bytes = std::fs::read(link).ok()?;
    // Объявляем переменную target .
    let target = parse_link_target(&bytes)?;
    // Объявляем переменную target .
    let target = target.as_path();

    // Проверяем условие: !target.is_file() {.
    if !target.is_file() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // AppData\Local — место автоустановщиков приложений: большие exe
    // рядом с именем папки (OpenHuman) проходят общие фильтры, а игры
    // там почти не живут.
    // Объявляем переменную lowered_target .
    let lowered_target = target
        // Выполняем операцию: .to_string_lossy().
        .to_string_lossy()
        // Выполняем операцию: .replace('/', "\\").
        .replace('/', "\\")
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Проверяем условие: lowered_target.contains("\\appdata\\local\\") {.
    if lowered_target.contains("\\appdata\\local\\") {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Проверяем условие: !is_candidate_executable(target) {.
    if !is_candidate_executable(target) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Проверяем условие: let Some(stem) = target.file_stem().and_then(|valu.
    if let Some(stem) = target.file_stem().and_then(|value| value.to_str()) {
        // Объявляем переменную lowered .
        let lowered = stem.to_ascii_lowercase();

        // Проверяем условие: SKIP_TARGET_MARKS.iter().any(|mark| lowered.contai.
        if SKIP_TARGET_MARKS.iter().any(|mark| lowered.contains(mark)) {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Объявляем переменную install_path .
    let install_path = super::game_heuristics::install_root(target);

    // Выполняем операцию: Some(to_game(.
    Some(to_game(
        // Выполняем операцию: GamePlatform::Custom,.
        GamePlatform::Custom,
        // Выполняем операцию: GameSource::UserFolder,.
        GameSource::UserFolder,
        // Выполняем операцию: &install_path,.
        &install_path,
        // Выполняем операцию: target,.
        target,
        // Закрываем выражение или коллекцию.
    ))
    // Закрываем блок.
}

/// Вытащенный из ярлыка локальный путь цели.
// Объявляем структуру LinkTarget.
struct LinkTarget(PathBuf);

// Открываем реализацию типа.
impl LinkTarget {
    // Объявляем функцию as_path.
    fn as_path(&self) -> &Path {
        // Выполняем операцию: &self.0.
        &self.0
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию read_u16.
fn read_u16(bytes: &[u8], offset: usize) -> Option<u16> {
    // Выполняем операцию: Some(u16::from_le_bytes([.
    Some(u16::from_le_bytes([
        *bytes.get(offset)?,
        *bytes.get(offset + 1)?,
        // Выполняем операцию: ])).
    ]))
    // Закрываем блок.
}

// Объявляем функцию read_u32.
fn read_u32(bytes: &[u8], offset: usize) -> Option<u32> {
    // Выполняем операцию: Some(u32::from_le_bytes([.
    Some(u32::from_le_bytes([
        *bytes.get(offset)?,
        *bytes.get(offset + 1)?,
        *bytes.get(offset + 2)?,
        *bytes.get(offset + 3)?,
        // Выполняем операцию: ])).
    ]))
    // Закрываем блок.
}

/// Таблица кодовой страницы 1251 для байтов 0x80–0xFF: ANSI-путь в
/// ярлыках может быть с кириллицей, а системная страница на машинах
/// пользователей — именно она.
// Объявляем константу CP1251_UPPER.
const CP1251_UPPER: [char; 0x80] = [
    // Выполняем операцию: 'Ђ', 'Ѓ', '‚', 'ѓ', '„', '…', '†', '‡', '€', '‰', 'Љ', .
    'Ђ', 'Ѓ', '‚', 'ѓ', '„', '…', '†', '‡', '€', '‰', 'Љ', '‹', 'Њ', 'Ќ', 'Ћ', 'Џ', 'ђ', '‘', '’',
    // Выполняем операцию: '“', '”', '•', '–', '—', ' ', '™', 'љ', '›', 'њ', 'ќ', .
    '“', '”', '•', '–', '—', ' ', '™', 'љ', '›', 'њ', 'ќ', 'ћ', 'џ', ' ', 'Ў', 'ў', 'Ј', '¤', 'Ґ',
    // Выполняем операцию: '¦', '§', 'Ё', '©', 'Є', '«', '¬', ' ', '®', 'Ї', '°', .
    '¦', '§', 'Ё', '©', 'Є', '«', '¬', ' ', '®', 'Ї', '°', '±', 'І', 'і', 'ґ', 'µ', '¶', '·', 'ё',
    // Выполняем операцию: '№', 'є', '»', 'ј', 'Ѕ', 'ѕ', 'ї', 'А', 'Б', 'В', 'Г', .
    '№', 'є', '»', 'ј', 'Ѕ', 'ѕ', 'ї', 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л',
    // Выполняем операцию: 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', .
    'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю',
    // Выполняем операцию: 'Я', 'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', .
    'Я', 'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с',
    // Выполняем операцию: 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', .
    'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю',
    'я',
    // Закрываем выражение или коллекцию.
];

/// Читает ANSI-строку, обрезанную нулём.
// Объявляем функцию read_ansi.
fn read_ansi(bytes: &[u8], offset: usize) -> Option<String> {
    // Объявляем переменную stop .
    let stop = bytes[offset..].iter().position(|byte| *byte == 0)? + offset;
    // Объявляем переменную raw .
    let raw = bytes.get(offset..stop)?;

    // Объявляем переменную text .
    let text = raw
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .map(|byte| match byte {.
        .map(|byte| match byte {
            // Выполняем операцию: 0x80..=0xFF => CP1251_UPPER[(*byte - 0x80) as usize],.
            0x80..=0xFF => CP1251_UPPER[(*byte - 0x80) as usize],
            // Выполняем операцию: _ => *byte as char,.
            _ => *byte as char,
            // Закрываем блок.
        })
        // Выполняем операцию: .collect::<String>();.
        .collect::<String>();

    // Выполняем операцию: Some(text).
    Some(text)
    // Закрываем блок.
}

/// Читает UTF-16LE строку, обрезанную нулём.
// Объявляем функцию read_wide.
fn read_wide(bytes: &[u8], offset: usize) -> Option<String> {
    // Объявляем переменную units.
    let mut units: Vec<u16> = Vec::new();
    // Объявляем переменную cursor .
    let mut cursor = offset;

    // Выполняем операцию: loop {.
    loop {
        // Объявляем переменную unit .
        let unit = read_u16(bytes, cursor)?;

        // Выполняем операцию: cursor += 2;.
        cursor += 2;

        // Проверяем условие: unit == 0 {.
        if unit == 0 {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Выполняем операцию: units.push(unit);.
        units.push(unit);

        // Проверяем условие: units.len() > 1024 {.
        if units.len() > 1024 {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: units.is_empty() {.
    if units.is_empty() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Выполняем операцию: Some(String::from_utf16_lossy(&units)).
    Some(String::from_utf16_lossy(&units))
    // Закрываем блок.
}

/// Вытаскивает цель из бинарного ShellLink (.lnk).
///
/// Формат описан в [MS-SHLLINK]: заголовок 0x4C, список флагов, затем
/// IDList и блок LinkInfo с локальным путём. Разбираем точку на
/// минимальный объём: путь нужен как файл — сетевые ссылки здесь не
/// полезны.
// Объявляем функцию parse_link_target.
fn parse_link_target(bytes: &[u8]) -> Option<LinkTarget> {
    // Проверяем условие: bytes.len() < 76 || read_u32(bytes, 0) != Some(0x4.
    if bytes.len() < 76 || read_u32(bytes, 0) != Some(0x4C) {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // LinkFlags: 0x01 — IDList, 0x02 — LinkInfo.
    // Объявляем переменную flags .
    let flags = read_u32(bytes, 0x14)?;
    // Объявляем переменную offset .
    let mut offset = 0x4C;

    // Проверяем условие: flags & 0x0000_0001 != 0 {.
    if flags & 0x0000_0001 != 0 {
        // Объявляем переменную id_list_size .
        let id_list_size = read_u16(bytes, offset)? as usize;

        // Проверяем условие: id_list_size == 0 {.
        if id_list_size == 0 {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }

        // Выполняем операцию: offset += 2 + id_list_size;.
        offset += 2 + id_list_size;

        // Проверяем условие: offset >= bytes.len() {.
        if offset >= bytes.len() {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Проверяем условие: flags & 0x0000_0002 != 0 {.
    if flags & 0x0000_0002 != 0 {
        // Объявляем переменную info_size .
        let info_size = read_u32(bytes, offset)? as usize;
        // Объявляем переменную info .
        let info = offset;

        // Проверяем условие: info_size < 0x1C || info_size > bytes.len() - info.
        if info_size < 0x1C || info_size > bytes.len() - info {
            // Возвращаем результат из функции.
            return None;
            // Закрываем блок.
        }

        // Объявляем переменную info_flags .
        let info_flags = read_u32(bytes, info + 8)?;
        // Двойной сдвиг: локальный путь Unicode (Windows 2000+).
        // Проверяем условие: info_flags & 0x0000_0080 != 0 {.
        if info_flags & 0x0000_0080 != 0 {
            // Проверяем условие: let Some(unicode_offset) = read_u32(bytes, info + .
            if let Some(unicode_offset) = read_u32(bytes, info + 0x24) {
                // Проверяем условие: unicode_offset != 0 {.
                if unicode_offset != 0 {
                    // Проверяем условие: let Some(text) = read_wide(bytes, info + unicode_o.
                    if let Some(text) = read_wide(bytes, info + unicode_offset as usize) {
                        // Проверяем условие: !text.is_empty() {.
                        if !text.is_empty() {
                            // Возвращаем результат из функции.
                            return Some(LinkTarget(PathBuf::from(text)));
                            // Закрываем блок.
                        }
                        // Закрываем блок.
                    }
                    // Закрываем блок.
                }
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Проверяем условие: let Some(local_offset) = read_u32(bytes, info + 0x.
        if let Some(local_offset) = read_u32(bytes, info + 0x10) {
            // Проверяем условие: local_offset != 0 {.
            if local_offset != 0 {
                // Проверяем условие: let Some(text) = read_ansi(bytes, info + local_off.
                if let Some(text) = read_ansi(bytes, info + local_offset as usize) {
                    // Проверяем условие: !text.is_empty() {.
                    if !text.is_empty() {
                        // Возвращаем результат из функции.
                        return Some(LinkTarget(PathBuf::from(text)));
                        // Закрываем блок.
                    }
                    // Закрываем блок.
                }
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Выполняем операцию: None.
        None
    // Закрываем блок.
    } else {
        // Выполняем операцию: None.
        None
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_sources_shortcuts_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
