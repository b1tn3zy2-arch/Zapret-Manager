use winapi::ctypes::c_void;
use std::path::Path;

use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use winapi::shared::windef::HICON;
use winapi::um::libloaderapi::{
    FindResourceW, FreeLibrary, LoadLibraryExW, LoadResource, LockResource, SizeofResource,
};
use winapi::um::shellapi::ExtractIconExW;
use winapi::um::winuser::{DestroyIcon, RT_GROUP_ICON, RT_ICON};

const LOAD_LIBRARY_AS_DATAFILE: u32 = 0x0000_0002;

const MAX_ICON_DIM: usize = 128;

pub fn exe_icon_data_uri(path: &Path) -> Option<String> {
    if !path.is_file() {
        return None;
    }

    let (width, height, rgba) = resource_icon(path)
        .or_else(|| system_icon(path))
        .filter(|(width, height, _)| *width > 0 && *height > 0)?;

    let png = encode_png(width as u32, height as u32, &rgba)?;

    Some(format!("data:image/png;base64,{}", BASE64.encode(png)))
}

fn resource_icon(path: &Path) -> Option<(usize, usize, Vec<u8>)> {
    let wide: Vec<u16> = path
        .as_os_str()
        .to_string_lossy()
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();
    let module = unsafe {
        LoadLibraryExW(wide.as_ptr(), std::ptr::null_mut(), LOAD_LIBRARY_AS_DATAFILE)
    };

    if module.is_null() {
        return None;
    }

    let result = (|| {
        let group = resource_bytes(module, RT_GROUP_ICON, 1)?;
        let entry = pick_group_entry(&group)?;
        let image = resource_bytes(module, RT_ICON, u32::from(entry.nid))?;

        decode_icon_image(&image, entry.width, entry.height)
    })();

    unsafe { FreeLibrary(module) };

    result
}

fn resource_bytes(
    module: winapi::shared::minwindef::HMODULE,
    kind: *mut u16,
    name: u32,
) -> Option<Vec<u8>> {
    let name_ptr = make_int_resource(name);
    let info = unsafe { FindResourceW(module, name_ptr.as_ptr(), kind) };

    if info.is_null() {
        return None;
    }

    let size = unsafe { SizeofResource(module, info) };

    if size == 0 {
        return None;
    }

    let handle = unsafe { LoadResource(module, info) };

    if handle.is_null() {
        return None;
    }

    let pointer = unsafe { LockResource(handle) };

    if pointer.is_null() {
        return None;
    }

    let slice = unsafe { std::slice::from_raw_parts(pointer as *const u8, size as usize) };

    Some(slice.to_vec())
}

fn make_int_resource(value: u32) -> Vec<u16> {
    vec![(value & 0xffff) as u16, (value >> 16) as u16]
}

struct GroupEntry {
    width: usize,
    height: usize,
    nid: u16,
}

fn pick_group_entry(bytes: &[u8]) -> Option<GroupEntry> {
    if bytes.len() < 6 {
        return None;
    }

    let count = read_u16(bytes, 4)? as usize;
    let mut best: Option<GroupEntry> = None;

    for index in 0..count {
        let offset = 6 + index * 14;

        if offset + 14 > bytes.len() {
            break;
        }

        let width = match bytes[offset] {
            0 => 256,
            value => usize::from(value),
        };
        let height = match bytes[offset + 1] {
            0 => 256,
            value => usize::from(value),
        };
        let nid = read_u16(bytes, offset + 12)?;

        if width > MAX_ICON_DIM || height > MAX_ICON_DIM {
            continue;
        }

        let better = best
            .as_ref()
            .map(|current| width * height > current.width * current.height)
            .unwrap_or(true);

        if better {
            best = Some(GroupEntry { width, height, nid });
        }
    }

    best
}

