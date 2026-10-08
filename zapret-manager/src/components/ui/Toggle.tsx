import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { ControlSize } from "./types";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: ControlSize;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
  description?: string;
  className?: string;
}

const TRACK_CLASSES = {
  sm: { track: "h-[18px] w-8", pad: "p-0.5", thumb: "size-3.5" },
  md: { track: "h-[22px] w-10", pad: "p-0.5", thumb: "size-[18px]" },
  lg: { track: "h-[26px] w-12", pad: "p-1", thumb: "size-5" },
} as const satisfies Record<
  ControlSize,
  { track: string; pad: string; thumb: string }
>;

export default function Toggle({
  checked,
  onChange,
  size = "md",
  disabled = false,
  label,
  ariaLabel,
  description,
  className,
}: ToggleProps) {
  const metrics = TRACK_CLASSES[size];

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => {
        onChange(!checked);
      }}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full",
        "transition-colors duration-200 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-50",
        metrics.track,
        metrics.pad,
        checked ? "bg-accent-primary" : "bg-white/10",
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        animate={{ x: checked ? "100%" : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn("block rounded-full bg-white shadow-sm", metrics.thumb)}
      />
    </button>
  );

  if (label === undefined && description === undefined) {
    return control;
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        {label !== undefined ? (
          <span className="text-text-primary text-sm font-medium">{label}</span>
        ) : null}
        {description !== undefined ? (
          <span className="text-text-secondary text-xs">{description}</span>
        ) : null}
      </div>
      {control}
    </div>
  );
}
