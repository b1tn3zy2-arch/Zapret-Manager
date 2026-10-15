import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { bootstrap, sidebar } from "./helpers";

/** Значение счётчика: карточка с подписью содержит число и подпись. */
async function counter(page: Page, label: string): Promise<string> {
  const card = page.getByText(label, { exact: true }).locator("..");
  const text = await card.innerText();

  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line !== label) ?? ""
  );
}

test.describe("Монитор", () => {
  test("показывает реальные метрики из событий сети", async ({ page }) => {
    const { errors } = await bootstrap(page, { networkStats: true });
    await page.goto("/");

    await sidebar(page, "Монитор").click();

    // Счётчики обязаны показывать данные из событий сети, а не нули. Раньше
    // пружина анимации брала стартовое число и больше не реагировала на
    // обновления: графики рисовались по событиям, а метрики висели в нуле.
    await expect
      .poll(() => counter(page, "Загружено всего"), { timeout: 5000 })
      .toBe("5 МБ");
    await expect
      .poll(() => counter(page, "Отдано всего"), { timeout: 5000 })
      .toBe("1 МБ");
    await expect
      .poll(() => counter(page, "Пакетов"), { timeout: 5000 })
      .toBe("5.9 тыс.");
    await expect
      .poll(() => counter(page, "Соединений"), { timeout: 5000 })
      .toBe("42");

    expect(errors).toEqual([]);
  });
});
