import { describe, expect, it } from "vitest";

import {
  buildSparklineFill,
  buildSparklinePath,
  formatPing,
  getPingColor,
  lastLatency,
} from "@/lib/pingUtils";
import type { PingPoint } from "@/lib/pingUtils";
import { formatBytes, formatSpeed } from "@/lib/trafficUtils";

const POINTS: PingPoint[] = [
  { timestamp: 1, latencyMs: 10, success: true },
  { timestamp: 2, latencyMs: 30, success: true },
  { timestamp: 3, latencyMs: 20, success: true },
];

describe("formatBytes", () => {
  it("масштабирует единицы", () => {
    expect(formatBytes(0)).toContain("Б");
    expect(formatBytes(2048)).toContain("КБ");
    expect(formatBytes(5 * 1024 * 1024)).toContain("МБ");
  });

  it("не показывает дробные байты", () => {
    expect(formatBytes(512)).not.toContain(",");
  });
});

describe("formatSpeed", () => {
  it("добавляет единицу скорости", () => {
    expect(formatSpeed(1024)).toContain("Б/с");
    expect(formatSpeed(0)).toContain("Б/с");
  });
});

describe("getPingColor", () => {
  it("возвращает строку и различает латентности", () => {
    expect(getPingColor(null)).toBeTypeOf("string");
    expect(getPingColor(20)).not.toBe(getPingColor(900));
  });
});

describe("formatPing", () => {
  it("обрабатывает отсутствие данных", () => {
    expect(formatPing(null)).toBe("—");
  });

  it("показывает значение латентности", () => {
    expect(formatPing(42)).toContain("42");
  });
});

describe("lastLatency", () => {
  it("null для пустого списка", () => {
    expect(lastLatency([])).toBeNull();
  });

  it("возвращает последнюю успешную точку", () => {
    expect(lastLatency(POINTS)).toBe(20);
  });
});

describe("buildSparklinePath", () => {
  it("строит сглаженный SVG-путь", () => {
    const path = buildSparklinePath(POINTS, 100, 40);

    expect(path.startsWith("M")).toBe(true);
    expect(path).toContain("C");
  });

  it("пустой ввод даёт пустую строку", () => {
    expect(buildSparklinePath([], 100, 40)).toBe("");
  });
});

describe("buildSparklineFill", () => {
  it("замыкает заливку по нижней границе", () => {
    expect(buildSparklineFill(POINTS, 100, 40).endsWith("Z")).toBe(true);
  });

  it("пустой ввод даёт пустую строку", () => {
    expect(buildSparklineFill([], 100, 40)).toBe("");
  });
});
