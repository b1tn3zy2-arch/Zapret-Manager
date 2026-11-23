import { expect, test, type Page } from "@playwright/test";

import { mockTauri } from "./mock-tauri";

async function bootstrap(page: Page): Promise<string[]> {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });

  await mockTauri(page);

  return errors;
}

async function openGames(page: Page): Promise<void> {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name: "Игры", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Игры" })).toBeVisible();
}

test.describe("Страница игр", () => {
  test("показывает найденные игры в сетке", async ({ page }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    await expect(page.getByTestId("installed-games-grid")).toBeVisible();
    await expect(page.getByText("Portal 2")).toBeVisible();
    await expect(page.getByText("Indie Game")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("показывает кнопку запуска при наведении и запускает игру с обходом", async ({
    page,
  }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    const card = page.locator("[data-game-id='steam-portal']");

    await card.hover();
    await card.getByRole("button", { name: "Запустить игру" }).click();

    // первый запуск: выбор способа запуска
    await expect(page.getByText("Как запустить игру?")).toBeVisible();
    await page.getByRole("button", { name: "С обходом" }).click();

    await expect(
      page.getByText("Обход активен, игра запускается")
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("запускает без обхода и позволяет сменить способ на карточке", async ({
    page,
  }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    const card = page.locator("[data-game-id='steam-portal']");

    await card.hover();
    await card.getByRole("button", { name: "Запустить игру" }).click();
    await page.getByRole("button", { name: "Без обхода" }).click();

    await expect(page.getByText("Игра запускается без обхода")).toBeVisible();

    // выбранный способ не приговор: кнопка на карточке заново
    // открывает диалог выбора
    await card.hover();
    await card.getByRole("button", { name: "Изменить способ запуска" }).click();
    await expect(page.getByText("Как запустить игру?")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("предупреждает об античите в диалоге первого запуска", async ({
    page,
  }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    const card = page.locator("[data-game-id='custom-indie']");

    await card.hover();
    await card.getByRole("button", { name: "Запустить игру" }).click();
    await expect(page.getByText("Как запустить игру?")).toBeVisible();
    await expect(page.getByText(/BattlEye/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("настройки обхода свёрнуты и открываются по кнопке", async ({
    page,
  }) => {
    const errors = await bootstrap(page);

    await openGames(page);
    await page
      .getByRole("button", { name: "Настройки обхода: домены и IP" })
      .click();
    await expect(page.getByText("Outlast Trials").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("пересканирует игры по кнопке", async ({ page }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    const before = await page.evaluate(() => {
      const log =
        (
          window as unknown as {
            __MOCK_INVOKE_LOG__?: { command: string; args?: unknown }[];
          }
        ).__MOCK_INVOKE_LOG__ ?? [];

      return log.filter((item) => item.command === "scan_installed_games")
        .length;
    });

    await page.getByRole("button", { name: "Пересканировать" }).click();

    // повторный скан раньше был недостижим без удаления папки: новая
    // установленная игра не появлялась до перезапуска приложения
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const log =
            (
              window as unknown as {
                __MOCK_INVOKE_LOG__?: { command: string; args?: unknown }[];
              }
            ).__MOCK_INVOKE_LOG__ ?? [];

          return log.filter((item) => item.command === "scan_installed_games")
            .length;
        })
      )
      .toBeGreaterThan(before);

    expect(errors).toEqual([]);
  });

  test("открывает диалог ручного добавления", async ({ page }) => {
    const errors = await bootstrap(page);

    await openGames(page);
    await page.getByRole("button", { name: "Добавить игру" }).click();
    await expect(
      page.getByRole("dialog", { name: "Добавить игру вручную" })
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
});
