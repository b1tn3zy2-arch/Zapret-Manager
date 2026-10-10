import { useCallback, useEffect } from "react";

import * as commands from "@/lib/vpnCommands";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
import type { SubscriptionServer } from "@/types";

export interface UseVpnCoreResult {
  refreshStatus: () => Promise<void>;
  loadServers: (url: string) => Promise<void>;
  installCore: () => Promise<void>;
  connectServer: (server: SubscriptionServer) => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useVpnCore(): UseVpnCoreResult {
  const addLog = useLogsStore((state) => state.addLog);

  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      useVpnCoreStore.getState().setStatus(await commands.fetchVpnCoreStatus());
    } catch (caught) {
      useVpnCoreStore.getState().setError(toErrorMessage(caught));
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const loadServers = useCallback(
    async (text: string): Promise<void> => {
      const store = useVpnCoreStore.getState();

      store.setLoading(true);
      store.setError(null);

      try {
        const result = await commands.importVpnSource(text);

        store.setServers(result.servers);
        store.setSubscriptionUrl(result.subscriptionUrl ?? "");
        addLog({
          level: "success",
          source: "vpn",
          message: `Загружено серверов: ${result.servers.length}`,
        });
      } catch (caught) {
        const message = toErrorMessage(caught);

        store.setError(message);
        addLog({
          level: "error",
          source: "vpn",
          message: `Ссылка не обработана: ${message}`,
        });
      } finally {
        useVpnCoreStore.getState().setLoading(false);
      }
    },
    [addLog]
  );

  const installCore = useCallback(async (): Promise<void> => {
    const store = useVpnCoreStore.getState();

    store.setLoading(true);
    store.setError(null);

    try {
      await commands.installVpnCore();
      addLog({
        level: "success",
        source: "vpn",
        message: "Ядро Xray установлено",
      });
      await refreshStatus();
    } catch (caught) {
      const message = toErrorMessage(caught);

      store.setError(message);
      addLog({
        level: "error",
        source: "vpn",
        message: `Ядро не установлено: ${message}`,
      });
    } finally {
      useVpnCoreStore.getState().setLoading(false);
    }
  }, [addLog, refreshStatus]);

  const connectServer = useCallback(
    async (server: SubscriptionServer): Promise<void> => {
      const store = useVpnCoreStore.getState();

      store.setError(null);
      store.setLoading(true);

      try {
        if (store.status?.installed !== true) {
          addLog({
            level: "info",
            source: "vpn",
            message: "Ядро Xray не найдено, устанавливаю…",
          });

          await commands.installVpnCore();
          await refreshStatus();
        }

        const status = await commands.connectVpnServer(
          server.link,
          server.name
        );

        store.setStatus(status);
        store.setActiveServer(server.id);
        addLog({
          level: "success",
          source: "vpn",
          message: `VPN подключён: ${server.name}`,
        });
      } catch (caught) {
        const message = toErrorMessage(caught);

        store.setError(message);
        addLog({
          level: "error",
          source: "vpn",
          message: `Подключение не удалось: ${message}`,
        });
        await refreshStatus();
      } finally {
        useVpnCoreStore.getState().setLoading(false);
      }
    },
    [addLog, refreshStatus]
  );

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      const status = await commands.disconnectVpnServer();

      useVpnCoreStore.getState().setStatus(status);
      useVpnCoreStore.getState().setActiveServer(null);
      addLog({ level: "info", source: "vpn", message: "VPN отключён" });
    } catch (caught) {
      useVpnCoreStore.getState().setError(toErrorMessage(caught));
    }
  }, [addLog]);

  return { refreshStatus, loadServers, installCore, connectServer, disconnect };
}
