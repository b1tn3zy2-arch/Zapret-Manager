import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useRef } from "react";

import {
  TRAY_UPDATE_THROTTLE_MS,
  type AppPage,
  type ConnectionStatus,
} from "@/lib/constants";
import { runLastStrategy, stopRunningStrategy } from "@/lib/trayActions";
import {
  setMinimizeToTray,
  updateTrayConfig,
  updateTrayState,
} from "@/lib/trayCommands";
import { pickStrategyName, pickVpnName, toTrayState } from "@/lib/trayUtils";
import { toErrorMessage } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { useConnectionStatus } from "@/stores/selectors";
import { useVpnStore } from "@/stores/useVpnStore";

export interface UseTrayResult {
  pushTrayState: () => Promise<void>;
}

interface TrayPayload {
  trayState: ReturnType<typeof toTrayState>;
  strategyName: string | null;
  vpnName: string | null;
}

const NAVIGATION: Record<string, AppPage> = {
  "navigate-dashboard": "dashboard",
  "navigate-strategies": "strategies",
  "navigate-logs": "logs",
  "navigate-settings": "settings",
};

export function useTray(): UseTrayResult {
  const connectionStatus = useConnectionStatus();
  const addLog = useLogsStore((state) => state.addLog);
  const lastSent = useRef(0);

  const payload = useTrayPayload(connectionStatus);

  const pushTrayState = useCallback(async (): Promise<void> => {
    const now = Date.now();

    if (now - lastSent.current < TRAY_UPDATE_THROTTLE_MS) {
      return;
    }

    lastSent.current = now;

    try {
      await updateTrayState(
        payload.trayState,
        payload.strategyName,
        payload.vpnName
      );
    } catch (caught) {
      addLog({
        level: "warn",
        source: "system",
        message: `Трей не обновлён: ${toErrorMessage(caught)}`,
      });
    }
  }, [addLog, payload.strategyName, payload.trayState, payload.vpnName]);

  useEffect(() => {
    void pushTrayState();
  }, [pushTrayState]);

  useTraySettings();

  useEffect(() => {
    const subscriptions = [
      listen("tray-run-strategy", () => {
        void runLastStrategy();
      }),
      listen("tray-quick-run", () => {
        void runLastStrategy();
      }),
      listen("tray-stop-strategy", () => {
        void stopRunningStrategy();
      }),
      listen("tray-check-updates", () => {
        void invoke("check_for_updates")
          .then(() => {
            navigate("dashboard");
          })
          .catch(() => undefined);
      }),
      listen("tray-quit", () => {
        void invoke("quit_app").catch(() => undefined);
      }),
      listen("tray-connect-vpn", () => {
        navigate("settings");
      }),
      listen("tray-disconnect-vpn", () => {
        navigate("settings");
      }),
    ];

    for (const [event, page] of Object.entries(NAVIGATION)) {
      subscriptions.push(
        listen(event, () => {
          navigate(page);
        })
      );
    }

    return () => {
      for (const subscription of subscriptions) {
        void subscription.then((unlisten) => {
          unlisten();
        });
      }
    };
  }, []);

  return { pushTrayState };
}

function useTraySettings(): void {
  const minimizeToTray = useSettingsStore(
    (state) => state.settings.general.minimizeToTray
  );
  const startMinimized = useSettingsStore(
    (state) => state.settings.general.startMinimized
  );
  const animateTrayIcon = useSettingsStore(
    (state) => state.settings.appearance.animateTrayIcon
  );
  const notifyOnStart = useSettingsStore(
    (state) => state.settings.general.showNotificationsOnStart
  );
  const notifyOnStop = useSettingsStore(
    (state) => state.settings.general.showNotificationsOnStop
  );
  const notifyOnUpdate = useSettingsStore(
    (state) => state.settings.general.showUpdateNotifications
  );

  useEffect(() => {
    void updateTrayConfig({
      animateOnConnect: animateTrayIcon,
      showNotificationsOnStart: notifyOnStart,
      showNotificationsOnStop: notifyOnStop,
      showUpdateNotifications: notifyOnUpdate,
    }).catch(() => undefined);
  }, [animateTrayIcon, notifyOnStart, notifyOnStop, notifyOnUpdate]);

  useEffect(() => {
    void setMinimizeToTray(minimizeToTray).catch(() => undefined);
  }, [minimizeToTray]);

  useEffect(() => {
    if (!startMinimized) {
      return;
    }

    void getCurrentWindow()
      .hide()
      .catch(() => undefined);
  }, [startMinimized]);
}

function useTrayPayload(connectionStatus: ConnectionStatus): TrayPayload {
  const strategies = useStrategiesStore((state) => state.strategies);
  const lastStrategyId = useSettingsStore(
    (state) => state.settings.lastStrategyId
  );
  const vpnConfigs = useVpnStore((state) => state.configs);
  const vpnActiveId = useVpnStore((state) => state.activeConfigId);
  const vpnConnected = useVpnStore(
    (state) => state.status.state === "connected"
  );
  const running = strategies.find((item) => item.status === "running");
  const lastName =
    strategies.find((item) => item.id === lastStrategyId)?.name ?? null;
  const vpnName =
    vpnConfigs.find((item) => item.id === vpnActiveId)?.name ?? null;

  return {
    trayState: toTrayState(connectionStatus),
    strategyName: pickStrategyName(
      running?.name ?? null,
      lastName,
      running !== undefined
    ),
    vpnName: pickVpnName(vpnName, vpnConnected),
  };
}

function navigate(page: AppPage): void {
  useAppStore.getState().setActivePage(page);
}
