import { describe, expect, it } from "vitest";

import { buildAreaPath, buildSmoothPath } from "@/lib/smoothPath";

describe("buildSmoothPath", () => {
  it("returns empty string for fewer than two points", () => {
    expect(buildSmoothPath([])).toBe("");
    expect(buildSmoothPath([{ x: 1, y: 2 }])).toBe("");
  });

  it("starts at the first point", () => {
    const path = buildSmoothPath([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
    ]);

    expect(path.startsWith("M 0.00 10.00")).toBe(true);
  });

  it("uses cubic bezier segments between points", () => {
    const path = buildSmoothPath([
      { x: 0, y: 10 },
      { x: 10, y: 20 },
      { x: 20, y: 5 },
    ]);

    expect(path.match(/ C /g)).toHaveLength(2);
    expect(path.endsWith("20.00 5.00")).toBe(true);
  });

  it("stays within the vertical bounds of neighbouring points", () => {
    const path = buildSmoothPath([
      { x: 0, y: 100 },
      { x: 10, y: 0 },
      { x: 20, y: 100 },
    ]);

    const numbers = path
      .split(/[^\d.-]+/)
      .filter((token) => token !== "" && token !== "-")
      .map(Number);

    expect(numbers.every((value) => value >= 0 && value <= 100)).toBe(true);
  });

  it("formats every coordinate with two decimals", () => {
    const path = buildSmoothPath([
      { x: 0, y: 1.234567 },
      { x: 10.98765, y: 2 },
      { x: 20.12345, y: 3 },
    ]);

    const coords = path.match(/-?\d+\.\d+/g) ?? [];

    expect(coords.length).toBeGreaterThan(0);
    expect(
      coords.every((coord) => {
        const [, decimals] = coord.split(".");
        return decimals !== undefined && decimals.length === 2;
      })
    ).toBe(true);
  });

  it("keeps control points near the data when tension is small", () => {
    const path = buildSmoothPath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 0 },
      ],
      0
    );

    expect(path).toBe(
      "M 0.00 0.00 C 0.00 0.00, 10.00 10.00, 10.00 10.00 C 10.00 10.00, 20.00 0.00, 20.00 0.00"
    );
  });
});

describe("buildAreaPath", () => {
  it("returns empty string when there is nothing to fill", () => {
    expect(buildAreaPath([], 50)).toBe("");
    expect(buildAreaPath([{ x: 1, y: 2 }], 50)).toBe("");
  });

  it("closes the curve down to the baseline", () => {
    const path = buildAreaPath(
      [
        { x: 0, y: 10 },
        { x: 10, y: 20 },
      ],
      40
    );

    expect(path.endsWith("L 10.00 40.00 L 0.00 40.00 Z")).toBe(true);
    expect(path.startsWith("M 0.00 10.00")).toBe(true);
  });
});
