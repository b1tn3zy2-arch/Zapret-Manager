import type { TranslationKey } from "@/i18n";
import type { SwitchStep, VpnState } from "@/types";

export const VPN_STATS_INTERVAL_MS = 2000;

/** Как часто обновляется скорость в панели подключения. */
export const VPN_TRAFFIC_INTERVAL_MS = 1000;

export const VPN_AUTO_CONNECT_DELAY_MS = 5000;

export const HANDSHAKE_FRESH_SEC = 60;

export const SWITCH_STEP_LABELS: Record<SwitchStep, TranslationKey> = {
  "stopping-dpi": "settings.vpn.stepStoppingDpi",
  "starting-vpn": "settings.vpn.stepStartingVpn",
  "checking-handshake": "settings.vpn.stepCheckingHandshake",
  "stopping-vpn": "settings.vpn.stepStoppingVpn",
  done: "settings.vpn.stepDone",
};

export const VPN_STATE_LABELS: Record<VpnState, TranslationKey> = {
  disconnected: "settings.vpn.disconnected",
  connecting: "settings.vpn.connecting",
  connected: "settings.vpn.connected",
  disconnecting: "settings.vpn.disconnecting",
  error: "settings.vpn.error",
};
