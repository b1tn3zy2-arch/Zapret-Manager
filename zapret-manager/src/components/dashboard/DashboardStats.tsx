import { AlertTriangle, Clock, Layers, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { useErrorsCount } from "@/stores/selectors/useLogSelectors";
import { useStrategiesStore } from "@/stores/useStrategiesStore";

export interface DashboardStatsProps {
  uptime: string;
}

interface MetricCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  tone: string;
}

function MetricCard({ icon: Icon, value, label, tone }: MetricCardProps) {
  return (
    <GlassPanel
      variant="interactive"
      padding="md"
      className="flex flex-col gap-1"
    >
      <span className={`flex items-center gap-2 ${tone}`}>
        <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
        <span className="text-2xl font-bold tabular-nums">{value}</span>
      </span>
      <span className="text-text-secondary text-xs">{label}</span>
    </GlassPanel>
  );
}

function DashboardStats({ uptime }: DashboardStatsProps) {
  const strategies = useStrategiesStore((state) => state.strategies);
  const errorsCount = useErrorsCount();

  const activeCount = strategies.filter(
    (strategy) =>
      strategy.status === "running" || strategy.status === "starting"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard
        icon={Layers}
        value={String(strategies.length)}
        label="Всего стратегий"
        tone="text-text-primary"
      />
      <MetricCard
        icon={Zap}
        value={String(activeCount)}
        label="Активных"
        tone="text-accent-primary"
      />
      <MetricCard
        icon={AlertTriangle}
        value={String(errorsCount)}
        label="Ошибок за сессию"
        tone="text-accent-danger"
      />
      <MetricCard
        icon={Clock}
        value={uptime}
        label="Время работы"
        tone="text-accent-secondary"
      />
    </div>
  );
}

export default DashboardStats;
