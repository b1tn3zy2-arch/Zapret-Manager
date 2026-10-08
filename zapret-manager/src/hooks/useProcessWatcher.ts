import { useEffect } from "react";

import { PROCESS_CHECK_INTERVAL_MS } from "@/lib/constants";
import { useStrategiesStore } from "@/stores/useStrategiesStore";

export type CheckStrategyStatus = (strategyId: string) => Promise<{
  running: boolean;
} | null>;

export function useProcessWatcher(checkStatus: CheckStrategyStatus): void {
  const strategies = useStrategiesStore((state) => state.strategies);
  const setStatus = useStrategiesStore((state) => state.setStatus);
  const setError = useStrategiesStore((state) => state.setError);

  useEffect(() => {
    const handle = window.setInterval(() => {
      for (const strategy of strategies) {
        if (strategy.status !== "running") {
          continue;
        }

        void checkStatus(strategy.id).then((status) => {
          if (status === null) {
            return;
          }

          if (!status.running) {
            setStatus(strategy.id, "error");
            setError(strategy.id, "Процесс неожиданно завершился");
          }
        });
      }
    }, PROCESS_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(handle);
    };
  }, [checkStatus, setError, setStatus, strategies]);
}
