import type { Page } from "@playwright/test";

import { mockTauri, type MockOptions } from "./mock-tauri";

export interface ConsoleCollector {
  readonly errors: string[];
}

/**
 * Приветствие на Dashboard зависит от времени суток: «Доброе утро», «Добрый день»,
 * «Добрый вечер», «Доброй ночи». Раньше тесты искали только /Доброе/, из-за чего падали
 * с 12:00 до 23:00 и в CI на раннерах в произвольное время.
 */
export const GREETING = /Добр(?:ое|ый|ой)/;

function collectConsole(page: Page): ConsoleCollector {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });

  return { errors };
}

export async function bootstrap(
  page: Page,
  options?: MockOptions
): Promise<ConsoleCollector> {
  const collector = collectConsole(page);

  await mockTauri(page, options);

  return collector;
}

export function sidebar(page: Page, name: string) {
  return page
    .getByRole("navigation", { name: "Основная навигация" })
    .getByRole("button", { name, exact: true });
}

export function settingsNav(page: Page) {
  return page.getByRole("navigation", { name: "Общие" });
}

export function modeSwitcher(page: Page) {
  return page.getByRole("radiogroup", { name: "Переключить режим обхода" });
}

/**
 * Ждёт, пока закончатся CSS-анимации и Web Animations (Framer Motion).
 * Без этого клики попадают в ещё движущиеся карточки и незакрытые диалоги,
 * и тесты падают только на медленных машинах и при полном параллельном прогоне.
 */
export async function waitForAnimationsSettled(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () =>
        document.getAnimations().every((animation) => {
          if (animation.playState !== "running") {
            return true;
          }

          const timing = animation.effect?.getComputedTiming();

          // бесконечные пульсации не завершаются никогда и не блокируют клики
          return timing?.iterations === Infinity;
        }),
      undefined,
      { timeout: 5000, polling: 100 }
    )
    .catch(() => undefined);

  await page.waitForTimeout(120);
}
