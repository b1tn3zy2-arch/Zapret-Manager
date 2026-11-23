import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import {
  GREETING,
  bootstrap,
  modeSwitcher,
  settingsNav,
  sidebar,
  waitForAnimationsSettled,
} from "./helpers";

type Failures = string[] | Record<string, string>;

async function setFailures(page: Page, failures: Failures): Promise<void> {
  await page.evaluate((value) => {
    (
      window as unknown as { __MOCK_FAIL_COMMANDS__?: Failures }
    ).__MOCK_FAIL_COMMANDS__ = value;
  }, failures);
}

/** Снимок журнала вызовов mock-моста. */
async function invocations(page: Page, command: string): Promise<number> {
  return page.evaluate((name) => {
    const log = (window as unknown as Record<string, unknown>)
      .__MOCK_INVOKE_LOG__ as { command: string }[];

    return (log ?? []).filter((item) => item.command === name).length;
  }, command);
}

async function openVpn(page: Page, idle = true): Promise<void> {
  await page.goto("/");
  await modeSwitcher(page)
    .getByRole("radio", { name: "Переключить на VPN" })
    .click();

  // Подпись кнопки зависит от состояния подписки: в обычном
  // состоянии — «Умное подключение», без подписки (или при сбое
  // чтения) — честное объяснение.
  await expect(
    idle
      ? page.getByText("Умное подключение")
      : page.getByText(
          "Сначала добавьте подписку — без неё VPN не подключается"
        )
  ).toBeVisible();
}

