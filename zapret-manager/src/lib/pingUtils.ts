// Импортируем зависимости из модуля @/lib/constants.
import { CHART_SMOOTH_TENSION } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/format.
import { currentLanguage } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/smoothPath.
import { buildSmoothPath, type SmoothPathPoint } from "@/lib/smoothPath";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface PingPoint {
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Обрабатываем конструкцию: latencyMs.
  latencyMs: number | null;
  // Обрабатываем конструкцию: success.
  success: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const GOOD_MS = 50.
const GOOD_MS = 50;
// Обрабатываем конструкцию: const FAIR_MS = 150.
const FAIR_MS = 150;
// Обрабатываем конструкцию: const SPARKLINE_PADDING = 2.
const SPARKLINE_PADDING = 2;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function getPingColor(latencyMs: number | null): string {
  // Проверяем бизнес-условие: latencyMs === null.
  if (latencyMs === null) {
    // Возвращаем результат: rgb(160, 160, 170).
    return "rgb(160, 160, 170)";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: latencyMs < GOOD_MS.
  if (latencyMs < GOOD_MS) {
    // Возвращаем результат: rgb(0, 255, 136).
    return "rgb(0, 255, 136)";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: latencyMs <= FAIR_MS.
  if (latencyMs <= FAIR_MS) {
    // Возвращаем результат: rgb(251, 191, 36).
    return "rgb(251, 191, 36)";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: rgb(255, 82, 82).
  return "rgb(255, 82, 82)";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatPing(latencyMs: number | null): string {
  // Обрабатываем конструкцию: const suffix = currentLanguage() === ru ? мс : ms.
  const suffix = currentLanguage() === "ru" ? "мс" : "ms";
  // — разделитель логических блоков —

  // Возвращаем результат: latencyMs === null ? — : ${latencyMs} ${suffix}.
  return latencyMs === null ? "—" : `${latencyMs} ${suffix}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию segments.
function segments(points: PingPoint[]): PingPoint[][] {
  // Обрабатываем конструкцию: const groups: PingPoint[][] = [].
  const groups: PingPoint[][] = [];
  // Обрабатываем конструкцию: let current: PingPoint[] = [].
  let current: PingPoint[] = [];
  // — разделитель логических блоков —

  // Перебираем элементы коллекции points.
  for (const point of points) {
    // Проверяем бизнес-условие: point.success && point.latencyMs !== null.
    if (point.success && point.latencyMs !== null) {
      // Обрабатываем конструкцию: current.
      current.push(point);
      // Закрываем текущий блок.
    } else if (current.length > 0) {
      // Обрабатываем конструкцию: groups.
      groups.push(current);
      // Обрабатываем конструкцию: current.
      current = [];
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: current.length > 0.
  if (current.length > 0) {
    // Обрабатываем конструкцию: groups.
    groups.push(current);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: groups.
  return groups;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию project.
function project(
  // Обрабатываем конструкцию: points.
  points: PingPoint[],
  // Обрабатываем конструкцию: width.
  width: number,
  // Обрабатываем конструкцию: height.
  height: number
  // Закрываем выражение или список аргументов.
): SmoothPathPoint[] {
  // Обрабатываем конструкцию: const usable = points.filter( (point) => point.success ….
  const usable = points.filter(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (point) => point.success && point.latencyMs !== null
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: usable.length < 2.
  if (usable.length < 2) {
    // Возвращаем результат: [].
    return [];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const values = usable.map((point) => point.latencyMs ??….
  const values = usable.map((point) => point.latencyMs ?? 0);
  // Обрабатываем конструкцию: const min = Math.min(...values).
  const min = Math.min(...values);
  // Обрабатываем конструкцию: const max = Math.max(...values).
  const max = Math.max(...values);
  // Обрабатываем конструкцию: const average = values.reduce((sum, value) => sum + val….
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  // Обрабатываем конструкцию: const span = Math.max(max - min, Math.max(average * 0.3….
  const span = Math.max(max - min, Math.max(average * 0.35, 24));
  // Обрабатываем конструкцию: const top = (min + max) / 2 + span / 2.
  const top = (min + max) / 2 + span / 2;
  // Обрабатываем конструкцию: const bottom = top - span.
  const bottom = top - span;
  // Обрабатываем конструкцию: const usableHeight = height - SPARKLINE_PADDING * 2.
  const usableHeight = height - SPARKLINE_PADDING * 2;
  // Обрабатываем конструкцию: const step = width / (usable.length - 1).
  const step = width / (usable.length - 1);
  // — разделитель логических блоков —

  // Возвращаем результат: usable.map((point, index) => { const value = point.late….
  return usable.map((point, index) => {
    // Обрабатываем конструкцию: const value = point.latencyMs ?? 0.
    const value = point.latencyMs ?? 0;
    // — разделитель логических блоков —

    // Возвращаем результат: { x: index * step, y: SPARKLINE_PADDING + usableHeight ….
    return {
      // Обрабатываем конструкцию: x.
      x: index * step,
      // Обрабатываем конструкцию: y.
      y:
        // Обрабатываем конструкцию: SPARKLINE_PADDING.
        SPARKLINE_PADDING +
        // Обрабатываем конструкцию: usableHeight.
        usableHeight -
        // Обрабатываем конструкцию: ((Math.min(Math.max(value, bottom), top) - bottom) / sp….
        ((Math.min(Math.max(value, bottom), top) - bottom) / span) *
          // Обрабатываем конструкцию: usableHeight.
          usableHeight,
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildSparklinePath(
  // Обрабатываем конструкцию: points.
  points: PingPoint[],
  // Обрабатываем конструкцию: width.
  width: number,
  // Обрабатываем конструкцию: height.
  height: number
  // Закрываем выражение или список аргументов.
): string {
  // Возвращаем результат: buildSmoothPath(project(points, width, height), CHART_S….
  return buildSmoothPath(project(points, width, height), CHART_SMOOTH_TENSION);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildSparklineFill(
  // Обрабатываем конструкцию: points.
  points: PingPoint[],
  // Обрабатываем конструкцию: width.
  width: number,
  // Обрабатываем конструкцию: height.
  height: number
  // Закрываем выражение или список аргументов.
): string {
  // Обрабатываем конструкцию: const groups = segments(points).
  const groups = segments(points);
  // — разделитель логических блоков —

  // Возвращаем результат: groups .filter((group) => group.length > 1) .map((group….
  return (
    // Продолжаем предыдущую конструкцию.
    groups
      // Продолжаем цепочку вызовов.
      .filter((group) => group.length > 1)
      // Продолжаем цепочку вызовов.
      .map((group) => {
        // Обрабатываем конструкцию: const line = buildSparklinePath(group, width, height).
        const line = buildSparklinePath(group, width, height);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: line ===.
        if (line === "") {
          // Возвращаем результат: .
          return "";
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Возвращаем результат: ${line} L${width.toFixed(2)},${height.toFixed(2)} L0,${….
        return `${line} L${width.toFixed(2)},${height.toFixed(2)} L0,${height.toFixed(2)} Z`;
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .join(" ")
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function lastLatency(points: PingPoint[]): number | null {
  // Запускаем цикл с инициализацией, условием и шагом.
  for (let index = points.length - 1; index >= 0; index -= 1) {
    // Обрабатываем конструкцию: const point = points[index].
    const point = points[index];
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: point !== undefined && point.success && point.latencyMs….
    if (point !== undefined && point.success && point.latencyMs !== null) {
      // Возвращаем результат: point.latencyMs.
      return point.latencyMs;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: null.
  return null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
