import { useMemo } from "react";

import { CONNECTION_STATUS, type ConnectionStatus } from "@/lib/constants";
import {
  selectStrategies,
  useStrategiesStore,
} from "@/stores/useStrategiesStore";
import { selectVpnActive, useVpnStore } from "@/stores/useVpnStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Strategy } from "@/types";

export function useActiveStrategy(): Strategy | undefined {
  const strategies = useStrategiesStore(selectStrategies);

  return useMemo(
    () => strategies.find((strategy) => strategy.status === "running"),
    [strategies]
  );
}

export function useLastStrategy(): Strategy | undefined {
  const strategies = useStrategiesStore(selectStrategies);
  const lastStrategyId = useSettingsStore(
    (state) => state.settings.lastStrategyId
  );

  return useMemo(() => {
    if (lastStrategyId === null) {
      return undefined;
    }

    return strategies.find((strategy) => strategy.id === lastStrategyId);
  }, [lastStrategyId, strategies]);
}

export { useCollectionStats, useFilteredCards } from "./useStrategyCards";

export { useErrorsCount } from "./useLogSelectors";

export function useConnectionStatus(): ConnectionStatus {
  const strategies = useStrategiesStore(selectStrategies);
  const vpnState = useVpnStore((state) => state.status.state);
  const isVpnConnected = useVpnStore(selectVpnActive);

  return useMemo(() => {
    if (vpnState === "error") {
      return CONNECTION_STATUS.error;
    }

    if (isVpnConnected) {
      return CONNECTION_STATUS.vpn;
    }

    if (vpnState === "connecting") {
      return CONNECTION_STATUS.connecting;
    }

    const hasStarting = strategies.some(
      (strategy) => strategy.status === "starting"
    );

    if (hasStarting) {
      return CONNECTION_STATUS.connecting;
    }

    const hasRunning = strategies.some(
      (strategy) => strategy.status === "running"
    );

    if (hasRunning) {
      return CONNECTION_STATUS.connected;
    }

    const hasFailed = strategies.some(
      (strategy) => strategy.status === "error"
    );

    return hasFailed ? CONNECTION_STATUS.error : CONNECTION_STATUS.disconnected;
  }, [strategies, vpnState, isVpnConnected]);
}

export function useRunningStartedAt(): number | null {
  const strategies = useStrategiesStore(selectStrategies);

  return useMemo(() => {
    const running = strategies.find(
      (strategy) => strategy.status === "running"
    );

    return running?.lastRun ?? null;
  }, [strategies]);
}

export function useStrategiesCount(): number {
  return useStrategiesStore(selectStrategies).length;
}
