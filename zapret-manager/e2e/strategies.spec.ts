import { expect, test } from "@playwright/test";

import { bootstrap, sidebar, waitForAnimationsSettled } from "./helpers";
import { MOCK_FOLDER } from "./mock-tauri";

test.describe("Стратегии", () => {
  test.beforeEach(async ({ page }) => {
    await bootstrap(page, { strategiesFolder: MOCK_FOLDER });
    await page.goto("/");
    await sidebar(page, "Стратегии").click();
  });

  test("пустое состояние предлагает выбрать папку", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: "" });
    await page.goto("/");
    await sidebar(page, "Стратегии").click();

    await expect(page.getByText("Папка не выбрана")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Выбрать папку" }).first()
    ).toBeVisible();
  });

  test("меняет сортировку коллекции", async ({ page }) => {
    // по умолчанию коллекция сортируется по алфавиту
    const sort = page.getByRole("button", { name: "По алфавиту" });

    await expect(sort).toBeVisible();
    await sort.click();

    await page.getByRole("option", { name: "По рейтингу" }).click();

    // значение применено: триггер показывает выбранный вариант
    await expect(
      page.getByRole("button", { name: "По рейтингу" })
    ).toBeVisible();
  });

  test("фильтрует коллекцию по замерам", async ({ page }) => {
    // в моке замеров нет: все карты считаются «без замеров»
    const unmeasured = page.getByRole("button", { name: /^Без замеров/ });

    await unmeasured.click();
    await expect(unmeasured).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Нет данных").first()).toBeVisible();

    const reset = page.getByRole("button", { name: "Сбросить", exact: true });

    await reset.click();
    await expect(unmeasured).toHaveAttribute("aria-pressed", "false");
    await expect(reset).toHaveCount(0);
  });

  test("ищет стратегию по имени", async ({ page }) => {
    const search = page.getByRole("textbox").first();

    await search.fill("Outlast");
    await expect(page.getByText(/Outlast Trials/).first()).toBeVisible();

    await search.fill("несуществующая стратегия");
    await expect(page.getByText("Ничего не найдено")).toBeVisible();
  });

  test("запускает стратегию из карточки и пишет лог", async ({ page }) => {
    await page
      .getByRole("button", { name: "Подробнее о стратегии" })
      .first()
      .click();
    await page
      .getByRole("button", { name: /^Запустить/ })
      .first()
      .click();

    await sidebar(page, "Логи").click();
    await expect(page.getByText(/Запуск стратегии/).first()).toBeVisible();
  });

  test("закрывает оборотную сторону карточки", async ({ page }) => {
    const card = page
      .getByRole("button", { name: "Подробнее о стратегии" })
      .first();

    await card.click();
    await expect(card).toHaveAttribute("aria-expanded", "true");
    await expect(
      card.locator("xpath=ancestor::*[@data-flipped]")
    ).toHaveAttribute("data-flipped", "true");
    // нижние кнопки карточки могут оказаться за пределами вьюпорта, и тогда
    // elementFromPoint ничего не находит — приводим карточку в экран
    await card.scrollIntoViewIfNeeded();
    await waitForAnimationsSettled(page);

    const close = page.getByRole("button", { name: "Закрыть карту" }).first();

    // Проверяем, что задняя грань реально кликабельна: под курсором в
    // центре кнопки должен лежать элемент этой кнопки.
    //
    // Именно elementsFromPoint, а не elementFromPoint: внутри preserve-3d
    // Chromium у elementFromPoint периодически возвращает родительский слой
    // вместо настоящей цели, хотя стек под точкой при этом корректный.
    await expect
      .poll(
        async () =>
          close.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            if (cy < 0 || cy > window.innerHeight) {
              return "кнопка вне вьюпорта";
            }

            return document
              .elementsFromPoint(cx, cy)
              .some((element) => element === node || node.contains(element));
          }),
        {
          timeout: 10_000,
          message: "задняя грань карточки не принимает клики",
        }
      )
      .toBe(true);

    // Клик по самому элементу, а не по координатам: hit-testing внутри
    // preserve-3d нестабилен сразу после 3D-переворота.
    await close.dispatchEvent("click");
    await expect(card).toHaveAttribute("aria-expanded", "false");
    await waitForAnimationsSettled(page);

    // после закрытия оборотная сторона скрыта, а блок карточки снова кликабелен
    await expect(
      page.getByRole("button", { name: "Подробнее о стратегии" }).first()
    ).toBeVisible();
    await expect(
      card.locator("xpath=ancestor::*[@data-flipped]")
    ).toHaveAttribute("data-flipped", "false");
  });
});
