// Импортируем зависимости из модуля react.
import { useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { ArrowDown, ArrowUp } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/components/ui.
import { Badge } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/constants.
import { MONITOR_STALL_THRESHOLD_MS, TRAFFIC_COLORS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatSpeed } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/types.
import type { MonitorState, NetworkStats, Strategy } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TrafficStatusProps {
  // Обрабатываем конструкцию: stats.
  stats: NetworkStats | null;
  // Обрабатываем конструкцию: isPaused.
  isPaused: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: activeStrategy.
  activeStrategy: Strategy | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const STATUS_VIEW = { background: { labelKey: monitor.s….
const STATUS_VIEW = {
  // Обрабатываем конструкцию: background.
  background: {
    // Обрабатываем конструкцию: labelKey.
    labelKey: "monitor.status.background",
    // Обрабатываем конструкцию: variant.
    variant: "neutral",
    // Обрабатываем конструкцию: hintKey.
    hintKey: "monitor.status.backgroundHint",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: active.
  active: {
    // Обрабатываем конструкцию: labelKey.
    labelKey: "monitor.status.active",
    // Обрабатываем конструкцию: variant.
    variant: "success",
    // Обрабатываем конструкцию: hintKey.
    hintKey: "monitor.status.activeHint",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: stalled.
  stalled: {
    // Обрабатываем конструкцию: labelKey.
    labelKey: "monitor.status.stalled",
    // Обрабатываем конструкцию: variant.
    variant: "warning",
    // Обрабатываем конструкцию: hintKey.
    hintKey: "monitor.status.stalledHint",
    // Закрываем текущий блок.
  },
  // Обрабатываем конструкцию: error.
  error: {
    // Обрабатываем конструкцию: labelKey.
    labelKey: "monitor.status.error",
    // Обрабатываем конструкцию: variant.
    variant: "error",
    // Обрабатываем конструкцию: hintKey.
    hintKey: "monitor.status.errorHint",
    // Закрываем текущий блок.
  },
  // Закрываем текущий блок.
} as const satisfies Record<
  // Обрабатываем конструкцию: MonitorState.
  MonitorState,
  // Обрабатываем конструкцию: { labelKey: TranslationKey; variant: neutral | success ….
  {
    // Обрабатываем конструкцию: labelKey.
    labelKey: TranslationKey;
    // Обрабатываем конструкцию: variant.
    variant: "neutral" | "success" | "warning" | "error";
    // Обрабатываем конструкцию: hintKey.
    hintKey: TranslationKey;
    // Закрываем текущий блок.
  }
  // Продолжаем выражение.
>;
// — разделитель логических блоков —

// Объявляем функцию useStalled.
function useStalled(stats: NetworkStats | null): boolean {
  // Обрабатываем конструкцию: const lastTrafficRef = useRef(0).
  const lastTrafficRef = useRef(0);
  // Обрабатываем конструкцию: const [stalled, setStalled] = useState(false).
  const [stalled, setStalled] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const speed = (stats?.speedIn ?? 0) + (stats?.speedOut ….
    const speed = (stats?.speedIn ?? 0) + (stats?.speedOut ?? 0);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: speed > 0.
    if (speed > 0) {
      // Обрабатываем конструкцию: lastTrafficRef.
      lastTrafficRef.current = Date.now();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [stats]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const timer = window.setInterval(() => { if (lastTraffi….
    const timer = window.setInterval(() => {
      // Проверяем бизнес-условие: lastTrafficRef.current === 0.
      if (lastTrafficRef.current === 0) {
        // Обрабатываем конструкцию: lastTrafficRef.
        lastTrafficRef.current = Date.now();
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setStalled.
      setStalled(
        // Обрабатываем конструкцию: Date.
        Date.now() - lastTrafficRef.current > MONITOR_STALL_THRESHOLD_MS
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }, 1000);
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

  // Возвращаем результат: stalled.
  return stalled;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс LiveSpeedProps с контрактом данных.
interface LiveSpeedProps {
  // Обрабатываем конструкцию: readonly.
  readonly direction: "in" | "out";
  // Обрабатываем конструкцию: readonly.
  readonly value: number;
  // Обрабатываем конструкцию: readonly.
  readonly label: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию LiveSpeed.
function LiveSpeed({ direction, value, label }: LiveSpeedProps) {
  // Обрабатываем конструкцию: const color = TRAFFIC_COLORS[direction].
  const color = TRAFFIC_COLORS[direction];
  // Обрабатываем конструкцию: const Icon = direction === in ? ArrowDown : ArrowUp.
  const Icon = direction === "in" ? ArrowDown : ArrowUp;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col items-end gap-0.5> <span….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col items-end gap-0.5>.
    <div className="flex flex-col items-end gap-0.5">
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="flex items-center gap-1.5 text-xs font-medium">
        {/* Выводим текстовое содержимое в JSX. */}
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-tertiary">{label}</span>
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className="text-2xl leading-none font-bold tabular-nums"
        // Обрабатываем конструкцию: style.
        style={{ color }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {formatSpeed(value)}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Верхняя панель монитора: состояние обхода слева, текущие с…
 * Верхняя панель монитора: состояние обхода слева, текущие скорости справа.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше здесь была одна суммарная цифра «0 Б/с», из-за кото…
 * Раньше здесь была одна суммарная цифра «0 Б/с», из-за которой нельзя было
 // Сохраняем пояснение разработчика: * понять, куда именно уходит трафик, а подпись занимала целу…
 * понять, куда именно уходит трафик, а подпись занимала целую строку.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию TrafficStatus.
function TrafficStatus({
  // Обрабатываем конструкцию: stats.
  stats,
  // Обрабатываем конструкцию: isPaused.
  isPaused,
  // Обрабатываем конструкцию: error.
  error,
  // Обрабатываем конструкцию: activeStrategy.
  activeStrategy,
  // Закрываем текущий блок.
}: TrafficStatusProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const stalled = useStalled(stats).
  const stalled = useStalled(stats);
  // Обрабатываем конструкцию: const isRunning = activeStrategy?.status === running.
  const isRunning = activeStrategy?.status === "running";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const state: MonitorState = error !== null ? error : is….
  const state: MonitorState =
    // Обрабатываем конструкцию: error.
    error !== null
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        "error"
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        isPaused
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          "background"
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          isRunning && stalled
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "stalled"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            isRunning
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "active"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              "background";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const view = STATUS_VIEW[state].
  const view = STATUS_VIEW[state];
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=md className=flex flex-col gap-3>….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=md className=flex flex-col gap-3>.
    <GlassPanel padding="md" className="flex flex-col gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex min-w-0 flex-col gap-1.5">
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Badge variant={view.variant} pulse={state === "active"}>
              {/* Выводим текстовое содержимое в JSX. */}
              {t(view.labelKey)}
              {/* Выводим текстовое содержимое в JSX. */}
            </Badge>
            {/* Выводим текстовое содержимое в JSX. */}
            {isPaused ? (
              // Обрабатываем конструкцию: <Badge variant=warning>.
              <Badge variant="warning">{t("common.pause")}</Badge>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* Выводим текстовое содержимое в JSX. */}
            {activeStrategy !== undefined && isRunning ? (
              // Обрабатываем конструкцию: <span className=text-text-secondary truncate text-xs>.
              <span className="text-text-secondary truncate text-xs">
                {/* Выводим текстовое содержимое в JSX. */}
                {activeStrategy.name}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-tertiary text-xs">{t(view.hintKey)}</span>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex items-start gap-6">
          {/* Выводим текстовое содержимое в JSX. */}
          <LiveSpeed
            // Обрабатываем конструкцию: direction.
            direction="in"
            // Обрабатываем конструкцию: value.
            value={stats?.speedIn ?? 0}
            // Обрабатываем конструкцию: label.
            label={t("monitor.speed.in")}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <LiveSpeed
            // Обрабатываем конструкцию: direction.
            direction="out"
            // Обрабатываем конструкцию: value.
            value={stats?.speedOut ?? 0}
            // Обрабатываем конструкцию: label.
            label={t("monitor.speed.out")}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default TrafficStatus;.
export default TrafficStatus;
// — разделитель логических блоков —
