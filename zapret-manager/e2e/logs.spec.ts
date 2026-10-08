import { expect, test, type Page } from "@playwright/test";

import { bootstrap, sidebar } from "./helpers";
import { MOCK_FOLDER } from "./mock-tauri";

async function openLogsWithEntries(page: Page): Promise<void> {
  await sidebar(page, "Стратегии").click();
  await page
    .getByRole("button", { name: "Подробнее о стратегии" })
    .first()
    .click();
  await page
    .getByRole("button", { name: /^Запустить/ })
    .first()
    .click();
  await sidebar(page, "Логи").click();
}

test.describe("Логи", () => {
  test("показывает панель фильтров и счётчики", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");
    await sidebar(page, "Логи").click();

    await expect(page.getByRole("heading", { name: "Логи" })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Поиск по тексту лога" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Очистить", exact: true }).first()
    ).toBeVisible();
  });

  test("показывает записи запущенной стратегии", async ({ page }) => {
    const collector = await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");
    await openLogsWithEntries(page);

    await expect(page.getByText("Запуск стратегии").first()).toBeVisible();
    await expect(
      page.getByText("zapret поднят на порту 7911").first()
    ).toBeVisible();

    expect(collector.errors).toEqual([]);
  });

  test("фильтрует логи поиском и сбрасывает фильтр", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");
    await openLogsWithEntries(page);

    const search = page.getByRole("textbox", { name: "Поиск по тексту лога" });

    await search.fill("Инъекция");
    await expect(page.getByText("Инъекция недоступна").first()).toBeVisible();
    await expect(page.getByText("Запуск стратегии")).toBeHidden();

    await search.fill("ничего не найдётся");
    await expect(
      page.getByRole("heading", { name: "Ничего не найдено" })
    ).toBeVisible();

    await search.fill("");
    await expect(page.getByText("Запуск стратегии").first()).toBeVisible();
  });

  test("очищает логи через диалог подтверждения", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");
    await openLogsWithEntries(page);

    await page
      .getByRole("button", { name: "Очистить", exact: true })
      .first()
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Отмена" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("Запуск стратегии").first()).toBeVisible();

    await page
      .getByRole("button", { name: "Очистить", exact: true })
      .first()
      .click();
    await dialog.getByRole("button", { name: "Очистить" }).click();

    await expect(
      page.getByRole("heading", { name: "Логи пусты" })
    ).toBeVisible();
  });
});
