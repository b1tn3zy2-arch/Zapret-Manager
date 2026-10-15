import { forwardRef, useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
  formatValue?: (value: number) => string;
  /**
   * Значение во время перетаскивания. Если передан — слайдер не пишет в стейт
   * на каждом кадре, а держит превью локально и коммитит по отпусканию.
   * Именно из-за записи в стор на каждый кадр перетаскивание дёргалось:
   * 100+ ререндеров и 100+ пересчётов стилей за одно движение мыши.
   */
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  className?: string;
}

/**
 * Ползунок на нативном input[type=range].
 *
 * Нативный input оставлен сознательно: он даёт клавиатуру, экранные читалки и
 * правильное поведение по шагу. Вся отрисовка — на compositor-свойствах:
 * заливка едет через scaleX с transform-origin слева, поэтому не вызывает
 * layout, и никакого CSS-перехода на width, который раньше рассинхронизировал
 * thumb с заливкой и давал дёрганье.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    min,
    max,
    step,
    ariaLabel,
    formatValue,
    onChange,
    onCommit,
    className,
  },
  ref
) {
  const range = max - min;
  // Во время перетаскивания показываем локальное значение, иначе input
  // возвращался к старому значению из стора и thumb дёргался назад
  const [dragging, setDragging] = useState<number | null>(null);
  const commitRef = useRef(onCommit);

  commitRef.current = onCommit;

  const shown = dragging ?? value;
  const percent = range === 0 ? 0 : (shown - min) / range;

  const finish = useCallback(() => {
    setDragging((current) => {
      if (current !== null) {
        commitRef.current?.(current);
      }

      return null;
    });
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-text-secondary text-xs tabular-nums">
          {formatValue === undefined ? String(shown) : formatValue(shown)}
        </span>
      </div>

      <div className="relative flex h-5 items-center">
        <span
          aria-hidden="true"
          className="bg-glass-border absolute inset-x-0 h-1 rounded-full"
        />
        <span
          aria-hidden="true"
          className="bg-accent-primary absolute inset-x-0 h-1 origin-left rounded-full will-change-transform"
          style={{ transform: `scaleX(${percent.toFixed(4)})` }}
        />

        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={shown}
          aria-label={ariaLabel}
          onPointerDown={() => {
            setDragging(value);
          }}
          onPointerUp={finish}
          onPointerCancel={finish}
          onKeyUp={finish}
          onBlur={finish}
          onChange={(event) => {
            const next = Number(event.target.value);

            setDragging(next);
            onChange(next);
          }}
          className={cn(
            "relative w-full cursor-pointer appearance-none bg-transparent",
            "focus-visible:ring-accent-primary/60 h-5 rounded-full focus-visible:ring-2 focus-visible:outline-none",
            "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:border-bg-primary [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform",
            "hover:[&::-webkit-slider-thumb]:scale-110",
            "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:border-bg-primary [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:bg-accent-primary",
            "[&::-moz-range-track]:bg-transparent"
          )}
        />
      </div>
    </div>
  );
});
