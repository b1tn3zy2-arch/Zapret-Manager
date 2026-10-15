import { translateKey } from "@/i18n/core";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";

import { launchStrategy } from "@/lib/strategyLaunch";
import { useGamesInjector } from "@/hooks/useGamesInjector";
import { useLogsStore } from "@/stores/useLogsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useVpnStore } from "@/stores/useVpnStore";
import { recordStrategyScore } from "@/lib/bypassScore";
import { toErrorMessage } from "@/lib/utils";
import type { LogLevel } from "@/types";

interface ProcessStatus {
  running: boolean;
  winwsPids: number[];
  startedAt: number | null;
  uptime: number | null;
}

interface IncomingLogLine {
  timestamp: number;
  level: string;
  source: string;
  message: string;
  strategyId: string;
}

const UAC_CANCELLED_MARKER = "РѕС‚РјРµРЅС‘РЅ";

export interface UseStrategyRunnerResult {
  isStarting: boolean;
  isStopping: boolean;
  error: string | null;
  run: (strategyId: string, path: string) => Promise<void>;
  stop: (strategyId: string, path: string) => Promise<void>;
  checkStatus: (strategyId: string) => Promise<ProcessStatus | null>;
}

export function useStrategyRunner(): UseStrategyRunnerResult {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStatus = useStrategiesStore((state) => state.setStatus);
  const setPid = useStrategiesStore((state) => state.setPid);
  const setInjectedGames = useStrategiesStore(
    (state) => state.setInjectedGames
  );
  const setStrategyError = useStrategiesStore((state) => state.setError);
  const addLogs = useLogsStore((state) => state.addLogs);
  const addLog = useLogsStore((state) => state.addLog);
  const games = useSettingsStore((state) => state.settings.games);
  const engine = useSettingsStore(
    (state) => state.settings.advanced.strategyEngine
  );
  const hasEnabledGames = games.some((game) => game.enabled);
  const autoRestore = games.some((game) => game.enabled && game.autoRestore);
  const setLastStrategyId = useSettingsStore(
    (state) => state.setLastStrategyId
  );
  const { restoreAll: restore } = useGamesInjector();
  const busy = useRef(false);

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];
    let disposed = false;

    const register = (promise: Promise<UnlistenFn>) => {
      promise
        .then((unlisten) => {
          if (disposed) {
            unlisten();
            return;
          }
          unlisteners.push(unlisten);
        })
        .catch(() => undefined);
    };

    register(
      listen<IncomingLogLine[]>("strategy-log", (event) => {
        addLogs(
          event.payload.map((line) => ({
            timestamp: line.timestamp,
            level: line.level as LogLevel,
            source: "strategy" as const,
            message: line.message,
            strategyId: line.strategyId === "" ? undefined : line.strategyId,
          }))
        );
      })
    );

    register(
      listen<string>("strategy-stopped", (event) => {
        setStatus(event.payload, "idle");
        setPid(event.payload, undefined);
        setInjectedGames(event.payload, null);
      })
    );

    register(
      listen<string>("strategy-started", (event) => {
        setStatus(event.payload, "running");
      })
    );

    return () => {
      disposed = true;
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, [addLogs, setInjectedGames, setPid, setStatus]);

  const run = useCallback(
    async (strategyId: string, path: string) => {
      if (busy.current) {
        return;
      }

      busy.current = true;
      setIsStarting(true);
      setError(null);
      setStatus(strategyId, "starting");

      try {
        if (useVpnStore.getState().status.state === "connected") {
          addLog({
            level: "info",
            source: "strategy",
            message: translateKey("log.stoppingVpn"),
          });
          await invoke("switch_to_dpi");
          useVpnStore.getState().setStatus({
            state: "disconnected",
            error: null,
          });
        }

        const result = await launchStrategy(strategyId, path);

        setStatus(strategyId, "running");
        setPid(strategyId, result.pid);
        setInjectedGames(strategyId, result.gamesInjected);
        setLastStrategyId(strategyId);
        void recordStrategyScore(strategyId);

        const general = useSettingsStore.getState().settings.general;

        if (general.showNotifications && general.showNotificationsOnStart) {
          const active = useStrategiesStore
            .getState()
            .strategies.find((item) => item.id === strategyId);

          void invoke("show_notification", {
            title: translateKey("log.strategyStartedTitle"),
            body: translateKey("log.strategyStartedBody", {
              name: active?.name ?? "",
            }),
            kind: "success",
          }).catch(() => undefined);
        }
        addLog({
          level: "info",
          source: "strategy",
          message: translateKey("log.strategyStarted", { pid: result.pid }),
          strategyId,
        });
      } catch (caught) {
        const message = toErrorMessage(caught);

        setError(message);
        setStatus(strategyId, "error");
        setStrategyError(strategyId, message);
        addLog({
          level: "error",
          source: "strategy",
          message: message.toLowerCase().includes(UAC_CANCELLED_MARKER)
            ? translateKey("log.launchCancelled")
            : translateKey("log.launchFailed", { error: message }),
          strategyId,
        });
      } finally {
        busy.current = false;
        setIsStarting(false);
      }
    },
    [
      addLog,
      setInjectedGames,
      setLastStrategyId,
      setPid,
      setStatus,
      setStrategyError,
    ]
  );

  const stop = useCallback(
    async (strategyId: string, path: string) => {
      if (busy.current) {
        return;
      }

      busy.current = true;
      setIsStopping(true);
      setStatus(strategyId, "stopping");

      try {
        const killed = await invoke<number>("stop_strategy", { strategyId });

        setStatus(strategyId, "idle");
        setPid(strategyId, undefined);
        setInjectedGames(strategyId, null);
        addLog({
          level: killed > 0 ? "warn" : "info",
          source: "strategy",
          message: translateKey("log.strategyStopped", { count: killed }),
          strategyId,
        });

        if (engine === "legacy" && hasEnabledGames && autoRestore) {
          await restore(path);
        }
      } catch (caught) {
        const message = toErrorMessage(caught);
        setError(message);
        addLog({
          level: "error",
          source: "strategy",
          message: translateKey("log.stopFailed", { error: message }),
          strategyId,
        });
      } finally {
        busy.current = false;
        setIsStopping(false);
      }
    },
    [
      addLog,
      autoRestore,
      engine,
      hasEnabledGames,
      restore,
      setInjectedGames,
      setPid,
      setStatus,
    ]
  );

  const checkStatus = useCallback(
    async (strategyId: string): Promise<ProcessStatus | null> => {
      try {
        return await invoke<ProcessStatus>("check_strategy_status", {
          strategyId,
        });
      } catch {
        return null;
      }
    },
    []
  );

  return { isStarting, isStopping, error, run, stop, checkStatus };
}
