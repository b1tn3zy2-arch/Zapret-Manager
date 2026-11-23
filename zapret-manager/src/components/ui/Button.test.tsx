// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/Button.
import { Button } from "@/components/ui/Button";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("Button", () => {
  // Обрабатываем конструкцию: it.
  it("вызывает onClick", async () => {
    // Обрабатываем конструкцию: const onClick = vi.fn().
    const onClick = vi.fn();
    // Обрабатываем конструкцию: render.
    render(<Button onClick={onClick}>Запустить</Button>);
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(button….
    await userEvent.click(screen.getByRole("button", { name: "Запустить" }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onClick).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("disabled блокирует клик", async () => {
    // Обрабатываем конструкцию: const onClick = vi.fn().
    const onClick = vi.fn();
    // Обрабатываем конструкцию: render.
    render(
      // Обрабатываем конструкцию: <Button disabled onClick={onClick}>.
      <Button disabled onClick={onClick}>
        {/* Выводим текстовое содержимое в JSX. */}
        Запустить
        {/* Обрабатываем конструкцию: </Button>. */}
      </Button>
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(button….
    await userEvent.click(screen.getByRole("button", { name: "Запустить" }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onClick).not.toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("loading помечает aria-busy и не вызывает onClick", async () => {
    // Обрабатываем конструкцию: const onClick = vi.fn().
    const onClick = vi.fn();
    // Обрабатываем конструкцию: render.
    render(
      // Обрабатываем конструкцию: <Button loading onClick={onClick}>.
      <Button loading onClick={onClick}>
        {/* Выводим текстовое содержимое в JSX. */}
        Сохранение
        {/* Обрабатываем конструкцию: </Button>. */}
      </Button>
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const button = screen.getByRole(button, { name: /Сохран….
    const button = screen.getByRole("button", { name: /Сохранение/ });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(button).toHaveAttribute("aria-busy", "true");
    // Обрабатываем конструкцию: expect.
    expect(button).toBeDisabled();
    // Обрабатываем конструкцию: expect.
    expect(onClick).not.toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("поддерживает aria-label без текста", async () => {
    // Обрабатываем конструкцию: render.
    render(<Button aria-label="Остановить" />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Остановить" })
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает onClick по клавиатуре (Enter)", async () => {
    // Обрабатываем конструкцию: const onClick = vi.fn().
    const onClick = vi.fn();
    // Обрабатываем конструкцию: render.
    render(<Button onClick={onClick}>Открыть</Button>);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: screen.
    screen.getByRole("button", { name: "Открыть" }).focus();
    // Ожидаем завершение асинхронной операции await userEvent.keyboard({Enter}).
    await userEvent.keyboard("{Enter}");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onClick).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
