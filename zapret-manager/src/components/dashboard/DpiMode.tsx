import { useCallback } from "react";
import { motion } from "framer-motion";

import ConnectionStrip from "@/components/dashboard/ConnectionStrip";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardPing from "@/components/dashboard/DashboardPing";
import DashboardRecentLogs from "@/components/dashboard/DashboardRecentLogs";
import { ROUTES } from "@/lib/constants";
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
import { useUptime } from "@/hooks/useUptime";
import { useVpn } from "@/hooks/useVpn";
import { useAppStore } from "@/stores/useAppStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import {
  useActiveStrategy,
  useConnectionStatus,
  useLastStrategy,
  useRunningStartedAt,
} from "@/stores/selectors";
import { selectActiveConfig, useVpnStore } from "@/stores/useVpnStore";

export interface DpiModeProps {
  /** проигрывать ли каскад появления (только при первом открытии страницы) */
  intro?: boolean;
}

export default function DpiMode({ intro = true }: DpiModeProps) {
  const setActivePage = useAppStore((state) => state.setActivePage);
  const connectionStatus = useConnectionStatus();
  const activeStrategy = useActiveStrategy();
  const lastStrategy = useLastStrategy();
  const startedAt = useRunningStartedAt();
  const activeVpnConfig = useVpnStore(selectActiveConfig);
  const vpnConnected = useVpnStore(
    (state) => state.status.state === "connected"
  );
  const logsEnabled = useSettingsStore(
    (state) => state.settings.general.enableLogs
  );

  const { run, stop, isStarting, isStopping } = useStrategyRunner();
  const { disconnect: disconnectVpn } = useVpn();
  const { containerVariants, itemVariants } = useDashboardStagger();
  const uptime = useUptime(startedAt);

  const strategyName = activeStrategy?.name ?? lastStrategy?.name ?? null;
  const isBusy = isStarting || isStopping;

  const handleConnect = useCallback((): void => {
    if (vpnConnected) {
      return;
    }

    const target = activeStrategy ?? lastStrategy;

    if (target === undefined) {
      setActivePage(ROUTES.strategies);
      return;
    }

    void run(target.id, target.path);
  }, [activeStrategy, lastStrategy, run, setActivePage, vpnConnected]);

  const handleDisconnect = useCallback((): void => {
    if (connectionStatus === "vpn") {
      void disconnectVpn();
      return;
    }

    if (activeStrategy === undefined) {
      return;
    }

    void stop(activeStrategy.id, activeStrategy.path);
  }, [activeStrategy, connectionStatus, disconnectVpn, stop]);

  const handleOpenAllLogs = useCallback((): void => {
    setActivePage(ROUTES.logs);
  }, [setActivePage]);

  return (
    <motion.div
      variants={containerVariants}
      initial={intro ? "hidden" : false}
      animate="visible"
      className="dashboard-layout"
    >
      <motion.div variants={itemVariants} className="dashboard-lead">
        <DashboardHero
          status={connectionStatus}
          strategyName={strategyName}
          vpnLabel={activeVpnConfig?.name ?? null}
          uptime={uptime}
          isConnecting={isBusy}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        >
          <ConnectionStrip />
        </DashboardHero>
      </motion.div>

      <motion.div variants={itemVariants} className="dashboard-wide">
        <DashboardPing />
      </motion.div>

      {logsEnabled ? (
        <motion.div variants={itemVariants} className="dashboard-wide">
          <DashboardRecentLogs onOpenAllLogs={handleOpenAllLogs} />
        </motion.div>
      ) : null}
    </motion.div>
  );
}
