// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { ArrowDown } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ScrollToBottomButtonProps {
  // Обрабатываем конструкцию: visible.
  visible: boolean;
  // Обрабатываем конструкцию: onClick.
  onClick: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию ScrollToBottomButton.
function ScrollToBottomButton({ visible, onClick }: ScrollToBottomButtonProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Возвращаем результат: ( <AnimatePresence> {visible ? ( <motion.div key=scroll….
  return (
    // Обрабатываем конструкцию: <AnimatePresence>.
    <AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
      {visible ? (
        // Обрабатываем конструкцию: <motion.div key=scroll-to-bottom initial={{ opacity: 0,….
        <motion.div
          // Обрабатываем конструкцию: key.
          key="scroll-to-bottom"
          // Обрабатываем конструкцию: initial.
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1, scale: 1, y: 0 }}
          // Обрабатываем конструкцию: exit.
          exit={{ opacity: 0, scale: 0.85, y: 8 }}
          // Обрабатываем конструкцию: transition.
          transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
          // Обрабатываем конструкцию: className.
          className="absolute right-6 bottom-6 z-20"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="icon"
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("logs.scrollAria")}
            // Обрабатываем конструкцию: title.
            title={t("logs.scrollTitle")}
            // Обрабатываем конструкцию: onClick.
            onClick={onClick}
            // Обрабатываем конструкцию: icon.
            icon={<ArrowDown className="size-4" />}
            // Продолжаем выражение.
          />
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

// Обрабатываем конструкцию: export default ScrollToBottomButton;.
export default ScrollToBottomButton;
// — разделитель логических блоков —
