import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import type { TooltipSide } from "./types";

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  delay?: number;
  className?: string;
  children: ReactElement<{ "aria-describedby"?: string | undefined }>;
}

interface TooltipPosition {
  top: number;
  left: number;
}

const OFFSET = 8;

function computePosition(
  target: DOMRect,
  tooltip: DOMRect,
  side: TooltipSide
): TooltipPosition {
  switch (side) {
    case "top":
      return {
        top: target.top - tooltip.height - OFFSET,
        left: target.left + (target.width - tooltip.width) / 2,
      };
    case "bottom":
      return {
        top: target.bottom + OFFSET,
        left: target.left + (target.width - tooltip.width) / 2,
      };
    case "left":
      return {
        top: target.top + (target.height - tooltip.height) / 2,
        left: target.left - tooltip.width - OFFSET,
      };
    case "right":
      return {
        top: target.top + (target.height - tooltip.height) / 2,
        left: target.right + OFFSET,
      };
  }
}

export default function Tooltip({
  content,
  side = "top",
  delay = 300,
  className,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  });
  const targetRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const tooltipId = useId();

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const handleEnter = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, delay);
  }, [clearTimer, delay]);

  const handleLeave = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const target = targetRef.current?.firstElementChild ?? null;
    const tooltip = tooltipRef.current;

    if (target === null || tooltip === null) {
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    setPosition(computePosition(targetRect, tooltipRect, side));
  }, [open, side, content]);

  const positionStyle: CSSProperties = {
    top: position.top,
    left: position.left,
  };

  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className="inline-flex"
      >
        {cloneElement(children, {
          "aria-describedby": open ? tooltipId : undefined,
        })}
      </span>

      {createPortal(
        open ? (
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={positionStyle}
            className={cn(
              "pointer-events-none fixed z-1000 max-w-xs rounded-lg",
              "bg-bg-secondary border border-white/10 px-2.5 py-1.5",
              "text-text-primary text-xs shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
              className
            )}
          >
            {content}
          </div>
        ) : null,
        document.body
      )}
    </>
  );
}
