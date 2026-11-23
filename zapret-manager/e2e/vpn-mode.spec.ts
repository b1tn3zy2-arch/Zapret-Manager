import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { bootstrap, modeSwitcher } from "./helpers";

async function openVpn(page: Page): Promise<void> {
  await page.goto("/");
  await modeSwitcher(page)
    .getByRole("radio", { name: "Переключить на VPN" })
    .click();
  await expect(page.getByText("Умное подключение")).toBeVisible();
}

test.describe("Режим VPN", () => {
  // Список серверов прошлой сборки приложение больше не хранит:
  // подписка всегда скачивается заново. Старые записи в хранилище
  // не должны ломать интерфейс.
  test("переживает список, сохранённый прошлой сборкой", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "zapret-manager:vpn-core",
        JSON.stringify({
          state: {
            subscriptionUrl: "https://sub.example.com/list",
            servers: [
              {
                id: "srv_legacy",
                name: "Старый сервер",
                protocol: "vless",
                host: "legacy.example.com",
                port: 443,
                link: "vless://uuid@legacy.example.com:443#Legacy",
              },
            ],
            activeServerId: "srv_legacy",
          },
          version: 1,
        })
      );
    });

    const { errors } = await bootstrap(page);
    await openVpn(page);

    await expect(page.getByText("Умное подключение")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("подключается одной кнопкой к самому быстрому серверу", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);

    // Списка серверов в интерфейсе нет: приложение само скачивает
    // подписку и выбирает самый быстрый узел.
    await expect(page.getByText("Нет VPN-конфигов")).toHaveCount(0);

    await page.getByRole("button", { name: "Подключить VPN" }).click();

    await expect(
      page.getByText("Подключено: Alpha (24 ms)").first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("показывает панель подключения сверху и убирает нижний подвал", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);

    await expect(page.getByText("Время работы")).toHaveCount(0);

    await page.getByRole("button", { name: "Подключить VPN" }).click();

    // панель появляется сверху со временем работы и скоростями
    await expect(page.getByText("Время работы")).toBeVisible();
    await expect(
      page.getByText("Alpha", { exact: true }).first()
    ).toBeVisible();

    // нижний подвал с PID и портами убран
    await expect(page.getByText(/^PID:/)).toHaveCount(0);
    await expect(page.getByText(/SOCKS:/)).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("убирает настройки VPN с главной страницы", async ({ page }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);

    // панель настроек переехала в раздел «Настройки → VPN»
    await expect(page.getByText("Проверка соединения")).toHaveCount(0);
    await expect(page.getByText("Kill Switch")).toHaveCount(0);
    await expect(page.getByText("Держать соединение активным")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("настройка VPN включает и выключает подключение", async ({ page }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);

    await page.getByRole("button", { name: "Настройки" }).click();
    await page
      .getByRole("button", { name: "VPN", exact: true })
      .first()
      .click();

    const toggle = page.getByRole("switch", { name: "VPN включён" });
    await expect(toggle).toBeChecked();

    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // переключатель режима живёт на главной, а не в настройках
    await page.getByRole("button", { name: "Главная" }).click();
    await modeSwitcher(page)
      .getByRole("radio", { name: "Переключить на VPN" })
      .click();
    await expect(page.getByText("VPN выключен в настройках")).toBeVisible();

    expect(errors).toEqual([]);
  });
});
