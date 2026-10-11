import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps<T extends string> {
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
  align?: "left" | "right";
}

function Dropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled = false,
  align = "left",
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [placement, setPlacement] = useState<"down" | "up">("down");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected =
    options.find((option) => option.value === value) ?? options[0];

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = (): void => {
    const trigger = triggerRef.current;

    if (trigger !== null) {
      const bounds = trigger.getBoundingClientRect();
      const estimated = Math.min(options.length * 36 + 12, 280);
      const spaceBelow = window.innerHeight - bounds.bottom;

      setRect(bounds);
      setPlacement(
        spaceBelow < estimated + 12 && bounds.top > spaceBelow ? "up" : "down"
      );
    }

    setOpen((current) => !current);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleResize = (): void => {
      close();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [close, open]);

  const choose = useCallback(
    (option: DropdownOption<T>) => {
      if (option.disabled === true) {
        return;
      }
      onChange(option.value);
      close();
    },
    [close, onChange]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest(`[aria-controls="${listId}"]`) !== null
        )
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointer);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
    };
  }, [close, listId, open]);

  const move = (step: number): void => {
    const count = options.length;

    if (count === 0) {
      return;
    }

    setActiveIndex((index) => (index + step + count) % count);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      move(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      move(-1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }

      const option = options[activeIndex];

      if (option !== undefined) {
        choose(option);
      }
    }
  };

  const list = (
    <AnimatePresence>
      {open && rect !== null ? (
        <motion.ul
          id={listId}
          role="listbox"
          aria-label={label}
          initial={{ opacity: 0, y: placement === "up" ? 4 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: placement === "up" ? 4 : -4 }}
          transition={{ duration: 0.12 }}
          style={{
            top: placement === "up" ? undefined : rect.bottom + 4,
            bottom:
              placement === "up"
                ? window.innerHeight - rect.top + 4
                : undefined,
            left: align === "right" ? undefined : rect.left,
            right:
              align === "right" ? window.innerWidth - rect.right : undefined,
            minWidth: Math.max(rect.width, 180),
            maxHeight:
              placement === "up"
                ? Math.max(140, rect.top - 12)
                : Math.max(140, window.innerHeight - rect.bottom - 12),
          }}
          className={cn(
            "fixed z-50 overflow-x-hidden overflow-y-auto rounded-lg",
            "bg-bg-tertiary/95 border-glass-border border py-1 shadow-2xl backdrop-blur-xl"
          )}
        >
          {options.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                disabled={option.disabled === true}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
                onClick={() => {
                  choose(option);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                  index === activeIndex && !option.disabled
                    ? "text-text-primary bg-glass-hover"
                    : "text-text-secondary"
                )}
              >
                <span>{option.label}</span>
                {option.value === value ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : null}
              </button>
            </li>
          ))}
        </motion.ul>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={open ? listId : undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-controls={open ? listId : undefined}
        onClick={toggle}
        className={cn(
          "inline-flex min-w-[180px] items-center justify-between gap-2 rounded-lg",
          "text-text-primary border-glass-border bg-glass-bg border px-3 py-2 text-sm",
          "hover:bg-glass-hover transition-colors duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
      </button>

      {createPortal(list, document.body)}
    </div>
  );
}

export default Dropdown;
