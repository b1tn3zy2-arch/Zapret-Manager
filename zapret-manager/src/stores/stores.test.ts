import { beforeEach, describe, expect, it } from "vitest";

import { useAppStore } from "@/stores/useAppStore";
import { useLogsStore } from "@/stores/useLogsStore";
import { useUpdateStore } from "@/stores/useUpdateStore";
import { selectSettings, useSettingsStore } from "@/stores/useSettingsStore";
import { validateSettings } from "@/lib/settingsSchema";
import { ROUTES } from "@/lib/constants";
import type { UpdateInfo } from "@/types";

const UPDATE_INFO: UpdateInfo = {
  available: true,
  currentVersion: "1.10.3",
  latestVersion: "1.11.0",
  isNewer: true,
  ignored: false,
  releaseName: "Release 1.11.0",
  releaseNotes: "Что-то нового",
  publishedAt: "2026-01-01T00:00:00Z",
  downloadUrl: "https://github.com/x/y/releases/download/v1.11.0/zip",
  assetName: "zip",
  size: 1_024,
};

describe("useAppStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      activePage: ROUTES.dashboard,
      sidebarCollapsed: false,
      settingsSection: "general",
      strategiesViewMode: "cards",
      strategiesSortMode: "rarity-desc",
      strategiesRarityFilter: [],
      strategiesServiceFilter: [],
    });
  });

  it("переключает страницу", () => {
    useAppStore.getState().setActivePage(ROUTES.logs);

    expect(useAppStore.getState().activePage).toBe(ROUTES.logs);
  });

  it("переключает свёртку сайдбара", () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);

    useAppStore.getState().setSidebarCollapsed(false);
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it("меняет раздел настроек и режимы стратегий", () => {
    const store = useAppStore.getState();

    store.setSettingsSection("updates");
    store.setStrategiesViewMode("list");
    store.setStrategiesSortMode("name");

    expect(useAppStore.getState().settingsSection).toBe("updates");
    expect(useAppStore.getState().strategiesViewMode).toBe("list");
    expect(useAppStore.getState().strategiesSortMode).toBe("name");
  });

  it("переключает фильтры редкости и сервисов", () => {
    useAppStore.getState().toggleStrategiesRarity("epic");
    useAppStore.getState().toggleStrategiesRarity("rare");

    expect(useAppStore.getState().strategiesRarityFilter).toEqual([
      "epic",
      "rare",
    ]);

    useAppStore.getState().toggleStrategiesRarity("epic");
    expect(useAppStore.getState().strategiesRarityFilter).toEqual(["rare"]);

    useAppStore.getState().toggleStrategiesService("discord");
    expect(useAppStore.getState().strategiesServiceFilter).toEqual(["discord"]);
  });

  it("сбрасывает фильтры стратегий", () => {
    useAppStore.getState().toggleStrategiesRarity("legendary");
    useAppStore.getState().resetStrategyFilters();

    expect(useAppStore.getState().strategiesRarityFilter).toEqual([]);
    expect(useAppStore.getState().strategiesServiceFilter).toEqual([]);
  });
});

describe("useLogsStore", () => {
  beforeEach(() => {
    useLogsStore.setState({
      logs: [],
      pendingBatch: [],
      filter: {},
    });
  });

  it("добавляет запись в буфер с проставленным id", () => {
    useLogsStore
      .getState()
      .addLog({ level: "info", source: "system", message: "Старт" });

    const [entry] = useLogsStore.getState().pendingBatch;

    expect(entry?.message).toBe("Старт");
    expect(entry?.id).toBeTypeOf("string");
    expect(entry?.timestamp).toBeTypeOf("number");
  });

  it("addLogs сразу переносит записи в логи", () => {
    useLogsStore
      .getState()
      .addLogs([{ level: "error", source: "strategy", message: "Ошибка" }]);

    expect(useLogsStore.getState().logs).toHaveLength(1);
    expect(useLogsStore.getState().pendingBatch).toHaveLength(0);
  });

  it("flush переносит буфер в логи", () => {
    useLogsStore
      .getState()
      .addLog({ level: "info", source: "system", message: "Строка" });

    expect(useLogsStore.getState().logs).toHaveLength(0);

    useLogsStore.getState().flush();

    expect(useLogsStore.getState().logs).toHaveLength(1);
    expect(useLogsStore.getState().pendingBatch).toHaveLength(0);
  });

  it("очищает логи", () => {
    useLogsStore
      .getState()
      .addLogs([{ level: "info", source: "system", message: "Строка" }]);
    useLogsStore.getState().clearLogs();

    expect(useLogsStore.getState().logs).toEqual([]);
  });

  it("обновляет и сбрасывает фильтр", () => {
    useLogsStore.getState().setFilter({ search: "zapret" });
    expect(useLogsStore.getState().filter.search).toBe("zapret");

    useLogsStore.getState().resetFilter();
    expect(useLogsStore.getState().filter.search).toBeUndefined();
  });

  it("ограничивает размер буфера и подрезает логи", () => {
    useLogsStore.getState().setBufferSize(2);
    useLogsStore.getState().addLogs([
      { level: "info", source: "user", message: "1" },
      { level: "info", source: "user", message: "2" },
      { level: "info", source: "user", message: "3" },
    ]);

    expect(useLogsStore.getState().bufferSize).toBe(2);
    expect(useLogsStore.getState().logs).toHaveLength(2);
    expect(useLogsStore.getState().logs[1]?.message).toBe("3");
  });
});

describe("useUpdateStore", () => {
  beforeEach(() => {
    useUpdateStore.getState().reset();
  });

  it("сохраняет информацию об обновлении", () => {
    const store = useUpdateStore.getState();

    store.setStatus("available");
    store.setInfo(UPDATE_INFO);

    expect(useUpdateStore.getState().status).toBe("available");
    expect(useUpdateStore.getState().info?.latestVersion).toBe("1.11.0");
  });

  it("открывает и закрывает модалку", () => {
    useUpdateStore.getState().openModal();
    expect(useUpdateStore.getState().isModalOpen).toBe(true);

    useUpdateStore.getState().closeModal();
    expect(useUpdateStore.getState().isModalOpen).toBe(false);
  });

  it("скрывает бейдж до следующей проверки", () => {
    useUpdateStore.getState().setInfo(UPDATE_INFO);
    useUpdateStore.getState().dismiss();

    expect(useUpdateStore.getState().isDismissed).toBe(true);
  });

  it("reset возвращает начальное состояние", () => {
    useUpdateStore.getState().setInfo(UPDATE_INFO);
    useUpdateStore.getState().reset();

    expect(useUpdateStore.getState().info).toBeNull();
    expect(useUpdateStore.getState().isDismissed).toBe(false);
  });
});

describe("useSettingsStore", () => {
  it("selectSettings отдаёт текущие настройки", () => {
    useSettingsStore.setState({ settings: validateSettings({}) });

    expect(selectSettings(useSettingsStore.getState()).general).toBeTypeOf(
      "object"
    );
  });

  it("обновляет секцию настроек", () => {
    const next = validateSettings({
      general: { ...validateSettings({}).general, minimizeToTray: true },
    });

    useSettingsStore.setState({ settings: next });

    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      true
    );
  });
});
