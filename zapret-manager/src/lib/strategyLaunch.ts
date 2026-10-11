import { invoke } from "@tauri-apps/api/core";

import { translateKey } from "@/i18n/core";
import { enabledGames } from "@/lib/gameUtils";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
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

function isConfigParseError(message: string): boolean {
  return (
    message.includes("группы фильтров") ||
    message.includes("команда запуска winws") ||
    message.includes("winws.exe не найден")
  );
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

  if (engine === "native") {
    try {
      return await invoke<StrategyRunResult>("run_strategy_native", {
        strategyId,
        path,
        games: toNativeGames(settings.games),
      });
    } catch (caught) {
      const message = toErrorMessage(caught);

      if (!isConfigParseError(message)) {
        throw caught;
      }

      useLogsStore.getState().addLog({
        level: "warn",
        source: "strategy",
        message: translateKey("log.nativeFallback"),
        strategyId,
      });
    }
  }

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
