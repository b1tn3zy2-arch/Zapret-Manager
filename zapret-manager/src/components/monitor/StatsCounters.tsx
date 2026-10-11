import { useI18n } from "@/i18n";
import { ArrowDown, ArrowUp, Network, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { AnimatedNumber } from "@/components/ui";
import { MONITOR_COUNT_UP_DURATION_MS } from "@/lib/constants";
import { formatBytes, formatCount } from "@/lib/trafficUtils";
import type { NetworkStats } from "@/types";

export interface StatsCountersProps {
  stats: NetworkStats | null;
}

interface CounterProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format: (value: number) => string;
  tone: string;
}

function Counter({ icon: Icon, label, value, format, tone }: CounterProps) {
  return (
    <GlassPanel padding="md" className="flex flex-col gap-1">
      <span className={`flex items-center gap-2 ${tone}`}>
        <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
        <AnimatedNumber
          value={value}
          duration={MONITOR_COUNT_UP_DURATION_MS}
          format={format}
          className="text-2xl font-bold tabular-nums"
        />
      </span>
      <span className="text-text-secondary text-xs">{label}</span>
    </GlassPanel>
  );
}

function StatsCounters({ stats }: StatsCountersProps) {
  const { t } = useI18n();
  const packets = (stats?.packetsIn ?? 0) + (stats?.packetsOut ?? 0);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Counter
        icon={ArrowDown}
        label={t("monitor.counters.downloaded")}
        value={stats?.bytesIn ?? 0}
        format={formatBytes}
        tone="text-accent-primary"
      />
      <Counter
        icon={ArrowUp}
        label={t("monitor.counters.uploaded")}
        value={stats?.bytesOut ?? 0}
        format={formatBytes}
        tone="text-accent-secondary"
      />
      <Counter
        icon={Package}
        label={t("monitor.counters.packets")}
        value={packets}
        format={formatCount}
        tone="text-text-primary"
      />
      <Counter
        icon={Network}
        label={t("monitor.counters.connections")}
        value={stats?.connections ?? 0}
        format={(value) => String(Math.round(value))}
        tone="text-accent-secondary"
      />
    </div>
  );
}

export default StatsCounters;
