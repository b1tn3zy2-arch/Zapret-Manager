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

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format: (value: number) => string;
  tone: string;
}

function Stat({ icon: Icon, label, value, format, tone }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-text-tertiary flex items-center gap-1.5 text-xs">
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} />
        {label}
      </dt>
      <dd>
        <AnimatedNumber
          value={value}
          duration={MONITOR_COUNT_UP_DURATION_MS}
          format={format}
          className={`text-lg leading-none font-semibold tabular-nums ${tone}`}
        />
      </dd>
    </div>
  );
}

/**
 * Итоги сессии — компактной полосой в одну панель.
 *
 * Раньше это были четыре отдельные крупные карточки: они занимали целый экран
 * ради четырёх чисел и визуально спорили с графиками за внимание.
 */
function StatsCounters({ stats }: StatsCountersProps) {
  const { t } = useI18n();
  const packets = (stats?.packetsIn ?? 0) + (stats?.packetsOut ?? 0);

  return (
    <GlassPanel padding="md">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Stat
          icon={ArrowDown}
          label={t("monitor.counters.downloaded")}
          value={stats?.bytesIn ?? 0}
          format={formatBytes}
          tone="text-accent-primary"
        />
        <Stat
          icon={ArrowUp}
          label={t("monitor.counters.uploaded")}
          value={stats?.bytesOut ?? 0}
          format={formatBytes}
          tone="text-accent-secondary"
        />
        <Stat
          icon={Package}
          label={t("monitor.counters.packets")}
          value={packets}
          format={formatCount}
          tone="text-text-primary"
        />
        <Stat
          icon={Network}
          label={t("monitor.counters.connections")}
          value={stats?.connections ?? 0}
          format={(value) => String(Math.round(value))}
          tone="text-text-primary"
        />
      </dl>
    </GlassPanel>
  );
}

export default StatsCounters;
