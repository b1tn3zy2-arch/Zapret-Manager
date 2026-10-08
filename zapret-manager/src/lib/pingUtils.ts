export interface PingPoint {
  timestamp: number;
  latencyMs: number | null;
  success: boolean;
}

const GOOD_MS = 50;
const FAIR_MS = 150;

export function getPingColor(latencyMs: number | null): string {
  if (latencyMs === null) {
    return "rgb(160, 160, 170)";
  }

  if (latencyMs < GOOD_MS) {
    return "rgb(0, 255, 136)";
  }

  if (latencyMs <= FAIR_MS) {
    return "rgb(251, 191, 36)";
  }

  return "rgb(255, 82, 82)";
}

export function formatPing(latencyMs: number | null): string {
  return latencyMs === null ? "—" : `${latencyMs} мс`;
}

function segments(points: PingPoint[]): PingPoint[][] {
  const groups: PingPoint[][] = [];
  let current: PingPoint[] = [];

  for (const point of points) {
    if (point.success && point.latencyMs !== null) {
      current.push(point);
    } else if (current.length > 0) {
      groups.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

export function buildSparklinePath(
  points: PingPoint[],
  width: number,
  height: number
): string {
  const usable = points.filter(
    (point) => point.success && point.latencyMs !== null
  );

  if (usable.length < 2) {
    return "";
  }

  const values = usable.map((point) => point.latencyMs ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padding = 2;
  const usableHeight = height - padding * 2;
  const step = width / (usable.length - 1);

  return usable
    .map((point, index) => {
      const value = point.latencyMs ?? 0;
      const x = index * step;
      const y = padding + usableHeight - ((value - min) / span) * usableHeight;

      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function buildSparklineFill(
  points: PingPoint[],
  width: number,
  height: number
): string {
  const groups = segments(points);

  return groups
    .filter((group) => group.length > 1)
    .map((group) => {
      const line = buildSparklinePath(group, width, height);

      if (line === "") {
        return "";
      }

      return `${line} L${width},${height} L0,${height} Z`;
    })
    .join(" ");
}

export function lastLatency(points: PingPoint[]): number | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index];

    if (point !== undefined && point.success && point.latencyMs !== null) {
      return point.latencyMs;
    }
  }

  return null;
}
