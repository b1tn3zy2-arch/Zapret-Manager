// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import type { UnlistenFn } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля @tauri-apps/api/window.
import { getCurrentWindow } from "@tauri-apps/api/window";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseFullscreenResult {
  // Обрабатываем конструкцию: isFullscreen.
  isFullscreen: boolean;
  // Обрабатываем конструкцию: toggleFullscreen.
  toggleFullscreen: () => void;
  // Обрабатываем конструкцию: exitFullscreen.
  exitFullscreen: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию hasOpenModal.
function hasOpenModal(): boolean {
  // Возвращаем результат: document.querySelector([role=dialog]) !== null.
  return document.querySelector('[role="dialog"]') !== null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useFullscreen(): UseFullscreenResult {
  // Обрабатываем конструкцию: const [isFullscreen, setIsFullscreen] = useState(false).
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Обрабатываем конструкцию: const isFullscreenRef = useRef(isFullscreen).
  const isFullscreenRef = useRef(isFullscreen);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: isFullscreenRef.
    isFullscreenRef.current = isFullscreen;
    // Закрываем текущий блок.
  }, [isFullscreen]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const appWindow = getCurrentWindow().
    const appWindow = getCurrentWindow();
    // Обрабатываем конструкцию: let unlisten: UnlistenFn | undefined.
    let unlisten: UnlistenFn | undefined;
    // Обрабатываем конструкцию: let disposed = false.
    let disposed = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const sync = () => { void appWindow.isFullscreen().then….
    const sync = () => {
      // Обрабатываем конструкцию: void appWindow.isFullscreen().then((value) => { if (!di….
      void appWindow.isFullscreen().then((value) => {
        // Проверяем бизнес-условие: !disposed.
        if (!disposed) {
          // Обрабатываем конструкцию: isFullscreenRef.
          isFullscreenRef.current = value;
          // Обрабатываем конструкцию: setIsFullscreen.
          setIsFullscreen(value);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: sync.
    sync();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void appWindow.onResized(sync).then((stopListening) => ….
    void appWindow.onResized(sync).then((stopListening) => {
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

    // Возвращаем результат: () => { disposed = true; unlisten?.(); }.
    return () => {
      // Обрабатываем конструкцию: disposed.
      disposed = true;
      // Обрабатываем конструкцию: unlisten.
      unlisten?.();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const toggleFullscreen = useCallback(() => { const appW….
  const toggleFullscreen = useCallback(() => {
    // Обрабатываем конструкцию: const appWindow = getCurrentWindow().
    const appWindow = getCurrentWindow();
    // Обрабатываем конструкцию: void appWindow.isFullscreen().then((current) => { void ….
    void appWindow.isFullscreen().then((current) => {
      // Обрабатываем конструкцию: void appWindow.setFullscreen(!current).
      void appWindow.setFullscreen(!current);
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const exitFullscreen = useCallback(() => { void getCurr….
  const exitFullscreen = useCallback(() => {
    // Обрабатываем конструкцию: void getCurrentWindow().setFullscreen(false).
    void getCurrentWindow().setFullscreen(false);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const handleKeyDown = (event: KeyboardEvent) => { if (e….
    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяем бизнес-условие: event.key === F11.
      if (event.key === "F11") {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Обрабатываем конструкцию: toggleFullscreen.
        toggleFullscreen();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: event.key !== Escape || !isFullscreenRef.current || has….
      if (
        // Обрабатываем конструкцию: event.
        event.key !== "Escape" ||
        // Изменяем значение выражения !isFullscreenRef.current.
        !isFullscreenRef.current ||
        // Обрабатываем конструкцию: hasOpenModal.
        hasOpenModal()
        // Закрываем выражение или список аргументов.
      ) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // Обрабатываем конструкцию: exitFullscreen.
      exitFullscreen();
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: window.
    window.addEventListener("keydown", handleKeyDown);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.removeEventListener(keydown, handleKeyDo….
    return () => {
      // Обрабатываем конструкцию: window.
      window.removeEventListener("keydown", handleKeyDown);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [exitFullscreen, toggleFullscreen]);
  // — разделитель логических блоков —

  // Возвращаем результат: { isFullscreen, toggleFullscreen, exitFullscreen }.
  return { isFullscreen, toggleFullscreen, exitFullscreen };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
