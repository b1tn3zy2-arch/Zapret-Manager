// Импортируем зависимости из модуля react.
import type { ElementType, ReactNode } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { HeadingLevel } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface HeadingProps {
  // Обрабатываем конструкцию: level.
  level?: HeadingLevel;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LEVEL_CLASSES = { 1: text-4xl font-bold tracking-….
const LEVEL_CLASSES = {
  // Обрабатываем конструкцию: 1.
  1: "text-4xl font-bold tracking-tight",
  // Обрабатываем конструкцию: 2.
  2: "text-2xl font-semibold tracking-tight",
  // Обрабатываем конструкцию: 3.
  3: "text-xl font-semibold",
  // Обрабатываем конструкцию: 4.
  4: "text-lg font-medium",
  // Обрабатываем конструкцию: 5.
  5: "text-base font-medium",
  // Обрабатываем конструкцию: 6.
  6: "text-sm font-medium",
  // Закрываем текущий блок.
} as const satisfies Record<HeadingLevel, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Heading({
  // Обрабатываем конструкцию: level.
  level = 1,
  // Обрабатываем конструкцию: className.
  className,
  // Обрабатываем конструкцию: children.
  children,
  // Закрываем текущий блок.
}: HeadingProps) {
  // Обрабатываем конструкцию: const Tag = h${level} as ElementType.
  const Tag = `h${level}` as ElementType;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Tag className={cn( text-text-primary, LEVEL_CLASSES[….
  return (
    // Обрабатываем конструкцию: <Tag className={cn( text-text-primary, LEVEL_CLASSES[le….
    <Tag
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: text-text-primary.
        "text-text-primary",
        // Обрабатываем конструкцию: LEVEL_CLASSES.
        LEVEL_CLASSES[level],
        // Обрабатываем конструкцию: level.
        level === 6 && "text-text-secondary",
        // Обрабатываем конструкцию: className.
        className
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {children}
      {/* Выводим текстовое содержимое в JSX. */}
    </Tag>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
