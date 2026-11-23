// Импортируем зависимости из модуля react.
import { useCallback, useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n/core.
import {
  // Подключаем именованный импорт createTranslate.
  createTranslate,
  // Подключаем именованный импорт registerLanguageProvider.
  registerLanguageProvider,
  // Подключаем именованный импорт type Dictionary.
  type Dictionary,
  // Подключаем именованный импорт type Translate.
  type Translate,
  // Подключаем именованный импорт type TranslateParams.
  type TranslateParams,
  // Подключаем именованный импорт type TranslationKey.
  type TranslationKey,
  // Закрываем текущий блок.
} from "@/i18n/core";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { Language } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: registerLanguageProvider.
registerLanguageProvider(
  // Объявляем функцию-обработчик или стрелочную функцию.
  () => useSettingsStore.getState().settings.general.language
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseI18nResult {
  // Обрабатываем конструкцию: t.
  t: Translate;
  // Обрабатываем конструкцию: language.
  language: Language;
  // Обрабатываем конструкцию: setLanguage.
  setLanguage: (language: Language) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useI18n(): UseI18nResult {
  // Обрабатываем конструкцию: const language = useSettingsStore((state) => state.sett….
  const language = useSettingsStore((state) => state.settings.general.language);
  // Обрабатываем конструкцию: const updateGeneral = useSettingsStore((state) => state….
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  // Обрабатываем конструкцию: const t = useMemo(() => createTranslate(language), [lan….
  const t = useMemo(() => createTranslate(language), [language]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const setLanguage = useCallback( (next: Language) => { ….
  const setLanguage = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (next: Language) => {
      // Обрабатываем конструкцию: updateGeneral.
      updateGeneral({ language: next });
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [updateGeneral]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { t, language, setLanguage }.
  return { t, language, setLanguage };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Реэкспортируем значения из модуля export { createTranslate } from @/i18n/core;.
export { createTranslate } from "@/i18n/core";
// Реэкспортируем значения из модуля export type { Dictionary, Translate, TranslateParams, TranslationKey }….
export type { Dictionary, Translate, TranslateParams, TranslationKey };
// — разделитель логических блоков —
