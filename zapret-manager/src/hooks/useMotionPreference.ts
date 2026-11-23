// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface MotionPreference {
  // Обрабатываем конструкцию: enabled.
  enabled: boolean;
  // Обрабатываем конструкцию: reduced.
  reduced: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useMotionPreference(): MotionPreference {
  // Обрабатываем конструкцию: const animations = useSettingsStore( (state) => state.s….
  const animations = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.appearance.animations
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo( () => ({ enabled: animations, reduced: !animat….
  return useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => ({ enabled: animations, reduced: !animations }),
    // Открываем массив.
    [animations]
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
