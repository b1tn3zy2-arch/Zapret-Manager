import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const installerDir = resolve(scriptDir, "..", "src-tauri", "installer");
const bitmapsDir = resolve(installerDir, "bitmaps");

const BRAND_BG = [0x0a, 0x0a, 0x0f];
const BRAND_BG_ALT = [0x1c, 0x1c, 0x26];
const ACCENT = [0x00, 0xff, 0x88];
const MUTED = [0x8a, 0x8a, 0x9c];

const GLYPHS = {
  A: ".###./#...#/#...#/#####/#...#/#...#/#...#",
  B: "####./#...#/#...#/####./#...#/#...#/####.",
  C: ".####/#..../#..../#..../#..../#..../.####",
  D: "####./#...#/#...#/#...#/#...#/#...#/####.",
  E: "#####/#..../#..../####./#..../#..../#####",
  F: "#####/#..../#..../####./#..../#..../#....",
  G: ".###./#...#/#..../#..##/#...#/#...#/.###.",
  H: "#...#/#...#/#...#/#####/#...#/#...#/#...#",
  I: "#####/..#../..#../..#../..#../..#../#####",
  J: "..###/...#./...#./...#./...#./#..#./.##..",
  K: "#...#/#..#./#.#../##.../#.#../#..#./#...#",
  L: "#..../#..../#..../#..../#..../#..../#####",
  M: "#...#/##.##/#.#.#/#...#/#...#/#...#/#...#",
  N: "#...#/##..#/#.#.#/#..##/#...#/#...#/#...#",
  O: ".###./#...#/#...#/#...#/#...#/#...#/.###.",
  P: "####./#...#/#...#/####./#..../#..../#....",
  Q: ".###./#...#/#...#/#...#/#.#.#/#..#./.##.#",
  R: "####./#...#/#...#/####./#.#../#..#./#...#",
  S: ".####/#..../#..../.###./....#/....#/####.",
  T: "#####/..#../..#../..#../..#../..#../..#..",
  U: "#...#/#...#/#...#/#...#/#...#/#...#/.###.",
  V: "#...#/#...#/#...#/#...#/#...#/.#.#./..#..",
  W: "#...#/#...#/#...#/#...#/#.#.#/##.##/#...#",
  X: "#...#/#...#/.#.#./..#../.#.#./#...#/#...#",
  Y: "#...#/#...#/.#.#./..#../..#../..#../..#..",
  Z: "#####/....#/...#./..#../.#.../#..../#####",
  0: ".###./#...#/#..##/#.#.#/##..#/#...#/.###.",
  1: "..#../.##../..#../..#../..#../..#../.###.",
  2: ".###./#...#/....#/...#./..#../.#.../#####",
  3: "#####/...#./..#../...#./....#/#...#/.###.",
  4: "...#./..##./.#.#./#..#./#####/...#./...#.",
  5: "#####/#..../####./....#/....#/#...#/.###.",
  6: "..##./.#.../#..../####./#...#/#...#/.###.",
  7: "#####/....#/...#./..#../.#.../.#.../.#...",
  8: ".###./#...#/#...#/.###./#...#/#...#/.###.",
  9: ".###./#...#/#...#/.####/....#/...#./.##..",
  " ": "...../...../...../...../...../...../.....",
  ".": "...../...../...../...../...../.##../.##..",
  "-": "...../...../...../#####/...../...../.....",
  ":": "...../.##../.##../...../.##../.##../.....",
  "/": "....#/....#/...#./..#../.#.../#..../#....",
  "!": "..#../..#../..#../..#../..#../...../..#..",
  "+": "...../..#../..#../#####/..#../..#../.....",
  ",": "...../...../...../...../.##../.##../.#...",
  "(": "..##./.#.../#..../#..../#..../.#.../..##.",
  ")": ".##../...#./....#/....#/....#/...#./.##..",
};

const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;

function glyphRows(character) {
  const key = character.toUpperCase();
  const source = GLYPHS[key];
  if (!source) {
    throw new Error(`glyph not found: ${JSON.stringify(character)}`);
  }
  return source.split("/");
}

