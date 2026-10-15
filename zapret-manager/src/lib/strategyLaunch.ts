import { invoke } from "@tauri-apps/api/core";

import { enabledGames } from "@/lib/gameUtils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { GameSettings, InjectionReport } from "@/types";

export interface NativeGamePayload {
  id: string;
  name: string;
  domains: string[];
  ips: string[];
  ports: number[];
}

export interface StrategyRunResult {
  pid: number;
  logPath: string;
  /** id игр, чьи домены и порты попали в конфиг запущенной стратегии */
  gamesInjected: string[];
}

function toNativeGames(games: readonly GameSettings[]): NativeGamePayload[] {
  return enabledGames(games).map((game) => ({
    id: game.id,
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
    const active = enabledGames(settings.games);

    for (const game of active) {
      await invoke<InjectionReport>("inject_outlast", {
        strategyPath: path,
        domains: game.domains,
        ips: game.ipRanges,
        ports: game.ports,
        createBackupFlag: game.createBackup,
      });
    }

    const result = await invoke<Omit<StrategyRunResult, "gamesInjected">>(
      "run_strategy",
      { strategyId, path }
    );

    return { ...result, gamesInjected: active.map((game) => game.id) };
  }

  const games = toNativeGames(settings.games);
  const result = await invoke<Omit<StrategyRunResult, "gamesInjected">>(
    "run_strategy_auto",
    { strategyId, path, games }
  );

  return { ...result, gamesInjected: games.map((game) => game.id) };
}
