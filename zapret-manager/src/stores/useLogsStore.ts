// Импортируем зависимости из модуля nanoid.
import { nanoid } from "nanoid";
// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля zustand/middleware/immer.
import { immer } from "zustand/middleware/immer";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/defaults.
import { DEFAULT_LOG_BUFFER_SIZE } from "@/lib/defaults";
// Импортируем зависимости из модуля @/lib/constants.
import { LOG_FLUSH_IDLE_TIMEOUT_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { LogEntry, LogFilter, NewLogEntry } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FLUSH_THRESHOLD = 50.
const FLUSH_THRESHOLD = 50;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogsStoreState {
  // Обрабатываем конструкцию: logs.
  logs: LogEntry[];
  // Обрабатываем конструкцию: pendingBatch.
  pendingBatch: LogEntry[];
  // Обрабатываем конструкцию: bufferSize.
  bufferSize: number;
  // Обрабатываем конструкцию: filter.
  filter: LogFilter;
  // Обрабатываем конструкцию: addLog.
  addLog: (entry: NewLogEntry) => void;
  // Обрабатываем конструкцию: addLogs.
  addLogs: (entries: NewLogEntry[]) => void;
  // Обрабатываем конструкцию: clearLogs.
  clearLogs: () => void;
  // Обрабатываем конструкцию: setFilter.
  setFilter: (filter: Partial<LogFilter>) => void;
  // Обрабатываем конструкцию: resetFilter.
  resetFilter: () => void;
  // Обрабатываем конструкцию: setBufferSize.
  setBufferSize: (size: number) => void;
  // Обрабатываем конструкцию: flush.
  flush: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем псевдоним типа LogsDraft.
type LogsDraft = LogsStoreState;
// — разделитель логических блоков —

// Объявляем функцию promote.
function promote(state: LogsDraft): void {
  // Проверяем бизнес-условие: state.pendingBatch.length === 0.
  if (state.pendingBatch.length === 0) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: state.
  state.logs.push(...state.pendingBatch);
  // Обрабатываем конструкцию: state.
  state.pendingBatch = [];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: state.logs.length > state.bufferSize.
  if (state.logs.length > state.bufferSize) {
    // Обрабатываем конструкцию: state.
    state.logs.splice(0, state.logs.length - state.bufferSize);
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию toEntry.
function toEntry(entry: NewLogEntry): LogEntry {
  // Возвращаем результат: { id: nanoid(), timestamp: entry.timestamp ?? Date.now(….
  return {
    // Обрабатываем конструкцию: id.
    id: nanoid(),
    // Обрабатываем конструкцию: timestamp.
    timestamp: entry.timestamp ?? Date.now(),
    // Обрабатываем конструкцию: level.
    level: entry.level,
    // Обрабатываем конструкцию: source.
    source: entry.source,
    // Обрабатываем конструкцию: message.
    message: entry.message,
    // Обрабатываем конструкцию: strategyId.
    strategyId: entry.strategyId,
    // Обрабатываем конструкцию: metadata.
    metadata: entry.metadata,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию logsEnabled.
function logsEnabled(): boolean {
  // Возвращаем результат: useSettingsStore.getState().settings.general.enableLogs.
  return useSettingsStore.getState().settings.general.enableLogs;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useLogsStore = create<LogsStoreState>()(
  // Обрабатываем конструкцию: immer.
  immer((set) => ({
    // Обрабатываем конструкцию: logs.
    logs: [],
    // Обрабатываем конструкцию: pendingBatch.
    pendingBatch: [],
    // Обрабатываем конструкцию: bufferSize.
    bufferSize: DEFAULT_LOG_BUFFER_SIZE,
    // Обрабатываем конструкцию: filter.
    filter: {},
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: addLog.
    addLog: (entry) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Проверяем бизнес-условие: !logsEnabled().
        if (!logsEnabled()) {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: state.
        state.pendingBatch.push(toEntry(entry));
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: state.pendingBatch.length >= FLUSH_THRESHOLD.
        if (state.pendingBatch.length >= FLUSH_THRESHOLD) {
          // Обрабатываем конструкцию: promote.
          promote(state);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: addLogs.
    addLogs: (entries) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Проверяем бизнес-условие: !logsEnabled().
        if (!logsEnabled()) {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Перебираем элементы коллекции entries.
        for (const entry of entries) {
          // Обрабатываем конструкцию: state.
          state.pendingBatch.push(toEntry(entry));
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: promote.
        promote(state);
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: flush.
    flush: () =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: promote.
        promote(state);
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: clearLogs.
    clearLogs: () =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.logs = [];
        // Обрабатываем конструкцию: state.
        state.pendingBatch = [];
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setFilter.
    setFilter: (filter) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.filter = { ...state.filter, ...filter };
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: resetFilter.
    resetFilter: () =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.filter = {};
        // Закрываем текущий блок.
      }),
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setBufferSize.
    setBufferSize: (size) =>
      // Обрабатываем конструкцию: set.
      set((state) => {
        // Обрабатываем конструкцию: state.
        state.bufferSize = Math.max(1, size);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: state.logs.length > state.bufferSize.
        if (state.logs.length > state.bufferSize) {
          // Обрабатываем конструкцию: state.
          state.logs.splice(0, state.logs.length - state.bufferSize);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }),
    // Закрываем текущий блок.
  }))
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: let cancelScheduledFlush: (() => void) | undefined.
let cancelScheduledFlush: (() => void) | undefined;
// — разделитель логических блоков —

// Объявляем функцию flushPending.
function flushPending(): void {
  // Обрабатываем конструкцию: const store = useLogsStore.getState().
  const store = useLogsStore.getState();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: store.pendingBatch.length > 0.
  if (store.pendingBatch.length > 0) {
    // Обрабатываем конструкцию: store.
    store.flush();
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: scheduleFlush.
  scheduleFlush();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию scheduleFlush.
function scheduleFlush(): void {
  // Проверяем бизнес-условие: typeof window === undefined.
  if (typeof window === "undefined") {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof window.requestIdleCallback === function.
  if (typeof window.requestIdleCallback === "function") {
    // Обрабатываем конструкцию: const handle = window.requestIdleCallback(flushPending,….
    const handle = window.requestIdleCallback(flushPending, {
      // Обрабатываем конструкцию: timeout.
      timeout: LOG_FLUSH_IDLE_TIMEOUT_MS,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: cancelScheduledFlush.
    cancelScheduledFlush = () => {
      // Обрабатываем конструкцию: window.
      window.cancelIdleCallback(handle);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const timer = window.setTimeout(flushPending, LOG_FLUSH….
  const timer = window.setTimeout(flushPending, LOG_FLUSH_IDLE_TIMEOUT_MS);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: cancelScheduledFlush.
  cancelScheduledFlush = () => {
    // Обрабатываем конструкцию: window.
    window.clearTimeout(timer);
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function startLogsFlusher(): void {
  // Проверяем бизнес-условие: cancelScheduledFlush !== undefined.
  if (cancelScheduledFlush !== undefined) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: scheduleFlush.
  scheduleFlush();
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function stopLogsFlusher(): void {
  // Обрабатываем конструкцию: cancelScheduledFlush.
  cancelScheduledFlush?.();
  // Обрабатываем конструкцию: cancelScheduledFlush.
  cancelScheduledFlush = undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectLogs = (state: LogsStoreState): LogEntry[] => state.logs;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const selectLogFilter = (state: LogsStoreState): LogFilter =>
  // Обрабатываем конструкцию: state.
  state.filter;
// — разделитель логических блоков —
