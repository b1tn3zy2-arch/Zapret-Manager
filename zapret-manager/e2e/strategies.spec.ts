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

  test("переключает вид карточек и списка", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Карты" })).toBeVisible();

    await page.getByRole("button", { name: "Список" }).click();
    await expect(page.getByRole("button", { name: "Карты" })).toBeVisible();

    await page.getByRole("button", { name: "Карты" }).click();
    await expect(
      page.getByRole("button", { name: "Подробнее о стратегии" }).first()
    ).toBeVisible();
  });

  test("фильтрует коллекцию по редкости", async ({ page }) => {
    const filter = page.getByRole("button", { name: /^Легендарная/ });

    await filter.click();
    await expect(filter).toHaveAttribute("aria-pressed", "true");

    await filter.click();
    await expect(filter).toHaveAttribute("aria-pressed", "false");
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
    await waitForAnimationsSettled(page);

    const close = page.getByRole("button", { name: "Закрыть карту" }).first();

    // Проверяем, что задняя грань реально кликабельна: элемент под курсором
    // в центре кнопки должен принадлежать этой кнопке. Именно это ломалось
    // в preserve-3d-поддереве: клик уходил в родительский div.
    await expect
      .poll(
        async () =>
          close.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const hit = document.elementFromPoint(cx, cy);

            if (hit === null) {
              return `точка вне вьюпорта: ${Math.round(cx)},${Math.round(cy)}`;
            }

            if (hit === node || node.contains(hit)) {
              return true;
            }

            const owner = hit.closest<HTMLElement>("[data-flipped]");

            return `под курсором ${hit.tagName}${
              owner === null ? "" : " вне кнопки"
            } (${Math.round(cx)},${Math.round(cy)})`;
          }),
        {
          timeout: 10_000,
          message: "задняя грань карточки принимает клики",
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
