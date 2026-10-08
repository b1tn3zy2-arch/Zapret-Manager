import { en } from "@/i18n/en";
import { ru, type Dictionary } from "@/i18n/ru";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Language } from "@/types";

export type TranslationKey = DeepKeys<Dictionary>;

type DeepKeys<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${DeepKeys<T[K]>}`;
    }[keyof T & string];

const DICTIONARIES: Record<Language, Dictionary> = { ru, en };

export type Translate = (key: TranslationKey) => string;

function resolve(dictionary: Dictionary, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        typeof node === "object" && node !== null
          ? Reflect.get(node, part)
          : undefined,
      dictionary
    );

  return typeof value === "string" ? value : undefined;
}

export function createTranslate(language: Language): Translate {
  const dictionary = DICTIONARIES[language];

  return (key) => resolve(dictionary, key) ?? key;
}

export interface UseI18nResult {
  t: Translate;
  language: Language;
}

export function useI18n(): UseI18nResult {
  const language = useSettingsStore((state) => state.settings.general.language);

  return { t: createTranslate(language), language };
}

export type { Dictionary };
