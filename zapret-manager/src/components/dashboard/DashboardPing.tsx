import { memo } from "react";

import PingSparkline from "@/components/dashboard/PingSparkline";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { usePing } from "@/hooks/usePing";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { PING_HISTORY_SIZE, PING_HOSTS } from "@/lib/constants";
import {
  formatPing,
  getPingColor,
  lastLatency,
  type PingPoint,
} from "@/lib/pingUtils";
import { cn } from "@/lib/utils";

/**
 * Панель пинга до сервисов.
 *
 * Две компоновки:
 * - при включённых логах — строки на всю ширину панели: графику есть место,
 *   чтобы читаться, и он не теряется в узкой колонке сетки;
 * - при выключенных логах блок логов исчезает, и панель автоматически
 *   переходит в компактные карточки в один ряд — она занимает освободившееся
 *   место и не остаётся растянутой пустотой.
 */
function DashboardPing() {
  const { t } = useI18n();
  const { history } = usePing();
  const logsEnabled = useSettingsStore(
    (state) => state.settings.general.enableLogs
  );

  const rows = PING_HOSTS.map(({ host, label }) => {
    const points = history[host] ?? [];
    const latency = lastLatency(points);

    return {
      host,
      label,
      points,
      latency,
      color: getPingColor(latency),
      quality: Math.min(Math.max(points.length / PING_HISTORY_SIZE, 0), 1),
    };
  });

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-text-primary flex items-center gap-2 text-base font-semibold">
          <span
            aria-hidden="true"
            className="bg-accent-primary inline-block size-1.5 animate-pulse rounded-full"
          />
          {t("dashboard.ping.title")}
        </h3>

        <Text variant="caption" className="text-text-tertiary">
          {logsEnabled
            ? t("dashboard.ping.hint")
            : t("dashboard.ping.hintCompact")}
        </Text>
      </div>

      <div
        className={cn(
          "grid gap-2",
          logsEnabled
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {rows.map((row) =>
          logsEnabled ? (
            <PingRowWide key={row.host} {...row} />
          ) : (
            <PingRowCompact key={row.host} {...row} />
          )
        )}
      </div>
    </GlassPanel>
  );
}

interface PingRowBase {
  host: string;
  label: string;
  points: PingPoint[];
  latency: number | null;
  color: string;
  quality: number;
}

function PingRowWide({
  host,
  label,
  points,
  latency,
  color,
  quality,
}: PingRowBase) {
  return (
    <div
      data-ping-host={host}
      className={cn(
        "hover:bg-glass-hover/40 grid items-center gap-5 rounded-lg px-3 py-3",
        "transition-colors duration-200",
        "grid-cols-[minmax(96px,150px)_1fr_minmax(64px,auto)]"
      )}
    >
      <div className="flex min-w-0 flex-col">
        <span className="text-text-primary truncate text-sm font-medium">
          {label}
        </span>
        <span className="text-text-tertiary truncate text-[11px]">{host}</span>
      </div>

      <div className="relative min-w-0">
        <PingSparkline points={points} height={40} />
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
}

function PingRowCompact({ host, label, points, latency, color }: PingRowBase) {
  return (
    <div
      data-ping-host={host}
      className={cn(
        "bg-bg-primary/40 border-glass-border flex flex-col gap-2 rounded-xl border px-3 py-3",
        "transition-colors duration-200"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-text-primary truncate text-sm font-medium">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {formatPing(latency)}
        </span>
      </div>

      <span className="text-text-tertiary truncate text-[11px]">{host}</span>

      <PingSparkline points={points} height={28} />
    </div>
  );
}

const MemoDashboardPing = memo(DashboardPing);

export default MemoDashboardPing;
