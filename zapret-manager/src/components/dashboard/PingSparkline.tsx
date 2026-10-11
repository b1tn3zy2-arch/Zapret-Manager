import { useEffect, useMemo, useRef } from "react";

import { useMotionPreference } from "@/hooks/useMotionPreference";
import { useI18n } from "@/i18n";
import {
  CHART_PULSE_PERIOD_MS,
  CHART_SMOOTH_TENSION,
  PING_HISTORY_SIZE,
  PING_INTERVAL_MS,
  SPARKLINE_HEIGHT,
} from "@/lib/constants";
import { getPingColor, type PingPoint } from "@/lib/pingUtils";
import { buildAreaPath, buildSmoothPath } from "@/lib/smoothPath";
import { cn } from "@/lib/utils";

export interface PingSparklineProps {
  points: PingPoint[];
  height?: number;
  capacity?: number;
  className?: string;
}

const ENDPOINT_RADIUS = 2.6;
const Y_PADDING = 2;

function withAlpha(color: string, alpha: number): string {
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);

  if (rgbMatch !== null) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
  }

  const normalized = color.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  if (normalized.length !== 6 || Number.isNaN(value)) {
    return color;
  }

  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function PingSparkline({
  points,
  height = SPARKLINE_HEIGHT,
  capacity = PING_HISTORY_SIZE,
  className,
}: PingSparklineProps) {
  const { t } = useI18n();
  const { reduced: reducedMotion } = useMotionPreference();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef(points);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  const hasData = useMemo(
    () =>
      points.filter((point) => point.success && point.latencyMs !== null)
        .length >= 2,
    [points]
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas === null) {
      return;
    }

    const context = canvas.getContext("2d");

    if (context === null) {
      return;
    }

    let frame = 0;
    let width = 0;
    const ratio = window.devicePixelRatio || 1;

    const resize = (): void => {
      width = Math.max(canvas.clientWidth, 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (): void => {
      const source = pointsRef.current;
      const head = source[source.length - 1];
      const headMs = head?.timestamp ?? Date.now();
      const elapsed = Math.min(
        Math.max(Date.now() - headMs, 0),
        PING_INTERVAL_MS * capacity
      );
      const step = width / (Math.max(capacity, 2) - 1);

      context.clearRect(0, 0, width, height);

      const values: number[] = [];

      for (const point of source) {
        if (point.success && point.latencyMs !== null) {
          values.push(point.latencyMs);
        }
      }

      if (values.length >= 2) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const average =
          values.reduce((sum, value) => sum + value, 0) / values.length;
        const span = Math.max(max - min, Math.max(average * 0.35, 24));
        const top = (min + max) / 2 + span / 2;
        const bottom = top - span;
        const usable = height - Y_PADDING * 2;
        const toY = (value: number): number =>
          Y_PADDING +
          usable -
          ((Math.min(Math.max(value, bottom), top) - bottom) / span) * usable;

        let segment: { x: number; y: number }[] = [];
        let segmentColor = "";
        let lastPoint: { x: number; y: number; color: string } | null = null;

        const flush = (): void => {
          if (segment.length >= 2) {
            const area = new Path2D(
              buildAreaPath(segment, height, CHART_SMOOTH_TENSION)
            );
            const line = new Path2D(
              buildSmoothPath(segment, CHART_SMOOTH_TENSION)
            );
            const fill = context.createLinearGradient(0, 0, 0, height);
            fill.addColorStop(0, withAlpha(segmentColor, 0.3));
            fill.addColorStop(1, withAlpha(segmentColor, 0));
            context.fillStyle = fill;
            context.fill(area);
            context.strokeStyle = segmentColor;
            context.lineWidth = 1.5;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke(line);
          }

          segment = [];
        };

        for (const point of source) {
          if (!point.success || point.latencyMs === null) {
            flush();
            continue;
          }

          const x =
            width -
            ((elapsed + (headMs - point.timestamp)) / PING_INTERVAL_MS) * step;

          if (x < -step * 2) {
            continue;
          }

          const entry = { x, y: toY(point.latencyMs) };

          segment.push(entry);
          segmentColor = getPingColor(point.latencyMs);
          lastPoint = { ...entry, color: segmentColor };
        }

        flush();

        if (lastPoint !== null) {
          const pulse = reducedMotion
            ? 1
            : 1 +
              Math.sin(
                (performance.now() / CHART_PULSE_PERIOD_MS) * Math.PI * 2
              ) *
                0.25;

          context.beginPath();
          context.arc(
            lastPoint.x,
            lastPoint.y,
            ENDPOINT_RADIUS * pulse,
            0,
            Math.PI * 2
          );
          context.fillStyle = lastPoint.color;
          context.fill();
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [capacity, height, reducedMotion]);

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <canvas ref={canvasRef} aria-hidden="true" className="block size-full" />

      {hasData ? null : (
        <div className="border-glass-border absolute inset-0 flex items-center justify-center rounded border border-dashed">
          <span className="text-text-tertiary text-[10px]">
            {t("common.noData")}
          </span>
        </div>
      )}
    </div>
  );
}

export default PingSparkline;
