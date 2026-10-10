import { expect, test, type Page } from "@playwright/test";

import { mockTauri, MOCK_FOLDER } from "./mock-tauri";
import { GREETING, modeSwitcher } from "./helpers";

async function bootstrap(
  page: Page,
  options?: Parameters<typeof mockTauri>[1]
) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });

  await mockTauri(page, options);

  return errors;
}

function sidebar(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name, exact: true });
}

test.describe("Навигация и загрузка", () => {
  test("стартует на Dashboard без ошибок в консоли", async ({ page }) => {
    const errors = await bootstrap(page);

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: GREETING }).first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("открывает все семь разделов", async ({ page }) => {
    const errors = await bootstrap(page);
    await page.goto("/");

    const sections = [
      { name: "Стратегии", heading: /Стратегии/i },
      { name: "Игры", heading: /^Игры$/ },
      { name: "Монитор", heading: /Монитор/i },
      { name: "Логи", heading: /Логи/i },
      { name: "Настройки", heading: /Настройки/i },
      { name: "О приложении", heading: /Zapret Manager/i },
      { name: "Главная", heading: GREETING },
    ];

    for (const section of sections) {
      await sidebar(page, section.name).click();
      await expect(
        page.getByRole("heading", { name: section.heading }).first()
      ).toBeVisible();
    }

    expect(errors).toEqual([]);
  });
});

test.describe("Режимы дашборда", () => {
  test("стартует в режиме обхода и переключается в VPN", async ({ page }) => {
    const errors = await bootstrap(page);
    await page.goto("/");

    await expect(
      modeSwitcher(page).getByRole("radio", { name: "Переключить на обход" })
    ).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Пинг до сервисов").first()).toBeVisible();

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();

    await expect(
      modeSwitcher(page).getByRole("radio", { name: "Переключить на VPN" })
    ).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Нажмите для подключения")).toBeVisible();
    await expect(page.getByRole("button", { name: "Добавить" })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("возвращается в режим обхода", async ({ page }) => {
    const errors = await bootstrap(page);
    await page.goto("/");

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();
    await expect(page.getByText("Нажмите для подключения")).toBeVisible();

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на обход" })
      .click();

    await expect(page.getByText("Пинг до сервисов").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("показывает список серверов в режиме VPN", async ({ page }) => {
    const errors = await bootstrap(page);
    await page.goto("/");

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();

    await expect(page.getByText("СЕРВЕРЫ")).toBeVisible();
    await expect(page.getByText("e2e")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("VPN-режим не добавляет пункт в Sidebar", async ({ page }) => {
    await bootstrap(page);
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Основная навигация" });

    await expect(nav.getByRole("button")).toHaveCount(7);
    await expect(
      nav.getByRole("button", { name: "VPN", exact: true })
    ).toHaveCount(0);
  });
});

test.describe("Стратегии", () => {
  test("показывает коллекцию карт", async ({ page }) => {
    const errors = await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");

    await sidebar(page, "Стратегии").click();
    await expect(page.getByText("22 стратегии").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("переключает карточки и открывает оборотную сторону", async ({
    page,
  }) => {
    const errors = await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");
    await sidebar(page, "Стратегии").click();

    const card = page
      .getByRole("button", { name: /Подробнее о стратегии/ })
      .first();
    await card.click();

    await expect(
      page.getByRole("button", { name: /Запустить/ }).first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe("Обновления", () => {
  test("показывает модалку релиза автоматически и по кнопке «Подробности»", async ({
    page,
  }) => {
    const errors = await bootstrap(page, { available: true });
    await page.goto("/");

    const notice = page.getByRole("heading", {
      name: "Доступно обновление стратегий",
    });
    await expect(notice).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(notice).toBeHidden();

    await sidebar(page, "Настройки").click();
    await page.getByRole("button", { name: "Обновления", exact: true }).click();

    const details = page.getByRole("button", { name: "Подробности" });
    await expect(details).toBeEnabled();
    await details.click();
    await expect(notice).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(notice).toBeHidden();

    expect(errors).toEqual([]);
  });
});
