import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/storage", () => ({
  readSettingsFile: vi.fn(async () => null),
  writeSettingsFile: vi.fn(async () => true),
}));

import { readSettingsFile, writeSettingsFile } from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { validateSettings } from "@/lib/settingsSchema";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  selectVpnActive,
  selectVpnConfigs,
  selectVpnSwitching,
  useVpnStore,
} from "@/stores/useVpnStore";
import type { VpnConfigInfo } from "@/types";

const CONFIG: VpnConfigInfo = {
  id: "cfg_1",
  name: "Work",
  path: "C:\\wg\\work.conf",
  endpoint: "vpn.example.com:51820",
  address: ["10.8.0.2/32"],
  dns: ["1.1.1.1"],
  allowedIps: ["0.0.0.0/0"],
  size: 320,
  importedAt: 1_700_000_000_000,
};

describe("useSettingsStore: обновления", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: validateSettings({}),
      loaded: true,
      loading: false,
      error: null,
      saveState: "idle",
    });
  });

  it("обновляет общие настройки", () => {
    useSettingsStore.getState().updateGeneral({ minimizeToTray: true });

    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      true
    );
  });

  it("обновляет настройки внешнего вида", () => {
    useSettingsStore.getState().updateAppearance({ theme: "dark" });

    expect(useSettingsStore.getState().settings.appearance.theme).toBe("dark");
  });

  it("обновляет постобработку", () => {
    useSettingsStore.getState().updatePostProcessing({ bloom: "strong" });

    expect(
      useSettingsStore.getState().settings.appearance.postProcessing.bloom
    ).toBe("strong");
  });

  it("обновляет игры, vpn, advanced и настройки стратегий", () => {
    const store = useSettingsStore.getState();

    store.updateGame("outlast-trials", { enabled: true });
    store.updateVpn({ autoConnect: true });
    store.updateAdvanced({ strategyStartTimeoutSec: 15 });
    store.updateStrategyUpdates({ autoCheck: false });

    const settings = useSettingsStore.getState().settings;

    expect(
      settings.games.find((game) => game.id === "outlast-trials")?.enabled
    ).toBe(true);
    expect(settings.vpn.autoConnect).toBe(true);
    expect(settings.advanced.strategyStartTimeoutSec).toBe(15);
    expect(settings.strategyUpdates.autoCheck).toBe(false);
  });

  it("добавляет и удаляет пользовательские игры", () => {
    const store = useSettingsStore.getState();

    store.addGame({
      id: "my-game",
      name: "Моя игра",
      icon: "Gamepad2",
      enabled: false,
      builtin: false,
      domains: [],
      ipRanges: [],
      ports: [],
      autoRestore: true,
      createBackup: true,
      createdAt: 1,
    });

    expect(
      useSettingsStore.getState().settings.games.some((g) => g.id === "my-game")
    ).toBe(true);

    store.removeGame("my-game");

    expect(
      useSettingsStore.getState().settings.games.some((g) => g.id === "my-game")
    ).toBe(false);
  });

  it("не удаляет встроенные игры", () => {
    const store = useSettingsStore.getState();
    const before = store.settings.games.length;

    store.removeGame("outlast-trials");

    expect(useSettingsStore.getState().settings.games).toHaveLength(before);
    expect(
      useSettingsStore
        .getState()
        .settings.games.some((game) => game.id === "outlast-trials")
    ).toBe(true);
  });

  it("сбрасывает список игр к дефолтному", () => {
    const store = useSettingsStore.getState();

    store.addGame({
      id: "temp",
      name: "Временная",
      icon: "Gamepad2",
      enabled: true,
      builtin: false,
      domains: [],
      ipRanges: [],
      ports: [],
      autoRestore: true,
      createBackup: true,
      createdAt: 1,
    });
    store.resetGames();

    const games = useSettingsStore.getState().settings.games;

    expect(games.some((game) => game.id === "temp")).toBe(false);
    expect(games.every((game) => game.enabled)).toBe(false);
  });

  it("заменяет настройки целиком", () => {
    useSettingsStore
      .getState()
      .replaceSettings(validateSettings({ strategiesFolder: "C:\\other" }));

    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      "C:\\other"
    );
  });

  it("сбрасывает настройки к дефолтам", () => {
    useSettingsStore.getState().updateGeneral({ minimizeToTray: true });
    useSettingsStore.getState().resetToDefaults();

    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      DEFAULT_SETTINGS.general.minimizeToTray
    );
  });

  it("сбрасывает отдельную секцию", () => {
    useSettingsStore.getState().updateGeneral({ minimizeToTray: true });
    useSettingsStore.getState().resetSection("general");

    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      DEFAULT_SETTINGS.general.minimizeToTray
    );
  });

  it("хранит последнюю стратегию и папку", () => {
    useSettingsStore.getState().setLastStrategyId("st_9");
    useSettingsStore.getState().setStrategiesFolder("C:\\zapret");

    expect(useSettingsStore.getState().settings.lastStrategyId).toBe("st_9");
    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      "C:\\zapret"
    );
  });

  it("применяет частичный патч", () => {
    useSettingsStore
      .getState()
      .updateSettings({ strategiesFolder: "D:\\zapret" });

    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      "D:\\zapret"
    );
  });

  it("loadFromFile читает настройки из файла", async () => {
    vi.mocked(readSettingsFile).mockResolvedValueOnce({
      strategiesFolder: "E:\\from-file",
    } as never);

    const loaded = await useSettingsStore.getState().loadFromFile();

    expect(loaded).toBe(true);
    expect(useSettingsStore.getState().settings.strategiesFolder).toBe(
      "E:\\from-file"
    );
  });

  it("saveToFile сохраняет настройки", async () => {
    const saved = await useSettingsStore.getState().saveToFile();

    expect(saved).toBe(true);
    expect(writeSettingsFile).toHaveBeenCalled();
  });
});

