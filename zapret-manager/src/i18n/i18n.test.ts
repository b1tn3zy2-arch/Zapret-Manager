import { describe, expect, it } from "vitest";

import { en } from "@/i18n/en";
import { createTranslate } from "@/i18n";
import { ru, type Dictionary } from "@/i18n/ru";
import { SETTINGS_SECTIONS } from "@/lib/settingsConstants";

function collectKeys(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) {
    return [prefix];
  }

  return Object.entries(node).flatMap(([key, value]) =>
    collectKeys(value, prefix === "" ? key : `${prefix}.${key}`)
  );
}

const RU_KEYS = collectKeys(ru).sort();

describe("словари локализации", () => {
  it("ru и en содержат одинаковый набор ключей", () => {
    expect(collectKeys(en).sort()).toEqual(RU_KEYS);
  });

  it("у каждой секции Settings есть подпись в обоих словарях", () => {
    for (const section of SETTINGS_SECTIONS) {
      expect(RU_KEYS).toContain(`settings.sections.${section}`);
    }
  });

  it("удалённая секция about не осталась в подписях Settings", () => {
    expect(RU_KEYS).not.toContain("settings.sections.about");
    expect(RU_KEYS).not.toContain("settings.about.title");
  });

  it("ключи About и лицензий живут на верхнем уровне", () => {
    for (const key of [
      "about.title",
      "about.system",
      "about.systemLoading",
      "about.links",
      "licenses.title",
      "licenses.item.zapret",
    ]) {
      expect(RU_KEYS).toContain(key);
    }
  });

  it("переводчик отдаёт строку, а не ключ", () => {
    const translate = createTranslate("ru");

    expect(translate("about.title")).toBe("О приложении");
    expect(translate("settings.sections.general")).toBe("Общие");
  });

  it("неизвестный ключ не роняет переводчик", () => {
    expect(createTranslate("ru")("about.missing" as never)).toBe(
      "about.missing"
    );
  });
});

describe("Dictionary", () => {
  it("экспортируется для типизации", () => {
    const value: Dictionary = ru;

    expect(value.settings.title).toBe("Настройки");
  });
});
