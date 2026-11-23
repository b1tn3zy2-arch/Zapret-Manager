import { expect, test } from "@playwright/test";

import { mockTauri } from "./mock-tauri";

test.describe("Карточки стратегий: запуск с обратной стороны", () => {
  test("кнопка Запустить на карте запускает стратегию и пишет лог", async ({
    page,
  }) => {
    await mockTauri(page);
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Основная навигация" })
      .getByRole("button", { name: "Стратегии", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Стратегии" })
    ).toBeVisible();

    const firstCard = page.locator(".strategy-card").first();

    // Кнопка «подробнее» открывает карту: запуск живут на обратной
    // стороне, лицевая остаётся описанием.
    await firstCard
      .getByRole("button", { name: /^Подробнее о стратегии/ })
      .first()
      .click();

    await firstCard
      .getByRole("button", { name: "Запустить", exact: true })
      .click();

    // Состояние запуска окон на лицевой стороне: оверлей с кнопкой
    // остановки рисуется поверх картинки.
    await expect(firstCard).toHaveAttribute("data-running", "true");
    await expect(
      firstCard.getByRole("button", { name: "Остановить стратегию" })
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: "Основная навигация" })
      .getByRole("button", { name: "Логи", exact: true })
      .click();
    await expect(page.getByText(/Запуск стратегии/).first()).toBeVisible();
  });
});
