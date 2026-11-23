// Импортируем зависимости из модуля react.
import type { HTMLAttributes } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { ControlSize, TextVariant } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  // Обрабатываем конструкцию: variant.
  variant?: TextVariant;
  // Обрабатываем конструкцию: size.
  size?: ControlSize;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const VARIANT_CLASSES = { body: text-text-primary font-….
const VARIANT_CLASSES = {
  // Обрабатываем конструкцию: body.
  body: "text-text-primary font-normal",
  // Обрабатываем конструкцию: caption.
  caption: "text-text-secondary",
  // Обрабатываем конструкцию: label.
  label: "text-text-secondary font-medium",
  // Обрабатываем конструкцию: mono.
  mono: "font-mono text-text-primary",
  // Закрываем текущий блок.
} as const satisfies Record<TextVariant, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SIZE_CLASSES = { sm: text-xs, md: text-sm, lg: te….
const SIZE_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: "text-xs",
  // Обрабатываем конструкцию: md.
  md: "text-sm",
  // Обрабатываем конструкцию: lg.
  lg: "text-base",
  // Закрываем текущий блок.
} as const satisfies Record<ControlSize, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Text({
  // Обрабатываем конструкцию: variant.
  variant = "body",
  // Обрабатываем конструкцию: size.
  size = "md",
  // Обрабатываем конструкцию: className.
  className,
  // Обрабатываем конструкцию: children.
  children,
  // Обрабатываем конструкцию: ....
  ...rest
  // Закрываем текущий блок.
}: TextProps) {
  // Возвращаем результат: ( <span className={cn(VARIANT_CLASSES[variant], SIZE_CL….
  return (
    // Обрабатываем конструкцию: <span className={cn(VARIANT_CLASSES[variant], SIZE_CLAS….
    <span
      // Обрабатываем конструкцию: className.
      className={cn(VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      // Обрабатываем конструкцию: {...rest}.
      {...rest}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {children}
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
