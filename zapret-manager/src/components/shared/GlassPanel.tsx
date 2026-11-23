// Импортируем зависимости из модуля react.
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type GlassPanelVariant =
  // Обрабатываем конструкцию: default.
  "default" | "interactive" | "outlined" | "plain";
// Обрабатываем конструкцию: export.
export type GlassPanelPadding = "none" | "sm" | "md" | "lg";
// Обрабатываем конструкцию: export.
export type GlassPanelRounded = "md" | "lg" | "xl";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Обрабатываем конструкцию: variant.
  variant?: GlassPanelVariant;
  // Обрабатываем конструкцию: padding.
  padding?: GlassPanelPadding;
  // Обрабатываем конструкцию: rounded.
  rounded?: GlassPanelRounded;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const VARIANT_CLASSES = { default: bg-glass-bg border b….
const VARIANT_CLASSES = {
  // Обрабатываем конструкцию: default.
  default: "bg-glass-bg border border-glass-border",
  // Обрабатываем конструкцию: interactive.
  interactive:
    // Обрабатываем конструкцию: bg-glass-bg border border-glass-border hover:bg-glass-h….
    "bg-glass-bg border border-glass-border hover:bg-glass-hover hover:border-glass-border",
  // Обрабатываем конструкцию: outlined.
  outlined: "bg-transparent border border-glass-border",
  // Обрабатываем конструкцию: plain.
  plain: "bg-bg-primary border border-glass-border",
  // Закрываем текущий блок.
} as const satisfies Record<GlassPanelVariant, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PADDING_CLASSES = { none: p-0, sm: p-3, md: p-4, ….
const PADDING_CLASSES = {
  // Обрабатываем конструкцию: none.
  none: "p-0",
  // Обрабатываем конструкцию: sm.
  sm: "p-3",
  // Обрабатываем конструкцию: md.
  md: "p-4",
  // Обрабатываем конструкцию: lg.
  lg: "p-6",
  // Закрываем текущий блок.
} as const satisfies Record<GlassPanelPadding, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ROUNDED_CLASSES = { md: rounded-md, lg: rounded-l….
const ROUNDED_CLASSES = {
  // Обрабатываем конструкцию: md.
  md: "rounded-md",
  // Обрабатываем конструкцию: lg.
  lg: "rounded-lg",
  // Обрабатываем конструкцию: xl.
  xl: "rounded-xl",
  // Закрываем текущий блок.
} as const satisfies Record<GlassPanelRounded, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  // Объявляем функцию-обработчик или стрелочную функцию.
  function GlassPanel(
    // Объявляем параметр { children, variant = default, padding =… функции.
    {
      // Обрабатываем конструкцию: children.
      children,
      // Обрабатываем конструкцию: variant.
      variant = "default",
      // Обрабатываем конструкцию: padding.
      padding = "md",
      // Обрабатываем конструкцию: rounded.
      rounded = "lg",
      // Обрабатываем конструкцию: className.
      className,
      // Обрабатываем конструкцию: ....
      ...rest
      // Закрываем текущий блок.
    },
    // Объявляем параметр ref функции.
    ref
    // Закрываем выражение или список аргументов.
  ) {
    // Возвращаем результат: ( <div ref={ref} className={cn( backdrop-blur-xl, VARIA….
    return (
      // Обрабатываем конструкцию: <div ref={ref} className={cn( backdrop-blur-xl, VARIANT….
      <div
        // Обрабатываем конструкцию: ref.
        ref={ref}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: backdrop-blur-xl.
          "backdrop-blur-xl",
          // Обрабатываем конструкцию: VARIANT_CLASSES.
          VARIANT_CLASSES[variant],
          // Обрабатываем конструкцию: PADDING_CLASSES.
          PADDING_CLASSES[padding],
          // Обрабатываем конструкцию: ROUNDED_CLASSES.
          ROUNDED_CLASSES[rounded],
          // Обрабатываем конструкцию: variant.
          variant === "interactive" &&
            // Обрабатываем конструкцию: transition-colors duration-200 ease-out hover:scale-[1.….
            "transition-colors duration-200 ease-out hover:scale-[1.01]",
          // Обрабатываем конструкцию: className.
          className
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: {...rest}.
        {...rest}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {children}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —
