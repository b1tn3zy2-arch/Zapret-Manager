// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { FilterChip } from "@/components/ui";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("FilterChip", () => {
  // Обрабатываем конструкцию: it.
  it("отражает активное состояние через aria-pressed", () => {
    // Обрабатываем конструкцию: const { rerender } = render( <FilterChip label=Ошибка a….
    const { rerender } = render(
      // Рендерим самозакрывающийся элемент FilterChip.
      <FilterChip label="Ошибка" active={false} onToggle={vi.fn()} />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: /Ошибка/ })).toHaveAttribute(
      // Обрабатываем конструкцию: aria-pressed.
      "aria-pressed",
      // Обрабатываем конструкцию: false.
      "false"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: rerender.
    rerender(<FilterChip label="Ошибка" active onToggle={vi.fn()} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: /Ошибка/ })).toHaveAttribute(
      // Обрабатываем конструкцию: aria-pressed.
      "aria-pressed",
      // Обрабатываем конструкцию: true.
      "true"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает счётчик рядом с меткой", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент FilterChip.
      <FilterChip label="Ошибка" count={5} active={false} onToggle={vi.fn()} />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: /Ошибка\s*5/ })).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает onToggle по клику", async () => {
    // Обрабатываем конструкцию: const onToggle = vi.fn().
    const onToggle = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(<FilterChip label="Ошибка" active={false} onToggle={onToggle} />);
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(button….
    await userEvent.click(screen.getByRole("button", { name: /Ошибка/ }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onToggle).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокируется при disabled", async () => {
    // Обрабатываем конструкцию: const onToggle = vi.fn().
    const onToggle = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент FilterChip.
      <FilterChip label="Ошибка" disabled active={false} onToggle={onToggle} />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const button = screen.getByRole(button, { name: /Ошибка….
    const button = screen.getByRole("button", { name: /Ошибка/ });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(button).toBeDisabled();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(button).
    await userEvent.click(button);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onToggle).not.toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("применяет вариант к активному чипу", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент FilterChip.
      <FilterChip label="Ошибка" variant="error" active onToggle={vi.fn()} />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: /Ошибка/ }).className).toContain(
      // Обрабатываем конструкцию: text-accent-danger.
      "text-accent-danger"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
