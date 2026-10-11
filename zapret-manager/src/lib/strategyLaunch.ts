import { invoke } from "@tauri-apps/api/core";

import { translateKey } from "@/i18n/core";
import { enabledGames } from "@/lib/gameUtils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
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

function hasNativeConfig(strategyId: string): boolean {
  const strategy = useStrategiesStore
    .getState()
    .strategies.find((item) => item.id === strategyId);

  return (strategy?.config?.groups.length ?? 0) > 0;
}

export async function launchStrategy(
  strategyId: string,
  path: string
): Promise<StrategyRunResult> {
  const settings = useSettingsStore.getState().settings;
  const engine = settings.advanced.strategyEngine;
  const games = enabledGames(settings.games);

  if (engine === "native" && hasNativeConfig(strategyId)) {
    return invoke<StrategyRunResult>("run_strategy_native", {
      strategyId,
      path,
      games: toNativeGames(settings.games),
    });
  }

  if (engine === "native") {
    useLogsStore.getState().addLog({
      level: "warn",
      source: "strategy",
      message: translateKey("log.nativeFallback"),
      strategyId,
    });
  }

  for (const game of games) {
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
