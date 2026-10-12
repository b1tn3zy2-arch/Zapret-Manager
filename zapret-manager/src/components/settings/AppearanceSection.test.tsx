import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AppearanceSection from "@/components/settings/AppearanceSection";
import { DEFAULT_APPEARANCE } from "@/lib/defaults";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { createTranslate } from "@/i18n";

const T = createTranslate("ru");

describe("AppearanceSection", () => {
  it("показывает слайдеры масштаба и скорости анимаций", () => {
    render(<AppearanceSection />);

    const scale = screen.getByLabelText(
      "Масштаб интерфейса"
    ) as HTMLInputElement;
    const speed = screen.getByLabelText(
      "Скорость анимаций"
    ) as HTMLInputElement;

    expect(scale.value).toBe(String(DEFAULT_APPEARANCE.interfaceScale));
    expect(speed.value).toBe(String(DEFAULT_APPEARANCE.animationSpeed));
    expect(T("settings.appearance.interfaceScale")).toBe("Масштаб интерфейса");
  });

  it("меняет масштаб интерфейса", async () => {
    render(<AppearanceSection />);

    const scale = screen.getByLabelText("Масштаб интерфейса");

    fireEvent.change(scale, { target: { value: "120" } });

    expect(useSettingsStore.getState().settings.appearance.interfaceScale).toBe(
      120
    );
  });

  it("больше не показывает выбор плотности", () => {
    render(<AppearanceSection />);

    expect(screen.queryByText("Плотность интерфейса")).toBeNull();
  });
});
