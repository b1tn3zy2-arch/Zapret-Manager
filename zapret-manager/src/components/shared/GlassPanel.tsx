import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type GlassPanelVariant = "default" | "interactive" | "outlined";
export type GlassPanelPadding = "none" | "sm" | "md" | "lg";
export type GlassPanelRounded = "md" | "lg" | "xl";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: GlassPanelVariant;
  padding?: GlassPanelPadding;
  rounded?: GlassPanelRounded;
}

const VARIANT_CLASSES = {
  default: "bg-glass-bg border border-glass-border",
  interactive:
    "bg-glass-bg border border-glass-border hover:bg-glass-hover hover:border-glass-border",
  outlined: "bg-transparent border border-glass-border",
} as const satisfies Record<GlassPanelVariant, string>;

const PADDING_CLASSES = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const satisfies Record<GlassPanelPadding, string>;

const ROUNDED_CLASSES = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
} as const satisfies Record<GlassPanelRounded, string>;

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    {
      children,
      variant = "default",
      padding = "md",
      rounded = "lg",
      className,
      ...rest
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "backdrop-blur-xl",
          VARIANT_CLASSES[variant],
          PADDING_CLASSES[padding],
          ROUNDED_CLASSES[rounded],
          variant === "interactive" &&
            "transition-colors duration-200 ease-out hover:scale-[1.01]",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
