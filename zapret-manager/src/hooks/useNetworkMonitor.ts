import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import {
  MONITOR_BUFFER_SIZE,
  MONITOR_INTERVAL_MS,
  MONITOR_STATS_REFRESH_MS,
} from "@/lib/constants";
import { buildTrafficPoint } from "@/lib/trafficUtils";
import { toErrorMessage } from "@/lib/utils";
import type { NetworkStats, TrafficPoint } from "@/types";

const EVENT_NETWORK_STATS = "network-stats";

export interface UseNetworkMonitorResult {
  bufferRef: RefObject<TrafficPoint[]>;
  stats: NetworkStats | null;
  isPaused: boolean;
  error: string | null;
  clearBuffer: () => void;
  togglePause: () => void;
}

export function useNetworkMonitor(): UseNetworkMonitorResult {
  const bufferRef = useRef<TrafficPoint[]>([]);
  const latestRef = useRef<NetworkStats | null>(null);
  const pausedRef = useRef(false);
  const mountedRef = useRef(true);

  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      await invoke("start_monitoring", { intervalMs: MONITOR_INTERVAL_MS });
    } catch (caught) {
      if (mountedRef.current) {
        setError(toErrorMessage(caught));
      }
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await invoke("stop_monitoring");
    } catch (caught) {
      if (mountedRef.current) {
        setError(toErrorMessage(caught));
      }
    }
  }, []);

  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
  }, []);

  const togglePause = useCallback(() => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setIsPaused(next);

    if (next) {
      void stop();
    } else {
      void start();
    }
  }, [start, stop]);

  useEffect(() => {
    mountedRef.current = true;

    const subscription = listen<NetworkStats>(EVENT_NETWORK_STATS, (event) => {
      if (pausedRef.current) {
        return;
      }

      latestRef.current = event.payload;

      const next = bufferRef.current;

      next.push(buildTrafficPoint(event.payload));

      if (next.length > MONITOR_BUFFER_SIZE) {
        next.splice(0, next.length - MONITOR_BUFFER_SIZE);
      }
    });

    const timer = window.setInterval(() => {
      if (!pausedRef.current) {
        setStats(latestRef.current);
      }
    }, MONITOR_STATS_REFRESH_MS);

    const onVisibility = (): void => {
      if (document.hidden) {
        void stop();
      } else if (!pausedRef.current) {
        void start();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    void start();

    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      void subscription.then((unlisten) => {
        unlisten();
      });
      void stop();
    };
  }, [start, stop]);

  return { bufferRef, stats, isPaused, error, clearBuffer, togglePause };
}
