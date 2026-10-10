import { expect, test } from "@playwright/test";

import { bootstrap, settingsNav, sidebar } from "./helpers";

const LANGUAGE_TRIGGER_RU = "Язык интерфейса";
const LANGUAGE_TRIGGER_EN = "Interface language";

test.describe("Настройки", () => {
  test("переключает секции без ошибок", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();

    for (const section of [
      "Общие",
      "Внешний вид",
      "Обновления",
      "Продвинутые",
    ]) {
      await settingsNav(page)
        .getByRole("button", { name: section, exact: true })
        .click();
      await expect(
        settingsNav(page).getByRole("button", { name: section, exact: true })
      ).toHaveAttribute("aria-current", "page");
    }

    expect(collector.errors).toEqual([]);
  });

  test("сворачивает и разворачивает сайдбар", async ({ page }) => {
    await bootstrap(page);
    await page.goto("/");

    await page.getByRole("button", { name: "Свернуть меню" }).click();
    await expect(
      page.getByRole("button", { name: "Развернуть меню" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Развернуть меню" }).click();
    await expect(
      page.getByRole("button", { name: "Свернуть меню" })
    ).toBeVisible();
  });

  test("переключает язык интерфейса мгновенно", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();

    await page.getByRole("button", { name: LANGUAGE_TRIGGER_RU }).click();
    await page.getByRole("option", { name: "English" }).click();

    await expect(
      page.getByRole("button", { name: LANGUAGE_TRIGGER_EN })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Settings" }).first()
    ).toBeVisible();

    expect(collector.errors).toEqual([]);
  });

  test("возвращает русский язык", async ({ page }) => {
    await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();

    await page.getByRole("button", { name: LANGUAGE_TRIGGER_RU }).click();
    await page.getByRole("option", { name: "English" }).click();
    await page.getByRole("button", { name: LANGUAGE_TRIGGER_EN }).click();
    await page.getByRole("option", { name: "Русский" }).click();

    await expect(
      page.getByRole("button", { name: LANGUAGE_TRIGGER_RU })
    ).toBeVisible();
  });

  test("модалка лицензий открывается и закрывается по Escape", async ({
    page,
  }) => {
    await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "О приложении").click();

    await page
      .getByRole("button", { name: "Лицензии", exact: true })
      .first()
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("показывает только ссылку на zapret-проект", async ({ page }) => {
    await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "О приложении").click();

    const links = page.getByRole("button", { name: /zapret-discord-youtube/ });

    await expect(links).toHaveCount(1);

    for (const label of ["Сообщить о баге", "Документация"]) {
      await expect(
        page.getByRole("button", { name: label, exact: true })
      ).toHaveCount(0);
    }
  });

  test("в Settings нет секции «О приложении»", async ({ page }) => {
    await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();

    await expect(
      settingsNav(page).getByRole("button", { name: "О приложении" })
    ).toHaveCount(0);
  });

  test("показывает секцию «Игры» вместо Outlast Trials", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();

    const nav = settingsNav(page);

    await expect(nav.getByRole("button", { name: "Игры" })).toBeVisible();
    await expect(
      nav.getByRole("button", { name: "Outlast Trials" })
    ).toHaveCount(0);

    await nav.getByRole("button", { name: "Игры" }).click();

    await expect(page.getByText("Outlast Trials").first()).toBeVisible();
    await expect(page.getByText("Приоритет").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Добавить игру" })
    ).toBeVisible();

    expect(collector.errors).toEqual([]);
  });

  test("перечисляет шесть встроенных игр", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();
    await settingsNav(page).getByRole("button", { name: "Игры" }).click();

    for (const name of [
      "Outlast Trials",
      "Escape from Tarkov",
      "Counter-Strike 2",
      "Dota 2",
      "Valorant",
      "GTA Online",
    ]) {
      await expect(page.getByText(name).first()).toBeVisible();
    }

    expect(collector.errors).toEqual([]);
  });

  test("переключает игру тумблером", async ({ page }) => {
    const collector = await bootstrap(page);
    await page.goto("/");
    await sidebar(page, "Настройки").click();
    await settingsNav(page).getByRole("button", { name: "Игры" }).click();

    const toggle = page
      .getByRole("switch", { name: "Инъекция для Outlast Trials" })
      .first();

    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");

    expect(collector.errors).toEqual([]);
  });
});
