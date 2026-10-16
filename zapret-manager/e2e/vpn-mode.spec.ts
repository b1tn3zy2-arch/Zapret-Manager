import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { bootstrap, modeSwitcher } from "./helpers";

function servers(page: Page) {
  // список серверов: на странице есть и другие списки (меню настроек)
  return page
    .getByRole("list")
    .filter({ hasText: "VLESS" })
    .getByRole("listitem");
}

async function openVpn(page: Page): Promise<void> {
  await page.goto("/");
  await modeSwitcher(page)
    .getByRole("radio", { name: "Переключить на VPN" })
    .click();
  await expect(page.getByText("Нажмите для подключения")).toBeVisible();
}

async function loadServers(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Добавить ссылку" }).first().click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("https://sub.example.com/list");
  await dialog.getByRole("button", { name: "Загрузить" }).click();

  await expect(servers(page).first()).toBeVisible();
}

test.describe("Режим VPN", () => {
  // Список серверов пережил перезапуск приложения: в нём лежат записи,
  // сохранённые прошлой сборкой, без полей транспорта и шифрования. Раньше
  // переход в режим VPN на таком списке ронял весь интерфейс.
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

    await expect(page.getByText("Нажмите для подключения")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("загружает все серверы подписки, а не один", async ({ page }) => {
    // Лимит в один сервер делал подписку бесполезной: показывался только
    // первый узел из списка.
    const { errors } = await bootstrap(page);
    await openVpn(page);
    await loadServers(page);

    await expect(servers(page)).toHaveCount(3);
    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Beta", { exact: true })).toBeVisible();
    await expect(page.getByText("Gamma", { exact: true })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("удаляет отдельный сервер и не возвращает его при обновлении", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);
    await loadServers(page);

    // удаление спрятано в меню «⋯», как на референсе
    await page
      .getByRole("button", { name: "Действия с сервером Beta" })
      .click();
    await page.getByRole("button", { name: "Удалить", exact: true }).click();
    await expect(page.getByText("Beta", { exact: true })).toHaveCount(0);
    await expect(servers(page)).toHaveCount(2);

    // обновление подписки не должно воскресить удалённый сервер
    await page
      .getByRole("button", { name: "Обновить подписку и пинги" })
      .click();
    await expect(page.getByText("Beta", { exact: true })).toHaveCount(0);
    await expect(servers(page)).toHaveCount(2);

    expect(errors).toEqual([]);
  });

  test("спрашивает подтверждение перед удалением всех серверов", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);
    await loadServers(page);

    await page.getByRole("button", { name: "Очистить подписку" }).click();
    await expect(page.getByText("Удалить все серверы?")).toBeVisible();

    await page.getByRole("button", { name: "Отмена" }).click();
    await expect(servers(page)).toHaveCount(3);

    await page.getByRole("button", { name: "Очистить подписку" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Удалить" })
      .click();

    await expect(page.getByText("Нет VPN-конфигов")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("показывает панель подключения сверху и убирает нижний подвал", async ({
    page,
  }) => {
    const { errors } = await bootstrap(page);
    await openVpn(page);
    await loadServers(page);

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
    await loadServers(page);

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
