// Подключаем модули: std::cmp::Ordering;.
use std::cmp::Ordering;
// Подключаем модули: std::path::{Path, PathBuf};.
use std::path::{Path, PathBuf};

// Подключаем модули: walkdir::WalkDir;.
use walkdir::WalkDir;

// Подключаем модули: super::game_model::{GameSource, InstalledGame};.
use super::game_model::{GameSource, InstalledGame};

// Объявляем константу MIN_EXE_BYTES.
pub const MIN_EXE_BYTES: u64 = 50 * 1024 * 1024;
// Объявляем константу MARKED_EXE_BYTES.
pub const MARKED_EXE_BYTES: u64 = 8 * 1024 * 1024;
// Объявляем константу MAX_CANDIDATES.
pub const MAX_CANDIDATES: usize = 400;
// Объявляем константу TRUSTED_MIN_BYTES.
pub const TRUSTED_MIN_BYTES: u64 = 1024 * 1024;
// Объявляем константу MAX_GAME_ROOTS.
pub const MAX_GAME_ROOTS: usize = 80;
// Объявляем константу GAME_ROOTS_DEPTH.
pub const GAME_ROOTS_DEPTH: usize = 3;

// Объявляем константу SKIP_NAME_PARTS.
const SKIP_NAME_PARTS: &[&str] = &[
    // Выполняем операцию: "unitycrash",.
    "unitycrash",
    // Выполняем операцию: "crash",.
    "crash",
    // Выполняем операцию: "uninstall",.
    "uninstall",
    // Выполняем операцию: "unins",.
    "unins",
    // Выполняем операцию: "setup",.
    "setup",
    // Выполняем операцию: "vcredist",.
    "vcredist",
    // Выполняем операцию: "crashpad",.
    "crashpad",
    // Выполняем операцию: "updater",.
    "updater",
    // Выполняем операцию: "ue4prereq",.
    "ue4prereq",
    // Выполняем операцию: "dxsetup",.
    "dxsetup",
    // Выполняем операцию: "dotnetfx",.
    "dotnetfx",
    // Выполняем операцию: "directx",.
    "directx",
    // Выполняем операцию: "redist",.
    "redist",
    // Выполняем операцию: "_commonredist",.
    "_commonredist",
    // Выполняем операцию: "agent",.
    "agent",
    // Выполняем операцию: "service",.
    "service",
    // Выполняем операцию: "client",.
    "client",
    // Выполняем операцию: "daemon",.
    "daemon",
    // Выполняем операцию: "helper",.
    "helper",
    // Выполняем операцию: "tray",.
    "tray",
    // Выполняем операцию: "console",.
    "console",
    // Выполняем операцию: "worker",.
    "worker",
    // Выполняем операцию: "runtime",.
    "runtime",
    // Выполняем операцию: "installer",.
    "installer",
    // Выполняем операцию: "monitor",.
    "monitor",
    // Выполняем операцию: "crashreportclient",.
    "crashreportclient",
    // Выполняем операцию: "unrealeditor",.
    "unrealeditor",
    // Выполняем операцию: "epicwebhelper",.
    "epicwebhelper",
    // Выполняем операцию: "eossdk",.
    "eossdk",
    // Заглушка Epic в распакованных играх: запускать её нечего.
    // Выполняем операцию: "eosbootstrapper",.
    "eosbootstrapper",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу RELAXED_SKIP_NAME_PARTS.
const RELAXED_SKIP_NAME_PARTS: &[&str] = &[
    // Выполняем операцию: "uninstall",.
    "uninstall",
    // Выполняем операцию: "unins",.
    "unins",
    // Выполняем операцию: "unitycrash",.
    "unitycrash",
    // Выполняем операцию: "crash",.
    "crash",
    // Выполняем операцию: "helper",.
    "helper",
    // Выполняем операцию: "notification",.
    "notification",
    // Выполняем операцию: "daemon",.
    "daemon",
    // Выполняем операцию: "crashpad",.
    "crashpad",
    // Выполняем операцию: "prereq",.
    "prereq",
    // Выполняем операцию: "redist",.
    "redist",
    // Выполняем операцию: "vcredist",.
    "vcredist",
    // Выполняем операцию: "dxsetup",.
    "dxsetup",
    // Выполняем операцию: "dotnetfx",.
    "dotnetfx",
    // Выполняем операцию: "unrealeditor",.
    "unrealeditor",
    // Выполняем операцию: "crashreportclient",.
    "crashreportclient",
    // Выполняем операцию: "epicwebhelper",.
    "epicwebhelper",
    // Выполняем операцию: "eossdk",.
    "eossdk",
    // Заглушка Epic в распакованных играх: папка, где кроме неё
    // ничего нет, — не игра.
    // Выполняем операцию: "eosbootstrapper",.
    "eosbootstrapper",
    // Выполняем операцию: "eacsetup",.
    "eacsetup",
    // Выполняем операцию: "anticheatsetup",.
    "anticheatsetup",
    // Выполняем операцию: "vconsole",.
    "vconsole",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу SKIP_FOLDER_NAMES.
const SKIP_FOLDER_NAMES: &[&str] = &[
    // Выполняем операцию: "common files",.
    "common files",
    // Выполняем операцию: "windows",.
    "windows",
    // Выполняем операцию: "windowsapps",.
    "windowsapps",
    // Выполняем операцию: "nodejs",.
    "nodejs",
    // Выполняем операцию: "docker",.
    "docker",
    // Выполняем операцию: "git",.
    "git",
    // Выполняем операцию: "python",.
    "python",
    // Выполняем операцию: "java",.
    "java",
    // Выполняем операцию: "nvidia",.
    "nvidia",
    // Выполняем операцию: "amd",.
    "amd",
    // Выполняем операцию: "intel",.
    "intel",
    // Выполняем операцию: "microsoft",.
    "microsoft",
    // Выполняем операцию: "adobe",.
    "adobe",
    // Выполняем операцию: "lghub",.
    "lghub",
    // Выполняем операцию: "logitech",.
    "logitech",
    // Выполняем операцию: "razer",.
    "razer",
    // Выполняем операцию: "corsair",.
    "corsair",
    // Выполняем операцию: "steelseries",.
    "steelseries",
    // Выполняем операцию: "uninstall",.
    "uninstall",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу SKIP_PATH_PARTS.
const SKIP_PATH_PARTS: &[&str] = &[
    // Выполняем операцию: "steamapps\\downloading",.
    "steamapps\\downloading",
    // Выполняем операцию: "epic games\\launcher",.
    "epic games\\launcher",
    // Выполняем операцию: "epic online services",.
    "epic online services",
    // Выполняем операцию: "windows defender",.
    "windows defender",
    // Выполняем операцию: "\\$recycle.bin",.
    "\\$recycle.bin",
    // Выполняем операцию: "\\engine\\binaries\\",.
    "\\engine\\binaries\\",
    // Выполняем операцию: "\\node_modules\\",.
    "\\node_modules\\",
    // Выполняем операцию: "\\.git\\",.
    "\\.git\\",
    // Выполняем операцию: "\\winget-packages\\",.
    "\\winget-packages\\",
    // Выполняем операцию: "winget-packages",.
    "winget-packages",
    // Выполняем операцию: "\\winget\\packages\\",.
    "\\winget\\packages\\",
    // Выполняем операцию: "\\package cache\\",.
    "\\package cache\\",
    // Выполняем операцию: "package cache",.
    "package cache",
    // Выполняем операцию: "\\windows kits\\",.
    "\\windows kits\\",
    // Выполняем операцию: "\\programdata\\microsoft\\",.
    "\\programdata\\microsoft\\",
    // Выполняем операцию: "\\appdata\\local\\programs\\",.
    "\\appdata\\local\\programs\\",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу PRUNED_DIRS.
const PRUNED_DIRS: &[&str] = &[
    // Выполняем операцию: "node_modules",.
    "node_modules",
    // Выполняем операцию: ".git",.
    ".git",
    // Выполняем операцию: "target",.
    "target",
    // Выполняем операцию: "dist",.
    "dist",
    // Выполняем операцию: "build",.
    "build",
    // Выполняем операцию: "__pycache__",.
    "__pycache__",
    // Выполняем операцию: ".venv",.
    ".venv",
    // Выполняем операцию: "appdata",.
    "appdata",
    // Выполняем операцию: "zapret-discord-youtube",.
    "zapret-discord-youtube",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу GAME_MARKERS.
const GAME_MARKERS: &[&str] = &[
    // Выполняем операцию: "unityplayer.dll",.
    "unityplayer.dll",
    // Выполняем операцию: "engine\\binaries",.
    "engine\\binaries",
    // Выполняем операцию: "reengine\\",.
    "reengine\\",
    // Выполняем операцию: "\\binaries\\win64",.
    "\\binaries\\win64",
    // Выполняем операцию: "data\\data",.
    "data\\data",
    // Выполняем операцию: "content\\paks",.
    "content\\paks",
    // Закрываем выражение или коллекцию.
];

// Объявляем константу CONTENT_EXTENSIONS.
const CONTENT_EXTENSIONS: &[&str] = &[".pak", ".vpk", ".pck", ".ucas", ".utoc"];

// Объявляем функцию is_excluded_name.
pub fn is_excluded_name(name: &str) -> bool {
    // Объявляем переменную lowered .
    let lowered = name.to_ascii_lowercase();
    // Объявляем переменную without_extension .
    let without_extension = lowered.trim_end_matches(".exe");

    // Выполняем операцию: SKIP_NAME_PARTS.
    SKIP_NAME_PARTS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|part| without_extension == *part || without_exten.
        .any(|part| without_extension == *part || without_extension.starts_with(part))
    // Закрываем блок.
}

// Объявляем функцию is_excluded_path.
pub fn is_excluded_path(path: &Path) -> bool {
    // Реестр отдаёт пути прямым слешем («c:/games»), папки обходятся
    // обратным: приводим разделители к одному виду, иначе служебные
    // папки с «/» проходили все фильтры.
    // Объявляем переменную lowered .
    let lowered = path
        // Выполняем операцию: .to_string_lossy().
        .to_string_lossy()
        // Выполняем операцию: .replace('/', "\\").
        .replace('/', "\\")
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Выполняем операцию: SKIP_PATH_PARTS.iter().any(|part| lowered.contains(part.
    SKIP_PATH_PARTS.iter().any(|part| lowered.contains(part))
    // Закрываем блок.
}

// Объявляем функцию has_game_markers.
pub fn has_game_markers(directory: &Path) -> bool {
    // Выполняем операцию: GAME_MARKERS.
    GAME_MARKERS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|marker| directory.join(marker).exists()).
        .any(|marker| directory.join(marker).exists())
        // Выполняем операцию: || has_content_bundle(directory).
        || has_content_bundle(directory)
    // Закрываем блок.
}

/// Папка данных Unity (`<игра>_Data`) рядом с exe — самостоятельный признак
/// игры. У The Long Dark, например, в корне лежит tld.exe на 0.6 МБ и папка
/// tld_Data: раньше такой exe отбрасывался по порогу размера и игра не
/// находилась вообще.
// Объявляем функцию has_unity_data_folder.
pub fn has_unity_data_folder(directory: &Path) -> bool {
    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(directory) else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Выполняем операцию: entries.filter_map(Result::ok).any(|entry| {.
    entries.filter_map(Result::ok).any(|entry| {
        // Выполняем операцию: entry.file_type().map(|kind| kind.is_dir()).unwrap_or(f.
        entry.file_type().map(|kind| kind.is_dir()).unwrap_or(false)
            // Выполняем операцию: && entry.
            && entry
                // Выполняем операцию: .file_name().
                .file_name()
                // Выполняем операцию: .to_str().
                .to_str()
                // Выполняем операцию: .map(|name| {.
                .map(|name| {
                    // Объявляем переменную lowered .
                    let lowered = name.to_ascii_lowercase();

                    // Выполняем операцию: lowered.ends_with("_data") || lowered.ends_with("_data .
                    lowered.ends_with("_data") || lowered.ends_with("_data ")
                // Закрываем блок.
                })
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию has_content_bundle.
fn has_content_bundle(directory: &Path) -> bool {
    // Объявляем переменную Ok(entries) .
    let Ok(entries) = std::fs::read_dir(directory) else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Выполняем операцию: entries.filter_map(Result::ok).any(|entry| {.
    entries.filter_map(Result::ok).any(|entry| {
        // Выполняем операцию: CONTENT_EXTENSIONS.iter().any(|extension| {.
        CONTENT_EXTENSIONS.iter().any(|extension| {
            // Выполняем операцию: entry.
            entry
                // Выполняем операцию: .path().
                .path()
                // Выполняем операцию: .extension().
                .extension()
                // Выполняем операцию: .and_then(|value| value.to_str()).
                .and_then(|value| value.to_str())
                // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case(extension)).
                .map(|value| value.eq_ignore_ascii_case(extension))
                // Выполняем операцию: .unwrap_or(false).
                .unwrap_or(false)
            // Закрываем блок.
        })
        // Закрываем блок.
    })
    // Закрываем блок.
}

// Объявляем функцию is_candidate_executable.
pub fn is_candidate_executable(path: &Path) -> bool {
    // Объявляем переменную is_exe .
    let is_exe = path
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("exe")).
        .map(|value| value.eq_ignore_ascii_case("exe"))
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Проверяем условие: !is_exe || is_excluded_name(&file_name(path)) || i.
    if !is_exe || is_excluded_name(&file_name(path)) || is_excluded_path(path) {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: is_skipped_folder(path.parent().unwrap_or(Path::ne.
    if is_skipped_folder(path.parent().unwrap_or(Path::new(""))) {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную Ok(size) .
    let Ok(size) = std::fs::metadata(path).map(|value| value.len()) else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };

    // Объявляем переменную Some(parent) .
    let Some(parent) = path.parent() else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };
    // Объявляем переменную marked .
    let marked = has_game_markers(parent) || has_unreal_layout(path);
    // Unity-игра: exe рядом с папкой <игра>_Data. Такие лаунчеры бывают
    // меньше мегабайта, поэтому для них отдельный, более мягкий порог.
    // Объявляем переменную unity .
    let unity = has_unity_data_folder(parent);

    // Проверяем условие: !marked && !unity && !has_name_affinity(path) {.
    if !marked && !unity && !has_name_affinity(path) {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Объявляем переменную floor .
    let floor = if unity {
        // Выполняем операцию: TRUSTED_MIN_BYTES.
        TRUSTED_MIN_BYTES
    // Закрываем блок.
    } else if marked {
        // Выполняем операцию: MARKED_EXE_BYTES.
        MARKED_EXE_BYTES
    // Закрываем блок.
    } else {
        // Выполняем операцию: MIN_EXE_BYTES.
        MIN_EXE_BYTES
        // Закрываем блок.
    };

    // Выполняем операцию: size >= floor.
    size >= floor
    // Закрываем блок.
}

// Объявляем функцию is_skipped_folder.
fn is_skipped_folder(folder: &Path) -> bool {
    // Объявляем переменную name .
    let name = folder
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Выполняем операцию: SKIP_FOLDER_NAMES.contains(&name.as_str()).
    SKIP_FOLDER_NAMES.contains(&name.as_str())
    // Закрываем блок.
}

// Объявляем функцию has_name_affinity.
fn has_name_affinity(executable: &Path) -> bool {
    // Объявляем переменную Some(parent) .
    let Some(parent) = executable.parent() else {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    };
    // Объявляем переменную folder .
    let folder = parent
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();
    // Объявляем переменную stem .
    let stem = executable
        // Выполняем операцию: .file_stem().
        .file_stem()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Проверяем условие: folder.is_empty() || stem.is_empty() {.
    if folder.is_empty() || stem.is_empty() {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: stem == folder {.
    if stem == folder {
        // Возвращаем результат из функции.
        return true;
        // Закрываем блок.
    }

    // Объявляем переменную folder_alnum.
    let folder_alnum: String = folder
        // Выполняем операцию: .chars().
        .chars()
        // Выполняем операцию: .filter(|item| item.is_alphanumeric()).
        .filter(|item| item.is_alphanumeric())
        // Выполняем операцию: .collect();.
        .collect();
    // Объявляем переменную stem_alnum.
    let stem_alnum: String = stem.chars().filter(|item| item.is_alphanumeric()).collect();

    // Выполняем операцию: !stem_alnum.is_empty().
    !stem_alnum.is_empty()
        // Выполняем операцию: && !folder_alnum.is_empty().
        && !folder_alnum.is_empty()
        // Выполняем операцию: && (stem_alnum.contains(&folder_alnum) || folder_alnum..
        && (stem_alnum.contains(&folder_alnum) || folder_alnum.contains(&stem_alnum))
    // Закрываем блок.
}

// Объявляем функцию has_unreal_layout.
pub fn has_unreal_layout(path: &Path) -> bool {
    // Объявляем переменную lowered .
    let lowered = path.to_string_lossy().to_ascii_lowercase();

    // Выполняем операцию: lowered.contains("\\binaries\\win64\\").
    lowered.contains("\\binaries\\win64\\")
    // Закрываем блок.
}

// Объявляем функцию is_pruned_dir.
pub fn is_pruned_dir(path: &Path) -> bool {
    // Объявляем переменную name .
    let name = path
        // Выполняем операцию: .file_name().
        .file_name()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_ascii_lowercase();.
        .to_ascii_lowercase();

    // Выполняем операцию: PRUNED_DIRS.contains(&name.as_str()).
    PRUNED_DIRS.contains(&name.as_str())
    // Закрываем блок.
}

// Объявляем функцию is_game_root.
pub fn is_game_root(dir: &Path) -> bool {
    // Выполняем операцию: dir.join("UnityPlayer.dll").is_file().
    dir.join("UnityPlayer.dll").is_file()
        // Выполняем операцию: || dir.join("Engine").join("Binaries").is_dir().
        || dir.join("Engine").join("Binaries").is_dir()
        // Выполняем операцию: || dir.join("REEngine").is_dir().
        || dir.join("REEngine").is_dir()
        // Выполняем операцию: || dir.join("Binaries").join("Win64").is_dir().
        || dir.join("Binaries").join("Win64").is_dir()
        // Выполняем операцию: || dir.join("Content").join("Paks").is_dir().
        || dir.join("Content").join("Paks").is_dir()
        // Выполняем операцию: || has_content_bundle(dir).
        || has_content_bundle(dir)
    // Закрываем блок.
}

// Объявляем функцию collect_game_roots.
pub fn collect_game_roots(root: &Path, depth: usize) -> Vec<PathBuf> {
    // Проверяем условие: !root.is_dir() {.
    if !root.is_dir() {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Выполняем операцию: WalkDir::new(root).
    WalkDir::new(root)
        // Выполняем операцию: .max_depth(depth).
        .max_depth(depth)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_entry(|entry| !is_excluded_path(entry.path()) &.
        .filter_entry(|entry| !is_excluded_path(entry.path()) && !is_pruned_dir(entry.path()))
        // Выполняем операцию: .filter_map(Result::ok).
        .filter_map(Result::ok)
        // Выполняем операцию: .filter(|entry| entry.file_type().is_dir()).
        .filter(|entry| entry.file_type().is_dir())
        // Выполняем операцию: .filter(|entry| is_game_root(entry.path())).
        .filter(|entry| is_game_root(entry.path()))
        // Выполняем операцию: .map(|entry| entry.path().to_path_buf()).
        .map(|entry| entry.path().to_path_buf())
        // Выполняем операцию: .take(MAX_GAME_ROOTS).
        .take(MAX_GAME_ROOTS)
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию install_root.
pub fn install_root(executable: &Path) -> PathBuf {
    // Объявляем переменную current .
    let mut current = executable
        // Выполняем операцию: .parent().
        .parent()
        // Выполняем операцию: .map(Path::to_path_buf).
        .map(Path::to_path_buf)
        // Выполняем операцию: .unwrap_or_default();.
        .unwrap_or_default();

    // Выполняем операцию: loop {.
    loop {
        // Объявляем переменную name .
        let name = current
            // Выполняем операцию: .file_name().
            .file_name()
            // Выполняем операцию: .and_then(|value| value.to_str()).
            .and_then(|value| value.to_str())
            // Выполняем операцию: .unwrap_or_default().
            .unwrap_or_default()
            // Выполняем операцию: .to_ascii_lowercase();.
            .to_ascii_lowercase();

        // Проверяем условие: name != "win64" && name != "binaries" {.
        if name != "win64" && name != "binaries" {
            // Возвращаем результат из функции.
            return current;
            // Закрываем блок.
        }

        // Выбираем вариант по значению.
        match current.parent() {
            // Выполняем операцию: Some(parent) => current = parent.to_path_buf(),.
            Some(parent) => current = parent.to_path_buf(),
            // Выполняем операцию: None => return current,.
            None => return current,
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию collect_candidates.
pub fn collect_candidates(root: &Path, depth: usize) -> Vec<PathBuf> {
    // Выполняем операцию: collect(root, depth, false).
    collect(root, depth, false)
    // Закрываем блок.
}

// Объявляем функцию collect_candidates_relaxed.
pub fn collect_candidates_relaxed(root: &Path, depth: usize) -> Vec<PathBuf> {
    // Выполняем операцию: collect(root, depth, true).
    collect(root, depth, true)
    // Закрываем блок.
}

// Объявляем функцию collect.
fn collect(root: &Path, depth: usize, relaxed: bool) -> Vec<PathBuf> {
    // Проверяем условие: !root.is_dir() {.
    if !root.is_dir() {
        // Возвращаем результат из функции.
        return Vec::new();
        // Закрываем блок.
    }

    // Выполняем операцию: WalkDir::new(root).
    WalkDir::new(root)
        // Выполняем операцию: .max_depth(depth).
        .max_depth(depth)
        // Выполняем операцию: .into_iter().
        .into_iter()
        // Выполняем операцию: .filter_entry(|entry| !is_excluded_path(entry.path())).
        .filter_entry(|entry| !is_excluded_path(entry.path()))
        // Выполняем операцию: .filter_map(Result::ok).
        .filter_map(Result::ok)
        // Выполняем операцию: .filter(|entry| entry.file_type().is_file()).
        .filter(|entry| entry.file_type().is_file())
        // Выполняем операцию: .filter(|entry| {.
        .filter(|entry| {
            // Проверяем условие: relaxed {.
            if relaxed {
                // Выполняем операцию: is_relaxed_executable(entry.path()).
                is_relaxed_executable(entry.path())
            // Закрываем блок.
            } else {
                // Выполняем операцию: is_candidate_executable(entry.path()).
                is_candidate_executable(entry.path())
                // Закрываем блок.
            }
            // Закрываем блок.
        })
        // Выполняем операцию: .map(|entry| entry.path().to_path_buf()).
        .map(|entry| entry.path().to_path_buf())
        // Выполняем операцию: .take(MAX_CANDIDATES).
        .take(MAX_CANDIDATES)
        // Выполняем операцию: .collect().
        .collect()
    // Закрываем блок.
}

// Объявляем функцию is_relaxed_executable.
pub fn is_relaxed_executable(path: &Path) -> bool {
    // Объявляем переменную name .
    let name = file_name(path).to_ascii_lowercase();
    // Объявляем переменную is_exe .
    let is_exe = path
        // Выполняем операцию: .extension().
        .extension()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .map(|value| value.eq_ignore_ascii_case("exe")).
        .map(|value| value.eq_ignore_ascii_case("exe"))
        // Выполняем операцию: .unwrap_or(false);.
        .unwrap_or(false);

    // Проверяем условие: !is_exe || is_excluded_path(path) {.
    if !is_exe || is_excluded_path(path) {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Проверяем условие: RELAXED_SKIP_NAME_PARTS.
    if RELAXED_SKIP_NAME_PARTS
        // Выполняем операцию: .iter().
        .iter()
        // Выполняем операцию: .any(|part| name.contains(part)).
        .any(|part| name.contains(part))
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return false;
        // Закрываем блок.
    }

    // Выполняем операцию: std::fs::metadata(path).
    std::fs::metadata(path)
        // Выполняем операцию: .map(|value| value.len() >= TRUSTED_MIN_BYTES).
        .map(|value| value.len() >= TRUSTED_MIN_BYTES)
        // Выполняем операцию: .unwrap_or(false).
        .unwrap_or(false)
    // Закрываем блок.
}

// Объявляем функцию file_name.
fn file_name(path: &Path) -> String {
    // Выполняем операцию: path.file_name().
    path.file_name()
        // Выполняем операцию: .and_then(|value| value.to_str()).
        .and_then(|value| value.to_str())
        // Выполняем операцию: .unwrap_or_default().
        .unwrap_or_default()
        // Выполняем операцию: .to_string().
        .to_string()
    // Закрываем блок.
}

// Объявляем функцию source_priority.
fn source_priority(source: GameSource) -> u8 {
    // Выбираем вариант по значению.
    match source {
        // Выполняем операцию: GameSource::Steam | GameSource::Epic | GameSource::Gog .
        GameSource::Steam | GameSource::Epic | GameSource::Gog => 3,
        // Выполняем операцию: GameSource::Ubisoft | GameSource::Riot | GameSource::Ea.
        GameSource::Ubisoft | GameSource::Riot | GameSource::Ea | GameSource::BattleNet => 2,
        // Выполняем операцию: GameSource::Registry => 1,.
        GameSource::Registry => 1,
        // Выполняем операцию: GameSource::KnownFolder | GameSource::UserFolder => 0,.
        GameSource::KnownFolder | GameSource::UserFolder => 0,
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию compare_quality.
fn compare_quality(left: &InstalledGame, right: &InstalledGame) -> Ordering {
    // Выполняем операцию: left.appid.
    left.appid
        // Выполняем операцию: .is_some().
        .is_some()
        // Выполняем операцию: .cmp(&right.appid.is_some()).
        .cmp(&right.appid.is_some())
        // Выполняем операцию: .then(source_priority(left.source).cmp(&source_priority.
        .then(source_priority(left.source).cmp(&source_priority(right.source)))
        // Выполняем операцию: .then(left.executable_path.len().cmp(&right.executable_.
        .then(left.executable_path.len().cmp(&right.executable_path.len()))
    // Закрываем блок.
}

// Объявляем функцию merge_games.
pub fn merge_games(games: Vec<InstalledGame>) -> Vec<InstalledGame> {
    // Объявляем переменную merged.
    let mut merged: Vec<InstalledGame> = Vec::with_capacity(games.len());

    // Перебираем элементы коллекции.
    for game in games {
        // Объявляем переменную key .
        let key = normalized_path_key(&game.executable_path);

        // Выбираем вариант по значению.
        match merged
            // Выполняем операцию: .iter_mut().
            .iter_mut()
            // Выполняем операцию: .find(|item| normalized_path_key(&item.executable_path).
            .find(|item| normalized_path_key(&item.executable_path) == key)
        // Выполняем операцию: {.
        {
            // Выполняем операцию: Some(existing) if compare_quality(&game, existing).is_g.
            Some(existing) if compare_quality(&game, existing).is_gt() => *existing = game,
            // Выполняем операцию: Some(_) => {}.
            Some(_) => {}
            // Выполняем операцию: None => merged.push(game),.
            None => merged.push(game),
        // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: merged.sort_by(|left, right| left.name.cmp(&right.name).
    merged.sort_by(|left, right| left.name.cmp(&right.name));
    // Выполняем операцию: merged.
    merged
    // Закрываем блок.
}

/// Сравнимый вид пути: нижний регистр и одинаковый разделитель.
///
/// Реестр описывает часть путей прямым слешем («c:/games/...»), папочные
/// сканеры — обратным. Без нормализации один и тот же exe проходил
/// двойной карточкой: регистровой без обложки и парой Steam с appid.
// Объявляем функцию normalized_path_key.
fn normalized_path_key(path: &str) -> String {
    // Выполняем операцию: path.trim().to_ascii_lowercase().replace('/', "\\").
    path.trim().to_ascii_lowercase().replace('/', "\\")
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_heuristics_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