fn decode_icon_image(bytes: &[u8], width: usize, height: usize) -> Option<(usize, usize, Vec<u8>)> {
    if bytes.len() < 40 {
        return None;
    }

    let header_size = read_u32(bytes, 0)? as usize;

    if header_size < 40 {
        return None;
    }

    let bit_count = read_u16(bytes, 14)?;
    let compression = read_u32(bytes, 16)?;

    if compression != 0 {
        return None;
    }

    let stored_width = read_i32(bytes, 4)?.unsigned_abs() as usize;
    let stored_height = read_i32(bytes, 8)?.unsigned_abs() as usize;
    let doubled = stored_height >= height * 2 || stored_height.is_multiple_of(2);
    let pixel_height = if doubled && stored_height == height * 2 {
        stored_height / 2
    } else {
        stored_height.max(height)
    };
    let pixel_width = stored_width.max(width);
    let offset = header_size;
    let row_bytes = row_stride(pixel_width, bit_count);
    let total = row_bytes.checked_mul(pixel_height)?;

    if offset + total > bytes.len() {
        return None;
    }

    let mut rgba = vec![0u8; pixel_width * pixel_height * 4];

    for row in 0..pixel_height {
        let source_row = offset + (pixel_height - 1 - row) * row_bytes;

        for column in 0..pixel_width {
            let target = (row * pixel_width + column) * 4;

            match bit_count {
                32 => {
                    let index = source_row + column * 4;

                    rgba[target] = bytes[index + 2];
                    rgba[target + 1] = bytes[index + 1];
                    rgba[target + 2] = bytes[index];
                    rgba[target + 3] = 255;
                }
                24 => {
                    let index = source_row + column * 3;

                    rgba[target] = bytes[index + 2];
                    rgba[target + 1] = bytes[index + 1];
                    rgba[target + 2] = bytes[index];
                    rgba[target + 3] = 255;
                }
                _ => return None,
            }
        }
    }

    apply_mask(bytes, pixel_width, pixel_height, bit_count, header_size, &mut rgba);

    Some((pixel_width, pixel_height, rgba))
}

fn apply_mask(
    bytes: &[u8],
    width: usize,
    height: usize,
    bit_count: u16,
    header_size: usize,
    rgba: &mut [u8],
) {
    let color_stride = row_stride(width, bit_count);
    let color_total = match color_stride.checked_mul(height) {
        Some(value) => value,
        None => return,
    };
    let mask_offset = header_size + color_total;
    let mask_stride = row_stride(width, 1);

    if mask_offset + mask_stride * height > bytes.len() {
        let has_alpha = (0..rgba.len() / 4).any(|index| rgba[index * 4 + 3] != 0);

        if !has_alpha {
            for index in 0..rgba.len() / 4 {
                rgba[index * 4 + 3] = 255;
            }
        }

        return;
    }

    for row in 0..height {
        let source_row = mask_offset + (height - 1 - row) * mask_stride;

        for column in 0..width {
            let byte = bytes[source_row + column / 8];
            let transparent = byte & (0x80 >> (column % 8)) != 0;

            if transparent {
                rgba[(row * width + column) * 4 + 3] = 0;
            }
        }
    }
}

fn row_stride(width: usize, bit_count: u16) -> usize {
    let bits = width * usize::from(bit_count);

    bits.div_ceil(32) * 4
}

fn system_icon(path: &Path) -> Option<(usize, usize, Vec<u8>)> {
    let wide: Vec<u16> = path
        .as_os_str()
        .to_string_lossy()
        .encode_utf16()
        .chain(std::iter::once(0))
        .collect();
    let mut large: HICON = std::ptr::null_mut();
    let count = unsafe {
        ExtractIconExW(wide.as_ptr(), 0, &mut large, std::ptr::null_mut(), 1)
    };

    if count == 0 || large.is_null() {
        return None;
    }

    let result = system_icon_rgba(large);

    unsafe { DestroyIcon(large) };

    result
}

