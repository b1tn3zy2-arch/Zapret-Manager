import { expect, test } from "@playwright/test";

import { bootstrap, modeSwitcher } from "./helpers";

test.describe("Главная: версия и переключение режима", () => {
  test("версия приложения стоит внизу панели слева и выровнена по левому краю", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await page.goto("/");

    const sidebar = page.getByRole("complementary");
    await expect(sidebar).toBeVisible();

    const version = sidebar.getByText("0.1.0", { exact: true });
    await expect(version).toBeVisible();

    // версия — последний элемент панели, то есть именно внизу, а не в шапке
    const isLastChild = await version.evaluate((node) => {
      const panel = node.closest("aside");

      return panel?.lastElementChild?.contains(node) ?? false;
    });
    expect(isLastChild).toBe(true);

    // и стоит ниже списка навигации
    const [navBox, versionBox] = await Promise.all([
      page
        .getByRole("navigation", { name: "Основная навигация" })
        .boundingBox(),
      version.boundingBox(),
    ]);
    expect(navBox).not.toBeNull();
    expect(versionBox).not.toBeNull();
    expect(versionBox!.y).toBeGreaterThanOrEqual(
      navBox!.y + navBox!.height - 1
    );

    // выровнена по левому краю, а не по центру
    const align = await version.evaluate(
      (node) => getComputedStyle(node).textAlign
    );
    expect(["left", "start"]).toContain(align);

    // подвал страницы удалён, чтобы версия не дублировалась
    await expect(page.locator(".dashboard-footer")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("переключение режима не проигрывает каскад появления заново", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await page.goto("/");

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();
    await expect(page.getByText("Нажмите для подключения")).toBeVisible();

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на обход" })
      .click();
    await expect(page.getByText("Пинг до сервисов").first()).toBeVisible();

    // каскад проигрывается только при первом открытии страницы, поэтому
    // блоки режима обхода обязаны сразу быть в конечном состоянии:
    // без сдвига и без задержек, иначе панель дёргается при переключении
    const items = page.locator(".dashboard-layout > *");
    const count = await items.count();
    expect(count).toBeGreaterThan(1);

    for (let index = 0; index < count; index += 1) {
      const style = await items.nth(index).evaluate((node) => {
        const computed = getComputedStyle(node);

        return {
          opacity: computed.opacity,
          transform: computed.transform,
          delay: computed.transitionDelay,
        };
      });

      expect(Number(style.opacity)).toBeGreaterThan(0.99);
      expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(style.transform);
      expect(style.delay).toMatch(/^0s(, 0s)*$/);
    }

    expect(errors).toEqual([]);
  });
});
