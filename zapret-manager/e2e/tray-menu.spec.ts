import { expect, test } from "@playwright/test";

import { bootstrap } from "./helpers";

test.describe("Меню трея", () => {
  test("рендерит компактное меню со всеми пунктами", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/?view=tray");

    await expect(
      page.getByText("Zapret", { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Запустить последнюю стратегию" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Остановить" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Главная" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Стратегии" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Логи" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Настройки" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Проверить обновления" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Выход" })).toBeVisible();

    expect(collector.errors).toEqual([]);
  });

  test("клик по пункту не роняет окно меню", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/?view=tray");

    await page.getByRole("button", { name: "Стратегии" }).click();

    await expect(
      page.getByText("Zapret", { exact: true }).first()
    ).toBeVisible();

    expect(collector.errors).toEqual([]);
  });
});
