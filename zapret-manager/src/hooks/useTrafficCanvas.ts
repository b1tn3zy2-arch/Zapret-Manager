import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import {
  MONITOR_LABEL_REFRESH_MS,
  TRAFFIC_AXIS_COLOR,
  TRAFFIC_GRID_COLOR,
} from "@/lib/constants";
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

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  context.lineWidth = 1;

  for (let index = 1; index < HORIZONTAL_LINES; index += 1) {
    const y = Math.round((height / HORIZONTAL_LINES) * index) + 0.5;

    context.strokeStyle = TRAFFIC_GRID_COLOR;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  for (let index = 1; index < VERTICAL_LINES; index += 1) {
    const x = Math.round((width / VERTICAL_LINES) * index) + 0.5;

    context.strokeStyle = TRAFFIC_GRID_COLOR;
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
  context.fillText("сейчас", width - 4, height - 14);
  context.textAlign = "left";
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

    const render = (): void => {
      const raw = pickSeries(buffer.current, dataKey);
      const values = applyEWMA(raw);
      const last = values[values.length - 1] ?? 0;

      valueRef.current = last;
      maxRef.current = computeMax(values, maxRef.current);

      const scale = maxRef.current || 1;
      const step = raw.length > 1 ? width / (raw.length - 1) : width;
      const toY = (value: number): number =>
        height - (Math.min(value, scale) / scale) * height;

      context.clearRect(0, 0, width, height);
      drawGrid(context, width, height);
      drawFrame(context, width, height, scale);

      if (values.length < 2) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      context.beginPath();
      context.moveTo(0, height);
      values.forEach((value, index) => {
        context.lineTo(index * step, toY(value));
      });
      context.lineTo((values.length - 1) * step, height);
      context.closePath();

      const fill = context.createLinearGradient(0, 0, 0, height);
      fill.addColorStop(0, withAlpha(color, 0.32));
      fill.addColorStop(1, withAlpha(color, 0));
      context.fillStyle = fill;
      context.fill();

      context.beginPath();
      values.forEach((value, index) => {
        const x = index * step;
        const y = toY(value);

        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.strokeStyle = color;
      context.lineWidth = 1.6;
      context.lineJoin = "round";
      context.shadowColor = withAlpha(color, paused ? 0 : 0.5);
      context.shadowBlur = paused ? 0 : 8;
      context.stroke();
      context.shadowBlur = 0;

      const endX = (values.length - 1) * step;
      const endY = toY(values[values.length - 1] ?? 0);

      context.beginPath();
      context.arc(endX, endY, 2.6, 0, Math.PI * 2);
      context.fillStyle = color;
      context.fill();

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [buffer, canvasRef, color, dataKey, height, paused, scale]);

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
