import { invoke } from "@tauri-apps/api/core";

import { enabledGames } from "@/lib/gameUtils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { GameSettings, InjectionReport } from "@/types";

export interface NativeGamePayload {
  name: string;
  domains: string[];
  ips: string[];
  ports: number[];
}

export interface StrategyRunResult {
  pid: number;
  logPath: string;
}

export function toNativeGames(
  games: readonly GameSettings[]
): NativeGamePayload[] {
  return enabledGames(games).map((game) => ({
    name: game.name,
    domains: game.domains,
    ips: game.ipRanges,
    ports: game.ports,
  }));
}

export async function launchStrategy(
  strategyId: string,
  path: string
): Promise<StrategyRunResult> {
  const store = useSettingsStore.getState();

  if (!store.loaded) {
    await store.loadFromFile();
  }

  const settings = useSettingsStore.getState().settings;
  const engine = settings.advanced.strategyEngine;

  if (engine === "legacy") {
    for (const game of enabledGames(settings.games)) {
      await invoke<InjectionReport>("inject_outlast", {
        strategyPath: path,
        domains: game.domains,
        ips: game.ipRanges,
        ports: game.ports,
        createBackupFlag: game.createBackup,
      });
    }

    return invoke<StrategyRunResult>("run_strategy", { strategyId, path });
  }

  return invoke<StrategyRunResult>("run_strategy_auto", {
    strategyId,
    path,
    games: toNativeGames(settings.games),
  });
}
