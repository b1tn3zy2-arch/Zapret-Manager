import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  PING_HISTORY_SIZE,
  PING_HOSTS,
  PING_INTERVAL_MS,
} from "@/lib/constants";
import type { PingPoint } from "@/lib/pingUtils";

interface PingResult {
  host: string;
  latencyMs: number | null;
  success: boolean;
}

export type PingHistory = Record<string, PingPoint[]>;

export interface UsePingOptions {
  hosts?: readonly { host: string; label: string }[];
  historySize?: number;
  intervalMs?: number;
}

export interface UsePingResult {
  history: PingHistory;
  isLoading: boolean;
  refresh: () => void;
}

function buildHistory(hosts: readonly { host: string }[]): PingHistory {
  return hosts.reduce<PingHistory>((accumulator, { host }) => {
    accumulator[host] = [];
    return accumulator;
  }, {});
}

export function usePing(options: UsePingOptions = {}): UsePingResult {
  const {
    hosts = PING_HOSTS,
    historySize = PING_HISTORY_SIZE,
    intervalMs = PING_INTERVAL_MS,
  } = options;

  const [history, setHistory] = useState<PingHistory>(() =>
    buildHistory(hosts)
  );
  const [isLoading, setIsLoading] = useState(false);
  const running = useRef(false);
  const mounted = useRef(true);
  const startedRef = useRef(false);
  const targetRef = useRef(hosts);
  const sizeRef = useRef(historySize);

  useEffect(() => {
    targetRef.current = hosts;
    sizeRef.current = historySize;
  }, [historySize, hosts]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const probe = useCallback(async () => {
    if (running.current || document.hidden) {
      return;
    }

    running.current = true;
    setIsLoading(true);

    try {
      const results = await invoke<PingResult[]>("ping_hosts", {
        hosts: targetRef.current.map(({ host }) => host),
      });

      if (!mounted.current) {
        return;
      }

      const timestamp = Date.now();
      const limit = sizeRef.current;

      setHistory((previous) => {
        const next: PingHistory = { ...previous };

        for (const result of results) {
          const existing = next[result.host] ?? [];

          next[result.host] = [
            ...existing,
            {
              timestamp,
              latencyMs: result.latencyMs,
              success: result.success,
            },
          ].slice(-limit);
        }

        return next;
      });
    } catch {
      return;
    } finally {
      running.current = false;

      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void probe();
    }

    const timer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      void probe();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, probe]);

  const refresh = useCallback((): void => {
    void probe();
  }, [probe]);

  return { history, isLoading, refresh };
}
