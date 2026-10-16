import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";

import LogRetentionField from "@/components/settings/LogRetentionField";
import { useSettingsStore } from "@/stores/useSettingsStore";

describe("поле хранения логов", () => {
  beforeEach(() => {
    useSettingsStore.setState((state) => ({
      settings: {
        ...state.settings,
        advanced: { ...state.settings.advanced, logRetentionDays: 30 },
      },
    }));
  });

  it("не сбрасывает поле на минимум при очистке", () => {
    render(<LogRetentionField />);

    const field = screen.getByLabelText("Хранение логов, дней");

    fireEvent.change(field, { target: { value: "" } });

    // раньше пустая строка тут же превращалась в минимум и каретка прыгала
    expect((field as HTMLInputElement).value).toBe("");
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      30
    );
  });

  it("не даёт ввести значение вне диапазона", () => {
    render(<LogRetentionField />);

    const field = screen.getByLabelText("Хранение логов, дней");

    fireEvent.change(field, { target: { value: "0" } });
    fireEvent.blur(field);

    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      1
    );

    fireEvent.change(field, { target: { value: "5000" } });
    fireEvent.blur(field);

    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      365
    );
  });

  it("пишет значение по Enter", () => {
    render(<LogRetentionField />);

    const field = screen.getByLabelText("Хранение логов, дней");

    fireEvent.change(field, { target: { value: "14" } });
    fireEvent.keyDown(field, { key: "Enter" });

    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      14
    );
  });

  it("подбирает ширину под содержимое", () => {
    render(<LogRetentionField />);

    const field = screen.getByLabelText("Хранение логов, дней");

    expect(field.className).toContain("tabular-nums");
    // ширина живёт в inline-стиле и считается от числа цифр, а не константой в CSS
    expect((field as HTMLInputElement).parentElement?.style.width).toBe(
      "2.62em"
    );

    fireEvent.change(field, { target: { value: "365" } });

    expect((field as HTMLInputElement).parentElement?.style.width).toBe(
      "3.28em"
    );

    fireEvent.change(field, { target: { value: "3650" } });

    expect((field as HTMLInputElement).parentElement?.style.width).toBe(
      "3.94em"
    );
  });

  it("Escape возвращает сохранённое значение", () => {
    render(<LogRetentionField />);

    const field = screen.getByLabelText("Хранение логов, дней");

    fireEvent.change(field, { target: { value: "999" } });
    fireEvent.keyDown(field, { key: "Escape" });

    expect((field as HTMLInputElement).value).toBe("30");
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      30
    );
  });
});
