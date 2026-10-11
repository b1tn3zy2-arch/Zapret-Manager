import { memo } from "react";
import PingSparkline from "@/components/dashboard/PingSparkline";
import { Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useI18n } from "@/i18n";
import { usePing } from "@/hooks/usePing";
import { PING_HOSTS } from "@/lib/constants";
import { formatPing, getPingColor, lastLatency } from "@/lib/pingUtils";

function DashboardPing() {
  const { t } = useI18n();
  const { history } = usePing();

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-4">
      <h3 className="text-text-primary text-base font-semibold">
        {t("dashboard.ping.title")}
      </h3>

      <div className="flex flex-col gap-3">
        {PING_HOSTS.map(({ host, label }) => {
          const points = history[host] ?? [];
          const latency = lastLatency(points);

          return (
            <div key={host} className="flex items-center justify-between gap-3">
              <div className="flex w-20 shrink-0 flex-col">
                <span className="text-text-secondary text-sm">{label}</span>
                <span className="text-text-tertiary truncate text-[10px]">
                  {host}
                </span>
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <PingSparkline points={points} />
              </div>

              <span
                className="w-16 shrink-0 text-right font-mono text-sm tabular-nums"
                style={{ color: getPingColor(latency) }}
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
