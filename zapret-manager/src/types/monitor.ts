// Обрабатываем конструкцию: export.
export interface NetworkStats {
  // Обрабатываем конструкцию: bytesIn.
  bytesIn: number;
  // Обрабатываем конструкцию: bytesOut.
  bytesOut: number;
  // Обрабатываем конструкцию: speedIn.
  speedIn: number;
  // Обрабатываем конструкцию: speedOut.
  speedOut: number;
  // Обрабатываем конструкцию: packetsIn.
  packetsIn: number;
  // Обрабатываем конструкцию: packetsOut.
  packetsOut: number;
  // Обрабатываем конструкцию: connections.
  connections: number;
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type TrafficKey = "in" | "out";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TrafficPoint {
  // Обрабатываем конструкцию: timestamp.
  timestamp: number;
  // Обрабатываем конструкцию: in.
  in: number;
  // Обрабатываем конструкцию: out.
  out: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type TrafficSeries = Record<TrafficKey, number>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type MonitorState = "background" | "active" | "stalled" | "error";
// — разделитель логических блоков —
