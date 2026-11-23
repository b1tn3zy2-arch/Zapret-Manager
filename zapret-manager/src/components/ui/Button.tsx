// Импортируем зависимости из модуля react.
import { forwardRef, type ReactNode } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion, type HTMLMotionProps } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Loader2 } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { ButtonSize, ControlVariant } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ButtonProps extends Omit<
  // Обрабатываем конструкцию: HTMLMotionProps.
  HTMLMotionProps<"button">,
  // Обрабатываем конструкцию: children.
  "children"
  // Продолжаем выражение.
> {
  // Обрабатываем конструкцию: variant.
  variant?: ControlVariant;
  // Обрабатываем конструкцию: size.
  size?: ButtonSize;
  // Обрабатываем конструкцию: loading.
  loading?: boolean;
  // Обрабатываем конструкцию: icon.
  icon?: ReactNode;
  // Обрабатываем конструкцию: iconRight.
  iconRight?: ReactNode;
  // Обрабатываем конструкцию: fullWidth.
  fullWidth?: boolean;
  // Обрабатываем конструкцию: children.
  children?: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const VARIANT_CLASSES = { primary: bg-accent-primary te….
const VARIANT_CLASSES = {
  // Обрабатываем конструкцию: primary.
  primary: "bg-accent-primary text-on-accent hover:bg-accent-primary/90",
  // Обрабатываем конструкцию: secondary.
  secondary:
    // Обрабатываем конструкцию: bg-glass-bg text-text-primary border border-glass-borde….
    "bg-glass-bg text-text-primary border border-glass-border hover:bg-glass-hover hover:border-glass-border",
  // Обрабатываем конструкцию: ghost.
  ghost:
    // Обрабатываем конструкцию: bg-transparent text-text-secondary hover:bg-glass-hover….
    "bg-transparent text-text-secondary hover:bg-glass-hover hover:text-text-primary",
  // Обрабатываем конструкцию: danger.
  danger:
    // Обрабатываем конструкцию: bg-accent-danger/10 text-accent-danger border border-ac….
    "bg-accent-danger/10 text-accent-danger border border-accent-danger/30 hover:bg-accent-danger/20",
  // Закрываем текущий блок.
} as const satisfies Record<ControlVariant, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SIZE_CLASSES = { sm: h-8 px-3 text-xs rounded-md ….
const SIZE_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  // Обрабатываем конструкцию: md.
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  // Обрабатываем конструкцию: lg.
  lg: "h-12 px-6 text-base rounded-lg gap-2",
  // Обрабатываем конструкцию: icon.
  icon: "size-10 p-0 rounded-lg",
  // Закрываем текущий блок.
} as const satisfies Record<ButtonSize, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ICON_SIZE_CLASSES = { sm: size-3.5, md: size-4, l….
const ICON_SIZE_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: "size-3.5",
  // Обрабатываем конструкцию: md.
  md: "size-4",
  // Обрабатываем конструкцию: lg.
  lg: "size-5",
  // Обрабатываем конструкцию: icon.
  icon: "size-4",
  // Закрываем текущий блок.
} as const satisfies Record<ButtonSize, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  // Объявляем функцию-обработчик или стрелочную функцию.
  function Button(
    // Объявляем параметр { variant = primary, size = md, loading … функции.
    {
      // Обрабатываем конструкцию: variant.
      variant = "primary",
      // Обрабатываем конструкцию: size.
      size = "md",
      // Обрабатываем конструкцию: loading.
      loading = false,
      // Обрабатываем конструкцию: icon.
      icon,
      // Обрабатываем конструкцию: iconRight.
      iconRight,
      // Обрабатываем конструкцию: fullWidth.
      fullWidth = false,
      // Обрабатываем конструкцию: disabled.
      disabled,
      // Обрабатываем конструкцию: className.
      className,
      // Обрабатываем конструкцию: children.
      children,
      // Обрабатываем конструкцию: type.
      type = "button",
      // Обрабатываем конструкцию: ....
      ...rest
      // Закрываем текущий блок.
    },
    // Объявляем параметр ref функции.
    ref
    // Закрываем выражение или список аргументов.
  ) {
    // Обрабатываем конструкцию: const isDisabled = disabled === true || loading.
    const isDisabled = disabled === true || loading;
    // — разделитель логических блоков —

    // Возвращаем результат: ( <motion.button ref={ref} type={type} disabled={isDisa….
    return (
      // Обрабатываем конструкцию: <motion.button ref={ref} type={type} disabled={isDisabl….
      <motion.button
        // Обрабатываем конструкцию: ref.
        ref={ref}
        // Обрабатываем конструкцию: type.
        type={type}
        // Обрабатываем конструкцию: disabled.
        disabled={isDisabled}
        // Обрабатываем конструкцию: aria-busy.
        aria-busy={loading}
        // Обрабатываем конструкцию: {...(isDisabled ? {} : { whileTap: { scale: 0.97 } })}.
        {...(isDisabled ? {} : { whileTap: { scale: 0.97 } })}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: 0.15, ease: "easeOut" }}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: inline-flex shrink-0 items-center justify-center font-m….
          "inline-flex shrink-0 items-center justify-center font-medium",
          // Обрабатываем конструкцию: transition-colors duration-200 ease-out select-none.
          "transition-colors duration-200 ease-out select-none",
          // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-50.
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Обрабатываем конструкцию: VARIANT_CLASSES.
          VARIANT_CLASSES[variant],
          // Обрабатываем конструкцию: SIZE_CLASSES.
          SIZE_CLASSES[size],
          // Обрабатываем конструкцию: fullWidth.
          fullWidth && "w-full",
          // Обрабатываем конструкцию: className.
          className
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: {...rest}.
        {...rest}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {loading ? (
          // Рендерим самозакрывающийся элемент Loader2.
          <Loader2
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: strokeWidth.
            strokeWidth={2}
            // Обрабатываем конструкцию: className.
            className={cn("animate-spin", ICON_SIZE_CLASSES[size])}
            // Продолжаем выражение.
          />
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        icon ? (
          // Обрабатываем конструкцию: <span aria-hidden=true className={cn(inline-flex, ICON_….
          <span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className={cn("inline-flex", ICON_SIZE_CLASSES[size])}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {icon}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {children}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {!loading && iconRight ? (
          // Обрабатываем конструкцию: <span aria-hidden=true className={cn(inline-flex, ICON_….
          <span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className={cn("inline-flex", ICON_SIZE_CLASSES[size])}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {iconRight}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.button>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —
