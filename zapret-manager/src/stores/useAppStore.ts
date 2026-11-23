// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware.
import { persist } from "zustand/middleware";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт isDashboardMode.
  isDashboardMode,
  // Подключаем именованный импорт ROUTES.
  ROUTES,
  // Подключаем именованный импорт type AppPage.
  type AppPage,
  // Подключаем именованный импорт type DashboardMode.
  type DashboardMode,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/settingsConstants.
import { isSettingsSection } from "@/lib/settingsConstants";
// Импортируем зависимости из модуля @/types.
import type { RatingFilterMode, SettingsSection, SortMode } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const DEFAULT_SETTINGS_SECTION: SettingsSection = gener….
const DEFAULT_SETTINGS_SECTION: SettingsSection = "general";
// Обрабатываем конструкцию: const APP_STORE_VERSION = 5.
const APP_STORE_VERSION = 5;
// Обрабатываем конструкцию: const DEFAULT_DASHBOARD_MODE: DashboardMode = dpi.
const DEFAULT_DASHBOARD_MODE: DashboardMode = "dpi";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AppStoreState {
  // Обрабатываем конструкцию: activePage.
  activePage: AppPage;
  // Обрабатываем конструкцию: sidebarCollapsed.
  sidebarCollapsed: boolean;
  // Обрабатываем конструкцию: dashboardMode.
  dashboardMode: DashboardMode;
  // Обрабатываем конструкцию: settingsSection.
  settingsSection: SettingsSection;
  // Обрабатываем конструкцию: strategiesSortMode.
  strategiesSortMode: SortMode;
  // Обрабатываем конструкцию: strategiesRatingFilter.
  strategiesRatingFilter: RatingFilterMode;
  // Обрабатываем конструкцию: strategiesServiceFilter.
  strategiesServiceFilter: string[];
  // Сохраняем пояснение разработчика: id карточек, удалённых крестиком с передней грани.
  /** id карточек, удалённых крестиком с передней грани. */
  // Обрабатываем конструкцию: removedStrategyIds.
  removedStrategyIds: string[];
  // Обрабатываем конструкцию: setActivePage.
  setActivePage: (page: AppPage) => void;
  // Обрабатываем конструкцию: toggleSidebar.
  toggleSidebar: () => void;
  // Обрабатываем конструкцию: setSidebarCollapsed.
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Обрабатываем конструкцию: setDashboardMode.
  setDashboardMode: (mode: DashboardMode) => void;
  // Обрабатываем конструкцию: setSettingsSection.
  setSettingsSection: (section: SettingsSection) => void;
  // Обрабатываем конструкцию: setStrategiesSortMode.
  setStrategiesSortMode: (mode: SortMode) => void;
  // Обрабатываем конструкцию: setStrategiesRatingFilter.
  setStrategiesRatingFilter: (mode: RatingFilterMode) => void;
  // Обрабатываем конструкцию: toggleStrategiesService.
  toggleStrategiesService: (service: string) => void;
  // Сохраняем пояснение разработчика: Убирает сервисные фильтры, которых больше нет ни у одной стр…
  /** Убирает сервисные фильтры, которых больше нет ни у одной стратегии. */
  // Обрабатываем конструкцию: pruneStrategiesService.
  pruneStrategiesService: (available: readonly string[]) => void;
  // Обрабатываем конструкцию: removeStrategy.
  removeStrategy: (id: string) => void;
  // Обрабатываем конструкцию: resetStrategyFilters.
  resetStrategyFilters: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PersistedAppState с контрактом данных.
interface PersistedAppState {
  // Обрабатываем конструкцию: activePage.
  activePage: AppPage;
  // Обрабатываем конструкцию: sidebarCollapsed.
  sidebarCollapsed: boolean;
  // Обрабатываем конструкцию: dashboardMode.
  dashboardMode: DashboardMode;
  // Обрабатываем конструкцию: settingsSection.
  settingsSection: SettingsSection;
  // Обрабатываем конструкцию: strategiesSortMode.
  strategiesSortMode: SortMode;
  // Обрабатываем конструкцию: strategiesRatingFilter.
  strategiesRatingFilter: RatingFilterMode;
  // Обрабатываем конструкцию: strategiesServiceFilter.
  strategiesServiceFilter: string[];
  // Обрабатываем конструкцию: removedStrategyIds.
  removedStrategyIds: string[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию toggleIn.
function toggleIn<T>(list: T[], value: T): T[] {
  // Возвращаем результат: list.includes(value) ? list.filter((item) => item !== v….
  return list.includes(value)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      list.filter((item) => item !== value)
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [...list, value];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию isSortMode.
function isSortMode(value: string): value is SortMode {
  // Возвращаем результат: value === rating || value === name || value === date.
  return value === "rating" || value === "name" || value === "date";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию isRatingFilterMode.
function isRatingFilterMode(value: string): value is RatingFilterMode {
  // Возвращаем результат: value === all || value === measured || value === unmeas….
  return value === "all" || value === "measured" || value === "unmeasured";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function migratePersistedAppState(
  // Обрабатываем конструкцию: state.
  state: Partial<PersistedAppState> | undefined
  // Закрываем выражение или список аргументов.
): Partial<PersistedAppState> {
  // Обрабатываем конструкцию: const known: PersistedAppState = { activePage: state?.a….
  const known: PersistedAppState = {
    // Обрабатываем конструкцию: activePage.
    activePage: state?.activePage ?? ROUTES.dashboard,
    // Обрабатываем конструкцию: sidebarCollapsed.
    sidebarCollapsed: state?.sidebarCollapsed ?? false,
    // Обрабатываем конструкцию: dashboardMode.
    dashboardMode:
      // Обрабатываем конструкцию: state.
      state?.dashboardMode !== undefined && isDashboardMode(state.dashboardMode)
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          state.dashboardMode
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          DEFAULT_DASHBOARD_MODE,
    // Обрабатываем конструкцию: settingsSection.
    settingsSection:
      // Обрабатываем конструкцию: state.
      state?.settingsSection !== undefined &&
      // Обрабатываем конструкцию: isSettingsSection.
      isSettingsSection(state.settingsSection)
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          state.settingsSection
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          DEFAULT_SETTINGS_SECTION,
    // Сохраняем пояснение разработчика: // Сортировка «по редкости» и одноимённый фильтр удалены в 1…
    // Сортировка «по редкости» и одноимённый фильтр удалены в 1.0.0:
    // Сохраняем пояснение разработчика: // значения из старых хранилищ не пропускаем, чтобы типы не …
    // значения из старых хранилищ не пропускаем, чтобы типы не врали.
    // Обрабатываем конструкцию: strategiesSortMode.
    strategiesSortMode:
      // Обрабатываем конструкцию: state.
      state?.strategiesSortMode !== undefined &&
      // Обрабатываем конструкцию: isSortMode.
      isSortMode(state.strategiesSortMode)
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          state.strategiesSortMode
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          "name",
    // Обрабатываем конструкцию: strategiesRatingFilter.
    strategiesRatingFilter:
      // Обрабатываем конструкцию: state.
      state?.strategiesRatingFilter !== undefined &&
      // Обрабатываем конструкцию: isRatingFilterMode.
      isRatingFilterMode(state.strategiesRatingFilter)
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          state.strategiesRatingFilter
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          "all",
    // Обрабатываем конструкцию: strategiesServiceFilter.
    strategiesServiceFilter: state?.strategiesServiceFilter ?? [],
    // Сохраняем пояснение разработчика: // Крестики раньше «скрывали» карточку, теперь удаляют: стар…
    // Крестики раньше «скрывали» карточку, теперь удаляют: старое
    // Сохраняем пояснение разработчика: // хранилище со скрытыми (hiddenStrategyIds) переводится в у…
    // хранилище со скрытыми (hiddenStrategyIds) переводится в удалённые,
    // Сохраняем пояснение разработчика: // вернуть их кнопкой больше нельзя.
    // вернуть их кнопкой больше нельзя.
    // Обрабатываем конструкцию: removedStrategyIds.
    removedStrategyIds:
      // Обрабатываем конструкцию: ( state?.removedStrategyIds ?? ((state as { hiddenStrat….
      // Обрабатываем конструкцию: state.
      // Продолжаем предыдущую конструкцию.
      (
        state?.removedStrategyIds ??
        // Обрабатываем конструкцию: ((state as { hiddenStrategyIds?: unknown })?.hiddenStra….
        ((state as { hiddenStrategyIds?: unknown })?.hiddenStrategyIds as
          // Обрабатываем конструкцию: string.
          string[] | undefined)
      )
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        ?.filter((id): id is string => typeof id === "string") ?? [],
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: known.
  return known;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useAppStore = create<AppStoreState>()(
  // Обрабатываем конструкцию: persist.
  persist(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (set) => ({
      // Обрабатываем конструкцию: activePage.
      activePage: ROUTES.dashboard,
      // Обрабатываем конструкцию: sidebarCollapsed.
      sidebarCollapsed: false,
      // Обрабатываем конструкцию: dashboardMode.
      dashboardMode: DEFAULT_DASHBOARD_MODE,
      // Обрабатываем конструкцию: settingsSection.
      settingsSection: DEFAULT_SETTINGS_SECTION,
      // Обрабатываем конструкцию: setActivePage.
      setActivePage: (page) => set({ activePage: page }),
      // Обрабатываем конструкцию: toggleSidebar.
      toggleSidebar: () =>
        // Обрабатываем конструкцию: set.
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      // Обрабатываем конструкцию: setSidebarCollapsed.
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      // Обрабатываем конструкцию: setDashboardMode.
      setDashboardMode: (mode) => set({ dashboardMode: mode }),
      // Обрабатываем конструкцию: setSettingsSection.
      setSettingsSection: (section) => set({ settingsSection: section }),
      // Обрабатываем конструкцию: strategiesSortMode.
      strategiesSortMode: "name",
      // Обрабатываем конструкцию: strategiesRatingFilter.
      strategiesRatingFilter: "all",
      // Обрабатываем конструкцию: strategiesServiceFilter.
      strategiesServiceFilter: [],
      // Обрабатываем конструкцию: removedStrategyIds.
      removedStrategyIds: [],
      // Обрабатываем конструкцию: setStrategiesSortMode.
      setStrategiesSortMode: (mode) => set({ strategiesSortMode: mode }),
      // Обрабатываем конструкцию: setStrategiesRatingFilter.
      setStrategiesRatingFilter: (mode) =>
        // Обрабатываем конструкцию: set.
        set({ strategiesRatingFilter: mode }),
      // Обрабатываем конструкцию: toggleStrategiesService.
      toggleStrategiesService: (service) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Обрабатываем конструкцию: strategiesServiceFilter.
          strategiesServiceFilter: toggleIn(
            // Обрабатываем конструкцию: state.
            state.strategiesServiceFilter,
            // Обрабатываем конструкцию: service.
            service
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        })),
      // Обрабатываем конструкцию: pruneStrategiesService.
      pruneStrategiesService: (available) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Обрабатываем конструкцию: strategiesServiceFilter.
          strategiesServiceFilter: state.strategiesServiceFilter.filter(
            // Объявляем функцию-обработчик или стрелочную функцию.
            (service) => available.includes(service)
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        })),
      // Обрабатываем конструкцию: removeStrategy.
      removeStrategy: (id) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Разворачиваем ...state в коллекцию.
          ...state,
          // Обрабатываем конструкцию: removedStrategyIds.
          removedStrategyIds: state.removedStrategyIds.includes(id)
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              state.removedStrategyIds
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              [...state.removedStrategyIds, id],
          // Закрываем текущий блок.
        })),
      // Обрабатываем конструкцию: resetStrategyFilters.
      resetStrategyFilters: () =>
        // Обрабатываем конструкцию: set.
        set({
          // Обрабатываем конструкцию: strategiesRatingFilter.
          strategiesRatingFilter: "all",
          // Обрабатываем конструкцию: strategiesServiceFilter.
          strategiesServiceFilter: [],
          // Закрываем текущий блок.
        }),
      // Закрываем текущий блок.
    }),
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: name.
      name: "zapret-manager:app",
      // Обрабатываем конструкцию: version.
      version: APP_STORE_VERSION,
      // Обрабатываем конструкцию: partialize.
      partialize: (state): PersistedAppState => ({
        // Обрабатываем конструкцию: activePage.
        activePage: state.activePage,
        // Обрабатываем конструкцию: sidebarCollapsed.
        sidebarCollapsed: state.sidebarCollapsed,
        // Обрабатываем конструкцию: dashboardMode.
        dashboardMode: state.dashboardMode,
        // Обрабатываем конструкцию: settingsSection.
        settingsSection: state.settingsSection,
        // Обрабатываем конструкцию: strategiesSortMode.
        strategiesSortMode: state.strategiesSortMode,
        // Обрабатываем конструкцию: strategiesRatingFilter.
        strategiesRatingFilter: state.strategiesRatingFilter,
        // Обрабатываем конструкцию: strategiesServiceFilter.
        strategiesServiceFilter: state.strategiesServiceFilter,
        // Обрабатываем конструкцию: removedStrategyIds.
        removedStrategyIds: state.removedStrategyIds,
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: migrate.
      migrate: (persisted) =>
        // Обрабатываем конструкцию: migratePersistedAppState.
        migratePersistedAppState(
          // Обрабатываем конструкцию: persisted.
          persisted as Partial<PersistedAppState> | undefined
          // Закрываем выражение или список аргументов.
        ),
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  )
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectActivePage = (state: AppStoreState): AppPage =>
  // Обрабатываем конструкцию: state.
  state.activePage;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectSidebarCollapsed = (state: AppStoreState): boolean =>
  // Обрабатываем конструкцию: state.
  state.sidebarCollapsed;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectToggleSidebar = (state: AppStoreState): (() => void) =>
  // Обрабатываем конструкцию: state.
  state.toggleSidebar;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectSetSidebarCollapsed = (
  // Обрабатываем конструкцию: state.
  state: AppStoreState
  // Закрываем выражение или список аргументов.
): ((collapsed: boolean) => void) => state.setSidebarCollapsed;
// — разделитель логических блоков —
