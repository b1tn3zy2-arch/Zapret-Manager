import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  ariaLabel: string;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
  className?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, min, max, step, ariaLabel, formatValue, onChange, className },
  ref
) {
  const range = max - min;
  const percent = range === 0 ? 0 : ((value - min) / range) * 100;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-text-secondary text-xs tabular-nums">
          {formatValue === undefined ? String(value) : formatValue(value)}
        </span>
      </div>

      <div className="relative flex h-5 items-center">
        <span
          aria-hidden="true"
          className="bg-glass-border absolute inset-x-0 h-1 rounded-full"
        />
        <span
          aria-hidden="true"
          className="bg-accent-primary absolute h-1 rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${percent}%` }}
        />

        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={ariaLabel}
          onChange={(event) => {
            onChange(Number(event.target.value));
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
