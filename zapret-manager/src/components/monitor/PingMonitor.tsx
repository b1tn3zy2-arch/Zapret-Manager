import { useI18n } from "@/i18n";

import PingSparkline from "@/components/dashboard/PingSparkline";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { usePing } from "@/hooks/usePing";
import { MONITOR_PING_HISTORY_SIZE, PING_HOSTS } from "@/lib/constants";
import { formatPing, getPingColor, lastLatency } from "@/lib/pingUtils";
import type { PingHistory } from "@/hooks/usePing";
import type { PingPoint } from "@/lib/pingUtils";

interface PingChipProps {
  label: string;
  points: PingPoint[];
  title: string;
}

function PingChip({ label, points, title }: PingChipProps) {
  const { t } = useI18n();
  const latency = lastLatency(points);
  const color = getPingColor(latency);
  const isWaiting = points.length === 0;

  return (
    <div
      title={title}
      className="border-glass-border bg-bg-tertiary/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-text-secondary truncate text-xs font-medium">
          {label}
        </span>
        {isWaiting ? (
          <span className="text-text-tertiary truncate text-[10px]">
            {t("monitor.ping.waiting")}
          </span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <PingSparkline
          points={points}
          height={22}
          capacity={MONITOR_PING_HISTORY_SIZE}
          showEmptyState={false}
        />
        <span className="text-base font-bold tabular-nums" style={{ color }}>
          {isWaiting ? "—" : formatPing(latency)}
        </span>
      </div>
    </div>
  );
}

function resolve(history: PingHistory, host: string): PingPoint[] {
  return history[host] ?? [];
}

/**
 * Пинг до сервисов — одной панелью с компактными чипами.
 *
 * Раньше на каждый сервис была отдельная карточка с подписью «30 замеров за
 * минуту»: три сервиса занимали пол-экрана и сообщали одно и то же.
 */
function PingMonitor() {
  const { t } = useI18n();
  const { history } = usePing({
    hosts: PING_HOSTS,
    historySize: MONITOR_PING_HISTORY_SIZE,
  });

  return (
    <GlassPanel padding="md" className="flex flex-col gap-3">
      <span className="text-text-tertiary text-xs font-medium">
        {t("monitor.ping.section")}
      </span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {PING_HOSTS.map(({ host, label }) => (
          <PingChip
            key={host}
            label={label}
            points={resolve(history, host)}
            title={host}
          />
        ))}
      </div>
    </GlassPanel>
  );
}

export default PingMonitor;
