// Подключаем модули: super::*;.
use super::*;

/// Заголовок ShellLink: размер 0x4C + нужные флаги.
// Объявляем функцию header.
fn header(flags: u32) -> Vec<u8> {
    // Объявляем переменную bytes .
    let mut bytes = vec![0u8; 0x4C];

    // Выполняем операцию: bytes[0..4].copy_from_slice(&0x4C_u32.to_le_bytes());.
    bytes[0..4].copy_from_slice(&0x4C_u32.to_le_bytes());
    // Выполняем операцию: bytes[0x14..0x18].copy_from_slice(&flags.to_le_bytes()).
    bytes[0x14..0x18].copy_from_slice(&flags.to_le_bytes());

    // Выполняем операцию: bytes.
    bytes
    // Закрываем блок.
}

/// Блок LinkInfo с ANSI-путём.
// Объявляем функцию link_info_ansi.
fn link_info_ansi(local_path: &str) -> Vec<u8> {
    // Объявляем переменную path_bytes .
    let path_bytes = local_path.as_bytes();
    // Заголовок LinkInfo 0x1C + путь + ноль + суффикс-ноль.
    // Объявляем переменную info_size .
    let info_size = 0x1C + path_bytes.len() + 2;
    // Объявляем переменную block .
    let mut block = vec![0u8; info_size];

    // Выполняем операцию: block[0..4].copy_from_slice(&(info_size as u32).to_le_b.
    block[0..4].copy_from_slice(&(info_size as u32).to_le_bytes());
    // Выполняем операцию: block[4..8].copy_from_slice(&0x1C_u32.to_le_bytes());.
    block[4..8].copy_from_slice(&0x1C_u32.to_le_bytes());
    // volume id offset, local base path offset, network link offset,
    // common path suffix offset.
    // Выполняем операцию: block[0x0C..0x10].copy_from_slice(&0x10_u32.to_le_bytes.
    block[0x0C..0x10].copy_from_slice(&0x10_u32.to_le_bytes());
    // Выполняем операцию: block[0x10..0x14].copy_from_slice(&0x1C_u32.to_le_bytes.
    block[0x10..0x14].copy_from_slice(&0x1C_u32.to_le_bytes());

    // Перебираем элементы коллекции.
    for (index, byte) in path_bytes.iter().enumerate() {
        // Выполняем операцию: block[0x1C + index] = *byte;.
        block[0x1C + index] = *byte;
        // Закрываем блок.
    }

    // Выполняем операцию: block.
    block
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию parses_ansi_link_info_path.
fn parses_ansi_link_info_path() {
    // Объявляем переменную bytes .
    let mut bytes = header(0x0000_0002);
    // Выполняем операцию: bytes.extend(link_info_ansi(r"C:\Games\MyGame\mygame.ex.
    bytes.extend(link_info_ansi(r"C:\Games\MyGame\mygame.exe"));

    // Объявляем переменную parsed .
    let parsed = parse_link_target(&bytes).expect("цель парсится");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parsed.as_path().to_string_lossy(),.
        parsed.as_path().to_string_lossy(),
        // Выполняем операцию: r"C:\Games\MyGame\mygame.exe".
        r"C:\Games\MyGame\mygame.exe" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию parses_unicode_link_info_path.
fn parses_unicode_link_info_path() {
    // Объявляем переменную bytes .
    let mut bytes = header(0x0000_0002);

    // Заголовок LinkInfo + Unicode-путь по смещению 0x24.
    // Объявляем переменную path.
    let path: Vec<u8> = r"C:\Игры\My Game\game.exe"
        // Выполняем операцию: .encode_utf16().
        .encode_utf16()
        // Выполняем операцию: .flat_map(|unit| unit.to_le_bytes()).
        .flat_map(|unit| unit.to_le_bytes())
        // Выполняем операцию: .collect();.
        .collect();

    // Объявляем переменную tail_size .
    let tail_size = path.len() + 2;
    // Объявляем переменную info_size .
    let info_size = 0x28 + tail_size;
    // Объявляем переменную block .
    let mut block = vec![0u8; 0x28];

    // Выполняем операцию: block.resize(0x28 + tail_size, 0);.
    block.resize(0x28 + tail_size, 0);
    // Выполняем операцию: block[0..4].copy_from_slice(&(info_size as u32).to_le_b.
    block[0..4].copy_from_slice(&(info_size as u32).to_le_bytes());
    // Выполняем операцию: block[4..8].copy_from_slice(&0x1C_u32.to_le_bytes());.
    block[4..8].copy_from_slice(&0x1C_u32.to_le_bytes());
    // Флаг HasLinkInfoFlags с Unicode-путём (0x80).
    // Выполняем операцию: block[8..12].copy_from_slice(&0x0000_0080_u32.to_le_byt.
    block[8..12].copy_from_slice(&0x0000_0080_u32.to_le_bytes());
    // Выполняем операцию: block[0x24..0x28].copy_from_slice(&0x28_u32.to_le_bytes.
    block[0x24..0x28].copy_from_slice(&0x28_u32.to_le_bytes());

    // Перебираем элементы коллекции.
    for (index, byte) in path.iter().enumerate() {
        // Выполняем операцию: block[0x28 + index] = *byte;.
        block[0x28 + index] = *byte;
        // Закрываем блок.
    }

    // Выполняем операцию: bytes.extend(block);.
    bytes.extend(block);

    // Объявляем переменную parsed .
    let parsed = parse_link_target(&bytes).expect("unicode-цель парсится");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parsed.as_path().to_string_lossy(),.
        parsed.as_path().to_string_lossy(),
        // Выполняем операцию: r"C:\Игры\My Game\game.exe".
        r"C:\Игры\My Game\game.exe" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию skips_id_list_before_link_info.
fn skips_id_list_before_link_info() {
    // Объявляем переменную bytes .
    let mut bytes = header(0x0000_0003);
    // IDList: размер (2 байта) + данные; вынесен за LinkInfo.
    // Выполняем операцию: bytes.extend_from_slice(&[0x06, 0x00, 0x01, 0x02, 0x03,.
    bytes.extend_from_slice(&[0x06, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    // Выполняем операцию: bytes.extend(link_info_ansi(r"C:\Games\Second\second.ex.
    bytes.extend(link_info_ansi(r"C:\Games\Second\second.exe"));

    // Объявляем переменную parsed .
    let parsed = parse_link_target(&bytes).expect("цель после IDList парсится");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: parsed.as_path().to_string_lossy(),.
        parsed.as_path().to_string_lossy(),
        // Выполняем операцию: r"C:\Games\Second\second.exe".
        r"C:\Games\Second\second.exe" // Закрываем выражение или коллекцию.
    );
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию rejects_garbage_and_short_files.
fn rejects_garbage_and_short_files() {
    // Выполняем операцию: assert!(parse_link_target(&[]).is_none());.
    assert!(parse_link_target(&[]).is_none());
    // Выполняем операцию: assert!(parse_link_target(&[0u8; 40]).is_none());.
    assert!(parse_link_target(&[0u8; 40]).is_none());

    // Объявляем переменную bytes .
    let mut bytes = header(0x0000_0002);
    bytes[0] = 0x50; // чужой размер заголовка

    // Выполняем операцию: assert!(parse_link_target(&bytes).is_none());.
    assert!(parse_link_target(&bytes).is_none());
    // Закрываем блок.
}
