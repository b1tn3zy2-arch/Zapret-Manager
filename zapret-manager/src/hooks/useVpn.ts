import { useCallback } from "react";

import * as commands from "@/lib/vpnCommands";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { useVpnStore } from "@/stores/useVpnStore";

export interface UseVpnResult {
  error: string | null;
  detectWireguard: () => Promise<void>;
  refreshConfigs: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  connect: (configId: string) => Promise<void>;
  connectActive: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchToDpi: () => Promise<void>;
}

async function restoreDpiStrategy(strategyId: string | null): Promise<void> {
  if (strategyId === null) {
    return;
  }

  const addLog = useLogsStore.getState().addLog;
  const store = useStrategiesStore.getState();
  const target = store.strategies.find((item) => item.id === strategyId);

  if (target === undefined) {
    return;
  }

  store.setStatus(strategyId, "starting");

  try {
    const result = await commands.runStrategy(strategyId, target.path);

    store.setStatus(strategyId, "running");
    store.setPid(strategyId, result.pid);
    addLog({
      level: "success",
      source: "strategy",
      message: `DPI-стратегия восстановлена, PID ${result.pid}`,
      strategyId,
    });
  } catch (caught) {
    store.setStatus(strategyId, "idle");
    addLog({
      level: "error",
      source: "strategy",
      message: `Не удалось вернуть DPI-стратегию: ${toErrorMessage(caught)}`,
      strategyId,
    });
  }
}

export function useVpn(): UseVpnResult {
  const error = useVpnStore((state) => state.error);
  const addLog = useLogsStore((state) => state.addLog);

  const refreshConfigs = useCallback(async (): Promise<void> => {
    try {
      useVpnStore.getState().setConfigs(await commands.listConfigs());
    } catch (caught) {
      useVpnStore.getState().setError(toErrorMessage(caught));
    }
  }, []);

  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      useVpnStore.getState().setStatus(await commands.fetchStatus());
    } catch {
      return;
    }
  }, []);

  const detectWireguard = useCallback(async (): Promise<void> => {
    try {
      const installed = await commands.isWireguardInstalled();

      useVpnStore.getState().setWireguardInstalled(installed);

      if (installed) {
        await refreshConfigs();
      }
    } catch (caught) {
      useVpnStore.getState().setError(toErrorMessage(caught));
    }
  }, [refreshConfigs]);

  const deleteConfig = useCallback(
    async (id: string): Promise<void> => {
      useVpnStore.getState().setError(null);

      try {
        await commands.removeConfig(id);
        useVpnStore.getState().removeConfig(id);
        addLog({
          level: "info",
          source: "vpn",
          message: `Удалён конфиг: ${id}`,
        });
      } catch (caught) {
        useVpnStore.getState().setError(toErrorMessage(caught));
      }
    },
    [addLog]
  );

  const connect = useCallback(
    async (configId: string): Promise<void> => {
      const vpn = useSettingsStore.getState().settings.vpn;

      useVpnStore.getState().setError(null);
      useVpnStore.getState().setSwitching(true);
      useVpnStore.getState().setStatus({ state: "connecting", error: null });

      try {
        const status = await commands.connect(
          configId,
          vpn.killSwitch,
          vpn.handshakeTimeoutSec
        );

        const chosen = useVpnStore
          .getState()
          .configs.find((item) => item.id === configId);

        useVpnStore.getState().setStatus(status);
        useVpnStore.getState().setActiveConfig(configId);
        useVpnStore.getState().setKillSwitchActive(vpn.killSwitch);
        useSettingsStore.getState().updateVpn({
          enabled: true,
          activeConfigId: configId,
          configPath: chosen?.path ?? "",
          lastConnectedAt: Date.now(),
        });
        addLog({
          level: "success",
          source: "vpn",
          message: `VPN подключён: ${status.endpoint ?? "endpoint неизвестен"}`,
        });
      } catch (caught) {
        const message = toErrorMessage(caught);

        useVpnStore.getState().setStatus({ state: "error", error: message });
        addLog({
          level: "error",
          source: "vpn",
          message: `Подключение не удалось: ${message}`,
        });
      } finally {
        useVpnStore.getState().setSwitching(false);
      }
    },
    [addLog]
  );

  const connectActive = useCallback(async (): Promise<void> => {
    const id = useVpnStore.getState().activeConfigId;

    if (id === null) {
      useVpnStore.getState().setError("Сначала выберите конфиг");
      return;
    }

    await connect(id);
  }, [connect]);

  const disconnect = useCallback(async (): Promise<void> => {
    useVpnStore.getState().setError(null);
    useVpnStore.getState().setSwitching(true);
    useVpnStore.getState().setSwitchStep("stopping-vpn");

    try {
      await commands.disconnect();
      useVpnStore.getState().setStatus({ state: "disconnected" });
      useVpnStore.getState().setKillSwitchActive(false);
      useSettingsStore.getState().updateVpn({ enabled: false });
      addLog({ level: "info", source: "vpn", message: "VPN отключён" });
    } catch (caught) {
      useVpnStore.getState().setError(toErrorMessage(caught));
    } finally {
      useVpnStore.getState().setSwitching(false);
    }
  }, [addLog]);

  const switchToDpi = useCallback(async (): Promise<void> => {
    const lastStrategyId = useSettingsStore.getState().settings.lastStrategyId;

    useVpnStore.getState().setError(null);
    useVpnStore.getState().setSwitching(true);
    useVpnStore.getState().setSwitchStep("stopping-vpn");

    try {
      await commands.switchBackToDpi();
      useVpnStore.getState().setStatus({ state: "disconnected" });
      useVpnStore.getState().setKillSwitchActive(false);
      useSettingsStore.getState().updateVpn({ enabled: false });
      addLog({
        level: "info",
        source: "vpn",
        message: "Переключение на DPI-обход",
      });

      await restoreDpiStrategy(lastStrategyId);
    } catch (caught) {
      useVpnStore.getState().setError(toErrorMessage(caught));
    } finally {
      useVpnStore.getState().setSwitching(false);
    }
  }, [addLog]);

  return {
    error,
    detectWireguard,
    refreshConfigs,
    refreshStatus,
    deleteConfig,
    connect,
    connectActive,
    disconnect,
    switchToDpi,
  };
}
