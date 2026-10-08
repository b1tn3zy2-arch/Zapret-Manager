import { HANDSHAKE_FRESH_SEC, VPN_STATE_LABELS } from "@/lib/vpnConstants";
import type { Translate } from "@/i18n";
import type { VpnState } from "@/types";

export function formatHandshakeTime(
  timestamp: number | null,
  t: Translate
): string {
  if (timestamp === null) {
    return t("settings.vpn.handshakeNever");
  }

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < HANDSHAKE_FRESH_SEC) {
    return t("settings.vpn.secondsAgo").replace("{value}", String(seconds));
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return t("settings.vpn.minutesAgo").replace("{value}", String(minutes));
  }

  return t("settings.vpn.hoursAgo").replace(
    "{value}",
    String(Math.floor(minutes / 60))
  );
}

export function formatVpnState(state: VpnState, t: Translate): string {
  const label = VPN_STATE_LABELS[state];

  if (label === null) {
    return t("settings.vpn.disconnected");
  }

  return t(label);
}

export function formatUptime(seconds: number | null): string {
  if (seconds === null || seconds <= 0) {
    return "—";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  return [hours, minutes, rest]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function isHandshakeFresh(timestamp: number | null): boolean {
  if (timestamp === null) {
    return false;
  }

  return (Date.now() - timestamp) / 1000 < HANDSHAKE_FRESH_SEC;
}

export function formatEndpoint(endpoint: string): string {
  const [host, port] = endpoint.split(":");

  if (host === undefined || port === undefined) {
    return endpoint;
  }

  return `${host}:${port}`;
}
