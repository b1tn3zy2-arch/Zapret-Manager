// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { AlertCircle, Check, Info } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type ToastTone = "success" | "error" | "info";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogsToastProps {
  // Обрабатываем конструкцию: message.
  message: string | null;
  // Обрабатываем конструкцию: tone.
  tone: ToastTone;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TONE_CLASSES = { success: border-accent-primary/4….
const TONE_CLASSES = {
  // Обрабатываем конструкцию: success.
  success: "border-accent-primary/40 text-accent-primary",
  // Обрабатываем конструкцию: error.
  error: "border-accent-danger/40 text-accent-danger",
  // Обрабатываем конструкцию: info.
  info: "border-glass-border text-text-primary",
  // Закрываем текущий блок.
} as const satisfies Record<ToastTone, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TONE_ICONS = { success: Check, error: AlertCircle….
const TONE_ICONS = {
  // Обрабатываем конструкцию: success.
  success: Check,
  // Обрабатываем конструкцию: error.
  error: AlertCircle,
  // Обрабатываем конструкцию: info.
  info: Info,
  // Закрываем текущий блок.
} as const satisfies Record<ToastTone, typeof Check>;
// — разделитель логических блоков —

// Объявляем функцию LogsToast.
function LogsToast({ message, tone }: LogsToastProps) {
  // Обрабатываем конструкцию: const Icon = TONE_ICONS[tone].
  const Icon = TONE_ICONS[tone];
  // — разделитель логических блоков —

  // Возвращаем результат: ( <AnimatePresence> {message !== null ? ( <motion.div k….
  return (
    // Обрабатываем конструкцию: <AnimatePresence>.
    <AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
      {message !== null ? (
        // Обрабатываем конструкцию: <motion.div key=logs-toast role=status aria-live=polite….
        <motion.div
          // Обрабатываем конструкцию: key.
          key="logs-toast"
          // Обрабатываем конструкцию: role.
          role="status"
          // Обрабатываем конструкцию: aria-live.
          aria-live="polite"
          // Обрабатываем конструкцию: initial.
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1, y: 0, scale: 1 }}
          // Обрабатываем конструкцию: exit.
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          // Обрабатываем конструкцию: transition.
          transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: bg-bg-secondary/95 pointer-events-none absolute bottom-….
            "bg-bg-secondary/95 pointer-events-none absolute bottom-6 left-1/2 z-30",
            // Обрабатываем конструкцию: -translate-x-1/2 rounded-lg border px-4 py-2 text-sm sh….
            "-translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg backdrop-blur",
            // Обрабатываем конструкцию: TONE_CLASSES.
            TONE_CLASSES[tone]
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="flex items-center gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {/* Выводим текстовое содержимое в JSX. */}
            {message}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </AnimatePresence>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LogsToast;.
export default LogsToast;
// — разделитель логических блоков —
