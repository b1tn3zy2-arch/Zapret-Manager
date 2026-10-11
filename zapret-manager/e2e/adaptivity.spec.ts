import { expect, test, type Page } from "@playwright/test";

import { mockTauri } from "./mock-tauri";

const PAGES: [string, string][] = [
  ["Главная", "dashboard"],
  ["Стратегии", "strategies"],
  ["Настройки", "settings"],
  ["Монитор", "monitor"],
  ["Логи", "logs"],
  ["Игры", "games"],
];

function navButton(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name, exact: true });
}

test.describe("Адаптив", () => {
  test("800x600: нет горизонтального переполнения на всех страницах", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await mockTauri(page);
    await page.goto("/");

    for (const [name, slug] of PAGES) {
      await navButton(page, name).click();
      await page.waitForTimeout(500);

      const sizes = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        body: document.body.scrollWidth,
      }));

      expect(sizes.content, `переполнение на ${slug}`).toBeLessThanOrEqual(
        sizes.viewport + 2
      );
      expect(sizes.body, `переполнение body на ${slug}`).toBeLessThanOrEqual(
        sizes.viewport + 2
      );
    }
  });

  test("800x600: сетка игр даёт минимум две колонки", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await mockTauri(page);
    await page.goto("/");
    await navButton(page, "Игры").click();

    const grid = page.getByTestId("installed-games-grid");

    await expect(grid).toBeVisible();

    const columns = await grid.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length
    );

    expect(columns).toBeGreaterThanOrEqual(2);
  });

  test("2560x1440: дашборд раскладывает панели в две колонки", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await mockTauri(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const columns = await page
      .locator(".dashboard-layout")
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns);

    expect(columns.split(" ").length).toBeGreaterThanOrEqual(2);
  });
});
