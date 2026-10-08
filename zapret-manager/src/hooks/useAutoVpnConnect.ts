import { useEffect } from "react";

import { VPN_AUTO_CONNECT_DELAY_MS } from "@/lib/vpnConstants";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useVpnStore } from "@/stores/useVpnStore";
import { useVpn } from "@/hooks/useVpn";

export function useAutoVpnConnect(): void {
  const loaded = useSettingsStore((state) => state.loaded);
  const autoConnect = useSettingsStore(
    (state) => state.settings.vpn.autoConnectOnStart
  );
  const configId = useVpnStore((state) => state.activeConfigId);
  const installed = useVpnStore((state) => state.wireguardInstalled);
  const { connect } = useVpn();

  useEffect(() => {
    if (!loaded || !autoConnect || !installed || configId === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      void connect(configId);
    }, VPN_AUTO_CONNECT_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoConnect, configId, connect, installed, loaded]);
}
