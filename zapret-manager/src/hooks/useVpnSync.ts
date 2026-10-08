import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";

import * as commands from "@/lib/vpnCommands";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useVpnStore } from "@/stores/useVpnStore";
import type { SwitchStep } from "@/types";

const RECONCILE_RETRY_MS = 5000;

export function useVpnSync(): void {
  const addLog = useLogsStore((state) => state.addLog);

  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      useVpnStore.getState().setStatus(await commands.fetchStatus());
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const installed = await commands.isWireguardInstalled();

        if (cancelled) {
          return;
        }

        const store = useVpnStore.getState();
        store.setWireguardInstalled(installed);

        if (installed) {
          const configs = await commands.listConfigs();

          if (!cancelled) {
            store.setConfigs(configs);
          }
        }

        if (installed) {
          await commands.reconcileTunnels();
        }

        await refreshStatus();
      } catch (caught) {
        if (!cancelled) {
          useVpnStore.getState().setError(toErrorMessage(caught));
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshStatus]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const state = useVpnStore.getState();

      if (state.wireguardInstalled && state.status.state === "disconnected") {
        void commands
          .reconcileTunnels()
          .then(() => refreshStatus())
          .catch(() => undefined);
      }
    }, RECONCILE_RETRY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshStatus]);

  useEffect(() => {
    const subscriptions = [
      listen<string>("vpn-switching", (event) => {
        useVpnStore.getState().setSwitchStep(event.payload as SwitchStep);
      }),
      listen<unknown>("vpn-connected", () => {
        void refreshStatus();
        addLog({
          level: "success",
          source: "vpn",
          message: "VPN подключён",
        });
      }),
      listen<string>("vpn-disconnected", (event) => {
        const store = useVpnStore.getState();

        if (event.payload === "error") {
          store.setStatus({ state: "error" });
        } else {
          store.setStatus({ state: "disconnected" });
          store.setKillSwitchActive(false);
        }

        addLog({
          level: event.payload === "error" ? "error" : "info",
          source: "vpn",
          message:
            event.payload === "error"
              ? "VPN отключён с ошибкой"
              : "VPN отключён",
        });
      }),
    ];

    return () => {
      for (const subscription of subscriptions) {
        void subscription.then((unlisten) => {
          unlisten();
        });
      }
    };
  }, [addLog, refreshStatus]);
}
