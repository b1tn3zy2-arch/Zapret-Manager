// Импортируем зависимости из модуля @/i18n/en.
import { en } from "@/i18n/en";
// Импортируем зависимости из модуля @/i18n/ru.
import { ru, type Dictionary } from "@/i18n/ru";
// Импортируем зависимости из модуля @/i18n/types.
import type { Translate, TranslateParams, TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/types.
import type { Language } from "@/types";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Плоская карта «путь ключа → строка» для языка.
 * Плоская карта «путь ключа → строка» для языка.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше каждый вызов перевода разбивал ключ через split(.) …
 * Раньше каждый вызов перевода разбивал ключ через split(".") и обходил
 // Сохраняем пояснение разработчика: * вложенный объект через reduce. На списках и таблицах это д…
 * вложенный объект через reduce. На списках и таблицах это давало сотни
 // Сохраняем пояснение разработчика: * лишних аллокаций за рендер. Здесь словарь разворачивается …
 * лишних аллокаций за рендер. Здесь словарь разворачивается один раз при
 // Сохраняем пояснение разработчика: * загрузке модуля, а поиск становится O(1).
 * загрузке модуля, а поиск становится O(1).
 // Сохраняем пояснение разработчика: 
 */
// Объявляем псевдоним типа FlatDictionary.
type FlatDictionary = ReadonlyMap<string, string>;
// — разделитель логических блоков —

// Объявляем функцию flattenDictionary.
function flattenDictionary(
  // Обрабатываем конструкцию: node.
  node: unknown,
  // Обрабатываем конструкцию: prefix.
  prefix: string,
  // Обрабатываем конструкцию: target.
  target: Map<string, string>
  // Закрываем выражение или список аргументов.
): void {
  // Проверяем бизнес-условие: typeof node === string.
  if (typeof node === "string") {
    // Обрабатываем конструкцию: target.
    target.set(prefix, node);
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof node !== object || node === null.
  if (typeof node !== "object" || node === null) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Перебираем элементы коллекции Object.entries(node).
  for (const [key, child] of Object.entries(node)) {
    // Обрабатываем конструкцию: flattenDictionary.
    flattenDictionary(child, prefix === "" ? key : `${prefix}.${key}`, target);
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию buildFlatDictionary.
function buildFlatDictionary(dictionary: Dictionary): FlatDictionary {
  // Обрабатываем конструкцию: const flat = new Map<string, string>().
  const flat = new Map<string, string>();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: flattenDictionary.
  flattenDictionary(dictionary, "", flat);
  // — разделитель логических блоков —

  // Возвращаем результат: flat.
  return flat;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FLAT_DICTIONARIES: Record<Language, FlatDictionar….
const FLAT_DICTIONARIES: Record<Language, FlatDictionary> = {
  // Обрабатываем конструкцию: ru.
  ru: buildFlatDictionary(ru),
  // Обрабатываем конструкцию: en.
  en: buildFlatDictionary(en),
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: // Глобальный regex безопасно переиспользовать: String.repla…
// Глобальный regex безопасно переиспользовать: String.replace с флагом g
// Сохраняем пояснение разработчика: // сбрасывает lastIndex перед каждым вызовом.
// сбрасывает lastIndex перед каждым вызовом.
// Обрабатываем конструкцию: const INTERPOLATION_PATTERN = /\{(\w+)\}/g.
const INTERPOLATION_PATTERN = /\{(\w+)\}/g;
// — разделитель логических блоков —

// Объявляем функцию interpolate.
function interpolate(template: string, params?: TranslateParams): string {
  // Проверяем бизнес-условие: params === undefined.
  if (params === undefined) {
    // Возвращаем результат: template.
    return template;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: template.replace(INTERPOLATION_PATTERN, (match, name: s….
  return template.replace(
    // Продолжаем предыдущую конструкцию.
    INTERPOLATION_PATTERN,
    // Продолжаем предыдущую конструкцию.
    (match, name: string) =>
      // Обрабатываем конструкцию: name.
      name in params ? String(params[name]) : match
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию createTranslator.
function createTranslator(dictionary: FlatDictionary): Translate {
  // Возвращаем результат: (key: TranslationKey, params?: TranslateParams) => { co….
  return (key: TranslationKey, params?: TranslateParams) => {
    // Обрабатываем конструкцию: const template = dictionary.get(key) ?? key.
    const template = dictionary.get(key) ?? key;
    // — разделитель логических блоков —

    // Возвращаем результат: interpolate(template, params).
    return interpolate(template, params);
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const TRANSLATORS: Record<Language, Translate> = { ru: ….
const TRANSLATORS: Record<Language, Translate> = {
  // Обрабатываем конструкцию: ru.
  ru: createTranslator(FLAT_DICTIONARIES.ru),
  // Обрабатываем конструкцию: en.
  en: createTranslator(FLAT_DICTIONARIES.en),
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function createTranslate(language: Language): Translate {
  // Возвращаем результат: TRANSLATORS[language].
  return TRANSLATORS[language];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: let languageProvider: () => Language = () => ru.
let languageProvider: () => Language = () => "ru";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function registerLanguageProvider(provider: () => Language): void {
  // Обрабатываем конструкцию: languageProvider.
  languageProvider = provider;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function translateKey(
  // Обрабатываем конструкцию: key.
  key: TranslationKey,
  // Обрабатываем конструкцию: params.
  params?: TranslateParams
  // Закрываем выражение или список аргументов.
): string {
  // Возвращаем результат: TRANSLATORS[languageProvider()](key, params).
  return TRANSLATORS[languageProvider()](key, params);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Реэкспортируем значения из модуля export type { Dictionary, Translate, TranslateParams, TranslationKey }….
export type { Dictionary, Translate, TranslateParams, TranslationKey };
// — разделитель логических блоков —
