import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

import { translateKey } from "@/i18n/core";
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
import {
  GAME_LAUNCH_CHECK_MS,
  GAME_LAUNCH_HIDE_DELAY_MS,
  GAME_LAUNCH_TOAST_MS,
} from "@/lib/constants";
import { gameBypass, usesAnticheat } from "@/lib/installedGames";
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import type { InstalledGame, LogEntry, Strategy } from "@/types";

export type LaunchPromptKind = "anticheat" | "noStrategy";

export interface LaunchPrompt {
  kind: LaunchPromptKind;
  game: InstalledGame | null;
}

export interface UseGameLauncherResult {
  launchingId: string | null;
  prompt: LaunchPrompt | null;
  toast: string | null;
  launch: (game: InstalledGame) => Promise<void>;
  confirmPrompt: () => Promise<void>;
  dismissPrompt: () => void;
}

type AddLog = (entry: Pick<LogEntry, "level" | "source" | "message">) => void;

export function useGameLauncher(): UseGameLauncherResult {
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<LaunchPrompt | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { run, checkStatus } = useStrategyRunner();
  const addLog = useLogsStore((state) => state.addLog);
  const strategies = useStrategiesStore((state) => state.strategies);
  const lastStrategyId = useSettingsStore(
    (state) => state.settings.lastStrategyId
  );
  const gamesSettings = useSettingsStore((state) => state.settings.games);
  const updateGameSettings = useSettingsStore((state) => state.updateGame);

  const finishLaunch = useCallback(
    async (game: InstalledGame) => {
      try {
        const pid = await invoke<number>("launch_game", {
          executablePath: game.executablePath,
          launchArgs: game.launchArgs ?? null,
          workingDir: game.installPath,
        });

        addLog({
          level: "success",
          source: "user",
          message: translateKey("log.gameLaunched", { name: game.name, pid }),
        });
        setToast(translateKey("settings.games.installed.launch.active"));
        recordLaunch(game.id);
        verifyBypass(game, addLog);

        window.setTimeout(() => {
          void invoke("hide_main_window").catch(() => undefined);
        }, GAME_LAUNCH_HIDE_DELAY_MS);

        window.setTimeout(() => {
          setToast(null);
        }, GAME_LAUNCH_TOAST_MS);
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: translateKey("log.gameLaunchFailed", {
            name: game.name,
            error: caught instanceof Error ? caught.message : String(caught),
          }),
        });
        setToast(translateKey("settings.games.installed.launch.failed"));
      } finally {
        setLaunchingId(null);
      }
    },
    [addLog]
  );

  const ensureStrategy = useCallback(async (): Promise<boolean> => {
    if (strategies.some((item) => item.status === "running")) {
      return true;
    }

    const target = pickStrategy(strategies, lastStrategyId);

    if (target === undefined) {
      setPrompt({ kind: "noStrategy", game: null });

      return false;
    }

    addLog({
      level: "info",
      source: "user",
      message: translateKey("settings.games.installed.launch.strategyStarting"),
    });

    try {
      await run(target.id, target.path);
    } catch (caught) {
      addLog({
        level: "error",
        source: "user",
        message: translateKey(
          "settings.games.installed.launch.strategyFailed",
          {
            error: caught instanceof Error ? caught.message : String(caught),
          }
        ),
      });

      return false;
    }

    const storeRunning = useStrategiesStore
      .getState()
      .strategies.some(
        (item) => item.id === target.id && item.status === "running"
      );

    if (storeRunning) {
      return true;
    }

    const status = await checkStatus(target.id).catch(() => null);

    if (status?.running === true) {
      useStrategiesStore.getState().setStatus(target.id, "running");
      useStrategiesStore.getState().setPid(target.id, status.winwsPids[0] ?? 0);

      return true;
    }

    await run(target.id, target.path).catch(() => undefined);

    const retry = await checkStatus(target.id).catch(() => null);

    if (retry?.running === true) {
      useStrategiesStore.getState().setStatus(target.id, "running");
      useStrategiesStore.getState().setPid(target.id, retry.winwsPids[0] ?? 0);

      return true;
    }

    addLog({
      level: "error",
      source: "user",
      message: translateKey("settings.games.installed.launch.strategyFailed", {
        error: translateKey(
          "settings.games.installed.launch.strategyNotRunning"
        ),
      }),
    });

    return false;
  }, [addLog, checkStatus, lastStrategyId, run, strategies]);

  const start = useCallback(
    async (game: InstalledGame): Promise<void> => {
      const bypass = gameBypass(game, gamesSettings);

      if (bypass !== undefined && !bypass.enabled) {
        updateGameSettings(bypass.id, { enabled: true });
        addLog({
          level: "info",
          source: "user",
          message: translateKey(
            "settings.games.installed.launch.bypassAutoOn",
            {
              name: game.name,
            }
          ),
        });
      }

      if (!(await ensureStrategy())) {
        return;
      }

      await finishLaunch(game);
    },
    [addLog, ensureStrategy, finishLaunch, gamesSettings, updateGameSettings]
  );

  const launch = useCallback(
    async (game: InstalledGame) => {
      if (launchingId !== null) {
        return;
      }

      setLaunchingId(game.id);
      setToast(
        translateKey("settings.games.installed.launch.starting", {
          name: game.name,
        })
      );

      if (usesAnticheat(game)) {
        setPrompt({ kind: "anticheat", game });

        return;
      }

      await start(game);
    },
    [launchingId, start]
  );

  const confirmPrompt = useCallback(async () => {
    if (prompt === null) {
      return;
    }

    const { game } = prompt;

    setPrompt(null);

    if (game === null) {
      setLaunchingId(null);

      return;
    }

    await start(game);
  }, [prompt, start]);

  const dismissPrompt = useCallback(() => {
    setPrompt(null);
    setLaunchingId(null);
  }, []);

  return { launchingId, prompt, toast, launch, confirmPrompt, dismissPrompt };
}

function recordLaunch(id: string): void {
  const store = useInstalledGamesStore.getState();
  const game = store.games.find((item) => item.id === id);

  if (game === undefined) {
    return;
  }

  store.updateGame(id, {
    lastLaunchedAt: Date.now(),
    launchCount: game.launchCount + 1,
  });
}

function verifyBypass(game: InstalledGame, addLog: AddLog): void {
  window.setTimeout(() => {
    const running = useStrategiesStore
      .getState()
      .strategies.some((item) => item.status === "running");

    if (running) {
      return;
    }

    addLog({
      level: "warn",
      source: "user",
      message: translateKey("settings.games.installed.launch.bypassLost", {
        name: game.name,
      }),
    });
  }, GAME_LAUNCH_CHECK_MS);
}

export function pickStrategy(
  strategies: readonly Strategy[],
  lastStrategyId: string | null
): Strategy | undefined {
  const last = strategies.find((item) => item.id === lastStrategyId);

  if (last !== undefined) {
    return last;
  }

  return strategies.find((item) => item.error === undefined);
}
