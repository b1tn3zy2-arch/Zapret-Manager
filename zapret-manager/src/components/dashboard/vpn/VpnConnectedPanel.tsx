import { ArrowDown, ArrowUp } from "lucide-react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { useI18n } from "@/i18n";
import { TRAFFIC_COLORS } from "@/lib/constants";
import { formatSpeed } from "@/lib/trafficUtils";
import { formatUptime } from "@/lib/vpnUtils";

export interface VpnConnectedPanelProps {
  /** Скорость входящего трафика, байт в секунду. */
  speedIn: number;
  /** Скорость исходящего трафика, байт в секунду. */
  speedOut: number;
  uptimeSec: number | null;
  serverName: string | null;
}

interface SpeedCellProps {
  direction: "in" | "out";
  value: number;
}

/**
 * Панель активного подключения по референсу: входящая скорость, время работы
 * и исходящая скорость в одну строку.
 *
 * Раньше эти данные прятались в подвале под списком серверов мелким шрифтом,
 * где их никто не читал, а кнопка подключения оставалась без контекста.
 */
function SpeedCell({ direction, value }: SpeedCellProps) {
  const { t } = useI18n();
  const color = TRAFFIC_COLORS[direction];
  const Icon = direction === "in" ? ArrowDown : ArrowUp;

  return (
    <div className="flex items-center gap-2">
      <Icon
        aria-hidden="true"
        className="size-4 shrink-0"
        strokeWidth={2.5}
        style={{ color }}
      />
      <span
        className="text-xl leading-none font-bold tabular-nums"
        style={{ color }}
      >
        {formatSpeed(value)}
      </span>
      <span className="sr-only">{t(`monitor.speed.${direction}`)}</span>
    </div>
  );
}

export default function VpnConnectedPanel({
  speedIn,
  speedOut,
  uptimeSec,
  serverName,
}: VpnConnectedPanelProps) {
  const { t } = useI18n();

  return (
    <GlassPanel
      padding="md"
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <SpeedCell direction="in" value={speedIn} />

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-text-secondary text-xs">
          {t("dashboard.vpn.uptime")}
        </span>
        <span className="text-text-primary font-mono text-sm tabular-nums">
          {formatUptime(uptimeSec)}
        </span>
        {serverName === null ? null : (
          <span className="text-text-tertiary max-w-56 truncate text-[11px]">
            {serverName}
          </span>
        )}
      </div>

      <SpeedCell direction="out" value={speedOut} />
    </GlassPanel>
  );
}
