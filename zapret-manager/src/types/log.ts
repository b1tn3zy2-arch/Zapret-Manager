// Обрабатываем конструкцию: export.
export type LogLevel = "info" | "warn" | "error" | "success" | "debug";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type LogSource = "system" | "strategy" | "user" | "vpn";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogEntry {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Обрабатываем конструкцию: level.
  level: LogLevel;
  // Обрабатываем конструкцию: source.
  source: LogSource;
  // Обрабатываем конструкцию: message.
  message: string;
  // Обрабатываем конструкцию: strategyId.
  strategyId?: string | undefined;
  // Обрабатываем конструкцию: metadata.
  metadata?: Record<string, unknown> | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type NewLogEntry = Omit<LogEntry, "id" | "timestamp"> &
  // Обрабатываем конструкцию: Partial.
  Partial<Pick<LogEntry, "timestamp">>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogFilter {
  // Обрабатываем конструкцию: levels.
  levels?: LogLevel[] | undefined;
  // Обрабатываем конструкцию: sources.
  sources?: LogSource[] | undefined;
  // Обрабатываем конструкцию: strategyId.
  strategyId?: string | undefined;
  // Обрабатываем конструкцию: search.
  search?: string | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
