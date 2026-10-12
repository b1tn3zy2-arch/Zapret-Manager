import { memo } from "react";

import PingSparkline from "@/components/dashboard/PingSparkline";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { usePing } from "@/hooks/usePing";
import { PING_HISTORY_SIZE, PING_HOSTS } from "@/lib/constants";
import { formatPing, getPingColor, lastLatency } from "@/lib/pingUtils";
import { cn } from "@/lib/utils";

function DashboardPing() {
  const { t } = useI18n();
  const { history } = usePing();

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-5">
      <h3 className="text-text-primary flex items-center gap-2 text-base font-semibold">
        <span
          aria-hidden="true"
          className="bg-accent-primary inline-block size-1.5 rounded-full"
        />
        {t("dashboard.ping.title")}
      </h3>

      <div className="flex flex-col gap-1">
        {PING_HOSTS.map(({ host, label }) => {
          const points = history[host] ?? [];
          const latency = lastLatency(points);
          const color = getPingColor(latency);
          const quality = Math.min(
            Math.max(points.length / PING_HISTORY_SIZE, 0),
            1
          );

          return (
            <div
              key={host}
              className={cn(
                "hover:bg-glass-hover/40 grid items-center gap-4 rounded-lg",
                "px-2 py-2.5 transition-colors duration-200",
                "grid-cols-[104px_1fr_68px]"
              )}
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-text-primary truncate text-sm font-medium">
                  {label}
                </span>
                <span className="text-text-tertiary truncate text-[11px]">
                  {host}
                </span>
              </div>

              <div className="relative min-w-0">
                <PingSparkline points={points} height={34} />
                <span
                  aria-hidden="true"
                  className="bg-glass-border absolute inset-x-0 -bottom-1 h-px opacity-40"
                  style={{
                    transform: `scaleX(${quality.toFixed(3)})`,
                    transformOrigin: "right",
                  }}
                />
              </div>

              <span
                className="text-right text-sm font-semibold tabular-nums"
                style={{ color }}
              >
                {formatPing(latency)}
              </span>
            </div>
          );
        })}
      </div>

      <Text variant="caption" size="sm" className="text-text-tertiary">
        {t("dashboard.ping.hint")}
      </Text>
    </GlassPanel>
  );
}

const MemoDashboardPing = memo(DashboardPing);

export default MemoDashboardPing;
