import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui";
import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { cn } from "@/lib/utils";
import type { SortMode } from "@/types";

export interface SortDropdownProps {
  value: SortMode;
  onChange: (value: SortMode) => void;
}

const OPTIONS = [
  { value: "rarity-desc", labelKey: "strategies.sort.rarityDesc" },
  { value: "rarity-asc", labelKey: "strategies.sort.rarityAsc" },
  { value: "name", labelKey: "strategies.sort.name" },
  { value: "date", labelKey: "strategies.sort.date" },
] as const satisfies readonly { value: SortMode; labelKey: TranslationKey }[];

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        size="sm"
        variant="secondary"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((previous) => !previous);
        }}
        iconRight={
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3.5 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        }
      >
        {current === undefined
          ? t("strategies.sort.title")
          : t(current.labelKey)}
      </Button>

      {open ? (
        <ul
          role="listbox"
          className="bg-bg-secondary border-glass-border absolute right-0 z-30 mt-1 w-40 overflow-hidden rounded-lg border py-1 shadow-xl"
        >
          {OPTIONS.map((option) => {
            const isActive = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "hover:bg-glass-hover block w-full px-3 py-1.5 text-left text-xs",
                    "transition-colors duration-150 focus-visible:outline-none",
                    isActive ? "text-accent-primary" : "text-text-secondary"
                  )}
                >
                  {t(option.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default SortDropdown;
