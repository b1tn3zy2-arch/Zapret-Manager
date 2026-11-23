// Импортируем зависимости из модуля react.
import { useCallback, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/breakpoints.
import { getBreakpoint, type Breakpoint } from "@/lib/breakpoints";
// Импортируем зависимости из модуля @/hooks/useWindowResize.
import { useWindowResize } from "@/hooks/useWindowResize";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type Orientation = "portrait" | "landscape";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ViewportState {
  // Обрабатываем конструкцию: width.
  width: number;
  // Обрабатываем конструкцию: height.
  height: number;
  // Обрабатываем конструкцию: devicePixelRatio.
  devicePixelRatio: number;
  // Обрабатываем конструкцию: aspectRatio.
  aspectRatio: number;
  // Обрабатываем конструкцию: breakpoint.
  breakpoint: Breakpoint;
  // Обрабатываем конструкцию: orientation.
  orientation: Orientation;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию readViewport.
function readViewport(): ViewportState {
  // Проверяем бизнес-условие: typeof window === undefined.
  if (typeof window === "undefined") {
    // Возвращаем результат: { width: 0, height: 0, devicePixelRatio: 1, aspectRatio….
    return {
      // Обрабатываем конструкцию: width.
      width: 0,
      // Обрабатываем конструкцию: height.
      height: 0,
      // Обрабатываем конструкцию: devicePixelRatio.
      devicePixelRatio: 1,
      // Обрабатываем конструкцию: aspectRatio.
      aspectRatio: 0,
      // Обрабатываем конструкцию: breakpoint.
      breakpoint: "xs",
      // Обрабатываем конструкцию: orientation.
      orientation: "landscape",
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const width = window.innerWidth.
  const width = window.innerWidth;
  // Обрабатываем конструкцию: const height = window.innerHeight.
  const height = window.innerHeight;
  // — разделитель логических блоков —

  // Возвращаем результат: { width, height, devicePixelRatio: window.devicePixelRa….
  return {
    // Передаём поле width в объект.
    width,
    // Передаём поле height в объект.
    height,
    // Обрабатываем конструкцию: devicePixelRatio.
    devicePixelRatio: window.devicePixelRatio,
    // Обрабатываем конструкцию: aspectRatio.
    aspectRatio: height === 0 ? 0 : width / height,
    // Обрабатываем конструкцию: breakpoint.
    breakpoint: getBreakpoint(width),
    // Обрабатываем конструкцию: orientation.
    orientation: height > width ? "portrait" : "landscape",
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useViewport(): ViewportState {
  // Обрабатываем конструкцию: const [state, setState] = useState<ViewportState>(readV….
  const [state, setState] = useState<ViewportState>(readViewport);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const sync = useCallback(() => { setState((previous) =>….
  const sync = useCallback(() => {
    // Обрабатываем конструкцию: setState.
    setState((previous) => {
      // Обрабатываем конструкцию: const next = readViewport().
      const next = readViewport();
      // Обрабатываем конструкцию: const unchanged = previous.width === next.width && prev….
      const unchanged =
        // Обрабатываем конструкцию: previous.
        previous.width === next.width &&
        // Обрабатываем конструкцию: previous.
        previous.height === next.height &&
        // Обрабатываем конструкцию: previous.
        previous.devicePixelRatio === next.devicePixelRatio;
      // — разделитель логических блоков —

      // Возвращаем результат: unchanged ? previous : next.
      return unchanged ? previous : next;
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useWindowResize.
  useWindowResize(sync);
  // — разделитель логических блоков —

  // Возвращаем результат: state.
  return state;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
