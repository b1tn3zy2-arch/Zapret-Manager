import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useRef, useState } from "react";

import { NETWORK_INFO_CACHE_KEY, NETWORK_INFO_CACHE_MS } from "@/lib/constants";
import { toErrorMessage } from "@/lib/utils";

export interface NetworkInfo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
}

export interface UseNetworkInfoResult {
  info: NetworkInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function readCache(): { info: NetworkInfo; fetchedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(NETWORK_INFO_CACHE_KEY);

    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "info" in parsed &&
      "fetchedAt" in parsed
    ) {
      const record = parsed as { info: NetworkInfo; fetchedAt: number };

      if (typeof record.fetchedAt === "number") {
        return record;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function writeCache(info: NetworkInfo): void {
  try {
    window.localStorage.setItem(
      NETWORK_INFO_CACHE_KEY,
      JSON.stringify({ info, fetchedAt: Date.now() })
    );
  } catch {
    return;
  }
}

export function useNetworkInfo(): UseNetworkInfoResult {
  const [info, setInfo] = useState<NetworkInfo | null>(
    () => readCache()?.info ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async (force: boolean) => {
    if (!force) {
      const cached = readCache();

      if (
        cached !== null &&
        Date.now() - cached.fetchedAt < NETWORK_INFO_CACHE_MS
      ) {
        setInfo(cached.info);
        return;
      }
    }

    setIsLoading(true);

    try {
      const fresh = await invoke<NetworkInfo>("fetch_network_info");

      if (!mounted.current) {
        return;
      }

      setInfo(fresh);
      setError(null);
      writeCache(fresh);
    } catch (caught) {
      if (!mounted.current) {
        return;
      }

      const cached = readCache();
      setInfo(cached?.info ?? null);
      setError(toErrorMessage(caught));
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;

      void load(false);

      return;
    }

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        void load(true);
      }
    }, NETWORK_INFO_CACHE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [load]);

  const refresh = useCallback(async (): Promise<void> => {
    await load(true);
  }, [load]);

  return { info, isLoading, error, refresh };
}
