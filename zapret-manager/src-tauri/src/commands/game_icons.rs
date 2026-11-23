// Подключаем модули: std::path::Path;.
use std::path::Path;
// Подключаем модули: winapi::ctypes::c_void;.
use winapi::ctypes::c_void;

// Подключаем модули: base64::engine::general_purpose::STANDARD as BASE64;.
use base64::engine::general_purpose::STANDARD as BASE64;
// Подключаем модули: base64::Engine;.
use base64::Engine;
// Подключаем модули: winapi::shared::windef::HICON;.
use winapi::shared::windef::HICON;
// Подключаем модули: winapi::um::libloaderapi::{.
use winapi::um::libloaderapi::{
    // Выполняем операцию: FindResourceW, FreeLibrary, LoadLibraryExW, LoadResourc.
    FindResourceW,
    FreeLibrary,
    LoadLibraryExW,
    LoadResource,
    LockResource,
    SizeofResource,
    // Закрываем блок.
};
// Подключаем модули: winapi::um::shellapi::ExtractIconExW;.
use winapi::um::shellapi::ExtractIconExW;
// Подключаем модули: winapi::um::winuser::{DestroyIcon, RT_GROUP_ICON, RT_IC.
use winapi::um::winuser::{DestroyIcon, RT_GROUP_ICON, RT_ICON};

// Объявляем константу LOAD_LIBRARY_AS_DATAFILE.
const LOAD_LIBRARY_AS_DATAFILE: u32 = 0x0000_0002;

/// Максимальный размер иконки, которую готовы отдать в интерфейс. Раньше было
/// 128: на карточке 300+ px такая иконка заметно мылилась. 256 — это размер,
/// который Windows кладёт в exe последних лет, и он уже не раздувается при
/// последующем масштабировании.
// Объявляем константу MAX_ICON_DIM.
const MAX_ICON_DIM: usize = 256;

// Объявляем функцию exe_icon_data_uri.
pub fn exe_icon_data_uri(path: &Path) -> Option<String> {
    // Проверяем условие: !path.is_file() {.
    if !path.is_file() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную (width, height, rgba) .
    let (width, height, rgba) = resource_icon(path)
        // Выполняем операцию: .or_else(|| system_icon(path)).
        .or_else(|| system_icon(path))
        // Выполняем операцию: .filter(|(width, height, _)| *width > 0 && *height > 0).
        .filter(|(width, height, _)| *width > 0 && *height > 0)?;

    // Объявляем переменную png .
    let png = encode_png(width as u32, height as u32, &rgba)?;

    // Выполняем операцию: Some(format!("data:image/png;base64,{}", BASE64.encode(.
    Some(format!("data:image/png;base64,{}", BASE64.encode(png)))
    // Закрываем блок.
}

