// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля react.
import type { RefObject } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/lib/constants.
import { MONITOR_INTERVAL_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт CHART_PULSE_PERIOD_MS.
  CHART_PULSE_PERIOD_MS,
  // Подключаем именованный импорт CHART_SMOOTH_TENSION.
  CHART_SMOOTH_TENSION,
  // Подключаем именованный импорт EWMA_ALPHA.
  EWMA_ALPHA,
  // Подключаем именованный импорт MONITOR_BUFFER_SIZE.
  MONITOR_BUFFER_SIZE,
  // Подключаем именованный импорт MONITOR_LABEL_REFRESH_MS.
  MONITOR_LABEL_REFRESH_MS,
  // Подключаем именованный импорт TRAFFIC_AXIS_COLOR.
  TRAFFIC_AXIS_COLOR,
  // Подключаем именованный импорт TRAFFIC_CHART_FRAME_MS.
  TRAFFIC_CHART_FRAME_MS,
  // Подключаем именованный импорт TRAFFIC_CHART_MAX_DPR.
  TRAFFIC_CHART_MAX_DPR,
  // Подключаем именованный импорт TRAFFIC_GRID_COLOR_DARK.
  TRAFFIC_GRID_COLOR_DARK,
  // Подключаем именованный импорт TRAFFIC_GRID_COLOR_LIGHT.
  TRAFFIC_GRID_COLOR_LIGHT,
  // Подключаем именованный импорт TRAFFIC_GRID_VERTICAL_DARK.
  TRAFFIC_GRID_VERTICAL_DARK,
  // Подключаем именованный импорт TRAFFIC_GRID_VERTICAL_LIGHT.
  TRAFFIC_GRID_VERTICAL_LIGHT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/smoothPath.
import { buildAreaPath, buildSmoothPath } from "@/lib/smoothPath";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { computeMax } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/types.
import type { TrafficKey, TrafficPoint } from "@/types";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./useDpiChange.
import { useDpiScale } from "./useDpiChange";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseTrafficCanvasOptions {
  // Обрабатываем конструкцию: buffer.
  buffer: RefObject<TrafficPoint[]>;
  // Обрабатываем конструкцию: canvasRef.
  canvasRef: RefObject<HTMLCanvasElement | null>;
  // Обрабатываем конструкцию: dataKey.
  dataKey: TrafficKey;
  // Обрабатываем конструкцию: color.
  color: string;
  // Обрабатываем конструкцию: height.
  height: number;
  // Обрабатываем конструкцию: paused.
  paused: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseTrafficCanvasResult {
  // Обрабатываем конструкцию: canvasRef.
  canvasRef: RefObject<HTMLCanvasElement | null>;
  // Обрабатываем конструкцию: currentValue.
  currentValue: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const HORIZONTAL_LINES = 4.
const HORIZONTAL_LINES = 4;
// Обрабатываем конструкцию: const VERTICAL_LINES = 5.
const VERTICAL_LINES = 5;
// — разделитель логических блоков —

// Объявляем функцию withAlpha.
function withAlpha(color: string, alpha: number): string {
  // Обрабатываем конструкцию: const normalized = color.replace(#, ).
  const normalized = color.replace("#", "");
  // Обрабатываем конструкцию: const value = Number.parseInt(normalized, 16).
  const value = Number.parseInt(normalized, 16);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: normalized.length !== 6 || Number.isNaN(value).
  if (normalized.length !== 6 || Number.isNaN(value)) {
    // Возвращаем результат: color.
    return color;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const red = (value >> 16) & 255.
  const red = (value >> 16) & 255;
  // Обрабатываем конструкцию: const green = (value >> 8) & 255.
  const green = (value >> 8) & 255;
  // Обрабатываем конструкцию: const blue = value & 255.
  const blue = value & 255;
  // — разделитель логических блоков —

  // Возвращаем результат: rgba(${red}, ${green}, ${blue}, ${alpha}).
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию isLightTheme.
function isLightTheme(): boolean {
  // Возвращаем результат: document.documentElement.dataset.theme === light.
  return document.documentElement.dataset.theme === "light";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию drawGrid.
function drawGrid(
  // Обрабатываем конструкцию: context.
  context: CanvasRenderingContext2D,
  // Обрабатываем конструкцию: width.
  width: number,
  // Обрабатываем конструкцию: height.
  height: number
  // Закрываем выражение или список аргументов.
): void {
  // Обрабатываем конструкцию: const light = isLightTheme().
  const light = isLightTheme();
  // Обрабатываем конструкцию: const horizontal = light ? TRAFFIC_GRID_COLOR_LIGHT : T….
  const horizontal = light ? TRAFFIC_GRID_COLOR_LIGHT : TRAFFIC_GRID_COLOR_DARK;
  // Обрабатываем конструкцию: const vertical = light ? TRAFFIC_GRID_VERTICAL_LIGHT : ….
  const vertical = light
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      TRAFFIC_GRID_VERTICAL_LIGHT
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      TRAFFIC_GRID_VERTICAL_DARK;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const ratio = context.getTransform().a || 1.
  const ratio = context.getTransform().a || 1;
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Линии сетки — по 1 физическому пикселю и выровненные к ег…
  // Линии сетки — по 1 физическому пикселю и выровненные к его центру.
  // Сохраняем пояснение разработчика: // Классическая привязка +0.5 CSS-пикселя работает только пр…
  // Классическая привязка +0.5 CSS-пикселя работает только при ratio 1:
  // Сохраняем пояснение разработчика: // на масштабах 125/150% обе координаты делят пиксель попола…
  // на масштабах 125/150% обе координаты делят пиксель пополам, и линия
  // Сохраняем пояснение разработчика: // выглядит мыльной, что и читается как низкое качество граф…
  // выглядит мыльной, что и читается как низкое качество графика.
  // Обрабатываем конструкцию: const device = (value: number): number => Math.round(va….
  const device = (value: number): number => Math.round(value * ratio) / ratio;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: context.
  context.lineWidth = 1 / ratio;
  // — разделитель логических блоков —

  // Запускаем цикл с инициализацией, условием и шагом.
  for (let index = 1; index < HORIZONTAL_LINES; index += 1) {
    // Обрабатываем конструкцию: const y = device((height / HORIZONTAL_LINES) * index).
    const y = device((height / HORIZONTAL_LINES) * index);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: context.
    context.strokeStyle = horizontal;
    // Обрабатываем конструкцию: context.
    context.beginPath();
    // Обрабатываем конструкцию: context.
    context.moveTo(0, y);
    // Обрабатываем конструкцию: context.
    context.lineTo(width, y);
    // Обрабатываем конструкцию: context.
    context.stroke();
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Запускаем цикл с инициализацией, условием и шагом.
  for (let index = 1; index < VERTICAL_LINES; index += 1) {
    // Обрабатываем конструкцию: const x = device((width / VERTICAL_LINES) * index).
    const x = device((width / VERTICAL_LINES) * index);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: context.
    context.strokeStyle = vertical;
    // Обрабатываем конструкцию: context.
    context.beginPath();
    // Обрабатываем конструкцию: context.
    context.moveTo(x, 0);
    // Обрабатываем конструкцию: context.
    context.lineTo(x, height);
    // Обрабатываем конструкцию: context.
    context.stroke();
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию drawFrame.
function drawFrame(
  // Обрабатываем конструкцию: context.
  context: CanvasRenderingContext2D,
  // Обрабатываем конструкцию: width.
  width: number,
  // Обрабатываем конструкцию: height.
  height: number,
  // Обрабатываем конструкцию: maxValue.
  maxValue: number
  // Закрываем выражение или список аргументов.
): void {
  // Обрабатываем конструкцию: context.
  context.font = "10px Inter, sans-serif";
  // Обрабатываем конструкцию: context.
  context.textBaseline = "top";
  // Обрабатываем конструкцию: context.
  context.fillStyle = TRAFFIC_AXIS_COLOR;
  // Обрабатываем конструкцию: context.
  context.fillText(`${Math.round(maxValue)}`, 4, 4);
  // Обрабатываем конструкцию: context.
  context.fillText("0", 4, height - 14);
  // Обрабатываем конструкцию: context.
  context.textAlign = "right";
  // Обрабатываем конструкцию: context.
  context.fillText(
    // Обрабатываем конструкцию: translateKey.
    translateKey("trafficMonitor.nowLabel"),
    // Обрабатываем конструкцию: width.
    width - 4,
    // Обрабатываем конструкцию: height.
    height - 14
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: context.
  context.textAlign = "left";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию drawEndpoint.
function drawEndpoint(
  // Обрабатываем конструкцию: context.
  context: CanvasRenderingContext2D,
  // Обрабатываем конструкцию: x.
  x: number,
  // Обрабатываем конструкцию: y.
  y: number,
  // Обрабатываем конструкцию: color.
  color: string,
  // Обрабатываем конструкцию: animate.
  animate: boolean
  // Закрываем выражение или список аргументов.
): void {
  // Обрабатываем конструкцию: const pulse = animate ? 1 + Math.sin((performance.now()….
  const pulse = animate
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      1 +
      // Обрабатываем конструкцию: Math.
      Math.sin((performance.now() / CHART_PULSE_PERIOD_MS) * Math.PI * 2) * 0.2
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      1;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: context.
  context.beginPath();
  // Обрабатываем конструкцию: context.
  context.arc(x, y, 3.2 * pulse, 0, Math.PI * 2);
  // Обрабатываем конструкцию: context.
  context.fillStyle = color;
  // Обрабатываем конструкцию: context.
  context.shadowColor = color;
  // Обрабатываем конструкцию: context.
  context.shadowBlur = animate ? 12 : 0;
  // Обрабатываем конструкцию: context.
  context.fill();
  // Обрабатываем конструкцию: context.
  context.shadowBlur = 0;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useTrafficCanvas({
  // Обрабатываем конструкцию: buffer.
  buffer,
  // Обрабатываем конструкцию: canvasRef.
  canvasRef,
  // Обрабатываем конструкцию: dataKey.
  dataKey,
  // Обрабатываем конструкцию: color.
  color,
  // Обрабатываем конструкцию: height.
  height,
  // Обрабатываем конструкцию: paused.
  paused,
  // Закрываем текущий блок.
}: UseTrafficCanvasOptions): UseTrafficCanvasResult {
  // Обрабатываем конструкцию: const maxRef = useRef(0).
  const maxRef = useRef(0);
  // Обрабатываем конструкцию: const valueRef = useRef(0).
  const valueRef = useRef(0);
  // Обрабатываем конструкцию: const [currentValue, setCurrentValue] = useState(0).
  const [currentValue, setCurrentValue] = useState(0);
  // Обрабатываем конструкцию: const scale = useDpiScale().
  const scale = useDpiScale();
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const canvas = canvasRef.current.
    const canvas = canvasRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: canvas === null.
    if (canvas === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const context = canvas.getContext(2d).
    const context = canvas.getContext("2d");
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: context === null.
    if (context === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: let width = 0.
    let width = 0;
    // Обрабатываем конструкцию: let frame = 0.
    let frame = 0;
    // Обрабатываем конструкцию: let lastFrame = 0.
    let lastFrame = 0;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const resize = (): void => { const ratio = Math.min(sca….
    const resize = (): void => {
      // Обрабатываем конструкцию: const ratio = Math.min(scale, TRAFFIC_CHART_MAX_DPR).
      const ratio = Math.min(scale, TRAFFIC_CHART_MAX_DPR);
      // Обрабатываем конструкцию: const next = Math.max(canvas.clientWidth, 1).
      const next = Math.max(canvas.clientWidth, 1);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: width.
      width = next;
      // Обрабатываем конструкцию: canvas.
      canvas.width = Math.round(next * ratio);
      // Обрабатываем конструкцию: canvas.
      canvas.height = Math.round(height * ratio);
      // Обрабатываем конструкцию: context.
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const observer = new ResizeObserver(resize).
    const observer = new ResizeObserver(resize);
    // Обрабатываем конструкцию: observer.
    observer.observe(canvas);
    // Обрабатываем конструкцию: resize.
    resize();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const smoothing = new Map<number, number>().
    const smoothing = new Map<number, number>();
    // Обрабатываем конструкцию: let frozenElapsed = 0.
    let frozenElapsed = 0;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const render = (time: number): void => { frame = window….
    const render = (time: number): void => {
      // Обрабатываем конструкцию: frame.
      frame = window.requestAnimationFrame(render);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: lastFrame !== 0 && time - lastFrame < TRAFFIC_CHART_FRA….
      if (lastFrame !== 0 && time - lastFrame < TRAFFIC_CHART_FRAME_MS) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: lastFrame.
      lastFrame = time;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const points = buffer.current.
      const points = buffer.current;
      // Обрабатываем конструкцию: const count = points.length.
      const count = points.length;
      // Обрабатываем конструкцию: const headMs = count > 0 ? (points[count - 1]?.timestam….
      const headMs = count > 0 ? (points[count - 1]?.timestamp ?? 0) : 0;
      // Обрабатываем конструкцию: const elapsed = paused ? frozenElapsed : Math.min( Math….
      const elapsed = paused
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          frozenElapsed
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          Math.min(
            // Обрабатываем конструкцию: Math.
            Math.max(Date.now() - headMs, 0),
            // Обрабатываем конструкцию: MONITOR_INTERVAL_MS.
            MONITOR_INTERVAL_MS * MONITOR_BUFFER_SIZE
            // Закрываем выражение или список аргументов.
          );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !paused.
      if (!paused) {
        // Обрабатываем конструкцию: frozenElapsed.
        frozenElapsed = elapsed;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: smoothing.size > MONITOR_BUFFER_SIZE * 3.
      if (smoothing.size > MONITOR_BUFFER_SIZE * 3) {
        // Обрабатываем конструкцию: const oldest = points[0]?.timestamp ?? 0.
        const oldest = points[0]?.timestamp ?? 0;
        // — разделитель логических блоков —

        // Перебираем элементы коллекции smoothing.keys().
        for (const key of smoothing.keys()) {
          // Проверяем бизнес-условие: key < oldest.
          if (key < oldest) {
            // Обрабатываем конструкцию: smoothing.
            smoothing.delete(key);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const smoothed: number[] = [].
      const smoothed: number[] = [];
      // Обрабатываем конструкцию: let previous = 0.
      let previous = 0;
      // — разделитель логических блоков —

      // Запускаем цикл с инициализацией, условием и шагом.
      for (let index = 0; index < count; index += 1) {
        // Обрабатываем конструкцию: const point = points[index].
        const point = points[index];
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: point === undefined.
        if (point === undefined) {
          // Переходим к следующей итерации цикла.
          continue;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const cached = smoothing.get(point.timestamp).
        const cached = smoothing.get(point.timestamp);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: cached === undefined.
        if (cached === undefined) {
          // Обрабатываем конструкцию: const target = point[dataKey].
          const target = point[dataKey];
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: previous.
          previous =
            // Обрабатываем конструкцию: smoothed.
            smoothed.length === 0
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                target
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                previous * (1 - EWMA_ALPHA) + target * EWMA_ALPHA;
          // Обрабатываем конструкцию: smoothing.
          smoothing.set(point.timestamp, previous);
          // Закрываем текущий блок.
        } else {
          // Обрабатываем конструкцию: previous.
          previous = cached;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: smoothed.
        smoothed.push(previous);
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: valueRef.
      valueRef.current = smoothed[smoothed.length - 1] ?? 0;
      // Обрабатываем конструкцию: maxRef.
      maxRef.current = computeMax(smoothed, maxRef.current);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const scaleValue = maxRef.current || 1.
      const scaleValue = maxRef.current || 1;
      // Обрабатываем конструкцию: const step = width / (MONITOR_BUFFER_SIZE - 1).
      const step = width / (MONITOR_BUFFER_SIZE - 1);
      // Обрабатываем конструкцию: const toY = (value: number): number => height - (Math.m….
      const toY = (value: number): number =>
        // Обрабатываем конструкцию: height.
        height - (Math.min(value, scaleValue) / scaleValue) * height;
      // Обрабатываем конструкцию: const chart = smoothed .map((value, index) => { const a….
      const chart = smoothed
        // Продолжаем цепочку вызовов.
        .map((value, index) => {
          // Обрабатываем конструкцию: const age = headMs - (points[index]?.timestamp ?? headM….
          const age = headMs - (points[index]?.timestamp ?? headMs);
          // — разделитель логических блоков —

          // Возвращаем результат: { x: width - ((age + elapsed) / MONITOR_INTERVAL_MS) * ….
          return {
            // Обрабатываем конструкцию: x.
            x: width - ((age + elapsed) / MONITOR_INTERVAL_MS) * step,
            // Обрабатываем конструкцию: y.
            y: toY(value),
            // Закрываем текущий блок.
          };
          // Закрываем текущий блок.
        })
        // Продолжаем цепочку вызовов.
        .filter((point) => point.x > -step);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: context.
      context.clearRect(0, 0, width, height);
      // Обрабатываем конструкцию: drawGrid.
      drawGrid(context, width, height);
      // Обрабатываем конструкцию: drawFrame.
      drawFrame(context, width, height, scaleValue);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: chart.length < 2.
      if (chart.length < 2) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const areaPath = new Path2D( buildAreaPath(chart, heigh….
      const areaPath = new Path2D(
        // Обрабатываем конструкцию: buildAreaPath.
        buildAreaPath(chart, height, CHART_SMOOTH_TENSION)
        // Закрываем выражение или список аргументов.
      );
      // Обрабатываем конструкцию: const linePath = new Path2D(buildSmoothPath(chart, CHAR….
      const linePath = new Path2D(buildSmoothPath(chart, CHART_SMOOTH_TENSION));
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const fill = context.createLinearGradient(0, 0, 0, heig….
      const fill = context.createLinearGradient(0, 0, 0, height);
      // Обрабатываем конструкцию: fill.
      fill.addColorStop(0, withAlpha(color, 0.32));
      // Обрабатываем конструкцию: fill.
      fill.addColorStop(0.5, withAlpha(color, 0.12));
      // Обрабатываем конструкцию: fill.
      fill.addColorStop(1, withAlpha(color, 0));
      // Обрабатываем конструкцию: context.
      context.fillStyle = fill;
      // Обрабатываем конструкцию: context.
      context.fill(areaPath);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: context.
      context.strokeStyle = color;
      // Обрабатываем конструкцию: context.
      context.lineWidth = 1.6;
      // Обрабатываем конструкцию: context.
      context.lineJoin = "round";
      // Обрабатываем конструкцию: context.
      context.lineCap = "round";
      // Обрабатываем конструкцию: context.
      context.shadowColor = withAlpha(color, paused ? 0 : 0.5);
      // Обрабатываем конструкцию: context.
      context.shadowBlur = paused ? 0 : 8;
      // Обрабатываем конструкцию: context.
      context.stroke(linePath);
      // Обрабатываем конструкцию: context.
      context.shadowBlur = 0;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const lastPoint = chart[chart.length - 1].
      const lastPoint = chart[chart.length - 1];
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: lastPoint !== undefined.
      if (lastPoint !== undefined) {
        // Обрабатываем конструкцию: drawEndpoint.
        drawEndpoint(
          // Обрабатываем конструкцию: context.
          context,
          // Обрабатываем конструкцию: lastPoint.
          lastPoint.x,
          // Обрабатываем конструкцию: lastPoint.
          lastPoint.y,
          // Обрабатываем конструкцию: color.
          color,
          // Изменяем значение выражения !paused.
          !paused && !reducedMotion
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: frame.
    frame = window.requestAnimationFrame(render);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.cancelAnimationFrame(frame); observer.di….
    return () => {
      // Обрабатываем конструкцию: window.
      window.cancelAnimationFrame(frame);
      // Обрабатываем конструкцию: observer.
      observer.disconnect();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [buffer, canvasRef, color, dataKey, height, paused, reducedMotion, scale]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const timer = window.setInterval(() => { setCurrentValu….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: setCurrentValue.
      setCurrentValue(valueRef.current);
      // Закрываем текущий блок.
    }, MONITOR_LABEL_REFRESH_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: { canvasRef, currentValue }.
  return { canvasRef, currentValue };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
