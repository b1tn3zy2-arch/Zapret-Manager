import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface GameRuntimeStoreState {
  /** id игры -> дерево процессов, которое было выдано при запуске */
  running: Record<string, number[]>;
  startedAt: Record<string, number>;
  markRunning: (gameId: string, pids: readonly number[]) => void;
  markStopped: (gameId: string) => void;
  pidsOf: (gameId: string) => number[];
  isRunning: (gameId: string) => boolean;
  clearAll: () => void;
}

/**
 * Состояние запущенных игр живёт в отдельном сторе с persist.
 *
 * Раньше оно было локальным состоянием хука, который жил только на странице
 * «Игры»: переход на другую страницу или перезапуск приложения стирали его, и
 * игра продолжала работать без кнопки «Закрыть игру». Хранится дерево
 * процессов, потому что у игр с античитом PID лаунчера умирает сразу.
 */
export const useGameRuntimeStore = create<GameRuntimeStoreState>()(
  persist(
    immer((set, get) => ({
      running: {},
      startedAt: {},

      markRunning: (gameId, pids) =>
        set((state) => {
          state.running[gameId] = [...pids];
          state.startedAt[gameId] = Date.now();
        }),

      markStopped: (gameId) =>
        set((state) => {
          delete state.running[gameId];
          delete state.startedAt[gameId];
        }),

      pidsOf: (gameId) => get().running[gameId] ?? [],

      isRunning: (gameId) => (get().running[gameId]?.length ?? 0) > 0,

      clearAll: () =>
        set((state) => {
          state.running = {};
          state.startedAt = {};
        }),
    })),
    {
      name: "zapret-manager:game-runtime",
      partialize: (state) => ({
        running: state.running,
        startedAt: state.startedAt,
      }),
    }
  )
);
