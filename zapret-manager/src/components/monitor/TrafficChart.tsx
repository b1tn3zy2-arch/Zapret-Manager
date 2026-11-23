// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/hooks/useTrafficCanvas.
import { useTrafficCanvas } from "@/hooks/useTrafficCanvas";
// Импортируем зависимости из модуля @/lib/constants.
import { TRAFFIC_CHART_HEIGHT } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatSpeed } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля react.
import { useRef } from "react";
// Импортируем зависимости из модуля react.
import type { RefObject } from "react";
// Импортируем зависимости из модуля @/types.
import type { TrafficKey, TrafficPoint } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TrafficChartProps {
  // Обрабатываем конструкцию: buffer.
  buffer: RefObject<TrafficPoint[]>;
  // Обрабатываем конструкцию: dataKey.
  dataKey: TrafficKey;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: color.
  color: string;
  // Обрабатываем конструкцию: isPaused.
  isPaused: boolean;
  // Обрабатываем конструкцию: height.
  height?: number;
  // Обрабатываем конструкцию: canvasRef.
  canvasRef?: RefObject<HTMLCanvasElement | null>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию TrafficChart.
function TrafficChart({
  // Обрабатываем конструкцию: buffer.
  buffer,
  // Обрабатываем конструкцию: dataKey.
  dataKey,
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: color.
  color,
  // Обрабатываем конструкцию: isPaused.
  isPaused,
  // Обрабатываем конструкцию: height.
  height = TRAFFIC_CHART_HEIGHT,
  // Обрабатываем конструкцию: canvasRef.
  canvasRef,
  // Закрываем текущий блок.
}: TrafficChartProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const localRef = useRef<HTMLCanvasElement | null>(null).
  const localRef = useRef<HTMLCanvasElement | null>(null);
  // Обрабатываем конструкцию: const targetRef = canvasRef ?? localRef.
  const targetRef = canvasRef ?? localRef;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const { currentValue } = useTrafficCanvas({ buffer, can….
  const { currentValue } = useTrafficCanvas({
    // Передаём поле buffer в объект.
    buffer,
    // Обрабатываем конструкцию: canvasRef.
    canvasRef: targetRef,
    // Передаём поле dataKey в объект.
    dataKey,
    // Передаём поле color в объект.
    color,
    // Передаём поле height в объект.
    height,
    // Обрабатываем конструкцию: paused.
    paused: isPaused,
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=md className=flex flex-col gap-2>….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=md className=flex flex-col gap-2>.
    <GlassPanel padding="md" className="flex flex-col gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex items-baseline justify-between gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-secondary text-xs font-medium">{label}</span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-lg font-bold tabular-nums" style={{ color }}>
          {/* Выводим текстовое содержимое в JSX. */}
          {formatSpeed(currentValue)}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <canvas
        // Обрабатываем конструкцию: ref.
        ref={targetRef}
        // Обрабатываем конструкцию: role.
        role="img"
        // Обрабатываем конструкцию: aria-label.
        aria-label={t("monitor.chart.aria", {
          // Передаём поле label в объект.
          label,
          // Обрабатываем конструкцию: value.
          value: formatSpeed(currentValue),
          // Закрываем текущий блок.
        })}
        // Обрабатываем конструкцию: className.
        className="block w-full rounded-lg"
        // Обрабатываем конструкцию: style.
        style={{ height: `${height}px` }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {isPaused ? (
        // Обрабатываем конструкцию: <span className=text-text-tertiary text-[10px] uppercas….
        <span className="text-text-tertiary text-[10px] uppercase">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("monitor.chart.frozen")}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default TrafficChart;.
export default TrafficChart;
// — разделитель логических блоков —
