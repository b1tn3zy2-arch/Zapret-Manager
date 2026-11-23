// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { CONNECTION_STATUS, type ConnectionStatus } from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import {
  // Подключаем именованный импорт selectStrategies.
  selectStrategies,
  // Подключаем именованный импорт useStrategiesStore.
  useStrategiesStore,
  // Закрываем текущий блок.
} from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { selectVpnActive, useVpnStore } from "@/stores/useVpnStore";
// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * VPN в приложении два: WireGuard (конфиги на диске) и Xray
 * VPN в приложении два: WireGuard (конфиги на диске) и Xray
 // Сохраняем пояснение разработчика: * (подписка и ядро). Раньше статус в трее и на дашборде брал…
 * (подписка и ядро). Раньше статус в трее и на дашборде брался
 // Сохраняем пояснение разработчика: * только из WireGuard, и при подключении через Xray интерфей…
 * только из WireGuard, и при подключении через Xray интерфейс
 // Сохраняем пояснение разработчика: * показывал «не подключено», хотя трафик шёл через прокси.
 * показывал «не подключено», хотя трафик шёл через прокси.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useVpnConnected(): boolean {
  // Обрабатываем конструкцию: const wireguard = useVpnStore(selectVpnActive).
  const wireguard = useVpnStore(selectVpnActive);
  // Обрабатываем конструкцию: const xray = useVpnCoreStore((state) => state.status?.r….
  const xray = useVpnCoreStore((state) => state.status?.running === true);
  // — разделитель логических блоков —

  // Возвращаем результат: wireguard || xray.
  return wireguard || xray;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useActiveStrategy(): Strategy | undefined {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore(selectStrategies).
  const strategies = useStrategiesStore(selectStrategies);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo( () => strategies.find((strategy) => strategy.s….
  return useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => strategies.find((strategy) => strategy.status === "running"),
    // Открываем массив.
    [strategies]
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useLastStrategy(): Strategy | undefined {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore(selectStrategies).
  const strategies = useStrategiesStore(selectStrategies);
  // Обрабатываем конструкцию: const lastStrategyId = useSettingsStore( (state) => sta….
  const lastStrategyId = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.lastStrategyId
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { if (lastStrategyId === null) { return u….
  return useMemo(() => {
    // Проверяем бизнес-условие: lastStrategyId === null.
    if (lastStrategyId === null) {
      // Возвращаем результат: undefined.
      return undefined;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: strategies.find((strategy) => strategy.id === lastStrat….
    return strategies.find((strategy) => strategy.id === lastStrategyId);
    // Закрываем текущий блок.
  }, [lastStrategyId, strategies]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Реэкспортируем значения из модуля export { useCollectionStats, useFilteredCards } from ./useStrategyCard….
export { useCollectionStats, useFilteredCards } from "./useStrategyCards";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useConnectionStatus(): ConnectionStatus {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore(selectStrategies).
  const strategies = useStrategiesStore(selectStrategies);
  // Обрабатываем конструкцию: const vpnState = useVpnStore((state) => state.status.st….
  const vpnState = useVpnStore((state) => state.status.state);
  // Обрабатываем конструкцию: const isVpnConnected = useVpnConnected().
  const isVpnConnected = useVpnConnected();
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { if (vpnState === error) { return CONNEC….
  return useMemo(() => {
    // Проверяем бизнес-условие: vpnState === error.
    if (vpnState === "error") {
      // Возвращаем результат: CONNECTION_STATUS.error.
      return CONNECTION_STATUS.error;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: isVpnConnected.
    if (isVpnConnected) {
      // Возвращаем результат: CONNECTION_STATUS.vpn.
      return CONNECTION_STATUS.vpn;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: vpnState === connecting.
    if (vpnState === "connecting") {
      // Возвращаем результат: CONNECTION_STATUS.connecting.
      return CONNECTION_STATUS.connecting;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const hasStarting = strategies.some( (strategy) => stra….
    const hasStarting = strategies.some(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (strategy) => strategy.status === "starting"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: hasStarting.
    if (hasStarting) {
      // Возвращаем результат: CONNECTION_STATUS.connecting.
      return CONNECTION_STATUS.connecting;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const hasRunning = strategies.some( (strategy) => strat….
    const hasRunning = strategies.some(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (strategy) => strategy.status === "running"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: hasRunning.
    if (hasRunning) {
      // Возвращаем результат: CONNECTION_STATUS.connected.
      return CONNECTION_STATUS.connected;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const hasFailed = strategies.some( (strategy) => strate….
    const hasFailed = strategies.some(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (strategy) => strategy.status === "error"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Возвращаем результат: hasFailed ? CONNECTION_STATUS.error : CONNECTION_STATUS….
    return hasFailed ? CONNECTION_STATUS.error : CONNECTION_STATUS.disconnected;
    // Закрываем текущий блок.
  }, [strategies, vpnState, isVpnConnected]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useRunningStartedAt(): number | null {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore(selectStrategies).
  const strategies = useStrategiesStore(selectStrategies);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { const running = strategies.find( (strat….
  return useMemo(() => {
    // Обрабатываем конструкцию: const running = strategies.find( (strategy) => strategy….
    const running = strategies.find(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (strategy) => strategy.status === "running"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Возвращаем результат: running?.lastRun ?? null.
    return running?.lastRun ?? null;
    // Закрываем текущий блок.
  }, [strategies]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
