import { invoke } from "@tauri-apps/api/core";

import type { NotificationKind, TrayConfig, TrayState } from "@/types";

export async function updateTrayState(
  state: TrayState,
  activeStrategy: string | null,
  vpnName: string | null
): Promise<void> {
  await invoke("update_tray_state", {
    update: { state, activeStrategy, vpnName },
  });
}

export async function updateTrayConfig(config: TrayConfig): Promise<void> {
  await invoke("update_tray_config", { config });
}

export async function showNotification(
  title: string,
  body: string,
  kind: NotificationKind
): Promise<void> {
  await invoke("show_notification", { title, body, kind });
}

export async function setMinimizeToTray(value: boolean): Promise<void> {
  await invoke("set_minimize_to_tray_cmd", { value });
}
