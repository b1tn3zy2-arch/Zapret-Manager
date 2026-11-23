// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт PING_HISTORY_SIZE.
  PING_HISTORY_SIZE,
  // Подключаем именованный импорт PING_HOSTS.
  PING_HOSTS,
  // Подключаем именованный импорт PING_INTERVAL_MS.
  PING_INTERVAL_MS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/pingUtils.
import type { PingPoint } from "@/lib/pingUtils";
// — разделитель логических блоков —

// Объявляем интерфейс PingResult с контрактом данных.
interface PingResult {
  // Обрабатываем конструкцию: host.
  host: string;
  // Обрабатываем конструкцию: latencyMs.
  latencyMs: number | null;
  // Обрабатываем конструкцию: success.
  success: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type PingHistory = Record<string, PingPoint[]>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UsePingOptions {
  // Обрабатываем конструкцию: hosts.
  hosts?: readonly { host: string; label: string }[];
  // Обрабатываем конструкцию: historySize.
  historySize?: number;
  // Обрабатываем конструкцию: intervalMs.
  intervalMs?: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UsePingResult {
  // Обрабатываем конструкцию: history.
  history: PingHistory;
  // Обрабатываем конструкцию: isLoading.
  isLoading: boolean;
  // Обрабатываем конструкцию: refresh.
  refresh: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию buildHistory.
function buildHistory(hosts: readonly { host: string }[]): PingHistory {
  // Возвращаем результат: hosts.reduce<PingHistory>((accumulator, { host }) => { ….
  return hosts.reduce<PingHistory>((accumulator, { host }) => {
    // Обрабатываем конструкцию: accumulator.
    accumulator[host] = [];
    // Возвращаем результат: accumulator.
    return accumulator;
    // Закрываем текущий блок.
  }, {});
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function usePing(options: UsePingOptions = {}): UsePingResult {
  // Обрабатываем конструкцию: const { hosts = PING_HOSTS, historySize = PING_HISTORY_….
  const {
    // Обрабатываем конструкцию: hosts.
    hosts = PING_HOSTS,
    // Обрабатываем конструкцию: historySize.
    historySize = PING_HISTORY_SIZE,
    // Обрабатываем конструкцию: intervalMs.
    intervalMs = PING_INTERVAL_MS,
    // Закрываем текущий блок.
  } = options;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [history, setHistory] = useState<PingHistory>(() ….
  const [history, setHistory] = useState<PingHistory>(
    // Продолжаем предыдущую конструкцию.
    () =>
      // Обрабатываем конструкцию: buildHistory.
      buildHistory(hosts)
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const [isLoading, setIsLoading] = useState(false).
  const [isLoading, setIsLoading] = useState(false);
  // Обрабатываем конструкцию: const running = useRef(false).
  const running = useRef(false);
  // Обрабатываем конструкцию: const mounted = useRef(true).
  const mounted = useRef(true);
  // Обрабатываем конструкцию: const startedRef = useRef(false).
  const startedRef = useRef(false);
  // Обрабатываем конструкцию: const targetRef = useRef(hosts).
  const targetRef = useRef(hosts);
  // Обрабатываем конструкцию: const sizeRef = useRef(historySize).
  const sizeRef = useRef(historySize);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: targetRef.
    targetRef.current = hosts;
    // Обрабатываем конструкцию: sizeRef.
    sizeRef.current = historySize;
    // Закрываем текущий блок.
  }, [historySize, hosts]);
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

  // Обрабатываем конструкцию: const probe = useCallback(async () => { if (running.cur….
  const probe = useCallback(async () => {
    // Проверяем бизнес-условие: running.current || document.hidden.
    if (running.current || document.hidden) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: running.
    running.current = true;
    // Обрабатываем конструкцию: setIsLoading.
    setIsLoading(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const results = await secureInvoke<PingResult[]>(ping_h….
      const results = await secureInvoke<PingResult[]>("ping_hosts", {
        // Обрабатываем конструкцию: hosts.
        hosts: targetRef.current.map(({ host }) => host),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !mounted.current.
      if (!mounted.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const timestamp = Date.now().
      const timestamp = Date.now();
      // Обрабатываем конструкцию: const limit = sizeRef.current.
      const limit = sizeRef.current;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setHistory.
      setHistory((previous) => {
        // Обрабатываем конструкцию: const next: PingHistory = { ...previous }.
        const next: PingHistory = { ...previous };
        // — разделитель логических блоков —

        // Перебираем элементы коллекции results.
        for (const result of results) {
          // Обрабатываем конструкцию: const existing = next[result.host] ?? [].
          const existing = next[result.host] ?? [];
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: next.
          next[result.host] = [
            // Разворачиваем ...existing в коллекцию.
            ...existing,
            // Открываем объектный литерал.
            {
              // Передаём поле timestamp в объект.
              timestamp,
              // Обрабатываем конструкцию: latencyMs.
              latencyMs: result.latencyMs,
              // Обрабатываем конструкцию: success.
              success: result.success,
              // Закрываем текущий блок.
            },
            // Закрываем массив или список.
          ].slice(-limit);
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Возвращаем результат: next.
        return next;
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: running.
      running.current = false;
      // — разделитель логических блоков —

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

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !startedRef.current.
    if (!startedRef.current) {
      // Обрабатываем конструкцию: startedRef.
      startedRef.current = true;
      // Обрабатываем конструкцию: void probe().
      void probe();
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { if (document.h….
    const timer = window.setInterval(() => {
      // Проверяем бизнес-условие: document.hidden.
      if (document.hidden) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void probe().
      void probe();
      // Закрываем текущий блок.
    }, intervalMs);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [intervalMs, probe]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refresh = useCallback((): void => { void probe();….
  const refresh = useCallback((): void => {
    // Обрабатываем конструкцию: void probe().
    void probe();
    // Закрываем текущий блок.
  }, [probe]);
  // — разделитель логических блоков —

  // Возвращаем результат: { history, isLoading, refresh }.
  return { history, isLoading, refresh };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
