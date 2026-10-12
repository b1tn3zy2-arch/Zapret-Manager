import { expect, test } from "@playwright/test";

import { bootstrap, GREETING } from "./helpers";

test.describe("Первый запуск", () => {
  test("открывает Dashboard и рисует сводку", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: GREETING }).first()
    ).toBeVisible();
    await expect(page.getByText("Провайдер")).toBeVisible();
    await expect(page.getByText("203.0.113.10")).toBeVisible();

    expect(collector.errors).toEqual([]);
  });

  test("показывает бейдж подключения в заголовке", async ({ page }) => {
    await bootstrap(page);
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: /Подключить обход/ })
    ).toBeVisible();
  });

  test("ошибок в консоли нет после загрузки всех разделов", async ({
    page,
  }) => {
    const collector = await bootstrap(page);
    await page.goto("/");

    for (const name of [
      "Стратегии",
      "Монитор",
      "Логи",
      "Настройки",
      "О приложении",
    ]) {
      await page
        .getByRole("navigation", { name: "Основная навигация" })
        .getByRole("button", { name, exact: true })
        .click();
      await expect(page.getByRole("heading").first()).toBeVisible();
    }

    expect(collector.errors).toEqual([]);
  });

  test("первый запуск показывает модалку инициализации", async ({ page }) => {
    await bootstrap(page, { firstRun: true });
    await page.goto("/");

    const dialog = page.getByRole("dialog").first();
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Добро пожаловать в Zapret" })
    ).toBeVisible();

    await dialog.getByRole("button", { name: "Начать работу" }).click();
    await expect(dialog).toBeHidden();
  });
});
