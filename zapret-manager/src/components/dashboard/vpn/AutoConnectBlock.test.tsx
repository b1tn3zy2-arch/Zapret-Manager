// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const autoConnectVpn = vi.fn().
const autoConnectVpn = vi.fn();
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/lib/vpnCommands", () => ({
  // Обрабатываем конструкцию: autoConnectVpn.
  autoConnectVpn: (...args: unknown[]) => autoConnectVpn(...args),
  // Обрабатываем конструкцию: fetchVpnCoreStatus.
  fetchVpnCoreStatus: async () => null,
  // Обрабатываем конструкцию: installVpnCore.
  installVpnCore: async () => true,
  // Обрабатываем конструкцию: disconnectVpnServer.
  disconnectVpnServer: async () => null,
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/vpn/AutoConnectBlock.
import AutoConnectBlock from "@/components/dashboard/vpn/AutoConnectBlock";
// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AutoConnectBlock", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: autoConnectVpn.
    autoConnectVpn.mockReset();
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.setState({
      // Обрабатываем конструкцию: status.
      status: null,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: activeServerName.
      activeServerName: null,
      // Обрабатываем конструкцию: activeServerId.
      activeServerId: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает настоящую причину сбоя подключения", async () => {
    // Обрабатываем конструкцию: autoConnectVpn.
    autoConnectVpn.mockRejectedValueOnce(
      // Создаём экземпляр Error.
      new Error("Ядро Xray не установлено. Установите его в настройках.")
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент AutoConnectBlock.
      <AutoConnectBlock
        // Обрабатываем конструкцию: disabled.
        disabled={false}
        // Обрабатываем конструкцию: vpnDisabled.
        vpnDisabled={false}
        // Обрабатываем конструкцию: onConnected.
        onConnected={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Подключить VPN" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Ожидаем завершение асинхронной операции await screen.findByText( Ядро Xray не установ….
      await screen.findByText(
        // Обрабатываем конструкцию: Ядро Xray не установлено. Установите его в настройках..
        "Ядро Xray не установлено. Установите его в настройках."
        // Закрываем выражение или список аргументов.
      )
      // Закрываем выражение или список аргументов.
    ).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Не удалось подключиться")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.queryByText("Проверьте соединение")).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("убирает причину сбоя после успешного повтора", async () => {
    // Обрабатываем конструкцию: autoConnectVpn.
    autoConnectVpn.mockRejectedValueOnce(new Error("Нет подключения"));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент AutoConnectBlock.
      <AutoConnectBlock
        // Обрабатываем конструкцию: disabled.
        disabled={false}
        // Обрабатываем конструкцию: vpnDisabled.
        vpnDisabled={false}
        // Обрабатываем конструкцию: onConnected.
        onConnected={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const button = screen.getByRole(button, { name: Подключ….
    const button = screen.getByRole("button", { name: "Подключить VPN" });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(button).
    await userEvent.click(button);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(await screen.findByText("Нет подключения")).toBeTruthy();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: autoConnectVpn.
    autoConnectVpn.mockResolvedValueOnce({
      // Обрабатываем конструкцию: serverId.
      serverId: "srv_alpha",
      // Обрабатываем конструкцию: serverName.
      serverName: "Alpha",
      // Обрабатываем конструкцию: pingMs.
      pingMs: 24,
      // Обрабатываем конструкцию: status.
      status: {
        // Обрабатываем конструкцию: installed.
        installed: true,
        // Обрабатываем конструкцию: running.
        running: true,
        // Обрабатываем конструкцию: activeServerId.
        activeServerId: "srv_alpha",
        // Обрабатываем конструкцию: uptimeSec.
        uptimeSec: 0,
        // Обрабатываем конструкцию: socksPort.
        socksPort: 12080,
        // Обрабатываем конструкцию: httpPort.
        httpPort: 12081,
        // Обрабатываем конструкцию: pid.
        pid: 4242,
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(button).
    await userEvent.click(button);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(await screen.findByText("Подключено: Alpha (24 ms)")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.queryByText("Нет подключения")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(screen.queryByText("Не удалось подключиться")).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
