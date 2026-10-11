import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

import { translateKey } from "@/i18n/core";
import {
  GAME_LAUNCH_HIDE_DELAY_MS,
  GAME_LAUNCH_TOAST_MS,
} from "@/lib/constants";
import { gameBypass, usesAnticheat } from "@/lib/installedGames";
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import type { InstalledGame, Strategy } from "@/types";

export type LaunchPromptKind = "anticheat" | "bypass" | "noStrategy";

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

export function useGameLauncher(): UseGameLauncherResult {
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<LaunchPrompt | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { run } = useStrategyRunner();
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
        const store = useInstalledGamesStore.getState();
        const stored = store.games.find((item) => item.id === game.id);

        if (stored !== undefined) {
          store.updateGame(game.id, {
            lastLaunchedAt: Date.now(),
            launchCount: stored.launchCount + 1,
          });
        }

        setToast(translateKey("settings.games.installed.launch.active"));

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

    if (!target) {
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

      return true;
    } catch {
      return false;
    }
  }, [addLog, lastStrategyId, run, strategies]);

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

      if (!(await ensureStrategy())) {
        setLaunchingId(null);

        return;
      }

      const bypass = gameBypass(game, gamesSettings);

      if (bypass !== undefined && !bypass.enabled) {
        setPrompt({ kind: "bypass", game });

        return;
      }

      await finishLaunch(game);
    },
    [ensureStrategy, finishLaunch, gamesSettings, launchingId]
  );

  const confirmPrompt = useCallback(async () => {
    if (prompt === null) {
      return;
    }

    const { kind, game } = prompt;

    setPrompt(null);

    if (kind === "noStrategy") {
      setLaunchingId(null);

      return;
    }

    if (game === null) {
      setLaunchingId(null);

      return;
    }

    if (kind === "bypass") {
      const bypass = gameBypass(game, gamesSettings);

      if (bypass !== undefined) {
        updateGameSettings(bypass.id, { enabled: true });
      }
    }

    if (!(await ensureStrategy())) {
      setLaunchingId(null);

      return;
    }

    await finishLaunch(game);
  }, [ensureStrategy, finishLaunch, gamesSettings, prompt, updateGameSettings]);

  const dismissPrompt = useCallback(() => {
    setPrompt(null);
    setLaunchingId(null);
  }, []);

  return { launchingId, prompt, toast, launch, confirmPrompt, dismissPrompt };
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
