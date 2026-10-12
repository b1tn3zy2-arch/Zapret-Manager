import { describe, expect, it } from "vitest";

import {
  ANIMATION_SPEED_MAX,
  ANIMATION_SPEED_MIN,
  applyAnimationSpeed,
  getAnimationSpeedFactor,
  interfaceScaleToRoot,
} from "@/lib/appearanceTokens";

describe("interfaceScaleToRoot", () => {
  it("возвращает 1 для 100%", () => {
    expect(interfaceScaleToRoot(100)).toBe(1);
  });

  it("увеличивает корень при 120%", () => {
    expect(interfaceScaleToRoot(120)).toBeCloseTo(1.2, 5);
  });

  it("уменьшает корень при 80%", () => {
    expect(interfaceScaleToRoot(80)).toBeCloseTo(0.8, 5);
  });

  it("ограничивает экстремальные значения", () => {
    expect(interfaceScaleToRoot(10)).toBeCloseTo(0.8, 5);
    expect(interfaceScaleToRoot(999)).toBeCloseTo(1.3, 5);
  });
});

describe("границы скорости анимаций", () => {
  it("ограничивает значения диапазоном", () => {
    expect(ANIMATION_SPEED_MIN).toBe(25);
    expect(ANIMATION_SPEED_MAX).toBe(300);
  });

  it("округляет ввод до шага", () => {
    expect(applyAnimationSpeed(133)).toBe(125);
    expect(applyAnimationSpeed(1)).toBe(ANIMATION_SPEED_MIN);
    expect(applyAnimationSpeed(9999)).toBe(ANIMATION_SPEED_MAX);
  });
});

describe("applyAnimationSpeed", () => {
  it("ускоряет анимации при низком проценте", () => {
    applyAnimationSpeed(50);
    const faster = getAnimationSpeedFactor();

    applyAnimationSpeed(200);
    const slower = getAnimationSpeedFactor();

    expect(faster).toBeGreaterThan(slower);
    expect(slower).toBeLessThan(1);
    expect(faster).toBeGreaterThan(1);

    applyAnimationSpeed(100);
    expect(getAnimationSpeedFactor()).toBe(1);
  });
});
