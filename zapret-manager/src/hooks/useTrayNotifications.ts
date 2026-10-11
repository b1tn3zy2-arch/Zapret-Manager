import { translateKey } from "@/i18n/core";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

import { NOTIFY_EVENT } from "@/lib/constants";
import { parseNotify } from "@/lib/notifyProtocol";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useUpdateStore } from "@/stores/useUpdateStore";
import { useVpnStore } from "@/stores/useVpnStore";
import type { LogLevel, NotificationKind } from "@/types";

const KIND_LEVEL: Record<NotificationKind, LogLevel> = {
  success: "success",
  error: "error",
  warning: "warn",
  info: "info",
};

export function useTrayNotifications(): void {
  const vpnState = useVpnStore((value) => value.status.state);
  const updateStatus = useUpdateStore((value) => value.status);
  const updateVersion = useUpdateStore((value) => value.info?.latestVersion);
  const showUpdate = useSettingsStore(
    (value) => value.settings.general.showUpdateNotifications
  );
  const showNotifications = useSettingsStore(
    (value) => value.settings.general.showNotifications
  );
  const lastVpnState = useRef<string | null>(null);
  const lastUpdate = useRef<string | null>(null);

  useEffect(() => {
    const subscription = listen<string>(NOTIFY_EVENT, (event) => {
      const parsed = parseNotify(event.payload);

      if (parsed === null) {
        return;
      }

      useLogsStore.getState().addLog({
        level: KIND_LEVEL[parsed.kind],
        source: "system",
        message:
          translateKey("log.notifyTitle", { title: parsed.title }) +
          (parsed.body === "" ? "" : ` — ${parsed.body}`),
      });
    });

    return () => {
      void subscription.then((unlisten) => {
        unlisten();
      });
    };
  }, []);

  useEffect(() => {
    const previous = lastVpnState.current;
    lastVpnState.current = vpnState;

    if (previous === null || previous === vpnState) {
      return;
    }

    if (!showNotifications) {
      return;
    }

    if (vpnState === "connected") {
      void emit(
        translateKey("log.vpnConnectedTitle"),
        translateKey("log.vpnConnectedBody"),
        "success"
      );
    } else if (vpnState === "error") {
      void emit(
        translateKey("log.vpnErrorTitle"),
        translateKey("log.vpnErrorBody"),
        "error"
      );
    } else if (previous === "connected") {
      void emit(
        translateKey("log.vpnDisconnectedTitle"),
        translateKey("log.vpnDisconnectedBody"),
        "info"
      );
    }
  }, [showNotifications, vpnState]);

  useEffect(() => {
    if (updateStatus !== "available") {
      return;
    }

    if (updateVersion === undefined || updateVersion === lastUpdate.current) {
      return;
    }

    const key = updateVersion;

    lastUpdate.current = key;

    if (!showNotifications || !showUpdate) {
      return;
    }

    void emit(
      translateKey("log.updateAvailableTitle"),
      translateKey("log.updateAvailableBody", { version: key }),
      "info"
    );
  }, [showNotifications, showUpdate, updateStatus, updateVersion]);
}

async function emit(
  title: string,
  body: string,
  kind: NotificationKind
): Promise<void> {
  try {
    await invoke("show_notification", { title, body, kind });
  } catch (caught) {
    useLogsStore.getState().addLog({
      level: "warn",
      source: "system",
      message: translateKey("log.notifyFailed", {
        error: toErrorMessage(caught),
      }),
    });
  }
}
