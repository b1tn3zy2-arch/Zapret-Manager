import type { ReactNode } from "react";

import { useBloom } from "@/hooks/useBloom";
import { cn } from "@/lib/utils";

import type { BadgeSize, BadgeVariant } from "./types";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: ReactNode;
}

const VARIANT_CLASSES = {
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  warning: "bg-accent-warning/10 text-accent-warning border-accent-warning/20",
  error: "bg-accent-danger/10 text-accent-danger border-accent-danger/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  neutral: "bg-glass-bg text-text-secondary border-glass-border",
  accent: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
} as const satisfies Record<BadgeVariant, string>;

const SIZE_CLASSES = {
  sm: "h-5 px-2 text-xs",
  md: "h-6 px-2.5 text-xs",
} as const satisfies Record<BadgeSize, string>;

const DOT_SIZE_CLASSES = {
  sm: "size-1.5",
  md: "size-2",
} as const satisfies Record<BadgeSize, string>;

const BLOOM_VARIANTS: Partial<
  Record<BadgeVariant, "primary" | "danger" | "warning">
> = {
  success: "primary",
  error: "danger",
  warning: "warning",
  accent: "primary",
};

export default function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  className,
  children,
}: BadgeProps) {
  const bloomColor = pulse ? (BLOOM_VARIANTS[variant] ?? "primary") : undefined;
  const bloom = useBloom(bloomColor ?? "primary", -1);
  const glow = bloomColor !== undefined && bloom.textShadow !== "";

  return (
    <span
      style={glow ? { textShadow: bloom.textShadow } : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        "whitespace-nowrap",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 rounded-full bg-current",
            DOT_SIZE_CLASSES[size],
            pulse && "animate-pulse"
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
