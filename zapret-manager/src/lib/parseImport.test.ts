import { describe, expect, it } from "vitest";

import {
  buildTextFile,
  mergeUnique,
  mergeUniqueNumbers,
  parseDomainsFromText,
  parseIpsFromText,
  parsePortsFromText,
} from "@/lib/parseImport";

describe("parseDomainsFromText", () => {
  it("пропускает комментарии и пустые строки", () => {
    const text = [
      "# список",
      "",
      "discord.com",
      "  youtube.com  ",
      "not a domain",
    ].join("\n");

    expect(parseDomainsFromText(text)).toEqual(["discord.com", "youtube.com"]);
  });

  it("убирает дубликаты, сохраняя порядок", () => {
    expect(parseDomainsFromText("a.com\nb.com\na.com")).toEqual([
      "a.com",
      "b.com",
    ]);
  });

  it("пустой текст даёт пустой массив", () => {
    expect(parseDomainsFromText("")).toEqual([]);
    expect(parseDomainsFromText("\n\n")).toEqual([]);
  });

  it("отбрасывает домены с недопустимыми символами", () => {
    expect(parseDomainsFromText("bad domain.com\nok.com\n")).toEqual([
      "ok.com",
    ]);
  });
});

describe("parseIpsFromText", () => {
  it("оставляет только валидные адреса", () => {
    expect(parseIpsFromText("1.1.1.1\n256.0.0.1\n# comment")).toEqual([
      "1.1.1.1",
    ]);
  });

  it("поддерживает IPv6", () => {
    expect(parseIpsFromText("2606:4700::1111\n nonsense")).toEqual([
      "2606:4700::1111",
    ]);
  });
});

describe("parsePortsFromText", () => {
  it("парсит числа в диапазоне и игнорирует остальное", () => {
    expect(parsePortsFromText("443 80 70000 abc 8443")).toEqual([
      443, 80, 8443,
    ]);
  });

  it("не добавляет дубликаты", () => {
    expect(parsePortsFromText("443\n443\n80")).toEqual([443, 80]);
  });

  it("пустой текст даёт пустой массив", () => {
    expect(parsePortsFromText("")).toEqual([]);
  });
});

describe("mergeUnique", () => {
  it("сливает без дублей, сохраняя порядок", () => {
    expect(mergeUnique(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("сохраняет порядок и не добавляет дубли", () => {
    expect(mergeUnique(["a"], ["a", "b", "b"])).toEqual(["a", "b"]);
  });
});

describe("mergeUniqueNumbers", () => {
  it("сливает числа без дублей", () => {
    expect(mergeUniqueNumbers([443, 80], [80, 8080])).toEqual([443, 80, 8080]);
  });

  it("пустой список не меняет исходный", () => {
    expect(mergeUniqueNumbers([443], [])).toEqual([443]);
  });
});

describe("buildTextFile", () => {
  it("заканчивается переводом строки и пропускает пустые элементы", () => {
    expect(buildTextFile(["a", "", "b"])).toBe("a\nb\n");
  });

  it("пустой массив даёт пустую строку", () => {
    expect(buildTextFile([])).toBe("");
  });
});
