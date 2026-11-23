// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type FilterChipVariant =
  // Обрабатываем конструкцию: info.
  "info" | "warn" | "error" | "success" | "debug" | "neutral";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface FilterChipProps {
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: count.
  count?: number;
  // Обрабатываем конструкцию: active.
  active: boolean;
  // Обрабатываем конструкцию: variant.
  variant?: FilterChipVariant;
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Обрабатываем конструкцию: onToggle.
  onToggle: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ACTIVE_CLASSES = { info: bg-accent-secondary/15 b….
const ACTIVE_CLASSES = {
  // Обрабатываем конструкцию: info.
  info: "bg-accent-secondary/15 border-accent-secondary/40 text-accent-secondary",
  // Обрабатываем конструкцию: warn.
  warn: "bg-accent-warning/15 border-accent-warning/40 text-accent-warning",
  // Обрабатываем конструкцию: error.
  error: "bg-accent-danger/15 border-accent-danger/40 text-accent-danger",
  // Обрабатываем конструкцию: success.
  success: "bg-accent-primary/15 border-accent-primary/40 text-accent-primary",
  // Обрабатываем конструкцию: debug.
  debug: "bg-glass-hover border-glass-border text-text-secondary",
  // Обрабатываем конструкцию: neutral.
  neutral: "bg-glass-hover border-glass-border text-text-primary",
  // Закрываем текущий блок.
} as const satisfies Record<FilterChipVariant, string>;
// — разделитель логических блоков —

// Объявляем функцию FilterChip.
function FilterChip({
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: count.
  count,
  // Обрабатываем конструкцию: active.
  active,
  // Обрабатываем конструкцию: variant.
  variant = "neutral",
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Обрабатываем конструкцию: onToggle.
  onToggle,
  // Закрываем текущий блок.
}: FilterChipProps) {
  // Возвращаем результат: ( <motion.button type=button aria-pressed={active} disa….
  return (
    // Обрабатываем конструкцию: <motion.button type=button aria-pressed={active} disabl….
    <motion.button
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: aria-pressed.
      aria-pressed={active}
      // Обрабатываем конструкцию: disabled.
      disabled={disabled}
      // Обрабатываем конструкцию: onClick.
      onClick={onToggle}
      // Обрабатываем конструкцию: whileTap.
      whileTap={disabled ? { scale: 1 } : { scale: 0.97 }}
      // Обрабатываем конструкцию: transition.
      transition={{ duration: 0.12 }}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: flex h-7 items-center gap-1.5 rounded-full border px-2.….
        "flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs",
        // Обрабатываем конструкцию: transition-colors duration-200 ease-out focus-visible:o….
        "transition-colors duration-200 ease-out focus-visible:outline-none",
        // Обрабатываем конструкцию: focus-visible:ring-accent-primary focus-visible:ring-2.
        "focus-visible:ring-accent-primary focus-visible:ring-2",
        // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-50.
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Обрабатываем конструкцию: active.
        active
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            ACTIVE_CLASSES[variant]
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "border-glass-border text-text-tertiary hover:bg-glass-hover hover:text-text-secondary"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {label}
      {/* Выводим текстовое содержимое в JSX. */}
      {count !== undefined ? (
        // Обрабатываем конструкцию: <span className=tabular-nums opacity-70>.
        <span className="tabular-nums opacity-70">{count}</span>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.button>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default FilterChip;.
export default FilterChip;
// — разделитель логических блоков —
