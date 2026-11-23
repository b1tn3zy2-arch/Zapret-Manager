// Импортируем зависимости из модуля react.
import type { CSSProperties } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type SkeletonVariant = "text" | "circle" | "rect";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SkeletonProps {
  // Обрабатываем конструкцию: variant.
  variant?: SkeletonVariant;
  // Обрабатываем конструкцию: width.
  width?: string | number;
  // Обрабатываем конструкцию: height.
  height?: string | number;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SHAPE_CLASSES = { text: h-4 w-full rounded-md, ci….
const SHAPE_CLASSES = {
  // Обрабатываем конструкцию: text.
  text: "h-4 w-full rounded-md",
  // Обрабатываем конструкцию: circle.
  circle: "rounded-full",
  // Обрабатываем конструкцию: rect.
  rect: "rounded-lg",
  // Закрываем текущий блок.
} as const satisfies Record<SkeletonVariant, string>;
// — разделитель логических блоков —

// Объявляем функцию toCssSize.
function toCssSize(value: string | number | undefined): string | undefined {
  // Проверяем бизнес-условие: value === undefined.
  if (value === undefined) {
    // Возвращаем результат: undefined.
    return undefined;
    // Закрываем текущий блок.
  }
  // Возвращаем результат: typeof value === number ? ${value}px : value.
  return typeof value === "number" ? `${value}px` : value;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Skeleton({
  // Обрабатываем конструкцию: variant.
  variant = "text",
  // Обрабатываем конструкцию: width.
  width,
  // Обрабатываем конструкцию: height.
  height,
  // Обрабатываем конструкцию: className.
  className,
  // Закрываем текущий блок.
}: SkeletonProps) {
  // Обрабатываем конструкцию: const sizeStyle: CSSProperties = { width: toCssSize(wid….
  const sizeStyle: CSSProperties = {
    // Обрабатываем конструкцию: width.
    width: toCssSize(width),
    // Обрабатываем конструкцию: height.
    height: toCssSize(height),
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div aria-hidden=true style={sizeStyle} className={cn….
  return (
    // Рендерим самозакрывающийся элемент div.
    <div
      // Обрабатываем конструкцию: aria-hidden.
      aria-hidden="true"
      // Обрабатываем конструкцию: style.
      style={sizeStyle}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: animate-shimmer from-glass-bg via-glass-hover to-glass-….
        "animate-shimmer from-glass-bg via-glass-hover to-glass-bg shrink-0 bg-gradient-to-r bg-[length:200%_100%]",
        // Обрабатываем конструкцию: SHAPE_CLASSES.
        SHAPE_CLASSES[variant],
        // Обрабатываем конструкцию: variant.
        variant === "rect" && width === undefined && "w-full",
        // Обрабатываем конструкцию: className.
        className
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
