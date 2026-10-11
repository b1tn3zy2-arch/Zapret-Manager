import { translateKey } from "@/i18n/core";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useMotionPreference } from "@/hooks/useMotionPreference";
import {
  CHART_PULSE_PERIOD_MS,
  CHART_SMOOTH_TENSION,
  MONITOR_LABEL_REFRESH_MS,
  TRAFFIC_AXIS_COLOR,
  TRAFFIC_GRID_COLOR_DARK,
  TRAFFIC_GRID_COLOR_LIGHT,
  TRAFFIC_GRID_VERTICAL_DARK,
  TRAFFIC_GRID_VERTICAL_LIGHT,
} from "@/lib/constants";
import { buildAreaPath, buildSmoothPath } from "@/lib/smoothPath";
import { applyEWMA, computeMax, pickSeries } from "@/lib/trafficUtils";
import type { TrafficKey, TrafficPoint } from "@/types";

import { useDpiScale } from "./useDpiChange";

export interface UseTrafficCanvasOptions {
  buffer: RefObject<TrafficPoint[]>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  dataKey: TrafficKey;
  color: string;
  height: number;
  paused: boolean;
}

export interface UseTrafficCanvasResult {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  currentValue: number;
}

const HORIZONTAL_LINES = 4;
const VERTICAL_LINES = 5;

function withAlpha(color: string, alpha: number): string {
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

function isLightTheme(): boolean {
  return document.documentElement.dataset.theme === "light";
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const light = isLightTheme();
  const horizontal = light ? TRAFFIC_GRID_COLOR_LIGHT : TRAFFIC_GRID_COLOR_DARK;
  const vertical = light
    ? TRAFFIC_GRID_VERTICAL_LIGHT
    : TRAFFIC_GRID_VERTICAL_DARK;

  context.lineWidth = 1;

  for (let index = 1; index < HORIZONTAL_LINES; index += 1) {
    const y = Math.round((height / HORIZONTAL_LINES) * index) + 0.5;

    context.strokeStyle = horizontal;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  for (let index = 1; index < VERTICAL_LINES; index += 1) {
    const x = Math.round((width / VERTICAL_LINES) * index) + 0.5;

    context.strokeStyle = vertical;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
}

function drawFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxValue: number
): void {
  context.font = "10px Inter, sans-serif";
  context.textBaseline = "top";
  context.fillStyle = TRAFFIC_AXIS_COLOR;
  context.fillText(`${Math.round(maxValue)}`, 4, 4);
  context.fillText("0", 4, height - 14);
  context.textAlign = "right";
  context.fillText(
    translateKey("trafficMonitor.nowLabel"),
    width - 4,
    height - 14
  );
  context.textAlign = "left";
}

function drawEndpoint(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  animate: boolean
): void {
  const pulse = animate
    ? 1 +
      Math.sin((performance.now() / CHART_PULSE_PERIOD_MS) * Math.PI * 2) * 0.2
    : 1;

  context.beginPath();
  context.arc(x, y, 3.2 * pulse, 0, Math.PI * 2);
  context.fillStyle = color;
  context.shadowColor = color;
  context.shadowBlur = animate ? 12 : 0;
  context.fill();
  context.shadowBlur = 0;
}

export function useTrafficCanvas({
  buffer,
  canvasRef,
  dataKey,
  color,
  height,
  paused,
}: UseTrafficCanvasOptions): UseTrafficCanvasResult {
  const maxRef = useRef(0);
  const valueRef = useRef(0);
  const [currentValue, setCurrentValue] = useState(0);
  const scale = useDpiScale();
  const { reduced: reducedMotion } = useMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas === null) {
      return;
    }

    const context = canvas.getContext("2d");

    if (context === null) {
      return;
    }

    let width = 0;
    let frame = 0;

    const resize = (): void => {
      const ratio = scale;
      const next = Math.max(canvas.clientWidth, 1);

      width = next;
      canvas.width = Math.round(next * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    let tail = 0;
    let tailReady = false;

    const render = (): void => {
      const raw = pickSeries(buffer.current, dataKey);
      const values = applyEWMA(raw);
      const last = values[values.length - 1] ?? 0;

      if (!tailReady) {
        tail = last;
        tailReady = true;
      } else {
        tail += (last - tail) * 0.3;
      }

      if (values.length > 1) {
        values[values.length - 1] = tail;
      }

      valueRef.current = last;
      maxRef.current = computeMax(values, maxRef.current);

      const scaleValue = maxRef.current || 1;
      const step = raw.length > 1 ? width / (raw.length - 1) : width;
      const toY = (value: number): number =>
        height - (Math.min(value, scaleValue) / scaleValue) * height;

      context.clearRect(0, 0, width, height);
      drawGrid(context, width, height);
      drawFrame(context, width, height, scaleValue);

      if (values.length < 2) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      const points = values.map((value, index) => ({
        x: index * step,
        y: toY(value),
      }));

      const areaPath = new Path2D(
        buildAreaPath(points, height, CHART_SMOOTH_TENSION)
      );
      const linePath = new Path2D(
        buildSmoothPath(points, CHART_SMOOTH_TENSION)
      );

      const fill = context.createLinearGradient(0, 0, 0, height);
      fill.addColorStop(0, withAlpha(color, 0.32));
      fill.addColorStop(0.5, withAlpha(color, 0.12));
      fill.addColorStop(1, withAlpha(color, 0));
      context.fillStyle = fill;
      context.fill(areaPath);

      context.strokeStyle = color;
      context.lineWidth = 1.6;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.shadowColor = withAlpha(color, paused ? 0 : 0.5);
      context.shadowBlur = paused ? 0 : 8;
      context.stroke(linePath);
      context.shadowBlur = 0;

      const lastPoint = points[points.length - 1];

      if (lastPoint !== undefined) {
        drawEndpoint(
          context,
          lastPoint.x,
          lastPoint.y,
          color,
          !paused && !reducedMotion
        );
      }

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [buffer, canvasRef, color, dataKey, height, paused, reducedMotion, scale]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentValue(valueRef.current);
    }, MONITOR_LABEL_REFRESH_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return { canvasRef, currentValue };
}
