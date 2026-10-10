import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import PlayOverlay from "@/components/strategies/game/PlayOverlay";

const base = {
  isBusy: false,
  motionDisabled: false,
  onRun: vi.fn(),
  onStop: vi.fn(),
};

describe("PlayOverlay", () => {
  it("показывает кнопку запуска для остановленной стратегии", () => {
    render(<PlayOverlay isRunning={false} {...base} />);

    expect(
      screen.getByRole("button", { name: "Запустить стратегию" })
    ).toBeTruthy();
  });

  it("вызывает onRun и не всплывает к карточке", async () => {
    const onRun = vi.fn();
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick} role="presentation">
        <PlayOverlay isRunning={false} {...base} onRun={onRun} />
      </div>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Запустить стратегию" })
    );

    expect(onRun).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("показывает кнопку остановки для запущенной стратегии", async () => {
    const onStop = vi.fn();

    render(<PlayOverlay isRunning {...base} onStop={onStop} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Остановить стратегию" })
    );

    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("блокирует клик во время перехода", async () => {
    const onRun = vi.fn();

    render(<PlayOverlay isRunning={false} {...base} isBusy onRun={onRun} />);

    const button = screen.getByRole("button", {
      name: "Запустить стратегию",
    });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(onRun).not.toHaveBeenCalled();
  });
});
