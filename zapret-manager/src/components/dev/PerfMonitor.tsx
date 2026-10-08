import { useEffect } from "react";

import { usePerfSnapshot } from "@/hooks/usePerfSnapshot";
import { PERF_TARGETS } from "@/lib/constants";
import { reportMetrics } from "@/lib/perf";

const REPORT_INTERVAL_MS = 5000;
const LONG_TASK_THRESHOLD_MS = 50;

export function PerfMonitor() {
  const { fps, heapMb, domNodes, longTasks } = usePerfSnapshot();
  const fpsTarget = PERF_TARGETS.fps;
  const fpsState = fps === 0 ? "—" : fps >= fpsTarget ? "ok" : "low";

  useEffect(() => {
    const timer = window.setInterval(() => {
      reportMetrics([
        { name: "fps", value: fps },
        { name: "dom", value: domNodes },
      ]);
    }, REPORT_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [domNodes, fps]);

  return (
    <aside
      aria-label="Метрики производительности"
      className="border-accent-primary/30 bg-bg-secondary/90 text-text-secondary pointer-events-none fixed right-4 bottom-4 z-[10000] flex flex-col gap-0.5 rounded-lg border px-3 py-2 font-mono text-[11px] shadow-lg"
    >
      <span className="text-text-primary font-semibold">perf</span>
      <span>
        fps:{" "}
        <span className={fpsState === "low" ? "text-accent-warning" : ""}>
          {fps}
        </span>{" "}
        ({fpsState})
      </span>
      <span>heap: {heapMb === null ? "n/a" : `${heapMb} MB`}</span>
      <span>dom: {domNodes}</span>
      <span>
        long tasks &gt;{LONG_TASK_THRESHOLD_MS}ms: {longTasks}
      </span>
    </aside>
  );
}

export default PerfMonitor;