// Объявляем функцию resource_icon.
fn resource_icon(path: &Path) -> Option<(usize, usize, Vec<u8>)> {
    // Объявляем переменную wide.
    let wide: Vec<u16> = path
        // Выполняем операцию: .as_os_str().
        .as_os_str()
        // Выполняем операцию: .to_string_lossy().
        .to_string_lossy()
        // Выполняем операцию: .encode_utf16().
        .encode_utf16()
        // Выполняем операцию: .chain(std::iter::once(0)).
        .chain(std::iter::once(0))
        // Выполняем операцию: .collect();.
        .collect();
    // Объявляем переменную module .
    let module = unsafe {
        // Выполняем операцию: LoadLibraryExW(.
        LoadLibraryExW(
            // Выполняем операцию: wide.as_ptr(),.
            wide.as_ptr(),
            // Выполняем операцию: std::ptr::null_mut(),.
            std::ptr::null_mut(),
            // Выполняем операцию: LOAD_LIBRARY_AS_DATAFILE,.
            LOAD_LIBRARY_AS_DATAFILE,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Проверяем условие: module.is_null() {.
    if module.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let result = (|| {
        // Объявляем переменную group .
        let group = resource_bytes(module, RT_GROUP_ICON, 1)?;
        // Объявляем переменную candidates .
        let candidates = group_entries(&group)?;

        // Современные exe кладут в RT_ICON картинку в формате PNG, которую
        // наш распаковщик DIB не читает. Поэтому идём от крупных к мелким и
        // берём первую, которую реально удалось распаковать: иначе на таких
        // играх мы молча получали бы иконку 32×32 из кэша оболочки вместо
        // нормальной 256×256 или 48×48 из ресурсов.
        // Перебираем элементы коллекции.
        for entry in candidates {
            // Объявляем переменную Some(image) .
            let Some(image) = resource_bytes(module, RT_ICON, u32::from(entry.nid)) else {
                // Выполняем операцию: continue;.
                continue;
                // Закрываем блок.
            };

            // Проверяем условие: let Some(decoded) = decode_icon_image(&image, entr.
            if let Some(decoded) = decode_icon_image(&image, entry.width, entry.height) {
                // Возвращаем результат из функции.
                return Some(decoded);
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Выполняем операцию: None.
        None
        // Закрываем блок.
    })();

    // Выполняем операцию: unsafe { FreeLibrary(module) };.
    unsafe { FreeLibrary(module) };

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию resource_bytes.
fn resource_bytes(
    // Выполняем операцию: module: winapi::shared::minwindef::HMODULE,.
    module: winapi::shared::minwindef::HMODULE,
    // Выполняем операцию: kind: *mut u16,.
    kind: *mut u16,
    // Выполняем операцию: name: u32,.
    name: u32,
    // Закрываем выражение или коллекцию.
) -> Option<Vec<u8>> {
    // Объявляем переменную name_ptr .
    let name_ptr = make_int_resource(name);
    // Объявляем переменную info .
    let info = unsafe { FindResourceW(module, name_ptr.as_ptr(), kind) };

    // Проверяем условие: info.is_null() {.
    if info.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную size .
    let size = unsafe { SizeofResource(module, info) };

    // Проверяем условие: size == 0 {.
    if size == 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную handle .
    let handle = unsafe { LoadResource(module, info) };

    // Проверяем условие: handle.is_null() {.
    if handle.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную pointer .
    let pointer = unsafe { LockResource(handle) };

    // Проверяем условие: pointer.is_null() {.
    if pointer.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную slice .
    let slice = unsafe { std::slice::from_raw_parts(pointer as *const u8, size as usize) };

    // Выполняем операцию: Some(slice.to_vec()).
    Some(slice.to_vec())
    // Закрываем блок.
}

// Объявляем функцию make_int_resource.
fn make_int_resource(value: u32) -> Vec<u16> {
    // Выполняем операцию: vec![(value & 0xffff) as u16, (value >> 16) as u16].
    vec![(value & 0xffff) as u16, (value >> 16) as u16]
    // Закрываем блок.
}

// Объявляем структуру GroupEntry.
pub struct GroupEntry {
    // Выполняем операцию: width: usize,.
    width: usize,
    // Выполняем операцию: height: usize,.
    height: usize,
    // Выполняем операцию: nid: u16,.
    nid: u16,
    // Закрываем блок.
}

/// Все подходящие кадры группы, от крупных к мелким.
// Объявляем функцию group_entries.
pub fn group_entries(bytes: &[u8]) -> Option<Vec<GroupEntry>> {
    // Проверяем условие: bytes.len() < 6 {.
    if bytes.len() < 6 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную count .
    let count = read_u16(bytes, 4)? as usize;
    // Объявляем переменную entries.
    let mut entries: Vec<GroupEntry> = Vec::new();

    // Перебираем элементы коллекции.
    for index in 0..count {
        // Объявляем переменную offset .
        let offset = 6 + index * 14;

        // Проверяем условие: offset + 14 > bytes.len() {.
        if offset + 14 > bytes.len() {
            // Выполняем операцию: break;.
            break;
            // Закрываем блок.
        }

        // Объявляем переменную width .
        let width = match bytes[offset] {
            // Выполняем операцию: 0 => 256,.
            0 => 256,
            // Выполняем операцию: value => usize::from(value),.
            value => usize::from(value),
            // Закрываем блок.
        };
        // Объявляем переменную height .
        let height = match bytes[offset + 1] {
            // Выполняем операцию: 0 => 256,.
            0 => 256,
            // Выполняем операцию: value => usize::from(value),.
            value => usize::from(value),
            // Закрываем блок.
        };

        // Проверяем условие: width > MAX_ICON_DIM || height > MAX_ICON_DIM {.
        if width > MAX_ICON_DIM || height > MAX_ICON_DIM {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        }

        // Объявляем переменную Some(nid) .
        let Some(nid) = read_u16(bytes, offset + 12) else {
            // Выполняем операцию: continue;.
            continue;
            // Закрываем блок.
        };

        // Выполняем операцию: entries.push(GroupEntry { width, height, nid });.
        entries.push(GroupEntry { width, height, nid });
        // Закрываем блок.
    }

    // Выполняем операцию: entries.sort_by(|left, right| {.
    entries.sort_by(|left, right| {
        // Выполняем операцию: (right.width * right.height).
        (right.width * right.height)
            // Выполняем операцию: .cmp(&(left.width * left.height)).
            .cmp(&(left.width * left.height))
            // Выполняем операцию: .then_with(|| left.nid.cmp(&right.nid)).
            .then_with(|| left.nid.cmp(&right.nid))
        // Закрываем блок.
    });

    // Выполняем операцию: Some(entries).
    Some(entries)
    // Закрываем блок.
}

// Объявляем функцию decode_icon_image.
fn decode_icon_image(bytes: &[u8], width: usize, height: usize) -> Option<(usize, usize, Vec<u8>)> {
    // Проверяем условие: bytes.len() < 40 {.
    if bytes.len() < 40 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную header_size .
    let header_size = read_u32(bytes, 0)? as usize;

    // Проверяем условие: header_size < 40 {.
    if header_size < 40 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную bit_count .
    let bit_count = read_u16(bytes, 14)?;
    // Объявляем переменную compression .
    let compression = read_u32(bytes, 16)?;

    // Проверяем условие: compression != 0 {.
    if compression != 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную stored_width .
    let stored_width = read_i32(bytes, 4)?.unsigned_abs() as usize;
    // Объявляем переменную stored_height .
    let stored_height = read_i32(bytes, 8)?.unsigned_abs() as usize;
    // Объявляем переменную doubled .
    let doubled = stored_height >= height * 2 || stored_height.is_multiple_of(2);
    // Объявляем переменную pixel_height .
    let pixel_height = if doubled && stored_height == height * 2 {
        // Выполняем операцию: stored_height / 2.
        stored_height / 2
    // Закрываем блок.
    } else {
        // Выполняем операцию: stored_height.max(height).
        stored_height.max(height)
        // Закрываем блок.
    };
    // Объявляем переменную pixel_width .
    let pixel_width = stored_width.max(width);
    // Объявляем переменную offset .
    let offset = header_size;
    // Объявляем переменную row_bytes .
    let row_bytes = row_stride(pixel_width, bit_count);
    // Объявляем переменную total .
    let total = row_bytes.checked_mul(pixel_height)?;

    // Проверяем условие: offset + total > bytes.len() {.
    if offset + total > bytes.len() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную rgba .
    let mut rgba = vec![0u8; pixel_width * pixel_height * 4];

    // Перебираем элементы коллекции.
    for row in 0..pixel_height {
        // Объявляем переменную source_row .
        let source_row = offset + (pixel_height - 1 - row) * row_bytes;

        // Перебираем элементы коллекции.
        for column in 0..pixel_width {
            // Объявляем переменную target .
            let target = (row * pixel_width + column) * 4;

            // Выбираем вариант по значению.
            match bit_count {
                // Выполняем операцию: 32 => {.
                32 => {
                    // Объявляем переменную index .
                    let index = source_row + column * 4;

                    // Выполняем операцию: rgba[target] = bytes[index + 2];.
                    rgba[target] = bytes[index + 2];
                    // Выполняем операцию: rgba[target + 1] = bytes[index + 1];.
                    rgba[target + 1] = bytes[index + 1];
                    // Выполняем операцию: rgba[target + 2] = bytes[index];.
                    rgba[target + 2] = bytes[index];
                    // Выполняем операцию: rgba[target + 3] = 255;.
                    rgba[target + 3] = 255;
                    // Закрываем блок.
                }
                // Выполняем операцию: 24 => {.
                24 => {
                    // Объявляем переменную index .
                    let index = source_row + column * 3;

                    // Выполняем операцию: rgba[target] = bytes[index + 2];.
                    rgba[target] = bytes[index + 2];
                    // Выполняем операцию: rgba[target + 1] = bytes[index + 1];.
                    rgba[target + 1] = bytes[index + 1];
                    // Выполняем операцию: rgba[target + 2] = bytes[index];.
                    rgba[target + 2] = bytes[index];
                    // Выполняем операцию: rgba[target + 3] = 255;.
                    rgba[target + 3] = 255;
                    // Закрываем блок.
                }
                // Выполняем операцию: _ => return None,.
                _ => return None,
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: apply_mask(.
    apply_mask(
        // Выполняем операцию: bytes,.
        bytes,
        // Выполняем операцию: pixel_width,.
        pixel_width,
        // Выполняем операцию: pixel_height,.
        pixel_height,
        // Выполняем операцию: bit_count,.
        bit_count,
        // Выполняем операцию: header_size,.
        header_size,
        // Выполняем операцию: &mut rgba,.
        &mut rgba,
        // Закрываем выражение или коллекцию.
    );

    // Выполняем операцию: Some((pixel_width, pixel_height, rgba)).
    Some((pixel_width, pixel_height, rgba))
    // Закрываем блок.
}

// Объявляем функцию apply_mask.
fn apply_mask(
    // Выполняем операцию: bytes: &[u8],.
    bytes: &[u8],
    // Выполняем операцию: width: usize,.
    width: usize,
    // Выполняем операцию: height: usize,.
    height: usize,
    // Выполняем операцию: bit_count: u16,.
    bit_count: u16,
    // Выполняем операцию: header_size: usize,.
    header_size: usize,
    // Выполняем операцию: rgba: &mut [u8],.
    rgba: &mut [u8],
    // Закрываем выражение или коллекцию.
) {
    // Объявляем переменную color_stride .
    let color_stride = row_stride(width, bit_count);
    // Объявляем переменную color_total .
    let color_total = match color_stride.checked_mul(height) {
        // Выполняем операцию: Some(value) => value,.
        Some(value) => value,
        // Выполняем операцию: None => return,.
        None => return,
        // Закрываем блок.
    };
    // Объявляем переменную mask_offset .
    let mask_offset = header_size + color_total;
    // Объявляем переменную mask_stride .
    let mask_stride = row_stride(width, 1);

    // Проверяем условие: mask_offset + mask_stride * height > bytes.len() {.
    if mask_offset + mask_stride * height > bytes.len() {
        // Объявляем переменную has_alpha .
        let has_alpha = (0..rgba.len() / 4).any(|index| rgba[index * 4 + 3] != 0);

        // Проверяем условие: !has_alpha {.
        if !has_alpha {
            // Перебираем элементы коллекции.
            for index in 0..rgba.len() / 4 {
                // Выполняем операцию: rgba[index * 4 + 3] = 255;.
                rgba[index * 4 + 3] = 255;
                // Закрываем блок.
            }
            // Закрываем блок.
        }

        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for row in 0..height {
        // Объявляем переменную source_row .
        let source_row = mask_offset + (height - 1 - row) * mask_stride;

        // Перебираем элементы коллекции.
        for column in 0..width {
            // Объявляем переменную byte .
            let byte = bytes[source_row + column / 8];
            // Объявляем переменную transparent .
            let transparent = byte & (0x80 >> (column % 8)) != 0;

            // Проверяем условие: transparent {.
            if transparent {
                // Выполняем операцию: rgba[(row * width + column) * 4 + 3] = 0;.
                rgba[(row * width + column) * 4 + 3] = 0;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию row_stride.
fn row_stride(width: usize, bit_count: u16) -> usize {
    // Объявляем переменную bits .
    let bits = width * usize::from(bit_count);

    // Выполняем операцию: bits.div_ceil(32) * 4.
    bits.div_ceil(32) * 4
    // Закрываем блок.
}

// Объявляем функцию system_icon.
fn system_icon(path: &Path) -> Option<(usize, usize, Vec<u8>)> {
    // Объявляем переменную wide.
    let wide: Vec<u16> = path
        // Выполняем операцию: .as_os_str().
        .as_os_str()
        // Выполняем операцию: .to_string_lossy().
        .to_string_lossy()
        // Выполняем операцию: .encode_utf16().
        .encode_utf16()
        // Выполняем операцию: .chain(std::iter::once(0)).
        .chain(std::iter::once(0))
        // Выполняем операцию: .collect();.
        .collect();
    // Объявляем переменную large.
    let mut large: HICON = std::ptr::null_mut();
    // Объявляем переменную count .
    let count = unsafe { ExtractIconExW(wide.as_ptr(), 0, &mut large, std::ptr::null_mut(), 1) };

    // Проверяем условие: count == 0 || large.is_null() {.
    if count == 0 || large.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let result = system_icon_rgba(large);

    // Выполняем операцию: unsafe { DestroyIcon(large) };.
    unsafe { DestroyIcon(large) };

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию system_icon_rgba.
fn system_icon_rgba(icon: HICON) -> Option<(usize, usize, Vec<u8>)> {
    // Подключаем модули: winapi::um::winuser::{GetIconInfo, ICONINFO};.
    use winapi::um::winuser::{GetIconInfo, ICONINFO};

    // Объявляем переменную info.
    let mut info: ICONINFO = unsafe { std::mem::zeroed() };

    // Проверяем условие: unsafe { GetIconInfo(icon, &mut info) } == 0 {.
    if unsafe { GetIconInfo(icon, &mut info) } == 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную result .
    let result = system_bitmap_rgba(info.hbmColor, info.hbmMask);

    // Выполняем операцию: unsafe {.
    unsafe {
        // Проверяем условие: !info.hbmColor.is_null() {.
        if !info.hbmColor.is_null() {
            // Выполняем операцию: winapi::um::wingdi::DeleteObject(info.hbmColor as *mut .
            winapi::um::wingdi::DeleteObject(info.hbmColor as *mut c_void);
            // Закрываем блок.
        }

        // Проверяем условие: !info.hbmMask.is_null() {.
        if !info.hbmMask.is_null() {
            // Выполняем операцию: winapi::um::wingdi::DeleteObject(info.hbmMask as *mut c.
            winapi::um::wingdi::DeleteObject(info.hbmMask as *mut c_void);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: result.
    result
    // Закрываем блок.
}

// Объявляем функцию system_bitmap_rgba.
fn system_bitmap_rgba(
    // Выполняем операцию: color: winapi::shared::windef::HBITMAP,.
    color: winapi::shared::windef::HBITMAP,
    // Выполняем операцию: mask: winapi::shared::windef::HBITMAP,.
    mask: winapi::shared::windef::HBITMAP,
    // Закрываем выражение или коллекцию.
) -> Option<(usize, usize, Vec<u8>)> {
    // Подключаем модули: winapi::um::wingdi::GetObjectW;.
    use winapi::um::wingdi::GetObjectW;
    // Подключаем модули: winapi::um::wingdi::{.
    use winapi::um::wingdi::{
        // Выполняем операцию: CreateCompatibleDC, DeleteDC, GetDIBits, SelectObject, .
        CreateCompatibleDC,
        DeleteDC,
        GetDIBits,
        SelectObject,
        BITMAP,
        BITMAPINFO,
        // Выполняем операцию: BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,.
        BITMAPINFOHEADER,
        BI_RGB,
        DIB_RGB_COLORS,
        // Закрываем блок.
    };

    // Проверяем условие: color.is_null() {.
    if color.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную bitmap.
    let mut bitmap: BITMAP = unsafe { std::mem::zeroed() };

    // Проверяем условие: unsafe {.
    if unsafe {
        // Выполняем операцию: GetObjectW(.
        GetObjectW(
            // Выполняем операцию: color as *mut c_void,.
            color as *mut c_void,
            // Выполняем операцию: std::mem::size_of::<BITMAP>() as i32,.
            std::mem::size_of::<BITMAP>() as i32,
            // Выполняем операцию: &mut bitmap as *mut BITMAP as *mut c_void,.
            &mut bitmap as *mut BITMAP as *mut c_void,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    } == 0
    // Выполняем операцию: {.
    {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную width .
    let width = bitmap.bmWidth.max(1) as usize;
    // Объявляем переменную height .
    let height = bitmap.bmHeight.max(1) as usize;
    // Объявляем переменную dc .
    let dc = unsafe { CreateCompatibleDC(std::ptr::null_mut()) };

    // Проверяем условие: dc.is_null() {.
    if dc.is_null() {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную old .
    let old = unsafe { SelectObject(dc, color as *mut c_void) };
    // Объявляем переменную header.
    let mut header: BITMAPINFO = unsafe { std::mem::zeroed() };

    // Выполняем операцию: header.bmiHeader.biSize = std::mem::size_of::<BITMAPINF.
    header.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    // Выполняем операцию: header.bmiHeader.biWidth = width as i32;.
    header.bmiHeader.biWidth = width as i32;
    // Выполняем операцию: header.bmiHeader.biHeight = -(height as i32);.
    header.bmiHeader.biHeight = -(height as i32);
    // Выполняем операцию: header.bmiHeader.biPlanes = 1;.
    header.bmiHeader.biPlanes = 1;
    // Выполняем операцию: header.bmiHeader.biBitCount = 32;.
    header.bmiHeader.biBitCount = 32;
    // Выполняем операцию: header.bmiHeader.biCompression = BI_RGB;.
    header.bmiHeader.biCompression = BI_RGB;

    // Объявляем переменную buffer .
    let mut buffer = vec![0u8; width * height * 4];
    // Объявляем переменную lines .
    let lines = unsafe {
        // Выполняем операцию: GetDIBits(.
        GetDIBits(
            // Выполняем операцию: dc,.
            dc,
            // Выполняем операцию: color,.
            color,
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: height as u32,.
            height as u32,
            // Выполняем операцию: buffer.as_mut_ptr() as *mut c_void,.
            buffer.as_mut_ptr() as *mut c_void,
            // Выполняем операцию: &mut header,.
            &mut header,
            // Выполняем операцию: DIB_RGB_COLORS,.
            DIB_RGB_COLORS,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: SelectObject(dc, old);.
        SelectObject(dc, old);
        // Выполняем операцию: DeleteDC(dc);.
        DeleteDC(dc);
        // Закрываем блок.
    }

    // Проверяем условие: lines == 0 {.
    if lines == 0 {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную has_alpha .
    let mut has_alpha = false;

    // Перебираем элементы коллекции.
    for index in 0..buffer.len() / 4 {
        // Объявляем переменную offset .
        let offset = index * 4;

        // Проверяем условие: buffer[offset + 3] != 0 {.
        if buffer[offset + 3] != 0 {
            // Выполняем операцию: has_alpha = true;.
            has_alpha = true;
            // Закрываем блок.
        }

        // Выполняем операцию: buffer.swap(offset, offset + 2);.
        buffer.swap(offset, offset + 2);
        // Закрываем блок.
    }

    // Проверяем условие: !has_alpha && !mask.is_null() {.
    if !has_alpha && !mask.is_null() {
        // Выполняем операцию: apply_system_mask(mask, width, height, &mut buffer);.
        apply_system_mask(mask, width, height, &mut buffer);
        // Закрываем блок.
    }

    // Проверяем условие: !has_alpha && mask.is_null() {.
    if !has_alpha && mask.is_null() {
        // Перебираем элементы коллекции.
        for index in 0..buffer.len() / 4 {
            // Выполняем операцию: buffer[index * 4 + 3] = 255;.
            buffer[index * 4 + 3] = 255;
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: Some((width, height, buffer)).
    Some((width, height, buffer))
    // Закрываем блок.
}

// Объявляем функцию apply_system_mask.
fn apply_system_mask(
    // Выполняем операцию: mask: winapi::shared::windef::HBITMAP,.
    mask: winapi::shared::windef::HBITMAP,
    // Выполняем операцию: width: usize,.
    width: usize,
    // Выполняем операцию: height: usize,.
    height: usize,
    // Выполняем операцию: rgba: &mut [u8],.
    rgba: &mut [u8],
    // Закрываем выражение или коллекцию.
) {
    // Подключаем модули: winapi::um::wingdi::{.
    use winapi::um::wingdi::{
        // Выполняем операцию: CreateCompatibleDC, DeleteDC, GetDIBits, SelectObject, .
        CreateCompatibleDC,
        DeleteDC,
        GetDIBits,
        SelectObject,
        BITMAPINFO,
        BITMAPINFOHEADER,
        // Выполняем операцию: BI_RGB, DIB_RGB_COLORS,.
        BI_RGB,
        DIB_RGB_COLORS,
        // Закрываем блок.
    };

    // Объявляем переменную dc .
    let dc = unsafe { CreateCompatibleDC(std::ptr::null_mut()) };

    // Проверяем условие: dc.is_null() {.
    if dc.is_null() {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Объявляем переменную old .
    let old = unsafe { SelectObject(dc, mask as *mut c_void) };
    // Объявляем переменную stride .
    let stride = row_stride(window_width(width), 1);
    // Объявляем переменную header.
    let mut header: BITMAPINFO = unsafe { std::mem::zeroed() };

    // Выполняем операцию: header.bmiHeader.biSize = std::mem::size_of::<BITMAPINF.
    header.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    // Выполняем операцию: header.bmiHeader.biWidth = width as i32;.
    header.bmiHeader.biWidth = width as i32;
    // Выполняем операцию: header.bmiHeader.biHeight = -(height as i32);.
    header.bmiHeader.biHeight = -(height as i32);
    // Выполняем операцию: header.bmiHeader.biPlanes = 1;.
    header.bmiHeader.biPlanes = 1;
    // Выполняем операцию: header.bmiHeader.biBitCount = 1;.
    header.bmiHeader.biBitCount = 1;
    // Выполняем операцию: header.bmiHeader.biCompression = BI_RGB;.
    header.bmiHeader.biCompression = BI_RGB;

    // Объявляем переменную bits .
    let mut bits = vec![0u8; stride * height];
    // Объявляем переменную lines .
    let lines = unsafe {
        // Выполняем операцию: GetDIBits(.
        GetDIBits(
            // Выполняем операцию: dc,.
            dc,
            // Выполняем операцию: mask,.
            mask,
            // Выполняем операцию: 0,.
            0,
            // Выполняем операцию: height as u32,.
            height as u32,
            // Выполняем операцию: bits.as_mut_ptr() as *mut c_void,.
            bits.as_mut_ptr() as *mut c_void,
            // Выполняем операцию: &mut header,.
            &mut header,
            // Выполняем операцию: DIB_RGB_COLORS,.
            DIB_RGB_COLORS,
            // Закрываем выражение или коллекцию.
        )
        // Закрываем блок.
    };

    // Выполняем операцию: unsafe {.
    unsafe {
        // Выполняем операцию: SelectObject(dc, old);.
        SelectObject(dc, old);
        // Выполняем операцию: DeleteDC(dc);.
        DeleteDC(dc);
        // Закрываем блок.
    }

    // Проверяем условие: lines == 0 {.
    if lines == 0 {
        // Возвращаем результат из функции.
        return;
        // Закрываем блок.
    }

    // Перебираем элементы коллекции.
    for row in 0..height {
        // Перебираем элементы коллекции.
        for column in 0..width {
            // Объявляем переменную byte .
            let byte = bits[row * stride + column / 8];
            // Объявляем переменную transparent .
            let transparent = byte & (0x80 >> (column % 8)) != 0;

            // Проверяем условие: transparent {.
            if transparent {
                // Выполняем операцию: rgba[(row * width + column) * 4 + 3] = 0;.
                rgba[(row * width + column) * 4 + 3] = 0;
                // Закрываем блок.
            }
            // Закрываем блок.
        }
        // Закрываем блок.
    }
    // Закрываем блок.
}

// Объявляем функцию window_width.
fn window_width(width: usize) -> usize {
    // Выполняем операцию: width.
    width
    // Закрываем блок.
}

// Объявляем функцию read_u16.
fn read_u16(bytes: &[u8], offset: usize) -> Option<u16> {
    // Объявляем переменную slice .
    let slice = bytes.get(offset..offset + 2)?;

    // Выполняем операцию: Some(u16::from_le_bytes([slice[0], slice[1]])).
    Some(u16::from_le_bytes([slice[0], slice[1]]))
    // Закрываем блок.
}

// Объявляем функцию read_u32.
fn read_u32(bytes: &[u8], offset: usize) -> Option<u32> {
    // Объявляем переменную slice .
    let slice = bytes.get(offset..offset + 4)?;

    // Выполняем операцию: Some(u32::from_le_bytes([slice[0], slice[1], slice[2], .
    Some(u32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
    // Закрываем блок.
}

// Объявляем функцию read_i32.
fn read_i32(bytes: &[u8], offset: usize) -> Option<i32> {
    // Объявляем переменную slice .
    let slice = bytes.get(offset..offset + 4)?;

    // Выполняем операцию: Some(i32::from_le_bytes([slice[0], slice[1], slice[2], .
    Some(i32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
    // Закрываем блок.
}

// Объявляем функцию encode_png.
pub fn encode_png(width: u32, height: u32, rgba: &[u8]) -> Option<Vec<u8>> {
    // Проверяем условие: width == 0 || height == 0 || rgba.len() != (width .
    if width == 0 || height == 0 || rgba.len() != (width * height * 4) as usize {
        // Возвращаем результат из функции.
        return None;
        // Закрываем блок.
    }

    // Объявляем переменную raw .
    let mut raw = Vec::with_capacity(((width * 4 + 1) * height) as usize);

    // Перебираем элементы коллекции.
    for row in 0..height {
        // Выполняем операцию: raw.push(0);.
        raw.push(0);
        // Объявляем переменную start .
        let start = (row * width * 4) as usize;
        // Выполняем операцию: raw.extend_from_slice(&rgba[start..start + (width * 4) .
        raw.extend_from_slice(&rgba[start..start + (width * 4) as usize]);
        // Закрываем блок.
    }

    // Объявляем переменную png .
    let mut png = Vec::new();

    // Выполняем операцию: png.extend_from_slice(&[0x89, b'P', b'N', b'G', 0x0d, 0.
    png.extend_from_slice(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]);

    // Объявляем переменную ihdr .
    let mut ihdr = Vec::with_capacity(13);

    // Выполняем операцию: ihdr.extend_from_slice(&width.to_be_bytes());.
    ihdr.extend_from_slice(&width.to_be_bytes());
    // Выполняем операцию: ihdr.extend_from_slice(&height.to_be_bytes());.
    ihdr.extend_from_slice(&height.to_be_bytes());
    // Выполняем операцию: ihdr.extend_from_slice(&[8, 6, 0, 0, 0]);.
    ihdr.extend_from_slice(&[8, 6, 0, 0, 0]);
    // Выполняем операцию: push_chunk(&mut png, b"IHDR", &ihdr);.
    push_chunk(&mut png, b"IHDR", &ihdr);

    // Объявляем переменную zlib .
    let mut zlib = vec![0x78, 0x01];
    // Объявляем переменную index .
    let mut index = 0;

    // Повторяем, пока выполняется условие.
    while index < raw.len() {
        // Объявляем переменную block .
        let block = (raw.len() - index).min(65535);
        // Объявляем переменную final_block .
        let final_block = index + block >= raw.len();
        // Выполняем операцию: zlib.push(if final_block { 1 } else { 0 });.
        zlib.push(if final_block { 1 } else { 0 });
        // Выполняем операцию: zlib.extend_from_slice(&(block as u16).to_le_bytes());.
        zlib.extend_from_slice(&(block as u16).to_le_bytes());
        // Выполняем операцию: zlib.extend_from_slice(&(!(block as u16)).to_le_bytes().
        zlib.extend_from_slice(&(!(block as u16)).to_le_bytes());
        // Выполняем операцию: zlib.extend_from_slice(&raw[index..index + block]);.
        zlib.extend_from_slice(&raw[index..index + block]);
        // Выполняем операцию: index += block;.
        index += block;
        // Закрываем блок.
    }

    // Выполняем операцию: zlib.extend_from_slice(&adler32(&raw).to_be_bytes());.
    zlib.extend_from_slice(&adler32(&raw).to_be_bytes());

    // Выполняем операцию: push_chunk(&mut png, b"IDAT", &zlib);.
    push_chunk(&mut png, b"IDAT", &zlib);
    // Выполняем операцию: push_chunk(&mut png, b"IEND", &[]);.
    push_chunk(&mut png, b"IEND", &[]);

    // Выполняем операцию: Some(png).
    Some(png)
    // Закрываем блок.
}

// Объявляем функцию push_chunk.
fn push_chunk(target: &mut Vec<u8>, kind: &[u8; 4], data: &[u8]) {
    // Выполняем операцию: target.extend_from_slice(&(data.len() as u32).to_be_byt.
    target.extend_from_slice(&(data.len() as u32).to_be_bytes());
    // Выполняем операцию: target.extend_from_slice(kind);.
    target.extend_from_slice(kind);
    // Выполняем операцию: target.extend_from_slice(data);.
    target.extend_from_slice(data);

    // Объявляем переменную crc_input .
    let mut crc_input = Vec::with_capacity(kind.len() + data.len());

    // Выполняем операцию: crc_input.extend_from_slice(kind);.
    crc_input.extend_from_slice(kind);
    // Выполняем операцию: crc_input.extend_from_slice(data);.
    crc_input.extend_from_slice(data);
    // Выполняем операцию: target.extend_from_slice(&crc32(&crc_input).to_be_bytes.
    target.extend_from_slice(&crc32(&crc_input).to_be_bytes());
    // Закрываем блок.
}

// Объявляем функцию crc32.
fn crc32(data: &[u8]) -> u32 {
    // Объявляем переменную crc.
    let mut crc: u32 = 0xffff_ffff;

    // Перебираем элементы коллекции.
    for byte in data {
        // Выполняем операцию: crc ^= u32::from(*byte);.
        crc ^= u32::from(*byte);

        // Перебираем элементы коллекции.
        for _ in 0..8 {
            // Объявляем переменную mask .
            let mask = 0u32.wrapping_sub(crc & 1);
            // Выполняем операцию: crc = (crc >> 1) ^ (0xedb8_8320 & mask);.
            crc = (crc >> 1) ^ (0xedb8_8320 & mask);
            // Закрываем блок.
        }
        // Закрываем блок.
    }

    // Выполняем операцию: !crc.
    !crc
    // Закрываем блок.
}

// Объявляем функцию adler32.
fn adler32(data: &[u8]) -> u32 {
    // Объявляем переменную a.
    let mut a: u32 = 1;
    // Объявляем переменную b.
    let mut b: u32 = 0;

    // Перебираем элементы коллекции.
    for byte in data {
        // Выполняем операцию: a = (a + u32::from(*byte)) % 65521;.
        a = (a + u32::from(*byte)) % 65521;
        // Выполняем операцию: b = (b + a) % 65521;.
        b = (b + a) % 65521;
        // Закрываем блок.
    }

    // Выполняем операцию: (b << 16) | a.
    (b << 16) | a
    // Закрываем блок.
}

// Применяем атрибут к следующему объявлению.
#[cfg(test)]
// Применяем атрибут к следующему объявлению.
#[path = "game_icons_tests.rs"]
// Выполняем операцию: mod tests;.
mod tests;
