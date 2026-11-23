// Импортируем зависимости из модуля nanoid.
import { nanoid } from "nanoid";
// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware/immer.
import { immer } from "zustand/middleware/immer";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт ServiceType.
  ServiceType,
  // Подключаем именованный импорт Strategy.
  Strategy,
  // Подключаем именованный импорт StrategyInput.
  StrategyInput,
  // Подключаем именованный импорт StrategyStatus.
  StrategyStatus,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategiesStoreState {
  // Обрабатываем конструкцию: strategies.
  strategies: Strategy[];
  // Обрабатываем конструкцию: activeStrategyId.
  activeStrategyId: string | null;
  // Сохраняем пояснение разработчика: id игр, чьи домены и порты попали в конфиг работающей страте…
  /** id игр, чьи домены и порты попали в конфиг работающей стратегии */
  // Обрабатываем конструкцию: injectedGameIds.
  injectedGameIds: string[];
  // Обрабатываем конструкцию: loading.
  loading: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: lastScanAt.
  lastScanAt: number | null;
  // Обрабатываем конструкцию: setStrategies.
  setStrategies: (strategies: Strategy[]) => void;
  // Обрабатываем конструкцию: addStrategy.
  addStrategy: (input: StrategyInput) => string;
  // Обрабатываем конструкцию: updateStrategy.
  updateStrategy: (id: string, patch: Partial<Strategy>) => void;
  // Обрабатываем конструкцию: removeStrategy.
  removeStrategy: (id: string) => void;
  // Обрабатываем конструкцию: setActiveStrategy.
  setActiveStrategy: (id: string | null) => void;
  // Сохраняем пояснение разработчика: Снимает активную стратегию, только если это именно она.
  /** Снимает активную стратегию, только если это именно она. */
  // Обрабатываем конструкцию: clearActiveStrategy.
  clearActiveStrategy: (id: string) => void;
  // Обрабатываем конструкцию: setInjectedGames.
  setInjectedGames: (
    // Обрабатываем конструкцию: id.
    id: string | null,
    // Обрабатываем конструкцию: gameIds.
    gameIds: readonly string[] | null
    // Закрываем выражение или список аргументов.
  ) => void;
  // Обрабатываем конструкцию: setStatus.
  setStatus: (id: string, status: StrategyStatus) => void;
  // Обрабатываем конструкцию: setPid.
  setPid: (id: string, pid?: number) => void;
  // Обрабатываем конструкцию: setError.
  setError: (id: string, error?: string) => void;
  // Обрабатываем конструкцию: setLoading.
  setLoading: (loading: boolean) => void;
  // Обрабатываем конструкцию: setScanError.
  setScanError: (error: string | null) => void;
  // Обрабатываем конструкцию: clearAll.
  clearAll: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useStrategiesStore = create<StrategiesStoreState>()(
  // Обрабатываем конструкцию: immer.
  immer((set) => ({
    // Обрабатываем конструкцию: strategies.
    strategies: [],
    // Обрабатываем конструкцию: activeStrategyId.
    activeStrategyId: null,
    // Обрабатываем конструкцию: injectedGameIds.
    injectedGameIds: [],
    // Обрабатываем конструкцию: loading.
    loading: false,
    // Обрабатываем конструкцию: error.
    error: null,
    // Обрабатываем конструкцию: lastScanAt.
    lastScanAt: null,
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setStrategies.
    setStrategies: (strategies) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: const previous = new Map( state.strategies.map((strateg….
        const previous = new Map(
          // Обрабатываем конструкцию: state.
          state.strategies.map((strategy) => [strategy.id, strategy])
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: state.
        state.strategies = strategies.map((incoming) => {
          // Обрабатываем конструкцию: const existing = previous.get(incoming.id).
          const existing = previous.get(incoming.id);
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: existing === undefined.
          if (existing === undefined) {
            // Возвращаем результат: incoming.
            return incoming;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Возвращаем результат: { ...incoming, status: existing.status, pid: existing.p….
          return {
            // Разворачиваем ...incoming в коллекцию.
            ...incoming,
            // Обрабатываем конструкцию: status.
            status: existing.status,
            // Обрабатываем конструкцию: pid.
            pid: existing.pid,
            // Обрабатываем конструкцию: error.
            error: existing.error,
            // Обрабатываем конструкцию: lastRun.
            lastRun: existing.lastRun,
            // Закрываем текущий блок.
          };
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: state.
        state.lastScanAt = Date.now();
        // Обрабатываем конструкцию: state.
        state.error = null;
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const stillExists = state.strategies.some( (strategy) =….
        const stillExists = state.strategies.some(
          // Объявляем функцию-обработчик или стрелочную функцию.
          (strategy) => strategy.id === state.activeStrategyId
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: !stillExists.
        if (!stillExists) {
          // Обрабатываем конструкцию: state.
          state.activeStrategyId = null;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: addStrategy.
    addStrategy: (input) => {
      // Обрабатываем конструкцию: const id = nanoid().
      const id = nanoid();
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.strategies.push({ ...input, id, status: "idle" });
        // Закрываем текущий блок.
      });
      // Возвращаем результат: id.
      return id;
      // Закрываем текущий блок.
    },
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: updateStrategy.
    updateStrategy: (id, patch) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: const target = state.strategies.find((strategy) => stra….
        const target = state.strategies.find((strategy) => strategy.id === id);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: target !== undefined.
        if (target !== undefined) {
          // Обрабатываем конструкцию: Object.
          Object.assign(target, patch);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: removeStrategy.
    removeStrategy: (id) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.strategies = state.strategies.filter(
          // Объявляем функцию-обработчик или стрелочную функцию.
          (strategy) => strategy.id !== id
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: state.activeStrategyId === id.
        if (state.activeStrategyId === id) {
          // Обрабатываем конструкцию: state.
          state.activeStrategyId = null;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setActiveStrategy.
    setActiveStrategy: (id) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Проверяем бизнес-условие: id === null.
        if (id === null) {
          // Перебираем элементы коллекции state.strategies.
          for (const strategy of state.strategies) {
            // Проверяем бизнес-условие: strategy.status === running.
            if (strategy.status === "running") {
              // Обрабатываем конструкцию: strategy.
              strategy.status = "stopped";
              // Закрываем текущий блок.
            }
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: state.
          state.activeStrategyId = null;
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Перебираем элементы коллекции state.strategies.
        for (const strategy of state.strategies) {
          // Проверяем бизнес-условие: strategy.id !== id && strategy.status === running.
          if (strategy.id !== id && strategy.status === "running") {
            // Обрабатываем конструкцию: strategy.
            strategy.status = "stopped";
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: state.
        state.activeStrategyId = id;
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: clearActiveStrategy.
    clearActiveStrategy: (id) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Проверяем бизнес-условие: state.activeStrategyId === id.
        if (state.activeStrategyId === id) {
          // Обрабатываем конструкцию: state.
          state.activeStrategyId = null;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setInjectedGames.
    setInjectedGames: (id, gameIds) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.injectedGameIds = id === null ? [] : [...new Set(gameIds)];
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setStatus.
    setStatus: (id, status) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: const target = state.strategies.find((strategy) => stra….
        const target = state.strategies.find((strategy) => strategy.id === id);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: target !== undefined.
        if (target !== undefined) {
          // Обрабатываем конструкцию: target.
          target.status = status;
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: status === running.
          if (status === "running") {
            // Обрабатываем конструкцию: target.
            target.error = undefined;
            // Обрабатываем конструкцию: target.
            target.lastRun = Date.now();
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setPid.
    setPid: (id, pid) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: const target = state.strategies.find((strategy) => stra….
        const target = state.strategies.find((strategy) => strategy.id === id);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: target !== undefined.
        if (target !== undefined) {
          // Обрабатываем конструкцию: target.
          target.pid = pid;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setError.
    setError: (id, error) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: const target = state.strategies.find((strategy) => stra….
        const target = state.strategies.find((strategy) => strategy.id === id);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: target !== undefined.
        if (target !== undefined) {
          // Обрабатываем конструкцию: target.
          target.error = error;
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: error !== undefined.
          if (error !== undefined) {
            // Обрабатываем конструкцию: target.
            target.status = "error";
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setLoading.
    setLoading: (loading) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.loading = loading;
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setScanError.
    setScanError: (error) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.error = error;
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: clearAll.
    clearAll: () =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.strategies = [];
        // Обрабатываем конструкцию: state.
        state.activeStrategyId = null;
        // Обрабатываем конструкцию: state.
        state.error = null;
        // Обрабатываем конструкцию: state.
        state.lastScanAt = null;
        // Закрываем текущий блок.
      }),
    // Закрываем текущий блок.
  }))
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectStrategies = (state: StrategiesStoreState): Strategy[] =>
  // Обрабатываем конструкцию: state.
  state.strategies;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function selectStrategyById(
  // Обрабатываем конструкцию: state.
  state: StrategiesStoreState,
  // Обрабатываем конструкцию: id.
  id: string
  // Закрываем выражение или список аргументов.
): Strategy | undefined {
  // Возвращаем результат: state.strategies.find((strategy) => strategy.id === id).
  return state.strategies.find((strategy) => strategy.id === id);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function selectActiveStrategy(
  // Обрабатываем конструкцию: state.
  state: StrategiesStoreState
  // Закрываем выражение или список аргументов.
): Strategy | undefined {
  // Проверяем бизнес-условие: state.activeStrategyId === null.
  if (state.activeStrategyId === null) {
    // Возвращаем результат: undefined.
    return undefined;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: state.strategies.find( (strategy) => strategy.id === st….
  return state.strategies.find(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (strategy) => strategy.id === state.activeStrategyId
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function selectRunningStrategies(
  // Обрабатываем конструкцию: state.
  state: StrategiesStoreState
  // Закрываем выражение или список аргументов.
): Strategy[] {
  // Возвращаем результат: state.strategies.filter((strategy) => strategy.status =….
  return state.strategies.filter((strategy) => strategy.status === "running");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function selectStrategiesByService(
  // Обрабатываем конструкцию: state.
  state: StrategiesStoreState,
  // Обрабатываем конструкцию: service.
  service: ServiceType
  // Закрываем выражение или список аргументов.
): Strategy[] {
  // Возвращаем результат: state.strategies.filter((strategy) => strategy.services….
  return state.strategies.filter(
    // Продолжаем предыдущую конструкцию.
    (strategy) =>
      // Обрабатываем конструкцию: strategy.
      strategy.services.includes(service)
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
