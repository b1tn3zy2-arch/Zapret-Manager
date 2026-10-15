import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useState } from "react";

import { translateKey } from "@/i18n/core";
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
import {
  GAME_LAUNCH_CHECK_MS,
  GAME_LAUNCH_HIDE_DELAY_MS,
  GAME_LAUNCH_POLL_MS,
  GAME_LAUNCH_TOAST_MS,
} from "@/lib/constants";
import { findGameProfile, usesAnticheat } from "@/lib/installedGames";
import { useGameRuntimeStore } from "@/stores/useGameRuntimeStore";
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useBypassScoreStore } from "@/stores/useBypassScoreStore";
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
  runningGames: Record<string, number[]>;
  launch: (game: InstalledGame) => Promise<void>;
  closeGame: (game: InstalledGame) => Promise<void>;
  confirmPrompt: () => Promise<void>;
  dismissPrompt: () => void;
}

type AddLog = (entry: Pick<LogEntry, "level" | "source" | "message">) => void;

export function useGameLauncher(): UseGameLauncherResult {
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const runningGames = useGameRuntimeStore((state) => state.running);
  const [prompt, setPrompt] = useState<LaunchPrompt | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { run, stop, checkStatus } = useStrategyRunner();
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
        const pids = await invoke<number[]>("launch_game", {
          executablePath: game.executablePath,
          launchArgs: game.launchArgs ?? null,
          workingDir: game.installPath,
        });

        addLog({
          level: "success",
          source: "user",
          message: translateKey("log.gameLaunched", {
            name: game.name,
            pid: pids[0] ?? 0,
          }),
        });
        setToast(translateKey("settings.games.installed.launch.active"));
        useGameRuntimeStore.getState().markRunning(game.id, pids);
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

  const ensureStrategy = useCallback(
    async (requiredGameId: string | null): Promise<boolean> => {
      const running = strategies.find((item) => item.status === "running");

      if (running !== undefined) {
        // Обход уже работает. Если он был запущен без доменов и портов этой
        // игры, её трафик не проходит через обход — перезапускаем с ними.
        if (
          requiredGameId === null ||
          useStrategiesStore.getState().injectedGameIds.includes(requiredGameId)
        ) {
          return true;
        }

        addLog({
          level: "info",
          source: "strategy",
          message: translateKey("log.gameProfileApplying"),
        });

        try {
          await stop(running.id, running.path);
        } catch {
          // даже если остановка не удалась, запускаем профиль заново:
          // это пересоздаст процесс обхода с нужными доменами и портами
        }
      }

      const target = pickStrategy(strategies, lastStrategyId);

      if (target === undefined) {
        setPrompt({ kind: "noStrategy", game: null });

        return false;
      }

      addLog({
        level: "info",
        source: "user",
        message: translateKey(
          "settings.games.installed.launch.strategyStarting"
        ),
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
        useStrategiesStore
          .getState()
          .setPid(target.id, status.winwsPids[0] ?? 0);

        return true;
      }

      await run(target.id, target.path).catch(() => undefined);

      const retry = await checkStatus(target.id).catch(() => null);

      if (retry?.running === true) {
        useStrategiesStore.getState().setStatus(target.id, "running");
        useStrategiesStore
          .getState()
          .setPid(target.id, retry.winwsPids[0] ?? 0);

        return true;
      }

      addLog({
        level: "error",
        source: "user",
        message: translateKey(
          "settings.games.installed.launch.strategyFailed",
          {
            error: translateKey(
              "settings.games.installed.launch.strategyNotRunning"
            ),
          }
        ),
      });

      return false;
    },
    [addLog, checkStatus, lastStrategyId, run, stop, strategies]
  );

  const start = useCallback(
    async (game: InstalledGame): Promise<void> => {
      // Профиль ищем и по gameSettingsId, и по названию: у ручных игр
      // идентификатора нет, а домены встроенного пресета им всё равно нужны.
      const bypass = findGameProfile(game, gamesSettings);

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

      // Профиль включается до запуска обхода: иначе его домены и порты
      // не попадут в конфиг winws, и игра не сможет зайти в матч.
      if (!(await ensureStrategy(bypass?.id ?? null))) {
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

  const closeGame = useCallback(
    async (game: InstalledGame) => {
      const pids = useGameRuntimeStore.getState().pidsOf(game.id);

      if (pids.length === 0) {
        return;
      }

      try {
        await invoke<boolean>("close_game", { pids });
        addLog({
          level: "info",
          source: "user",
          message: translateKey("settings.games.installed.closedGame", {
            name: game.name,
          }),
        });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: translateKey("settings.games.installed.closeGameFailed", {
            error: caught instanceof Error ? caught.message : String(caught),
          }),
        });
      }

      useGameRuntimeStore.getState().markStopped(game.id);
    },
    [addLog]
  );

  useEffect(() => {
    const entries = Object.entries(runningGames);

    if (entries.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      for (const [id, pids] of entries) {
        void invoke<boolean>("is_game_running", { pids })
          .then((alive) => {
            if (!alive) {
              useGameRuntimeStore.getState().markStopped(id);
            }
          })
          .catch(() => undefined);
      }
    }, GAME_LAUNCH_POLL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [runningGames]);

  return {
    launchingId,
    prompt,
    toast,
    runningGames,
    launch,
    closeGame,
    confirmPrompt,
    dismissPrompt,
  };
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
  const usable = strategies.filter((item) => item.error === undefined);

  if (usable.length === 0) {
    return undefined;
  }

  const fastestId = useBypassScoreStore
    .getState()
    .best(usable.map((item) => item.id));

  if (fastestId !== null) {
    return usable.find((item) => item.id === fastestId) ?? usable[0];
  }

  const last = usable.find((item) => item.id === lastStrategyId);

  return last ?? usable[0];
}
