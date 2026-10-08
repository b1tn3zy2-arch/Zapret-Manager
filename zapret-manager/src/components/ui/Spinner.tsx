import { cn } from "@/lib/utils";

import type { SpinnerSize } from "./types";

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const PIXEL_SIZE = {
  sm: 16,
  md: 24,
  lg: 32,
} as const satisfies Record<SpinnerSize, number>;

export default function Spinner({ size = "md", className }: SpinnerProps) {
  const pixels = PIXEL_SIZE[size];

  return (
    <svg
      role="status"
      aria-label="Загрузка"
      viewBox="0 0 24 24"
      width={pixels}
      height={pixels}
      fill="none"
      className={cn("animate-spin text-current", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
