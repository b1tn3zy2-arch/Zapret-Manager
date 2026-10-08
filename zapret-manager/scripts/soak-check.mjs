import { chromium } from "@playwright/test";

import { mockTauri, MOCK_FOLDER } from "../e2e/mock-tauri.ts";

const DURATION_MINUTES = Number(process.env.SOAK_MINUTES ?? "30");
const MAX_GROWTH_MB = Number(process.env.SOAK_MAX_GROWTH_MB ?? "20");
const URL = process.env.SOAK_URL ?? "http://localhost:1420/";
const LOG_PATH =
  process.env.SOAK_LOG ??
  "C:\\Users\\V1nskiy\\AppData\\Local\\Temp\\opencode\\soak.log";

const SECTIONS = ["Стратегии", "Монитор", "Логи", "Настройки", "О приложении"];

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  process.stdout.write(`${line}\n`);
}

async function heapMb(page) {
  const usage = await page.evaluate(() => {
    const memory = globalThis.performance.memory;

    return memory === undefined ? null : memory.usedJSHeapSize;
  });

  if (usage !== null) {
    return usage / (1024 * 1024);
  }

  return 0;
}

async function main() {
  log(
    `soak start: ${DURATION_MINUTES} min, budget ${MAX_GROWTH_MB} MB, url ${URL}`
  );

  const browser = await chromium.launch({
    args: ["--enable-precise-memory-info", "--js-flags=--expose-gc"],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const errors = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });

  await mockTauri(page, { strategiesFolder: MOCK_FOLDER });
  await page.goto(URL);
  await page.waitForSelector("nav[aria-label='Основная навигация']");

  const client = await page.context().newCDPSession(page);
  await client.send("HeapProfiler.enable");

  const readHeap = async () => {
    await client.send("HeapProfiler.collectGarbage");
    const usage = await client.send("Runtime.getHeapUsage");
    return usage.usedSize / (1024 * 1024);
  };

  const baseline = await readHeap();
  log(`baseline heap: ${baseline.toFixed(1)} MB`);

  const deadline = Date.now() + DURATION_MINUTES * 60 * 1000;
  let cycles = 0;
  let peak = baseline;

  while (Date.now() < deadline) {
    for (const name of SECTIONS) {
      await page
        .locator("nav[aria-label='Основная навигация']")
        .getByRole("button", { name, exact: true })
        .click();
      await page.waitForTimeout(1200);

      if (name === "Стратегии") {
        await page
          .getByRole("button", { name: "Подробнее о стратегии" })
          .first()
          .click();
        await page.waitForTimeout(400);
        await page
          .getByRole("button", { name: /^Запустить/ })
          .first()
          .click();
        await page.waitForTimeout(600);
      }
    }

    cycles += 1;
    const current = await readHeap();
    peak = Math.max(peak, current);

    log(
      `cycle ${cycles}: heap ${current.toFixed(1)} MB (growth ${(current - baseline).toFixed(1)} MB), console errors: ${errors.length}`
    );
  }

  await browser.close();

  const growth = peak - baseline;
  const verdict =
    errors.length === 0 && growth < MAX_GROWTH_MB ? "PASS" : "FAIL";

  log(
    `result: ${verdict}, cycles: ${cycles}, peak growth: ${growth.toFixed(1)} MB`
  );

  if (errors.length > 0) {
    log(`console errors:\n${errors.slice(0, 10).join("\n")}`);
  }

  process.stdout.write(
    `SOAK_VERDICT=${verdict} SOAK_GROWTH_MB=${growth.toFixed(1)} SOAK_CYCLES=${cycles}\n`
  );
  process.exitCode = verdict === "PASS" ? 0 : 1;
}

await main();
