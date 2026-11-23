import { expect, test } from "@playwright/test";

import {
  bootstrap,
  settingsNav,
  sidebar,
  waitForAnimationsSettled,
} from "./helpers";

/**
 * Запуск стратегии обязан менять интерфейс сразу: пользователь
 * жаловался, что состояние «работает» появлялось с задержкой или
 * не появлялось вовсе. Проверяем это явно, а не «на глаз».
 */
test.describe("Состояние запущенной стратегии", () => {
  test("появляется сразу после запуска стратегии", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: "C:\\zapret-e2e\\strategies" });
    await page.goto("/");
    await sidebar(page, "Стратегии").click();
    await waitForAnimationsSettled(page);

    const firstCard = page.locator(".strategy-card").first();

    await firstCard
      .getByRole("button", { name: /^Подробнее о стратегии/ })
      .first()
      .click();
    await waitForAnimationsSettled(page);

    await firstCard
      .getByRole("button", { name: "Запустить", exact: true })
      .click();

    // Без ожиданий: атрибут и оверлей обязаны быть в первом же
    // кадре после ответа запуска.
    await expect(firstCard).toHaveAttribute("data-running", "true");
    await expect(
      firstCard.getByRole("button", { name: "Остановить стратегию" })
    ).toBeVisible();
  });

  test("появляется даже при выключенных анимациях", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: "C:\\zapret-e2e\\strategies" });
    await page.goto("/");

    // выключаем анимации в настройках
    await sidebar(page, "Настройки").click();
    await settingsNav(page)
      .getByRole("button", { name: "Внешний вид" })
      .click();
    await page.getByRole("switch", { name: "Анимации" }).click();
    await sidebar(page, "Стратегии").click();
    await waitForAnimationsSettled(page);

    const firstCard = page.locator(".strategy-card").first();

    await firstCard
      .getByRole("button", { name: /^Подробнее о стратегии/ })
      .first()
      .click();
    await firstCard
      .getByRole("button", { name: "Запустить", exact: true })
      .click();

    // Состояние не зависит от анимаций: это признак работающего
    // обхода, а не украшение.
    await expect(firstCard).toHaveAttribute("data-running", "true");
    await expect(
      firstCard.getByRole("button", { name: "Остановить стратегию" })
    ).toBeVisible();
  });
});
