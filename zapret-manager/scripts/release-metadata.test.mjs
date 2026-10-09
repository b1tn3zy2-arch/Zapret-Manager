import { describe, expect, it } from "vitest";

import {
  PLACEHOLDER,
  bareRepo,
  checkBundleFile,
  checkBundleFreshness,
  checkDocument,
  extractRepoUrl,
  isPlaceholder,
} from "./lib/release-metadata.mjs";

describe("extractRepoUrl", () => {
  it("читает константу в одну строку", () => {
    expect(
      extractRepoUrl(
        'export const APP_REPOSITORY_URL = "https://github.com/acme/app";'
      )
    ).toBe("https://github.com/acme/app");
  });

  it("читает константу, перенесённую prettier на две строки", () => {
    const source = [
      "export const APP_REPOSITORY_URL =",
      '  "https://github.com/acme/zapret-manager";',
    ].join("\n");

    expect(extractRepoUrl(source)).toBe(
      "https://github.com/acme/zapret-manager"
    );
  });

  it("возвращает undefined, если константы нет", () => {
    expect(extractRepoUrl("export const OTHER = 1;")).toBeUndefined();
    expect(extractRepoUrl(null)).toBeUndefined();
  });
});

describe("isPlaceholder", () => {
  it("считает плейсхолдер незаполненным", () => {
    expect(isPlaceholder(`https://github.com/${PLACEHOLDER}`)).toBe(true);
  });

  it("считает реальный адрес заполненным", () => {
    expect(isPlaceholder("https://github.com/acme/zapret-manager")).toBe(false);
  });

  it("считает отсутствие значения незаполненным", () => {
    expect(isPlaceholder(undefined)).toBe(true);
  });
});

describe("bareRepo", () => {
  it("убирает префикс github", () => {
    expect(bareRepo("https://github.com/acme/app")).toBe("acme/app");
  });

  it("возвращает пустую строку для не-строки", () => {
    expect(bareRepo(undefined)).toBe("");
  });
});

describe("checkDocument", () => {
  it("ловит плейсхолдер и ссылку на upstream issues", () => {
    const problems = checkDocument(
      "README.md",
      `см. https://github.com/${PLACEHOLDER} и https://github.com/Flowseal/zapret-discord-youtube/issues`
    );

    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("плейсхолдер");
    expect(problems[1]).toContain("upstream");
  });

  it("пропускает плейсхолдер с allowPlaceholder", () => {
    const problems = checkDocument(
      "README.md",
      `https://github.com/${PLACEHOLDER}`,
      {
        allowPlaceholder: true,
      }
    );

    expect(problems).toHaveLength(0);
  });

  it("сообщает об отсутствующем файле", () => {
    expect(checkDocument("README.md", null)).toEqual(["README.md не найден"]);
  });

  it("пропускает корректный документ", () => {
    expect(
      checkDocument("README.md", "https://github.com/acme/app")
    ).toHaveLength(0);
  });
});

describe("checkBundleFile", () => {
  it("ловит плейсхолдер в бандле", () => {
    const problems = checkBundleFile({
      name: "dist/app.js",
      content: `url="https://github.com/${PLACEHOLDER}"`,
    });

    expect(problems.some((item) => item.includes("плейсхолдер"))).toBe(true);
  });

  it("ловит ссылку на issues upstream-репозитория", () => {
    const problems = checkBundleFile({
      name: "dist/app.js",
      content:
        'a="https://github.com/Flowseal/zapret-discord-youtube/issues";b="acme/app";',
    });

    expect(problems.some((item) => item.includes("issues"))).toBe(true);
  });

  it("пропускает бандл без плейсхолдера и upstream-ссылок", () => {
    const problems = checkBundleFile({
      name: "dist/app.js",
      content:
        'repo="acme/zapret-manager";up="Flowseal/zapret-discord-youtube";',
    });

    expect(problems).toHaveLength(0);
  });
});

describe("checkBundleFreshness", () => {
  it("ловит бандл, собранный до подстановки репозитория", () => {
    const problems = checkBundleFreshness(
      'const repo="acme/zapret-manager";',
      "https://github.com/other/zapret-manager"
    );

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("до подстановки");
  });

  it("пропускает бандл, содержащий нужный репозиторий", () => {
    expect(
      checkBundleFreshness(
        'repo="acme/zapret-manager";',
        "https://github.com/acme/zapret-manager"
      )
    ).toHaveLength(0);
  });

  it("не проверяет свежесть, пока в исходниках плейсхолдер", () => {
    expect(
      checkBundleFreshness(
        'repo="acme/zapret-manager";',
        `https://github.com/${PLACEHOLDER}`
      )
    ).toHaveLength(0);
  });

  it("не проверяет свежесть, если репозиторий не разобран", () => {
    expect(checkBundleFreshness("whatever", undefined)).toHaveLength(0);
  });

  it("не проверяет свежесть старого dist с явно разрешённым placeholder", () => {
    expect(
      checkBundleFreshness(
        'repo="my-account/zapret-manager";',
        "https://github.com/acme/zapret-manager",
        { allowPlaceholder: true }
      )
    ).toHaveLength(0);
  });
});
