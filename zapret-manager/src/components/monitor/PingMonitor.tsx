import { useMemo } from "react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { usePing } from "@/hooks/usePing";
import { MONITOR_PING_HISTORY_SIZE, PING_HOSTS } from "@/lib/constants";
import {
  buildSparklineFill,
  buildSparklinePath,
  formatPing,
  getPingColor,
  lastLatency,
} from "@/lib/pingUtils";
import type { PingHistory } from "@/hooks/usePing";
import type { PingPoint } from "@/lib/pingUtils";

const SPARK_WIDTH = 120;
const SPARK_HEIGHT = 28;

interface PingCardProps {
  label: string;
  points: PingPoint[];
  title: string;
}

function PingCard({ label, points, title }: PingCardProps) {
  const latency = lastLatency(points);
  const color = getPingColor(latency);
  const line = useMemo(
    () => buildSparklinePath(points, SPARK_WIDTH, SPARK_HEIGHT),
    [points]
  );
  const fill = useMemo(
    () => buildSparklineFill(points, SPARK_WIDTH, SPARK_HEIGHT),
    [points]
  );

  return (
    <GlassPanel padding="md" className="flex flex-col gap-2" title={title}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-text-secondary text-xs font-medium">{label}</span>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          {formatPing(latency)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Пинг до сервиса ${label}`}
        className="h-7 w-full"
      >
        <path d={fill} fill={color} opacity={0.16} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-text-tertiary text-[10px]">
        {points.length === 0
          ? "ожидание ответа…"
          : `${points.length} ${points.length === 1 ? "замер" : "замеров"} за минуту`}
      </span>
    </GlassPanel>
  );
}

function resolve(history: PingHistory, host: string): PingPoint[] {
  return history[host] ?? [];
}

function PingMonitor() {
  const { history } = usePing({
    hosts: PING_HOSTS,
    historySize: MONITOR_PING_HISTORY_SIZE,
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {PING_HOSTS.map(({ host, label }) => (
        <PingCard
          key={host}
          label={label}
          points={resolve(history, host)}
          title={host}
        />
      ))}
    </div>
  );
}

export default PingMonitor;
