import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { HeadingLevel } from "./types";

export interface HeadingProps {
  level?: HeadingLevel;
  className?: string;
  children: ReactNode;
}

const LEVEL_CLASSES = {
  1: "text-4xl font-bold tracking-tight",
  2: "text-2xl font-semibold tracking-tight",
  3: "text-xl font-semibold",
  4: "text-lg font-medium",
  5: "text-base font-medium",
  6: "text-sm font-medium",
} as const satisfies Record<HeadingLevel, string>;

export default function Heading({
  level = 1,
  className,
  children,
}: HeadingProps) {
  const Tag = `h${level}` as ElementType;

  return (
    <Tag
      className={cn(
        "text-text-primary",
        LEVEL_CLASSES[level],
        level === 6 && "text-text-secondary",
        className
      )}
    >
      {children}
    </Tag>
  );
}
