// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware.
import { persist } from "zustand/middleware";
// Импортируем зависимости из модуля zustand/middleware/immer.
import { immer } from "zustand/middleware/immer";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/defaults.
import {
  // Подключаем именованный импорт DEFAULT_ADVANCED.
  DEFAULT_ADVANCED,
  // Подключаем именованный импорт DEFAULT_APPEARANCE.
  DEFAULT_APPEARANCE,
  // Подключаем именованный импорт DEFAULT_GENERAL.
  DEFAULT_GENERAL,
  // Подключаем именованный импорт DEFAULT_SETTINGS.
  DEFAULT_SETTINGS,
  // Подключаем именованный импорт DEFAULT_STRATEGY_UPDATES.
  DEFAULT_STRATEGY_UPDATES,
  // Подключаем именованный импорт DEFAULT_VPN.
  DEFAULT_VPN,
  // Закрываем текущий блок.
} from "@/lib/defaults";
// Импортируем зависимости из модуля @/lib/defaultGames.
import { getDefaultGames, mergeBuiltinGames } from "@/lib/defaultGames";
// Импортируем зависимости из модуля @/lib/storage.
import { readSettingsFile, writeSettingsFile } from "@/lib/storage";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт AdvancedSettings.
  AdvancedSettings,
  // Подключаем именованный импорт AppearanceSettings.
  AppearanceSettings,
  // Подключаем именованный импорт AppSettings.
  AppSettings,
  // Подключаем именованный импорт GameSettings.
  GameSettings,
  // Подключаем именованный импорт GeneralSettings.
  GeneralSettings,
  // Подключаем именованный импорт SaveState.
  SaveState,
  // Подключаем именованный импорт SettingsSection.
  SettingsSection,
  // Подключаем именованный импорт StrategyUpdateSettings.
  StrategyUpdateSettings,
  // Подключаем именованный импорт VpnSettings.
  VpnSettings,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Объявляем функцию mergeSettings.
