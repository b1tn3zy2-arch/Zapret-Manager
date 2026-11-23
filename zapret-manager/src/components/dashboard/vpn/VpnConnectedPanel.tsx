// Импортируем зависимости из модуля lucide-react.
import { ArrowDown, ArrowUp } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import { TRAFFIC_COLORS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatSpeed } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/lib/vpnUtils.
import { formatUptime } from "@/lib/vpnUtils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnConnectedPanelProps {
  // Сохраняем пояснение разработчика: Скорость входящего трафика, байт в секунду.
  /** Скорость входящего трафика, байт в секунду. */
  // Обрабатываем конструкцию: speedIn.
  speedIn: number;
  // Сохраняем пояснение разработчика: Скорость исходящего трафика, байт в секунду.
  /** Скорость исходящего трафика, байт в секунду. */
  // Обрабатываем конструкцию: speedOut.
  speedOut: number;
  // Обрабатываем конструкцию: uptimeSec.
  uptimeSec: number | null;
  // Обрабатываем конструкцию: serverName.
  serverName: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс SpeedCellProps с контрактом данных.
interface SpeedCellProps {
  // Обрабатываем конструкцию: direction.
  direction: "in" | "out";
  // Обрабатываем конструкцию: value.
  value: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Панель активного подключения по референсу: входящая скорос…
 * Панель активного подключения по референсу: входящая скорость, время работы
 // Сохраняем пояснение разработчика: * и исходящая скорость в одну строку.
 * и исходящая скорость в одну строку.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше эти данные прятались в подвале под списком серверов…
 * Раньше эти данные прятались в подвале под списком серверов мелким шрифтом,
 // Сохраняем пояснение разработчика: * где их никто не читал, а кнопка подключения оставалась без…
 * где их никто не читал, а кнопка подключения оставалась без контекста.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию SpeedCell.
function SpeedCell({ direction, value }: SpeedCellProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const color = TRAFFIC_COLORS[direction].
  const color = TRAFFIC_COLORS[direction];
  // Обрабатываем конструкцию: const Icon = direction === in ? ArrowDown : ArrowUp.
  const Icon = direction === "in" ? ArrowDown : ArrowUp;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex items-center gap-2> <Icon aria-hi….
  return (
    // Обрабатываем конструкцию: <div className=flex items-center gap-2>.
    <div className="flex items-center gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <Icon
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="size-4 shrink-0"
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth={2.5}
        // Обрабатываем конструкцию: style.
        style={{ color }}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className="text-xl leading-none font-bold tabular-nums"
        // Обрабатываем конструкцию: style.
        style={{ color }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {formatSpeed(value)}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="sr-only">{t(`monitor.speed.${direction}`)}</span>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function VpnConnectedPanel({
  // Обрабатываем конструкцию: speedIn.
  speedIn,
  // Обрабатываем конструкцию: speedOut.
  speedOut,
  // Обрабатываем конструкцию: uptimeSec.
  uptimeSec,
  // Обрабатываем конструкцию: serverName.
  serverName,
  // Закрываем текущий блок.
}: VpnConnectedPanelProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=md className=flex flex-wrap items….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=md className=flex flex-wrap items-c….
    <GlassPanel
      // Обрабатываем конструкцию: padding.
      padding="md"
      // Обрабатываем конструкцию: className.
      className="flex flex-wrap items-center justify-between gap-4"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <SpeedCell direction="in" value={speedIn} />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col items-center gap-0.5">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-secondary text-xs">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.vpn.uptime")}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-primary font-mono text-sm tabular-nums">
          {/* Выводим текстовое содержимое в JSX. */}
          {formatUptime(uptimeSec)}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        {serverName === null ? null : (
          // Обрабатываем конструкцию: <span className=text-text-tertiary max-w-56 truncate te….
          <span className="text-text-tertiary max-w-56 truncate text-[11px]">
            {/* Выводим текстовое содержимое в JSX. */}
            {serverName}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SpeedCell direction="out" value={speedOut} />
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
