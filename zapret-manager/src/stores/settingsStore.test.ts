// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/lib/storage", () => ({
  // Обрабатываем конструкцию: readSettingsFile.
  readSettingsFile: vi.fn(async () => null),
  // Обрабатываем конструкцию: writeSettingsFile.
  writeSettingsFile: vi.fn(async () => true),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/storage.
import { readSettingsFile, writeSettingsFile } from "@/lib/storage";
// Импортируем зависимости из модуля @/lib/defaults.
import { DEFAULT_SETTINGS } from "@/lib/defaults";
// Импортируем зависимости из модуля @/lib/settingsSchema.
import { validateSettings } from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import {
  // Подключаем именованный импорт selectVpnActive.
  selectVpnActive,
  // Подключаем именованный импорт selectVpnConfigs.
  selectVpnConfigs,
  // Подключаем именованный импорт selectVpnSwitching.
  selectVpnSwitching,
  // Подключаем именованный импорт useVpnStore.
  useVpnStore,
  // Закрываем текущий блок.
} from "@/stores/useVpnStore";
// Импортируем зависимости из модуля @/types.
import type { VpnConfigInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const CONFIG: VpnConfigInfo = { id: cfg_1, name: Work, ….
const CONFIG: VpnConfigInfo = {
  // Обрабатываем конструкцию: id.
  id: "cfg_1",
  // Обрабатываем конструкцию: name.
  name: "Work",
  // Обрабатываем конструкцию: path.
  path: "C:\\wg\\work.conf",
  // Обрабатываем конструкцию: endpoint.
  endpoint: "vpn.example.com:51820",
  // Обрабатываем конструкцию: address.
  address: ["10.8.0.2/32"],
  // Обрабатываем конструкцию: dns.
  dns: ["1.1.1.1"],
  // Обрабатываем конструкцию: allowedIps.
  allowedIps: ["0.0.0.0/0"],
  // Обрабатываем конструкцию: size.
  size: 320,
  // Обрабатываем конструкцию: importedAt.
  importedAt: 1_700_000_000_000,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useSettingsStore: обновления", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState({
      // Обрабатываем конструкцию: settings.
      settings: validateSettings({}),
      // Обрабатываем конструкцию: loaded.
      loaded: true,
      // Обрабатываем конструкцию: loading.
      loading: false,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: saveState.
      saveState: "idle",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет общие настройки", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().updateGeneral({ minimizeToTray: true });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      // Обрабатываем конструкцию: true.
      true
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет настройки внешнего вида", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().updateAppearance({ theme: "dark" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.appearance.theme).toBe("dark");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет игры, vpn, advanced и настройки стратегий", () => {
    // Обрабатываем конструкцию: const store = useSettingsStore.getState().
    const store = useSettingsStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.updateGame("outlast-trials", { enabled: true });
    // Обрабатываем конструкцию: store.
    store.updateVpn({ autoConnect: true });
    // Обрабатываем конструкцию: store.
    store.updateAdvanced({ strategyStartTimeoutSec: 15 });
    // Обрабатываем конструкцию: store.
    store.updateStrategyUpdates({ autoCheck: false });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const settings = useSettingsStore.getState().settings.
    const settings = useSettingsStore.getState().settings;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: settings.
      settings.games.find((game) => game.id === "outlast-trials")?.enabled
      // Закрываем выражение или список аргументов.
    ).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(settings.vpn.autoConnect).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(settings.advanced.strategyStartTimeoutSec).toBe(15);
    // Обрабатываем конструкцию: expect.
    expect(settings.strategyUpdates.autoCheck).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет и удаляет пользовательские игры", () => {
    // Обрабатываем конструкцию: const store = useSettingsStore.getState().
    const store = useSettingsStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame({
      // Обрабатываем конструкцию: id.
      id: "my-game",
      // Обрабатываем конструкцию: name.
      name: "Моя игра",
      // Обрабатываем конструкцию: icon.
      icon: "Gamepad2",
      // Обрабатываем конструкцию: enabled.
      enabled: false,
      // Обрабатываем конструкцию: builtin.
      builtin: false,
      // Обрабатываем конструкцию: domains.
      domains: [],
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: [],
      // Обрабатываем конструкцию: ports.
      ports: [],
      // Обрабатываем конструкцию: autoRestore.
      autoRestore: true,
      // Обрабатываем конструкцию: createBackup.
      createBackup: true,
      // Обрабатываем конструкцию: createdAt.
      createdAt: 1,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore.getState().settings.games.some((g) => g.id === "my-game")
      // Закрываем выражение или список аргументов.
    ).toBe(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.removeGame("my-game");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore.getState().settings.games.some((g) => g.id === "my-game")
      // Закрываем выражение или список аргументов.
    ).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("удаляет и встроенные игры: вернуть их можно сбросом списка", () => {
    // Обрабатываем конструкцию: const store = useSettingsStore.getState().
    const store = useSettingsStore.getState();
    // Обрабатываем конструкцию: const before = store.settings.games.length.
    const before = store.settings.games.length;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.removeGame("outlast-trials");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.games).toHaveLength(before - 1);
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore
        // Продолжаем цепочку вызовов.
        .getState()
        // Продолжаем цепочку вызовов.
        .settings.games.some((game) => game.id === "outlast-trials")
      // Закрываем выражение или список аргументов.
    ).toBe(false);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().resetGames();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore
        // Продолжаем цепочку вызовов.
        .getState()
        // Продолжаем цепочку вызовов.
        .settings.games.some((game) => game.id === "outlast-trials")
      // Закрываем выражение или список аргументов.
    ).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает список игр к дефолтному", () => {
    // Обрабатываем конструкцию: const store = useSettingsStore.getState().
    const store = useSettingsStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame({
      // Обрабатываем конструкцию: id.
      id: "temp",
      // Обрабатываем конструкцию: name.
      name: "Временная",
      // Обрабатываем конструкцию: icon.
      icon: "Gamepad2",
      // Обрабатываем конструкцию: enabled.
      enabled: true,
      // Обрабатываем конструкцию: builtin.
      builtin: false,
      // Обрабатываем конструкцию: domains.
      domains: [],
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: [],
      // Обрабатываем конструкцию: ports.
      ports: [],
      // Обрабатываем конструкцию: autoRestore.
      autoRestore: true,
      // Обрабатываем конструкцию: createBackup.
      createBackup: true,
      // Обрабатываем конструкцию: createdAt.
      createdAt: 1,
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: store.
    store.resetGames();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const games = useSettingsStore.getState().settings.game….
    const games = useSettingsStore.getState().settings.games;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(games.some((game) => game.id === "temp")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(games.every((game) => game.enabled)).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("заменяет настройки целиком", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .replaceSettings(validateSettings({ strategiesFolder: "C:\\other" }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      // Обрабатываем конструкцию: C:\\other.
      "C:\\other"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает настройки к дефолтам", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().updateGeneral({ minimizeToTray: true });
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().resetToDefaults();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      // Обрабатываем конструкцию: DEFAULT_SETTINGS.
      DEFAULT_SETTINGS.general.minimizeToTray
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает отдельную секцию", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().updateGeneral({ minimizeToTray: true });
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().resetSection("general");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      // Обрабатываем конструкцию: DEFAULT_SETTINGS.
      DEFAULT_SETTINGS.general.minimizeToTray
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("хранит последнюю стратегию и папку", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().setLastStrategyId("st_9");
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().setStrategiesFolder("C:\\zapret");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.lastStrategyId).toBe("st_9");
    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      // Обрабатываем конструкцию: C:\\zapret.
      "C:\\zapret"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("применяет частичный патч", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .updateSettings({ strategiesFolder: "D:\\zapret" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      // Обрабатываем конструкцию: D:\\zapret.
      "D:\\zapret"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("loadFromFile читает настройки из файла", async () => {
    // Обрабатываем конструкцию: vi.
    vi.mocked(readSettingsFile).mockResolvedValueOnce({
      // Обрабатываем конструкцию: strategiesFolder.
      strategiesFolder: "E:\\from-file",
      // Закрываем текущий блок.
    } as never);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const loaded = await useSettingsStore.getState().loadFr….
    const loaded = await useSettingsStore.getState().loadFromFile();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(loaded).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      // Обрабатываем конструкцию: E:\\from-file.
      "E:\\from-file"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("saveToFile сохраняет настройки", async () => {
    // Обрабатываем конструкцию: const saved = await useSettingsStore.getState().saveToF….
    const saved = await useSettingsStore.getState().saveToFile();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(saved).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(writeSettingsFile).toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useVpnStore", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.setState({
      // Обрабатываем конструкцию: configs.
      configs: [],
      // Обрабатываем конструкцию: activeConfigId.
      activeConfigId: null,
      // Обрабатываем конструкцию: status.
      status: { ...useVpnStore.getState().status, state: "disconnected" },
      // Обрабатываем конструкцию: isSwitching.
      isSwitching: false,
      // Обрабатываем конструкцию: switchStep.
      switchStep: null,
      // Обрабатываем конструкцию: wireguardInstalled.
      wireguardInstalled: false,
      // Обрабатываем конструкцию: killSwitchActive.
      killSwitchActive: false,
      // Обрабатываем конструкцию: error.
      error: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("начинает с пустого состояния", () => {
    // Обрабатываем конструкцию: const state = useVpnStore.getState().
    const state = useVpnStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(selectVpnConfigs(state)).toEqual([]);
    // Обрабатываем конструкцию: expect.
    expect(selectVpnActive(state)).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(selectVpnSwitching(state)).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет и удаляет конфигурации", () => {
    // Обрабатываем конструкцию: const store = useVpnStore.getState().
    const store = useVpnStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addConfig(CONFIG);
    // Обрабатываем конструкцию: expect.
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(1);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addConfig(CONFIG);
    // Обрабатываем конструкцию: expect.
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(1);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setActiveConfig(CONFIG.id);
    // Обрабатываем конструкцию: expect.
    expect(useVpnStore.getState().activeConfigId).toBe(CONFIG.id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.removeConfig(CONFIG.id);
    // Обрабатываем конструкцию: expect.
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(0);
    // Обрабатываем конструкцию: expect.
    expect(useVpnStore.getState().activeConfigId).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("заменяет список конфигураций", () => {
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setConfigs([CONFIG, { ...CONFIG, id: "cfg_2" }]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(2);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет статус и флаги переключения", () => {
    // Обрабатываем конструкцию: const store = useVpnStore.getState().
    const store = useVpnStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setStatus({ state: "connected", endpoint: "10.0.0.1:51820" });
    // Обрабатываем конструкцию: store.
    store.setSwitching(true);
    // Обрабатываем конструкцию: store.
    store.setSwitchStep("starting-vpn");
    // Обрабатываем конструкцию: store.
    store.setWireguardInstalled(true);
    // Обрабатываем конструкцию: store.
    store.setKillSwitchActive(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useVpnStore.getState().
    const state = useVpnStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(state.status.state).toBe("connected");
    // Обрабатываем конструкцию: expect.
    expect(selectVpnSwitching(state)).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(state.switchStep).toBe("starting-vpn");
    // Обрабатываем конструкцию: expect.
    expect(state.wireguardInstalled).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(state.killSwitchActive).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ошибка переключения сохраняется и очищается", () => {
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setError("не удалось поднять интерфейс");
    // Обрабатываем конструкцию: expect.
    expect(useVpnStore.getState().error).toBe("не удалось поднять интерфейс");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setError(null);
    // Обрабатываем конструкцию: expect.
    expect(useVpnStore.getState().error).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
