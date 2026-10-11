import type { Dictionary } from "@/i18n/ru";

export type { Dictionary };

export type TranslateParams = Record<string, string | number>;

export interface Translate {
  (key: TranslationKey, params?: TranslateParams): string;
}

export type DeepKeys<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : `${K}.${DeepKeys<T[K]>}`;
    }[keyof T & string];

export type TranslationKey = DeepKeys<Dictionary>;
