// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { PROCESS_CHECK_INTERVAL_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type CheckStrategyStatus = (strategyId: string) => Promise<{
  // Обрабатываем конструкцию: running.
  running: boolean;
  // Закрываем текущий блок.
} | null>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useProcessWatcher(checkStatus: CheckStrategyStatus): void {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore((state) => state.….
  const strategies = useStrategiesStore((state) => state.strategies);
  // Обрабатываем конструкцию: const setStatus = useStrategiesStore((state) => state.s….
  const setStatus = useStrategiesStore((state) => state.setStatus);
  // Обрабатываем конструкцию: const setError = useStrategiesStore((state) => state.se….
  const setError = useStrategiesStore((state) => state.setError);
  // Обрабатываем конструкцию: const clearActiveStrategy = useStrategiesStore( (state)….
  const clearActiveStrategy = useStrategiesStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.clearActiveStrategy
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const handle = window.setInterval(() => { for (const st….
    const handle = window.setInterval(() => {
      // Перебираем элементы коллекции strategies.
      for (const strategy of strategies) {
        // Проверяем бизнес-условие: strategy.status !== running.
        if (strategy.status !== "running") {
          // Переходим к следующей итерации цикла.
          continue;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: void checkStatus(strategy.id).then((status) => { if (st….
        void checkStatus(strategy.id).then((status) => {
          // Проверяем бизнес-условие: status === null.
          if (status === null) {
            // Завершаем функцию без возвращаемого значения.
            return;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: !status.running.
          if (!status.running) {
            // Обрабатываем конструкцию: setStatus.
            setStatus(strategy.id, "error");
            // Обрабатываем конструкцию: setError.
            setError(strategy.id, translateKey("log.processExited"));
            // Сохраняем пояснение разработчика: // Процесса уже нет: активной стратегии быть не должно,
            // Процесса уже нет: активной стратегии быть не должно,
            // Сохраняем пояснение разработчика: // иначе интерфейс показывает «работает» у мёртвой.
            // иначе интерфейс показывает «работает» у мёртвой.
            // Обрабатываем конструкцию: clearActiveStrategy.
            clearActiveStrategy(strategy.id);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }, PROCESS_CHECK_INTERVAL_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(handle); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(handle);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [checkStatus, clearActiveStrategy, setError, setStatus, strategies]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
