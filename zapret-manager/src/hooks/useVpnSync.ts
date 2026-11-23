// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/vpnCommands.
import * as commands from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// Импортируем зависимости из модуля @/types.
import type { SwitchStep } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const RECONCILE_RETRY_MS = 5000.
const RECONCILE_RETRY_MS = 5000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useVpnSync(): void {
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
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

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let cancelled = false.
    let cancelled = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const load = async (): Promise<void> => { try { const i….
    const load = async (): Promise<void> => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const installed = await commands.isWireguardInstalled().
        const installed = await commands.isWireguardInstalled();
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: cancelled.
        if (cancelled) {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const store = useVpnStore.getState().
        const store = useVpnStore.getState();
        // Обрабатываем конструкцию: store.
        store.setWireguardInstalled(installed);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: installed.
        if (installed) {
          // Обрабатываем конструкцию: const configs = await commands.listConfigs().
          const configs = await commands.listConfigs();
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: !cancelled.
          if (!cancelled) {
            // Обрабатываем конструкцию: store.
            store.setConfigs(configs);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: installed.
        if (installed) {
          // Ожидаем завершение асинхронной операции await commands.reconcileTunnels().
          await commands.reconcileTunnels();
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Ожидаем завершение асинхронной операции await refreshStatus().
        await refreshStatus();
        // Закрываем текущий блок.
      } catch (caught) {
        // Проверяем бизнес-условие: !cancelled.
        if (!cancelled) {
          // Обрабатываем конструкцию: useVpnStore.
          useVpnStore.getState().setError(toErrorMessage(caught));
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void load().
    void load();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { cancelled = true; }.
    return () => {
      // Обрабатываем конструкцию: cancelled.
      cancelled = true;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [refreshStatus]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const timer = window.setInterval(() => { const state = ….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: const state = useVpnStore.getState().
      const state = useVpnStore.getState();
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: state.wireguardInstalled && state.status.state === disc….
      if (state.wireguardInstalled && state.status.state === "disconnected") {
        // Обрабатываем конструкцию: void commands .reconcileTunnels() .then(() => refreshSt….
        void commands
          // Продолжаем цепочку вызовов.
          .reconcileTunnels()
          // Продолжаем цепочку вызовов.
          .then(() => refreshStatus())
          // Продолжаем цепочку вызовов.
          .catch(() => undefined);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }, RECONCILE_RETRY_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [refreshStatus]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const subscriptions = [ listen<string>(vpn-switching, (….
    const subscriptions = [
      // Обрабатываем конструкцию: listen.
      listen<string>("vpn-switching", (event) => {
        // Обрабатываем конструкцию: useVpnStore.
        useVpnStore.getState().setSwitchStep(event.payload as SwitchStep);
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: listen.
      listen<unknown>("vpn-connected", () => {
        // Обрабатываем конструкцию: void refreshStatus().
        void refreshStatus();
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "vpn",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.vpnConnected"),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: listen.
      listen<string>("vpn-disconnected", (event) => {
        // Обрабатываем конструкцию: const store = useVpnStore.getState().
        const store = useVpnStore.getState();
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: event.payload === error.
        if (event.payload === "error") {
          // Обрабатываем конструкцию: store.
          store.setStatus({ state: "error" });
          // Закрываем текущий блок.
        } else {
          // Обрабатываем конструкцию: store.
          store.setStatus({ state: "disconnected" });
          // Обрабатываем конструкцию: store.
          store.setKillSwitchActive(false);
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: event.payload === "error" ? "error" : "info",
          // Обрабатываем конструкцию: source.
          source: "vpn",
          // Обрабатываем конструкцию: message.
          message:
            // Обрабатываем конструкцию: event.
            event.payload === "error"
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                translateKey("log.vpnDisconnectedError")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                translateKey("log.vpnDisconnected"),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }),
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Возвращаем результат: () => { for (const subscription of subscriptions) { voi….
    return () => {
      // Перебираем элементы коллекции subscriptions.
      for (const subscription of subscriptions) {
        // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
        void subscription.then((unlisten) => {
          // Обрабатываем конструкцию: unlisten.
          unlisten();
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [addLog, refreshStatus]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
