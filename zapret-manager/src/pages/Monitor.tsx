import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useCallback, useRef, useState } from "react";

import MonitorControls from "@/components/monitor/MonitorControls";
import PingMonitor from "@/components/monitor/PingMonitor";
import StatsCounters from "@/components/monitor/StatsCounters";
import TrafficChart from "@/components/monitor/TrafficChart";
import TrafficStatus from "@/components/monitor/TrafficStatus";
import { Heading, Text } from "@/components/ui";
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
import { TRAFFIC_COLORS } from "@/lib/constants";
import { composeSnapshot, snapshotFileName } from "@/lib/monitorSnapshot";
import { toErrorMessage } from "@/lib/utils";
import { useActiveStrategy } from "@/stores/selectors";
import { useLogsStore } from "@/stores/useLogsStore";

const SNAPSHOT_WIDTH = 1180;

export default function Monitor() {
  const { bufferRef, stats, isPaused, error, clearBuffer, togglePause } =
    useNetworkMonitor();
  const activeStrategy = useActiveStrategy();
  const addLog = useLogsStore((state) => state.addLog);
  const inboundRef = useRef<HTMLCanvasElement | null>(null);
  const outboundRef = useRef<HTMLCanvasElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
          { label: "Входящий трафик", canvas: inboundRef.current },
          { label: "Исходящий трафик", canvas: outboundRef.current },
        ],
        SNAPSHOT_WIDTH
      );

      if (data === "") {
        throw new Error("Не удалось получить изображение с графика");
      }

      await invoke("write_monitor_snapshot", { path, data });
      addLog({
        level: "success",
        source: "system",
        message: `Снимок монитора сохранён: ${path}`,
      });
    } catch (caught) {
      addLog({
        level: "error",
        source: "system",
        message: `Снимок не сохранён: ${toErrorMessage(caught)}`,
      });
    } finally {
      setIsSaving(false);
    }
  }, [addLog]);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Heading level={1}>Монитор</Heading>
        <Text variant="body" size="lg" className="text-text-secondary">
          Трафик и соединения в реальном времени
        </Text>
      </header>

      <div className="flex flex-col gap-3">
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
            Обновление 10 раз в секунду · буфер 12 секунд
          </Text>
        </div>

        <StatsCounters stats={stats} />
      </div>

      <PingMonitor />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TrafficChart
          buffer={bufferRef}
          dataKey="in"
          label="Входящий трафик"
          color={TRAFFIC_COLORS.in}
          isPaused={isPaused}
          canvasRef={inboundRef}
        />
        <TrafficChart
          buffer={bufferRef}
          dataKey="out"
          label="Исходящий трафик"
          color={TRAFFIC_COLORS.out}
          isPaused={isPaused}
          canvasRef={outboundRef}
        />
      </div>
    </section>
  );
}
