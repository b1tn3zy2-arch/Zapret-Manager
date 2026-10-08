export type LogLevel = "info" | "warn" | "error" | "success" | "debug";

export type LogSource = "system" | "strategy" | "user" | "vpn";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: LogSource;
  message: string;
  strategyId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export type NewLogEntry = Omit<LogEntry, "id" | "timestamp"> &
  Partial<Pick<LogEntry, "timestamp">>;

export interface LogFilter {
  levels?: LogLevel[] | undefined;
  sources?: LogSource[] | undefined;
  strategyId?: string | undefined;
  search?: string | undefined;
}
