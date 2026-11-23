/**
 * Генерация иконок приложения и трея.
 *
 * Иконки рисуются вектором и растрируются браузером: так один и тот же
 * щит выглядит одинаково на всех размерах, а на 16 пикселях не
 * превращается в кашу из тонких линий. Фон прозрачный — иконка одинаково
 * читается и на светлой, и на тёмной панели задач.
 *
 * Запуск: npm run icons:build
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "src-tauri", "icons");
const trayDir = join(iconsDir, "tray");
const sourcePng = join(iconsDir, "icon-source.png");

const VIEWBOX = 1024;

/**
 * Иконка приложения и трея: щит.
 *
 * Обводка задаётся цветом состояния, поворот — для кадров
 * анимации подключения.
 */
function shieldSvg(
  color,
  { rotation = 0, padding = 0.06, pixels = VIEWBOX } = {}
) {
  const scale = 1 - padding * 2;
  const offset = VIEWBOX * padding;

  // Размер в пикселях обязателен: при viewBox 1024 и вьюпорте 16x16
  // рисунок выходил за границы кадра, и иконка трея получалась пустой.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <g transform="rotate(${rotation} ${VIEWBOX / 2} ${VIEWBOX / 2})">
      <path
        d="M512 96 L832 208 V448 C832 624 704 768 512 856 C320 768 192 624 192 448 V208 Z"
        fill="none"
        stroke="${color}"
        stroke-width="56"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </g>
  </g>
</svg>`;
}

async function render(context, markup, size, path) {
  const page = await context.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent">${markup}</body></html>`,
    { waitUntil: "load" }
  );
  await page.screenshot({ path, omitBackground: true });
  await page.close();
}

async function main() {
  rmSync(trayDir, { recursive: true, force: true });
  mkdirSync(trayDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });

  // источник для `tauri icon`: прозрачный фон, никакой размытой подложки
  await render(
    context,
    shieldSvg("#00e676", { pixels: VIEWBOX }),
    VIEWBOX,
    sourcePng
  );

  const states = [
    { stem: "idle", color: "#8a8f98" },
    { stem: "connected", color: "#00e676" },
    { stem: "vpn", color: "#29b6f6" },
    { stem: "error", color: "#f4511e" },
  ];

  for (const size of [16, 32]) {
    for (const state of states) {
      await render(
        context,
        shieldSvg(state.color, {
          padding: size === 16 ? 0.04 : 0.06,
          pixels: size,
        }),
        size,
        join(trayDir, `${state.stem}-${size}-1.png`)
      );
    }
  }

  // три кадра подключения: щит доворачивается по кругу
  for (const size of [16, 32]) {
    for (const frame of [1, 2, 3]) {
      await render(
        context,
        shieldSvg("#ffb300", {
          rotation: frame * 30,
          padding: size === 16 ? 0.04 : 0.06,
          pixels: size,
        }),
        size,
        join(trayDir, `connecting-${size}-${frame}.png`)
      );
    }
  }

  await browser.close();
  writeFileSync(
    join(iconsDir, "SOURCE.txt"),
    "Иконки собраны скриптом scripts/build-icons.mjs: npm run icons:build\n",
    "utf8"
  );

  process.stdout.write(`источник: ${sourcePng}\nиконок трея: ${trayDir}\n`);
}

await main();
