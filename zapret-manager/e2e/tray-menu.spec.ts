import { expect, test } from "@playwright/test";

import { bootstrap, waitForAnimationsSettled } from "./helpers";

test.describe("Меню трея", () => {
  test("рендерит компактное меню со всеми пунктами", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/?view=tray");

    await expect(
      page.getByText("Zapret", { exact: true }).first()
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Запустить последнюю стратегию" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Остановить" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Главная" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Стратегии" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Логи" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Настройки" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Проверить обновления" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Выход" })).toBeVisible();

    expect(collector.errors).toEqual([]);
  });

  test("пункт «Выход» попадает в границы окна меню", async ({ page }) => {
    // Окно трея фиксированного размера, а список длиннее. Раньше «Выход»
    // оказывался ниже края и просто не нажимался: окно должно подстраиваться
    // под реальную высоту контента, которую приложение ему сообщает.
    await bootstrap(page);
    await page.setViewportSize({ width: 236, height: 332 });
    await page.goto("/?view=tray");
    // меню появляется с анимацией-масштабом: во время неё геометрия плавает,
    // замер делаем после покоя
    await waitForAnimationsSettled(page);

    const exit = page.getByRole("button", { name: "Выход" });
    const box = await exit.boundingBox();

    expect(box, "пункт «Выход» не отрисовался").not.toBeNull();

    const contentBottom = (box?.y ?? 0) + (box?.height ?? 0);

    expect(
      contentBottom,
      "контент выше окна 332px — нижние пункты будут обрезаны"
    ).toBeGreaterThan(332);

    const reported = await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const log = (
              window as unknown as {
                __MOCK_INVOKE_LOG__?: { command: string; args?: unknown }[];
              }
            ).__MOCK_INVOKE_LOG__;

            const call = log
              ?.filter((item) => item.command === "tray_menu_set_height")
              .at(-1);
            const height = (call?.args as { height?: number } | undefined)
              ?.height;

            return typeof height === "number" ? Math.ceil(height) : 0;
          }),
        { message: "высота меню не сообщена бэкенду" }
      )
      .toBeGreaterThan(0)
      .then(() => true);

    expect(reported).toBe(true);

    const reportedHeight = await page.evaluate(() => {
      const log = (
        window as unknown as {
          __MOCK_INVOKE_LOG__?: { command: string; args?: unknown }[];
        }
      ).__MOCK_INVOKE_LOG__;

      const call = log
        ?.filter((item) => item.command === "tray_menu_set_height")
        .at(-1);

      return Math.ceil(
        (call?.args as { height?: number } | undefined)?.height ?? 0
      );
    });

    expect(reportedHeight).toBeGreaterThanOrEqual(contentBottom);
  });

  test("клик по пункту не роняет окно меню", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/?view=tray");

    await page.getByRole("button", { name: "Стратегии" }).click();

    await expect(
      page.getByText("Zapret", { exact: true }).first()
    ).toBeVisible();

    expect(collector.errors).toEqual([]);
  });
});
