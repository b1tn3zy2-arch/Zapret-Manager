import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  isDashboardMode,
  ROUTES,
  type AppPage,
  type DashboardMode,
} from "@/lib/constants";
import { isSettingsSection } from "@/lib/settingsConstants";
import type { Rarity, SettingsSection, SortMode, ViewMode } from "@/types";

const DEFAULT_SETTINGS_SECTION: SettingsSection = "general";
const APP_STORE_VERSION = 2;
const DEFAULT_DASHBOARD_MODE: DashboardMode = "dpi";

export interface AppStoreState {
  activePage: AppPage;
  sidebarCollapsed: boolean;
  dashboardMode: DashboardMode;
  settingsSection: SettingsSection;
  strategiesViewMode: ViewMode;
  strategiesSortMode: SortMode;
  strategiesRarityFilter: Rarity[];
  strategiesServiceFilter: string[];
  setActivePage: (page: AppPage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDashboardMode: (mode: DashboardMode) => void;
  setSettingsSection: (section: SettingsSection) => void;
  setStrategiesViewMode: (mode: ViewMode) => void;
  setStrategiesSortMode: (mode: SortMode) => void;
  toggleStrategiesRarity: (rarity: Rarity) => void;
  toggleStrategiesService: (service: string) => void;
  resetStrategyFilters: () => void;
}

interface PersistedAppState {
  activePage: AppPage;
  sidebarCollapsed: boolean;
  dashboardMode: DashboardMode;
  settingsSection: SettingsSection;
  strategiesViewMode: ViewMode;
  strategiesSortMode: SortMode;
  strategiesRarityFilter: Rarity[];
  strategiesServiceFilter: string[];
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function migratePersistedAppState(
  state: Partial<PersistedAppState> | undefined
): Partial<PersistedAppState> {
  const section = state?.settingsSection;
  const mode = state?.dashboardMode;

  if (typeof mode === "string" && !isDashboardMode(mode)) {
    return { ...state, dashboardMode: DEFAULT_DASHBOARD_MODE };
  }

  if (section === undefined) {
    return state ?? {};
  }

  if (typeof section !== "string" || !isSettingsSection(section)) {
    return { ...state, settingsSection: DEFAULT_SETTINGS_SECTION };
  }

  return state ?? {};
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      activePage: ROUTES.dashboard,
      sidebarCollapsed: false,
      dashboardMode: DEFAULT_DASHBOARD_MODE,
      settingsSection: DEFAULT_SETTINGS_SECTION,
      setActivePage: (page) => set({ activePage: page }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setDashboardMode: (mode) => set({ dashboardMode: mode }),
      setSettingsSection: (section) => set({ settingsSection: section }),
      strategiesViewMode: "cards",
      strategiesSortMode: "rarity-desc",
      strategiesRarityFilter: [],
      strategiesServiceFilter: [],
      setStrategiesViewMode: (mode) => set({ strategiesViewMode: mode }),
      setStrategiesSortMode: (mode) => set({ strategiesSortMode: mode }),
      toggleStrategiesRarity: (rarity) =>
        set((state) => ({
          strategiesRarityFilter: toggleIn(
            state.strategiesRarityFilter,
            rarity
          ),
        })),
      toggleStrategiesService: (service) =>
        set((state) => ({
          strategiesServiceFilter: toggleIn(
            state.strategiesServiceFilter,
            service
          ),
        })),
      resetStrategyFilters: () =>
        set({
          strategiesRarityFilter: [],
          strategiesServiceFilter: [],
        }),
    }),
    {
      name: "zapret-manager:app",
      version: APP_STORE_VERSION,
      partialize: (state): PersistedAppState => ({
        activePage: state.activePage,
        sidebarCollapsed: state.sidebarCollapsed,
        dashboardMode: state.dashboardMode,
        settingsSection: state.settingsSection,
        strategiesViewMode: state.strategiesViewMode,
        strategiesSortMode: state.strategiesSortMode,
        strategiesRarityFilter: state.strategiesRarityFilter,
        strategiesServiceFilter: state.strategiesServiceFilter,
      }),
      migrate: (persisted) =>
        migratePersistedAppState(
          persisted as Partial<PersistedAppState> | undefined
        ),
    }
  )
);

export const selectActivePage = (state: AppStoreState): AppPage =>
  state.activePage;

export const selectSidebarCollapsed = (state: AppStoreState): boolean =>
  state.sidebarCollapsed;

export const selectToggleSidebar = (state: AppStoreState): (() => void) =>
  state.toggleSidebar;

export const selectSetSidebarCollapsed = (
  state: AppStoreState
): ((collapsed: boolean) => void) => state.setSidebarCollapsed;
