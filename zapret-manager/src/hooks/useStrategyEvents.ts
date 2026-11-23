// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/types.
import type { LogLevel } from "@/types";
// — разделитель логических блоков —

// Объявляем интерфейс IncomingLogLine с контрактом данных.
interface IncomingLogLine {
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Обрабатываем конструкцию: level.
  level: string;
  // Обрабатываем конструкцию: source.
  source: string;
  // Обрабатываем конструкцию: message.
  message: string;
  // Обрабатываем конструкцию: strategyId.
  strategyId: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Подписка приложения на события стратегии.
 * Подписка приложения на события стратегии.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше слушатели жили внутри useStrategyRunner, а этот хук…
 * Раньше слушатели жили внутри useStrategyRunner, а этот хук создаётся на
 // Сохраняем пояснение разработчика: * каждой странице (главная, стратегии, игры, логи). Каждый э…
 * каждой странице (главная, стратегии, игры, логи). Каждый экземпляр
 // Сохраняем пояснение разработчика: * подписывался на strategy-log заново и писал одни и те же с…
 * подписывался на strategy-log заново и писал одни и те же строки в общий
 // Сохраняем пояснение разработчика: * стор — в логах появлялись дубли по числу открытых разделов…
 * стор — в логах появлялись дубли по числу открытых разделов.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Теперь подписка одна на всё приложение: хук вызывается в A…
 * Теперь подписка одна на всё приложение: хук вызывается в App.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useStrategyEvents(): void {
  // Обрабатываем конструкцию: const addLogs = useLogsStore((state) => state.addLogs).
  const addLogs = useLogsStore((state) => state.addLogs);
  // Обрабатываем конструкцию: const setStatus = useStrategiesStore((state) => state.s….
  const setStatus = useStrategiesStore((state) => state.setStatus);
  // Обрабатываем конструкцию: const setPid = useStrategiesStore((state) => state.setP….
  const setPid = useStrategiesStore((state) => state.setPid);
  // Обрабатываем конструкцию: const setInjectedGames = useStrategiesStore( (state) =>….
  const setInjectedGames = useStrategiesStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.setInjectedGames
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const unlisteners: UnlistenFn[] = [].
    const unlisteners: UnlistenFn[] = [];
    // Обрабатываем конструкцию: let disposed = false.
    let disposed = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const register = (promise: Promise<UnlistenFn>): void =….
    const register = (promise: Promise<UnlistenFn>): void => {
      // Обрабатываем конструкцию: promise.
      promise
        // Продолжаем цепочку вызовов.
        .then((unlisten) => {
          // Проверяем бизнес-условие: disposed.
          if (disposed) {
            // Обрабатываем конструкцию: unlisten.
            unlisten();
            // Завершаем функцию без возвращаемого значения.
            return;
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: unlisteners.
          unlisteners.push(unlisten);
          // Закрываем текущий блок.
        })
        // Продолжаем цепочку вызовов.
        .catch(() => undefined);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: register.
    register(
      // Обрабатываем конструкцию: listen.
      listen<IncomingLogLine[]>("strategy-log", (event) => {
        // Обрабатываем конструкцию: addLogs.
        addLogs(
          // Обрабатываем конструкцию: event.
          event.payload.map((line) => ({
            // Обрабатываем конструкцию: timestamp.
            timestamp: line.timestamp,
            // Обрабатываем конструкцию: level.
            level: line.level as LogLevel,
            // Обрабатываем конструкцию: source.
            source: "strategy" as const,
            // Обрабатываем конструкцию: message.
            message: line.message,
            // Обрабатываем конструкцию: strategyId.
            strategyId: line.strategyId === "" ? undefined : line.strategyId,
            // Закрываем текущий блок.
          }))
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: register.
    register(
      // Обрабатываем конструкцию: listen.
      listen<string>("strategy-stopped", (event) => {
        // Обрабатываем конструкцию: setStatus.
        setStatus(event.payload, "idle");
        // Обрабатываем конструкцию: setPid.
        setPid(event.payload, undefined);
        // Обрабатываем конструкцию: setInjectedGames.
        setInjectedGames(event.payload, null);
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: register.
    register(
      // Обрабатываем конструкцию: listen.
      listen<string>("strategy-started", (event) => {
        // Обрабатываем конструкцию: setStatus.
        setStatus(event.payload, "running");
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Возвращаем результат: () => { disposed = true; for (const unlisten of unliste….
    return () => {
      // Обрабатываем конструкцию: disposed.
      disposed = true;
      // Перебираем элементы коллекции unlisteners.
      for (const unlisten of unlisteners) {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [addLogs, setInjectedGames, setPid, setStatus]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
