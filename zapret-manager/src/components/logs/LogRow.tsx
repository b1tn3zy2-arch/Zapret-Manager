// Импортируем зависимости из модуля react.
import { memo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/logs/HighlightText.
import HighlightText from "@/components/logs/HighlightText";
// Импортируем зависимости из модуля @/lib/constants.
import { LOG_LEVEL_CLASSES, LOG_ROW_HEIGHT } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/format.
import { formatLogLine, formatLogTime } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { LogEntry } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TIME_WIDTH = 86px.
const TIME_WIDTH = "86px";
// Обрабатываем конструкцию: const LEVEL_WIDTH = 58px.
const LEVEL_WIDTH = "58px";
// Обрабатываем конструкцию: const SOURCE_WIDTH = 74px.
const SOURCE_WIDTH = "74px";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogRowProps {
  // Обрабатываем конструкцию: entry.
  entry: LogEntry;
  // Обрабатываем конструкцию: query.
  query?: string | undefined;
  // Обрабатываем конструкцию: isEven.
  isEven: boolean;
  // Обрабатываем конструкцию: onCopy.
  onCopy: (entry: LogEntry) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию LogRowImpl.
function LogRowImpl({ entry, query, isEven, onCopy }: LogRowProps) {
  // Возвращаем результат: ( <button type=button title={formatLogLine(entry)} onCl….
  return (
    // Обрабатываем конструкцию: <button type=button title={formatLogLine(entry)} onClic….
    <button
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: title.
      title={formatLogLine(entry)}
      // Обрабатываем конструкцию: onClick.
      onClick={() => {
        // Обрабатываем конструкцию: onCopy.
        onCopy(entry);
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: style.
      style={{
        // Обрабатываем конструкцию: height.
        height: LOG_ROW_HEIGHT,
        // Обрабатываем конструкцию: backgroundColor.
        backgroundColor: isEven ? "transparent" : "var(--color-glass-bg)",
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: log-row text-text-secondary hover:bg-glass-hover focus-….
        "log-row text-text-secondary hover:bg-glass-hover focus-visible:bg-glass-hover",
        // Обрабатываем конструкцию: flex w-full cursor-pointer items-center gap-2 px-3 text….
        "flex w-full cursor-pointer items-center gap-2 px-3 text-left",
        // Обрабатываем конструкцию: font-mono text-xs whitespace-nowrap focus-visible:outli….
        "font-mono text-xs whitespace-nowrap focus-visible:outline-none"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className="log-row__time text-text-tertiary shrink-0 tabular-nums"
        // Обрабатываем конструкцию: style.
        style={{ width: TIME_WIDTH }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {formatLogTime(entry.timestamp)}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: log-row__level shrink-0 font-medium uppercase.
          "log-row__level shrink-0 font-medium uppercase",
          // Обрабатываем конструкцию: LOG_LEVEL_CLASSES.
          LOG_LEVEL_CLASSES[entry.level]
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: style.
        style={{ width: LEVEL_WIDTH }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {entry.level}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className="log-row__source text-text-tertiary shrink-0 truncate"
        // Обрабатываем конструкцию: style.
        style={{ width: SOURCE_WIDTH }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {entry.source}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="min-w-0 flex-1 truncate">
        {/* Выводим текстовое содержимое в JSX. */}
        <HighlightText text={entry.message} query={query} />
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </button>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LogRow = memo(LogRowImpl).
const LogRow = memo(LogRowImpl);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LogRow;.
export default LogRow;
// — разделитель логических блоков —
