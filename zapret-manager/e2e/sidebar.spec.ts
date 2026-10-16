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

  test("индикатор один на весь список и едет transform-переходом", async ({
    page,
  }) => {
    // Анимация общего элемента (layoutId) рисовала два элемента и прогоняла
    // их через проекцию раскладки: полоска перелетала нужный пункт и
    // возвращалась назад. Теперь элемент один, а позиция задаётся одним
    // transform с обычным CSS-переходом.
    const { errors } = await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Монитор").click();

    const indicator = page.getByTestId("sidebar-active-indicator");

    await expect(indicator).toHaveCount(1);
    await expect(page.locator(ACTIVE_INDICATOR)).toHaveCount(1);

    const style = await indicator.evaluate((node) => {
      const computed = getComputedStyle(node);

      return {
        translate: computed.translate,
        position: computed.position,
        transitionProperty: computed.transitionProperty,
        transitionDuration: computed.transitionDuration,
      };
    });

    expect(style.position).toBe("absolute");
    // transform двигает полоску, CSS-свойство translate не участвует:
    // вместе с transform они давали двойной сдвиг
    expect(style.translate).toBe("none");
    expect(style.transitionProperty).toContain("transform");
    expect(Number.parseFloat(style.transitionDuration)).toBeGreaterThan(0);

    // после перехода полоска точно совпадает с активным пунктом
    await expect
      .poll(async () => {
        const [mark, item] = await Promise.all([
          indicator.boundingBox(),
          sidebar(page, "Монитор").boundingBox(),
        ]);

        return Math.abs(
          (mark?.y ?? 0) +
            (mark?.height ?? 0) / 2 -
            ((item?.y ?? 0) + (item?.height ?? 0) / 2)
        );
      })
      .toBeLessThan(1);

    expect(errors).toEqual([]);
  });
});
