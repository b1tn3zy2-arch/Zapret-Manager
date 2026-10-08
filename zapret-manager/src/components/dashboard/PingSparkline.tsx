import { useId, useMemo } from "react";

import { SPARKLINE_HEIGHT, SPARKLINE_WIDTH } from "@/lib/constants";
import {
  buildSparklineFill,
  buildSparklinePath,
  getPingColor,
  type PingPoint,
} from "@/lib/pingUtils";

export interface PingSparklineProps {
  points: PingPoint[];
  width?: number;
  height?: number;
}

function PingSparkline({
  points,
  width = SPARKLINE_WIDTH,
  height = SPARKLINE_HEIGHT,
}: PingSparklineProps) {
  const gradientId = useId();

  const { line, fill, color } = useMemo(() => {
    const last = points[points.length - 1];

    return {
      line: buildSparklinePath(points, width, height),
      fill: buildSparklineFill(points, width, height),
      color: getPingColor(last?.latencyMs ?? null),
    };
  }, [points, width, height]);

  if (line === "") {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center rounded border border-dashed border-white/5"
      >
        <span className="text-text-tertiary text-[10px]">нет данных</span>
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
    </svg>
  );
}

export default PingSparkline;
