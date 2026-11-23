// Импортируем зависимости из модуля @testing-library/react.
import { fireEvent, render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, beforeEach } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/LogRetentionField.
import LogRetentionField from "@/components/settings/LogRetentionField";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("поле хранения логов", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState((state) => ({
      // Обрабатываем конструкцию: settings.
      settings: {
        // Разворачиваем ...state.settings в коллекцию.
        ...state.settings,
        // Обрабатываем конструкцию: advanced.
        advanced: { ...state.settings.advanced, logRetentionDays: 30 },
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    }));
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не сбрасывает поле на минимум при очистке", () => {
    // Обрабатываем конструкцию: render.
    render(<LogRetentionField />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const field = screen.getByLabelText(Хранение логов, дне….
    const field = screen.getByLabelText("Хранение логов, дней");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "" } });
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // раньше пустая строка тут же превращалась в минимум и каре…
    // раньше пустая строка тут же превращалась в минимум и каретка прыгала
    // Обрабатываем конструкцию: expect.
    expect((field as HTMLInputElement).value).toBe("");
    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      // Обрабатываем конструкцию: 30.
      30
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не даёт ввести значение вне диапазона", () => {
    // Обрабатываем конструкцию: render.
    render(<LogRetentionField />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const field = screen.getByLabelText(Хранение логов, дне….
    const field = screen.getByLabelText("Хранение логов, дней");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "0" } });
    // Обрабатываем конструкцию: fireEvent.
    fireEvent.blur(field);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      // Обрабатываем конструкцию: 1.
      1
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "5000" } });
    // Обрабатываем конструкцию: fireEvent.
    fireEvent.blur(field);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      // Обрабатываем конструкцию: 365.
      365
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пишет значение по Enter", () => {
    // Обрабатываем конструкцию: render.
    render(<LogRetentionField />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const field = screen.getByLabelText(Хранение логов, дне….
    const field = screen.getByLabelText("Хранение логов, дней");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "14" } });
    // Обрабатываем конструкцию: fireEvent.
    fireEvent.keyDown(field, { key: "Enter" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      // Обрабатываем конструкцию: 14.
      14
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("подбирает ширину под содержимое", () => {
    // Обрабатываем конструкцию: render.
    render(<LogRetentionField />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const field = screen.getByLabelText(Хранение логов, дне….
    const field = screen.getByLabelText("Хранение логов, дней");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(field.className).toContain("tabular-nums");
    // Сохраняем пояснение разработчика: // ширина живёт в inline-стиле и считается от числа цифр, а …
    // ширина живёт в inline-стиле и считается от числа цифр, а не константой в CSS
    // Обрабатываем конструкцию: expect.
    expect((field as HTMLInputElement).parentElement?.style.width).toBe(
      // Обрабатываем конструкцию: 2.62em.
      "2.62em"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "365" } });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect((field as HTMLInputElement).parentElement?.style.width).toBe(
      // Обрабатываем конструкцию: 3.28em.
      "3.28em"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "3650" } });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect((field as HTMLInputElement).parentElement?.style.width).toBe(
      // Обрабатываем конструкцию: 3.94em.
      "3.94em"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("Escape возвращает сохранённое значение", () => {
    // Обрабатываем конструкцию: render.
    render(<LogRetentionField />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const field = screen.getByLabelText(Хранение логов, дне….
    const field = screen.getByLabelText("Хранение логов, дней");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(field, { target: { value: "999" } });
    // Обрабатываем конструкцию: fireEvent.
    fireEvent.keyDown(field, { key: "Escape" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect((field as HTMLInputElement).value).toBe("30");
    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.advanced.logRetentionDays).toBe(
      // Обрабатываем конструкцию: 30.
      30
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
