// Импортируем зависимости из модуля @/i18n/ru.
import type { Dictionary } from "@/i18n/ru";
// — разделитель логических блоков —

// Реэкспортируем значения из модуля export type { Dictionary };.
export type { Dictionary };
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type TranslateParams = Record<string, string | number>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface Translate {
  // Обрабатываем конструкцию: (key: TranslationKey, params?: TranslateParams): string….
  (key: TranslationKey, params?: TranslateParams): string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type DeepKeys<T> = T extends string
  ? // Задаём альтернативу или тип значения.
    // Продолжаем предыдущую конструкцию.
    never
  : // Задаём альтернативу или тип значения.
    // Продолжаем предыдущую конструкцию.
    {
      // Продолжаем выражение.
      [K in keyof T & string]: T[K] extends string
        ? // Задаём альтернативу или тип значения.
          // Продолжаем предыдущую конструкцию.
          K
        : // Задаём альтернативу или тип значения.
          // Продолжаем предыдущую конструкцию.
          `${K}.${DeepKeys<T[K]>}`;
      // Закрываем текущий блок.
    }[keyof T & string];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type TranslationKey = DeepKeys<Dictionary>;
// — разделитель логических блоков —
