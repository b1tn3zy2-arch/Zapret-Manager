import {
  EWMA_ALPHA,
  TRAFFIC_MAX_HEADROOM,
  TRAFFIC_MIN_SCALE,
} from "@/lib/constants";
import type { TrafficKey, TrafficPoint } from "@/types";

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

function trim(value: string): string {
  return value.replace(/\.?0+$/, "");
}

export function formatBytes(bytes: number): string {
  if (bytes < KB) {
    return `${Math.round(bytes)} Б`;
  }

  if (bytes < MB) {
    return `${trim((bytes / KB).toFixed(1))} КБ`;
  }

  if (bytes < GB) {
    return `${trim((bytes / MB).toFixed(1))} МБ`;
  }

  if (bytes < TB) {
    return `${trim((bytes / GB).toFixed(2))} ГБ`;
  }

  return `${trim((bytes / TB).toFixed(2))} ТБ`;
}

export function formatCount(value: number): string {
  if (value < KB) {
    return String(Math.round(value));
  }

  if (value < MB) {
    return `${trim((value / KB).toFixed(1))} тыс.`;
  }

  if (value < GB) {
    return `${trim((value / MB).toFixed(2))} млн`;
  }

  return `${trim((value / GB).toFixed(2))} млрд`;
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/с`;
}

export function applyEWMA(
  values: readonly number[],
  alpha = EWMA_ALPHA
): number[] {
  const smoothed: number[] = [];
  let previous = values[0] ?? 0;

  for (const value of values) {
    previous = alpha * value + (1 - alpha) * previous;
    smoothed.push(previous);
  }

  return smoothed;
}

export function computeMax(
  values: readonly number[],
  previousMax: number,
  headroom = TRAFFIC_MAX_HEADROOM
): number {
  const peak = values.reduce((top, value) => Math.max(top, value), 0);
  const target = Math.max(peak * headroom, TRAFFIC_MIN_SCALE);

  if (target >= previousMax) {
    return target;
  }

  const decay = Math.max(previousMax * 0.94, TRAFFIC_MIN_SCALE);

  return Math.max(target, decay);
}

export function pickSeries(
  buffer: readonly TrafficPoint[],
  key: TrafficKey
): number[] {
  return buffer.map((point) => point[key]);
}

export function buildTrafficPoint(stats: {
  speedIn: number;
  speedOut: number;
  timestamp: number;
}): TrafficPoint {
  return {
    timestamp: stats.timestamp,
    in: stats.speedIn,
    out: stats.speedOut,
  };
}
