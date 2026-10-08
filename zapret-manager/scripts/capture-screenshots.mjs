import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { mockTauri, MOCK_FOLDER } from "../e2e/mock-tauri.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const outputDir = join(root, "docs", "screenshots");
const url = process.env.SCREENSHOTS_URL ?? "http://localhost:1420/";

const SHOTS = [
  { name: "dashboard", nav: null },
  { name: "strategies", nav: "Стратегии" },
  { name: "logs", nav: "Логи" },
  { name: "settings", nav: "Настройки" },
];

mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});

await mockTauri(page, { strategiesFolder: MOCK_FOLDER });
await page.goto(url);
await page.waitForSelector("nav[aria-label='Основная навигация']");
await page.waitForTimeout(2500);

for (const shot of SHOTS) {
  if (shot.nav !== null) {
    await page
      .locator("nav[aria-label='Основная навигация']")
      .getByRole("button", { name: shot.nav, exact: true })
      .click();
    await page.waitForTimeout(1800);
  }

  const target = join(outputDir, `${shot.name}.png`);
  await page.screenshot({ path: target });
  console.log(`saved: ${target}`);
}

await browser.close();
