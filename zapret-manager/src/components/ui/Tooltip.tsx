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

import { TOOLTIP_Z_INDEX } from "@/lib/constants";
import { cn } from "@/lib/utils";

import type { TooltipSide } from "./types";

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  delay?: number;
  className?: string;
  /** Отключить перенос по краям окна */
  clampToViewport?: boolean;
  /** Класс обёртки вокруг элемента: по умолчанию ряд в потоке */
  wrapperClassName?: string;
  children: ReactElement<{ "aria-describedby"?: string | undefined }>;
}

interface TooltipPosition {
  top: number;
  left: number;
  side: TooltipSide;
}

const OFFSET = 8;
const VIEWPORT_MARGIN = 8;

function computePosition(
  target: DOMRect,
  tooltip: DOMRect,
  side: TooltipSide,
  viewportWidth: number,
  viewportHeight: number,
  clampToViewport: boolean
): TooltipPosition {
  const fitsAbove = target.top - tooltip.height - OFFSET >= 0;
  const fitsBelow = target.bottom + OFFSET + tooltip.height <= viewportHeight;
  let resolved = side;

  // переворот по вертикали: тултип не должен уезжать за верх или низ окна
  if (side === "top" && !fitsAbove && fitsBelow) {
    resolved = "bottom";
  } else if (side === "bottom" && !fitsBelow && fitsAbove) {
    resolved = "top";
  }

  let left = 0;
  let top = 0;

  switch (resolved) {
    case "top":
      top = target.top - tooltip.height - OFFSET;
      left = target.left + (target.width - tooltip.width) / 2;
      break;
    case "bottom":
      top = target.bottom + OFFSET;
      left = target.left + (target.width - tooltip.width) / 2;
      break;
    case "left":
      top = target.top + (target.height - tooltip.height) / 2;
      left = target.left - tooltip.width - OFFSET;
      break;
    case "right":
      top = target.top + (target.height - tooltip.height) / 2;
      left = target.right + OFFSET;
      break;
  }

  if (clampToViewport) {
    left = Math.min(
      Math.max(left, VIEWPORT_MARGIN),
      Math.max(VIEWPORT_MARGIN, viewportWidth - tooltip.width - VIEWPORT_MARGIN)
    );
    top = Math.min(
      Math.max(top, VIEWPORT_MARGIN),
      Math.max(
        VIEWPORT_MARGIN,
        viewportHeight - tooltip.height - VIEWPORT_MARGIN
      )
    );
  }

  return { top, left, side: resolved };
}

/**
 * Подсказка, которая появляется при наведении или фокусе.
 *
 * Позиция считается один раз при открытии, но пересчитывается при прокрутке и
 * изменении размера окна: иначе подсказка оставалась висеть на старом месте,
 * когда список под ней прокручивали. Тултип не перехватывает курсор и
 * закрывается по Escape.
 */
export default function Tooltip({
  content,
  side = "top",
  delay = 400,
  className,
  clampToViewport = true,
  wrapperClassName,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    side,
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

  const updatePosition = useCallback(() => {
    const target = targetRef.current?.firstElementChild ?? null;
    const tooltip = tooltipRef.current;

    if (target === null || tooltip === null) {
      return;
    }

    setPosition(
      computePosition(
        target.getBoundingClientRect(),
        tooltip.getBoundingClientRect(),
        side,
        window.innerWidth,
        window.innerHeight,
        clampToViewport
      )
    );
  }, [clampToViewport, side]);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [content, open, updatePosition]);

  const positionStyle: CSSProperties = {
    top: position.top,
    left: position.left,
    // подсказка всегда рисуется поверх пост-обработки (виньетка, зерно)
    zIndex: TOOLTIP_Z_INDEX,
  };

  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        className={cn("inline-flex", wrapperClassName)}
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
              "pointer-events-none fixed max-w-xs rounded-lg",
              "bg-bg-secondary border-glass-border border px-2.5 py-1.5",
              "text-text-primary text-xs leading-relaxed shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
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
