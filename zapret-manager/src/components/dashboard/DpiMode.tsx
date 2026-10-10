import { useCallback } from "react";

import DashboardConnection from "@/components/dashboard/DashboardConnection";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardPing from "@/components/dashboard/DashboardPing";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardRecentLogs from "@/components/dashboard/DashboardRecentLogs";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { ROUTES } from "@/lib/constants";
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
    <>
      <div className="dashboard-grid">
        <div
          className="dashboard-lead flex flex-col"
          style={{ gap: "var(--space-md)" }}
        >
          <DashboardHero
            status={connectionStatus}
            strategyName={strategyName}
            vpnLabel={activeVpnConfig?.name ?? null}
            uptime={uptime}
            isConnecting={isBusy}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
          <DashboardStats uptime={uptime} />
        </div>

        <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
          <DashboardConnection />
          <DashboardPing />
        </div>
      </div>

      <div className="dashboard-grid">
        <DashboardQuickActions
          lastStrategy={lastStrategy}
          isActive={activeStrategy !== undefined}
          isBusy={isBusy || vpnConnected}
          onRun={handleConnect}
          onStop={handleDisconnect}
        />
        <DashboardRecentLogs onOpenAllLogs={handleOpenAllLogs} />
      </div>
    </>
  );
}