fn system_icon_rgba(icon: HICON) -> Option<(usize, usize, Vec<u8>)> {
    use winapi::um::winuser::{GetIconInfo, ICONINFO};

    let mut info: ICONINFO = unsafe { std::mem::zeroed() };

    if unsafe { GetIconInfo(icon, &mut info) } == 0 {
        return None;
    }

    let result = system_bitmap_rgba(info.hbmColor, info.hbmMask);

    unsafe {
        if !info.hbmColor.is_null() {
            winapi::um::wingdi::DeleteObject(info.hbmColor as *mut c_void);
        }

        if !info.hbmMask.is_null() {
            winapi::um::wingdi::DeleteObject(info.hbmMask as *mut c_void);
        }
    }

    result
}

fn system_bitmap_rgba(
    color: winapi::shared::windef::HBITMAP,
    mask: winapi::shared::windef::HBITMAP,
) -> Option<(usize, usize, Vec<u8>)> {
    use winapi::um::wingdi::{
        CreateCompatibleDC, DeleteDC, GetDIBits, SelectObject, BITMAP, BITMAPINFO,
        BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,
    };
    use winapi::um::wingdi::GetObjectW;

    if color.is_null() {
        return None;
    }

    let mut bitmap: BITMAP = unsafe { std::mem::zeroed() };

    if unsafe {
        GetObjectW(
            color as *mut c_void,
            std::mem::size_of::<BITMAP>() as i32,
            &mut bitmap as *mut BITMAP as *mut c_void,
        )
    } == 0
    {
        return None;
    }

    let width = bitmap.bmWidth.max(1) as usize;
    let height = bitmap.bmHeight.max(1) as usize;
    let dc = unsafe { CreateCompatibleDC(std::ptr::null_mut()) };

    if dc.is_null() {
        return None;
    }

    let old = unsafe { SelectObject(dc, color as *mut c_void) };
    let mut header: BITMAPINFO = unsafe { std::mem::zeroed() };

    header.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    header.bmiHeader.biWidth = width as i32;
    header.bmiHeader.biHeight = -(height as i32);
    header.bmiHeader.biPlanes = 1;
    header.bmiHeader.biBitCount = 32;
    header.bmiHeader.biCompression = BI_RGB;

    let mut buffer = vec![0u8; width * height * 4];
    let lines = unsafe {
        GetDIBits(
            dc,
            color,
            0,
            height as u32,
            buffer.as_mut_ptr() as *mut c_void,
            &mut header,
            DIB_RGB_COLORS,
        )
    };

    unsafe {
        SelectObject(dc, old);
        DeleteDC(dc);
    }

    if lines == 0 {
        return None;
    }

    let mut has_alpha = false;

    for index in 0..buffer.len() / 4 {
        let offset = index * 4;

        if buffer[offset + 3] != 0 {
            has_alpha = true;
        }

        buffer.swap(offset, offset + 2);
    }

    if !has_alpha && !mask.is_null() {
        apply_system_mask(mask, width, height, &mut buffer);
    }

    if !has_alpha && mask.is_null() {
        for index in 0..buffer.len() / 4 {
            buffer[index * 4 + 3] = 255;
        }
    }

    Some((width, height, buffer))
}

fn apply_system_mask(
    mask: winapi::shared::windef::HBITMAP,
    width: usize,
    height: usize,
    rgba: &mut [u8],
) {
    use winapi::um::wingdi::{
        CreateCompatibleDC, DeleteDC, GetDIBits, SelectObject, BITMAPINFO, BITMAPINFOHEADER,
        BI_RGB, DIB_RGB_COLORS,
    };

    let dc = unsafe { CreateCompatibleDC(std::ptr::null_mut()) };

    if dc.is_null() {
        return;
    }

    let old = unsafe { SelectObject(dc, mask as *mut c_void) };
    let stride = row_stride(window_width(width), 1);
    let mut header: BITMAPINFO = unsafe { std::mem::zeroed() };

    header.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
    header.bmiHeader.biWidth = width as i32;
    header.bmiHeader.biHeight = -(height as i32);
    header.bmiHeader.biPlanes = 1;
    header.bmiHeader.biBitCount = 1;
    header.bmiHeader.biCompression = BI_RGB;

    let mut bits = vec![0u8; stride * height];
    let lines = unsafe {
        GetDIBits(
            dc,
            mask,
            0,
            height as u32,
            bits.as_mut_ptr() as *mut c_void,
            &mut header,
            DIB_RGB_COLORS,
        )
    };

    unsafe {
        SelectObject(dc, old);
        DeleteDC(dc);
    }

    if lines == 0 {
        return;
    }

    for row in 0..height {
        for column in 0..width {
            let byte = bits[row * stride + column / 8];
            let transparent = byte & (0x80 >> (column % 8)) != 0;

            if transparent {
                rgba[(row * width + column) * 4 + 3] = 0;
            }
        }
    }
}

