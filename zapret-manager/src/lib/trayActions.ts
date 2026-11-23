// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/strategyLaunch.
import { launchStrategy } from "@/lib/strategyLaunch";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/lib/trayUtils.
import { shouldNotifyOnStart, shouldNotifyOnStop } from "@/lib/trayUtils";
// Импортируем зависимости из модуля @/lib/trayCommands.
import { showNotification } from "@/lib/trayCommands";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function runLastStrategy(): Promise<void> {
  // Обрабатываем конструкцию: const lastId = useSettingsStore.getState().settings.las….
  const lastId = useSettingsStore.getState().settings.lastStrategyId;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: lastId === null.
  if (lastId === null) {
    // Обрабатываем конструкцию: addWarn.
    addWarn(translateKey("log.trayNoLast"));
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const target = findStrategy(lastId).
  const target = findStrategy(lastId);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: target === undefined.
  if (target === undefined) {
    // Обрабатываем конструкцию: addWarn.
    addWarn(translateKey("log.trayStrategyMissing"));
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Ожидаем завершение асинхронной операции await startStrategy(target).
  await startStrategy(target);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function stopRunningStrategy(): Promise<void> {
  // Обрабатываем конструкцию: const running = findRunning().
  const running = findRunning();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: running === undefined.
  if (running === undefined) {
    // Обрабатываем конструкцию: addWarn.
    addWarn(translateKey("log.trayNoActive"));
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const { showOnStop, notifyEnabled } = notifyFlags().
  const { showOnStop, notifyEnabled } = notifyFlags();
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const killed = await secureInvoke<number>(stop_strategy….
    const killed = await secureInvoke<number>("stop_strategy", {
      // Обрабатываем конструкцию: strategyId.
      strategyId: running.id,
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: const store = useStrategiesStore.getState().
    const store = useStrategiesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setStatus(running.id, "idle");
    // Обрабатываем конструкцию: store.
    store.setPid(running.id, undefined);
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().addLog({
      // Обрабатываем конструкцию: level.
      level: "info",
      // Обрабатываем конструкцию: source.
      source: "strategy",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.trayStopped", { count: killed }),
      // Обрабатываем конструкцию: strategyId.
      strategyId: running.id,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: shouldNotifyOnStop(showOnStop, true) && notifyEnabled.
    if (shouldNotifyOnStop(showOnStop, true) && notifyEnabled) {
      // Ожидаем завершение асинхронной операции await notify( translateKey(log.strategyStoppe….
      await notify(
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.strategyStoppedTitle"),
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.strategyStoppedBody", { name: running.name }),
        // Обрабатываем конструкцию: info.
        "info"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  } catch (caught) {
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().addLog({
      // Обрабатываем конструкцию: level.
      level: "error",
      // Обрабатываем конструкцию: source.
      source: "strategy",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.trayStopFailed", {
        // Обрабатываем конструкцию: error.
        error: toErrorMessage(caught),
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: strategyId.
      strategyId: running.id,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function startStrategy(target: Strategy): Promise<void> {
  // Обрабатываем конструкцию: const { showOnStart, notifyEnabled } = notifyFlags().
  const { showOnStart, notifyEnabled } = notifyFlags();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useStrategiesStore.
  useStrategiesStore.getState().setStatus(target.id, "starting");
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const result = await launchStrategy(target.id, target.p….
    const result = await launchStrategy(target.id, target.path);
    // Обрабатываем конструкцию: const store = useStrategiesStore.getState().
    const store = useStrategiesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setStatus(target.id, "running");
    // Обрабатываем конструкцию: store.
    store.setPid(target.id, result.pid);
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().setLastStrategyId(target.id);
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().addLog({
      // Обрабатываем конструкцию: level.
      level: "success",
      // Обрабатываем конструкцию: source.
      source: "strategy",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.trayStarted", { pid: result.pid }),
      // Обрабатываем конструкцию: strategyId.
      strategyId: target.id,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: shouldNotifyOnStart(showOnStart, false) && notifyEnable….
    if (shouldNotifyOnStart(showOnStart, false) && notifyEnabled) {
      // Ожидаем завершение асинхронной операции await notify( translateKey(log.strategyStarte….
      await notify(
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.strategyStartedTitle"),
        // Обрабатываем конструкцию: translateKey.
        translateKey("log.strategyStartedBody", { name: target.name }),
        // Обрабатываем конструкцию: success.
        "success"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  } catch (caught) {
    // Обрабатываем конструкцию: const message = toErrorMessage(caught).
    const message = toErrorMessage(caught);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStatus(target.id, "error");
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setError(target.id, message);
    // Обрабатываем конструкцию: useLogsStore.
    useLogsStore.getState().addLog({
      // Обрабатываем конструкцию: level.
      level: "error",
      // Обрабатываем конструкцию: source.
      source: "strategy",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.trayStartFailed", { error: message }),
      // Обрабатываем конструкцию: strategyId.
      strategyId: target.id,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: notifyEnabled.
    if (notifyEnabled) {
      // Ожидаем завершение асинхронной операции await notify(translateKey(log.launchErrorTitl….
      await notify(translateKey("log.launchErrorTitle"), message, "error");
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию findStrategy.
function findStrategy(id: string): Strategy | undefined {
  // Возвращаем результат: useStrategiesStore .getState() .strategies.find((item) ….
  return (
    // Продолжаем предыдущую конструкцию.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .strategies.find((item) => item.id === id)
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию findRunning.
function findRunning(): Strategy | undefined {
  // Возвращаем результат: useStrategiesStore .getState() .strategies.find((item) ….
  return (
    // Продолжаем предыдущую конструкцию.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .strategies.find((item) => item.status === "running")
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию notifyFlags.
function notifyFlags(): {
  // Обрабатываем конструкцию: showOnStart.
  showOnStart: boolean;
  // Обрабатываем конструкцию: showOnStop.
  showOnStop: boolean;
  // Обрабатываем конструкцию: notifyEnabled.
  notifyEnabled: boolean;
  // Закрываем текущий блок.
} {
  // Обрабатываем конструкцию: const general = useSettingsStore.getState().settings.ge….
  const general = useSettingsStore.getState().settings.general;
  // — разделитель логических блоков —

  // Возвращаем результат: { showOnStart: general.showNotificationsOnStart, showOn….
  return {
    // Обрабатываем конструкцию: showOnStart.
    showOnStart: general.showNotificationsOnStart,
    // Обрабатываем конструкцию: showOnStop.
    showOnStop: general.showNotificationsOnStop,
    // Обрабатываем конструкцию: notifyEnabled.
    notifyEnabled: general.showNotifications,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function notify(
  // Обрабатываем конструкцию: title.
  title: string,
  // Обрабатываем конструкцию: body.
  body: string,
  // Обрабатываем конструкцию: kind.
  kind: "success" | "error" | "info"
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Ожидаем завершение асинхронной операции await showNotification(title, body, kind).
    await showNotification(title, body, kind);
    // Закрываем текущий блок.
  } catch {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию addWarn.
function addWarn(message: string): void {
  // Обрабатываем конструкцию: useLogsStore.
  useLogsStore.getState().addLog({
    // Обрабатываем конструкцию: level.
    level: "warn",
    // Обрабатываем конструкцию: source.
    source: "strategy",
    // Передаём поле message в объект.
    message,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
