// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useCallback, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/strategyLaunch.
import { launchStrategy, type GameTuning } from "@/lib/strategyLaunch";
// Импортируем зависимости из модуля @/lib/strategyRating.
import { measureStrategyAfterStart } from "@/lib/strategyRating";
// Импортируем зависимости из модуля @/hooks/useGamesInjector.
import { useGamesInjector } from "@/hooks/useGamesInjector";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// — разделитель логических блоков —

// Объявляем интерфейс ProcessStatus с контрактом данных.
interface ProcessStatus {
  // Обрабатываем конструкцию: running.
  running: boolean;
  // Обрабатываем конструкцию: winwsPids.
  winwsPids: number[];
  // Обрабатываем конструкцию: startedAt.
  startedAt: number | null;
  // Обрабатываем конструкцию: uptime.
  uptime: number | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const UAC_CANCELLED_MARKER = отменён.
const UAC_CANCELLED_MARKER = "отменён";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseStrategyRunnerResult {
  // Обрабатываем конструкцию: isStarting.
  isStarting: boolean;
  // Обрабатываем конструкцию: isStopping.
  isStopping: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: run.
  run: (
    // Обрабатываем конструкцию: strategyId.
    strategyId: string,
    // Обрабатываем конструкцию: path.
    path: string,
    // Обрабатываем конструкцию: tuning.
    tuning?: GameTuning | null
    // Закрываем выражение или список аргументов.
  ) => Promise<void>;
  // Обрабатываем конструкцию: stop.
  stop: (strategyId: string, path: string) => Promise<void>;
  // Обрабатываем конструкцию: checkStatus.
  checkStatus: (strategyId: string) => Promise<ProcessStatus | null>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useStrategyRunner(): UseStrategyRunnerResult {
  // Обрабатываем конструкцию: const [isStarting, setIsStarting] = useState(false).
  const [isStarting, setIsStarting] = useState(false);
  // Обрабатываем конструкцию: const [isStopping, setIsStopping] = useState(false).
  const [isStopping, setIsStopping] = useState(false);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

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
  // Обрабатываем конструкцию: const setStrategyError = useStrategiesStore((state) => ….
  const setStrategyError = useStrategiesStore((state) => state.setError);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const games = useSettingsStore((state) => state.setting….
  const games = useSettingsStore((state) => state.settings.games);
  // Обрабатываем конструкцию: const engine = useSettingsStore( (state) => state.setti….
  const engine = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.advanced.strategyEngine
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const hasEnabledGames = games.some((game) => game.enabl….
  const hasEnabledGames = games.some((game) => game.enabled);
  // Обрабатываем конструкцию: const autoRestore = games.some((game) => game.enabled &….
  const autoRestore = games.some((game) => game.enabled && game.autoRestore);
  // Обрабатываем конструкцию: const setLastStrategyId = useSettingsStore( (state) => ….
  const setLastStrategyId = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.setLastStrategyId
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const { restoreAll: restore } = useGamesInjector().
  const { restoreAll: restore } = useGamesInjector();
  // Обрабатываем конструкцию: const busy = useRef(false).
  const busy = useRef(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const run = useCallback( async ( strategyId: string, pa….
  const run = useCallback(
    // Обрабатываем конструкцию: async.
    async (
      // Обрабатываем конструкцию: strategyId.
      strategyId: string,
      // Обрабатываем конструкцию: path.
      path: string,
      // Обрабатываем конструкцию: tuning.
      tuning: GameTuning | null = null
      // Закрываем выражение или список аргументов.
    ) => {
      // Проверяем бизнес-условие: busy.current.
      if (busy.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: busy.
      busy.current = true;
      // Обрабатываем конструкцию: setIsStarting.
      setIsStarting(true);
      // Обрабатываем конструкцию: setError.
      setError(null);
      // Обрабатываем конструкцию: setStatus.
      setStatus(strategyId, "starting");
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Проверяем бизнес-условие: useVpnStore.getState().status.state === connected.
        if (useVpnStore.getState().status.state === "connected") {
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "info",
            // Обрабатываем конструкцию: source.
            source: "strategy",
            // Обрабатываем конструкцию: message.
            message: translateKey("log.stoppingVpn"),
            // Закрываем текущий блок.
          });
          // Ожидаем завершение асинхронной операции await secureInvoke(switch_to_dpi).
          await secureInvoke("switch_to_dpi");
          // Обрабатываем конструкцию: useVpnStore.
          useVpnStore.getState().setStatus({
            // Обрабатываем конструкцию: state.
            state: "disconnected",
            // Обрабатываем конструкцию: error.
            error: null,
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const result = await launchStrategy(strategyId, path, t….
        const result = await launchStrategy(strategyId, path, tuning);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: setStatus.
        setStatus(strategyId, "running");
        // Обрабатываем конструкцию: setPid.
        setPid(strategyId, result.pid);
        // Обрабатываем конструкцию: setInjectedGames.
        setInjectedGames(strategyId, result.gamesInjected);
        // Обрабатываем конструкцию: setLastStrategyId.
        setLastStrategyId(strategyId);
        // Сохраняем пояснение разработчика: // Реальный замер запускается в фоне: цифра рейтинга
        // Реальный замер запускается в фоне: цифра рейтинга
        // Сохраняем пояснение разработчика: // обновится сама, UI продолжает рисовать карточку.
        // обновится сама, UI продолжает рисовать карточку.
        // Обрабатываем конструкцию: void measureStrategyAfterStart(strategyId, path).
        void measureStrategyAfterStart(strategyId, path);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const general = useSettingsStore.getState().settings.ge….
        const general = useSettingsStore.getState().settings.general;
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: general.showNotifications && general.showNotificationsO….
        if (general.showNotifications && general.showNotificationsOnStart) {
          // Обрабатываем конструкцию: const active = useStrategiesStore .getState() .strategi….
          const active = useStrategiesStore
            // Продолжаем цепочку вызовов.
            .getState()
            // Продолжаем цепочку вызовов.
            .strategies.find((item) => item.id === strategyId);
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: void secureInvoke(show_notification, { title: translate….
          void secureInvoke("show_notification", {
            // Обрабатываем конструкцию: title.
            title: translateKey("log.strategyStartedTitle"),
            // Обрабатываем конструкцию: body.
            body: translateKey("log.strategyStartedBody", {
              // Обрабатываем конструкцию: name.
              name: active?.name ?? "",
              // Закрываем текущий блок.
            }),
            // Обрабатываем конструкцию: kind.
            kind: "success",
            // Закрываем текущий блок.
          }).catch(() => undefined);
          // Закрываем текущий блок.
        }
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.strategyStarted", { pid: result.pid }),
          // Передаём поле strategyId в объект.
          strategyId,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: const message = toErrorMessage(caught).
        const message = toErrorMessage(caught);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: setError.
        setError(message);
        // Обрабатываем конструкцию: setStatus.
        setStatus(strategyId, "error");
        // Обрабатываем конструкцию: setStrategyError.
        setStrategyError(strategyId, message);
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: message.toLowerCase().includes(UAC_CANCELLED_MARKER)
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              translateKey("log.launchCancelled")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              translateKey("log.launchFailed", { error: message }),
          // Передаём поле strategyId в объект.
          strategyId,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } finally {
        // Обрабатываем конструкцию: busy.
        busy.current = false;
        // Обрабатываем конструкцию: setIsStarting.
        setIsStarting(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [
      // Обрабатываем конструкцию: addLog.
      addLog,
      // Обрабатываем конструкцию: setInjectedGames.
      setInjectedGames,
      // Обрабатываем конструкцию: setLastStrategyId.
      setLastStrategyId,
      // Обрабатываем конструкцию: setPid.
      setPid,
      // Обрабатываем конструкцию: setStatus.
      setStatus,
      // Обрабатываем конструкцию: setStrategyError.
      setStrategyError,
      // Закрываем массив или список.
    ]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const stop = useCallback( async (strategyId: string, pa….
  const stop = useCallback(
    // Обрабатываем конструкцию: async.
    async (strategyId: string, path: string) => {
      // Проверяем бизнес-условие: busy.current.
      if (busy.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: busy.
      busy.current = true;
      // Обрабатываем конструкцию: setIsStopping.
      setIsStopping(true);
      // Обрабатываем конструкцию: setStatus.
      setStatus(strategyId, "stopping");
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const killed = await secureInvoke<number>(stop_strategy….
        const killed = await secureInvoke<number>("stop_strategy", {
          // Передаём поле strategyId в объект.
          strategyId,
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: setStatus.
        setStatus(strategyId, "idle");
        // Обрабатываем конструкцию: setPid.
        setPid(strategyId, undefined);
        // Обрабатываем конструкцию: setInjectedGames.
        setInjectedGames(strategyId, null);
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: killed > 0 ? "warn" : "info",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.strategyStopped", { count: killed }),
          // Передаём поле strategyId в объект.
          strategyId,
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: engine === legacy && hasEnabledGames && autoRestore.
        if (engine === "legacy" && hasEnabledGames && autoRestore) {
          // Ожидаем завершение асинхронной операции await restore(path).
          await restore(path);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: const message = toErrorMessage(caught).
        const message = toErrorMessage(caught);
        // Обрабатываем конструкцию: setError.
        setError(message);
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.stopFailed", { error: message }),
          // Передаём поле strategyId в объект.
          strategyId,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } finally {
        // Обрабатываем конструкцию: busy.
        busy.current = false;
        // Обрабатываем конструкцию: setIsStopping.
        setIsStopping(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [
      // Обрабатываем конструкцию: addLog.
      addLog,
      // Обрабатываем конструкцию: autoRestore.
      autoRestore,
      // Обрабатываем конструкцию: engine.
      engine,
      // Обрабатываем конструкцию: hasEnabledGames.
      hasEnabledGames,
      // Обрабатываем конструкцию: restore.
      restore,
      // Обрабатываем конструкцию: setInjectedGames.
      setInjectedGames,
      // Обрабатываем конструкцию: setPid.
      setPid,
      // Обрабатываем конструкцию: setStatus.
      setStatus,
      // Закрываем массив или список.
    ]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const checkStatus = useCallback( async (strategyId: str….
  const checkStatus = useCallback(
    // Обрабатываем конструкцию: async.
    async (strategyId: string): Promise<ProcessStatus | null> => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Возвращаем результат: await secureInvoke<ProcessStatus>(check_strategy_status….
        return await secureInvoke<ProcessStatus>("check_strategy_status", {
          // Передаём поле strategyId в объект.
          strategyId,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch {
        // Возвращаем результат: null.
        return null;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    []
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { isStarting, isStopping, error, run, stop, checkStatus….
  return { isStarting, isStopping, error, run, stop, checkStatus };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
