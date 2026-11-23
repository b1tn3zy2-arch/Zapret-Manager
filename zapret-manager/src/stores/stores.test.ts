// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useAppStore.
import { migratePersistedAppState, useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { selectSettings, useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/lib/settingsSchema.
import { validateSettings } from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/lib/constants.
import { ROUTES } from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { UpdateInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const UPDATE_INFO: UpdateInfo = { available: true, curr….
const UPDATE_INFO: UpdateInfo = {
  // Обрабатываем конструкцию: available.
  available: true,
  // Обрабатываем конструкцию: currentVersion.
  currentVersion: "1.10.3",
  // Обрабатываем конструкцию: latestVersion.
  latestVersion: "1.11.0",
  // Обрабатываем конструкцию: isNewer.
  isNewer: true,
  // Обрабатываем конструкцию: ignored.
  ignored: false,
  // Обрабатываем конструкцию: releaseName.
  releaseName: "Release 1.11.0",
  // Обрабатываем конструкцию: releaseNotes.
  releaseNotes: "Что-то нового",
  // Обрабатываем конструкцию: publishedAt.
  publishedAt: "2026-01-01T00:00:00Z",
  // Обрабатываем конструкцию: downloadUrl.
  downloadUrl: "https://github.com/x/y/releases/download/v1.11.0/zip",
  // Обрабатываем конструкцию: assetName.
  assetName: "zip",
  // Обрабатываем конструкцию: digest.
  digest: "sha256:0123456789abcdef",
  // Обрабатываем конструкцию: size.
  size: 1_024,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useAppStore", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.setState({
      // Обрабатываем конструкцию: activePage.
      activePage: ROUTES.dashboard,
      // Обрабатываем конструкцию: sidebarCollapsed.
      sidebarCollapsed: false,
      // Обрабатываем конструкцию: dashboardMode.
      dashboardMode: "dpi",
      // Обрабатываем конструкцию: settingsSection.
      settingsSection: "general",
      // Обрабатываем конструкцию: strategiesSortMode.
      strategiesSortMode: "name",
      // Обрабатываем конструкцию: strategiesRatingFilter.
      strategiesRatingFilter: "all",
      // Обрабатываем конструкцию: strategiesServiceFilter.
      strategiesServiceFilter: [],
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("стартует в режиме обхода DPI", () => {
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().dashboardMode).toBe("dpi");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключает режим дашборда", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().setDashboardMode("vpn");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().dashboardMode).toBe("vpn");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключает страницу", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().setActivePage(ROUTES.logs);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().activePage).toBe(ROUTES.logs);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключает свёртку сайдбара", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().toggleSidebar();
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().setSidebarCollapsed(false);
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("меняет раздел настроек и сортировку стратегий", () => {
    // Обрабатываем конструкцию: const store = useAppStore.getState().
    const store = useAppStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setSettingsSection("updates");
    // Обрабатываем конструкцию: store.
    store.setStrategiesSortMode("rating");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().settingsSection).toBe("updates");
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesSortMode).toBe("rating");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключает фильтр замеров и сервисов", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().setStrategiesRatingFilter("measured");
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesRatingFilter).toBe("measured");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().setStrategiesRatingFilter("unmeasured");
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesRatingFilter).toBe("unmeasured");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().toggleStrategiesService("discord");
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesServiceFilter).toEqual(["discord"]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает фильтры стратегий", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().setStrategiesRatingFilter("unmeasured");
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().resetStrategyFilters();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesRatingFilter).toBe("all");
    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesServiceFilter).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обрезает сервисные фильтры, оставшиеся без стратегий", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().toggleStrategiesService("discord");
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().toggleStrategiesService("outlast trials");
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Карточку удалили: сервис исчез из списка — фильтр сбрасыв…
    // Карточку удалили: сервис исчез из списка — фильтр сбрасывается сам.
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().pruneStrategiesService(["discord"]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesServiceFilter).toEqual(["discord"]);
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Пустой список сервисов (стратегий нет вовсе) очищает всё.
    // Пустой список сервисов (стратегий нет вовсе) очищает всё.
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.getState().pruneStrategiesService([]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useAppStore.getState().strategiesServiceFilter).toEqual([]);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("migratePersistedAppState", () => {
  // Обрабатываем конструкцию: it.
  it("сбрасывает удалённую секцию about на general", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedAppState({ settingsSec….
    const migrated = migratePersistedAppState({
      // Обрабатываем конструкцию: settingsSection.
      settingsSection: "about" as never,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.settingsSection).toBe("general");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("оставляет валидную секцию без изменений", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedAppState({ settingsSec….
    const migrated = migratePersistedAppState({ settingsSection: "updates" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.settingsSection).toBe("updates");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает неизвестную сортировку и фильтр", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedAppState({ strategiesS….
    const migrated = migratePersistedAppState({
      // Обрабатываем конструкцию: strategiesSortMode.
      strategiesSortMode: "rarity-desc" as never,
      // Обрабатываем конструкцию: strategiesRatingFilter.
      strategiesRatingFilter: "always" as never,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.strategiesSortMode).toBe("name");
    // Обрабатываем конструкцию: expect.
    expect(migrated.strategiesRatingFilter).toBe("all");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не сбрасывает остальные поля при миграции и отбрасывает удалённые ключи", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedAppState({ settingsSec….
    const migrated = migratePersistedAppState({
      // Обрабатываем конструкцию: settingsSection.
      settingsSection: "about" as never,
      // Обрабатываем конструкцию: sidebarCollapsed.
      sidebarCollapsed: true,
      // Обрабатываем конструкцию: activePage.
      activePage: "monitor",
      // Обрабатываем конструкцию: strategiesSortMode.
      strategiesSortMode: "rating",
      // Обрабатываем конструкцию: strategiesServiceFilter.
      strategiesServiceFilter: ["discord"],
      // Сохраняем пояснение разработчика: // удалены в 1.0.0: молча отбрасываются и не приносят типы о…
      // удалены в 1.0.0: молча отбрасываются и не приносят типы обратно
      // Обрабатываем конструкцию: strategiesViewMode.
      strategiesViewMode: "list",
      // Обрабатываем конструкцию: strategiesRarityFilter.
      strategiesRarityFilter: ["epic"],
      // Закрываем текущий блок.
    } as never);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.settingsSection).toBe("general");
    // Обрабатываем конструкцию: expect.
    expect(migrated.sidebarCollapsed).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(migrated.activePage).toBe("monitor");
    // Обрабатываем конструкцию: expect.
    expect(migrated.strategiesSortMode).toBe("rating");
    // Обрабатываем конструкцию: expect.
    expect(migrated.strategiesRatingFilter).toBe("all");
    // Обрабатываем конструкцию: expect.
    expect(migrated.strategiesServiceFilter).toEqual(["discord"]);
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: (migrated as Record<string, unknown>).
      (migrated as Record<string, unknown>).strategiesViewMode
      // Закрываем выражение или список аргументов.
    ).toBeUndefined();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: (migrated as Record<string, unknown>).
      (migrated as Record<string, unknown>).strategiesRarityFilter
      // Закрываем выражение или список аргументов.
    ).toBeUndefined();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переживает пустое и отсутствующее состояние", () => {
    // Обрабатываем конструкцию: expect.
    expect(migratePersistedAppState(undefined)).toEqual(
      // Обрабатываем конструкцию: migratePersistedAppState.
      migratePersistedAppState({})
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: expect.
    expect(migratePersistedAppState(undefined)?.activePage).toBe(
      // Обрабатываем конструкцию: ROUTES.
      ROUTES.dashboard
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет корректный режим дашборда", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: migratePersistedAppState.
      migratePersistedAppState({ dashboardMode: "vpn" }).dashboardMode
      // Закрываем выражение или список аргументов.
    ).toBe("vpn");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает неизвестный режим на dpi", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: migratePersistedAppState.
      // Продолжаем цепочку вызовов.
      // Продолжаем предыдущую конструкцию.
      migratePersistedAppState({ dashboardMode: "proxy" as never })
        .dashboardMode
      // Закрываем выражение или список аргументов.
    ).toBe("dpi");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не сбрасывает секцию, исправляя только режим", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedAppState({ dashboardMo….
    const migrated = migratePersistedAppState({
      // Обрабатываем конструкцию: dashboardMode.
      dashboardMode: "proxy" as never,
      // Обрабатываем конструкцию: settingsSection.
      settingsSection: "updates",
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.dashboardMode).toBe("dpi");
    // Обрабатываем конструкцию: expect.
    expect(migrated.settingsSection).toBe("updates");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает удалённые секции games и outlast на general", () => {
    // Сохраняем пояснение разработчика: // секция vpn снова есть в приложении, её сбрасывать нельзя
    // секция vpn снова есть в приложении, её сбрасывать нельзя
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: migratePersistedAppState.
      // Продолжаем цепочку вызовов.
      // Продолжаем предыдущую конструкцию.
      migratePersistedAppState({ settingsSection: "games" as never })
        .settingsSection
      // Закрываем выражение или список аргументов.
    ).toBe("general");
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: migratePersistedAppState.
      // Продолжаем цепочку вызовов.
      // Продолжаем предыдущую конструкцию.
      migratePersistedAppState({ settingsSection: "outlast" as never })
        .settingsSection
      // Закрываем выражение или список аргументов.
    ).toBe("general");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет секцию vpn", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: migratePersistedAppState.
      migratePersistedAppState({ settingsSection: "vpn" }).settingsSection
      // Закрываем выражение или список аргументов.
    ).toBe("vpn");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сбрасывает значение не строкового типа", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedAppState({ settingsSec….
    const migrated = migratePersistedAppState({
      // Обрабатываем конструкцию: settingsSection.
      settingsSection: 42 as never,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.settingsSection).toBe("general");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useLogsStore", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.setState({
      // Обрабатываем конструкцию: logs.
      logs: [],
      // Обрабатываем конструкцию: pendingBatch.
      pendingBatch: [],
      // Обрабатываем конструкцию: filter.
      filter: {},
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет запись в буфер с проставленным id", () => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .addLog({ level: "info", source: "system", message: "Старт" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const [entry] = useLogsStore.getState().pendingBatch.
    const [entry] = useLogsStore.getState().pendingBatch;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(entry?.message).toBe("Старт");
    // Обрабатываем конструкцию: expect.
    expect(entry?.id).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(entry?.timestamp).toBeTypeOf("number");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("addLogs сразу переносит записи в логи", () => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .addLogs([{ level: "error", source: "strategy", message: "Ошибка" }]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().logs).toHaveLength(1);
    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().pendingBatch).toHaveLength(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("flush переносит буфер в логи", () => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .addLog({ level: "info", source: "system", message: "Строка" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().logs).toHaveLength(0);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().flush();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().logs).toHaveLength(1);
    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().pendingBatch).toHaveLength(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("очищает логи", () => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .addLogs([{ level: "info", source: "system", message: "Строка" }]);
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().clearLogs();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().logs).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет и сбрасывает фильтр", () => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().setFilter({ search: "zapret" });
    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().filter.search).toBe("zapret");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().resetFilter();
    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().filter.search).toBeUndefined();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ограничивает размер буфера и подрезает логи", () => {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().setBufferSize(2);
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().addLogs([
      // Открываем объектный литерал.
      { level: "info", source: "user", message: "1" },
      // Открываем объектный литерал.
      { level: "info", source: "user", message: "2" },
      // Открываем объектный литерал.
      { level: "info", source: "user", message: "3" },
      // Закрываем массив или список.
    ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().bufferSize).toBe(2);
    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().logs).toHaveLength(2);
    // Обрабатываем конструкцию: expect.
    expect(useLogsStore.getState().logs[1]?.message).toBe("3");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useUpdateStore", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().reset();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет информацию об обновлении", () => {
    // Обрабатываем конструкцию: const store = useUpdateStore.getState().
    const store = useUpdateStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setStatus("available");
    // Обрабатываем конструкцию: store.
    store.setInfo(UPDATE_INFO);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().status).toBe("available");
    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().info?.latestVersion).toBe("1.11.0");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("открывает и закрывает модалку", () => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().openModal();
    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().isModalOpen).toBe(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().closeModal();
    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().isModalOpen).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("скрывает бейдж до следующей проверки", () => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().setInfo(UPDATE_INFO);
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().dismiss();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().isDismissed).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("reset возвращает начальное состояние", () => {
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().setInfo(UPDATE_INFO);
    // Обрабатываем конструкцию: useUpdateStore.
    useUpdateStore.getState().reset();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().info).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(useUpdateStore.getState().isDismissed).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useSettingsStore", () => {
  // Обрабатываем конструкцию: it.
  it("selectSettings отдаёт текущие настройки", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState({ settings: validateSettings({}) });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(selectSettings(useSettingsStore.getState()).general).toBeTypeOf(
      // Обрабатываем конструкцию: object.
      "object"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет секцию настроек", () => {
    // Обрабатываем конструкцию: const next = validateSettings({ general: { ...validateS….
    const next = validateSettings({
      // Обрабатываем конструкцию: general.
      general: { ...validateSettings({}).general, minimizeToTray: true },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState({ settings: next });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.general.minimizeToTray).toBe(
      // Обрабатываем конструкцию: true.
      true
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
