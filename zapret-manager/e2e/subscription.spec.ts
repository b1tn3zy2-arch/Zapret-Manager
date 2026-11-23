import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { bootstrap, modeSwitcher } from "./helpers";

/**
 * Открывает режим VPN. Ожидание зависит от состояния подписки:
 * в обычном состоянии кнопка обещает умное подключение, а без
 * подписки — честно объясняет, что сначала нужна ссылка.
 */
async function openVpn(page: Page, idle = true): Promise<void> {
  await page.goto("/");
  await modeSwitcher(page)
    .getByRole("radio", { name: "Переключить на VPN" })
    .click();

  // Карточка подписки рендерится в любом состоянии режима.
  await expect(page.getByText("Моя подписка")).toBeVisible();

  await expect(
    idle
      ? page.getByText("Умное подключение")
      : page.getByText(
          "Сначала добавьте подписку — без неё VPN не подключается"
        )
  ).toBeVisible();
}

async function failCommands(page: Page, commands: string[]): Promise<void> {
  await page.evaluate((list) => {
    (
      window as unknown as { __MOCK_FAIL_COMMANDS__?: string[] }
    ).__MOCK_FAIL_COMMANDS__ = list;
  }, commands);
}

/** Список команд, дошедших до mock-моста. */
async function invokeLog(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const log = (window as unknown as Record<string, unknown>)
      .__MOCK_INVOKE_LOG__ as { command: string }[];

    return (log ?? []).map((item) => item.command);
  });
}

/** Аргументы, с которыми вызывалась команда mock-моста. */
async function invokeArgs(
  page: Page,
  command: string
): Promise<{ url?: string }[]> {
  return page.evaluate((name) => {
    const log = (window as unknown as Record<string, unknown>)
      .__MOCK_INVOKE_LOG__ as { command: string; args?: unknown }[];

    return (log ?? [])
      .filter((item) => item.command === name)
      .map((item) => (item.args ?? {}) as { url?: string });
  }, command);
}