fn window_width(width: usize) -> usize {
    width
}

fn read_u16(bytes: &[u8], offset: usize) -> Option<u16> {
    let slice = bytes.get(offset..offset + 2)?;

    Some(u16::from_le_bytes([slice[0], slice[1]]))
}

fn read_u32(bytes: &[u8], offset: usize) -> Option<u32> {
    let slice = bytes.get(offset..offset + 4)?;

    Some(u32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
}

fn read_i32(bytes: &[u8], offset: usize) -> Option<i32> {
    let slice = bytes.get(offset..offset + 4)?;

    Some(i32::from_le_bytes([slice[0], slice[1], slice[2], slice[3]]))
}


pub fn encode_png(width: u32, height: u32, rgba: &[u8]) -> Option<Vec<u8>> {
    if width == 0 || height == 0 || rgba.len() != (width * height * 4) as usize {
        return None;
    }

    let mut raw = Vec::with_capacity(((width * 4 + 1) * height) as usize);

    for row in 0..height {
        raw.push(0);
        let start = (row * width * 4) as usize;
        raw.extend_from_slice(&rgba[start..start + (width * 4) as usize]);
    }

    let mut png = Vec::new();

    png.extend_from_slice(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]);

    let mut ihdr = Vec::with_capacity(13);

    ihdr.extend_from_slice(&width.to_be_bytes());
    ihdr.extend_from_slice(&height.to_be_bytes());
    ihdr.extend_from_slice(&[8, 6, 0, 0, 0]);
    push_chunk(&mut png, b"IHDR", &ihdr);

    let mut zlib = vec![0x78, 0x01];
    let mut index = 0;

    while index < raw.len() {
        let block = (raw.len() - index).min(65535);
        let final_block = index + block >= raw.len();
        zlib.push(if final_block { 1 } else { 0 });
        zlib.extend_from_slice(&(block as u16).to_le_bytes());
        zlib.extend_from_slice(&(!(block as u16)).to_le_bytes());
        zlib.extend_from_slice(&raw[index..index + block]);
        index += block;
    }

    zlib.extend_from_slice(&adler32(&raw).to_be_bytes());

    push_chunk(&mut png, b"IDAT", &zlib);
    push_chunk(&mut png, b"IEND", &[]);

    Some(png)
}

fn push_chunk(target: &mut Vec<u8>, kind: &[u8; 4], data: &[u8]) {
    target.extend_from_slice(&(data.len() as u32).to_be_bytes());
    target.extend_from_slice(kind);
    target.extend_from_slice(data);

    let mut crc_input = Vec::with_capacity(kind.len() + data.len());

    crc_input.extend_from_slice(kind);
    crc_input.extend_from_slice(data);
    target.extend_from_slice(&crc32(&crc_input).to_be_bytes());
}

fn crc32(data: &[u8]) -> u32 {
    let mut crc: u32 = 0xffff_ffff;

    for byte in data {
        crc ^= u32::from(*byte);

        for _ in 0..8 {
            let mask = 0u32.wrapping_sub(crc & 1);
            crc = (crc >> 1) ^ (0xedb8_8320 & mask);
        }
    }

    !crc
}

fn adler32(data: &[u8]) -> u32 {
    let mut a: u32 = 1;
    let mut b: u32 = 0;

    for byte in data {
        a = (a + u32::from(*byte)) % 65521;
        b = (b + a) % 65521;
    }

    (b << 16) | a
}

#[cfg(test)]
#[path = "game_icons_tests.rs"]
mod tests;