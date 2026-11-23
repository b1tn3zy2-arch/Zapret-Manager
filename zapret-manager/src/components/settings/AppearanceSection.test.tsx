// Импортируем зависимости из модуля @testing-library/react.
import { fireEvent, render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/AppearanceSection.
import AppearanceSection from "@/components/settings/AppearanceSection";
// Импортируем зависимости из модуля @/lib/defaults.
import { DEFAULT_APPEARANCE } from "@/lib/defaults";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/i18n.
import { createTranslate } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const T = createTranslate(ru).
const T = createTranslate("ru");
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AppearanceSection", () => {
  // Обрабатываем конструкцию: it.
  it("показывает слайдеры масштаба и скорости анимаций", () => {
    // Обрабатываем конструкцию: render.
    render(<AppearanceSection />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const scale = screen.getByLabelText( Масштаб интерфейса….
    const scale = screen.getByLabelText(
      // Обрабатываем конструкцию: Масштаб интерфейса.
      "Масштаб интерфейса"
      // Закрываем выражение или список аргументов.
    ) as HTMLInputElement;
    // Обрабатываем конструкцию: const speed = screen.getByLabelText( Скорость анимаций ….
    const speed = screen.getByLabelText(
      // Обрабатываем конструкцию: Скорость анимаций.
      "Скорость анимаций"
      // Закрываем выражение или список аргументов.
    ) as HTMLInputElement;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(scale.value).toBe(String(DEFAULT_APPEARANCE.interfaceScale));
    // Обрабатываем конструкцию: expect.
    expect(speed.value).toBe(String(DEFAULT_APPEARANCE.animationSpeed));
    // Обрабатываем конструкцию: expect.
    expect(T("settings.appearance.interfaceScale")).toBe("Масштаб интерфейса");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("меняет масштаб интерфейса", async () => {
    // Обрабатываем конструкцию: render.
    render(<AppearanceSection />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const scale = screen.getByLabelText(Масштаб интерфейса).
    const scale = screen.getByLabelText("Масштаб интерфейса");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(scale, { target: { value: "120" } });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.appearance.interfaceScale).toBe(
      // Обрабатываем конструкцию: 120.
      120
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("больше не показывает выбор плотности", () => {
    // Обрабатываем конструкцию: render.
    render(<AppearanceSection />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.queryByText("Плотность интерфейса")).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
