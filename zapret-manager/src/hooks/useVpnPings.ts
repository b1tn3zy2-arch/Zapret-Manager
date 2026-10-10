import { useCallback, useEffect, useRef, useState } from "react";

import { VPN_PING_INTERVAL_MS } from "@/lib/constants";
import { endpointHost } from "@/lib/vpnEndpoint";
import { usePing } from "@/hooks/usePing";
import { lastLatency } from "@/lib/pingUtils";
import type { VpnConfigInfo } from "@/types";

export interface UseVpnPingsResult {
  pings: ReadonlyMap<string, number | null>;
  isRefreshing: boolean;
  refresh: () => void;
}

export function useVpnPings(
  configs: readonly VpnConfigInfo[]
): UseVpnPingsResult {
  const targets = configs
    .map((config) => endpointHost(config.endpoint))
    .filter((host) => host !== "");

  const { history, refresh } = usePing({
    hosts: targets.map((host) => ({ host, label: host })),
    historySize: 1,
    intervalMs: VPN_PING_INTERVAL_MS,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const timeout = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeout.current !== null) {
        window.clearTimeout(timeout.current);
      }
    },
    []
  );

  const handleRefresh = useCallback((): void => {
    setIsRefreshing(true);
    refresh();

    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
    }

    timeout.current = window.setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  }, [refresh]);

  const pings = new Map<string, number | null>();

  for (const config of configs) {
    pings.set(
      config.id,
      lastLatency(history[endpointHost(config.endpoint)] ?? [])
    );
  }

  return { pings, isRefreshing, refresh: handleRefresh };
}
