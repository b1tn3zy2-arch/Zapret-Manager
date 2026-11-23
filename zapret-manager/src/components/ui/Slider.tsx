// Импортируем зависимости из модуля react.
import { forwardRef, useCallback, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SliderProps {
  // Обрабатываем конструкцию: value.
  value: number;
  // Обрабатываем конструкцию: min.
  min: number;
  // Обрабатываем конструкцию: max.
  max: number;
  // Обрабатываем конструкцию: step.
  step: number;
  // Обрабатываем конструкцию: ariaLabel.
  ariaLabel: string;
  // Обрабатываем конструкцию: formatValue.
  formatValue?: (value: number) => string;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Значение во время перетаскивания. Если передан — слайдер н…
   * Значение во время перетаскивания. Если передан — слайдер не пишет в стейт
   // Сохраняем пояснение разработчика: * на каждом кадре, а держит превью локально и коммитит по от…
   * на каждом кадре, а держит превью локально и коммитит по отпусканию.
   // Сохраняем пояснение разработчика: * Именно из-за записи в стор на каждый кадр перетаскивание д…
   * Именно из-за записи в стор на каждый кадр перетаскивание дёргалось:
   // Сохраняем пояснение разработчика: * 100+ ререндеров и 100+ пересчётов стилей за одно движение …
   * 100+ ререндеров и 100+ пересчётов стилей за одно движение мыши.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: onChange.
  onChange: (value: number) => void;
  // Обрабатываем конструкцию: onCommit.
  onCommit?: (value: number) => void;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Зарезервировать место под плашку-вывод: сверху добавляется…
   * Зарезервировать место под плашку-вывод: сверху добавляется отступ,
   // Сохраняем пояснение разработчика: * и плашка ложится в него, а не наезжает на заголовок над сл…
   * и плашка ложится в него, а не наезжает на заголовок над слайдером.
   // Сохраняем пояснение разработчика: * Включается у слайдеров, над которыми есть текст (модалка о…
   * Включается у слайдеров, над которыми есть текст (модалка оплаты);
   // Сохраняем пояснение разработчика: * слайдеры в плотных строках настроек оставляют прежнюю геом…
   * слайдеры в плотных строках настроек оставляют прежнюю геометрию.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: headroom.
  headroom?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: /// Диаметр ползунка в rem; sync с классом thumb-а ниже.
/// Диаметр ползунка в rem; sync с классом thumb-а ниже.
// Обрабатываем конструкцию: const THUMB_REM = 1.25.
const THUMB_REM = 1.25;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Ползунок на нативном input[type=range]: круговой палец на …
 * Ползунок на нативном input[type=range]: круговой палец на линии заливки и
 // Сохраняем пояснение разработчика: * плавающая плашка со значением, которая появляется при наве…
 * плавающая плашка со значением, которая появляется при наведении или
 // Сохраняем пояснение разработчика: * перетаскивании (как в «Range slider output»).
 * перетаскивании (как в «Range slider output»).
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Нативный input оставлен сознательно: он даёт клавиатуру, э…
 * Нативный input оставлен сознательно: он даёт клавиатуру, экранные читалки и
 // Сохраняем пояснение разработчика: * правильное поведение по шагу. Ширина заливки и позиция пла…
 * правильное поведение по шагу. Ширина заливки и позиция плашки адресуют один
 // Сохраняем пояснение разработчика: * или два absolutely-positioned узла, layout стору не нужен.
 * или два absolutely-positioned узла, layout стору не нужен.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  // Объявляем параметр { value, min, max, step, ariaLabel, form… функции.
  {
    // Обрабатываем конструкцию: value.
    value,
    // Обрабатываем конструкцию: min.
    min,
    // Обрабатываем конструкцию: max.
    max,
    // Обрабатываем конструкцию: step.
    step,
    // Обрабатываем конструкцию: ariaLabel.
    ariaLabel,
    // Обрабатываем конструкцию: formatValue.
    formatValue,
    // Обрабатываем конструкцию: onChange.
    onChange,
    // Обрабатываем конструкцию: onCommit.
    onCommit,
    // Обрабатываем конструкцию: className.
    className,
    // Обрабатываем конструкцию: headroom.
    headroom = false,
    // Закрываем текущий блок.
  },
  // Объявляем параметр ref функции.
  ref
  // Закрываем выражение или список аргументов.
) {
  // Обрабатываем конструкцию: const range = max - min.
  const range = max - min;
  // Сохраняем пояснение разработчика: // Во время перетаскивания показываем локальное значение, ин…
  // Во время перетаскивания показываем локальное значение, иначе input
  // Сохраняем пояснение разработчика: // возвращался к старому значению из стора и thumb дёргался …
  // возвращался к старому значению из стора и thumb дёргался назад
  // Обрабатываем конструкцию: const [dragging, setDragging] = useState<number | null>….
  const [dragging, setDragging] = useState<number | null>(null);
  // Обрабатываем конструкцию: const [hovered, setHovered] = useState(false).
  const [hovered, setHovered] = useState(false);
  // Обрабатываем конструкцию: const [focused, setFocused] = useState(false).
  const [focused, setFocused] = useState(false);
  // Обрабатываем конструкцию: const [pressed, setPressed] = useState(false).
  const [pressed, setPressed] = useState(false);
  // Обрабатываем конструкцию: const commitRef = useRef(onCommit).
  const commitRef = useRef(onCommit);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: commitRef.
  commitRef.current = onCommit;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const shown = dragging ?? value.
  const shown = dragging ?? value;
  // Обрабатываем конструкцию: const percent = range === 0 ? 0 : (shown - min) / range.
  const percent = range === 0 ? 0 : (shown - min) / range;
  // Обрабатываем конструкцию: const label = formatValue === undefined ? String(shown)….
  const label = formatValue === undefined ? String(shown) : formatValue(shown);
  // Сохраняем пояснение разработчика: // Позиция плашки и длина заливки описываются одной точкой —…
  // Позиция плашки и длина заливки описываются одной точкой — центром
  // Сохраняем пояснение разработчика: // пальца в пространстве трека: палец отстоит от края на пол…
  // пальца в пространстве трека: палец отстоит от края на половину своей
  // Сохраняем пояснение разработчика: // ширины, поэтому эта точка — percent остатка трека плюс по…
  // ширины, поэтому эта точка — percent остатка трека плюс половина ширины.
  // Обрабатываем конструкцию: const thumbCenter = calc(${(percent * 100).toFixed(3)}%….
  const thumbCenter = `calc(${(percent * 100).toFixed(3)}% - ${(
    percent * THUMB_REM
  ).toFixed(3)}rem + 0.625rem)`;
  // Сохраняем пояснение разработчика: // Плашка нужна только в момент разговора со слайдером, не п…
  // Плашка нужна только в момент разговора со слайдером, не постоянно.
  // Обрабатываем конструкцию: const showLabel = pressed || dragging !== null || hover….
  const showLabel = pressed || dragging !== null || hovered || focused;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const finish = useCallback(() => { setDragging((current….
  const finish = useCallback(() => {
    // Обрабатываем конструкцию: setDragging.
    setDragging((current) => {
      // Проверяем бизнес-условие: current !== null.
      if (current !== null) {
        // Обрабатываем конструкцию: commitRef.
        commitRef.current?.(current);
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className={cn(relative, headroom && pt-10, class….
  return (
    // Обрабатываем конструкцию: <div className={cn(relative, headroom && pt-10, classNa….
    <div
      // Обрабатываем конструкцию: className.
      className={cn("relative", headroom && "pt-10", className)}
      // Обрабатываем конструкцию: onPointerEnter.
      onPointerEnter={() => {
        // Обрабатываем конструкцию: setHovered.
        setHovered(true);
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: onPointerLeave.
      onPointerLeave={() => {
        // Обрабатываем конструкцию: setHovered.
        setHovered(false);
        // Закрываем текущий блок.
      }}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {/*
          // Продолжаем выражение.
          Плашка-вывод над ползунком. Позиция считается в пространстве трека:
          // Продолжаем выражение.
          центр пальца — percent на остаток трека плюс половина ширины пальца.
          // Продолжаем выражение.
          left ограничен clamp-ом, чтобы подпись не вылезала за карточку
          // Продолжаем выражение.
          на крайних значениях. Появляется при наведении и держится
          // Продолжаем выражение.
          при перетаскивании и фокусе с клавиатуры. С headroom плашка
          // Продолжаем выражение.
          лежит в зарезервированном отступе (top 0.25rem), без него —
          // Продолжаем выражение.
          над слайдером, как раньше.
        // Сохраняем пояснение разработчика: * /}
        */}
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: bg-bg-primary/95 border-glass-border text-text-primary ….
          "bg-bg-primary/95 border-glass-border text-text-primary pointer-events-none absolute z-10 translate-x-[-50%] rounded-lg border px-2.5 py-1 text-xs leading-4 font-medium whitespace-nowrap shadow-xl shadow-black/40 backdrop-blur-sm",
          // Обрабатываем конструкцию: transition-opacity duration-200 ease-out.
          "transition-opacity duration-200 ease-out",
          // Обрабатываем конструкцию: showLabel.
          showLabel ? "opacity-100" : "opacity-0"
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: style.
        style={{
          // Обрабатываем конструкцию: left.
          left: `clamp(0.75rem, ${thumbCenter}, calc(100% - 0.75rem))`,
          // Обрабатываем конструкцию: top.
          top: headroom ? "0.25rem" : `-${THUMB_REM * 1.9}rem`,
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-accent-primary">{label}</span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="bg-bg-primary border-glass-border absolute top-full left-1/2 size-1.5 -translate-x-1/2 -translate-y-[3px] rotate-45 border-r border-b"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="relative flex h-6 items-center">
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="absolute inset-x-0 h-1 rounded-full bg-white/15"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        {/* Заливка тянется от начала трека до центра ползунка и вся сплошная
            // Продолжаем выражение.
            зелёная: транслюцентный градиент и отступы по краям читались
            // Продолжаем выражение.
            как тёмные «пропуски» в линии. Палец точно накрывает конец
            // Продолжаем выражение.
            заливки, потому что оба считаются от центра пальца. */}
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="bg-accent-primary absolute top-0 bottom-0 my-auto h-1 rounded-full will-change-[width]"
          // Обрабатываем конструкцию: style.
          style={{ left: 0, width: thumbCenter }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <input
          // Обрабатываем конструкцию: ref.
          ref={ref}
          // Обрабатываем конструкцию: type.
          type="range"
          // Обрабатываем конструкцию: min.
          min={min}
          // Обрабатываем конструкцию: max.
          max={max}
          // Обрабатываем конструкцию: step.
          step={step}
          // Обрабатываем конструкцию: value.
          value={shown}
          // Обрабатываем конструкцию: aria-label.
          aria-label={ariaLabel}
          // Обрабатываем конструкцию: onPointerDown.
          onPointerDown={() => {
            // Обрабатываем конструкцию: setPressed.
            setPressed(true);
            // Обрабатываем конструкцию: setDragging.
            setDragging(value);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onPointerUp.
          onPointerUp={() => {
            // Обрабатываем конструкцию: setPressed.
            setPressed(false);
            // Обрабатываем конструкцию: finish.
            finish();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onPointerCancel.
          onPointerCancel={() => {
            // Обрабатываем конструкцию: setPressed.
            setPressed(false);
            // Обрабатываем конструкцию: finish.
            finish();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onKeyUp.
          onKeyUp={finish}
          // Обрабатываем конструкцию: onBlur.
          onBlur={() => {
            // Обрабатываем конструкцию: setFocused.
            setFocused(false);
            // Обрабатываем конструкцию: finish.
            finish();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onFocus.
          onFocus={() => {
            // Обрабатываем конструкцию: setFocused.
            setFocused(true);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: const next = Number(event.target.value).
            const next = Number(event.target.value);
            // — разделитель логических блоков —

            // Обрабатываем конструкцию: setDragging.
            setDragging(next);
            // Обрабатываем конструкцию: onChange.
            onChange(next);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: relative w-full cursor-pointer appearance-none bg-trans….
            "relative w-full cursor-pointer appearance-none bg-transparent",
            // Обрабатываем конструкцию: h-6 rounded-full focus-visible:outline-none.
            "h-6 rounded-full focus-visible:outline-none",
            // Сохраняем пояснение разработчика: // Трек на всю высоту: палец центрируется в нём — иначе он
            // Трек на всю высоту: палец центрируется в нём — иначе он
            // Сохраняем пояснение разработчика: // садился на нулевую высоту трека и уходил вниз от линии.
            // садился на нулевую высоту трека и уходил вниз от линии.
            // Обрабатываем конструкцию: [&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slid….
            "[&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent",
            // Сохраняем пояснение разработчика: // WebKit кладёт палец на верх трека; трек выше пальца на 4p…
            // WebKit кладёт палец на верх трека; трек выше пальца на 4px,
            // Сохраняем пояснение разработчика: // поэтому спускаем палец на половину этой разницы — теперь …
            // поэтому спускаем палец на половину этой разницы — теперь он
            // Сохраняем пояснение разработчика: // сидит ровно на зелёной линии, а не ниже или выше неё.
            // сидит ровно на зелёной линии, а не ниже или выше неё.
            // Обрабатываем конструкцию: [&::-webkit-slider-thumb]:mt-0.5 [&::-webkit-slider-thu….
            "[&::-webkit-slider-thumb]:mt-0.5 [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none",
            // Обрабатываем конструкцию: [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit….
            "[&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:rounded-full",
            // Обрабатываем конструкцию: [&::-webkit-slider-thumb]:border-accent-primary [&::-we….
            "[&::-webkit-slider-thumb]:border-accent-primary [&::-webkit-slider-thumb]:border-2",
            // Обрабатываем конструкцию: [&::-webkit-slider-thumb]:shadow-accent-primary/50 [&::….
            "[&::-webkit-slider-thumb]:shadow-accent-primary/50 [&::-webkit-slider-thumb]:shadow-md",
            // Обрабатываем конструкцию: [&::-webkit-slider-thumb]:transition-shadow [&::-webkit….
            "[&::-webkit-slider-thumb]:transition-shadow [&::-webkit-slider-thumb]:duration-200",
            // Обрабатываем конструкцию: [&::-webkit-slider-thumb]:ease-out.
            "[&::-webkit-slider-thumb]:ease-out",
            // Обрабатываем конструкцию: hover:[&::-webkit-slider-thumb]:shadow-accent-primary/7….
            "hover:[&::-webkit-slider-thumb]:shadow-accent-primary/70 hover:[&::-webkit-slider-thumb]:shadow-lg",
            // Обрабатываем конструкцию: [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:roun….
            "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full",
            // Обрабатываем конструкцию: [&::-moz-range-thumb]:border-accent-primary [&::-moz-ra….
            "[&::-moz-range-thumb]:border-accent-primary [&::-moz-range-thumb]:border-2",
            // Обрабатываем конструкцию: [&::-moz-range-thumb]:bg-accent-primary.
            "[&::-moz-range-thumb]:bg-accent-primary",
            // Обрабатываем конструкцию: [&::-moz-range-thumb]:shadow-md.
            "[&::-moz-range-thumb]:shadow-md",
            // Обрабатываем конструкцию: [&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-tran….
            "[&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
