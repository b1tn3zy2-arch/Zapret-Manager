import { useI18n } from "@/i18n";
import { motion } from "framer-motion";
import { Activity, Globe, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CardStats } from "@/types";

interface StatRowProps {
  icon: LucideIcon;
  label: string;
  value: number;
  compact: boolean;
  delay: number;
}

function statColor(value: number): string {
  if (value < 40) {
    return "var(--color-accent-danger)";
  }

  if (value <= 70) {
    return "var(--color-accent-warning)";
  }

  return "var(--color-accent-primary)";
}

function StatRow({ icon: Icon, label, value, compact, delay }: StatRowProps) {
  const color = statColor(value);

  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden="true" className="text-text-tertiary size-3 shrink-0" />

      {!compact ? (
        <span className="text-text-tertiary w-14 shrink-0 text-[10px]">
          {label}
        </span>
      ) : null}

      <span className="bg-glass-hover h-1 min-w-0 flex-1 overflow-hidden rounded-full">
        <motion.span
          className="block h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </span>

      {!compact ? (
        <span
          className="w-6 shrink-0 text-right text-[10px] font-medium tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
      ) : null}
    </div>
  );
}

export interface CardStatsBarsProps {
  stats: CardStats;
  compact?: boolean;
}

function CardStatsBars({ stats, compact = false }: CardStatsBarsProps) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col gap-1.5", compact && "gap-1")}>
      <StatRow
        icon={Zap}
        label={t("strategies.stats.speed")}
        value={stats.speed}
        compact={compact}
        delay={0}
      />
      <StatRow
        icon={Activity}
        label={t("strategies.stats.stability")}
        value={stats.stability}
        compact={compact}
        delay={0.08}
      />
      <StatRow
        icon={Globe}
        label={t("strategies.stats.coverage")}
        value={stats.coverage}
        compact={compact}
        delay={0.16}
      />
    </div>
  );
}

export default CardStatsBars;
