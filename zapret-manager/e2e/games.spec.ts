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

  test("показывает кнопку запуска при наведении и запускает игру", async ({
    page,
  }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    const card = page.locator("[data-game-id='steam-portal']");

    await card.hover();
    await card.getByRole("button", { name: "Запустить игру" }).click();
    await expect(
      page.getByText("Обход активен, игра запускается")
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("спрашивает про античит перед запуском", async ({ page }) => {
    const errors = await bootstrap(page);

    await openGames(page);

    const card = page.locator("[data-game-id='custom-indie']");

    await card.hover();
    await card.getByRole("button", { name: "Запустить игру" }).click();
    await expect(page.getByText("Игра с античитом")).toBeVisible();
    await expect(page.getByText(/Обход может не работать/)).toBeVisible();
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
