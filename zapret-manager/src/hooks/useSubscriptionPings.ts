import { useCallback, useEffect, useRef, useState } from "react";

import { VPN_PING_INTERVAL_MS } from "@/lib/constants";
import { pingEndpoints, type EndpointPing } from "@/lib/vpnCommands";
import type { SubscriptionServer } from "@/types";

export interface UseSubscriptionPingsResult {
  pings: ReadonlyMap<string, number | null>;
  isRefreshing: boolean;
  refresh: () => void;
}

export function useSubscriptionPings(
  servers: readonly SubscriptionServer[]
): UseSubscriptionPingsResult {
  const [pings, setPings] = useState<Map<string, number | null>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const started = useRef(false);

  const probe = useCallback(async (): Promise<void> => {
    if (servers.length === 0) {
      setPings(new Map());

      return;
    }

    setIsRefreshing(true);

    const targets = new Map<string, EndpointPing>();

    try {
      const results = await pingEndpoints(
        servers.map((server) => ({
          host: server.host,
          port: server.port,
        }))
      );

      for (const result of results) {
        targets.set(result.endpoint, result);
      }

      const next = new Map<string, number | null>();

      for (const server of servers) {
        const result = targets.get(server.host);

        next.set(
          server.id,
          result?.success ? (result.latencyMs ?? null) : null
        );
      }

      setPings(next);
    } catch {
      const next = new Map<string, number | null>();

      for (const server of servers) {
        next.set(server.id, null);
      }

      setPings(next);
    } finally {
      setIsRefreshing(false);
    }
  }, [servers]);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      void probe();
    }
  }, [probe]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        void probe();
      }
    }, VPN_PING_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [probe]);

  return { pings, isRefreshing, refresh: () => void probe() };
}
