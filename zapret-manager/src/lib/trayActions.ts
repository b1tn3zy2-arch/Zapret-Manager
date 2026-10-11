import { translateKey } from "@/i18n/core";
import { invoke } from "@tauri-apps/api/core";

import { launchStrategy } from "@/lib/strategyLaunch";
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
    addWarn(translateKey("log.trayNoLast"));

    return;
  }

  const target = findStrategy(lastId);

  if (target === undefined) {
    addWarn(translateKey("log.trayStrategyMissing"));

    return;
  }

  await startStrategy(target);
}

export async function stopRunningStrategy(): Promise<void> {
  const running = findRunning();

  if (running === undefined) {
    addWarn(translateKey("log.trayNoActive"));

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
      message: translateKey("log.trayStopped", { count: killed }),
      strategyId: running.id,
    });

    if (shouldNotifyOnStop(showOnStop, true) && notifyEnabled) {
      await notify(
        translateKey("log.strategyStoppedTitle"),
        translateKey("log.strategyStoppedBody", { name: running.name }),
        "info"
      );
    }
  } catch (caught) {
    useLogsStore.getState().addLog({
      level: "error",
      source: "strategy",
      message: translateKey("log.trayStopFailed", {
        error: toErrorMessage(caught),
      }),
      strategyId: running.id,
    });
  }
}

async function startStrategy(target: Strategy): Promise<void> {
  const { showOnStart, notifyEnabled } = notifyFlags();

  useStrategiesStore.getState().setStatus(target.id, "starting");

  try {
    const result = await launchStrategy(target.id, target.path);
    const store = useStrategiesStore.getState();

    store.setStatus(target.id, "running");
    store.setPid(target.id, result.pid);
    useSettingsStore.getState().setLastStrategyId(target.id);
    useLogsStore.getState().addLog({
      level: "success",
      source: "strategy",
      message: translateKey("log.trayStarted", { pid: result.pid }),
      strategyId: target.id,
    });

    if (shouldNotifyOnStart(showOnStart, false) && notifyEnabled) {
      await notify(
        translateKey("log.strategyStartedTitle"),
        translateKey("log.strategyStartedBody", { name: target.name }),
        "success"
      );
    }
  } catch (caught) {
    const message = toErrorMessage(caught);

    useStrategiesStore.getState().setStatus(target.id, "error");
    useStrategiesStore.getState().setError(target.id, message);
    useLogsStore.getState().addLog({
      level: "error",
      source: "strategy",
      message: translateKey("log.trayStartFailed", { error: message }),
      strategyId: target.id,
    });

    if (notifyEnabled) {
      await notify(translateKey("log.launchErrorTitle"), message, "error");
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
