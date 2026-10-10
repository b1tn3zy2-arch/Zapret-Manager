import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const SHAPE_CLASSES = {
  text: "h-4 w-full rounded-md",
  circle: "rounded-full",
  rect: "rounded-lg",
} as const satisfies Record<SkeletonVariant, string>;

function toCssSize(value: string | number | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === "number" ? `${value}px` : value;
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className,
}: SkeletonProps) {
  const sizeStyle: CSSProperties = {
    width: toCssSize(width),
    height: toCssSize(height),
  };

  return (
    <div
      aria-hidden="true"
      style={sizeStyle}
      className={cn(
        "animate-shimmer from-glass-bg via-glass-hover to-glass-bg shrink-0 bg-gradient-to-r bg-[length:200%_100%]",
        SHAPE_CLASSES[variant],
        variant === "rect" && width === undefined && "w-full",
        className
      )}
    />
  );
}
