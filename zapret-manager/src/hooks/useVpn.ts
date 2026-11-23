// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useCallback } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/vpnCommands.
import * as commands from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseVpnResult {
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: detectWireguard.
  detectWireguard: () => Promise<void>;
  // Обрабатываем конструкцию: refreshConfigs.
  refreshConfigs: () => Promise<void>;
  // Обрабатываем конструкцию: refreshStatus.
  refreshStatus: () => Promise<void>;
  // Обрабатываем конструкцию: importConfig.
  importConfig: (sourcePath: string) => Promise<void>;
  // Обрабатываем конструкцию: deleteConfig.
  deleteConfig: (id: string) => Promise<void>;
  // Обрабатываем конструкцию: connect.
  connect: (configId: string) => Promise<void>;
  // Обрабатываем конструкцию: connectActive.
  connectActive: () => Promise<void>;
  // Обрабатываем конструкцию: disconnect.
  disconnect: () => Promise<void>;
  // Обрабатываем конструкцию: switchToDpi.
  switchToDpi: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function restoreDpiStrategy(strategyId: string | null): Promise<void> {
  // Проверяем бизнес-условие: strategyId === null.
  if (strategyId === null) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const addLog = useLogsStore.getState().addLog.
  const addLog = useLogsStore.getState().addLog;
  // Обрабатываем конструкцию: const store = useStrategiesStore.getState().
  const store = useStrategiesStore.getState();
  // Обрабатываем конструкцию: const target = store.strategies.find((item) => item.id ….
  const target = store.strategies.find((item) => item.id === strategyId);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: target === undefined.
  if (target === undefined) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: store.
  store.setStatus(strategyId, "starting");
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const result = await commands.runStrategy(strategyId, t….
    const result = await commands.runStrategy(strategyId, target.path);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setStatus(strategyId, "running");
    // Обрабатываем конструкцию: store.
    store.setPid(strategyId, result.pid);
    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "success",
      // Обрабатываем конструкцию: source.
      source: "strategy",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.dpiRestored", { pid: result.pid }),
      // Передаём поле strategyId в объект.
      strategyId,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  } catch (caught) {
    // Обрабатываем конструкцию: store.
    store.setStatus(strategyId, "idle");
    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "error",
      // Обрабатываем конструкцию: source.
      source: "strategy",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.dpiRestoreFailed", {
        // Обрабатываем конструкцию: error.
        error: toErrorMessage(caught),
        // Закрываем текущий блок.
      }),
      // Передаём поле strategyId в объект.
      strategyId,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useVpn(): UseVpnResult {
  // Обрабатываем конструкцию: const error = useVpnStore((state) => state.error).
  const error = useVpnStore((state) => state.error);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refreshConfigs = useCallback(async (): Promise<vo….
  const refreshConfigs = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setConfigs(await commands.listConfigs());
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refreshStatus = useCallback(async (): Promise<voi….
  const refreshStatus = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setStatus(await commands.fetchStatus());
      // Закрываем текущий блок.
    } catch {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const detectWireguard = useCallback(async (): Promise<v….
  const detectWireguard = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const installed = await commands.isWireguardInstalled().
      const installed = await commands.isWireguardInstalled();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setWireguardInstalled(installed);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: installed.
      if (installed) {
        // Ожидаем завершение асинхронной операции await refreshConfigs().
        await refreshConfigs();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [refreshConfigs]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const importConfig = useCallback( async (sourcePath: st….
  const importConfig = useCallback(
    // Обрабатываем конструкцию: async.
    async (sourcePath: string): Promise<void> => {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(null);
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const config = await commands.importConfig(sourcePath).
        const config = await commands.importConfig(sourcePath);
        // — разделитель логических блоков —

        // Ожидаем завершение асинхронной операции await refreshConfigs().
        await refreshConfigs();
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "vpn",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.configImported", { name: config.name }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setError(toErrorMessage(caught));
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, refreshConfigs]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const deleteConfig = useCallback( async (id: string): P….
  const deleteConfig = useCallback(
    // Обрабатываем конструкцию: async.
    async (id: string): Promise<void> => {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(null);
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Ожидаем завершение асинхронной операции await commands.removeConfig(id).
        await commands.removeConfig(id);
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().removeConfig(id);
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "vpn",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.configDeleted", { id }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setError(toErrorMessage(caught));
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const connect = useCallback( async (configId: string): ….
  const connect = useCallback(
    // Обрабатываем конструкцию: async.
    async (configId: string): Promise<void> => {
      // Обрабатываем конструкцию: const vpn = useSettingsStore.getState().settings.vpn.
      const vpn = useSettingsStore.getState().settings.vpn;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(null);
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setSwitching(true);
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setStatus({ state: "connecting", error: null });
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const status = await commands.connect( configId, vpn.ki….
        const status = await commands.connect(
          // Обрабатываем конструкцию: configId.
          configId,
          // Обрабатываем конструкцию: vpn.
          vpn.killSwitch,
          // Обрабатываем конструкцию: vpn.
          vpn.handshakeTimeoutSec
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const chosen = useVpnStore .getState() .configs.find((i….
        const chosen = useVpnStore
          // Продолжаем цепочку вызовов.
          .getState()
          // Продолжаем цепочку вызовов.
          .configs.find((item) => item.id === configId);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setStatus(status);
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setActiveConfig(configId);
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setKillSwitchActive(vpn.killSwitch);
        // Обрабатываем конструкцию: useSettingsStore.
        useSettingsStore.getState().updateVpn({
          // Обрабатываем конструкцию: enabled.
          enabled: true,
          // Обрабатываем конструкцию: activeConfigId.
          activeConfigId: configId,
          // Обрабатываем конструкцию: configPath.
          configPath: chosen?.path ?? "",
          // Обрабатываем конструкцию: lastConnectedAt.
          lastConnectedAt: Date.now(),
          // Закрываем текущий блок.
        });
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "vpn",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.vpnConnected", {
            // Обрабатываем конструкцию: name.
            name:
              // Обрабатываем конструкцию: status.
              status.endpoint ?? translateKey("dashboard.vpn.endpointUnknown"),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: const message = toErrorMessage(caught).
        const message = toErrorMessage(caught);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setStatus({ state: "error", error: message });
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "vpn",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.vpnConnectFailed", { error: message }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } finally {
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setSwitching(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const connectActive = useCallback(async (): Promise<voi….
  const connectActive = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: const id = useVpnStore.getState().activeConfigId.
    const id = useVpnStore.getState().activeConfigId;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: id === null.
    if (id === null) {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(translateKey("log.chooseConfig"));
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await connect(id).
    await connect(id);
    // Закрываем текущий блок.
  }, [connect]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const disconnect = useCallback(async (): Promise<void> ….
  const disconnect = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setError(null);
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setSwitching(true);
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setSwitchStep("stopping-vpn");
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await commands.disconnect().
      await commands.disconnect();
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setStatus({ state: "disconnected" });
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setKillSwitchActive(false);
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore.getState().updateVpn({ enabled: false });
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "vpn",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.vpnDisconnected"),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setSwitching(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const switchToDpi = useCallback(async (): Promise<void>….
  const switchToDpi = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: const lastStrategyId = useSettingsStore.getState().sett….
    const lastStrategyId = useSettingsStore.getState().settings.lastStrategyId;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setError(null);
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setSwitching(true);
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.getState().setSwitchStep("stopping-vpn");
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await commands.switchBackToDpi().
      await commands.switchBackToDpi();
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setStatus({ state: "disconnected" });
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setKillSwitchActive(false);
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore.getState().updateVpn({ enabled: false });
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "vpn",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.switchingToDpi"),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await restoreDpiStrategy(lastStrategyId).
      await restoreDpiStrategy(lastStrategyId);
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: useVpnStore.
      useVpnStore.getState().setSwitching(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Возвращаем результат: { error, detectWireguard, refreshConfigs, refreshStatus….
  return {
    // Передаём поле error в объект.
    error,
    // Передаём поле detectWireguard в объект.
    detectWireguard,
    // Передаём поле refreshConfigs в объект.
    refreshConfigs,
    // Передаём поле refreshStatus в объект.
    refreshStatus,
    // Передаём поле importConfig в объект.
    importConfig,
    // Передаём поле deleteConfig в объект.
    deleteConfig,
    // Передаём поле connect в объект.
    connect,
    // Передаём поле connectActive в объект.
    connectActive,
    // Передаём поле disconnect в объект.
    disconnect,
    // Передаём поле switchToDpi в объект.
    switchToDpi,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
