// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useId, useRef, useState } from "react";
// Импортируем зависимости из модуля react-dom.
import { createPortal } from "react-dom";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Check, ChevronDown } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DropdownOption<T extends string> {
  // Обрабатываем конструкцию: value.
  value: T;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DropdownProps<T extends string> {
  // Обрабатываем конструкцию: value.
  value: T;
  // Обрабатываем конструкцию: options.
  options: readonly DropdownOption<T>[];
  // Обрабатываем конструкцию: onChange.
  onChange: (value: T) => void;
  // Обрабатываем конструкцию: label.
  label?: string;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Обрабатываем конструкцию: align.
  align?: "left" | "right";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Выпадающий список с порталом.
 * Выпадающий список с порталом.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Список переносится в document.body и позиционируется фикси…
 * Список переносится в `document.body` и позиционируется фиксированно по
 // Сохраняем пояснение разработчика: * координатам кнопки: обычный absolute внутри страницы обрез…
 * координатам кнопки: обычный `absolute` внутри страницы обрезается
 // Сохраняем пояснение разработчика: * прокручиваемыми контейнерами и панелями с overflow-hidden,…
 * прокручиваемыми контейнерами и панелями с `overflow-hidden`, из-за чего
 // Сохраняем пояснение разработчика: * пункты могли «отрезаться» посреди слова. Портал не зависит…
 * пункты могли «отрезаться» посреди слова. Портал не зависит от вложенности,
 // Сохраняем пояснение разработчика: * поэтому вариант открывается целиком и поверх всех панелей.
 * поэтому вариант открывается целиком и поверх всех панелей.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию Dropdown.
function Dropdown<T extends string>({
  // Обрабатываем конструкцию: value.
  value,
  // Обрабатываем конструкцию: options.
  options,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Обрабатываем конструкцию: align.
  align = "left",
  // Закрываем текущий блок.
}: DropdownProps<T>) {
  // Обрабатываем конструкцию: const [open, setOpen] = useState(false).
  const [open, setOpen] = useState(false);
  // Обрабатываем конструкцию: const [activeIndex, setActiveIndex] = useState(0).
  const [activeIndex, setActiveIndex] = useState(0);
  // Обрабатываем конструкцию: const [rect, setRect] = useState<DOMRect | null>(null).
  const [rect, setRect] = useState<DOMRect | null>(null);
  // Обрабатываем конструкцию: const [placement, setPlacement] = useState<down | up>(d….
  const [placement, setPlacement] = useState<"down" | "up">("down");
  // Обрабатываем конструкцию: const triggerRef = useRef<HTMLButtonElement>(null).
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Обрабатываем конструкцию: const rootRef = useRef<HTMLDivElement>(null).
  const rootRef = useRef<HTMLDivElement>(null);
  // Обрабатываем конструкцию: const listRef = useRef<HTMLUListElement>(null).
  const listRef = useRef<HTMLUListElement>(null);
  // Обрабатываем конструкцию: const listId = useId().
  const listId = useId();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const selected = options.find((option) => option.value ….
  const selected =
    // Обрабатываем конструкцию: options.
    options.find((option) => option.value === value) ?? options[0];
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const close = useCallback(() => { setOpen(false); }, []….
  const close = useCallback(() => {
    // Обрабатываем конструкцию: setOpen.
    setOpen(false);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const toggle = (): void => { const trigger = triggerRef….
  const toggle = (): void => {
    // Обрабатываем конструкцию: const trigger = triggerRef.current.
    const trigger = triggerRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: trigger !== null.
    if (trigger !== null) {
      // Обрабатываем конструкцию: const bounds = trigger.getBoundingClientRect().
      const bounds = trigger.getBoundingClientRect();
      // Обрабатываем конструкцию: const estimated = Math.min(options.length * 36 + 12, 28….
      const estimated = Math.min(options.length * 36 + 12, 280);
      // Обрабатываем конструкцию: const spaceBelow = window.innerHeight - bounds.bottom.
      const spaceBelow = window.innerHeight - bounds.bottom;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setRect.
      setRect(bounds);
      // Обрабатываем конструкцию: setPlacement.
      setPlacement(
        // Обрабатываем конструкцию: spaceBelow.
        spaceBelow < estimated + 12 && bounds.top > spaceBelow ? "up" : "down"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setOpen.
    setOpen((current) => !current);
    // Закрываем текущий блок.
  };
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

    // Обрабатываем конструкцию: const handleResize = (): void => { close(); }.
    const handleResize = (): void => {
      // Обрабатываем конструкцию: close.
      close();
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Скролл страницы под открытым списком раньше «уводил» его …
    // Скролл страницы под открытым списком раньше «уводил» его от
    // Сохраняем пояснение разработчика: // триггера: каретка позиции фиксированная, а страница едет.…
    // триггера: каретка позиции фиксированная, а страница едет. Теперь
    // Сохраняем пояснение разработчика: // любой скролл вне самого списка закрывает его, как нативны…
    // любой скролл вне самого списка закрывает его, как нативный select.
    // Обрабатываем конструкцию: const handleScroll = (event: Event): void => { const ta….
    const handleScroll = (event: Event): void => {
      // Обрабатываем конструкцию: const target = event.target.
      const target = event.target;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: target instanceof Node && (rootRef.current?.contains(ta….
      if (
        // Обрабатываем конструкцию: target.
        target instanceof Node &&
        // Обрабатываем конструкцию: (rootRef.current?.contains(target) === true || listRef.….
        (rootRef.current?.contains(target) === true ||
          // Обрабатываем конструкцию: listRef.
          listRef.current?.contains(target) === true)
        // Закрываем выражение или список аргументов.
      ) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: close.
      close();
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: window.
    window.addEventListener("resize", handleResize);
    // Обрабатываем конструкцию: window.
    window.addEventListener("scroll", handleScroll, true);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.removeEventListener(resize, handleResize….
    return () => {
      // Обрабатываем конструкцию: window.
      window.removeEventListener("resize", handleResize);
      // Обрабатываем конструкцию: window.
      window.removeEventListener("scroll", handleScroll, true);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [close, open]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const choose = useCallback( (option: DropdownOption<T>)….
  const choose = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (option: DropdownOption<T>) => {
      // Проверяем бизнес-условие: option.disabled === true.
      if (option.disabled === true) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // Обрабатываем конструкцию: onChange.
      onChange(option.value);
      // Обрабатываем конструкцию: close.
      close();
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [close, onChange]
    // Закрываем выражение или список аргументов.
  );
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

    // Обрабатываем конструкцию: const handlePointer = (event: MouseEvent) => { const ta….
    const handlePointer = (event: MouseEvent) => {
      // Обрабатываем конструкцию: const target = event.target as Node.
      const target = event.target as Node;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !rootRef.current?.contains(target) && !( event.target i….
      if (
        // Изменяем значение выражения !rootRef.current?.contains(target).
        !rootRef.current?.contains(target) &&
        // Изменяем значение выражения !( event.target instanceof HTMLElement && eve….
        !(
          // Обрабатываем конструкцию: event.
          event.target instanceof HTMLElement &&
          // Обрабатываем конструкцию: event.
          event.target.closest(`[aria-controls="${listId}"]`) !== null
          // Закрываем выражение или список аргументов.
        )
        // Закрываем выражение или список аргументов.
      ) {
        // Обрабатываем конструкцию: close.
        close();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document.addEventListener("mousedown", handlePointer);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { document.removeEventListener(mousedown, handleP….
    return () => {
      // Обрабатываем конструкцию: document.
      document.removeEventListener("mousedown", handlePointer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [close, listId, open]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const move = (step: number): void => { const count = op….
  const move = (step: number): void => {
    // Обрабатываем конструкцию: const count = options.length.
    const count = options.length;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: count === 0.
    if (count === 0) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setActiveIndex.
    setActiveIndex((index) => (index + step + count) % count);
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleKeyDown = (event: React.KeyboardEvent<HTMLD….
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    // Проверяем бизнес-условие: event.key === Escape.
    if (event.key === "Escape") {
      // Обрабатываем конструкцию: close.
      close();
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: event.key === ArrowDown.
    if (event.key === "ArrowDown") {
      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // Обрабатываем конструкцию: setOpen.
      setOpen(true);
      // Обрабатываем конструкцию: move.
      move(1);
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: event.key === ArrowUp.
    if (event.key === "ArrowUp") {
      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // Обрабатываем конструкцию: setOpen.
      setOpen(true);
      // Обрабатываем конструкцию: move.
      move(-1);
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: event.key === Enter || event.key ===.
    if (event.key === "Enter" || event.key === " ") {
      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !open.
      if (!open) {
        // Обрабатываем конструкцию: setOpen.
        setOpen(true);
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const option = options[activeIndex].
      const option = options[activeIndex];
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: option !== undefined.
      if (option !== undefined) {
        // Обрабатываем конструкцию: choose.
        choose(option);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const list = ( <AnimatePresence> {open && rect !== null….
  const list = (
    // Обрабатываем конструкцию: <AnimatePresence>.
    <AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
      {open && rect !== null ? (
        // Обрабатываем конструкцию: <motion.ul ref={listRef} id={listId} role=listbox aria-….
        <motion.ul
          // Обрабатываем конструкцию: ref.
          ref={listRef}
          // Обрабатываем конструкцию: id.
          id={listId}
          // Обрабатываем конструкцию: role.
          role="listbox"
          // Обрабатываем конструкцию: aria-label.
          aria-label={label}
          // Обрабатываем конструкцию: initial.
          initial={{
            // Обрабатываем конструкцию: opacity.
            opacity: 0,
            // Обрабатываем конструкцию: scale.
            scale: 0.96,
            // Обрабатываем конструкцию: y.
            y: placement === "up" ? 6 : -6,
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1, scale: 1, y: 0 }}
          // Обрабатываем конструкцию: exit.
          exit={{
            // Обрабатываем конструкцию: opacity.
            opacity: 0,
            // Обрабатываем конструкцию: scale.
            scale: 0.98,
            // Обрабатываем конструкцию: y.
            y: placement === "up" ? 4 : -4,
            // Обрабатываем конструкцию: transition.
            transition: { duration: 0.12, ease: "easeOut" },
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: transition.
          transition={{
            // Обрабатываем конструкцию: type.
            type: "spring",
            // Обрабатываем конструкцию: stiffness.
            stiffness: 520,
            // Обрабатываем конструкцию: damping.
            damping: 34,
            // Обрабатываем конструкцию: mass.
            mass: 0.6,
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: transformOrigin.
            transformOrigin: placement === "up" ? "bottom" : "top",
            // Обрабатываем конструкцию: top.
            top: placement === "up" ? undefined : rect.bottom + 4,
            // Обрабатываем конструкцию: bottom.
            bottom:
              // Обрабатываем конструкцию: placement.
              placement === "up"
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  window.innerHeight - rect.top + 4
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  undefined,
            // Обрабатываем конструкцию: left.
            left: align === "right" ? undefined : rect.left,
            // Обрабатываем конструкцию: right.
            right:
              // Обрабатываем конструкцию: align.
              align === "right" ? window.innerWidth - rect.right : undefined,
            // Обрабатываем конструкцию: minWidth.
            minWidth: Math.max(rect.width, 180),
            // Обрабатываем конструкцию: maxHeight.
            maxHeight:
              // Обрабатываем конструкцию: placement.
              placement === "up"
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  Math.max(140, rect.top - 12)
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  Math.max(140, window.innerHeight - rect.bottom - 12),
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: scroll-thin fixed z-50 overflow-x-hidden overflow-y-aut….
            "scroll-thin fixed z-50 overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg",
            // Обрабатываем конструкцию: bg-bg-tertiary/95 border-glass-border border py-1 shado….
            "bg-bg-tertiary/95 border-glass-border border py-1 shadow-2xl backdrop-blur-xl"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {options.map((option, index) => (
            // Обрабатываем конструкцию: <li key={option.value}>.
            <li key={option.value}>
              {/* Выводим текстовое содержимое в JSX. */}
              <button
                // Обрабатываем конструкцию: type.
                type="button"
                // Обрабатываем конструкцию: role.
                role="option"
                // Обрабатываем конструкцию: aria-selected.
                aria-selected={option.value === value}
                // Обрабатываем конструкцию: disabled.
                disabled={option.disabled === true}
                // Обрабатываем конструкцию: onMouseEnter.
                onMouseEnter={() => {
                  // Обрабатываем конструкцию: setActiveIndex.
                  setActiveIndex(index);
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: choose.
                  choose(option);
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: className.
                className={cn(
                  // Обрабатываем конструкцию: flex w-full items-center justify-between gap-3 px-3 py-….
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm",
                  // Обрабатываем конструкцию: transition-colors duration-150 disabled:cursor-not-allo….
                  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
                  // Обрабатываем конструкцию: index.
                  index === activeIndex && !option.disabled
                    ? // Обрабатываем конструкцию: ?.
                      // Продолжаем предыдущую конструкцию.
                      "text-text-primary bg-glass-hover"
                    : // Обрабатываем конструкцию: :.
                      // Продолжаем предыдущую конструкцию.
                      "text-text-secondary"
                  // Закрываем выражение или список аргументов.
                )}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                <span>{option.label}</span>
                {/* Выводим текстовое содержимое в JSX. */}
                {option.value === value ? (
                  // Рендерим самозакрывающийся элемент Check.
                  <Check aria-hidden="true" className="size-3.5" />
                ) : // Закрываем выражение или список аргументов.
                // Продолжаем предыдущую конструкцию.
                null}
                {/* Выводим текстовое содержимое в JSX. */}
              </button>
              {/* Выводим текстовое содержимое в JSX. */}
            </li>
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.ul>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </AnimatePresence>
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div ref={rootRef} className=relative onKeyDown={hand….
  return (
    // Обрабатываем конструкцию: <div ref={rootRef} className=relative onKeyDown={handle….
    <div
      // Обрабатываем конструкцию: ref.
      ref={rootRef}
      // Обрабатываем конструкцию: className.
      className="relative"
      // Обрабатываем конструкцию: onKeyDown.
      onKeyDown={handleKeyDown}
      // Обрабатываем конструкцию: tabIndex.
      tabIndex={disabled ? -1 : 0}
      // Обрабатываем конструкцию: role.
      role="combobox"
      // Обрабатываем конструкцию: aria-label.
      aria-label={label}
      // Обрабатываем конструкцию: aria-expanded.
      aria-expanded={open}
      // Обрабатываем конструкцию: aria-haspopup.
      aria-haspopup="listbox"
      // Обрабатываем конструкцию: aria-controls.
      aria-controls={open ? listId : undefined}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <button
        // Обрабатываем конструкцию: ref.
        ref={triggerRef}
        // Обрабатываем конструкцию: type.
        type="button"
        // Обрабатываем конструкцию: disabled.
        disabled={disabled}
        // Сохраняем пояснение разработчика: // Имя кнопки — её текст (текущее значение, как у нативного
        // Имя кнопки — её текст (текущее значение, как у нативного
        // Сохраняем пояснение разработчика: // select): aria-label с названием поля перебивал бы значени…
        // select): aria-label с названием поля перебивал бы значение и
        // Сохраняем пояснение разработчика: // скрывал от скринридера, что именно выбрано.
        // скрывал от скринридера, что именно выбрано.
        // Обрабатываем конструкцию: aria-controls.
        aria-controls={open ? listId : undefined}
        // Обрабатываем конструкцию: onClick.
        onClick={toggle}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: inline-flex min-w-[180px] items-center justify-between ….
          "inline-flex min-w-[180px] items-center justify-between gap-2 rounded-lg",
          // Обрабатываем конструкцию: text-text-primary border-glass-border bg-glass-bg borde….
          "text-text-primary border-glass-border bg-glass-bg border px-3 py-2 text-sm",
          // Обрабатываем конструкцию: hover:bg-glass-hover transition-colors duration-200.
          "hover:bg-glass-hover transition-colors duration-200",
          // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-50.
          "disabled:cursor-not-allowed disabled:opacity-50"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="truncate">{selected?.label ?? ""}</span>
        {/* Выводим текстовое содержимое в JSX. */}
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
        {/* Выводим текстовое содержимое в JSX. */}
      </button>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {createPortal(list, document.body)}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default Dropdown;.
export default Dropdown;
// — разделитель логических блоков —
