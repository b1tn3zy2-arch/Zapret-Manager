// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/strategies/game/PlayOverlay.
import PlayOverlay from "@/components/strategies/game/PlayOverlay";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const base = { isBusy: false, motionDisabled: false, on….
const base = {
  // Обрабатываем конструкцию: isBusy.
  isBusy: false,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: false,
  // Обрабатываем конструкцию: onRun.
  onRun: vi.fn(),
  // Обрабатываем конструкцию: onStop.
  onStop: vi.fn(),
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("PlayOverlay", () => {
  // Обрабатываем конструкцию: it.
  it("показывает кнопку запуска для остановленной стратегии", () => {
    // Обрабатываем конструкцию: render.
    render(<PlayOverlay isRunning={false} {...base} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Запустить стратегию" })
      // Закрываем выражение или список аргументов.
    ).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает onRun и не всплывает к карточке", async () => {
    // Обрабатываем конструкцию: const onRun = vi.fn().
    const onRun = vi.fn();
    // Обрабатываем конструкцию: const parentClick = vi.fn().
    const parentClick = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Обрабатываем конструкцию: <div onClick={parentClick} role=presentation>.
      <div onClick={parentClick} role="presentation">
        {/* Выводим текстовое содержимое в JSX. */}
        <PlayOverlay isRunning={false} {...base} onRun={onRun} />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Запустить стратегию" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onRun).toHaveBeenCalledTimes(1);
    // Обрабатываем конструкцию: expect.
    expect(parentClick).not.toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает кнопку остановки для запущенной стратегии", async () => {
    // Обрабатываем конструкцию: const onStop = vi.fn().
    const onStop = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(<PlayOverlay isRunning {...base} onStop={onStop} />);
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Остановить стратегию" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onStop).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокирует клик во время перехода", async () => {
    // Обрабатываем конструкцию: const onRun = vi.fn().
    const onRun = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(<PlayOverlay isRunning={false} {...base} isBusy onRun={onRun} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const button = screen.getByRole(button, { name: Запусти….
    const button = screen.getByRole("button", {
      // Обрабатываем конструкцию: name.
      name: "Запустить стратегию",
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(button).toBeDisabled();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(button).
    await userEvent.click(button);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onRun).not.toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
