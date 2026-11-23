// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { ControlSize } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ToggleProps {
  // Обрабатываем конструкцию: checked.
  checked: boolean;
  // Обрабатываем конструкцию: onChange.
  onChange: (checked: boolean) => void;
  // Обрабатываем конструкцию: size.
  size?: ControlSize;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Обрабатываем конструкцию: label.
  label?: string;
  // Обрабатываем конструкцию: ariaLabel.
  ariaLabel?: string;
  // Обрабатываем конструкцию: description.
  description?: string;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TRACK_CLASSES = { sm: { track: h-[18px] w-8, pad:….
const TRACK_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: { track: "h-[18px] w-8", pad: "p-0.5", thumb: "size-3.5" },
  // Обрабатываем конструкцию: md.
  md: { track: "h-[22px] w-10", pad: "p-0.5", thumb: "size-[18px]" },
  // Обрабатываем конструкцию: lg.
  lg: { track: "h-[26px] w-12", pad: "p-1", thumb: "size-5" },
  // Закрываем текущий блок.
} as const satisfies Record<
  // Обрабатываем конструкцию: ControlSize.
  ControlSize,
  // Обрабатываем конструкцию: { track: string; pad: string; thumb: string }.
  { track: string; pad: string; thumb: string }
  // Продолжаем выражение.
>;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Переключатель.
 * Переключатель.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Ход ползунка считается по фактическим размерам дорожки и
 * Ход ползунка считается по фактическим размерам дорожки и
 // Сохраняем пояснение разработчика: * ползунка, а не в процентах: при изменении масштаба интерфе…
 * ползунка, а не в процентах: при изменении масштаба интерфейса
 // Сохраняем пояснение разработчика: * проценты от какой-то величины дают разный ход, и ползунок
 * проценты от какой-то величины дают разный ход, и ползунок
 // Сохраняем пояснение разработчика: * застревает, не доезжая до края.
 * застревает, не доезжая до края.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function Toggle({
  // Обрабатываем конструкцию: checked.
  checked,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: size.
  size = "md",
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: ariaLabel.
  ariaLabel,
  // Обрабатываем конструкцию: description.
  description,
  // Обрабатываем конструкцию: className.
  className,
  // Закрываем текущий блок.
}: ToggleProps) {
  // Обрабатываем конструкцию: const metrics = TRACK_CLASSES[size].
  const metrics = TRACK_CLASSES[size];
  // Обрабатываем конструкцию: const trackRef = useRef<HTMLButtonElement>(null).
  const trackRef = useRef<HTMLButtonElement>(null);
  // Обрабатываем конструкцию: const thumbRef = useRef<HTMLSpanElement>(null).
  const thumbRef = useRef<HTMLSpanElement>(null);
  // Обрабатываем конструкцию: const [travel, setTravel] = useState(0).
  const [travel, setTravel] = useState(0);
  // Сохраняем пояснение разработчика: // Ползунок встаёт на верное место с первого кадра: пока зам…
  // Ползунок встаёт на верное место с первого кадра: пока замер не сделан,
  // Сохраняем пояснение разработчика: // позиция «включено» держится авто-отступом во flex-дорожке…
  // позиция «включено» держится авто-отступом во flex-дорожке, а не
  // Сохраняем пояснение разработчика: // framer-анимацией, которая стартует с нуля и дёргается.
  // framer-анимацией, которая стартует с нуля и дёргается.
  // Обрабатываем конструкцию: const [ready, setReady] = useState(false).
  const [ready, setReady] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const measure = useCallback((): void => { const track =….
  const measure = useCallback((): void => {
    // Обрабатываем конструкцию: const track = trackRef.current.
    const track = trackRef.current;
    // Обрабатываем конструкцию: const thumb = thumbRef.current.
    const thumb = thumbRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: track === null || thumb === null.
    if (track === null || thumb === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const styles = window.getComputedStyle(track).
    const styles = window.getComputedStyle(track);
    // Обрабатываем конструкцию: const padding = Number.parseFloat(styles.paddingLeft) +….
    const padding =
      // Обрабатываем конструкцию: Number.
      Number.parseFloat(styles.paddingLeft) +
      // Обрабатываем конструкцию: Number.
      Number.parseFloat(styles.paddingRight);
    // Обрабатываем конструкцию: const distance = track.getBoundingClientRect().width - ….
    const distance =
      // Обрабатываем конструкцию: track.
      track.getBoundingClientRect().width -
      // Обрабатываем конструкцию: thumb.
      thumb.getBoundingClientRect().width -
      // Обрабатываем конструкцию: padding.
      padding;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: Number.isFinite(distance) && distance > 0.
    if (Number.isFinite(distance) && distance > 0) {
      // Обрабатываем конструкцию: setTravel.
      setTravel(distance);
      // Обрабатываем конструкцию: setReady.
      setReady(true);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: measure.
    measure();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const track = trackRef.current.
    const track = trackRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: track === null.
    if (track === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Пересчёт при изменении размера окна и масштаба интерфейса…
    // Пересчёт при изменении размера окна и масштаба интерфейса:
    // Сохраняем пояснение разработчика: // иначе ползунок остаётся на прежнем месте.
    // иначе ползунок остаётся на прежнем месте.
    // Обрабатываем конструкцию: const observer = new ResizeObserver(measure).
    const observer = new ResizeObserver(measure);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: observer.
    observer.observe(track);
    // Обрабатываем конструкцию: window.
    window.addEventListener("resize", measure);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { observer.disconnect(); window.removeEventListen….
    return () => {
      // Обрабатываем конструкцию: observer.
      observer.disconnect();
      // Обрабатываем конструкцию: window.
      window.removeEventListener("resize", measure);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [measure, size]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const control = ( <button ref={trackRef} type=button ro….
  const control = (
    // Обрабатываем конструкцию: <button ref={trackRef} type=button role=switch aria-che….
    <button
      // Обрабатываем конструкцию: ref.
      ref={trackRef}
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: role.
      role="switch"
      // Обрабатываем конструкцию: aria-checked.
      aria-checked={checked}
      // Обрабатываем конструкцию: aria-label.
      aria-label={ariaLabel ?? label}
      // Обрабатываем конструкцию: disabled.
      disabled={disabled}
      // Обрабатываем конструкцию: onClick.
      onClick={() => {
        // Обрабатываем конструкцию: onChange.
        onChange(!checked);
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: relative inline-flex shrink-0 items-center rounded-full.
        "relative inline-flex shrink-0 items-center rounded-full",
        // Обрабатываем конструкцию: transition-colors duration-200 ease-out.
        "transition-colors duration-200 ease-out",
        // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-50.
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Обрабатываем конструкцию: metrics.
        metrics.track,
        // Обрабатываем конструкцию: metrics.
        metrics.pad,
        // Обрабатываем конструкцию: checked.
        checked ? "bg-accent-success" : "bg-glass-hover",
        // Обрабатываем конструкцию: className.
        className
        // Закрываем выражение или список аргументов.
      )}
      // Обрабатываем конструкцию: data-ready.
      data-ready={ready || undefined}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {ready ? (
        // Рендерим самозакрывающийся элемент motion.span.
        <motion.span
          // Обрабатываем конструкцию: ref.
          ref={thumbRef}
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: initial.
          initial={false}
          // Обрабатываем конструкцию: animate.
          animate={{ x: checked ? travel : 0 }}
          // Обрабатываем конструкцию: transition.
          transition={{ duration: 0.2, ease: "easeOut" }}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: ring-glass-border block rounded-full bg-white shadow-sm….
            "ring-glass-border block rounded-full bg-white shadow-sm ring-1",
            // Обрабатываем конструкцию: metrics.
            metrics.thumb
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Рендерим самозакрывающийся элемент span.
        <span
          // Обрабатываем конструкцию: ref.
          ref={thumbRef}
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: ring-glass-border block rounded-full bg-white shadow-sm….
            "ring-glass-border block rounded-full bg-white shadow-sm ring-1",
            // Обрабатываем конструкцию: metrics.
            metrics.thumb,
            // Обрабатываем конструкцию: checked.
            checked && "ml-auto"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </button>
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: label === undefined && description === undefined.
  if (label === undefined && description === undefined) {
    // Возвращаем результат: control.
    return control;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex items-start justify-between gap-4….
  return (
    // Обрабатываем конструкцию: <div className=flex items-start justify-between gap-4>.
    <div className="flex items-start justify-between gap-4">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-0.5">
        {/* Выводим текстовое содержимое в JSX. */}
        {label !== undefined ? (
          // Обрабатываем конструкцию: <span className=text-text-primary text-sm font-medium>.
          <span className="text-text-primary text-sm font-medium">{label}</span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
        {description !== undefined ? (
          // Обрабатываем конструкцию: <span className=text-text-secondary text-xs>.
          <span className="text-text-secondary text-xs">{description}</span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
      {control}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
