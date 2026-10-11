import { useId, useMemo } from "react";
import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import { useI18n } from "@/i18n";
import {
  CHART_PULSE_PERIOD_MS,
  SPARKLINE_HEIGHT,
  SPARKLINE_WIDTH,
} from "@/lib/constants";
import {
  buildSparklineFill,
  buildSparklinePath,
  getPingColor,
  lastSparklinePoint,
  type PingPoint,
} from "@/lib/pingUtils";

export interface PingSparklineProps {
  points: PingPoint[];
  width?: number;
  height?: number;
}

const ENDPOINT_RADIUS = 2.6;
const ENDPOINT_PULSE_SCALE = 1.5;

function PingSparkline({
  points,
  width = SPARKLINE_WIDTH,
  height = SPARKLINE_HEIGHT,
}: PingSparklineProps) {
  const { t } = useI18n();
  const gradientId = useId();
  const reducedMotion = usePrefersReducedMotion();

  const { line, fill, color, endpoint } = useMemo(() => {
    const last = points[points.length - 1];

    return {
      line: buildSparklinePath(points, width, height),
      fill: buildSparklineFill(points, width, height),
      color: getPingColor(last?.latencyMs ?? null),
      endpoint: lastSparklinePoint(points, width, height),
    };
  }, [points, width, height]);

  if (line === "") {
    return (
      <div
        style={{ width, height }}
        className="border-glass-border flex items-center justify-center rounded border border-dashed"
      >
        <span className="text-text-tertiary text-[10px]">
          {t("common.noData")}
        </span>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      <path d={fill} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ willChange: "d" }}
      />

      {endpoint !== null ? (
        <motion.circle
          cx={endpoint.x}
          cy={endpoint.y}
          r={ENDPOINT_RADIUS}
          fill={color}
          {...(reducedMotion
            ? {}
            : {
                animate: {
                  scale: [1, ENDPOINT_PULSE_SCALE, 1],
                  opacity: [1, 0.6, 1],
                },
                transition: {
                  duration: CHART_PULSE_PERIOD_MS / 1000,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                },
              })}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ) : null}
    </svg>
  );
}

export default PingSparkline;
