// Обрабатываем конструкцию: export.
export type TrayState = "idle" | "connecting" | "connected" | "vpn" | "error";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type TrayMenuAction =
  // Обрабатываем конструкцию: | run | stop | vpn-connect | vpn-disconnect | dashboard….
  | "run"
  // Продолжаем выражение.
  | "stop"
  // Продолжаем выражение.
  | "vpn-connect"
  // Продолжаем выражение.
  | "vpn-disconnect"
  // Продолжаем выражение.
  | "dashboard"
  // Продолжаем выражение.
  | "strategies"
  // Продолжаем выражение.
  | "logs"
  // Продолжаем выражение.
  | "settings"
  // Продолжаем выражение.
  | "check-updates"
  // Продолжаем выражение.
  | "quit";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type NotificationKind = "success" | "error" | "warning" | "info";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TrayConfig {
  // Обрабатываем конструкцию: animateOnConnect.
  animateOnConnect: boolean;
  // Обрабатываем конструкцию: showNotificationsOnStart.
  showNotificationsOnStart: boolean;
  // Обрабатываем конструкцию: showNotificationsOnStop.
  showNotificationsOnStop: boolean;
  // Обрабатываем конструкцию: showUpdateNotifications.
  showUpdateNotifications: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TrayUpdate {
  // Обрабатываем конструкцию: state.
  state: TrayState;
  // Обрабатываем конструкцию: activeStrategy.
  activeStrategy: string | null;
  // Обрабатываем конструкцию: vpnName.
  vpnName: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
