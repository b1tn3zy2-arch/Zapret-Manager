// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import type { UnlistenFn } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля @tauri-apps/api/window.
import { getCurrentWindow } from "@tauri-apps/api/window";
// — разделитель логических блоков —

// Объявляем функцию readScale.
function readScale(): number {
  // Проверяем бизнес-условие: typeof window === undefined.
  if (typeof window === "undefined") {
    // Возвращаем результат: 1.
    return 1;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: window.devicePixelRatio || 1.
  return window.devicePixelRatio || 1;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useDpiScale(): number {
  // Обрабатываем конструкцию: const [scale, setScale] = useState(readScale).
  const [scale, setScale] = useState(readScale);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let unlisten: UnlistenFn | undefined.
    let unlisten: UnlistenFn | undefined;
    // Обрабатываем конструкцию: let disposed = false.
    let disposed = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const appWindow = getCurrentWindow().
    const appWindow = getCurrentWindow();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void appWindow .onScaleChanged((event) => { if (!dispos….
    void appWindow
      // Продолжаем цепочку вызовов.
      .onScaleChanged((event) => {
        // Проверяем бизнес-условие: !disposed.
        if (!disposed) {
          // Обрабатываем конструкцию: setScale.
          setScale(event.payload.scaleFactor);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .then((stopListening) => {
        // Проверяем бизнес-условие: disposed.
        if (disposed) {
          // Обрабатываем конструкцию: stopListening.
          stopListening();
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // Обрабатываем конструкцию: unlisten.
        unlisten = stopListening;
        // Закрываем текущий блок.
      });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const query = window.matchMedia((resolution: ${readScal….
    const query = window.matchMedia(`(resolution: ${readScale()}dppx)`);
    // Обрабатываем конструкцию: const handleRatioChange = (): void => { setScale(readSc….
    const handleRatioChange = (): void => {
      // Обрабатываем конструкцию: setScale.
      setScale(readScale());
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: query.
    query.addEventListener("change", handleRatioChange);
    // Обрабатываем конструкцию: handleRatioChange.
    handleRatioChange();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { disposed = true; unlisten?.(); query.removeEven….
    return () => {
      // Обрабатываем конструкцию: disposed.
      disposed = true;
      // Обрабатываем конструкцию: unlisten.
      unlisten?.();
      // Обрабатываем конструкцию: query.
      query.removeEventListener("change", handleRatioChange);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: scale.
  return scale;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
