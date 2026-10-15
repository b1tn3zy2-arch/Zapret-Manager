import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useEffect } from "react";

import { useLogsStore } from "@/stores/useLogsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import type { LogLevel } from "@/types";

interface IncomingLogLine {
  timestamp: number;
  level: string;
  source: string;
  message: string;
  strategyId: string;
}

/**
 * Подписка приложения на события стратегии.
 *
 * Раньше слушатели жили внутри useStrategyRunner, а этот хук создаётся на
 * каждой странице (главная, стратегии, игры, логи). Каждый экземпляр
 * подписывался на strategy-log заново и писал одни и те же строки в общий
 * стор — в логах появлялись дубли по числу открытых разделов.
 *
 * Теперь подписка одна на всё приложение: хук вызывается в App.
 */
export function useStrategyEvents(): void {
  const addLogs = useLogsStore((state) => state.addLogs);
  const setStatus = useStrategiesStore((state) => state.setStatus);
  const setPid = useStrategiesStore((state) => state.setPid);
  const setInjectedGames = useStrategiesStore(
    (state) => state.setInjectedGames
  );

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];
    let disposed = false;

    const register = (promise: Promise<UnlistenFn>): void => {
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
}
