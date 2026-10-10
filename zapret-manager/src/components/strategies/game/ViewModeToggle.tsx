import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const OPTIONS = [
  { value: "cards", label: "Карты", icon: LayoutGrid },
  { value: "list", label: "Список", icon: List },
] as const satisfies readonly {
  value: ViewMode;
  label: string;
  icon: typeof LayoutGrid;
}[];

function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Режим отображения стратегий"
      className="border-glass-border bg-glass-bg flex items-center gap-1 rounded-lg border p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
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
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
