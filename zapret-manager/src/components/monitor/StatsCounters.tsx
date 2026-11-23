// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля lucide-react.
import { ArrowDown, ArrowUp, Network, Package } from "lucide-react";
// Импортируем зависимости из модуля lucide-react.
import type { LucideIcon } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/components/ui.
import { AnimatedNumber } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/constants.
import { MONITOR_COUNT_UP_DURATION_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatBytes, formatCount } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/types.
import type { NetworkStats } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StatsCountersProps {
  // Обрабатываем конструкцию: stats.
  stats: NetworkStats | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс StatProps с контрактом данных.
interface StatProps {
  // Обрабатываем конструкцию: icon.
  icon: LucideIcon;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: value.
  value: number;
  // Обрабатываем конструкцию: format.
  format: (value: number) => string;
  // Обрабатываем конструкцию: tone.
  tone: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию Stat.
function Stat({ icon: Icon, label, value, format, tone }: StatProps) {
  // Возвращаем результат: ( <div className=flex flex-col gap-1> <dt className=tex….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-1>.
    <div className="flex flex-col gap-1">
      {/* Выводим текстовое содержимое в JSX. */}
      <dt className="text-text-tertiary flex items-center gap-1.5 text-xs">
        {/* Выводим текстовое содержимое в JSX. */}
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} />
        {/* Выводим текстовое содержимое в JSX. */}
        {label}
        {/* Выводим текстовое содержимое в JSX. */}
      </dt>
      {/* Выводим текстовое содержимое в JSX. */}
      <dd>
        {/* Выводим текстовое содержимое в JSX. */}
        <AnimatedNumber
          // Обрабатываем конструкцию: value.
          value={value}
          // Обрабатываем конструкцию: duration.
          duration={MONITOR_COUNT_UP_DURATION_MS}
          // Обрабатываем конструкцию: format.
          format={format}
          // Обрабатываем конструкцию: className.
          className={`text-lg leading-none font-semibold tabular-nums ${tone}`}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </dd>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Итоги сессии — компактной полосой в одну панель.
 * Итоги сессии — компактной полосой в одну панель.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше это были четыре отдельные крупные карточки: они зан…
 * Раньше это были четыре отдельные крупные карточки: они занимали целый экран
 // Сохраняем пояснение разработчика: * ради четырёх чисел и визуально спорили с графиками за вним…
 * ради четырёх чисел и визуально спорили с графиками за внимание.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию StatsCounters.
function StatsCounters({ stats }: StatsCountersProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const packets = (stats?.packetsIn ?? 0) + (stats?.packe….
  const packets = (stats?.packetsIn ?? 0) + (stats?.packetsOut ?? 0);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=md> <dl className=grid grid-cols-….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=md>.
    <GlassPanel padding="md">
      {/* Выводим текстовое содержимое в JSX. */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <Stat
          // Обрабатываем конструкцию: icon.
          icon={ArrowDown}
          // Обрабатываем конструкцию: label.
          label={t("monitor.counters.downloaded")}
          // Обрабатываем конструкцию: value.
          value={stats?.bytesIn ?? 0}
          // Обрабатываем конструкцию: format.
          format={formatBytes}
          // Обрабатываем конструкцию: tone.
          tone="text-accent-primary"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <Stat
          // Обрабатываем конструкцию: icon.
          icon={ArrowUp}
          // Обрабатываем конструкцию: label.
          label={t("monitor.counters.uploaded")}
          // Обрабатываем конструкцию: value.
          value={stats?.bytesOut ?? 0}
          // Обрабатываем конструкцию: format.
          format={formatBytes}
          // Обрабатываем конструкцию: tone.
          tone="text-accent-secondary"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <Stat
          // Обрабатываем конструкцию: icon.
          icon={Package}
          // Обрабатываем конструкцию: label.
          label={t("monitor.counters.packets")}
          // Обрабатываем конструкцию: value.
          value={packets}
          // Обрабатываем конструкцию: format.
          format={formatCount}
          // Обрабатываем конструкцию: tone.
          tone="text-text-primary"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <Stat
          // Обрабатываем конструкцию: icon.
          icon={Network}
          // Обрабатываем конструкцию: label.
          label={t("monitor.counters.connections")}
          // Обрабатываем конструкцию: value.
          value={stats?.connections ?? 0}
          // Обрабатываем конструкцию: format.
          format={(value) => String(Math.round(value))}
          // Обрабатываем конструкцию: tone.
          tone="text-text-primary"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </dl>
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default StatsCounters;.
export default StatsCounters;
// — разделитель логических блоков —
