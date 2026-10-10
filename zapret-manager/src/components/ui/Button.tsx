import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

import { useBloom } from "@/hooks/useBloom";
import { cn } from "@/lib/utils";

import type { ButtonSize, ControlVariant } from "./types";

export interface ButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  variant?: ControlVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANT_BLOOM: Partial<Record<ControlVariant, "primary" | "danger">> = {
  primary: "primary",
  danger: "danger",
};

const VARIANT_CLASSES = {
  primary: "bg-accent-primary text-on-accent hover:bg-accent-primary/90",
  secondary:
    "bg-glass-bg text-text-primary border border-glass-border hover:bg-glass-hover hover:border-glass-border",
  ghost:
    "bg-transparent text-text-secondary hover:bg-glass-hover hover:text-text-primary",
  danger:
    "bg-accent-danger/10 text-accent-danger border border-accent-danger/30 hover:bg-accent-danger/20",
} as const satisfies Record<ControlVariant, string>;

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2",
  icon: "size-10 p-0 rounded-lg",
} as const satisfies Record<ButtonSize, string>;

const ICON_SIZE_CLASSES = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  icon: "size-4",
} as const satisfies Record<ButtonSize, string>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled === true || loading;
    const bloomColor = VARIANT_BLOOM[variant];
    const bloom = useBloom(bloomColor ?? "primary");
    const bloomStyle =
      isDisabled || bloomColor === undefined
        ? undefined
        : {
            boxShadow: bloom.boxShadow,
            transitionProperty:
              "box-shadow, background-color, border-color, color",
            transitionDuration: "200ms",
          };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        {...(isDisabled ? {} : { whileTap: { scale: 0.97 } })}
        transition={{ duration: 0.15, ease: "easeOut" }}
        {...(bloomStyle === undefined ? {} : { style: bloomStyle })}
        onMouseEnter={(event) => {
          if (!isDisabled && bloom.boxShadowHover !== "") {
            event.currentTarget.style.boxShadow = bloom.boxShadowHover;
          }
          rest.onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          if (bloom.boxShadow !== "") {
            event.currentTarget.style.boxShadow = bloom.boxShadow;
          }
          rest.onMouseLeave?.(event);
        }}
        className={cn(
          "inline-flex shrink-0 items-center justify-center font-medium",
          "transition-colors duration-200 ease-out select-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {loading ? (
          <Loader2
            aria-hidden="true"
            strokeWidth={2}
            className={cn("animate-spin", ICON_SIZE_CLASSES[size])}
          />
        ) : icon ? (
          <span
            aria-hidden="true"
            className={cn("inline-flex", ICON_SIZE_CLASSES[size])}
          >
            {icon}
          </span>
        ) : null}

        {children}

        {!loading && iconRight ? (
          <span
            aria-hidden="true"
            className={cn("inline-flex", ICON_SIZE_CLASSES[size])}
          >
            {iconRight}
          </span>
        ) : null}
      </motion.button>
    );
  }
);
