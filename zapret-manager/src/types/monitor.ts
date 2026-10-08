export interface NetworkStats {
  bytesIn: number;
  bytesOut: number;
  speedIn: number;
  speedOut: number;
  packetsIn: number;
  packetsOut: number;
  connections: number;
  timestamp: number;
}

export type TrafficKey = "in" | "out";

export interface TrafficPoint {
  timestamp: number;
  in: number;
  out: number;
}

export type TrafficSeries = Record<TrafficKey, number>;

export type MonitorState = "background" | "active" | "stalled" | "error";
