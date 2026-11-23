// Импортируем зависимости из модуля react.
import { useState } from "react";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type DeviceTier = "low" | "mid" | "high";
// — разделитель логических блоков —

// Объявляем интерфейс NavigatorWithMemory с контрактом данных.
interface NavigatorWithMemory extends Navigator {
  // Обрабатываем конструкцию: deviceMemory.
  deviceMemory?: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: let cachedTier: DeviceTier | null = null.
let cachedTier: DeviceTier | null = null;
// Обрабатываем конструкцию: let cachedBackdropFilter: boolean | null = null.
let cachedBackdropFilter: boolean | null = null;
// — разделитель логических блоков —

// Объявляем функцию supportsBackdropFilter.
function supportsBackdropFilter(): boolean {
  // Обрабатываем конструкцию: cachedBackdropFilter.
  cachedBackdropFilter ??=
    // Обрабатываем конструкцию: typeof CSS.
    typeof CSS !== "undefined" &&
    // Обрабатываем конструкцию: typeof CSS.supports.
    typeof CSS.supports === "function" &&
    // Обрабатываем конструкцию: CSS.
    CSS.supports("backdrop-filter", "blur(1px)");
  // — разделитель логических блоков —

  // Возвращаем результат: cachedBackdropFilter.
  return cachedBackdropFilter;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию detectTier.
function detectTier(): DeviceTier {
  // Проверяем бизнес-условие: typeof navigator === undefined || typeof window === und….
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    // Возвращаем результат: mid.
    return "mid";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !supportsBackdropFilter().
  if (!supportsBackdropFilter()) {
    // Возвращаем результат: low.
    return "low";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const cores = navigator.hardwareConcurrency ?? 4.
  const cores = navigator.hardwareConcurrency ?? 4;
  // Обрабатываем конструкцию: const memory = (navigator as NavigatorWithMemory).devic….
  const memory = (navigator as NavigatorWithMemory).deviceMemory;
  // Обрабатываем конструкцию: const pixels = window.screen.width * window.screen.heig….
  const pixels = window.screen.width * window.screen.height;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const memoryScore = memory === undefined ? 0 : memory *….
  const memoryScore = memory === undefined ? 0 : memory * 2;
  // Обрабатываем конструкцию: const score = cores + memoryScore + (pixels > 3_000_000….
  const score = cores + memoryScore + (pixels > 3_000_000 ? 2 : 0);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: cores <= 4 || (memory !== undefined && memory <= 2) || ….
  if (cores <= 4 || (memory !== undefined && memory <= 2) || score <= 10) {
    // Возвращаем результат: low.
    return "low";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: cores <= 8 || (memory !== undefined && memory <= 8) || ….
  if (cores <= 8 || (memory !== undefined && memory <= 8) || score <= 20) {
    // Возвращаем результат: mid.
    return "mid";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: high.
  return "high";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию getDeviceTier.
function getDeviceTier(): DeviceTier {
  // Обрабатываем конструкцию: cachedTier.
  cachedTier ??= detectTier();
  // — разделитель логических блоков —

  // Возвращаем результат: cachedTier.
  return cachedTier;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useDeviceTier(): DeviceTier {
  // Обрабатываем конструкцию: const [tier] = useState<DeviceTier>(() => getDeviceTier….
  const [tier] = useState<DeviceTier>(() => getDeviceTier());
  // — разделитель логических блоков —

  // Возвращаем результат: tier.
  return tier;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
