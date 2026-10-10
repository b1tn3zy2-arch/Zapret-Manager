import { useCallback } from "react";
import { motion } from "framer-motion";

import DashboardConnection from "@/components/dashboard/DashboardConnection";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardPing from "@/components/dashboard/DashboardPing";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardRecentLogs from "@/components/dashboard/DashboardRecentLogs";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { ROUTES } from "@/lib/constants";
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
import { useUptime } from "@/hooks/useUptime";
import { useVpn } from "@/hooks/useVpn";
import { useAppStore } from "@/stores/useAppStore";
import {
  useActiveStrategy,
  useConnectionStatus,
  useLastStrategy,
  useRunningStartedAt,
} from "@/stores/selectors";
import { selectActiveConfig, useVpnStore } from "@/stores/useVpnStore";

export default function DpiMode() {
  const setActivePage = useAppStore((state) => state.setActivePage);
  const setDashboardMode = useAppStore((state) => state.setDashboardMode);
  const connectionStatus = useConnectionStatus();
  const activeStrategy = useActiveStrategy();
  const lastStrategy = useLastStrategy();
  const startedAt = useRunningStartedAt();
  const activeVpnConfig = useVpnStore(selectActiveConfig);
  const vpnConnected = useVpnStore(
    (state) => state.status.state === "connected"
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

  const handleOpenVpnSettings = useCallback((): void => {
    setDashboardMode("vpn");
  }, [setDashboardMode]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <div className="dashboard-grid">
        <div
          className="dashboard-lead flex flex-col"
          style={{ gap: "var(--space-md)" }}
        >
          <motion.div variants={itemVariants}>
            <DashboardHero
              status={connectionStatus}
              strategyName={strategyName}
              vpnLabel={activeVpnConfig?.name ?? null}
              uptime={uptime}
              isConnecting={isBusy}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardStats uptime={uptime} />
          </motion.div>
        </div>

        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          <motion.div variants={itemVariants}>
            <DashboardConnection />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardPing />
          </motion.div>
        </div>
      </div>

      <div className="dashboard-grid">
        <motion.div variants={itemVariants} className="grid">
          <DashboardQuickActions
            lastStrategy={lastStrategy}
            isActive={activeStrategy !== undefined}
            isBusy={isBusy || vpnConnected}
            onRun={handleConnect}
            onStop={handleDisconnect}
            onOpenVpnSettings={handleOpenVpnSettings}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid">
          <DashboardRecentLogs onOpenAllLogs={handleOpenAllLogs} />
        </motion.div>
      </div>
    </motion.div>
  );
}
