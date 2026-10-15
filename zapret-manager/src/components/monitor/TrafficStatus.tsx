import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { Badge } from "@/components/ui";
import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { MONITOR_STALL_THRESHOLD_MS, TRAFFIC_COLORS } from "@/lib/constants";
import { formatSpeed } from "@/lib/trafficUtils";
import type { MonitorState, NetworkStats, Strategy } from "@/types";

export interface TrafficStatusProps {
  stats: NetworkStats | null;
  isPaused: boolean;
  error: string | null;
  activeStrategy: Strategy | undefined;
}

const STATUS_VIEW = {
  background: {
    labelKey: "monitor.status.background",
    variant: "neutral",
    hintKey: "monitor.status.backgroundHint",
  },
  active: {
    labelKey: "monitor.status.active",
    variant: "success",
    hintKey: "monitor.status.activeHint",
  },
  stalled: {
    labelKey: "monitor.status.stalled",
    variant: "warning",
    hintKey: "monitor.status.stalledHint",
  },
  error: {
    labelKey: "monitor.status.error",
    variant: "error",
    hintKey: "monitor.status.errorHint",
  },
} as const satisfies Record<
  MonitorState,
  {
    labelKey: TranslationKey;
    variant: "neutral" | "success" | "warning" | "error";
    hintKey: TranslationKey;
  }
>;

function useStalled(stats: NetworkStats | null): boolean {
  const lastTrafficRef = useRef(0);
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    const speed = (stats?.speedIn ?? 0) + (stats?.speedOut ?? 0);

    if (speed > 0) {
      lastTrafficRef.current = Date.now();
    }
  }, [stats]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (lastTrafficRef.current === 0) {
        lastTrafficRef.current = Date.now();
      }

      setStalled(
        Date.now() - lastTrafficRef.current > MONITOR_STALL_THRESHOLD_MS
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return stalled;
}

interface LiveSpeedProps {
  readonly direction: "in" | "out";
  readonly value: number;
  readonly label: string;
}

function LiveSpeed({ direction, value, label }: LiveSpeedProps) {
  const color = TRAFFIC_COLORS[direction];
  const Icon = direction === "in" ? ArrowDown : ArrowUp;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="flex items-center gap-1.5 text-xs font-medium">
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
        <span className="text-text-tertiary">{label}</span>
      </span>
      <span
        className="text-2xl leading-none font-bold tabular-nums"
        style={{ color }}
      >
        {formatSpeed(value)}
      </span>
    </div>
  );
}

/**
 * Верхняя панель монитора: состояние обхода слева, текущие скорости справа.
 *
 * Раньше здесь была одна суммарная цифра «0 Б/с», из-за которой нельзя было
 * понять, куда именно уходит трафик, а подпись занимала целую строку.
 */
function TrafficStatus({
  stats,
  isPaused,
  error,
  activeStrategy,
}: TrafficStatusProps) {
  const { t } = useI18n();
  const stalled = useStalled(stats);
  const isRunning = activeStrategy?.status === "running";

  const state: MonitorState =
    error !== null
      ? "error"
      : isPaused
        ? "background"
        : isRunning && stalled
          ? "stalled"
          : isRunning
            ? "active"
            : "background";

  const view = STATUS_VIEW[state];

  return (
    <GlassPanel padding="md" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={view.variant} pulse={state === "active"}>
              {t(view.labelKey)}
            </Badge>
            {isPaused ? (
              <Badge variant="warning">{t("common.pause")}</Badge>
            ) : null}
            {activeStrategy !== undefined && isRunning ? (
              <span className="text-text-secondary truncate text-xs">
                {activeStrategy.name}
              </span>
            ) : null}
          </div>
          <span className="text-text-tertiary text-xs">{t(view.hintKey)}</span>
        </div>

        <div className="flex items-start gap-6">
          <LiveSpeed
            direction="in"
            value={stats?.speedIn ?? 0}
            label={t("monitor.speed.in")}
          />
          <LiveSpeed
            direction="out"
            value={stats?.speedOut ?? 0}
            label={t("monitor.speed.out")}
          />
        </div>
      </div>
    </GlassPanel>
  );
}

export default TrafficStatus;