test.describe("Подписка и оплата", () => {
  test("карточка показывает трафик, срок и серверы", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);

    await expect(page.getByText("Моя подписка")).toBeVisible();
    await expect(page.getByText("Активна")).toBeVisible();
    await expect(page.getByText("45.2 ГБ / 100.0 ГБ")).toBeVisible();
    await expect(page.getByText("Профиль 3 месяца")).toBeVisible();
    await expect(page.getByText("Осталось 14 дней")).toBeVisible();

    const expiry = await page.evaluate(() =>
      new Date(1_798_782_953 * 1000).toLocaleDateString()
    );

    await expect(page.getByText(expiry)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("без подписки карточка объясняет, что делать", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await expect(page.getByText("Подписки нет")).toBeVisible();
    await expect(
      page.getByText(
        "Добавьте ссылку на подписку — серверы подтянутся автоматически. VPN включается после этого."
      )
    ).toBeVisible();
    // «Обновить» без подписки выключен, «Убрать» не отрисовывается вовсе.
    // exact: рядом есть иконка «Обновить данные о соединении».
    await expect(
      page.getByRole("button", { name: "Обновить", exact: true })
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: "Убрать" })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("VPN без подписки честно объясняет кнопку", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    const connect = page.getByRole("button", { name: "Подключить VPN" });

    await expect(connect).toBeDisabled();
    await expect(
      page.getByText("Сначала добавьте подписку — без неё VPN не подключается")
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("добавление подписки снимает блокировку VPN", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await expect(
      page.getByRole("button", { name: "Подключить VPN" })
    ).toBeDisabled();

    // Добавляем ссылку: кнопка Подключить VPN должна ожить без
    // перезагрузки страницы.
    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Добавить подписку")).toBeVisible();
    await dialog
      .getByRole("textbox", { name: "Ссылка или письмо" })
      .fill("https://maximavps.cloud/api/v1/client/subscribe?token=demo");
    await dialog.getByRole("button", { name: "Добавить", exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText("Активна")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Подключить VPN" })
    ).toBeEnabled();
    await page.getByRole("button", { name: "Подключить VPN" }).click();
    await expect(
      page.getByText("Подключено: Alpha (24 ms)").first()
    ).toBeVisible();

    // Ссылка сохранена ровно в том виде, в котором её ввели.
    const calls = await invokeArgs(page, "add_subscription");

    expect(calls[0]?.url).toBe(
      "https://maximavps.cloud/api/v1/client/subscribe?token=demo"
    );

    expect(errors).toEqual([]);
  });

  test("ссылка извлекается из письма целиком", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");

    await dialog
      .getByRole("textbox", { name: "Ссылка или письмо" })
      .fill(
        "Здравствуйте!\nВаша подписка Maxima VPS активна.\nЛичный кабинет: https://maximavps.cloud/api/v1/client/subscribe?token=letter-demo\nПриятной игры!"
      );
    await dialog.getByRole("button", { name: "Добавить", exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText("Активна")).toBeVisible();

    const calls = await invokeArgs(page, "add_subscription");

    expect(calls[0]?.url).toBe(
      "https://maximavps.cloud/api/v1/client/subscribe?token=letter-demo"
    );

    expect(errors).toEqual([]);
  });

  test("письмо с личным кабинетом открывает кабинет во встроенном окне", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");

    await dialog
      .getByRole("textbox", { name: "Ссылка или письмо" })
      .fill(
        "Добро пожаловать в MaximaVPS!\nВойти в личный кабинет: https://maximavps.cloud/ru/dashboard\nПриятной игры!"
      );

    // Подписку из такого письма не добавить: кнопка остаётся неактивной.
    await expect(
      dialog.getByRole("button", { name: "Добавить" })
    ).toBeDisabled();

    // Появляется панель кабинета с кнопкой открытия встроенного окна.
    await expect(
      dialog.getByText("Это приветственное письмо", { exact: false })
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: "Открыть личный кабинет" })
      .click();

    const windows = await invokeArgs(page, "open_payment_window");

    expect(windows[0]?.url).toBe("https://maximavps.cloud/ru/dashboard");

    expect(await invokeLog(page)).not.toContain("add_subscription");
    expect(errors).toEqual([]);
  });

  test("адрес сайта вместо подписки поясняется подсказкой", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");

    await dialog
      .getByRole("textbox", { name: "Ссылка или письмо" })
      .fill("https://maxima-vps.online/");
    await dialog.getByRole("button", { name: "Добавить", exact: true }).click();

    // Модалка остаётся открытой: пользователь должен вставить
    // собственную ссылку из письма.
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText(
        "Это адрес сайта, а не подписки. Своя ссылка приходит в письме после оплаты — она вида https://…/sub/ключ"
      )
    ).toBeVisible();

    expect(await invokeLog(page)).not.toContain("add_subscription");

    expect(errors).toEqual([]);
  });

  test("несовпадение схемы ссылки не добавляет подписку", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Ссылка или письмо" })
      .fill("http://example.com/sub");
    await dialog.getByRole("button", { name: "Добавить", exact: true }).click();

    // Ошибка видна и в модалке, и в карточке позади неё (общий state).
    await expect(
      dialog.getByText("Ссылка должна начинаться с https://")
    ).toBeVisible();
    // Модалка не закрывается: пользователь должен исправить ссылку.
    await expect(dialog).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("подписка постороннего провайдера не добавляется", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Ссылка или письмо" })
      .fill("https://sub.example.com/list");
    await dialog.getByRole("button", { name: "Добавить", exact: true }).click();

    // Ошибка видна и в модалке, и в карточке позади неё (общий state).
    await expect(
      dialog.getByText("Подписка принимается только от Maxima VPS")
    ).toBeVisible();
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Отмена" }).click();
    await expect(page.getByText("Подписки нет")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("отмена модалки добавления не меняет состояние", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Отмена" }).click();
    await expect(dialog).toBeHidden();

    await expect(page.getByText("Подписки нет")).toBeVisible();
    expect(await invokeLog(page)).not.toContain("add_subscription");

    expect(errors).toEqual([]);
  });

  test("удаление подписки возвращает карточку в исходное состояние", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);

    await page.getByRole("button", { name: "Убрать" }).click();

    await expect(page.getByText("Подписки нет")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Подключить VPN" })
    ).toBeDisabled();

    expect(errors).toEqual([]);
  });

  test("обновление подписки перечитывает данные без удаления", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    // exact: рядом есть иконка «Обновить данные о соединении».
    await page.getByRole("button", { name: "Обновить", exact: true }).click();

    // Карточка жива: обновление не убрать данные.
    await expect(page.getByText("Активна")).toBeVisible();
    await expect(page.getByText("45.2 ГБ / 100.0 ГБ")).toBeVisible();
    expect(await invokeLog(page)).toContain("refresh_subscription");

    expect(errors).toEqual([]);
  });

  test("кнопка продления открывает модалку с тарифами", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Покупка VPN")).toBeVisible();
    await expect(
      dialog.getByText(
        "Подключайте больше устройств и пользуйтесь VPN вместе с друзьями и близкими"
      )
    ).toBeVisible();

    // Четыре тарифа.
    await expect(dialog.getByText("1 месяц")).toBeVisible();
    await expect(dialog.getByText("3 месяца")).toBeVisible();
    await expect(dialog.getByText("6 месяцев")).toBeVisible();
    await expect(dialog.getByText("1 год")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("открытие модалки не трогает сеть и не открывает сайты", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const calls = await invokeLog(page);

    // Цены уже пришли с тарифами; платёж начинается только по кнопке.
    expect(calls).not.toContain("open_payment_window");
    expect(calls).not.toContain("open_external_url");

    expect(errors).toEqual([]);
  });

  test("число устройств меняет цену", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");

    await dialog
      .getByRole("slider", { name: "Сколько устройств охватывает подписка" })
      .press("ArrowRight");

    await expect(dialog.getByText("Выбрано: 3")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Оплатить 299 ₽" })
    ).toBeDisabled();

    expect(errors).toEqual([]);
  });

  test("выбор тарифа меняет итоговую цену", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");

    await dialog.getByRole("button", { name: /3 месяца/ }).click();
    await expect(
      dialog.getByRole("button", { name: "Оплатить 399 ₽" })
    ).toBeDisabled();

    await dialog
      .getByRole("slider", { name: "Сколько устройств охватывает подписка" })
      .press("ArrowRight");
    await dialog.getByRole("button", { name: /1 год/ }).click();
    await expect(
      dialog.getByRole("button", { name: "Оплатить 1399 ₽" })
    ).toBeDisabled();

    expect(errors).toEqual([]);
  });

  test("согласие с условиями включает оплату", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");
    const pay = dialog.getByRole("button", { name: "Оплатить 199 ₽" });

    await expect(pay).toBeDisabled();

    await dialog
      .getByRole("textbox", { name: "Email для подписки" })
      .fill("user@example.com");
    await dialog.getByRole("checkbox").check();
    await expect(pay).toBeEnabled();

    expect(errors).toEqual([]);
  });

  test("оплата создаёт свежий заказ и открывает его во встроенном окне", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Email для подписки" })
      .fill("user@example.com");
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: /3 месяца/ }).click();
    await dialog.getByRole("button", { name: "Оплатить 399 ₽" }).click();

    const opened = await invokeArgs(page, "open_payment_window");

    // Ссылка приходит из только что созданного заказа: вшитых
    // yoomoney-заказов больше нет, «Время истекло» исчезло.
    expect(opened.map((item) => item.url)).toContain(
      "https://maximacloud.online/pay/transactions/mock-3m-1"
    );

    expect(errors).toEqual([]);
  });

  test("кнопка покупки одна и только на странице VPN", async ({ page }) => {
    const { errors } = await bootstrap(page, { subscriptionPresent: false });

    await openVpn(page, false);

    // На карточке подписки ровно одна кнопка оплаты; кнопка сайта
    // провайдера рядом больше не живёт: оплата идёт через модалку.
    await expect(
      page.getByRole("button", { name: "Оплатить", exact: true })
    ).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: "Купить на Maxima VPS" })
    ).toHaveCount(0);

    await page
      .getByRole("button", { name: "Добавить подписку", exact: true })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Купить/ })).toHaveCount(0);

    await dialog.getByRole("button", { name: "Отмена" }).click();
    await expect(dialog).toBeHidden();

    expect(errors).toEqual([]);
  });

  test("в модалке оплаты нет кнопки сайта провайдера", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Покупка VPN")).toBeVisible();

    // Единственная кнопка покупки живёт на карточке; в модалке оплаты
    // остаётся только чекаут внутренним окном.
    await expect(
      dialog.getByRole("button", { name: "Открыть сайт провайдера" })
    ).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: /Оплатить/ })).toHaveCount(
      1
    );

    expect(errors).toEqual([]);
  });

  test("ошибка сети при оплате показывается понятным текстом", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await failCommands(page, ["create_payment_order_command"]);

    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");
    await dialog
      .getByRole("textbox", { name: "Email для подписки" })
      .fill("user@example.com");
    await dialog.getByRole("checkbox").check();
    await dialog.getByRole("button", { name: "Оплатить 199 ₽" }).click();

    await expect(dialog.getByText("Нет подключения к интернету")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("закрытие модалки оплаты сохраняет подписку и соединение", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);

    await page.getByRole("button", { name: "Продлить подписку" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Покупка VPN")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await expect(page.getByText("Моя подписка")).toBeVisible();
    await expect(page.getByText("45.2 ГБ / 100.0 ГБ")).toBeVisible();

    await page.getByRole("button", { name: "Подключить VPN" }).click();
    await expect(
      page.getByText("Подключено: Alpha (24 ms)").first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("в интерфейсе нет названий сторонних сервисов", async ({ page }) => {
    const { errors } = await bootstrap(page);

    await openVpn(page);
    await page.getByRole("button", { name: "Продлить подписку" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();

    const body = await page.locator("body").innerText();

    expect(body.toLowerCase()).not.toContain("maxima");
    expect(body.toLowerCase()).not.toContain("vps");

    expect(errors).toEqual([]);
  });
});
