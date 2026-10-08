import type { TranslationKey } from "@/i18n";
import type { SwitchStep, VpnState } from "@/types";

export const VPN_STATS_INTERVAL_MS = 2000;

export const VPN_AUTO_CONNECT_DELAY_MS = 5000;

export const WIREGUARD_DOWNLOAD_URL = "https://www.wireguard.com/install/";

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
