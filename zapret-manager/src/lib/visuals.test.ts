import { describe, expect, it } from "vitest";

import {
  buildGlowGradient,
  computeGlowPosition,
  computeTilt,
} from "@/lib/cardTilt";
import { getChromaticFilter, getChromaticOverlay } from "@/lib/chromatic";
import {
  countryCodeToFlagSrc,
  getGreeting,
  hasFlagAsset,
  isKnownCountryCode,
  toCountryCode,
} from "@/lib/geo";
import { getBloomFilter, getBloomShadow } from "@/lib/bloom";
import { shiftIntensity } from "@/lib/postProcessingTokens";
import { getBreakpoint } from "@/lib/breakpoints";

describe("computeTilt", () => {
  const rect = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;

  it("returns zero tilt in the center", () => {
    const tilt = computeTilt(100, 50, rect, 10);

    expect(Math.abs(tilt.rotateX)).toBe(0);
    expect(Math.abs(tilt.rotateY)).toBe(0);
  });

  it("tilts away from the cursor edges", () => {
    const tilt = computeTilt(190, 90, rect, 10);

    expect(tilt.rotateY).toBeGreaterThan(0);
    expect(tilt.rotateX).toBeLessThan(0);
  });

  it("respects the tilt limit", () => {
    const tilt = computeTilt(1000, -1000, rect, 5);

    expect(Math.abs(tilt.rotateX)).toBeLessThanOrEqual(10);
    expect(Math.abs(tilt.rotateY)).toBeLessThanOrEqual(10);
  });

  it("handles zero-sized elements", () => {
    const empty = { left: 0, top: 0, width: 0, height: 0 } as DOMRect;

    expect(computeTilt(10, 10, empty, 10)).toEqual({
      rotateX: 0,
      rotateY: 0,
    });
  });
});

describe("computeGlowPosition", () => {
  it("maps cursor to percentages", () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;
    const position = computeGlowPosition(100, 50, rect);

    expect(position.x).toBe(50);
    expect(position.y).toBe(50);
  });
});

describe("buildGlowGradient", () => {
  it("produces a radial gradient", () => {
    expect(buildGlowGradient(30, 70, "rgba(255,255,255,0.1)")).toContain(
      "radial-gradient"
    );
  });
});

describe("getChromaticFilter", () => {
  it("returns stronger distortion for stronger intensity", () => {
    const off = getChromaticFilter("off");
    const strong = getChromaticFilter("strong");

    expect(off).toBe("");
    expect(strong).not.toBe("");
  });
});

describe("getChromaticOverlay", () => {
  it("returns empty overlay when off", () => {
    expect(getChromaticOverlay("off")).toEqual({});
  });

  it("builds inset fringes for active intensity", () => {
    const overlay = getChromaticOverlay("strong");

    expect(String(overlay.boxShadow)).toContain("inset");
    expect(overlay.mixBlendMode).toBe("screen");
  });
});

describe("shiftIntensity", () => {
  it("keeps off always off", () => {
    expect(shiftIntensity("off", 1)).toBe("off");
  });

  it("shifts and clamps between levels", () => {
    expect(shiftIntensity("normal", -1)).toBe("subtle");
    expect(shiftIntensity("strong", 1)).toBe("strong");
    expect(shiftIntensity("subtle", -2)).toBe("subtle");
  });
});

describe("getBloomShadow", () => {
  it("builds a shadow for active intensity", () => {
    expect(getBloomShadow("primary", "normal")).not.toBe("");
    expect(getBloomShadow("primary", "off")).toBe("");
  });

  it("builds a drop-shadow filter", () => {
    expect(getBloomFilter("primary", "strong")).toContain("drop-shadow");
  });
});

describe("geo helpers", () => {
  it("validates country codes", () => {
    expect(isKnownCountryCode("ru")).toBe(true);
    expect(isKnownCountryCode("zz")).toBe(false);
  });

  it("normalizes invalid codes to null", () => {
    expect(toCountryCode("RU")).toBe("RU");
    expect(toCountryCode("qq")).toBeNull();
  });

  it("builds flag asset paths", () => {
    expect(countryCodeToFlagSrc("ru").startsWith("data:")).toBe(true);
    expect(countryCodeToFlagSrc("zz").startsWith("data:")).toBe(true);
    expect(hasFlagAsset("ru")).toBe(true);
  });

  it("greets depending on hour", () => {
    expect(getGreeting(new Date(2026, 0, 1, 9))).toBeTypeOf("string");
    expect(getGreeting(new Date(2026, 0, 1, 23))).toBeTypeOf("string");
  });
});

describe("resolveBreakpoint", () => {
  it("maps widths to breakpoints", () => {
    expect(getBreakpoint(375)).toBe("xs");
    expect(getBreakpoint(700)).toBe("sm");
    expect(getBreakpoint(900)).toBe("md");
    expect(getBreakpoint(1100)).toBe("lg");
    expect(getBreakpoint(1300)).toBe("xl");
    expect(getBreakpoint(1700)).toBe("2xl");
  });
});
