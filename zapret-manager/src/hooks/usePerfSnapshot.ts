// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface PerfSnapshot {
  // Обрабатываем конструкцию: fps.
  fps: number;
  // Обрабатываем конструкцию: heapMb.
  heapMb: number | null;
  // Обрабатываем конструкцию: domNodes.
  domNodes: number;
  // Обрабатываем конструкцию: longTasks.
  longTasks: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PerformanceMemory с контрактом данных.
interface PerformanceMemory {
  // Обрабатываем конструкцию: usedJSHeapSize.
  usedJSHeapSize: number;
  // Обрабатываем конструкцию: jsHeapSizeLimit.
  jsHeapSizeLimit: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс MemoryPerformance с контрактом данных.
interface MemoryPerformance extends Performance {
  // Обрабатываем конструкцию: memory.
  memory?: PerformanceMemory;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SAMPLE_INTERVAL_MS = 1000.
const SAMPLE_INTERVAL_MS = 1000;
// — разделитель логических блоков —

// Объявляем функцию readHeapMb.
function readHeapMb(): number | null {
  // Обрабатываем конструкцию: const memory = (performance as MemoryPerformance).memor….
  const memory = (performance as MemoryPerformance).memory;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: memory === undefined.
  if (memory === undefined) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: Math.round((memory.usedJSHeapSize / 1024 / 1024) * 10) ….
  return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 10) / 10;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию useFps.
function useFps(): number {
  // Обрабатываем конструкцию: const [fps, setFps] = useState(0).
  const [fps, setFps] = useState(0);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let frame = 0.
    let frame = 0;
    // Обрабатываем конструкцию: let frames = 0.
    let frames = 0;
    // Обрабатываем конструкцию: let last = performance.now().
    let last = performance.now();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const tick = (time: number): void => { frames += 1; con….
    const tick = (time: number): void => {
      // Обрабатываем конструкцию: frames.
      frames += 1;
      // Обрабатываем конструкцию: const delta = time - last.
      const delta = time - last;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: delta >= SAMPLE_INTERVAL_MS.
      if (delta >= SAMPLE_INTERVAL_MS) {
        // Обрабатываем конструкцию: setFps.
        setFps(Math.round((frames * 1000) / delta));
        // Обрабатываем конструкцию: frames.
        frames = 0;
        // Обрабатываем конструкцию: last.
        last = time;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: frame.
      frame = requestAnimationFrame(tick);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: frame.
    frame = requestAnimationFrame(tick);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { cancelAnimationFrame(frame); }.
    return () => {
      // Обрабатываем конструкцию: cancelAnimationFrame.
      cancelAnimationFrame(frame);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: fps.
  return fps;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию useLongTasks.
function useLongTasks(): number {
  // Обрабатываем конструкцию: const [count, setCount] = useState(0).
  const [count, setCount] = useState(0);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: typeof PerformanceObserver === undefined.
    if (typeof PerformanceObserver === "undefined") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: let total = 0.
    let total = 0;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const observer = new PerformanceObserver((list) => { to….
    const observer = new PerformanceObserver((list) => {
      // Обрабатываем конструкцию: total.
      total += list.getEntries().length;
      // Обрабатываем конструкцию: setCount.
      setCount(total);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: observer.
      observer.observe({ type: "longtask", buffered: true });
      // Закрываем текущий блок.
    } catch {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: () => { observer.disconnect(); }.
    return () => {
      // Обрабатываем конструкцию: observer.
      observer.disconnect();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: count.
  return count;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function usePerfSnapshot(): PerfSnapshot {
  // Обрабатываем конструкцию: const fps = useFps().
  const fps = useFps();
  // Обрабатываем конструкцию: const longTasks = useLongTasks().
  const longTasks = useLongTasks();
  // Обрабатываем конструкцию: const [heapMb, setHeapMb] = useState<number | null>(nul….
  const [heapMb, setHeapMb] = useState<number | null>(null);
  // Обрабатываем конструкцию: const [domNodes, setDomNodes] = useState(0).
  const [domNodes, setDomNodes] = useState(0);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const timer = window.setInterval(() => { setHeapMb(read….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: setHeapMb.
      setHeapMb(readHeapMb());
      // Обрабатываем конструкцию: setDomNodes.
      setDomNodes(document.getElementsByTagName("*").length);
      // Закрываем текущий блок.
    }, SAMPLE_INTERVAL_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: { fps, heapMb, domNodes, longTasks }.
  return { fps, heapMb, domNodes, longTasks };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
