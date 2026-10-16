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

  test("переключает режим обхода и VPN без потери содержимого", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await page.goto("/");

    await expect(page.getByText("Пинг до сервисов").first()).toBeVisible();

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();
    await expect(page.getByText("Нажмите для подключения")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Добавить ссылку" }).first()
    ).toBeVisible();

    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на обход" })
      .click();
    await expect(page.getByText("Пинг до сервисов").first()).toBeVisible();

    // версия внизу панели не должна пропадать при смене режима
    await expect(
      page.getByRole("complementary").getByText("0.1.0", { exact: true })
    ).toBeVisible();

    expect(errors).toEqual([]);
  });
});
