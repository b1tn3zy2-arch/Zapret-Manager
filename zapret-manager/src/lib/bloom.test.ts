import { describe, expect, it } from "vitest";

import {
  getBloomFilter,
  getBloomShadow,
  getBloomShadowHover,
  getGlowBorder,
  getTextGlow,
} from "@/lib/bloom";

const INTENSITIES = ["subtle", "normal", "strong"] as const;

describe("getBloomShadow", () => {
  it("возвращает пустую строку для выключенного эффекта", () => {
    expect(getBloomShadow("primary", "off")).toBe("");
  });

  it("строит список слоёв для каждой интенсивности", () => {
    for (const intensity of INTENSITIES) {
      const shadow = getBloomShadow("primary", intensity);

      expect(shadow).toContain("px");
      expect(shadow).toContain("var(");
      expect(shadow.split(",").length).toBeGreaterThanOrEqual(2);
    }
  });

  it("увеличивает радиус размытия с интенсивностью", () => {
    const radii = INTENSITIES.map((intensity) => {
      const blur = /0 0 (\d+)px/.exec(getBloomShadow("primary", intensity));
      return Number(blur?.[1] ?? 0);
    });

    expect(radii[1]).toBeGreaterThan(radii[0] ?? 0);
    expect(radii[2]).toBeGreaterThan(radii[1] ?? 0);
  });
});

describe("getBloomShadowHover", () => {
  it("выключенный эффект остаётся пустым", () => {
    expect(getBloomShadowHover("primary", "off")).toBe("");
  });

  it("hover-тень не уже состояния покоя", () => {
    for (const intensity of INTENSITIES) {
      const rest = getBloomShadow("secondary", intensity);
      const hover = getBloomShadowHover("secondary", intensity);

      expect(hover.length).toBeGreaterThan(0);
      expect(hover).not.toBe("");
      expect(rest.length).toBeGreaterThan(0);
    }
  });
});

describe("getBloomFilter", () => {
  it("пусто при off", () => {
    expect(getBloomFilter("primary", "off")).toBe("");
  });

  it("содержит два drop-shadow", () => {
    const filter = getBloomFilter("warning", "normal");

    expect(filter.match(/drop-shadow/g)).toHaveLength(2);
  });
});

describe("getTextGlow", () => {
  it("пусто при off", () => {
    expect(getTextGlow("primary", "off")).toBe("");
  });

  it("два слоя текста при включённом эффекте", () => {
    expect(
      getTextGlow("primary", "strong").split(",").length
    ).toBeGreaterThanOrEqual(2);
  });
});

describe("getGlowBorder", () => {
  it("transparent при off", () => {
    expect(getGlowBorder("primary", "off")).toBe("transparent");
  });

  it("использует CSS-переменную при включённом эффекте", () => {
    expect(getGlowBorder("secondary", "subtle")).toContain("var(--");
  });
});
