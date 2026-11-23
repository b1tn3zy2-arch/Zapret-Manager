// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { BadgeSize, BadgeVariant } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface BadgeProps {
  // Обрабатываем конструкцию: variant.
  variant?: BadgeVariant;
  // Обрабатываем конструкцию: size.
  size?: BadgeSize;
  // Обрабатываем конструкцию: dot.
  dot?: boolean;
  // Обрабатываем конструкцию: pulse.
  pulse?: boolean;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const VARIANT_CLASSES = { success: bg-green-500/10 text….
const VARIANT_CLASSES = {
  // Обрабатываем конструкцию: success.
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  // Обрабатываем конструкцию: warning.
  warning: "bg-accent-warning/10 text-accent-warning border-accent-warning/20",
  // Обрабатываем конструкцию: error.
  error: "bg-accent-danger/10 text-accent-danger border-accent-danger/20",
  // Обрабатываем конструкцию: info.
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  // Обрабатываем конструкцию: neutral.
  neutral: "bg-glass-bg text-text-secondary border-glass-border",
  // Обрабатываем конструкцию: accent.
  accent: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
  // Закрываем текущий блок.
} as const satisfies Record<BadgeVariant, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SIZE_CLASSES = { sm: h-5 px-2 text-xs, md: h-6 px….
const SIZE_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: "h-5 px-2 text-xs",
  // Обрабатываем конструкцию: md.
  md: "h-6 px-2.5 text-xs",
  // Закрываем текущий блок.
} as const satisfies Record<BadgeSize, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const DOT_SIZE_CLASSES = { sm: size-1.5, md: size-2, } ….
const DOT_SIZE_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: "size-1.5",
  // Обрабатываем конструкцию: md.
  md: "size-2",
  // Закрываем текущий блок.
} as const satisfies Record<BadgeSize, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Badge({
  // Обрабатываем конструкцию: variant.
  variant = "neutral",
  // Обрабатываем конструкцию: size.
  size = "md",
  // Обрабатываем конструкцию: dot.
  dot = false,
  // Обрабатываем конструкцию: pulse.
  pulse = false,
  // Обрабатываем конструкцию: className.
  className,
  // Обрабатываем конструкцию: children.
  children,
  // Закрываем текущий блок.
}: BadgeProps) {
  // Возвращаем результат: ( <span className={cn( inline-flex items-center gap-1.5….
  return (
    // Обрабатываем конструкцию: <span className={cn( inline-flex items-center gap-1.5 r….
    <span
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: inline-flex items-center gap-1.5 rounded-full border fo….
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        // Обрабатываем конструкцию: whitespace-nowrap.
        "whitespace-nowrap",
        // Обрабатываем конструкцию: VARIANT_CLASSES.
        VARIANT_CLASSES[variant],
        // Обрабатываем конструкцию: SIZE_CLASSES.
        SIZE_CLASSES[size],
        // Обрабатываем конструкцию: className.
        className
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {dot ? (
        // Рендерим самозакрывающийся элемент span.
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: shrink-0 rounded-full bg-current.
            "shrink-0 rounded-full bg-current",
            // Обрабатываем конструкцию: DOT_SIZE_CLASSES.
            DOT_SIZE_CLASSES[size],
            // Обрабатываем конструкцию: pulse.
            pulse && "animate-pulse"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
      {children}
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
