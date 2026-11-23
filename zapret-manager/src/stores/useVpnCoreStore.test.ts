// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import {
  // Подключаем именованный импорт migratePersistedState.
  migratePersistedState,
  // Подключаем именованный импорт useVpnCoreStore.
  useVpnCoreStore,
  // Закрываем текущий блок.
} from "@/stores/useVpnCoreStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useVpnCoreStore: подключение", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.setState({
      // Обрабатываем конструкцию: activeServerId.
      activeServerId: null,
      // Обрабатываем конструкцию: status.
      status: null,
      // Обрабатываем конструкцию: isLoading.
      isLoading: false,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: autoConnectRequest.
      autoConnectRequest: 0,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("помнит активный сервер", () => {
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().setActiveServer("srv-1");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useVpnCoreStore.getState().activeServerId).toBe("srv-1");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает активный сервер при отключении", () => {
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().setActiveServer("srv-1");
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().setActiveServer(null);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useVpnCoreStore.getState().activeServerId).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("счётчик запросов на подключение одноразовый", () => {
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().requestAutoConnect();
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().requestAutoConnect();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useVpnCoreStore.getState().autoConnectRequest).toBe(2);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().consumeAutoConnectRequest();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useVpnCoreStore.getState().autoConnectRequest).toBe(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("хранит состояние ядра", () => {
    // Обрабатываем конструкцию: useVpnCoreStore.
    useVpnCoreStore.getState().setStatus({
      // Обрабатываем конструкцию: installed.
      installed: true,
      // Обрабатываем конструкцию: running.
      running: true,
      // Обрабатываем конструкцию: activeServerId.
      activeServerId: "srv-1",
      // Обрабатываем конструкцию: uptimeSec.
      uptimeSec: 12,
      // Обрабатываем конструкцию: socksPort.
      socksPort: 1080,
      // Обрабатываем конструкцию: httpPort.
      httpPort: 8080,
      // Обрабатываем конструкцию: pid.
      pid: 42,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useVpnCoreStore.getState().status?.running).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(useVpnCoreStore.getState().status?.pid).toBe(42);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("migratePersistedState", () => {
  // Сохраняем пояснение разработчика: // Списки серверов прошлой сборки больше не нужны: подписка …
  // Списки серверов прошлой сборки больше не нужны: подписка всегда
  // Сохраняем пояснение разработчика: // скачивается заново, а сохранённый список только путает.
  // скачивается заново, а сохранённый список только путает.
  // Обрабатываем конструкцию: it.
  it("выбрасывает сохранённые серверы", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedState({ subscriptionUr….
    const migrated = migratePersistedState({
      // Обрабатываем конструкцию: subscriptionUrl.
      subscriptionUrl: "https://sub.example.com/list",
      // Обрабатываем конструкцию: servers.
      servers: [{ id: "old" }],
      // Обрабатываем конструкцию: hiddenServerIds.
      hiddenServerIds: ["old"],
      // Обрабатываем конструкцию: activeServerId.
      activeServerId: "old",
      // Закрываем текущий блок.
    } as never);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated).toEqual({ activeServerId: "old" });
    // Обрабатываем конструкцию: expect.
    expect(migrated).not.toHaveProperty("servers");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет активный сервер", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedState({ activeServerId….
    const migrated = migratePersistedState({ activeServerId: "srv-1" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated?.activeServerId).toBe("srv-1");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пустое состояние остаётся пустым", () => {
    // Обрабатываем конструкцию: expect.
    expect(migratePersistedState(undefined)).toBeUndefined();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
