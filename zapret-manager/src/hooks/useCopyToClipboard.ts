// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { COPY_TOAST_DURATION_MS } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseCopyToClipboardResult {
  // Обрабатываем конструкцию: copy.
  copy: (text: string) => Promise<void>;
  // Обрабатываем конструкцию: copied.
  copied: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useCopyToClipboard(
  // Обрабатываем конструкцию: duration.
  duration: number = COPY_TOAST_DURATION_MS
  // Закрываем выражение или список аргументов.
): UseCopyToClipboardResult {
  // Обрабатываем конструкцию: const [copied, setCopied] = useState(false).
  const [copied, setCopied] = useState(false);
  // Обрабатываем конструкцию: const timerRef = useRef<number | undefined>(undefined).
  const timerRef = useRef<number | undefined>(undefined);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Возвращаем результат: () => { if (timerRef.current !== undefined) { window.cl….
    return () => {
      // Проверяем бизнес-условие: timerRef.current !== undefined.
      if (timerRef.current !== undefined) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(timerRef.current);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const copy = useCallback( async (text: string): Promise….
  const copy = useCallback(
    // Обрабатываем конструкцию: async.
    async (text: string): Promise<void> => {
      // Проверяем бизнес-условие: timerRef.current !== undefined.
      if (timerRef.current !== undefined) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(timerRef.current);
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await navigator.clipboard.writeText(text).
      await navigator.clipboard.writeText(text);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setCopied.
      setCopied(true);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: timerRef.
      timerRef.current = window.setTimeout(() => {
        // Обрабатываем конструкцию: setCopied.
        setCopied(false);
        // Обрабатываем конструкцию: timerRef.
        timerRef.current = undefined;
        // Закрываем текущий блок.
      }, duration);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [duration]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { copy, copied }.
  return { copy, copied };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
