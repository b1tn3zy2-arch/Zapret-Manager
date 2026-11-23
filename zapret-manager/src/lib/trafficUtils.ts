// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт EWMA_ALPHA.
  EWMA_ALPHA,
  // Подключаем именованный импорт TRAFFIC_MAX_HEADROOM.
  TRAFFIC_MAX_HEADROOM,
  // Подключаем именованный импорт TRAFFIC_MIN_SCALE.
  TRAFFIC_MIN_SCALE,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/format.
import { currentLanguage } from "@/lib/format";
// Импортируем зависимости из модуля @/types.
import type { TrafficKey, TrafficPoint } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KB = 1024.
const KB = 1024;
// Обрабатываем конструкцию: const MB = KB * 1024.
const MB = KB * 1024;
// Обрабатываем конструкцию: const GB = MB * 1024.
const GB = MB * 1024;
// Обрабатываем конструкцию: const TB = GB * 1024.
const TB = GB * 1024;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const BYTE_UNITS = { ru: [Б, КБ, МБ, ГБ, ТБ], en: [B, K….
const BYTE_UNITS = {
  // Обрабатываем конструкцию: ru.
  ru: ["Б", "КБ", "МБ", "ГБ", "ТБ"],
  // Обрабатываем конструкцию: en.
  en: ["B", "KB", "MB", "GB", "TB"],
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const COUNT_UNITS = { ru: [тыс., млн, млрд], en: [K, M,….
const COUNT_UNITS = {
  // Обрабатываем конструкцию: ru.
  ru: ["тыс.", "млн", "млрд"],
  // Обрабатываем конструкцию: en.
  en: ["K", "M", "B"],
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SPEED_SUFFIX = { ru: /с, en: /s } as const.
const SPEED_SUFFIX = { ru: "/с", en: "/s" } as const;
// — разделитель логических блоков —

// Объявляем функцию trim.
function trim(value: string): string {
  // Возвращаем результат: value.replace(/\.?0+$/, ).
  return value.replace(/\.?0+$/, "");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatBytes(bytes: number): string {
  // Обрабатываем конструкцию: const units = BYTE_UNITS[currentLanguage()].
  const units = BYTE_UNITS[currentLanguage()];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: bytes < KB.
  if (bytes < KB) {
    // Возвращаем результат: ${Math.round(bytes)} ${units[0]}.
    return `${Math.round(bytes)} ${units[0]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: bytes < MB.
  if (bytes < MB) {
    // Возвращаем результат: ${trim((bytes / KB).toFixed(1))} ${units[1]}.
    return `${trim((bytes / KB).toFixed(1))} ${units[1]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: bytes < GB.
  if (bytes < GB) {
    // Возвращаем результат: ${trim((bytes / MB).toFixed(1))} ${units[2]}.
    return `${trim((bytes / MB).toFixed(1))} ${units[2]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: bytes < TB.
  if (bytes < TB) {
    // Возвращаем результат: ${trim((bytes / GB).toFixed(2))} ${units[3]}.
    return `${trim((bytes / GB).toFixed(2))} ${units[3]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ${trim((bytes / TB).toFixed(2))} ${units[4]}.
  return `${trim((bytes / TB).toFixed(2))} ${units[4]}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatCount(value: number): string {
  // Обрабатываем конструкцию: const units = COUNT_UNITS[currentLanguage()].
  const units = COUNT_UNITS[currentLanguage()];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: value < KB.
  if (value < KB) {
    // Возвращаем результат: String(Math.round(value)).
    return String(Math.round(value));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: value < MB.
  if (value < MB) {
    // Возвращаем результат: ${trim((value / KB).toFixed(1))} ${units[0]}.
    return `${trim((value / KB).toFixed(1))} ${units[0]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: value < GB.
  if (value < GB) {
    // Возвращаем результат: ${trim((value / MB).toFixed(2))} ${units[1]}.
    return `${trim((value / MB).toFixed(2))} ${units[1]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ${trim((value / GB).toFixed(2))} ${units[2]}.
  return `${trim((value / GB).toFixed(2))} ${units[2]}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatSpeed(bytesPerSecond: number): string {
  // Возвращаем результат: ${formatBytes(bytesPerSecond)}${SPEED_SUFFIX[currentLan….
  return `${formatBytes(bytesPerSecond)}${SPEED_SUFFIX[currentLanguage()]}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function applyEWMA(
  // Обрабатываем конструкцию: values.
  values: readonly number[],
  // Обрабатываем конструкцию: alpha.
  alpha = EWMA_ALPHA
  // Закрываем выражение или список аргументов.
): number[] {
  // Обрабатываем конструкцию: const smoothed: number[] = [].
  const smoothed: number[] = [];
  // Обрабатываем конструкцию: let previous = values[0] ?? 0.
  let previous = values[0] ?? 0;
  // — разделитель логических блоков —

  // Перебираем элементы коллекции values.
  for (const value of values) {
    // Обрабатываем конструкцию: previous.
    previous = alpha * value + (1 - alpha) * previous;
    // Обрабатываем конструкцию: smoothed.
    smoothed.push(previous);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: smoothed.
  return smoothed;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function computeMax(
  // Обрабатываем конструкцию: values.
  values: readonly number[],
  // Обрабатываем конструкцию: previousMax.
  previousMax: number,
  // Обрабатываем конструкцию: headroom.
  headroom = TRAFFIC_MAX_HEADROOM
  // Закрываем выражение или список аргументов.
): number {
  // Обрабатываем конструкцию: const peak = values.reduce((top, value) => Math.max(top….
  const peak = values.reduce((top, value) => Math.max(top, value), 0);
  // Обрабатываем конструкцию: const target = Math.max(peak * headroom, TRAFFIC_MIN_SC….
  const target = Math.max(peak * headroom, TRAFFIC_MIN_SCALE);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: target >= previousMax.
  if (target >= previousMax) {
    // Возвращаем результат: target.
    return target;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const decay = Math.max(previousMax * 0.94, TRAFFIC_MIN_….
  const decay = Math.max(previousMax * 0.94, TRAFFIC_MIN_SCALE);
  // — разделитель логических блоков —

  // Возвращаем результат: Math.max(target, decay).
  return Math.max(target, decay);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function pickSeries(
  // Обрабатываем конструкцию: buffer.
  buffer: readonly TrafficPoint[],
  // Обрабатываем конструкцию: key.
  key: TrafficKey
  // Закрываем выражение или список аргументов.
): number[] {
  // Возвращаем результат: buffer.map((point) => point[key]).
  return buffer.map((point) => point[key]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildTrafficPoint(stats: {
  // Обрабатываем конструкцию: speedIn.
  speedIn: number;
  // Обрабатываем конструкцию: speedOut.
  speedOut: number;
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Закрываем текущий блок.
}): TrafficPoint {
  // Возвращаем результат: { timestamp: stats.timestamp, in: stats.speedIn, out: s….
  return {
    // Обрабатываем конструкцию: timestamp.
    timestamp: stats.timestamp,
    // Обрабатываем конструкцию: in.
    in: stats.speedIn,
    // Обрабатываем конструкцию: out.
    out: stats.speedOut,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
