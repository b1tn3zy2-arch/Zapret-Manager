import { expect, test, type Page } from "@playwright/test";

import { mockTauri } from "./mock-tauri";

const PAGES: [string, string][] = [
  ["Главная", "dashboard"],
  ["Стратегии", "strategies"],
  ["Настройки", "settings"],
  ["Монитор", "monitor"],
  ["Логи", "logs"],
  ["Игры", "games"],
];

const VIEWPORTS: [number, number][] = [
  [1024, 768],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
];

const SHORT_VIEWPORTS: [number, number][] = [
  [1280, 632],
  [1366, 600],
];

function navButton(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name, exact: true });
}

test.describe("Адаптив", () => {
  test("800x600: нет горизонтального переполнения на всех страницах", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await mockTauri(page);
    await page.goto("/");

    for (const [name, slug] of PAGES) {
      await navButton(page, name).click();
      await page.waitForTimeout(500);

      const sizes = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        body: document.body.scrollWidth,
      }));

      expect(sizes.content, `переполнение на ${slug}`).toBeLessThanOrEqual(
        sizes.viewport + 2
      );
      expect(sizes.body, `переполнение body на ${slug}`).toBeLessThanOrEqual(
        sizes.viewport + 2
      );
    }
  });

  test("800x600: сетка игр даёт минимум две колонки", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await mockTauri(page);
    await page.goto("/");
    await navButton(page, "Игры").click();

    const grid = page.getByTestId("installed-games-grid");

    await expect(grid).toBeVisible();

    const columns = await grid.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(" ").length
    );

    expect(columns).toBeGreaterThanOrEqual(2);
  });

  test("2560x1440: дашборд раскладывает панели в две колонки", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await mockTauri(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const columns = await page
      .locator(".dashboard-layout")
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns);

    expect(columns.split(" ").length).toBeGreaterThanOrEqual(2);
  });

  for (const [width, height] of SHORT_VIEWPORTS) {
    test(`${width}x${height}: низ страниц не прилипает к краю при прокрутке`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await mockTauri(page);
      await page.goto("/");

      for (const [name, slug] of PAGES) {
        await navButton(page, name).click();
        await page.waitForTimeout(400);

        await page
          .waitForFunction(
            () => {
              const main = document.querySelector("main");

              if (main === null) {
                return false;
              }

              const mainRect = main.getBoundingClientRect();
              let deepest = mainRect.top;

              for (const node of Array.from(main.querySelectorAll("*"))) {
                const rect = node.getBoundingClientRect();

                if (rect.width === 0 || rect.height === 0) {
                  continue;
                }

                if (getComputedStyle(node).position === "fixed") {
                  continue;
                }

                if (rect.bottom > mainRect.top) {
                  deepest = Math.max(deepest, rect.bottom);
                }
              }

              main.scrollTop = main.scrollHeight;

              const probe = window as unknown as {
                __settleProbe?: string;
                __settleHits?: number;
              };
              const signature = `${main.scrollHeight}:${Math.round(deepest)}`;

              probe.__settleHits =
                probe.__settleProbe === signature
                  ? (probe.__settleHits ?? 0) + 1
                  : 0;
              probe.__settleProbe = signature;

              return probe.__settleHits >= 3;
            },
            undefined,
            { timeout: 5000, polling: 200 }
          )
          .catch(() => undefined);

        const gap = await page.evaluate(() => {
          const main = document.querySelector("main");

          if (main === null) {
            return -1;
          }

          const mainRect = main.getBoundingClientRect();
          let deepest = mainRect.top;

          for (const node of Array.from(main.querySelectorAll("*"))) {
            const rect = node.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
              continue;
            }

            if (getComputedStyle(node).position === "fixed") {
              continue;
            }

            if (rect.bottom > mainRect.top) {
              deepest = Math.max(deepest, rect.bottom);
            }
          }

          return mainRect.bottom - deepest;
        });

        expect(
          gap,
          `нет нижнего отступа на ${slug} @${width}x${height} (gap=${gap})`
        ).toBeGreaterThanOrEqual(24);
      }
    });
  }

  for (const [width, height] of VIEWPORTS) {
    test(`${width}x${height}: страницы без переполнения и обрезанных блоков`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await mockTauri(page);
      await page.goto("/");

      for (const [name, slug] of PAGES) {
        await navButton(page, name).click();
        await page.waitForTimeout(400);

        const result = await page.evaluate(() => {
          const main = document.querySelector("main");

          if (main === null) {
            return { overflow: true, offenders: ["main не найден"] };
          }

          const mainRect = main.getBoundingClientRect();
          const offenders: string[] = [];
          const nodes = Array.from(main.querySelectorAll("*")).slice(0, 800);

          for (const node of nodes) {
            const rect = node.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) {
              continue;
            }

            if (
              rect.right > mainRect.right + 2 ||
              rect.left < mainRect.left - 2
            ) {
              const className =
                typeof node.className === "string"
                  ? node.className
                      .split(" ")
                      .filter((value) => value !== "")
                      .slice(-2)
                      .join(".")
                  : "";

              offenders.push(
                `${node.tagName.toLowerCase()}.${className}:${Math.round(rect.right)}>${Math.round(mainRect.right)}`
              );

              if (offenders.length >= 3) {
                break;
              }
            }
          }

          return {
            overflow:
              document.documentElement.scrollWidth > window.innerWidth + 2,
            offenders,
          };
        });

        expect(
          result.overflow,
          `переполнение на ${slug} @${width}x${height}`
        ).toBe(false);
        expect(
          result.offenders,
          `блоки за границей на ${slug} @${width}x${height}`
        ).toEqual([]);
      }
    });
  }
});
