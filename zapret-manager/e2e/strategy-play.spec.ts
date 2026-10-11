import { expect, test } from "@playwright/test";

import { mockTauri } from "./mock-tauri";

test.describe("Карточки стратегий: запуск с hover-оверлея", () => {
  test("клик по Play запускает стратегию и не переворачивает карточку", async ({
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

    await firstCard.hover();
    const play = firstCard.getByRole("button", { name: /^Запустить / }).first();

    await expect(play).toBeVisible();
    await play.click();

    await page.waitForTimeout(400);

    const diag = await page.evaluate(() => {
      const card = document.querySelector(".strategy-card");
      const rotator = card?.firstElementChild
        ?.firstElementChild as HTMLElement | null;
      const transform =
        rotator === null ? "none" : getComputedStyle(rotator).transform;
      const back = card?.querySelector("button[aria-label='Закрыть карту']");
      const backBox = back?.getBoundingClientRect();

      return {
        transform: transform.slice(0, 120),
        backVisible:
          backBox === undefined
            ? false
            : backBox.width > 0 && backBox.height > 0,
        flipped180:
          transform.includes("-1") || transform.includes("matrix3d(-"),
      };
    });

    expect(diag.flipped180).toBe(false);

    await page
      .getByRole("navigation", { name: "Основная навигация" })
      .getByRole("button", { name: "Логи", exact: true })
      .click();
    await expect(page.getByText(/Запуск стратегии/).first()).toBeVisible();
  });
});
