import { expect, test } from "@playwright/test";

import {
  bootstrap,
  settingsNav,
  sidebar,
  waitForAnimationsSettled,
} from "./helpers";

/**
 * Индикатор работающей стратегии обязан анимироваться сразу после запуска
 * стратегии: пользователь жаловался, что линии появлялись только спустя
 * какое-то время. Проверяем это явно, а не «на глаз».
 */
test.describe("Индикатор работающей стратегии", () => {
  test("анимируется сразу после запуска стратегии", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: "C:\\zapret-e2e\\strategies" });
    await page.goto("/");
    await sidebar(page, "Стратегии").click();
    await waitForAnimationsSettled(page);

    const firstCard = page.locator(".strategy-card").first();

    await firstCard.hover();
    await firstCard
      .getByRole("button", { name: /^Запустить / })
      .first()
      .click();

    const halo = page.locator(".strategy-card-halo").first();
    await expect(halo).toBeVisible();

    const animation = await halo.evaluate((node) => {
      const style = getComputedStyle(node);
      const running = node
        .getAnimations()
        .map((item) => ({
          name: (item as CSSAnimation).animationName ?? "unknown",
          state: item.playState,
        }))
        .filter((item) => item.name === style.animationName);

      return {
        name: style.animationName,
        duration: style.animationDuration,
        iteration: style.animationIterationCount,
        running,
      };
    });

    expect(animation.name, "у индикатора нет анимации").not.toBe("none");
    expect(animation.duration, "анимация не имеет длительности").not.toBe("0s");
    expect(animation.iteration).toBe("infinite");
    expect(
      animation.running.length,
      "анимация не запущена сразу после запуска стратегии"
    ).toBeGreaterThan(0);
    expect(
      animation.running.every((item) => item.state === "running"),
      `анимация не играет: ${JSON.stringify(animation.running)}`
    ).toBe(true);
  });

  test("работает даже при выключенных анимациях", async ({ page }) => {
    await bootstrap(page, { strategiesFolder: "C:\\zapret-e2e\\strategies" });
    await page.goto("/");

    // выключаем анимации в настройках
    await sidebar(page, "Настройки").click();
    await settingsNav(page)
      .getByRole("button", { name: "Внешний вид" })
      .click();
    await page.getByRole("switch", { name: "Анимации" }).click();
    await sidebar(page, "Стратегии").click();
    await waitForAnimationsSettled(page);

    const firstCard = page.locator(".strategy-card").first();

    await firstCard.hover();
    await firstCard
      .getByRole("button", { name: /^Запустить / })
      .first()
      .click();

    const halo = page.locator(".strategy-card-halo").first();
    await expect(halo).toBeVisible();

    const iteration = await halo.evaluate(
      (node) => getComputedStyle(node).animationIterationCount
    );

    // это индикатор работающего обхода, а не украшение: он обязан гореть всегда
    expect(iteration).toBe("infinite");
  });
});
