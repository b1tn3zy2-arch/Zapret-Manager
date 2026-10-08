import type { Page } from "@playwright/test";

import { mockTauri, type MockOptions } from "./mock-tauri";

export interface ConsoleCollector {
  readonly errors: string[];
}

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

export async function openSettingsSection(
  page: Page,
  section: string
): Promise<void> {
  await sidebar(page, "Настройки").click();
  await settingsNav(page)
    .getByRole("button", { name: section, exact: true })
    .click();
}
