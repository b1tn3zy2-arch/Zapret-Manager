import { useCallback, useMemo } from "react";

import {
  createTranslate,
  registerLanguageProvider,
  type Dictionary,
  type Translate,
  type TranslateParams,
  type TranslationKey,
} from "@/i18n/core";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Language } from "@/types";

registerLanguageProvider(
  () => useSettingsStore.getState().settings.general.language
);

export interface UseI18nResult {
  t: Translate;
  language: Language;
  setLanguage: (language: Language) => void;
}

export function useI18n(): UseI18nResult {
  const language = useSettingsStore((state) => state.settings.general.language);
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  const t = useMemo(() => createTranslate(language), [language]);

  const setLanguage = useCallback(
    (next: Language) => {
      updateGeneral({ language: next });
    },
    [updateGeneral]
  );

  return { t, language, setLanguage };
}

export { createTranslate } from "@/i18n/core";
export type { Dictionary, Translate, TranslateParams, TranslationKey };
