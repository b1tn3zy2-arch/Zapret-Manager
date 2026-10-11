import { create } from "zustand";
import { persist } from "zustand/middleware";

const BYPASS_SCORE_VERSION = 1;

const MAX_SCORE = 10_000;

export interface BypassScoreState {
  scores: Record<string, number>;
  samples: Record<string, number>;
  record: (strategyId: string, latencyMs: number, failed: boolean) => void;
  best: (candidates: readonly string[]) => string | null;
  reset: () => void;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return MAX_SCORE;
  }

  return Math.min(Math.round(value), MAX_SCORE);
}

export const useBypassScoreStore = create<BypassScoreState>()(
  persist(
    (set, get) => ({
      scores: {},
      samples: {},
      record: (strategyId, latencyMs, failed) =>
        set((state) => {
          const sample = failed ? MAX_SCORE : clampScore(latencyMs);
          const previous = state.scores[strategyId];
          const count = (state.samples[strategyId] ?? 0) + 1;
          const weight = Math.min(count, 5);
          const next =
            previous === undefined
              ? sample
              : Math.round((previous * (weight - 1) + sample) / weight);

          return {
            scores: { ...state.scores, [strategyId]: next },
            samples: { ...state.samples, [strategyId]: count },
          };
        }),
      best: (candidates) => {
        const { scores } = get();
        let bestId: string | null = null;
        let bestScore = Number.POSITIVE_INFINITY;

        for (const id of candidates) {
          const score = scores[id];

          if (score === undefined) {
            continue;
          }

          if (score < bestScore) {
            bestScore = score;
            bestId = id;
          }
        }

        return bestId;
      },
      reset: () => set({ scores: {}, samples: {} }),
    }),
    {
      name: "zapret-manager:bypass-scores",
      version: BYPASS_SCORE_VERSION,
      partialize: (state) => ({ scores: state.scores, samples: state.samples }),
    }
  )
);
