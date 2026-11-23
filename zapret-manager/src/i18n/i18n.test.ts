// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n/en.
import { en } from "@/i18n/en";
// Импортируем зависимости из модуля @/i18n.
import { createTranslate } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/ru.
import { ru, type Dictionary } from "@/i18n/ru";
// Импортируем зависимости из модуля @/lib/settingsConstants.
import { SETTINGS_SECTIONS } from "@/lib/settingsConstants";
// — разделитель логических блоков —

// Объявляем функцию collectKeys.
function collectKeys(node: unknown, prefix = ""): string[] {
  // Проверяем бизнес-условие: typeof node !== object || node === null.
  if (typeof node !== "object" || node === null) {
    // Возвращаем результат: [prefix].
    return [prefix];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: Object.entries(node).flatMap(([key, value]) => collectK….
  return Object.entries(node).flatMap(
    // Продолжаем предыдущую конструкцию.
    ([key, value]) =>
      // Обрабатываем конструкцию: collectKeys.
      collectKeys(value, prefix === "" ? key : `${prefix}.${key}`)
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const RU_KEYS = collectKeys(ru).sort().
const RU_KEYS = collectKeys(ru).sort();
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("словари локализации", () => {
  // Обрабатываем конструкцию: it.
  it("ru и en содержат одинаковый набор ключей", () => {
    // Обрабатываем конструкцию: expect.
    expect(collectKeys(en).sort()).toEqual(RU_KEYS);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("у каждой секции Settings есть подпись в обоих словарях", () => {
    // Перебираем элементы коллекции SETTINGS_SECTIONS.
    for (const section of SETTINGS_SECTIONS) {
      // Обрабатываем конструкцию: expect.
      expect(RU_KEYS).toContain(`settings.sections.${section}`);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("удалённая секция about не осталась в подписях Settings", () => {
    // Обрабатываем конструкцию: expect.
    expect(RU_KEYS).not.toContain("settings.sections.about");
    // Обрабатываем конструкцию: expect.
    expect(RU_KEYS).not.toContain("settings.about.title");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ключи About и лицензий живут на верхнем уровне", () => {
    // Перебираем элементы коллекции [ about.title, about.system, about.systemLoad….
    for (const key of [
      // Обрабатываем конструкцию: about.title.
      "about.title",
      // Обрабатываем конструкцию: about.system.
      "about.system",
      // Обрабатываем конструкцию: about.systemLoading.
      "about.systemLoading",
      // Обрабатываем конструкцию: about.links.
      "about.links",
      // Обрабатываем конструкцию: licenses.title.
      "licenses.title",
      // Обрабатываем конструкцию: licenses.item.zapret.
      "licenses.item.zapret",
      // Закрываем массив или список.
    ]) {
      // Обрабатываем конструкцию: expect.
      expect(RU_KEYS).toContain(key);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переводчик отдаёт строку, а не ключ", () => {
    // Обрабатываем конструкцию: const translate = createTranslate(ru).
    const translate = createTranslate("ru");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(translate("about.title")).toBe("О приложении");
    // Обрабатываем конструкцию: expect.
    expect(translate("settings.sections.general")).toBe("Общие");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("неизвестный ключ не роняет переводчик", () => {
    // Обрабатываем конструкцию: expect.
    expect(createTranslate("ru")("about.missing" as never)).toBe(
      // Обрабатываем конструкцию: about.missing.
      "about.missing"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("Dictionary", () => {
  // Обрабатываем конструкцию: it.
  it("экспортируется для типизации", () => {
    // Обрабатываем конструкцию: const value: Dictionary = ru.
    const value: Dictionary = ru;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(value.settings.title).toBe("Настройки");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
