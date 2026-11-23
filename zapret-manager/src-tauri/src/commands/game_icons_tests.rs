// Подключаем модули: super::*;.
use super::*;

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_encode_png_writes_signature_and_chunks.
fn test_encode_png_writes_signature_and_chunks() {
    // Объявляем переменную rgba .
    let rgba = vec![255u8; 4 * 4 * 4];
    // Объявляем переменную png .
    let png = encode_png(4, 4, &rgba).expect("png");

    // Выполняем операцию: assert_eq!(.
    assert_eq!(
        // Выполняем операцию: &png[0..8],.
        &png[0..8],
        // Выполняем операцию: &[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a].
        &[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a] // Закрываем выражение или коллекцию.
    );
    // Выполняем операцию: assert!(png.windows(4).any(|window| window == b"IHDR")).
    assert!(png.windows(4).any(|window| window == b"IHDR"));
    // Выполняем операцию: assert!(png.windows(4).any(|window| window == b"IDAT")).
    assert!(png.windows(4).any(|window| window == b"IDAT"));
    // Выполняем операцию: assert!(png.windows(4).any(|window| window == b"IEND")).
    assert!(png.windows(4).any(|window| window == b"IEND"));
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_encode_png_rejects_wrong_size.
fn test_encode_png_rejects_wrong_size() {
    // Выполняем операцию: assert!(encode_png(4, 4, &[0u8; 10]).is_none());.
    assert!(encode_png(4, 4, &[0u8; 10]).is_none());
    // Выполняем операцию: assert!(encode_png(0, 0, &[]).is_none());.
    assert!(encode_png(0, 0, &[]).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_crc32_known_value.
fn test_crc32_known_value() {
    // Выполняем операцию: assert_eq!(crc32(b"IEND"), 0xae42_6082);.
    assert_eq!(crc32(b"IEND"), 0xae42_6082);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_adler32_known_value.
fn test_adler32_known_value() {
    // Выполняем операцию: assert_eq!(adler32(b"abc"), 0x024d_0127);.
    assert_eq!(adler32(b"abc"), 0x024d_0127);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_group_entries_prefers_largest_first.
fn test_group_entries_prefers_largest_first() {
    // Объявляем переменную bytes .
    let mut bytes = vec![0u8; 6];
    // Выполняем операцию: bytes[4] = 2;.
    bytes[4] = 2;

    // entry 0: 16x16, id 7 (14 bytes: w,h,colors,reserved,planes,bits,size,nid)
    // Выполняем операцию: bytes.extend_from_slice(&[16, 16, 0, 0, 1, 0, 1, 0, 0, .
    bytes.extend_from_slice(&[16, 16, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 7, 0]);
    // entry 1: 48x48, id 9
    // Выполняем операцию: bytes.extend_from_slice(&[48, 48, 0, 0, 1, 0, 1, 0, 0, .
    bytes.extend_from_slice(&[48, 48, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 9, 0]);

    // Объявляем переменную entries .
    let entries = group_entries(&bytes).expect("entries");

    // Выполняем операцию: assert_eq!(entries.len(), 2);.
    assert_eq!(entries.len(), 2);
    // Выполняем операцию: assert_eq!(entries[0].width, 48);.
    assert_eq!(entries[0].width, 48);
    // Выполняем операцию: assert_eq!(entries[0].nid, 9);.
    assert_eq!(entries[0].nid, 9);
    // Выполняем операцию: assert_eq!(entries[1].width, 16);.
    assert_eq!(entries[1].width, 16);
    // Выполняем операцию: assert_eq!(entries[1].nid, 7);.
    assert_eq!(entries[1].nid, 7);
    // Закрываем блок.
}

/// Нулевой байт размера в группе означает 256 px — самый крупный кадр, какой
/// вообще бывает в exe. Он обязан попадать в список первым.
// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_group_entries_accepts_256_and_puts_it_first.
fn test_group_entries_accepts_256_and_puts_it_first() {
    // Объявляем переменную bytes .
    let mut bytes = vec![0u8; 6];
    // Выполняем операцию: bytes[4] = 2;.
    bytes[4] = 2;

    // Выполняем операцию: bytes.extend_from_slice(&[32, 32, 0, 0, 1, 0, 1, 0, 0, .
    bytes.extend_from_slice(&[32, 32, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 3, 0]);
    // Выполняем операцию: bytes.extend_from_slice(&[0, 0, 0, 0, 1, 0, 1, 0, 0, 0,.
    bytes.extend_from_slice(&[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 4, 0]);

    // Объявляем переменную entries .
    let entries = group_entries(&bytes).expect("entries");

    // Выполняем операцию: assert_eq!(entries.len(), 2);.
    assert_eq!(entries.len(), 2);
    // Выполняем операцию: assert_eq!(entries[0].width, 256);.
    assert_eq!(entries[0].width, 256);
    // Выполняем операцию: assert_eq!(entries[0].height, 256);.
    assert_eq!(entries[0].height, 256);
    // Выполняем операцию: assert_eq!(entries[0].nid, 4);.
    assert_eq!(entries[0].nid, 4);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_group_entries_truncated_input_is_safe.
fn test_group_entries_truncated_input_is_safe() {
    // Объявляем переменную bytes .
    let mut bytes = vec![0u8; 6];
    // Выполняем операцию: bytes[4] = 4;.
    bytes[4] = 4;

    // Выполняем операцию: bytes.extend_from_slice(&[16, 16, 0, 0, 1, 0, 1, 0, 0, .
    bytes.extend_from_slice(&[16, 16, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 7, 0]);

    // Объявляем переменную entries .
    let entries = group_entries(&bytes).expect("entries");

    // Выполняем операцию: assert_eq!(entries.len(), 1);.
    assert_eq!(entries.len(), 1);
    // Выполняем операцию: assert!(group_entries(&[0, 0, 0]).is_none());.
    assert!(group_entries(&[0, 0, 0]).is_none());
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_row_stride_aligns_to_four_bytes.
fn test_row_stride_aligns_to_four_bytes() {
    // Выполняем операцию: assert_eq!(row_stride(16, 32), 64);.
    assert_eq!(row_stride(16, 32), 64);
    // Выполняем операцию: assert_eq!(row_stride(3, 32), 12);.
    assert_eq!(row_stride(3, 32), 12);
    // Выполняем операцию: assert_eq!(row_stride(17, 1), 4);.
    assert_eq!(row_stride(17, 1), 4);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_decode_icon_image_32bpp_bottom_up.
fn test_decode_icon_image_32bpp_bottom_up() {
    // Объявляем переменную width .
    let width = 2usize;
    // Объявляем переменную height .
    let height = 2usize;
    // Объявляем переменную bytes .
    let mut bytes = vec![0u8; 40];

    // Выполняем операцию: bytes[0..4].copy_from_slice(&40u32.to_le_bytes());.
    bytes[0..4].copy_from_slice(&40u32.to_le_bytes());
    // Выполняем операцию: bytes[4..8].copy_from_slice(&(width as i32).to_le_bytes.
    bytes[4..8].copy_from_slice(&(width as i32).to_le_bytes());
    // Выполняем операцию: bytes[8..12].copy_from_slice(&((height * 2) as i32).to_.
    bytes[8..12].copy_from_slice(&((height * 2) as i32).to_le_bytes());
    // Выполняем операцию: bytes[12..14].copy_from_slice(&1u16.to_le_bytes());.
    bytes[12..14].copy_from_slice(&1u16.to_le_bytes());
    // Выполняем операцию: bytes[14..16].copy_from_slice(&32u16.to_le_bytes());.
    bytes[14..16].copy_from_slice(&32u16.to_le_bytes());

    // bottom row first: red, blue ; top row: green, white (BGRA)
    // Объявляем переменную pixels.
    let pixels: [[u8; 4]; 4] = [
        // Выполняем операцию: [0, 0, 255, 0],.
        [0, 0, 255, 0],
        // Выполняем операцию: [255, 0, 0, 0],.
        [255, 0, 0, 0],
        // Выполняем операцию: [0, 255, 0, 0],.
        [0, 255, 0, 0],
        // Выполняем операцию: [255, 255, 255, 0],.
        [255, 255, 255, 0],
        // Закрываем выражение или коллекцию.
    ];

    // Перебираем элементы коллекции.
    for pixel in pixels {
        // Выполняем операцию: bytes.extend_from_slice(&pixel);.
        bytes.extend_from_slice(&pixel);
        // Закрываем блок.
    }

    // mask: all opaque
    // Выполняем операцию: bytes.extend_from_slice(&[0, 0, 0, 0, 0, 0, 0, 0]);.
    bytes.extend_from_slice(&[0, 0, 0, 0, 0, 0, 0, 0]);

    // Объявляем переменную (decoded_width, decoded_height, rgba) .
    let (decoded_width, decoded_height, rgba) =
        // Выполняем операцию: decode_icon_image(&bytes, width, height).expect("decode.
        decode_icon_image(&bytes, width, height).expect("decoded");

    // Выполняем операцию: assert_eq!(decoded_width, width);.
    assert_eq!(decoded_width, width);
    // Выполняем операцию: assert_eq!(decoded_height, height);.
    assert_eq!(decoded_height, height);
    // Выполняем операцию: assert_eq!(&rgba[0..4], &[0, 255, 0, 255]);.
    assert_eq!(&rgba[0..4], &[0, 255, 0, 255]);
    // Выполняем операцию: assert_eq!(&rgba[4..8], &[255, 255, 255, 255]);.
    assert_eq!(&rgba[4..8], &[255, 255, 255, 255]);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_exe_icon_from_system_executable.
fn test_exe_icon_from_system_executable() {
    // Объявляем переменную windir .
    let windir = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    // Объявляем переменную notepad .
    let notepad = Path::new(&windir).join("System32").join("notepad.exe");

    // Проверяем условие: !notepad.is_file() {.
    if !notepad.is_file() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную uri .
    let uri = exe_icon_data_uri(&notepad);

    // Выполняем операцию: assert!(uri.is_some());.
    assert!(uri.is_some());

    // Объявляем переменную value .
    let value = uri.unwrap_or_default();

    // Выполняем операцию: assert!(value.starts_with("data:image/png;base64,"));.
    assert!(value.starts_with("data:image/png;base64,"));
    // Выполняем операцию: assert!(value.len() > 200);.
    assert!(value.len() > 200);
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[test]
// Объявляем функцию test_exe_icon_for_missing_file_is_none.
fn test_exe_icon_for_missing_file_is_none() {
    // Выполняем операцию: assert!(exe_icon_data_uri(Path::new("C:\\definitely\\mi.
    assert!(exe_icon_data_uri(Path::new("C:\\definitely\\missing.exe")).is_none());
    // Закрываем блок.
}
