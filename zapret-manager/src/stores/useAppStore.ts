import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ROUTES, type AppPage } from "@/lib/constants";
import type { Rarity, SettingsSection, SortMode, ViewMode } from "@/types";

export interface AppStoreState {
  activePage: AppPage;
  sidebarCollapsed: boolean;
  settingsSection: SettingsSection;
  strategiesViewMode: ViewMode;
  strategiesSortMode: SortMode;
  strategiesRarityFilter: Rarity[];
  strategiesServiceFilter: string[];
  setActivePage: (page: AppPage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
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

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      activePage: ROUTES.dashboard,
      sidebarCollapsed: false,
      settingsSection: "general",
      setActivePage: (page) => set({ activePage: page }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
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
      partialize: (state): PersistedAppState => ({
        activePage: state.activePage,
        sidebarCollapsed: state.sidebarCollapsed,
        settingsSection: state.settingsSection,
        strategiesViewMode: state.strategiesViewMode,
        strategiesSortMode: state.strategiesSortMode,
        strategiesRarityFilter: state.strategiesRarityFilter,
        strategiesServiceFilter: state.strategiesServiceFilter,
      }),
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
