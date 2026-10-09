import { describe, expect, it } from "vitest";

import {
  countryCodeToFlagSrc,
  getGreeting,
  hasFlagAsset,
  isKnownCountryCode,
  toCountryCode,
} from "@/lib/geo";

describe("getGreeting", () => {
  it("по всем часам суток возвращает одну из четырёх приветствий", () => {
    const variants = new Set<string>();

    for (let hour = 0; hour < 24; hour += 1) {
      variants.add(getGreeting(new Date(2026, 0, 1, hour)));
    }

    expect([...variants].sort()).toEqual([
      "Доброе утро",
      "Доброй ночи",
      "Добрый вечер",
      "Добрый день",
    ]);
  });

  it.each([
    [0, "Доброй ночи"],
    [4, "Доброй ночи"],
    [5, "Доброе утро"],
    [9, "Доброе утро"],
    [11, "Доброе утро"],
    [12, "Добрый день"],
    [15, "Добрый день"],
    [17, "Добрый день"],
    [18, "Добрый вечер"],
    [22, "Добрый вечер"],
    [23, "Доброй ночи"],
  ])("в %i:00 возвращает «%s»", (hour, expected) => {
    expect(getGreeting(new Date(2026, 0, 1, hour))).toBe(expected);
  });

  it("начинается со слова Добр, чтобы находиться в UI одним селектором", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      expect(getGreeting(new Date(2026, 0, 1, hour))).toMatch(/^Добр/);
    }
  });
});

describe("toCountryCode", () => {
  it("приводит код к верхнему регистру", () => {
    expect(toCountryCode("ru")).toBe("RU");
    expect(toCountryCode(" de ")).toBe("DE");
  });

  it("возвращает null для некорректного значения", () => {
    expect(toCountryCode("")).toBeNull();
    expect(toCountryCode("rus")).toBeNull();
  });

  it("отбрасывает коды без флага", () => {
    expect(toCountryCode("zz")).toBeNull();
    expect(isKnownCountryCode("RU")).toBe(true);
    expect(hasFlagAsset("RU")).toBe(true);
    expect(hasFlagAsset("zz")).toBe(false);
  });

  it("отдаёт флаг инлайном, а для неизвестного кода — флаг-заглушку", () => {
    const ru = countryCodeToFlagSrc("RU");

    expect(ru).toMatch(/^data:image\/svg\+xml/);
    expect(countryCodeToFlagSrc("zz")).not.toBe(ru);
  });
});
