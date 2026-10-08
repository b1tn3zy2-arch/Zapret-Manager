import { ArrowDown, ArrowUp, Network, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { formatBytes, formatCount } from "@/lib/trafficUtils";
import type { NetworkStats } from "@/types";

export interface StatsCountersProps {
  stats: NetworkStats | null;
}

interface CounterProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
}

function Counter({ icon: Icon, label, value, tone }: CounterProps) {
  return (
    <GlassPanel padding="md" className="flex flex-col gap-1">
      <span className={`flex items-center gap-2 ${tone}`}>
        <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </span>
      <span className="text-text-secondary text-xs">{label}</span>
    </GlassPanel>
  );
}

function StatsCounters({ stats }: StatsCountersProps) {
  const packets = (stats?.packetsIn ?? 0) + (stats?.packetsOut ?? 0);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Counter
        icon={ArrowDown}
        label="Загружено всего"
        value={formatBytes(stats?.bytesIn ?? 0)}
        tone="text-accent-primary"
      />
      <Counter
        icon={ArrowUp}
        label="Отдано всего"
        value={formatBytes(stats?.bytesOut ?? 0)}
        tone="text-accent-secondary"
      />
      <Counter
        icon={Package}
        label="Пакетов"
        value={formatCount(packets)}
        tone="text-text-primary"
      />
      <Counter
        icon={Network}
        label="Соединений"
        value={String(stats?.connections ?? 0)}
        tone="text-accent-secondary"
      />
    </div>
  );
}

export default StatsCounters;
