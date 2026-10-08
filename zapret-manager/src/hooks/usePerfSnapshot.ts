import { useEffect, useState } from "react";

export interface PerfSnapshot {
  fps: number;
  heapMb: number | null;
  domNodes: number;
  longTasks: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryPerformance extends Performance {
  memory?: PerformanceMemory;
}

const SAMPLE_INTERVAL_MS = 1000;

function readHeapMb(): number | null {
  const memory = (performance as MemoryPerformance).memory;

  if (memory === undefined) {
    return null;
  }

  return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 10) / 10;
}

function useFps(): number {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frame = 0;
    let frames = 0;
    let last = performance.now();

    const tick = (time: number): void => {
      frames += 1;
      const delta = time - last;

      if (delta >= SAMPLE_INTERVAL_MS) {
        setFps(Math.round((frames * 1000) / delta));
        frames = 0;
        last = time;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return fps;
}

function useLongTasks(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") {
      return;
    }

    let total = 0;

    const observer = new PerformanceObserver((list) => {
      total += list.getEntries().length;
      setCount(total);
    });

    try {
      observer.observe({ type: "longtask", buffered: true });
    } catch {
      return;
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return count;
}

export function usePerfSnapshot(): PerfSnapshot {
  const fps = useFps();
  const longTasks = useLongTasks();
  const [heapMb, setHeapMb] = useState<number | null>(null);
  const [domNodes, setDomNodes] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeapMb(readHeapMb());
      setDomNodes(document.getElementsByTagName("*").length);
    }, SAMPLE_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return { fps, heapMb, domNodes, longTasks };
}
