// Импортируем зависимости из модуля react.
import {
  // Подключаем именованный импорт forwardRef.
  forwardRef,
  // Подключаем именованный импорт useId.
  useId,
  // Подключаем именованный импорт type InputHTMLAttributes.
  type InputHTMLAttributes,
  // Подключаем именованный импорт type ReactNode.
  type ReactNode,
  // Закрываем текущий блок.
} from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { ControlSize } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type InputVariant = "default" | "filled";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InputProps extends Omit<
  // Обрабатываем конструкцию: InputHTMLAttributes.
  InputHTMLAttributes<HTMLInputElement>,
  // Обрабатываем конструкцию: size.
  "size"
  // Продолжаем выражение.
> {
  // Обрабатываем конструкцию: variant.
  variant?: InputVariant;
  // Обрабатываем конструкцию: size.
  size?: ControlSize;
  // Обрабатываем конструкцию: icon.
  icon?: ReactNode;
  // Обрабатываем конструкцию: iconRight.
  iconRight?: ReactNode;
  // Обрабатываем конструкцию: error.
  error?: boolean;
  // Обрабатываем конструкцию: errorMessage.
  errorMessage?: string | undefined;
  // Обрабатываем конструкцию: label.
  label?: string | undefined;
  // Обрабатываем конструкцию: hint.
  hint?: string | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FIELD_CLASSES = { default: bg-transparent border-….
const FIELD_CLASSES = {
  // Обрабатываем конструкцию: default.
  default: "bg-transparent border-b border-glass-border px-0 rounded-none",
  // Обрабатываем конструкцию: filled.
  filled: "bg-glass-bg border border-glass-border px-3 rounded-lg",
  // Закрываем текущий блок.
} as const satisfies Record<InputVariant, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SIZE_CLASSES = { sm: { field: h-8 text-xs, icon: ….
const SIZE_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: { field: "h-8 text-xs", icon: "size-3.5" },
  // Обрабатываем конструкцию: md.
  md: { field: "h-10 text-sm", icon: "size-4" },
  // Обрабатываем конструкцию: lg.
  lg: { field: "h-12 text-base", icon: "size-5" },
  // Закрываем текущий блок.
} as const satisfies Record<ControlSize, { field: string; icon: string }>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  // Объявляем параметр { variant = default, size = md, icon, ic… функции.
  {
    // Обрабатываем конструкцию: variant.
    variant = "default",
    // Обрабатываем конструкцию: size.
    size = "md",
    // Обрабатываем конструкцию: icon.
    icon,
    // Обрабатываем конструкцию: iconRight.
    iconRight,
    // Обрабатываем конструкцию: error.
    error = false,
    // Обрабатываем конструкцию: errorMessage.
    errorMessage,
    // Обрабатываем конструкцию: label.
    label,
    // Обрабатываем конструкцию: hint.
    hint,
    // Обрабатываем конструкцию: className.
    className,
    // Обрабатываем конструкцию: id.
    id,
    // Обрабатываем конструкцию: disabled.
    disabled,
    // Обрабатываем конструкцию: ....
    ...rest
    // Закрываем текущий блок.
  },
  // Объявляем параметр ref функции.
  ref
  // Закрываем выражение или список аргументов.
) {
  // Обрабатываем конструкцию: const generatedId = useId().
  const generatedId = useId();
  // Обрабатываем конструкцию: const inputId = id ?? generatedId.
  const inputId = id ?? generatedId;
  // Обрабатываем конструкцию: const messageId = ${inputId}-message.
  const messageId = `${inputId}-message`;
  // Обрабатываем конструкцию: const hasMessage = errorMessage !== undefined || hint !….
  const hasMessage = errorMessage !== undefined || hint !== undefined;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const fieldSize = SIZE_CLASSES[size].
  const fieldSize = SIZE_CLASSES[size];
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex w-full flex-col gap-1.5> {label !….
  return (
    // Обрабатываем конструкцию: <div className=flex w-full flex-col gap-1.5>.
    <div className="flex w-full flex-col gap-1.5">
      {/* Выводим текстовое содержимое в JSX. */}
      {label !== undefined ? (
        // Обрабатываем конструкцию: <label htmlFor={inputId} className=text-text-secondary ….
        <label
          // Обрабатываем конструкцию: htmlFor.
          htmlFor={inputId}
          // Обрабатываем конструкцию: className.
          className="text-text-secondary text-sm font-medium"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </label>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: flex items-center gap-2 transition-colors duration-200 ….
          "flex items-center gap-2 transition-colors duration-200 ease-out",
          // Обрабатываем конструкцию: focus-within:border-accent-primary.
          "focus-within:border-accent-primary",
          // Обрабатываем конструкцию: error.
          error && "border-accent-danger",
          // Обрабатываем конструкцию: disabled.
          disabled && "cursor-not-allowed opacity-50",
          // Обрабатываем конструкцию: FIELD_CLASSES.
          FIELD_CLASSES[variant],
          // Обрабатываем конструкцию: fieldSize.
          fieldSize.field
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {icon !== undefined ? (
          // Обрабатываем конструкцию: <span aria-hidden=true className={cn( inline-flex shrin….
          <span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: inline-flex shrink-0.
              "inline-flex shrink-0",
              // Обрабатываем конструкцию: fieldSize.
              fieldSize.icon,
              // Обрабатываем конструкцию: error.
              error ? "text-accent-danger" : "text-text-tertiary"
              // Закрываем выражение или список аргументов.
            )}
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
        <input
          // Обрабатываем конструкцию: ref.
          ref={ref}
          // Обрабатываем конструкцию: id.
          id={inputId}
          // Обрабатываем конструкцию: disabled.
          disabled={disabled}
          // Обрабатываем конструкцию: aria-invalid.
          aria-invalid={error}
          // Обрабатываем конструкцию: aria-describedby.
          aria-describedby={hasMessage ? messageId : undefined}
          // Сохраняем пояснение разработчика: // Рамку фокуса рисует обёртка поля через focus-within. Без …
          // Рамку фокуса рисует обёртка поля через focus-within. Без этой
          // Сохраняем пояснение разработчика: // метки на самом инпуте поверх неё ложится ещё и общее прав…
          // метки на самом инпуте поверх неё ложится ещё и общее правило
          // Сохраняем пояснение разработчика: // :focus-visible, и поле выглядит обведённым дважды.
          // :focus-visible, и поле выглядит обведённым дважды.
          // Задаём атрибут data-focus-quiet элемента.
          data-focus-quiet
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: text-text-primary min-w-0 flex-1 bg-transparent outline….
            "text-text-primary min-w-0 flex-1 bg-transparent outline-none",
            // Обрабатываем конструкцию: placeholder:text-text-tertiary.
            "placeholder:text-text-tertiary",
            // Обрабатываем конструкцию: disabled:cursor-not-allowed.
            "disabled:cursor-not-allowed",
            // Обрабатываем конструкцию: fieldSize.
            fieldSize.field,
            // Обрабатываем конструкцию: variant.
            variant === "default" && "px-0",
            // Обрабатываем конструкцию: className.
            className
            // Закрываем выражение или список аргументов.
          )}
          // Обрабатываем конструкцию: {...rest}.
          {...rest}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {iconRight !== undefined ? (
          // Обрабатываем конструкцию: <span aria-hidden=true className={cn( inline-flex shrin….
          <span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: inline-flex shrink-0.
              "inline-flex shrink-0",
              // Обрабатываем конструкцию: fieldSize.
              fieldSize.icon,
              // Обрабатываем конструкцию: error.
              error ? "text-accent-danger" : "text-text-tertiary"
              // Закрываем выражение или список аргументов.
            )}
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
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {hasMessage ? (
        // Обрабатываем конструкцию: <p id={messageId} className={cn( text-xs, error ? text-….
        <p
          // Обрабатываем конструкцию: id.
          id={messageId}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: text-xs.
            "text-xs",
            // Обрабатываем конструкцию: error.
            error ? "text-accent-danger" : "text-text-tertiary"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {errorMessage ?? hint}
          {/* Выводим текстовое содержимое в JSX. */}
        </p>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
