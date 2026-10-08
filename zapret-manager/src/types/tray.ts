export type TrayState = "idle" | "connecting" | "connected" | "vpn" | "error";

export type TrayMenuAction =
  | "run"
  | "stop"
  | "vpn-connect"
  | "vpn-disconnect"
  | "dashboard"
  | "strategies"
  | "logs"
  | "settings"
  | "check-updates"
  | "quit";

export type NotificationKind = "success" | "error" | "warning" | "info";

export interface TrayConfig {
  animateOnConnect: boolean;
  showNotificationsOnStart: boolean;
  showNotificationsOnStop: boolean;
  showUpdateNotifications: boolean;
}

export interface TrayUpdate {
  state: TrayState;
  activeStrategy: string | null;
  vpnName: string | null;
}
