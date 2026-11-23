// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { NETWORK_INFO_CACHE_KEY, NETWORK_INFO_CACHE_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { NetworkInfoSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvokeValidated } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface NetworkInfo {
  // Обрабатываем конструкцию: ip.
  ip: string;
  // Обрабатываем конструкцию: country.
  country: string;
  // Обрабатываем конструкцию: countryCode.
  countryCode: string;
  // Обрабатываем конструкцию: city.
  city: string;
  // Обрабатываем конструкцию: isp.
  isp: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseNetworkInfoResult {
  // Обрабатываем конструкцию: info.
  info: NetworkInfo | null;
  // Обрабатываем конструкцию: isLoading.
  isLoading: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: refresh.
  refresh: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию readCache.
function readCache(): { info: NetworkInfo; fetchedAt: number } | null {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const raw = window.localStorage.getItem(NETWORK_INFO_CA….
    const raw = window.localStorage.getItem(NETWORK_INFO_CACHE_KEY);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: raw === null.
    if (raw === null) {
      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const parsed: unknown = JSON.parse(raw).
    const parsed: unknown = JSON.parse(raw);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: typeof parsed === object && parsed !== null && info in ….
    if (
      // Обрабатываем конструкцию: typeof parsed.
      typeof parsed === "object" &&
      // Обрабатываем конструкцию: parsed.
      parsed !== null &&
      // Обрабатываем конструкцию: info.
      "info" in parsed &&
      // Обрабатываем конструкцию: fetchedAt.
      "fetchedAt" in parsed
      // Закрываем выражение или список аргументов.
    ) {
      // Обрабатываем конструкцию: const record = parsed as { info: NetworkInfo; fetchedAt….
      const record = parsed as { info: NetworkInfo; fetchedAt: number };
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: typeof record.fetchedAt === number.
      if (typeof record.fetchedAt === "number") {
        // Возвращаем результат: record.
        return record;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  } catch {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию writeCache.
function writeCache(info: NetworkInfo): void {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: window.
    window.localStorage.setItem(
      // Обрабатываем конструкцию: NETWORK_INFO_CACHE_KEY.
      NETWORK_INFO_CACHE_KEY,
      // Обрабатываем конструкцию: JSON.
      JSON.stringify({ info, fetchedAt: Date.now() })
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  } catch {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useNetworkInfo(): UseNetworkInfoResult {
  // Обрабатываем конструкцию: const [info, setInfo] = useState<NetworkInfo | null>( (….
  const [info, setInfo] = useState<NetworkInfo | null>(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => readCache()?.info ?? null
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const [isLoading, setIsLoading] = useState(false).
  const [isLoading, setIsLoading] = useState(false);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // Обрабатываем конструкцию: const mounted = useRef(true).
  const mounted = useRef(true);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: mounted.
    mounted.current = true;
    // — разделитель логических блоков —

    // Возвращаем результат: () => { mounted.current = false; }.
    return () => {
      // Обрабатываем конструкцию: mounted.
      mounted.current = false;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const load = useCallback(async (force: boolean) => { if….
  const load = useCallback(async (force: boolean) => {
    // Проверяем бизнес-условие: !force.
    if (!force) {
      // Обрабатываем конструкцию: const cached = readCache().
      const cached = readCache();
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: cached !== null && Date.now() - cached.fetchedAt < NETW….
      if (
        // Обрабатываем конструкцию: cached.
        cached !== null &&
        // Обрабатываем конструкцию: Date.
        Date.now() - cached.fetchedAt < NETWORK_INFO_CACHE_MS
        // Закрываем выражение или список аргументов.
      ) {
        // Обрабатываем конструкцию: setInfo.
        setInfo(cached.info);
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setIsLoading.
    setIsLoading(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const fresh = await secureInvokeValidated( fetch_networ….
      const fresh = await secureInvokeValidated(
        // Обрабатываем конструкцию: fetch_network_info.
        "fetch_network_info",
        // Обрабатываем конструкцию: NetworkInfoSchema.
        NetworkInfoSchema
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !mounted.current.
      if (!mounted.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setInfo.
      setInfo(fresh);
      // Обрабатываем конструкцию: setError.
      setError(null);
      // Обрабатываем конструкцию: writeCache.
      writeCache(fresh);
      // Закрываем текущий блок.
    } catch (caught) {
      // Проверяем бизнес-условие: !mounted.current.
      if (!mounted.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const cached = readCache().
      const cached = readCache();
      // Обрабатываем конструкцию: setInfo.
      setInfo(cached?.info ?? null);
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Проверяем бизнес-условие: mounted.current.
      if (mounted.current) {
        // Обрабатываем конструкцию: setIsLoading.
        setIsLoading(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const firstRun = useRef(true).
  const firstRun = useRef(true);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: firstRun.current.
    if (firstRun.current) {
      // Обрабатываем конструкцию: firstRun.
      firstRun.current = false;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void load(false).
      void load(false);
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { if (!document.….
    const timer = window.setInterval(() => {
      // Проверяем бизнес-условие: !document.hidden.
      if (!document.hidden) {
        // Обрабатываем конструкцию: void load(true).
        void load(true);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }, NETWORK_INFO_CACHE_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [load]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refresh = useCallback(async (): Promise<void> => ….
  const refresh = useCallback(async (): Promise<void> => {
    // Ожидаем завершение асинхронной операции await load(true).
    await load(true);
    // Закрываем текущий блок.
  }, [load]);
  // — разделитель логических блоков —

  // Возвращаем результат: { info, isLoading, error, refresh }.
  return { info, isLoading, error, refresh };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
