// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { VIEWPORT_THROTTLE_MS } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useWindowResize(
  // Обрабатываем конструкцию: callback.
  callback: () => void,
  // Обрабатываем конструкцию: throttleMs.
  throttleMs: number = VIEWPORT_THROTTLE_MS
  // Закрываем выражение или список аргументов.
): void {
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let frame: number | null = null.
    let frame: number | null = null;
    // Обрабатываем конструкцию: let lastCall = 0.
    let lastCall = 0;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const run = (): void => { lastCall = Date.now(); frame ….
    const run = (): void => {
      // Обрабатываем конструкцию: lastCall.
      lastCall = Date.now();
      // Обрабатываем конструкцию: frame.
      frame = null;
      // Обрабатываем конструкцию: callback.
      callback();
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const handle = (): void => { const now = Date.now(); co….
    const handle = (): void => {
      // Обрабатываем конструкцию: const now = Date.now().
      const now = Date.now();
      // Обрабатываем конструкцию: const wait = throttleMs - (now - lastCall).
      const wait = throttleMs - (now - lastCall);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: wait <= 0.
      if (wait <= 0) {
        // Обрабатываем конструкцию: run.
        run();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: frame === null.
      if (frame === null) {
        // Обрабатываем конструкцию: frame.
        frame = window.setTimeout(run, wait);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: window.
    window.addEventListener("resize", handle);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.removeEventListener(resize, handle); if ….
    return () => {
      // Обрабатываем конструкцию: window.
      window.removeEventListener("resize", handle);
      // Проверяем бизнес-условие: frame !== null.
      if (frame !== null) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(frame);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [callback, throttleMs]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
