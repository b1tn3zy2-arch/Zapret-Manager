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
import { useVpnStore } from "@/stores/useVpnStore";
import type { InstalledGame, LogEntry, Strategy, VpnStatus } from "@/types";

export type LaunchPromptKind =
  "anticheat" | "bypass" | "noStrategy" | "vpn" | "noVpn";

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

  const ensureVpn = useCallback(async (): Promise<boolean> => {
    const store = useVpnStore.getState();

    if (store.status.state === "connected") {
      return true;
    }

    if (store.activeConfigId === null) {
      setPrompt({ kind: "noVpn", game: null });

      return false;
    }

    addLog({
      level: "info",
      source: "vpn",
      message: translateKey("settings.games.installed.launch.vpnStarting"),
    });

    await invoke("connect_vpn_server", {
      configId: store.activeConfigId,
    }).catch(() => undefined);
    await invoke<VpnStatus>("get_vpn_status")
      .then((status) => {
        useVpnStore.getState().setStatus(status);
      })
      .catch(() => undefined);

    return useVpnStore.getState().status.state === "connected";
  }, [addLog]);

  const prepare = useCallback(
    async (game: InstalledGame): Promise<boolean> => {
      const vpn = useVpnStore.getState();

      if (game.bypassMode === "vpn") {
        if (vpn.status.state === "connected") {
          return true;
        }

        if (vpn.activeConfigId === null) {
          setPrompt({ kind: "noVpn", game });

          return false;
        }

        setPrompt({ kind: "vpn", game });

        return false;
      }

      if (vpn.killSwitchActive && vpn.status.state === "connected") {
        addLog({
          level: "warn",
          source: "vpn",
          message: translateKey(
            "settings.games.installed.launch.killSwitchWarning"
          ),
        });
      }

      return ensureStrategy();
    },
    [addLog, ensureStrategy]
  );

  const start = useCallback(
    async (game: InstalledGame): Promise<void> => {
      if (!(await prepare(game))) {
        return;
      }

      const bypass = gameBypass(game, gamesSettings);

      if (bypass !== undefined && !bypass.enabled) {
        setPrompt({ kind: "bypass", game });

        return;
      }

      await finishLaunch(game);
    },
    [finishLaunch, gamesSettings, prepare]
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

    const { kind, game } = prompt;

    setPrompt(null);

    if (game === null) {
      setLaunchingId(null);

      return;
    }

    if (kind === "bypass") {
      const bypass = gameBypass(game, gamesSettings);

      if (bypass !== undefined) {
        updateGameSettings(bypass.id, { enabled: true });
      }

      await start(game);

      return;
    }

    if (kind === "vpn") {
      if (await ensureVpn()) {
        await start(game);
      }

      return;
    }

    await start(game);
  }, [ensureVpn, gamesSettings, prompt, start, updateGameSettings]);

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

type AddLog = (entry: Pick<LogEntry, "level" | "source" | "message">) => void;

function verifyBypass(game: InstalledGame, addLog: AddLog): void {
  window.setTimeout(() => {
    const vpnConnected = useVpnStore.getState().status.state === "connected";
    const strategyRunning = useStrategiesStore
      .getState()
      .strategies.some((item) => item.status === "running");
    const ok =
      game.bypassMode === "vpn"
        ? vpnConnected
        : strategyRunning || vpnConnected;

    if (ok) {
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
