// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// Импортируем зависимости из модуля framer-motion.
import type { Variants } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/lib/appearanceTokens.
import { speedMs } from "@/lib/appearanceTokens";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт ANIMATION.
  ANIMATION,
  // Подключаем именованный импорт DASHBOARD_ITEM_DURATION_MS.
  DASHBOARD_ITEM_DURATION_MS,
  // Подключаем именованный импорт DASHBOARD_STAGGER_MS.
  DASHBOARD_STAGGER_MS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DashboardStaggerVariants {
  // Обрабатываем конструкцию: containerVariants.
  containerVariants: Variants;
  // Обрабатываем конструкцию: itemVariants.
  itemVariants: Variants;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useDashboardStagger(): DashboardStaggerVariants {
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { if (reducedMotion) { const staticVarian….
  return useMemo(() => {
    // Проверяем бизнес-условие: reducedMotion.
    if (reducedMotion) {
      // Обрабатываем конструкцию: const staticVariants: Variants = { hidden: { opacity: 1….
      const staticVariants: Variants = {
        // Обрабатываем конструкцию: hidden.
        hidden: { opacity: 1 },
        // Обрабатываем конструкцию: visible.
        visible: { opacity: 1, transition: { duration: 0 } },
        // Закрываем текущий блок.
      };
      // — разделитель логических блоков —

      // Возвращаем результат: { containerVariants: staticVariants, itemVariants: stat….
      return {
        // Обрабатываем конструкцию: containerVariants.
        containerVariants: staticVariants,
        // Обрабатываем конструкцию: itemVariants.
        itemVariants: staticVariants,
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const containerVariants: Variants = { hidden: {}, visib….
    const containerVariants: Variants = {
      // Обрабатываем конструкцию: hidden.
      hidden: {},
      // Обрабатываем конструкцию: visible.
      visible: {
        // Обрабатываем конструкцию: transition.
        transition: { staggerChildren: speedMs(DASHBOARD_STAGGER_MS) / 1000 },
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const itemVariants: Variants = { hidden: { opacity: 0, ….
    const itemVariants: Variants = {
      // Обрабатываем конструкцию: hidden.
      hidden: { opacity: 0, y: 16 },
      // Обрабатываем конструкцию: visible.
      visible: {
        // Обрабатываем конструкцию: opacity.
        opacity: 1,
        // Обрабатываем конструкцию: y.
        y: 0,
        // Обрабатываем конструкцию: transition.
        transition: {
          // Обрабатываем конструкцию: duration.
          duration: speedMs(DASHBOARD_ITEM_DURATION_MS) / 1000,
          // Обрабатываем конструкцию: ease.
          ease: ANIMATION.easeOutExpo,
          // Закрываем текущий блок.
        },
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Возвращаем результат: { containerVariants, itemVariants }.
    return { containerVariants, itemVariants };
    // Закрываем текущий блок.
  }, [reducedMotion]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
