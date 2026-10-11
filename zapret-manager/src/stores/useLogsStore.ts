import { nanoid } from "nanoid";
import { create } from "zustand";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { immer } from "zustand/middleware/immer";

import { DEFAULT_LOG_BUFFER_SIZE } from "@/lib/defaults";
import { LOG_FLUSH_IDLE_TIMEOUT_MS } from "@/lib/constants";
import type { LogEntry, LogFilter, NewLogEntry } from "@/types";

const FLUSH_THRESHOLD = 50;

export interface LogsStoreState {
  logs: LogEntry[];
  pendingBatch: LogEntry[];
  bufferSize: number;
  filter: LogFilter;
  addLog: (entry: NewLogEntry) => void;
  addLogs: (entries: NewLogEntry[]) => void;
  clearLogs: () => void;
  setFilter: (filter: Partial<LogFilter>) => void;
  resetFilter: () => void;
  setBufferSize: (size: number) => void;
  flush: () => void;
}

type LogsDraft = LogsStoreState;

function promote(state: LogsDraft): void {
  if (state.pendingBatch.length === 0) {
    return;
  }

  state.logs.push(...state.pendingBatch);
  state.pendingBatch = [];

  if (state.logs.length > state.bufferSize) {
    state.logs.splice(0, state.logs.length - state.bufferSize);
  }
}

function toEntry(entry: NewLogEntry): LogEntry {
  return {
    id: nanoid(),
    timestamp: entry.timestamp ?? Date.now(),
    level: entry.level,
    source: entry.source,
    message: entry.message,
    strategyId: entry.strategyId,
    metadata: entry.metadata,
  };
}

function logsEnabled(): boolean {
  return useSettingsStore.getState().settings.general.enableLogs;
}

export const useLogsStore = create<LogsStoreState>()(
  immer((set) => ({
    logs: [],
    pendingBatch: [],
    bufferSize: DEFAULT_LOG_BUFFER_SIZE,
    filter: {},

    addLog: (entry) =>
      set((state) => {
        if (!logsEnabled()) {
          return;
        }

        state.pendingBatch.push(toEntry(entry));

        if (state.pendingBatch.length >= FLUSH_THRESHOLD) {
          promote(state);
        }
      }),

    addLogs: (entries) =>
      set((state) => {
        if (!logsEnabled()) {
          return;
        }

        for (const entry of entries) {
          state.pendingBatch.push(toEntry(entry));
        }

        promote(state);
      }),

    flush: () =>
      set((state) => {
        promote(state);
      }),

    clearLogs: () =>
      set((state) => {
        state.logs = [];
        state.pendingBatch = [];
      }),

    setFilter: (filter) =>
      set((state) => {
        state.filter = { ...state.filter, ...filter };
      }),

    resetFilter: () =>
      set((state) => {
        state.filter = {};
      }),

    setBufferSize: (size) =>
      set((state) => {
        state.bufferSize = Math.max(1, size);

        if (state.logs.length > state.bufferSize) {
          state.logs.splice(0, state.logs.length - state.bufferSize);
        }
      }),
  }))
);

let cancelScheduledFlush: (() => void) | undefined;

function flushPending(): void {
  const store = useLogsStore.getState();

  if (store.pendingBatch.length > 0) {
    store.flush();
  }

  scheduleFlush();
}

function scheduleFlush(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(flushPending, {
      timeout: LOG_FLUSH_IDLE_TIMEOUT_MS,
    });

    cancelScheduledFlush = () => {
      window.cancelIdleCallback(handle);
    };

    return;
  }

  const timer = window.setTimeout(flushPending, LOG_FLUSH_IDLE_TIMEOUT_MS);

  cancelScheduledFlush = () => {
    window.clearTimeout(timer);
  };
}

export function startLogsFlusher(): void {
  if (cancelScheduledFlush !== undefined) {
    return;
  }

  scheduleFlush();
}

export function stopLogsFlusher(): void {
  cancelScheduledFlush?.();
  cancelScheduledFlush = undefined;
}

export const selectLogs = (state: LogsStoreState): LogEntry[] => state.logs;

export const selectLogFilter = (state: LogsStoreState): LogFilter =>
  state.filter;

export function selectErrorCount(state: LogsStoreState): number {
  return state.logs.filter((entry) => entry.level === "error").length;
}
