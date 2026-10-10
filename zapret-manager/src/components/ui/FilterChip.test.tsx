import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterChip } from "@/components/ui";

describe("FilterChip", () => {
  it("отражает активное состояние через aria-pressed", () => {
    const { rerender } = render(
      <FilterChip label="Ошибка" active={false} onToggle={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /Ошибка/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    rerender(<FilterChip label="Ошибка" active onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Ошибка/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("показывает счётчик рядом с меткой", () => {
    render(
      <FilterChip label="Ошибка" count={5} active={false} onToggle={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /Ошибка\s*5/ })).toBeTruthy();
  });

  it("вызывает onToggle по клику", async () => {
    const onToggle = vi.fn();

    render(<FilterChip label="Ошибка" active={false} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("button", { name: /Ошибка/ }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("блокируется при disabled", async () => {
    const onToggle = vi.fn();

    render(
      <FilterChip label="Ошибка" disabled active={false} onToggle={onToggle} />
    );

    const button = screen.getByRole("button", { name: /Ошибка/ });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("применяет вариант к активному чипу", () => {
    render(
      <FilterChip label="Ошибка" variant="error" active onToggle={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: /Ошибка/ }).className).toContain(
      "text-accent-danger"
    );
  });
});