test.describe("Zero bugs: сквозной проход", () => {
  test("все разделы, настройки и модалки без ошибок и предупреждений", async ({
    page,
  }) => {
    const warnings: string[] = [];

    const { errors } = await bootstrap(page);

    page.on("console", (message) => {
      if (message.type() === "warning") {
        warnings.push(message.text());
      }
    });

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: GREETING }).first()
    ).toBeVisible();

    const sections = [
      { name: "Стратегии", heading: /Стратегии/i },
      { name: "Игры", heading: /^Игры$/ },
      { name: "Монитор", heading: /Монитор/i },
      { name: "Логи", heading: /Логи/i },
      { name: "Настройки", heading: /Настройки/i },
      { name: "О приложении", heading: /^Zapret$/ },
      { name: "Главная", heading: GREETING },
    ] as const;

    for (const section of sections) {
      await sidebar(page, section.name).click();
      await expect(
        page.getByRole("heading", { name: section.heading }).first()
      ).toBeVisible();
      await waitForAnimationsSettled(page);
    }

    // Все вкладки настроек: каждая монтируется и не пишет в консоль.
    await sidebar(page, "Настройки").click();

    for (const tab of [
      "Общие",
      "VPN",
      "Внешний вид",
      "Стратегии",
      "Обновления",
      "Продвинутые",
    ]) {
      await settingsNav(page)
        .getByRole("button", { name: tab, exact: true })
        .click();
      await waitForAnimationsSettled(page);
    }

    // Модалки оплаты и сброса трафика.
    await sidebar(page, "Главная").click();
    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();
    await expect(page.getByText("Умное подключение")).toBeVisible();

    await page.getByRole("button", { name: "Продлить подписку" }).click();
    await expect(
      page.getByRole("dialog").getByText("Покупка VPN")
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    // Модалки игр: ручное добавление и папки.
    await sidebar(page, "Игры").click();
    await page.getByRole("button", { name: "Добавить игру" }).first().click();
    await expect(
      page.getByRole("dialog").getByText("Добавить игру вручную")
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    await page.getByRole("button", { name: "Добавить папку" }).click();
    await expect(
      page.getByRole("dialog").getByText("Папки с играми")
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();

    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });

  test("сбой сканирования игр показывает причину и лечится повтором", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await page.goto("/");
    await sidebar(page, "Игры").click();
    await expect(page.getByText("Portal 2")).toBeVisible();

    await setFailures(page, ["scan_installed_games"]);
    await page.getByRole("button", { name: "Пересканировать" }).click();

    const alert = page.getByRole("alert");

    await expect(alert).toContainText("Нет подключения к интернету");

    await setFailures(page, []);
    await alert.getByRole("button", { name: "Повторить" }).click();

    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByText("Portal 2")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("сбой сканирования стратегий показывает причину и лечится повтором", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await page.goto("/");
    await sidebar(page, "Стратегии").click();
    await expect(page.getByText("Discord + YouTube").first()).toBeVisible();

    await setFailures(page, ["scan_strategies"]);
    await page.getByRole("button", { name: "Обновить", exact: true }).click();

    const alert = page.getByRole("alert");

    await expect(alert).toContainText("Нет подключения к интернету");

    await setFailures(page, []);
    await alert.getByRole("button", { name: "Повторить" }).click();

    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.getByText("Discord + YouTube").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("без интернета подписка показывает ошибку, приложение работает", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await page.addInitScript(() => {
      (
        window as unknown as { __MOCK_FAIL_COMMANDS__?: string[] }
      ).__MOCK_FAIL_COMMANDS__ = ["get_subscription", "fetch_tariff_matrix"];
    });

    await openVpn(page, false);

    await expect(page.getByText("Нет подключения к интернету")).toBeVisible();

    // Интерфейс жив: режимы переключаются, ошибка не роняет страницу.
    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на обход" })
      .click();
    await expect(page.getByText("Пинг до сервисов").first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("удалённое ядро Xray показывает настоящую причину сбоя", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);

    await setFailures(page, {
      auto_connect_vpn:
        "Ядро Xray не установлено. Установите его в настройках.",
    });

    await page.getByRole("button", { name: "Подключить VPN" }).click();

    // exact: строка неудачи добавляется и в «Recent logs» на главной,
    // где она идёт в составе «Серверы не отвечают, …: Ядро Xray …».
    await expect(
      page.getByText("Ядро Xray не установлено. Установите его в настройках.", {
        exact: true,
      })
    ).toBeVisible();
    await expect(page.getByText("Нет доступных серверов")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("невалидный путь к игре не роняет приложение", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await page.goto("/");
    await sidebar(page, "Игры").click();
    await page.getByRole("button", { name: "Добавить игру" }).first().click();

    const dialog = page.getByRole("dialog");

    await dialog.getByLabel("Название").fill("Broken Game");
    await dialog.getByLabel("Путь к .exe").fill("C:\\missing\\game.exe");
    await dialog.getByRole("button", { name: "Добавить" }).click();
    await expect(dialog).toBeHidden();

    const card = page
      .locator("[data-game-id]")
      .filter({ hasText: "Broken Game" });

    await expect(card).toBeVisible();
    await card.hover();
    await card.getByRole("button", { name: "Запустить игру" }).click();

    // первый запуск: выбор способа запуска, затем неудачный старт exe
    await expect(page.getByText("Как запустить игру?")).toBeVisible();
    await page.getByRole("button", { name: "Без обхода" }).click();

    await expect(page.getByText("Не удалось запустить игру")).toBeVisible();

    // Страница и остальные игры на месте.
    await expect(page.getByRole("heading", { name: "Игры" })).toBeVisible();
    await expect(page.getByText("Portal 2")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("модалка оплаты циклится без утечек и следа оплаты", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);

    // Двадцать циклов открытия/закрытия не должны копить таймеры.
    for (let index = 0; index < 20; index += 1) {
      await page.getByRole("button", { name: "Продлить подписку" }).click();
      await expect(
        page.getByRole("dialog").getByText("Покупка VPN")
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
    }

    // Один лишь цикл модалки не оплачивает и не открывает сайты:
    // платёж начинается только по явному «Продлить подписку».
    expect(await invocations(page, "open_payment_window")).toBe(0);

    expect(errors).toEqual([]);
  });
});
