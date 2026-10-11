import { useI18n } from "@/i18n";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useTrafficCanvas } from "@/hooks/useTrafficCanvas";
import { TRAFFIC_CHART_HEIGHT } from "@/lib/constants";
import { formatSpeed } from "@/lib/trafficUtils";
import { useRef } from "react";
import type { RefObject } from "react";
import type { TrafficKey, TrafficPoint } from "@/types";

export interface TrafficChartProps {
  buffer: RefObject<TrafficPoint[]>;
  dataKey: TrafficKey;
  label: string;
  color: string;
  isPaused: boolean;
  height?: number;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
}

function TrafficChart({
  buffer,
  dataKey,
  label,
  color,
  isPaused,
  height = TRAFFIC_CHART_HEIGHT,
  canvasRef,
}: TrafficChartProps) {
  const { t } = useI18n();
  const localRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = canvasRef ?? localRef;

  const { currentValue } = useTrafficCanvas({
    buffer,
    canvasRef: targetRef,
    dataKey,
    color,
    height,
    paused: isPaused,
  });

  return (
    <GlassPanel padding="md" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-text-secondary text-xs font-medium">{label}</span>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          {formatSpeed(currentValue)}
        </span>
      </div>

      <canvas
        ref={targetRef}
        role="img"
        aria-label={t("monitor.chart.aria", {
          label,
          value: formatSpeed(currentValue),
        })}
        className="block w-full rounded-lg"
        style={{ height: `${height}px` }}
      />

      {isPaused ? (
        <span className="text-text-tertiary text-[10px] uppercase">
          {t("monitor.chart.frozen")}
        </span>
      ) : null}
    </GlassPanel>
  );
}

export default TrafficChart;
