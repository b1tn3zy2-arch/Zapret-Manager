// Импортируем зависимости из модуля react.
import {
  // Подключаем именованный импорт forwardRef.
  forwardRef,
  // Подключаем именованный импорт useCallback.
  useCallback,
  // Подключаем именованный импорт useEffect.
  useEffect,
  // Подключаем именованный импорт useImperativeHandle.
  useImperativeHandle,
  // Подключаем именованный импорт useRef.
  useRef,
  // Закрываем текущий блок.
} from "react";
// Импортируем зависимости из модуля @tanstack/react-virtual.
import { useVirtualizer } from "@tanstack/react-virtual";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/logs/LogRow.
import LogRow from "@/components/logs/LogRow";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт AUTOSCROLL_THRESHOLD_PX.
  AUTOSCROLL_THRESHOLD_PX,
  // Подключаем именованный импорт LOG_OVERSCAN.
  LOG_OVERSCAN,
  // Подключаем именованный импорт LOG_ROW_HEIGHT.
  LOG_ROW_HEIGHT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { LogEntry } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogListHandle {
  // Обрабатываем конструкцию: scrollToBottom.
  scrollToBottom: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogListProps {
  // Обрабатываем конструкцию: logs.
  logs: LogEntry[];
  // Обрабатываем конструкцию: query.
  query?: string | undefined;
  // Обрабатываем конструкцию: autoScroll.
  autoScroll: boolean;
  // Обрабатываем конструкцию: onAutoScrollChange.
  onAutoScrollChange: (value: boolean) => void;
  // Обрабатываем конструкцию: onCopy.
  onCopy: (entry: LogEntry) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LogList = forwardRef<LogListHandle, LogListProps>….
const LogList = forwardRef<LogListHandle, LogListProps>(function LogList(
  // Объявляем параметр { logs, query, autoScroll, onAutoScrollC… функции.
  { logs, query, autoScroll, onAutoScrollChange, onCopy },
  // Объявляем параметр ref функции.
  ref
  // Закрываем выражение или список аргументов.
) {
  // Обрабатываем конструкцию: const parentRef = useRef<HTMLDivElement>(null).
  const parentRef = useRef<HTMLDivElement>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const virtualizer = useVirtualizer({ count: logs.length….
  const virtualizer = useVirtualizer({
    // Обрабатываем конструкцию: count.
    count: logs.length,
    // Обрабатываем конструкцию: getScrollElement.
    getScrollElement: () => parentRef.current,
    // Обрабатываем конструкцию: estimateSize.
    estimateSize: () => LOG_ROW_HEIGHT,
    // Обрабатываем конструкцию: overscan.
    overscan: LOG_OVERSCAN,
    // Обрабатываем конструкцию: getItemKey.
    getItemKey: (index) => logs[index]?.id ?? index,
    // Закрываем текущий блок.
  });
  // Обрабатываем конструкцию: const scrollToBottom = useCallback(() => { if (logs.len….
  const scrollToBottom = useCallback(() => {
    // Проверяем бизнес-условие: logs.length === 0.
    if (logs.length === 0) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: virtualizer.
    virtualizer.scrollToIndex(logs.length - 1, {
      // Обрабатываем конструкцию: align.
      align: "end",
      // Обрабатываем конструкцию: behavior.
      behavior: "auto",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, [logs.length, virtualizer]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useImperativeHandle.
  useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: autoScroll.
    if (autoScroll) {
      // Обрабатываем конструкцию: scrollToBottom.
      scrollToBottom();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [autoScroll, scrollToBottom]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleScroll = useCallback(() => { const element ….
  const handleScroll = useCallback(() => {
    // Обрабатываем конструкцию: const element = parentRef.current.
    const element = parentRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: element === null.
    if (element === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const distance = element.scrollHeight - element.scrollT….
    const distance =
      // Обрабатываем конструкцию: element.
      element.scrollHeight - element.scrollTop - element.clientHeight;
    // Обрабатываем конструкцию: const atBottom = distance <= AUTOSCROLL_THRESHOLD_PX.
    const atBottom = distance <= AUTOSCROLL_THRESHOLD_PX;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: atBottom !== autoScroll.
    if (atBottom !== autoScroll) {
      // Обрабатываем конструкцию: onAutoScrollChange.
      onAutoScrollChange(atBottom);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [autoScroll, onAutoScrollChange]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const items = virtualizer.getVirtualItems().
  const items = virtualizer.getVirtualItems();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div ref={parentRef} onScroll={handleScroll} classNam….
  return (
    // Обрабатываем конструкцию: <div ref={parentRef} onScroll={handleScroll} className=….
    <div
      // Обрабатываем конструкцию: ref.
      ref={parentRef}
      // Обрабатываем конструкцию: onScroll.
      onScroll={handleScroll}
      // Обрабатываем конструкцию: className.
      className="logs-container min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {/* Выводим текстовое содержимое в JSX. */}
        {items.map((item) => {
          // Обрабатываем конструкцию: const entry = logs[item.index].
          const entry = logs[item.index];
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: entry === undefined.
          if (entry === undefined) {
            // Возвращаем результат: null.
            return null;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Возвращаем результат: ( <div key={entry.id} style={{ position: absolute, top:….
          return (
            // Обрабатываем конструкцию: <div key={entry.id} style={{ position: absolute, top: 0….
            <div
              // Обрабатываем конструкцию: key.
              key={entry.id}
              // Обрабатываем конструкцию: style.
              style={{
                // Обрабатываем конструкцию: position.
                position: "absolute",
                // Обрабатываем конструкцию: top.
                top: 0,
                // Обрабатываем конструкцию: left.
                left: 0,
                // Обрабатываем конструкцию: width.
                width: "100%",
                // Обрабатываем конструкцию: height.
                height: LOG_ROW_HEIGHT,
                // Обрабатываем конструкцию: transform.
                transform: `translateY(${item.start}px)`,
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <LogRow
                // Обрабатываем конструкцию: entry.
                entry={entry}
                // Обрабатываем конструкцию: query.
                query={query}
                // Обрабатываем конструкцию: isEven.
                isEven={item.index % 2 === 0}
                // Обрабатываем конструкцию: onCopy.
                onCopy={onCopy}
                // Продолжаем выражение.
              />
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            // Закрываем выражение или список аргументов.
          );
          // Закрываем текущий блок.
        })}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LogList;.
export default LogList;
// — разделитель логических блоков —
