import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type FilterChipVariant =
  "info" | "warn" | "error" | "success" | "debug" | "neutral";

export interface FilterChipProps {
  label: string;
  count?: number;
  active: boolean;
  variant?: FilterChipVariant;
  disabled?: boolean;
  onToggle: () => void;
}

const ACTIVE_CLASSES = {
  info: "bg-accent-secondary/15 border-accent-secondary/40 text-accent-secondary",
  warn: "bg-accent-warning/15 border-accent-warning/40 text-accent-warning",
  error: "bg-accent-danger/15 border-accent-danger/40 text-accent-danger",
  success: "bg-accent-primary/15 border-accent-primary/40 text-accent-primary",
  debug: "bg-glass-hover border-glass-border text-text-secondary",
  neutral: "bg-glass-hover border-glass-border text-text-primary",
} as const satisfies Record<FilterChipVariant, string>;

function FilterChip({
  label,
  count,
  active,
  variant = "neutral",
  disabled = false,
  onToggle,
}: FilterChipProps) {
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onToggle}
      whileTap={disabled ? { scale: 1 } : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs",
        "transition-colors duration-200 ease-out focus-visible:outline-none",
        "focus-visible:ring-accent-primary focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? ACTIVE_CLASSES[variant]
          : "border-glass-border text-text-tertiary hover:bg-glass-hover hover:text-text-secondary"
      )}
    >
      {label}
      {count !== undefined ? (
        <span className="tabular-nums opacity-70">{count}</span>
      ) : null}
    </motion.button>
  );
}

export default FilterChip;
