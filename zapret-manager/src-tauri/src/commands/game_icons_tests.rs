use super::*;

#[test]
fn test_encode_png_writes_signature_and_chunks() {
    let rgba = vec![255u8; 4 * 4 * 4];
    let png = encode_png(4, 4, &rgba).expect("png");

    assert_eq!(&png[0..8], &[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]);
    assert!(png.windows(4).any(|window| window == b"IHDR"));
    assert!(png.windows(4).any(|window| window == b"IDAT"));
    assert!(png.windows(4).any(|window| window == b"IEND"));
}

#[test]
fn test_encode_png_rejects_wrong_size() {
    assert!(encode_png(4, 4, &[0u8; 10]).is_none());
    assert!(encode_png(0, 0, &[]).is_none());
}

#[test]
fn test_crc32_known_value() {
    assert_eq!(crc32(b"IEND"), 0xae42_6082);
}

#[test]
fn test_adler32_known_value() {
    assert_eq!(adler32(b"abc"), 0x024d_0127);
}

#[test]
fn test_group_entries_prefers_largest_first() {
    let mut bytes = vec![0u8; 6];
    bytes[4] = 2;

    // entry 0: 16x16, id 7 (14 bytes: w,h,colors,reserved,planes,bits,size,nid)
    bytes.extend_from_slice(&[16, 16, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 7, 0]);
    // entry 1: 48x48, id 9
    bytes.extend_from_slice(&[48, 48, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 9, 0]);

    let entries = group_entries(&bytes).expect("entries");

    assert_eq!(entries.len(), 2);
    assert_eq!(entries[0].width, 48);
    assert_eq!(entries[0].nid, 9);
    assert_eq!(entries[1].width, 16);
    assert_eq!(entries[1].nid, 7);
}

/// Нулевой байт размера в группе означает 256 px — самый крупный кадр, какой
/// вообще бывает в exe. Он обязан попадать в список первым.
#[test]
fn test_group_entries_accepts_256_and_puts_it_first() {
    let mut bytes = vec![0u8; 6];
    bytes[4] = 2;

    bytes.extend_from_slice(&[32, 32, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 3, 0]);
    bytes.extend_from_slice(&[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 4, 0]);

    let entries = group_entries(&bytes).expect("entries");

    assert_eq!(entries.len(), 2);
    assert_eq!(entries[0].width, 256);
    assert_eq!(entries[0].height, 256);
    assert_eq!(entries[0].nid, 4);
}

#[test]
fn test_group_entries_truncated_input_is_safe() {
    let mut bytes = vec![0u8; 6];
    bytes[4] = 4;

    bytes.extend_from_slice(&[16, 16, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 7, 0]);

    let entries = group_entries(&bytes).expect("entries");

    assert_eq!(entries.len(), 1);
    assert!(group_entries(&[0, 0, 0]).is_none());
}

#[test]
fn test_row_stride_aligns_to_four_bytes() {
    assert_eq!(row_stride(16, 32), 64);
    assert_eq!(row_stride(3, 32), 12);
    assert_eq!(row_stride(17, 1), 4);
}

#[test]
fn test_decode_icon_image_32bpp_bottom_up() {
    let width = 2usize;
    let height = 2usize;
    let mut bytes = vec![0u8; 40];

    bytes[0..4].copy_from_slice(&40u32.to_le_bytes());
    bytes[4..8].copy_from_slice(&(width as i32).to_le_bytes());
    bytes[8..12].copy_from_slice(&((height * 2) as i32).to_le_bytes());
    bytes[12..14].copy_from_slice(&1u16.to_le_bytes());
    bytes[14..16].copy_from_slice(&32u16.to_le_bytes());

    // bottom row first: red, blue ; top row: green, white (BGRA)
    let pixels: [[u8; 4]; 4] = [
        [0, 0, 255, 0],
        [255, 0, 0, 0],
        [0, 255, 0, 0],
        [255, 255, 255, 0],
    ];

    for pixel in pixels {
        bytes.extend_from_slice(&pixel);
    }

    // mask: all opaque
    bytes.extend_from_slice(&[0, 0, 0, 0, 0, 0, 0, 0]);

    let (decoded_width, decoded_height, rgba) =
        decode_icon_image(&bytes, width, height).expect("decoded");

    assert_eq!(decoded_width, width);
    assert_eq!(decoded_height, height);
    assert_eq!(&rgba[0..4], &[0, 255, 0, 255]);
    assert_eq!(&rgba[4..8], &[255, 255, 255, 255]);
}

#[test]
fn test_exe_icon_from_system_executable() {
    let windir = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    let notepad = Path::new(&windir).join("System32").join("notepad.exe");

    if !notepad.is_file() {
        return;
    }

    let uri = exe_icon_data_uri(&notepad);

    assert!(uri.is_some());

    let value = uri.unwrap_or_default();

    assert!(value.starts_with("data:image/png;base64,"));
    assert!(value.len() > 200);
}

#[test]
fn test_exe_icon_for_missing_file_is_none() {
    assert!(exe_icon_data_uri(Path::new("C:\\definitely\\missing.exe")).is_none());
}