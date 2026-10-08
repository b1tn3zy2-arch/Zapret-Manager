import { invoke } from "@tauri-apps/api/core";

import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { shouldNotifyOnStart, shouldNotifyOnStop } from "@/lib/trayUtils";
import { showNotification } from "@/lib/trayCommands";
import type { Strategy } from "@/types";

export async function runLastStrategy(): Promise<void> {
  const lastId = useSettingsStore.getState().settings.lastStrategyId;

  if (lastId === null) {
    addWarn("Из трея: последняя стратегия не выбрана");

    return;
  }

  const target = findStrategy(lastId);

  if (target === undefined) {
    addWarn("Из трея: стратегия из настроек больше не найдена");

    return;
  }

  await startStrategy(target);
}

export async function stopRunningStrategy(): Promise<void> {
  const running = findRunning();

  if (running === undefined) {
    addWarn("Из трея: активной стратегии нет");

    return;
  }

  const { showOnStop, notifyEnabled } = notifyFlags();

  try {
    const killed = await invoke<number>("stop_strategy", {
      strategyId: running.id,
    });
    const store = useStrategiesStore.getState();

    store.setStatus(running.id, "idle");
    store.setPid(running.id, undefined);
    useLogsStore.getState().addLog({
      level: "info",
      source: "strategy",
      message: `Остановлено из трея, процессов winws.exe: ${killed}`,
      strategyId: running.id,
    });

    if (shouldNotifyOnStop(showOnStop, true) && notifyEnabled) {
      await notify(
        "Стратегия остановлена",
        `${running.name} больше не работает`,
        "info"
      );
    }
  } catch (caught) {
    useLogsStore.getState().addLog({
      level: "error",
      source: "strategy",
      message: `Не удалось остановить из трея: ${toErrorMessage(caught)}`,
      strategyId: running.id,
    });
  }
}

async function startStrategy(target: Strategy): Promise<void> {
  const { showOnStart, notifyEnabled } = notifyFlags();

  useStrategiesStore.getState().setStatus(target.id, "starting");

  try {
    const result = await invoke<{ pid: number }>("run_strategy", {
      strategyId: target.id,
      path: target.path,
    });
    const store = useStrategiesStore.getState();

    store.setStatus(target.id, "running");
    store.setPid(target.id, result.pid);
    useSettingsStore.getState().setLastStrategyId(target.id);
    useLogsStore.getState().addLog({
      level: "success",
      source: "strategy",
      message: `Запущено из трея, PID ${result.pid}`,
      strategyId: target.id,
    });

    if (shouldNotifyOnStart(showOnStart, false) && notifyEnabled) {
      await notify("Стратегия запущена", `${target.name} работает`, "success");
    }
  } catch (caught) {
    const message = toErrorMessage(caught);

    useStrategiesStore.getState().setStatus(target.id, "error");
    useStrategiesStore.getState().setError(target.id, message);
    useLogsStore.getState().addLog({
      level: "error",
      source: "strategy",
      message: `Не удалось запустить из трея: ${message}`,
      strategyId: target.id,
    });

    if (notifyEnabled) {
      await notify("Ошибка запуска", message, "error");
    }
  }
}

function findStrategy(id: string): Strategy | undefined {
  return useStrategiesStore
    .getState()
    .strategies.find((item) => item.id === id);
}

function findRunning(): Strategy | undefined {
  return useStrategiesStore
    .getState()
    .strategies.find((item) => item.status === "running");
}

function notifyFlags(): {
  showOnStart: boolean;
  showOnStop: boolean;
  notifyEnabled: boolean;
} {
  const general = useSettingsStore.getState().settings.general;

  return {
    showOnStart: general.showNotificationsOnStart,
    showOnStop: general.showNotificationsOnStop,
    notifyEnabled: general.showNotifications,
  };
}

async function notify(
  title: string,
  body: string,
  kind: "success" | "error" | "info"
): Promise<void> {
  try {
    await showNotification(title, body, kind);
  } catch {
    return;
  }
}

function addWarn(message: string): void {
  useLogsStore.getState().addLog({
    level: "warn",
    source: "strategy",
    message,
  });
}
