// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/SettingsNav.
import SettingsNav from "@/components/settings/SettingsNav";
// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { SettingsSection } from "@/types";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SettingsLayoutProps {
  // Обрабатываем конструкцию: active.
  active: SettingsSection;
  // Обрабатываем конструкцию: onSectionChange.
  onSectionChange: (section: SettingsSection) => void;
  // Обрабатываем конструкцию: sectionKey.
  sectionKey: string;
  // Обрабатываем конструкцию: t.
  t: Translate;
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию SettingsLayout.
function SettingsLayout({
  // Обрабатываем конструкцию: active.
  active,
  // Обрабатываем конструкцию: onSectionChange.
  onSectionChange,
  // Обрабатываем конструкцию: sectionKey.
  sectionKey,
  // Обрабатываем конструкцию: t.
  t,
  // Обрабатываем конструкцию: children.
  children,
  // Закрываем текущий блок.
}: SettingsLayoutProps) {
  // Возвращаем результат: ( <div className=flex flex-col gap-5 md:flex-row md:gap….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-5 md:flex-row md:gap-6….
    <div className="flex flex-col gap-5 md:flex-row md:gap-6">
      {/* Выводим текстовое содержимое в JSX. */}
      <SettingsNav active={active} onChange={onSectionChange} t={t} />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="min-w-0 flex-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.div
          // Обрабатываем конструкцию: key.
          key={sectionKey}
          // Обрабатываем конструкцию: initial.
          initial={{ opacity: 0, y: 8 }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1, y: 0 }}
          // Обрабатываем конструкцию: transition.
          transition={{ duration: ANIMATION.fast, ease: ANIMATION.easeOutExpo }}
          // Обрабатываем конструкцию: className.
          className="flex flex-col gap-4"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {children}
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default SettingsLayout;.
export default SettingsLayout;
// — разделитель логических блоков —
