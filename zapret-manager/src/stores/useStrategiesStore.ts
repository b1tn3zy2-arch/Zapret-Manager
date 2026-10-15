import { nanoid } from "nanoid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type {
  ServiceType,
  Strategy,
  StrategyInput,
  StrategyStatus,
} from "@/types";

export interface StrategiesStoreState {
  strategies: Strategy[];
  activeStrategyId: string | null;
  /** id игр, чьи домены и порты попали в конфиг работающей стратегии */
  injectedGameIds: string[];
  loading: boolean;
  error: string | null;
  lastScanAt: number | null;
  setStrategies: (strategies: Strategy[]) => void;
  addStrategy: (input: StrategyInput) => string;
  updateStrategy: (id: string, patch: Partial<Strategy>) => void;
  removeStrategy: (id: string) => void;
  setActiveStrategy: (id: string | null) => void;
  setInjectedGames: (
    id: string | null,
    gameIds: readonly string[] | null
  ) => void;
  setStatus: (id: string, status: StrategyStatus) => void;
  setPid: (id: string, pid?: number) => void;
  setError: (id: string, error?: string) => void;
  setLoading: (loading: boolean) => void;
  setScanError: (error: string | null) => void;
  clearAll: () => void;
}

export const useStrategiesStore = create<StrategiesStoreState>()(
  immer((set) => ({
    strategies: [],
    activeStrategyId: null,
    injectedGameIds: [],
    loading: false,
    error: null,
    lastScanAt: null,

    setStrategies: (strategies) =>
      set((state) => {
        const previous = new Map(
          state.strategies.map((strategy) => [strategy.id, strategy])
        );

        state.strategies = strategies.map((incoming) => {
          const existing = previous.get(incoming.id);

          if (existing === undefined) {
            return incoming;
          }

          return {
            ...incoming,
            status: existing.status,
            pid: existing.pid,
            error: existing.error,
            lastRun: existing.lastRun,
          };
        });

        state.lastScanAt = Date.now();
        state.error = null;

        const stillExists = state.strategies.some(
          (strategy) => strategy.id === state.activeStrategyId
        );

        if (!stillExists) {
          state.activeStrategyId = null;
        }
      }),

    addStrategy: (input) => {
      const id = nanoid();
      set((state) => {
        state.strategies.push({ ...input, id, status: "idle" });
      });
      return id;
    },

    updateStrategy: (id, patch) =>
      set((state) => {
        const target = state.strategies.find((strategy) => strategy.id === id);

        if (target !== undefined) {
          Object.assign(target, patch);
        }
      }),

    removeStrategy: (id) =>
      set((state) => {
        state.strategies = state.strategies.filter(
          (strategy) => strategy.id !== id
        );

        if (state.activeStrategyId === id) {
          state.activeStrategyId = null;
        }
      }),

    setActiveStrategy: (id) =>
      set((state) => {
        if (id === null) {
          for (const strategy of state.strategies) {
            if (strategy.status === "running") {
              strategy.status = "stopped";
            }
          }
          state.activeStrategyId = null;
          return;
        }

        for (const strategy of state.strategies) {
          if (strategy.id !== id && strategy.status === "running") {
            strategy.status = "stopped";
          }
        }

        state.activeStrategyId = id;
      }),

    setInjectedGames: (id, gameIds) =>
      set((state) => {
        state.injectedGameIds = id === null ? [] : [...new Set(gameIds)];
      }),

    setStatus: (id, status) =>
      set((state) => {
        const target = state.strategies.find((strategy) => strategy.id === id);

        if (target !== undefined) {
          target.status = status;

          if (status === "running") {
            target.error = undefined;
            target.lastRun = Date.now();
          }
        }
      }),

    setPid: (id, pid) =>
      set((state) => {
        const target = state.strategies.find((strategy) => strategy.id === id);

        if (target !== undefined) {
          target.pid = pid;
        }
      }),

    setError: (id, error) =>
      set((state) => {
        const target = state.strategies.find((strategy) => strategy.id === id);

        if (target !== undefined) {
          target.error = error;

          if (error !== undefined) {
            target.status = "error";
          }
        }
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    setScanError: (error) =>
      set((state) => {
        state.error = error;
      }),

    clearAll: () =>
      set((state) => {
        state.strategies = [];
        state.activeStrategyId = null;
        state.error = null;
        state.lastScanAt = null;
      }),
  }))
);

export const selectStrategies = (state: StrategiesStoreState): Strategy[] =>
  state.strategies;

export function selectStrategyById(
  state: StrategiesStoreState,
  id: string
): Strategy | undefined {
  return state.strategies.find((strategy) => strategy.id === id);
}

export function selectActiveStrategy(
  state: StrategiesStoreState
): Strategy | undefined {
  if (state.activeStrategyId === null) {
    return undefined;
  }

  return state.strategies.find(
    (strategy) => strategy.id === state.activeStrategyId
  );
}

export function selectRunningStrategies(
  state: StrategiesStoreState
): Strategy[] {
  return state.strategies.filter((strategy) => strategy.status === "running");
}

export function selectStrategiesByService(
  state: StrategiesStoreState,
  service: ServiceType
): Strategy[] {
  return state.strategies.filter((strategy) =>
    strategy.services.includes(service)
  );
}
