import { LayoutGrid, List } from "lucide-react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS = [
  { value: "cards", labelKey: "strategies.view.cards", icon: LayoutGrid },
  { value: "list", labelKey: "strategies.view.list", icon: List },
] as const;

function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  const { t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("strategies.view.aria")}
      className="border-glass-border bg-glass-bg flex items-center gap-1 rounded-lg border p-0.5"
    >
      {OPTIONS.map(({ value, labelKey, icon: Icon }) => {
        const isActive = mode === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              onChange(value);
            }}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
              "transition-colors duration-200 ease-out focus-visible:outline-none",
              "focus-visible:ring-accent-primary focus-visible:ring-1",
              isActive
                ? "bg-accent-primary text-on-accent"
                : "text-text-secondary hover:bg-glass-hover"
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
