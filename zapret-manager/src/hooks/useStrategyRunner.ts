import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";

import { enabledGames } from "@/lib/gameUtils";
import { useGamesInjector } from "@/hooks/useGamesInjector";
import { useLogsStore } from "@/stores/useLogsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useVpnStore } from "@/stores/useVpnStore";
import { toErrorMessage } from "@/lib/utils";
import type { GameSettings, LogLevel } from "@/types";

interface RunResult {
  pid: number;
  logPath: string;
}

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

interface NativeGamePayload {
  name: string;
  domains: string[];
  ips: string[];
}

const UAC_CANCELLED_MARKER = "отменён";

export interface UseStrategyRunnerResult {
  isStarting: boolean;
  isStopping: boolean;
  error: string | null;
  run: (strategyId: string, path: string) => Promise<void>;
  stop: (strategyId: string, path: string) => Promise<void>;
  checkStatus: (strategyId: string) => Promise<ProcessStatus | null>;
}

function toNativeGames(games: GameSettings[]): NativeGamePayload[] {
  return enabledGames(games).map((game) => ({
    name: game.name,
    domains: game.domains,
    ips: game.ipRanges,
  }));
}

function hasNativeConfig(strategyId: string): boolean {
  const strategy = useStrategiesStore
    .getState()
    .strategies.find((item) => item.id === strategyId);

  return (strategy?.config?.groups.length ?? 0) > 0;
}

export function useStrategyRunner(): UseStrategyRunnerResult {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setStatus = useStrategiesStore((state) => state.setStatus);
  const setPid = useStrategiesStore((state) => state.setPid);
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
  const { injectAll, restoreAll: restore } = useGamesInjector();
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
  }, [addLogs, setPid, setStatus]);

  const launch = useCallback(
    async (strategyId: string, path: string): Promise<RunResult> => {
      const native = engine === "native" && hasNativeConfig(strategyId);

      if (native) {
        return invoke<RunResult>("run_strategy_native", {
          strategyId,
          path,
          games: toNativeGames(games),
        });
      }

      if (engine === "native") {
        addLog({
          level: "warn",
          source: "strategy",
          message:
            "Конфиг стратегии не распознан — запускаю legacy .bat через cmd.exe",
          strategyId,
        });
      }

      if (hasEnabledGames) {
        const summary = await injectAll(path);

        if (summary === null) {
          throw new Error("Инъекция домен игр не удалась");
        }
      }

      return invoke<RunResult>("run_strategy", { strategyId, path });
    },
    [addLog, engine, games, hasEnabledGames, injectAll]
  );

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
            message: "Останавливаю VPN перед запуском стратегии",
          });
          await invoke("switch_to_dpi");
          useVpnStore.getState().setStatus({
            state: "disconnected",
            error: null,
          });
        }

        const result = await launch(strategyId, path);

        setStatus(strategyId, "running");
        setPid(strategyId, result.pid);
        setLastStrategyId(strategyId);
        addLog({
          level: "info",
          source: "strategy",
          message: `Стратегия запущена, PID ${result.pid}`,
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
            ? "Запуск отменён: доступ не предоставлен"
            : `Не удалось запустить: ${message}`,
          strategyId,
        });
      } finally {
        busy.current = false;
        setIsStarting(false);
      }
    },
    [addLog, launch, setLastStrategyId, setPid, setStatus, setStrategyError]
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
        addLog({
          level: killed > 0 ? "warn" : "info",
          source: "strategy",
          message: `Стратегия остановлена, процессов winws.exe: ${killed}`,
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
          message: `Не удалось остановить: ${message}`,
          strategyId,
        });
      } finally {
        busy.current = false;
        setIsStopping(false);
      }
    },
    [addLog, autoRestore, engine, hasEnabledGames, restore, setPid, setStatus]
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
