// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { LOG_LEVELS, LOG_SOURCES } from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import {
  // Подключаем именованный импорт selectLogFilter.
  selectLogFilter,
  // Подключаем именованный импорт selectLogs.
  selectLogs,
  // Подключаем именованный импорт useLogsStore.
  useLogsStore,
  // Закрываем текущий блок.
} from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/types.
import type { LogEntry, LogFilter, LogLevel, LogSource } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type LevelCounts = Record<LogLevel, number>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type SourceCounts = Record<LogSource, number>;
// — разделитель логических блоков —

// Объявляем функцию countBy.
function countBy<TLevel extends LogLevel | LogSource>(
  // Обрабатываем конструкцию: logs.
  logs: LogEntry[],
  // Обрабатываем конструкцию: key.
  key: (entry: LogEntry) => TLevel,
  // Обрабатываем конструкцию: levels.
  levels: readonly TLevel[]
  // Закрываем выражение или список аргументов.
): Record<TLevel, number> {
  // Обрабатываем конструкцию: const counts = Object.fromEntries( levels.map((level) =….
  const counts = Object.fromEntries(
    // Обрабатываем конструкцию: levels.
    levels.map((level) => [level, 0])
    // Закрываем выражение или список аргументов.
  ) as Record<TLevel, number>;
  // — разделитель логических блоков —

  // Перебираем элементы коллекции logs.
  for (const entry of logs) {
    // Обрабатываем конструкцию: const bucket = key(entry).
    const bucket = key(entry);
    // Обрабатываем конструкцию: counts.
    counts[bucket] += 1;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: counts.
  return counts;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useFilteredLogs(): LogEntry[] {
  // Обрабатываем конструкцию: const logs = useLogsStore(selectLogs).
  const logs = useLogsStore(selectLogs);
  // Обрабатываем конструкцию: const filter = useLogsStore(selectLogFilter).
  const filter = useLogsStore(selectLogFilter);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => filterLogs(logs, filter), [logs, filter]).
  return useMemo(() => filterLogs(logs, filter), [logs, filter]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию filterLogs.
function filterLogs(logs: LogEntry[], filter: LogFilter): LogEntry[] {
  // Обрабатываем конструкцию: const search = filter.search?.trim().toLowerCase().
  const search = filter.search?.trim().toLowerCase();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: filter.levels === undefined && filter.sources === undef….
  if (
    // Обрабатываем конструкцию: filter.
    filter.levels === undefined &&
    // Обрабатываем конструкцию: filter.
    filter.sources === undefined &&
    // Обрабатываем конструкцию: filter.
    filter.strategyId === undefined &&
    // Обрабатываем конструкцию: (search === undefined || search === ).
    (search === undefined || search === "")
    // Закрываем выражение или список аргументов.
  ) {
    // Возвращаем результат: logs.
    return logs;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: logs.filter((entry) => { if (filter.levels !== undefine….
  return logs.filter((entry) => {
    // Проверяем бизнес-условие: filter.levels !== undefined && !filter.levels.includes(….
    if (filter.levels !== undefined && !filter.levels.includes(entry.level)) {
      // Возвращаем результат: false.
      return false;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: filter.sources !== undefined && !filter.sources.include….
    if (
      // Обрабатываем конструкцию: filter.
      filter.sources !== undefined &&
      // Изменяем значение выражения !filter.sources.includes(entry.source).
      !filter.sources.includes(entry.source)
      // Закрываем выражение или список аргументов.
    ) {
      // Возвращаем результат: false.
      return false;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: filter.strategyId !== undefined && entry.strategyId !==….
    if (
      // Обрабатываем конструкцию: filter.
      filter.strategyId !== undefined &&
      // Обрабатываем конструкцию: entry.
      entry.strategyId !== filter.strategyId
      // Закрываем выражение или список аргументов.
    ) {
      // Возвращаем результат: false.
      return false;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: search !== undefined && search !==.
    if (search !== undefined && search !== "") {
      // Возвращаем результат: entry.message.toLowerCase().includes(search).
      return entry.message.toLowerCase().includes(search);
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: true.
    return true;
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useLogLevelCounts(): LevelCounts {
  // Обрабатываем конструкцию: const logs = useLogsStore(selectLogs).
  const logs = useLogsStore(selectLogs);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo( () => countBy(logs, (entry) => entry.level, LO….
  return useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => countBy(logs, (entry) => entry.level, LOG_LEVELS),
    // Открываем массив.
    [logs]
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useLogSourceCounts(): SourceCounts {
  // Обрабатываем конструкцию: const logs = useLogsStore(selectLogs).
  const logs = useLogsStore(selectLogs);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo( () => countBy(logs, (entry) => entry.source, L….
  return useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => countBy(logs, (entry) => entry.source, LOG_SOURCES),
    // Открываем массив.
    [logs]
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useFilterActive(): boolean {
  // Обрабатываем конструкцию: const filter = useLogsStore(selectLogFilter).
  const filter = useLogsStore(selectLogFilter);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { const search = filter.search?.trim() ??….
  return useMemo(() => {
    // Обрабатываем конструкцию: const search = filter.search?.trim() ??.
    const search = filter.search?.trim() ?? "";
    // — разделитель логических блоков —

    // Возвращаем результат: ( (filter.levels?.length ?? 0) > 0 || (filter.sources?.….
    return (
      // Обрабатываем конструкцию: (filter.levels?.length ?? 0).
      (filter.levels?.length ?? 0) > 0 ||
      // Обрабатываем конструкцию: (filter.sources?.length ?? 0).
      (filter.sources?.length ?? 0) > 0 ||
      // Обрабатываем конструкцию: filter.
      filter.strategyId !== undefined ||
      // Обрабатываем конструкцию: search.
      search !== ""
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }, [filter]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useLogsCount(): number {
  // Возвращаем результат: useLogsStore(selectLogs).length.
  return useLogsStore(selectLogs).length;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
