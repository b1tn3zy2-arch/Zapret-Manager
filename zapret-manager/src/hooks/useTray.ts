// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля @tauri-apps/api/window.
import { getCurrentWindow } from "@tauri-apps/api/window";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт TRAY_UPDATE_THROTTLE_MS.
  TRAY_UPDATE_THROTTLE_MS,
  // Подключаем именованный импорт type AppPage.
  type AppPage,
  // Подключаем именованный импорт type ConnectionStatus.
  type ConnectionStatus,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/trayActions.
import { runLastStrategy, stopRunningStrategy } from "@/lib/trayActions";
// Импортируем зависимости из модуля @/lib/trayCommands.
import {
  // Подключаем именованный импорт setMinimizeToTray.
  setMinimizeToTray,
  // Подключаем именованный импорт updateTrayConfig.
  updateTrayConfig,
  // Подключаем именованный импорт updateTrayState.
  updateTrayState,
  // Закрываем текущий блок.
} from "@/lib/trayCommands";
// Импортируем зависимости из модуля @/lib/trayUtils.
import { pickStrategyName, pickVpnName, toTrayState } from "@/lib/trayUtils";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/selectors.
import { useConnectionStatus, useVpnConnected } from "@/stores/selectors";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseTrayResult {
  // Обрабатываем конструкцию: pushTrayState.
  pushTrayState: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс TrayPayload с контрактом данных.
interface TrayPayload {
  // Обрабатываем конструкцию: trayState.
  trayState: ReturnType<typeof toTrayState>;
  // Обрабатываем конструкцию: strategyName.
  strategyName: string | null;
  // Обрабатываем конструкцию: vpnName.
  vpnName: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const NAVIGATION: Record<string, AppPage> = { navigate-….
const NAVIGATION: Record<string, AppPage> = {
  // Обрабатываем конструкцию: navigate-dashboard.
  "navigate-dashboard": "dashboard",
  // Обрабатываем конструкцию: navigate-strategies.
  "navigate-strategies": "strategies",
  // Обрабатываем конструкцию: navigate-logs.
  "navigate-logs": "logs",
  // Обрабатываем конструкцию: navigate-settings.
  "navigate-settings": "settings",
  // Обрабатываем конструкцию: navigate-about.
  "navigate-about": "about",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useTray(): UseTrayResult {
  // Обрабатываем конструкцию: const connectionStatus = useConnectionStatus().
  const connectionStatus = useConnectionStatus();
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const lastSent = useRef(0).
  const lastSent = useRef(0);
  // Обрабатываем конструкцию: const pendingPush = useRef<number | undefined>(undefine….
  const pendingPush = useRef<number | undefined>(undefined);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const payload = useTrayPayload(connectionStatus).
  const payload = useTrayPayload(connectionStatus);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const sendTrayState = useCallback(async (): Promise<voi….
  const sendTrayState = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await updateTrayState( payload.trayState, pay….
      await updateTrayState(
        // Обрабатываем конструкцию: payload.
        payload.trayState,
        // Обрабатываем конструкцию: payload.
        payload.strategyName,
        // Обрабатываем конструкцию: payload.
        payload.vpnName
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "warn",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.trayUpdateFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog, payload.strategyName, payload.trayState, payload.vpnName]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const pushTrayState = useCallback(async (): Promise<voi….
  const pushTrayState = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: const now = Date.now().
    const now = Date.now();
    // Обрабатываем конструкцию: const elapsed = now - lastSent.current.
    const elapsed = now - lastSent.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: elapsed < TRAY_UPDATE_THROTTLE_MS.
    if (elapsed < TRAY_UPDATE_THROTTLE_MS) {
      // Проверяем бизнес-условие: pendingPush.current === undefined.
      if (pendingPush.current === undefined) {
        // Обрабатываем конструкцию: pendingPush.
        pendingPush.current = window.setTimeout(() => {
          // Обрабатываем конструкцию: pendingPush.
          pendingPush.current = undefined;
          // Обрабатываем конструкцию: lastSent.
          lastSent.current = Date.now();
          // Обрабатываем конструкцию: void sendTrayState().
          void sendTrayState();
          // Закрываем текущий блок.
        }, TRAY_UPDATE_THROTTLE_MS - elapsed);
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: lastSent.
    lastSent.current = now;
    // Ожидаем завершение асинхронной операции await sendTrayState().
    await sendTrayState();
    // Закрываем текущий блок.
  }, [sendTrayState]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void pushTrayState().
    void pushTrayState();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { if (pendingPush.current !== undefined) { window….
    return () => {
      // Проверяем бизнес-условие: pendingPush.current !== undefined.
      if (pendingPush.current !== undefined) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(pendingPush.current);
        // Обрабатываем конструкцию: pendingPush.
        pendingPush.current = undefined;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [pushTrayState]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useTraySettings.
  useTraySettings();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const subscriptions = [ listen(tray-quick-run, () => { ….
    const subscriptions = [
      // Обрабатываем конструкцию: listen.
      listen("tray-quick-run", () => {
        // Обрабатываем конструкцию: void runLastStrategy().
        void runLastStrategy();
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: listen.
      listen("tray-stop-strategy", () => {
        // Обрабатываем конструкцию: void stopRunningStrategy().
        void stopRunningStrategy();
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: listen.
      listen("tray-check-updates", () => {
        // Сохраняем пояснение разработчика: // Команде обязателен путь к папке стратегий: без него
        // Команде обязателен путь к папке стратегий: без него
        // Сохраняем пояснение разработчика: // версию не прочитать и проверка падает.
        // версию не прочитать и проверка падает.
        // Обрабатываем конструкцию: const { settings } = useSettingsStore.getState().
        const { settings } = useSettingsStore.getState();
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: settings.strategiesFolder ===.
        if (settings.strategiesFolder === "") {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: void secureInvoke(check_for_updates, { repo: settings.s….
        void secureInvoke("check_for_updates", {
          // Обрабатываем конструкцию: repo.
          repo: settings.strategyUpdates.githubRepo,
          // Обрабатываем конструкцию: ignoredVersions.
          ignoredVersions: settings.strategyUpdates.ignoredVersions,
          // Обрабатываем конструкцию: strategiesDir.
          strategiesDir: settings.strategiesFolder,
          // Закрываем текущий блок.
        })
          // Продолжаем цепочку вызовов.
          .then(() => {
            // Обрабатываем конструкцию: navigate.
            navigate("dashboard");
            // Закрываем текущий блок.
          })
          // Продолжаем цепочку вызовов.
          .catch(() => undefined);
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: listen.
      listen("tray-connect-vpn", () => {
        // Обрабатываем конструкцию: navigate.
        navigate("settings");
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: listen.
      listen("tray-disconnect-vpn", () => {
        // Обрабатываем конструкцию: navigate.
        navigate("settings");
        // Закрываем текущий блок.
      }),
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Перебираем элементы коллекции Object.entries(NAVIGATION).
    for (const [event, page] of Object.entries(NAVIGATION)) {
      // Обрабатываем конструкцию: subscriptions.
      subscriptions.push(
        // Обрабатываем конструкцию: listen.
        listen(event, () => {
          // Обрабатываем конструкцию: navigate.
          navigate(page);
          // Закрываем текущий блок.
        })
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: () => { for (const subscription of subscriptions) { voi….
    return () => {
      // Перебираем элементы коллекции subscriptions.
      for (const subscription of subscriptions) {
        // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
        void subscription.then((unlisten) => {
          // Обрабатываем конструкцию: unlisten.
          unlisten();
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: { pushTrayState }.
  return { pushTrayState };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию useTraySettings.
function useTraySettings(): void {
  // Обрабатываем конструкцию: const minimizeToTray = useSettingsStore( (state) => sta….
  const minimizeToTray = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.minimizeToTray
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const startMinimized = useSettingsStore( (state) => sta….
  const startMinimized = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.startMinimized
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const animateTrayIcon = useSettingsStore( (state) => st….
  const animateTrayIcon = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.appearance.animateTrayIcon
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const notifyOnStart = useSettingsStore( (state) => stat….
  const notifyOnStart = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.showNotificationsOnStart
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const notifyOnStop = useSettingsStore( (state) => state….
  const notifyOnStop = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.showNotificationsOnStop
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const notifyOnUpdate = useSettingsStore( (state) => sta….
  const notifyOnUpdate = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.showUpdateNotifications
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void updateTrayConfig({ animateOnConnect: animateTrayIc….
    void updateTrayConfig({
      // Обрабатываем конструкцию: animateOnConnect.
      animateOnConnect: animateTrayIcon,
      // Обрабатываем конструкцию: showNotificationsOnStart.
      showNotificationsOnStart: notifyOnStart,
      // Обрабатываем конструкцию: showNotificationsOnStop.
      showNotificationsOnStop: notifyOnStop,
      // Обрабатываем конструкцию: showUpdateNotifications.
      showUpdateNotifications: notifyOnUpdate,
      // Закрываем текущий блок.
    }).catch(() => undefined);
    // Закрываем текущий блок.
  }, [animateTrayIcon, notifyOnStart, notifyOnStop, notifyOnUpdate]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void setMinimizeToTray(minimizeToTray).catch(() => unde….
    void setMinimizeToTray(minimizeToTray).catch(() => undefined);
    // Закрываем текущий блок.
  }, [minimizeToTray]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !startMinimized.
    if (!startMinimized) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void getCurrentWindow() .hide() .catch(() => undefined).
    void getCurrentWindow()
      // Продолжаем цепочку вызовов.
      .hide()
      // Продолжаем цепочку вызовов.
      .catch(() => undefined);
    // Закрываем текущий блок.
  }, [startMinimized]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию useTrayPayload.
function useTrayPayload(connectionStatus: ConnectionStatus): TrayPayload {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore((state) => state.….
  const strategies = useStrategiesStore((state) => state.strategies);
  // Обрабатываем конструкцию: const lastStrategyId = useSettingsStore( (state) => sta….
  const lastStrategyId = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.lastStrategyId
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const vpnConfigs = useVpnStore((state) => state.configs….
  const vpnConfigs = useVpnStore((state) => state.configs);
  // Обрабатываем конструкцию: const vpnActiveId = useVpnStore((state) => state.active….
  const vpnActiveId = useVpnStore((state) => state.activeConfigId);
  // Обрабатываем конструкцию: const vpnConnected = useVpnConnected().
  const vpnConnected = useVpnConnected();
  // Обрабатываем конструкцию: const running = strategies.find((item) => item.status =….
  const running = strategies.find((item) => item.status === "running");
  // Обрабатываем конструкцию: const lastName = strategies.find((item) => item.id === ….
  const lastName =
    // Обрабатываем конструкцию: strategies.
    strategies.find((item) => item.id === lastStrategyId)?.name ?? null;
  // Обрабатываем конструкцию: const vpnName = vpnConfigs.find((item) => item.id === v….
  const vpnName =
    // Обрабатываем конструкцию: vpnConfigs.
    vpnConfigs.find((item) => item.id === vpnActiveId)?.name ?? null;
  // — разделитель логических блоков —

  // Возвращаем результат: { trayState: toTrayState(connectionStatus), strategyNam….
  return {
    // Обрабатываем конструкцию: trayState.
    trayState: toTrayState(connectionStatus),
    // Обрабатываем конструкцию: strategyName.
    strategyName: pickStrategyName(
      // Обрабатываем конструкцию: running.
      running?.name ?? null,
      // Обрабатываем конструкцию: lastName.
      lastName,
      // Обрабатываем конструкцию: running.
      running !== undefined
      // Закрываем выражение или список аргументов.
    ),
    // Обрабатываем конструкцию: vpnName.
    vpnName: pickVpnName(vpnName, vpnConnected),
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию navigate.
function navigate(page: AppPage): void {
  // Обрабатываем конструкцию: useAppStore.
  useAppStore.getState().setActivePage(page);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
