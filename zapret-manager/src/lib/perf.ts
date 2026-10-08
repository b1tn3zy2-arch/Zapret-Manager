export interface PerfSample {
  name: string;
  value: number;
}

const isEnabled = (): boolean =>
  typeof performance !== "undefined" &&
  typeof performance.mark === "function" &&
  typeof performance.measure === "function";

export function mark(name: string): void {
  if (!isEnabled()) {
    return;
  }

  performance.mark(name);
}

export function measure(name: string, startMark: string): number {
  if (!isEnabled()) {
    return 0;
  }

  try {
    performance.measure(name, startMark);
  } catch {
    return 0;
  }

  const entries = performance.getEntriesByName(name);

  return entries.length === 0 ? 0 : (entries.at(-1)?.duration ?? 0);
}

export function reportMetrics(samples: PerfSample[]): void {
  if (typeof console === "undefined") {
    return;
  }

  const formatted = samples
    .map((sample) => `${sample.name}=${Math.round(sample.value)}`)
    .join(" ");

  console.warn(`[perf] ${formatted}`);
}
