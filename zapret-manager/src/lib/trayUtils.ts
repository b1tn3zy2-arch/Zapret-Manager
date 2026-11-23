// Импортируем зависимости из модуля @/lib/constants.
import type { ConnectionStatus } from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { TrayState } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TRAY_STATE_BY_CONNECTION = { connected: connected….
const TRAY_STATE_BY_CONNECTION = {
  // Обрабатываем конструкцию: connected.
  connected: "connected",
  // Обрабатываем конструкцию: connecting.
  connecting: "connecting",
  // Обрабатываем конструкцию: disconnected.
  disconnected: "idle",
  // Обрабатываем конструкцию: vpn.
  vpn: "vpn",
  // Обрабатываем конструкцию: error.
  error: "error",
  // Закрываем текущий блок.
} as const satisfies Record<ConnectionStatus, TrayState>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function toTrayState(status: ConnectionStatus): TrayState {
  // Возвращаем результат: TRAY_STATE_BY_CONNECTION[status].
  return TRAY_STATE_BY_CONNECTION[status];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function pickStrategyName(
  // Обрабатываем конструкцию: activeName.
  activeName: string | null,
  // Обрабатываем конструкцию: lastName.
  lastName: string | null,
  // Обрабатываем конструкцию: isRunning.
  isRunning: boolean
  // Закрываем выражение или список аргументов.
): string | null {
  // Возвращаем результат: isRunning ? activeName : lastName.
  return isRunning ? activeName : lastName;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function pickVpnName(
  // Обрабатываем конструкцию: vpnName.
  vpnName: string | null,
  // Обрабатываем конструкцию: vpnConnected.
  vpnConnected: boolean
  // Закрываем выражение или список аргументов.
): string | null {
  // Возвращаем результат: vpnConnected ? vpnName : null.
  return vpnConnected ? vpnName : null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function shouldNotifyOnStart(
  // Обрабатываем конструкцию: showOnStart.
  showOnStart: boolean,
  // Обрабатываем конструкцию: running.
  running: boolean
  // Закрываем выражение или список аргументов.
): boolean {
  // Возвращаем результат: showOnStart && !running.
  return showOnStart && !running;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function shouldNotifyOnStop(
  // Обрабатываем конструкцию: showOnStop.
  showOnStop: boolean,
  // Обрабатываем конструкцию: running.
  running: boolean
  // Закрываем выражение или список аргументов.
): boolean {
  // Возвращаем результат: showOnStop && running.
  return showOnStop && running;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
