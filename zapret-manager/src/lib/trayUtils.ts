import type { ConnectionStatus } from "@/lib/constants";
import type { TrayState } from "@/types";

const TRAY_STATE_BY_CONNECTION = {
  connected: "connected",
  connecting: "connecting",
  disconnected: "idle",
  vpn: "vpn",
  error: "error",
} as const satisfies Record<ConnectionStatus, TrayState>;

export function toTrayState(status: ConnectionStatus): TrayState {
  return TRAY_STATE_BY_CONNECTION[status];
}

export function pickStrategyName(
  activeName: string | null,
  lastName: string | null,
  isRunning: boolean
): string | null {
  return isRunning ? activeName : lastName;
}

export function pickVpnName(
  vpnName: string | null,
  vpnConnected: boolean
): string | null {
  return vpnConnected ? vpnName : null;
}

export function shouldNotifyOnStart(
  showOnStart: boolean,
  running: boolean
): boolean {
  return showOnStart && !running;
}

export function shouldNotifyOnStop(
  showOnStop: boolean,
  running: boolean
): boolean {
  return showOnStop && running;
}
