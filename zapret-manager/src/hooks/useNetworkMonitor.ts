// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля react.
import type { RefObject } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт MONITOR_BUFFER_SIZE.
  MONITOR_BUFFER_SIZE,
  // Подключаем именованный импорт MONITOR_INTERVAL_MS.
  MONITOR_INTERVAL_MS,
  // Подключаем именованный импорт MONITOR_STATS_REFRESH_MS.
  MONITOR_STATS_REFRESH_MS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { buildTrafficPoint } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { NetworkStats, TrafficPoint } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EVENT_NETWORK_STATS = network-stats.
const EVENT_NETWORK_STATS = "network-stats";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseNetworkMonitorResult {
  // Обрабатываем конструкцию: bufferRef.
  bufferRef: RefObject<TrafficPoint[]>;
  // Обрабатываем конструкцию: stats.
  stats: NetworkStats | null;
  // Обрабатываем конструкцию: isPaused.
  isPaused: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: clearBuffer.
  clearBuffer: () => void;
  // Обрабатываем конструкцию: togglePause.
  togglePause: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useNetworkMonitor(): UseNetworkMonitorResult {
  // Обрабатываем конструкцию: const bufferRef = useRef<TrafficPoint[]>([]).
  const bufferRef = useRef<TrafficPoint[]>([]);
  // Обрабатываем конструкцию: const latestRef = useRef<NetworkStats | null>(null).
  const latestRef = useRef<NetworkStats | null>(null);
  // Обрабатываем конструкцию: const pausedRef = useRef(false).
  const pausedRef = useRef(false);
  // Обрабатываем конструкцию: const mountedRef = useRef(true).
  const mountedRef = useRef(true);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [stats, setStats] = useState<NetworkStats | null>….
  const [stats, setStats] = useState<NetworkStats | null>(null);
  // Обрабатываем конструкцию: const [isPaused, setIsPaused] = useState(false).
  const [isPaused, setIsPaused] = useState(false);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const start = useCallback(async () => { try { await sec….
  const start = useCallback(async () => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await secureInvoke(start_monitoring, { interv….
      await secureInvoke("start_monitoring", {
        // Обрабатываем конструкцию: intervalMs.
        intervalMs: MONITOR_INTERVAL_MS,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Проверяем бизнес-условие: mountedRef.current.
      if (mountedRef.current) {
        // Обрабатываем конструкцию: setError.
        setError(toErrorMessage(caught));
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const stop = useCallback(async () => { try { await secu….
  const stop = useCallback(async () => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await secureInvoke(stop_monitoring).
      await secureInvoke("stop_monitoring");
      // Закрываем текущий блок.
    } catch (caught) {
      // Проверяем бизнес-условие: mountedRef.current.
      if (mountedRef.current) {
        // Обрабатываем конструкцию: setError.
        setError(toErrorMessage(caught));
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const clearBuffer = useCallback(() => { bufferRef.curre….
  const clearBuffer = useCallback(() => {
    // Обрабатываем конструкцию: bufferRef.
    bufferRef.current = [];
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const togglePause = useCallback(() => { const next = !p….
  const togglePause = useCallback(() => {
    // Обрабатываем конструкцию: const next = !pausedRef.current.
    const next = !pausedRef.current;
    // Обрабатываем конструкцию: pausedRef.
    pausedRef.current = next;
    // Обрабатываем конструкцию: setIsPaused.
    setIsPaused(next);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: next.
    if (next) {
      // Обрабатываем конструкцию: void stop().
      void stop();
      // Закрываем текущий блок.
    } else {
      // Обрабатываем конструкцию: void start().
      void start();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [start, stop]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: mountedRef.
    mountedRef.current = true;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const subscription = listen<NetworkStats>(EVENT_NETWORK….
    const subscription = listen<NetworkStats>(EVENT_NETWORK_STATS, (event) => {
      // Проверяем бизнес-условие: pausedRef.current.
      if (pausedRef.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: latestRef.
      latestRef.current = event.payload;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const next = bufferRef.current.
      const next = bufferRef.current;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: next.
      next.push(buildTrafficPoint(event.payload));
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: next.length > MONITOR_BUFFER_SIZE.
      if (next.length > MONITOR_BUFFER_SIZE) {
        // Обрабатываем конструкцию: next.
        next.splice(0, next.length - MONITOR_BUFFER_SIZE);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { if (!pausedRef….
    const timer = window.setInterval(() => {
      // Проверяем бизнес-условие: !pausedRef.current.
      if (!pausedRef.current) {
        // Обрабатываем конструкцию: setStats.
        setStats(latestRef.current);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }, MONITOR_STATS_REFRESH_MS);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const onVisibility = (): void => { if (document.hidden)….
    const onVisibility = (): void => {
      // Проверяем бизнес-условие: document.hidden.
      if (document.hidden) {
        // Обрабатываем конструкцию: void stop().
        void stop();
        // Закрываем текущий блок.
      } else if (!pausedRef.current) {
        // Обрабатываем конструкцию: void start().
        void start();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document.addEventListener("visibilitychange", onVisibility);
    // Обрабатываем конструкцию: void start().
    void start();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { mountedRef.current = false; window.clearInterva….
    return () => {
      // Обрабатываем конструкцию: mountedRef.
      mountedRef.current = false;
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Обрабатываем конструкцию: document.
      document.removeEventListener("visibilitychange", onVisibility);
      // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
      void subscription.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Обрабатываем конструкцию: void stop().
      void stop();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [start, stop]);
  // — разделитель логических блоков —

  // Возвращаем результат: { bufferRef, stats, isPaused, error, clearBuffer, toggl….
  return { bufferRef, stats, isPaused, error, clearBuffer, togglePause };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
