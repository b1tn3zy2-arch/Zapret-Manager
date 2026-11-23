// Импортируем зависимости из модуля react.
import {
  // Подключаем именованный импорт cloneElement.
  cloneElement,
  // Подключаем именованный импорт useCallback.
  useCallback,
  // Подключаем именованный импорт useEffect.
  useEffect,
  // Подключаем именованный импорт useId.
  useId,
  // Подключаем именованный импорт useRef.
  useRef,
  // Подключаем именованный импорт useState.
  useState,
  // Подключаем именованный импорт type CSSProperties.
  type CSSProperties,
  // Подключаем именованный импорт type ReactElement.
  type ReactElement,
  // Подключаем именованный импорт type ReactNode.
  type ReactNode,
  // Закрываем текущий блок.
} from "react";
// Импортируем зависимости из модуля react-dom.
import { createPortal } from "react-dom";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { TOOLTIP_Z_INDEX } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { TooltipSide } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TooltipProps {
  // Обрабатываем конструкцию: content.
  content: ReactNode;
  // Обрабатываем конструкцию: side.
  side?: TooltipSide;
  // Обрабатываем конструкцию: delay.
  delay?: number;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Сохраняем пояснение разработчика: Отключить перенос по краям окна
  /** Отключить перенос по краям окна */
  // Обрабатываем конструкцию: clampToViewport.
  clampToViewport?: boolean;
  // Сохраняем пояснение разработчика: Класс обёртки вокруг элемента: по умолчанию ряд в потоке
  /** Класс обёртки вокруг элемента: по умолчанию ряд в потоке */
  // Обрабатываем конструкцию: wrapperClassName.
  wrapperClassName?: string;
  // Обрабатываем конструкцию: children.
  children: ReactElement<{ "aria-describedby"?: string | undefined }>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс TooltipPosition с контрактом данных.
interface TooltipPosition {
  // Обрабатываем конструкцию: top.
  top: number;
  // Обрабатываем конструкцию: left.
  left: number;
  // Обрабатываем конструкцию: side.
  side: TooltipSide;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const OFFSET = 8.
const OFFSET = 8;
// Обрабатываем конструкцию: const VIEWPORT_MARGIN = 8.
const VIEWPORT_MARGIN = 8;
// — разделитель логических блоков —

// Объявляем функцию computePosition.
function computePosition(
  // Обрабатываем конструкцию: target.
  target: DOMRect,
  // Обрабатываем конструкцию: tooltip.
  tooltip: DOMRect,
  // Обрабатываем конструкцию: side.
  side: TooltipSide,
  // Обрабатываем конструкцию: viewportWidth.
  viewportWidth: number,
  // Обрабатываем конструкцию: viewportHeight.
  viewportHeight: number,
  // Обрабатываем конструкцию: clampToViewport.
  clampToViewport: boolean
  // Закрываем выражение или список аргументов.
): TooltipPosition {
  // Обрабатываем конструкцию: const fitsAbove = target.top - tooltip.height - OFFSET ….
  const fitsAbove = target.top - tooltip.height - OFFSET >= 0;
  // Обрабатываем конструкцию: const fitsBelow = target.bottom + OFFSET + tooltip.heig….
  const fitsBelow = target.bottom + OFFSET + tooltip.height <= viewportHeight;
  // Обрабатываем конструкцию: let resolved = side.
  let resolved = side;
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // переворот по вертикали: тултип не должен уезжать за верх …
  // переворот по вертикали: тултип не должен уезжать за верх или низ окна
  // Проверяем бизнес-условие: side === top && !fitsAbove && fitsBelow.
  if (side === "top" && !fitsAbove && fitsBelow) {
    // Обрабатываем конструкцию: resolved.
    resolved = "bottom";
    // Закрываем текущий блок.
  } else if (side === "bottom" && !fitsBelow && fitsAbove) {
    // Обрабатываем конструкцию: resolved.
    resolved = "top";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: let left = 0.
  let left = 0;
  // Обрабатываем конструкцию: let top = 0.
  let top = 0;
  // — разделитель логических блоков —

  // Выбираем вариант по значению resolved.
  switch (resolved) {
    // Обрабатываем вариант top.
    case "top":
      // Обрабатываем конструкцию: top.
      top = target.top - tooltip.height - OFFSET;
      // Обрабатываем конструкцию: left.
      left = target.left + (target.width - tooltip.width) / 2;
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант bottom.
    case "bottom":
      // Обрабатываем конструкцию: top.
      top = target.bottom + OFFSET;
      // Обрабатываем конструкцию: left.
      left = target.left + (target.width - tooltip.width) / 2;
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант left.
    case "left":
      // Обрабатываем конструкцию: top.
      top = target.top + (target.height - tooltip.height) / 2;
      // Обрабатываем конструкцию: left.
      left = target.left - tooltip.width - OFFSET;
      // Прерываем текущий цикл или переключатель.
      break;
    // Обрабатываем вариант right.
    case "right":
      // Обрабатываем конструкцию: top.
      top = target.top + (target.height - tooltip.height) / 2;
      // Обрабатываем конструкцию: left.
      left = target.right + OFFSET;
      // Прерываем текущий цикл или переключатель.
      break;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: clampToViewport.
  if (clampToViewport) {
    // Обрабатываем конструкцию: left.
    left = Math.min(
      // Обрабатываем конструкцию: Math.
      Math.max(left, VIEWPORT_MARGIN),
      // Обрабатываем конструкцию: Math.
      Math.max(VIEWPORT_MARGIN, viewportWidth - tooltip.width - VIEWPORT_MARGIN)
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: top.
    top = Math.min(
      // Обрабатываем конструкцию: Math.
      Math.max(top, VIEWPORT_MARGIN),
      // Обрабатываем конструкцию: Math.
      Math.max(
        // Обрабатываем конструкцию: VIEWPORT_MARGIN.
        VIEWPORT_MARGIN,
        // Обрабатываем конструкцию: viewportHeight.
        viewportHeight - tooltip.height - VIEWPORT_MARGIN
        // Закрываем выражение или список аргументов.
      )
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: { top, left, side: resolved }.
  return { top, left, side: resolved };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Подсказка, которая появляется при наведении или фокусе.
 * Подсказка, которая появляется при наведении или фокусе.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Позиция считается один раз при открытии, но пересчитываетс…
 * Позиция считается один раз при открытии, но пересчитывается при прокрутке и
 // Сохраняем пояснение разработчика: * изменении размера окна: иначе подсказка оставалась висеть …
 * изменении размера окна: иначе подсказка оставалась висеть на старом месте,
 // Сохраняем пояснение разработчика: * когда список под ней прокручивали. Тултип не перехватывает…
 * когда список под ней прокручивали. Тултип не перехватывает курсор и
 // Сохраняем пояснение разработчика: * закрывается по Escape.
 * закрывается по Escape.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function Tooltip({
  // Обрабатываем конструкцию: content.
  content,
  // Обрабатываем конструкцию: side.
  side = "top",
  // Обрабатываем конструкцию: delay.
  delay = 400,
  // Обрабатываем конструкцию: className.
  className,
  // Обрабатываем конструкцию: clampToViewport.
  clampToViewport = true,
  // Обрабатываем конструкцию: wrapperClassName.
  wrapperClassName,
  // Обрабатываем конструкцию: children.
  children,
  // Закрываем текущий блок.
}: TooltipProps) {
  // Обрабатываем конструкцию: const [open, setOpen] = useState(false).
  const [open, setOpen] = useState(false);
  // Обрабатываем конструкцию: const [position, setPosition] = useState<TooltipPositio….
  const [position, setPosition] = useState<TooltipPosition>({
    // Обрабатываем конструкцию: top.
    top: 0,
    // Обрабатываем конструкцию: left.
    left: 0,
    // Передаём поле side в объект.
    side,
    // Закрываем текущий блок.
  });
  // Обрабатываем конструкцию: const targetRef = useRef<HTMLSpanElement>(null).
  const targetRef = useRef<HTMLSpanElement>(null);
  // Обрабатываем конструкцию: const tooltipRef = useRef<HTMLDivElement>(null).
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Обрабатываем конструкцию: const timerRef = useRef<number | undefined>(undefined).
  const timerRef = useRef<number | undefined>(undefined);
  // Обрабатываем конструкцию: const tooltipId = useId().
  const tooltipId = useId();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const clearTimer = useCallback(() => { if (timerRef.cur….
  const clearTimer = useCallback(() => {
    // Проверяем бизнес-условие: timerRef.current !== undefined.
    if (timerRef.current !== undefined) {
      // Обрабатываем конструкцию: window.
      window.clearTimeout(timerRef.current);
      // Обрабатываем конструкцию: timerRef.
      timerRef.current = undefined;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleEnter = useCallback(() => { clearTimer(); t….
  const handleEnter = useCallback(() => {
    // Обрабатываем конструкцию: clearTimer.
    clearTimer();
    // Обрабатываем конструкцию: timerRef.
    timerRef.current = window.setTimeout(() => {
      // Обрабатываем конструкцию: setOpen.
      setOpen(true);
      // Закрываем текущий блок.
    }, delay);
    // Закрываем текущий блок.
  }, [clearTimer, delay]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleLeave = useCallback(() => { clearTimer(); s….
  const handleLeave = useCallback(() => {
    // Обрабатываем конструкцию: clearTimer.
    clearTimer();
    // Обрабатываем конструкцию: setOpen.
    setOpen(false);
    // Закрываем текущий блок.
  }, [clearTimer]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => clearTimer, [clearTimer]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const updatePosition = useCallback(() => { const target….
  const updatePosition = useCallback(() => {
    // Обрабатываем конструкцию: const target = targetRef.current?.firstElementChild ?? ….
    const target = targetRef.current?.firstElementChild ?? null;
    // Обрабатываем конструкцию: const tooltip = tooltipRef.current.
    const tooltip = tooltipRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: target === null || tooltip === null.
    if (target === null || tooltip === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setPosition.
    setPosition(
      // Обрабатываем конструкцию: computePosition.
      computePosition(
        // Обрабатываем конструкцию: target.
        target.getBoundingClientRect(),
        // Обрабатываем конструкцию: tooltip.
        tooltip.getBoundingClientRect(),
        // Обрабатываем конструкцию: side.
        side,
        // Обрабатываем конструкцию: window.
        window.innerWidth,
        // Обрабатываем конструкцию: window.
        window.innerHeight,
        // Обрабатываем конструкцию: clampToViewport.
        clampToViewport
        // Закрываем выражение или список аргументов.
      )
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }, [clampToViewport, side]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !open.
    if (!open) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: updatePosition.
    updatePosition();
    // Обрабатываем конструкцию: window.
    window.addEventListener("scroll", updatePosition, true);
    // Обрабатываем конструкцию: window.
    window.addEventListener("resize", updatePosition);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const onKeyDown = (event: KeyboardEvent) => { if (event….
    const onKeyDown = (event: KeyboardEvent) => {
      // Проверяем бизнес-условие: event.key === Escape.
      if (event.key === "Escape") {
        // Обрабатываем конструкцию: setOpen.
        setOpen(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document.addEventListener("keydown", onKeyDown);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.removeEventListener(scroll, updatePositi….
    return () => {
      // Обрабатываем конструкцию: window.
      window.removeEventListener("scroll", updatePosition, true);
      // Обрабатываем конструкцию: window.
      window.removeEventListener("resize", updatePosition);
      // Обрабатываем конструкцию: document.
      document.removeEventListener("keydown", onKeyDown);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [content, open, updatePosition]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const positionStyle: CSSProperties = { top: position.to….
  const positionStyle: CSSProperties = {
    // Обрабатываем конструкцию: top.
    top: position.top,
    // Обрабатываем конструкцию: left.
    left: position.left,
    // Сохраняем пояснение разработчика: // подсказка всегда рисуется поверх пост-обработки (виньетка…
    // подсказка всегда рисуется поверх пост-обработки (виньетка, зерно)
    // Обрабатываем конструкцию: zIndex.
    zIndex: TOOLTIP_Z_INDEX,
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> <span ref={targetRef} onMouseEnter={handleEnter} o….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: ref.
        ref={targetRef}
        // Обрабатываем конструкцию: onMouseEnter.
        onMouseEnter={handleEnter}
        // Обрабатываем конструкцию: onMouseLeave.
        onMouseLeave={handleLeave}
        // Обрабатываем конструкцию: onFocus.
        onFocus={handleEnter}
        // Обрабатываем конструкцию: onBlur.
        onBlur={handleLeave}
        // Обрабатываем конструкцию: className.
        className={cn("inline-flex", wrapperClassName)}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {cloneElement(children, {
          // Обрабатываем конструкцию: aria-describedby.
          "aria-describedby": open ? tooltipId : undefined,
          // Закрываем текущий блок.
        })}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {createPortal(
        // Обрабатываем конструкцию: open.
        open ? (
          // Обрабатываем конструкцию: <div ref={tooltipRef} id={tooltipId} role=tooltip style….
          <div
            // Обрабатываем конструкцию: ref.
            ref={tooltipRef}
            // Обрабатываем конструкцию: id.
            id={tooltipId}
            // Обрабатываем конструкцию: role.
            role="tooltip"
            // Обрабатываем конструкцию: style.
            style={positionStyle}
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: pointer-events-none fixed max-w-xs rounded-lg.
              "pointer-events-none fixed max-w-xs rounded-lg",
              // Обрабатываем конструкцию: bg-bg-secondary border-glass-border border px-2.5 py-1.….
              "bg-bg-secondary border-glass-border border px-2.5 py-1.5",
              // Обрабатываем конструкцию: text-text-primary text-xs leading-relaxed shadow-[0_8px….
              "text-text-primary text-xs leading-relaxed shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
              // Обрабатываем конструкцию: className.
              className
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {content}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null,
        // Обрабатываем конструкцию: document.
        document.body
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
