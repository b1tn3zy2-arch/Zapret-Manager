import { useI18n } from "@/i18n";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  MODAL_BACKDROP_BLUR_PX,
  MODAL_BACKDROP_SATURATE,
} from "@/lib/constants";

import type { ModalSize } from "./types";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

const WIDTH_CLASSES = {
  sm: "max-w-[var(--modal-width-sm)]",
  md: "max-w-[var(--modal-width-md)]",
  lg: "max-w-[var(--modal-width-lg)]",
  xl: "max-w-[var(--modal-width-xl)]",
} as const satisfies Record<ModalSize, string>;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const PANEL_TRANSITION = { duration: 0.25, ease: [0.16, 1, 0.3, 1] } as const;

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className,
  children,
}: ModalProps) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel !== null) {
      const [first] = getFocusable(panel);
      (first ?? panel).focus();
    }

    return () => {
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;
      if (panel === null) {
        return;
      }

      const focusable = getFocusable(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }

      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, closeOnEscape, onClose]);

  const hasTitle = title !== undefined;
  const hasDescription = description !== undefined;
  const hasHeader = (hasTitle || hasDescription) && showCloseButton;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={closeOnBackdrop ? onClose : undefined}
            style={{
              backdropFilter: `blur(${MODAL_BACKDROP_BLUR_PX}px) saturate(${MODAL_BACKDROP_SATURATE})`,
            }}
            className="bg-bg-primary/60 absolute inset-0"
          />

          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-describedby={hasDescription ? descriptionId : undefined}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={PANEL_TRANSITION}
            className={cn(
              "relative flex max-h-[85vh] w-full flex-col gap-4 overflow-y-auto",
              "bg-bg-secondary/95 border-glass-border rounded-2xl border p-6",
              "shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl outline-none",
              WIDTH_CLASSES[size],
              className
            )}
          >
            {hasHeader ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  {hasTitle ? (
                    <h2
                      id={titleId}
                      className="text-text-primary text-lg font-semibold"
                    >
                      {title}
                    </h2>
                  ) : null}
                  {hasDescription ? (
                    <p
                      id={descriptionId}
                      className="text-text-secondary text-sm"
                    >
                      {description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t("ui.closeAria")}
                  className={cn(
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                    "text-text-secondary transition-colors duration-200 ease-out",
                    "hover:text-text-primary hover:bg-glass-hover"
                  )}
                >
                  <X aria-hidden="true" className="size-4" strokeWidth={2} />
                </button>
              </div>
            ) : null}

            {hasTitle && !showCloseButton ? (
              <div className="flex flex-col gap-1">
                <h2
                  id={titleId}
                  className="text-text-primary text-lg font-semibold"
                >
                  {title}
                </h2>
                {hasDescription ? (
                  <p id={descriptionId} className="text-text-secondary text-sm">
                    {description}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
              {children}
            </div>

            {footer !== undefined ? (
              <div className="border-glass-border flex justify-end gap-2 border-t pt-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
