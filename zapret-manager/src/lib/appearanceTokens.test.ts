// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/appearanceTokens.
import {
  // Подключаем именованный импорт ANIMATION_SPEED_MAX.
  ANIMATION_SPEED_MAX,
  // Подключаем именованный импорт ANIMATION_SPEED_MIN.
  ANIMATION_SPEED_MIN,
  // Подключаем именованный импорт applyAnimationSpeed.
  applyAnimationSpeed,
  // Подключаем именованный импорт getAnimationSpeedFactor.
  getAnimationSpeedFactor,
  // Подключаем именованный импорт interfaceScaleToRoot.
  interfaceScaleToRoot,
  // Закрываем текущий блок.
} from "@/lib/appearanceTokens";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("interfaceScaleToRoot", () => {
  // Обрабатываем конструкцию: it.
  it("возвращает 1 для 100%", () => {
    // Обрабатываем конструкцию: expect.
    expect(interfaceScaleToRoot(100)).toBe(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("увеличивает корень при 120%", () => {
    // Обрабатываем конструкцию: expect.
    expect(interfaceScaleToRoot(120)).toBeCloseTo(1.2, 5);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("уменьшает корень при 80%", () => {
    // Обрабатываем конструкцию: expect.
    expect(interfaceScaleToRoot(80)).toBeCloseTo(0.8, 5);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ограничивает экстремальные значения", () => {
    // Обрабатываем конструкцию: expect.
    expect(interfaceScaleToRoot(10)).toBeCloseTo(0.8, 5);
    // Обрабатываем конструкцию: expect.
    expect(interfaceScaleToRoot(999)).toBeCloseTo(1.3, 5);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("границы скорости анимаций", () => {
  // Обрабатываем конструкцию: it.
  it("ограничивает значения диапазоном", () => {
    // Обрабатываем конструкцию: expect.
    expect(ANIMATION_SPEED_MIN).toBe(25);
    // Обрабатываем конструкцию: expect.
    expect(ANIMATION_SPEED_MAX).toBe(300);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("округляет ввод до шага", () => {
    // Обрабатываем конструкцию: expect.
    expect(applyAnimationSpeed(133)).toBe(125);
    // Обрабатываем конструкцию: expect.
    expect(applyAnimationSpeed(1)).toBe(ANIMATION_SPEED_MIN);
    // Обрабатываем конструкцию: expect.
    expect(applyAnimationSpeed(9999)).toBe(ANIMATION_SPEED_MAX);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("applyAnimationSpeed", () => {
  // Обрабатываем конструкцию: it.
  it("ускоряет анимации при низком проценте", () => {
    // Обрабатываем конструкцию: applyAnimationSpeed.
    applyAnimationSpeed(50);
    // Обрабатываем конструкцию: const faster = getAnimationSpeedFactor().
    const faster = getAnimationSpeedFactor();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: applyAnimationSpeed.
    applyAnimationSpeed(200);
    // Обрабатываем конструкцию: const slower = getAnimationSpeedFactor().
    const slower = getAnimationSpeedFactor();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(faster).toBeGreaterThan(slower);
    // Обрабатываем конструкцию: expect.
    expect(slower).toBeLessThan(1);
    // Обрабатываем конструкцию: expect.
    expect(faster).toBeGreaterThan(1);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: applyAnimationSpeed.
    applyAnimationSpeed(100);
    // Обрабатываем конструкцию: expect.
    expect(getAnimationSpeedFactor()).toBe(1);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
