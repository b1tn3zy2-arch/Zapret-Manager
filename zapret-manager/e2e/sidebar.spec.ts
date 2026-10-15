import { expect, test } from "@playwright/test";

import { bootstrap, sidebar } from "./helpers";

const ACTIVE_INDICATOR = "span.bg-accent-primary";

test.describe("Панель слева", () => {
  test("активный индикатор центрирован и не использует CSS-перенос", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await page.goto("/");

    const indicator = page.locator(ACTIVE_INDICATOR).first();
    await expect(indicator).toBeVisible();

    // Центрирование через раскладку: CSS-свойство translate вместе с
    // transform от framer давало двойной сдвиг, и полоска прыгала между
    // пунктами при переключении страниц.
    const translate = await indicator.evaluate(
      (node) => getComputedStyle(node).translate
    );
    expect(translate).toBe("none");

    const [item, mark] = await Promise.all([
      page
        .getByRole("navigation", { name: "Основная навигация" })
        .getByRole("button", { name: "Главная" })
        .boundingBox(),
      indicator.boundingBox(),
    ]);

    expect(item).not.toBeNull();
    expect(mark).not.toBeNull();

    const itemCenter = item!.y + item!.height / 2;
    const markCenter = mark!.y + mark!.height / 2;
    expect(Math.abs(itemCenter - markCenter)).toBeLessThanOrEqual(1);

    expect(errors).toEqual([]);
  });

  test("индикатор не использует CSS-перенос и во время переключения", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await page.goto("/");

    await sidebar(page, "Монитор").click();

    // проверка сразу после нажатия: полоска уже летит к новому пункту
    const translate = await page
      .locator(ACTIVE_INDICATOR)
      .first()
      .evaluate((node) => getComputedStyle(node).translate);

    expect(translate).toBe("none");

    await expect(
      page.getByRole("heading", { name: "Монитор" }).first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });
});
