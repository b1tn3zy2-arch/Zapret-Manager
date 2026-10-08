import { useMemo } from "react";

import { LOG_LEVELS, LOG_SOURCES } from "@/lib/constants";
import {
  selectErrorCount,
  selectLogFilter,
  selectLogs,
  useLogsStore,
} from "@/stores/useLogsStore";
import type { LogEntry, LogFilter, LogLevel, LogSource } from "@/types";

export type LevelCounts = Record<LogLevel, number>;

export type SourceCounts = Record<LogSource, number>;

function countBy<TLevel extends LogLevel | LogSource>(
  logs: LogEntry[],
  key: (entry: LogEntry) => TLevel,
  levels: readonly TLevel[]
): Record<TLevel, number> {
  const counts = Object.fromEntries(
    levels.map((level) => [level, 0])
  ) as Record<TLevel, number>;

  for (const entry of logs) {
    const bucket = key(entry);
    counts[bucket] += 1;
  }

  return counts;
}

export function useFilteredLogs(): LogEntry[] {
  const logs = useLogsStore(selectLogs);
  const filter = useLogsStore(selectLogFilter);

  return useMemo(() => filterLogs(logs, filter), [logs, filter]);
}

function filterLogs(logs: LogEntry[], filter: LogFilter): LogEntry[] {
  const search = filter.search?.trim().toLowerCase();

  if (
    filter.levels === undefined &&
    filter.sources === undefined &&
    filter.strategyId === undefined &&
    (search === undefined || search === "")
  ) {
    return logs;
  }

  return logs.filter((entry) => {
    if (filter.levels !== undefined && !filter.levels.includes(entry.level)) {
      return false;
    }

    if (
      filter.sources !== undefined &&
      !filter.sources.includes(entry.source)
    ) {
      return false;
    }

    if (
      filter.strategyId !== undefined &&
      entry.strategyId !== filter.strategyId
    ) {
      return false;
    }

    if (search !== undefined && search !== "") {
      return entry.message.toLowerCase().includes(search);
    }

    return true;
  });
}

export function useLogLevelCounts(): LevelCounts {
  const logs = useLogsStore(selectLogs);

  return useMemo(
    () => countBy(logs, (entry) => entry.level, LOG_LEVELS),
    [logs]
  );
}

export function useLogSourceCounts(): SourceCounts {
  const logs = useLogsStore(selectLogs);

  return useMemo(
    () => countBy(logs, (entry) => entry.source, LOG_SOURCES),
    [logs]
  );
}

export function useFilterActive(): boolean {
  const filter = useLogsStore(selectLogFilter);

  return useMemo(() => {
    const search = filter.search?.trim() ?? "";

    return (
      (filter.levels?.length ?? 0) > 0 ||
      (filter.sources?.length ?? 0) > 0 ||
      filter.strategyId !== undefined ||
      search !== ""
    );
  }, [filter]);
}

export function useErrorsCount(): number {
  return useLogsStore(selectErrorCount);
}

export function useLogsCount(): number {
  return useLogsStore(selectLogs).length;
}
