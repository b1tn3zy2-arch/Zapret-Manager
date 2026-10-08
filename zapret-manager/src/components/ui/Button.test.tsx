import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("вызывает onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Запустить</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Запустить" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled блокирует клик", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Запустить
      </Button>
    );

    await userEvent.click(screen.getByRole("button", { name: "Запустить" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading помечает aria-busy и не вызывает onClick", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Сохранение
      </Button>
    );

    const button = screen.getByRole("button", { name: /Сохранение/ });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("поддерживает aria-label без текста", async () => {
    render(<Button aria-label="Остановить" />);

    expect(
      screen.getByRole("button", { name: "Остановить" })
    ).toBeInTheDocument();
  });

  it("вызывает onClick по клавиатуре (Enter)", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Открыть</Button>);

    screen.getByRole("button", { name: "Открыть" }).focus();
    await userEvent.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