class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height * 3);
  }

  set(x, y, [r, g, b]) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }
    const offset = (y * this.width + x) * 3;
    this.pixels[offset] = b;
    this.pixels[offset + 1] = g;
    this.pixels[offset + 2] = r;
  }

  blend(x, y, [r, g, b], alpha) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height || alpha <= 0) {
      return;
    }
    const offset = (y * this.width + x) * 3;
    this.pixels[offset] = Math.round(
      this.pixels[offset] * (1 - alpha) + b * alpha
    );
    this.pixels[offset + 1] = Math.round(
      this.pixels[offset + 1] * (1 - alpha) + g * alpha
    );
    this.pixels[offset + 2] = Math.round(
      this.pixels[offset + 2] * (1 - alpha) + r * alpha
    );
  }

  fillVerticalGradient(from, to) {
    for (let y = 0; y < this.height; y += 1) {
      const t = this.height === 1 ? 0 : y / (this.height - 1);
      const color = from.map((value, index) =>
        Math.round(value + (to[index] - value) * t)
      );
      for (let x = 0; x < this.width; x += 1) {
        this.set(x, y, color);
      }
    }
  }

  fillHorizontalGradient(from, to) {
    for (let x = 0; x < this.width; x += 1) {
      const t = this.width === 1 ? 0 : x / (this.width - 1);
      const color = from.map((value, index) =>
        Math.round(value + (to[index] - value) * t)
      );
      for (let y = 0; y < this.height; y += 1) {
        this.set(x, y, color);
      }
    }
  }

  fillRect(x, y, width, height, color, alpha = 1) {
    for (let dy = 0; dy < height; dy += 1) {
      for (let dx = 0; dx < width; dx += 1) {
        this.blend(x + dx, y + dy, color, alpha);
      }
    }
  }

  strokeRect(x, y, width, height, color, alpha = 1) {
    for (let dx = 0; dx < width; dx += 1) {
      this.blend(x + dx, y, color, alpha);
      this.blend(x + dx, y + height - 1, color, alpha);
    }
    for (let dy = 0; dy < height; dy += 1) {
      this.blend(x, y + dy, color, alpha);
      this.blend(x + width - 1, y + dy, color, alpha);
    }
  }

  textWidth(text, scale, tracking = 1) {
    if (text.length === 0) {
      return 0;
    }
    return text.length * (GLYPH_WIDTH * scale + tracking) - tracking;
  }

  text(x, y, value, scale, color, tracking = 1) {
    let cursor = x;
    for (const character of value) {
      const rows = glyphRows(character);
      for (let row = 0; row < GLYPH_HEIGHT; row += 1) {
        for (let column = 0; column < GLYPH_WIDTH; column += 1) {
          if (rows[row][column] !== "#") {
            continue;
          }
          this.fillRect(
            cursor + column * scale,
            y + row * scale,
            scale,
            scale,
            color
          );
        }
      }
      cursor += GLYPH_WIDTH * scale + tracking;
    }
    return cursor;
  }

  textCentered(y, value, scale, color, tracking = 1) {
    const x = Math.round(
      (this.width - this.textWidth(value, scale, tracking)) / 2
    );
    return this.text(x, y, value, scale, color, tracking);
  }

  logoMark(centerX, centerY, size) {
    const left = Math.round(centerX - size / 2);
    const top = Math.round(centerY - size / 2);
    this.fillRect(left, top, size, size, [0x11, 0x22, 0x1a], 1);
    this.strokeRect(left, top, size, size, ACCENT, 1);
    this.fillRect(left + 1, top + 1, size - 2, 1, ACCENT, 0.35);

    const inner = size - 8;
    const barHeight = Math.max(2, Math.floor(inner / 8));
    const gap = Math.max(2, Math.floor(inner / 10));
    const widths = [1, 0.72, 0.46];
    const blockHeight = widths.length * barHeight + (widths.length - 1) * gap;
    const startY = Math.round(centerY - blockHeight / 2);
    const startX = left + 4;
    widths.forEach((ratio, index) => {
      this.fillRect(
        startX,
        startY + index * (barHeight + gap),
        Math.round(inner * ratio),
        barHeight,
        ACCENT
      );
    });
  }

  toBmp() {
    const { width, height, pixels } = this;
    const rowSize = Math.floor((24 * width + 31) / 32) * 4;
    const rowBytes = 3 * width;
    const padding = rowSize - rowBytes;
    const dataSize = rowSize * height;
    const headerSize = 14;
    const infoSize = 40;
    const buffer = Buffer.alloc(headerSize + infoSize + dataSize);

    buffer.write("BM", 0, "ascii");
    buffer.writeUInt32LE(buffer.length, 2);
    buffer.writeUInt32LE(headerSize + infoSize, 10);
    buffer.writeUInt32LE(40, 14);
    buffer.writeInt32LE(width, 18);
    buffer.writeInt32LE(height, 22);
    buffer.writeUInt16LE(1, 26);
    buffer.writeUInt16LE(24, 28);
    buffer.writeUInt32LE(0, 30);
    buffer.writeUInt32LE(dataSize, 34);
    buffer.writeInt32LE(2835, 38);
    buffer.writeInt32LE(2835, 42);

    let cursor = headerSize + infoSize;
    for (let y = height - 1; y >= 0; y -= 1) {
      const row = pixels.subarray(y * width * 3, (y + 1) * width * 3);
      buffer.set(row, cursor);
      cursor += rowBytes;
      if (padding > 0) {
        cursor += padding;
      }
    }

    return buffer;
  }
}