function mergeSettings(fromFile: AppSettings): AppSettings {
  // Возвращаем результат: { ...fromFile, strategiesFolder: fromFile.strategiesFol….
  return {
    // Разворачиваем ...fromFile в коллекцию.
    ...fromFile,
    // Обрабатываем конструкцию: strategiesFolder.
    strategiesFolder: fromFile.strategiesFolder ?? "",
    // Обрабатываем конструкцию: lastStrategyId.
    lastStrategyId: fromFile.lastStrategyId ?? null,
    // Обрабатываем конструкцию: general.
    general: { ...DEFAULT_GENERAL, ...fromFile.general },
    // Обрабатываем конструкцию: appearance.
    appearance: { ...DEFAULT_APPEARANCE, ...fromFile.appearance },
    // Обрабатываем конструкцию: strategyUpdates.
    strategyUpdates: {
      // Разворачиваем ...DEFAULT_STRATEGY_UPDATES в коллекцию.
      ...DEFAULT_STRATEGY_UPDATES,
      // Разворачиваем ...fromFile.strategyUpdates в коллекцию.
      ...fromFile.strategyUpdates,
      // Обрабатываем конструкцию: ignoredVersions.
      ignoredVersions: fromFile.strategyUpdates?.ignoredVersions ?? [],
      // Закрываем текущий блок.
    },
    // Сохраняем пояснение разработчика: // games всегда проходят через mergeBuiltinGames: иначе копи…
    // games всегда проходят через mergeBuiltinGames: иначе копия из файла или
    // Сохраняем пояснение разработчика: // из localStorage осталась бы без новых доменов и портов вс…
    // из localStorage осталась бы без новых доменов и портов встроенных игр
    // Обрабатываем конструкцию: games.
    games:
      // Обрабатываем конструкцию: fromFile.
      fromFile.games === undefined
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          getDefaultGames()
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          mergeBuiltinGames(fromFile.games),
    // Обрабатываем конструкцию: vpn.
    vpn: { ...DEFAULT_VPN, ...fromFile.vpn },
    // Обрабатываем конструкцию: advanced.
    advanced: { ...DEFAULT_ADVANCED, ...fromFile.advanced },
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию resetSection.
function resetSection(settings: AppSettings, section: SettingsSection): void {
  // Выбираем вариант по значению section.
  switch (section) {
    // Обрабатываем вариант general.
    case "general":
      // Обрабатываем конструкцию: settings.
      settings.general = structuredClone(DEFAULT_GENERAL);
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант appearance.
    case "appearance":
      // Обрабатываем конструкцию: settings.
      settings.appearance = structuredClone(DEFAULT_APPEARANCE);
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант strategies.
    case "strategies":
      // Обрабатываем конструкцию: settings.
      settings.advanced = structuredClone(DEFAULT_ADVANCED);
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант updates.
    case "updates":
      // Обрабатываем конструкцию: settings.
      settings.strategyUpdates = structuredClone(DEFAULT_STRATEGY_UPDATES);
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант advanced.
    case "advanced":
      // Прерываем текущий цикл или переключатель.
      break;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем псевдоним типа PersistedSettings.
type PersistedSettings = { settings?: Partial<AppSettings> };
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SettingsStoreState {
  // Обрабатываем конструкцию: settings.
  settings: AppSettings;
  // Обрабатываем конструкцию: loaded.
  loaded: boolean;
  // Обрабатываем конструкцию: loading.
  loading: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: saveState.
  saveState: SaveState;
  // Обрабатываем конструкцию: updateSettings.
  updateSettings: (patch: Partial<AppSettings>) => void;
  // Обрабатываем конструкцию: updateGeneral.
  updateGeneral: (patch: Partial<GeneralSettings>) => void;
  // Обрабатываем конструкцию: updateAppearance.
  updateAppearance: (patch: Partial<AppearanceSettings>) => void;
  // Обрабатываем конструкцию: updateGame.
  updateGame: (id: string, patch: Partial<GameSettings>) => void;
  // Обрабатываем конструкцию: addGame.
  addGame: (game: GameSettings) => void;
  // Обрабатываем конструкцию: removeGame.
  removeGame: (id: string) => void;
  // Обрабатываем конструкцию: resetGames.
  resetGames: () => void;
  // Обрабатываем конструкцию: updateVpn.
  updateVpn: (patch: Partial<VpnSettings>) => void;
  // Обрабатываем конструкцию: updateAdvanced.
  updateAdvanced: (patch: Partial<AdvancedSettings>) => void;
  // Обрабатываем конструкцию: updateStrategyUpdates.
  updateStrategyUpdates: (patch: Partial<StrategyUpdateSettings>) => void;
  // Обрабатываем конструкцию: replaceSettings.
  replaceSettings: (settings: AppSettings) => void;
  // Обрабатываем конструкцию: resetToDefaults.
  resetToDefaults: () => void;
  // Обрабатываем конструкцию: resetSection.
  resetSection: (section: SettingsSection) => void;
  // Обрабатываем конструкцию: setLastStrategyId.
  setLastStrategyId: (id: string | null) => void;
  // Обрабатываем конструкцию: setStrategiesFolder.
  setStrategiesFolder: (path: string) => void;
  // Обрабатываем конструкцию: loadFromFile.
  loadFromFile: () => Promise<boolean>;
  // Обрабатываем конструкцию: saveToFile.
  saveToFile: () => Promise<boolean>;
  // Обрабатываем конструкцию: setSaveState.
  setSaveState: (state: SaveState) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useSettingsStore = create<SettingsStoreState>()(
  // Обрабатываем конструкцию: persist.
  persist(
    // Обрабатываем конструкцию: immer.
    immer((set) => ({
      // Обрабатываем конструкцию: settings.
      settings: DEFAULT_SETTINGS,
      // Обрабатываем конструкцию: loaded.
      loaded: false,
      // Обрабатываем конструкцию: loading.
      loading: false,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: saveState.
      saveState: "idle",
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateSettings.
      updateSettings: (patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.settings, patch);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateGeneral.
      updateGeneral: (patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.settings.general, patch);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateAppearance.
      updateAppearance: (patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.settings.appearance, patch);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateGame.
      updateGame: (id, patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: const game = state.settings.games.find((item) => item.i….
          const game = state.settings.games.find((item) => item.id === id);
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: game !== undefined.
          if (game !== undefined) {
            // Обрабатываем конструкцию: Object.
            Object.assign(game, patch);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addGame.
      addGame: (game) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings.games.push(game);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Встроенные игры тоже удаляются: пользователь просил убира…
      // Встроенные игры тоже удаляются: пользователь просил убирать их из
      // Сохраняем пояснение разработчика: // списка. Возврат — кнопка «Сбросить список игр», которая с…
      // списка. Возврат — кнопка «Сбросить список игр», которая снова берёт
      // Сохраняем пояснение разработчика: // значения по умолчанию.
      // значения по умолчанию.
      // Обрабатываем конструкцию: removeGame.
      removeGame: (id) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings.games = state.settings.games.filter(
            // Объявляем функцию-обработчик или стрелочную функцию.
            (item) => item.id !== id
            // Закрываем выражение или список аргументов.
          );
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: resetGames.
      resetGames: () =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings.games = getDefaultGames();
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateVpn.
      updateVpn: (patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.settings.vpn, patch);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateAdvanced.
      updateAdvanced: (patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.settings.advanced, patch);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateStrategyUpdates.
      updateStrategyUpdates: (patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: Object.
          Object.assign(state.settings.strategyUpdates, patch);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: replaceSettings.
      replaceSettings: (settings) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings = mergeSettings(settings);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: resetToDefaults.
      resetToDefaults: () =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings = structuredClone(DEFAULT_SETTINGS);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: resetSection.
      resetSection: (section) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: resetSection.
          resetSection(state.settings, section);
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setLastStrategyId.
      setLastStrategyId: (id) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings.lastStrategyId = id;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setStrategiesFolder.
      setStrategiesFolder: (path) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.settings.strategiesFolder = path;
          // Закрываем текущий блок.
        }),
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: loadFromFile.
      loadFromFile: async () => {
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.loading = true;
          // Обрабатываем конструкцию: state.
          state.error = null;
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Обрабатываем конструкцию: const fromFile = await readSettingsFile().
          const fromFile = await readSettingsFile();
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: fromFile !== null.
          if (fromFile !== null) {
            // Обрабатываем конструкцию: const merged = mergeSettings(fromFile).
            const merged = mergeSettings(fromFile);
            // — разделитель логических блоков —

            // Обрабатываем конструкцию: set.
            set((state) => {
              // Обрабатываем конструкцию: state.
              state.settings = merged;
              // Обрабатываем конструкцию: state.
              state.loaded = true;
              // Обрабатываем конструкцию: state.
              state.loading = false;
              // Закрываем текущий блок.
            });
            // — разделитель логических блоков —

            // Сохраняем пояснение разработчика: // Склейка с пресетами должна попасть и в файл, иначе правка…
            // Склейка с пресетами должна попасть и в файл, иначе правка живёт
            // Сохраняем пояснение разработчика: // только в памяти до первого автосохранения. Переписываем о…
            // только в памяти до первого автосохранения. Переписываем один раз
            // Сохраняем пояснение разработчика: // и молча: это миграция, а не ошибка пользователя.
            // и молча: это миграция, а не ошибка пользователя.
            // Проверяем бизнес-условие: JSON.stringify(merged.games) !== JSON.stringify(fromFil….
            if (
              // Обрабатываем конструкцию: JSON.
              JSON.stringify(merged.games) !== JSON.stringify(fromFile.games)
              // Закрываем выражение или список аргументов.
            ) {
              // Ожидаем завершение асинхронной операции await writeSettingsFile(merged).catch(() => u….
              await writeSettingsFile(merged).catch(() => undefined);
              // Закрываем текущий блок.
            }
            // — разделитель логических блоков —

            // Возвращаем результат: true.
            return true;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: set.
          set((state) => {
            // Обрабатываем конструкцию: state.
            state.loaded = true;
            // Обрабатываем конструкцию: state.
            state.loading = false;
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Возвращаем результат: true.
          return true;
          // Закрываем текущий блок.
        } catch (caught) {
          // Обрабатываем конструкцию: set.
          set((state) => {
            // Обрабатываем конструкцию: state.
            state.error = toErrorMessage(caught);
            // Обрабатываем конструкцию: state.
            state.loading = false;
            // Обрабатываем конструкцию: state.
            state.loaded = true;
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Возвращаем результат: false.
          return false;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      },
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: saveToFile.
      saveToFile: async () => {
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.saveState = "saving";
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Ожидаем завершение асинхронной операции await writeSettingsFile(useSettingsStore.getS….
          await writeSettingsFile(useSettingsStore.getState().settings);
          // Обрабатываем конструкцию: set.
          set((state) => {
            // Обрабатываем конструкцию: state.
            state.saveState = "saved";
            // Обрабатываем конструкцию: state.
            state.error = null;
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Возвращаем результат: true.
          return true;
          // Закрываем текущий блок.
        } catch (caught) {
          // Обрабатываем конструкцию: set.
          set((state) => {
            // Обрабатываем конструкцию: state.
            state.error = toErrorMessage(caught);
            // Обрабатываем конструкцию: state.
            state.saveState = "error";
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Возвращаем результат: false.
          return false;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      },
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setSaveState.
      setSaveState: (saveState) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: state.
          state.saveState = saveState;
          // Закрываем текущий блок.
        }),
      // Закрываем текущий блок.
    })),
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: name.
      name: "zapret-manager:settings",
      // Обрабатываем конструкцию: partialize.
      partialize: (state) => ({ settings: state.settings }),
      // Обрабатываем конструкцию: merge.
      merge: (persisted, current) => ({
        // Разворачиваем ...current в коллекцию.
        ...current,
        // Обрабатываем конструкцию: settings.
        settings: mergeSettings({
          // Разворачиваем ...current.settings в коллекцию.
          ...current.settings,
          // Разворачиваем ...(persisted as Partial<PersistedSettings>) в коллекцию.
          ...(persisted as Partial<PersistedSettings>),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      }),
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  )
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectSettings = (state: SettingsStoreState): AppSettings =>
  // Обрабатываем конструкцию: state.
  state.settings;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Игры, которые действительно подмешиваются в стратегию при …
 * Игры, которые действительно подмешиваются в стратегию при запуске.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Фильтрация идёт через useMemo, а не внутри селектора: селе…
 * Фильтрация идёт через useMemo, а не внутри селектора: селектор zustand
 // Сохраняем пояснение разработчика: * обязан возвращать стабильную ссылку, иначе React уходит в …
 * обязан возвращать стабильную ссылку, иначе React уходит в бесконечный
 // Сохраняем пояснение разработчика: * рендер («getSnapshot should be cached»).
 * рендер («getSnapshot should be cached»).
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useEnabledGames(): GameSettings[] {
  // Обрабатываем конструкцию: const games = useSettingsStore((state) => state.setting….
  const games = useSettingsStore((state) => state.settings.games);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => games.filter((game) => game.enabled), [ga….
  return useMemo(() => games.filter((game) => game.enabled), [games]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
