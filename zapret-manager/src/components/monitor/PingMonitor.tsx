import { useI18n } from "@/i18n";

import PingSparkline from "@/components/dashboard/PingSparkline";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { usePing } from "@/hooks/usePing";
import {
  MONITOR_PING_HISTORY_SIZE,
  PING_HOSTS,
  PING_INTERVAL_MS,
} from "@/lib/constants";
import { formatPing, getPingColor, lastLatency } from "@/lib/pingUtils";
import type { PingHistory } from "@/hooks/usePing";
import type { Translate } from "@/i18n/types";
import type { PingPoint } from "@/lib/pingUtils";

function pluralMeasurements(count: number, t: Translate): string {
  if (count === 1) {
    return t("monitor.ping.measurementsOne", { count });
  }

  if (count < 5) {
    return t("monitor.ping.measurementsFew", { count });
  }

  return t("monitor.ping.measurementsMany", { count });
}

interface PingCardProps {
  label: string;
  points: PingPoint[];
  title: string;
}

function PingCard({ label, points, title }: PingCardProps) {
  const { t } = useI18n();
  const latency = lastLatency(points);
  const color = getPingColor(latency);

  return (
    <GlassPanel padding="md" className="flex flex-col gap-2" title={title}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-text-secondary text-xs font-medium">{label}</span>
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          {formatPing(latency)}
        </span>
      </div>

      <PingSparkline
        points={points}
        height={28}
        capacity={MONITOR_PING_HISTORY_SIZE}
      />

      <span className="text-text-tertiary text-[10px]">
        {points.length === 0
          ? t("monitor.ping.waiting")
          : pluralMeasurements(Math.round(60000 / PING_INTERVAL_MS), t)}
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
