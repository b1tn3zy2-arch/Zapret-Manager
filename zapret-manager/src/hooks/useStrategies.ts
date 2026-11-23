// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { StrategyInfoSchema, RunningInfoSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvokeValidated } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseStrategiesResult {
  // Обрабатываем конструкцию: isLoading.
  isLoading: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: lastScanAt.
  lastScanAt: number | null;
  // Обрабатываем конструкцию: refresh.
  refresh: () => Promise<void>;
  // Обрабатываем конструкцию: scanFolder.
  scanFolder: (path: string) => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * После сканирования состояние стратегий сверяется с процесс…
 * После сканирования состояние стратегий сверяется с процессами:
 // Сохраняем пояснение разработчика: * перезапуск приложения очищает стор, и без сверки запущенна…
 * перезапуск приложения очищает стор, и без сверки запущенная
 // Сохраняем пояснение разработчика: * стратегия выглядит «неработающей», хотя процесс жив.
 * стратегия выглядит «неработающей», хотя процесс жив.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: async.
async function reconcileRunningState(): Promise<void> {
  // Обрабатываем конструкцию: const running = await secureInvokeValidated( list_runni….
  const running = await secureInvokeValidated(
    // Обрабатываем конструкцию: list_running_processes.
    "list_running_processes",
    // Обрабатываем конструкцию: RunningInfoSchema.
    RunningInfoSchema.array()
    // Закрываем выражение или список аргументов.
  ).catch(() => null);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: running === null.
  if (running === null) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const alive = new Set( running.filter((item) => item.al….
  const alive = new Set(
    // Обрабатываем конструкцию: running.
    running.filter((item) => item.alive).map((item) => item.strategyId)
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const store = useStrategiesStore.getState().
  const store = useStrategiesStore.getState();
  // — разделитель логических блоков —

  // Перебираем элементы коллекции store.strategies.
  for (const strategy of store.strategies) {
    // Проверяем бизнес-условие: alive.has(strategy.id).
    if (alive.has(strategy.id)) {
      // Проверяем бизнес-условие: strategy.status !== running.
      if (strategy.status !== "running") {
        // Обрабатываем конструкцию: store.
        store.setStatus(strategy.id, "running");
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Переходим к следующей итерации цикла.
      continue;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: strategy.status === running.
    if (strategy.status === "running") {
      // Обрабатываем конструкцию: store.
      store.setStatus(strategy.id, "stopped");
      // Обрабатываем конструкцию: store.
      store.setPid(strategy.id, undefined);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Папка последнего автоскана.
 * Папка последнего автоскана.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Хук используется и в App, и на странице «Стратегии»: без э…
 * Хук используется и в App, и на странице «Стратегии»: без этой пометки
 // Сохраняем пояснение разработчика: * каждое открытие страницы заново сканировало десятки файлов…
 * каждое открытие страницы заново сканировало десятки файлов и
 // Сохраняем пояснение разработчика: * перерисовывало весь список прямо под курсором у пользовате…
 * перерисовывало весь список прямо под курсором у пользователя.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: let lastAutoScanFolder: string | null = null.
let lastAutoScanFolder: string | null = null;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useStrategies(): UseStrategiesResult {
  // Обрабатываем конструкцию: const strategiesFolder = useSettingsStore( (state) => s….
  const strategiesFolder = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.strategiesFolder
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const isLoading = useStrategiesStore((state) => state.l….
  const isLoading = useStrategiesStore((state) => state.loading);
  // Обрабатываем конструкцию: const setStrategies = useStrategiesStore((state) => sta….
  const setStrategies = useStrategiesStore((state) => state.setStrategies);
  // Обрабатываем конструкцию: const setLoading = useStrategiesStore((state) => state.….
  const setLoading = useStrategiesStore((state) => state.setLoading);
  // Обрабатываем конструкцию: const setScanError = useStrategiesStore((state) => stat….
  const setScanError = useStrategiesStore((state) => state.setScanError);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [lastScanAt, setLastScanAt] = useState<number | n….
  const [lastScanAt, setLastScanAt] = useState<number | null>(null);
  // Обрабатываем конструкцию: const mounted = useRef(true).
  const mounted = useRef(true);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: mounted.
    mounted.current = true;
    // Возвращаем результат: () => { mounted.current = false; }.
    return () => {
      // Обрабатываем конструкцию: mounted.
      mounted.current = false;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const scanFolder = useCallback( async (path: string) =>….
  const scanFolder = useCallback(
    // Обрабатываем конструкцию: async.
    async (path: string) => {
      // Проверяем бизнес-условие: path ===.
      if (path === "") {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setLoading.
      setLoading(true);
      // Обрабатываем конструкцию: setError.
      setError(null);
      // Обрабатываем конструкцию: lastAutoScanFolder.
      lastAutoScanFolder = path;
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const result = await secureInvokeValidated( scan_strate….
        const result = await secureInvokeValidated(
          // Обрабатываем конструкцию: scan_strategies.
          "scan_strategies",
          // Обрабатываем конструкцию: StrategyInfoSchema.
          StrategyInfoSchema.array(),
          // Открываем объектный литерал.
          {
            // Обрабатываем конструкцию: folder.
            folder: path,
            // Закрываем текущий блок.
          }
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

        // Обрабатываем конструкцию: setStrategies.
        setStrategies(result);
        // Обрабатываем конструкцию: setLastScanAt.
        setLastScanAt(Date.now());
        // Ожидаем завершение асинхронной операции await reconcileRunningState().
        await reconcileRunningState();
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("settings.strategies.foundLog", {
            // Обрабатываем конструкцию: count.
            count: result.length,
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: const message = caught instanceof Error ? caught.messag….
        const message =
          // Обрабатываем конструкцию: caught.
          caught instanceof Error ? caught.message : String(caught);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: lastAutoScanFolder === path.
        if (lastAutoScanFolder === path) {
          // Обрабатываем конструкцию: lastAutoScanFolder.
          lastAutoScanFolder = null;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: mounted.current.
        if (mounted.current) {
          // Обрабатываем конструкцию: setError.
          setError(message);
          // Обрабатываем конструкцию: setScanError.
          setScanError(message);
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.scanFailed", { error: message }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } finally {
        // Обрабатываем конструкцию: setLoading.
        setLoading(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, setLoading, setScanError, setStrategies]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refresh = useCallback(async () => { await scanFol….
  const refresh = useCallback(async () => {
    // Ожидаем завершение асинхронной операции await scanFolder(strategiesFolder).
    await scanFolder(strategiesFolder);
    // Закрываем текущий блок.
  }, [scanFolder, strategiesFolder]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: strategiesFolder ===.
    if (strategiesFolder === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const handle = window.setTimeout(() => { const store = ….
    const handle = window.setTimeout(() => {
      // Обрабатываем конструкцию: const store = useStrategiesStore.getState().
      const store = useStrategiesStore.getState();
      // Обрабатываем конструкцию: const alreadyScanned = lastAutoScanFolder === strategie….
      const alreadyScanned =
        // Обрабатываем конструкцию: lastAutoScanFolder.
        lastAutoScanFolder === strategiesFolder &&
        // Обрабатываем конструкцию: store.
        store.strategies.length > 0 &&
        // Изменяем значение выражения !store.loading.
        !store.loading;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: alreadyScanned.
      if (alreadyScanned) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void scanFolder(strategiesFolder).
      void scanFolder(strategiesFolder);
      // Закрываем текущий блок.
    }, 0);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearTimeout(handle); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearTimeout(handle);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [scanFolder, strategiesFolder]);
  // — разделитель логических блоков —

  // Возвращаем результат: { isLoading, error, lastScanAt, refresh, scanFolder }.
  return { isLoading, error, lastScanAt, refresh, scanFolder };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
