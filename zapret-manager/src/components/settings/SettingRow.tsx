import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";

import Tooltip from "@/components/ui/Tooltip";
import { translateKey } from "@/i18n/core";
import { cn } from "@/lib/utils";

export interface SettingRowProps {
  label: string;
  /**
   * Пояснение к настройке. Раньше оно всегда рисовалось строкой под названием и
   * превращало список настроек в простыню текста; теперь текст живёт в
   * подсказке и появляется только при наведении на название или на значок
   * «?», как в нормальных программах.
   */
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
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "text-text-primary text-sm font-medium",
              disabled && "opacity-50"
            )}
          >
            {label}
          </span>

          {description === undefined ? null : (
            <Tooltip content={description}>
              <button
                type="button"
                tabIndex={0}
                aria-label={translateKey("common.hint")}
                className={cn(
                  "text-text-tertiary hover:text-text-secondary",
                  "focus-visible:ring-accent-primary/60 shrink-0 rounded-full p-0.5",
                  "transition-colors focus-visible:ring-2 focus-visible:outline-none"
                )}
              >
                <CircleHelp aria-hidden="true" className="size-3.5" />
              </button>
            </Tooltip>
          )}
        </span>

        {error !== null ? (
          <span className="text-accent-danger text-xs">{error}</span>
        ) : null}
      </div>

      <div className={cn("shrink-0", stacked && "w-full")}>{control}</div>
    </div>
  );
}

export default SettingRow;
