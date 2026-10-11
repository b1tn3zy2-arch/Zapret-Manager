import { invoke } from "@tauri-apps/api/core";

import { useBypassScoreStore } from "@/stores/useBypassScoreStore";
import type { PingResult } from "@/types";

export const SCORE_PROBE_HOSTS = ["discord.com", "www.youtube.com"];

export function averageLatency(results: readonly PingResult[]): number | null {
  const values = results
    .map((result) =>
      result.success &&
      result.latencyMs !== null &&
      Number.isFinite(result.latencyMs)
        ? result.latencyMs
        : null
    )
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export async function recordStrategyScore(strategyId: string): Promise<void> {
  try {
    const results = await invoke<PingResult[]>("ping_hosts", {
      hosts: SCORE_PROBE_HOSTS,
    });
    const average = averageLatency(results);

    useBypassScoreStore
      .getState()
      .record(strategyId, average ?? 0, average === null);
  } catch {
    useBypassScoreStore.getState().record(strategyId, 0, true);
  }
}
