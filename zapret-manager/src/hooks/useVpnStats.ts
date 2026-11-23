// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/vpnConstants.
import { VPN_STATS_INTERVAL_MS } from "@/lib/vpnConstants";
// Импортируем зависимости из модуля @/lib/vpnCommands.
import { fetchStats } from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useVpnStats(): void {
  // Обрабатываем конструкцию: const state = useVpnStore((value) => value.status.state….
  const state = useVpnStore((value) => value.status.state);
  // Обрабатываем конструкцию: const interfaceName = useVpnStore((value) => value.stat….
  const interfaceName = useVpnStore((value) => value.status.interface);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: state !== connected || interfaceName === null.
    if (state !== "connected" || interfaceName === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { void fetchStat….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: void fetchStats() .then((stats) => { const store = useV….
      void fetchStats()
        // Продолжаем цепочку вызовов.
        .then((stats) => {
          // Обрабатываем конструкцию: const store = useVpnStore.getState().
          const store = useVpnStore.getState();
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: store.
          store.setStatus({
            // Обрабатываем конструкцию: state.
            state: "connected",
            // Обрабатываем конструкцию: interface.
            interface: stats.interface,
            // Обрабатываем конструкцию: endpoint.
            endpoint: stats.endpoint,
            // Обрабатываем конструкцию: handshakeAt.
            handshakeAt: stats.handshakeAt,
            // Обрабатываем конструкцию: bytesIn.
            bytesIn: stats.bytesIn,
            // Обрабатываем конструкцию: bytesOut.
            bytesOut: stats.bytesOut,
            // Обрабатываем конструкцию: uptimeSec.
            uptimeSec: stats.uptimeSec,
            // Обрабатываем конструкцию: error.
            error: null,
            // Закрываем текущий блок.
          });
          // Обрабатываем конструкцию: store.
          store.setKillSwitchActive(stats.killSwitchOn);
          // Закрываем текущий блок.
        })
        // Продолжаем цепочку вызовов.
        .catch(() => undefined);
      // Закрываем текущий блок.
    }, VPN_STATS_INTERVAL_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [state, interfaceName]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