describe("useVpnStore", () => {
  beforeEach(() => {
    useVpnStore.setState({
      configs: [],
      activeConfigId: null,
      status: { ...useVpnStore.getState().status, state: "disconnected" },
      isSwitching: false,
      switchStep: null,
      wireguardInstalled: false,
      killSwitchActive: false,
      error: null,
    });
  });

  it("начинает с пустого состояния", () => {
    const state = useVpnStore.getState();

    expect(selectVpnConfigs(state)).toEqual([]);
    expect(selectVpnActive(state)).toBe(false);
    expect(selectVpnSwitching(state)).toBe(false);
  });

  it("добавляет и удаляет конфигурации", () => {
    const store = useVpnStore.getState();

    store.addConfig(CONFIG);
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(1);

    store.addConfig(CONFIG);
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(1);

    store.setActiveConfig(CONFIG.id);
    expect(useVpnStore.getState().activeConfigId).toBe(CONFIG.id);

    store.removeConfig(CONFIG.id);
    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(0);
    expect(useVpnStore.getState().activeConfigId).toBeNull();
  });

  it("заменяет список конфигураций", () => {
    useVpnStore.getState().setConfigs([CONFIG, { ...CONFIG, id: "cfg_2" }]);

    expect(selectVpnConfigs(useVpnStore.getState())).toHaveLength(2);
  });

  it("обновляет статус и флаги переключения", () => {
    const store = useVpnStore.getState();

    store.setStatus({ state: "connected", endpoint: "10.0.0.1:51820" });
    store.setSwitching(true);
    store.setSwitchStep("starting-vpn");
    store.setWireguardInstalled(true);
    store.setKillSwitchActive(true);

    const state = useVpnStore.getState();

    expect(state.status.state).toBe("connected");
    expect(selectVpnSwitching(state)).toBe(true);
    expect(state.switchStep).toBe("starting-vpn");
    expect(state.wireguardInstalled).toBe(true);
    expect(state.killSwitchActive).toBe(true);
  });

  it("ошибка переключения сохраняется и очищается", () => {
    useVpnStore.getState().setError("не удалось поднять интерфейс");
    expect(useVpnStore.getState().error).toBe("не удалось поднять интерфейс");

    useVpnStore.getState().setError(null);
    expect(useVpnStore.getState().error).toBeNull();
  });
});
