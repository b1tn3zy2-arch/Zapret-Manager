// Импортируем зависимости из модуля react.
import { memo } from "react";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { ArrowRight, ScrollText } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт ANIMATION.
  ANIMATION,
  // Подключаем именованный импорт LOG_LEVEL_CLASSES.
  LOG_LEVEL_CLASSES,
  // Подключаем именованный импорт RECENT_LOGS_COUNT.
  RECENT_LOGS_COUNT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/format.
import { formatLogTime } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/types.
import type { LogEntry } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DashboardRecentLogsProps {
  // Обрабатываем конструкцию: onOpenAllLogs.
  onOpenAllLogs: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ROW_STAGGER_S = 0.04.
const ROW_STAGGER_S = 0.04;
// Обрабатываем конструкцию: const ROW_STAGGER_LIMIT = 0.2.
const ROW_STAGGER_LIMIT = 0.2;
// — разделитель логических блоков —

// Объявляем интерфейс RecentRowProps с контрактом данных.
interface RecentRowProps {
  // Обрабатываем конструкцию: entry.
  entry: LogEntry;
  // Обрабатываем конструкцию: index.
  index: number;
  // Обрабатываем конструкцию: reducedMotion.
  reducedMotion: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию RecentRow.
function RecentRow({ entry, index, reducedMotion }: RecentRowProps) {
  // Обрабатываем конструкцию: const delay = reducedMotion ? 0 : Math.min(index * ROW_….
  const delay = reducedMotion
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      0
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      Math.min(index * ROW_STAGGER_S, ROW_STAGGER_LIMIT);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <motion.div initial={reducedMotion ? false : { opacit….
  return (
    // Обрабатываем конструкцию: <motion.div initial={reducedMotion ? false : { opacity:….
    <motion.div
      // Обрабатываем конструкцию: initial.
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      // Обрабатываем конструкцию: animate.
      animate={{ opacity: 1, y: 0 }}
      // Обрабатываем конструкцию: {...(reducedMotion ? {} : { exit: { opacity: 0 } })}.
      {...(reducedMotion ? {} : { exit: { opacity: 0 } })}
      // Обрабатываем конструкцию: transition.
      transition={{ duration: ANIMATION.fast, delay }}
      // Обрабатываем конструкцию: className.
      className="flex items-center gap-2 text-xs"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary shrink-0 font-mono">
        {/* Выводим текстовое содержимое в JSX. */}
        {formatLogTime(entry.timestamp)}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: w-16 shrink-0 font-medium uppercase.
          "w-16 shrink-0 font-medium uppercase",
          // Обрабатываем конструкцию: LOG_LEVEL_CLASSES.
          LOG_LEVEL_CLASSES[entry.level]
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {entry.level}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-secondary truncate" title={entry.message}>
        {/* Выводим текстовое содержимое в JSX. */}
        {entry.message}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию DashboardRecentLogs.
function DashboardRecentLogs({ onOpenAllLogs }: DashboardRecentLogsProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const logs = useLogsStore((state) => state.logs).
  const logs = useLogsStore((state) => state.logs);
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // Обрабатываем конструкцию: const recent = logs.slice(-RECENT_LOGS_COUNT).reverse().
  const recent = logs.slice(-RECENT_LOGS_COUNT).reverse();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=lg className=flex flex-col gap-4>….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=lg className=flex flex-col gap-4>.
    <GlassPanel padding="lg" className="flex flex-col gap-4">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex items-center justify-between gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <h3 className="text-text-primary text-base font-semibold">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.recentLogs.title")}
          {/* Выводим текстовое содержимое в JSX. */}
        </h3>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: onClick.
          onClick={onOpenAllLogs}
          // Обрабатываем конструкцию: iconRight.
          iconRight={<ArrowRight aria-hidden="true" className="size-3.5" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.recentLogs.openAll")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {recent.length === 0 ? (
        // Обрабатываем конструкцию: <div className=text-text-tertiary flex flex-col items-c….
        <div className="text-text-tertiary flex flex-col items-center gap-2 py-6 text-center">
          {/* Выводим текстовое содержимое в JSX. */}
          <ScrollText
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className="size-6"
            // Обрабатываем конструкцию: strokeWidth.
            strokeWidth={1.75}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="sm">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.recentLogs.empty")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Обрабатываем конструкцию: <div className=flex flex-col gap-1.5>.
        <div className="flex flex-col gap-1.5">
          {/* Выводим текстовое содержимое в JSX. */}
          <AnimatePresence initial={false}>
            {/* Выводим текстовое содержимое в JSX. */}
            {recent.map((entry, index) => (
              // Рендерим самозакрывающийся элемент RecentRow.
              <RecentRow
                // Обрабатываем конструкцию: key.
                key={entry.id}
                // Обрабатываем конструкцию: entry.
                entry={entry}
                // Обрабатываем конструкцию: index.
                index={index}
                // Обрабатываем конструкцию: reducedMotion.
                reducedMotion={reducedMotion}
                // Продолжаем выражение.
              />
              // Закрываем выражение или список аргументов.
            ))}
            {/* Выводим текстовое содержимое в JSX. */}
          </AnimatePresence>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MemoDashboardRecentLogs = memo(DashboardRecentLog….
const MemoDashboardRecentLogs = memo(DashboardRecentLogs);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default MemoDashboardRecentLogs;.
export default MemoDashboardRecentLogs;
// — разделитель логических блоков —
