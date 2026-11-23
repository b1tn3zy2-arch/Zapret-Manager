// Импортируем зависимости из модуля react.
import { useCallback } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/ConnectionStrip.
import ConnectionStrip from "@/components/dashboard/ConnectionStrip";
// Импортируем зависимости из модуля @/components/dashboard/DashboardHero.
import DashboardHero from "@/components/dashboard/DashboardHero";
// Импортируем зависимости из модуля @/components/dashboard/DashboardPing.
import DashboardPing from "@/components/dashboard/DashboardPing";
// Импортируем зависимости из модуля @/components/dashboard/DashboardRecentLogs.
import DashboardRecentLogs from "@/components/dashboard/DashboardRecentLogs";
// Импортируем зависимости из модуля @/lib/constants.
import { ROUTES } from "@/lib/constants";
// Импортируем зависимости из модуля @/hooks/useDashboardStagger.
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
// Импортируем зависимости из модуля @/hooks/useStrategyRunner.
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
// Импортируем зависимости из модуля @/hooks/useUptime.
import { useUptime } from "@/hooks/useUptime";
// Импортируем зависимости из модуля @/hooks/useVpn.
import { useVpn } from "@/hooks/useVpn";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/selectors.
import {
  // Подключаем именованный импорт useActiveStrategy.
  useActiveStrategy,
  // Подключаем именованный импорт useConnectionStatus.
  useConnectionStatus,
  // Подключаем именованный импорт useLastStrategy.
  useLastStrategy,
  // Подключаем именованный импорт useRunningStartedAt.
  useRunningStartedAt,
  // Закрываем текущий блок.
} from "@/stores/selectors";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { selectActiveConfig, useVpnStore } from "@/stores/useVpnStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DpiModeProps {
  // Сохраняем пояснение разработчика: проигрывать ли каскад появления (только при первом открытии …
  /** проигрывать ли каскад появления (только при первом открытии страницы) */
  // Обрабатываем конструкцию: intro.
  intro?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function DpiMode({ intro = true }: DpiModeProps) {
  // Обрабатываем конструкцию: const setActivePage = useAppStore((state) => state.setA….
  const setActivePage = useAppStore((state) => state.setActivePage);
  // Обрабатываем конструкцию: const connectionStatus = useConnectionStatus().
  const connectionStatus = useConnectionStatus();
  // Обрабатываем конструкцию: const activeStrategy = useActiveStrategy().
  const activeStrategy = useActiveStrategy();
  // Обрабатываем конструкцию: const lastStrategy = useLastStrategy().
  const lastStrategy = useLastStrategy();
  // Обрабатываем конструкцию: const startedAt = useRunningStartedAt().
  const startedAt = useRunningStartedAt();
  // Обрабатываем конструкцию: const activeVpnConfig = useVpnStore(selectActiveConfig).
  const activeVpnConfig = useVpnStore(selectActiveConfig);
  // Обрабатываем конструкцию: const vpnConnected = useVpnStore( (state) => state.stat….
  const vpnConnected = useVpnStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.status.state === "connected"
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const logsEnabled = useSettingsStore( (state) => state.….
  const logsEnabled = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.enableLogs
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const { run, stop, isStarting, isStopping } = useStrate….
  const { run, stop, isStarting, isStopping } = useStrategyRunner();
  // Обрабатываем конструкцию: const { disconnect: disconnectVpn } = useVpn().
  const { disconnect: disconnectVpn } = useVpn();
  // Обрабатываем конструкцию: const { containerVariants, itemVariants } = useDashboar….
  const { containerVariants, itemVariants } = useDashboardStagger();
  // Обрабатываем конструкцию: const uptime = useUptime(startedAt).
  const uptime = useUptime(startedAt);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const strategyName = activeStrategy?.name ?? lastStrate….
  const strategyName = activeStrategy?.name ?? lastStrategy?.name ?? null;
  // Обрабатываем конструкцию: const isBusy = isStarting || isStopping.
  const isBusy = isStarting || isStopping;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleConnect = useCallback((): void => { if (vpn….
  const handleConnect = useCallback((): void => {
    // Проверяем бизнес-условие: vpnConnected.
    if (vpnConnected) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const target = activeStrategy ?? lastStrategy.
    const target = activeStrategy ?? lastStrategy;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: target === undefined.
    if (target === undefined) {
      // Обрабатываем конструкцию: setActivePage.
      setActivePage(ROUTES.strategies);
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void run(target.id, target.path).
    void run(target.id, target.path);
    // Закрываем текущий блок.
  }, [activeStrategy, lastStrategy, run, setActivePage, vpnConnected]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleDisconnect = useCallback((): void => { if (….
  const handleDisconnect = useCallback((): void => {
    // Проверяем бизнес-условие: connectionStatus === vpn.
    if (connectionStatus === "vpn") {
      // Обрабатываем конструкцию: void disconnectVpn().
      void disconnectVpn();
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: activeStrategy === undefined.
    if (activeStrategy === undefined) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void stop(activeStrategy.id, activeStrategy.path).
    void stop(activeStrategy.id, activeStrategy.path);
    // Закрываем текущий блок.
  }, [activeStrategy, connectionStatus, disconnectVpn, stop]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleOpenAllLogs = useCallback((): void => { set….
  const handleOpenAllLogs = useCallback((): void => {
    // Обрабатываем конструкцию: setActivePage.
    setActivePage(ROUTES.logs);
    // Закрываем текущий блок.
  }, [setActivePage]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <motion.div variants={containerVariants} initial={int….
  return (
    // Обрабатываем конструкцию: <motion.div variants={containerVariants} initial={intro….
    <motion.div
      // Обрабатываем конструкцию: variants.
      variants={containerVariants}
      // Обрабатываем конструкцию: initial.
      initial={intro ? "hidden" : false}
      // Обрабатываем конструкцию: animate.
      animate="visible"
      // Обрабатываем конструкцию: className.
      className="dashboard-layout"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div variants={itemVariants} className="dashboard-lead">
        {/* Выводим текстовое содержимое в JSX. */}
        <DashboardHero
          // Обрабатываем конструкцию: status.
          status={connectionStatus}
          // Обрабатываем конструкцию: strategyName.
          strategyName={strategyName}
          // Обрабатываем конструкцию: vpnLabel.
          vpnLabel={activeVpnConfig?.name ?? null}
          // Обрабатываем конструкцию: uptime.
          uptime={uptime}
          // Обрабатываем конструкцию: isConnecting.
          isConnecting={isBusy}
          // Обрабатываем конструкцию: onConnect.
          onConnect={handleConnect}
          // Обрабатываем конструкцию: onDisconnect.
          onDisconnect={handleDisconnect}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <ConnectionStrip />
          {/* Выводим текстовое содержимое в JSX. */}
        </DashboardHero>
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div variants={itemVariants} className="dashboard-wide">
        {/* Выводим текстовое содержимое в JSX. */}
        <DashboardPing />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {logsEnabled ? (
        // Обрабатываем конструкцию: <motion.div variants={itemVariants} className=dashboard….
        <motion.div variants={itemVariants} className="dashboard-wide">
          {/* Выводим текстовое содержимое в JSX. */}
          <DashboardRecentLogs onOpenAllLogs={handleOpenAllLogs} />
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
