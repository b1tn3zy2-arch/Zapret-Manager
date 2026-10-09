import { expect, test } from "@playwright/test";

import { bootstrap, sidebar, GREETING } from "./helpers";

const VIEWPORTS = [
  { name: "минимальное окно", width: 800, height: 600, sidebarCollapsed: true },
  { name: "ноутбук", width: 1280, height: 800, sidebarCollapsed: false },
  { name: "десктоп", width: 1920, height: 1080, sidebarCollapsed: false },
  { name: "широкий экран", width: 2560, height: 1440, sidebarCollapsed: false },
  { name: "мобильный", width: 420, height: 900, sidebarCollapsed: true },
] as const;

test.describe("Адаптивность", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name}: ${viewport.width}×${viewport.height}`, async ({
      page,
    }) => {
      const collector = await bootstrap(page);

      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");

      await expect(
        page.getByRole("heading", { name: GREETING }).first()
      ).toBeVisible();

      await sidebar(page, "Стратегии").click();
      await expect(
        page.getByRole("heading", { name: /Стратегии/ }).first()
      ).toBeVisible();

      await sidebar(page, "Логи").click();
      await expect(
        page.getByRole("heading", { name: /Логи/ }).first()
      ).toBeVisible();

      const nav = page.getByRole("navigation", { name: "Основная навигация" });
      const navBox = await nav.boundingBox();

      expect(navBox).not.toBeNull();

      if (viewport.sidebarCollapsed) {
        expect(navBox?.width ?? 999).toBeLessThan(120);
      } else {
        expect(navBox?.width ?? 0).toBeGreaterThan(120);
      }

      expect(collector.errors).toEqual([]);
    });
  }

  test("на узком экране появляется кнопка меню", async ({ page }) => {
    await bootstrap(page);
    await page.setViewportSize({ width: 420, height: 900 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Развернуть меню" });

    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(
      page.getByRole("button", { name: "Свернуть меню" })
    ).toBeVisible();
  });
});
