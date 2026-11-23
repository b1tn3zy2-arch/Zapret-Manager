// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Shield } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { APP_NAME } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function BootSplash() {
  // Возвращаем результат: ( <motion.div aria-hidden=true className=bg-bg-primary ….
  return (
    // Обрабатываем конструкцию: <motion.div aria-hidden=true className=bg-bg-primary fi….
    <motion.div
      // Обрабатываем конструкцию: aria-hidden.
      aria-hidden="true"
      // Обрабатываем конструкцию: className.
      className="bg-bg-primary fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 overflow-hidden"
      // Обрабатываем конструкцию: initial.
      initial={{ opacity: 1 }}
      // Обрабатываем конструкцию: exit.
      exit={{ opacity: 0 }}
      // Обрабатываем конструкцию: transition.
      transition={{ duration: 0.45, ease: "easeOut" }}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.span
        // Обрабатываем конструкцию: className.
        className="text-accent-primary bg-accent-primary/10 flex size-20 items-center justify-center rounded-3xl"
        // Обрабатываем конструкцию: initial.
        initial={{ scale: 0.82, opacity: 0 }}
        // Обрабатываем конструкцию: animate.
        animate={{ scale: 1, opacity: 1 }}
        // Обрабатываем конструкцию: transition.
        transition={{
          // Обрабатываем конструкцию: type.
          type: "spring",
          // Обрабатываем конструкцию: stiffness.
          stiffness: 260,
          // Обрабатываем конструкцию: damping.
          damping: 22,
          // Обрабатываем конструкцию: delay.
          delay: 0.05,
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <Shield className="size-11" strokeWidth={1.8} />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.span
        // Обрабатываем конструкцию: className.
        className="text-text-primary text-lg font-semibold tracking-tight"
        // Обрабатываем конструкцию: initial.
        initial={{ opacity: 0, y: 8 }}
        // Обрабатываем конструкцию: animate.
        animate={{ opacity: 1, y: 0 }}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {APP_NAME}
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.span
        // Обрабатываем конструкцию: className.
        className="bg-accent-primary absolute bottom-0 left-0 h-[2px]"
        // Обрабатываем конструкцию: initial.
        initial={{ width: "0%" }}
        // Обрабатываем конструкцию: animate.
        animate={{ width: "100%" }}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: 0.55, ease: "easeOut" }}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