function buildWelcome() {
  const canvas = new Canvas(164, 314);
  canvas.fillVerticalGradient(BRAND_BG, [0x10, 0x10, 0x17]);

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const distance =
        Math.sqrt((x - canvas.width / 2) ** 2 + (y - 92) ** 2) / 150;
      canvas.blend(x, y, ACCENT, Math.max(0, 0.16 * (1 - distance)));
    }
  }

  canvas.strokeRect(0, 0, canvas.width, canvas.height, ACCENT, 0.55);
  canvas.logoMark(canvas.width / 2, 96, 84);

  canvas.textCentered(150, "ZAPRET", 3, [0xff, 0xff, 0xff], 2);
  canvas.textCentered(176, "MANAGER", 3, ACCENT, 2);

  canvas.fillRect(24, 212, canvas.width - 48, 1, ACCENT, 0.35);

  const features = ["DISCORD", "YOUTUBE", "OUTLAST TRIALS"];
  let featureY = 226;
  for (const feature of features) {
    canvas.text(18, featureY, feature, 1, MUTED, 1);
    featureY += 12;
  }

  canvas.fillRect(18, 276, canvas.width - 36, 1, [0x2a, 0x2a, 0x36], 1);
  canvas.text(18, 284, "VERSION 1.0.2", 1, ACCENT, 1);
  canvas.text(18, 296, "WIN10+ X64", 1, MUTED, 1);

  return canvas;
}

function buildHeader() {
  const canvas = new Canvas(150, 57);
  canvas.fillHorizontalGradient(BRAND_BG, BRAND_BG_ALT);
  canvas.fillRect(0, 0, canvas.width, 1, ACCENT, 0.6);
  canvas.fillRect(
    0,
    canvas.height - 1,
    canvas.width,
    1,
    [0x00, 0xff, 0x88],
    0.15
  );

  canvas.logoMark(26, 28, 30);
  canvas.text(50, 14, "ZAPRET", 2, [0xff, 0xff, 0xff], 1);
  canvas.text(50, 32, "MANAGER", 2, ACCENT, 1);
  canvas.text(50, 47, "DPI BYPASS 1.0.2", 1, MUTED, 1);

  return canvas;
}

function verifyInstallerIcon() {
  const iconPath = resolve(installerDir, "..", "icons", "icon.ico");
  const buffer = readFileSync(iconPath);
  const count = buffer.readUInt16LE(4);
  const sizes = [];
  for (let index = 0; index < count; index += 1) {
    const offset = 6 + index * 16;
    const width = buffer[offset] === 0 ? 256 : buffer[offset];
    const height = buffer[offset + 1] === 0 ? 256 : buffer[offset + 1];
    sizes.push(`${width}x${height}`);
  }
  return { path: iconPath, sizes };
}

mkdirSync(bitmapsDir, { recursive: true });

const targets = [
  { name: "welcome.bmp", canvas: buildWelcome() },
  { name: "header.bmp", canvas: buildHeader() },
];

for (const target of targets) {
  const buffer = target.canvas.toBmp();
  const path = resolve(bitmapsDir, target.name);
  writeFileSync(path, buffer);
  process.stdout.write(
    `${target.name}: ${target.canvas.width}x${target.canvas.height} 24-bit, ${buffer.length} bytes -> ${path}\n`
  );
}

const icon = verifyInstallerIcon();
process.stdout.write(
  `installer icon: ${icon.sizes.join(", ")} (${icon.path})\n`
);
