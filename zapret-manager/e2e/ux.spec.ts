import { expect, test } from "@playwright/test";

import { bootstrap, sidebar } from "./helpers";

test.describe("UX: загрузка, пустые состояния, клавиатура", () => {
  test("сканер игр показывает skeleton во время загрузки", async ({ page }) => {
    const { errors } = await bootstrap(page, { gamesScanDelayMs: 60_000 });

    await page.goto("/");
    await sidebar(page, "Игры").click();

    await expect(page.getByTestId("games-skeleton")).toBeVisible({
      timeout: 15_000,
    });

    expect(errors).toEqual([]);
  });

  test("пустой список игр предлагает добавить игру", async ({ page }) => {
    const { errors } = await bootstrap(page, { emptyGames: true });

    await page.goto("/");
    await sidebar(page, "Игры").click();

    const title = page.getByRole("heading", { name: "Игры не найдены" });

    await expect(title).toBeVisible();

    // Кнопка именно в пустом состоянии, а не в верхней панели.
    await title
      .locator("..")
      .getByRole("button", { name: "Добавить игру" })
      .click();

    await expect(
      page.getByRole("dialog").getByText("Добавить игру вручную")
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    expect(errors).toEqual([]);
  });

  test("модалка держит фокус, закрывается Enter/Escape и не сдвигает фон", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await page.goto("/");
    await sidebar(page, "Игры").click();
    await expect(page.getByText("Portal 2")).toBeVisible();

    const heading = page.getByRole("heading", { name: "Игры" });
    const before = await heading.boundingBox();
    const addButton = page
      .getByRole("button", { name: "Добавить игру" })
      .first();

    await addButton.click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    // Первый фокус — в первом поле ввода, а не на крестике.
    await expect(page.getByLabel("Название")).toBeFocused();

    // Видимый фокус при переходе клавиатурой.
    await page.keyboard.press("Shift+Tab");

    const ringVisible = await page.evaluate(() => {
      const active = document.activeElement;

      if (active === null) {
        return false;
      }

      const shadow = window.getComputedStyle(active).boxShadow;

      return shadow !== "none" && shadow !== "";
    });

    expect(ringVisible).toBe(true);

    // Tab не выходит за пределы модалки.
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab");

      const inside = await page.evaluate(
        () =>
          document
            .querySelector('[role="dialog"]')
            ?.contains(document.activeElement) ?? false
      );

      expect(inside).toBe(true);
    }

    // Shift+Tab с первого элемента уходит на последний, а не в страницу.
    await page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      panel?.querySelector<HTMLElement>(selector)?.focus();
    });
    await page.keyboard.press("Shift+Tab");

    const wrapped = await page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>('[role="dialog"]');
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const list = Array.from(
        panel?.querySelectorAll<HTMLElement>(selector) ?? []
      );

      return document.activeElement === list[list.length - 1];
    });

    expect(wrapped).toBe(true);

    // Открытие модалки не сдвигает заголовок страницы.
    const after = await heading.boundingBox();

    expect(after?.x).toBe(before?.x);
    expect(after?.y).toBe(before?.y);

    // Enter активирует кнопку: «Отмена» закрывает окно.
    await page.evaluate(() => {
      const panel = document.querySelector<HTMLElement>('[role="dialog"]');

      Array.from(panel?.querySelectorAll("button") ?? [])
        .find((button) => button.textContent?.trim() === "Отмена")
        ?.focus();
    });
    await page.keyboard.press("Enter");

    await expect(dialog).toBeHidden();
    await expect(addButton).toBeFocused();

    // Escape закрывает и возвращает фокус на кнопку-триггер.
    await addButton.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(addButton).toBeFocused();

    expect(errors).toEqual([]);
  });
});
