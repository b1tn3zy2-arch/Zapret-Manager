// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/vpnCommands.
import * as commands from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseVpnCoreResult {
  // Обрабатываем конструкцию: refreshStatus.
  refreshStatus: () => Promise<void>;
  // Обрабатываем конструкцию: installCore.
  installCore: () => Promise<void>;
  // Обрабатываем конструкцию: disconnect.
  disconnect: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useVpnCore(): UseVpnCoreResult {
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refreshStatus = useCallback(async (): Promise<voi….
  const refreshStatus = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: useVpnCoreStore.
      useVpnCoreStore.getState().setStatus(await commands.fetchVpnCoreStatus());
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: useVpnCoreStore.
      useVpnCoreStore.getState().setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void refreshStatus().
    void refreshStatus();
    // Закрываем текущий блок.
  }, [refreshStatus]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const installCore = useCallback(async (): Promise<void>….
  const installCore = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: const store = useVpnCoreStore.getState().
    const store = useVpnCoreStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setLoading(true);
    // Обрабатываем конструкцию: store.
    store.setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await commands.installVpnCore().
      await commands.installVpnCore();
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "vpn",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.coreInstalled"),
        // Закрываем текущий блок.
      });
      // Ожидаем завершение асинхронной операции await refreshStatus().
      await refreshStatus();
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: const message = toErrorMessage(caught).
      const message = toErrorMessage(caught);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: store.
      store.setError(message);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "vpn",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.coreNotInstalled", { error: message }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: useVpnCoreStore.
      useVpnCoreStore.getState().setLoading(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog, refreshStatus]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const disconnect = useCallback(async (): Promise<void> ….
  const disconnect = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const status = await commands.disconnectVpnServer().
      const status = await commands.disconnectVpnServer();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useVpnCoreStore.
      useVpnCoreStore.getState().setStatus(status);
      // Обрабатываем конструкцию: useVpnCoreStore.
      useVpnCoreStore.getState().setActiveServer(null);
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
      // Обрабатываем конструкцию: useVpnCoreStore.
      useVpnCoreStore.getState().setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Возвращаем результат: { refreshStatus, installCore, disconnect }.
  return { refreshStatus, installCore, disconnect };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
