import { useEffect } from "react";

import { VPN_STATS_INTERVAL_MS } from "@/lib/vpnConstants";
import { fetchStats } from "@/lib/vpnCommands";
import { useVpnStore } from "@/stores/useVpnStore";

export function useVpnStats(): void {
  const state = useVpnStore((value) => value.status.state);
  const interfaceName = useVpnStore((value) => value.status.interface);

  useEffect(() => {
    if (state !== "connected" || interfaceName === null) {
      return;
    }

    const timer = window.setInterval(() => {
      void fetchStats()
        .then((stats) => {
          const store = useVpnStore.getState();

          store.setStatus({
            state: "connected",
            interface: stats.interface,
            endpoint: stats.endpoint,
            handshakeAt: stats.handshakeAt,
            bytesIn: stats.bytesIn,
            bytesOut: stats.bytesOut,
            uptimeSec: stats.uptimeSec,
            error: null,
          });
          store.setKillSwitchActive(stats.killSwitchOn);
        })
        .catch(() => undefined);
    }, VPN_STATS_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [state, interfaceName]);
}
