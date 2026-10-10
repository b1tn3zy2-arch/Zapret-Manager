import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
  DEFAULT_ADVANCED,
  DEFAULT_APPEARANCE,
  DEFAULT_GENERAL,
  DEFAULT_SETTINGS,
  DEFAULT_STRATEGY_UPDATES,
  DEFAULT_VPN,
} from "@/lib/defaults";
import { readSettingsFile, writeSettingsFile } from "@/lib/storage";
import { toErrorMessage } from "@/lib/utils";
import type {
  AdvancedSettings,
  AppearanceSettings,
  AppSettings,
  GeneralSettings,
  OutlastTrialsSettings,
  PostProcessingSettings,
  SaveState,
  SettingsSection,
  StrategyUpdateSettings,
  VpnSettings,
} from "@/types";

function mergeSettings(fromFile: AppSettings): AppSettings {
  return {
    ...fromFile,
    strategiesFolder: fromFile.strategiesFolder ?? "",
    lastStrategyId: fromFile.lastStrategyId ?? null,
    general: { ...DEFAULT_GENERAL, ...fromFile.general },
    appearance: {
      ...DEFAULT_APPEARANCE,
      ...fromFile.appearance,
      postProcessing: {
        ...DEFAULT_APPEARANCE.postProcessing,
        ...fromFile.appearance?.postProcessing,
      },
    },
    strategyUpdates: {
      ...DEFAULT_STRATEGY_UPDATES,
      ...fromFile.strategyUpdates,
      ignoredVersions: fromFile.strategyUpdates?.ignoredVersions ?? [],
    },
    outlastTrials: {
      ...DEFAULT_SETTINGS.outlastTrials,
      ...fromFile.outlastTrials,
    },
    vpn: { ...DEFAULT_VPN, ...fromFile.vpn },
    advanced: { ...DEFAULT_ADVANCED, ...fromFile.advanced },
  };
}

function resetSection(settings: AppSettings, section: SettingsSection): void {
  switch (section) {
    case "general":
      settings.general = structuredClone(DEFAULT_GENERAL);
      break;
    case "appearance":
      settings.appearance = structuredClone(DEFAULT_APPEARANCE);
      break;
    case "strategies":
      settings.advanced = structuredClone(DEFAULT_ADVANCED);
      break;
    case "outlast":
      settings.outlastTrials = structuredClone(DEFAULT_SETTINGS.outlastTrials);
      break;
    case "vpn":
      settings.vpn = structuredClone(DEFAULT_VPN);
      break;
    case "updates":
      settings.strategyUpdates = structuredClone(DEFAULT_STRATEGY_UPDATES);
      break;
    case "advanced":
      break;
  }
}

type PersistedSettings = { settings?: Partial<AppSettings> };

export interface SettingsStoreState {
  settings: AppSettings;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  saveState: SaveState;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updateGeneral: (patch: Partial<GeneralSettings>) => void;
  updateAppearance: (patch: Partial<AppearanceSettings>) => void;
  updatePostProcessing: (patch: Partial<PostProcessingSettings>) => void;
  updateOutlastTrials: (patch: Partial<OutlastTrialsSettings>) => void;
  updateVpn: (patch: Partial<VpnSettings>) => void;
  updateAdvanced: (patch: Partial<AdvancedSettings>) => void;
  updateStrategyUpdates: (patch: Partial<StrategyUpdateSettings>) => void;
  replaceSettings: (settings: AppSettings) => void;
  resetToDefaults: () => void;
  resetSection: (section: SettingsSection) => void;
  setLastStrategyId: (id: string | null) => void;
  setStrategiesFolder: (path: string) => void;
  loadFromFile: () => Promise<boolean>;
  saveToFile: () => Promise<boolean>;
  setSaveState: (state: SaveState) => void;
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    immer((set) => ({
      settings: DEFAULT_SETTINGS,
      loaded: false,
      loading: false,
      error: null,
      saveState: "idle",

      updateSettings: (patch) =>
        set((state) => {
          Object.assign(state.settings, patch);
        }),

      updateGeneral: (patch) =>
        set((state) => {
          Object.assign(state.settings.general, patch);
        }),

      updateAppearance: (patch) =>
        set((state) => {
          Object.assign(state.settings.appearance, patch);
        }),

      updatePostProcessing: (patch) =>
        set((state) => {
          Object.assign(state.settings.appearance.postProcessing, patch);
        }),

      updateOutlastTrials: (patch) =>
        set((state) => {
          Object.assign(state.settings.outlastTrials, patch);
        }),

      updateVpn: (patch) =>
        set((state) => {
          Object.assign(state.settings.vpn, patch);
        }),

      updateAdvanced: (patch) =>
        set((state) => {
          Object.assign(state.settings.advanced, patch);
        }),

      updateStrategyUpdates: (patch) =>
        set((state) => {
          Object.assign(state.settings.strategyUpdates, patch);
        }),

      replaceSettings: (settings) =>
        set((state) => {
          state.settings = mergeSettings(settings);
        }),

      resetToDefaults: () =>
        set((state) => {
          state.settings = structuredClone(DEFAULT_SETTINGS);
        }),

      resetSection: (section) =>
        set((state) => {
          resetSection(state.settings, section);
        }),

      setLastStrategyId: (id) =>
        set((state) => {
          state.settings.lastStrategyId = id;
        }),

      setStrategiesFolder: (path) =>
        set((state) => {
          state.settings.strategiesFolder = path;
        }),

      loadFromFile: async () => {
        set((state) => {
          state.loading = true;
          state.error = null;
        });

        try {
          const fromFile = await readSettingsFile();

          set((state) => {
            if (fromFile !== null) {
              state.settings = mergeSettings(fromFile);
            }
            state.loaded = true;
            state.loading = false;
          });

          return true;
        } catch (caught) {
          set((state) => {
            state.error = toErrorMessage(caught);
            state.loading = false;
            state.loaded = true;
          });

          return false;
        }
      },

      saveToFile: async () => {
        set((state) => {
          state.saveState = "saving";
        });

        try {
          await writeSettingsFile(useSettingsStore.getState().settings);
          set((state) => {
            state.saveState = "saved";
            state.error = null;
          });

          return true;
        } catch (caught) {
          set((state) => {
            state.error = toErrorMessage(caught);
            state.saveState = "error";
          });

          return false;
        }
      },

      setSaveState: (saveState) =>
        set((state) => {
          state.saveState = saveState;
        }),
    })),
    {
      name: "zapret-manager:settings",
      partialize: (state) => ({ settings: state.settings }),
      merge: (persisted, current) => ({
        ...current,
        settings: mergeSettings({
          ...current.settings,
          ...(persisted as Partial<PersistedSettings>),
        }),
      }),
    }
  )
);

export const selectSettings = (state: SettingsStoreState): AppSettings =>
  state.settings;
