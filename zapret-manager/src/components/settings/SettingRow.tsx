import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SettingRowProps {
  label: string;
  description?: string;
  control: ReactNode;
  error?: string | null;
  disabled?: boolean;
  stacked?: boolean;
}

function SettingRow({
  label,
  description,
  control,
  error = null,
  disabled = false,
  stacked = false,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex gap-3 py-3",
        stacked
          ? "flex-col items-stretch"
          : "items-center justify-between gap-6"
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "text-text-primary text-sm font-medium",
            disabled && "opacity-50"
          )}
        >
          {label}
        </span>
        {description !== undefined ? (
          <span className="text-text-secondary text-xs">{description}</span>
        ) : null}
        {error !== null ? (
          <span className="text-accent-danger text-xs">{error}</span>
        ) : null}
      </div>

      <div className={cn("shrink-0", stacked && "w-full")}>{control}</div>
    </div>
  );
}

export default SettingRow;
