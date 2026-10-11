import {
  EWMA_ALPHA,
  TRAFFIC_MAX_HEADROOM,
  TRAFFIC_MIN_SCALE,
} from "@/lib/constants";
import { currentLanguage } from "@/lib/format";
import type { TrafficKey, TrafficPoint } from "@/types";

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

const BYTE_UNITS = {
  ru: ["Б", "КБ", "МБ", "ГБ", "ТБ"],
  en: ["B", "KB", "MB", "GB", "TB"],
} as const;

const COUNT_UNITS = {
  ru: ["тыс.", "млн", "млрд"],
  en: ["K", "M", "B"],
} as const;

const SPEED_SUFFIX = { ru: "/с", en: "/s" } as const;

function trim(value: string): string {
  return value.replace(/\.?0+$/, "");
}

export function formatBytes(bytes: number): string {
  const units = BYTE_UNITS[currentLanguage()];

  if (bytes < KB) {
    return `${Math.round(bytes)} ${units[0]}`;
  }

  if (bytes < MB) {
    return `${trim((bytes / KB).toFixed(1))} ${units[1]}`;
  }

  if (bytes < GB) {
    return `${trim((bytes / MB).toFixed(1))} ${units[2]}`;
  }

  if (bytes < TB) {
    return `${trim((bytes / GB).toFixed(2))} ${units[3]}`;
  }

  return `${trim((bytes / TB).toFixed(2))} ${units[4]}`;
}

export function formatCount(value: number): string {
  const units = COUNT_UNITS[currentLanguage()];

  if (value < KB) {
    return String(Math.round(value));
  }

  if (value < MB) {
    return `${trim((value / KB).toFixed(1))} ${units[0]}`;
  }

  if (value < GB) {
    return `${trim((value / MB).toFixed(2))} ${units[1]}`;
  }

  return `${trim((value / GB).toFixed(2))} ${units[2]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}${SPEED_SUFFIX[currentLanguage()]}`;
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
