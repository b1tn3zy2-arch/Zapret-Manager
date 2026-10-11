import { en } from "@/i18n/en";
import { ru, type Dictionary } from "@/i18n/ru";
import type { Translate, TranslateParams, TranslationKey } from "@/i18n/types";
import type { Language } from "@/types";

const DICTIONARIES: Record<Language, Dictionary> = { ru, en };

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

function interpolate(template: string, params?: TranslateParams): string {
  if (params === undefined) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}

export function createTranslate(language: Language): Translate {
  const dictionary = DICTIONARIES[language];

  return (key: TranslationKey, params?: TranslateParams) =>
    interpolate(resolve(dictionary, key) ?? key, params);
}

let languageProvider: () => Language = () => "ru";

export function registerLanguageProvider(provider: () => Language): void {
  languageProvider = provider;
}

export function translateKey(
  key: TranslationKey,
  params?: TranslateParams
): string {
  return createTranslate(languageProvider())(key, params);
}

export type { Dictionary, Translate, TranslateParams, TranslationKey };
