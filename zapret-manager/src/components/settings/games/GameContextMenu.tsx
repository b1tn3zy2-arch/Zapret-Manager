import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { type LucideIcon } from "lucide-react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export interface GameContextMenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onSelect: () => void;
}

export interface GameContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  items: GameContextMenuItem[];
  onClose: () => void;
}

export default function GameContextMenu({
  open,
  x,
  y,
  items,
  onClose,
}: GameContextMenuProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent): void => {
      if (ref.current?.contains(event.target as Node) === true) {
        return;
      }

      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      ref={ref}
      role="menu"
      aria-label={t("settings.games.installed.context.menu")}
      style={{ left: x, top: y }}
      className={cn(
        "bg-bg-secondary/95 border-glass-border fixed z-50 min-w-[200px] rounded-lg border",
        "p-1 shadow-xl backdrop-blur-xl"
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="menuitem"
          onClick={() => {
            item.onSelect();
            onClose();
          }}
          className={cn(
            "hover:bg-glass-hover text-text-secondary hover:text-text-primary flex w-full",
            "items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
            item.danger === true &&
              "text-accent-danger hover:text-accent-danger"
          )}
        >
          <item.icon aria-hidden="true" className="size-3.5 shrink-0" />
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
