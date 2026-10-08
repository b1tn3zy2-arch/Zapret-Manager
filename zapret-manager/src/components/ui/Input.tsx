import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import type { ControlSize } from "./types";

export type InputVariant = "default" | "filled";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  variant?: InputVariant;
  size?: ControlSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  error?: boolean;
  errorMessage?: string | undefined;
  label?: string | undefined;
  hint?: string | undefined;
}

const FIELD_CLASSES = {
  default: "bg-transparent border-b border-white/10 px-0 rounded-none",
  filled: "bg-white/5 border border-white/10 px-3 rounded-lg",
} as const satisfies Record<InputVariant, string>;

const SIZE_CLASSES = {
  sm: { field: "h-8 text-xs", icon: "size-3.5" },
  md: { field: "h-10 text-sm", icon: "size-4" },
  lg: { field: "h-12 text-base", icon: "size-5" },
} as const satisfies Record<ControlSize, { field: string; icon: string }>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = "default",
    size = "md",
    icon,
    iconRight,
    error = false,
    errorMessage,
    label,
    hint,
    className,
    id,
    disabled,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const hasMessage = errorMessage !== undefined || hint !== undefined;

  const fieldSize = SIZE_CLASSES[size];

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label !== undefined ? (
        <label
          htmlFor={inputId}
          className="text-text-secondary text-sm font-medium"
        >
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-2 transition-colors duration-200 ease-out",
          "focus-within:border-accent-primary",
          error && "border-accent-danger",
          disabled && "cursor-not-allowed opacity-50",
          FIELD_CLASSES[variant],
          fieldSize.field
        )}
      >
        {icon !== undefined ? (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex shrink-0",
              fieldSize.icon,
              error ? "text-accent-danger" : "text-text-tertiary"
            )}
          >
            {icon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error}
          aria-describedby={hasMessage ? messageId : undefined}
          className={cn(
            "text-text-primary min-w-0 flex-1 bg-transparent outline-none",
            "placeholder:text-text-tertiary",
            "disabled:cursor-not-allowed",
            fieldSize.field,
            variant === "default" && "px-0",
            className
          )}
          {...rest}
        />

        {iconRight !== undefined ? (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex shrink-0",
              fieldSize.icon,
              error ? "text-accent-danger" : "text-text-tertiary"
            )}
          >
            {iconRight}
          </span>
        ) : null}
      </div>

      {hasMessage ? (
        <p
          id={messageId}
          className={cn(
            "text-xs",
            error ? "text-accent-danger" : "text-text-tertiary"
          )}
        >
          {errorMessage ?? hint}
        </p>
      ) : null}
    </div>
  );
});
