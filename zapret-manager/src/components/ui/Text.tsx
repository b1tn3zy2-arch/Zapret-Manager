import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import type { ControlSize, TextVariant } from "./types";

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TextVariant;
  size?: ControlSize;
}

const VARIANT_CLASSES = {
  body: "text-text-primary font-normal",
  caption: "text-text-secondary",
  label: "text-text-secondary font-medium",
  mono: "font-mono text-text-primary",
} as const satisfies Record<TextVariant, string>;

const SIZE_CLASSES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const satisfies Record<ControlSize, string>;

export default function Text({
  variant = "body",
  size = "md",
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <span
      className={cn(VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...rest}
    >
      {children}
    </span>
  );
}
