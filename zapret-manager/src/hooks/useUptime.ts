// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { UPTIME_TICK_MS } from "@/lib/constants";
// — разделитель логических блоков —

// Объявляем функцию pad.
function pad(value: number): string {
  // Возвращаем результат: value.toString().padStart(2, 0).
  return value.toString().padStart(2, "0");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию formatUptime.
function formatUptime(elapsedMs: number): string {
  // Обрабатываем конструкцию: const total = Math.max(0, Math.floor(elapsedMs / 1000)).
  const total = Math.max(0, Math.floor(elapsedMs / 1000));
  // Обрабатываем конструкцию: const hours = Math.floor(total / 3600).
  const hours = Math.floor(total / 3600);
  // Обрабатываем конструкцию: const minutes = Math.floor((total % 3600) / 60).
  const minutes = Math.floor((total % 3600) / 60);
  // Обрабатываем конструкцию: const seconds = total % 60.
  const seconds = total % 60;
  // — разделитель логических блоков —

  // Возвращаем результат: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}.
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useUptime(startedAt: number | null): string {
  // Обрабатываем конструкцию: const [now, setNow] = useState(() => Date.now()).
  const [now, setNow] = useState(() => Date.now());
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: startedAt === null.
    if (startedAt === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { setNow(Date.no….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: setNow.
      setNow(Date.now());
      // Закрываем текущий блок.
    }, UPTIME_TICK_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [startedAt]);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: startedAt === null.
  if (startedAt === null) {
    // Возвращаем результат: --:--:--.
    return "--:--:--";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: formatUptime(now - startedAt).
  return formatUptime(now - startedAt);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
