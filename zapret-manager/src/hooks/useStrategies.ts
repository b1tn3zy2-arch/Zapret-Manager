import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import type { Strategy } from "@/types";

export interface UseStrategiesResult {
  isLoading: boolean;
  error: string | null;
  lastScanAt: number | null;
  refresh: () => Promise<void>;
  scanFolder: (path: string) => Promise<void>;
}

export function useStrategies(): UseStrategiesResult {
  const strategiesFolder = useSettingsStore(
    (state) => state.settings.strategiesFolder
  );
  const isLoading = useStrategiesStore((state) => state.loading);
  const setStrategies = useStrategiesStore((state) => state.setStrategies);
  const setLoading = useStrategiesStore((state) => state.setLoading);
  const setScanError = useStrategiesStore((state) => state.setScanError);

  const [error, setError] = useState<string | null>(null);
  const [lastScanAt, setLastScanAt] = useState<number | null>(null);
  const mounted = useRef(true);
  const addLog = useLogsStore((state) => state.addLog);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const scanFolder = useCallback(
    async (path: string) => {
      if (path === "") {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await invoke<Strategy[]>("scan_strategies", {
          folder: path,
        });

        if (!mounted.current) {
          return;
        }

        setStrategies(result);
        setLastScanAt(Date.now());
        addLog({
          level: "success",
          source: "strategy",
          message: `Найдено стратегий: ${result.length}`,
        });
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : String(caught);

        if (mounted.current) {
          setError(message);
          setScanError(message);
        }

        addLog({
          level: "error",
          source: "strategy",
          message: `Сканирование не удалось: ${message}`,
        });
      } finally {
        setLoading(false);
      }
    },
    [addLog, setLoading, setScanError, setStrategies]
  );

  const refresh = useCallback(async () => {
    await scanFolder(strategiesFolder);
  }, [scanFolder, strategiesFolder]);

  useEffect(() => {
    if (strategiesFolder === "") {
      return;
    }

    const handle = window.setTimeout(() => {
      void scanFolder(strategiesFolder);
    }, 0);

    return () => {
      window.clearTimeout(handle);
    };
  }, [scanFolder, strategiesFolder]);

  return { isLoading, error, lastScanAt, refresh, scanFolder };
}
