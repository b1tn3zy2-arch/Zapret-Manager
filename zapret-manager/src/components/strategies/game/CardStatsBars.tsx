// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Activity, Globe, Zap } from "lucide-react";
// Импортируем зависимости из модуля lucide-react.
import type { LucideIcon } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { CardStats } from "@/types";
// — разделитель логических блоков —

// Объявляем интерфейс StatRowProps с контрактом данных.
interface StatRowProps {
  // Обрабатываем конструкцию: icon.
  icon: LucideIcon;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: value.
  value: number;
  // Обрабатываем конструкцию: compact.
  compact: boolean;
  // Обрабатываем конструкцию: delay.
  delay: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию statColor.
function statColor(value: number): string {
  // Проверяем бизнес-условие: value < 40.
  if (value < 40) {
    // Возвращаем результат: var(--color-accent-danger).
    return "var(--color-accent-danger)";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: value <= 70.
  if (value <= 70) {
    // Возвращаем результат: var(--color-accent-warning).
    return "var(--color-accent-warning)";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: var(--color-accent-primary).
  return "var(--color-accent-primary)";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию StatRow.
function StatRow({ icon: Icon, label, value, compact, delay }: StatRowProps) {
  // Обрабатываем конструкцию: const color = statColor(value).
  const color = statColor(value);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex items-center gap-2> <Icon aria-hi….
  return (
    // Обрабатываем конструкцию: <div className=flex items-center gap-2>.
    <div className="flex items-center gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <Icon aria-hidden="true" className="text-text-tertiary size-3 shrink-0" />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {!compact ? (
        // Сохраняем пояснение разработчика: // Колонка подписи шире прежних 56 px: «Стабильность» при 10…
        // Колонка подписи шире прежних 56 px: «Стабильность» при 10 px
        // Сохраняем пояснение разработчика: // занимает около 62 px и вылезала из своей ячейки прямо на …
        // занимает около 62 px и вылезала из своей ячейки прямо на полоску.
        // Сохраняем пояснение разработчика: // Обрезка по многоточию оставлена на случай ещё более длинн…
        // Обрезка по многоточию оставлена на случай ещё более длинного перевода.
        // Обрабатываем конструкцию: <span className=text-text-tertiary w-[4.75rem] shrink-0….
        <span className="text-text-tertiary w-[4.75rem] shrink-0 truncate text-[10px]">
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="bg-glass-hover h-1 min-w-0 flex-1 overflow-hidden rounded-full">
        {/* Выводим текстовое содержимое в JSX. */}
        {/*
          // Продолжаем выражение.
          Полоска растёт через scaleX, а не width: ширина гоняет
          // Продолжаем выражение.
          пересчёт макета каждой карточки, трансформа — только композит.
          // Продолжаем выражение.
          На сетке из десятков карточек это заметно на прокрутке.
        // Сохраняем пояснение разработчика: * /}
        */}
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.span
          // Обрабатываем конструкцию: className.
          className="block h-full w-full origin-left rounded-full"
          // Обрабатываем конструкцию: style.
          style={{ backgroundColor: color, width: `${value}%` }}
          // Обрабатываем конструкцию: initial.
          initial={{ scaleX: 0 }}
          // Обрабатываем конструкцию: animate.
          animate={{ scaleX: 1 }}
          // Обрабатываем конструкцию: transition.
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {!compact ? (
        // Обрабатываем конструкцию: <span className=w-6 shrink-0 text-right text-[10px] fon….
        <span
          // Обрабатываем конструкцию: className.
          className="w-6 shrink-0 text-right text-[10px] font-medium tabular-nums"
          // Обрабатываем конструкцию: style.
          style={{ color }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {value}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface CardStatsBarsProps {
  // Обрабатываем конструкцию: stats.
  stats: CardStats;
  // Обрабатываем конструкцию: compact.
  compact?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию CardStatsBars.
function CardStatsBars({ stats, compact = false }: CardStatsBarsProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Возвращаем результат: ( <div className={cn(flex flex-col gap-1.5, compact && ….
  return (
    // Обрабатываем конструкцию: <div className={cn(flex flex-col gap-1.5, compact && ga….
    <div className={cn("flex flex-col gap-1.5", compact && "gap-1")}>
      {/* Выводим текстовое содержимое в JSX. */}
      <StatRow
        // Обрабатываем конструкцию: icon.
        icon={Zap}
        // Обрабатываем конструкцию: label.
        label={t("strategies.stats.speed")}
        // Обрабатываем конструкцию: value.
        value={stats.speed}
        // Обрабатываем конструкцию: compact.
        compact={compact}
        // Обрабатываем конструкцию: delay.
        delay={0}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <StatRow
        // Обрабатываем конструкцию: icon.
        icon={Activity}
        // Обрабатываем конструкцию: label.
        label={t("strategies.stats.stability")}
        // Обрабатываем конструкцию: value.
        value={stats.stability}
        // Обрабатываем конструкцию: compact.
        compact={compact}
        // Обрабатываем конструкцию: delay.
        delay={0.08}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <StatRow
        // Обрабатываем конструкцию: icon.
        icon={Globe}
        // Обрабатываем конструкцию: label.
        label={t("strategies.stats.coverage")}
        // Обрабатываем конструкцию: value.
        value={stats.coverage}
        // Обрабатываем конструкцию: compact.
        compact={compact}
        // Обрабатываем конструкцию: delay.
        delay={0.16}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default CardStatsBars;.
export default CardStatsBars;
// — разделитель логических блоков —
