import { useI18n } from "@/i18n";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import MonitorControls from "@/components/monitor/MonitorControls";
import PingMonitor from "@/components/monitor/PingMonitor";
import StatsCounters from "@/components/monitor/StatsCounters";
import TrafficChart from "@/components/monitor/TrafficChart";
import TrafficStatus from "@/components/monitor/TrafficStatus";
import { Heading, Text } from "@/components/ui";
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
import { TRAFFIC_COLORS } from "@/lib/constants";
import { composeSnapshot, snapshotFileName } from "@/lib/monitorSnapshot";
import { toErrorMessage } from "@/lib/utils";
import { useActiveStrategy } from "@/stores/selectors";
import { useLogsStore } from "@/stores/useLogsStore";

const SNAPSHOT_WIDTH = 1180;

export default function Monitor() {
  const { t } = useI18n();
  const { bufferRef, stats, isPaused, error, clearBuffer, togglePause } =
    useNetworkMonitor();
  const activeStrategy = useActiveStrategy();
  const addLog = useLogsStore((state) => state.addLog);
  const inboundRef = useRef<HTMLCanvasElement | null>(null);
  const outboundRef = useRef<HTMLCanvasElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { containerVariants, itemVariants } = useDashboardStagger();

  const handleSnapshot = useCallback(async () => {
    setIsSaving(true);

    try {
      const path = await save({
        defaultPath: snapshotFileName(),
        filters: [{ name: "PNG", extensions: ["png"] }],
      });

      if (path === null) {
        return;
      }

      const data = composeSnapshot(
        [
          { label: t("monitor.chart.in"), canvas: inboundRef.current },
          { label: t("monitor.chart.out"), canvas: outboundRef.current },
        ],
        SNAPSHOT_WIDTH
      );

      if (data === "") {
        throw new Error(t("monitor.snapshotFailed"));
      }

      await invoke("write_monitor_snapshot", { path, data });
      addLog({
        level: "success",
        source: "system",
        message: t("monitor.snapshotSaved", { path }),
      });
    } catch (caught) {
      addLog({
        level: "error",
        source: "system",
        message: t("monitor.snapshotNotSaved", {
          error: toErrorMessage(caught),
        }),
      });
    } finally {
      setIsSaving(false);
    }
  }, [addLog, t]);

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <motion.header variants={itemVariants} className="flex flex-col gap-2">
        <Heading level={1}>{t("monitor.title")}</Heading>
        <Text variant="body" size="lg" className="text-text-secondary">
          {t("monitor.subtitle")}
        </Text>
      </motion.header>

      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <TrafficStatus
          stats={stats}
          isPaused={isPaused}
          error={error}
          activeStrategy={activeStrategy}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonitorControls
            isPaused={isPaused}
            isSaving={isSaving}
            onTogglePause={togglePause}
            onSnapshot={() => {
              void handleSnapshot();
            }}
            onClear={clearBuffer}
          />
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {t("monitor.hint")}
          </Text>
        </div>

        <StatsCounters stats={stats} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <PingMonitor />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
      >
        <TrafficChart
          buffer={bufferRef}
          dataKey="in"
          label={t("monitor.chart.in")}
          color={TRAFFIC_COLORS.in}
          isPaused={isPaused}
          canvasRef={inboundRef}
        />
        <TrafficChart
          buffer={bufferRef}
          dataKey="out"
          label={t("monitor.chart.out")}
          color={TRAFFIC_COLORS.out}
          isPaused={isPaused}
          canvasRef={outboundRef}
        />
      </motion.div>
    </motion.section>
  );
}
