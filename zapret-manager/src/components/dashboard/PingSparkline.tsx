// Импортируем зависимости из модуля react.
import { useEffect, useMemo, useRef } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт CHART_PULSE_PERIOD_MS.
  CHART_PULSE_PERIOD_MS,
  // Подключаем именованный импорт CHART_SMOOTH_TENSION.
  CHART_SMOOTH_TENSION,
  // Подключаем именованный импорт PING_HISTORY_SIZE.
  PING_HISTORY_SIZE,
  // Подключаем именованный импорт PING_INTERVAL_MS.
  PING_INTERVAL_MS,
  // Подключаем именованный импорт SPARKLINE_HEIGHT.
  SPARKLINE_HEIGHT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/pingUtils.
import { getPingColor, type PingPoint } from "@/lib/pingUtils";
// Импортируем зависимости из модуля @/lib/smoothPath.
import { buildAreaPath, buildSmoothPath } from "@/lib/smoothPath";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface PingSparklineProps {
  // Обрабатываем конструкцию: points.
  points: PingPoint[];
  // Обрабатываем конструкцию: height.
  height?: number;
  // Обрабатываем конструкцию: capacity.
  capacity?: number;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Показывать заглушку «нет данных». В компактных чипах монит…
   * Показывать заглушку «нет данных». В компактных чипах монитора она
   // Сохраняем пояснение разработчика: * перекрывала саму строку и читалась как ошибка интерфейса.
   * перекрывала саму строку и читалась как ошибка интерфейса.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: showEmptyState.
  showEmptyState?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ENDPOINT_RADIUS = 2.6.
const ENDPOINT_RADIUS = 2.6;
// Обрабатываем конструкцию: const Y_PADDING = 2.
const Y_PADDING = 2;
// Сохраняем пояснение разработчика: // Ограничиваем частоту перерисовки: данные приходят раз в P…
// Ограничиваем частоту перерисовки: данные приходят раз в PING_INTERVAL_MS,
// Сохраняем пояснение разработчика: // поэтому 60 кадров/с только расходуют CPU. 15 кадров/с дос…
// поэтому 60 кадров/с только расходуют CPU. 15 кадров/с достаточно для пульсации.
// Обрабатываем конструкцию: const FRAME_INTERVAL_MS = 1000 / 15.
const FRAME_INTERVAL_MS = 1000 / 15;
// — разделитель логических блоков —

// Объявляем функцию withAlpha.
function withAlpha(color: string, alpha: number): string {
  // Обрабатываем конструкцию: const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d….
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: rgbMatch !== null.
  if (rgbMatch !== null) {
    // Возвращаем результат: rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${….
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

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

// Объявляем функцию PingSparkline.
function PingSparkline({
  // Обрабатываем конструкцию: points.
  points,
  // Обрабатываем конструкцию: height.
  height = SPARKLINE_HEIGHT,
  // Обрабатываем конструкцию: capacity.
  capacity = PING_HISTORY_SIZE,
  // Обрабатываем конструкцию: className.
  className,
  // Обрабатываем конструкцию: showEmptyState.
  showEmptyState = true,
  // Закрываем текущий блок.
}: PingSparklineProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // Обрабатываем конструкцию: const canvasRef = useRef<HTMLCanvasElement>(null).
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Обрабатываем конструкцию: const pointsRef = useRef(points).
  const pointsRef = useRef(points);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: pointsRef.
    pointsRef.current = points;
    // Закрываем текущий блок.
  }, [points]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const hasData = useMemo( () => points.some((point) => p….
  const hasData = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => points.some((point) => point.success && point.latencyMs !== null),
    // Открываем массив.
    [points]
    // Закрываем выражение или список аргументов.
  );
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

    // Обрабатываем конструкцию: let frame = 0.
    let frame = 0;
    // Обрабатываем конструкцию: let width = 0.
    let width = 0;
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Плотность пикселей перечитывается при каждом изменении ра…
    // Плотность пикселей перечитывается при каждом изменении размера:
    // Сохраняем пояснение разработчика: // иначе после смены масштаба интерфейса холст остаётся в пр…
    // иначе после смены масштаба интерфейса холст остаётся в прежнем
    // Сохраняем пояснение разработчика: // масштабе и мыло.
    // масштабе и мыло.
    // Обрабатываем конструкцию: const resize = (): void => { const ratio = window.devic….
    const resize = (): void => {
      // Обрабатываем конструкцию: const ratio = window.devicePixelRatio || 1.
      const ratio = window.devicePixelRatio || 1;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: width.
      width = Math.max(canvas.clientWidth, 1);
      // Обрабатываем конструкцию: canvas.
      canvas.width = Math.round(width * ratio);
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

    // Обрабатываем конструкцию: let lastFrame = 0.
    let lastFrame = 0;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const draw = (now: number): void => { // Планируем след….
    const draw = (now: number): void => {
      // Сохраняем пояснение разработчика: // Планируем следующий кадр сразу: даже при пропуске цикл не…
      // Планируем следующий кадр сразу: даже при пропуске цикл не прервётся.
      // Обрабатываем конструкцию: frame.
      frame = window.requestAnimationFrame(draw);
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Не рисуем в скрытой вкладке и не чаще защитного интервала…
      // Не рисуем в скрытой вкладке и не чаще защитного интервала.
      // Проверяем бизнес-условие: document.hidden || now - lastFrame < FRAME_INTERVAL_MS.
      if (document.hidden || now - lastFrame < FRAME_INTERVAL_MS) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // Обрабатываем конструкцию: lastFrame.
      lastFrame = now;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const source = pointsRef.current.
      const source = pointsRef.current;
      // Обрабатываем конструкцию: const head = source[source.length - 1].
      const head = source[source.length - 1];
      // Обрабатываем конструкцию: const headMs = head?.timestamp ?? Date.now().
      const headMs = head?.timestamp ?? Date.now();
      // Обрабатываем конструкцию: const elapsed = Math.min( Math.max(Date.now() - headMs,….
      const elapsed = Math.min(
        // Обрабатываем конструкцию: Math.
        Math.max(Date.now() - headMs, 0),
        // Обрабатываем конструкцию: PING_INTERVAL_MS.
        PING_INTERVAL_MS * capacity
        // Закрываем выражение или список аргументов.
      );
      // Обрабатываем конструкцию: const step = width / (Math.max(capacity, 2) - 1).
      const step = width / (Math.max(capacity, 2) - 1);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: context.
      context.clearRect(0, 0, width, height);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const values: number[] = [].
      const values: number[] = [];
      // — разделитель логических блоков —

      // Перебираем элементы коллекции source.
      for (const point of source) {
        // Проверяем бизнес-условие: point.success && point.latencyMs !== null.
        if (point.success && point.latencyMs !== null) {
          // Обрабатываем конструкцию: values.
          values.push(point.latencyMs);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: values.length >= 1.
      if (values.length >= 1) {
        // Обрабатываем конструкцию: const min = Math.min(...values).
        const min = Math.min(...values);
        // Обрабатываем конструкцию: const max = Math.max(...values).
        const max = Math.max(...values);
        // Обрабатываем конструкцию: const average = values.reduce((sum, value) => sum + val….
        const average =
          // Обрабатываем конструкцию: values.
          values.reduce((sum, value) => sum + value, 0) / values.length;
        // Обрабатываем конструкцию: const span = Math.max(max - min, Math.max(average * 0.3….
        const span = Math.max(max - min, Math.max(average * 0.35, 24));
        // Обрабатываем конструкцию: const top = (min + max) / 2 + span / 2.
        const top = (min + max) / 2 + span / 2;
        // Обрабатываем конструкцию: const bottom = top - span.
        const bottom = top - span;
        // Обрабатываем конструкцию: const usable = height - Y_PADDING * 2.
        const usable = height - Y_PADDING * 2;
        // Обрабатываем конструкцию: const toY = (value: number): number => Y_PADDING + usab….
        const toY = (value: number): number =>
          // Обрабатываем конструкцию: Y_PADDING.
          Y_PADDING +
          // Обрабатываем конструкцию: usable.
          usable -
          // Обрабатываем конструкцию: ((Math.min(Math.max(value, bottom), top) - bottom) / sp….
          ((Math.min(Math.max(value, bottom), top) - bottom) / span) * usable;
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: let segment: { x: number; y: number }[] = [].
        let segment: { x: number; y: number }[] = [];
        // Обрабатываем конструкцию: let segmentColor =.
        let segmentColor = "";
        // Обрабатываем конструкцию: let lastPoint: { x: number; y: number; color: string } ….
        let lastPoint: { x: number; y: number; color: string } | null = null;
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const flush = (): void => { if (segment.length >= 2) { ….
        const flush = (): void => {
          // Проверяем бизнес-условие: segment.length >= 2.
          if (segment.length >= 2) {
            // Обрабатываем конструкцию: const area = new Path2D( buildAreaPath(segment, height,….
            const area = new Path2D(
              // Обрабатываем конструкцию: buildAreaPath.
              buildAreaPath(segment, height, CHART_SMOOTH_TENSION)
              // Закрываем выражение или список аргументов.
            );
            // Обрабатываем конструкцию: const line = new Path2D( buildSmoothPath(segment, CHART….
            const line = new Path2D(
              // Обрабатываем конструкцию: buildSmoothPath.
              buildSmoothPath(segment, CHART_SMOOTH_TENSION)
              // Закрываем выражение или список аргументов.
            );
            // Обрабатываем конструкцию: const fill = context.createLinearGradient(0, 0, 0, heig….
            const fill = context.createLinearGradient(0, 0, 0, height);
            // Обрабатываем конструкцию: fill.
            fill.addColorStop(0, withAlpha(segmentColor, 0.3));
            // Обрабатываем конструкцию: fill.
            fill.addColorStop(1, withAlpha(segmentColor, 0));
            // Обрабатываем конструкцию: context.
            context.fillStyle = fill;
            // Обрабатываем конструкцию: context.
            context.fill(area);
            // Обрабатываем конструкцию: context.
            context.strokeStyle = segmentColor;
            // Обрабатываем конструкцию: context.
            context.lineWidth = 1.5;
            // Обрабатываем конструкцию: context.
            context.lineJoin = "round";
            // Обрабатываем конструкцию: context.
            context.lineCap = "round";
            // Обрабатываем конструкцию: context.
            context.stroke(line);
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: segment.
          segment = [];
          // Закрываем текущий блок.
        };
        // — разделитель логических блоков —

        // Перебираем элементы коллекции source.
        for (const point of source) {
          // Проверяем бизнес-условие: !point.success || point.latencyMs === null.
          if (!point.success || point.latencyMs === null) {
            // Обрабатываем конструкцию: flush.
            flush();
            // Переходим к следующей итерации цикла.
            continue;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: const x = width - ((elapsed + (headMs - point.timestamp….
          const x =
            // Обрабатываем конструкцию: width.
            width -
            // Обрабатываем конструкцию: ((elapsed + (headMs - point.timestamp)) / PING_INTERVAL….
            ((elapsed + (headMs - point.timestamp)) / PING_INTERVAL_MS) * step;
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: x < -step * 2.
          if (x < -step * 2) {
            // Переходим к следующей итерации цикла.
            continue;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: const entry = { x, y: toY(point.latencyMs) }.
          const entry = { x, y: toY(point.latencyMs) };
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: segment.
          segment.push(entry);
          // Обрабатываем конструкцию: segmentColor.
          segmentColor = getPingColor(point.latencyMs);
          // Обрабатываем конструкцию: lastPoint.
          lastPoint = { ...entry, color: segmentColor };
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: flush.
        flush();
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: lastPoint !== null.
        if (lastPoint !== null) {
          // Обрабатываем конструкцию: const pulse = reducedMotion ? 1 : 1 + Math.sin( (perfor….
          const pulse = reducedMotion
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              1
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              1 +
              // Обрабатываем конструкцию: Math.
              Math.sin(
                // Обрабатываем конструкцию: (performance.now() / CHART_PULSE_PERIOD_MS).
                (performance.now() / CHART_PULSE_PERIOD_MS) * Math.PI * 2
                // Закрываем выражение или список аргументов.
              ) *
                // Обрабатываем конструкцию: 0.25.
                0.25;
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: context.
          context.beginPath();
          // Обрабатываем конструкцию: context.
          context.arc(
            // Обрабатываем конструкцию: lastPoint.
            lastPoint.x,
            // Обрабатываем конструкцию: lastPoint.
            lastPoint.y,
            // Обрабатываем конструкцию: ENDPOINT_RADIUS.
            ENDPOINT_RADIUS * pulse,
            // Обрабатываем конструкцию: 0.
            0,
            // Обрабатываем конструкцию: Math.
            Math.PI * 2
            // Закрываем выражение или список аргументов.
          );
          // Обрабатываем конструкцию: context.
          context.fillStyle = lastPoint.color;
          // Обрабатываем конструкцию: context.
          context.fill();
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: frame.
    frame = window.requestAnimationFrame(draw);
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
  }, [capacity, height, reducedMotion]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className={cn(relative, className)} style={{ hei….
  return (
    // Обрабатываем конструкцию: <div className={cn(relative, className)} style={{ heigh….
    <div className={cn("relative", className)} style={{ height }}>
      {/* Выводим текстовое содержимое в JSX. */}
      <canvas ref={canvasRef} aria-hidden="true" className="block size-full" />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {hasData || !showEmptyState ? null : (
        // Обрабатываем конструкцию: <div className=border-glass-border absolute inset-0 fle….
        <div className="border-glass-border absolute inset-0 flex items-center justify-center rounded border border-dashed">
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-tertiary text-[10px]">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("common.noData")}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default PingSparkline;.
export default PingSparkline;
// — разделитель логических блоков —
